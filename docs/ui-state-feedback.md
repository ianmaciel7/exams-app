# UI state and feedback

## Scope and priorities

This guide records the repository's resilience, loading, UX, and accessibility
standard for asynchronous interaction flows. It defines the operational quality
criteria for async states, error recovery, layout stability, and accessibility
feedback across the application. Each flow owns the smallest explicit state model
that prevents invalid transitions and impossible combinations.

The implementation priority is:

1. Correct terminal state, bounded retries, and recoverability.
2. Accessible, localized feedback at the affected surface.
3. Stable layout and non-blocking updates where data can remain useful.
4. Notifications only when inline feedback is insufficient.

---

## Conceptual async state model

Operations must define explicit lifecycle transitions across these states:

- `idle`: initial ready state, inputs editable, controls enabled.
- `loading`: pending execution, accessible busy indicator (`aria-busy`), controls disabled or non-conflicting.
- `success`: positive completion, data displayed, success confirmations where warranted.
- `empty`: valid empty result (differentiated from error or loading), guidance on next action.
- `error`: recoverable or terminal failure, localized recovery message, retry control.
- `timeout`: operation deadline exceeded, pending state terminated, retry or fallback offered.
- `cancelled`: user or system interruption, pending state settled immediately, no auto-retry.

### Lifecycle constraints

- **No indefinite blocking**: every async operation must have an explicit settlement policy or deadline.
- **Terminal settlement**: error, timeout, and cancellation must immediately terminate pending loading states.
- **No stale overrides**: outdated async responses from superseded requests must not overwrite current state.
- **Concurrency de-duplication**: prevent duplicate submissions and conflicting concurrent mutations.
- **Preserve loaded data**: keep existing data visible during background revalidation or telemetry refresh.
- **Distinct empty states**: an empty query result is neither an error nor a loading state.

---

## Reliability and resilience strategy (Google Cloud pattern)

Asynchronous network operations follow the cloud reliability pattern:

$$\text{Timeout/Deadline} + \text{Bounded Retry} + \text{Truncated Exponential Backoff} + \text{Jitter} + \text{Idempotency} + \text{Error Handling}$$

### Operational rules

1. **Context-specific timeouts**: configure deadlines based on operation category (e.g. read query vs. file upload). Do not impose an arbitrary global timeout across the whole application.
2. **Standard abort signals**: use `AbortController`, `AbortSignal`, and `AbortSignal.timeout()` where supported.
3. **Bounded retries**: cap retries by maximum attempts (typically 3) and deadline. Never retry indefinitely.
4. **Exponential backoff with jitter**: apply truncated exponential backoff ($t = \min(M, B \times 2^{\text{attempt}})$) with full jitter ($t_{\text{sleep}} = \text{random}(0, t)$) exclusively to eligible transient failures.
5. **Idempotency first**: never automatically retry non-idempotent operations (such as non-idempotent state mutations) unless idempotency keys or guards are present.
6. **Rate limiting**: strictly respect HTTP 429 and `Retry-After` response headers.
7. **No retries on permanent errors**: client validation, authentication, and authorization failures must not be retried automatically.
8. **Cancellation stops retry**: user-initiated cancellation or navigation away must immediately halt any pending retry loop.
9. **Controlled exhaustion**: when retries are exhausted, transition to a final error state and provide a clear, localized recovery action.

---

## HTTP semantics and error handling

Error classification follows RFC 9110, RFC 6585, and RFC 9457:

| Status / Category | Expected behavior | Retry policy |
| --- | --- | --- |
| **400 / 422** | Display input or validation errors inline near the control | No auto-retry |
| **401** | Prompt re-authentication or refresh session without redirect loop | No auto-retry |
| **403** | Display authorization refusal; retain safe route boundary | No auto-retry |
| **404** | Display localized not-found guidance in context | No auto-retry |
| **408** | Terminate pending loading; offer manual retry | Single bounded retry if idempotent |
| **409** | Display conflict resolution without blind overwrite | No auto-retry |
| **429** | Apply rate-limit backoff respecting `Retry-After` header | Bounded retry respecting header |
| **500 / 502 / 503 / 504** | Treat as transient server/network failure | Bounded retry with jittered backoff |

### Sensitive data protection

