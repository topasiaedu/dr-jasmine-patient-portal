# 07 — Integrations

## Overview

This app integrates with four external services. Each integration has a defined
contract — what data goes in, what comes out, and which side owns the action.

| Service | Purpose | Direction |
|---|---|---|
| **Cal.com** | Appointment booking + Zoom meeting creation | Cal.com → our webhook |
| **Zoom** | Video consultations | Managed by Cal.com; we store the join URL |
| **GoHighLevel (GHL)** | CRM, WhatsApp/email, **first intake + booking**, contact management | We call GHL API; GHL runs automations |
| **OpenAI GPT-4o Vision** | Extract health readings from a photo | We call OpenAI API |

**Phasing:** **Phase 1** uses GHL heavily (calendar + form + post-consult email with
portal link; see `09-build-phases.md`). **Cal.com + Zoom** are primary in **Phase 2**
when booking moves into this app.

---

## 0. Launch sequence — GHL before in-app booking

Until **Phase 2**, the practice may use **GHL** alone for:

- Sending a **calendar link** where the patient completes a **form** and **books** the first session
- Sending the **portal link** (`/p/<ghlContactId>`) by **email** via a **GHL automation**
  (**1 hour after the scheduled appointment start time** — exact offset is configured in GHL)

The **Next.js app** still implements the **magic-link cookie model** (`03-authentication.md`)
and persists guides/readings in **Supabase**. **GHL** remains the system of record for
CRM fields collected in that external flow until **Phase 3** sync or in-app onboarding priorities apply.

---

## 1. Cal.com

### Setup

- Dr. Jasmine creates a **free Cal.com account** at cal.com
- Connects her **Google Calendar** via Cal.com's native integration (Settings → Calendars)
- Connects her **Zoom account** via Cal.com's native Zoom integration (Settings → Apps → Zoom)
  - This enables automatic Zoom meeting creation on every booking
- Creates one event type: **"Consultation with Dr. Jasmine"** (30 minutes)
- Configures availability windows, buffer times, and daily booking limits in Cal.com

### Embedding the Booking Widget

Cal.com provides a JavaScript embed snippet. In the Next.js app:

```typescript
// components/CalBookingWidget.tsx
"use client";

import { useEffect } from "react";
import Cal from "@calcom/embed-react";

interface CalBookingWidgetProps {
  /** Cal.com username (e.g. "dr-jasmine") */
  calUsername: string;
  /** Cal.com event slug (e.g. "consultation") */
  eventSlug: string;
  /** Pre-fill patient name and email so they don't have to type it */
  prefill: {
    name: string;
    email: string;
  };
  /** Called when Cal.com fires the bookingSuccessful event */
  onBookingSuccess: () => void;
}

export function CalBookingWidget({
  calUsername,
  eventSlug,
  prefill,
  onBookingSuccess,
}: CalBookingWidgetProps): JSX.Element {
  useEffect(() => {
    // Cal.com fires this event when a booking is confirmed
    const handler = (event: CustomEvent) => {
      if (event.detail?.type === "bookingSuccessful") {
        onBookingSuccess();
      }
    };
    window.addEventListener("message", handler as EventListener);
    return () => window.removeEventListener("message", handler as EventListener);
  }, [onBookingSuccess]);

  return (
    <Cal
      calLink={`${calUsername}/${eventSlug}`}
      style={{ width: "100%", height: "100%", overflow: "scroll" }}
      config={{
        layout: "month_view",
        theme: "light",
        name: prefill.name,
        email: prefill.email,
      }}
    />
  );
}
```

### Webhook — Booking Events

Cal.com sends webhooks for booking lifecycle events. Configure in Cal.com:
Settings → Developer → Webhooks → Add webhook

```
URL:    https://portal.drjasmine.com/api/webhooks/cal
Secret: <CAL_WEBHOOK_SECRET>  (used to verify signature)
Events: BOOKING_CREATED, BOOKING_RESCHEDULED, BOOKING_CANCELLED
```

