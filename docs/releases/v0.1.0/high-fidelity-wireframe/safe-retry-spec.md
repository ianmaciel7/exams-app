# Safe Answer Submission and Retry Specification — v0.1.0

Status: Technical specification (High-Fidelity Wireframe stage; prototype validation pending).
Baseline commit: `17bc17e923551288b8a6510f6197b8881cd7dfb1`
Related documents: [High-Fidelity Wireframe](README.md) · [User Flows](../user-flows/README.md) · [Product Decisions](../product/README.md) · [Release State](../current-state.json) · [Motion Study](../../../../designs/exam-app-workspace-motion/) · [Mockup Canvas](../../../../designs/exam-app-workspace-mockup/)

## 1. Scope and Product Invariants

This specification governs single-question answer submission and recovery within the v0.1.0 competition-question workspace:

1. Users select one option and explicitly submit with **Answer** (`Responder` in `pt-BR`). No automatic evaluation on radio selection.
2. Confirmed evaluations (`confirmed_correct`, `confirmed_incorrect`) lock the question as read-only for the remainder of the current page view.
3. Unconfirmed submissions (`definite_failure`, `unknown_outcome`) retain the selected option and allow safe retry via **Answer** without creating duplicate evaluations.
4. Duplicate submissions are prohibited while a submission is `pending`.
5. Changing page, changing competition, or closing the application discards all selections, pending states, and evaluated results for the leaving context.
6. Late network responses from a superseded attempt or discarded page/competition context MUST NOT restore answers, lock options, display feedback, or trigger screen-reader announcements.
7. No cross-session persistence is required in v0.1.0.

## 2. Context and Attempt Identity Guards

To prevent stale responses from mutating discarded views or out-of-order retries, the client MUST maintain two orthogonal identifiers:

| Identifier | Scope | Generation and lifecycle |
| --- | --- | --- |
| `contextEpoch` | Active `(competitionId, pageIndex)` view | Monotonically incremented integer (starting at `1`) whenever the user changes competition or page, or reloads the question list via question-list **Retry**. Preserved when toggling sidebar collapse/expand or opening/closing the mobile drawer without selecting a different competition. |
| `attemptId` | Logical submission for one question instance | UUIDv4 (or equivalent collision-resistant unique token) generated when a question transitions from `selected` to `pending` for a new submission, or reused unchanged when retrying from `unknown_outcome`. Regenerated only when the user changes the selected option (allowed in `definite_failure` or `unknown_outcome` before confirmation) or after `contextEpoch` resets. |

### 2.1 Stale-Response Guard Rules

Every asynchronous submission request captures `(requestContextEpoch, requestAttemptId, questionId, selectedOptionId)` at dispatch time. When a response or timeout settles:

1. **Context check:** If `requestContextEpoch !== state.contextEpoch`, discard the payload immediately with zero state updates and zero announcements. A late response from a previous page or previous competition cannot restore discarded answers or overwrite the current list.
2. **Attempt check:** Find question `q` in the active list; if `q.status !== "pending"` or `q.activeAttemptId !== requestAttemptId`, discard the payload immediately.
3. **Option immutability while pending:** Radio option changes for question `q` are disabled while `q.status === "pending"`.
4. **Attempt reuse vs rotation:**
   - Retrying **Answer** from `unknown_outcome` with the same `selectedOptionId` MUST reuse the exact same `attemptId` so the backend deduplicates the evaluation safely.
   - If the user changes `selectedOptionId` while in `definite_failure` or `unknown_outcome`, the client clears the error notice, retains `selected` status, and rotates `activeAttemptId = null` so the next **Answer** click generates a fresh `attemptId`.
   - Retrying **Answer** from `definite_failure` (where the server or transport guaranteed no evaluation occurred) with the same option may generate a fresh `attemptId` or reuse the token; rotating after confirmed non-execution keeps logs distinct, while reusing on `unknown_outcome` is mandatory.

## 3. Question Submission State Machine

Each question `q` on the active page owns an independent state machine instance:

