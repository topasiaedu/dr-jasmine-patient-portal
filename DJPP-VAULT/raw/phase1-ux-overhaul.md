# Phase 1 UX Overhaul — What We Are Doing

**Date:** 2026-04-19  
**Status:** Decisions locked, implementation pending  
**Context:** This document records the outcome of a UX review session. The companion file `phase1-agent-prompts.md` contains the implementation prompts derived from these decisions.

---

## The Problem We Identified

The app was being built as a data-collection tool (log readings, view guide) without sufficiently answering: **why would Dr. Jasmine or a patient prefer this over their existing workflow?**

Currently:
- Dr. Jasmine sends guides manually via WhatsApp
- Patients write readings on paper and WhatsApp them back
- GHL handles intake, booking, reminders, and messaging

The app duplicates these workflows instead of replacing or improving them. The result feels forced — more places to check, no clear time-saving.

The fix is not to add more features. It is to make the **three Phase 1 experiences genuinely excellent** so each one is clearly better than the current manual equivalent.

---

## Phase 1 Scope (Locked)

Phase 1 = three core experiences and nothing more:

| Experience | User | Status |
|---|---|---|
| Log health readings (manual + photo scan) | Patient | Partially built; photo scan is a stub |
| View personalised dietary guide | Patient | Working but missing 3 guide sections |
| Consultation workspace | Dr. Jasmine (admin) | Built but entirely mock data |

Everything else (in-app booking via Cal.com, patient chat, Zoom integration, WebRTC, multi-doctor, analytics) is Phase 2+.

---

## Design Decisions Made

### Patient side

**No progress charts.** Showing numeric trends creates unrealistic expectations and patient pressure on Dr. Jasmine. Different patients have different conditions, timelines, and baselines — a single chart cannot convey that nuance. Charts are NOT to be added in Phase 1.

**Behavioural acknowledgment instead.** What the patient *can* see without clinical risk: the date they last logged, and a count of how many readings they have submitted this month. This tells them "your data is being received" without implying a clinical verdict.

**Photo scan is Phase 1.** Most of Dr. Jasmine's patients already use a paper logbook. A photo scan that pre-fills the form is a meaningful upgrade over typing 7 numbers manually. The stub implementation needs to be completed with a real OpenAI Vision API route.

**Success screen is good — leave it.** "Dr. Jasmine will review your readings" is the right copy. The animation is good. No changes needed here.

### Admin side (Dr. Jasmine)

**The consultation panel is the centrepiece.** This is where Dr. Jasmine spends the most time. It must show real patient data. Currently it is hardcoded to a mock patient ("Lily Tan") regardless of which patient URL is loaded. This is the highest-priority fix.

**Dr. Jasmine wants to see all readings, not a slice.** She reviews a patient's full history to give advice — not just the last 5 or 8 entries. The API already returns all readings with no server-side limit. The UI slices are just bad defaults that need to be removed.

**The patient list and profile have too much "fluff."** Specific issues:
- Disabled search/filter UI (dead controls) → implement them properly since search helps Dr. Jasmine in Phase 1
- "Created at" column in the patient list → replace with "last reading date" which is actually actionable
- GHL contact ID displayed prominently in patient profile → internal ID, not useful to show Dr. Jasmine
- Care team notes panel occupies 2/5 width for just one text field
- Readings displayed as large cards → a compact dense table is more scannable for a doctor

**The dashboard stats are hardcoded fiction.** "42 active patients," "84% guide adherence," "3 meetings today" are literals in JSX. These need to come from real Supabase queries. Stats that cannot be calculated yet (guide adherence, meetings today without Cal.com) should be removed rather than faked.

