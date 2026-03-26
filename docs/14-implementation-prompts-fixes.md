# 14 — Implementation Prompts: UX & Bug Fixes

These are **6 scoped prompts** to be executed sequentially by an AI coding agent.
Each prompt is self-contained: it includes all necessary context so the agent does
not need prior conversation history.

Run them in order — later prompts assume earlier ones are complete.

---

## Project Context (read before every prompt)

**What this is:** A Next.js 14 (App Router) patient portal for Dr. Jasmine's
diabetes reversal clinic (Metanova Health). The app has two sides:

- **Patient portal** (`/p/demo/...`) — mobile-first, targets elderly low-tech patients
- **Admin panel** (`/admin/...`) — desktop-first, used by Dr. Jasmine

**Tech stack:** Next.js 14, React 18, TypeScript (strict), Tailwind CSS,
shadcn/ui primitives, Lucide React icons, Sonner toasts, date-fns.

**Key files:**
```
app/
  p/demo/
    home/page.tsx          ← patient home dashboard
    log/page.tsx           ← log readings (multi-step)
    log/success/page.tsx   ← success screen after logging
    onboarding/page.tsx    ← 6-step intake form
    book/page.tsx          ← appointment booking
    pending/page.tsx       ← post-booking waiting screen
    appointment/page.tsx   ← appointment management
    faq/page.tsx           ← help / FAQ
    guide/page.tsx         ← diet guide (read-only patient view)
  admin/
    login/page.tsx
    dashboard/page.tsx
    patients/page.tsx
    patients/[id]/page.tsx
    patients/[id]/consult/page.tsx
    patients/[id]/guide/page.tsx
    schedule/page.tsx
components/
  patient/
    NumberStepper.tsx      ← +/- numeric input for readings
    BottomNav.tsx
    PatientPageLayout.tsx
    StepProgress.tsx
  admin/
    AdminLayout.tsx
  ui/                      ← shadcn primitives
lib/
  mock-data.ts
  utils.ts
```

**Design system (key tokens):**
```
Primary teal:   #1A7A6D
Gold accent:    #D4940A
Background:     #FAF8F5 (warm ivory)
Surface:        #FFFFFF
Text primary:   #1C1917
Text secondary: #78716C
Font body:      Plus Jakarta Sans
Font display:   DM Serif Display (brand moments only)
```

**Rules you MUST follow:**
1. Full TypeScript — no `any`, no `!` non-null assertions, no `as unknown as T`
2. Double quotes for strings; template literals instead of `+` concatenation
3. Do not add comments that just narrate what the code does
4. Do not add placeholder comments — implement the full solution
5. All patient-facing text must be ≥ 14 px (nav labels excepted)
6. Do not change any file not listed in the task
7. Run `npm run lint` mentally — do not introduce ESLint errors

---

## PROMPT-1 — Critical Bug Fixes

**Scope:** 3 bugs in 2 files. Pure logic / rendering fixes. No visual redesign.

### Task 1A — Fix NumberStepper blank initial display (BUG-01)

**File:** `components/patient/NumberStepper.tsx`

**Problem:**
The component initialises `inputValue` as `""` whenever `value === 0`:
```ts
const [inputValue, setInputValue] = useState(
  value === 0 ? "" : value.toString()
);
```
This causes the display to be blank when the reading step first loads (all readings
start at `value = 0`). The `−` button is also disabled because `value <= min === 0`.
When the user taps `+`, the `handlePlus` function detects `value === 0` and jumps
to `defaultValue` instead of incrementing — causing a confusing jump.

**Fix:**

1. Change `useState` initialisation: when `value === 0` and `defaultValue` is
   defined and non-zero, use `defaultValue.toString()` as the initial display.
   Otherwise keep `""` so genuinely-zero fields (e.g., a reading that has been
   explicitly set to 0) still work.

2. The parent (`log/page.tsx`) always starts readings at `value = 0` and always
   provides a non-zero `defaultValue`. So on mount, call `onChange(defaultValue)`
   from a `useEffect` that runs once if `value === 0 && defaultValue !== undefined
   && defaultValue !== 0`. This syncs the parent state with the displayed value.