```text
[unanswered]
   |-- SELECT_OPTION(optionId) -------------------------> [selected]
   v
[selected]
   |-- SELECT_OPTION(optionId) -------------------------> [selected] (updates optionId)
   |-- CLICK_ANSWER [selectedOptionId != null] ---------> [pending]
   v
[pending]
   |-- RESOLVE_CORRECT (matching epoch & attemptId) ----> [confirmed_correct] (terminal for page)
   |-- RESOLVE_INCORRECT (matching epoch & attemptId) --> [confirmed_incorrect] (terminal for page)
   |-- FAIL_DEFINITE (matching epoch & attemptId) ------> [definite_failure]
   |-- FAIL_UNKNOWN (matching epoch & attemptId) -------> [unknown_outcome]
   |-- CONTEXT_CHANGED (page/competition/reload) -------> (instance discarded; new epoch starts [unanswered])
   v
[definite_failure]
   |-- SELECT_OPTION(optionId) -------------------------> [selected] (clears failure notice, clears attemptId)
   |-- CLICK_ANSWER ------------------------------------> [pending] (new attemptId)
   v
[unknown_outcome]
   |-- SELECT_OPTION(optionId) -------------------------> [selected] (clears notice, clears attemptId)
   |-- CLICK_ANSWER [same optionId] --------------------> [pending] (reuses same attemptId)
```

### 3.1 States, Controls, and Visual Cues

| State | Radio group | Action button (`112 x 44` footprint) | Feedback / Notice |
| --- | --- | --- | --- |
| `unanswered` | Enabled, none checked | `Answer` / `Responder` (`disabled`) | None |
| `selected` | Enabled, `selectedOptionId` checked | `Answer` / `Responder` (`default`, enabled) | None |
| `pending` | Disabled (`aria-disabled="true"` or `disabled`, selection visually retained) | `Submitting…` / `Enviando…` (`pending`, non-interactive, `aria-disabled="true"` / busy) | None; prevents duplicate submit |
| `confirmed_correct` | Locked (`disabled` / read-only, selected dot retained) | Replaced by result row | Option label: `Correct` / `Correta`; action row: `Correct answer` / `Resposta correta` + `Answer locked` / `Resposta bloqueada` |
| `confirmed_incorrect` | Locked (`disabled` / read-only, user dot retained) | Replaced by result row | Correct option label: `Correct` / `Correta`; chosen option label: `Your answer` / `Sua resposta`; action row: `Incorrect answer` / `Resposta incorreta` + `Answer locked` / `Resposta bloqueada` |
| `definite_failure` | Enabled, `selectedOptionId` retained | `Answer` / `Responder` (enabled) | Inline error notice below action: e.g. `Could not submit answer. Try again.` / `Não foi possível enviar a resposta. Tente novamente.` |
| `unknown_outcome` | Enabled, `selectedOptionId` retained | `Answer` / `Responder` (enabled) | Inline recovery notice below action: `Answer not confirmed. Try again.` / `Resposta não confirmada. Tente novamente.` |

Note on motion and reduced motion: As explored in the [Motion Study](../../../../designs/exam-app-workspace-motion/) (`#10`, scenes `answer-feedback` and `reduced-motion`) and [Workspace Mockup](../../../../designs/exam-app-workspace-mockup/) (`Collapsed-Rail-States.dc.html`), state transitions between `selected`, `pending`, `confirmed_correct`, `confirmed_incorrect`, and `unknown_outcome` MUST preserve identical control footprints (`112 x 44` action button; no layout bounce or ripple). Under `prefers-reduced-motion: reduce`, transitions resolve immediately without animated movement while preserving all text labels, radio markers, lock cues, and focus outlines.

## 4. Event, Guard, and Effect Table

