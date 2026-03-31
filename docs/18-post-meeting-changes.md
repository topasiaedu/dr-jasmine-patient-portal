# 18 — Post-Meeting Changes Spec

## Context

This document captures all design and architecture changes agreed after a feedback call
with Dr. Jasmine. These changes correct assumptions made in earlier documentation that
did not accurately reflect how Dr. Jasmine runs her practice. All changes in this document
supersede any conflicting instructions in earlier docs.

---

## Summary of What Changed and Why

| Area | Old Assumption | Reality (from meeting) |
|---|---|---|
| Scheduling | Patients self-book all appointments via Cal.com | Only session 1 is patient-booked; Dr. Jasmine books sessions 2–5 herself during the call |
| Consultation panel | Used live during a Zoom call as a command centre | Zoom runs in a separate app/tab; portal is used *before* and *after* the call, not during |
| Guide/report | Single document that gets edited over time | A versioned clinical protocol that *advances* through phases at Dr. Jasmine's discretion |
| Post-session comms | Not modelled | Dr. Jasmine writes a note to the patient via WhatsApp after every session |
| Onboarding | No symptoms field; blank text inputs for medical fields | Needs a diabetes symptoms checklist; pre-populated options for conditions, medications, allergies |
| Cal.com | Core booking integration | Removed — privacy concerns (connects to personal Google Calendar), overkill for the use case |
| Admin schedule | Read-only Cal.com calendar embed | Full internal calendar with availability management, block-time, and appointment booking |

---

## 1. Data Model Changes

All changes are to `lib/mock-data.ts` for the demo build. Production Supabase schemas will
follow from these definitions when backend integration begins.

### 1.1 Patient — add session tracking

```typescript
interface Patient {
  // ...existing fields...
  /** Total sessions the patient is entitled to under their current programme (default: 5) */
  sessionsEntitled: number;
  /** Number of consultations that have status = "completed" */
  sessionsCompleted: number;
}
```

### 1.2 OnboardingResponse — add symptoms

```typescript
interface OnboardingResponse {
  // ...existing fields...
  /**
   * Diabetes/metabolic symptoms the patient is currently experiencing.
   * Collected via a checkbox list on the onboarding form.
   */
  symptoms: string[];
}
```

### 1.3 Appointment — add session metadata

```typescript
interface Appointment {
  // ...existing fields...
  /** Which session number this is (1 = first consultation, 2 = second, etc.) */
  sessionNumber: number;
  /** Duration in minutes — always 60 for session 1, always 30 for sessions 2+ */
  durationMinutes: 30 | 60;
  /**
   * Who initiated the booking.
   * "patient" = booked via the patient portal booking page (session 1 only).
   * "admin" = booked by Dr. Jasmine from the admin panel.
   */
  scheduledBy: "patient" | "admin";
}
```

### 1.4 ConsultationNote — split into private and patient-facing

Remove the single `content` field. Replace with:

```typescript
interface ConsultationNote {
  id: string;
  patientId: string;
  appointmentId: string | null;
  /** Dr. Jasmine's private clinical notes. Never shown to the patient. */
  privateNotes: string;
  /**
   * The note Dr. Jasmine writes for the patient, sent via WhatsApp after the session.
   * Empty string until Dr. Jasmine fills it in.
   */
  patientNote: string;
  /**
   * ISO 8601 datetime when the patient note was dispatched via WhatsApp.
   * null = not yet sent.
   */
  patientNoteSentAt: string | null;
  createdAt: string;
  updatedAt: string;
}
```

### 1.5 GuideVersion — replace PatientGuide

The current `PatientGuide` model (one guide per patient, mutable) is replaced by
`GuideVersion` (multiple versions per patient, append-only). The patient always sees
the latest version where `supersededAt` is `null`.

```typescript
interface GuideVersion {
  id: string;
  patientId: string;
  /** Incrementing version number starting at 1 */
  versionNumber: number;
  /**
   * Human-readable name for this protocol phase, shown as the guide title to the patient.
   * Examples: "Low Carb High Fat Plan", "LCHF + Intermittent Fasting"
   */
  protocolName: string;
  /**
   * Private clinical note explaining why this phase was started.
   * Only visible to Dr. Jasmine. Never shown to the patient.
   * Example: "Patient hitting FBS < 5.5 consistently for 3 weeks. Ready for IF."
   */
  clinicalRationale: string;
  /** The session number during which this guide version was introduced */
  introducedAtSession: number;
  /** ISO 8601 date this version became active */
  activeFrom: string;
  /**
   * ISO 8601 date this version was replaced by a newer one.
   * null = this is the current active guide.
   */
  supersededAt: string | null;
  /** All existing guide content fields (noList, yesCategories, etc.) remain unchanged */
  noList: string[];
  yesCategories: FoodCategory[];
  snacks: string[];
  replacements: FoodReplacement[];
  portions: PortionGuidance[];
  cookingMethods: string[];
  additionalSections: FreeTextSection[];
  createdAt: string;
  updatedAt: string;
}
```

