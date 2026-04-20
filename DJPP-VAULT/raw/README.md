# Raw Layer — Immutable Sources

Files here are **inputs** to the wiki, not the wiki itself.

## Registered corpus (canonical)

Project specifications and plans live in the repository **`docs/`** folder (sibling to `DJPP-VAULT/`). Those files are the **authoritative** product documentation. The agent **reads** them during ingest; it does **not** edit them for vault housekeeping.

Paths are registered in [`SOURCES.md`](./SOURCES.md).

## Inbox (optional)

Place ad-hoc markdown here (web clippings, meeting notes) when the material is **not** yet part of `docs/`. Ingest creates `wiki/` pages and log entries; it does not automatically promote inbox files into `docs/` unless you ask.

## Assets

Use `raw/assets/` for downloaded images referenced by clipped articles so links stay local and durable. See `CLAUDE.md` for image + ingest notes.