### Webhook Payload Shape

```typescript
/** Subset of the Cal.com webhook payload we care about */
interface CalWebhookPayload {
  triggerEvent: "BOOKING_CREATED" | "BOOKING_RESCHEDULED" | "BOOKING_CANCELLED";
  payload: {
    uid: string;
    /** ISO 8601 */
    startTime: string;
    /** ISO 8601 */
    endTime: string;
    attendees: Array<{
      name: string;
      email: string;
      timeZone: string;
    }>;
    /** Present when Zoom integration is active */
    videoCallData: {
      type: "zoom_video";
      id: string;
      password: string;
      url: string;           // patient join URL
    } | null;
    /** Cal.com injects metadata we pass at booking time */
    metadata: {
      patientId?: string;
    };
  };
}
```

### Webhook Handler

```typescript
// app/api/webhooks/cal/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyCalWebhookSignature } from "@/lib/integrations/cal";
import { saveAppointment } from "@/lib/db/appointments";
import { enrollInGhlWorkflow } from "@/lib/integrations/ghl";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const rawBody = await request.text();
  const signature = request.headers.get("X-Cal-Signature-256") ?? "";

  const isValid = verifyCalWebhookSignature(
    rawBody,
    signature,
    process.env.CAL_WEBHOOK_SECRET ?? ""
  );

  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload: CalWebhookPayload = JSON.parse(rawBody);
  const { triggerEvent, payload: booking } = payload;

  if (triggerEvent === "BOOKING_CREATED") {
    const patientEmail = booking.attendees[0]?.email;
    const zoomUrl = booking.videoCallData?.url ?? "";

    await saveAppointment({
      calBookingUid: booking.uid,
      startsAt: booking.startTime,
      endsAt: booking.endTime,
      zoomJoinUrl: zoomUrl,
      patientEmail,
    });

    // Optional: enroll in GHL when product wires WhatsApp/email for **in-app** bookings
    // (typically Phase 3; Phase 2 can ship with DB + UI only — see `09-build-phases.md`)
    await enrollInGhlWorkflow({
      patientEmail,
      workflowId: process.env.GHL_WORKFLOW_BOOKING_CONFIRMED ?? "",
      customData: {
        appointmentDate: booking.startTime,
        zoomLink: zoomUrl,
      },
    });
  }

  if (triggerEvent === "BOOKING_CANCELLED") {
    await cancelAppointment(booking.uid);
    // Optionally enroll in a "booking cancelled" GHL workflow
  }

  if (triggerEvent === "BOOKING_RESCHEDULED") {
    await rescheduleAppointment({
      calBookingUid: booking.uid,
      newStartsAt: booking.startTime,
      newEndsAt: booking.endTime,
    });
  }

  return NextResponse.json({ received: true });
}
```

---

## 2. Zoom

Zoom is **fully managed by Cal.com**. There is no direct Zoom API integration needed.

When Cal.com creates a booking with Zoom enabled, it:
1. Creates a new Zoom meeting automatically
2. Includes the patient join URL in the webhook payload as `videoCallData.url`
3. Adds the Zoom link to the Google Calendar event for Dr. Jasmine

We store the Zoom join URL in Supabase and display it to:
- The patient on their appointment page and pending screen
- Dr. Jasmine in the consultation panel (host URL is also stored if Cal.com provides it)

**Note on Zoom free tier:** 1-on-1 meetings (2 participants) are unlimited in duration
on the Zoom free plan. Group calls are capped at 40 minutes. Since this is always a
doctor-patient pair, the free tier is sufficient.

---

## 3. GoHighLevel (GHL)

### API version — v2 only

