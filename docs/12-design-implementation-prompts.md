# 12 — Design Implementation Prompts

## How to Use This Document

This document contains **8 self-contained prompts** for an AI coding agent.
Each prompt should be copied and pasted as a standalone task. They are ordered
by dependency — complete them in sequence (Prompt 1 must be done first as
later prompts depend on the updated design tokens).

**Agent model:** Gemini 3.1 Pro (high)
**Estimated scope per prompt:** 3–8 files modified, focused on one coherent
area of the codebase.

### Important Context for All Prompts

This is a Next.js 14 App Router project with:
- **Styling:** Tailwind CSS with a custom `tailwind.config.ts`
- **CSS variables:** Defined in `app/globals.css` as HSL values
- **Component library:** shadcn/ui primitives in `components/ui/`
- **Component primitives:** `@base-ui/react` (Button, Input)
- **Icons:** `lucide-react`
- **Toasts:** `sonner` (already configured in `app/layout.tsx`)
- **Font:** `Plus Jakarta Sans` (loaded via `next/font/google` in `app/layout.tsx`)
- **Date handling:** `date-fns`
- **Patient portal routes:** `app/p/demo/*`
- **Admin panel routes:** `app/admin/*`
- **Mock data:** `lib/mock-data.ts`

### Coding Standards (include in your system prompt or rules)

- TypeScript strict mode. No `any` type. No non-null assertions (`!`).
- Use double quotes (`"`) for all strings.
- Use string templates or `.join()` instead of string concatenation.
- Include JSDoc headers on all exported functions and components.
- Include clear inline comments describing non-obvious logic.
- Implement error checking and type validation.
- Use Tailwind CSS for styling. No inline `style` attributes except for
  dynamic values that cannot be expressed as Tailwind classes.
- All patient-facing text must be minimum 14px (`text-sm`). Primary body
  text should be 18px (`text-lg`) where possible. Only exception: bottom
  nav labels at 12px.
- Touch targets must be minimum 48×48px for patient-facing UI.

---

## Prompt 1: Design Tokens — Colours, Typography & Global Styles

> **Scope:** Update the foundational design tokens (CSS variables, Tailwind
> config, global CSS, font loading) that everything else builds on.

### Context

The app currently uses a flat teal (`#2A9D8F`) with coral accent (`#E76F51`)
and cool-toned text. The design direction calls for a shift to:
- **Deep teal** (`#1A7A6D`) as primary — richer and more premium
- **Warm gold** (`#D4940A`) as accent — replaces coral for CTAs
- **Warm ivory** (`#FAF8F5`) background with stone-toned text (`#1C1917`)
- **DM Serif Display** as a display/brand font (for logo text, guide headers)
- Gradient capability for buttons and backgrounds
- Coloured shadows instead of grey shadows

### Tasks

**1. Update `app/globals.css`**

Replace the existing `:root` CSS variables block with the new palette.
Keep the `@tailwind` directives and `@layer base` structure. The HSL values
should match these hex colours:

```
--background:          FAF8F5   (warm ivory)
--foreground:          1C1917   (stone-900, warm near-black)
--card:                FFFFFF
--card-foreground:     1C1917
--popover:             FFFFFF
--popover-foreground:  1C1917
--primary:             1A7A6D   (deep teal)
--primary-foreground:  FFFFFF
--secondary:           F3EDE6   (warm depth)
--secondary-foreground: 44403C  (stone-700)
--muted:               F3EDE6
--muted-foreground:    78716C   (stone-500)
--accent:              D4940A   (warm gold)
--accent-foreground:   FFFFFF
--destructive:         DC2626
--destructive-foreground: FFFFFF
--border:              E8E4DF   (warm border)
--input:               E8E4DF
--ring:                1A7A6D
--radius:              0.75rem  (12px base, up from 8px)
```

Also update the utility classes in the `@layer utilities` block:
- `.text-main` → `color: #1C1917;`
- `.bg-app` → `background-color: #FAF8F5;`
- `.text-secondary` → `color: #78716C;`

Add these new utility classes:
- `.bg-depth` → `background-color: #F3EDE6;`
- `.text-tertiary` → `color: #A8A29E;`
- `.font-display` → `font-family: var(--font-display);`

Add a CSS variable for the display font (the actual font is loaded in
layout.tsx — see task 3):
```css
:root {
  --font-display: "DM Serif Display", serif;
}
```

Keep the existing `*:focus-visible` rule but update the ring colour:
```css
*:focus-visible {
  @apply outline-none ring-2 ring-ring ring-offset-2;
}
```

**2. Update `tailwind.config.ts`**

Update the `theme.extend.colors` section to match the new palette:

```typescript
colors: {
  primary: {
    DEFAULT: "#1A7A6D",
    hover: "#155F55",
    light: "#E6F4F1",
    vibrant: "#2A9D8F",
    foreground: "#FFFFFF",
  },
  accent: {
    DEFAULT: "#D4940A",
    hover: "#B07D08",
    light: "#FBF3E0",
    foreground: "#FFFFFF",
  },
  success: {
    DEFAULT: "#16A34A",
    foreground: "#FFFFFF",
  },
  danger: {
    DEFAULT: "#DC2626",
    foreground: "#FFFFFF",
  },
  warning: {
    DEFAULT: "#D97706",
    foreground: "#FFFFFF",
  },
  "bg-app": "#FAF8F5",
  depth: "#F3EDE6",
  surface: "#FFFFFF",
  text: {
    primary: "#1C1917",
    main: "#1C1917",
    secondary: "#78716C",
    tertiary: "#A8A29E",
  },
  sidebar: {
    bg: "#1C1917",
    text: "#D6D3D1",
    active: "#292524",
  },
  // Keep the HSL-variable-based colours for shadcn compatibility
  border: "hsl(var(--border))",
  input: "hsl(var(--input))",
  ring: "hsl(var(--ring))",
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",
  secondary: {
    DEFAULT: "hsl(var(--secondary))",
    foreground: "hsl(var(--secondary-foreground))",
  },
  destructive: {
    DEFAULT: "hsl(var(--destructive))",
    foreground: "hsl(var(--destructive-foreground))",
  },
  muted: {
    DEFAULT: "hsl(var(--muted))",
    foreground: "hsl(var(--muted-foreground))",
  },
  popover: {
    DEFAULT: "hsl(var(--popover))",
    foreground: "hsl(var(--popover-foreground))",
  },
  card: {
    DEFAULT: "hsl(var(--card))",
    foreground: "hsl(var(--card-foreground))",
  },
},
```

Also update `--radius` to `0.75rem` and add a `boxShadow` extend section:

```typescript
boxShadow: {
  "card": "0 1px 2px rgba(28,25,23,0.04), 0 4px 16px -2px rgba(28,25,23,0.04)",
  "card-hover": "0 1px 2px rgba(28,25,23,0.06), 0 8px 24px -4px rgba(28,25,23,0.08)",
  "card-elevated": "0 1px 2px rgba(28,25,23,0.06), 0 12px 32px -4px rgba(28,25,23,0.12)",
  "btn-primary": "0 1px 0 rgba(255,255,255,0.12) inset, 0 4px 14px -2px rgba(26,122,109,0.3)",
  "btn-accent": "0 1px 0 rgba(255,255,255,0.15) inset, 0 4px 14px -2px rgba(212,148,10,0.35)",
},
```

**3. Update `app/layout.tsx`**

Add `DM_Serif_Display` as a second font loaded via `next/font/google`.
Apply it as a CSS variable so it can be used selectively:

```typescript
import { Plus_Jakarta_Sans, DM_Serif_Display } from "next/font/google";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

const dmSerifDisplay = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});
```

Update the `<body>` class to include both font variables:
```tsx
<body className={`${plusJakartaSans.variable} ${dmSerifDisplay.variable} ${plusJakartaSans.className} bg-app text-main antialiased`}>
```

Also update the metadata title and description:
```typescript
export const metadata: Metadata = {
  title: "Dr. Jasmine — Patient Portal",
  description: "Metanova Health — Diabetes Reversal Programme",
};
```

### Files to modify
- `app/globals.css`
- `tailwind.config.ts`
- `app/layout.tsx`

### Verification
After changes, run `npm run dev` and confirm:
- Background colour is warm ivory (not cool white)
- Text is warm near-black (not blue-black)
- No build errors from Tailwind config changes

---

## Prompt 2: Core Components — Button, Input, Card

> **Scope:** Upgrade the three most-used UI components to the new premium
> design language with gradient fills, coloured shadows, and warm tones.

### Context

The design system (documented in `docs/08-ui-ux.md`) specifies:
- Buttons with gradient backgrounds and coloured shadows
- A "gold CTA" variant for primary call-to-action buttons
- Inputs with warm ivory resting state and focus activation
- Cards with compound shadows and 20px border radius

The current Button component is at `components/ui/button.tsx` and uses
`class-variance-authority` (cva) with `@base-ui/react/button` as its
primitive. Keep this architecture.

### Tasks

**1. Update Button component (`components/ui/button.tsx`)**

Modify the `buttonVariants` to include premium styling. Keep the existing
variant names but update their styles. Add two new variants: `cta` (gold)
and `teal` (gradient teal). Here's what each variant should look like:

