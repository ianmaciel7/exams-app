# Sketch — v0.1.0

Eight side-by-side states of the same exploratory native Open Artifact screen: competition sidebar and vertically stacked questions, inspired by the list pattern the user described in ExamTopics. DATAPREV and PPSA are illustrative labels; abstract statements and alternatives are placeholders. The first two states show the top and end of the same page, with the same sidebar and pagination inside the main region footer. The sidebar lists entries directly without a “Concursos” section heading. The selected competition is identified only in the sidebar; no repeated competition heading or header divider in the main region. The partially visible questions and scrollbar communicate scroll position. This is not a second destination or a sticky-footer requirement. No filters, mock exams or other features are included. Answer feedback is now depicted as requested. The drawing is static, not a working interaction.

## Competition label

Competition items concatenate competition name, year and position/exam title in a single line, separated by middle dots (`Name · Year · Position/exam`). Truncate overflow with an ellipsis while preserving the full label for hover/focus discovery in the eventual implementation. The static sketch depicts truncation only. Examples follow the [historical commit 5c5402c](https://github.com/ianmaciel7/exams-app/commit/5c5402c1c6d93518b446b7f4309af3f1824d9e99); PPSA's full position title still requires confirmation.

## Pagination

The question list is paginated. Scroll vertically within a page; at the end of the list, use pagination controls to navigate between pages of the selected competition. The sketch shows illustrative numbered pages with Previous/Next; page size, total pages, ordering, and scroll restoration on page change remain open.

Progress: in progress; user visual review pending.

## Screen and variant layout convention

Arrange distinct screens/destinations vertically, one row per screen. Arrange states, scroll positions, responsive variants and alternative versions of the same screen horizontally within its row. Align the top of comparable artboards and leave clear spacing; do not imply a separate route just because a state has its own artboard. A page's pagination footer at the end of scroll is a horizontal variant of that same page, not a separate destination. Apply this convention to future UI sketch and wireframe boards unless the product owner specifies otherwise.

## UI/UX review (2026-11-26)

- Use a consistent question rhythm in both scroll states: same statement and answer-option spacing, with one light separator between questions rather than nested card borders. Preserve question titles and radio affordances.
- Keep the competition selection and one-line truncated labels in the sidebar; no duplicate main heading.
- Keep pagination inside the list footer; illustrate page 1 with a visibly selected page and an unavailable Previous control. The examples remain illustrative, not a decision on page size or data.
- Static geometry review only; keyboard, accessibility, dynamic truncation and actual scroll behavior require implementation and testing. Only the answer-feedback states requested by the product owner are added; implementation is not included.

## Question-list states (2026-11-26)

The eight artboards are variants of the same screen: top of the list (unanswered), end of the list, selected answer before evaluation, correct answer, incorrect answer, loading, empty list and load failure. In the correct state the chosen answer is marked correct. In the incorrect state the chosen answer and the correct answer are distinguishable by both text and color. Other questions remain unchanged. The selected-before-evaluation variant is conditional on a future decision about when evaluation occurs. Loading, empty and failure variants are proposed completeness states, pending visual review. No submit button, automatic evaluation trigger, retry behavior, explanations, scores or persistence is specified. The mock text and colors are illustrative.

## Native design annotations

Each of the eight screen states has a native sticky note directly beneath the artboard. Notes explain behavior, intended feedback, and open decisions; they are annotations rather than interface content. Color distinguishes navigation, open decisions, success, incorrect response, neutral information and load failure. The notes do not approve unresolved behavior or replace review comments. Threaded reviewer comments remain separate from board annotations.

## Open review threads

Four native review threads are anchored to answer selection, incorrect-answer feedback, pagination and load failure recovery in `comments.json`. All are open questions awaiting the product owner's decision. Notes remain explanatory; threads are the place for discussion and resolution. Static Pages screenshots cannot substitute for interactive thread review.

## Visual review refinement

The eight states retain their existing scope. Sidebar entries use compact spacing, body-size labels and a single selection indicator instead of a surrounding outline. Native sticky notes are concise. Open comment threads retain their identities and review targets; their visible anchors move to the corresponding external notes to avoid covering controls. The capture pipeline additionally produces individual state screenshots in both themes using the native camera, with full-board screenshots preserved. No new application behavior is approved.