3. Remove the `value === 0 && defaultValue` early-return branches from
   `handleMinus` and `handlePlus` — they are no longer needed once the value is
   initialised correctly.

4. Update the `useEffect` that syncs `inputValue` from `value` prop to use the
   same rule: show `defaultValue.toString()` when `value === 0 && defaultValue`.

After this fix: the stepper loads showing the default value (e.g., "5.0") with
both `+` and `−` enabled (assuming min < defaultValue), and incrementing/
decrementing works from that starting point.

---

### Task 1B — Fix log success page: redirect is too fast (BUG-02)

**File:** `app/p/demo/log/success/page.tsx`

**Problem:**
The `setInterval` starts immediately on mount. On fast devices the redirect fires
before the patient has time to see the "Done!" screen or the confetti animation.

**Fix:**

1. Change `useState(3)` to `useState(4)` — show a "4…3…2…1" countdown.

2. Wrap the `setInterval` creation in a `setTimeout` of 600 ms inside the
   `useEffect`. This ensures the component renders and the entrance animation
   plays before the countdown begins.
   ```ts
   useEffect(() => {
     const delay = setTimeout(() => {
       const int = setInterval(() => {
         setCountdown((prev) => {
           if (prev <= 1) {
             clearInterval(int);
             router.replace("/p/demo/home");
             return 0;
           }
           return prev - 1;
         });
       }, 1000);
       return () => clearInterval(int);
     }, 600);
     return () => clearTimeout(delay);
   }, [router]);
   ```

3. The countdown display text currently reads "Returning home in {countdown}…".
   Update it to "Returning home in {countdown}s" (add the "s" unit suffix) so it
   is clearer.

---

### Task 1C — Fix onboarding validation error persists (BUG-03)

**File:** `app/p/demo/onboarding/page.tsx`

**Problem:**
After the user clicks Next and sees "Please fill out your name, age, and sex.",
the error remains even after all required fields are correctly filled. The error
only clears on the next successful Next click.

**Fix:**

Locate the state variable that holds the step-1 error string (likely something like
`const [error, setError] = useState("")`). Add a `useEffect` that clears the error
whenever the relevant fields become valid:

```ts
useEffect(() => {
  if (name.trim() && age && sex) {
    setError("");
  }
}, [name, age, sex]);
```

Place this `useEffect` after the existing state declarations for step 1.
Do not change the validation logic on the Next button — only add this clearing effect.

---

### Task 1D — Fix greeting ARIA spurious space (BUG-06)

**File:** `app/p/demo/home/page.tsx`

**Problem:**
The greeting heading renders as `"Good morning , Lily 👋"` (space before comma).

**Fix:**
Locate the heading and remove the extra space. The string should be:
```tsx
`Good ${timeOfDay}, ${firstName} 👋`
```
not:
```tsx
`Good ${timeOfDay} , ${firstName} 👋`
```

---

## PROMPT-2 — Patient Home Page Improvements

**Scope:** `app/p/demo/home/page.tsx` only. Three independent improvements.

Read the full current file before making any changes.

### Task 2A — Task card shows "Done" state after readings are logged

**Context:**
After a patient submits the log flow, `app/p/demo/log/page.tsx` writes the key
`demo_reading_today` to `localStorage` with a date string value. The home page
currently ignores this key — the task card always reads "Have you logged your
readings today?" even after logging.

**Fix:**

1. On mount (inside a `useEffect` with `[]` dependency), read
   `localStorage.getItem("demo_reading_today")`. Compare it to today's date
   (`new Date().toDateString()`). If they match, set a boolean state
   `hasLoggedToday = true`.

