# 11 — Implementation Prompts (Legacy — Mostly Completed)

> **STATUS: LEGACY** — The 6 prompts in this document covered functional
> fixes and UX improvements. Most have been **completed** as of March 2026.
> For the **design overhaul** prompts (the current active work), see
> [12-design-implementation-prompts.md](./12-design-implementation-prompts.md).

## How to Use This Document

This document contains **6 self-contained prompts** for an AI coding agent.
Each prompt can be copied and pasted as a standalone task. They are ordered
by priority — complete them in sequence.

**Agent model:** Gemini 2.5 Pro
**Estimated scope per prompt:** 5–12 files modified, focused on one coherent
area of the codebase.

### Completion Status

| # | Prompt | Status |
|---|--------|--------|
| 1 | Admin Bug Fixes & Polish | **DONE** — Schedule page created, table rows clickable, toasts replace alert() |
| 2 | Patient Navigation & Layout | **DONE** — Bottom nav on all pages, 5 tabs, escape hatches |
| 3 | Accessibility & Bilingual Labels | **DONE** — Chinese labels, ARIA attrs, focus rings, touch targets |
| 4 | Form UX, Loading & Error Handling | **DONE** — Autosave, NumberStepper defaults, skeletons, catch blocks |
| 5 | Diabetes Reversal Theme | **DONE** — LCHF references updated, diet type selector added |
| 6 | Visual Polish & Wow Factor | **PARTIAL** — Some animations added; full design overhaul is in doc 12 |

### Coding Standards (include these in your system prompt or rules)

- TypeScript strict mode. No `any` type. No non-null assertions (`!`).
- Use double quotes (`"`) for all strings.
- Use string templates or `.join()` instead of string concatenation.
- Include JSDoc headers on all exported functions and components.
- Include clear inline comments describing non-obvious logic.
- Implement error checking and type validation.
- Use Tailwind CSS for styling. No inline `style` attributes except for
  dynamic values.
- Do NOT use `alert()`. Use a toast notification system instead.
- All patient-facing text must be minimum 14px (text-sm). Primary body
  text should be 18px (text-lg) where possible.
- Touch targets must be minimum 48x48px for patient-facing UI.

---

## Prompt 1: Admin Bug Fixes & Polish

> **Scope:** Fix the three critical admin bugs, add a toast notification
> system, and replace all `alert()` calls across the admin panel.

### Context

This is a Next.js 14 App Router project. The admin panel lives under
`app/admin/` and uses a shared layout component at
`components/admin/AdminLayout.tsx` which provides a dark sidebar (240px)
and main content area. Authentication is demo-only via
`localStorage.getItem("admin_auth")`.

The app uses shadcn/ui components (in `components/ui/`), Tailwind CSS,
Lucide React icons, and date-fns for date formatting. Mock data is in
`lib/mock-data.ts`.

### Tasks

**1. Create the Schedule page (`app/admin/schedule/page.tsx`)**

The admin sidebar links to `/admin/schedule` but the page does not exist,
causing a 404. Create this page with:

- Wrap content in `<AdminLayout>`.
- Auth guard: check `localStorage.getItem("admin_auth")`, redirect to
  `/admin/login` if missing (same pattern as other admin pages).
- Page title "Schedule" with subtitle "Your upcoming consultations."
- Show a list of upcoming appointments using mock data. Create 3–4
  hardcoded mock appointments (different patients, dates, times, statuses).
  Display each as a card showing: patient name, date/time, duration (30 min),
  status badge (Scheduled / Completed / Cancelled), and a "View Patient"
  link button.
- Add a placeholder section for "Cal.com Integration" with a dashed-border
  box saying "Calendar sync will appear here when Cal.com is connected."
- Style consistently with the existing admin pages (rounded-2xl cards,
  border-border, shadow-sm).

**2. Fix patient table row clickability (`app/admin/patients/page.tsx`)**

Currently only Lily Tan's name text is a `<Link>`. The full row should
be clickable. The dummy Robert Chen row has no link.

