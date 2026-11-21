# Conventions

Day-to-day patterns for working in `src/`. See `ARCHITECTURE.md` for how the pieces fit together, and `AGENTS.md` for AI-tooling rules (Serena, Graphify, Context7, RTK) — not repeated here.

## Formatting & linting

- Biome is the only formatter/linter (`biome.json`), 2-space indent.
- `pnpm lint` — `biome check src tests`.
- `pnpm format` — `biome format --write src tests`.
- `biome.json` excludes `src/components/ui/**` from checks — see "Generated UI" below.
- Import order is enforced via Biome's `organizeImports` assist action; don't hand-order imports.
- **Complexity Ceilings**: Functions should stay compact and focused. Keep cognitive complexity $\le 15$ (`noExcessiveCognitiveComplexity: error` in Biome) and cyclomatic branch complexity $\le 12$ per function. Break down complex branching into pure domain sub-functions.

## Server-only boundary

- Any module that touches `firebase-admin` starts with `import "server-only"` (see `src/lib/firebase/admin.ts`). This makes an accidental client-bundle import a build error, not a runtime leak.
- Every Server Action file/function is `"use server"` (`src/actions/recall.ts`). **Never** call the Admin SDK, or read `firebase-admin`-backed data, from a Client Component.
- The browser only ever talks to Firebase Auth (`src/lib/firebase/client.ts`), never Firestore directly. `firestore.rules` denies all client reads/writes as a backstop, not the primary control.

## Auth & authorization

- `user()` in `src/lib/firebase/session.ts` is the only place that reads the `recall-session` cookie and verifies it. Reuse it; don't re-parse the cookie elsewhere.
- Any action touching a `spaceId` calls `authorized(spaceId)`, which re-verifies the caller **and** checks `members.includes(caller.uid)` on the `spaces/{spaceId}` doc. Never trust a `spaceId` passed from the client as already-authorized.
- `session.ts` is intentionally **not** a `"use server"` module: everything exported from one becomes a browser-callable Server Action, so shared internal helpers live outside the action files rather than being exported from one of them.
- `/api/mcp` is the one request path with no session cookie. It authenticates a Space-scoped API key instead, and the `spaceId` bound to that key — never a `spaceId` from the request body — scopes every query.
- `src/proxy.ts` (middleware) only checks cookie *presence* for a fast redirect — it is explicitly not a security boundary (see the comment in that file). Don't add real authorization logic there; put it in the Server Action.
- **Multi-Tenant Invariants & Isolation**:
  - All inter-entity relationships (e.g. `object_links` edges) must verify that both source and target entities belong to the caller's active `spaceId`.
  - **Constant-Time Information Hiding**: Missing or unauthorized foreign objects/spaces return uniform 404 (or `notFound()`) rather than 403, preventing resource enumeration across tenant boundaries.

## Validation

- Input shapes are zod schemas colocated in `src/domain/recall.ts` (e.g. `objectInput`), used both to `safeParse` untrusted input and, via `z.infer`, as the source of TypeScript types. Don't hand-write a parallel `interface` for something a zod schema already defines.
- IDs (`spaceId`, doc IDs) are validated against `idSchema` (`/^[a-zA-Z0-9_-]{1,128}$/`) before use in a Firestore path — validate untrusted IDs before they reach a `.doc(id)` call, not after.

## Domain logic

- `src/domain/recall.ts` has no Next.js or Firebase imports by design — it's the pure-function layer (`grade()`, `schedule()`, schema/types). Keep new business rules here rather than inline in a Server Action or component, so they stay unit-testable without an emulator.

## Generated UI & shadcn/ui Component Requirements (`src/components/ui/`)

These files are generated from the shadcn `base-nova` registry (`components.json`, `iconLibrary: lucide`, `baseColor: neutral`, Tailwind v4). App-specific composition lives in `src/components/recall/` and `src/components/space-frame.tsx`, built on top of `ui/` primitives — put feature logic there, not in `ui/`.

