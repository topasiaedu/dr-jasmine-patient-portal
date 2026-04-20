# Phase 1 Agent Implementation Prompts

Each section below is a self-contained prompt. Copy the entire section between the `=== START ===` and `=== END ===` markers and pass it to the agent as-is. Run one task at a time; tasks are independent unless noted.

The project root is `e:\Dev\GitHub\dr-jasmine-patient-portal`.

---

## TASK 1 — Patient Home: "Last Logged" Date

```
=== START TASK 1 ===

You are implementing a specific, scoped change in a Next.js 14 App Router project (TypeScript strict mode). Read all referenced files before making any changes.

## Project context

This is the Dr. Jasmine Patient Portal — a web app for a private GP practice specialising in diabetes reversal. Patients use a magic-link (no password) to access their portal. The patient-facing routes live under `/p/[ghlContactId]/*`.

The patient home page currently shows two cards: "Log my readings" and "Your guide". The problem: after a patient submits their readings, the home page looks identical to before. There is no acknowledgment that data was received, and no motivation to keep logging.

**Decision:** Show the date of the patient's most recent submission and a count of how many readings they have logged this month. No charts, no trend data, no clinical numbers — just behavioural feedback ("you have been consistent").

## Coding standards (mandatory)
- Strict TypeScript — no `any`, no `!` non-null assertion, no `as unknown as T`
- Double quotes for all strings
- Template literals instead of string concatenation
- Full code, no placeholders or TODOs
- Comments only explain non-obvious intent, never narrate what the code does
- No floating promises — use `void` or `await`

## Files to read first

1. `app/api/patient/me/route.ts` — the patient profile API endpoint
2. `app/p/[ghlContactId]/home/page.tsx` — the patient home page
3. `lib/auth/resolve-patient-request.ts` — patient auth helper (read to understand the pattern, do not modify)
4. `lib/supabase/admin.ts` — how to create the service role Supabase client

## Database schema (relevant tables)

```sql
-- patients table (already queried by /api/patient/me)
patients (
  id uuid,
  ghl_contact_id text,
  full_name text,
  reading_cadence_note text,
  status text,
  created_at timestamptz,
  updated_at timestamptz
)

-- daily_readings table
daily_readings (
  id uuid,
  patient_id uuid,  -- FK to patients.id
  reading_date date,
  -- (other numeric columns not needed here)
  submitted_at timestamptz
)
```

## What to implement

### Change 1 — Extend `app/api/patient/me/route.ts`

After fetching the patient row, run two additional Supabase queries in parallel using `Promise.all`:

1. **Last reading date:** Select the most recent `reading_date` from `daily_readings` for this patient. Use `.order("reading_date", { ascending: false }).limit(1).maybeSingle()`.
2. **Readings this month count:** Select a count of rows from `daily_readings` for this patient where `reading_date` falls within the current calendar month (use `.gte` and `.lte` with ISO date strings derived from `new Date()`).

Add both values to the JSON response:

```json
{
  "patient": { ...existing fields... },
  "lastReadingDate": "2026-04-17",   // null if no readings yet
  "readingsThisMonth": 6             // 0 if none
}
```

The existing patient object shape must not change — these are new top-level keys alongside `patient`.

### Change 2 — Update `app/p/[ghlContactId]/home/page.tsx`

1. Extend the local state to also store `lastReadingDate: string | null` and `readingsThisMonth: number`.
2. Parse both new fields from the `/api/patient/me` response.
3. Under the "Log my readings" card, add a small info line. Show it only when `lastReadingDate` is not null:
  - If `readingsThisMonth > 0`: render something like:
   `Last logged: Mon, 14 Apr  ·  6 readings this month`
  - If only `lastReadingDate` is available (readingsThisMonth is 0 somehow): render just the date.
   Format the date using `date-fns` `format` + `parseISO`. Use the format string `"EEE, d MMM"`.
   Style: `text-xs text-text-tertiary font-medium` — subtle, below the button, not the same visual weight as the card content.
4. Do not change anything else on the home page (the guide card, the overall layout, or the motion wrappers).

## Important notes

- The `createServiceRoleClient()` function (from `lib/supabase/admin.ts`) is already used in this route — keep using it
- `resolvePatientFromRequest` returns `{ patientId: string } | null` — use it the same way the existing code does
- For the "this month" date range, compute `startOfMonth` and `endOfMonth` from `date-fns` to get accurate ISO date strings (`format(startOfMonth(new Date()), "yyyy-MM-dd")`)
- If either extra query errors, return the patient data anyway with `lastReadingDate: null` and `readingsThisMonth: 0` — do not fail the whole request

=== END TASK 1 ===

```

---

## TASK 2 — Photo Scan: OpenAI Vision + Camera Upload

```

=== START TASK 2 ===

You are implementing a complete feature in a Next.js 14 App Router project (TypeScript strict mode). Read all referenced files before making any changes.

## Project context

This is the Dr. Jasmine Patient Portal. Patients log 7 health readings (fasting blood sugar, post-dinner blood sugar, blood pressure systolic, blood pressure diastolic, pulse rate, weight, waistline). Many patients use a paper logbook. The photo scan feature lets a patient photograph their paper logbook and have the values automatically extracted so they don't need to type each number manually.

The feature UI already exists in `app/p/[ghlContactId]/log/page.tsx` — the "Take a photo instead" card is shown on step 0, but clicking it only fires a toast saying "coming soon." The backend route `POST /api/readings/extract-image` does not exist yet.

**Your job:** implement the full end-to-end photo scan.

## Coding standards (mandatory)

- Strict TypeScript — no `any`, no `!` non-null assertion, no `as unknown as T`
- Double quotes for all strings
- Template literals instead of string concatenation
- Full code, no placeholders or TODOs
- Comments only explain non-obvious intent, never narrate what the code does
- No floating promises — use `void` or `await`

## Files to read first

1. `app/p/[ghlContactId]/log/page.tsx` — the full patient log page (read the entire file)
2. `lib/auth/resolve-patient-request.ts` — patient auth helper pattern
3. `app/api/readings/route.ts` — the readings submit route (read to understand auth pattern)
4. `supabase/migrations/20260416120000_initial_schema.sql` — the DB schema (read the `daily_readings` table definition)

## Step 1 — Install the OpenAI package

Run: `npm install openai`

The environment variable `OPENAI_API_KEY` is already available in the project's environment. You do not need to add it to any config file.

## Step 2 — Create `app/api/readings/extract-image/route.ts`

This is a new POST route. It:

1. Authenticates the patient using `resolvePatientFromRequest` (same pattern as `app/api/readings/route.ts`). Return 401 if not authenticated.
2. Parses the request body as `multipart/form-data`. The client will send a field named `image` containing the file. Use the Web API `request.formData()` to get it. The value will be a `File` or `Blob`.
3. Converts the image to a base64 data URL:
  ```typescript
   const arrayBuffer = await file.arrayBuffer();
   const base64 = Buffer.from(arrayBuffer).toString("base64");
   const mimeType = file.type.length > 0 ? file.type : "image/jpeg";
   const dataUrl = `data:${mimeType};base64,${base64}`;
  ```
4. Calls OpenAI Vision (`gpt-4o`) with this prompt:
  ```
   This is a patient health logbook. Extract the most recent row of readings.
   Return ONLY a JSON object with these exact keys (use null if a value is not visible or not present):
   {
     "fastingBloodSugar": number | null,
     "postDinnerBloodSugar": number | null,
     "bloodPressureSystolic": number | null,
     "bloodPressureDiastolic": number | null,
     "pulseRate": number | null,
     "weightKg": number | null,
     "waistlineCm": number | null
   }
   All blood sugar values are in mmol/L. Blood pressure in mmHg. Weight in kg. Waistline in cm.
   Do not include any explanation text — only the JSON object.
  ```
5. Parses the model's response text as JSON. If parsing fails, return `{ error: "Could not extract readings from image" }` with status 422.
6. Returns `{ extracted: { fastingBloodSugar, postDinnerBloodSugar, ... } }` where each value is either a `number` or `null`.

Use the OpenAI SDK:

```typescript
import OpenAI from "openai";
const client = new OpenAI(); // automatically uses OPENAI_API_KEY from env
```

Wrap the entire OpenAI call in a try/catch. If it throws, return status 500 with `{ error: "Image processing failed" }`.

The route file structure (Route Handler) follows the same pattern as other routes in this project — see `app/api/readings/route.ts` for the exact pattern.

## Step 3 — Update `app/p/[ghlContactId]/log/page.tsx`

The log page has a step system: step 0 = method choice, steps 1–8 = manual form steps.

### 3a — Replace the photo card handler

Currently `handlePhotoSelect` shows a toast and does nothing. Replace it with real behaviour:

1. Trigger a hidden `<input type="file" accept="image/*" capture="environment" />` element's click. This opens the camera on mobile (using `capture="environment"`) and a file picker on desktop. Use a `useRef<HTMLInputElement>` for this.
2. Remove the "Coming soon" badge from the photo card. The card should now look active.
3. Add an `onChange` handler on the hidden file input. When a file is selected:
  - Set a loading state (add `const [photoLoading, setPhotoLoading] = useState(false)`)
  - Build a `FormData` with `formData.append("image", file)`
  - POST to `/api/readings/extract-image` with `credentials: "include"`
  - If the response is not ok: show `toast.error("Could not read the photo. Please enter manually.")` and set `method` to `"manual"` and `step` to `1`
  - If successful: parse the JSON. For each non-null value in `extracted`, update the corresponding field in `data` state. Map the fields:
    - `fastingBloodSugar` → `data.fastingSugar`
    - `postDinnerBloodSugar` → `data.postDinnerSugar`
    - `bloodPressureSystolic` → `data.systolic`
    - `bloodPressureDiastolic` → `data.diastolic`
    - `pulseRate` → `data.pulse`
    - `weightKg` → `data.weight`
    - `waistlineCm` → `data.waistline`
  - Set `method` to `"photo"` and `step` to `1` to enter the manual review flow with pre-filled values
  - Set `photoLoading` back to false
4. While `photoLoading` is true, show a loading state on the photo card (disable it, show a spinner or "Analysing photo..." text). Use a simple inline check in the JSX — do not create a separate component.

### 3b — The existing scanning stub (step 0.5)

The current `step === 0.5` "scanning animation" block can be removed entirely — the API call replaces it. After removing it, the step variable will only ever be 0 (method choice) or 1–8 (manual form).

### 3c — The hidden file input

Add the hidden `<input>` element at the end of every render return that shows the step 0 screen (inside the outer wrapper div, not inside a conditional). It must be outside the visible card layout but in the DOM. Example:

```tsx
<input
  ref={fileInputRef}
  type="file"
  accept="image/*"
  capture="environment"
  className="hidden"
  onChange={handleFileChange}
/>
```

## Important notes

- The `data` state shape already has `fastingSugar`, `postDinnerSugar`, `systolic`, `diastolic`, `pulse`, `weight`, `waistline` fields — update these directly
- For null values from the API, do NOT override the existing field value — only update when extracted value is a non-null number
- The existing "photo was extracted" banner (shown when `method === "photo"` and step < 8) is already in the code — it will automatically appear, no changes needed there
- Keep all existing step 1–8 logic exactly as-is; only step 0 changes

=== END TASK 2 ===

```

---

## TASK 3 — Guide Builder: Add Replacements, Portions, Cooking Methods

```

=== START TASK 3 ===

You are adding three missing sections to an existing admin form in a Next.js 14 App Router project (TypeScript strict mode). Read all referenced files before making any changes.

## Project context

Dr. Jasmine's admin guide builder (`app/admin/patients/[id]/guide/page.tsx`) lets her create a personalised dietary plan for each patient. The patient sees this plan at `/p/[ghlContactId]/guide`.

The guide has 6 defined sections:

1. Foods to Avoid ✅ (built)
2. Foods You Can Eat ✅ (built)
3. Snacks ✅ (built)
4. **Replacements (smart swaps)** ❌ MISSING from builder
5. **Portions (plate ratios)** ❌ MISSING from builder
6. **Cooking Methods** ❌ MISSING from builder

The data model, API persistence, and patient-facing rendering all already support these three sections. Only the admin builder UI is missing them.

## Coding standards (mandatory)

- Strict TypeScript — no `any`, no `!` non-null assertion, no `as unknown as T`
- Double quotes for all strings
- Template literals instead of string concatenation
- Full code, no placeholders or TODOs
- Comments only explain non-obvious intent, never narrate what the code does

## Files to read first

1. `app/admin/patients/[id]/guide/page.tsx` — the entire guide builder (read fully)
2. `lib/types/patient-guide.ts` — type definitions for the guide (read fully)
3. `app/p/[ghlContactId]/guide/page.tsx` — how the patient sees these sections (read to understand expected data shape)

## Data model reference

From `lib/types/patient-guide.ts`:

```typescript
interface GuideFoodReplacement {
  original: string;    // e.g. "White rice"
  replacement: string; // e.g. "Cauliflower rice"
}

interface GuidePortion {
  label: string;    // e.g. "Meat"
  fraction: string; // e.g. "1/3"
}
```

From `GuideVersion` in `lib/mock-data.ts` (the builder's working type):

```typescript
replacements: GuideFoodReplacement[];
portions: GuidePortion[];
cookingMethods: string[];
```

These fields are already on `draft` state — they just have no UI to edit them.

## What to add

Add three new sections inside the white card `div` that contains "FOODS TO AVOID", "FOODS YOU CAN EAT", and "SNACKS". Add them after the Snacks section, in this order: Replacements → Portions → Cooking Methods.

### Section A — REPLACEMENTS (Smart Swaps)

Header label: "SMART SWAPS" in danger/red or neutral color — use the same styling as the other section headers but with `text-text-secondary` since this is neutral.

This is a list of pairs: `{ original: string, replacement: string }`. Each pair renders as a row showing `original → replacement`.

**State to add:**

```typescript
const [newSwapOriginal, setNewSwapOriginal] = useState("");
const [newSwapReplacement, setNewSwapReplacement] = useState("");
```

**Display:** Render existing `draft.replacements` as rows in a compact list. Each row shows:

- The `original` text
- An arrow `→`
- The `replacement` text
- An `X` remove button

**Add form:** Two `Input` fields side by side (original | replacement) with an "Add" button. On add: if both fields are non-empty, push `{ original: newSwapOriginal.trim(), replacement: newSwapReplacement.trim() }` to `draft.replacements` and clear both inputs. Use `onKeyDown` on the second input to add on Enter.

**Remove:** filter the array by index, same pattern as `removeNoItem`.

### Section B — PORTIONS (Your Plate)

Header label: "YOUR PLATE"

This is a list of `{ label: string, fraction: string }` pairs. Example: `{ label: "Meat", fraction: "1/3" }`.

**State to add:**

```typescript
const [newPortionLabel, setNewPortionLabel] = useState("");
const [newPortionFraction, setNewPortionFraction] = useState("");
```

**Display:** Render existing `draft.portions` as rows. Each row shows `label` and `fraction` with an `X` button. Style similarly to replacements.

**Add form:** Two `Input` fields (Label | Fraction, e.g. "Meat" | "1/3") with an "Add" button. Fraction placeholder should be "e.g. 1/3". Both fields required for adding.

**Remove:** same index-filter pattern.

### Section C — COOKING METHODS

Header label: "COOKING METHODS"

This is a simple `string[]`, the same pattern as "FOODS TO AVOID" (`noList`) and "SNACKS" (`snacks`).

**State to add:**

```typescript
const [newCookingMethod, setNewCookingMethod] = useState("");
```

**Display:** Render existing `draft.cookingMethods` as pill tags with `X` buttons. Use neutral/gray styling (not red, not green — something like `bg-gray-100 text-gray-700 border border-gray-200`).

**Add form:** Single `Input` with placeholder "E.g. Pan-fry" and an "Add" button. Add on Enter key.

**Remove:** index-filter pattern.

## Helper functions to add

Add these three remove helpers alongside the existing `removeNoItem`, `removeSnack` etc:

```typescript
const removeReplacement = (idx: number) => {
  setDraft(g => g ? { ...g, replacements: g.replacements.filter((_, i) => i !== idx) } : g);
};
const removePortion = (idx: number) => {
  setDraft(g => g ? { ...g, portions: g.portions.filter((_, i) => i !== idx) } : g);
};
const removeCookingMethod = (idx: number) => {
  setDraft(g => g ? { ...g, cookingMethods: g.cookingMethods.filter((_, i) => i !== idx) } : g);
};
```

## Important notes

- Do NOT change anything else in the file — the Save, New Phase, and History sections all work correctly
- The `GuideVersion` type from `lib/mock-data.ts` already has `replacements`, `portions`, `cookingMethods` — no type changes needed
- `guideVersionToWritePayload` already maps all three fields to the API — saving will work automatically
- The patient guide page already renders all three sections — once the builder lets Dr. Jasmine fill them in, they will appear for patients immediately on next save
- For `GuideFoodReplacement` and `GuidePortion` imports — import from `@/lib/types/patient-guide` if needed, or inline the object shapes since they're simple

=== END TASK 3 ===

```

---

## TASK 4 — Admin Patient List: Real Search/Filter + Last Reading Date

```

=== START TASK 4 ===

You are making targeted changes to the admin patient list in a Next.js 14 App Router project (TypeScript strict mode). Read all referenced files before making any changes.

## Project context

Dr. Jasmine uses the patient list at `/admin/patients` to find and navigate to patients. Current problems:

1. Search bar and status filter are present but `disabled` — they do nothing
2. The table shows "Created at" as a column — not useful. "Last reading date" is what Dr. Jasmine actually wants to know at a glance (who has logged recently, who hasn't)
3. The API doesn't return `last_reading_date` yet

## Coding standards (mandatory)

- Strict TypeScript — no `any`, no `!` non-null assertion, no `as unknown as T`
- Double quotes for all strings
- Template literals instead of string concatenation
- Full code, no placeholders or TODOs
- Comments only explain non-obvious intent, never narrate what the code does

## Files to read first

1. `app/admin/patients/page.tsx` — the patient list page (read fully)
2. `app/api/admin/patients/route.ts` — the list API (read fully)
3. `lib/supabase/admin.ts` — service role client pattern

## Database schema reference

```sql
patients (id, ghl_contact_id, full_name, email, phone, status, created_at, updated_at)
daily_readings (id, patient_id, reading_date, submitted_at)
```

## Change 1 — Extend `app/api/admin/patients/route.ts` (GET handler only)

After fetching the patients list, fetch the most recent `reading_date` for each patient in a single additional query.

Use a Supabase query that selects `patient_id` and the max `reading_date` grouped by patient:

```typescript
const { data: latestReadings } = await supabase
  .from("daily_readings")
  .select("patient_id, reading_date")
  .order("reading_date", { ascending: false });
```

Then build a lookup map: `Map<string, string>` of `patient_id → most recent reading_date`. Iterate over the readings result and take only the first entry per `patient_id` (since results are ordered newest first).

Merge `last_reading_date` (string date or `null`) onto each patient in the response. The updated patient shape:

```typescript
{
  id, ghl_contact_id, full_name, email, phone, status, created_at,
  last_reading_date: string | null  // "yyyy-MM-dd" or null
}
```

Do NOT break the existing response shape — `created_at` can remain in the data (it's just no longer shown in the UI).

## Change 2 — Update `app/admin/patients/page.tsx`

### 2a — Update the `PatientListRow` interface

Add `last_reading_date: string | null` to the interface.

### 2b — Remove disabled state from search and filter

Currently: `<input ... disabled title="Search coming in a later phase" />` and `<select ... disabled ...>`.

**Search:** Remove the `disabled` attribute. Add a `searchQuery` state (`useState("")`). Wire the input's `value` and `onChange` to this state.

**Status filter:** Remove the `disabled` attribute. Add a `statusFilter` state (`useState("all")`). Wire the select's `value` and `onChange` to this state. Add options: `All Status` (value `"all"`), `Active` (value `"active"`), `Booked` (value `"booked"`), `Onboarding` (value `"onboarding"`).

### 2c — Apply client-side filtering

After `patients` state is loaded, derive a `filteredPatients` array (use `useMemo` or compute inline before the render):

```typescript
const filteredPatients = patients.filter((p) => {
  const matchesSearch =
    searchQuery.trim().length === 0 ||
    p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.phone.includes(searchQuery) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase());

  const matchesStatus =
    statusFilter === "all" || p.status === statusFilter;

  return matchesSearch && matchesStatus;
});
```

Use `filteredPatients` in the table rows instead of `patients`.

### 2d — Replace "Created at" column with "Last reading"

In the table header (if one exists) and in the table rows:

- Remove the `new Date(p.created_at).toLocaleDateString()` cell
- Replace with: if `p.last_reading_date` is non-null, show a formatted date using `format(parseISO(p.last_reading_date), "d MMM")` (import from `date-fns`). If null, show `"No readings yet"` in `text-text-secondary` style.

### 2e — Simplify the row actions menu

The `...` menu currently has "View profile" (redundant — clicking the row already navigates there) and "Copy portal link". 

Remove "View profile" from the menu. Since the row is already clickable, this is just noise.

The remaining action "Copy portal link" stays. If the menu now has only one item, consider making it a direct inline button (a small `Copy` icon button directly in the last cell) instead of a hidden dropdown. This removes one click from a frequent action.

Implement the inline copy button: a `<button>` with a `Copy` icon (from `lucide-react`) that calls the existing `handleCopyLink` logic when clicked, with `e.stopPropagation()` to prevent row navigation. Use `aria-label="Copy portal link"`.

Remove the `openMenu` state and related click handlers entirely since the dropdown is gone.

## Important notes

- Import `format`, `parseISO` from `date-fns` if not already imported
- `useMemo` import from `react` if using it for `filteredPatients`
- The API change is backwards-compatible — no other files consume this endpoint
- Do not change the `POST` handler in the patients API

=== END TASK 4 ===

```

---

## TASK 5 — Admin Patient Profile: Restructure + All Readings

```

=== START TASK 5 ===

You are restructuring the admin patient profile page in a Next.js 14 App Router project (TypeScript strict mode). Read all referenced files before making any changes.

## Project context

Dr. Jasmine visits `/admin/patients/[id]` to review a patient outside of a consultation. Current problems:

1. The GHL contact ID is displayed prominently — it's an internal technical ID Dr. Jasmine doesn't need to see
2. Readings are sliced to `readings.slice(0, 8)` — Dr. Jasmine said she needs to see a patient's **full reading history** to give advice
3. Readings are shown as individual cards with heavy padding — makes it very slow to scan for patterns
4. The "Care team notes" panel (left column) only shows the cadence note — occupies 2/5 of the layout for one text field
5. No easy path to the consultation panel — "Edit guide" is the primary action but "Open consult workspace" is more important

## Coding standards (mandatory)

- Strict TypeScript — no `any`, no `!` non-null assertion, no `as unknown as T`
- Double quotes for all strings
- Template literals instead of string concatenation
- Full code, no placeholders or TODOs
- Comments only explain non-obvious intent, never narrate what the code does

## Files to read first

1. `app/admin/patients/[id]/page.tsx` — the patient profile page (read fully)
2. `lib/types/admin-reading.ts` — the reading type shape
3. `app/api/admin/patients/[id]/readings/route.ts` — verify the API returns all readings (it does, no limit)

## Changes to make

### Change 1 — Remove GHL contact ID display

Find and remove the line:

```tsx
<p className="text-xs text-text-secondary mt-2">GHL contact id: {patient.ghl_contact_id}</p>
```

It adds no value for Dr. Jasmine. The GHL contact ID is still available in the portal link (copy button handles this).

### Change 2 — Restructure the action buttons

Currently the buttons are: "Copy portal link", "Open portal", "Edit guide".

Reorder and update to:

1. **"Open Consult Workspace"** — primary button (`variant="default"`, full primary green background). Links to `/admin/patients/${patient.id}/consult`. This is the most important action.
2. **"Edit Guide"** — secondary outline button. Links to `/admin/patients/${patient.id}/guide`. Keep as-is but demoted.
3. **"Copy portal link"** — outline button, same as current.
4. Remove "Open portal" (opens the patient-facing portal in a new tab — not useful during a session, removes clutter).

### Change 3 — Simplify the left panel

The current layout is `md:col-span-2` (left) and `md:col-span-3` (right) in a 5-column grid. 

Change the layout to `md:col-span-2` left and `md:col-span-3` right but reduce the left panel's content weight:

In the left panel, replace the "Care team notes" card with a more complete **Patient Info** card that shows:

- **Reading cadence note** (existing — keep)
- Patient status (Active/Booked/Onboarding) — as a small pill badge
- Phone number (already in header but repeat here for quick reference)
- Joined date (`safeFormat(patient.created_at, "d MMM yyyy")`)

The card title changes from "Care team notes" to "Patient info".

### Change 4 — Replace readings cards with a compact table

Currently readings are `readings.slice(0, 8).map(rdg => <div className="p-4 rounded-xl ...">)`.

Changes:

1. **Remove `.slice(0, 8)`** — show all readings
2. **Replace the card layout with a compact table.** The table should show all readings sorted newest first (the API already returns them in this order).

Table columns: Date | Fasting | Post-Dinner | BP | Pulse | Weight | Waistline | Method

Use this table structure (adapt to project's Tailwind design language):

```tsx
<div className="overflow-x-auto">
  <table className="w-full text-sm border-collapse">
    <thead>
      <tr className="bg-[#F7F5F2] text-left">
        <th className="px-3 py-2 text-xs font-bold text-text-secondary uppercase tracking-wider">Date</th>
        <th className="px-3 py-2 text-xs font-bold text-text-secondary uppercase tracking-wider">Fasting</th>
        <th className="px-3 py-2 text-xs font-bold text-text-secondary uppercase tracking-wider">Post-Din</th>
        <th className="px-3 py-2 text-xs font-bold text-text-secondary uppercase tracking-wider">BP</th>
        <th className="px-3 py-2 text-xs font-bold text-text-secondary uppercase tracking-wider">Pulse</th>
        <th className="px-3 py-2 text-xs font-bold text-text-secondary uppercase tracking-wider">Weight</th>
        <th className="px-3 py-2 text-xs font-bold text-text-secondary uppercase tracking-wider">Waist</th>
        <th className="px-3 py-2 text-xs font-bold text-text-secondary uppercase tracking-wider">Via</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-border">
      {readings.map((rdg) => { /* ... */ })}
    </tbody>
  </table>