### 1.6 New types for internal scheduling (replaces Cal.com)

```typescript
/**
 * A recurring weekly availability window — the hours Dr. Jasmine is open for consultations.
 * These are set once and repeat every week.
 */
interface AvailabilityWindow {
  id: string;
  /** 0 = Sunday, 1 = Monday, ..., 6 = Saturday */
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  startTime: string;   // "HH:mm" — e.g. "09:00"
  endTime: string;     // "HH:mm" — e.g. "12:00"
}

/**
 * A specific blocked period — overrides availability windows.
 * Only visible to Dr. Jasmine when authenticated. Never exposed to patients.
 */
interface BlockedSlot {
  id: string;
  startsAt: string;   // ISO 8601 datetime
  endsAt: string;     // ISO 8601 datetime
  /**
   * Private label, only shown to Dr. Jasmine.
   * Patients and staff never see this.
   */
  privateLabel: string;
  isAllDay: boolean;
}
```

### 1.7 Mock data updates required

- `MOCK_PATIENT`: add `sessionsEntitled: 5`, `sessionsCompleted: 2`
- `MOCK_ONBOARDING`: add `symptoms: ["Frequent urination at night", "Fatigue", "Numbness in feet"]`
- `MOCK_APPOINTMENT`: add `sessionNumber: 1`, `durationMinutes: 60`, `scheduledBy: "patient"`
- `MOCK_CONSULTATION_NOTES`: rename `content` to `privateNotes`; add `patientNote` and `patientNoteSentAt: null`
- Replace `MOCK_GUIDE` and `MOCK_CONSULTATION_GUIDES` with `MOCK_GUIDE_VERSIONS: GuideVersion[]`
  — an array of 5 `GuideVersion` objects (one per consultation), mirroring the existing
  5-guide progression already in `MOCK_CONSULTATION_GUIDES`. The last entry has `supersededAt: null`.
- Add `MOCK_AVAILABILITY_WINDOWS: AvailabilityWindow[]` — realistic Mon/Wed/Fri/Thu schedule
- Add `MOCK_BLOCKED_SLOTS: BlockedSlot[]` — 1–2 example blocked periods with private labels

---

## 2. Onboarding Form Changes

**File:** `app/p/demo/onboarding/page.tsx`

### 2.1 Add symptoms checklist to Step 3

Rename Step 3 to "Health Background & Symptoms". Add a checkbox list **above** the
existing chief complaint field. The patient ticks all that apply:

- Frequent urination at night (nocturia)
- Excessive thirst
- Unexplained fatigue / low energy
- Blurred vision
- Numbness or tingling in hands/feet
- Slow-healing wounds or cuts
- Erectile dysfunction *(male patients only — render conditionally based on `data.gender === "male"`)*
- Skin darkening (neck or armpits)
- Unexplained weight loss
- Other (renders an optional free-text input when ticked)

Selection state maps to `data.symptoms: string[]`. Ticking adds the label string to the
array; unticking removes it.

### 2.2 Pre-populated multi-select for medical fields

Replace the blank text `Input + Add button` pattern for the three medical fields with a
**multi-select with pre-populated suggestions + free text fallback**. UX pattern:

1. Tapping the input area opens a bottom sheet or dropdown showing common options as
   tappable chips
2. Tapping a chip adds it to the selected list (chip becomes selected/highlighted)
3. Typing in the input filters the suggestion list; if no match, the typed value can be
   added with "Add" or Enter
4. Selected items appear as dismissible chips below the input (same chip style already
   used in the form)

**Existing Medical Conditions suggestions:**
Hypertension, Type 2 Diabetes, Prediabetes, High Cholesterol, Fatty Liver, PCOS,
Thyroid Condition, Heart Disease, Kidney Disease, Gout, Osteoarthritis, Sleep Apnea

**Current Medications suggestions:**
Metformin 500mg, Metformin 850mg, Metformin 1000mg, Sitagliptin (Januvia),
Empagliflozin (Jardiance), Dapagliflozin (Forxiga), Atorvastatin (Lipitor),
Rosuvastatin (Crestor), Amlodipine, Lisinopril, Losartan, Aspirin 100mg

