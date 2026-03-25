# 06 — Admin Panel

## Overview

The admin panel is Dr. Jasmine's side of the application. It lives under `/admin/*` and
is protected by Supabase Auth (email + password). It is designed for desktop use during
consultations, with a responsive mobile view for quick checks on the go.

The admin panel has two modes:
1. **Standard management** — browsing patients, reviewing records, checking schedule
2. **Consultation mode** — a focused single-screen view used during an active call

---

## Route Map

| Route | Description |
|---|---|
| `/admin/login` | Login screen |
| `/admin/dashboard` | Overview: today's appointments, recent activity |
| `/admin/patients` | Full patient list with search and filter |
| `/admin/patients/new` | Generate a new patient magic link |
| `/admin/patients/[id]` | Patient profile — full history and journey |
| `/admin/patients/[id]/consult` | Consultation panel — focused view for active calls |
| `/admin/patients/[id]/guide` | Full-screen guide builder |
| `/admin/schedule` | Calendar view of Dr. Jasmine's appointments |

---

## Page Specifications

### Login `/admin/login`

Simple email + password form. No self-registration. Supabase Auth handles the session.
On successful login, redirects to `/admin/dashboard`.

---

### Dashboard `/admin/dashboard`

**Purpose:** Morning view. Dr. Jasmine lands here when she opens the app.

**Content:**

```
Good morning, Dr. Jasmine

TODAY — Wednesday, 25 March 2026

Consultations today:
┌─────────────────────────────────────────────────────┐
│  10:00 AM   Lily Tan         [Open Consult Panel]   │
│  11:30 AM   Ahmad Razif      [Open Consult Panel]   │
│   2:00 PM   Mary Lim         [Open Consult Panel]   │
└─────────────────────────────────────────────────────┘

Recent activity (last 24 hours):
• Lily Tan submitted readings — 2h ago
• Ahmad Razif booked an appointment — 5h ago
• New patient onboarding: Priya Nair — 8h ago
```

Each appointment row shows the patient name, time, and a direct link to the consultation
panel for that patient. This is the fastest path to being ready for a call.

---

### Patient List `/admin/patients`

**Purpose:** Browse, search, and manage all patients.

**Features:**
- Search by name, email, or phone
- Filter by status (`onboarding`, `booked`, `active`)
- Sort by: most recent activity, name (A–Z), date added
- Each row shows: name, status badge, last reading date, next appointment date
- Clicking a row opens `/admin/patients/[id]`
- "+ New Patient" button in the top right → `/admin/patients/new`

**Table columns:**
```
Name            Status      Last Reading     Next Appointment    Actions
─────────────────────────────────────────────────────────────────────────
Lily Tan        Active      Today            3 Apr 2026          [View]
Ahmad Razif     Active      3 days ago       25 Mar 2026         [View]
Priya Nair      Booked      —                22 Mar 2026         [View]
David Wong      Onboarding  —                —                   [View]
```

---

### New Patient `/admin/patients/new`

**Purpose:** Generate a magic link for a new patient to send via GHL.

**Flow:**
1. Dr. Jasmine (or her staff) enters: full name, email, phone number
2. Submits → backend creates patient record in Supabase + creates GHL contact
3. GHL contact ID is returned → stored as `ghlContactId` on the patient record
4. System generates the magic link: `https://portal.drjasmine.com/p/<ghlContactId>`
5. Admin panel shows the link with a "Copy" button and a "Send via GHL" button
   - "Send via GHL" calls GHL API to add the contact to the "Welcome" workflow,
     which sends a WhatsApp message with the link

---

### Patient Profile `/admin/patients/[id]`

**Purpose:** Full view of everything related to a patient. Dr. Jasmine uses this for
pre-consultation review and post-consultation follow-up.

**Layout (two-column on desktop, stacked on mobile):**

