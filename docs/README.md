# Dr. Jasmine Patient Portal — Documentation

This folder is the **source of truth** for the entire project. All architectural decisions,
feature specifications, data models, and build plans are documented here. When in doubt,
refer to these docs before making implementation decisions.

---

## Document Index

| # | Document | What it covers |
|---|---|---|
| 01 | [Project Overview](./01-project-overview.md) | Goals, target audience, constraints, success metrics, current build state |
| 02 | [Architecture](./02-architecture.md) | Tech stack, system diagram, data flow between services |
| 03 | [Authentication](./03-authentication.md) | GHL contact ID + cookie auth model for patients; admin auth |
| 04 | [Data Models](./04-data-models.md) | Full Supabase schema, TypeScript types, GHL data mapping |
| 05 | [Patient Portal](./05-patient-portal.md) | All patient-facing feature specs (readings, guide, booking, onboarding, FAQ) |
| 06 | [Admin Panel](./06-admin-panel.md) | Dr. Jasmine's panel, consultation panel, guide builder, patient journey |
| 07 | [Integrations](./07-integrations.md) | Cal.com, Zoom, GHL API, OpenAI Vision — contracts and flow |
| 08 | [UI / UX Design System](./08-ui-ux.md) | **Complete design system** — colours, typography, components, accessibility, animations |
| 09 | [Build Phases](./09-build-phases.md) | Phased plan: **Phase 1** GHL + guide + readings; **Phase 2** in-app Cal + Zoom; **Phase 3** gating + messaging alignment |
| 10 | [UX Audit & Improvements](./10-ux-audit-improvements.md) | Full audit findings, scores, improvement tracker |
| 11 | [Implementation Prompts (Legacy)](./11-implementation-prompts.md) | Original 6 prompts for functional fixes — **mostly completed** |
| 12 | [Design Implementation Prompts (Legacy)](./12-design-implementation-prompts.md) | **Superseded** — old 8 prompts for teal+gold overhaul, no longer current |
| 13 | [UX Bug Audit](./13-ux-bug-audit-2026-03-26.md) | Bug/UX audit with scores and fixes |
| 14 | [Implementation Prompt Fixes](./14-implementation-prompts-fixes.md) | Sequential prompts for bug/UX fixes |
| 15 | [Quiet Luxury Redesign — Prompt 1](./15-quiet-luxury-redesign-prompts.md) | Foundation: design tokens, core components, motion system, layout |
| 16 | [Quiet Luxury Redesign — Prompt 2](./16-quiet-luxury-redesign-prompts-2.md) | Key patient pages: home, onboarding (new fields), book, pending |
| 17 | [Quiet Luxury Redesign — Prompt 3](./17-quiet-luxury-redesign-prompts-3.md) | Remaining pages: log, guide, FAQ, appointment, admin sweep, polish |

---

## Quick Reference — Core Decisions

| Topic | Decision |
|---|---|
| Frontend | Next.js 14 (App Router) |
| Styling | Tailwind CSS + shadcn/ui (customised) |
| Component primitives | @base-ui/react (Button, Input) |
| Database + Storage | Supabase (Postgres + Storage) — not connected in demo |
| Patient Auth | GHL Contact ID stored in cookie — not connected in demo |
| Admin Auth | Supabase Auth (demo uses localStorage "admin_auth") |
| Booking | Cal.com free tier (demo uses custom date/time picker) |
| Video Calls | Zoom (auto-created via Cal.com native integration) |
| Reminders | GHL workflows triggered via API webhook |
| AI Reading Extraction | OpenAI GPT-4o Vision (optional path, not primary) |
| Hosting | Vercel |
| Icons | Lucide React |
| Toasts | Sonner |
| Date formatting | date-fns |

---

## Design Direction — "Quiet Luxury"

The app is undergoing a **complete design overhaul** to achieve a premium,
"quiet luxury" aesthetic suitable for a RM 4,888+ diabetes reversal programme.

**Design philosophy:** The digital equivalent of a private practice on Harley Street.
Restraint over excess. Every element earns its place. The craft is there but doesn't
announce itself.

**Key design decisions:**

- **Primary colour:** Deep forest green (`#2D5E4C`) — not teal. Forest green
  communicates renewal, trust, and established luxury (Rolex, Aesop, Harrods).
  Teal was too "health app template."
- **Accent colour:** Warm gold (`#B8860B`) — used ONLY as typographic/detail accent,
  never as a button fill. Scarcity makes it precious.
- **Typography:** DM Serif Display for hero headings (40px, the premium signal) +
  Plus Jakarta Sans for everything else. The serif font IS the personality.
- **Buttons:** Barely-perceptible 2-stop gradient (8% difference top to bottom).
  No inset highlights, no text-shadow, no coloured shadows. One button colour only.
- **Cards:** Shadow-only floating (no visible borders). Three tiers: standard,
  elevated (with subtle left accent bar), tinted (for active/selected states).
- **Animation:** framer-motion for orchestrated page entrance choreography,
  step transitions, bottom nav pill sliding (layoutId), success ceremonies.
- **No emoji anywhere.** Warmth comes from typography, spacing, and motion.
- **Spacing:** Strict 8px grid with defined stops.

Full design system: [08-ui-ux.md](./08-ui-ux.md)
Implementation prompts: [15](./15-quiet-luxury-redesign-prompts.md), [16](./16-quiet-luxury-redesign-prompts-2.md), [17](./17-quiet-luxury-redesign-prompts-3.md)

---

## Project Context

- **Client:** Dr. Jasmine (Metanova Health Sdn Bhd)
- **Purpose:** A patient-facing portal for managing daily health readings, consultations, and personalised dietary/lifestyle guides as part of a **diabetes reversal** programme
- **Primary user:** Patients — predominantly elderly or low-tech-savvy individuals
- **Secondary user:** Dr. Jasmine — managing patient records, consultations, and guides
- **Access model:** Patients receive a unique magic link; no account creation or password required

---

## Current Build State

**Demo build** — all pages functional with localStorage mock data. No backend
services connected. See [01-project-overview.md](./01-project-overview.md#current-build-state)
for details.
