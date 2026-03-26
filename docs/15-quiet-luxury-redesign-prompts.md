# 15 — Quiet Luxury Redesign — Prompt 1: Foundation, Core Components & Layout

## How to Use This Document

Copy everything below the `---` line and paste it as a single prompt to the agent.
This is Prompt 1 of 3. Complete this prompt first — Prompts 2 and 3 depend on
the design tokens, components, and motion system established here.

**Agent model:** Gemini 3.1 Pro (high)

---

## Prompt 1: Design Foundation, Core Components, Motion System & Patient Layout

### Your Role

You are implementing a "Quiet Luxury" design overhaul for a Next.js patient portal
app for Dr. Jasmine's diabetes reversal programme (Metanova Health). The programme
costs RM 4,888+ and the design must justify that premium positioning while remaining
comfortable for elderly, low-tech-savvy patients.

**Design philosophy:** "The digital equivalent of a private practice on Harley Street."
Restraint over excess. The craft is there but doesn't announce itself. Think Aesop,
Rolex, Le Labo — not a health app startup template.

### Project Context

- **Framework:** Next.js 14 App Router
- **Styling:** Tailwind CSS with custom `tailwind.config.ts` + CSS vars in `app/globals.css`
- **Component library:** shadcn/ui-style primitives in `components/ui/` using `@base-ui/react`
- **Utilities:** `lib/utils.ts` — `cn()` with `clsx` + `tailwind-merge`
- **Icons:** `lucide-react`
- **Toasts:** `sonner` (configured in `app/layout.tsx`)
- **Fonts:** Plus Jakarta Sans (body) + DM Serif Display (display) loaded via `next/font/google` in `app/layout.tsx`
- **Patient portal routes:** `app/p/demo/*`
- **Admin panel routes:** `app/admin/*`
- **Mock data:** `lib/mock-data.ts`

### Coding Standards

- TypeScript strict mode. No `any` type. No non-null assertions (`!`). No cast to `unknown`.
- Use double quotes (`"`) for all strings.
- Use string templates or `.join()` instead of string concatenation.
- Include JSDoc headers on all exported functions and components.
- Include clear inline comments describing non-obvious logic.
- Implement error checking and type validation.
- Use Tailwind CSS classes. No inline `style` attributes except for dynamic values
  that genuinely cannot be expressed as Tailwind classes.
- All patient-facing text minimum 14px. Primary body text 16-18px.
  Only exception: bottom nav labels at 12px.
- Touch targets minimum 48×48px for patient-facing UI.

### Design System Reference

Read `docs/08-ui-ux.md` for the complete design system. Key decisions below:

**Colour palette (replaces ALL existing teal/gold values):**

| Token | Old Value | New Value | Usage |
|---|---|---|---|
| Primary | `#1A7A6D` (teal) | `#2D5E4C` (forest green) | Buttons, links, active states |
| Primary hover | `#155F55` | `#244D3F` | Darkened on interaction |
| Primary light | `#E6F4F1` | `#EEF5F1` | Tinted backgrounds, selected states |
| Primary muted | `#2A9D8F` | `#3A7D66` | Focus rings, active dots (sparingly) |
| Accent | `#D4940A` (gold button fills) | `#B8860B` (accent detail ONLY) | Section labels, logo mark, premium details. NEVER as button fill |
| Accent light | `#FBF3E0` | `#FAF0D6` | Gold-tinted backgrounds |
| Background | `#FAF8F5` | `#FAF8F5` (unchanged) | Page canvas |
| Depth | `#F3EDE6` | `#EDE8E1` | Secondary backgrounds |
| Border | `#E8E4DF` | `#E5DFD8` | Warm borders |
| Text strong (NEW) | — | `#44403C` | Card titles, secondary headings |

**Typography changes:**
- Hero headings: DM Serif Display, 40px, weight 400, tracking -0.03em
- Page headings: DM Serif Display, 28px, weight 400, tracking -0.02em
- Button text: weight 500 (was 600)
- Labels: weight 500 (was 600), tracking 0.1em

**Button overhaul — kill the old gradients, replace with subtle ones:**
- Primary: 2-stop gradient `#33664F → #2D5E4C` (barely perceptible)
- No inset white highlight, no text-shadow, no coloured drop shadow
- No gold/CTA variant — gold is NEVER a button fill
- Single button colour for the entire app = clear hierarchy