| Current State | Event | Guard | Next State | Side Effects |
| --- | --- | --- | --- | --- |
| `unanswered` | `SELECT_OPTION(opt)` | `opt` belongs to `q.options` | `selected` | Set `selectedOptionId = opt`; enable **Answer**; clear any prior notices. |
| `selected` | `SELECT_OPTION(opt)` | `opt` belongs to `q.options` | `selected` | Update `selectedOptionId = opt`; `activeAttemptId = null`. |
| `selected` | `CLICK_ANSWER` | `selectedOptionId !== null` and `status !== "pending"` | `pending` | Generate new `activeAttemptId = uuid()`; record `epoch = contextEpoch`; disable radio changes and re-submit; announce pending (`polite`); dispatch `submitAnswer({ contextEpoch, attemptId, competitionId, questionId, optionId })`. |
| `pending` | `CLICK_ANSWER` | Always blocked | `pending` | No-op (duplicate-submission guard). |
| `pending` | `SELECT_OPTION(opt)` | Always blocked | `pending` | No-op while submission is in flight. |
| `pending` | `SUBMIT_SUCCESS(res)` | `res.epoch === contextEpoch && res.attemptId === activeAttemptId` | `confirmed_correct` or `confirmed_incorrect` | Set `correctOptionId = res.correctOptionId`; lock question; render option labels + result + `Answer locked`; announce outcome (`polite`); update page `hasAnswersAtRisk = true`. |
| `pending` | `SUBMIT_SUCCESS(res)` | `res.epoch !== contextEpoch || res.attemptId !== activeAttemptId` | *(unchanged)* | Discard stale response silently; no DOM/state mutation; no announcement. |
| `pending` | `SUBMIT_ERROR(err)` | `err.epoch === contextEpoch && err.attemptId === activeAttemptId` and `err.definite === true` | `definite_failure` | Retain `selectedOptionId`; clear `activeAttemptId` (or mark retryable as new attempt); re-enable radio group and **Answer**; display definite failure notice; announce error (`assertive` or `polite` alert). |
| `pending` | `SUBMIT_ERROR(err)` | `err.epoch === contextEpoch && err.attemptId === activeAttemptId` and `err.definite === false` (timeout, network drop, HTTP 502/503/504, abort-on-timeout) | `unknown_outcome` | Retain `selectedOptionId` AND keep `activeAttemptId` intact; re-enable radio group and **Answer**; display `Answer not confirmed. Try again.`; announce uncertainty (`polite`). |
| `pending` | `SUBMIT_ERROR(err)` | `err.epoch !== contextEpoch || err.attemptId !== activeAttemptId` | *(unchanged)* | Discard stale error silently; no DOM/state mutation; no announcement. |
| `definite_failure` | `CLICK_ANSWER` | `selectedOptionId !== null` | `pending` | Generate new `activeAttemptId = uuid()`; dispatch `submitAnswer`; announce pending. |
| `unknown_outcome` | `CLICK_ANSWER` | `selectedOptionId !== null` and `activeAttemptId !== null` | `pending` | Reuse existing `activeAttemptId`; dispatch `submitAnswer` with identical idempotency key; announce pending. |
| `definite_failure` / `unknown_outcome` | `SELECT_OPTION(opt)` | `opt !== selectedOptionId` | `selected` | Update `selectedOptionId = opt`; set `activeAttemptId = null`; clear inline recovery notice. |
| `confirmed_*` | Any `SELECT_OPTION` / `CLICK_ANSWER` | Question is locked | `confirmed_*` | No-op; read-only on current page. |
| Any | `CHANGE_PAGE` or `CHANGE_COMPETITION` or `RETRY_QUESTIONS` | Navigation confirmed / activated | *(discarded)* | Increment `contextEpoch += 1`; abort any in-flight HTTP signals if supported (defense in depth alongside epoch check); reset all questions on new view to `unanswered`; reset scroll to top on page change. |
| Any | `TOGGLE_SIDEBAR` or `TOGGLE_DRAWER` (no competition change) | Same competition & page | *(unchanged)* | Preserve `contextEpoch`, `selectedOptionId`, `activeAttemptId`, `pending` / `confirmed_*` / `unknown_outcome` state, and scroll position. |

## 5. `aria-live` Announcements and Focus Rules

Screen-reader announcements MUST be localized (`en` or `pt-BR`) and scoped strictly to the active `contextEpoch`:

| Trigger | Politeness | English (`en`) | Brazilian Portuguese (`pt-BR`) | Focus Rule |
| --- | --- | --- | --- | --- |
| `CLICK_ANSWER` (`pending`) | `polite` | `"Question {n}: submitting answer."` | `"Questão {n}: enviando resposta."` | Keep focus on the **Answer** button (`aria-disabled="true"`, `aria-busy="true"`), rather than disabling natively if native `disabled` drops focus in the target browser. |
| `RESOLVE_CORRECT` | `polite` | `"Question {n}: correct answer. Answer locked."` | `"Questão {n}: resposta correta. Resposta bloqueada."` | Move focus predictably or announce from the question status region; do not trap or hijack scroll. |
| `RESOLVE_INCORRECT` | `polite` | `"Question {n}: incorrect answer. Your answer was {chosen}. Correct answer is {correct}. Answer locked."` | `"Questão {n}: resposta incorreta. Sua resposta foi {chosen}. A resposta correta é {correct}. Resposta bloqueada."` | Same as above. |
| `FAIL_DEFINITE` | `polite` (or `role="alert"`) | `"Question {n}: could not submit answer. Your selection is preserved. Try again."` | `"Questão {n}: não foi possível enviar a resposta. Sua escolha foi mantida. Tente novamente."` | Retain focus on **Answer** so keyboard users can immediately retry or change option. |
| `FAIL_UNKNOWN` | `polite` (or `role="status"`) | `"Question {n}: answer not confirmed. Your selection is preserved. Activate Answer to safely retry."` | `"Questão {n}: resposta não confirmada. Sua escolha foi mantida. Ative Responder para tentar novamente com segurança."` | Retain focus on **Answer**; selection stays intact. |
| `CHANGE_COMPETITION` (drawer or sidebar) | `polite` | `"Selected {competitionLabel}."` | `"Concurso selecionado: {competitionLabel}."` | When triggered from the phone modal drawer, close drawer and restore focus to the drawer trigger button before/with announcement. |
| Stale response discarded | *(none)* | *(no announcement)* | *(no announcement)* | Never announce results from an invalidated `contextEpoch` or superseded `attemptId`. |

### 5.1 Answer-Loss Nonmodal Warning Behavior

As specified in Section 03 and Section 04 of [High-Fidelity Wireframe](README.md):

- Maintain a derived boolean `hasAnswersAtRisk`: `true` if at least one question on the active page is in `selected`, `pending`, `definite_failure`, `unknown_outcome`, `confirmed_correct`, or `confirmed_incorrect`.
- When `hasAnswersAtRisk === false`, hide the inline warning near page and competition navigation.
- When `hasAnswersAtRisk === true`, render the nonmodal warning near the page footer (when multi-page) and near competition navigation (`Changing pages clears answers on this page.` / `Changing competitions clears answers on this page.` and `pt-BR` equivalents).
- Activating a page or competition change still proceeds in one direct navigation action (nonmodal, not a blocking confirmation modal), increments `contextEpoch`, and discards prior answers.

## 6. Required Backend and Transport Guarantees

For safe retry to work without duplicate evaluation, the backend endpoint (e.g. `POST /api/questions/{questionId}/attempts` or equivalent evaluator contract) MUST guarantee:

1. **Required `attemptId` idempotency key:** Every submission request carries `{ attemptId, competitionId, questionId, selectedOptionId }`.
2. **Idempotent replay on `unknown_outcome`:** If the server has already processed `(competitionId, questionId, attemptId)` with the same `selectedOptionId`, a retry carrying the same `attemptId` MUST return the original evaluation outcome (`isCorrect`, `correctOptionId`, `selectedOptionId`, `attemptId`) with HTTP `200` (or `201` replay-safe), without writing a second evaluation record or double-counting analytics/logs if any exist later.
3. **Key mismatch protection:** If an `attemptId` is ever reused with a different `questionId` or `selectedOptionId`, the server MUST reject with HTTP `409 Conflict` or `422 Unprocessable Entity` (classified by client as `definite_failure`).
4. **Failure classification:**
   - **`definite_failure`:** Client validation errors, HTTP `400`/`404`/`409`/`422`, or pre-dispatch offline/validation blocks where the evaluation could not have occurred.
   - **`unknown_outcome`:** Request timeouts, dropped sockets (`ECONNRESET`, `ETIMEDOUT`, `TypeError: Failed to fetch` after dispatch), HTTP `408`, `429`, `500`, `502`, `503`, `504` where the server may or may not have completed evaluation before the response was lost.
