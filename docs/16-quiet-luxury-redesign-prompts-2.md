# 16 — Quiet Luxury Redesign — Prompt 2: Key Patient Pages & Onboarding Overhaul

## How to Use This Document

Copy everything below the `---` line and paste it as a single prompt to the agent.
This is Prompt 2 of 3. **Prompt 1 must be completed first** — it establishes the
design tokens, core components, and motion system that this prompt depends on.

**Agent model:** Gemini 3.1 Pro (high)

---

## Prompt 2: Patient Pages Redesign — Home, Onboarding, Book & Pending

### Your Role

You are continuing a "Quiet Luxury" design overhaul for a Next.js patient portal.
Prompt 1 has already been completed, which means:

- `tailwind.config.ts` and `app/globals.css` now use the forest green palette
  (primary `#2D5E4C`, accent gold `#B8860B` for details only)
- `components/ui/button.tsx` has been redesigned (subtle 2-stop gradient, no gold CTA variant)
- `components/ui/card.tsx` supports three tiers (default, elevated, tinted)
- `framer-motion` is installed
- `components/motion/MotionStagger.tsx`, `MotionItem.tsx`, `MotionStep.tsx` exist
- `components/patient/PatientPageLayout.tsx` wraps content in `MotionStagger`
- `components/patient/BottomNav.tsx` has `layoutId` pill animation, height 72px, floating shadow
- All old teal/gold colour references in components have been updated

### Project Context

- **Framework:** Next.js 14 App Router
- **Styling:** Tailwind CSS with custom tokens (see `tailwind.config.ts`)
- **Component primitives:** `@base-ui/react` + shadcn-style in `components/ui/`
- **Motion:** `framer-motion` + custom wrappers in `components/motion/`
- **Icons:** `lucide-react`
- **Fonts:** Plus Jakarta Sans (body, `--font-body`) + DM Serif Display (display, `--font-display`)
- **Mock data:** `lib/mock-data.ts`
- **Patient routes:** `app/p/demo/*`

### Coding Standards

- TypeScript strict mode. No `any` type. No non-null assertions (`!`). No cast to `unknown`.
- Use double quotes (`"`) for all strings.
- Use string templates or `.join()` instead of string concatenation.
- Include JSDoc headers on all exported functions and components.
- All patient-facing text minimum 14px. Primary body text 16-18px.
- Touch targets minimum 48×48px.
- **No emoji anywhere in the UI.** Use Lucide icons or typographic treatments.

### Design System Quick Reference

**Colours:**
- Primary: `#2D5E4C` (forest green), hover: `#244D3F`, light: `#EEF5F1`, muted: `#3A7D66`
- Accent gold: `#B8860B` — ONLY for section labels, logo details, accent typography. Never button fills.
- Background: `#FAF8F5`, Surface: `#FFFFFF`, Depth: `#EDE8E1`, Border: `#E5DFD8`
- Text: `#1C1917` (primary), `#44403C` (strong), `#78716C` (secondary), `#A8A29E` (tertiary)

**Typography:**
- Hero headings: DM Serif Display (`font-display`), 40px, weight 400, tracking -0.03em
- Page headings: DM Serif Display, 28px, weight 400, tracking -0.02em
- Section headings: Plus Jakarta Sans, 20px, weight 600
- Body: Plus Jakarta Sans, 16-18px, weight 400
- Labels: Plus Jakarta Sans, 13px, weight 500, uppercase, tracking 0.1em
- Button text: 16px, weight 500

**Spacing (8px grid):**
- Page horizontal padding: 24px (`px-6`)
- Between major sections: 48px (`space-y-12`)
- Card internal padding: 24px (`p-6`)
- Between heading and description: 8px

**Buttons:** Use `<Button variant="default" size="patient">` for primary actions.
No gold/CTA variant exists. Use `variant="outline"` for secondary actions.

**Cards:** Use `<Card variant="elevated">` for important cards (task, appointment).
Use `<Card>` (default) for standard content. Use `<Card variant="tinted">` for
completed/active states.

**Motion:** Wrap page content in `<MotionStagger>` with `<MotionItem>` children.
Use `<MotionStep>` for multi-step form transitions.

