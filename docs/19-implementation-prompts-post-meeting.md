# 19 — Implementation Prompts: Post-Meeting Changes

## How to Use This Document

Each section below is a self-contained prompt for a separate agent session.
Pass the entire section (including the "PROJECT CONTEXT" block at the top of each task)
to the agent. Do not split a single task across multiple sessions.

**Order matters** — complete tasks in the numbered order listed. Task 1 (data models)
must be done first because all subsequent tasks depend on the updated types.

**Demo-only reminder** — all tasks operate on the demo frontend only. No Supabase, no
API routes, no external services. All state lives in `localStorage` and mock data
constants in `lib/mock-data.ts`.

**Stack:** Next.js 14 App Router, TypeScript (strict), Tailwind CSS, shadcn/ui,
framer-motion, date-fns, sonner (toasts). All at `c:\Users\Stanley\Documents\GitHub\dr-jasmine-patient-portal`.

---

## Task 1 — Update Data Models and Mock Data

### PROJECT CONTEXT

You are working on a Next.js 14 / TypeScript demo app called the Dr. Jasmine Patient Portal.
It is a health portal for a diabetes reversal practice. The app is in demo mode — all state
lives in `localStorage` and in a mock data file (`lib/mock-data.ts`). There is no backend,
no Supabase, no API calls. The design system uses Tailwind CSS with custom tokens (primary
`#2D5E4C`, accent `#B8860B`, bg-app, text-primary, text-secondary, border, etc.).

This task updates the data model file. All subsequent implementation tasks depend on the
types you define here.

### YOUR TASK

Read the following files before making any changes:
1. `lib/mock-data.ts` — the full current type definitions and mock data constants
2. `docs/18-post-meeting-changes.md` — section 1 (Data Model Changes) contains the full spec

Then apply every change in that spec to `lib/mock-data.ts`:

**Types to update:**

1. **`Patient`** — add `sessionsEntitled: number` and `sessionsCompleted: number`

2. **`OnboardingResponse`** — add `symptoms: string[]`

3. **`Appointment`** — add `sessionNumber: number`, `durationMinutes: 30 | 60`,
   `scheduledBy: "patient" | "admin"`

4. **`ConsultationNote`** — remove the `content: string` field. Replace with:
   `privateNotes: string`, `patientNote: string`, `patientNoteSentAt: string | null`

5. **`PatientGuide`** — keep the interface defined but also add a new `GuideVersion`
   interface (do NOT delete `PatientGuide` yet — the guide builder page still references it
   and will be updated in Task 4). Add the full `GuideVersion` interface as described in
   the spec (fields: id, patientId, versionNumber, protocolName, clinicalRationale,
   introducedAtSession, activeFrom, supersededAt, plus all the existing content fields
   from PatientGuide: noList, yesCategories, snacks, replacements, portions,
   cookingMethods, additionalSections, createdAt, updatedAt).

6. **New types** — add `AvailabilityWindow` and `BlockedSlot` as defined in the spec.

**Mock constants to update:**

1. **`MOCK_PATIENT`** — add `sessionsEntitled: 5`, `sessionsCompleted: 2`

2. **`MOCK_ONBOARDING`** — add `symptoms: ["Frequent urination at night", "Fatigue", "Numbness in feet"]`

3. **`MOCK_APPOINTMENT`** — add `sessionNumber: 1`, `durationMinutes: 60`, `scheduledBy: "patient"`

4. **`MOCK_CONSULTATION_NOTES`** — for each note, rename `content` to `privateNotes`,
   add `patientNote: ""` and `patientNoteSentAt: null`

5. **Add `MOCK_GUIDE_VERSIONS: GuideVersion[]`** — create this by converting the existing
   5 entries in `MOCK_CONSULTATION_GUIDES` into `GuideVersion` objects:
   - versionNumber: 1–5
   - protocolName: derive a clean short name from the existing `title` field
     (e.g. "Initial LCHF Plan", "Stricter LCHF", "LCHF + Replacements",
     "LCHF Sustained", "Full LCHF Plan")
   - clinicalRationale: write a realistic one-sentence private clinical note per version
   - introducedAtSession: 1–5 matching the index
   - activeFrom: use the `updatedAt` from the existing entry as the `activeFrom`
   - supersededAt: `null` for the last entry (index 4); use the next entry's `updatedAt`
     for all others
   - All content fields (noList, yesCategories, etc.) copy directly from the existing entry
   - Keep `MOCK_CONSULTATION_GUIDES` in the file — do not delete it yet

