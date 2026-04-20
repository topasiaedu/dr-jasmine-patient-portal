# 09 — Build Phases

## Current State: Demo Build Complete

The app is currently a **full-scope demo** — every patient flow and admin page
is built using `localStorage` and mock data. No backend services are connected.
This is equivalent to completing the UI layer for Phases 1–3 + most of Phase 4a,
without any Supabase, Cal.com, GHL, or OpenAI integration.

**UI / design system:** The quiet-luxury design direction in `08-ui-ux.md` and the
redesign prompt series is **implemented in the frontend**. The next milestone is
**backend and integrations** — replacing demo data with Supabase, real auth, and
live services per the phases below.

---

## Launch strategy — GHL-first intake (Phase 1)

Until **Phase 2** brings booking into this app, **GoHighLevel owns the patient’s
first scheduling and intake**:

1. **Dr. Jasmine’s team** sends the patient a **GHL calendar link** (or equivalent
   GHL scheduling experience).
2. That flow includes a **GHL form** for the pre-consultation / intake questions
   (not the in-app stepped form yet).
3. The patient **books the first session** in that same GHL flow.
4. A **GHL automation** runs **1 hour after the scheduled appointment start time**
   (so the email typically arrives after the consultation has ended; exact offset is
   configured in GHL) and sends the
   patient an **email** containing the **portal link** with their **`ghlContactId`**
   in the path: `https://portal.drjasmine.com/p/<ghlContactId>` (or the production
   domain in use).

**Phase 1 of this app** assumes the patient may already exist in GHL and can
authenticate with that link; the app delivers **guide viewing** and **readings
submission** (plus admin tools). It does **not** require the in-app onboarding or
in-app Cal.com booking flows to be live yet — those are phased below.

---

## Phasing Philosophy

Build in the order of what delivers value to Dr. Jasmine earliest. The goal is to
get a real patient using a real feature as fast as possible, then layer on complexity.

Each phase produces a **shippable, working product** — not a partial feature.
Dr. Jasmine should be able to use each completed phase with real patients.

---

## Phase 1 — GHL integration + Guide + Readings

**Goal:** Dr. Jasmine can manage patients and guides in the app; patients open the
portal via the **magic link** (`/p/<ghlContactId>`) and use **guide** + **readings**.
**GoHighLevel** is integrated for identity (contact id in URL), **server-side GHL API**
usage (e.g. create or sync contacts, link recovery lookup), and **operational automations**
configured in GHL (calendar + form + post-appointment email with portal link — see
**Launch strategy** above). **Not every patient is on a daily readings schedule** —
cadence is set per patient in discussion with Dr. Jasmine (see `05-patient-portal.md`).

**What gets built:**

### Infrastructure (required first)
- [ ] Next.js 14 project scaffold with Tailwind CSS + shadcn/ui
- [ ] Supabase project setup — all tables from `04-data-models.md`
- [ ] Environment variables configured (including **GHL API** + location id)
- [ ] Next.js middleware — patient cookie + `ghlContactId` validation (`03-authentication.md`)
- [ ] Vercel deployment pipeline

### GoHighLevel (Phase 1 scope)

**Explicit boundary:** In Phase 1, **this app does not send patient emails through GHL**
and **does not enroll contacts into GHL workflows** (no `POST /api/ghl/enroll`, no
“fire automation” calls). **All** patient emails and time-based automations (including
the **1 hour after appointment start** portal link email) are configured and sent **only
inside GHL**. The app may still **call GHL API v2 for data**: e.g. create/update **contact**
when admin saves a patient, **search contact by email** for find-my-link, and read
contact details during lazy provisioning.

