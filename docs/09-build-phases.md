# 09 — Build Phases

## Phasing Philosophy

Build in the order of what delivers value to Dr. Jasmine earliest. The goal is to
get a real patient using a real feature as fast as possible, then layer on complexity.

Each phase produces a **shippable, working product** — not a partial feature.
Dr. Jasmine should be able to use each completed phase with real patients.

---

## Phase 1 — Daily Readings + Patient Guide

**Goal:** Dr. Jasmine can build a patient's guide in the app, and the patient can
log their daily readings. No booking, no onboarding form, no magic link flow yet.
Patients are created manually by Dr. Jasmine and given a direct URL.

**What gets built:**

### Infrastructure (required first)
- [ ] Next.js 14 project scaffold with Tailwind CSS + shadcn/ui
- [ ] Supabase project setup — all tables from `04-data-models.md`
- [ ] Environment variables configured
- [ ] Basic Next.js middleware shell (patient cookie + status gate logic)
- [ ] Vercel deployment pipeline

### Patient Portal — Readings
- [ ] `/p/[id]` root route with status-based redirect
- [ ] `/p/[id]/log` — full 7-step readings form (manual entry path only)
  - One field per screen, stepped navigation
  - Number input with +/- stepper buttons
  - Bilingual field labels
  - Review & submit screen
  - Duplicate-day detection (prompt to overwrite)
  - Confirmation screen after submit
- [ ] `POST /api/readings` API route
- [ ] Bottom tab navigation shell (Log tab active; others visible but show "coming soon")

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
- [ ] `/admin/patients/new` — manually create a patient (name, email, phone)
  - For Phase 1: creates Supabase record + generates portal link
  - GHL integration deferred to Phase 2
- [ ] `/admin/patients/[id]` — patient profile
  - Readings table (most recent 10, no pagination yet)
  - Basic patient info

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

**Phase 1 deliverable:** Dr. Jasmine can create a patient manually, build their
personalised guide, and the patient can view the guide and log readings via their URL.
PDF export works. This replaces the printed LCHF sheet immediately.

**Approximate effort:** 3–4 weeks for a single developer.

---

## Phase 2 — Appointment Booking + Zoom + GHL Reminders

**Goal:** Patients can book appointments through the app. Dr. Jasmine gets automated
WhatsApp reminders going. Zoom links appear automatically. GHL integration is live.

**What gets built:**

### Infrastructure
- [ ] Cal.com account + event type setup (documented setup guide for Dr. Jasmine)
- [ ] Cal.com ↔ Zoom integration enabled
- [ ] Cal.com ↔ Google Calendar sync enabled
- [ ] Cal.com webhook configured pointing to `/api/webhooks/cal`
- [ ] GHL workflows built:
  - Booking confirmed (WhatsApp + Zoom link)
  - 24h reminder
  - 1h reminder
  - (Reading reminder deferred to Phase 3 when onboarding is live)

### Patient Portal — Appointments
- [ ] `/p/[id]/appointment` — upcoming appointment page
  - Appointment card: date, time, doctor name
  - "Join on Zoom" button (15-minute visibility rule)
  - "Book a consultation" (if no appointment)
  - "Reschedule" link (Cal.com reschedule URL)
- [ ] Cal.com embed component (`CalBookingWidget`)
- [ ] Home screen — appointment card section
- [ ] "Join on Zoom" button on home screen (same 15-min rule)

### Backend — Webhook + GHL
- [ ] `POST /api/webhooks/cal` — Cal.com webhook handler
  - Save appointment to Supabase
  - Enroll contact in GHL booking confirmed workflow
  - Handle reschedule and cancellation events
- [ ] `POST /api/ghl/enroll` — GHL workflow enrollment utility
- [ ] GHL contact creation when new patient is added in admin panel (retrofit Phase 1 flow)
- [ ] `POST /api/find-my-link` — link recovery
- [ ] `/find-my-link` — recovery page

### Admin Panel — Schedule
- [ ] `/admin/schedule` — Cal.com calendar view (read-only, week view)
  - Pull upcoming appointments via Cal.com API