- Make each `<tr>` clickable by adding `onClick={() => router.push(...)}` 
  and `className="cursor-pointer"` to each table row.
- For Robert Chen (and any future dummy rows), link to
  `/admin/patients/demo` for now (since only one demo profile exists).
- Replace the inert `<MoreHorizontal>` button with a functional dropdown
  menu. Use a simple state-based dropdown (no need for Radix Popover).
  Options: "View Profile" (navigates), "Copy Portal Link" (copies to
  clipboard with toast), "Edit Status" (placeholder, shows toast
  "Coming soon").

**3. Fix consultation panel layout (`app/admin/patients/[id]/consult/page.tsx`)**

The current layout breaks because:
- `h-[calc(100vh-120px)]` does not account for AdminLayout padding.
- `lg:grid-cols-2` at 1024px leaves only ~784px of content width after
  the 240px sidebar.

Fix:
- Change height to `h-[calc(100vh-4rem)]` and add `overflow-hidden` to
  the outer container to prevent page scrolling.
- Change grid breakpoint from `lg:grid-cols-2` to `md:grid-cols-2` so the
  two-column layout activates at 768px viewport width (which gives ~528px
  per column after sidebar — adequate).
- Give the video area a `min-h-[300px]` and the notes panel a
  `min-h-[300px]`.
- In single-column (mobile) mode, give the video area `aspect-video`
  instead of `flex-1` so it has a fixed proportional height and the notes
  panel remains visible below.
- The "End Consultation" and header text should not wrap awkwardly on
  smaller screens — use `flex-wrap` and responsive text sizes.

**4. Add a toast notification component and replace all `alert()` calls**

- Install or create a simple toast notification component. You can either
  add `sonner` (a lightweight toast library: `npm install sonner`) and add
  `<Toaster />` to `app/layout.tsx`, OR create a minimal custom toast using
  React state and portal.
- Replace ALL `alert()` calls across the admin panel:
  - `app/admin/patients/[id]/consult/page.tsx` line 36: "Note saved..."
    → success toast
  - `app/admin/patients/[id]/guide/page.tsx` line 42: "Guide published..."
    → success toast
  - `app/admin/patients/new/page.tsx` line 35: "Copied to clipboard!"
    → success toast
  - `app/p/demo/appointment/page.tsx` line 27: reschedule alert
    → info toast with "Opening WhatsApp..." message

### Files to modify
- `app/admin/schedule/page.tsx` (CREATE)
- `app/admin/patients/page.tsx`
- `app/admin/patients/[id]/consult/page.tsx`
- `app/admin/patients/[id]/guide/page.tsx`
- `app/admin/patients/new/page.tsx`
- `app/p/demo/appointment/page.tsx`
- `app/layout.tsx` (add Toaster if using sonner)
- `package.json` (add sonner if chosen)

---

## Prompt 2: Patient Portal Navigation & Layout Consistency

> **Scope:** Ensure the bottom navigation bar appears on all patient-facing
> pages for active users, make FAQ discoverable, and fix missing back/escape
> navigation.

### Context

The patient portal lives under `app/p/demo/`. There is a shared layout
component `components/patient/PatientPageLayout.tsx` that wraps content
with `<BottomNav>` (4 tabs: Home, Log, Appointment, Guide) and a
`<DemoControls>` floating button.

Currently only the Home and Appointment pages use `PatientPageLayout`.
The Guide, FAQ, Log, Book, and Onboarding pages render their own layouts
without the bottom nav. This means users lose their primary navigation
when viewing their dietary guide, reading the FAQ, or logging readings.

### Tasks

**1. Add FAQ to the bottom navigation**

In `components/patient/BottomNav.tsx`, add a 5th tab:
- Label: "Help"
- Icon: `HelpCircle` from lucide-react
- Href: `/p/demo/faq`

Update the nav layout to accommodate 5 tabs evenly. Each tab should still
have the full column width as a tap target.

**2. Wrap Guide page in PatientPageLayout**

