# notes-app-old-2

- **Repository:** `https://github.com/ianmaciel7/notes-app`
- **Original Branch:** `old-2`
- **Commit SHA:** `7d14209252e47bf4449ec953928c2ef711f0642e`
- **GitHub Reference:** [Commit 7d14209 on GitHub](https://github.com/ianmaciel7/notes-app/tree/old-2)
- **Git Bundle:** [notes-app-old-2.bundle](notes-app-old-2.bundle)

## Purpose & Summary

A workspace prototype heavily inspired by Capacities, organizing knowledge into structured object types (pages, queries, tags, media) with a collapsible sidebar and asset extraction materials.

## Implemented Features

- Object-centric navigation tree with typed collections.
- Primitive navigation components built on unstyled Radix UI (`dropdown-menu`, `scroll-area`, `separator`, `tooltip`).
- Reverse-engineering scripts and visual asset capture runs.
- Graph analysis and object reflection tools (`graphify`).

## Tech Stack

- **Framework:** Next.js, React 19
- **UI Components:** Radix UI primitives, Lucide React, Tailwind CSS v4
- **Tooling:** Biome, Testing Library

## Screenshot

![notes-app-old-2 screenshot](notes-app-old-2.png)

## Restoration Instructions

```bash
git bundle verify notes-app-old-2.bundle
git clone notes-app-old-2.bundle -b old-2 ./restored-notes-app-old-2
```
