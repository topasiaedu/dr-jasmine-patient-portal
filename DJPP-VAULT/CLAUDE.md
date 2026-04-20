# DJPP-VAULT — LLM Wiki Schema (Agent Rules)

This file is the **single source of discipline** for how the LLM maintains this vault. Treat it as configuration, not prose. If instructions here conflict with casual chat, **follow this file**.

---

## 1. Purpose

This vault implements the **LLM Wiki** pattern: a compounding, interlinked markdown knowledge base maintained by the agent, sitting **between** immutable project sources and the questions you ask.

**Human responsibilities:** curate which sources matter, steer emphasis, ask questions, resolve meaning.  
**Agent responsibilities:** ingest into the wiki, cross-reference, reconcile contradictions, update `index.md` and `log.md`, run lint passes, file durable answers back into `wiki/`.

---

## 2. Three Layers (Non-Negotiable)

| Layer | Path | Who edits | Rule |
| --- | --- | --- | --- |
| **Raw sources** | Repo `docs/` (registered) + optional `DJPP-VAULT/raw/inbox/` | Humans / upstream docs | **Immutable for ingest.** Never modify these files during vault maintenance. Read only. |
| **Wiki** | `DJPP-VAULT/wiki/` | Agent (unless human explicitly edits) | All synthesis, entity pages, topic pages, analyses. **All agent-written markdown lives here** (except `CLAUDE.md`, `index.md`, `log.md`, and `raw/` metadata). |
| **Schema** | `DJPP-VAULT/CLAUDE.md` | Human + agent (co-evolve) | Conventions, workflows, structure. Agent may propose edits; human approves structural changes. |

**Canonical product documentation** for this repository remains `docs/`. The wiki **summarises, links, and compiles** knowledge from `docs/`; it does not replace `docs/` as the contractual spec.

---

## 3. Directory Layout

```text
DJPP-VAULT/
  CLAUDE.md              ← This schema (agent behaviour)
  index.md               ← Content catalogue (updated every ingest + major query filing)
  log.md                 ← Append-only timeline (every ingest, query-to-wiki, lint)
  Welcome.md             ← Human orientation (Obsidian home note)
  raw/
    README.md            ← Explains raw layer + immutability
    SOURCES.md           ← Registry of registered sources (paths into docs/ + inbox)
    assets/              ← Optional: images for clipped articles (see raw/README.md)
    inbox/               ← Optional: new markdown sources not yet in docs/
  wiki/
    _overview.md         ← Living project synthesis (start here for “what is this?”)
    sources/             ← One page per ingested source (summary + key claims + links out)
    concepts/            ← Concept/topic pages (cross-cutting ideas)
    entities/            ← Named things: people, orgs, products, integrations
    analyses/            ← Filed answers from deep queries (comparisons, audits, plans)
```

**Naming conventions**

- Use **kebab-case** filenames: `magic-link-access.md`, not `Magic Link.md`.
- Prefix source mirror pages with the doc number when it matches `docs/`: `wiki/sources/01-project-overview.md`.
- Prefer **Obsidian wikilinks** for intra-vault navigation: `[[wiki/_overview]]`, `[[wiki/concepts/example]]` (paths relative to vault root without `.md` is acceptable in Obsidian if configured; otherwise use full path from vault: `[[wiki/concepts/example]]`). **Also** include one plain relative markdown link per first mention for GitHub portability, e.g. `[Overview](../wiki/_overview.md)` where helpful.

**Optional YAML frontmatter** (recommended on wiki pages):

```yaml
---
title: "Short Title"
type: "source|concept|entity|analysis|overview"
updated: "YYYY-MM-DD"
sources: ["docs/01-project-overview.md"]
tags: ["patient-portal", "auth"]
---
```

---

## 4. Source Registry (`raw/SOURCES.md`)

- Every path registered must be **stable** and treated as read-only by the agent.
- **Primary corpus:** files under `docs/` at repository root (`../docs/` from this vault folder).
- **Inbox:** only material placed in `DJPP-VAULT/raw/inbox/` by the human (clippings, notes). Ingest may copy nothing into `docs/` unless the human asks — usually you create wiki pages only.

