# User Flows — v0.1.0

This document accompanies the editable [user flows whiteboard](./). The [release decision register](../product/product.md#current-release-baseline) records approvals and design baselines. The paths below await a prototype walkthrough and usability validation.

## Primary Study Flows

### 01. Ordinary Question Practice

Home → select a competition → Questions in that competition → choose an answer → see correctness after evaluation. The evaluation trigger remains open.


### 02. Missed Questions Review (unprioritized idea)

The earlier flow used a Status filter or a Performance review link to find questions whose latest evaluated attempt was incorrect. The v0.1.0 release excludes this path.



### 03. Weak-Topic Practice from Performance (unprioritized idea)

Performance retains its direct sidebar entry and topic metrics. The earlier link to filtered Questions is outside v0.1.0.

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

- Check that evaluated answers update practice metrics and that all evaluated attempts remain in history.
- Check that ordinary practice stays within one competition and that mock correctness appears only after completion.
- Verify official scoring, answer keys and navigation restrictions against each source.

### 07. Question provenance (proposed)

Open ID or provenance links only to defined destinations. Confirm exact routes and keyboard interaction in a prototype before approval. The Questions toolbar (filters, Auto-check, sorting, result count, questions per page, and List/One) and per-question Statistics are unprioritized ideas with no release assignment.