- `default` (teal gradient): Background gradient from #1E8B7D → #1A7A6D → #155F55.
  White text. Shadow: `shadow-btn-primary` (the custom shadow from Prompt 1).
  Inner border-top highlight for depth. On hover: slightly brighter gradient.
  On active: `scale-[0.98] translate-y-px`, shadow removed.
- `cta` (gold gradient — NEW): Background gradient from #E0A30B → #D4940A → #B07D08.
  White text with subtle text-shadow. Shadow: `shadow-btn-accent`. Same
  active/hover behaviour.
- `outline`: Keep border-based, but use `border-primary` border (1.5px),
  `text-primary`, and `bg-white/80` backdrop.
- `secondary`, `ghost`, `destructive`, `link`: Keep existing behaviour
  but ensure the colours reference the updated palette tokens.

Add a new size variant `patient` for patient-facing buttons:
```
h-14 (56px) gap-2 px-6 text-lg font-semibold rounded-[14px]
```

The existing `active:scale-[0.98] transition-transform active:not-aria-[haspopup]:translate-y-px`
is already in the base — keep it.

**2. Update Input component (`components/ui/input.tsx`)**

Update the input styling to match the new design:
- Resting state: `bg-[#FAF8F5]` (warm ivory), `border-[rgba(28,25,23,0.1)]` (1.5px), `rounded-[14px]`, `h-14` for patient-facing
- Focus state: `bg-white`, `border-primary`, `ring-primary/10` (3px ring)
- Placeholder: `text-text-tertiary`
- Font size: at least `text-base` (16px) to prevent iOS zoom

**3. Create or update Card component styles**

In `components/ui/card.tsx`, update the `Card` component's default classes:
- `rounded-[20px]` (increased from the current radius)
- `shadow-card` (the compound shadow from Prompt 1)
- `border border-[rgba(28,25,23,0.06)]` (very subtle warm border)
- `bg-white`

If the Card component uses cva or className passthrough, update the defaults.
Also add a "hover lift" utility in the card component for admin usage:
a prop or variant that adds `hover:-translate-y-0.5 hover:shadow-card-hover transition-all duration-150`.

### Files to modify
- `components/ui/button.tsx`
- `components/ui/input.tsx`
- `components/ui/card.tsx`

### Verification
- Visit any admin page — buttons should show gradients and coloured shadows
- Visit any patient page with inputs — warm ivory resting state visible
- Cards across the app have subtle compound shadows and 20px radius

---

## Prompt 3: Patient Bottom Nav & Layout

> **Scope:** Transform the bottom navigation from a basic tab bar to a
> premium frosted-glass nav with pill active indicators, and update the
> patient page layout wrapper with branded elements.

### Context

The bottom nav (`components/patient/BottomNav.tsx`) is a fixed bar with
5 tabs (Home, Log, Appointment, Guide, Help). Currently it's a plain
white bar with a top border. The design direction calls for:
- Frosted glass effect (semi-transparent white with backdrop-blur)
- Active tab indicated by a teal-tinted pill behind icon+label
- Slightly taller (64px)
- More refined spacing

The patient layout wrapper (`components/patient/PatientPageLayout.tsx`)
wraps all patient pages with a `max-w-md` container, `DemoControls`,
and the `BottomNav`. It should be updated to incorporate the warm ivory
background and subtle branded background elements.

### Tasks

**1. Update BottomNav (`components/patient/BottomNav.tsx`)**

Replace the current nav styling with:

```
nav element:
  - background: rgba(255, 255, 255, 0.82)
  - backdrop-filter: blur(20px) saturate(180%)
  - border-top: 1px solid rgba(28, 25, 23, 0.06)
  - height: 64px (h-16)
  - Safe area bottom padding for notched phones (pb-safe or env(safe-area-inset-bottom))
```

For each tab link:
- Inactive: `text-[#78716C]` (stone-500), icon size 22px, label 12px
- Active: Wrapped in a pill background `bg-primary/8 rounded-xl px-3 py-1.5`,
  icon and text in `text-primary` colour, icon stroke-width 2.5

The pill effect can be done by adding a conditional className to the Link:
when active, the Link gets an inner wrapper with the pill background.

Keep `aria-current="page"` on the active tab. Keep `aria-label` on the nav.

**2. Update PatientPageLayout (`components/patient/PatientPageLayout.tsx`)**