2. When `hasLoggedToday` is `true`, replace the task card content:
   - Remove the gold "Log my readings →" button.
   - Change the card heading to "Readings logged ✓" (use a teal check icon from
     Lucide, `CheckCircle2`).
   - Change the subtitle to "Great work! Dr. Jasmine will review them shortly."
   - Keep the card's `TODAY'S TASK` label and left teal border — same card layout.
   - The card background can stay as-is or shift to a subtle green tint
     (`bg-[#F0FAF8]` / `linear-gradient(135deg, #FFFFFF 0%, #F0FAF8 100%)`).

3. When `hasLoggedToday` is `false`, show the existing gold "Log my readings →"
   button as before.

---

### Task 2B — Hide "Book a new appointment" link when appointment exists

**Context:**
`app/p/demo/home/page.tsx` reads `localStorage.getItem("demo_appointment")` to
show the upcoming appointment card. But it still renders a "Book a consultation →"
link somewhere on the page when an appointment is already booked.

**Fix:**
Find the "Book a consultation →" link/button. Wrap it in a conditional: only
render it when `appointment === null` (i.e., no appointment is booked). When an
appointment exists, this element should not appear at all.

---

### Task 2C — Apply DM Serif Display to the greeting name

**Context:**
The design spec requires the patient name in the greeting to use `--font-display`
(DM Serif Display) for the brand serif moment. Currently the entire `h1` uses Plus
Jakarta Sans.

**Fix:**
Split the greeting heading into two `<span>` elements inside the same `<h1>`:
- "Good evening, " — Plus Jakarta Sans (normal body font, keep existing classes)
- The patient first name + emoji — DM Serif Display

```tsx
<h1 className="text-[32px] font-extrabold text-[#1C1917] leading-tight tracking-tight">
  Good {timeOfDay},{" "}
  <span style={{ fontFamily: "var(--font-display), serif" }}>
    {firstName}
  </span>{" "}
  👋
</h1>
```

The `--font-display` CSS variable is already defined in `app/layout.tsx` via the
Google Fonts import. Do not change the layout file.

---

## PROMPT-3 — Patient Log Flow UX

**Scope:** `app/p/demo/log/page.tsx` and `app/p/demo/log/success/page.tsx`.

Read both files in full before starting.

### Task 3A — Show "not yet available" state for photo logging

**Context:**
The log flow step 0 shows two mode cards: "Take a photo" and "Type manually".
Tapping "Take a photo" currently proceeds as if it works but leads nowhere useful.

**Fix:**

1. Make the "Take a photo" card display a `title` attribute of
   `"Coming soon — not available yet"` so hover reveals what it is.

2. Add a small badge `<span>` inside the card, below the subtitle, that reads
   "Coming soon" — styled as a warm ivory pill:
   ```tsx
   <span className="mt-1 text-xs font-semibold text-[#A8A29E] bg-[#F3EDE6] px-2 py-0.5 rounded-full">
     Coming soon
   </span>
   ```

3. When the user taps "Take a photo", instead of proceeding to the next step,
   show a Sonner toast:
   ```ts
   import { toast } from "sonner";
   toast("Photo scan coming soon — please use manual entry for now.");
   ```
   The step does not advance. The user stays on the mode selection screen.

4. Apply `opacity-60 cursor-not-allowed` to the "Take a photo" card button so it
   visually reads as unavailable.

---

### Task 3B — Add step name labels to the log flow progress

**Context:**
The progress bar at the top of the manual log flow shows dots (`StepProgress`
component) and a counter "2/8" but no step name. Screen-reader users and
first-time patients have no idea what the next step is.

**Fix:**

1. In `log/page.tsx`, define a `STEP_LABELS` array for the 7 reading steps plus
   the date step. Example:
   ```ts
   const STEP_LABELS = [
     "Select Date",
     "Fasting Blood Sugar",
     "Post-Dinner Sugar",
     "Blood Pressure",
     "Weight",
     "Waist",
     "Post-Lunch Sugar",
     "Review",
   ];
   ```
   Adjust to match the actual steps in the file.

2. Below the `StepProgress` component and the "X/8" counter, add a single line:
   ```tsx
   <p className="text-sm font-semibold text-[#1A7A6D] text-center mt-1">
     {STEP_LABELS[currentStep]}
   </p>
   ```
   where `currentStep` is the existing step index state variable.

3. Add `aria-label={`Step ${currentStep + 1} of ${STEP_LABELS.length}: ${STEP_LABELS[currentStep]}`}`
   to the container `div` that wraps the progress dots and counter.

---

### Task 3C — Increase Zoom join note text size to meet 14 px minimum

**Context:**
Multiple pages show the note "(Available 15 min before appointment)" or
"(The Join button activates 15 minutes before your call)" as very small text
(appears to be ≤ 12 px, below the 14 px design-spec minimum for patient-facing copy).

**Files to update:** `app/p/demo/home/page.tsx`, `app/p/demo/appointment/page.tsx`,
`app/p/demo/pending/page.tsx`.

**Fix:**
Find every instance of these Zoom-timing notes. Change their Tailwind size class
from `text-xs` (12 px) to `text-sm` (14 px). Do not change the colour, weight,
or position — only the size class.

---

## PROMPT-4 — Appointment & Pending Page Polish

**Scope:** `app/p/demo/pending/page.tsx` and `app/p/demo/appointment/page.tsx`.

Read both files before starting.

### Task 4A — Replace "TBD" end time with calculated end time (BUG-05)

**Context:**
The time displayed in the pending and appointment pages reads "10:00 AM – TBD".
The appointment object stored in `localStorage` as `demo_appointment` has a `time`
field (string, e.g., `"10:00 AM"`) but no end time. All consultations are 30 minutes.

**Fix:**

1. Write a pure helper function (inside the file, not exported) that takes a time
   string like `"10:00 AM"` and returns the end time string 30 minutes later:
   ```ts
   function addMinutes(timeStr: string, minutes: number): string {
     const [timePart, period] = timeStr.split(" ");
     const [hourStr, minStr] = timePart.split(":");
     let hour = parseInt(hourStr, 10);
     let min = parseInt(minStr, 10);
     if (period === "PM" && hour !== 12) hour += 12;
     if (period === "AM" && hour === 12) hour = 0;
     const totalMin = hour * 60 + min + minutes;
     const newHour = Math.floor(totalMin / 60) % 24;
     const newMin = totalMin % 60;
     const newPeriod = newHour < 12 ? "AM" : "PM";
     const displayHour = newHour % 12 === 0 ? 12 : newHour % 12;
     return `${displayHour}:${String(newMin).padStart(2, "0")} ${newPeriod}`;
   }
   ```

2. Replace every `"TBD"` or `"– TBD"` occurrence with
   `– ${addMinutes(appointment.time, 30)}`.

3. Also update the static "Duration: 30 minutes" label if present — keep it as-is,
   just make sure the end time calculation is also shown.

---

### Task 4B — Standardise disabled "Join on Zoom" button style across pages

**Context:**
The disabled Zoom join button has three different visual styles across three pages:
- `/p/demo/pending` — full-width gold button, muted appearance
- `/p/demo/home` — teal outline, greyed out
- `/p/demo/appointment` — full-width gold button, muted appearance

All three should use the same style: a full-width, gold-gradient button with
50% opacity and `cursor-not-allowed` when disabled.

**Files:** `app/p/demo/home/page.tsx`, `app/p/demo/pending/page.tsx`,
`app/p/demo/appointment/page.tsx`.

**Fix:**
Find the "Join on Zoom" button in each file. Apply a consistent className to
all three:
```tsx
<button
  disabled
  className="w-full h-14 rounded-[14px] text-white text-lg font-semibold
             bg-gradient-to-b from-[#E0A30B] via-[#D4940A] to-[#B07D08]
             opacity-50 cursor-not-allowed select-none"
>
  Join on Zoom
</button>
```
(Adjust to match the existing button component pattern in each file — e.g. if using
the `Button` primitive, use `variant="gold"` or equivalent and add `disabled`.)

---

### Task 4C — Hide "Book a new appointment" when appointment already exists

**File:** `app/p/demo/appointment/page.tsx`

**Context:**
The appointment page shows both the upcoming appointment card AND a "Book a new
appointment" teal button below an "OR" divider. This is confusing when a patient
already has an active appointment.

**Fix:**
Wrap the entire "OR / Book a new appointment / Reschedule" section in a conditional:
```tsx
{!appointment && (
  <div>
    {/* OR divider + Book a new appointment button */}
  </div>
)}
```
When `appointment` is null (no booking found in localStorage), show the booking
and reschedule options as before.
When `appointment` exists, only show the "Reschedule this appointment" button
(not "Book a new appointment"), with the "OR" divider removed.

---

## PROMPT-5 — Admin Feedback Layer

**Scope:** Admin pages and schedule. Three independent improvements.

Read each file in full before editing it.

### Task 5A — Add Sonner success toasts to admin saves

**Files:**
- `app/admin/patients/[id]/consult/page.tsx` ("Save Note" button)
- `app/admin/patients/[id]/guide/page.tsx` ("Save & Publish" button)

**Context:**
Both save buttons complete silently. The `sonner` package is installed and the
`<Toaster />` is already mounted in `app/layout.tsx`.

**Fix:**

In each file, import `toast` from `"sonner"` if not already imported.

For `consult/page.tsx`, in the save-note handler:
```ts
toast.success("Note saved successfully.");
```

For `guide/page.tsx`, in the save-and-publish handler:
```ts
toast.success("Guide published to Lily Tan's portal.");
```
(Replace "Lily Tan" with the actual patient name from state/props.)

If the handler is async, place the toast in the `.then()` or after `await`.
If the save is synchronous (localStorage write), place the toast immediately after.

---

### Task 5B — Fix blank button on scheduled appointment cards (BUG-04)

**File:** `app/admin/schedule/page.tsx`

**Context:**
For appointments with status "Scheduled", a second button appears next to
"View Profile" but renders with no visible content. It is likely a conditional
"Start Consultation" or "Join Zoom" button that renders an empty element.

**Fix:**

1. Read the file and locate the JSX for appointment cards.
2. Find the conditional button that renders for "Scheduled" status.
3. Ensure it renders a proper label: "Start Consultation" (linking to
   `/admin/patients/${appointment.patientId}/consult`).
4. Style it as a teal outline button consistent with the admin design:
   ```tsx
   <Link
     href={`/admin/patients/${appt.patientId}/consult`}
     className="text-sm font-semibold text-[#1A7A6D] border border-[#1A7A6D]
                rounded-lg px-3 py-1.5 hover:bg-[#E6F4F1] transition-colors"
   >
     Start Consultation
   </Link>
   ```
5. Do not render this button for "Cancelled" or "Completed" appointments.

---

### Task 5C — Improve admin dashboard stat card visual priority

**File:** `app/admin/dashboard/page.tsx`

**Context:**
The four stat cards (Total Active Patients, Readings to Review, Meetings Today,
Guide Adherence) are visually identical. "Readings to Review" is the most
actionable metric — it signals pending work. It should stand out.

**Fix:**

1. Give "Readings to Review" a subtle warm-tinted background when its value is
   greater than 0:
   ```tsx
   className={`... ${reviewCount > 0 ? "bg-[#FBF3E0] border-[#D4940A]/20" : ""}`}
   ```
   where `reviewCount` is the variable holding the reading count.

2. Add a larger, bolder number display to "Readings to Review" by increasing the
   number's font size from whatever it currently is to `text-4xl font-extrabold`.
   All other cards keep their existing number size.

3. When `reviewCount > 0`, add a small animated dot badge next to the card title:
   ```tsx
   <span className="inline-block w-2 h-2 rounded-full bg-[#D4940A] animate-pulse ml-1" />
   ```

Do not change the layout, grid, or other three cards.

---

## PROMPT-6 — Accessibility Pass

**Scope:** Accessibility improvements across 5 files. These are additive changes only
— do not alter existing visual design.

Read each file in full before editing it.

### Task 6A — Add "Skip to main content" link to patient layout

**File:** `components/patient/PatientPageLayout.tsx`

**Context:**
The design spec requires a visually-hidden skip link at the very top of every
patient page. It becomes visible on keyboard focus so keyboard-only users can
skip the bottom nav.

**Fix:**

1. Add `id="main-content"` to the main content `<div>` or `<main>` inside
   `PatientPageLayout`.

2. At the very top of the returned JSX (before any other elements), add:
   ```tsx
   <a
     href="#main-content"
     className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2
                focus:z-50 focus:px-4 focus:py-2 focus:bg-[#1A7A6D] focus:text-white
                focus:rounded-lg focus:text-sm focus:font-semibold"
   >
     Skip to main content
   </a>
   ```

---

### Task 6B — Add "Skip to main content" link to admin layout

**File:** `components/admin/AdminLayout.tsx`

Same fix as Task 6A but for the admin panel. The `id="main-content"` should go
on the `<main>` content area (not the sidebar). The skip link styles should use
the same teal brand colour.

---

### Task 6C — Add accessible step count to StepProgress

**File:** `components/patient/StepProgress.tsx`

**Context:**
`StepProgress` renders dot indicators with no accessible label. Screen readers
hear nothing useful.

**Fix:**

1. The component receives `currentStep` and `totalSteps` props (or equivalent —
   read the actual prop names from the file).

2. Add an `aria-label` to the outer container `<div>`:
   ```tsx
   aria-label={`Step ${currentStep + 1} of ${totalSteps}`}
   ```

3. Each dot `<div>` should get `aria-hidden="true"` since they are decorative.

4. Add a visually-hidden text element inside the container:
   ```tsx
   <span className="sr-only">
     Step {currentStep + 1} of {totalSteps}
   </span>
   ```

---

### Task 6D — Add password show/hide toggle to admin login

**File:** `app/admin/login/page.tsx`

**Context:**
The password `<Input>` uses `type="password"` with no way to reveal the typed
value. This is a barrier for elderly users who frequently mistype passwords.

**Fix:**

1. Add `const [showPassword, setShowPassword] = useState(false)` to the component.

2. Change the password `<Input>` to use `type={showPassword ? "text" : "password"}`.

3. Add an icon button inside/adjacent to the input to toggle:
   ```tsx
   <div className="relative">
     <Input
       type={showPassword ? "text" : "password"}
       ...
     />
     <button
       type="button"
       onClick={() => setShowPassword((prev) => !prev)}
       className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716C]
                  hover:text-[#1C1917] transition-colors"
       aria-label={showPassword ? "Hide password" : "Show password"}
     >
       {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
     </button>
   </div>
   ```

4. Import `Eye` and `EyeOff` from `"lucide-react"`.

5. Adjust the `<Input>` component's `paddingRight` (`pr-10`) to avoid the text
   overlapping the icon button.

---

### Task 6E — Associate all form labels with inputs in onboarding

**File:** `app/p/demo/onboarding/page.tsx`

**Context:**
The design spec requires all labels to use `htmlFor`/`id` pairs. Some onboarding
inputs may be using `<label>` without a matching `id` on the `<input>`.

**Fix:**

1. Audit every `<label>` element in `onboarding/page.tsx`.
2. For each label, ensure:
   - The `<label>` has `htmlFor="some-unique-id"`.
   - The paired `<input>` or `<textarea>` has `id="some-unique-id"`.
3. Use descriptive IDs: `"onboarding-name"`, `"onboarding-age"`,
   `"onboarding-ethnicity"`, `"onboarding-complaint"`,
   `"onboarding-conditions"`, `"onboarding-medications"`,
   `"onboarding-allergies"`, `"onboarding-family-history"`,
   `"onboarding-extra-notes"`, `"onboarding-emergency-name"`,
   `"onboarding-emergency-phone"`.
4. The Sex selection buttons are `<button>` elements (not inputs), so they do
   not need `htmlFor`. They should have `aria-pressed={sex === "male"}` etc. to
   communicate selected state.
5. Do not change any styling — this is a pure accessibility attribute pass.

---

## Execution Notes

- Run `npm run lint` after each prompt to catch any TypeScript or ESLint errors
  before moving to the next prompt.
- Do not run `npm run build` between prompts — it is slow; `lint` is sufficient.
- Each prompt is designed to be completable in a single agent session without
  exceeding a reasonable context window. If a file is unexpectedly large, focus
  on the specific functions mentioned — do not rewrite the entire file.
- After all 6 prompts are complete, do a final manual walkthrough of:
  1. `/p/demo/onboarding` — confirm form labels and error clearing
  2. `/p/demo/log` — confirm NumberStepper shows value on load
  3. `/p/demo/log/success` — confirm "Done!" screen is visible for ≥ 3 seconds
  4. `/p/demo/home` — confirm task card updates, greeting serif, appointment logic
  5. `/admin/schedule` — confirm "Start Consultation" button renders
  6. `/admin/patients/demo/guide` — confirm toast fires on Save & Publish