6. **Add `MOCK_AVAILABILITY_WINDOWS: AvailabilityWindow[]`** — realistic schedule:
   - Monday: 09:00–12:00 and 14:00–17:00 (two windows)
   - Tuesday: 09:00–12:00
   - Thursday: 10:00–13:00
   - Friday: 09:00–12:00
   - (Wednesday, Saturday, Sunday: no windows)

7. **Add `MOCK_BLOCKED_SLOTS: BlockedSlot[]`** — two example entries:
   - One spanning a specific afternoon next week, privateLabel: "Dental appointment", isAllDay: false
   - One all-day block two weeks from now, privateLabel: "Conference", isAllDay: true
   (Use relative date logic or hardcode reasonable future dates)

**Rules:**
- Use strict TypeScript throughout — no `any`, no non-null assertions (`!`), no `as unknown as T`
- Use double quotes for all strings
- Add JSDoc comments on every interface field
- Export every interface and every mock constant
- Do not change anything unrelated to this task

---

## Task 2 — Onboarding Form: Symptoms + Pre-populated Medical Fields

### PROJECT CONTEXT

You are working on a Next.js 14 / TypeScript demo app called the Dr. Jasmine Patient Portal.
It is a health portal for a diabetes reversal practice. The app is in demo mode — all state
lives in `localStorage` and in mock data constants. There is no backend. The design system
uses Tailwind CSS with custom tokens (primary `#2D5E4C`, accent `#B8860B`, and standard
shadcn/ui tokens). Patients are predominantly elderly with low digital literacy — all UX must
be obvious, all tap targets must be large (min 48px height), and interactions must require
zero guesswork.

Task 1 (data model updates) has already been completed. `lib/mock-data.ts` now includes
`symptoms: string[]` on `OnboardingResponse`.

### YOUR TASK

Read these files before making any changes:
1. `app/p/demo/onboarding/page.tsx` — the full current onboarding form
2. `lib/mock-data.ts` — for the updated `StepData` type context
3. `docs/18-post-meeting-changes.md` — section 2 (Onboarding Form Changes)

Then update `app/p/demo/onboarding/page.tsx`:

**Change 1 — Add `symptoms` to `StepData`**

Add `symptoms: string[]` to the `StepData` type and initialise it as `[]` in the
`useState` default value.

**Change 2 — Add symptoms checklist to Step 3**

At the top of step 3 (before the chief complaint textarea), add a symptoms section:

Label: `"Current Symptoms / 目前症状"` (optional — not required to proceed)

A grid of checkbox-style toggle buttons (same button-style selection pattern used for
gender and occupation in the existing form). Display these options:

- Frequent urination at night (nocturia) / 夜尿频繁
- Excessive thirst / 过度口渴
- Unexplained fatigue / 莫名疲倦
- Blurred vision / 视力模糊
- Numbness or tingling in hands/feet / 手脚麻木或刺痛
- Slow-healing wounds / 伤口愈合缓慢
- Skin darkening (neck/armpits) / 皮肤变黑
- Unexplained weight loss / 莫名体重下降
- Erectile dysfunction *(only render this option when `data.gender === "male"`)*

Each option is a full-width (on mobile) toggle button, min height 56px. Tapping toggles
the string label into/out of `data.symptoms`. Show a brief descriptive helper text above
the grid: `"Tick all that apply. This helps Dr. Jasmine prepare for your consultation."`

Use a 1-column grid on mobile. No "Other" free text for symptoms (keep it simple).

**Change 3 — Pre-populated multi-select for Existing Medical Conditions**

Replace the current `Input + Button "Add"` pattern for conditions with a component that:

1. Shows a label `"Existing Medical Conditions"` with helper text: `"E.g. Hypertension"`
2. Below the label, renders a scrollable chip-grid of common suggestions (3 columns on mobile):
   - Hypertension, Type 2 Diabetes, Prediabetes, High Cholesterol, Fatty Liver, PCOS,
     Thyroid Condition, Heart Disease, Kidney Disease, Gout, Osteoarthritis, Sleep Apnea
3. Tapping a suggestion chip adds it to `data.existingConditions` (chip turns selected/highlighted
   using the primary colour bg — same pattern as the occupation buttons)
4. Tapping a selected chip removes it
5. Below the suggestion grid, keep the existing free-text `Input + Add button` so patients
   can still type conditions not in the list
6. Below that, the existing `MultiAddChips` showing all selected items (whether from chips or
   typed) — each with an × to remove