### 1. Primitive Flavor: Base UI (`@base-ui/react`), NOT Radix
- **Render Prop Composition**: Use `render={<X />}` on triggers, closes, and slots (`DialogTrigger`, `SheetTrigger`, `PopoverTrigger`, `DropdownMenuTrigger`, `CollapsibleTrigger`, `DialogClose`). NEVER use `asChild` (Radix only).
- **Non-Button Elements**: When `render` replaces a button with an anchor (`<a />`) or non-button control, always set `nativeButton={false}`.
- **Select**: Requires an `items` array on the root component and a `{ value: null }` entry for the placeholder. Never render a bare `<SelectValue placeholder="..." />`.
- **ToggleGroup**: Controlled/uncontrolled value is strictly an array; set `multiple` (boolean) for multi-selection. Never pass `type="single"`.
- **Accordion**: Takes `multiple` (boolean) and an array `defaultValue`/`value`. Never pass a `type` prop.
- **Slider**: Single thumb takes a plain number value.

### 2. Forms & Input Contracts
- **Field & FieldGroup**: Every form input must be wrapped in `<FieldGroup>` and `<Field>`. Never lay out form fields using raw `<div>` containers with `space-y-*` or `grid gap-*`.
- **Labels & Descriptions**: Always pair inputs with `<FieldLabel>` and contextual `<FieldDescription>` / `<FieldError>`.
- **InputGroup**: Inputs inside an `InputGroup` must strictly be `<InputGroupInput>` or `<InputGroupTextarea>`, never bare `<Input>` / `<Textarea>`. Action buttons and icons inside inputs must be wrapped in `<InputGroupAddon>`, never styled with absolute positioning.
- **Option Sets (2–7 choices)**: Use `<ToggleGroup>` + `<ToggleGroupItem>`, never a manually mapped `<Button>` loop tracking active states.
- **Grouped Checkboxes / Radios**: Use `<FieldSet>` + `<FieldLegend>` for grouped checkboxes or radio options, never a raw `<div>` with a paragraph header.
- **Validation & Disabled States**:
  - Validation: Set `data-invalid` on `<Field>` and `aria-invalid` on the input control.
  - Disabled: Set `data-disabled` on `<Field>` and `disabled` on the input control.