### Tasks

#### Task 1: Redesign Home Page (`app/p/demo/home/page.tsx`)

The home page is the first thing active patients see daily. It must feel premium
and calming, with clear hierarchy.

**Greeting section — two-line typographic treatment (NO emoji):**
```tsx
{/* Line 1: understated greeting */}
<p className="text-[#78716C] text-lg font-normal">{greeting},</p>
{/* Line 2: patient name in serif — this IS the warmth */}
<h1 className="font-display text-[40px] font-normal tracking-[-0.03em] text-[#1C1917] leading-tight">
  {firstName}
</h1>
{/* Subtitle */}
<p className="text-[#78716C] text-base mt-2">Welcome to your health portal.</p>
```

Remove the `👋` emoji entirely. The serif name provides warmth through typography.

**"TODAY'S TASK" label:** Use gold accent colour (`#B8860B`, text-xs font-medium
uppercase tracking-[0.1em]`). This is where gold belongs — as a rare typographic accent.

**Task card:** Use the elevated card tier (no gradient background, no `border-l-4`).
Instead, implement the left accent bar as a `::before` pseudo-element with rounded
ends. Remove the decorative SVG arc. Clean, spacious layout.

**When readings logged:** Use the tinted card tier (`#EEF5F1` background). Replace
the `✓` text character with a `CheckCircle2` Lucide icon. Remove the "Readings logged ✓"
text pattern — instead: "All done for today" as the heading with the checkmark icon.

**Appointment card:** Standard card tier (not elevated). Clean layout with date
in slightly larger font. Disabled "Join on Zoom" button uses the primary button
style at 50% opacity (not a raw styled `<button>` with inline gradient classes).
Use `<Button variant="default" size="patient" disabled>`.

**Wrap the entire page content in `<MotionStagger>`** with each major section
(greeting, task card, appointment section) as `<MotionItem>` children. This creates
the staggered entrance animation — elements appear sequentially, not all at once.

**Section headers:** "UPCOMING APPOINTMENT" label should use the same style as
"TODAY'S TASK" — `text-xs font-medium uppercase tracking-[0.1em] text-[#78716C]`.

**Remove ALL hardcoded hex colours** like `text-[#78716C]`, `bg-[#FAF8F5]`,
`text-[#1C1917]`. Use Tailwind tokens instead: `text-text-secondary`, `bg-bg-app`,
`text-text-primary` (or `text-main`). The only hardcoded hex should be the inline
`font-family: var(--font-display)` if the `font-display` utility doesn't apply.

#### Task 2: Complete Onboarding Overhaul (`app/p/demo/onboarding/page.tsx`)

This is a major change. The onboarding form gets new fields from Dr. Jasmine's
official intake form, plus a visual overhaul.

**New `StepData` type — replace the existing one entirely:**

```typescript
type OccupationType =
  | "business_owner"
  | "leader"
  | "freelancer"
  | "employee"
  | "retired"
  | "unemployed";

type StepData = {
  /** Step 1 — Personal Details */
  fullName: string;
  icOrPassport: string;
  gender: string;
  contactNumber: string;
  email: string;
  homeAddress: string;

  /** Step 2 — Occupation & Contacts */
  occupation: OccupationType | "";
  emergencyContact: string;
  referredBy: string;
  payerFullName: string;

  /** Step 3 — Health Background */
  chiefComplaint: string;
  existingConditions: string[];
  currentMedications: string[];
  allergies: string[];

  /** Step 4 — Lifestyle */
  smokingStatus: string;
  alcoholUse: string;
  activityLevel: string;
  dietaryNotes: string;
  familyHistory: string;
  additionalNotes: string;

  /** Step 5 — Terms & Conditions */
  agreedToTerms: boolean;
  agreedToTestimonial: boolean | null;
};
```

**New step structure (6 steps including review):**

**Step 1 — Personal Details:**
All labels are bilingual (English + Chinese). Fields:
- Full Name / 病患的全名 (text input, required)
- IC (xxxxxx-xx-xxxx) or Passport Number / 身份证/护照号码 (text input, required)
- Gender / 性别 (radio: Male 男 / Female 女, required) — only two options, large tap targets
- Contact Number / 联络号码 (tel input, required)
- Email / 电邮 (email input, required)
- Home Address / 住家地址 (textarea, required)

**Step 2 — Occupation & Contacts:**
- Current Job Title / 目前职位 (radio grid, required):
  Business Owner 企业家/老板 | Leader 领导 | Freelancer 自由业 |
  Employee 打工族 | Retired 退休 | Unemployed 暂时没有工作
- Emergency Contact / 紧急联络人 (Name & Phone in one textarea field, required)
- Referred By / 介绍人 (text input, optional)
- Payer Full Name / 付款人全名 (text input, required)

**Step 3 — Health Background:**
Keep the existing pattern (chief complaint textarea, multi-add chips for conditions/
medications/allergies). Update the visual style: chip pills use forest green light
background (`#EEF5F1`), the "Add" button uses the default button variant at a smaller
size. Remove any teal colour references.

**Step 4 — Lifestyle:**
Keep the existing pattern (smoking, alcohol, activity radio groups + textareas).
Update the radio button styling: selected state uses forest green light bg + forest
green text + forest green border. Unselected uses `border-[#E5DFD8]`. Add family
history and additional notes textareas to this step (consolidate from old step 4).

**Step 5 — Terms & Conditions:**
New step. Display:
- Programme Terms & Conditions section with a summary and link to the full PDF:
  `https://drive.google.com/file/d/1rSxdxzg3AkhONK0XuNxewY1R1Sa_j759/view`
  "I hereby acknowledge that I have read, understand and agree to these terms..."
  (display bilingual text)
  Checkbox: "Yes, I agree / 是的，我同意" — must be checked to proceed.

- Testimonial Agreement section:
  "I hereby give Metanova Health and its associates the permission to take
  photographs and videos of me..." (display bilingual text)
  Radio: "Yes, I agree / 是的，我同意" or "No, I disagree / 不，我不同意"
  — a selection is required but either answer is acceptable.

**Step 6 — Review & Submit:**
Redesign as a premium "summary receipt." Each section gets its own card with a
subtle tinted header (`#EDE8E1` background). Use proper label/value pairs with
generous spacing. Section headings in DM Serif Display at 20px.

**Visual/interaction changes across all steps:**
- Page heading for each step: DM Serif Display, 28px, weight 400
- Step transitions: wrap each step's content in `<MotionStep stepKey={step} direction={direction}>`
  where `direction` is `1` when going forward and `-1` when going back
- Update the `StepProgress` dots to use forest green colours
- The bottom action bar: keep the frosted glass look but update colours
- "Next →" button: `<Button variant="default" size="patient">`
- "Submit →" button on review step: same `<Button variant="default" size="patient">`
  (NOT a gold button — there is no gold button variant)
- Remove the halfway-there encouragement messages ("You're halfway there!")
  — they feel cheap, not premium. Let the progress dots speak for themselves.
- Validation error text: use `text-danger` token

**Update `MOCK_PATIENT` default name in initial state** if needed — the form
pre-fills `fullName` from `MOCK_PATIENT.fullName`.

**Update `submitForm()` to save the new fields** to localStorage under
`"demo_onboarding_data"`. Keep the existing redirect flow (set status to
`"booked"`, redirect to `/p/demo/book`).

**Success screen (after submit):** The existing checkmark animation is fine
conceptually but needs polish. Use DM Serif Display for "You're all set!" at
32px. Use `animate-in` patterns that already exist. Update colours to forest green.

#### Task 3: Update Book Page (`app/p/demo/book/page.tsx`)

- Update all hardcoded colour values to use Tailwind tokens
- Page heading in DM Serif Display: "Book Your Consultation"
- Ensure the date/time picker uses forest green for selected states
- Primary "Confirm Booking" button: `<Button variant="default" size="patient">`
- Wrap content in `<MotionStagger>` with `<MotionItem>` children
- Remove any old teal/gold hex references

#### Task 4: Redesign Pending Page (`app/p/demo/pending/page.tsx`)

The pending page is a key brand moment — patients see it after booking and
every time they return before their first consultation.

- Use DM Serif Display for "You're all booked in!" at 36px
- Wrap content in `<MotionStagger>` with staggered entrance
- Appointment details card: use the elevated card tier
- "Join on Zoom" disabled button: use `<Button variant="default" size="patient" disabled>`
  (not a raw styled `<button>` with inline gradient classes)
- "How to Prepare" card: use standard card tier with clean list formatting
- The decorative S-curve SVG: keep but update stroke colour from `#1A7A6D` to `#2D5E4C`
- WhatsApp link at bottom: subtle text link with forest green colour, no background pill
- Remove any old teal hex references

#### Task 5: Update mock data (`lib/mock-data.ts`)

Update the `OnboardingResponse` interface and `MOCK_ONBOARDING` constant to match
the new field structure:

```typescript
export interface OnboardingResponse {
  /** Administrative fields */
  icOrPassport: string;
  gender: "male" | "female";
  contactNumber: string;
  email: string;
  homeAddress: string;
  occupation: string;
  emergencyContact: string;
  referredBy: string;
  payerFullName: string;
  agreedToTerms: boolean;
  agreedToTestimonial: boolean;

  /** Medical fields */
  chiefComplaint: string;
  existingConditions: string[];
  currentMedications: string[];
  allergies: string[];
  familyHistory: string;

  /** Lifestyle fields */
  smokingStatus: "never" | "former" | "current";
  alcoholUse: "none" | "occasional" | "moderate" | "frequent";
  activityLevel: "sedentary" | "light" | "moderate" | "active";
  dietaryNotes: string;
  additionalNotes: string;
}

export const MOCK_ONBOARDING: OnboardingResponse = {
  icOrPassport: "880101-14-5678",
  gender: "female",
  contactNumber: "+60 12 345 6789",
  email: "lily@example.com",
  homeAddress: "123 Jalan Bukit Bintang, 55100 Kuala Lumpur",
  occupation: "retired",
  emergencyContact: "Ken Tan — +60 12 987 6543",
  referredBy: "Dr. Ahmad",
  payerFullName: "Lily Tan",
  agreedToTerms: true,
  agreedToTestimonial: true,
  chiefComplaint: "High blood sugar and weight gain",
  existingConditions: ["Type 2 Diabetes", "Hypertension"],
  currentMedications: ["Metformin 500mg twice daily", "Lisinopril 10mg once daily"],
  allergies: ["Penicillin"],
  familyHistory: "",
  smokingStatus: "never",
  alcoholUse: "occasional",
  activityLevel: "sedentary",
  dietaryNotes: "",
  additionalNotes: "",
};
```

Remove the old `age`, `sex`, `race`, `emergencyContactName`, `emergencyContactPhone` fields.

**Important:** After updating the interface, check ALL files that import
`MOCK_ONBOARDING` or `OnboardingResponse` and fix any broken references.
Files to check:
- `app/admin/patients/[id]/page.tsx`
- `app/admin/patients/[id]/consult/page.tsx`
- `app/admin/patients/new/page.tsx`
- `components/demo/DemoControls.tsx`

Update these files to use the new field names (e.g. `emergencyContactName` →
`emergencyContact`, `sex` → `gender`). If admin pages displayed `age` or `race`,
remove those references since those fields no longer exist.

### Verification Checklist

After completing all tasks, verify:

- [ ] `npm run build` completes without errors
- [ ] Home page has no emoji — greeting uses serif/sans two-line treatment
- [ ] Home page uses `<MotionStagger>` for staggered entrance
- [ ] Onboarding has 6 steps with new field structure (personal, occupation/contacts, health, lifestyle, T&C, review)
- [ ] Onboarding step transitions use `<MotionStep>`
- [ ] No `cta` or `teal` button variants used anywhere in modified files
- [ ] No hardcoded old teal hex values (`#1A7A6D`, `#155F55`, etc.) in modified files
- [ ] No emoji characters in any modified file
- [ ] `MOCK_ONBOARDING` matches new interface — no `age`, `sex`, `race` fields
- [ ] All admin pages that reference `MOCK_ONBOARDING` compile without errors
- [ ] Book page and Pending page use forest green palette
- [ ] All buttons use `<Button>` component, not raw `<button>` with inline gradient classes
