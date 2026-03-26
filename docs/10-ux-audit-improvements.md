# 10 — UX Audit & Improvement Plan

## Audit Context

**Date:** March 2026
**Method:** Codebase analysis + live browser testing at `localhost:3000`
**Viewports tested:** 375×812 (iPhone SE), 1440×900 (desktop)
**Scope:** Full patient portal demo flow and admin panel

This is the second audit. The first audit (now superseded) identified functional
bugs and UX gaps. Many of those were subsequently fixed. This revision reflects
the current state of the app and adds the new design direction from `08-ui-ux.md`.

---

## Current State Summary

**What works well:**
- Core patient flows (onboarding → booking → pending → home → log → guide) are
  functional and logically correct
- Stepped forms (one field per screen) are appropriate for the elderly audience
- Admin panel structure (sidebar + content area) is solid
- Mock data is realistic and provides a good demo experience
- Bottom nav exists and covers 5 tabs (Home, Log, Appointment, Guide, Help)
- Toast notifications (Sonner) are set up and working
- Form autosave to localStorage is partially implemented
- NumberStepper with direct input is working
- Admin skeleton loading is implemented

**What needs improvement:**
- The visual design looks generic and template-derived
- No brand identity — looks like any shadcn/ui starter project
- Colour palette is flat teal (#2A9D8F) with no depth or warmth
- Typography is functional but lacks personality or hierarchy emphasis
- Cards use basic shadows and borders — no premium feel
- Buttons are flat rectangles with no dimension
- Bottom nav looks default — no frosted glass or active pill indicators
- No decorative elements, logo, or brand moments
- Admin panel sidebar is cold slate — disconnected from patient portal palette

---

## Design Direction (New)

The full design system is documented in `08-ui-ux.md`. Key changes:

1. **Colour shift:** Flat teal → deep teal (#1A7A6D) + warm gold accent (#D4940A)
2. **Background warmth:** Cool white → warm ivory (#FAF8F5) with stone-toned text
3. **Typography:** Add DM Serif Display for brand moments (logo, guide headers)
4. **Buttons:** Flat fills → gradient fills with coloured shadows and inner glow
5. **Cards:** Basic borders → compound shadows, warmer tones, 20px border radius
6. **Bottom nav:** Standard nav → frosted glass with active pill indicator
7. **Brand identity:** No logo → serif "Dr. Jasmine" wordmark + organic curve motif
8. **Admin sidebar:** Cold slate → warm near-black (#1C1917) from stone palette

---

## Bugs (Remaining / New)

### BUG-1: Duplicate `sticky` class on log page header

`app/p/demo/log/page.tsx` — the step header `<div>` has `sticky` twice:
```
className="... sticky top-0 z-10 sticky"
```
Harmless but messy. Remove the duplicate.

### BUG-2: `dangerouslySetInnerHTML` for CSS keyframes

`app/p/demo/log/page.tsx` uses `dangerouslySetInnerHTML` to inject a `@keyframes`
animation for the camera scanning effect. This is a minor XSS surface.

**Fix:** Move the `@keyframes scanning` animation to `globals.css` and
reference the class directly.

### BUG-3: Admin sidebar not collapsing on mobile

When viewing `/admin/dashboard` at 375px viewport width, the full desktop
sidebar is still visible instead of the mobile hamburger menu.

**Fix:** Verify that `AdminLayout.tsx` correctly hides the sidebar below
`md` breakpoint (768px). The issue may be a missing `hidden md:flex` class
on the desktop sidebar container.

### BUG-4: Phone number format display

`app/admin/patients/[id]/page.tsx` — the patient phone number displays raw.
Consider formatting it or at least making it a `tel:` link.

---

## Improvement Tracker

### Status Key
- `DONE` — implemented in the current codebase
- `NEW` — not started, part of the design overhaul
- `PARTIAL` — started but incomplete

### A. Navigation & Layout

| ID | Issue | Status | Notes |
|----|-------|--------|-------|
| NAV-1 | Guide page missing bottom nav | DONE | Now uses PatientPageLayout |
| NAV-2 | FAQ page missing bottom nav | DONE | Now uses PatientPageLayout |
| NAV-3 | FAQ added to bottom nav as 5th tab (Help) | DONE | BottomNav has 5 tabs |
| NAV-4 | Onboarding step 1 escape hatch | DONE | X button navigates to /p/demo |
| NAV-5 | Booking page back button | DONE | Back arrow added |
| NAV-6 | Schedule page 404 | DONE | Page created with mock data |
| NAV-7 | Patient table rows not fully clickable | DONE | Rows use router.push |

### B. Accessibility & Bilingual

| ID | Issue | Status | Notes |
|----|-------|--------|-------|
| A11Y-1 | Chinese bilingual labels on readings | DONE | All 7 fields have correct labelZh |
| A11Y-2 | ARIA labels on NumberStepper | DONE | +/- buttons have aria-label |
| A11Y-3 | ARIA labels on bottom nav | DONE | nav, aria-current, tab labels |
| A11Y-4 | Focus-visible indicators | DONE | Global CSS rule added |
| A11Y-5 | aria-live on validation errors | DONE | role="alert" added |
| A11Y-6 | Chip remove button touch targets | DONE | Enlarged to 44px |
| A11Y-7 | ARIA for Number Stepper value display | DONE | aria-live="polite" |

### C. Feedback & Loading

| ID | Issue | Status | Notes |
|----|-------|--------|-------|
| FB-1 | Replace alert() with toast | DONE | Sonner toasts throughout |
| FB-2 | Admin skeleton loading | DONE | AdminPageSkeleton component |
| FB-3 | Onboarding success screen | DONE | Shows before redirect to /book |
| FB-4 | Duplicate reading detection | DONE | Dialog prompts to overwrite |
| FB-5 | Log success celebration | DONE | Animated checkmark screen |

### D. Form UX

| ID | Issue | Status | Notes |
|----|-------|--------|-------|
| FORM-1 | Onboarding autosave to localStorage | DONE | Draft saved on change |
| FORM-2 | Log autosave to localStorage | DONE | Draft + step saved |
| FORM-3 | NumberStepper sensible defaults | DONE | Default values per field |
| FORM-4 | NumberStepper direct keyboard input | DONE | Tappable editable value |
| FORM-5 | Empty catch blocks fixed | DONE | Error logged to console |

### E. Content & Theme

| ID | Issue | Status | Notes |
|----|-------|--------|-------|
| THEME-1 | Guide title says "LCHF" | DONE | Now "Personalised Diabetes Reversal Plan" |
| THEME-2 | Diet type selector in admin guide builder | DONE | Dropdown added |
| THEME-3 | Timeline says "Custom LCHF Guide Generated" | DONE | Updated |
| THEME-4 | Documentation LCHF references broadened | NEW | Part of this doc update |

### F. Visual Design Overhaul (NEW — from 08-ui-ux.md)

| ID | Change | Status | Priority |
|----|--------|--------|----------|
| VIS-1 | Update CSS variables to new colour palette | NEW | Critical |
| VIS-2 | Update Tailwind config with new colours, shadows | NEW | Critical |
| VIS-3 | Add DM Serif Display font to layout | NEW | Critical |
| VIS-4 | Button component — gradient fills, coloured shadows | NEW | High |
| VIS-5 | Card component — compound shadows, 20px radius | NEW | High |
| VIS-6 | Input component — warm ivory bg, focused state | NEW | High |
| VIS-7 | Bottom nav — frosted glass, pill active indicator | NEW | High |
| VIS-8 | NumberStepper — 3D buttons, animated value | NEW | High |
| VIS-9 | Home page — branded greeting zone, radial glow | NEW | High |
| VIS-10 | Guide page — serif header, professional layout | NEW | Medium |
| VIS-11 | Pending page — organic curve decoration, prep tips | NEW | Medium |
| VIS-12 | Admin sidebar — warm dark theme from stone palette | NEW | Medium |
| VIS-13 | Admin cards — hover lift, warmer borders | NEW | Medium |
| VIS-14 | Admin dashboard — premium KPI cards, trend badges | NEW | Medium |
| VIS-15 | Logo / brand mark — serif wordmark in sidebar + login page | NEW | Low |
| VIS-16 | Onboarding encouragement text between steps | NEW | Low |
| VIS-17 | Log success — subtle confetti celebration dots | NEW | Low |

---

## Score Summary

### Pre-Improvement Scores (First Audit)

| # | Criterion | Score |
|---|-----------|-------|
| 1 | Clarity | 8 / 10 |
| 2 | Ease of Use | 7.5 / 10 |
| 3 | Consistency | 7 / 10 |
| 4 | Visual Hierarchy | 8 / 10 |
| 5 | Speed & Responsiveness | 7 / 10 |
| 6 | Accessibility | 5.5 / 10 |
| 7 | Navigation | 6.5 / 10 |
| 8 | Feedback | 6.5 / 10 |
| 9 | Error Prevention | 5.5 / 10 |
| 10 | Goal Completion | 7 / 10 |
| 11 | Emotional Experience | 7 / 10 |
| 12 | Context Fit | 7.5 / 10 |
| 13 | Wow Factor | 6.5 / 10 |
| | **Overall** | **6.9 / 10** |

### Post-Bugfix Scores (Current State — Before Design Overhaul)

| # | Criterion | Score | Change | Notes |
|---|-----------|-------|--------|-------|
| 1 | Clarity | 8.5 / 10 | +0.5 | Bilingual labels added, better copy |
| 2 | Ease of Use | 8 / 10 | +0.5 | Autosave, sensible defaults, direct input |
| 3 | Consistency | 7.5 / 10 | +0.5 | All patient pages now have bottom nav |
| 4 | Visual Hierarchy | 8 / 10 | — | No change yet, pending design overhaul |
| 5 | Speed & Responsiveness | 7.5 / 10 | +0.5 | Skeleton loading, better mount handling |
| 6 | Accessibility | 7.5 / 10 | +2.0 | ARIA labels, focus rings, touch targets |
| 7 | Navigation | 8 / 10 | +1.5 | 5-tab nav, escape hatches, back buttons |
| 8 | Feedback | 8 / 10 | +1.5 | Toasts, success screens, duplicate detection |
| 9 | Error Prevention | 7 / 10 | +1.5 | Range validation, catch blocks, autosave |
| 10 | Goal Completion | 8 / 10 | +1.0 | Forms more robust, fewer dead ends |
| 11 | Emotional Experience | 7.5 / 10 | +0.5 | Success animations, encouragement text |
| 12 | Context Fit | 8 / 10 | +0.5 | Diabetes reversal theme corrected |
| 13 | Wow Factor | 6.5 / 10 | — | Unchanged — design overhaul is the fix |
| | **Overall** | **7.7 / 10** | **+0.8** | |

### Target Scores (After Design Overhaul)

| # | Criterion | Target |
|---|-----------|--------|
| 1 | Clarity | 9 / 10 |
| 2 | Ease of Use | 8.5 / 10 |
| 3 | Consistency | 9 / 10 |
| 4 | Visual Hierarchy | 9 / 10 |
| 5 | Speed & Responsiveness | 8 / 10 |
| 6 | Accessibility | 8 / 10 |
| 7 | Navigation | 8.5 / 10 |
| 8 | Feedback | 8.5 / 10 |
| 9 | Error Prevention | 7.5 / 10 |
| 10 | Goal Completion | 8.5 / 10 |
| 11 | Emotional Experience | 9 / 10 |
| 12 | Context Fit | 9 / 10 |
| 13 | Wow Factor | 8.5 / 10 |
| | **Overall** | **8.5 / 10** |

---

## Implementation Priority

The design overhaul is documented as scoped agent prompts in
`12-design-implementation-prompts.md`. Execute in this order:

1. **Prompt 1:** Design tokens — CSS variables, Tailwind config, fonts, globals
2. **Prompt 2:** Core components — Button, Input, Card, NumberStepper
3. **Prompt 3:** Patient layout — Bottom nav, PatientPageLayout, branded header
4. **Prompt 4:** Patient pages — Home, appointment, pending, log success
5. **Prompt 5:** Onboarding & log flow — Step UI, encouragement, transitions
6. **Prompt 6:** Guide & FAQ — Premium guide layout, accordion styling
7. **Prompt 7:** Admin panel — Sidebar, dashboard, patient list, profile
8. **Prompt 8:** Final polish — Remaining bugs, micro-interactions, responsive QA