This project targets **HighLevel API 2.0** (v1 / `rest.gohighlevel.com` is end-of-support).
Use the official reference: [HighLevel API documentation](https://marketplace.gohighlevel.com/docs/).

Typical server-to-server setup for a single location:

- **Base URL:** `https://services.leadconnectorhq.com`
- **Auth:** Private Integration token (or OAuth access token for marketplace apps), sent as
  `Authorization: Bearer <token>`
- **Version header:** send the API version date header required by your endpoints (see docs;
  e.g. `Version: 2021-07-28` is common)

Store tokens and **location id** in environment variables (exact names TBD in `.env.example`;
never expose Private Integration tokens to the browser).

### Operational rules (Phase 1) — confirmed

- **No app-triggered GHL messaging in Phase 1:** the Next.js app **does not** send patient
  emails through GHL or **enroll contacts into GHL workflows** via API. Those emails and
  automations run **only inside GHL**. The app may still call API v2 for **contacts**
  (create/update, search-by-email for find-my-link, read for lazy provisioning).
- **Calendar booking** in GHL **creates a contact when one does not exist**, so the practice
  always has a **`contactId`** to put in `/p/<ghlContactId>` links.
- **Admin “new patient”** in this app should still **create (or upsert) the contact via API v2**
  when that path is used, so Supabase and GHL stay aligned.
- **Email templates, delays, no-shows, and legal/T&C** for the GHL-side journey are **configured
  in GHL** by the practice — no requirement to expose production hostname flows in this repo
  beyond keeping **`NEXT_PUBLIC_APP_URL`** (or equivalent) **identical** to the **origin used
  inside GHL email links** so redirects, cookies, and magic-link paths match.

### Contact Management

When a new patient is created in the admin panel:

```typescript
interface GhlCreateContactPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  /** Custom field: portal link for this patient */
  customField: {
    portal_link: string;
  };
  tags: ["portal_patient"];
}
```

When a patient completes onboarding, key fields from the onboarding form are written
back to the GHL contact's custom fields so Dr. Jasmine can see them in GHL as well:

```typescript
interface GhlUpdateContactPayload {
  customField: {
    chief_complaint: string;
    existing_conditions: string;    // comma-separated
    current_medications: string;    // comma-separated
    patient_status: "onboarding" | "booked" | "active";
  };
}
```

### Workflow enrollment (API v2)

Triggering workflows / campaigns is done through **API v2** endpoints documented on the
developer portal (paths differ from legacy v1). Implement `enrollInGhlWorkflow` (or
equivalent) by following the current **“Add contact to workflow / campaign”** (or successor)
operation in the official docs — do not use `rest.gohighlevel.com/v1/...` URLs.

```typescript
// lib/integrations/ghl.ts — shape only; use marketplace docs for exact URL + body.

interface EnrollInWorkflowParams {
  /** GHL contact ID */
  contactId: string;
  /** Workflow / campaign identifier from GHL or env */
  workflowId: string;
  /** Optional merge fields for the workflow */
  customData?: Record<string, string>;
}

// async function enrollInGhlWorkflow(params: EnrollInWorkflowParams): Promise<void> {
//   // POST to the API v2 workflow / campaign enrollment endpoint — see marketplace docs.
// }
```

### GHL Workflows to Build

The following workflows are **examples** of what is configured in GHL. **Phase 1**
requires at least the **post-consultation portal link** email; booking-confirmed and
reminder rows below align with **in-app Cal.com** bookings (**Phase 2–3**) when the app
enrolls contacts via the API.

| Workflow / automation (example env var) | When | Actions (examples) |
|---|---|---|
| _(GHL studio — Phase 1)_ | **1h after appointment start** (delay set in GHL) | **Email** with portal URL `/p/<ghlContactId>` |
| `GHL_WORKFLOW_BOOKING_CONFIRMED` | In-app Cal booking created (Phase 2+) | WhatsApp/email: confirmed, Zoom link if available |
| `GHL_WORKFLOW_REMINDER_24H` | 24h before appointment | Reminder with join link |
| `GHL_WORKFLOW_REMINDER_1H` | 1h before appointment | Reminder with join link |
| `GHL_WORKFLOW_PATIENT_ACTIVATED` | Patient activated (Phase 3) | "Portal unlocked" style message with link |
| `GHL_WORKFLOW_READING_REMINDER` | Per cadence (Phase 3) | Reminder text respects **patient reading plan**, not assumed daily |
| `GHL_WORKFLOW_WELCOME` | Optional | Welcome / get-started messaging |
| `GHL_WORKFLOW_SEND_MY_LINK` | Patient requests link recovery | Sends portal link |

**Note:** Time-based reminders use GHL "Wait until" (or equivalent) relative to the
appointment `startTime` when the trigger comes from **Cal.com webhooks** in later phases.

### Looking up a contact by email (API v2)

Used in the **find-my-link** recovery flow. Implement using the **Contacts search / lookup**
operation from [HighLevel API documentation](https://marketplace.gohighlevel.com/docs/)
(v2 paths and query params differ from legacy v1).

```typescript
// async function findGhlContactByEmail(email: string): Promise<string | null> {
//   // Call API v2 contacts search — return first matching contact id or null.
// }
```

---

## 4. OpenAI GPT-4o Vision

### Purpose

Allow patients to photograph their handwritten homework sheet instead of typing
all 7 values manually. This is an **optional secondary path** — not the primary
entry method.

### When It Is Called

Only when the patient explicitly chooses "Take a photo instead" on the readings
entry screen. The primary "Enter manually" path does not use OpenAI at all.

### API Call

```typescript
// app/api/extract-image/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ExtractedReadings {
  readingDate: string | null;
  fastingBloodSugar: number | null;
  postDinnerBloodSugar: number | null;
  bloodPressureSystolic: number | null;
  bloodPressureDiastolic: number | null;
  pulseRate: number | null;
  weightKg: number | null;
  waistlineCm: number | null;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const formData = await request.formData();
  const file = formData.get("image");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");
  const mimeType = file.type;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `You are extracting health readings from a patient's handwritten daily tracking sheet.
The sheet has these columns: Date, Fasting Blood Sugar (mmol/L), 2-Hour Post-Dinner Blood Sugar (mmol/L),
Blood Pressure (mmHg, written as systolic/diastolic), Pulse Rate (bpm), Weight (kg), Waistline (cm).

Extract the MOST RECENT row of readings from the image.

Return ONLY a JSON object with these exact keys:
{
  "readingDate": "YYYY-MM-DD or null if unclear",
  "fastingBloodSugar": number or null,
  "postDinnerBloodSugar": number or null,
  "bloodPressureSystolic": number or null,
  "bloodPressureDiastolic": number or null,
  "pulseRate": number or null,
  "weightKg": number or null,
  "waistlineCm": number or null
}

If a value is illegible or missing, use null. Do not guess. Return only the JSON, no other text.`,
          },
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${base64}`,
              detail: "high",
            },
          },
        ],
      },
    ],
    max_tokens: 300,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message.content;

  if (!content) {
    return NextResponse.json({ error: "No response from model" }, { status: 500 });
  }

  const extracted: ExtractedReadings = JSON.parse(content);
  return NextResponse.json({ readings: extracted });
}
```

### UX After Extraction

The extracted values pre-fill the stepped form. The patient is shown each value
one by one and asked "Does this look right?" with the option to edit before
confirming. The submitted reading saves `entryMethod: "photo_extracted"`.

### Error Handling

If extraction fails (network error, model returns null for all fields, or confidence
is low), the patient is shown:
> "We couldn't read the photo clearly. Please enter your readings manually."
> [Enter manually →]

No partial pre-fill — if any value is null, it is left blank for the patient to fill in.

### Cost Estimate

GPT-4o Vision with a high-detail image costs approximately $0.003–$0.008 USD per
image depending on resolution. At 100 photo submissions per day, this is under
$1 USD/day. This is acceptable.
