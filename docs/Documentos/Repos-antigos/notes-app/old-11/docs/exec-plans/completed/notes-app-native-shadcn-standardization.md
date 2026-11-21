# Execution Plan: Standardize notes-app components on native shadcn primitives

**Status:** Completed  
**Owner:** Claude Code (lead), implementation delegated to Codex jobs  
**Started:** 2026-10-01  
**Last Updated:** 2026-10-02

## Objective

Every component in `src/components/notes-app/` renders the real shadcn primitives from
`src/components/ui/` instead of raw HTML, ad-hoc wrappers, or className overrides that repeat a
primitive's own variants. Behavior, test ids, Firebase UI hooks, and i18n stay unchanged.

## Scope

- In: `src/components/notes-app/*.tsx` (and their tests), plus new keys in
  `src/messages/{en,es,pt-BR}.json` when a string becomes translatable.
- Out: `src/components/ui/`, the removed local Firebase registry mirror (ADR 0008),
  the duplicated `ICON_MAP` between `space-switcher.tsx` and `create-space-form.tsx`, extracting an
  OTP wrapper (rename-only wrappers are discouraged by `CONVENTIONS.md` section 3),
  `connection-alert.tsx`, `theme-provider.tsx`, `auth-provider.tsx`, and a searchable Combobox for
  `country-select.tsx` (changes UX).

## Canonical Context

- Product intent: `INTENT.md`
- Product requirement IDs: none; this is a code-quality refactor with no product change.
- Architecture / ADRs: `ARCHITECTURE.md` section 2, ADR 0008 and 0010 (Firebase UI), ADR 0015
  (sidebar navigation), and ADR 0016 (simple application composition and dedicated hooks).
- Constraints / security / testing: `CONVENTIONS.md` sections 2-6 (role suffixes, canonical
  `${ComponentName}Props`, shadcn / Base UI, Field vs Form, i18n), `DESIGN.md` "Sidebar
  Navigation", `TESTING.md`, `CONSTRAINTS.md` (no deleted or weakened tests).

## Plan

Each task is one Codex job (`codex:codex-rescue`, writes enabled, fresh). Tasks inside a wave touch
disjoint files; wave 2 is serial because it edits a single file.

Wave 1 (parallel):

- [x] T1 Cards: `login`, `sign-up`, `forgot-password`, `oauth`, `email-link`, `phone-auth`,
  `mfa-enrollment`, `mfa-assertion`
- [x] T2 Forms: `login-form`, `sign-up-form`, `forgot-password-form`, `email-link-form`
- [x] T3 Phone and SMS: `phone-auth-form`, `sms-mfa-assertion-form`, `sms-mfa-enrollment-form`,
  `country-select`
- [x] T4 TOTP and MFA: `totp-mfa-assertion-form`, `totp-mfa-enrollment-form`,
  `mfa-enrollment-field-group`, `mfa-assertion-field-group`
- [x] T5 Small components: `google-sign-in-button`, `auth-policies-card`, `auth-greeting-header`,
  `redirect-error-alert`, `require-auth`, `require-guest`, `language-select`

Wave 2 (serial, `space-shell.tsx`, `space-shell.test.tsx` green after each):

- [x] T6 Header: search to `InputGroup`, "New space" in a `SidebarGroup`, `Empty` for no results,
  remove the wrapper div duplicated over `SidebarProvider`
- [x] T7 Menus: items inside `DropdownMenuGroup`, sign-out as `DropdownMenuItem`, identity block
  without raw div/span, `cn()` instead of template literals and override piles
- [x] T8 Footer and states: `SidebarMenuItem` + `SidebarMenuButton tooltip`, `SidebarMenuSkeleton`
  for loading, re-evaluate the fixed offline badge against `ConnectionAlert`

Wave 3 (parallel - abandoned/superseded):

- [x] T9 `create-space-form`: (superseded by ADR 0016 / ADR 0017 domain component rules)
- [x] T10 `user-menu`: (superseded by ADR 0016 / ADR 0017 domain component rules)

## Progress

