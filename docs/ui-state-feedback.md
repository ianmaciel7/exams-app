# UI state and feedback

## Scope and priorities

This guide records the current, evidence-based UI-state audit. It is a quality
standard for interaction flows, not a global state-machine specification. Each
flow owns the smallest explicit state model that prevents invalid transitions.

The implementation priority is:

1. Correct terminal state and recoverability.
2. Accessible, localized feedback at the affected surface.
3. Stable layout and non-blocking updates where data can remain useful.
4. Notifications only when inline feedback is insufficient.

## Inventory

| Flow | States and feedback | Evidence |
| --- | --- | --- |
| Route navigation | Segment `loading.tsx` uses the shared labelled loading primitive; rendering failures use `app/error.tsx`; missing routes use `not-found.tsx`. | `src/app/{loading,error,not-found}.tsx`, route tests |
| Auth provider initialization | Loading until Firebase UI and the first auth-state event are ready; configuration failure is an alert; a signed-in visitor is redirected safely. | `AuthProviderClient` unit tests |
| Email/password sign-in and registration | Field-level schema errors, disabled pending submit, inline root error, successful session navigation. | Firebase emulator tests |
| Password reset and email link | Validation and inline failure; successful reset/link is an in-place terminal confirmation. | Firebase emulator tests and component source |
| Google OAuth popup | Shared `idle`/`pending` state prevents overlapping attempts. Closing the popup returns to idle and leaves the form editable; another attempt is possible. | Firebase emulator `Google popup cancellation restores sign-in and supports retry` |
| MFA (SMS/TOTP) and phone verification | Per-step field errors and the Firebase UI operation state; recovery keeps the entered step. | Firebase component tests and source |
| Protected session | `AuthGateClient`: loading, a single sign-in redirect, and a recoverable alert with a retry control; telemetry never gates content. | `auth-gate-client.test.tsx`, Firebase emulator tests |
| Protected profile load/save | Loading and error branches inside the gate; preference reads ignore obsolete effects; save uses React Hook Form submission state and retains an avatar after failure. | profile unit/component tests |
| Profile avatar selection | Valid files update the preview and remain selected through recoverable save failures; unsupported or oversized files show an associated inline error. | profile component tests |
| Sign-out | `idle`, `pending`, `error`; request de-duplication and a recoverable inline alert. | home component/unit tests |

## Required behavior

- Treat validation, known Firebase failures, cancellation, and retry as normal
  outcomes close to the initiating control. Do not use route error boundaries
  for them.
- Keep an operation's progress truthful. A disabled control must expose its
  busy state; do not invent durations or percentages.
- Retain form values after recoverable errors. A retry must return a pending
  control to an enabled state when the dependency settles or cancels.
- Only expose a translated, user-facing error supplied by the Firebase UI
  boundary. Map unexpected exceptions to `errors.unknownError`; record their
  diagnostic details only through developer logging.
- Use `FieldError`/`role="alert"` for validation or local action errors. A
  toast may supplement non-critical feedback but must not be the only recovery
  path. Use semantic theme tokens in all themes.
- Keep profile save failures inline in the form so the recovery message remains
  available while the user retries. Keep invalid avatar feedback beside and
  programmatically associated with its file input.
- Model out-of-order reads with an active/cancelled guard or a relevant
  subscription cleanup. `useTransition` is a rendering-priority mechanism,
  not a request-cancellation or ordering mechanism.

## Accessibility and design constraints

- `FieldError` supplies `role="alert"`; invalid fields expose `aria-invalid`.
- OAuth controls use `aria-busy` during the provider operation and associate a
  returned provider error with the retryable control via `aria-describedby`.
- Full-screen route loading is reserved for the route/guard boundaries that
  genuinely cannot render useful content yet. Preserve existing content for
  background updates such as profile telemetry and preference synchronization.
- Focus, keyboard operation, touch targets, reduced motion, localized text,
  light/dark tokens, and mobile reflow remain covered by the existing browser,
  mobile, and axe suites; an axe result does not replace interaction testing.

## Audit findings and disposition

