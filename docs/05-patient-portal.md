# 05 — Patient Portal

## Overview

The patient portal is the patient-facing side of the application. It lives under the
route `/p/[ghlContactId]/*`. All pages are mobile-first and designed for elderly or
low-tech-savvy users. Every screen has exactly one primary action.

---

## Route Map and Status Gates

| Route | Accessible when status is | Description |
|---|---|---|
| `/p/[id]` | any | Redirects to the correct screen based on status |
| `/p/[id]/onboarding` | `onboarding` | Pre-consultation form |
| `/p/[id]/book` | `onboarding` (after form) | Cal.com booking embed |
| `/p/[id]/pending` | `booked` | Holding screen |
| `/p/[id]/home` | `active` | Dashboard |
| `/p/[id]/log` | `active` | Daily readings entry |
| `/p/[id]/appointment` | `active` | Upcoming appointment + Join button |
| `/p/[id]/guide` | `active` | Personalised dietary guide |
| `/p/[id]/faq` | `active` | Frequently asked questions |
| `/find-my-link` | any (no cookie needed) | Link recovery by email |

---

## Page Specifications

### Root Redirect `/p/[id]`

No UI. Pure logic:
- `onboarding` → redirect to `/p/[id]/onboarding`
- `booked` → redirect to `/p/[id]/pending`
- `active` → redirect to `/p/[id]/home`

---

### Onboarding Form `/p/[id]/onboarding`

**Purpose:** Collect the patient's medical and personal background before their
first consultation. Dr. Jasmine references these answers during the consultation.

**UX pattern:** Stepped form — one question group per screen. Progress bar at the top.
Back and Next buttons at the bottom (full width, 56px height minimum).

**Steps:**

```
Step 1 — Personal Details
  • Full name (pre-filled from GHL contact if available)
  • Age
  • Sex (radio buttons, large tap targets)
  • Race / ethnicity

Step 2 — Health Background
  • Chief complaint / reason for seeing Dr. Jasmine (textarea)
  • Existing medical conditions (multi-select tags + free text option)
  • Current medications (add items one by one)
  • Known allergies (add items one by one)

Step 3 — Lifestyle
  • Smoking status (radio: Never / Former / Current)
  • Alcohol use (radio: None / Occasional / Moderate / Frequent)
  • Activity level (radio: Sedentary / Light / Moderate / Active)
  • Dietary notes (textarea — any restrictions, preferences)

Step 4 — Family History & Additional Notes
  • Family history (textarea)
  • Anything else for Dr. Jasmine to know (textarea)

Step 5 — Emergency Contact
  • Emergency contact name
  • Emergency contact phone number

Step 6 — Review & Submit
  • Summary of all answers (read-only, collapsible sections)
  • "Looks right — submit" primary button
  • "Go back and edit" secondary button
```

**On submit:**
- POST `/api/onboarding` — saves `onboarding_responses` row, updates patient status
- Appends `onboarding_completed` timeline event
- Redirects to `/p/[id]/book`

**Validation:**
- Full name, age, sex, chief complaint, emergency contact name + phone are required
- All other fields are optional but encouraged
- Age must be a positive integer less than 130
- Phone numbers accept any format (no strict E.164 enforcement on the form)

---

### Booking Page `/p/[id]/book`

**Purpose:** Book the first consultation with Dr. Jasmine.

**UX:** Cal.com booking widget embedded inline (not a modal, not a new tab).
The widget is styled to match the portal's colour palette via Cal.com's
embed theming options.

Above the widget: a short friendly message —
> "Almost there! Pick a time that works for you."

After booking is confirmed by Cal.com:
- Cal.com webhook fires
- Backend saves appointment to Supabase, GHL enrolls contact in booking workflow
- Patient is redirected to `/p/[id]/pending`

---

### Pending / Holding Screen `/p/[id]/pending`

**Purpose:** Inform the patient that they are all set and explain what happens next.

