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
  - **Menu items**: Activate through `onClick`; Radix `onSelect` never fires. Use `closeOnClick={false}` to keep the menu open.
  - **State selectors**: Base UI never sets Radix `data-state`. Use presence attributes such as `data-open`, `data-closed`, `data-checked`, `data-pressed`, `data-active` (Tabs), `data-panel-open` (Collapsible trigger), and Base UI CSS variables such as `--transform-origin`, not `--radix-*`.
  - **Enforcement**: The `.ast-grep/rules/base-ui/` rules check these differences in owned components (`src/components/**`, including `ui/extensions`, and `src/app/**/_components/**`) through `pnpm check:structure`. They also block raw `@base-ui/react` imports outside `src/components/ui/*.tsx` (only `use-render` and `merge-props` are allowed; compose the `@/components/ui` wrappers), Radix primitive and `sonner` imports, `Button` rendering a link, a missing `nativeButton={false}`, and a `Button` nested inside a trigger. TypeScript already rejects `asChild` and the Radix `type` prop; popup titles stay with axe. Shadcn copies in `src/components/ui/*.tsx` are excluded; put customized UI in `src/components/ui/extensions/` instead of editing them. See the [custom rule registry](../../TOOLING.md#custom-rule-registry).
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
