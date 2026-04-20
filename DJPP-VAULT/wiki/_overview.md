---
title: "Dr. Jasmine Patient Portal — Wiki Overview"
type: "overview"
updated: "2026-04-16"
sources: ["docs/01-project-overview.md"]
tags: ["overview", "patient-portal"]
---

# Dr. Jasmine Patient Portal — Living Overview

This page is the **compiled synthesis** of what the wiki knows. Prefer links into `wiki/sources/` for line-level fidelity to specs; use this page for orientation and cross-cutting themes.

## One-Sentence Product

A **patient-facing web portal** (plus **admin panel**) for Dr. Jasmine’s practice ([[wiki/entities/metanova-health|Metanova Health]]) supporting daily health logging, video consultations, personalised guides, and onboarding — with a **magic-link** access model for patients ([[wiki/concepts/magic-link-patient-access|details]]).

Canonical specifications remain in [`docs/README.md`](../../docs/README.md).

## Pillars (from ingested material)

1. **Low-friction tracking** — elderly / low digital literacy; mobile-first; no ambiguity in UI.
2. **Single tool for practitioner** — records, consultation workflow, guides, schedule in one admin surface.
3. **Digitise paper** — homework sheets, guides, onboarding move from print to structured digital flows.
4. **Demo today, production tomorrow** — current app is a **demo build** (localStorage + mocks); backend integrations documented but not live. See [[wiki/sources/01-project-overview|Source 01 — Project Overview]].

## Patient lifecycle (compressed)

Link issued (GHL) → onboarding + book → locked/pending until first consult → Zoom consult + guide creation → activation (WhatsApp via GHL) → active logging and follow-ups.

## Explicit non-goals (carry forward)

Not an EMR, no billing, no in-app doctor–patient chat (GHL/WhatsApp), single practitioner scope for now, no native mobile apps for launch.

## Where to go next

- **Source detail:** [[wiki/sources/01-project-overview]]
- **Access model (deep dive pending doc 03):** [[wiki/concepts/magic-link-patient-access]]
- **Organisation:** [[wiki/entities/metanova-health]]

## Ingestion status

| Doc | Wiki source page | Status |
| --- | --- | --- |
| `docs/01-project-overview.md` | [[wiki/sources/01-project-overview]] | Ingested |
| `docs/02`–`19` | — | Not yet ingested (read from `docs/` on demand) |