- [ ] Dashboard — today's appointments list with "Open Consult Panel" links
- [ ] Consultation panel — first version
  - Patient onboarding summary (blank for Phase 2, populated in Phase 3)
  - Last 3 readings
  - Notes textarea with autosave
  - Link to guide builder
  - Activate patient button (deferred — no gating yet in Phase 2)

**Phase 2 deliverable:** Full booking flow is live. Patients book via the app,
Zoom is auto-created, WhatsApp reminders fire automatically. Dr. Jasmine's schedule
is visible in the admin panel.

**Approximate effort:** 2–3 weeks.

---

## Phase 3 — Onboarding + Access Gating

**Goal:** The complete patient journey from first link click to first consultation
to activated account is fully automated. No manual status changes by Dr. Jasmine's staff.

**What gets built:**

### Patient Portal — Onboarding
- [ ] Full magic link flow — middleware reads GHL contact ID from URL, sets cookie
- [ ] `/p/[id]/onboarding` — stepped onboarding form (6 steps from `05-patient-portal.md`)
  - Autosave draft to localStorage between steps
  - Form validation per step
  - Review + submit screen
- [ ] `POST /api/onboarding` — save onboarding response + update patient status
  - Sync key fields to GHL contact custom fields
  - Append `onboarding_completed` timeline event

### Patient Portal — Status Gates
- [ ] `/p/[id]/book` — post-onboarding booking step
  - Cal.com embed with patient name + email pre-filled
  - After booking: redirect to `/p/[id]/pending`
- [ ] `/p/[id]/pending` — holding screen
  - Appointment details
  - "Join on Zoom" button (15-min rule)
- [ ] Middleware enforcement of status gates — routing logic for all three states
- [ ] Home page — full implementation (today's task card, appointment card)

### Admin Panel — Activation + Consultation Panel (Complete)
- [ ] "Activate Patient" button in consultation panel (live)
  - PATCH patient status to `active`
  - GHL enroll in Patient Activated workflow
  - Append `patient_activated` timeline event
- [ ] Patient profile — full timeline view
  - All event types rendered as timeline cards
  - Expandable consultation notes
- [ ] Consultation panel — onboarding summary section (live)
- [ ] `POST /api/admin/patients/generate-link` — generate magic link (frontend button in admin)

### GHL — Remaining Workflows
- [ ] Welcome workflow (new patient link generated)
- [ ] Patient activated workflow
- [ ] Send my link recovery workflow
- [ ] Daily reading reminder workflow
  - Time-based, fires daily at Dr. Jasmine's configured time
  - Only for active patients who have not submitted today

**Phase 3 deliverable:** The app handles a patient from zero to fully active with
no manual steps by Dr. Jasmine's team beyond generating the initial link. The complete
consultation workflow is usable.

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
| **1** | Readings + Guide (patient) + Guide builder (admin) | 3–4 weeks | Replaces printed sheets immediately |
| **2** | Booking + Zoom + GHL reminders + Schedule | 2–3 weeks | Full appointment automation |
| **3** | Onboarding + Access gating + Full consultation panel | 2–3 weeks | Complete patient journey |
| **4a** | FAQ | 2–3 days | Self-service answers |
| **4b** | AI photo extraction | 3–5 days | Elderly UX shortcut |
| **4c** | Admin polish | 1 week | Operational improvements |
| **4d** | Bilingual EN/ZH | 1–2 weeks | Broader accessibility |
| **4e** | Guide templates | 3–5 days | Dr. Jasmine efficiency |

**Total to full feature launch (Phases 1–3):** approximately 8–10 weeks.

---

## Development Prerequisites

Before starting Phase 1, the following must be in place:

- [ ] Supabase project created (free tier sufficient for Phase 1–2)
- [ ] Vercel project connected to GitHub repo
- [ ] Domain purchased and DNS configured (`portal.drjasmine.com` or equivalent)
- [ ] GHL account access confirmed + API key obtained + Location ID confirmed
- [ ] Cal.com account created for Dr. Jasmine
- [ ] Zoom account confirmed as free tier (or Pro if needed)
- [ ] OpenAI API key created (can be deferred to Phase 4b)
- [ ] All environment variables documented and stored securely (e.g. Vercel env vars, 1Password)