**Content:**
```
[Icon: Calendar with checkmark]

"You're booked in!"

Your first consultation with Dr. Jasmine is:

    Thursday, 3 April 2026
    10:00 AM – 10:30 AM

[Join on Zoom]   ← large button, only appears within 15 minutes of appointment time

──────────────────────────────────
What happens next?

Dr. Jasmine will introduce you to the rest of this app
during your consultation. See you then!
──────────────────────────────────

Need help? WhatsApp us →
```

The "Join on Zoom" button is hidden until 15 minutes before the appointment start time.
This prevents patients from accidentally joining at the wrong time.

---

### Home `/p/[id]/home`

**Purpose:** Greet the patient and surface the one most relevant action for today.

**Layout:**
```
Good morning, Lily 👋             ← personalised greeting, time-aware

┌─────────────────────────────────┐
│  TODAY'S TASK                   │
│                                 │
│  Have you logged your           │
│  readings today?                │
│                                 │
│  [Log my readings →]            │
└─────────────────────────────────┘

(if readings already submitted today, card becomes:)
┌─────────────────────────────────┐
│  ✓  All done for today!         │
│     Great work, Lily.           │
└─────────────────────────────────┘

─── UPCOMING APPOINTMENT ────────

Thursday, 3 April 2026 · 10:00 AM
[Join on Zoom]  ← same 15-min rule applies

(if no appointment booked:)
[Book a consultation →]
```

No other content on the home screen. No charts, no lists, no notifications feed.
The single task card is the entire value proposition of this screen.

---

### Daily Readings `/p/[id]/log`

**Purpose:** Submit the 7 daily health readings.

**UX pattern:** Stepped form, one field per screen. Patient cannot see all 7 fields
at once — this is intentional to prevent overwhelm.

**Entry paths:**

```
/p/[id]/log
│
├── Primary path: "Enter readings manually"
│   → Steps 1–7 (one field per screen, see below)
│
└── Secondary path: "Take a photo instead"
    → Camera/file upload screen
    → Photo sent to POST /api/extract-image
    → Extracted values pre-fill the stepped form
    → Patient reviews each value before submitting
    → entryMethod saved as "photo_extracted"
```

**The 7 steps (manual path):**

```
Step 1 — Date
  "Which date are these readings for?"
  Date picker, defaults to today
  (Patients may log yesterday's readings if they forgot)

Step 2 — Fasting Blood Sugar
  Unit: mmol/L
  Display: Large number with +/- stepper buttons
  Range hint: "Typical range: 3.9 – 5.6 mmol/L"
  Bilingual label: "Fasting Blood Sugar / 空腹血糖"

Step 3 — 2-Hour Post-Dinner Blood Sugar
  Unit: mmol/L
  Bilingual label: "After Dinner Blood Sugar / 餐后血糖"

Step 4 — Blood Pressure
  Two inputs side by side: Systolic / Diastolic
  Unit: mmHg
  Helper text: "The two numbers shown on your monitor"
  Bilingual label: "Blood Pressure / 血压"

Step 5 — Pulse Rate
  Unit: bpm
  Bilingual label: "Pulse Rate / 心跳"

Step 6 — Weight
  Unit: kg
  Bilingual label: "Weight / 体重"

Step 7 — Waistline
  Unit: cm
  Helper text: "Measure around your belly button"
  Bilingual label: "Waistline / 腰围"

Final screen — Review & Submit
  Shows all 7 values in a simple list
  "Submit" primary button (large, full width)
  "Change a value" secondary button (goes back to step 1)
```

**On submit:**
- POST `/api/readings`
- Supabase: inserts `daily_readings` row (unique constraint on patient_id + reading_date
  means duplicate submissions for the same day return a 409 with option to overwrite)
- Appends `reading_submitted` timeline event
- Shows confirmation screen: "Done! Dr. Jasmine will review your readings."
- Returns to home after 3 seconds or on tap

**Duplicate handling:**
If a reading for today already exists, show a message:
> "You've already logged today's readings. Would you like to update them?"
> [Yes, update] [No, keep the original]

---

### Appointment `/p/[id]/appointment`

**Purpose:** Show the next upcoming appointment and allow the patient to book or
reschedule.