</div>
```

Alert colouring rules (keep existing logic):

- `rdg.fastingBloodSugar > 7.0` → fasting cell gets `text-danger font-bold`
- `rdg.bloodPressureSystolic > 135` → BP cell gets `text-danger font-bold`

For each row, show:

- Date: `safeFormat(rdg.readingDate, "d MMM")` 
- Fasting: `rdg.fastingBloodSugar` +  `mmol` in tiny secondary text
- Post-Din: `rdg.postDinnerBloodSugar` +  `mmol`  
- BP: `${rdg.bloodPressureSystolic}/${rdg.bloodPressureDiastolic}`
- Pulse: `rdg.pulseRate` +  `bpm`
- Weight: `rdg.weightKg` +  `kg`
- Waist: `rdg.waistlineCm` +  `cm`
- Via: if `rdg.entryMethod === "photo_extracted"`, show a small camera icon (from `lucide-react`); otherwise show nothing

If there are more than 20 readings, add a subtle "Showing all X readings" count label above the table.

### Change 5 — Section header update

Change the section title from "Recent readings" to "All readings".

## Important notes

- Do not change the fetch logic, loading states, error states, or the `safeFormat` / `formatPortalBase` helpers
- The `readings` state array type is `AdminReadingJson[]` — import from `@/lib/types/admin-reading`
- The `Camera` icon is available from `lucide-react`
- Keep the `Button`, `buttonVariants`, `cn` imports already in the file

=== END TASK 5 ===

```