5. **No cross-session state required:** Because v0.1.0 discards answers on application close, server-side idempotency records only need retention long enough to cover in-session retries (e.g., short-lived TTL >= active session window).

## 7. Prototype Test Matrix

All rows below MUST be executed and verified in the future Interactive Prototype stage:

| Test ID | Scenario | Preconditions / Action | Expected Client State & Guard | Expected Announcement & UI |
| --- | --- | --- | --- | --- |
| `SR-01` | Normal correct submission | Select correct option -> click **Answer** -> server returns `200` correct | `selected -> pending -> confirmed_correct`; `attemptId` matched; radio + action locked | `Correct` + `Correct answer` + `Answer locked`; `aria-live` announces confirmation. |
| `SR-02` | Normal incorrect submission | Select wrong option -> click **Answer** -> server returns `200` incorrect | `selected -> pending -> confirmed_incorrect`; `attemptId` matched; radio + action locked | Chosen marked `Your answer`; true option marked `Correct`; `Incorrect answer` + `Answer locked`. |
| `SR-03` | Double-click / rapid Enter while pending | Click **Answer** twice rapidly or press Enter repeatedly while `pending` | Second activation blocked; only 1 network request dispatched; same `attemptId` | Button keeps `112 x 44` footprint showing `Submitting…`; no duplicate request. |
| `SR-04` | Definite failure then retry | Click **Answer** -> HTTP `422` (`definite_failure`) -> click **Answer** again -> `200` | Selection retained; error shown; second click uses new `attemptId` and confirms | Error announced; retry confirms and locks cleanly. |
| `SR-05` | Unknown outcome (timeout/504) then safe retry | Click **Answer** (`attemptId = A1`) -> request times out -> click **Answer** again -> `200` | Selection retained; second request sends identical `attemptId = A1`; backend replays result without duplicate evaluation | `Answer not confirmed. Try again.` shown; retry confirms original outcome cleanly. |
| `SR-06` | Option changed after `unknown_outcome` | In `unknown_outcome` (`A1`, option B) -> select option C -> click **Answer** | Status returns to `selected`, clears notice, generates new `attemptId = A2` on submit | Evaluates option C with `A2` without `409` mismatch. |
| `SR-07` | Late response after page change | Start submission on Page 1 (`epoch = 1`) -> navigate to Page 2 (`epoch = 2`) while `pending` -> Page 1 response arrives | `contextEpoch` is `2 !== 1`; late response discarded; Page 2 questions remain `unanswered`; scroll at top | Zero feedback/locks injected onto Page 2; zero stale `aria-live` announcements. |
| `SR-08` | Late response after competition switch (desktop or mobile drawer) | Start submission in Competition 1 (`epoch = 1`) -> switch to Competition 2 (`epoch = 2`) -> Competition 1 response arrives | `contextEpoch` is `2 !== 1`; late response discarded; Competition 2 stays clean | Drawer closes, focus returns to trigger, only Competition 2 selection announced. |
| `SR-09` | Sidebar collapse/expand during `pending` or `unknown_outcome` | Toggle desktop sidebar collapse/expand (or open/dismiss mobile drawer without selecting) | `contextEpoch` unchanged; `selectedOptionId`, `activeAttemptId`, and `pending`/`unknown_outcome` preserved | No answer loss; late response for active `epoch` still lands cleanly. |
| `SR-10` | Answer-loss warning visibility | Page load (`unanswered`) -> select option -> evaluate -> change page | Warning hidden when `unanswered`; visible near navigation when `selected` or `confirmed_*`; hidden again on fresh page | Warning is nonmodal; navigation succeeds in one action and clears prior page answers. |
| `SR-11` | Reduced motion parity | Enable `prefers-reduced-motion: reduce` and run `SR-01`, `SR-03`, `SR-05` | Identical state transitions and footprints as standard motion (`#10` motion study) | All state cues, focus outlines, and `aria-live` announcements remain intact without motion. |
