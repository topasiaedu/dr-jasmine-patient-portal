# 08 — UI / UX

## Design Philosophy

The patient portal is built for people who may have never used a health app before.
Every design decision prioritises clarity over cleverness. The admin panel prioritises
speed and information density for Dr. Jasmine, who is under time pressure during
back-to-back consultations.

**Two separate design languages:**
- **Patient portal:** Warm, friendly, spacious, low cognitive load
- **Admin panel:** Professional, information-dense, fast to scan

---

## Colour Palette

### Patient Portal

```css
:root {
  /* Primary — warm teal. Calming, medical without being cold. */
  --color-primary:         #2A9D8F;
  --color-primary-hover:   #238276;
  --color-primary-light:   #E8F5F3;  /* backgrounds, section tints */

  /* Background */
  --color-bg:              #FAFAF8;  /* warm off-white, easier on aging eyes than #fff */
  --color-surface:         #FFFFFF;  /* cards, panels */
  --color-border:          #E5E5E0;

  /* Text */
  --color-text-primary:    #1A1A2E;  /* dark charcoal, not pure black */
  --color-text-secondary:  #6B7280;  /* secondary labels, hints */
  --color-text-inverse:    #FFFFFF;

  /* Semantic */
  --color-success:         #16A34A;  /* green — YES foods, confirmed, done */
  --color-danger:          #DC2626;  /* red — NO foods, errors */
  --color-warning:         #D97706;  /* amber — CTAs, warnings */
  --color-info:            #2563EB;

  /* Accent — for primary action buttons */
  --color-accent:          #E76F51;  /* warm coral — stands out, not aggressive */
  --color-accent-hover:    #CF5F41;
}
```

### Admin Panel

```css
:root {
  --color-admin-bg:        #F8F9FA;
  --color-admin-surface:   #FFFFFF;
  --color-admin-sidebar:   #1E293B;  /* dark slate sidebar */
  --color-admin-sidebar-text: #CBD5E1;
  --color-admin-primary:   #2563EB;  /* blue — professional, clear */
  --color-admin-border:    #E2E8F0;
  --color-text-primary:    #0F172A;
  --color-text-secondary:  #64748B;
}
```

---

## Typography

### Font Stack

```css
/* Patient portal — round, friendly, highly legible */
--font-display: "Plus Jakarta Sans", sans-serif;
--font-body:    "Plus Jakarta Sans", sans-serif;

/* Admin panel — clean, professional, information-dense */
--font-admin:   "Inter", sans-serif;
```

Load from Google Fonts:
```html
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```

### Type Scale (Patient Portal)

| Role | Size | Weight | Usage |
|---|---|---|---|
| Page heading | 28px / 1.75rem | 700 | Screen title (e.g. "Log Your Readings") |
| Section heading | 22px / 1.375rem | 600 | Section labels |
| Body large | 18px / 1.125rem | 400 | Primary body text — **minimum for all patient-facing copy** |
| Body | 16px / 1rem | 400 | Secondary text, labels |
| Small | 14px / 0.875rem | 400 | Hints, footnotes — use sparingly |
| Button | 18px / 1.125rem | 600 | All button labels |

**Never use text smaller than 14px in the patient portal.**

### Type Scale (Admin Panel)

Standard sizing: 14px body, 16px labels, 20px headings. Information density is higher
and users are not elderly.

---

## Spacing and Touch Targets

```css
/* Patient portal spacing scale */
--space-1:   4px;
--space-2:   8px;
--space-3:   12px;
--space-4:   16px;
--space-5:   20px;
--space-6:   24px;
--space-8:   32px;
--space-10:  40px;
--space-12:  48px;
--space-16:  64px;
```

**Touch target rules (patient portal only):**
- All interactive elements (buttons, links, form controls) minimum **48 × 48px**
- Preferred button height: **56px** for primary actions
- Radio buttons and checkboxes have a minimum tap area of 48 × 48px with invisible padding
- Spacing between adjacent tap targets: minimum **8px**

---

## Component Patterns

### Primary Button (Patient Portal)

```
Background:    var(--color-accent)
Text:          white, 18px, 600 weight
Height:        56px
Border radius: 14px
Width:         full-width on mobile
Padding:       0 24px
Hover:         var(--color-accent-hover)
Active:        scale(0.98) — subtle press feedback
Disabled:      50% opacity, cursor: not-allowed
```

### Secondary Button

```
Background:    transparent
Border:        2px solid var(--color-primary)
Text:          var(--color-primary), 18px, 600 weight
Height:        56px
Border radius: 14px
```

### Stepped Form Navigation

```
[← Back]                           [Next →]
```
- Both buttons are full-width on mobile, side by side
- "Next" is always the primary (accent) button
- "Back" is always the secondary button
- Progress indicator: dots at the top (`● ● ○ ○ ○`) — not a percentage bar,
  which can be demotivating when patients see they are only 20% through

### Number Input with Stepper (Readings)

The primary input for numeric health readings. Three elements in a row:

```
        [-]     [   6.2   ]     [+]
         ↑           ↑           ↑
       48×48px   large text   48×48px
       tappable  input field  tappable
```

- The displayed value is 32px, bold, centred
- Minus decrements by the field's step value (e.g. 0.1 for blood sugar, 1 for pulse)
- Plus increments by the same step
- The input field is also directly editable via keyboard
- Unit label appears below: "mmol/L" in secondary text

### Card Component

```
Background:    var(--color-surface)
Border:        1px solid var(--color-border)
Border radius: 16px
Padding:       20px 24px
Box shadow:    0 1px 3px rgba(0,0,0,0.06)
```

### Status Badge

