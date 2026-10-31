---
trigger: model_decision
description: "Read when maintaining copied shadcn/Base UI source, adapting primitives, or updating UI registry output."
---

# shadcn maintenance

<!-- cspell:words preinit Pipeable unobserve Rects nativeButton vega lyra luma -->

## When to read

Read when maintaining copied shadcn/Base UI source, adapting primitives, or updating UI registry output.

## shadcn/ui Maintenance

Apply this rule to UI work and shadcn/ui documentation updates. Load
[../skills/shadcn/SKILL.md](../skills/shadcn/SKILL.md) for the upstream workflow. This section adds repository
context; it does not replace or duplicate the upstream rule examples.

## Establish project context

- Inspect `components.json`, `package.json`, the target local source, and the
  CLI's project information. This project uses `base-nova` with Base UI (`@base-ui/react`),
  Tailwind v4, Lucide, TypeScript, and the `@/*` aliases.
- Run the installed CLI through pnpm. Obtain and read component docs before
  advising on or changing an API. Follow [TOOLING.md](../../TOOLING.md#shadcnui-cli-workflow).
- **Base UI Primitive Differences (Strict)**: Do not infer `asChild`, Radix state attributes,
  Sonner, or React Aria props from generic examples. Installed component source and Base UI types define the project API:
  - **Triggers & composition (`render` vs `asChild`)**: Use `render={<Button />}` instead of `asChild`. When replacing a trigger with a non-button element (`<a>`, `<span>`), provide `nativeButton={false}`. For standard navigation links, prefer semantic `<Link className={buttonVariants(...)}>` ([ADR 0002](../../docs/adr/0002-configure-shadcn-ui.md)).
  - **`<Select>`**: Requires an `items` prop on the root component (`<Select items={items}>`), unlike Radix inline JSX children.
  - **`ToggleGroup` & `Accordion`**: Uses a boolean `multiple` prop rather than `type="single" | "multiple"`.
  - **`Slider`**: Uses a scalar `value: number` rather than an array `value: number[]`.
  - **Toast**: Use the installed Base UI toast (`@/components/ui/toast`), not `sonner`.
  - **Composition (`render`)**: `render` takes an element (`render={<Button variant="outline" />}`) or a function `(props, state) => <el {...props} />`. Use the function form only when the element depends on `state`, and always spread the received `props` so Base UI keeps its ref, handlers and ARIA. Keep the same tag unless you also set `nativeButton`.
  - **Custom polymorphic components**: Build them with `useRender` and `mergeProps`, never `asChild`, Radix `Slot` or `cloneElement`. Type public props as `useRender.ComponentProps<"tag">` and defaults as `useRender.ElementProps<"tag">`, then return `useRender({ defaultTagName, render, props: mergeProps<"tag">(defaults, props) })`. `src/components/ui/badge.tsx` is the local reference.
  - **`mergeProps` semantics**: The rightmost object wins for ordinary keys and `ref`; `className` is concatenated and `style` is merged; event handlers all run, rightmost first. Call `event.preventBaseUIHandler()` to skip Base UI's internal handler without calling `preventDefault()`.
  - **State styling**: Prefer the Base UI `data-*` attributes in Tailwind (`data-open:`, `data-disabled:`). `className` and `style` also accept `(state) => value` for state-dependent values that a selector cannot express. Animate popups with `data-starting-style` and `data-ending-style` (or `data-open`/`data-closed` with tw-animate) so Base UI waits for the exit animation before unmounting.
  - **Change events**: Base UI handlers such as `onOpenChange` and `onValueChange` receive `eventDetails` as the second argument. Branch on `eventDetails.reason` (for example `"trigger-press"`, `"outside-press"`, `"escape-key"`), call `eventDetails.cancel()` to keep the current state, and call `eventDetails.allowPropagation()` only when a parent must also receive the DOM event. Forward `eventDetails` when wrapping a handler.
  - **Types**: Use the primitive namespaces, such as `Dialog.Root.Props`, `Menu.Item.State` and `Collapsible.Root.ChangeEventDetails`, or `ComponentProps<typeof Wrapper>` for a local wrapper. Do not redeclare Radix prop contracts.
  - **Document setup**: `IntlDocumentServer` gives `body` `position: relative` (iOS 26+ Safari backdrops) and wraps the app in an `isolate` root (`data-slot="app-root"`) so portaled popups stack above page content. `tests/best-practices.spec.ts` checks both. Do not add `z-index` hacks to popups.
  - **Forms**: Forms use React Hook Form with the shadcn `Field` family (see `.agents/rules/forms.md`), not Base UI `Form`/`Field`. Base UI inputs inside them still bind through `value`/`onValueChange` and `aria-invalid`.
  - **Providers**: Direction comes from `@/components/ui/direction`. The root layout wraps the app in `CspProviderServer` (`src/components/ui/extensions/csp-provider-server.tsx`), which passes the request nonce to Base UI `CSPProvider` so its inline styles and scripts pass the nonce CSP (ADR 0023).
  - **Menu items**: Activate through `onClick`; Radix `onSelect` never fires. Use `closeOnClick={false}` to keep the menu open.
  - **State selectors**: Base UI never sets Radix `data-state`. Use presence attributes such as `data-open`, `data-closed`, `data-checked`, `data-pressed`, `data-active` (Tabs), `data-panel-open` (Collapsible trigger), and Base UI CSS variables such as `--transform-origin`, not `--radix-*`.
  - **Enforcement**: The `.ast-grep/rules/base-ui/` rules check these differences in owned components (`src/components/**`, including `ui/extensions`, and `src/app/**/_components/**`) through `pnpm check:structure`. They also block raw `@base-ui/react` imports outside `src/components/ui/*.tsx` (only `use-render` and `merge-props` are allowed; compose the `@/components/ui` wrappers), Radix primitive and `sonner` imports, `cloneElement`, `Button` rendering a link, a missing `nativeButton={false}`, a `Button` nested inside a trigger, `onClick` on value controls (Switch, Checkbox, Toggle, ToggleGroup, RadioGroup, Slider, Select, Tabs) and a raw `<button>`. TypeScript already rejects `asChild` and the Radix `type` prop; popup titles stay with axe. Shadcn copies in `src/components/ui/*.tsx` are excluded; put customized UI in `src/components/ui/extensions/` instead of editing them. See the [custom rule registry](../../TOOLING.md#custom-rule-registry).
- **Default Presets**: Recognized CLI presets include `nova`, `vega`, `maia`, `lyra`, `mira`, `luma`, `sera`, and `rhea`.
- When a lookup fails, report it and use accessible official documentation or
  the installed source. Do not claim an unavailable CLI or network check passed.

## Preserve owned source

- Reuse installed primitives and named parts before creating custom UI.
  Keep application adapters in owned component directories and preserve their
  native props, children, refs, slots, and semantics.
- Preview source updates with `pnpm exec shadcn add <component> --dry-run`,
  `--diff <file>`, or `--view <file>`. Review imports, dependency changes, CSS,
  and each resolved file; preserve local adaptations. Do not fetch raw upstream
  component files to bypass CLI transforms or silently use `--overwrite`.
- For preset adjustments, inspect state via `pnpm exec shadcn preset resolve --json`
  and use selective updates such as `apply <code> --only theme,font` (`icon` is intentionally not supported).
- Treat preset, primitive-family, icon, RTL, and AI Elements migrations as
  separate scoped implementation work. A request to refresh documentation does
  not perform these migrations or install a new MCP server.

## Persist verified knowledge

- `DESIGN.md` owns theme and visual composition; `CODING_STANDARDS.md` owns
  component/API conventions; `TOOLING.md` owns commands; `TESTING.md` and
  `SECURITY.md` own their validation and trust boundaries.
- Consult the installed shadcn CLI skill (`.agents/skills/shadcn/SKILL.md`)
  and official documentation (`ui.shadcn.com`) for the upstream applicability map
  and source inventory.
- Label repository guards as repository policy. Upstream examples do not
  require our filenames, one primary export, profile hook layout, or every
  compound form's Provider boundary.
- Preserve accepted ADRs, upstream skill provenance, and unrelated local work.
  Apply the local `save` skill for `/save`; run documentation checks and agent
  synchronization when available, reporting any missing host tool.
