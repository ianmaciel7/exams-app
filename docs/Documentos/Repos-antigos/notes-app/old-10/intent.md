# Intent: Recall — Community Exam Prep Platform

- Working name: **Recall** (decided below, was open)
- Author: Project team
- Created: 2026-09-19
- Updated: 2026-09-19 (implementation audit)
- Status: approved — product owner approved 2026-09-19

## Problem

Learners preparing for certifications and exams suffer from severe tool fragmentation. They use platforms like ExamTopics for practice, Readwise/Reader to save documentation highlights, and Capacities/Notion for personal notes. There is no unified tool that merges object-based workspaces, citation management, and exam simulations, making it impossible to seamlessly link a practice question directly to its source documentation and personal study notes within a single knowledge graph.

## Proposed outcome

Create a graph-based, collaborative, private, Space-based platform for teams and study groups that merges exam prep, spaced repetition, and Personal Knowledge Management (PKM). The ultimate vision is a system where users can take a `Question` object, link it to a specific `Citation` (e.g., a highlight from official docs), and connect it to a personal `Note`, with seamless graph navigation between them. The UX must be heavily inspired by Capacities' fluid, object-oriented structure. The platform will support multiple question formats, track missed questions, and expose a read-oriented study experience through an MCP interface.

## Affected users and systems

- Self-study learners using the platform as their primary PKM and spaced repetition tool.
- Content creators (users) managing their Spaces, authoring exams, notes, and citations.
- The web application frontend, authentication provider, database, and security rules (enforcing strict isolation per Space).
- Shared domain/application services used by the web UI and MCP server.
- External MCP-compatible clients consuming the study interface.

## Constraints

