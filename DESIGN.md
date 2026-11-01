---
version: alpha
name: exams-app-design
description: Neutral grayscale shadcn/ui (base-nova) theme with Geist typography, a 0.625rem base radius, class-based dark mode, and light/dark token sets defined in src/app/globals.css.

colors:
  light:
    background: "#ffffff"
    foreground: "#0a0a0a"
    card: "#ffffff"
    card-foreground: "#0a0a0a"
    popover: "#ffffff"
    popover-foreground: "#0a0a0a"
    primary: "#171717"
    primary-foreground: "#fafafa"
    secondary: "#f5f5f5"
    secondary-foreground: "#171717"
    muted: "#f5f5f5"
    muted-foreground: "#737373"
    accent: "#f5f5f5"
    accent-foreground: "#171717"
    destructive: "#e7000b"
    border: "#e5e5e5"
    input: "#e5e5e5"
    ring: "#a1a1a1"
    chart-1: "#d4d4d4"
    chart-2: "#737373"
    chart-3: "#525252"
    chart-4: "#404040"
    chart-5: "#262626"
    sidebar: "#fafafa"
    sidebar-foreground: "#0a0a0a"
    sidebar-primary: "#171717"
    sidebar-primary-foreground: "#fafafa"
    sidebar-accent: "#f5f5f5"
    sidebar-accent-foreground: "#171717"
    sidebar-border: "#e5e5e5"
    sidebar-ring: "#a1a1a1"
  dark:
    background: "#0a0a0a"
    foreground: "#fafafa"
    card: "#171717"
    card-foreground: "#fafafa"
    popover: "#171717"
    popover-foreground: "#fafafa"
    primary: "#e5e5e5"
    primary-foreground: "#171717"
    secondary: "#262626"
    secondary-foreground: "#fafafa"
    muted: "#262626"
    muted-foreground: "#a1a1a1"
    accent: "#262626"
    accent-foreground: "#fafafa"
    destructive: "#ff6467"
    border: "#ffffff1a"
    input: "#ffffff26"
    ring: "#737373"
    chart-1: "#d4d4d4"
    chart-2: "#737373"
    chart-3: "#525252"
    chart-4: "#404040"
    chart-5: "#262626"
    sidebar: "#171717"
    sidebar-foreground: "#fafafa"
    sidebar-primary: "#1447e6"
    sidebar-primary-foreground: "#fafafa"
    sidebar-accent: "#262626"
    sidebar-accent-foreground: "#fafafa"
    sidebar-border: "#ffffff1a"
    sidebar-ring: "#737373"

typography:
  font-sans:
    fontFamily: Geist (var(--font-geist))
  font-heading:
    fontFamily: Geist (var(--font-geist))
  font-mono:
    fontFamily: Geist Mono (var(--font-geist-mono))
  typeset:
    fontSize: 1em
    fontSizeMobile: 1.125em
    lineHeight: 1.75
    flowSpacing: 1.25em
  typeset-docs:
    fontSize: 15px
    lineHeight: 1.75
    flowSpacing: 1.25em
  typeset-headings:
    h1: 1.75em
    h2: 1.25em
    h3: 1.125em
    h4: 1em
    h5: 0.875em
    h6: 0.8125em

rounded:
  base: 0.625rem
  sm: 6px
  md: 8px
  lg: 10px
  xl: 14px
  2xl: 18px
  3xl: 22px
  4xl: 26px
---

The external accessibility and usability applicability matrix, including its
test limits, is maintained in
[quality standards](docs/agents/quality-standards.md).

## Overview

The theme is the default shadcn/ui **neutral** palette: pure grayscale with no brand accent. Hierarchy comes from lightness steps, not hue. The only chromatic tokens are `destructive` (red) and the dark-mode `sidebar-primary` (blue).

Source of truth: `src/app/globals.css`. Colors are authored there in `oklch()`; the hex values in this document are their sRGB equivalents for reference. When the two differ, the CSS wins — update this file.

## Project setup

| Item | Value | Source |
|---|---|---|
| shadcn style | `base-nova` | `components.json` |
| Base color | `neutral`, CSS variables on, no prefix | `components.json` |
| Icons | `lucide` | `components.json` |
| Tailwind CSS entry | `src/app/globals.css` (Tailwind v4, no config file) | `components.json` |
| Animations | `tw-animate-css`, `shadcn/tailwind.css` | `globals.css` |
| Primitive base | Base UI (`@base-ui/react`); use the Base UI component documentation | `components.json`, `src/components/ui/` |
| Class merging | `cn`; application helper re-exports it | `src/lib/utils.ts`, `package.json` |
| Direction | `rtl: false`; current locales use LTR | `components.json` |
| Theme switching | `next-themes`, `attribute="class"`, `defaultTheme="system"`, `enableSystem`, `disableTransitionOnChange` | `src/app/layout.tsx` |
| `html` classes | Geist + Geist Mono variables, `h-full antialiased` | `src/app/layout.tsx` |
| `body` classes | `min-h-full flex flex-col` | `src/app/layout.tsx` |
| Provider stack | `Suspense` > async `IntlProvider` > `ThemeProvider` > `TooltipProvider`, with a sibling `Toaster` inside the theme provider | `src/app/layout.tsx` |
| Component aliases | `@/components`, `@/components/ui`, `@/lib`, `@/hooks`, `@/lib/utils` | `components.json` |
| Component workshop | Ladle, uses `NextIntlClientProvider` with English messages, theme and tooltip providers; wrapper uses `bg-background p-4 font-sans text-foreground` | `.ladle/components.tsx` |