Suggestion chips: small chips (not full-height buttons), approximately 36–40px height,
rounded-full, border. Selected state: `bg-primary-light text-primary border-primary`.
Unselected: `bg-white text-main border-border`.

**Change 4 — Pre-populated multi-select for Current Medications**

Same pattern as conditions. Suggestion chips:
- Metformin 500mg, Metformin 850mg, Metformin 1000mg, Sitagliptin (Januvia),
  Empagliflozin (Jardiance), Dapagliflozin (Forxiga), Atorvastatin (Lipitor),
  Rosuvastatin (Crestor), Amlodipine, Lisinopril, Losartan, Aspirin 100mg

Keep the free-text `Input + Add` below for unlisted medications.

**Change 5 — Pre-populated multi-select for Known Allergies**

Same pattern. Suggestion chips:
- None, Penicillin, Sulfa drugs, NSAIDs (Ibuprofen), Shellfish, Peanuts, Tree Nuts, Latex, Dairy

Special rule: if the patient taps "None", clear all other allergy selections and set
`data.allergies` to `["None"]`. If they then tap any other chip, remove "None" first.

**Change 6 — Update the Review & Submit step (Step 6)**

In the Health Background review card, add a row to display selected symptoms:
`"Symptoms: [symptom 1], [symptom 2]"` — or `"None reported"` if the array is empty.

**Change 7 — Update `submitForm`**

The `data.symptoms` array is already part of the `StepData` saved to localStorage
(`demo_onboarding_data`). No additional changes needed to the submit function.

**Rules:**
- Do not change the step count (still 6 steps) or the step navigation logic
- Do not change any other steps (1, 2, 4, 5, or 6 other than the symptoms row)
- All new tap targets min 48px height / 36px for small suggestion chips
- No `any`, no `!`, no `as unknown`
- Double quotes for all strings

---

## Task 3 — Consultation Panel Redesign

### PROJECT CONTEXT

You are working on a Next.js 14 / TypeScript demo app called the Dr. Jasmine Patient Portal.
It is a health portal for a diabetes reversal practice. The app is in demo mode — all state
lives in `localStorage` and mock data. There is no backend.

**Critical context about how this panel is used:** Dr. Jasmine runs Zoom in a separate
app or browser tab. This panel is NOT used during the call. It is used:
- **Before the call**: to briefly review the patient's status (readings, conditions, previous notes)
- **After the call**: to write up notes, send a summary to the patient via WhatsApp, and
  schedule the next session

The existing panel has a live session timer and "active session" styling — these must be removed.

Task 1 (data model updates) has already been completed. `ConsultationNote` now has
`privateNotes`, `patientNote`, and `patientNoteSentAt` instead of `content`.

### YOUR TASK

Read these files before making any changes:
1. `app/admin/patients/[id]/consult/page.tsx` — full current consultation panel
2. `lib/mock-data.ts` — for the updated `ConsultationNote` type and mock constants
3. `docs/18-post-meeting-changes.md` — section 4 (Consultation Panel Redesign)

Then fully rewrite `app/admin/patients/[id]/consult/page.tsx`:

**Header bar changes:**

Remove: the red pulsing dot, the live session timer (`elapsedSeconds` state and its
`useEffect` and `startTimeRef`), the "End Session" button, and the "Consultation #5" label.

Replace with:
- Left: back link `"← Lily Tan"` that navigates to `/admin/patients/[id]`
- Centre: session counter badge `"Session 2 of 5"` — computed as
  `${MOCK_PATIENT.sessionsCompleted + 1} of ${MOCK_PATIENT.sessionsEntitled}`
- Right: `"Mark Session Complete"` button (outlined, not red) — on click, shows a sonner
  toast `"Session marked complete."` and the button becomes `"✓ Completed"` (disabled).
  Use a boolean state `sessionMarked` for this.

**Left panel — Patient Brief:**

Keep the existing structure but add one new section between "Medical Info" and
"Recent Readings Table":

**Onboarding Summary section** — collapsed by default:
- Toggle button: `"Chief Complaint & Symptoms ▾"`
- When expanded, shows:
  - Chief complaint text from `MOCK_ONBOARDING.chiefComplaint`
  - Symptoms list from `MOCK_ONBOARDING.symptoms` (the new field) — render as a
    comma-separated line. If empty, show `"None reported"`.
  - A small link `"View full onboarding →"` that navigates to `/admin/patients/[id]`

**Previous Notes section** — update to use `patientNote` instead of `content`:

