# User Flows — v0.1.0

This document accompanies the editable [user flows whiteboard](./). The [release decision register](../product/product.md#current-release-baseline) records approvals and design baselines. The paths below await a prototype walkthrough and usability validation.

## Primary Study Flows

### 01. Ordinary Question Practice

Home → select a competition → Questions in that competition → optionally filter or change the auto-check setting → choose an answer.

- Auto-check on → evaluate the selected answer immediately → show correctness.
- Auto-check off → select Verify → evaluate the answer and show correctness.

### 02. Missed Questions Review

Entry via Status in Questions under the selected competition (or proposed review path from Performance) → apply the missed-question filter → answer an item whose latest evaluated attempt was incorrect.

- Incorrect → the item remains eligible for the filter.
- Correct → the item stops qualifying for the filter. The timing of the visible list refresh remains open.

Both attempts stay in the history and count toward practice accuracy.

### 03. Weak-Topic Practice from Performance

Direct sidebar Performance item above footer → Performance → choose a weak topic → Questions filtered to the topic and scoped to its competition. The weak-topic link is a design baseline.

### 04. Taking a Competition-Specific Mock Exam

Questions → `Mock exams` header action → choose the competition-specific scope and original or chosen question count → start a timed session in the Questions structure. Apply verified exam-specific rules. Leave answers blank or revisit and change answers as the verified rules allow.

- Manual finish → submit recorded answers → show results and answer review.
- Timeout → automatically submit recorded answers → show results and answer review.
- Leave before completion → pause the timer → resume with the remaining time and recorded answers. The resume entry, interruption boundaries and restoration after reload or closure remain open.

### 05. Viewing Previous Mock Results

Questions → Mock exams → history → select an earlier mock → view results and progress. The history entry, empty state and presentation require review.

### 06. Taking a Mixed Mock Exam

Questions → Mock exams → choose mixed scope → select two or more competitions and a question count → optionally narrow by subject or topic → start a timed session identified as mixed. Use the same manual finish, timeout and interruption branches as [flow 04](#04-taking-a-competition-specific-mock-exam). Mixed setup is a design baseline. Composition, ordering, handling of insufficient questions and scoring remain open.

## Decisions & Verification Notes

- Check that both evaluation modes update practice metrics and preserve attempts, and that a later correct attempt removes the question from the missed filter after refresh.
- Check that ordinary practice stays within one competition and that mock correctness appears only after completion.
- Verify official scoring, answer keys and navigation restrictions against each source. QConcursos behavior after a later correct attempt remains unverified. [QConcursos filter documentation](https://suporte.qconcursos.com/pt-BR/articles/12118570-como-usar-os-filtros-de-questoes)

### 07. Filter and provenance interaction (proposed)

Choose a competition → select Subject → optionally select Topic, Status or More → apply on change → update result count and reset pagination. Removing Subject clears its dependent Topic; remove individual chips or Clear filters without resetting Auto-check or view preferences. Open ID or provenance links only to defined destinations; proposed filtered routes retain the competition context. Statistics expands inline on the same question; no separate Associated text or Commented key control. Confirm routes, loading/empty/error handling and keyboard interaction in a prototype before approval.