```
LEFT COLUMN (1/3 width)             RIGHT COLUMN (2/3 width)
────────────────────────────────    ────────────────────────────────────────
PATIENT INFO                        TIMELINE
  Name: Lily Tan                    ↓ Most recent at top
  Email: lily@email.com
  Phone: +60 12 345 6789            [Apr 3] Appointment booked
  Status: Active                    [Mar 31] Readings submitted
  Added: 1 Jan 2026                   Fasting: 6.2 | BP: 128/82
                                      Weight: 68.5kg | Waist: 89cm
QUICK ACTIONS                       [Mar 28] Consultation completed
  [Open Consult Panel]                Note: "Patient reports feeling better..."
  [Edit Guide]                        [Expand to read full note]
  [View Guide]                      [Mar 25] Guide updated
  [Generate New Link]               [Mar 18] Patient activated
                                    [Mar 10] Appointment booked
                                    [Mar 5]  Onboarding completed
                                    [Jan 1]  Patient created
```

**Reading history section** (below the two columns):

A paginated table of all submitted readings — most recent first.

```
Date         Fasting   Post-Dinner   BP          Pulse   Weight   Waist
───────────────────────────────────────────────────────────────────────
3 Apr 2026   6.2       8.1           128 / 82    74      68.5     89
31 Mar 2026  6.5       7.9           132 / 84    76      69.0     90
28 Mar 2026  6.8       8.4           135 / 86    78      69.5     91
```