The notes listed in the left panel should show what Dr. Jasmine previously *sent to the
patient*, not her private notes. This is the "what did I tell them last time" reference.
Update the note rendering to show `note.patientNote` (the patient-facing note).
If `patientNote` is an empty string, show a muted italic `"(No patient note was sent)"`.
The note date header should also show a sent indicator if `patientNoteSentAt` is non-null:
e.g. `"14 Mar 2026 · Sent to patient ✓"`.

Keep the expandable behaviour (click to expand/collapse). Keep the collapsible accordion UI.

**Right panel — Session Notes:**

Replace the single notes area with two clearly separated sections. Use a horizontal rule
and a spacer between them.

**Section A — My Notes (Private):**

```
Label: "MY NOTES"
Sub-label (muted, small): "Only you can see this"

Large textarea:
- Full width, min-height 200px, resize-y allowed
- No toolbar, no formatting buttons
- Placeholder: "Paste or type your session notes here...
  These are private and will never be shown to the patient."
- State: notePrivate (string)
- Word count shown top-right when content is not empty (same as current impl)

[Save Notes] button — on click, saves to MOCK_CONSULTATION_NOTES in state and
localStorage key "demo_consultation_notes" as privateNotes. Shows toast "Notes saved."
```

**Section B — Note for Patient:**

```
Label: "NOTE FOR PATIENT"  
Sub-label (muted, small): "This will be sent to the patient via WhatsApp"

Large textarea:
- Full width, min-height 160px, resize-y allowed
- No toolbar
- Placeholder: "Write the summary you'd like to send...
  E.g. Great session! Continue your current plan. Next steps: ..."
- State: notePatient (string)

[Send to Patient via WhatsApp ↗] button
- Primary styled button
- Disabled when notePatient is empty or when patientNoteSentAt is non-null
- On click: saves patientNote and sets patientNoteSentAt to new Date().toISOString()
  in localStorage. Shows toast: "Note sent to Lily Tan via WhatsApp."
  Button becomes "✓ Sent [time]" and is disabled.
```

**Bottom action row:**

Below both note sections, a row of two outlined buttons:

```
[← Update Guide]          [Schedule Next Session →]
```

- "Update Guide" → `router.push(\`/admin/patients/\${params.id}/guide\`)`
- "Schedule Next Session" → opens a modal (see below)

**Schedule Next Session modal:**

A Dialog (use the existing `components/ui/dialog.tsx`) with:
- Title: `"Schedule Next Session for Lily Tan"`
- A simple date+time picker (reuse the date/time slot UI from `app/p/demo/book/page.tsx`
  for visual consistency — horizontal scrolling date chips + 2-column time grid)
- Available time slots are drawn from `MOCK_AVAILABILITY_WINDOWS` (loaded from
  localStorage key `"admin_availability_windows"` if present, otherwise the mock default).
  Show slots as 30-minute increments within each availability window.
- Greyed-out / disabled slots: any slot that overlaps with an existing appointment in
  `MOCK_APPOINTMENT` (check localStorage `"demo_appointment"` as well)
- Confirm button: `"Confirm & Notify Patient"` — on click, saves a new appointment
  object to localStorage key `"demo_next_appointment"`, shows toast
  `"Session [N] booked. WhatsApp confirmation sent to Lily Tan."`, closes modal.

**State management notes:**
- `notePrivate: string` — state for the private notes textarea
- `notePatient: string` — state for the patient note textarea
- `patientNoteSent: boolean` — derived from `patientNoteSentAt` being non-null
- `sessionMarked: boolean` — for the header button
- `scheduleModalOpen: boolean` — for the schedule modal
- Load `MOCK_CONSULTATION_NOTES` from localStorage `"demo_consultation_notes"` on mount
  (as today); pre-populate `notePrivate` from the most recent note's `privateNotes` if
  it exists.

**Rules:**
- No live timer of any kind
- Both textareas must be large and clean — no toolbars, no formatting buttons
- The "Send to Patient" action must be irreversible within the session (button stays disabled once sent)
- No `any`, no `!`, no `as unknown`
- Double quotes for all strings

---

## Task 4 — Guide System: Versioned Protocol Phases

### PROJECT CONTEXT

You are working on a Next.js 14 / TypeScript demo app called the Dr. Jasmine Patient Portal.
It is a health portal for a diabetes reversal practice. The app is in demo mode — no backend.

