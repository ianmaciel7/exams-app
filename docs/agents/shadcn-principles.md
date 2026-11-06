# shadcn/ui principles and their guards

<!-- shadcn-version: 4.23.0 -->

Every critical rule of the shadcn/ui skill (`.agents/skills/shadcn/SKILL.md` and its `rules/` files) maps to
a guard here. `pnpm check:repo` runs `scripts/checks/check-shadcn-principles.mjs`, which fails when a row has
no guard, a referenced guard does not exist, an ast-grep rule under `.ast-grep/rules/shadcn` is missing from
this table, or the installed `shadcn` version differs from the version above. After a shadcn upgrade, run
`pnpm dlx shadcn@latest docs` for the changed components, update the table, then bump the version marker.

The rules apply to every component under `src/components/**` (including `ui`, `ui/extensions`, `firebase`
and `ai-elements`) and every `src/app/**/_components` folder, not only to `ui`. Sources:
[styling](https://ui.shadcn.com/docs), [forms](https://ui.shadcn.com/docs/components/field),
[composition](https://ui.shadcn.com/docs/components), [Base UI differences](https://ui.shadcn.com/docs/changelog).
The guard column uses the same syntax as [base-ui-principles.md](base-ui-principles.md).

| Principle                                                               | Guard                                                                           |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Semantic colors, no palette colors or `dark:` color overrides           | rule:no-hardcoded-color                                                         |
| No `space-x-*` or `space-y-*`; use `gap-*`                              | rule:no-space-utilities                                                         |
| Use `size-*` when width and height are equal                            | rule:prefer-size-utility                                                        |
| Use the `truncate` shorthand                                            | rule:prefer-truncate-shorthand                                                  |
| Use `cn()` for conditional classes, no template literals                | rule:no-template-literal-classname                                              |
| No manual `z-index` on overlay components                               | rule:no-overlay-z-index                                                         |
| `className` is for layout, not for restyling components                 | manual:judgement call reviewed by the code reviewer, see CODING_STANDARDS.md    |
| Use existing components and built-in variants before custom markup      | manual:judgement call reviewed by the code reviewer, see CODING_STANDARDS.md    |
| Forms use Form, Field and labels, never raw controls                    | rule:no-raw-form-element, rule:no-raw-form-control, rule:no-manual-label-wiring |
| Field validation uses `data-invalid` and `aria-invalid`                 | rule:require-field-data-invalid                                                 |
| `InputGroup` holds `InputGroupInput`, not a raw `Input`                 | manual:needs type information to tell InputGroup children apart                 |
| Option sets of 2 to 7 choices use `ToggleGroup`                         | manual:depends on the number of choices, reviewed by the code reviewer          |
| Related checkboxes and radios sit in `FieldSet` with `FieldLegend`      | manual:grouping intent is not visible to static analysis                        |
| Items sit inside their Group (`SelectItem` in `SelectGroup`)            | rule:require-select-group                                                       |
| Custom triggers use `render`, never `asChild`                           | rule:no-as-child, rule:require-native-button-false                              |
| Dialog, AlertDialog, Sheet and Drawer content has a Title               | rule:require-overlay-title                                                      |
| Cards use the full Card composition                                     | manual:composition completeness is a review judgement                           |
| Button has no `isPending` or `isLoading`; compose Spinner               | rule:no-button-loading-prop                                                     |
| `TabsTrigger` sits inside `TabsList`                                    | rule:require-tabs-list                                                          |
| `Avatar` always has an `AvatarFallback`                                 | rule:require-avatar-fallback                                                    |
| Callouts use `Alert`                                                    | rule:prefer-alert                                                               |
| Empty states use `Empty`                                                | manual:empty-state intent is not visible to static analysis                     |
| Toast comes from the Base UI toast component, not Sonner                | rule:no-radix-primitive-import                                                  |
| Separator replaces `hr` and border dividers                             | rule:no-hr-element                                                              |
| Skeleton replaces custom `animate-pulse` placeholders                   | rule:no-animate-pulse                                                           |
| Badge replaces custom styled spans                                      | manual:styled-span intent is not visible to static analysis                     |
| Disabled buttons stay focusable                                         | rule:require-focusable-when-disabled                                            |
| Icons next to text in `Button` use `data-icon`                          | rule:require-button-icon-data-icon                                              |
| No size classes on icons inside components                              | rule:no-icon-size-class-in-button                                               |
| Icons are passed as component objects, not string keys                  | manual:the TypeScript compiler rejects string keys in typed icon props          |
| Chat UI composes MessageScroller, Message, Bubble, Attachment and Trace | manual:chat primitives are used only in ai-elements, reviewed per component     |
| Preset codes go through the shadcn CLI, never decoded by hand           | manual:CLI usage is a workflow step, see .agents/rules/shadcn.md                |