## Colors

Tokens are CSS variables on `:root` (light) and `.dark` (dark), exposed to Tailwind through `@theme inline` as `--color-*`. Dark mode is class-based: `@custom-variant dark (&:is(.dark *))`.

### Surfaces

| Token | Light | Dark | oklch (light / dark) |
|---|---|---|---|
| `background` | `#ffffff` | `#0a0a0a` | `1 0 0` / `0.145 0 0` |
| `card`, `popover` | `#ffffff` | `#171717` | `1 0 0` / `0.205 0 0` |
| `secondary`, `muted`, `accent` | `#f5f5f5` | `#262626` | `0.97 0 0` / `0.269 0 0` |
| `sidebar` | `#fafafa` | `#171717` | `0.985 0 0` / `0.205 0 0` |

### Text

| Token | Light | Dark |
|---|---|---|
| `foreground`, `card-foreground`, `popover-foreground` | `#0a0a0a` | `#fafafa` |
| `primary-foreground` | `#fafafa` | `#171717` |
| `secondary-foreground`, `accent-foreground` | `#171717` | `#fafafa` |
| `muted-foreground` | `#737373` | `#a1a1a1` |

### Action & feedback

- **Primary**: `#171717` in light, `#e5e5e5` in dark — the polarity flips between modes.
- **Destructive**: `#e7000b` (`oklch(0.577 0.245 27.325)`) in light, `#ff6467` (`oklch(0.704 0.191 22.216)`) in dark.

### Borders & focus

| Token | Light | Dark |
|---|---|---|
| `border` | `#e5e5e5` | `#ffffff` @ 10% |
| `input` | `#e5e5e5` | `#ffffff` @ 15% |
| `ring` | `#a1a1a1` | `#737373` |

The base layer applies `border-border outline-ring/50` to every element.

### Charts

Five-step gray ramp, identical in both modes: `chart-1` `#d4d4d4`, `chart-2` `#737373`, `chart-3` `#525252`, `chart-4` `#404040`, `chart-5` `#262626`.

### Sidebar

Mirrors the main tokens (`sidebar`, `-foreground`, `-primary`, `-primary-foreground`, `-accent`, `-accent-foreground`, `-border`, `-ring`). The one deviation: in dark mode `sidebar-primary` is blue `#1447e6` (`oklch(0.488 0.243 264.376)`).

## Typography

- **Sans / heading**: Geist, via `--font-geist`; `html` uses `font-sans`.
- **Mono**: Geist Mono, via `--font-geist-mono`.
- **Fonts** are loaded with `next/font/google` (`latin` subset) and exposed as `--font-geist` and `--font-geist-mono`.
- **Prose** (`.typeset`, from `src/app/typeset.css`, the shadcn typeset): size `1em` (scaled `1.125×` below 48rem), line height 1.75, flow spacing 1.25em. Heading sizes: h1 1.75em, h2 1.25em, h3 1.125em, h4 1em, h5 0.875em, h6 0.8125em. Colors come from `foreground`, `muted-foreground` and `border`.
- **Docs prose** (`.typeset-docs` in `globals.css`): overrides the typeset variables — Geist for body and heading, Geist Mono for mono, 15px size, 1.75 line height, 1.25em flow spacing.

No custom type scale exists outside the typeset; other sizes come from Tailwind defaults.

## Components

- `src/components/ui/`: shadcn/ui primitives (button, card, dialog, sidebar, table, etc.) plus chat-oriented ones (message, bubble, questionnaire, trace, toast, code-block). Project-specific providers live in `ui/extensions/` (`intl-provider`, `theme-provider`).
- `src/components/ai-elements/`: AI interface elements (conversation, prompt-input, reasoning, tool, terminal, web-preview, etc.).
- Stories (`*.stories.tsx`) exist for alert, badge, button and kbd.

## Shape

Base radius `--radius: 0.625rem` (10px). Derived tokens:

| Token | Formula | Value |
|---|---|---|
| `radius-sm` | `radius × 0.6` | 6px |
| `radius-md` | `radius × 0.8` | 8px |
| `radius-lg` | `radius` | 10px |
| `radius-xl` | `radius × 1.4` | 14px |
| `radius-2xl` | `radius × 1.8` | 18px |
| `radius-3xl` | `radius × 2.2` | 22px |
| `radius-4xl` | `radius × 2.6` | 26px |

## Behavior

