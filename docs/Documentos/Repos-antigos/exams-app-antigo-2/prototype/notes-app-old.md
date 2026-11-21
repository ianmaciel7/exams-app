# notes-app-old

- **Repository:** `https://github.com/ianmaciel7/notes-app`
- **Original Branch:** `old`
- **Commit SHA:** `e2234be59ba61a717884f829037cb8be268e5c6c`
- **GitHub Reference:** [Commit e2234be on GitHub](https://github.com/ianmaciel7/notes-app/tree/old)
- **Git Bundle:** [notes-app-old.bundle](notes-app-old.bundle)

## Purpose & Summary

Visual workspace exploration and interaction alignment between the sidebar and the object graph. This iteration established the foundational design exploration for object graphs, focusing on how interconnected entities are displayed and manipulated alongside the main navigation tree.

## Implemented Features

- Visual workspace exploration tools and canvas components.
- Interaction alignment between the collapsible sidebar and graph views.
- Next.js App Router baseline configured with `@base-ui/react` and `@shadcn/react`.
- Command palette (`cmdk`), carousel primitives (`embla-carousel-react`), and OTP inputs (`input-otp`).

## Tech Stack

- **Framework:** Next.js (App Router), React 19
- **UI & Styling:** Tailwind CSS v4, Base UI (`@base-ui/react`), Shadcn UI
- **Tooling & Quality:** Biome 2.4.2, Vitest, Testing Library

## Screenshot

_No screenshot available: this version served as an internal alignment checkpoint for graph navigation without a cataloged home screen image._

## Restoration Instructions

```bash
git bundle verify notes-app-old.bundle
git clone notes-app-old.bundle -b old ./restored-notes-app-old
```