### 3. Component Structure & Accessibility Invariants
- **Items in Groups**: Sub-items must always be nested in their semantic group wrapper (`SelectItem` inside `SelectGroup`, `DropdownMenuItem` inside `DropdownMenuGroup`, `CommandItem` inside `CommandGroup`).
- **Overlay Accessibility (Dialog / Sheet / Drawer)**: Every `<Dialog>`, `<Sheet>`, and `<Drawer>` MUST render a corresponding `<DialogTitle>`, `<SheetTitle>`, or `<DrawerTitle>`. When visually hidden, apply `className="sr-only"`.
- **Full Card Composition**: Always compose cards with their semantic structure (`<CardHeader>`, `<CardTitle>`, `<CardDescription>`, `<CardContent>`, `<CardFooter>`). Do not dump all content directly into `<CardContent>`.
- **Buttons**:
  - `Button` has no `isPending` or `isLoading` prop. Loading state must be composed using `<Spinner data-icon="inline-start" />` and the `disabled` attribute.
  - Always use built-in variants (`default`, `outline`, `secondary`, `ghost`, `destructive`, `link`) and sizes (`xs`, `sm`, `default`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`).
- **Tabs**: `<TabsTrigger>` must always reside inside `<TabsList>`.
- **Avatar**: Every `<Avatar>` must render an `<AvatarFallback>` for network or asset failure.

### 4. Use Built-in Components, Not Custom Markup
- **Callouts & Banners**: Use `<Alert>` (`AlertTitle`, `AlertDescription`), never custom styled alert `div`s.
- **Empty States**: Use `<Empty>` (`EmptyHeader`, `EmptyTitle`, `EmptyDescription`, `EmptyContent`, `EmptyActions`), never custom empty-state divs.
- **Toasts**: This is a Base UI project — use `toast` from `@/components/ui/toast`. Do not import or install `sonner` (Radix only).
- **Dividers**: Use `<Separator>`, never `<hr>` or `<div className="border-t">`.
- **Loading Placeholders**: Use `<Skeleton>` with explicit dimensions preserving Cumulative Layout Shift (CLS < 0.05). Never write custom `animate-pulse` divs.
- **Badges & Status Indicators**: Use `<Badge>` with semantic variants (`default`, `secondary`, `outline`, `destructive`), never styled `<span>` tags with arbitrary color classes.

### 5. Icons
- **Icon Library**: Pinned to `lucide-react`. Never import or install alternate icon sets.
- **Buttons with Icons**: Apply `data-icon="inline-start"` or `data-icon="inline-end"` to the icon element. Never apply manual spacing (`mr-2`) or sizing classes (`size-4`, `w-4 h-4`) inside components — shadcn components manage icon sizing via CSS.
- **Component References**: Pass icons as component objects (`icon={CheckIcon}`), never as string names.

### 6. Styling, Tokens & Tailwind Guardrails
- **Layout Only**: `className` on shadcn components is strictly for layout (`flex`, `grid`, `max-w-md`, `mt-4`). Never use `className` to override component background colors, borders, or typography.
- **No `space-x-*` / `space-y-*`**: Always use `flex` or `grid` with `gap-*`.
- **Equal Dimensions**: Use `size-*` (e.g. `size-8`), never matching `w-8 h-8` pairs.
- **Truncation**: Use `truncate` shorthand, never verbose `overflow-hidden text-ellipsis whitespace-nowrap`.
- **Semantic Colors Only**: Use OKLCH theme tokens (`bg-primary`, `text-muted-foreground`, `bg-background`, `border-border`). Never use raw Tailwind colors (`bg-blue-500`, `text-emerald-600`).
- **No Manual `dark:` Overrides**: The OKLCH semantic tokens automatically adapt to dark mode; never write manual `dark:*` color overrides.
- **Class Merging**: Always use `cn(...)` from `@/lib/utils` for conditional class evaluation.
- **Overlays**: Never apply manual `z-index` to `Dialog`, `Sheet`, `Popover`, `DropdownMenu`, or `Tooltip`.

### 7. Component Discovery & Registries
- Check existing `src/components/ui/` primitives (61 installed components) before adding any new component.
- Query Shoogle (`search_registry_items` MCP tool or `rtk pnpm dlx shadcn@latest search @shoogle`) to find existing community blocks before authoring from scratch.
- `components.json` maintains `"registries": {}`. External registries require prior dependency and security review.
- Chat primitives (`message.tsx`, `message-scroller.tsx`, `bubble.tsx`, `attachment.tsx`, `marker.tsx`) are scaffolded from base-nova but remain unmounted — Recall has no chat surface today.

## Naming & imports

- Files: kebab-case (`object-editor.tsx`, `space-switcher.tsx`).
- Components/types: PascalCase. Functions/variables: camelCase.
- Import app code via the `@/` alias (`@/domain/recall`, `@/lib/firebase/admin`) rather than relative paths that cross `src/` subtrees.

## Mechanical guardrails

- **No Dangerous Direct DOM Injections**: Never use `dangerouslySetInnerHTML` outside dedicated and vetted sanitizer components.
- **No Unbuffered Real-time Inputs**: Keystroke-driven mutations must be debounced or buffered to prevent database thrashing.
- **Worktree Isolation**: Never import from or reference `.worktrees/` in runtime code.

## Paths in docs

- Per `plan.md` §1.2: documentation and config use repo-relative paths only (`./src/domain/recall.ts`). No absolute machine paths.

## Comments

- Default to none. Add one only for a non-obvious *why* (see `src/proxy.ts` and `src/lib/space.ts` for the existing style — a sentence explaining a constraint or a subtlety, not what the next line does).