**Known Allergies suggestions:**
None, Penicillin, Sulfa drugs, NSAIDs (Ibuprofen/Aspirin), Shellfish, Peanuts, Tree Nuts,
Latex, Eggs, Dairy

The "None" chip for allergies auto-clears all other allergy selections when tapped.

---

## 3. Guide System — Versioned Protocol Phases

### 3.1 Patient guide page (`app/p/demo/guide/page.tsx`)

**Keep the consultation tab navigation** — it is correct and well-designed. Update it to
work with `GuideVersion[]` instead of `PatientGuide[]`.

Changes:
- Data source changes from `MOCK_CONSULTATION_GUIDES` to `MOCK_GUIDE_VERSIONS`
- Each tab is now labelled with the `protocolName` (short version) rather than "Consult 1/2/3"
  — e.g. "Initial Plan", "Stricter LCHF", "LCHF + IF"
- The guide header shows `protocolName` as the title
- Add a "Your Journey" section at the **bottom** of the guide (before the Export button).
  This is a simple horizontal timeline showing all protocol phases in order:
  ```
  Jan 2026                Feb 2026               Mar 2026
  Initial LCHF  →  Stricter LCHF  →  LCHF + Intermittent Fasting  ← current
  ```
  Each phase node shows the month/year and protocol name. The current phase is
  highlighted. Tapping a node switches the tab to that consultation.
- `clinicalRationale` is **never rendered** on the patient side — it is Dr. Jasmine's
  private field only.

### 3.2 Admin guide builder (`app/admin/patients/[id]/guide/page.tsx`)

Complete redesign. The guide builder now has two primary modes:

**Mode A — Edit Current Plan (default)**
Opens with the current active `GuideVersion` pre-loaded. All fields are editable.
Saving overwrites the current version in place (no new version created).
Appropriate for: adding a food item, tweaking portions, minor corrections.

**Mode B — Start New Phase**
Triggered by a prominent "Start New Phase →" button in the header area.
Opens a modal/dialog:
```
Start a New Protocol Phase for Lily Tan

Protocol name (shown to patient):
[ LCHF + Intermittent Fasting          ]

Why are you advancing this patient? (private — patient never sees this):
[ Patient has hit FBS < 5.5 for 3 consecutive weeks. Ready for IF window. ]

[Cancel]   [Create New Phase →]
```
On confirmation:
1. The current version's `supersededAt` is set to today's date
2. A new `GuideVersion` is created, pre-filled with all content from the current version,
   with the new `protocolName`, `clinicalRationale`, incremented `versionNumber`,
   `introducedAtSession` set from current session count, and `supersededAt: null`
3. The builder opens in Mode A with the new version ready to edit

**Phase history panel**
A collapsible panel on the right (or bottom on smaller screens) labelled "Phase History".
Lists all previous versions in reverse chronological order:
```
[v3] LCHF + Intermittent Fasting  ←  current
[v2] Stricter LCHF                    started Feb 2026
[v1] Initial LCHF Plan                started Jan 2026
```
Clicking a historical version opens it in a **read-only preview** (cannot be edited —
previous phases are never changed, only the current one).

**Advanced sections — implement them**
The current placeholder ("Advanced Editor Linked — read-only in demo") must be replaced
with a working implementation of all guide content sections:
- YES food categories (add/remove/reorder categories; tag chip input per category; notes field)
- Replacements (add/remove pairs: original → replacement)
- Portions (add/remove: fraction + label)
- Cooking methods (tag chips)
- Additional free-text sections (add/remove: title + textarea)

---

## 4. Consultation Panel Redesign

**File:** `app/admin/patients/[id]/consult/page.tsx`

### Key concept change

The consultation panel is **not used during the Zoom call**. Dr. Jasmine is on Zoom in a
separate app or browser tab. The panel is used:
- **Before the call** (5–10 min pre-call brief): read-only, fast scan
- **After the call** (post-call wrap-up): write notes, send patient note, schedule next session

The live session timer and the "active session" red pulsing dot must be removed. They imply
real-time usage that doesn't match how the panel is actually used.

### 4.1 Page header

Replace the current header with:

```
[← Back to Lily Tan]           Session 2 of 5    [Mark Session Complete]
```

- Back link returns to patient profile
- "Session 2 of 5" reads from `sessionsCompleted + 1` / `sessionsEntitled`
- "Mark Session Complete" button: updates mock state, shows a brief success toast,
  does not navigate away

Remove: the red pulsing dot, the live timer, the "End Session" button.

### 4.2 Two-panel layout (keep the structure, change the content)

**Left panel — Patient Brief (pre-call reading)**

Sections (same general structure as today, with improvements):

