# 08 — UI / UX Design System

## Design Philosophy

The patient portal is built for people who may have never used a health app before.
Every design decision prioritises **clarity over cleverness** and **comfort over impressiveness**.
The admin panel prioritises speed and information density for Dr. Jasmine, who is under
time pressure during back-to-back consultations.

**Two separate design languages:**
- **Patient portal:** Warm, premium, spacious, low cognitive load
- **Admin panel:** Professional, information-dense, fast to scan

### Brand Concept: "The Science of Renewal"

Dr. Jasmine doesn't just treat diabetes — she reverses it. The company name is
**Metanova Health** ("Meta" = transformation + "Nova" = new). The visual identity
embodies: calm confidence, warmth, and medical precision. The app should feel
like being guided through a health transformation by a trusted expert — not like
using a generic SaaS tool.

### Design Direction: "Quiet Luxury"

The app serves patients paying RM 4,888+ for a premium diabetes reversal programme.
The design must justify that price point without being intimidating to elderly patients.

Think: **the digital equivalent of a private practice on Harley Street.**
A waiting room with Dieter Rams furniture and a single orchid. Hand-written
appointment cards on heavy stock paper. The craft is there, but it doesn't
announce itself.

**Keyword:** Restraint. Every element earns its place. Nothing is decorative
without purpose.

### Three Brand Personality Words

1. **Assured** — calm confidence, the doctor is in control
2. **Warm** — private practice, not hospital; wooden floors and plants, not fluorescent lights
3. **Precise** — every element has purpose, the spacing is intentional, the data is clear

### Design Anti-Patterns (Things We Explicitly Avoid)

- **No emoji in UI.** Emoji degrades the premium feel. Use proper Lucide icons or
  typographic treatments instead of emoji for warmth.
- **No heavy gradients.** Gradients are used with extreme subtlety — felt, not seen.
- **No coloured button shadows.** Shadows are warm-tinted neutrals, not brand-coloured.
- **No text-shadow on buttons.** Clean, confident text only.
- **No gold/accent-coloured button fills.** Gold is an accent detail, never a button fill.
- **No multiple button colours on the same page.** One button colour = one clear hierarchy.
- **No template aesthetics.** If something looks like it could be a shadcn/Tailwind
  starter template, it needs to be redesigned.

---

## Colour Palette

### Patient Portal

```css
:root {
  /* ── Primary — Deep Forest Green ── */
  --color-primary:         #2D5E4C;  /* deep, warm forest green — quiet luxury */
  --color-primary-hover:   #244D3F;  /* darker on interaction */
  --color-primary-light:   #EEF5F1;  /* tinted backgrounds, selected states */
  --color-primary-muted:   #3A7D66;  /* sparingly — focus rings, active indicators */

  /* ── Accent — Warm Gold ── */
  --color-accent:          #B8860B;  /* darkgoldenrod — rich, warm, not bright */
  --color-accent-light:    #FAF0D6;  /* gold-tinted backgrounds */
  /* Gold is used ONLY for: section labels, logo mark, premium typographic
     details, thin accent lines, notification badges. NEVER as a button fill. */

  /* ── Background — Warm Ivory ── */
  --color-bg:              #FAF8F5;  /* warm ivory canvas */
  --color-surface:         #FFFFFF;  /* cards, panels */
  --color-depth:           #EDE8E1;  /* secondary backgrounds, review sections */
  --color-border:          #E5DFD8;  /* warm border, not grey */

  /* ── Text — Stone Scale ── */
  --color-text-primary:    #1C1917;  /* stone-900 — warm near-black, headings */
  --color-text-strong:     #44403C;  /* stone-700 — card titles, secondary headings */
  --color-text-secondary:  #78716C;  /* stone-500 — body, descriptions */
  --color-text-tertiary:   #A8A29E;  /* stone-400 — timestamps, hints */
  --color-text-inverse:    #FFFFFF;  /* on dark fills */

  /* ── Semantic ── */
  --color-success:         #16A34A;  /* green — YES foods, confirmed, done */
  --color-danger:          #DC2626;  /* red — NO foods, errors */
  --color-warning:         #D97706;  /* amber — warnings */
  --color-info:            #2563EB;  /* blue — informational */
}
```