- **All Spaces are private (decided 2026-09-19, reverses the earlier "free community browsing" constraint).** There is no public or anonymous browsing surface — every object is visible only to members of its owning Space. Collaboration is strictly scoped to member-invited private Spaces for study groups and teams.
- Core study features (spaced repetition, all object types, MCP read access for a Space's own members) must stay free of a paid plan for any Space member — monetization is still deferred (below), not a reason to paywall the core loop.
- **Space-Based Architecture:** The core hierarchy must be built around user-owned "Spaces" with strict tenant-level data isolation. A user may own or belong to multiple Spaces (confirmed 2026-09-19, Capacities-style — not capped to one).
- **Graph-Ready MVP:** Content must be strictly modeled as objects. To support the PKM vision, the MVP object types are: `Questions`, `Exams`, `Tags`, `Collections`, `Notes`, and `Citations`. 
- **Polymorphic Relations:** The database MUST be designed to support a knowledge graph architecture. It must allow bidirectional linking between any objects (e.g., a Question linked to a Citation and a Note) without schema friction.
- The MVP supports `single-choice`, `multiple-choice`, `fill-blank`, and `matching` question formats.
- `ordering`, `hotspot`, and `simulation` question formats are reserved for the schema but not the MVP UI.
- The MVP must include a spaced repetition mechanism for missed questions, allowing flexible review schedules.
- The initial MCP surface is read-oriented; administrative and user-state write tools are deferred.
- Monetization, voting, and question discussion threads are out of scope for v1.
- **Content moderation (v1):** no pre-publish review gate within a Space — an object becomes visible to Space members per its `visibility` field the moment its owner sets it. Any Space member can report an object; a reported object is hidden from other members pending review by the Space's admin or a platform admin. Scoped to abuse *within* a shared private Space (since nothing is ever public), not community-wide moderation. See spec.md FR-9.
- **Spaced repetition algorithm:** SM-2 (not Leitner) — chosen for its per-card ease factor, which fits a `study_records` schema already tracking `interval`/`easeFactor`/`history` better than Leitner's fixed-box model, and it's the de facto standard for this problem (Anki, SuperMemo).
- **Exams are capped at one per user (confirmed 2026-09-19).** Each user may own/author at most one `Exam` object. Flagged as unusual in spec.md §9 — it blocks a user preparing for two certifications from having two exams — kept as stated rather than second-guessed, since it was explicitly confirmed.
- **Study sessions are configurable, including a simulated-exam mode (added 2026-09-19).** Before studying, a user picks scope (all due, or narrowed to an Exam/Tag/Collection), question count, and mode: `practice` (immediate feedback, today's default flow) or `simulated_exam` (timed, no feedback until the end, formatted like the real certification exam). See spec.md FR-11.

## Success Criteria

Confirmed measurable acceptance targets:

- **Bidirectional Graph Traversal:** A learner can author a `Question`, link it to a `Citation` and a personal `Note`, and navigate between all three via bidirectional relations and reactive backlinks within a single Space with zero cross-Space leakage.
- **Automated Spaced Repetition Scheduling:** Answering a question incorrectly automatically enrols it into the SM-2 review queue; subsequent reviews accurately recalculate interval, ease factor, and `nextReviewDate` server-side according to the SM-2 specification.
- **Zero-Paywall Core Study Loop:** Any invited member of a private Space can create, browse, and study all objects within that Space with zero subscription or paywall barrier.
- **Tenant-Isolated MCP Integration:** An external MCP-compatible client authenticating with a valid Space-scoped API key (`rcl_live_...`) can query `Questions`, `Notes`, `Citations`, and study summaries strictly scoped to that Space, returning 401/403 upon invalid credentials or cross-Space traversal attempts.
- **Deterministic Exam Simulations:** Users can configure and complete timed, simulated exam sessions where answering does not reveal immediate feedback and session expiration triggers automatic submission within a server-enforced grace window.

## Open questions

*None currently open. All previous open questions have been formally resolved.*

### Resolved Decisions

- **MCP Authentication & Access Control:** Resolved using Space-scoped SHA-256 hashed API keys (`rcl_live_<base62>`) stored in `/api_keys`. Keys grant read-only access to `Questions`, `Notes`, `Citations`, and study summaries for authorized Space members only.
- **Collaboration vs. Private Spaces:** Resolved by scoping collaboration strictly to member-invited private Spaces with zero unauthenticated or public browsing. Crowdsourcing is framed as multi-user collaborative study within shared private Spaces.
- **Final application name and branding:** Resolved → **Recall**.
- **Content moderation/validation before sharing:** Resolved → report-and-hide model for shared Space abuse; see Constraints and spec.md FR-9.
- **Database pattern for object relations:** Resolved → Firestore with a central `object_links` edge collection; see spec.md §6.
- **Spaced repetition algorithm:** Resolved → SM-2; see Constraints and spec.md §2.1.

## Related

- [Specification](spec.md)
- [Implementation Plan](plan.md)

## Implementation status

**Updated 2026-09-20:** the authenticated data and execution boundary from the previous
update is no longer just "underway" — `/space`, `/question`, `/study`, and
`/review` are real, route-protected, Space-scoped Server Components backed by the
existing auth/object/study Server Actions, with a working Space switcher, object
create/edit/archive/report flow, and practice/simulated-exam session runner. See
spec.md §12 and plan.md §8 for exactly what changed. A second pass on the same date
closed out the items that update listed as outstanding: `/question/[id]` object detail
with links and backlinks (FR-8), the `/api/mcp` read-only MCP server with Space-scoped
hashed API keys managed from `/settings` (FR-7), and the literal SM-2 `EF'` formula
with a 0–5 self-grade scale, plus CLS-stable loading skeletons. What remains is the
TipTap block editor, the command palette / tabs surfaces (FR-12), and the browser-level
E2E suite. All core architectural decisions (MCP authentication with Space-scoped
hashed API keys, collaborative private Space tenancy, SM-2-family scheduling, and exam
simulation modes) remain formally resolved and incorporated into [spec.md](spec.md) and
[plan.md](plan.md).

**Updated 2026-09-21:** the TipTap editor, command palette, and space/context-panel
tab surfaces named above as remaining were built in the interim (see plan.md §8's
fourth/fifth/sixth passes) and a subsequent verification pass confirmed almost every
resolved decision above still holds in the code exactly as decided. One Success
Criterion is not yet fully met: "Deterministic Exam Simulations" says session
expiration triggers automatic submission "within a server-enforced grace window," but
the shipped exam timer enforces a hard cutoff with no grace window and a fixed
90-seconds-per-question limit rather than a user-configured one (spec.md §9.22 has the
detail). The decision itself (timed, no-feedback-until-end simulated exams) stands;
only the grace-window mechanics remain to be built.

**Updated 2026-09-21 (Firebase UI Component Registry Integration & Placement Policy):**
- Configure `"@firebase": "https://firebaseopensource.com/r/{name}.json"` registry in `components.json`.
- Install all Firebase UI screen/form primitives (`sign-in-auth-screen`, `sign-in-auth-form`, `multi-factor-auth-assertion-screen`, `multi-factor-auth-assertion-form`, `sms-multi-factor-assertion-form`, `totp-multi-factor-assertion-form`, `policies`) via shadcn CLI and locate them strictly under `src/components/firebase/`.
- Add `@firebase-oss/ui-core` dependency in `package.json`.
- Maintain custom domain components in `src/components/recall/` (e.g., `google-sign-in-button.tsx`) and enforce zero unneeded modifications to vendor primitives in `src/components/firebase/`.
- Update all internal component imports and documentation references across `src/` and `tests/`.

**Updated 2026-09-22:** 51 commits landed directly on `prototype` after the entry
above (bug fixes, new/hardened E2E coverage, a CI overhaul) without a plan.md sync —
now logged in [plan.md](plan.md)'s "Untracked drift sync" entry. That sync also found
the repo is not currently green: `pnpm exec tsc --noEmit` has 2 real type errors in
`src/components/firebase/policies.tsx`, and `pnpm lint` has 16-17 formatting errors
across 8 files. See plan.md for the full breakdown and what remains open.

**Updated 2026-09-22 (same day, second sync):** one further commit
(`a080e890`) landed after the drift sync above without its own plan.md entry —
closed twice-over by this update. It resolves two items the drift sync and
spec.md §12 had open: the sidebar rail width (spec.md §5.4 "Resize limits")
is now persisted via a `sidebar_width` cookie the same way the desktop
collapse state already was, and `tests/e2e/layout-regression.spec.ts` gained
real pixel-diff baselines (`toHaveScreenshot()`), closing the long-standing
"visual-regression coverage remains open" item. It introduces one new gap in
its place: baselines are OS/renderer-specific and gitignored, and CI has no
step to generate/cache Linux baselines yet, so pixel-diff protection is
currently local-only — see plan.md's ninth pass entry. The same commit also
added `SECURITY.md` and `CONTRIBUTING.md`, which resolves the security half
of spec.md §9 item 1 ("no documented brand/security/UX policy exists") — a
real, normative security policy now exists; brand/UX policy documents still
do not.