| Location | Problem | Impact | Resolution | Validation | Status |
| --- | --- | --- | --- | --- | --- |
| `src/components/firebase/*-auth-form.tsx` and MFA forms | Unexpected exceptions were rendered with `String(error)`. | Internal provider or diagnostic text could reach the user. | `getAuthErrorMessage` preserves normalized `FirebaseUIError` copy and maps everything else to the localized recovery message. | `auth-error-message.test.ts`; focused auth/profile tests and full `verify:fast` passed. | Resolved |
| `oauth-button.tsx` | Pending state was visual only and an OAuth error was not programmatically associated with its control. | Screen-reader users had weaker progress/retry context. | Added `aria-busy` and an `aria-describedby` relationship to the local alert. | `oauth-button.test.tsx` passed; the emulator cancellation journey exists but its run is pending because emulator ports were occupied. | Resolved locally; emulator verification pending |
| `redirect-error.tsx` | Redirect authentication failure lacked an assertive local announcement. | Important failure could be missed by assistive technology. | Added `role="alert"`. | Existing auth-page axe coverage; component review. | Resolved |
| `profile/_hooks/use-profile-submit.ts`, `profile-form-client.tsx` | Save failure was only a dismissible toast. | Users could lose the recovery message before retrying, despite values being retained. | Keep the localized failure in a form-level alert until the next attempt; preserve the success toast. | Component regression checks the alert, enabled retry, retained avatar and subsequent success. | Resolved |
| `profile/_hooks/use-profile-avatar.ts`, `profile-avatar-field-client.tsx` | Invalid file feedback was only a toast and was not associated with the input. | The error could disappear and assistive technology did not get a field relationship. | Keep localized `FieldError` beside the input; set `aria-invalid` and `aria-describedby`; clear after valid selection. | Component regression verifies alert, relationship and no duplicate toast. | Resolved |
| `phone-auth-form.tsx`, SMS and TOTP assertion forms | `getAuthErrorMessage` expected a `FirebaseUIError`, but Firebase UI form actions rethrow a plain `Error` with translated copy. | Every failed phone or MFA step showed the generic message. | `getAuthActionErrorMessage` keeps the translated copy of form actions; direct `ui-core` calls keep the stricter mapping. | `auth-error-message.test.ts`; these flows have no emulator journey. | Resolved |
| Popup blocked, network failure, concurrent popup, and navigation-away OAuth journeys | The emulator suite cannot faithfully make every browser/provider failure deterministic. | A browser-specific regression could escape local emulation. | Keep provider-level state ownership and cancellation test; add deterministic contract tests if the Firebase UI dependency exposes an injectable provider strategy. | Not currently executable in the emulator contract. | Pending external-integration coverage |

## Scope note

The audit covers every active route and application-owned interaction found in
`src/app`, the Firebase auth flows, and the profile form, including route
loading/error states, sign-in/register/recovery, MFA and phone verification,
protected access, profile load/save/avatar, and sign-out. Passive design-system
primitives and AI Elements registry examples are not individually given
application loading/error state: they have no network or domain operation of
their own. Their keyboard, responsive, visual and accessibility contracts stay
covered by the component and browser suites. This is not a claim that every
possible integration failure is simulated; the OAuth gaps above remain open.

## Verification record

- `pnpm verify:fast`: passed, including 358 unit tests, typecheck, lint,
  structural guards, and `check:ui-state`.
- Focused profile/auth component tests: passed (22 tests).
- `agents.cmd sync --check`, `check:docs`, `check:markdown`,
  `check:spelling`, `check:components`, and `check:ui-state`: passed.
- `pnpm verify:e2e`: 15 passed, 54 failed, 2 skipped. The failures timed out
  while pages remained on the shared `Loading…` state. Playwright reused an
  already-running local Next process on port 3000; this run does not establish
  whether the cause is server reuse or an application defect. Re-run against an
  isolated production server before claiming browser/a11y/mobile conformance.
- Auth emulator E2E remains unverified locally because its configured ports
  were already occupied. CI still runs the required popup cancellation/retry
  journey.

## References and verification

- [WCAG 2.2](https://www.w3.org/TR/WCAG22/): the applicable criteria include
  3.3.1 Error Identification, 3.3.3 Error Suggestion, and 4.1.3 Status
  Messages. They are normative accessibility requirements when the selected
  conformance level applies.
- [React `useTransition`](https://react.dev/reference/react/useTransition):
  transitions communicate render priority, not cancellation or request
  ordering. This is an implementation constraint, not a requirement to use
  the hook.
- [Next.js error handling](https://nextjs.org/docs/app/getting-started/error-handling):
  expected failures are explicit results; uncaught exceptions belong in error
  boundaries. This repository currently has no Server Actions, so its
  `useActionState` example is not adopted.
- Context7 resolved the official Next.js corpus but exposed documentation only
  through 16.2.9, whereas this repository has Next.js 16.4.3 installed. The
  installed `node_modules/next/dist/docs/01-app/01-getting-started/10-error-handling.md`
  and the current official page above are the version-aligned sources for the
  client boundary and retry contract of `error.tsx` and `global-error.tsx`.

Run the relevant unit tests, `pnpm test:auth`, `pnpm test:a11y`,
`pnpm test:mobile`, and the verification tier selected by `TESTING.md` after
any change to these flows. Record unavailable emulator/browser scenarios as
limitations rather than treating them as passes.