Task 1 has been completed. `lib/mock-data.ts` now contains `GuideVersion` interface and
`MOCK_GUIDE_VERSIONS: GuideVersion[]` (5 versions). The old `MOCK_CONSULTATION_GUIDES`
still exists alongside `MOCK_GUIDE_VERSIONS`.

**Core concept:** A patient's guide is not a single edited document. It is a versioned
clinical protocol. Dr. Jasmine either tweaks the current version (minor edits) or advances
the patient to a new phase (creating a new version, archiving the old one). Patients see
all versions as tabs and can browse their progression history.

### YOUR TASK

Read these files before making any changes:
1. `app/p/demo/guide/page.tsx` — current patient-facing guide page
2. `app/admin/patients/[id]/guide/page.tsx` — current admin guide builder
3. `lib/mock-data.ts` — the `GuideVersion` interface and `MOCK_GUIDE_VERSIONS`
4. `docs/18-post-meeting-changes.md` — section 3 (Guide System)

**Part A — Update patient-facing guide page (`app/p/demo/guide/page.tsx`)**

1. Change the data source from `MOCK_CONSULTATION_GUIDES` to `MOCK_GUIDE_VERSIONS`.

2. **Tab labels** — instead of "Consult 1" through "Consult 5", derive a short tab label
   from each version's `protocolName`. If the `protocolName` is longer than 16 characters,
   truncate with `…`. The tabs should still scroll horizontally.

3. **Guide header** — change the guide title to use `activeGuide.protocolName` instead of
   `activeGuide.title`. Remove the "Consult N" section label from above the title.

4. **"Your Journey" section** — add this as the final section before the Export button.
   It is a horizontal scrolling timeline of all guide versions showing the protocol progression.
   Layout:
   ```
   YOUR JOURNEY

   ● Initial LCHF Plan      →    ● Stricter LCHF      →    ● LCHF + IF  ← current
     Jan 2026                      Feb 2026                   Mar 2026
   ```
   Each node shows `protocolName` and the month/year of `activeFrom`. The current version
   (where `supersededAt === null`) is highlighted with the primary colour. Previous versions
   are muted. Tapping a node switches to that version's tab (updates `selectedIndex`).
   Use horizontal scroll (`overflow-x: auto`) — don't wrap to multiple lines.
   `clinicalRationale` is **never** rendered on the patient side.

5. Keep the `localStorage` override logic (reading `demo_patient_guide` for the last tab).

6. Keep the print/export button.

**Part B — Rewrite admin guide builder (`app/admin/patients/[id]/guide/page.tsx`)**

Complete rewrite. The guide builder now manages `GuideVersion[]` with the following UI:

**Page header:**
```
[← Back]   Guide Builder — Lily Tan

[Current: LCHF + IF  ·  Version 3]         [Start New Phase →]    [Save Changes]
```

- "Current: [protocolName] · Version [N]" is a read-only label (no input)
- "Start New Phase →" button opens a Dialog (see below)
- "Save Changes" saves the current version's content edits to localStorage

**Main editing area — all sections must be fully interactive (no more placeholder):**

Section 1 — FOODS TO AVOID (noList)
- Tag chip display (same red chips as current)
- Input + Enter or "Add" button to add new items
- × on each chip to remove

Section 2 — FOODS YOU CAN EAT (yesCategories)
- Each category is a collapsible card showing category name + items + notes
- "+ Add Category" button adds a new empty category
- Inside each category card:
  - Editable category name (Input)
  - Tag chip input for items (same pattern as noList)
  - Notes field (small textarea)
  - "Remove category" button
- Reorder: ↑ / ↓ buttons on each category card (swap with adjacent)

Section 3 — SNACKS (snacks)
- Tag chip input — same as noList but in green style

Section 4 — SMART REPLACEMENTS (replacements)
- List of pairs: `[original input] → [replacement input]  [× remove]`
- "+ Add Replacement" button adds a new empty pair

Section 5 — PORTIONS (portions)
- List of rows: `[fraction input]  [label input]  [× remove]`
- "+ Add Portion" button

Section 6 — COOKING METHODS (cookingMethods)
- Tag chip input

Section 7 — ADDITIONAL SECTIONS (additionalSections)
- Each section is a card with: `[Title input]` and `[Content textarea]` and `[× remove]`
- "+ Add Section" button

**Phase History panel:**

A collapsible section below the editor (toggled by a `"Phase History ▾"` button):
- Lists all guide versions in reverse order (newest first)
- Each row: `"v[N] [protocolName]  ·  [activeFrom month/year]  ·  [Sessions N]"`
- Current version row has a "Current" badge
- Clicking a historical row opens it in a read-only preview mode (a slide-over Sheet
  showing all its content sections as read-only text, no editing)