Refactor `app/p/demo/guide/page.tsx`:
- Wrap the entire page content in `<PatientPageLayout activePath="/p/demo/guide">`.
- Remove the manual back-button header (ArrowLeft + "Back" link). The
  bottom nav now provides navigation.
- Keep the "Save / Print" button in a sticky top bar.
- Ensure the content area has `pb-[80px]` to account for the bottom nav.
- The `<DemoControls>` is provided by PatientPageLayout, so remove the
  duplicate `<DemoControls />` from the guide page.

**3. Wrap FAQ page in PatientPageLayout**

Refactor `app/p/demo/faq/page.tsx`:
- Wrap in `<PatientPageLayout activePath="/p/demo/faq">`.
- Remove the manual back-button header.
- Remove the duplicate `<DemoControls />`.
- Ensure the accordion content has enough bottom padding.

**4. Add consistent navigation to Log flow pages**

The log flow (`app/p/demo/log/page.tsx`) is a multi-step form that
intentionally does not show the bottom nav during data entry (this is
correct — the user should focus on the form). However:

- The **step 0 entry choice screen** (where the user picks photo vs manual)
  should show a back arrow that returns to `/p/demo/home`, which it already
  does — keep this.
- The **log success page** (`app/p/demo/log/success/page.tsx`) should NOT
  show the bottom nav — it auto-redirects after 3 seconds. Keep as-is.
- No changes needed to the log flow itself.

**5. Add escape hatch to Onboarding step 1**

In `app/p/demo/onboarding/page.tsx`:
- On step 1, add a "Back" or close (X) button in the top-right corner
  that navigates to `/p/demo`. This allows demo users to exit if they
  land on onboarding by mistake.
- Only show this on step 1. Steps 2–6 already have back navigation.

**6. Add back button to Booking page**

In `app/p/demo/book/page.tsx`:
- Add a back arrow button at the top-left that navigates to
  `/p/demo/onboarding` (or `/p/demo` which will redirect based on status).
- This allows patients to go back and edit their onboarding answers.

### Files to modify
- `components/patient/BottomNav.tsx`
- `app/p/demo/guide/page.tsx`
- `app/p/demo/faq/page.tsx`
- `app/p/demo/onboarding/page.tsx`
- `app/p/demo/book/page.tsx`

---

## Prompt 3: Accessibility & Bilingual Labels

> **Scope:** Add Chinese bilingual labels to all health reading fields,
> add ARIA attributes across interactive components, add visible focus
> indicators, and fix touch target sizes.

### Context

The patient portal's primary audience is elderly patients in Malaysia and
Singapore, many of whom are more comfortable in Mandarin/Chinese than
English. The documentation (doc 08-ui-ux.md) mandates bilingual labels
on all health metric fields.

The `NumberStepper` component (`components/patient/NumberStepper.tsx`)
accepts `label` and `labelZh` props but several fields pass empty strings
or English descriptions instead of actual Chinese characters.

### Tasks

**1. Fix bilingual labels in log page (`app/p/demo/log/page.tsx`)**

Update the `labelZh` values for all NumberStepper instances:

| Step | Field | Current labelZh | Correct labelZh |
|------|-------|-----------------|-----------------|
| 2 | Fasting Blood Sugar | "Morning, before food" | "空腹血糖" |
| 3 | Post-Dinner Sugar | "2 hours after dinner" | "餐后血糖" |
| 4 | Systolic | "Top number" | "收缩压（上面的数字）" |
| 4 | Diastolic | "Bottom number" | "舒张压（下面的数字）" |
| 5 | Pulse Rate | "" (empty) | "脉搏 / 心跳" |
| 6 | Weight | "" (empty) | "体重" |
| 7 | Waistline | "" (empty) | "腰围" |

Also add a helper text line below each NumberStepper where appropriate:
- Step 2: "Typical range: 3.9–5.6 mmol/L"
- Step 7: "Measure around your belly button"

**2. Add ARIA attributes to NumberStepper**

