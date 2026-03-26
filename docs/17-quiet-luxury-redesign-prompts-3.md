# 17 — Quiet Luxury Redesign — Prompt 3: Remaining Pages, Admin Sweep & Final Polish

## How to Use This Document

Copy everything below the `---` line and paste it as a single prompt to the agent.
This is Prompt 3 of 3. **Prompts 1 and 2 must be completed first** — they establish
the design system, motion components, and key pages that this prompt builds on.

**Agent model:** Gemini 3.1 Pro (high)

---

## Prompt 3: Log Flow, Guide, FAQ, Appointment, Admin Sweep & Polish

### Your Role

You are completing the final phase of a "Quiet Luxury" design overhaul for a Next.js
patient portal. Prompts 1 and 2 have been completed, which means:

- The forest green palette (`#2D5E4C`) is in `tailwind.config.ts` and `globals.css`
- `framer-motion` is installed with motion components in `components/motion/`
- `components/ui/button.tsx` uses subtle 2-stop gradient, no gold CTA variant
- `components/ui/card.tsx` has three tiers (default, elevated, tinted)
- `PatientPageLayout` wraps content in `MotionStagger` for page entrance
- `BottomNav` has `layoutId` pill animation, 72px height, floating shadow
- Home page has serif/sans greeting (no emoji), staggered entrance
- Onboarding has new fields from Dr. Jasmine's intake form (6 steps)
- Book and Pending pages are redesigned
- `MOCK_ONBOARDING` interface is updated with new field structure

### Project Context

- **Framework:** Next.js 14 App Router
- **Styling:** Tailwind CSS with forest green tokens
- **Motion:** `framer-motion` + `components/motion/MotionStagger`, `MotionItem`, `MotionStep`
- **Icons:** `lucide-react`
- **Fonts:** Plus Jakarta Sans (body) + DM Serif Display (display via `font-display` class)
- **Mock data:** `lib/mock-data.ts`
- **Patient routes:** `app/p/demo/*`
- **Admin routes:** `app/admin/*`

### Coding Standards

- TypeScript strict mode. No `any` type. No non-null assertions (`!`). No cast to `unknown`.
- Use double quotes (`"`) for all strings.
- Include JSDoc headers on all exported functions and components.
- No emoji anywhere in the UI. Use Lucide icons or typographic treatments.
- All patient-facing text minimum 14px. Touch targets minimum 48×48px.

### Design System Quick Reference

**Colours:**
- Primary: `#2D5E4C` (forest green), hover: `#244D3F`, light: `#EEF5F1`, muted: `#3A7D66`
- Accent gold: `#B8860B` — ONLY for section labels, logo details. Never button fills.
- Background: `#FAF8F5`, Surface: `#FFFFFF`, Depth: `#EDE8E1`, Border: `#E5DFD8`
- Text: `#1C1917` (primary), `#44403C` (strong), `#78716C` (secondary), `#A8A29E` (tertiary)

**Typography:**
- Hero headings: DM Serif Display, 40px (or 32-36px for secondary hero moments)
- Page headings: DM Serif Display, 28px
- Section headings: Plus Jakarta Sans, 20px, weight 600
- Body: Plus Jakarta Sans, 16-18px, weight 400
- Labels: Plus Jakarta Sans, 13px, weight 500, uppercase, tracking 0.1em

**Motion patterns:**
- Page content wrapped in `<MotionStagger>` with `<MotionItem>` children
- Multi-step forms use `<MotionStep stepKey={step} direction={direction}>`
- Scroll reveals: use framer-motion `useInView` hook for sections entering viewport

### Tasks

#### Task 1: Redesign Log Page (`app/p/demo/log/page.tsx`)

The log page is a multi-step form where patients enter 7 daily health readings.

**Visual changes:**
- Page uses `MotionStep` for step transitions between the 7 reading steps
- Each step heading uses DM Serif Display at 28px
- Bilingual labels (English + Chinese) keep the existing pattern but update colours
- The `NumberStepper` component should already have updated colours from Prompt 1
- "Enter readings manually" and "Take a photo instead" choice screen:
  use two standard cards, not buttons with icons embedded. Each card has an icon,
  a title, and a subtle description. The selected card gets the tinted card style.
- Step progress dots at the top use forest green (should already be updated)
- Bottom action bar: `<Button variant="default" size="patient">` for "Next →"
- `<Button variant="outline" size="patient">` for back arrow
- Any inline hex colours → use Tailwind tokens
- Any old gold/teal references → replace with forest green palette

**Duplicate reading dialog:** If a reading exists for the selected date, the dialog
should use proper `Dialog` component from `components/ui/dialog.tsx` with forest
green primary button. Remove any emoji-style indicators.

#### Task 2: Redesign Log Success Page (`app/p/demo/log/success/page.tsx`)

This is a key delight moment — the patient just completed their daily task.

**Success ceremony redesign:**
- Use DM Serif Display for "Done!" at 40px (hero heading)
- Keep the `CheckCircle2` icon but increase to 64px, wrapped in a 96px circle
  with `#EEF5F1` background