1. **Latest readings** (vitals cards) — keep as-is, it is good
2. **Medical summary** — conditions, medications, allergies — keep as-is
3. **Onboarding summary** — chief complaint + symptoms from onboarding (new — currently
   not shown). Collapsed by default. Expandable with a "Show full onboarding form →" link.
4. **Recent readings table** — keep as-is
5. **Previous session notes** — show the `patientNote` from previous sessions (what was
   sent to the patient), not the private notes. This is the "what did I tell them last time"
   reference. Expandable per entry.

**Right panel — Session Notes (post-call writing)**

Two clearly separated sections with a visual divider between them:

**Section A — My Notes (Private)**
```
MY NOTES
Only you see this.

┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Large, clean textarea. No formatting toolbar. Full width.      │
│  Paste-friendly.                                                 │
│                                                                  │
│  Placeholder: "Paste or type your clinical notes here...        │
│  E.g. Patient reports less bloating. FBS improving."            │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
[Save Notes]
```

**Section B — Note for Patient**
```
NOTE FOR PATIENT
This will be sent to the patient via WhatsApp.

┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Separate textarea. Large and clean.                            │
│                                                                  │
│  Placeholder: "Write the summary you'd like to send the         │
│  patient. E.g. Great progress this session! Continue your       │
│  LCHF plan. Next steps: ..."                                    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
[Send to Patient via WhatsApp ↗]
```

The "Send to Patient" button in demo mode: sets `patientNoteSentAt` in localStorage,
shows a toast "Note sent to Lily Tan via WhatsApp", and the button becomes
"✓ Sent [timestamp]" (disabled).

**Bottom action row (below both sections)**

```
[Update Guide →]          [Schedule Next Session →]
```

- "Update Guide" links to `/admin/patients/[id]/guide`
- "Schedule Next Session" opens a date/time slot picker modal (see section 5 below)

---

## 5. Patient-Facing Scheduling Changes

### 5.1 Patient home page (`app/p/demo/home/page.tsx`)

The "Book a consultation" button in the appointment card:
- **Keep** when `sessionsCompleted === 0` (patient has never had a session — first booking)
- **Replace** with the text "Dr. Jasmine will schedule your next session" when
  `sessionsCompleted >= 1` and there is no upcoming appointment

For demo purposes, use `localStorage.getItem("demo_sessions_completed")` defaulting to `"0"`.

### 5.2 Patient appointment page (`app/p/demo/appointment/page.tsx`)

When an appointment exists:
- Show correct duration from `durationMinutes` (60 min for session 1, 30 min for sessions 2+)
- Remove the "Book a new appointment" button entirely — this was the patient self-booking
  follow-up action that doesn't exist in reality
- Keep the "Reschedule" button (patients can still move the time) — in demo mode this can
  remain as a toast/WhatsApp redirect

When no appointment exists:
- If `sessionsCompleted === 0`: show "Book your first consultation" button → `/p/demo/book`
- If `sessionsCompleted >= 1`: show "Your next session will be scheduled by Dr. Jasmine
  during your consultation. No action needed." (no button)

### 5.3 Patient booking page (`app/p/demo/book/page.tsx`)

No changes required. This page correctly serves the first-consultation self-booking flow.
It just needs to only be reachable when `sessionsCompleted === 0`, which is enforced by
the appointment page logic above.

---

## 6. Admin Calendar View

**File:** `app/admin/schedule/page.tsx` — full rebuild

### 6.1 Library

Use **FullCalendar** with the React adapter. Install:
```
npm install @fullcalendar/react @fullcalendar/core @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction
```

### 6.2 Calendar views

- **Default:** Time-grid week view (`timeGridWeek`)
- **Toggle buttons** in the toolbar: Day | Week | Month
- Time range displayed: 07:00 – 19:00
- First day of week: Monday

### 6.3 Event types on the calendar

**Booked appointments** (green, primary colour):
- Title: `"[Patient Name] — Session [N]"` e.g. "Lily Tan — Session 2"
- Background: primary colour (`#2D5E4C`) with white text
- Clicking opens a small popover showing: patient name, date/time, duration, session number,
  and an "Open Patient Workspace" link to `/admin/patients/[id]/consult`

**Availability windows** (light background tint, not a block):
- Rendered as background events (FullCalendar `display: "background"`) in a very light
  green tint
- Not clickable — purely visual to show when she is nominally open for bookings

**Blocked slots** (grey solid block):
- Background: `#D1C8C0` (muted stone)
- Title displayed: `"Unavailable"` — the `privateLabel` is **only** shown in the edit
  popover when Dr. Jasmine clicks the block, never in the calendar grid itself