When registering a new source, append a row or bullet with: path, one-line description, date added to registry.

---

## 5. Operational Workflows

### 5.1 Ingest (mandatory checklist)

Execute in order unless the human specifies otherwise.

1. **Read** the source file end-to-end (and any images if applicable — text first, then image paths).
2. **Discuss** with the human: 2–5 key takeaways, anything surprising, and what to emphasise (if the human is present; if async, state assumptions explicitly in the source wiki page under an `## Assumptions` section).
3. **Write or update** `wiki/sources/<slug>.md` for that source: summary, key claims, open questions, links to `docs/` path.
4. **Update** relevant `wiki/concepts/*`, `wiki/entities/*`, and `wiki/_overview.md` so the synthesis stays current. If new material **contradicts** old wiki text, keep both and add `## Contradictions / Supersedes` with dates and pointers.
5. **Update** `index.md`: add or refresh entries (title, one-line summary, link).
6. **Append** `log.md` with a line matching the log template (see §7).
7. **Never** edit the raw source file in `docs/` or registered immutable paths for “wiki hygiene” — fix the wiki instead.

### 5.2 Query (mandatory checklist)

When the human asks a question:

1. **Read** `index.md` to locate relevant pages.
2. **Open** the smallest set of wiki pages that answer the question; drill into `docs/` only if the wiki is stale or missing detail.
3. **Answer** with citations: wikilinks or paths like `` `docs/03-authentication.md` ``.
4. If the answer is **durable** (comparison, decision record, audit), ask whether to file it; default for this project: **offer** `wiki/analyses/<topic>.md` and link it from `_overview.md` if accepted.
5. If filed, **append** `log.md` (`query` entry) and **update** `index.md`.

### 5.3 Lint (periodic health pass)

When the human requests lint, or after large ingests:

1. Scan for **contradictions** between wiki pages (same claim, different facts) — document in a new `wiki/analyses/lint-YYYY-MM-DD.md` or inline `## Contradictions` blocks.
2. Flag **stale** pages whose `updated` or sources predate newer ingests.
3. List **orphans** (no inbound wikilinks from `_overview.md` or index sections).
4. Note **missing concept pages** for heavily linked terms.
5. Suggest **next sources** to ingest or questions to resolve.

Append `log.md` with `lint` entry; update `index.md` if new analysis page.

---

## 6. `index.md` Rules

- **Goal:** Content-oriented map of the vault. The agent reads this **first** on queries.
- Maintain sections (adjust as the wiki grows): Overview, Sources, Concepts, Entities, Analyses.
- Each entry: link, one-line summary, optional `updated` / source count from frontmatter.
- Keep entries **sorted within section**: numbered docs in order, then alphabetical.

---

## 7. `log.md` Rules

- **Append only.** Never rewrite history; never delete past entries.
- Each entry starts with a **parseable heading**:

```markdown
## [YYYY-MM-DD] ingest | <Short source title or slug>
## [YYYY-MM-DD] query | <Short question slug>
## [YYYY-MM-DD] lint | <optional scope>
```

Body: bullet list of what changed (files touched, major wiki updates).

---

## 8. Session Preamble (Agent)

At the start of each session when working in this vault:

1. Read `DJPP-VAULT/CLAUDE.md` (this file).
2. Read the last **5** entries in `log.md` (search for `## [` and take from bottom).
3. Skim `index.md` for current map.

Then proceed with the human request **in compliance** with these workflows.

---

## 9. Relationship to Application Code

- **Specs and truth for implementation** remain in `docs/`.
- The wiki may track **implementation drift** (e.g. “wiki says X, code does Y”) in `wiki/analyses/` — never silently “fix” code from the wiki without human instruction.

---

## 10. Security and Privacy

- Do not paste **secrets** (API keys, tokens, patient identifiers) into the wiki.
- Prefer references to env var **names** and integration patterns described in `docs/`.

---

## 11. Co-Evolving This Schema

When repeated friction appears (naming, folder types, lint cadence), propose a **minimal** patch to `CLAUDE.md` in chat before editing, unless the human asked you to update it directly.

---

*End of schema.*