In `components/patient/NumberStepper.tsx`:
- Add `aria-label="Decrease {label}"` to the minus button.
- Add `aria-label="Increase {label}"` to the plus button.
- Wrap the value display in a `<div role="status" aria-live="polite"
  aria-label="{label}: {value} {unit}">`.
- Add `role="group"` and `aria-labelledby` to the outer container.

**3. Add ARIA attributes to BottomNav**

In `components/patient/BottomNav.tsx`:
- Add `aria-label="Main navigation"` to the `<nav>` element.
- Add `aria-current="page"` to the active tab.
- Add `aria-label="{tab.label}"` to each Link.

**4. Add global focus indicators**

In `app/globals.css`, add a focus-visible style:

```css
@layer base {
  *:focus-visible {
    outline: 2px solid #2A9D8F;
    outline-offset: 2px;
    border-radius: 4px;
  }
}
```

**5. Fix chip remove button touch targets**

In `app/p/demo/onboarding/page.tsx`, the `MultiAddChips` component has
14px X icons that are too small for elderly users. Fix:
- Increase the remove button to `min-w-[44px] min-h-[44px]` with the
  icon centred inside.
- Increase the X icon to `size={18}`.
- Add `aria-label="Remove {item}"` to each remove button.

**6. Add aria-live to validation errors**

In both `app/p/demo/onboarding/page.tsx` and `app/p/demo/log/page.tsx`,
the validation error `<p>` element should have `role="alert"` so screen
readers announce errors immediately.

### Files to modify
- `app/p/demo/log/page.tsx`
- `components/patient/NumberStepper.tsx`
- `components/patient/BottomNav.tsx`
- `app/globals.css`
- `app/p/demo/onboarding/page.tsx`

---

## Prompt 4: Form UX, Loading States & Error Handling

> **Scope:** Improve form experience with autosave, better NumberStepper
> defaults, skeleton loading screens, and proper error handling.

### Context

The patient portal has two major multi-step forms: Onboarding (6 steps)
and Daily Log (8 steps). Both store data in component state and lose
everything if the page refreshes. The documentation mandates autosave
to localStorage.

The NumberStepper starts every field at 0, which is impractical —
a patient logging blood sugar of 6.2 would need 62 taps on the + button
(step size 0.1). Additionally, admin pages return `null` while checking
authentication, showing a blank screen flash.

### Tasks

**1. Add form autosave to onboarding**

In `app/p/demo/onboarding/page.tsx`:
- On every state change to `data`, save the entire `data` object to
  `localStorage` under key `"demo_onboarding_draft"`.
- On mount (in `useEffect`), check for `"demo_onboarding_draft"` and
  restore the form state if found. Also restore the current `step` number
  (save it as `"demo_onboarding_step"`).
- On successful submission, clear both draft keys.
- Use a debounced save (300ms) to avoid writing on every keystroke. A
  simple approach: use `setTimeout` with cleanup in useEffect.

**2. Add form autosave to daily log**

In `app/p/demo/log/page.tsx`:
- Same pattern: save `data` and `step` to localStorage keys
  `"demo_log_draft"` and `"demo_log_step"`.
- Restore on mount.
- Clear on successful submission.

**3. Improve NumberStepper with sensible defaults and direct input**

In `components/patient/NumberStepper.tsx`:
- Add an optional `defaultValue` prop. When the user first interacts with
  the field and the value is 0, jump to the default value instead.
- Make the displayed value tappable: wrap the number in an `<input
  type="number">` styled to look like the current large text display.
  When tapped, it becomes editable via the keyboard. On blur, clamp the
  value to `[min, max]` and round to the step precision.
- Add `inputMode="decimal"` for blood sugar fields and
  `inputMode="numeric"` for integer fields like pulse and weight. Pass
  this via a new optional `inputMode` prop.

Then in `app/p/demo/log/page.tsx`, update each NumberStepper call:

| Field | defaultValue | inputMode |
|-------|-------------|-----------|
| Fasting Blood Sugar | 5.5 | "decimal" |
| Post-Dinner Sugar | 7.0 | "decimal" |
| Systolic | 120 | "numeric" |
| Diastolic | 80 | "numeric" |
| Pulse | 72 | "numeric" |
| Weight | 65 | "decimal" |
| Waistline | 85 | "numeric" |

**4. Add skeleton loading screens for admin pages**

Create a reusable `AdminPageSkeleton` component at
`components/admin/AdminPageSkeleton.tsx`:
- A pulsing placeholder layout with: a heading bar (h-8, w-48),
  a subheading bar (h-4, w-64), and 3 card-shaped rectangles
  (rounded-2xl, h-32, full width).
- Use `animate-pulse` and grey background colours.

In admin pages that currently return `null` during mount check
(`dashboard`, `patients`, `patients/[id]`, `consult`, `guide`,
`new`, `schedule`), replace `if (!mounted) return null;` with
`if (!mounted) return <AdminLayout><AdminPageSkeleton /></AdminLayout>;`.

**5. Fix empty catch blocks**

Search the codebase for `catch {}` (empty catch blocks). Add proper
error handling:
- In patient-facing pages: set a fallback state and log the error to
  console with `console.error("Failed to parse localStorage:", error)`.
- In admin pages: same pattern.
- Type the catch parameter as `catch (error: unknown)`.

**6. Add duplicate reading detection**

In `app/p/demo/log/page.tsx`:
- On mount, check if `localStorage.getItem("demo_reading_today")` is
  truthy.
- If yes, show a dialog/modal: "You've already logged today's readings.
  Would you like to update them?" with two buttons: "Yes, update"
  (proceeds to step 0) and "No, go back" (navigates to `/p/demo/home`).
- Use the existing `Dialog` component from `components/ui/dialog.tsx`.

### Files to modify
- `app/p/demo/onboarding/page.tsx`
- `app/p/demo/log/page.tsx`
- `components/patient/NumberStepper.tsx`
- `components/admin/AdminPageSkeleton.tsx` (CREATE)
- `app/admin/dashboard/page.tsx`
- `app/admin/patients/page.tsx`
- `app/admin/patients/[id]/page.tsx`
- `app/admin/patients/[id]/consult/page.tsx`
- `app/admin/patients/[id]/guide/page.tsx`
- `app/admin/patients/new/page.tsx`
- `app/p/demo/home/page.tsx` (empty catch)
- `app/p/demo/guide/page.tsx` (empty catch)
- `app/p/demo/appointment/page.tsx` (empty catch)
- `app/p/demo/pending/page.tsx` (empty catch)

---

## Prompt 5: Content Correction — Diabetes Reversal Theme

> **Scope:** Update all hardcoded LCHF references to reflect Dr. Jasmine's
> actual practice: helping patients reverse diabetes through variable
> dietary approaches (LCHF is one option, not the only one).

### Context

Dr. Jasmine specialises in **diabetes reversal**, not exclusively LCHF
diets. The dietary plan varies per patient — it could be LCHF,
Mediterranean, intermittent fasting, or another evidence-based approach.
The current codebase and mock data hardcode "LCHF" as if it is the only
protocol.

The `PatientGuide` data model (`lib/mock-data.ts`) already supports a
variable `title` field, which is good. The changes needed are to the mock
data values, admin UI, documentation, and patient-facing copy.

### Tasks

**1. Update mock data (`lib/mock-data.ts`)**

- Change `MOCK_GUIDE.title` from `"Low Carb High Fat Diet (LCHF)"` to
  `"Personalised Diabetes Reversal Plan"`.
- Add a new field to the `PatientGuide` interface: `dietType: string`.
  This represents the specific protocol (e.g. "LCHF", "Mediterranean",
  "Intermittent Fasting", "Low GI").
- Set `MOCK_GUIDE.dietType` to `"LCHF"` (it is still valid for Lily Tan's
  specific case).
- Update the `additionalSections` disclaimer: change "This diet is
  intended for..." to "This plan is part of Dr. Jasmine's diabetes
  reversal programme and is personalised for you..."