- Enabled `button` and `[role="button"]` elements get `cursor: pointer`.
- `body` uses `bg-background text-foreground`.
- Ladle's theme control drives `next-themes`; stories use English messages.
- The application root currently fixes `html` to `lang="en"`. Locale cookies
  select translated content without changing that attribute; review language
  semantics alongside visual and accessibility changes.

## Do's and Don'ts

### Do

- Use semantic tokens (`bg-background`, `text-muted-foreground`, `border-border`) instead of raw colors, so dark mode works automatically.
- Change the theme in `src/app/globals.css` and then update this document.
- Use `rounded-*` utilities so components follow `--radius`.

### Don't

- Don't hardcode hex or `oklch()` values in components.
- Don't add a brand accent without adding the matching token pair (light and dark) in `globals.css`.

## Component composition contracts

The [general composition contract](CODING_STANDARDS.md#compound-components-and-serverclient-boundaries)
applies to all owned components, both Server and Client. It defines family
exports, primitive adapters, feature views, and runtime boundaries; this section
owns the visual anatomy and spacing.

Compose the installed primitives and their named parts. Cards use `CardHeader`,
`CardTitle`, optional `CardDescription`/`CardAction`, `CardContent`, and optional
`CardFooter`; include parts that have content rather than empty placeholders.
The installed Card exposes `size="default" | "sm"` and `--card-spacing`.
Preserve this spacing when a form sits between the Card root and its sections.

Use built-in variants and sizes before adding styles. At application call
sites, use `className` for layout and intentional documented customization;
put reusable visual variants in the primitive. Use `cn()` for conditional
classes, `gap-*` for sibling spacing, and `size-*` for equal dimensions.
Retain the primitive's state attributes, focus rings, and overlay stacking.

Buttons use `data-icon="inline-start"` or `data-icon="inline-end"` on icons
and spinners; component styles set their size. Compose pending states with
`Spinner` and `disabled`; there is no generic `isLoading` Button prop. For
navigation, style an anchor or Next.js Link with `buttonVariants` so it keeps
its link role. Base UI Button's `render` prop is for composing button behavior,
and is not the link recipe.

Use the installed Base UI `toast` manager from `@/components/ui/toast`; the
root layout already mounts `Toaster`. Radix/React Aria Sonner examples describe
different variants. Form semantics and validation belong in
[Coding standards](CODING_STANDARDS.md#form-and-field-architecture-shadcnui--react-hook-form).

The October 2026 upstream AI Elements patterns build on `Trace`, `CodeBlock`,
`MessageScroller`, `Message`, `Bubble`, `Marker`, and `Attachment`. Existing
copied AI Elements remain local source; the presence of these primitives does
not prove every older wrapper was migrated. Audit exports and behavior before
planning a migration. See [the shadcn/ui rules](.agents/rules/shadcn.md#shadcnui-maintenance).

## Review boundaries

The palette above describes the application theme. Provider-branded Firebase
buttons have explicit scoped color overrides in `globals.css`; those do not
change the global semantic palette. Keep any provider branding scoped there.
`rtl: false` does not establish RTL support; an RTL change also needs direction,
logical spacing, keyboard, and visual verification.

## Next.js streaming and navigation presentation

Use existing semantic tokens and components for loading and error feedback.
A `Suspense` fallback is part of the rendered shell: preserve useful layout,
accessible status feedback, and focus behavior when the real content arrives.
A skeleton should describe an actual pending region rather than hide a
request read that blocks above the boundary.

Keep the current font variables, theme provider, and scoped hydration handling
in the root layout. Client Components can produce server-rendered HTML; avoid
browser-only render reads that cause hydration mismatches. Prefer the
framework image/font primitives and document sizing and remote-source choices.

Navigation can preserve component state with Cache Components. Review retained
form values, dialogs, pending indicators, and effect cleanup across navigation
and back/forward. Runtime rules and cache choices are owned by
[Coding standards](CODING_STANDARDS.md#nextjs-request-data-and-caching); the
[Next.js maintenance rule](.agents/rules/cache.md) records the matching official guides.

## React identity, refs, and lifecycle presentation

Keep component types and data keys stable so focus, selection, form input, and
local UI state survive ordinary updates. Use `useId` for label/control
associations rather than list identity. Ref forwarding and accessible primitive
props remain part of a wrapper's public contract in React 19.

A loading boundary needs a useful, accessible fallback. Effects that connect
media, focus helpers, subscriptions, or browser resources must clean up when
React hides or replaces their content. Hidden Activity content can preserve DOM
and state while releasing Effects; review both preserved state and restored
behavior. Do not assume navigation or temporary fallback means a fresh mount.

Keep hydration output consistent. The existing theme suppression is a scoped
escape hatch, not permission to suppress arbitrary mismatches. View-transition
and optimistic UI recipes require an intentional interaction design and browser
verification; this documentation refresh does not add animations or change
existing loading states. Runtime rules belong in
[Coding standards](CODING_STANDARDS.md#react-rendering-hooks-and-identity).
