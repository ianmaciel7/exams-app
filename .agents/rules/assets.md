---
trigger: model_decision
description: "Read when changing Next.js image or font loading and resource hints."
---

# Images and fonts

<!-- cspell:words preinit Pipeable unobserve Rects nativeButton -->

## When to read

Read when changing Next.js image or font loading and resource hints.

- **Media and Font Optimization**:
  - Use `next/font/google` with CSS variables (e.g., `--font-geist`, `--font-geist-mono`)
    and font subsets to eliminate layout shifts during font loading.
  - Require explicit `width`/`height` or `fill` with responsive `sizes` on `next/image`
    primitives to prevent Cumulative Layout Shift (CLS). Declare external image hosts
    under `images.remotePatterns` in `next.config.ts`.

Coordinate resource hints with the framework; avoid duplicate or speculative loading policies. Follow [DESIGN.md](../../DESIGN.md) for implemented typography and visual tokens.

## Other media references

For script loading or video work, consult the corresponding installed Next.js
`scripts` or `videos` guide before choosing an integration. Follow the
[security boundary](../../SECURITY.md#react-rendering-and-input-boundaries) and
[design reference](../../DESIGN.md); these topics do not authorize installing an
analytics provider or changing hosting. Icons and UI styling use the installed
shadcn skill references.