**2. Update the admin guide builder (`app/admin/patients/[id]/guide/page.tsx`)**

- Below the "Diet Title" input, add a "Diet Type" select dropdown with
  options: "LCHF (Low Carb High Fat)", "Mediterranean", "Low GI",
  "Intermittent Fasting", "Custom". Default to the guide's `dietType`.
- When the diet type changes, update the guide object's `dietType` field.
- Update the section heading from "General Strategy" to
  "Diet Plan Configuration".

**3. Update patient-facing guide page (`app/p/demo/guide/page.tsx`)**

- Change the header from "Dr. Jasmine Medical Team" to
  "Dr. Jasmine — Diabetes Reversal Programme".
- Below the guide title, show a badge with the diet type
  (e.g. `<Badge>LCHF Protocol</Badge>`).
- The section heading should say "Your Personalised Plan" instead of
  "Dietary Instructions".

**4. Update admin consultation context (`app/admin/patients/[id]/consult/page.tsx`)**

- The "Modify Patient Guide" button label is fine. No LCHF reference.
- Check the context tab for any hardcoded "LCHF" references and replace
  with the guide's `dietType` value.

**5. Update admin patient profile timeline (`app/admin/patients/[id]/page.tsx`)**

- In the `formatTimelineTitle` function, change `"Custom LCHF Guide
  Generated"` to `"Personalised Diet Guide Created"`.

**6. Update documentation files**

Read and update these files, replacing "LCHF" references with broader
diabetes reversal language. Keep LCHF as an *example* but not the only
option:

- `docs/01-project-overview.md`: Update the description of the portal's
  purpose. Mention "personalised dietary plans for diabetes reversal"
  instead of implying a single diet type.
- `docs/05-patient-portal.md`: The Guide section references a specific
  LCHF layout. Change to say the guide renders whatever diet plan is
  assigned, with LCHF shown as an example layout.
- `docs/06-admin-panel.md`: Update the guide builder description to
  reflect the diet type selector.
- `docs/08-ui-ux.md`: The colour coding (red = NO foods, green = YES
  foods) is still valid regardless of diet type. No major changes needed,
  but update any copy that implies LCHF specifically.

### Files to modify
- `lib/mock-data.ts`
- `app/admin/patients/[id]/guide/page.tsx`
- `app/p/demo/guide/page.tsx`
- `app/admin/patients/[id]/consult/page.tsx`
- `app/admin/patients/[id]/page.tsx`
- `docs/01-project-overview.md`
- `docs/05-patient-portal.md`
- `docs/06-admin-panel.md`
- `docs/08-ui-ux.md`

---

## Prompt 6: Visual Polish, Micro-Interactions & Wow Factor

> **Scope:** Add the finishing touches that make the app feel premium:
> button press animations, card hover effects, an onboarding success
> screen, improved empty/waiting states, and subtle brand touches.

### Context

The app's UX audit scored 6.5/10 on "Wow Factor". The design is clean
and functional but lacks the micro-interactions and emotional polish that
make users go "this feels great". The documentation (08-ui-ux.md) specifies
several animations that are not yet implemented: button press `scale(0.98)`,
card hover lift, success checkmark draw animation, and page fade-ins.

### Tasks

**1. Add button press animation**

In `components/ui/button.tsx`, add `active:scale-[0.98] transition-transform`
to the base button variant classes. This gives all buttons a subtle press
feedback that the docs specify.

**2. Add card hover lift (admin only)**

In the admin pages that use card grids (dashboard KPI cards, patient
list cards, readings list), add `hover:-translate-y-0.5 hover:shadow-md
transition-all duration-150` to card containers. Do NOT add this to
patient-facing cards — movement can confuse elderly users.

**3. Add onboarding success screen**

Currently, submitting the onboarding form immediately redirects to
`/p/demo/book`. Add an intermediate success moment:

In `app/p/demo/onboarding/page.tsx`:
- After `submitForm()` saves to localStorage, instead of immediately
  calling `router.push`, set a new state `submitted = true`.
- When `submitted` is true, render a full-screen success view (similar
  to `app/p/demo/log/success/page.tsx`):
  - Large animated checkmark icon (use `animate-in zoom-in spin-in-12
    duration-500` like the log success page).
  - Heading: "You're all set!"
  - Subtext: "Now let's book your first consultation with Dr. Jasmine."
  - Auto-redirect to `/p/demo/book` after 2.5 seconds.
  - "Continue" link below for immediate navigation.

**4. Improve the pending/waiting page**

The pending page (`app/p/demo/pending/page.tsx`) is currently a dead end
where patients wait days. Add some engaging content:

- Below the appointment card, add a "How to Prepare" section with 3–4
  tips (collapsible accordion or simple list):
  - "Have your glucometer and blood pressure monitor ready"
  - "Write down any questions you'd like to ask Dr. Jasmine"
  - "Make sure you're in a quiet spot with good internet for the video call"
  - "Have a pen and paper handy for notes"
- Add a subtle decorative element: a large, faded medical cross or
  stethoscope icon as a background watermark (opacity-5, positioned
  absolutely).

**5. Add encouragement to onboarding between steps**

In `app/p/demo/onboarding/page.tsx`, for steps 3, 4, and 5, add a small
encouraging line below the step progress dots:

- Step 3: "You're halfway there — keep going!"
- Step 4: "Almost done — just a couple more questions."
- Step 5: "Last section before review!"

Style: `text-primary text-sm font-medium text-center` below the
`<StepProgress>` component.

**6. Add trend indicators to admin dashboard**

In `app/admin/dashboard/page.tsx`, the KPI cards show static numbers.
Add trend indicators below each number:

- Total Active Patients: `↑ 3 this week` (green text)
- Readings to Review: `2 new today` (amber text)
- Meetings Today: no trend needed
- Guide Adherence: `↑ 2% from last month` (green text)

These are hardcoded strings (this is a demo), but they add visual polish
and suggest the system is alive.

**7. Improve the success animations**

In `app/p/demo/log/success/page.tsx`:
- Add a subtle confetti-like effect: 3–4 small coloured dots that
  animate outward from the checkmark using CSS keyframe animations.
  Keep it understated (small dots, short duration, primary/accent colours).
  This small touch creates a moment of delight after the daily logging
  task.

### Files to modify
- `components/ui/button.tsx`
- `app/admin/dashboard/page.tsx`
- `app/p/demo/onboarding/page.tsx`
- `app/p/demo/pending/page.tsx`
- `app/p/demo/log/success/page.tsx`

---

## Prompt Execution Checklist

| # | Prompt | Files | Priority |
|---|--------|-------|----------|
| 1 | Admin Bug Fixes & Polish | ~8 files | Critical — blocks demo |
| 2 | Patient Navigation & Layout | ~5 files | High — broken UX |
| 3 | Accessibility & Bilingual Labels | ~5 files | High — audience need |
| 4 | Form UX, Loading & Error Handling | ~14 files | Medium — usability |
| 5 | Diabetes Reversal Theme | ~9 files | Medium — accuracy |
| 6 | Visual Polish & Wow Factor | ~5 files | Low — delight |

After completing all 6 prompts, run the app and walk through these flows
to verify:

1. **Patient onboarding:** `/p/demo` → onboarding (6 steps) → success
   screen → booking → pending page
2. **Active patient daily log:** Home → Log → manual (8 steps) → success
   → Home (task card updates)
3. **Guide viewing:** Guide tab → view guide → Save/Print → navigate via
   bottom nav
4. **FAQ:** Help tab → accordion FAQ → navigate back via bottom nav
5. **Admin login → dashboard → schedule → patient list → patient profile
   → consultation panel → guide builder**
6. **Verify bilingual labels appear on all reading fields**
7. **Verify no `alert()` calls remain anywhere**
8. **Verify all admin pages show skeleton during mount check**