### Admin Panel

```css
:root {
  /* Admin uses a warmed-up dark theme for the sidebar */
  --color-admin-sidebar:        #1C1917;  /* warm near-black, not cold slate */
  --color-admin-sidebar-text:   #D6D3D1;  /* stone-300 */
  --color-admin-sidebar-active: #292524;  /* stone-800 */
  --color-admin-bg:             #FAF8F5;  /* same warm ivory as patient */
  --color-admin-surface:        #FFFFFF;
  --color-admin-border:         #E5DFD8;  /* warm border */
  --color-admin-primary:        #2D5E4C;  /* same forest green — unified identity */
}
```

### Why Forest Green?

The previous primary `#1A7A6D` (teal) sits in the "health/wellness startup" zone —
Headspace, Calm, MyFitnessPal, and most telehealth platforms use teal-to-mint.
Deep forest green (`#2D5E4C`) communicates:

- **Renewal and growth** — directly aligned with "Metanova" (transformation + new)
- **Old money, established trust** — the colour of Rolex, Harrods, Aesop, British Racing Green
- **Warmth** — unlike navy, forest green has warm undertones that pair naturally with ivory
- **In Southeast Asian culture** — green-gold has strong associations with prosperity and health
- **Distinctiveness** — no other health app in this space uses deep forest green

### Why Gold is Demoted from Button Fill to Accent Only

Gold (`#B8860B`) is precious because it's **rare**. When used as a button fill, it
loses its premium signal and becomes "just another colour." Instead, gold appears only in:
- The "TODAY'S TASK" section label
- The logo mark accent
- The active step indicator in multi-step forms
- Premium horizontal rules or thin accent lines
- Status badge for "Onboarding" state

This scarcity makes every gold element feel intentional and expensive.

### Gradient Philosophy

Gradients are **felt, not seen.** A premium gradient is so subtle that at first glance
the button looks solid. Only on close inspection does the gentle dimensional quality
reveal itself.

```css
/* Primary button — barely perceptible two-stop gradient */
background: linear-gradient(180deg, #33664F 0%, #2D5E4C 100%);
/* ~8% difference between top and bottom. That's it. */

/* Subtle page background gradient (patient portal) */
background: linear-gradient(180deg, #FAF8F5 0%, #F5F0EB 100%);
```

**Gradient rules:**
- Maximum TWO stops (top and bottom)
- Maximum ~10% perceived difference between stops
- NO inset white highlights
- NO text-shadow
- NO three-stop gradients

### Shadow System

Shadows are warm-tinted neutrals. No brand-coloured shadows.

```css
/* Card — resting state (subtle, floating) */
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04),
            0 4px 24px rgba(0, 0, 0, 0.03);

/* Card — elevated (task card, appointment card) */
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06),
            0 8px 24px -4px rgba(0, 0, 0, 0.08);

/* Button — resting (very subtle) */
box-shadow: 0 1px 2px rgba(45, 94, 76, 0.08);

/* Button — hover (slightly more present) */
box-shadow: 0 2px 8px rgba(45, 94, 76, 0.15);
```

---

## Typography

### Font Stack

```css
/* Patient portal — round, friendly, highly legible */
--font-body:    "Plus Jakarta Sans", sans-serif;    /* weights: 400, 500, 600, 700, 800 */

/* Brand / display — serif for premium medical authority */
--font-display: "DM Serif Display", serif;          /* hero headings, logo, brand moments */

/* Admin panel — clean, professional, information-dense */
--font-admin:   "Inter", sans-serif;                /* weights: 400, 500, 600 */
```

### Where to Use Each Font