- Update the bottom padding to `pb-[84px]` (64px nav + 20px breathing room)
- Ensure `bg-[#FAF8F5]` is explicitly set on the main container (warm ivory)
- The `max-w-md` constraint should remain
- Add a subtle radial gradient glow at the top of the main container:
  ```
  background: radial-gradient(ellipse at 50% 0%, rgba(26, 122, 109, 0.04) 0%, transparent 50%);
  ```
  This can be a pseudo-element or a separate div positioned absolutely at
  the top, `h-64`, `pointer-events-none`.

### Files to modify
- `components/patient/BottomNav.tsx`
- `components/patient/PatientPageLayout.tsx`

### Verification
- Navigate between patient pages — bottom nav should have frosted glass effect
- Active tab shows a teal pill behind icon+label
- Warm ivory background is consistent across all patient pages
- No content is hidden behind the bottom nav

---

## Prompt 4: Patient Pages — Home, Appointment, Pending

> **Scope:** Apply the premium design treatment to the three main patient
> pages that use cards and status displays.

### Context

These pages currently work correctly but look generic. The design overhaul
focuses on:
- Warmer card backgrounds with the new shadow system
- Branded header area on the home page (greeting with decorative glow)
- Better visual hierarchy with the updated type scale
- Gold CTA buttons for primary actions ("Log my readings")
- Subtle teal accent on task cards (left border or gradient tint)

### Tasks

**1. Update Home page (`app/p/demo/home/page.tsx`)**

- **Greeting section:** Increase heading to `text-[32px] font-extrabold tracking-tight`
  with `text-[#1C1917]`. The greeting (e.g. "Good morning, Lily") should
  feel like a hero moment. Keep the wave emoji.
- **Task card ("Log readings"):** Apply the "task card" style from the design
  system: add a `border-l-4 border-primary` left accent, a subtle
  gradient background `from-white to-[#F0FAF8]`, and the `shadow-card-elevated`
  shadow. The CTA button inside should use the new `cta` variant (gold
  gradient) if not already done, with `size="patient"` (56px tall).
- **"All done" card:** When readings are complete, the card should have a
  `border-l-4 border-success` left accent and a subtle green tint background.
- **Appointment section:** Update the appointment card to match the new
  card styling (20px radius, compound shadow).
- Ensure all text meets minimum 18px for body copy.

**2. Update Appointment page (`app/p/demo/appointment/page.tsx`)**

- Apply the same card styling as the home page appointment card.
- The "Join on Zoom" button should use the `cta` (gold) variant.
- "Book a new appointment" should use the `default` (teal) variant.
- "Reschedule" should be a text link or `outline` variant button.
- Add warm background to the page.

**3. Update Pending page (`app/p/demo/pending/page.tsx`)**

- The page currently has a decorative SVG background. Replace or update it
  to use the brand's organic curve motif (a subtle teal S-curve at 3-5%
  opacity, positioned in the background).
- Update the appointment details card with the new card shadows and radius.
- The "How to Prepare" tips section should use individual mini-cards or a
  styled list with teal dot markers.
- "Join on Zoom" button: `cta` (gold) variant.
- Update colours throughout to use the warm palette.

**4. Update Booking page (`app/p/demo/book/page.tsx`)**

- Apply warm ivory background
- Calendar/date picker area: wrap in a card with the new `shadow-card`,
  `rounded-[20px]` styling
- Time slot buttons: use a clear selected state with `bg-primary text-white`
  and unselected state with `bg-white border border-[#E8E4DF]`
- "Confirm Booking" button: `variant="cta"` (gold), `size="patient"`
- Header text: use the updated type scale
- Back button: use the primary teal colour

**5. Add organic curve decoration to Home page**

The design system specifies a decorative organic S-curve SVG that appears
subtly across the app for brand recognition. On the home page:
- Add a faint teal SVG curve/arc (opacity 3-5%) positioned absolutely
  behind the greeting section, `pointer-events-none`
- This is in addition to the radial gradient glow from PatientPageLayout

### Files to modify
- `app/p/demo/home/page.tsx`
- `app/p/demo/appointment/page.tsx`
- `app/p/demo/pending/page.tsx`
- `app/p/demo/book/page.tsx`

### Verification
- Home page greeting should feel like a premium hero section
- Task card has visible teal left border and subtle gradient background
- Gold CTA buttons have gradient and coloured shadow
- All card borders/shadows match the new design system
- Text hierarchy is clear: biggest heading, then section heads, then body
- Booking page has warm tones and premium card styling

---

## Prompt 5: Onboarding & Log Flow — Step UI, Encouragement, Transitions

> **Scope:** Polish the two multi-step form flows (onboarding and daily
> readings log) with better step indicators, encouragement text, and the
> NumberStepper upgrade.

### Context

