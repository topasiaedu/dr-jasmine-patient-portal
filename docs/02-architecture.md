# 02 — Architecture

## Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Frontend framework | **Next.js 14 (App Router)** | SSR for fast first loads on mobile networks; file-based routing; API routes for backend logic |
| Styling | **Tailwind CSS** | Utility-first; fast to build large-touch-target, accessible UI |
| Component library | **shadcn/ui** | Accessible, unstyled base components that inherit Tailwind classes; avoids fighting a design system |
| Database | **Supabase (Postgres)** | Row-level security for patient data isolation; realtime subscriptions; free tier generous enough for launch |
| File storage | **Supabase Storage** | Stores uploaded documents (future use); same RLS model as the DB |
| Admin authentication | **Supabase Auth** | Email + password for Dr. Jasmine's admin panel |
| Patient authentication | **GHL Contact ID + HTTP cookie** | No login screen; link IS the credential (see [Authentication](./03-authentication.md)) |
| Booking | **Cal.com (free tier, cloud)** | Google Calendar 2-way sync; native Zoom integration; embeddable widget; webhooks on free tier |
| Video calls | **Zoom** | Auto-created per booking via Cal.com's native Zoom integration |
| CRM + Reminders | **GoHighLevel (GHL)** | WhatsApp + email automation workflows; contact management; existing subscription |
| AI reading extraction | **OpenAI GPT-4o Vision** | Optional photo-to-readings extraction; only called when patient chooses photo path |
| Hosting | **Vercel** | Zero-config Next.js deployment; edge functions; auto-scaling |

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          VERCEL (hosting)                           │
│                                                                     │
│   ┌────────────────────────────┐  ┌───────────────────────────┐    │
│   │     PATIENT PORTAL         │  │     ADMIN PANEL           │    │
│   │  /p/[ghlContactId]/*       │  │  /admin/*                 │    │
│   │                            │  │                           │    │
│   │  Next.js App Router        │  │  Next.js App Router       │    │
│   │  (RSC + Client Components) │  │  (RSC + Client Components)│    │
│   └─────────────┬──────────────┘  └─────────────┬─────────────┘    │
│                 │                               │                   │
│   ┌─────────────▼───────────────────────────────▼─────────────┐    │
│   │              NEXT.JS API ROUTES (/api/*)                   │    │
│   │  • /api/readings       • /api/patients                    │    │
│   │  • /api/guides         • /api/consultations               │    │
│   │  • /api/webhooks/cal   • /api/ghl                         │    │
│   │  • /api/extract-image  • /api/admin/*                     │    │
│   └──────┬──────────┬───────────────┬──────────────┬──────────┘    │
└──────────┼──────────┼───────────────┼──────────────┼───────────────┘
           │          │               │              │
    ┌──────▼──┐  ┌────▼──────┐  ┌────▼──────┐  ┌───▼────────┐
    │Supabase │  │  Cal.com  │  │    GHL    │  │  OpenAI    │
    │Postgres │  │  (free)   │  │   API     │  │  GPT-4o    │
    │+ Storage│  │+ Zoom int.│  │+ Workflows│  │  Vision    │
    └─────────┘  └─────┬─────┘  └───────────┘  └────────────┘
                       │
                  ┌────▼──────┐
                  │  Google   │
                  │ Calendar  │
                  │ (via Cal) │
                  └───────────┘
```

---

## Data Flow — Key Scenarios

### 1. Patient First Visit (Onboarding)

```
Patient clicks magic link: /p/<ghlContactId>
         │
         ▼
Next.js middleware reads ghlContactId from URL path
Validates against Supabase patients table
Sets cookie: { ghl_contact_id: "<id>", patient_id: "<uuid>" }
         │
         ▼
Patient status = "onboarding" → renders OnboardingForm
Patient completes form → POST /api/onboarding
Supabase: saves onboarding_responses, updates patient status = "booked"
GHL API: updates contact fields with onboarding data
         │
         ▼
Redirect to /p/<ghlContactId>/book → renders Cal.com booking widget
Patient selects slot → Cal.com creates booking + auto-creates Zoom meeting
         │
         ▼
Cal.com fires webhook → POST /api/webhooks/cal
Backend: saves appointment record to Supabase (with Zoom link)
Backend: calls GHL API → adds contact to "Booking Confirmed" workflow
GHL: fires WhatsApp confirmation with appointment details + Zoom link
         │
         ▼
Patient redirected to /p/<ghlContactId>/pending → holding screen
```

### 2. Patient Activation (Post First Consultation)

```
Dr. Jasmine in consultation panel clicks "Activate Patient"
         │
         ▼
PATCH /api/admin/patients/<id>/activate
Supabase: updates patient status = "active"
GHL API: adds contact to "Patient Activated" workflow
GHL: fires WhatsApp to patient with link back to portal
         │
         ▼
Next time patient loads any /p/<ghlContactId>/* route:
Middleware reads status = "active" → full portal is accessible
```

### 3. Daily Reading Submission

```
Patient opens /p/<ghlContactId>/log
Fills stepped form (7 fields, one per screen)
         │
         ▼
         Option A: Manual entry → patient types values
         Option B: Photo upload → POST /api/extract-image
                   OpenAI GPT-4o Vision extracts values
                   Pre-fills form → patient confirms values
         │
         ▼
POST /api/readings with 7 field values + date
Supabase: inserts row into daily_readings table
Response: confirmation screen
```

### 4. Appointment Booking (Follow-up)

```
Patient taps "Book / Reschedule" in Appointment tab
Cal.com embed loads with Dr. Jasmine's availability
         │
         ▼
Patient selects slot → Cal.com creates booking + Zoom meeting
Cal.com webhook → POST /api/webhooks/cal
Backend: upserts appointment in Supabase
Backend: GHL API → enroll in appropriate workflow
         (new booking / reschedule / cancellation each has own workflow)
```

### 5. Dr. Jasmine Opens Consultation Panel

```
Dr. Jasmine navigates to /admin/patients/<id>/consult
         │
         ▼
Page loads in parallel:
  • GET patient onboarding_responses
  • GET last 3 daily_readings entries
  • GET all consultation_notes for this patient (most recent first)
  • GET patient guide (if exists)
         │
         ▼
All data rendered in single-screen consultation panel
Dr. Jasmine takes notes → autosaved every 3 seconds via PATCH /api/admin/consultations/<id>/notes
Dr. Jasmine edits guide → PATCH /api/admin/guides/<patientId>
Dr. Jasmine activates patient → PATCH /api/admin/patients/<id>/activate
```

---

## Route Structure

### Patient Portal

```
/p/[ghlContactId]                    → redirect based on status
/p/[ghlContactId]/onboarding         → onboarding form (status: onboarding)
/p/[ghlContactId]/book               → Cal.com booking embed (status: onboarding, after form)
/p/[ghlContactId]/pending            → holding screen (status: booked)
/p/[ghlContactId]/home               → home dashboard (status: active)
/p/[ghlContactId]/log                → health readings (status: active; cadence per patient)
/p/[ghlContactId]/appointment        → upcoming appointment + join button (status: active)
/p/[ghlContactId]/guide              → personalised guide + PDF export (status: active)
/p/[ghlContactId]/faq                → FAQ (status: active)
```

### Admin Panel

```
/admin                               → redirect to /admin/dashboard
/admin/login                         → Dr. Jasmine login screen
/admin/dashboard                     → overview: today's appointments, recent readings
/admin/patients                      → patient list with search/filter
/admin/patients/[id]                 → patient profile + journey timeline
/admin/patients/[id]/consult         → consultation panel (focused view)
/admin/patients/[id]/guide           → guide builder
/admin/patients/new                  → generate new patient link
/admin/schedule                      → Dr. Jasmine's calendar view
```

### API Routes

```
POST   /api/onboarding                      → submit onboarding form
POST   /api/readings                        → submit one dated reading set (fields per `04-data-models.md`)
POST   /api/extract-image                   → OpenAI photo extraction
POST   /api/webhooks/cal                    → Cal.com booking webhook
GET    /api/admin/patients                  → list patients
GET    /api/admin/patients/[id]             → get patient full profile
PATCH  /api/admin/patients/[id]/activate    → activate patient
POST   /api/admin/patients/[id]/notes       → add consultation note
PATCH  /api/admin/patients/[id]/notes/[nId] → update consultation note
PUT    /api/admin/guides/[patientId]        → create or replace patient guide
GET    /api/admin/guides/[patientId]        → get patient guide
POST   /api/ghl/enroll                      → enroll GHL contact in workflow
POST   /api/admin/patients/generate-link    → generate new patient magic link
```

---

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # server-side only, never exposed to client

# GoHighLevel (API v2 — Private Integration or OAuth token; see `07-integrations.md`)
GHL_API_KEY=                       # Bearer token (Private Integration recommended for single-location)
GHL_LOCATION_ID=
GHL_WORKFLOW_BOOKING_CONFIRMED=   # workflow ID for booking confirmation
GHL_WORKFLOW_REMINDER_24H=        # workflow ID for 24h reminder
GHL_WORKFLOW_REMINDER_1H=         # workflow ID for 1h reminder
GHL_WORKFLOW_PATIENT_ACTIVATED=   # workflow ID for activation message
GHL_WORKFLOW_READING_REMINDER=    # optional; cadence-aware nudge (Phase 3 — not assumed daily)
# GHL post-consult portal email is often a **pure GHL automation** (no env var) in Phase 1;
# add an ID here if the app enrolls contacts into that workflow via API.

# Cal.com
CAL_API_KEY=
CAL_WEBHOOK_SECRET=               # for verifying webhook signatures

# OpenAI
OPENAI_API_KEY=

# App
NEXT_PUBLIC_APP_URL=
COOKIE_SECRET=                    # for signing the patient session cookie
```

---

## Security Considerations

- All Supabase tables use **Row Level Security (RLS)**. A patient can only read/write their
  own rows. The service role key (used only in API routes) bypasses RLS for admin operations.
- The patient cookie is **HTTP-only, Secure, SameSite=Strict**. It cannot be read by
  JavaScript in the browser.
- The cookie payload is signed with `COOKIE_SECRET` to prevent tampering.
- Cal.com webhooks are verified using the `CAL_WEBHOOK_SECRET` before processing.
- All `/api/admin/*` routes verify that the request comes from an authenticated Dr. Jasmine
  session (Supabase Auth JWT check).
- No patient health data is logged to console or third-party services other than Supabase.