---

## TASK 6 — Consultation Panel: Real Data Connection

```

=== START TASK 6 ===

You are replacing all mock data in the admin consultation panel with real Supabase data, and creating two new API routes it needs. This is the most complex task. Read all referenced files fully before writing any code.

## Project context

The consultation panel at `/admin/patients/[id]/consult` is Dr. Jasmine's workspace during a live patient call. It shows patient vitals, medical history, previous notes, and lets her write session notes. 

**Critical problem:** The entire panel currently imports `MOCK_PATIENT`, `MOCK_READINGS`, `MOCK_ONBOARDING`, `MOCK_CONSULTATION_NOTES`, etc. from `lib/mock-data.ts`. Regardless of which patient ID is in the URL, it always shows the same fake "Lily Tan" data. This makes the panel completely unusable with real patients.

**Additional decision:** The "Schedule Next Session" modal (a date/time picker that saves to localStorage) must be removed. Scheduling is Phase 2+ (requires Cal.com integration). Remove the modal and the "Schedule Next Session →" button from the bottom action bar.

## Coding standards (mandatory)

- Strict TypeScript — no `any`, no `!` non-null assertion, no `as unknown as T`
- Double quotes for all strings
- Template literals instead of string concatenation
- Full code, no placeholders or TODOs
- Comments only explain non-obvious intent, never narrate what the code does
- No floating promises — use `void` or `await`

## Files to read first (read ALL of these before writing anything)

1. `app/admin/patients/[id]/consult/page.tsx` — the current consultation panel (read fully)
2. `app/api/admin/patients/[id]/route.ts` — patient detail API (read to understand the pattern)
3. `app/api/admin/patients/[id]/readings/route.ts` — readings API (read to understand the pattern)
4. `lib/supabase/admin-auth.ts` — admin auth helper
5. `lib/supabase/admin.ts` — service role client
6. `supabase/migrations/20260416120000_initial_schema.sql` — read the `onboarding_responses` and `consultation_notes` table schemas

## Database schema reference

```sql
onboarding_responses (
  id uuid, patient_id uuid,
  chief_complaint text,
  existing_conditions text[],
  current_medications text[],
  allergies text[],
  smoking_status text,
  alcohol_use text,
  activity_level text,
  dietary_notes text,
  additional_notes text,
  submitted_at timestamptz
)

