---
trigger: model_decision
description: "Read when changing user-visible pending, success, error, empty, cancellation, retry, or recovery behavior."
---

# UI state and feedback

Use the smallest state model for each interaction. Represent mutually exclusive
phases explicitly (`idle`, `loading`, `success`, `empty`, `error`, `timeout`,
`cancelled`) when booleans would allow impossible combinations; do not create a
global enum for every possible UI state.

- Map each async operation from its initiating action through terminal settlement:
  success, failure, cancellation, or timeout. Every pending state must settle;
  no operation may hang indefinitely. Obsolete async results must not replace
  current state.
- Follow the Google Cloud reliability pattern for network operations:
  $$\text{Timeout/Deadline} + \text{Bounded Retry} + \text{Truncated Exponential Backoff} + \text{Jitter} + \text{Idempotency} + \text{Error Handling}$$
  Configure context-specific timeouts using `AbortSignal.timeout()`. Apply
  bounded retries with truncated exponential backoff and jitter exclusively to
  eligible transient network failures; never retry non-idempotent operations or
  permanent errors (400, 401, 403, 422). Respect HTTP 429 `Retry-After`.
- Prevent layout shifts and jumping loading indicators: structural containers,
  buttons, cards, and forms must maintain their dimensions and positions during
  state transitions. Skeletons must match the dimensions and line heights of final
  content to eliminate Cumulative Layout Shift (CLS). Do not apply arbitrary
  `min-height` CSS hacks without resolving root layout causes.
- Authentication resilience: closing an OAuth popup (`auth/popup-closed-by-user`)
  must immediately restore the sign-in form to an enabled, editable `idle` state
  and support retry without infinite loading or redirect loops.
- Keep expected validation and domain failures near the affected field or
  control. Preserve user input after recoverable failures. Reserve error
  boundaries for unexpected render failures.
- Never render `String(error)`, template interpolation `` `${error}` ``, or
  equivalent raw exception coercion as UI copy. Preserve known, already-normalized
  domain messages and map unexpected exceptions to localized, recovery-oriented
  text. Keep diagnostic detail in protected developer logging.
- Match feedback to scope: field error, inline alert, status, banner, or toast.
  A toast alone is insufficient for critical errors. Avoid duplicate or
  interruptive notifications.
- Expose pending state accessibly and keep feedback associated with the
  initiating control. Prefer native semantics; use `aria-live`, `role="status"`,
  `role="alert"`, and `aria-busy` only when they convey the needed state.
- Expose progress truthfully with `<progress>` only when values are measurable.
  Keep existing content visible during background refresh where possible.
- Preserve keyboard access, focus visibility, localized copy, reduced motion,
  theme tokens, and mobile reflow across state transitions.

Run `pnpm check:ui-state` for the executable AST guard against raw exception
coercion in JSX, form errors, and toast payloads. Run `pnpm test:loading` or
`pnpm verify:e2e` for the loading motion and visual stability probe. Stateful
journeys require observable behavioral tests as described in [testing.md](testing.md),
[TESTING.md](../../TESTING.md), and [docs/ui-state-feedback.md](../../docs/ui-state-feedback.md).