- Historical versions cannot be edited

**"Start New Phase" Dialog:**

Triggered by "Start New Phase →" button. Uses `components/ui/dialog.tsx`:

```
Title: "Start New Phase for Lily Tan"

Protocol name (shown to patient):
[ _____________________________________________ ]
(required)

Why are you advancing this patient? (private — patient never sees this):
[ Large textarea ________________________________ ]
(optional but encouraged)

[Cancel]   [Create New Phase →]
```

On confirm:
1. All guide content from the current version is deep-copied as the base for the new version
2. A new `GuideVersion` object is created with:
   - `versionNumber = current + 1`
   - `protocolName` from the dialog input
   - `clinicalRationale` from the dialog input
   - `introducedAtSession = MOCK_PATIENT.sessionsCompleted + 1`
   - `activeFrom = new Date().toISOString()`
   - `supersededAt = null`
   - All content fields copied from the current version
3. The previous current version's `supersededAt` is set to `new Date().toISOString()`
4. The new version becomes the active version in state
5. Dialog closes; builder renders the new version in edit mode
6. Toast: `"New phase started: [protocolName]"`

**Saving:**

"Save Changes" saves the current version's content to localStorage key
`"demo_guide_versions"` (as a JSON array of all versions). On load, read from this
key first; fall back to `MOCK_GUIDE_VERSIONS` if not present.

**Rules:**
- `clinicalRationale` must never be rendered on the patient-facing guide page
- The "Start New Phase" flow must be clearly distinct from "Save Changes"
- All section editors must be fully functional (no placeholders)
- No `any`, no `!`, no `as unknown`
- Double quotes for all strings

---

## Task 5 — Patient Scheduling: Session Awareness

### PROJECT CONTEXT

You are working on a Next.js 14 / TypeScript demo app called the Dr. Jasmine Patient Portal.
It is a health portal for a diabetes reversal practice. The app is in demo mode — no backend.

Task 1 has been completed. `MOCK_PATIENT` now has `sessionsCompleted: 2` and
`sessionsEntitled: 5`. `MOCK_APPOINTMENT` now has `sessionNumber: 1`, `durationMinutes: 60`,
`scheduledBy: "patient"`.

**Core concept change:** Only the first consultation is booked by the patient. All follow-up
sessions (2–5) are scheduled by Dr. Jasmine from the admin panel. The patient portal must
reflect this — follow-up patients should never see a "Book a consultation" button because
they don't book their own follow-ups.

### YOUR TASK

Read these files before making any changes:
1. `app/p/demo/home/page.tsx`
2. `app/p/demo/appointment/page.tsx`
3. `app/p/demo/book/page.tsx` (read only — no changes needed)
4. `lib/mock-data.ts` — for updated Patient and Appointment types

**File 1 — Update `app/p/demo/home/page.tsx`**

In the `renderApptCard()` function, in the "no appointment" state:

Currently renders: "No appointment booked." + "Book a consultation →" button

Change to be session-aware:
- Read `sessionsCompleted` from `localStorage.getItem("demo_sessions_completed")`,
  defaulting to `"0"` if not set. Parse as integer.
- If `sessionsCompleted === 0`: keep the existing "Book a consultation →" button and link
  to `/p/demo/book`. This is the first-time patient.
- If `sessionsCompleted >= 1`: replace the button with the message:
  ```
  Dr. Jasmine will schedule your next session during your consultation.
  ```
  Render this as a muted, centred paragraph inside the card — no button, no link.

No other changes to this file.

**File 2 — Update `app/p/demo/appointment/page.tsx`**

Change 1 — **Show correct session duration**

When an appointment exists and was loaded from mock data (the `Appointment` type branch),
use `apptInfo.durationMinutes` for the duration label.

When loaded from localStorage as a plain `{ date: string; time: string }` object (the demo
booking flow), default to `30` minutes unless `sessionNumber === 1` (not stored in this
shape — just default to 30 min for these as they are follow-ups in demo).

Replace the hardcoded `"Duration: 30 minutes"` line with a dynamic value:
`"Duration: [N] minutes"`.

Also fix the `addMinutes` call for the end time display — it currently always adds 30.
Change it to use the actual duration variable.

Change 2 — **Remove the "Book a new appointment" button**

Delete the `<Link href="/p/demo/book">` + "Book a new appointment" Button entirely.
This patient-initiated follow-up booking action does not exist in Dr. Jasmine's practice.

