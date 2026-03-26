# 01 — Project Overview

## What This App Is

The Dr. Jasmine Patient Portal is a web application built for the patients of Dr. Jasmine
(Metanova Health Sdn Bhd). It serves as the digital companion to Dr. Jasmine's consultations,
giving patients a single place to:

1. Log their daily health readings (blood sugar, blood pressure, weight, etc.)
2. Book and join video consultations with Dr. Jasmine
3. View and export their personalised dietary and lifestyle guide
4. Complete their pre-consultation onboarding form

Dr. Jasmine also has her own separate admin panel within the same application, giving her
fast access to patient records, consultation tools, guide management, and her schedule.

---

## Goals

### Primary Goals
- Remove friction from daily health tracking for elderly / low-tech patients
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

Patients **do not create accounts**. There are no usernames or passwords. Each patient receives
a unique, unguessable URL from Dr. Jasmine's team (delivered via WhatsApp or email through GHL).
That link is their credential. See [Authentication](./03-authentication.md) for full details.

Dr. Jasmine accesses the admin panel via a separate, protected route using email + password
authentication through Supabase Auth.

---

## Patient Lifecycle

```
1. LINK SENT
   Dr. Jasmine's team generates a patient link and sends it via GHL (WhatsApp/email)

2. ONBOARDING
   Patient clicks the link → fills pre-consultation form → books first appointment
   (App is locked to this flow only until activation)

3. LOCKED / PENDING
   Patient sees a holding screen showing their upcoming appointment and Zoom join link
   No other app features are accessible

4. FIRST CONSULTATION
   Patient and Dr. Jasmine meet via Zoom
   Dr. Jasmine uses the consultation panel to review onboarding answers, take notes,
   and build the patient's initial guide

5. ACTIVATION
   Dr. Jasmine clicks "Activate Patient" in the consultation panel
   GHL fires a WhatsApp message to the patient with a link back to the now-unlocked portal

6. ACTIVE USE
   Patient logs daily readings, views their guide, books follow-up appointments
   Dr. Jasmine monitors readings and updates guides after each consultation
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
| Patient onboarding completion rate | >80% of patients who receive the link complete onboarding |
| Daily reading submission rate | >60% of active patients submit at least 4 readings per week |
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

**Next milestone:** Design overhaul (documented in `08-ui-ux.md` and
`12-design-implementation-prompts.md`), then backend integration.
