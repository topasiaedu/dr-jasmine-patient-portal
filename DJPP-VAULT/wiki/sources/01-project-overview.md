---
title: "Source 01 — Project Overview"
type: "source"
updated: "2026-04-16"
sources: ["docs/01-project-overview.md"]
tags: ["source", "overview", "lifecycle", "metrics"]
---

# Source 01 — Project Overview

**Canonical path:** [`docs/01-project-overview.md`](../../../docs/01-project-overview.md)  
**Do not edit the canonical file from the wiki workflow.** Update this page instead.

## Executive summary

The **Dr. Jasmine Patient Portal** is the digital companion to in-person / telehealth care for patients of Dr. Jasmine (Metanova Health Sdn Bhd). Patients log readings, book and join video consults, view/export a personalised lifestyle guide, and complete pre-consult onboarding. Dr. Jasmine uses an **admin panel** in the same app for records, consultation tooling, guides, and scheduling.

## Primary goals

- Reduce friction for **daily health tracking** (especially elderly / low-tech patients).
- Give Dr. Jasmine **one consolidated tool** for patient information, consults, and guides.
- **Automate reminders** to reduce no-shows.
- **Replace paper** workflows (homework sheets, guides, onboarding forms).

## Secondary goals

- Fast pre/during-consult **history review**.
- Always-available **personalised guide** (no lost printouts).
- Foundation for future: multi-language, additional doctors, analytics.

## Users and constraints

| Role | Constraint |
| --- | --- |
| Patients | Predominantly elderly / low literacy; mobile-first; **English / Mandarin** common; **Bahasa Malaysia** possible; **every step must be obvious**. |
| Dr. Jasmine | Desktop/laptop in consults; **speed** during back-to-back appointments; consultation panel must surface essentials **without extra navigation**. |

## Access model (high level)

- Patients: **no accounts** — unique unguessable URL (credential) distributed via GHL (WhatsApp/email). See [[wiki/concepts/magic-link-patient-access]] and future ingest of `docs/03-authentication.md`.
- Admin: separate protected route; **email + password** via Supabase Auth (per overview; demo uses localStorage).

## Lifecycle (phases)

1. Link sent (GHL)  
2. Onboarding + first booking  
3. Locked / pending (upcoming appointment + Zoom link only)  
4. First consultation (Zoom; consultation panel for notes + initial guide)  
5. Activation (GHL WhatsApp; portal unlocks)  
6. Active use (logging, guide, follow-up bookings; Dr. Jasmine updates over time)

## Non-goals

- EMR / prescriptions / clinical records store  
- Payments / billing  
- In-app messaging (GHL handles)  
- Multi-doctor **for now** (future consideration; no multi-tenant build required at this stage)  
- Native iOS/Android for launch (PWA-quality web sufficient)

## Success metrics (targets)

| Metric | Target |
| --- | --- |
| Onboarding completion | >80% of link recipients |
| Reading submissions | ≥4 readings/week for >60% of active patients |
| No-show rate | <10% |
| Guide build time | <5 minutes per patient |

## Business context

- **Company:** Metanova Health Sdn Bhd — [[wiki/entities/metanova-health]]
- **Focus:** Private GP / **metabolic health**, **diabetes reversal** via personalised diet and lifestyle (LCHF, Mediterranean, IF, low GI, evidence-based mix).
- **Pain today:** lost printouts, manual reminders, no longitudinal view, paper onboarding hard to reference live.

## Current build state (demo)

- **Frontend:** full patient + admin journeys with **localStorage** keys and **`lib/mock-data.ts`**.
- **Not connected:** Supabase DB, Cal.com embed (custom picker demo), GHL, OpenAI Vision, Zoom join.
- **Admin auth in demo:** `localStorage` key `"admin_auth"` — not Supabase yet.
- **Next milestone (per doc):** design overhaul (`docs/08-ui-ux.md`, `docs/12-design-implementation-prompts.md`), then backend integration.

## Wiki links out

- Hub: [[wiki/_overview]]
- Concept: [[wiki/concepts/magic-link-patient-access]]
- Entity: [[wiki/entities/metanova-health]]

## Open questions for future ingests

- Exact cookie / token shape for patients (`docs/03-authentication.md`).
- Schema truth vs demo drift (`docs/04-data-models.md`).