```
Active:      Green background (#DCFCE7), green text (#16A34A)
Booked:      Blue background (#DBEAFE), blue text (#2563EB)
Onboarding:  Amber background (#FEF3C7), amber text (#D97706)
```

### Bottom Navigation (Patient Portal Mobile)

Fixed at the bottom of the screen. Four tabs with icon + label:

```
┌────────────────────────────────────────────┐
│  🏠 Home   📋 Log   📅 Appt   📖 Guide    │
│  ────                                       │
└────────────────────────────────────────────┘
```

- Icons are 24×24px
- Labels are 12px (exception to the 14px rule — navigation labels are conventionally small)
- Active tab: primary colour icon + label, underline indicator
- Inactive: grey icon + label
- Tap target for each tab: full column width, 64px height

---

## Page Layout Patterns

### Patient Portal — Standard Screen

```
┌─────────────────────────────┐
│  STATUS BAR                 │
├─────────────────────────────┤
│  PAGE HEADER                │  32px padding top
│  [Back arrow?]  Title       │
├─────────────────────────────┤
│                             │
│  PAGE CONTENT               │  16px horizontal padding
│                             │  Generous vertical space between elements
│                             │
│  PRIMARY ACTION BUTTON      │  Always pinned above bottom nav
│                             │
├─────────────────────────────┤
│  BOTTOM NAV                 │  64px
└─────────────────────────────┘
```

The primary action button is **always visible** — it does not scroll off screen.
This is achieved by using a sticky footer with the button, and the content area
has padding-bottom equal to the button height + nav height.

### Admin Panel — Desktop Layout

```
┌──────────┬──────────────────────────────────────────┐
│          │  TOP BAR                                  │
│  SIDEBAR │──────────────────────────────────────────│
│          │                                           │
│  Nav     │  MAIN CONTENT AREA                        │
│  links   │                                           │
│          │                                           │
│  240px   │  Flexible width                           │
└──────────┴──────────────────────────────────────────┘
```

---

## Accessibility Requirements

| Requirement | Standard |
|---|---|
| Colour contrast (normal text) | Minimum 4.5:1 (WCAG AA) |
| Colour contrast (large text 18px+) | Minimum 3:1 (WCAG AA) |
| Focus indicators | Visible 2px outline on all interactive elements |
| Form labels | All inputs have visible labels (not just placeholders) |
| Error messages | Specific, actionable text — never just "Invalid input" |
| Images | All non-decorative images have alt text |
| Loading states | Skeleton screens or spinners with aria-label="Loading" |

---

## UX Rules (Patient Portal — Non-Negotiable)

1. **One action per screen.** If a screen asks the patient to do two things, split it.

2. **No dead ends.** Every error screen tells the patient exactly what to do next.
   "Something went wrong" is not an acceptable error message.

3. **Plain language.** No medical abbreviations without explanation.
   - "Fasting Blood Sugar" not "FBS"
   - "Your belly button area" not "umbilical circumference"

4. **Bilingual labels.** All health metric labels show both English and Chinese characters.
   This costs nothing in terms of space and is inclusive for the patient demographic.

5. **Confirmation before submission.** All forms end with a review step before the
   final submit. This prevents mis-entries and gives patients confidence.

6. **Autosave drafts on multi-step forms.** If a patient navigates away mid-form
   (e.g. receives a phone call), their progress is saved to localStorage and
   restored when they return.

7. **No charts or data history for patients.** Patients do not see trend graphs or
   tables of their past readings. The portal is a submission tool, not an analytics
   dashboard. Seeing "bad" numbers could cause anxiety without Dr. Jasmine's context.

8. **Zoom join button visibility.** The "Join on Zoom" button only appears 15 minutes
   before the appointment. This prevents confusion and accidental early joins.

9. **Loading feedback.** Any action that takes more than 300ms shows a loading state.
   Any action that takes more than 1 second shows a progress indicator.

10. **Success states are explicit.** After submitting readings, a clear "Done!" screen
    is shown for at least 2 seconds before any redirect. Do not just navigate away silently.

---

## Responsive Breakpoints

```css
/* Mobile first */
/* sm: 640px  — small tablets / large phones */
/* md: 768px  — tablets */
/* lg: 1024px — desktop */
/* xl: 1280px — wide desktop */
```

The patient portal is **mobile-only in terms of design priority**. It must look and
work perfectly at 375px width (iPhone SE size). Larger sizes get minor layout
improvements (more padding, wider cards) but no fundamental layout changes.

The admin panel is **desktop-first**. It must work on mobile (Dr. Jasmine may check
a patient on her phone) but the consultation panel layout is designed for a wide screen.

---

## Loading & Empty States

### Loading State (Patient Portal)

Use skeleton screens — placeholder grey shapes that match the layout of the real content.
Never show a blank white screen.

### Empty States

Each section has a friendly empty state with a call to action:

| Section | Empty state message |
|---|---|
| No upcoming appointment | "You don't have an appointment booked. [Book a consultation →]" |
| Guide not yet assigned | "Your guide from Dr. Jasmine will appear here after your first consultation." |
| Readings (admin view) | "No readings submitted yet." |
| Patient list | "No patients found. [Add a new patient →]" |

---

## Animations and Transitions

Keep animations subtle. Patients should not feel confused by movement.

| Animation | Spec |
|---|---|
| Page transitions | Fade in: 200ms ease-out |
| Stepped form next/back | Slide left/right: 250ms ease-in-out |
| Button press | Scale 0.98: 100ms |
| Card hover (admin) | Lift shadow: 150ms |
| Success state | Checkmark draws: 400ms |
| Accordion open/close | Height transition: 200ms ease |

No parallax, no bouncing, no complex keyframe animations in the patient portal.
