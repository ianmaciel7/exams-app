---
name: firebase-rules-review
description: Review changes to firestore.rules, functions/, and Firebase auth or session code for authorization gaps, over-broad access, and missing emulator coverage. Use when the user asks to review Firebase security, rules, or Cloud Functions changes.
---

# Review Firebase security changes

Review the current diff (`git diff --name-only`) restricted to `firestore.rules`,
`functions/**`, `src/lib/auth.ts`, `src/lib/session.ts`, and any `dal.ts` or
`data.ts` module. Read [auth.md](../../rules/auth.md) and
[data.md](../../rules/data.md) first; they own the placement and boundary rules.

## Checks

1. **Rules default deny**: every new `match` path either grants the narrowest
   `read`/`write` operation it needs or is denied. Flag `allow ...: if true`,
   missing `request.auth != null`, and `write` where only `create` or `update`
   is needed.
2. **Field allow-lists**: writes constrain keys with `hasOnly` and
   `diff(...).affectedKeys()`, and validate values, as `users/{uid}` does.
3. **Roles**: authorization uses the `role` custom claim set only by the
   `setUserRole` Cloud Function. Flag any client-writable role or any claim
   check that trusts request data.
4. **Functions**: each callable verifies `request.auth` and the caller's
   permission before acting, validates its arguments, and never logs secrets or
   full tokens.
5. **Server boundary**: protected reads and writes go through `dal.ts`;
   credentials stay server-side; no server-only endpoint reaches the browser
   bundle.
6. **Coverage**: a rules change has a matching negative test in
   `tests/rules/` (`pnpm test:rules`); a function change has one in
   `functions/*.test.cjs` or `tests/firebase-auth.spec.ts`.

## Report

List findings ordered by severity, each with file and line, the failure
scenario, and the smallest fix. State which checks found nothing. Run
`pnpm test:logging` for `functions/` changes. Do not claim emulator tests
passed unless `pnpm test:auth` or `pnpm test:rules` actually ran; say so when it was skipped or the
Firebase CLI was unavailable.
