---
name: project-new-component
description: Scaffold an application-owned React component that follows the repository's naming, runtime-boundary, and compound-component contracts. Use when the user asks to create a new component, a route-private component, or a shared extension.
metadata:
  disable-model-invocation: true
---

# New component

Read the rules first; they own the contract and this skill only sequences it:

- [components](../../rules/components.md#component-architecture-dimensions-and-file-contracts): file/identifier term parity, suffixes, boundaries
- [composition](../../rules/components.md): compound components and hooks
- [shadcn](../../rules/shadcn.md#shadcnui-maintenance) and the `shadcn` skill when composing primitives

## Steps

1. Ask for the component's responsibility and whether it touches an integration
   (Firebase, browser storage, navigation, fetch, theme). Name it by
   responsibility, not runtime. When creating an integration component (`*Client`
   or `*Server`), also create its companion UI presentation component (without suffix)
   to hold layout, HTML elements, and visual compound parts.
2. Place it: route components in `src/app/<route>/_components/`, hooks in
   `_hooks/`, shared components in `src/components/ui/extensions/`. Never edit
   `src/components/ui/` primitives, `firebase/`, or `ai-elements/` as a new
   component.
3. Use a kebab-case filename whose terms match the PascalCase component, the
   `<Name>Props` type, and any `use<Name>` hook exactly. Add `-client` and
   `"use client"` only for browser integrations; use `"server-only"` for server
   integrations. Ensure integration components compose their companion UI
   component rather than inlining layout or client-suffixed presentation parts.
4. Add visible text through the existing i18n messages, not literals.
5. Add a colocated `*.stories.tsx` (Ladle) and, for behavior, a unit or
   `*.browser.test.tsx` test beside the source.
6. Run `pnpm check:components`, `pnpm lint:ci`, and `pnpm typecheck`, and
   report the results.
