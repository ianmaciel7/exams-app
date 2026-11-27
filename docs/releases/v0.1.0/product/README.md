# Product — v0.1.0

## Current release baseline

User direction (2026-11-26): select a competition in the sidebar to open its questions; browse a vertical list inspired by ExamTopics. Goal: browse questions for the selected competition. Correct and incorrect feedback states are required. The owner approved explicit answer submission: select an option, then activate Answer to evaluate it. An incorrect response marks the selected option and reveals the correct one. Page changes reset the question list to the top. A load failure offers a manual Retry action. These are release decisions, not verified implementation. Filtering, data, loading strategy and scoring are not selected. Pagination is included. Sketch examples DATAPREV and PPSA are illustrative.

## Competition label

Competition items concatenate competition name, year and position/exam title in a single line, separated by middle dots (`Name · Year · Position/exam`). Truncate overflow with an ellipsis while preserving the full label for hover/focus discovery in the eventual implementation. The static sketch depicts truncation only. Examples follow the [historical commit 5c5402c](https://github.com/ianmaciel7/exams-app/commit/5c5402c1c6d93518b446b7f4309af3f1824d9e99); PPSA's full position title still requires confirmation.

## Pagination

The question list is paginated. Scroll vertically within a page; at the end of the list, use pagination controls to navigate between pages of the selected competition. The sketch shows illustrative numbered pages with Previous/Next; page size is ten; total pages and ordering depend on the dataset and remain unspecified. Page changes reset the list to the top.

Progress: in progress; user review pending.

## State coverage and open decisions

The Sketch depicts eight variants of one screen: unanswered at list start, list end with pagination, selected before evaluation, correct answer, incorrect answer, loading, empty list and load failure. The owner approved explicit answer submission: select an option, then activate Answer to evaluate it. An incorrect response marks the selected option and reveals the correct one. Page changes reset the question list to the top. A load failure offers a manual Retry action. These are release decisions, not verified implementation. Other proposed variants remain pending visual review. No separate routes or working behavior are established.

## Approved interaction decisions — 2026-11-26

The owner approved explicit answer submission: select an option, then activate Answer to evaluate it. An incorrect response marks the selected option and reveals the correct one. Page changes reset the question list to the top. A load failure offers a manual Retry action. These are release decisions, not verified implementation.

Evidence: [archived QConcursos interface study](../../../references/2026-11-25-qconcursos-archive-evidence.md) establishes an explicit answer action and feedback. The [historical archive inventory](https://github.com/ianmaciel7/exams-app-archive/blob/main/inventory/exams-app-branch-files.json) identifies ExamTopics and QConcursos flow and interaction records; original bytes for the ExamTopics flow, pagination and retry were not recovered. Scroll reset and manual retry are owner-approved recommendations, not independently verified benchmark behavior.

No filters, simulations, scoring, explanations, persistence, or other features are added by these decisions. Automatic retry/cache policy is unspecified.

## Open product decisions

- Question ordering and exact responsive breakpoint remain open.
- Loading and empty-state appearance remain pending visual review. The sidebar must be collapsible on small screens; its precise mechanism/breakpoint and production localization remain open.

The eleven approved interaction decisions are resolved and must not be asked again. English is approved for the project-authored Sketch copy; this does not establish a production localization policy. Proper competition names are unchanged.

Low-Fidelity Wireframe has started with the owner-approved Sketch as baseline. The narrow workspace remains a proposal. Initial selection and the subsequent Mid-Fidelity decisions have been resolved; see the decision record below; see [structural review](../low-fidelity-wireframe/README.md#review-questions).

## Approved initial selection — 2026-11-27

On every workspace entry, automatically select the first item in the sidebar's displayed order, if available, and load its questions. Do not require an extra selection click or restore a different item as the default. The existing loading, success, empty-question and failure variants cover the question request. No sidebar items means no possible selection; its treatment is not yet specified. This does not decide sorting; answer lifecycle is resolved below.

## Mid-Fidelity review

The [Mid-Fidelity Wireframe](../mid-fidelity-wireframe/README.md) illustrates hover/focus and proposes submission pending, submission failure, and empty sidebar treatments. The owner subsequently approved answer lifecycle, submission recovery, collapsible navigation and page size; empty-sidebar treatment, ordering and exact responsive mechanism remain open. Example question content is illustrative, not official exam data.

## Approved Mid-Fidelity decisions — 2026-11-27

On page or competition change, discard all answer selections and evaluated results from the previous page; revisiting starts unanswered. On the current page, a successfully evaluated answer is read-only. No answer persistence across application sessions. On submission failure, retain the selected option and allow another Answer submission; prevent duplicate submissions while pending. A failed request is not a confirmed answer. The sidebar is collapsible on small screens. Show ten questions per page, or fewer when the final page contains fewer questions.

Do not re-ask these six decisions. A same-page sidebar toggle does not discard answers; a genuine page or competition change does. Late responses must not restore discarded answers after navigation; duplicate prevention and ambiguous server outcomes require prototype/implementation validation. Empty sidebar remains an unapproved proposal. No page-size chooser is approved.
