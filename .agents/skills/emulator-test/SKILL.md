---
name: emulator-test
description: Run the Firebase Auth emulator end-to-end suite from a clean emulator state and report the result. Use when the user asks to run the auth emulator tests or verify sign-in, profile, or Cloud Function flows against the emulators.
metadata:
  disable-model-invocation: true
---

# Run the auth emulator tests

Commands and their ownership are in [TOOLING.md](../../../TOOLING.md); do not
invent new ones.

## Steps

1. Confirm `functions/node_modules` exists. If not, run
   `npm --prefix functions ci`.
2. Confirm `.env` or `.env.local` defines `FIREBASE_AUTH_EMULATOR_HOST` and
   `NEXT_PUBLIC_FIREBASE_PROJECT_ID` (use a `demo-*` project). Stop and report
   if missing; never point the tests at a real project.
3. Run `pnpm test:auth`. It starts the Auth, Firestore, and Functions emulators
   with `firebase emulators:exec` and runs Playwright's `auth-emulator`
   project.
4. If a standalone emulator from `pnpm emulator` is running and stale accounts
   cause failures, run `pnpm emulator:clear` and rerun.

## Report

Give the command, pass/fail counts, and for each failure the test name, file,
and error. If the Firebase CLI, Java, or a port was unavailable, say the suite
did not run rather than implying it passed.
