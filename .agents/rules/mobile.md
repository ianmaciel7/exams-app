---
trigger: model_decision
description: "Read when changing touch, mobile, form-field, motion, or responsive behavior of UI components and pages."
---

# Mobile web and touch

## When to read

Read when changing touch, mobile, form-field, motion, or responsive behavior of
UI components and pages.

## Obligations

- **Touch targets**: controls reach 44x44 CSS pixels on coarse pointers
  (`pointer-coarse:min-h-11`, icon sizes also `pointer-coarse:min-w-11`), as in
  `Button`, `Input`, and `NativeSelect`. Inline links inside a sentence are exempt
  (WCAG 2.5.8). Desktop keeps the denser 24px minimum.
- **No iOS focus zoom**: form fields keep at least 16px text on touch screens.
  Shrink field text only for fine pointers (`md:pointer-fine:text-sm`), never with
  a bare `md:text-sm`: landscape phones cross the `md` breakpoint.
- **Autofill tokens** (WCAG 1.3.5): sign-in email `username`, sign-up and recovery
  email `email`, `current-password` or `new-password`, phone `tel-national`, name
  `name`, one-time codes `one-time-code`; labels for user-chosen names use `off`.
- **One level-one heading per screen**: card-based screens set
  `role="heading" aria-level={1}` on the screen's `CardTitle`.
- **Stable layout**: content that replaces a loading state must not move content
  that is already painted; public pages top-align below `md` for this reason.
- **Motion**: the global reduced-motion rule in `src/app/globals.css` applies;
  only `.animate-spin` progress indicators keep animating.
- **Viewport**: keep `width=device-width, initial-scale=1`; never restrict zoom
  (see [routes](routes.md)).

## Enforcement

`tests/mobile.spec.ts` (Playwright `mobile` project, Pixel 7 emulation),
`tests/best-practices.spec.ts`, `pnpm check:lighthouse`, and
`pnpm check:responsiveness` fail on these regressions. CI and the Firebase CD
`browser-checks` job run them before a deploy; see [TESTING.md](../../TESTING.md).
The standards behind each rule are listed in
[quality standards](../../docs/agents/quality-standards.md).