Both flows use stepped forms (one question per screen). The NumberStepper
component (`components/patient/NumberStepper.tsx`) is the primary input
for readings. These changes make the form experience more premium:
- Step progress indicator with better visual design
- Encouragement messages between steps
- NumberStepper with more tactile/dimensional +/- buttons
- Consistent use of the new button variants and card styles

### Tasks

**1. Update StepProgress component (`components/patient/StepProgress.tsx`)**

The step progress dots/bar should use the new colour scheme:
- Active/completed dots: `bg-primary` (#1A7A6D)
- Current dot: `bg-primary-vibrant` (#2A9D8F) with a subtle pulse or
  slightly larger size
- Upcoming dots: `bg-[#E8E4DF]` (warm border colour)
- If it's a progress bar rather than dots, use a teal gradient fill

**2. Update NumberStepper (`components/patient/NumberStepper.tsx`)**

Apply premium styling to the +/- buttons:
- Each button: `bg-gradient-to-b from-[#E8E4DF] to-[#DDD8D2]`,
  `border border-[rgba(28,25,23,0.1)]`, `rounded-2xl`, `shadow-sm`,
  `min-w-[56px] min-h-[56px]`
- Active press: `scale-[0.95]` with `shadow-none` and darker gradient
- Value display: `text-[48px]` or larger, `font-extrabold`, `tabular-nums`,
  `text-[#1C1917]`
- Unit pill below value: `bg-[#F3EDE6] text-[#78716C] text-sm font-medium
  px-3 py-1 rounded-full`
- Bilingual label above: English in `text-lg font-semibold`, Chinese
  in `text-base text-[#78716C]` directly below

**3. Add encouragement text to onboarding (`app/p/demo/onboarding/page.tsx`)**

Between the step progress indicator and the form content, show a short
encouraging line (only on steps 3, 4, and 5):
- Step 3: "You're halfway there — keep going!"
- Step 4: "Almost done — just a couple more questions."
- Step 5: "Last section before review!"

Style: `text-primary text-sm font-medium text-center mt-2 mb-4`

**4. Update onboarding button styles**

- "Next" buttons: `variant="default"` (teal gradient), `size="patient"`
- "Back" buttons: `variant="outline"`, `size="patient"`
- "Submit" button on review step: `variant="cta"` (gold), `size="patient"`
- All full-width on mobile

**5. Update log flow button styles (`app/p/demo/log/page.tsx`)**

Same pattern as onboarding:
- "Next" / progression: teal gradient
- "Submit readings": gold CTA
- Entry choice buttons ("Take a photo" / "Type manually"): Use card-like
  large tap targets with the new card styling rather than plain buttons

**6. Update log success page (`app/p/demo/log/success/page.tsx`)**

- Update the success checkmark to use the primary teal colour
- The background should be warm ivory
- Add a subtle confetti-like celebration effect: 4–6 small coloured dots
  (using `--color-primary`, `--color-accent`, `--color-primary-vibrant`)
  that animate outward from the checkmark using CSS keyframes. Keep it
  understated — small dots (6-8px), short duration (600ms), one-shot
  animation. This small touch creates a moment of delight after the daily
  logging task.
- The "Redirecting..." text should use the warm text colours

### Files to modify
- `components/patient/StepProgress.tsx`
- `components/patient/NumberStepper.tsx`
- `app/p/demo/onboarding/page.tsx`
- `app/p/demo/log/page.tsx`
- `app/p/demo/log/success/page.tsx`

### Verification
- Step through the full onboarding flow — buttons match the new design
- Encouragement text shows on steps 3, 4, 5
- NumberStepper +/- buttons look tactile/dimensional
- Number value is large, clear, and uses the warm dark colour
- Log success page uses correct colours

---

## Prompt 6: Guide Page & FAQ — Premium Content Pages

> **Scope:** Transform the dietary guide page from a simple list into a
> professional, document-like layout with serif headings, and style the
> FAQ accordion to match the new design system.

### Context

The guide page (`app/p/demo/guide/page.tsx`) displays the patient's
personalised dietary guide. It currently renders correctly but looks like
a plain list. The design direction calls for:
- A serif heading ("Dr. Jasmine" in DM Serif Display) at the top
- A colour-coded layout (red section for NO foods, green for YES foods)
- Professional document feel with warm backgrounds and sections

The FAQ page (`app/p/demo/faq/page.tsx`) uses an accordion component.
It should match the new card styling.

### Tasks

**1. Update Guide page (`app/p/demo/guide/page.tsx`)**

Header area:
- Add a top section with `font-display` (DM Serif Display) for
  "Dr. Jasmine" and the guide title
- Subtitle: "Metanova Health — Diabetes Reversal Programme" in
  small uppercase tracked text
- Show a "Last updated" date in tertiary text below

Content sections:
- **DO NOT EAT section:** Red-tinted header bar (`bg-red-50 text-red-700
  border-l-4 border-red-500`), items in tag-like chips with
  red-tinted backgrounds
- **ALLOWED section:** Green-tinted header bar (`bg-green-50 text-green-700
  border-l-4 border-green-500`), sub-categories as mini-cards with
  green-tinted chips for items
- **Snacks section:** Neutral card with gold-tinted chips
- **Replacements:** Two-column layout with arrows (original → replacement)
- **Portions:** Visual fraction display if possible, or clean text layout
- **Cooking methods:** Teal-tinted tag chips

Each section should be wrapped in a card (`rounded-[20px] shadow-card`)
with generous padding.

Between sections, use a subtle decorative divider: a thin teal organic
curve SVG (the brand's signature shape) at 5-8% opacity, centred, about
40px tall. This replaces a plain `<hr>` and adds brand consistency.

The "Save / Print" button should use the `outline` variant.

**2. Update FAQ page (`app/p/demo/faq/page.tsx`)**

- Page heading: "Frequently Asked Questions" in the new type scale
  (`text-[26px] font-bold tracking-tight`)
- Accordion items: Each item should have a card-like appearance
  (`bg-white rounded-2xl shadow-card mb-3`)
- Accordion trigger: `text-lg font-semibold` with warm colours
- Accordion content: `text-base text-[#78716C]` (secondary text)
- Warm ivory background for the page

### Files to modify
- `app/p/demo/guide/page.tsx`
- `app/p/demo/faq/page.tsx`

### Verification
- Guide page has a serif header that looks professionally branded
- NO foods section is clearly red-tinted
- YES foods section is clearly green-tinted
- FAQ accordion items look like individual cards
- Both pages feel warm and premium, not template-like

---

## Prompt 7: Admin Panel — Sidebar, Dashboard, Patient Pages

> **Scope:** Update the admin panel design to use the warm dark sidebar,
> premium KPI cards, and consistent warm tones — connecting it visually
> to the patient portal while maintaining its professional density.

### Context

The admin panel has three main components:
1. `AdminLayout` (`components/admin/AdminLayout.tsx`) — sidebar + content area
2. Dashboard (`app/admin/dashboard/page.tsx`) — KPI cards + recent activity
3. Patient pages (list, profile, schedule)

The admin sidebar currently uses `#1E293B` (cold slate). The design direction
calls for `#1C1917` (warm near-black from the stone palette) with warm
text colours. The content area should use the same warm ivory background
as the patient portal.

### Tasks

**1. Update AdminLayout (`components/admin/AdminLayout.tsx`)**

Sidebar:
- Background: `bg-[#1C1917]` (stone-900, warm near-black)
- Brand area at top: "Dr. Jasmine" in DM Serif Display (`font-display`)
  with `text-white`, and "METANOVA HEALTH" in small uppercase tracked
  text with `text-[#A8A29E]` (stone-400)
- Nav links: `text-[#D6D3D1]` (stone-300) when inactive, `text-white`
  with `bg-[#292524]` (stone-800) pill background when active
- Hover state for links: `text-white bg-[#292524]/50`
- Divider lines: `border-[#292524]`

Content area:
- Background: `bg-[#FAF8F5]` (warm ivory)
- Border: `border-l border-[#E8E4DF]`

Mobile hamburger menu: ensure it uses the same warm dark colours.

**2. Update Dashboard (`app/admin/dashboard/page.tsx`)**

- Greeting: "Good morning, Dr. Jasmine" in `text-[28px] font-bold tracking-tight`
- KPI cards: Use the new card component with `shadow-card`, `rounded-[20px]`.
  Add `hover:-translate-y-0.5 hover:shadow-card-hover transition-all
  duration-150` for hover lift effect. Each KPI card should have a
  small coloured indicator (teal dot, gold dot, etc.) next to the metric
  name to add visual interest.
- Add trend indicators below KPI numbers if not present:
  "↑ 3 this week" in green, "2 new today" in amber, etc. (hardcoded
  demo strings).
- Recent activity section: Update to use warm colours and the new
  card/border tokens.

**3. Update Patient list (`app/admin/patients/page.tsx`)**

- Table rows: Add `hover:bg-[#F3EDE6]` (warm depth colour) for hover.
- Status badges: Use warm-toned badge colours (green for Active, amber
  for Pending/Booked, gold for Onboarding).
- "View" buttons or clickable rows: Ensure they use the primary teal colour.
- "+ New Patient" button: `variant="default"` (teal gradient).

**4. Update Patient profile (`app/admin/patients/[id]/page.tsx`)**

- Patient info card: Updated card styling with compound shadow.
- Timeline events: Use warm-tinted cards. Each event type gets a subtle
  left-border colour indicator (teal for appointments, green for readings,
  gold for guide updates).
- Readings table: Clean, warm-toned table with proper borders.

**5. Update Schedule page (`app/admin/schedule/page.tsx`)**

- Update cards to use the new shadow and border system.
- Status badges: warm-toned colours.

**6. Update Admin Login page (`app/admin/login/page.tsx`)**

- Apply warm ivory background
- Centre the login card with the new `shadow-card-elevated` and `rounded-[20px]`
- Add a brand moment: "Dr. Jasmine" in DM Serif Display (`font-display`)
  above the login form, with "METANOVA HEALTH" in small uppercase tracked text
- Input fields: use the new warm ivory resting state
- "Sign In" button: `variant="default"` (teal gradient)

**7. Update Consultation Panel (`app/admin/patients/[id]/consult/page.tsx`)**

- Apply warm background and card styling to the panel sections
- Use warm-toned borders between columns
- Update any buttons to match the new design variants
- Notes textarea: warm ivory resting state, white on focus

**8. Update Guide Builder (`app/admin/patients/[id]/guide/page.tsx`)**

- Apply warm card styling to the builder sections
- Tag input chips: use warm-toned backgrounds (similar to patient guide view)
- "Save" button: teal gradient
- "Preview" button: outline variant
- Section cards: `rounded-[20px]`, `shadow-card`

**9. Update New Patient page (`app/admin/patients/new/page.tsx`)**

- Apply warm background and card styling
- Form inputs: warm ivory resting state
- "Generate Link" button: teal gradient
- Copy link button: outline variant with toast feedback

**10. Fix phone number display (`app/admin/patients/[id]/page.tsx`)**

- Wrap the phone number in a `<a href="tel:...">` link
- Optionally format it for display readability

### Files to modify
- `components/admin/AdminLayout.tsx`
- `app/admin/dashboard/page.tsx`
- `app/admin/patients/page.tsx`
- `app/admin/patients/[id]/page.tsx`
- `app/admin/schedule/page.tsx`
- `app/admin/login/page.tsx`
- `app/admin/patients/[id]/consult/page.tsx`
- `app/admin/patients/[id]/guide/page.tsx`
- `app/admin/patients/new/page.tsx`

### Verification
- Admin sidebar is warm near-black (not cold slate)
- "Dr. Jasmine" text in sidebar uses serif font
- KPI cards have hover lift effect
- Content area has warm ivory background
- Table hover states use warm depth colour
- Login page has a branded header with serif font
- Consultation panel has warm styling
- Guide builder sections use warm cards
- Phone number is a clickable `tel:` link
- Overall feel: professional and warm, not cold and corporate

---

## Prompt 8: Final Polish — Bugs, Micro-Interactions & QA

> **Scope:** Fix remaining bugs, add final micro-interactions, and ensure
> overall consistency across the app. This is the final cleanup pass.

### Context

After the previous 7 prompts have been applied, the app should look
substantially better. This final prompt catches edge cases, fixes known
bugs, and adds the last polish touches.

### Tasks

**1. Fix duplicate `sticky` class in log page**

In `app/p/demo/log/page.tsx`, find the header `<div>` that has
`className="... sticky top-0 z-10 sticky"` and remove the duplicate
`sticky` class.

**2. Move CSS keyframes from dangerouslySetInnerHTML to globals.css**

In `app/p/demo/log/page.tsx`, there is a `<style dangerouslySetInnerHTML>`
block that defines `@keyframes scanning`. Move this animation to
`app/globals.css`:

```css
@keyframes scanning {
  0% { top: 0%; }
  50% { top: 100%; }
  100% { top: 0%; }
}
.animate-scanning {
  animation: scanning 2s linear infinite;
}
```

Then remove the `<style dangerouslySetInnerHTML>` block from the component
and just use the `animate-scanning` class directly.

**3. Verify admin sidebar responsive behaviour**

Check `components/admin/AdminLayout.tsx` and ensure:
- The desktop sidebar has `hidden md:flex` (hidden on mobile, flex on desktop)
- The mobile menu overlay/drawer uses the same warm dark colours
- At 375px viewport, only the hamburger menu trigger is visible

**4. Ensure consistent border radius across the app**

Do a quick scan of all pages and components for inconsistent border radius.
The design system specifies:
- Cards: `rounded-[20px]`
- Buttons: `rounded-[14px]` (patient size) or `rounded-lg` (small/default)
- Inputs: `rounded-[14px]`
- Bottom nav pills: `rounded-xl`
- Badges: `rounded-full`
- Accordion items: `rounded-2xl`

Fix any outliers that still use the old `rounded-lg` or `rounded-xl` on
cards, or `rounded-md` on inputs.

**5. Verify colour consistency**

Check that no pages still reference the old colour values:
- `#2A9D8F` should only appear as `primary-vibrant` (for progress dots,
  focus rings, active states)
- `#E76F51` (old coral accent) should not appear anywhere
- `#1A1A2E` (old blue-black text) should be replaced with `#1C1917`
- `#6B7280` (cool grey) should be replaced with `#78716C` (warm stone-500)
- `#E5E5E0` (old border) should be replaced with `#E8E4DF`
- `#1E293B` (old sidebar) should be replaced with `#1C1917`

Search for these hex values across all `.tsx`, `.ts`, and `.css` files
and update any remaining references.

**6. Add page transition fade-in**

Add a subtle fade-in animation to page content. In `app/globals.css`,
add:

```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 200ms ease-out;
}
```

Then add `animate-fade-in` to the main content wrapper in
`PatientPageLayout.tsx` (on the `<main>` element).

**7. Final visual check list**

Walk through these pages and verify they look correct:
- `/p/demo` → redirects correctly
- `/p/demo/onboarding` → warm background, correct buttons, step dots
- `/p/demo/book` → warm background, calendar visible
- `/p/demo/pending` → branded background, tips section
- `/p/demo/home` → hero greeting, task card with gold CTA
- `/p/demo/log` → NumberStepper looks premium, warm background
- `/p/demo/log/success` → teal checkmark, correct colours
- `/p/demo/guide` → serif header, colour-coded sections
- `/p/demo/faq` → card-style accordion
- `/p/demo/appointment` → correct button variants
- `/admin/login` → warm tones
- `/admin/dashboard` → warm sidebar, premium KPI cards
- `/admin/patients` → warm table hover
- `/admin/patients/demo` → warm timeline cards
- `/admin/schedule` → warm cards

### Files to modify
- `app/p/demo/log/page.tsx`
- `app/globals.css`
- `components/admin/AdminLayout.tsx` (verify only, fix if needed)
- `components/patient/PatientPageLayout.tsx`
- Any files with stale colour references (found during colour audit)

### Verification
- No build errors or console warnings
- No remaining references to old coral accent (#E76F51)
- All pages have consistent warm tones
- Bottom nav frosted glass effect works
- Admin sidebar is warm near-black
- Overall impression: premium, medical, warm — not a template

---

## Prompt Execution Checklist

| # | Prompt | Focus | Files | Priority |
|---|--------|-------|-------|----------|
| 1 | Design Tokens | Colours, fonts, CSS variables, Tailwind config | 3 | Critical — everything depends on this |
| 2 | Core Components | Button, Input, Card | 3 | Critical — used everywhere |
| 3 | Patient Layout | Bottom nav, PatientPageLayout | 2 | High — visible on every patient page |
| 4 | Patient Pages | Home, Appointment, Pending, Booking | 4 | High — main user experience |
| 5 | Form Flows | Onboarding, Log, NumberStepper, StepProgress, Success | 5 | High — core functionality |
| 6 | Content Pages | Guide (serif header, section dividers), FAQ | 2 | Medium — important but less visited |
| 7 | Admin Panel | Sidebar, Dashboard, Patients, Login, Consult, Guide Builder, Schedule | 9 | Medium — secondary user |
| 8 | Final Polish | Bugs, colour audit, page transition, responsive QA | ~5 | Medium — cleanup pass |

**Total estimated files modified across all prompts:** ~33 unique files

### Coverage Verification (against doc 10 audit tracker)

All items from the UX audit improvement tracker are covered:
- **BUG-1** (duplicate sticky) → Prompt 8, task 1
- **BUG-2** (dangerouslySetInnerHTML) → Prompt 8, task 2
- **BUG-3** (admin sidebar mobile) → Prompt 8, task 3
- **BUG-4** (phone number format) → Prompt 7, task 10
- **VIS-1 through VIS-14** → Prompts 1–7 (mapped per-item)
- **VIS-15** (logo mark) → Prompt 7 (serif wordmark in sidebar + login)
- **VIS-16** (onboarding encouragement) → Prompt 5, task 3
- **VIS-17** (log success confetti) → Prompt 5, task 6
- **THEME-4** (documentation LCHF references) → Done in this doc update

After completing all 8 prompts, the app should score 8.5+ / 10 on the UX
audit criteria, with particular improvement in Wow Factor (6.5 → 8.5),
Emotional Experience (7.5 → 9), and Consistency (7.5 → 9).