- 2026-10-01 — Audit complete (33 files). Process guard added: the
  `scripts/hooks/hook-guard-agent-delegation.mjs` hook blocks native subagents so all delegation
  goes through the Codex plugin.
- 2026-10-01 — Wave 1 (T1-T5) ran as five concurrent Codex jobs and the whole tree passes types,
  lint, rsc, naming, props, emojis, i18n, deps, floor, duplication (5.86%) and 118 tests. Lead
  review of the diffs found two defects the gates missed, both fixed by the lead: `login-form`
  had its submit condition changed from `form.formState.isSubmitting` to `ui.state` (restored),
  and `totp-mfa-enrollment-form` used the missing translation key `auth.totpSecret` (added to
  en, es, pt-BR). `check:i18n` only catches hardcoded text, not missing keys, so every later
  job must list the translation keys it uses and the lead verifies them in all locales.
  Wave 2 completed by replacing the app-specific sidebar wrapper with `SpaceShell`, which
  composes the native `SidebarProvider`, `Sidebar`, `SidebarHeader`, `SidebarFooter`, and
  `SidebarInset` directly.

## Decision Log

- 2026-10-01 — Delegate each task as its own Codex job, not one bundled job, so a failure stays
  isolated and each diff is reviewable.
- 2026-10-01 — No git worktrees: tasks in a wave touch disjoint files on the same branch.
- 2026-10-01 — Do not extract an OTP or loading wrapper: `CONVENTIONS.md` section 3 discourages
  rename-only wrappers, and the duplication is the documented shadcn usage of `InputOTPSlot`.
- 2026-10-01 — Leave `throw new Error("...")` strings untouched: they are developer invariants,
  not user-facing text, so the i18n rule does not apply (this corrects the first draft of T4).
- 2026-10-01 — Run wave 1 as five concurrent Codex jobs (the plugin handled two in parallel);
  jobs are told that repo-wide check failures from other jobs' files are reported, not fixed.
- 2026-10-01 — Keep `country-select` a `Select` with the Base UI `items` prop; a Combobox is a UX
  change and stays out of scope.
- 2026-10-02 — Simplify application composition: domain components no longer mirror every shadcn
  compound part or rename themselves to the implementation root primitive. `SettingsForm` may
  use `FieldGroup`; simple dialogs own their cohesive content; Base UI `render` composes
  behavior-bearing parts such as close actions.
- 2026-10-02 — When a component has a dedicated same-family hook (for example `SpaceShell` +
  `useSpaceShell`), that hook owns the component's stateful React behavior and semantic handlers.
  The rendering component consumes returned values/actions and stays declarative.
- 2026-10-02 — Local quality gates now cover project-owned source broadly while keeping
  `src/components/ui/` registry-managed. Biome remains the single formatter/linter, and
  `check:ui-pattern` owns the remaining notes-app-specific composition invariants.

## Verification

- [x] Per job: `rtk pnpm check:types`, `check:lint`, `check:naming`, `check:props`,
  `check:ui-pattern`, `check:i18n`, `deps:check`, and
  `rtk pnpm exec vitest run <affected files>`
- [x] Per wave (lead): `rtk pnpm check:fast`
- [x] Behavioral/runtime verification: `rtk pnpm build` and before/after screenshots of login,
  sign-up, forgot-password, MFA, the sidebar (search and user menu), and the create-space dialog
- [x] Final diff review: read-only `codex:codex-rescue` review, then the owner runs
  `/codex:review` and `/codex:adversarial-review`
- [x] Documentation synchronized (`rtk pnpm run check:docs`)

## Recovery / Rollback

Work stays uncommitted until the owner asks for commits, one commit per task. To abandon a task,
`git restore` the files listed for that task; tasks do not share files, so reverting one does not
affect another. Re-run the task's job with a corrected prompt instead of patching its output by
hand.

## Completion

**Completed:** 2026-10-03
**Result:** Deactivated and archived to completed plans; component standardization superseded by ADR 0016 simple domain component rules and ADR 0017 execution plan.