consultation_notes (
  id uuid,
  patient_id uuid,
  appointment_id uuid,   -- nullable
  content text,          -- store as JSON string (see below)
  created_at timestamptz,
  updated_at timestamptz
)
```

**Content JSON format** — the `content` field stores a JSON string with two keys:

```json
{ "private": "Dr's private session notes", "forPatient": "Note sent to patient" }
```

## Step 1 — Create `app/api/admin/patients/[id]/onboarding/route.ts`

This is a new GET route. It returns the most recent onboarding response for the patient.

Pattern: follow `app/api/admin/patients/[id]/readings/route.ts` exactly for auth (`getAdminUserForRequest`), UUID validation, service role client, and cookie merging.

Query:

```typescript
const { data, error } = await supabase
  .from("onboarding_responses")
  .select(
    "id, patient_id, chief_complaint, existing_conditions, current_medications, allergies, smoking_status, alcohol_use, activity_level, dietary_notes, additional_notes, submitted_at"
  )
  .eq("patient_id", id)
  .order("submitted_at", { ascending: false })
  .limit(1)
  .maybeSingle();
```

Return `{ onboarding: data }` where `data` may be `null` (patient hasn't submitted onboarding yet).

Define a TypeScript interface `AdminOnboardingJson` in this file for the response shape.

## Step 2 — Create `app/api/admin/patients/[id]/notes/route.ts`

This route handles both GET (list notes) and POST (create/update note).

### GET handler

Returns all consultation notes for this patient, ordered newest first.

```typescript
const { data, error } = await supabase
  .from("consultation_notes")
  .select("id, patient_id, appointment_id, content, created_at, updated_at")
  .eq("patient_id", id)
  .order("created_at", { ascending: false });