**DM Serif Display** — the hero typographic element. This font IS the premium signal:
- Home page greeting: the patient's name ("Lily") rendered in serif at 40px
- All page hero headings: "Your Guide", "Book a Consultation", "Review & Confirm"
- Section headers in the guide page
- "Dr. Jasmine" wordmark wherever it appears
- Success screen headings ("Done!", "You're all set!")
- **Never** for body text, buttons, labels, or UI controls

**Plus Jakarta Sans** — everything else in the patient portal:
- Body text, labels, buttons, navigation
- Weight strategy: 400 (body), 500 (labels, button text, emphasis), 600 (card titles), 700+ (subheadings only)

**Inter** — admin panel only (except for the "Dr. Jasmine" brand name)

### Type Scale (Patient Portal)

| Role | Size | Weight | Tracking | Font | Usage |
|---|---|---|---|---|---|
| Hero heading | 40px / 2.5rem | 400 | -0.03em | DM Serif Display | Patient name, success screens |
| Page heading | 28px / 1.75rem | 400 | -0.02em | DM Serif Display | Page titles |
| Section heading | 20px / 1.25rem | 600 | -0.01em | Plus Jakarta Sans | Card headings, section titles |
| Card title | 17px / 1.0625rem | 600 | 0 | Plus Jakarta Sans | Timeline entries, reading labels |
| Body large | 18px / 1.125rem | 400 | 0 | Plus Jakarta Sans | Primary patient-facing copy |
| Body | 16px / 1rem | 400 | 0 | Plus Jakarta Sans | Secondary text, descriptions |
| Label | 13px / 0.8125rem | 500 | 0.1em | Plus Jakarta Sans | Uppercase labels ("TODAY'S TASK") |
| Nav label | 12px / 0.75rem | 500 | 0 | Plus Jakarta Sans | Bottom nav labels only |

**Key changes from previous type scale:**
- Hero headings are now DM Serif Display at 40px (was 32px Plus Jakarta Sans ExtraBold)
- Labels use weight 500 (was 600) — less aggressive
- Button text uses weight 500 (was 600) — premium buttons whisper, they don't shout
- Letter-spacing on display headings is tighter (-0.03em) for sophistication
- Letter-spacing on uppercase labels is wider (0.1em) for clarity

**Never use text smaller than 14px in the patient portal** except bottom nav labels (12px).

### Type Scale (Admin Panel)

Standard sizing: 14px body (Inter), 16px labels, 20–28px headings. Information density
is higher and users are not elderly.

---

## Spacing and Touch Targets

### Strict 8px Grid

All spacing follows an 8px grid with these stops:

```
8px (0.5rem)  — tight spacing within components
16px (1rem)   — between related elements (label to input, items in a list)
24px (1.5rem) — card internal padding, between cards within a section
32px (2rem)   — between sections
48px (3rem)   — major section gaps, page top padding
64px (4rem)   — hero spacing
```

**Specific assignments:**
- Page horizontal padding: 24px (`px-6`)
- Between sections on a page: 48px (`space-y-12`)
- Between cards within a section: 16px
- Card internal padding: 24px
- Between label and input: 8px
- Between heading and description text: 8px

### Touch Targets

- All interactive elements minimum **48 × 48px**
- Preferred button height: **56px** for primary actions
- Minimum spacing between adjacent targets: **8px**

---

## Component Patterns

### Primary Button (Forest Green)

```
Background:    linear-gradient(180deg, #33664F 0%, #2D5E4C 100%)
Text:          white, 16px, weight 500
Height:        56px
Border radius: 14px
Border:        1px solid rgba(0, 0, 0, 0.06)
Box shadow:    0 1px 2px rgba(45, 94, 76, 0.08)
Width:         full-width on mobile

Hover:         background shifts to linear-gradient(180deg, #2D5E4C 0%, #244D3F 100%)
               shadow grows to 0 2px 8px rgba(45, 94, 76, 0.15)
Active:        scale(0.97) via spring physics, shadow removed
Disabled:      50% opacity, cursor: not-allowed

NO inset white highlights.
NO text-shadow.
NO coloured drop shadows.
```