- Clicking opens an edit popover: shows the private label, "Edit" and "Remove" options

### 6.4 Creating a blocked slot

Click-and-drag on any empty calendar cell (FullCalendar `selectable: true`).
On drag complete, open a modal:

```
Block This Time

[Date + time range auto-filled from drag selection]

Label (private — only you see this):
[ _________________________________ ]

[ ] All day

[Cancel]   [Block This Time]
```

Saving adds to `MOCK_BLOCKED_SLOTS` in component state (localStorage key
`"admin_blocked_slots"` for demo persistence).

### 6.5 Availability settings panel

A "Manage Availability" button in the page header opens a slide-over panel (use the
existing `Sheet` component from `components/ui/sheet.tsx`).

Inside the sheet, a weekly hours grid:

```
CONSULTATION HOURS

Mon  [✓]  Start [ 09:00 ▾ ]  End [ 12:00 ▾ ]  [+ Add window]
     [✓]  Start [ 14:00 ▾ ]  End [ 17:00 ▾ ]  [×]
Tue  [✓]  Start [ 09:00 ▾ ]  End [ 12:00 ▾ ]
Wed  [ ]  (off)
Thu  [✓]  Start [ 10:00 ▾ ]  End [ 13:00 ▾ ]
Fri  [✓]  Start [ 09:00 ▾ ]  End [ 12:00 ▾ ]
Sat  [ ]  (off)
Sun  [ ]  (off)

[Save Availability]
```

Toggling a day on/off and saving updates `MOCK_AVAILABILITY_WINDOWS` (persisted to
localStorage key `"admin_availability_windows"`). Changes immediately re-render the
background availability events on the calendar.

### 6.6 "Schedule Next Session" modal (from consultation panel)

The "Schedule Next Session →" button in the consultation panel opens this modal:

```
Schedule Next Session for Lily Tan

[Compact week-view calendar — shows available slots only]
(Blocked slots and already-booked times are greyed out/hidden)

Selected:  Thursday 9 April 2026 — 10:00 AM (30 min)

[Cancel]   [Confirm & Notify Patient]
```

"Confirm & Notify Patient" in demo mode:
- Creates a new entry in `MOCK_APPOINTMENTS` (in state / localStorage)
- Shows toast: "Session 3 booked for Lily Tan on 9 April at 10:00 AM. WhatsApp confirmation sent."
- The appointment now appears in the calendar and on the patient's appointment page

---

## 7. Removed: Cal.com Integration

Cal.com is **removed from the project** as an integration. Reasons:
1. Privacy — requires connecting Dr. Jasmine's personal Google Calendar
2. Overkill — patients only self-book once; Dr. Jasmine controls the rest
3. The existing custom date/time picker in `book/page.tsx` is sufficient for demo
   and, when wired to the internal availability system, for production as well

**What replaces Cal.com:**
- The internal `AvailabilityWindow` + `BlockedSlot` model (section 1.6 above)
- The admin calendar view for Dr. Jasmine to manage her schedule (section 6)
- A native slot calculation: available slots = availability windows minus booked appointments
  minus blocked slots (implemented server-side in production; in demo, computed in-component)

**Zoom:**
- For demo: continue to use the mock `zoomJoinUrl: "https://zoom.us/j/demo"` on appointments
- For production (future): either a single persistent Zoom link stored in env vars, or
  direct Zoom API integration — to be decided at backend phase, not blocking demo

---

## 8. What Does NOT Change

These areas are working correctly and should not be touched:

- Daily readings log flow (`app/p/demo/log/`) — the 7-step form is correct
- Pending/holding screen (`app/p/demo/pending/`) — correct
- Patient home page greeting and task card — correct (only the appointment section changes)
- FAQ page (`app/p/demo/faq/`) — correct
- Admin patient list (`app/admin/patients/`) — correct
- Admin login (`app/admin/login/`) — correct
- Admin dashboard (`app/admin/dashboard/`) — leave as-is for demo; numbers are mock
- All shared components in `components/` — no changes needed
- All `components/ui/` shadcn components — no changes needed
- Design system (fonts, colours, Tailwind config) — no changes

---

## Document Reference

This document updates and supersedes specific sections of:
- `docs/04-data-models.md` — sections on ConsultationNote, PatientGuide, Appointment, Patient
- `docs/05-patient-portal.md` — onboarding step 3, appointment page, home page
- `docs/06-admin-panel.md` — consultation panel, guide builder, schedule page
- `docs/07-integrations.md` — Cal.com section removed; scheduling section replaced
- `docs/09-build-phases.md` — Phase 2 scheduling tasks updated

All other sections of those documents remain valid.