**The guide builder is incomplete.** Three sections are missing from the admin builder UI: Replacements (smart swaps), Portions (plate ratios), and Cooking Methods. These are already:
- Defined in `lib/types/patient-guide.ts` (`PatientGuideContent`)
- Handled in `lib/guide/guide-version-to-write-payload.ts` (persisted)
- Handled in `lib/guide/patient-content-to-guide-version.ts` (loaded)
- Rendered correctly in the patient guide page (`app/p/[ghlContactId]/guide/page.tsx`)

The builder UI in `app/admin/patients/[id]/guide/page.tsx` is the only gap.

**Scheduling next session via the consultation panel is Phase 2.** It depends on Cal.com integration which is not live. Remove the scheduling modal from the consultation panel.

---

## Implementation Task Summary

Seven self-contained tasks, in suggested implementation order:

| # | Task | Files touched | Complexity |
|---|---|---|---|
| 1 | Patient home: show "last logged" date + reading count | `app/api/patient/me/route.ts`, `app/p/[ghlContactId]/home/page.tsx` | Small |
| 2 | Photo scan: implement OpenAI Vision route + wire up camera | `app/api/readings/extract-image/route.ts` (new), `app/p/[ghlContactId]/log/page.tsx` | Medium |
| 3 | Guide builder: add Replacements, Portions, Cooking Methods | `app/admin/patients/[id]/guide/page.tsx` | Medium |
| 4 | Admin patient list: real search/filter + last reading column | `app/api/admin/patients/route.ts`, `app/admin/patients/page.tsx` | Medium |
| 5 | Admin patient profile: restructure, all readings, clean up | `app/admin/patients/[id]/page.tsx` | Medium |
| 6 | Consultation panel: connect to real data, remove mocks | `app/api/admin/patients/[id]/onboarding/route.ts` (new), `app/api/admin/patients/[id]/notes/route.ts` (new), `app/admin/patients/[id]/consult/page.tsx` | Large |
| 7 | Admin dashboard: real counts, remove fake stats | `app/api/admin/stats/route.ts` (new), `app/admin/dashboard/page.tsx` | Small-Medium |

---

## What Is Deliberately Not Changed

- The stepped 1-field-per-screen logging flow — correct for elderly users
- The overall quiet-luxury visual design language
- The bilingual (EN/ZH) labels on patient forms
- The guide patient view (`app/p/[ghlContactId]/guide/page.tsx`) — already renders all sections correctly
- The `middleware.ts`, auth system, or Supabase schema — no schema changes needed for any of these tasks
- Video calls — Zoom links from Cal.com remain the plan; no WebRTC
- In-app booking — Phase 2+
- GHL integrations (WhatsApp reminders, "Send My Link") — already defined, not changed

---

## Tech Stack Reference (for agents)

- **Framework:** Next.js App Router, TypeScript strict mode
- **Database:** Supabase (Postgres). Schema in `supabase/migrations/20260416120000_initial_schema.sql`
- **Auth — admin:** Supabase Auth email+password. Admin Route Handlers use `getAdminUserForRequest` from `lib/supabase/admin-auth.ts`
- **Auth — patient:** Cookie-based session. Patient Route Handlers use `resolvePatientFromRequest` from `lib/auth/resolve-patient-request.ts`
- **Supabase client (server):** `createServiceRoleClient()` from `lib/supabase/admin.ts` — use in all Route Handlers after auth check
- **UI components:** shadcn/ui (`components/ui/*`), Tailwind CSS, Framer Motion
- **Toast notifications:** `sonner` (`import { toast } from "sonner"`)
- **Tables:** Supabase key tables: `patients`, `daily_readings`, `patient_guides`, `onboarding_responses`, `consultation_notes`, `appointments`

### Mandatory coding standards (non-negotiable)
- Full code — no `// TODO` or placeholder comments
- Strict TypeScript — no `any`, no `!` non-null assertion, no `as unknown as T`
- Double quotes `"` for all strings
- Template literals instead of string concatenation
- JSDoc headers on exported functions
- Comments should only explain non-obvious intent — not narrate what the code does
- All `async` operations use proper `await` or `void`; no floating promises