Change 3 — **Session-aware empty state**

When no appointment is found:
- Read `sessionsCompleted` from localStorage, defaulting to `"0"`. Parse as integer.
- If `sessionsCompleted === 0`: keep the existing "Book a consultation" button + link
  to `/p/demo/book`
- If `sessionsCompleted >= 1`: replace the button and description with:
  ```
  [Calendar icon]
  Your next session will be scheduled by Dr. Jasmine
  during your consultation. No action needed on your end.
  
  Need to get in touch? [WhatsApp Dr. Jasmine's clinic →]
  ```
  The WhatsApp link opens `https://wa.me/60123456789` in a new tab.

Change 4 — **Keep the "Reschedule" button**

The "Reschedule" button (which opens WhatsApp) is correct behaviour — keep it as-is.
Patients can still request a reschedule, they just can't self-book new appointments.

**Rules:**
- Do not modify `app/p/demo/book/page.tsx`
- The first-consultation booking flow must remain fully functional
- No `any`, no `!`, no `as unknown`
- Double quotes for all strings

---

## Task 6 — Admin Calendar View

### PROJECT CONTEXT

You are working on a Next.js 14 / TypeScript demo app called the Dr. Jasmine Patient Portal.
It is a health portal for a diabetes reversal practice. The app is in demo mode — no backend.

Task 1 has been completed. `lib/mock-data.ts` now exports `MOCK_AVAILABILITY_WINDOWS:
AvailabilityWindow[]` and `MOCK_BLOCKED_SLOTS: BlockedSlot[]`.

This task rebuilds the admin schedule page into a fully functional calendar with
availability management, blocked time, and appointment visibility.

**Privacy rule:** Blocked slot `privateLabel` values must never be shown in the calendar
grid — only in the edit popover visible to the authenticated admin user. In the calendar
grid itself, blocked slots always show as `"Unavailable"` with no further detail.

### YOUR TASK

Read these files before making any changes:
1. `app/admin/schedule/page.tsx` — full current schedule page
2. `lib/mock-data.ts` — `AvailabilityWindow`, `BlockedSlot`, `MOCK_AVAILABILITY_WINDOWS`,
   `MOCK_BLOCKED_SLOTS`, `MOCK_PATIENT`, `MOCK_APPOINTMENT`
3. `components/admin/AdminLayout.tsx` — to understand the layout wrapper
4. `components/ui/sheet.tsx` — for the availability settings side panel
5. `components/ui/dialog.tsx` — for the block-time modal
6. `docs/18-post-meeting-changes.md` — section 6 (Admin Calendar View)

**Step 0 — Install FullCalendar**

At the start of your response, note that the following packages must be installed before
the code will run:
```
npm install @fullcalendar/react @fullcalendar/core @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction
```
Include this install command in a comment at the top of the file.

**Full rewrite of `app/admin/schedule/page.tsx`**

**State:**

```typescript
type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  display?: string;  // "background" for availability windows
  extendedProps: {
    type: "appointment" | "blocked" | "availability";
    privateLabel?: string;
    patientId?: string;
    sessionNumber?: number;
  };
};
```

- `availabilityWindows: AvailabilityWindow[]` — loaded from localStorage
  `"admin_availability_windows"`, falling back to `MOCK_AVAILABILITY_WINDOWS`
- `blockedSlots: BlockedSlot[]` — loaded from localStorage `"admin_blocked_slots"`,
  falling back to `MOCK_BLOCKED_SLOTS`
- `appointments` — constructed from `MOCK_APPOINTMENT` (and `localStorage "demo_next_appointment"`
  if it exists)
- `blockModalOpen: boolean`
- `blockModalSelection: { start: string; end: string } | null` — from calendar drag selection
- `blockModalLabel: string`
- `blockModalAllDay: boolean`
- `selectedEvent: CalendarEvent | null` — for the click popover
- `popoverOpen: boolean`
- `availabilitySheetOpen: boolean` — for the settings panel
- `editingWindows: AvailabilityWindow[]` — working copy while the sheet is open

**Calendar setup:**

Use `FullCalendar` component with:
```
plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
initialView="timeGridWeek"
headerToolbar={{
  left: "prev,next today",
  center: "title",
  right: "timeGridDay,timeGridWeek,dayGridMonth"
}}
slotMinTime="07:00:00"
slotMaxTime="19:00:00"
firstDay={1}
selectable={true}
selectMirror={true}
eventClick={handleEventClick}
select={handleSelect}
events={computedEvents}
height="auto"
```