### Secondary Button (Outline)

```
Background:    transparent
Border:        1.5px solid #2D5E4C
Text:          #2D5E4C, 16px, weight 500
Height:        56px
Border radius: 14px

Hover:         background fills with rgba(45, 94, 76, 0.04)
Active:        scale(0.97)
```

### Ghost Button

```
Background:    transparent
Text:          #2D5E4C, weight 500
Hover:         underline, no background change
```

### Card System — Three Tiers

**1. Standard card** — general content containers:
```css
background: #FFFFFF;
border-radius: 20px;
border: none;  /* NO visible border — shadow-only floating */
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04),
            0 4px 24px rgba(0, 0, 0, 0.03);
```

**2. Elevated card** — task card, appointment card, important actions:
```css
background: #FFFFFF;
border-radius: 20px;
border: none;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06),
            0 8px 24px -4px rgba(0, 0, 0, 0.08);
/* Left accent bar via ::before pseudo-element (3px, primary colour) */
```

**3. Tinted card** — active/selected states, completed items:
```css
background: #EEF5F1;  /* very faint green tint */
border-radius: 20px;
border: 1px solid rgba(45, 94, 76, 0.1);
box-shadow: none;
```

**Card rules:**
- Cards float on the ivory canvas — shadow provides definition, not borders
- No visible `border` on standard/elevated cards
- The elevated card's left accent bar is a `::before` pseudo-element, not `border-left`
  (pseudo-element allows rounded corners at the bar endpoints)

### Input Fields

```css
/* Resting — appears embedded in the page */
.input {
  background: #FAF8F5;
  border: 1.5px solid rgba(28, 25, 23, 0.1);
  border-radius: 14px;
  height: 56px;
  font-size: 16px;
  font-weight: 400;
}

/* Focused — activates */
.input:focus {
  background: #FFFFFF;
  border-color: #2D5E4C;
  box-shadow: 0 0 0 3px rgba(45, 94, 76, 0.08);
}
```

### Number Input with Stepper (Readings)

Three elements in a row:
```
        [-]     [   6.2   ]     [+]
         ↑           ↑           ↑
       56×56px   large text   56×56px
       tactile   editable    tactile
```

- +/- buttons: subtle gradient (`#E8E4DF` → `#DDD8D2`), NOT brand-coloured
- Value displayed at 64px, weight 800, tabular-nums
- Value animates with `AnimatePresence` — old number slides out, new slides in
- Unit label appears below in a subtle pill
- Bilingual label (English + Chinese) above the stepper

### Bottom Navigation (Patient Portal)

Fixed at the bottom. Five tabs with icon + label.

```css
.bottom-nav {
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(20px) saturate(180%);
  height: 72px;  /* increased from 64px for breathing room */
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.03);  /* floating feel, not border-top */
}

/* Active tab — pill with layoutId animation */
.tab-active {
  background: rgba(45, 94, 76, 0.08);
  border-radius: 12px;
  padding: 6px 16px;
  color: #2D5E4C;
}

.tab-inactive {
  color: #78716C;
}
```

- Icon size: 24px (increased from 22px)
- Label size: 12px, weight 500
- Active pill slides between tabs using framer-motion `layoutId` animation
- No `border-top` — floating via shadow only

### Status Badge

```
Active:      Green background (#DCFCE7), green text (#16A34A)
Pending:     Amber background (#FEF3C7), amber text (#D97706)
Onboarding:  Gold-tinted background (#FAF0D6), gold text (#B8860B)
```

---

## Signature Visual Element — "The Curve"

Every premium brand has a shape language. Dr. Jasmine's brand uses a flowing
organic S-curve — representing the healing journey (a path from diagnosis to
reversal) and the organic, nature-based approach to health (diet-driven).

### Where the Curve Appears

1. **Section divider** — instead of a horizontal line between sections, a subtle
   curved line (1px, `#E5DFD8` colour) that gently arcs
2. **Header zone boundary** — the top of the home page has a forest-green-tinted
   section with the curve as its bottom edge (gentle wave, not straight line)