- The confetti dots concept: keep it but refine. Use only 4 dots (top, right, bottom,
  left) with forest green (`#2D5E4C`) and gold accent (`#B8860B`). Increase dot size
  to 3px. Use framer-motion for the burst animation instead of CSS-only.
- Stagger: icon animates in first (scale from 0 → 1, spring), then heading fades in
  (200ms delay), then subtitle (400ms delay), then countdown text (600ms delay)
- All `animate-in` classes can be replaced with framer-motion `motion.div` variants
  for a smoother, more orchestrated sequence
- Countdown text: "Returning home in {n}s..." — use `text-text-tertiary`, no `animate-pulse`
  (pulsing text is distracting, use static opacity instead)
- "Go home now" link: use `text-primary font-medium hover:underline`
- Update ALL hardcoded hex colours to Tailwind tokens

#### Task 3: Redesign Guide Page (`app/p/demo/guide/page.tsx`)

The guide is the patient's personalised dietary plan. It should feel like a
premium document, not a list.

**Visual changes:**
- Page heading: DM Serif Display — "Your Guide" at 28px
- Guide title (e.g. "Low Carb High Fat Diet"): DM Serif Display at 24px, below the heading
- "Last updated: March 2026" — `text-text-tertiary text-sm`
- Section headers ("FOODS TO AVOID", "FOODS YOU CAN EAT", etc.):
  Plus Jakarta Sans, 13px, weight 500, uppercase, tracking 0.1em, `text-text-secondary`
  with a subtle bottom border (1px `#E5DFD8`)
- "Foods to Avoid" (NO list): use a card with a very subtle red-tinted background
  (`#FEF2F2`) and red-tinted left accent bar
- "Foods You Can Eat" (YES list): use a card with forest green tinted background
  (`#EEF5F1`) and forest green left accent bar
- Food categories within YES list: each category (Meat, Vegetables, etc.) as a
  subsection with the category name in weight 600
- Replacements section: use a two-column layout with "→" arrow between items
- "Export as PDF" button: `<Button variant="outline" size="patient">`
- Add scroll reveal animation: each section fades in as user scrolls using
  framer-motion `useInView`. Create inline `motion.div` wrappers with
  `initial={{ opacity: 0, y: 20 }}` and `animate` triggered by `inView`.
- Update all colour references to use Tailwind tokens
- Wrap the initial page content in `<MotionStagger>` for the header area

#### Task 4: Redesign FAQ Page (`app/p/demo/faq/page.tsx`)

- Page heading: DM Serif Display — "Frequently Asked Questions" at 28px
- Subtitle: "Common questions about your health journey" in `text-text-secondary`
- Category headers (e.g. "About My Readings"): weight 600, text-lg, with generous
  spacing above (32px margin-top for each category after the first)
- Accordion items: clean design with forest green expand/collapse icons
- Accordion content: `text-text-secondary`, generous `leading-relaxed` (1.625)
- Wrap content in `<MotionStagger>` for entrance animation
- Each category group as a `<MotionItem>` for staggered entrance
- Update all colour references to use Tailwind tokens

#### Task 5: Redesign Appointment Page (`app/p/demo/appointment/page.tsx`)

- Page heading: DM Serif Display — "Your Appointment" at 28px
- Appointment details: elevated card with date/time prominently displayed
- Date in slightly larger font (20px, weight 600)
- "Join on Zoom" button: `<Button variant="default" size="patient" disabled>`
  with the 15-minute rule note below
- "Book a new appointment" and "Reschedule" links: `<Button variant="outline" size="patient">`
- Empty state (no appointment): standard card with `Calendar` icon, friendly message,
  and `<Button variant="default" size="patient">Book a consultation</Button>`
- Wrap content in `<MotionStagger>` with `<MotionItem>` children
- Update all colour references to use Tailwind tokens

#### Task 6: Admin Panel Colour Sweep

Update all admin pages to use the new forest green palette. The admin panel uses
the same primary colour as the patient portal but with a denser, Inter-based layout.

**Files to update:**
- `app/admin/page.tsx` — redirect page
- `app/admin/login/page.tsx` — admin login
- `app/admin/dashboard/page.tsx` — main dashboard
- `app/admin/patients/page.tsx` — patient list
- `app/admin/patients/new/page.tsx` — add patient form
- `app/admin/patients/[id]/page.tsx` — patient detail
- `app/admin/patients/[id]/consult/page.tsx` — consultation panel
- `app/admin/patients/[id]/guide/page.tsx` — guide builder
- `app/admin/schedule/page.tsx` — schedule view
- `components/admin/AdminLayout.tsx` — sidebar + layout

**For each file:**
1. Search for old teal hex values (`#1A7A6D`, `#155F55`, `#1E8B7D`, `#2A9D8F`,
   `#E6F4F1`, `#D4940A`, `#E0A30B`, `#B07D08`) and replace with forest green equivalents
