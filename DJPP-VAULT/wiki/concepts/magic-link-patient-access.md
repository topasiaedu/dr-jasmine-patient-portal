---
title: "Magic-Link Patient Access"
type: "concept"
updated: "2026-04-16"
sources: ["docs/01-project-overview.md"]
tags: ["auth", "patient", "ghl", "access-model"]
---

# Concept — Magic-Link Patient Access

**Status:** Partial — introduced in [[wiki/sources/01-project-overview|Source 01]]; full contract pending ingest of [`docs/03-authentication.md`](../../../docs/03-authentication.md).

## Definition

Patients **do not create accounts**. Authentication is a **unique, unguessable URL** treated as the credential, distributed by Dr. Jasmine’s team through **GoHighLevel (GHL)** via WhatsApp or email.

## Implications (from overview)

- No usernames/passwords for the patient surface.
- The link is the **primary trust boundary** — design and ops must protect generation, rotation, and leakage scenarios (detail in doc 03, not yet ingested).

## Related

- [[wiki/_overview]]
- [[wiki/entities/metanova-health]]
- Future: `docs/03-authentication.md` → expand cookie model, GHL contact ID mapping, admin vs patient split.