No charts. No visualisations. Tabular view only (Dr. Jasmine's preference).
Show 10 rows per page. Pagination at the bottom.

---

### Consultation Panel `/admin/patients/[id]/consult`

**Purpose:** A single-screen command centre for Dr. Jasmine to use during an active
video consultation. Everything she needs is on one screen — no navigation required.

**Design principle:** Speed. Dr. Jasmine should be able to glance at the screen while
talking without losing the flow of conversation.

**Layout (desktop, 3-column):**

```
┌─────────────────────────────────────────────────────────────────────────┐
│  CONSULTATION — Lily Tan    [Active]         [Activate Patient]  [Done] │
├──────────────────┬──────────────────────────┬──────────────────────────┤
│                  │                          │                          │
│  ONBOARDING      │  LAST 3 READINGS         │  CONSULTATION NOTES      │
│  SUMMARY         │                          │                          │
│                  │  Mar 31  Fasting: 6.2    │  [Autosaving...]         │
│  Age: 58         │          Post: 8.1       │                          │
│  Conditions:     │          BP: 128/82      │  ┌────────────────────┐  │
│  • Type 2 DM     │          Pulse: 74       │  │                    │  │
│  • Hypertension  │          Weight: 68.5    │  │  Type notes here   │  │
│                  │          Waist: 89cm     │  │                    │  │
│  Medications:    │                          │  └────────────────────┘  │
│  • Metformin     │  Mar 28  Fasting: 6.5    │                          │
│  • Lisinopril    │          ...             │  PREVIOUS NOTES          │
│                  │                          │                          │
│  Chief concern:  │  Mar 25  Fasting: 6.8    │  [Mar 18] First consult  │
│  "Weight and     │          ...             │  "Introduced LCHF diet.  │
│   blood sugar"   │                          │   Patient motivated..."  │
│                  │                          │  [expand]                │
│  [Full profile]  │  [All readings →]        │                          │
│                  │                          │                          │
├──────────────────┴──────────────────────────┴──────────────────────────┤
│  GUIDE                                                                  │
│  Low Carb High Fat Diet  ·  Last updated: Mar 18                       │
│  [Quick edit guide]   [Open full guide builder →]                      │
└─────────────────────────────────────────────────────────────────────────┘
```

**Key behaviours:**

- **Autosave on notes:** Consultation notes autosave every 3 seconds while Dr. Jasmine
  types. No "Save" button needed. A subtle "Autosaving..." / "Saved" indicator in the corner.
- **"Activate Patient" button:** Only visible when patient status is `booked`.
  Clicking it shows a confirmation: "Activate Lily Tan? This will unlock the full portal
  and send them a WhatsApp message." Confirms → PATCH `/api/admin/patients/[id]/activate`.
- **"Done" button:** Marks the consultation as complete. Creates a `appointment_completed`
  timeline event. Does not navigate away — Dr. Jasmine dismisses manually.
- **"Quick edit guide":** Opens a slide-over panel for rapid edits without leaving the
  consultation panel. For deep edits, "Open full guide builder" opens the full page.
- **First consultation indicator:** If `isFirstConsultation` is true, a banner shows:
  "First consultation — onboarding form answers shown below."

---

### Guide Builder `/admin/patients/[id]/guide`

**Purpose:** Create and edit the patient's personalised dietary and lifestyle guide.
This is what the patient sees in their "Guide" tab.

**Layout:**

```
GUIDE BUILDER — Lily Tan

Guide title: [Low Carb High Fat Diet          ]

━━━ FOODS TO AVOID ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[+ Add item]
[White Rice      ×]  [Brown Rice      ×]  [Noodles         ×]
[Bread           ×]  [Fruit Juices    ×]  [White Sugar      ×]
... (tag-style chips)

━━━ FOODS ALLOWED ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[+ Add category]
  ┌── MEAT ──────────────────────────────────────────────────┐
  │  [+ Add item]                                             │
  │  [Pork ×]  [Beef ×]  [Chicken ×]  [Fish ×]              │
  │  Notes: [Fatty meat preferred over lean meat            ] │
  │  [Delete category]  [↑ Move up]  [↓ Move down]           │
  └───────────────────────────────────────────────────────────┘
  ┌── VEGETABLES ────────────────────────────────────────────┐
  │  ...                                                      │
  └───────────────────────────────────────────────────────────┘

━━━ SNACKS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Avocados ×]  [Strawberries ×]  [Nuts ×]  [+ Add]

━━━ REPLACEMENTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[+ Add replacement]
  Instead of [White Rice          ] → [Cauliflower rice    ]  [×]
  Instead of [Regular noodles     ] → [Konjac noodles      ]  [×]

━━━ PORTIONS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[+ Add portion]
  [1/3     ]  [Meat                                          ]  [×]
  [1/3     ]  [Eggs or Tofu                                  ]  [×]
  [1/3     ]  [Vegetables                                     ]  [×]

━━━ COOKING METHODS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Pan-fried ×]  [Steamed ×]  [BBQ ×]  [+ Add]

━━━ ADDITIONAL SECTIONS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[+ Add section]
  ┌── Quantity ───────────────────────────────────────────────┐
  │  Title: [Quantity                                        ] │
  │  Content: [Eat when you are hungry, stop when 100% full. ]│
  │  [Delete section]                                         │
  └───────────────────────────────────────────────────────────┘

─────────────────────────────────────────────────────────────
[Save Guide]                         [Preview as patient sees it]
[Copy from another patient...]       [Export PDF preview]
```

**Behaviours:**

- **Tag input:** Type a food item name, press Enter or comma to add it as a chip.
  Click the × on a chip to remove it.
- **Category reordering:** Drag-and-drop (or ↑/↓ buttons for keyboard/mouse-only users)
- **"Copy from another patient":** Opens a patient search modal. Selecting a patient
  pre-fills all guide fields from their guide as a starting point. Dr. Jasmine can
  then customise from there. Useful when two patients have similar protocols.
- **"Preview as patient sees it":** Opens the rendered patient guide view in a modal
  or split panel so Dr. Jasmine can verify how it looks before saving.
- **Save:** PUT `/api/admin/guides/[patientId]` — creates or replaces the guide.
  Appends `guide_updated` or `guide_created` timeline event accordingly.
- **Auto-draft:** Changes are saved as a draft every 30 seconds (local storage) so
  accidental navigation does not lose work. A banner shows "Unsaved changes" when draft
  differs from saved state.

---

### Schedule `/admin/schedule`

**Purpose:** Dr. Jasmine's calendar view — an overview of upcoming appointments pulled
from Cal.com via the Cal.com API.

**View:** Week view by default (most useful for a busy practice).
Toggle to Day or Month view.

Each appointment block shows:
- Patient name
- Time
- "Open Consult Panel" link

This view is read-only in the app — all booking management happens in Cal.com directly
or through the patient portal's reschedule flow. The schedule page is purely for visibility.

---

## Admin Notification Patterns

Dr. Jasmine does not receive in-app push notifications (she is primarily on desktop).
Instead, notable events can optionally be sent to her via GHL as a WhatsApp message
or email, configurable per event type. These GHL notifications are out of scope for
the initial build but the architecture supports them.

Examples:
- New patient completed onboarding
- Patient submitted their first reading
- Patient cancelled an appointment