2. Replace `#1A7A6D` → `#2D5E4C`
3. Replace `#155F55` → `#244D3F`
4. Replace `#1E8B7D` → `#33664F`
5. Replace `#2A9D8F` → `#3A7D66`
6. Replace `#E6F4F1` → `#EEF5F1`
7. Replace `#D4940A` (as text/accent, not button) → `#B8860B`
8. Replace `#E0A30B` → `#B8860B`
9. Replace `#B07D08` → `#9A7209`
10. Replace `#FBF3E0` → `#FAF0D6`
11. Replace `#F3EDE6` → `#EDE8E1`
12. Replace `#E8E4DF` → `#E5DFD8`
13. Replace any `border-primary` usage that was previously teal — now it references
    the primary token which is already forest green
14. Replace the `📷` and `✍️` emoji in the patient detail page with proper Lucide
    icons: `Camera` for auto/photo-extracted and `PenLine` for manual entry
15. Update any inline gradient button styles (raw `bg-gradient-to-b from-[...] via-[...] to-[...]`
    on raw `<button>` elements) to use the `<Button>` component instead
16. Update the AdminLayout sidebar — the `active` background should use the
    new forest green muted tint (keep the dark sidebar, just update the accent)

**Admin-specific:** The admin sidebar brand text "Dr. Jasmine" should use DM Serif
Display (it likely already does via `font-display` class). Ensure "METANOVA HEALTH"
subtitle is Plus Jakarta Sans, uppercase, tracked, `text-[#78716C]`, ~11px.

#### Task 7: DemoControls Update (`components/demo/DemoControls.tsx`)

- Update any hardcoded colour references to forest green palette
- The demo status switcher can keep its current design but use updated colours
- Ensure the component doesn't reference any removed onboarding fields

#### Task 8: Final Polish Pass

Do a comprehensive sweep across all files modified in Prompts 1-3:

**Colour consistency:**
- Run a search for these old hex values across the ENTIRE codebase (all `.tsx`,
  `.ts`, `.css` files) and replace any remaining instances:
  - `#1A7A6D` → `#2D5E4C`
  - `#155F55` → `#244D3F`
  - `#1E8B7D` → `#33664F`
  - `#2A9D8F` → `#3A7D66`
  - `#E6F4F1` → `#EEF5F1`
  - `#D4940A` → `#B8860B` (check context — should be accent detail, never button fill)
  - `#E0A30B` → `#B8860B`
  - `#B07D08` → `#9A7209`
  - `#FBF3E0` → `#FAF0D6`

**Emoji removal:**
- Search for emoji characters in all `.tsx` files. Common ones to remove:
  - `👋` (wave) — replace with nothing (typography provides warmth)
  - `📷` — replace with `Camera` Lucide icon
  - `✍️` — replace with `PenLine` Lucide icon
  - `✓` — replace with `Check` or `CheckCircle2` Lucide icon
  - Any other emoji found should be replaced with appropriate Lucide icons

**Button audit:**
- Search for any remaining raw `<button>` elements with inline gradient classes
  (`bg-gradient-to-b`) and replace with the `<Button>` component
- Search for any remaining `variant="cta"` or `variant="teal"` usage and replace
  with `variant="default"`
- Ensure no button has `text-shadow` or inset `box-shadow` styling

**Spacing consistency:**
- Patient page horizontal padding should consistently be `px-6` (24px)
- Section gaps should be `space-y-12` (48px) for major sections
- Card padding should be `p-6` (24px)

**Typography check:**
- All page headings in patient portal should use `font-display` class (DM Serif Display)
- No heading should use weight 800 (ExtraBold) — the serif font at 400 weight
  provides the visual impact
- Button text should be weight 500 (font-medium), not 600 (font-semibold)

**Motion check:**
- All patient pages should have staggered entrance animation via `MotionStagger`
- All multi-step forms should use `MotionStep` for transitions
- BottomNav should have `layoutId` on active pill

### Verification Checklist

After completing all tasks, verify:

- [ ] `npm run build` completes without errors
- [ ] No TypeScript errors
- [ ] No remaining old teal hex values (`#1A7A6D`, `#155F55`, `#1E8B7D`, `#2A9D8F`) in any `.tsx`/`.css` file
- [ ] No remaining old gold button values (`#D4940A`, `#E0A30B`, `#B07D08` as button fills) in any file
- [ ] No emoji characters in any `.tsx` file
- [ ] No raw `<button>` elements with inline gradient classes (all use `<Button>` component)
- [ ] No `variant="cta"` or `variant="teal"` usage anywhere
- [ ] All patient pages use `<MotionStagger>` for entrance animation
- [ ] All page headings use DM Serif Display (`font-display`)
- [ ] Admin sidebar uses forest green palette
- [ ] Admin pages have no references to old `age`, `sex`, `race` fields from old `MOCK_ONBOARDING`
- [ ] Guide page has scroll reveal animation on sections
- [ ] Log success page has orchestrated success ceremony
- [ ] FAQ accordion uses forest green icons
- [ ] App looks cohesive — consistent colours, typography, spacing, and motion across every page
