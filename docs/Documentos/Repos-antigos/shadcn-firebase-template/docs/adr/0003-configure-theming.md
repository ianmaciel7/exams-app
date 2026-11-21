# ADR 0003: Configure Theming

- **Status**: Accepted
- **Date**: 2026-10-16
- **Deciders**: ianmaciel7

## Context

A modern application and template must support system, dark, and light appearance modes seamlessly. We need a clean, SSR-safe client provider wrapper that integrates with Tailwind CSS class-based theming and shadcn/ui color tokens without causing hydration mismatch flashes or unwanted CSS transition flickers.

The theming architecture must also align with Tailwind CSS v4's CSS-first paradigm, modern OKLCH color spaces, and dual-compiler compilation requirements across Next.js (Turbopack) and component preview environments (Ladle with Vite).

## Decision

We adopt `next-themes` and create a dedicated `ThemeProvider` wrapper component in `src/components/ui/extensions/theme-provider.tsx`:

```tsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type * as React from "react";

// Suppress false-positive React 19 warning caused by next-themes injecting an inline <script> tag for SSR theme hydration
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Encountered a script tag")
    ) {
      return;
    }
    originalError.apply(console, args);
  };
}

function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

export { ThemeProvider };
```

Key architectural choices:

1. **Dedicated Client Seam & React 19 Script Warning Interceptor**:
   - Encapsulates client-side theme context inside `src/components/ui/extensions/theme-provider.tsx` (maintained in source as `theme-provider-client.tsx` per ADR 0005 integration suffix rules), allowing root `layout.tsx` to remain a Server Component.
   - In React 19 development mode, client-side hydration logs a false-positive warning: `Encountered a script tag while rendering React component` caused by `next-themes` injecting its SSR inline script to prevent flash of unstyled content. `ThemeProviderClient` intercepts `console.error` during development to filter this specific message while preserving all other errors and retaining critical SSR theme hydration.

2. **Provider Configuration & `disableTransitionOnChange`**:
   The root layout (`src/app/layout.tsx`) and Ladle environment (`.ladle/components.tsx`) mount `ThemeProvider` with:
   ```tsx
   <ThemeProvider
     attribute="class"
     defaultTheme="system"
     enableSystem
     disableTransitionOnChange
   >
     ...
   </ThemeProvider>
   ```
   The `disableTransitionOnChange` prop is mandatory. It suppresses all CSS transitions and animations while theme classes change on `<html>`, preventing jarring visual flashes or delayed element background updates during mode switching.

3. **Zero-Toggle Default Philosophy (Pure System Theme)**:
   The template deliberately does **not** include a visual theme toggle component (e.g., dropdown or switch button) in the default starter layout. Theme selection strictly follows the user's OS preference (`prefers-color-scheme`) via `defaultTheme="system"` and `enableSystem`. Should a consuming application require manual switching, `next-themes`'s `useTheme()` hook is fully accessible.

4. **Tailwind CSS v4 CSS-First Architecture & OKLCH Color Tokens**:
   Styling is configured directly in `src/app/globals.css` without a JavaScript configuration file (`tailwind.config.js`):
   - **Custom Variant**: `@custom-variant dark (&:is(.dark *));` targets the `.dark` class applied to `<html>`.
   - **`@theme inline`**: Maps CSS variables to Tailwind utility classes (`--color-background`, `--color-foreground`, `--color-primary`, `--radius-*`, etc.).
   - **OKLCH Palette**: Both light (`:root`) and dark (`.dark`) color schemes are defined using the modern `oklch(...)` color model (e.g., `--background: oklch(1 0 0);`, `--primary: oklch(0.205 0 0);`, `.dark` `--background: oklch(0.145 0 0);`, `--border: oklch(1 0 0 / 10%);`). OKLCH provides uniform perceived lightness, wider color gamuts, and predictable contrast ratios across display types.

5. **`@layer base` Rules**:
   Global element defaults in `src/app/globals.css` enforce:
   ```css
   @layer base {
     * {
       @apply border-border outline-ring/50;
     }
     body {
       @apply bg-background text-foreground;
     }
     button:not(:disabled),
     [role="button"]:not(:disabled) {
       cursor: pointer;
     }
     html {
       @apply font-sans;
     }
   }
   ```
   This ensures standard borders, accessible focus outlines with ring color tokens, and pointer cursors across all interactive button elements.

6. **Dual Compilation Pipeline (Turbopack and Ladle `@tailwindcss/vite`)**:
   - In Next.js: `next.config.ts` delegates CSS processing to `@tailwindcss/turbopack` via loader rules:
     ```ts
     turbopack: {
       rules: {
         "*.css": {
           loaders: ["@tailwindcss/turbopack"],
           as: "*.css",
         },
       },
     },
     ```
   - In Ladle: `.ladle/vite.config.mjs` configures `@tailwindcss/vite`, while `.ladle/ladle.css` loads `src/app/globals.css` with `@source "../src"` to ensure complete parity of Tailwind v4 theme tokens and styles in component isolation.

## Consequences

- **Positive**:
  - Zero hydration mismatch flashes and zero transition glitches during theme switches via `disableTransitionOnChange`.
  - Next.js root layout remains an async Server Component with `suppressHydrationWarning` on `<html>`.
  - Clean development console free of React 19 script-tag false-positive error overlays.
  - Perceptually uniform, accessible colors powered by native OKLCH tokens and Tailwind v4 `@theme inline`.
  - Identical theme token compilation across Next.js (Turbopack) and Ladle (`@tailwindcss/vite`).
  - Predictable system-driven appearance without unwanted UI toggle baggage.
- **Negative / Trade-offs**:
  - Applications wanting a manual theme switch must implement their own UI control using `useTheme()`.
  - Consuming tools and browsers must support OKLCH color functions (standard in modern evergreen browsers).

## References

- [src/components/ui/extensions/theme-provider.tsx](../../src/components/ui/extensions/theme-provider.tsx)
- [src/app/globals.css](../../src/app/globals.css)
- [src/app/layout.tsx](../../src/app/layout.tsx)
- [.ladle/vite.config.mjs](../../.ladle/vite.config.mjs)
- [ADR 0001: Configure Next.js](0001-configure-nextjs.md)
- [ADR 0002: Configure shadcn/ui](0002-configure-shadcn-ui.md)