3. **Pending/confirmation pages** — decorative background element at low opacity (3-5%)
4. **Logo mark** — stylised "J" with a flowing tail that becomes the curve

---

## Logo Direction

Dr. Jasmine does not have existing brand assets. The app IS the brand identity.

**Logo text:** "Dr. Jasmine" in DM Serif Display, `#1C1917`
**Subtext:** "METANOVA HEALTH" in Plus Jakarta Sans, weight 500, `#78716C`,
uppercase, letter-spacing `0.12em`, ~11px

**Logo mark:** A simple circle in forest green (`#2D5E4C`) with a stylised
leaf that transitions into a gentle curve — echoing the "renewal" concept.
Keep it minimal, almost like a monogram.

**Appears at:** Admin login page, admin sidebar (small), patient onboarding
header, pending/confirmation page, guide page header.

---

## Page Layout Patterns

### Patient Portal — Standard Screen

```
┌─────────────────────────────┐
│  BRANDED HEADER ZONE        │  Subtle forest-green-tinted
│  Serif heading, generous    │  section at the top
│  whitespace above content   │
├ ─ ─ ─ curved divider ─ ─ ─ ┤
│                             │
│  PAGE CONTENT               │  24px horizontal padding
│                             │  48px between sections
│                             │
│  PRIMARY ACTION BUTTON      │  Pinned above bottom nav
│                             │
├─────────────────────────────┤
│  BOTTOM NAV (frosted glass) │  72px, floating via shadow
└─────────────────────────────┘
```

### Admin Panel — Desktop Layout

```
┌──────────────────┬──────────────────────────────────────────┐
│  WARM DARK       │  TOP BAR                                  │
│  SIDEBAR         │──────────────────────────────────────────│
│  (near-black)    │                                           │
│  Logo (serif)    │  MAIN CONTENT AREA                        │
│  Nav links       │  (warm ivory background)                  │
│                  │                                           │
│  240px           │  Flexible width                           │
└──────────────────┴──────────────────────────────────────────┘
```

---

## Accessibility Requirements

| Requirement | Standard |
|---|---|
| Colour contrast (normal text) | Minimum 4.5:1 (WCAG AA) |
| Colour contrast (large text 18px+) | Minimum 3:1 (WCAG AA) |
| Focus indicators | Visible 2px ring on all interactive elements |
| Form labels | All inputs have visible labels (not just placeholders) |
| Label association | All labels use `htmlFor`/`id` pairs |
| Error messages | Specific, actionable text with `role="alert"` and `aria-live` |
| Loading states | Skeleton screens or spinners with `aria-label="Loading"` |
| Skip navigation | "Skip to main content" link at the top of every page |
| Number steppers | `aria-label` on +/- buttons, `aria-live="polite"` on value |
| Navigation | `aria-current="page"` on active tab, `aria-expanded` on mobile menu |

---

## UX Rules (Patient Portal — Non-Negotiable)

1. **One action per screen.** If a screen asks the patient to do two things, split it.

2. **No dead ends.** Every error screen tells the patient exactly what to do next.

3. **Plain language.** No medical abbreviations without explanation.
   - "Fasting Blood Sugar" not "FBS"

4. **Bilingual labels.** All health metric labels show English and Chinese characters.

5. **Confirmation before submission.** All forms end with a review step.

6. **Autosave drafts on multi-step forms.** Progress saved to localStorage.

7. **No charts or data history for patients.** The portal is a submission tool, not
   an analytics dashboard. Showing "bad" numbers could cause anxiety.

8. **Zoom join button visibility.** Only appears 15 minutes before appointment.

9. **Loading feedback.** Any action > 300ms shows a loading state.

10. **Success states are explicit.** After submitting readings, a clear "Done!" screen
    is shown for at least 2 seconds before any redirect.

11. **No emoji in the UI.** Use Lucide icons or typographic treatments for warmth.

---

## Animation System

### Philosophy

