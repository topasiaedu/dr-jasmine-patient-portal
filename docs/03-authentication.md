# 03 — Authentication

## Overview

There are two completely separate authentication systems in this app:

| User | Method | Complexity |
|---|---|---|
| **Patients** | GHL Contact ID + signed HTTP cookie | Minimal — no login screen |
| **Dr. Jasmine (admin)** | Email + password via Supabase Auth | Standard |

---

## Patient Authentication

### Design Principle

Patients are primarily elderly or low-tech-savvy individuals. A login screen with a username
and password is a failure mode — they will forget credentials, get locked out, and abandon
the app. The solution is to make the **link itself the credential**.

Patients never see a login screen. They never create a password. They never type an email
to get in. Having the link means they are that patient. This is the same trust model used by
Google Docs share links, Calendly booking confirmations, and Typeform survey links.

### The Magic Link

When Dr. Jasmine's team adds a new patient to the system, the app generates a unique URL:

```
https://portal.drjasmine.com/p/<ghlContactId>
```

Where `<ghlContactId>` is the patient's GoHighLevel contact ID. This ID is:
- Already the canonical identifier for the patient in GHL (CRM, workflows, messaging)
- A GHL-format ID (e.g. `abc123XYZ...`) — long enough to be functionally unguessable
- The single source of patient identity across GHL and the portal

This URL is sent to the patient via GHL (e.g. **email** or WhatsApp). In the **Phase 1**
launch path, the usual sequence is: intake + first booking happen in **GHL**; **1 hour
after the scheduled appointment start time** a **GHL automation** emails the portal link
(so it lands after the consult for typical slot lengths; exact offset is configured in GHL).
The link can also be resent manually or via **find-my-link** later.

### Cookie Session

When the patient first visits `/p/<ghlContactId>`:

1. The Next.js middleware validates that `ghlContactId` exists in the `patients` table in Supabase
2. If valid, a **signed HTTP-only cookie** is set on the response:

```typescript
// Cookie payload (signed with COOKIE_SECRET, not encrypted — signing prevents tampering)
interface PatientCookiePayload {
  ghlContactId: string;
  patientId: string;       // Supabase internal UUID
  issuedAt: number;        // Unix timestamp
}
```

Cookie attributes:
```
Name:     drj_patient_session
HttpOnly: true              // inaccessible to JavaScript
Secure:   true              // HTTPS only
SameSite: Strict            // no cross-site leakage
MaxAge:   365 days          // long-lived; patients should not be logged out
Path:     /p/<ghlContactId> // scoped to this patient's path
```

3. On every subsequent request to `/p/<ghlContactId>/*`, the middleware reads the cookie,
   verifies the signature, and confirms the `ghlContactId` in the cookie matches the URL.
   This prevents a patient from using their cookie to access a different patient's path.

### "I Lost My Link" Recovery

If a patient cannot find their link:

1. They visit `https://portal.drjasmine.com/find-my-link`
2. They enter their email address
3. The backend calls GHL API to look up a contact by email
4. If found, GHL fires the "Send My Link" workflow — a WhatsApp/email with their link
5. The patient sees a message: "We've sent your link to your registered contact."

No OTP, no verification code. The recovery message goes to the phone number on record in
GHL — if they can receive WhatsApp messages, they can get back in.

### What Can Be Done With a Stolen Link

In the worst case, someone who obtains a patient's link can:
- Submit readings on their behalf (incorrect data, but not malicious data exfiltration)
- View their personalised dietary guide
- View their upcoming appointment details (date/time, not Zoom link — that is only shown
  on the appointment page when the session is active)

They cannot:
- View any historical reading data (we do not display past readings to patients)
- View any clinical notes (those only exist on the admin panel)
- Access any other patient's data (cookies are path-scoped)
- Access Dr. Jasmine's admin panel (entirely separate auth)

The risk profile is acceptable for the data involved. This is not an EMR system.

### Middleware Implementation Sketch

```typescript
// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyPatientCookie } from "@/lib/auth/patient-session";

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Only process patient portal routes
  if (!pathname.startsWith("/p/")) {
    return NextResponse.next();
  }

  const segments = pathname.split("/");
  const ghlContactId = segments[2]; // /p/[ghlContactId]/...

  if (!ghlContactId) {
    return NextResponse.redirect(new URL("/not-found", request.url));
  }

  const cookie = request.cookies.get("drj_patient_session");

  // No cookie present — first visit, set the cookie
  if (!cookie) {
    return await handleFirstVisit(request, ghlContactId);
  }

  // Cookie present — verify it
  const payload = await verifyPatientCookie(cookie.value);

  if (!payload || payload.ghlContactId !== ghlContactId) {
    // Tampered or mismatched — clear and retry as first visit
    const response = await handleFirstVisit(request, ghlContactId);
    response.cookies.delete("drj_patient_session");
    return response;
  }

  return NextResponse.next();
}
```

---

## Admin Authentication (Dr. Jasmine)

### Method

Standard Supabase Auth with email + password. Dr. Jasmine logs in at `/admin/login`.
Supabase issues a JWT stored in an HTTP-only cookie (handled by the Supabase Auth helpers
for Next.js).

### Route Protection

All `/admin/*` routes (except `/admin/login`) are protected by middleware. If no valid
Supabase session is found, the user is redirected to `/admin/login`.

```typescript
// In middleware.ts — admin route handling
if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
  const supabaseSession = await getAdminSession(request);

  if (!supabaseSession) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
}
```

### Setup

There is only one admin account — Dr. Jasmine's. This is created manually via the
Supabase dashboard during initial setup. No self-registration flow is built.

If a second doctor is added in the future, this is a manual Supabase Auth user creation
step, not a self-service feature. When the app scales to multiple doctors, the auth model
will need revisiting (role-based access, multi-tenancy) — tracked as a future consideration.

---

## Patient Status Gate

Authentication (having a valid cookie) is separate from **authorisation** (what the patient
can see). A patient with a valid cookie may still be in a restricted state:

```typescript
type PatientStatus = "onboarding" | "booked" | "active";
```

| Status | What the patient can access |
|---|---|
| `"onboarding"` | Onboarding form only |
| `"booked"` | Holding screen (pending first consultation) |
| `"active"` | Full portal (home, log, appointment, guide, FAQ) |

The middleware reads the patient's status from Supabase on each request and enforces
the correct redirect. Status transitions are:

```
onboarding → booked      (triggered when onboarding form is submitted AND first appointment booked)
booked     → active      (triggered by Dr. Jasmine clicking "Activate Patient" in consultation panel)
```

Status never goes backwards. There is no "deactivate" concept at this stage.