**Layout:**
```
YOUR NEXT APPOINTMENT

Thursday, 3 April 2026
10:00 AM – 10:30 AM
Video call with Dr. Jasmine

[Join on Zoom]          ← large primary button, 15-min rule applies

─────────────────────────────────
[Book a new appointment]
[Reschedule this appointment]    ← opens Cal.com reschedule flow
─────────────────────────────────
```

If no upcoming appointment:
```
You don't have an appointment booked yet.

[Book a consultation →]          ← opens Cal.com booking widget
```

Reschedule and cancel are handled via Cal.com's native reschedule/cancel URLs,
which are included in the Cal.com webhook payload and stored with the appointment.

---

### Guide `/p/[id]/guide`

**Purpose:** Display the patient's personalised dietary and lifestyle guide.
This is a rendered version of the `PatientGuide` data model. The patient can
also export it as a PDF.

**Layout (when guide exists):**

```
YOUR GUIDE FROM DR. JASMINE
Last updated: March 2026

[LOW CARB HIGH FAT DIET]        ← guide title

━━━ FOODS TO AVOID ━━━━━━━━━━━━━━━
(Red section)
• White Rice, Brown Rice...
• Noodles, Bread, Biscuits...
• All fruits except...

━━━ FOODS YOU CAN EAT ━━━━━━━━━━━
(Green section)
  MEAT
  • Pork, Beef, Mutton, Duck...

  VEGETABLES
  • All above-ground vegetables...

━━━ REPLACEMENTS ━━━━━━━━━━━━━━━━
(Neutral section)
  Instead of white rice → Cauliflower rice
  Instead of regular noodles → Konjac noodles

━━━ PORTIONS ━━━━━━━━━━━━━━━━━━━━
  1/3 Meat  ·  1/3 Eggs or Tofu  ·  1/3 Vegetables

━━━ COOKING METHODS ━━━━━━━━━━━━━
  Pan-fried · Steamed · BBQ · Grilled...

━━━ NOTES FROM DR. JASMINE ━━━━━
  [any additional free-text sections]

─────────────────────────────────
[Export as PDF]                  ← secondary action at bottom
```

**When no guide has been assigned yet:**
```
Your guide from Dr. Jasmine will appear here after your first consultation.
```

**PDF export:**
- Client-side PDF generation using `react-pdf` or `@react-pdf/renderer`
- Produces a clean A4-formatted PDF with the same structure as the in-app view
- Bilingual content renders if both EN and ZH strings are present in the data
- No server call needed for export — generated in the browser

---

### FAQ `/p/[id]/faq`

**Purpose:** Answer common patient questions without needing to contact Dr. Jasmine.

**Format:** Collapsible accordion. Plain language. Short answers only.

**Suggested categories and questions (Dr. Jasmine to review/edit):**

```
ABOUT MY READINGS
  • How do I measure fasting blood sugar?
  • When should I measure my blood sugar?
  • What is a normal reading?
  • What do I do if my reading is very high or very low?

ABOUT MY DIET GUIDE
  • Can I eat [X]? (links to their guide)
  • What if I can't find the food I want to eat listed?

ABOUT APPOINTMENTS
  • How do I join the video call?
  • What if I need to reschedule?
  • What if I have a problem during the call?

ABOUT THIS APP
  • I can't find my link — how do I get back in?
  • How do I know Dr. Jasmine has seen my readings?
```

FAQ content is **hardcoded in the codebase** as a JSON/TypeScript constant. It does not
need a CMS or database. Updates require a code deployment, which is acceptable.

---

### Find My Link `/find-my-link`

**Purpose:** Recovery screen for patients who have lost their portal link.

**No cookie or auth required to access this page.**

**Flow:**
1. Patient enters their email address
2. POST `/api/find-my-link` — looks up GHL contact by email
3. If found: GHL fires "Send My Link" workflow (WhatsApp + email)
4. Patient sees: "We've sent your link to your registered contact."
5. If not found: "We couldn't find an account with that email.
   Please contact Dr. Jasmine's clinic for help."

No OTP, no security code, no timeout. The message goes to the patient's phone number
on record in GHL, which is the same phone they use for WhatsApp — if they can receive
messages, they get back in.
