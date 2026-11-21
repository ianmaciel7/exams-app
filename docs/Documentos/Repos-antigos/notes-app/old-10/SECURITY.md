# Security Policy

This is a normative security policy for Recall, not an audit report. It states what is covered, how to report a problem, and the invariants the codebase is expected to hold. See [ARCHITECTURE.md](./ARCHITECTURE.md) for how these invariants are implemented.

## Supported Versions

Recall is pre-1.0 (`package.json` version `0.1.x`) with a single active development line on `main`/`prototype`. There is no long-term-support branch yet; security fixes land on the current line only.

## Reporting a Vulnerability

Report privately — do not open a public issue or PR with exploit details.

- Preferred: [GitHub Security Advisories](https://github.com/ianmaciel7/notes-app/security/advisories/new) (private by default).
- Include: affected component/file, reproduction steps, impact, and whether the report involves cross-Space data exposure, credential/API-key exposure, or auth bypass.
- Do not include live secrets or a destructive proof-of-concept.

We acknowledge reports as soon as practical, triage by reachability and exploitability, and coordinate a fix before public disclosure. Credit is given if requested.

## Scope

Covered: the Next.js App Router application, its Server Actions, the Firebase Auth/Firestore integration, `firestore.rules`, and the MCP read server (`src/lib/mcp/`) and its API-key issuance/validation (`src/actions/api-keys.ts`, `src/lib/mcp/`).

Out of scope: the historical `.worktrees/old-*` reference checkouts (not part of the runtime — see ARCHITECTURE.md § Worktrees), third-party services' own infrastructure (Firebase/GCP, GitHub), and denial-of-service via raw traffic volume against a single developer's local environment.

## Assets & Sensitivity

| Asset | Sensitivity |
|---|---|
| Firebase Admin credentials, session cookies | Critical |
| MCP API keys (`rcl_live_...`, hashed at rest) | Critical |
| Space membership and per-Space objects (Questions, Exams, Notes, Citations, Tags, Collections) | High |
| Study records/attempts (SM-2 state) | High |
| `firestore.rules`, deployment/environment config | Medium |
| Dependency lockfile (`pnpm-lock.yaml`) | Medium |

## Threat Model & Trust Boundaries

- **Browser → server**: all client input is untrusted. Server Actions re-validate everything the client sends; the client never talks to Firestore directly.
- **Firebase ID token → server authority**: session identity is established server-side; `authorized()` is the chokepoint for every session-authenticated Server Action.
- **MCP API key → server authority**: the key-binding lookup is the chokepoint for every MCP-authenticated request; a key is scoped to exactly one Space and is read-only.
- **Cross-Space boundary**: every entity carries `spaceId`; no code path queries across Spaces. This is the boundary most worth scrutinizing in review — see Security Invariants below.

## Security Invariants

These are enforced today (see `ARCHITECTURE.md` § Multi-tenancy & Isolation Invariants) and any change touching them needs explicit review, not just tests:

- **Composite key scoping** — entities are logically partitioned by `[spaceId, id]`; sub-resource lookups check `spaceId` before returning data.
- **Relational integrity** — `saveObject()` writes `object_links` edges only after confirming both endpoints live in the caller's active Space.
- **Constant-time information hiding** — cross-Space lookups return a uniform 404, never 403, in both the web app (`question/[id]/page.tsx`) and the MCP `get_object` tool, to avoid ID-probing/timing oracles.
- **Default-deny Firestore rules** — `firestore.rules` denies all direct client reads/writes (`allow read, write: if false`); every mutation goes through server-authoritative Server Actions or authenticated MCP handlers.
- **MCP keys are read-only and Space-scoped** — a key never grants write access or access beyond its issuing Space, and keys are stored hashed (SHA-256), never in plaintext.
- **Server-only Firebase Admin** — `firebase-admin` (`src/lib/firebase/admin.ts`) is imported only from server-only modules (`src/actions/*`, `src/lib/mcp/*`); it must never reach a client bundle.

## Reportable Findings (examples)

Cross-Space data access or write; session or MCP-key auth bypass; a way to enumerate or infer another Space's object IDs; MCP API key exposure or privilege escalation beyond read-only/single-Space; secret exposure (Firebase Admin credentials, session tokens) in logs, errors, or client bundles; a Firestore rule or Server Action that allows a write outside its owning Space; XSS via TipTap-authored rich text that survives serialization/sanitization.

## Out of Scope / Accepted Risk

- Firebase/GCP platform-level incidents (covered by Google's own security program).
- Loss of data a user deliberately exports or shares outside a Space.
- Denial of service requiring resources beyond what a single attacker could plausibly marshal against a small, pre-1.0 app.

## Security Architecture

**Auth/AuthZ** — Firebase Auth issues ID tokens; the server verifies them and establishes a session (`sessions` collection). `authorized()` is required before any Space-scoped read/write.

**MCP API keys** — issued per Space, prefixed `rcl_live_`, stored as a SHA-256 hash in `/api_keys`; validation happens server-side per request, never trusts a client-supplied Space ID over the key's own binding.

**Secret management** — runtime secrets live in environment variables / the deploy platform's secret store, never committed. `.env` is git-ignored; keep any `.env.example` limited to placeholder values.

**Dependency & supply chain** — pnpm with a committed lockfile (`pnpm-lock.yaml`); `pnpm install --frozen-lockfile` in CI. No automated dependency-update or SAST scanning is currently configured in `.github/workflows/` — `ci.yml` and `prototype-validation.yml` run lint/test/build only. Adding Dependabot and CodeQL is a reasonable next step but is not yet in place; don't claim otherwise elsewhere in the docs.

**Input validation** — validate at the Server Action boundary with `zod` schemas; never trust client-supplied `spaceId` without re-deriving Space membership server-side.

## Secure Coding Guidelines

- No `dangerouslySetInnerHTML` or `eval` on user- or AI-adjacent content.
- Keep `firebase-admin` usage server-only; a client-bundle import of it is a bug, not a style issue.
- Prefer the existing `zod` schemas over ad hoc validation.
- Errors returned to the client should be generic; log detail server-side only, without secrets or full document contents.
- Update `firestore.rules` in the same change as any schema or collection change it should cover.

## Rules for AI Coding Agents

This repository is developed with heavy AI-tooling involvement (see `AGENTS.md`). The same invariants bind agents as bind humans:

- Read this file and `ARCHITECTURE.md` § Multi-tenancy & Isolation Invariants before touching `src/actions/`, `src/lib/firebase/`, `src/lib/mcp/`, or `firestore.rules` — the `tenancy-invariant-check` skill and `tenancy-isolation-reviewer` agent exist for exactly this.
- Never commit secrets, `.env` contents, or real API keys, including inside test fixtures or memory files.
- Never move `firebase-admin` usage into client-reachable code.
- Never weaken `firestore.rules`, the `authorized()` chokepoint, or MCP key scoping to make a test or feature pass more easily.
- Ask for human review before merging any change to auth, permissions, `firestore.rules`, or secret handling.

## Security-Related Config Files

| File | Purpose |
|---|---|
| `AGENTS.md` | Shared AI-agent instructions, including tenancy-check tooling |
| `ARCHITECTURE.md` | Tenancy/isolation invariants and their implementation |
| `firestore.rules` | Default-deny Firestore access rules |
| `firebase.json` | Emulator and deploy configuration |
| `.env` / `.env.example` | Runtime secrets (git-ignored) / placeholders |
| `pnpm-lock.yaml` | Dependency supply-chain pin |
| `.github/workflows/ci.yml`, `prototype-validation.yml` | CI gate (lint, test, build) — no SAST/dependency-scan job yet |

## Revision History

- 2026-09-22 — Initial policy, drafted from this repo's current architecture and prior-art patterns scouted from `.worktrees/old*` SECURITY.md files.
