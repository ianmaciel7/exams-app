# Product — v0.1.0

Current stage: Mid-Fidelity Wireframe — in progress; 21 variants; native capture and owner visual review pending.

## Current release baseline

User direction (2026-11-26): select a competition in the sidebar to open its questions; browse a vertical list inspired by ExamTopics. Goal: browse questions for the selected competition. Correct and incorrect feedback states are required. The owner approved explicit answer submission: select an option, then activate Answer to evaluate it. An incorrect response marks the selected option and reveals the correct one. Page changes reset the question list to the top. A load failure offers a manual Retry action. These are release decisions, not verified implementation. Filtering, data, loading strategy and scoring are not selected. Pagination is included. Sketch examples DATAPREV and PPSA are illustrative.

## Competition label

Competition items concatenate competition name, year and position/exam title in a single line, separated by middle dots (`Name · Year · Position/exam`). Truncate overflow with an ellipsis while preserving the full label for hover/focus discovery in the eventual implementation. The static sketch depicts truncation only. Examples follow the [historical commit 5c5402c](https://github.com/ianmaciel7/exams-app/commit/5c5402c1c6d93518b446b7f4309af3f1824d9e99); PPSA's full position title still requires confirmation.

## Pagination

The question list is paginated. Scroll vertically within a page; at the end of the list, use pagination controls to navigate between pages of the selected competition. The sketch shows illustrative numbered pages with Previous/Next; page size is ten; total pages and ordering depend on the dataset and remain unspecified. Page changes reset the list to the top.

Progress: in progress; user review pending.

## State coverage and open decisions

The approved historical Sketch depicts eight variants of one screen: unanswered at list start, list end with pagination, selected before evaluation, correct answer, incorrect answer, loading, empty list and load failure. The owner approved explicit answer submission: select an option, then activate Answer to evaluate it. An incorrect response marks the selected option and reveals the correct one. Page changes reset the question list to the top. A load failure offers a manual Retry action. These are release decisions, not verified implementation. The active Mid-Fidelity contains 21 variants; capture review pending. No separate routes or working behavior are established.

## Approved interaction decisions — 2026-11-26

The owner approved explicit answer submission: select an option, then activate Answer to evaluate it. An incorrect response marks the selected option and reveals the correct one. Page changes reset the question list to the top. A load failure offers a manual Retry action. These are release decisions, not verified implementation.

Evidence: [archived QConcursos interface study](../../../references/2026-11-25-qconcursos-archive-evidence.md) establishes an explicit answer action and feedback. The [historical archive inventory](https://github.com/ianmaciel7/exams-app-archive/blob/main/inventory/exams-app-branch-files.json) identifies ExamTopics and QConcursos flow and interaction records; original bytes for the ExamTopics flow, pagination and retry were not recovered. Scroll reset and manual retry are owner-approved recommendations, not independently verified benchmark behavior.

No filters, simulations, scoring, explanations, persistence, or other features are added by these decisions. Automatic retry/cache policy is unspecified.

## Open product decisions

- Question ordering and exact responsive breakpoint remain open.
- Loading and empty-state appearance remain pending visual review. The sidebar is collapsible across workspace states, including desktop; its precise mechanism/breakpoint and production localization remain open.

The recorded approved interaction decisions are resolved and must not be asked again. English is approved for the project-authored Sketch copy; this does not establish a production localization policy. Proper competition names are unchanged.

Sketch and Low-Fidelity are complete for progression. Mid-Fidelity is active; see [current state](../current-state.json).

## Approved initial selection — 2026-11-27

On every workspace entry, automatically select the first item in the sidebar's displayed order, if available, and load its questions. Do not require an extra selection click or restore a different item as the default. The existing loading, success, empty-question and failure variants cover the question request. No sidebar items means no possible selection; its treatment is not yet specified. This does not decide sorting; answer lifecycle is resolved below.

## Mid-Fidelity review

The [Mid-Fidelity Wireframe](../mid-fidelity-wireframe/README.md) illustrates hover/focus and proposes submission pending, submission failure, and empty sidebar treatments. The owner subsequently approved answer lifecycle, submission recovery, collapsible navigation and page size; empty-sidebar treatment, ordering and exact responsive mechanism remain open. Example question content is illustrative, not official exam data.

## Approved Mid-Fidelity decisions — 2026-11-27

On page or competition change, discard all answer selections and evaluated results from the previous page; revisiting starts unanswered. On the current page, a successfully evaluated answer is read-only. No answer persistence across application sessions. On submission failure, retain the selected option and allow another Answer submission; prevent duplicate submissions while pending. A failed request is not a confirmed answer. The sidebar is collapsible, including desktop (confirmed in the subsequent navigation decision). Show ten questions per page, or fewer when the final page contains fewer questions.

Do not re-ask these six decisions. A same-page sidebar toggle does not discard answers; a genuine page or competition change does. Late responses must not restore discarded answers after navigation; duplicate prevention and ambiguous server outcomes require prototype/implementation validation. Empty sidebar remains an unapproved proposal. No page-size chooser is approved.

## Approved navigation consistency — 2026-11-27

Owner approved a consistent Ghost sidebar trigger throughout the workspace, including desktop, independent of question-list state. In the expanded shell it sits at the right of the sidebar header. In the collapsed rail the icon is hidden at rest and revealed on hover/focus; touch requires a visible alternative. Distinguish the two navigation icons with neutral vector placeholders; full names must be available on focus/hover and touch. Preserve selected item and current page on collapse/expand. Use matching neutral pagination chevrons, with disabled boundaries visibly muted. The approved answer lifecycle and ten-question page size remain unchanged. Phone layout, navigation-list loading and navigation-list failure are three explicitly proposed studies, not approved network architecture or new destinations. The phone study depicts a closed navigation drawer with a visible trigger; the open drawer, breakpoint and touch/keyboard semantics require further review.

Exact mobile drawer behavior and asynchronous navigation recovery remain open. No new answer or persistence policy is introduced.

## Current unresolved decisions

Question ordering, empty-sidebar presentation, exact responsive breakpoint and phone drawer treatment (including its open state), navigation-list data source and recovery, ambiguous submission outcomes, and production localization remain open. The phone layout, sidebar loading and sidebar failure are proposals. No runtime, usability or accessibility conformance is claimed.

## Collapsed navigation reveal

A Ghost sidebar trigger is available across workspace states. On desktop, the collapse icon remains visible while expanded; when collapsed, the expand icon is hidden at pointer rest and revealed on rail/header hover or keyboard focus, without moving the layout. Activation, not hover, expands the sidebar. A visible accessible alternative is required on touch/no-hover devices. Collapse/expand preserves current page, selection, scroll context and answers.