```

Parse the `content` field of each row from a JSON string into `{ private: string; forPatient: string }`. If parsing fails (e.g. legacy plain text), treat the value as `{ private: content, forPatient: "" }`.

Return: `{ notes: ParsedNote[] }` where `ParsedNote` is:

```typescript
interface ConsultNoteJson {
  id: string;
  patientId: string;
  appointmentId: string | null;
  privateContent: string;
  forPatientContent: string;
  createdAt: string;
  updatedAt: string;
}
```

### POST handler

Accepts a body: `{ privateContent: string; forPatientContent: string; noteId?: string }`.

- If `noteId` is provided and is a valid UUID: update the existing note's `content` field.
- If no `noteId`: insert a new note row with `appointment_id: null`.

Always set `content` as `JSON.stringify({ private: privateContent, forPatient: forPatientContent })`.

Return: `{ note: ConsultNoteJson }` (the saved/updated note, parsed same as GET).

## Step 3 — Rewrite `app/admin/patients/[id]/consult/page.tsx`

This is the most significant change. Rewrite the component to use real data. Keep the visual layout identical — do not change the UI/design.

### 3a — Remove all mock data imports

Remove every import from `@/lib/mock-data` in this file. The component should import only from:

- `react`
- `next/navigation` (`useParams`, `useRouter`)
- `next/link`
- `@/components/admin/AdminLayout`
- `@/components/admin/AdminPageSkeleton`  
- `@/components/ui/*` (Button, Dialog, etc.)
- `lucide-react`
- `date-fns`
- `sonner`
- `@/lib/utils`
- `@/lib/types/admin-reading` (for `AdminReadingJson`)

### 3b — Define local types

Since mock-data types are removed, define these locally in the file:

```typescript
interface AdminPatientBasic {
  id: string;
  ghl_contact_id: string;
  full_name: string;
  phone: string;
  status: string;
}

interface AdminOnboarding {
  chief_complaint: string;
  existing_conditions: string[];
  current_medications: string[];
  allergies: string[];
  dietary_notes: string;
  additional_notes: string;
}

interface ConsultNote {
  id: string;
  patientId: string;
  appointmentId: string | null;
  privateContent: string;
  forPatientContent: string;
  createdAt: string;
  updatedAt: string;
}
```

### 3c — Data fetching

On mount, fetch all data in parallel using `Promise.all`:

1. `GET /api/admin/patients/${patientId}` → patient
2. `GET /api/admin/patients/${patientId}/readings` → all readings (no slice)
3. `GET /api/admin/patients/${patientId}/onboarding` → onboarding (may be null)
4. `GET /api/admin/patients/${patientId}/notes` → consultation notes

Store in state:

```typescript
const [patient, setPatient] = useState<AdminPatientBasic | null>(null);
const [readings, setReadings] = useState<AdminReadingJson[]>([]);
const [onboarding, setOnboarding] = useState<AdminOnboarding | null>(null);
const [notes, setNotes] = useState<ConsultNote[]>([]);
const [loading, setLoading] = useState(true);
```

All fetches use `credentials: "include"`. Show `<AdminPageSkeleton />` while loading.

If the patient fetch returns 401, redirect to `/admin/login`. If it returns 404, show an error message.

### 3d — Session notes behaviour

The panel has two text areas: "MY NOTES" (private) and "NOTE FOR PATIENT".

On load: 

- If there are existing notes, populate the private textarea with the most recent note's `privateContent`.
- The "NOTE FOR PATIENT" textarea starts empty each session (it's meant for the current session's patient message, not loaded from history).
- Track the `noteId` of the most recent note in state so POST can update it: `const [currentNoteId, setCurrentNoteId] = useState<string | null>(null)`.

**Save Notes button:**
POST to `/api/admin/patients/${patientId}/notes` with `{ privateContent: notePrivate, forPatientContent: notePatient, noteId: currentNoteId ?? undefined }`. On success, update `currentNoteId` with the returned note's ID if it was a new insert.

**Send to Patient button:**
When clicked: POST to the same endpoint with `{ privateContent: notePrivate, forPatientContent: notePatient, noteId: currentNoteId ?? undefined }`. On success, mark `patientNoteSent` as true. Show a success toast. The button should become disabled and show "✓ Sent".

The "Send to Patient" note does NOT actually send a WhatsApp message yet (GHL integration is Phase 2). It just saves to the DB. The toast message should say `"Note saved. WhatsApp delivery will be added in Phase 2."` rather than claiming it was sent.

### 3e — Header: replace hardcoded patient name

The header currently has a hardcoded `<Link>Lily Tan</Link>`. Replace with:

```tsx
<Link href={`/admin/patients/${patientId}`}>
  {patient ? patient.full_name : "…"}
</Link>
```

Remove the "Session X of Y" indicator entirely — session count is not tracked in Phase 1.

### 3f — "Mark Session Complete" button

Keep the button. When clicked: show a confirmation toast ("Session marked as reviewed."). Set local state `sessionMarked: true`. No API call needed yet — this is a UX affordance only in Phase 1.

### 3g — Remove "Schedule Next Session"

Remove:

- The `scheduleModalOpen` state and all related states (`selectedDate`, `selectedTime`, `windows`)
- The `handleConfirmSchedule` function
- The `availableDates`, `timeSlots` logic
- The `parseTime` and `formatTime` helper functions
- The `isUnavailable` function
- The entire `<Dialog>` for the schedule modal
- The "Schedule Next Session →" button from the bottom action bar
- All `localStorage` calls related to scheduling or availability windows

The bottom action bar should only have: "← Update Guide" button (keeps working as-is).

### 3h — Left panel data: show real onboarding

The left panel renders conditions, medications, and allergies.

Replace mock data references with the real `onboarding` state:

- `MOCK_ONBOARDING.existingConditions` → `onboarding?.existing_conditions ?? []`
- `MOCK_ONBOARDING.currentMedications` → `onboarding?.current_medications ?? []`
- `MOCK_ONBOARDING.allergies` → `onboarding?.allergies ?? []`
- `MOCK_ONBOARDING.chiefComplaint` → `onboarding?.chief_complaint ?? ""`
- `MOCK_ONBOARDING.symptoms` → remove (no symptoms field in DB; keep just chief complaint)

If `onboarding` is null (patient hasn't submitted onboarding), show a small note in the left panel: "No onboarding data yet."

### 3i — Left panel data: readings

Replace `readings.slice(0, 5)` with all readings (no slice). The table in the left panel already uses a compact format — keep it as-is but remove the `.slice(0, 5)` call so all readings appear.

### 3j — Previous notes section

Replace `MOCK_CONSULTATION_NOTES` with the `notes` state array. Each note renders using `note.privateContent` (where the current code uses `note.patientNote`). 

For the "Sent to patient" indicator: check `note.forPatientContent.length > 0` instead of `note.patientNoteSentAt`.

The word count (`wordCount`) should use `notePrivate` state as before.

## Important notes

- Keep the `safeFormat` helper function in this file (it's defined locally, not imported)
- The `VitalCard` sub-component at the bottom of the file should remain unchanged
- All `localStorage` calls in this file should be removed entirely (no more demo data)
- The `params.id` is the **patient UUID** (not GHL contact ID) — use it as `patientId`
- Make sure every `async` call inside event handlers is wrapped in `void` or properly awaited

=== END TASK 6 ===

```

---

## TASK 7 — Admin Dashboard: Real Data

```

=== START TASK 7 ===

You are replacing hardcoded fake statistics on the admin dashboard with real Supabase data, and removing stats that cannot be calculated yet. Read all referenced files before making any changes.

## Project context

The admin dashboard at `/admin/dashboard` shows: "Total Active Patients: 42", "Readings to Review: 7", "Meetings Today: 3", "Guide Adherence: 84%". All of these are hardcoded literals. There is also a "Recent Activity" section showing 3 hardcoded entries.

**What can be calculated in Phase 1:**

- Total active patients — count from `patients` table where `status = 'active'`
- Readings submitted in the last 7 days — count from `daily_readings` 
- Recent actual reading submissions — last 5 rows from `daily_readings` joined with `patients.full_name`

**What cannot be calculated yet (remove these):**

- "Guide adherence" — requires tracking whether patients followed their plan (not in scope)
- "Meetings today" — requires live Cal.com appointment data (Phase 2+)

## Coding standards (mandatory)

- Strict TypeScript — no `any`, no `!` non-null assertion, no `as unknown as T`
- Double quotes for all strings
- Template literals instead of string concatenation
- Full code, no placeholders or TODOs
- Comments only explain non-obvious intent, never narrate what the code does

## Files to read first

1. `app/admin/dashboard/page.tsx` — the dashboard page (read fully)
2. `app/api/admin/patients/route.ts` — to understand admin auth pattern for the new stats route
3. `lib/supabase/admin.ts` — service role client
4. `supabase/migrations/20260416120000_initial_schema.sql` — for table schemas

## Step 1 — Create `app/api/admin/stats/route.ts`

A new GET route, admin-only (same auth pattern as other admin routes).

Run these queries in parallel using `Promise.all`:

```typescript
// 1. Total active patients
const { count: activePatients } = await supabase
  .from("patients")
  .select("*", { count: "exact", head: true })
  .eq("status", "active");

// 2. Readings in last 7 days
const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
const { count: recentReadingsCount } = await supabase
  .from("daily_readings")
  .select("*", { count: "exact", head: true })
  .gte("submitted_at", sevenDaysAgo.toISOString());

// 3. Recent reading activity (last 5 submissions, with patient name)
const { data: recentActivity } = await supabase
  .from("daily_readings")
  .select("id, patient_id, reading_date, fasting_blood_sugar, blood_pressure_systolic, submitted_at, patients(id, full_name)")
  .order("submitted_at", { ascending: false })
  .limit(5);
```

For query 3, the Supabase join syntax `patients(id, full_name)` uses the FK relationship. The result will have a nested `patients` object on each row.

Return:

```json
{
  "activePatients": 4,
  "recentReadingsCount": 12,
  "recentActivity": [
    {
      "id": "uuid",
      "patientId": "uuid",
      "patientName": "Lily Tan",
      "readingDate": "2026-04-17",
      "fastingBloodSugar": 6.2,
      "bloodPressureSystolic": 128,
      "submittedAt": "2026-04-17T08:30:00Z"
    }
  ]
}
```

Define a TypeScript interface `AdminStatsJson` for this response shape. Define `RecentActivityItem` for each item in the array.

Handle cases where counts are null (Supabase returns `null` if no rows match) — coerce to `0`.

For the `patients` join — it will return `{ id: string; full_name: string } | null` — extract `full_name` safely.

## Step 2 — Update `app/admin/dashboard/page.tsx`

### 2a — Add state and fetch

Add state for the stats:

```typescript
interface DashboardStats {
  activePatients: number;
  recentReadingsCount: number;
  recentActivity: RecentActivityItem[];
}
```

Define `RecentActivityItem` locally (same shape as in the API response). Fetch `/api/admin/stats` on mount (in the same `useEffect` that sets `mounted`). Store results in a `stats` state with a sensible default (all zeros, empty array). If the fetch fails, leave defaults in place — do not crash.

### 2b — Replace hardcoded stat cards

**Keep (with real data):**

- "Total Active Patients" card → use `stats.activePatients` instead of `42`. Remove the "↑ 3 this week" badge (can't calculate this).
- "Readings (last 7 days)" card → replace the "Readings to Review" card. Use `stats.recentReadingsCount`. Rename label to "Readings (7 days)". Change the icon to a `TrendingUp` or `ClipboardList` icon. Remove the amber alert styling — this is informational, not an alert. Remove the `reviewCount > 0` pulsing badge logic.

**Remove entirely:**

- "Meetings Today" card — remove the whole card
- "Guide Adherence" card — remove the whole card

The stat cards grid was `md:grid-cols-4`. Change it to `md:grid-cols-2` since only 2 cards remain.

### 2c — Replace "Recent Activity" section

Replace the three hardcoded `<Link>` items with a map over `stats.recentActivity`.

For each item, render a row showing:

- Patient name (link to `/admin/patients/${item.patientId}`)
- "Logged a reading" as the action text
- Fasting blood sugar: `${item.fastingBloodSugar} mmol/L` and BP: `${item.bloodPressureSystolic} mmHg` as the subtitle
- Relative time: use `formatDistanceToNow` from `date-fns` on `item.submittedAt` with `{ addSuffix: true }`

If `recentActivity` is empty, show: "No readings submitted yet."

Remove all the mock-specific `opacity-70` classes and hardcoded patient names.

### 2d — Update the greeting

The greeting `"Good morning, Dr. Jasmine. Here's what's happening today."` is fine — keep it.

## Important notes

- Import `formatDistanceToNow` from `date-fns` for relative time display
- The Supabase join for `patients(id, full_name)` — the result type will be `{ patients: { id: string; full_name: string } | null }` on each row. Handle the null case.
- All count queries use `{ count: "exact", head: true }` — they return `{ count: number | null }` from Supabase
- Keep the `AdminLayout` wrapper, skeleton loader, and animation intact
- Remove the hardcoded `const reviewCount = 7` line

=== END TASK 7 ===

```

```