**Computing events from state:**

`computedEvents` is a memoised array combining:

1. **Availability background events** — for each `AvailabilityWindow`, generate a
   FullCalendar recurring background event:
   ```
   {
     daysOfWeek: [window.dayOfWeek],
     startTime: window.startTime,
     endTime: window.endTime,
     display: "background",
     backgroundColor: "rgba(45, 94, 76, 0.07)",
     extendedProps: { type: "availability" }
   }
   ```

2. **Blocked slot events** — one event per `BlockedSlot`:
   ```
   {
     id: slot.id,
     title: "Unavailable",   // never show privateLabel here
     start: slot.startsAt,
     end: slot.endsAt,
     allDay: slot.isAllDay,
     backgroundColor: "#D1C8C0",
     borderColor: "#B5ADA5",
     textColor: "#5C5650",
     extendedProps: { type: "blocked", privateLabel: slot.privateLabel }
   }
   ```

3. **Appointment events** — one event per appointment:
   ```
   {
     id: appt.id,
     title: `${patientName} — Session ${appt.sessionNumber}`,
     start: appt.startsAt,
     end: appt.endsAt,
     backgroundColor: "#2D5E4C",
     borderColor: "#2D5E4C",
     textColor: "#FFFFFF",
     extendedProps: { type: "appointment", patientId: appt.patientId, sessionNumber: appt.sessionNumber }
   }
   ```

**`handleSelect` (drag to create block):**

Sets `blockModalSelection` to the selected start/end, sets `blockModalOpen: true`.

**`handleEventClick`:**

Sets `selectedEvent` to the clicked event, sets `popoverOpen: true`.

**Block time modal (Dialog):**

Renders when `blockModalOpen === true`:
- Title: "Block This Time"
- Shows the formatted date/time range from `blockModalSelection`
- Label input: "Label (private — only you see this)" → `blockModalLabel`
- All day checkbox → `blockModalAllDay`
- Cancel and "Block This Time" buttons
- On confirm: creates a new `BlockedSlot`, adds to `blockedSlots` state, saves to
  localStorage `"admin_blocked_slots"`, closes modal, resets selection state

**Event click popover:**

When an appointment event is clicked, show a Dialog or small panel:
```
[Patient Name] — Session [N]
[Date and time]
Duration: [N] min

[Open Patient Workspace →]
```
"Open Patient Workspace" → `router.push(\`/admin/patients/\${extendedProps.patientId}/consult\`)`

When a blocked slot is clicked, show a Dialog:
```
Blocked Time
[Date and time]
Label: [privateLabel displayed here only]

[Edit Label]   [Remove Block]   [Close]
```
"Remove Block" removes it from state and localStorage.
"Edit Label" makes the label inline-editable.

**Availability settings Sheet:**

Opens when "Manage Availability" button (top-right of page) is clicked.
Sheet title: "Consultation Hours"

Inside, render a weekly grid for Mon–Sun. For each day:
- A toggle switch or checkbox: enabled/disabled
- If enabled: one or more time window rows `[Start ▾] to [End ▾]`
- `[+ Add window]` to add a second window per day (e.g. morning + afternoon)
- `[×]` to remove a window

Start/End dropdowns offer 30-minute increments from 07:00 to 19:00.

"Save Availability" button at the bottom:
- Updates `availabilityWindows` state with `editingWindows`
- Saves to localStorage `"admin_availability_windows"`
- Closes the sheet
- Toast: "Availability updated."

**Page layout:**

```
[AdminLayout wrapper]
  Header row: "Schedule"  |  [Manage Availability]

  [FullCalendar component — fills remaining space]
```

The FullCalendar component should be given a container with `min-h-[600px]` and a white
background card with rounded corners and border, consistent with other admin pages.

Apply FullCalendar custom CSS overrides in a `<style jsx global>` block (or via a className
on the container) to match the app's design:
- Primary colour for today highlight: `#2D5E4C`
- Button colours: use the app's primary colour
- Font: inherit from parent

**Rules:**
- `privateLabel` values must only appear in the event click popover for blocked slots,
  never in the calendar grid event title
- All blocked slots in the grid show title `"Unavailable"` only
- The availability windows must use FullCalendar `display: "background"` — they are not
  draggable and not clickable
- No `any`, no `!`, no `as unknown`
- Double quotes for all strings
- The page must be wrapped in `AdminLayout` and check for `localStorage("admin_auth")` on mount
