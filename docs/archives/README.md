# Historical Catalog of Archived Branches and Versions

This directory contains the consolidated historical archive of legacy branches and versions from **Notes App** (`ianmaciel7/notes-app`) and **Exams App Old** (`ianmaciel7/exams-app-old`), preserved directly within the main repository `ianmaciel7/exams-app`.

Each archived version is preserved as an independent, self-contained Git bundle (`.bundle`), accompanied by its original interface capture (`.png`, when available), commit metadata, relevant technologies, and an objective summary of implemented functionality.

---

## Purpose of the Archives

1. **Clean Project History:** Preserves the complete architectural and functional evolution of past iterations without cluttering active branches or git tags in the main repository.
2. **Full Recoverability:** Enables restoring any historical branch or commit into an isolated local Git repository for debugging, auditing, or code recovery.
3. **AI-Assisted Exploration & Knowledge Sharing:** Provides unified context and references for LLMs and engineering agents to analyze past architectural decisions, UI patterns, and migration pathways.

---

## Table of Contents

### Notes App (`ianmaciel7/notes-app`)
- [old — Visual Workspace Exploration & Graph Interactions](#notes-app--old)
- [old-1 — Initial Documentation & Agent Instructions](#notes-app--old-1)
- [old-2 — Capacities-Inspired Prototype with Objects](#notes-app--old-2)
- [old-3 — Shadcn/UI + Base UI Layout Variation](#notes-app--old-3)
- [old-4 — Full Workspace with TipTap Editor & i18n](#notes-app--old-4)
- [old-5 — Local-First Notes with Dexie & FSRS](#notes-app--old-5)
- [old-6 — Spaces, Objects, Dexie, Plate/Slate & Ladle](#notes-app--old-6)
- [old-7 — KnowledgeOS with Firebase Authentication](#notes-app--old-7)
- [old-8 — Revisa: Flashcard Decks & Spaced Repetition (FSRS)](#notes-app--old-8)
- [old-9 — Next.js & Shadcn with Firebase Emulators & Ladle](#notes-app--old-9)
- [old-10 — Recall: Spaces, Graph, Exams & MCP Server](#notes-app--old-10)
- [old-11 — Firebase Auth/Firestore, Dnd-kit & Exam Features](#notes-app--old-11)

### Exams App Old (`ianmaciel7/exams-app-old`)
- [backup/old-1 — Next.js Bootstrap, Firebase Auth, Tests & ADRs](#exams-app-old--backupold-1)
- [backup/dev-before-adr2 — Lib Refactoring, OpenTelemetry & Canonical CSP](#exams-app-old--backupdev-before-adr2)
- [backup/dev-20261111-1903 — MDX Tooling, Vitest, Playwright & Agent Skills](#exams-app-old--backupdev-20261111-1903)

---

## Section: Notes App

### Notes App — old

- **Source repository:** `https://github.com/ianmaciel7/notes-app`
- **Original branch:** `old`
- **Commit SHA:** `e2234be59ba61a717884f829037cb8be268e5c6c`
- **Remote reference:** [Commit e2234be on GitHub](https://github.com/ianmaciel7/notes-app/tree/old)
- **Git bundle:** [notes-app-old.bundle](notes-app-old.bundle)
- **Summary of purpose:** Visual workspace exploration and interaction alignment between the sidebar and the object graph.
- **Key implemented features:**
  - Workspace visual exploration tools and components.
  - Aligned interaction behaviors between the collapsible sidebar and graph views.
  - Next.js App Router baseline with `@base-ui/react` and `@shadcn/react`.
  - Command palette (`cmdk`), carousel primitives (`embla-carousel-react`), and OTP inputs (`input-otp`).
- **Relevant technologies:** Next.js (App Router), React 19, Tailwind CSS v4, Base UI, Shadcn UI, Biome, Vitest / Testing Library.
- **Key differences from other versions:** Serves as an interface alignment checkpoint exploring graph visualizations before full state persistence was finalized.
- **Screenshot:**
  _No screenshot available: this version served as an internal alignment checkpoint for graph navigation without a cataloged home screen image._

---

### Notes App — old-1

- **Source repository:** `https://github.com/ianmaciel7/notes-app`
- **Original branch:** `old-1`
- **Commit SHA:** `c2fca6232c45ce4d64d0088036e1ddd0742944d4`
- **Remote reference:** [Commit c2fca62 on GitHub](https://github.com/ianmaciel7/notes-app/tree/old-1)
- **Git bundle:** [notes-app-old-1.bundle](notes-app-old-1.bundle)
- **Summary of purpose:** Initial repository documentation, architecture guidelines, and agent instructions.
- **Key implemented features:**
  - Agent instructions and planning skills (including the `grill-me` skill for sharpening plans).
  - Worktree management guidelines and baseline documentation.
  - Does not contain a runnable frontend application.
- **Relevant technologies:** Markdown, agent configuration files, specification guides.
- **Key differences from other versions:** Purely focused on documentation and agent ecosystem setup without application source code.
- **Screenshot:**
  _No screenshot available: this snapshot contains documentation and agent instructions rather than a runnable web application._

---

### Notes App — old-2

- **Source repository:** `https://github.com/ianmaciel7/notes-app`
- **Original branch:** `old-2`
- **Commit SHA:** `7d14209252e47bf4449ec953928c2ef711f0642e`
- **Remote reference:** [Commit 7d14209 on GitHub](https://github.com/ianmaciel7/notes-app/tree/old-2)
- **Git bundle:** [notes-app-old-2.bundle](notes-app-old-2.bundle)
- **Summary of purpose:** Workspace prototype inspired by Capacities, featuring structured object types and reverse-engineering artifacts.
- **Key implemented features:**
  - Sidebar with object categories (notes, collections, queries, media).
  - Navigation components built with raw Radix UI primitives (`dropdown-menu`, `scroll-area`, `separator`, `tooltip`).
  - Automated reverse-engineering scripts and asset capture tools.
  - Knowledge graph artifacts and reflections (`graphify`).
- **Relevant technologies:** Next.js, React 19, Radix UI primitives, Lucide React, Tailwind CSS v4, Biome.
- **Key differences from other versions:** Employs raw Radix UI primitives and includes extensive reverse-engineering capture scripts from external inspirations.
- **Screenshot:**

![old-2 interface preview](notes-app-old-2.png)

---

### Notes App — old-3

- **Source repository:** `https://github.com/ianmaciel7/notes-app`
- **Original branch:** `old-3`
- **Commit SHA:** `19105d011c84fe7bf9b5cea4bb75f4fd4b94ea34`
- **Remote reference:** [Commit 19105d0 on GitHub](https://github.com/ianmaciel7/notes-app/tree/old-3)
- **Git bundle:** [notes-app-old-3.bundle](notes-app-old-3.bundle)
- **Summary of purpose:** Workspace layout iteration inspired by Capacities, transitioning to `@base-ui/react` and `@shadcn/react`.
- **Key implemented features:**
  - Collapsible sidebar with persistent state management and migration support.
  - Unified main layout and context sidebar.
  - Global styling and design system definitions with Tailwind CSS v4.
  - Unit test foundation with Vitest and Testing Library.
- **Relevant technologies:** Next.js, React 19, `@base-ui/react`, `@shadcn/react`, Biome, Tailwind CSS v4.
- **Key differences from other versions:** Marks the architectural shift from Radix UI primitives to the `@base-ui/react` foundation.
- **Screenshot:**

![old-3 interface preview](notes-app-old-3.png)

---

### Notes App — old-4

- **Source repository:** `https://github.com/ianmaciel7/notes-app`
- **Original branch:** `old-4`
- **Commit SHA:** `2839f410e3f696cfcf1d92a48849275c1016776b`
- **Remote reference:** [Commit 2839f41 on GitHub](https://github.com/ianmaciel7/notes-app/tree/old-4)
- **Git bundle:** [notes-app-old-4.bundle](notes-app-old-4.bundle)
- **Summary of purpose:** Complete workspace with rich TipTap block editing, internationalization, and end-to-end testing.
- **Key implemented features:**
  - Structured text editing powered by TipTap 3 (`bubble-menu`, `drag-handle`, `placeholder`).
  - Object page views, detail headers, and sliding side panels.
  - Floating UI integration and Phosphor Icons (`@phosphor-icons/react`).
  - Internationalization (i18n) and Playwright E2E verification suites.
- **Relevant technologies:** Next.js, TipTap 3, Phosphor Icons, Floating UI, Playwright, Tailwind CSS v4.
- **Key differences from other versions:** Introduces TipTap with block drag-and-drop handles and Playwright test coverage for workspace lifecycles.
- **Screenshot:**

![old-4 interface preview](notes-app-old-4.png)

---

### Notes App — old-5

- **Source repository:** `https://github.com/ianmaciel7/notes-app`
- **Original branch:** `old-5`
- **Commit SHA:** `0857a9977d1f66f1ba2b26d46bb6084344d489c8`
- **Remote reference:** [Commit 0857a99 on GitHub](https://github.com/ianmaciel7/notes-app/tree/old-5)
- **Git bundle:** [notes-app-old-5.bundle](notes-app-old-5.bundle)
- **Summary of purpose:** Local-first study and note platform with Dexie (IndexedDB), document reader, and FSRS spaced repetition.
- **Key implemented features:**
  - Browser-local storage via Dexie.js (IndexedDB) with reactive hooks (`dexie-react-hooks`).
  - Free Spaced Repetition Scheduler (FSRS) implementation for study flashcards.
  - Document and study material reader.
  - AI-assisted card generation workflow and initial Firebase synchronization.
- **Relevant technologies:** Dexie.js, Dexie-React-Hooks, FSRS algorithm, Firebase, Next.js, Shadcn UI.
- **Key differences from other versions:** First local-first implementation pairing IndexedDB with FSRS spaced repetition scheduling.
- **Screenshot:**

![old-5 interface preview](notes-app-old-5.png)

---

### Notes App — old-6

- **Source repository:** `https://github.com/ianmaciel7/notes-app`
- **Original branch:** `old-6`
- **Commit SHA:** `f336db18e2149040707c453814cbb16e388cde37`
- **Remote reference:** [Commit f336db1 on GitHub](https://github.com/ianmaciel7/notes-app/tree/old-6)
- **Git bundle:** [notes-app-old-6.bundle](notes-app-old-6.bundle)
- **Summary of purpose:** Multi-space workspace with Dexie local persistence, Plate/Slate editor, and Ladle component environment.
- **Key implemented features:**
  - Logical separation of content across isolated user Spaces.
  - Local persistence layer powered by Dexie.js.
  - Rich document editing using the Plate / Slate editor ecosystem.
  - Isolated component development and storybook cataloging using Ladle.
- **Relevant technologies:** Dexie, Plate / Slate, Ladle, Next.js, Tailwind CSS v4.
- **Key differences from other versions:** Replaces TipTap with Plate/Slate and introduces Ladle for isolated UI component prototyping.
- **Screenshot:**

![old-6 interface preview](notes-app-old-6.png)

---

### Notes App — old-7

- **Source repository:** `https://github.com/ianmaciel7/notes-app`
- **Original branch:** `old-7`
- **Commit SHA:** `e5d9048aabb480605e357c2d2a00e82fc4c24c3d`
- **Remote reference:** [Commit e5d9048 on GitHub](https://github.com/ianmaciel7/notes-app/tree/old-7)
- **Git bundle:** [notes-app-old-7.bundle](notes-app-old-7.bundle)
- **Summary of purpose:** "KnowledgeOS" — Private study environment with Google/Firebase authentication, card reviews, and knowledge objects.
- **Key implemented features:**
  - Complete authentication flow using Firebase Auth (Google Sign-In).
  - Protected routes and authenticated study review dashboards.
  - Localized messages and string bundles.
  - Graph-based object association and relationship management.
- **Relevant technologies:** Firebase Auth, Firestore, Next.js App Router, Shadcn UI, Base UI.
- **Key differences from other versions:** Deep cloud integration with Firebase Auth and server-enforced security rules.
- **Screenshot:**

![old-7 interface preview](notes-app-old-7.png)

---

### Notes App — old-8

- **Source repository:** `https://github.com/ianmaciel7/notes-app`
- **Original branch:** `old-8`
- **Commit SHA:** `d930d7a7391b231c1888bb5b2fb271f8d9f2f5be`
- **Remote reference:** [Commit d930d7a on GitHub](https://github.com/ianmaciel7/notes-app/tree/old-8)
- **Git bundle:** [notes-app-old-8.bundle](notes-app-old-8.bundle)
- **Summary of purpose:** "Revisa" — Dedicated flashcard application featuring front/back review cards, FSRS scheduling, and JSON backup.
- **Key implemented features:**
  - Flashcard deck and card management tailored for memorization sessions.
  - Complete FSRS algorithm implementation.
  - IndexedDB persistence through Dexie.js.
  - Full backup and restore workflows using JSON export/import.
- **Relevant technologies:** Dexie, FSRS scheduler, Next.js, Shadcn UI, Playwright.
- **Key differences from other versions:** Specialized purely around spaced repetition flashcards (branded as Revisa) with local JSON backup workflows.
- **Screenshot:**

![old-8 interface preview](notes-app-old-8.png)

---

### Notes App — old-9

- **Source repository:** `https://github.com/ianmaciel7/notes-app`
- **Original branch:** `old-9`
- **Commit SHA:** `dae844270e7ebc80c6a307c49e0f830630e70cb0`
- **Remote reference:** [Commit dae8442 on GitHub](https://github.com/ianmaciel7/notes-app/tree/old-9)
- **Git bundle:** [notes-app-old-9.bundle](notes-app-old-9.bundle)
- **Summary of purpose:** Modern Next.js baseline with Firebase Auth, English/Portuguese localization, and local emulator orchestration.
- **Key implemented features:**
  - Integration with `@firebase-oss/ui-react` and `@firebase-oss/ui-core`.
  - Local emulator setup for Firebase Auth and Firestore with parallel runtime scripts (`pnpm dev:all`).
  - Assessment components, server actions, and Ladle stories.
  - Bilingual localization support (en / pt-BR).
- **Relevant technologies:** Firebase OSS UI, Firebase Emulators, Ladle, Next.js, React Hook Form.
- **Key differences from other versions:** Uses official Firebase OSS UI components with concurrent emulator execution.
- **Screenshot:**

![old-9 interface preview](notes-app-old-9.png)

---

### Notes App — old-10

- **Source repository:** `https://github.com/ianmaciel7/notes-app`
- **Original branch:** `old-10`
- **Commit SHA:** `cabcec2e8227fc7f06aa5c9c5afcc0e8944802c6`
- **Remote reference:** [Commit cabcec2 on GitHub](https://github.com/ianmaciel7/notes-app/tree/old-10)
- **Git bundle:** [notes-app-old-10.bundle](notes-app-old-10.bundle)
- **Summary of purpose:** "Recall" — Exam preparation platform organized around Spaces, object graphs, SM-2 scheduling, and a read MCP server.
- **Key implemented features:**
  - Questions and mock examination modules.
  - Space organization with a connected object graph.
  - SM-2 spaced repetition review scheduling.
  - Model Context Protocol (MCP) read server allowing external AI agents to query the study database.
  - TipTap editor and automated test suites with Playwright and accessibility checks (`@axe-core/playwright`).
- **Relevant technologies:** Firebase Emulators, TipTap, SM-2, MCP Server, Playwright, Axe-core, React Compiler.
- **Key differences from other versions:** Incorporates mock exam models, SM-2 scheduling, and a custom MCP server for AI agent collaboration.
- **Screenshot:**

![old-10 interface preview](notes-app-old-10.png)

---

### Notes App — old-11

- **Source repository:** `https://github.com/ianmaciel7/notes-app`
- **Original branch:** `old-11`
- **Commit SHA:** `f513fc91cdebd0adf8ba708d8108f9808af698c6`
- **Remote reference:** [Commit f513fc9 on GitHub](https://github.com/ianmaciel7/notes-app/tree/old-11)
- **Git bundle:** [notes-app-old-11.bundle](notes-app-old-11.bundle)
- **Summary of purpose:** Foundation with Firebase Auth/Firestore, drag-and-drop question components, and comprehensive quality checks.
- **Key implemented features:**
  - Space creation and switching with protected routes.
  - Exam question components with sorting and reordering via `@dnd-kit/core` and `@dnd-kit/sortable`.
  - Mutation testing with Stryker (`@stryker-mutator/core`) and performance budgets via Lighthouse CI (`@lhci/cli`).
  - Database seeding routines (`.firebase/seeds`) for deterministic local testing.
- **Relevant technologies:** Dnd-kit, Firebase Auth/Firestore, Ladle, Stryker Mutator, Lighthouse CI, Commitlint.
- **Key differences from other versions:** Focuses on interactive drag-and-drop question interactions and advanced software quality tooling (Stryker, LHCI).
- **Screenshot:**

![old-11 interface preview](notes-app-old-11.png)

---

## Section: Exams App Old

### Exams App Old — backup/old-1

- **Source repository:** `https://github.com/ianmaciel7/exams-app-old`
- **Original branch:** `backup/old-1`
- **Commit SHA:** `cc43fb998824101d68da7fad237fd5457986e1cb`
- **Remote reference:** [Commit cc43fb9 on GitHub](https://github.com/ianmaciel7/exams-app-old/tree/backup/old-1)
- **Git bundle:** [exams-app-old-backup-old-1.bundle](exams-app-old-backup-old-1.bundle)
- **Summary of purpose:** Baseline bootstrap of Exams App with Next.js App Router, Firebase authentication DAL, testing, Terraform infrastructure, and ADRs 0001-0012.
- **Key implemented features:**
  - Complete Next.js App Router structure with TypeScript, React Compiler, and shadcn/ui on Base UI.
  - Server Data Access Layer (DAL) and Firebase authentication (routes `/sign-in`, `/register`, `/forgot-password`, `/profile`).
  - Internationalization with `next-intl` supporting English, Portuguese (`pt-BR`), and Spanish (`es`).
  - CI/CD automation, Terraform infrastructure as code, and testing suites (Vitest, Playwright E2E and visual tests).
  - 12 comprehensive Architecture Decision Records (ADRs).
- **Relevant technologies:** Next.js 16, React 19, Firebase SDK, next-intl, Terraform, Playwright, Vitest, Biome, pnpm 12.
- **Key differences from other versions:** Marks the foundational origin of the Exams App architecture, migrating away from earlier Notes App prototypes into a formally specified exam platform.
- **Screenshot:**

![backup/old-1 interface preview](exams-app-old-backup-old-1.png)

---

### Exams App Old — backup/dev-before-adr2

- **Source repository:** `https://github.com/ianmaciel7/exams-app-old`
- **Original branch:** `backup/dev-before-adr2`
- **Commit SHA:** `1db80ad136bbab8720637fbd33315d08bf6a5def`
- **Remote reference:** [Commit 1db80ad on GitHub](https://github.com/ianmaciel7/exams-app-old/tree/backup/dev-before-adr2)
- **Git bundle:** [exams-app-old-backup-dev-before-adr2.bundle](exams-app-old-backup-dev-before-adr2.bundle)
- **Summary of purpose:** Canonical Content Security Policy (CSP) implementation for Next.js 16, OpenTelemetry observability, and core library standardization.
- **Key implemented features:**
  - Strict Content Security Policy (CSP) and HTTP security response headers.
  - Centralized HTTP status registry, response helpers, and validation guards.
  - Distributed tracing and observability integration with OpenTelemetry SDK and isomorphic logging.
  - Strict route typings, error boundaries, and canonical library primitives.
  - Upgrade to Next.js 16.4.6 with Turbopack CSS module fixes.
- **Relevant technologies:** Next.js 16.4.6, OpenTelemetry (`@opentelemetry/api`, `@vercel/otel`), Turbopack, Tailwind CSS v4, Zod, Vitest.
- **Key differences from other versions:** Deep focus on runtime HTTP safety, CSP compliance, and telemetry infrastructure prior to implementing ADR 0002.
- **Screenshot:**
  _No screenshot available: focused entirely on network headers, HTTP library architecture, and observability with no distinct home screen alterations._

---

### Exams App Old — backup/dev-20261111-1903

- **Source repository:** `https://github.com/ianmaciel7/exams-app-old`
- **Original branch:** `backup/dev-20261111-1903`
- **Commit SHA:** `a8d9797ed47bd8d2e2987e12d7bb478841c78671`
- **Remote reference:** [Commit a8d9797 on GitHub](https://github.com/ianmaciel7/exams-app-old/tree/backup/dev-20261111-1903)
- **Git bundle:** [exams-app-old-backup-dev-20261111-1903.bundle](exams-app-old-backup-dev-20261111-1903.bundle)
- **Summary of purpose:** MDX tooling integration, bundle analysis, automated Git/ADR synchronization, and agent skill expansions.
- **Key implemented features:**
  - Rich interactive MDX support (`@next/mdx`, `@mdx-js/loader`, `@mdx-js/react`).
  - Bundle size analysis tooling (`@next/bundle-analyzer`) and feature flagging.
  - Automated ADR synchronization and branch cleanup utilities (`git-adr-sync`).
  - Extended logging telemetry (`@opentelemetry/sdk-logs`, `@opentelemetry/api-logs`).
  - Architecture agent skills (`adr-update`, `git-sync-origin`, `grill-with-docs`, `domain-modeling`).
- **Relevant technologies:** Next.js 16.4.6, MDX, OpenTelemetry Logs, Vitest 5, Playwright, Biome, Agents CLI.
- **Key differences from other versions:** Represents the most advanced historical state of the legacy `exams-app-old` lineage, including interactive MDX documentation and architect agent tools.
- **Screenshot:**
  _No screenshot available: focused on development tooling, MDX compilation, and agent automation with no distinct home screen alterations._

---

## Restoring Archived Bundles

The `.bundle` files are standard Git bundles conforming to the official Git specification. They preserve commits, tree objects, author metadata, and commit messages.

### 1. Verify bundle integrity

```bash
git bundle verify docs/archives/notes-app-old-10.bundle
```

The output will confirm that the bundle is valid (`is okay`) and list its contained head reference.

### 2. Inspect internal references

```bash
git bundle list-heads docs/archives/notes-app-old-10.bundle
```

### 3. Clone a bundle into a clean standalone repository

```bash
git clone docs/archives/notes-app-old-10.bundle -b old-10 ./restored-notes-old-10
cd ./restored-notes-old-10
git log -n 5 --oneline
```

### 4. Fetch a branch into an existing working copy

```bash
git fetch docs/archives/notes-app-old-10.bundle old-10:history/notes-old-10
git checkout history/notes-old-10
```

---

## Historical Inquiries Using AI

This structured catalog is optimized for collaboration with LLMs and coding agents:

1. **Architectural Comparison:** When implementing new features in `exams-app` (e.g., questions, editors, or offline storage), prompt the agent to clone and inspect relevant bundles (e.g., comparing TipTap in `old-4`/`old-10` with Plate in `old-6`).
2. **Algorithm Retrieval:** Implementations of algorithms like FSRS (`old-5`, `old-8`) and SM-2 (`old-10`) are preserved with their unit tests and TypeScript contracts.
3. **Decisions & ADR Traceability:** The branches of `exams-app-old` document the rationale behind CSP headers, route contracts, and telemetry choices, helping agents understand why specific architectural constraints were adopted.
