---
trigger: model_decision
description: "Read when changing user-visible pending, success, error, empty, cancellation, retry, or recovery behavior."
---

# UI state and feedback

Use the smallest state model for each interaction. Represent mutually exclusive
phases explicitly when booleans would allow impossible combinations; do not
create a global enum for every possible UI state.

- Map each async operation from its initiating action through success, failure,
  cancellation, timeout where supported, and retry. Every pending state must
  settle, and obsolete async results must not replace current state.
- Keep expected validation and domain failures near the affected field or
  control. Preserve user input after recoverable failures. Reserve error
  boundaries for unexpected render failures.
- Never render `String(error)`, `String(cause)`, or equivalent exception
  coercion as UI copy. Preserve known, already-normalized domain messages and map
  unexpected exceptions to localized, recovery-oriented text. Keep diagnostic
  detail in protected developer logging.
- Match feedback to scope: field error, inline alert, status, banner, or toast.
  A toast alone is insufficient for critical errors. Avoid duplicate or
  interruptive notifications.
- Expose pending state accessibly and keep feedback associated with the
  initiating control. Prefer native semantics; use `aria-live`, `role="status"`,
  `role="alert"`, and `aria-busy` only when they convey the needed state.
- Use a skeleton for predictable structure and progress only when measurable.
  Keep existing content visible during background refresh where possible.
- Preserve keyboard access, focus visibility, localized copy, reduced motion,
  theme tokens, and mobile reflow across state transitions.

Run `pnpm check:ui-state` for the executable guard against raw exception
coercion in JSX, form errors, and toast payloads. Stateful journeys require
observable behavioral tests as described in [testing.md](testing.md) and
[TESTING.md](../../TESTING.md).