**Card system — three tiers:**
- Standard: white, no border, shadow-only (`0 1px 3px rgba(0,0,0,0.04), 0 4px 24px rgba(0,0,0,0.03)`)
- Elevated: white, larger shadow, 3px left accent bar via `::before` pseudo-element
- Tinted: `#EEF5F1` background, subtle border, no shadow

### Tasks

Complete all tasks below in order.

#### Task 1: Install framer-motion

Run `npm install framer-motion` to add the animation library.

#### Task 2: Update `tailwind.config.ts`

Replace ALL colour tokens with the new forest green palette:

```typescript
colors: {
  primary: {
    DEFAULT: "#2D5E4C",
    hover: "#244D3F",
    light: "#EEF5F1",
    muted: "#3A7D66",
    foreground: "#FFFFFF",
  },
  accent: {
    DEFAULT: "#B8860B",
    light: "#FAF0D6",
    foreground: "#FFFFFF",
  },
  success: { DEFAULT: "#16A34A", foreground: "#FFFFFF" },
  danger: { DEFAULT: "#DC2626", foreground: "#FFFFFF" },
  warning: { DEFAULT: "#D97706", foreground: "#FFFFFF" },
  "bg-app": "#FAF8F5",
  depth: "#EDE8E1",
  surface: "#FFFFFF",
  text: {
    primary: "#1C1917",
    main: "#1C1917",
    strong: "#44403C",
    secondary: "#78716C",
    tertiary: "#A8A29E",
  },
  sidebar: {
    bg: "#1C1917",
    text: "#D6D3D1",
    active: "#292524",
  },
  // Keep shadcn HSL-variable-based colours for component compat
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

Update shadows:

```typescript
boxShadow: {
  card: "0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 24px rgba(0, 0, 0, 0.03)",
  "card-hover": "0 1px 3px rgba(0, 0, 0, 0.06), 0 8px 24px -4px rgba(0, 0, 0, 0.08)",
  "card-elevated": "0 1px 3px rgba(0, 0, 0, 0.06), 0 8px 24px -4px rgba(0, 0, 0, 0.08)",
  "btn-primary": "0 1px 2px rgba(45, 94, 76, 0.08)",
  "btn-primary-hover": "0 2px 8px rgba(45, 94, 76, 0.15)",
  "nav-float": "0 -4px 20px rgba(0, 0, 0, 0.03)",
},
```

#### Task 3: Update `app/globals.css`

Update the `:root` CSS variables to use the new forest green palette.
HSL values for the new hex colours:

```
--background: 40 33% 97%;         /* #FAF8F5 */
--foreground: 20 12% 10%;         /* #1C1917 */
--primary: 155 35% 27%;           /* #2D5E4C */
--primary-foreground: 0 0% 100%;
--secondary: 33 22% 91%;          /* #EDE8E1 */
--secondary-foreground: 25 10% 25%;
--accent: 43 90% 38%;             /* #B8860B */
--accent-foreground: 0 0% 100%;
--border: 33 15% 87%;             /* #E5DFD8 */
--input: 33 15% 87%;
--ring: 155 35% 27%;              /* same as primary */
```

Keep all existing utility classes (`.text-main`, `.bg-app`, `.text-secondary`,
`.font-display`, `.animate-fade-in`, `.animate-scanning`). Update `.bg-depth`
and `.text-tertiary` to the new values.

#### Task 4: Redesign `components/ui/button.tsx`

Complete rewrite of button variants. Keep the `@base-ui/react` + CVA pattern.

**Variant changes:**
- `default` (primary): 2-stop gradient `from-[#33664F] to-[#2D5E4C]`, white text weight 500,
  `shadow-btn-primary`, `hover:from-[#2D5E4C] hover:to-[#244D3F] hover:shadow-btn-primary-hover`,
  `active:shadow-none`. NO inset highlight. NO text-shadow.
- `cta`: **DELETE this variant entirely.** No gold buttons anywhere.
- `teal`: **RENAME to match default** or delete (it's a duplicate).
- `outline`: border `#2D5E4C`, text `#2D5E4C`, hover bg `rgba(45, 94, 76, 0.04)`
- `secondary`, `ghost`, `destructive`, `link`: keep patterns but update any teal references to forest green.

**Size changes:**
- `patient`: keep `h-14` (56px) but change font to `text-base font-medium` (was `text-lg font-semibold`).
  Keep `rounded-[14px]`.

#### Task 5: Update `components/ui/card.tsx`

Implement three card tiers as described above. The default `Card` should use
`shadow-card` with no visible border. Add a `variant` prop:
- `"default"` — standard floating card
- `"elevated"` — larger shadow + optional left accent bar (via className)
- `"tinted"` — forest green tinted background

#### Task 6: Update `components/ui/input.tsx`

Ensure the input uses the new palette colours:
- Resting bg: `#FAF8F5`, border `rgba(28, 25, 23, 0.1)`
- Focus: bg white, border `#2D5E4C`, ring `rgba(45, 94, 76, 0.08)`

#### Task 7: Create Motion Components

Create `components/motion/` directory with three reusable components:

**`components/motion/MotionStagger.tsx`:**
A wrapper that applies staggered entrance animation to its direct children.
Uses framer-motion `motion.div` with `staggerChildren: 0.08` (80ms).
Each child animated with `y: 20 → 0`, `opacity: 0 → 1`, spring physics
(`stiffness: 300, damping: 30`). Respects `prefers-reduced-motion`.

**`components/motion/MotionItem.tsx`:**
Individual item wrapper for use inside `MotionStagger`. Renders a `motion.div`
with the appropriate `variants` for the stagger animation.

**`components/motion/MotionStep.tsx`:**
Step transition wrapper for multi-step forms. Uses `AnimatePresence` with
`mode="wait"`. Enter: `x: 80 → 0` with spring. Exit: `x: 0 → -80` with spring.
Accepts a `direction` prop (`1` for forward, `-1` for back) to control slide direction.
Accepts a `stepKey` prop (string/number) for AnimatePresence keying.

All three components must:
- Accept `className` prop for additional styling
- Accept `children` as `React.ReactNode`
- Use `"use client"` directive
- Respect `prefers-reduced-motion` via framer-motion's `useReducedMotion()` hook
  (when reduced motion preferred, render children without animation)

#### Task 8: Redesign `components/patient/PatientPageLayout.tsx`

Update the patient layout wrapper:
- Remove the radial gradient glow (replace with a subtle forest-green-tinted header zone)
- Wrap content in `MotionStagger` for page entrance animation
- Update bottom nav padding: `pb-[92px]` (nav is now 72px + 20px breathing)
- Update all colour references from teal to forest green
- Keep the skip link, max-width, and `DemoControls` integration

#### Task 9: Redesign `components/patient/BottomNav.tsx`

- Increase height from `h-16` (64px) to `h-[72px]` (72px)
- Replace `border-top` with `shadow-nav-float` for floating feel
- Increase icon size from 22px to 24px
- Increase label from 11px to 12px, weight 500
- Add framer-motion `layoutId="nav-pill"` on the active pill `<span>` so it
  animates smoothly between tabs when navigating. Wrap the pill in `motion.span`
  with `layoutId="active-tab-pill"` and `layout` transition settings
  (`type: "spring", stiffness: 400, damping: 35`)
- Update all colour values from teal to forest green

#### Task 10: Update `components/patient/StepProgress.tsx`

- Update colours from teal to forest green
- Keep the current dot-based design but add smooth transitions

#### Task 11: Update `components/patient/NumberStepper.tsx`

- Update any teal/primary colour references to forest green
- Keep the +/- button gradient (neutral grey gradient is fine)
- If there are any references to vibrant teal, replace with `#3A7D66`

#### Task 12: Global cleanup in `app/layout.tsx`

- Verify font loading is correct (Plus Jakarta Sans + DM Serif Display)
- Ensure `bg-app text-main antialiased` is on the body
- No changes to Toaster or TooltipProvider config needed

### Verification Checklist

After completing all tasks, verify:

- [ ] `npm run build` completes without errors
- [ ] No remaining references to `#1A7A6D`, `#155F55`, `#1E8B7D`, `#2A9D8F` (old teal) in any `.tsx` or `.css` file
- [ ] No remaining references to `#D4940A`, `#E0A30B`, `#B07D08` (old gold button values) in component files
- [ ] `framer-motion` is in `package.json` dependencies
- [ ] `components/motion/` directory exists with three components
- [ ] Button component has no `cta` variant, no `teal` variant
- [ ] Button component has no `text-shadow`, no inset box-shadow highlight
- [ ] Card component supports `variant` prop with three tiers
- [ ] BottomNav has `layoutId` animation on active pill
- [ ] All colours in `tailwind.config.ts` and `globals.css` match the forest green palette