Never render raw exceptions, internal stack traces, or exception coercion (such
as `String(error)`, template interpolation `` `${error}` ``, or `error.message`)
in user-facing UI copy, form errors, or toast payloads. Normalize failures
through localized helpers (`getAuthErrorMessage`, `getAuthActionErrorMessage`,
or domain error translators). Keep technical diagnostics confined to secure
developer logs.

---

## Visual stability: eliminating layout shifts and jumping loading

During transitions between `idle`, `loading`, `success`, and `error`:

1. **Preserve structural dimensions**: maintain bounding dimensions and positions of surrounding layout elements (cards, containers, toolbars, headers).
2. **No jumping indicators**: spinners, action buttons, and form controls must not move unexpectedly along the vertical or horizontal axis when loading starts or finishes.
3. **Dimension-matched skeletons**: skeleton placeholders must match the exact dimensions, line height, and spacing of the final rendered content to eliminate Cumulative Layout Shift (CLS).
4. **Local over full-screen replacement**: avoid swapping an entire layout or page with a full-screen spinner when localized inline feedback is sufficient.
5. **Shared layout persistence**: maintain parent layouts and navigation chrome across Suspense boundaries.
6. **Root-cause fixes**: resolve layout shifts through structural layout composition (flex, grid, reserved space), never through arbitrary `min-height` CSS band-aids.
7. **Motion verification**: verified continuously by the Playwright loading motion probe (`tests/support/loading-motion.ts` and `tests/loading-transitions.spec.ts`) across desktop and mobile viewports.

---

## Authentication resilience

All authentication flows (sign-in, registration, password recovery, MFA, Google OAuth) must remain resilient against network disruptions, browser popups, and user cancellations:

1. **Google popup cancellation**: closing the OAuth popup before completion (`auth/popup-closed-by-user`) must immediately return the sign-in form to an enabled, editable `idle` state. It must not hang in an infinite pending state, disable inputs, or cause redirect loops.
2. **Blocked popups**: handle browser popup blockers gracefully with an accessible inline notice and an actionable retry.
3. **Concurrent attempts**: de-duplicate rapid repeated clicks on OAuth and credential submit controls using atomic pending guards.
4. **Session resolution vs. unauthenticated**: distinguish between an actively resolving session and an established unauthenticated visitor. Do not trigger false redirect loops or premature logout redirects during initial session resolution.
5. **Protected deep links**: preserve the originally requested path and parameters across authentication redirects; return the user to the destination upon successful login.

---

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

---

## Accessibility and design constraints

- `FieldError` supplies `role="alert"`; invalid fields expose `aria-invalid`.
- Interactive controls in pending state use `aria-busy="true"` and disable user re-submission.
- Error alerts associate programmatically with the relevant input control via `aria-describedby`.
- Progress is exposed truthfully: use semantic `<progress>` only when values are measurable; do not invent fake percentages or animations.
- Screen-reader announcements use `role="status"` or `aria-live="polite"` for non-critical status updates, reserving `role="alert"` or `aria-live="assertive"` for critical failures.
- Keyboard navigation, focus retention, focus return, and `prefers-reduced-motion` are maintained across all state transitions.

---

## Audit findings and disposition

