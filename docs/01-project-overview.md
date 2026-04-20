# 01 — Project Overview

## What This App Is

The Dr. Jasmine Patient Portal is a web application built for the patients of Dr. Jasmine
(Metanova Health Sdn Bhd). It serves as the digital companion to Dr. Jasmine's consultations,
giving patients a single place to:

1. Log their **health readings** on a **cadence agreed with Dr. Jasmine** (not every
   patient is daily — some log every other day, twice a week, etc., depending on their plan)
2. Book and join video consultations with Dr. Jasmine (in-app booking is phased; see `09-build-phases.md`)
3. View and export their personalised dietary and lifestyle guide
4. Complete or supplement pre-consultation intake (initial intake may run in **GHL**
   before the portal link is sent — see `09-build-phases.md`)

Dr. Jasmine also has her own separate admin panel within the same application, giving her
fast access to patient records, consultation tools, guide management, and her schedule.

---

## Goals

### Primary Goals
- Remove friction from **health tracking** for elderly / low-tech patients, on each
  patient’s **clinician-agreed** schedule (not assumed to be daily)
- Give Dr. Jasmine a single tool to manage patient information, consultations, and guides
- Automate appointment reminders to reduce no-shows
- Digitise the currently paper-based patient workflow (homework sheet, dietary guides, onboarding forms)

### Secondary Goals
- Enable Dr. Jasmine to quickly review a patient's full history before and during a consultation
- Allow patients to access their personalised guide at any time without needing to keep a printed copy
- Lay the foundation for future features (multi-language support, additional doctors, analytics)

---

## Target Users

### Patients (Primary Consumer)
- **Profile:** Predominantly elderly or low-digital-literacy individuals; patients of Dr. Jasmine's
  private practice; international patients from Malaysia, Singapore, and worldwide
- **Device:** Mobile phone (primary); tablet or desktop (secondary)
- **Technical comfort:** Very low — must assume the user has never used a health app before
- **Language:** English and Mandarin are the most common; Bahasa Malaysia possible
- **Key constraint:** Every interaction must be obvious. There is no room for ambiguity in the UI.
  If a user has to think about what to do next, the design has failed.

### Dr. Jasmine (Admin / Practitioner)
- **Profile:** Single practitioner managing her own patient list; comfortable with technology
- **Device:** Desktop or laptop during consultations; mobile for quick checks
- **Key constraint:** During back-to-back consultations, speed matters. The consultation panel
  must surface everything she needs without navigation.

---

## Access Model

Patients **do not create accounts**. There are no usernames or passwords. Each patient uses
a unique, unguessable portal URL containing their **GHL contact id** (`/p/<ghlContactId>`).
For the **Phase 1** launch path, that link is typically delivered by **GHL email automation**
after the first consultation (see [Build Phases](./09-build-phases.md)). See
[Authentication](./03-authentication.md) for cookie and middleware details.

Dr. Jasmine accesses the admin panel via a separate, protected route using email + password
authentication through Supabase Auth.

---

## Patient Lifecycle

**Launch path (Phase 1 — GHL-first intake):** the first booking and intake form live in
**GoHighLevel**. The portal link is emailed after the first consultation. **Phase 2+**
adds in-app booking and the fuller gated journey described in `05-patient-portal.md`
and `09-build-phases.md`.

```
1. INVITE TO GHL
   Dr. Jasmine's team sends a GHL calendar link (scheduling + intake form in GHL)

2. INTAKE + FIRST BOOKING (in GHL)
   Patient completes the GHL form and books the first session in that flow

3. FIRST CONSULTATION
   Patient and Dr. Jasmine meet (e.g. Zoom link from GHL / calendar — outside this app in Phase 1)

4. PORTAL LINK (GHL automation)
   1 hour after the appointment **start** time (configurable in GHL), patient receives an email
   with the portal URL: /p/<ghlContactId>

5. ACTIVE USE — GUIDE + READINGS (this app, Phase 1)
   Patient views their guide and logs readings on the schedule agreed with Dr. Jasmine
   Dr. Jasmine builds/updates guides in the admin panel and monitors readings

6. LATER PHASES
   In-app Cal.com booking + Zoom, optional in-app onboarding/gating, richer reminders — see `09-build-phases.md`
```

---

## Non-Goals (Explicit Out of Scope)

- **Prescriptions or clinical records** — this is not an EMR system
- **Payments or billing**
- **In-app messaging between patient and doctor** (GHL handles this via WhatsApp)
- **Multiple doctors** — the app is built for a single practitioner for now; multi-doctor
  support is a future consideration and should not block current architecture decisions,
  but no multi-tenancy logic needs to be built at this stage
- **Native mobile apps** (iOS/Android) — PWA-quality web app is sufficient for launch

---

## Success Metrics

| Metric | Target |
|---|---|
| Intake + first booking completion (GHL flow) | >80% of invited patients complete GHL form + book |
| Reading adherence vs agreed cadence | Track against each patient’s plan (not a single “daily” bar) |
| Appointment no-show rate | <10% (baseline to compare against current rate) |
| Time for Dr. Jasmine to build a patient guide | <5 minutes per patient |

---

## Business Context

- **Company:** Metanova Health Sdn Bhd
- **Practice type:** Private GP / metabolic health, specialising in **diabetes reversal**
  through personalised dietary and lifestyle interventions (LCHF, Mediterranean,
  intermittent fasting, low GI, and other evidence-based protocols)
- **Current pain points:**
  - Patients lose or misplace printed dietary guides and homework sheets
  - No automated reminders; relies on manual follow-up
  - No centralised view of a patient's progress over time
  - Onboarding forms are paper-based and hard to reference during consultations

---

## Current Build State

The app is in **demo build** — a fully functional frontend using localStorage
and mock data in place of live backend services. This allows Dr. Jasmine to
preview the full patient journey and admin experience before backend integration.

**What is live:**
- All patient portal pages (onboarding, booking, pending, home, log, guide, FAQ)
- All admin panel pages (login, dashboard, patients list, patient profile, schedule)
- Patient flows use `localStorage` for state (demo_patient_status, demo_onboarding_draft, etc.)
- Admin auth uses `localStorage` key "admin_auth" (not Supabase Auth yet)
- Mock data in `lib/mock-data.ts` provides realistic demo content

**What uses placeholders / mock data:**
- No Supabase database connected — all data is from mock-data.ts or localStorage
- No Cal.com embed — booking page uses a custom date/time picker for demo
- No GHL integration — no WhatsApp reminders
- No OpenAI Vision — photo path has a scanning animation stub
- No Zoom — "Join on Zoom" button is present but disabled

**Next milestone:** **Backend integration** per `09-build-phases.md` (Supabase, GHL API,
real patient session, guide + readings). UI/design direction is documented in `08-ui-ux.md`
and the quiet-luxury prompt series; treat the **frontend demo** as preview-only until data is live.
