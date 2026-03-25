# Dr. Jasmine Patient Portal — Documentation

This folder is the **source of truth** for the entire project. All architectural decisions,
feature specifications, data models, and build plans are documented here. When in doubt,
refer to these docs before making implementation decisions.

---

## Document Index

| # | Document | What it covers |
|---|---|---|
| 01 | [Project Overview](./01-project-overview.md) | Goals, target audience, constraints, success metrics |
| 02 | [Architecture](./02-architecture.md) | Tech stack, system diagram, data flow between services |
| 03 | [Authentication](./03-authentication.md) | GHL contact ID + cookie auth model for patients; admin auth |
| 04 | [Data Models](./04-data-models.md) | Full Supabase schema, TypeScript types, GHL data mapping |
| 05 | [Patient Portal](./05-patient-portal.md) | All patient-facing feature specs (readings, guide, booking, onboarding, FAQ) |
| 06 | [Admin Panel](./06-admin-panel.md) | Dr. Jasmine's panel, consultation panel, guide builder, patient journey |
| 07 | [Integrations](./07-integrations.md) | Cal.com, Zoom, GHL API, OpenAI Vision — contracts and flow |
| 08 | [UI / UX](./08-ui-ux.md) | Design system, component patterns, accessibility rules for elderly users |
| 09 | [Build Phases](./09-build-phases.md) | Phased development plan with scope per phase |

---

## Quick Reference — Core Decisions

| Topic | Decision |
|---|---|
| Frontend | Next.js 14 (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| Database + Storage | Supabase (Postgres + Storage) |
| Patient Auth | GHL Contact ID stored in cookie — no login screen |
| Admin Auth | Email + password (Supabase Auth) |
| Booking | Cal.com free tier (cloud) |
| Video Calls | Zoom (auto-created via Cal.com native integration) |
| Reminders | GHL workflows triggered via API webhook |
| AI Reading Extraction | OpenAI GPT-4o Vision (optional path, not primary) |
| Hosting | Vercel |
| Data Region | Global (no region lock) |

---

## Project Context

- **Client:** Dr. Jasmine (Metanova Health Sdn Bhd)
- **Purpose:** A patient-facing portal for managing daily health readings, consultations, and personalised dietary/lifestyle guides
- **Primary user:** Patients — predominantly elderly or low-tech-savvy individuals
- **Secondary user:** Dr. Jasmine — managing patient records, consultations, and guides
- **Access model:** Patients receive a unique magic link; no account creation or password required