| Location | Problem | Impact | Resolution | Validation | Status |
| --- | --- | --- | --- | --- | --- |
| `src/components/firebase/*-auth-form.tsx` and MFA forms | Unexpected exceptions were rendered with `String(error)`. | Internal provider or diagnostic text could reach the user. | `getAuthErrorMessage` preserves normalized `FirebaseUIError` copy and maps everything else to the localized recovery message. | `auth-error-message.test.ts`; focused auth/profile tests and full `verify:fast` passed. | Resolved |
| `oauth-button.tsx` | Pending state was visual only and an OAuth error was not programmatically associated with its control. | Screen-reader users had weaker progress/retry context. | Added `aria-busy` and an `aria-describedby` relationship to the local alert. | `oauth-button.test.tsx` passed; emulator popup cancellation journey verified. | Resolved |
| `redirect-error.tsx` | Redirect authentication failure lacked an assertive local announcement. | Important failure could be missed by assistive technology. | Added `role="alert"`. | Existing auth-page axe coverage; component review. | Resolved |
| `profile/_hooks/use-profile-submit.ts`, `profile-form-client.tsx` | Save failure was only a dismissible toast. | Users could lose the recovery message before retrying, despite values being retained. | Keep the localized failure in a form-level alert until the next attempt; preserve the success toast. | Component regression checks the alert, enabled retry, retained avatar and subsequent success. | Resolved |
| `profile/_hooks/use-profile-avatar.ts`, `profile-avatar-field-client.tsx` | Invalid file feedback was only a toast and was not associated with the input. | The error could disappear and assistive technology did not get a field relationship. | Keep localized `FieldError` beside the input; set `aria-invalid` and `aria-describedby`; clear after valid selection. | Component regression verifies alert, relationship and no duplicate toast. | Resolved |
| `phone-auth-form.tsx`, SMS and TOTP assertion forms | `getAuthErrorMessage` expected a `FirebaseUIError`, but Firebase UI form actions rethrow a plain `Error` with translated copy. | Every failed phone or MFA step showed the generic message. | `getAuthActionErrorMessage` keeps the translated copy of form actions; direct `ui-core` calls keep the stricter mapping. | `auth-error-message.test.ts`; component regression tests. | Resolved |
| Popup blocked, network failure, concurrent popup, and navigation-away OAuth journeys | The emulator suite cannot faithfully make every browser/provider failure deterministic. | A browser-specific regression could escape local emulation. | Keep provider-level state ownership and cancellation test; add deterministic contract tests if the Firebase UI dependency exposes an injectable provider strategy. | Emulator tests cover dismissal, cancellation, and retry. | Resolved for covered email/popup flows; production provider caveats documented |

---

## Verification record and CI enforcement

- **Mechanical safeguard**: `pnpm check:ui-state` runs `scripts/checks/check-ui-state.mjs` and its tests `scripts/checks/check-ui-state.test.mjs`. It scans `src/` ASTs to prohibit raw exception coercion (`String(error)`, template string interpolation, unnormalized error details) from reaching JSX, form errors, or toast payloads. Escape hatch: `// check-ui-state-ignore: <reason>`.
- **Loading transitions & motion probe**: `tests/loading-transitions.spec.ts` exercises all loading boundaries across multiple viewports (390px, 768px, 1440px), asserting that global spinners do not remount and indicators do not shift or jump. Run standalone via `pnpm test:loading` or as part of `pnpm verify:e2e`.
- **Auth emulator E2E**: `tests/firebase-auth.spec.ts` verifies real observable journeys including registration, deep link redirection, profile save/avatar, and Google popup cancellation with retry recovery.
- **CI gates**:
  - `static` job: executes `pnpm verify:static` (including `pnpm check:repo` and `pnpm check:ui-state`) and an explicit `Verify UI state and resilience safeguards` step.
  - `e2e` job: executes `pnpm verify:e2e` (running all Playwright specifications including `loading-transitions.spec.ts`, mobile, visual, and axe accessibility).
  - `auth-emulator` job: executes Playwright tests against live Firebase Auth, Firestore, and Functions emulators.

---

## References and official documentation

- [Google Cloud IAM retry strategy](https://docs.cloud.google.com/iam/docs/retry-strategy): bounded retry, truncated exponential backoff, and jitter.
- [Google Cloud Storage retry strategy](https://docs.cloud.google.com/storage/docs/retry-strategy): idempotency, transient failure classification, and retry bounds.
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/): 3.3.1 Error Identification, 3.3.3 Error Suggestion, 4.1.3 Status Messages.
- [WAI-ARIA 1.2](https://www.w3.org/TR/wai-aria-1.2/): `role="status"`, `role="alert"`, `aria-busy`, live regions.
- [WHATWG DOM AbortSignal.timeout](https://dom.spec.whatwg.org/#dom-abortsignal-timeout): standard operation-scoped timeout signal.
- [RFC 9110 HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110): status codes, transient failure handling.
- [RFC 6585 Additional HTTP Status Codes](https://www.rfc-editor.org/rfc/rfc6585): 429 Too Many Requests and rate limiting.
- [RFC 9457 Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457): structured error payloads.
- [Web.dev: Optimize Cumulative Layout Shift](https://web.dev/articles/optimize-cls): layout stability and skeleton sizing.
- [Nielsen Norman Group: Response Time Limits](https://www.nngroup.com/articles/response-times-3-important-limits/): UI feedback latency thresholds.
- [Firebase Web Auth documentation](https://firebase.google.com/docs/auth/web/start): popup error handling, provider lifecycle, and session resolution.