Animations serve two purposes: **polish** (the app feels alive and intentional) and
**orientation** (the user understands where they are and what changed). Animations
must never confuse elderly patients.

### Required Library: framer-motion

Install `framer-motion` for orchestrated, physics-based, interruptible animations.
CSS-only animations (`tailwindcss-animate`) are kept for simple utility animations
(accordion, fade) but framer-motion handles all page-level choreography.

### Animation Inventory

| Animation | Implementation | Spec |
|---|---|---|
| **Page entrance** | framer-motion `motion.div` wrapper | Staggered children: `y: 20→0`, `opacity: 0→1`, 80ms stagger, spring physics (`stiffness: 300, damping: 30`) |
| **Step transitions** | framer-motion `AnimatePresence` | Enter: `x: 80→0` with spring; Exit: `x: 0→-80` with spring; crossfade between steps |
| **Bottom nav pill** | framer-motion `layoutId` | Pill indicator slides between tabs automatically |
| **Button press** | framer-motion `whileTap` | `scale: 0.97`, spring physics |
| **Success ceremony** | framer-motion orchestrated | SVG checkmark draws itself → two concentric circles expand and fade → heading fades in → subtitle fades in (200ms stagger) |
| **Number stepper** | framer-motion `AnimatePresence` | Old number slides out, new slides in (vertical) |
| **Scroll reveals** | framer-motion `useInView` | On guide/FAQ pages: `y: 30→0`, `opacity: 0→1` as sections enter viewport |
| **Card hover (admin)** | CSS transition | `translateY(-2px)` + shadow change, 150ms |
| **Accordion** | CSS keyframes | Height transition, 200ms ease (keep existing) |

### Shared Motion Components

Create reusable wrappers to enforce consistent animation across pages:

```typescript
/** Wraps page content with staggered entrance animation */
MotionStagger — applies stagger to direct children

/** Wraps individual items within a stagger group */
MotionItem — individual element with y/opacity animation

/** Step transition wrapper for multi-step forms */
MotionStep — AnimatePresence with directional slide
```

### Animation Rules

- No parallax, no bouncing, no complex keyframe animations in the patient portal
- All animations must be under 500ms except the success ceremony (800ms total)
- Use `prefers-reduced-motion` media query to disable all motion for accessibility
- Spring physics preferred over easing curves for natural feel
- Stagger delay between siblings: 60-100ms (not more)

---

## Responsive Breakpoints

```css
/* Mobile first */
/* sm: 640px  — small tablets / large phones */
/* md: 768px  — tablets */
/* lg: 1024px — desktop */
/* xl: 1280px — wide desktop */
```

Patient portal: **mobile-only** priority. Must look perfect at 375px (iPhone SE).
Admin panel: **desktop-first**. Must work on mobile for quick checks.

---

## Loading & Empty States

### Loading State (Patient Portal)
Use skeleton screens — placeholder shapes matching real content layout.
Never show a blank white screen. Add `aria-label="Loading"`.

### Empty States
Each section has a friendly message with a call to action:

| Section | Empty state message |
|---|---|
| No upcoming appointment | "You don't have an appointment booked. [Book a consultation]" |
| Guide not yet assigned | "Your guide from Dr. Jasmine will appear here after your first consultation." |
| Readings (admin view) | "No readings submitted yet." |
| Patient list (admin) | "No patients found. [Add a new patient]" |

Empty states should include a simple Lucide icon (not emoji, not illustration)
to prevent the page from feeling broken.

---

## Home Page Greeting Treatment

The home page greeting uses a two-line typographic treatment instead of emoji:

```
Good morning,              ← Plus Jakarta Sans, 18px, weight 400, #78716C
Lily                       ← DM Serif Display, 40px, weight 400, #1C1917
```

The serif name IS the warmth. No emoji needed. The contrast between the
understated greeting line and the large serif name creates visual impact
through typography alone.

Below the greeting, a subtle description:
```
Welcome to your health portal.  ← Plus Jakarta Sans, 16px, weight 400, #78716C
```