- [ ] **GHL API v2** client (Private Integration token or OAuth per HighLevel docs —
  see [HighLevel API documentation](https://marketplace.gohighlevel.com/docs/); **v1 is
  end-of-support**). Create/update contact when admin creates or updates a patient.
  **Operational rule:** GHL calendar booking **creates a contact if one does not already
  exist**, so a **`contactId` is always available** for the portal URL segment.
- [ ] **GHL studio configuration** (owned by the practice in GHL UI; document in runbook):
  - Calendar link flow including **intake form** and **booking** the first consultation
  - Automation: **email** to patient **1 hour after the appointment start time**
    (offset configurable in GHL) containing portal URL with `ghlContactId`
  - **No-show / reschedule / legal copy** for pre-portal flows stay in **GHL** (not this app)
- [ ] `POST /api/find-my-link` + `/find-my-link` — link recovery by email via GHL lookup
  (server may **read** GHL to resolve contact id; **does not** send GHL emails or enroll
  workflows from the app unless product later expands this — **Phase 1 = no app-driven
  GHL messaging or workflow triggers**; all of that stays inside GHL automations you configure)

### Patient Portal — Readings
- [ ] `/p/[ghlContactId]` root route with redirect appropriate to **Phase 1** scope
  (e.g. active patients → home or directly to log/guide as decided in middleware spec)
- [ ] **First-visit provisioning UX:** if the patient hits the portal before a Supabase
  row exists (acceptable per product decision), show a short **full-screen loading /
  “we’re getting things ready for you”** state while the server **creates or links** the
  patient record (and GHL contact if using admin-driven create), then continues into the
  app. Copy should be calm and modern — not a technical error state.
- [ ] `/p/[id]/log` — full 7-step readings form (manual entry path only)
  - Copy and reminders respect **clinician-agreed cadence** (not assumed daily) — see `05-patient-portal.md`
  - One field per screen, stepped navigation
  - Number input with +/- stepper buttons
  - Bilingual field labels
  - Review & submit screen
  - Duplicate-day detection (prompt to overwrite)
  - Confirmation screen after submit
- [ ] `POST /api/readings` API route
- [ ] Bottom tab navigation shell (Log + Guide active; other tabs "coming soon" or hidden)

### Patient Portal — Guide
- [ ] `/p/[id]/guide` — rendered guide view
  - All sections: NO list, YES categories, snacks, replacements, portions,
    cooking methods, additional sections
  - Colour-coded (red = NO, green = YES)
  - "Export as PDF" button using `@react-pdf/renderer`
- [ ] `GET /api/guides/[patientId]` API route
- [ ] Empty state when no guide assigned yet

### Admin Panel — Core Setup
- [ ] `/admin/login` — Supabase Auth email/password login
- [ ] Admin middleware — protect all `/admin/*` routes
- [ ] `/admin/patients` — patient list (basic, no search/filter yet)
- [ ] `/admin/patients/new` — create patient (name, email, phone) → **Supabase + GHL contact**
  with stable `ghlContactId` for portal URL
- [ ] `/admin/patients/[id]` — patient profile
  - Readings table (most recent 10, no pagination yet)
  - Basic patient info + optional **reading cadence** note for staff (see `04-data-models.md`)

### Admin Panel — Guide Builder
- [ ] `/admin/patients/[id]/guide` — full guide builder
  - NO list (tag input)
  - YES categories (add/remove/reorder categories, tag input per category, notes field)
  - Snacks (tag input)
  - Replacements (pair input: original → replacement)
  - Portions (fraction + label pairs)
  - Cooking methods (tag input)
  - Additional free-text sections (title + textarea)
  - "Copy from another patient" (patient picker, pre-fill from their guide)
  - "Preview as patient sees it" (modal render)
  - Save button + autosave draft to localStorage
  - "Export PDF preview"
- [ ] `PUT /api/admin/guides/[patientId]` API route
- [ ] `GET /api/admin/guides/[patientId]` API route

**Phase 1 deliverable:** Patient receives portal link from **GHL email automation**
after the first consultation; opens app; views guide and submits readings on the
schedule agreed with Dr. Jasmine. Admin can maintain patients in Supabase + GHL and
build guides. **First intake and first booking** happen in **GHL**, not in this app yet.

**Approximate effort:** 3–5 weeks for a single developer (GHL + Supabase + PDF).

---

## Phase 2 — In-app booking + Zoom (Cal.com)

**Goal:** Patients **book and reschedule follow-up consultations inside this app**.
**Zoom** meetings are created via **Cal.com**’s native Zoom integration. **No GHL
reminder/messaging workflows are required for this phase** — those stay in GHL
where already configured, or are extended in **Phase 3** when booking events are
fully wired to CRM automations.

**What gets built:**

### Infrastructure
- [ ] Cal.com account + event type setup (documented setup guide for Dr. Jasmine)
- [ ] Cal.com ↔ Zoom integration enabled
- [ ] Cal.com ↔ Google Calendar sync enabled
- [ ] Cal.com webhook configured pointing to `/api/webhooks/cal`

### Patient Portal — Appointments
- [ ] `/p/[id]/appointment` — upcoming appointment page
  - Appointment card: date, time, doctor name
  - "Join on Zoom" button (15-minute visibility rule)
  - "Book a consultation" (if no appointment)
  - "Reschedule" link (Cal.com reschedule URL)
- [ ] Cal.com embed component (`CalBookingWidget`)
- [ ] Home screen — appointment card section
- [ ] "Join on Zoom" button on home screen (same 15-min rule)

### Backend — Webhook (appointments only)
- [ ] `POST /api/webhooks/cal` — Cal.com webhook handler
  - Persist appointment to Supabase (`BOOKING_CREATED`, reschedule, cancel)
  - **Optional later:** enroll in GHL workflows when product wants WhatsApp reminders
    on in-app bookings (can slip to Phase 3)

### Admin Panel — Schedule
- [ ] `/admin/schedule` — Cal.com calendar view (read-only, week view)
  - Pull upcoming appointments via Cal.com API
- [ ] Dashboard — today's appointments list with "Open Consult Panel" links
- [ ] Consultation panel — first version (notes, last readings, link to guide builder)

**Phase 2 deliverable:** Booking and Zoom join flow lives **in the app** via Cal.com.
GHL continues to own whatever messaging the practice configures; this phase does **not**
depend on new GHL workflow wiring for Cal events unless explicitly added.

**Approximate effort:** 2–3 weeks.

---

## Phase 3 — In-app onboarding + access gating + GHL messaging alignment

**Goal:** Where the product still duplicates or replaces GHL-only steps, bring the
**full patient journey** into the app: optional **in-app** onboarding form, strict
**status gates**, **activation**, and **GHL workflows** aligned with **in-app** Cal
bookings (WhatsApp reminders, reading reminders that respect **per-patient cadence**,
patient activated, send-my-link enhancements).

**Note:** With **GHL-first intake** in Phase 1, the in-app onboarding form may
initially serve **follow-up patients**, migrations, or edge cases — or sync answers
from GHL custom fields into Supabase for the consultation panel. Exact priority is
decided at kickoff of Phase 3.

**What gets built:**

### Patient Portal — Onboarding (in-app)
- [ ] `/p/[id]/onboarding` — stepped onboarding form (6 steps from `05-patient-portal.md`)
  where product still requires in-app capture
  - Autosave draft to localStorage between steps
  - Form validation per step
  - Review + submit screen
- [ ] `POST /api/onboarding` — save onboarding response + update patient status
  - Sync key fields to GHL contact custom fields
  - Append `onboarding_completed` timeline event

### Patient Portal — Status Gates
- [ ] `/p/[id]/book` — post-onboarding booking step (Cal.com embed) when this path is used
  - After booking: redirect to `/p/[id]/pending`
- [ ] `/p/[id]/pending` — holding screen
  - Appointment details
  - "Join on Zoom" button (15-min rule)
- [ ] Middleware enforcement of status gates — routing logic for all states in use
- [ ] Home page — full implementation (task card respects **reading cadence**, appointment card)

### Admin Panel — Activation + Consultation Panel (Complete)
- [ ] "Activate Patient" button in consultation panel (live)
  - PATCH patient status to `active`
  - GHL enroll in Patient Activated workflow (if used)
  - Append `patient_activated` timeline event
- [ ] Patient profile — full timeline view
  - All event types rendered as timeline cards
  - Expandable consultation notes
- [ ] Consultation panel — onboarding summary section (live — may pull from GHL custom fields)
- [ ] `POST /api/admin/patients/generate-link` — generate magic link (frontend button in admin)

### GHL — Workflows tied to in-app behaviour
- [ ] Booking confirmed / 24h / 1h reminder workflows when driven by **Cal.com webhooks**
  and contact enrollment (see `07-integrations.md`)
- [ ] Reading reminder workflow — respects **clinician-set cadence** (not blindly daily)
- [ ] Welcome / patient activated / send-my-link workflows as needed

**Phase 3 deliverable:** End-to-end story for patients who onboard or re-enter through
the app, with messaging and gates aligned to **in-app** booking and **flexible** reading expectations.

**Approximate effort:** 2–3 weeks.

---

## Phase 4 — Nice-to-Haves

These features are non-critical for launch. Build in order of impact.

### 4a — FAQ
- [ ] `/p/[id]/faq` — accordion FAQ page
- [ ] FAQ content defined as a TypeScript constant (no CMS needed)
- [ ] FAQ tab added to bottom navigation

**Effort:** 2–3 days.

### 4b — AI Photo Reading Extraction
- [ ] Photo upload UI on readings entry screen ("Take a photo instead" secondary path)
- [ ] `POST /api/extract-image` — OpenAI GPT-4o Vision API call
- [ ] Pre-fill stepped form with extracted values
- [ ] Confirmation step for each extracted value
- [ ] Error handling: fallback to manual entry if extraction fails
- [ ] `entryMethod: "photo_extracted"` saved on reading record

**Effort:** 3–5 days.

### 4c — Admin Enhancements
- [ ] Patient list search + filter by status
- [ ] Patient list — pagination
- [ ] Readings table — pagination
- [ ] Dashboard — recent activity feed
- [ ] Admin panel — mobile responsive polish

**Effort:** 1 week.

### 4d — Multi-language (Bilingual EN/ZH)
- [ ] i18n setup using `next-intl` or `react-i18next`
- [ ] All patient-facing strings extracted to translation files
- [ ] Chinese (Simplified) translation file
- [ ] Language toggle on patient portal (EN / 中文)
- [ ] Language preference saved in localStorage

**Effort:** 1–2 weeks (translation content to be provided by Dr. Jasmine or a translator).

### 4e — Guide Duplication and Templates
- [ ] Guide template library — Dr. Jasmine can save any guide as a named template
- [ ] "Start from template" option in guide builder (in addition to "copy from patient")
- [ ] Template management in admin settings

**Effort:** 3–5 days.

---

## Summary Timeline

| Phase | Features | Estimated Effort | Deliverable |
|---|---|---|---|
| **1** | GHL (API + link model) + Guide + Readings + find-my-link; first intake/booking in GHL | 3–5 weeks | Portal live for guide + readings after consult email |
| **2** | Cal.com booking + Zoom + webhook + in-app appointment UI + schedule | 2–3 weeks | Follow-ups bookable inside the app |
| **3** | In-app onboarding/gating + activation + GHL workflows aligned to app events | 2–3 weeks | Full journey for app-native paths + messaging |
| **4a** | FAQ | 2–3 days | Self-service answers |
| **4b** | AI photo extraction | 3–5 days | Elderly UX shortcut |
| **4c** | Admin polish | 1 week | Operational improvements |
| **4d** | Bilingual EN/ZH | 1–2 weeks | Broader accessibility |
| **4e** | Guide templates | 3–5 days | Dr. Jasmine efficiency |

**Total to full feature launch (Phases 1–3):** approximately 8–10 weeks.

---

## Development Prerequisites

Before starting **Phase 1**, the following must be in place:

- [ ] Supabase project created (free tier sufficient for Phase 1–2)
- [ ] Vercel project connected to GitHub repo
- [ ] Domain purchased and DNS configured (`portal.drjasmine.com` or equivalent) **when ready**;
  until then, a **Vercel preview / production URL** is enough for development — set
  `NEXT_PUBLIC_APP_URL` to that origin and use the **same** base URL inside GHL email
  links whenever you test end-to-end (update both when you move to a custom domain)
- [ ] **GHL** account access confirmed + **API key** + **Location ID** + calendar/form
  flows for first booking + **post-appointment email** with portal link
- [ ] All environment variables documented and stored securely (e.g. Vercel env vars, 1Password)

Before starting **Phase 2**, add:

- [ ] Cal.com account created for Dr. Jasmine
- [ ] Zoom account confirmed as free tier (or Pro if needed)

Optional / later:

- [ ] OpenAI API key created (defer to Phase 4b for photo extraction)
