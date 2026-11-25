# Information architecture — v0.1.0

This is the initial architecture baseline. The whiteboard in this folder visualizes it; interaction details and usability remain to be tested in later stages.

## Destinations and navigation

- **Home:** the entry page, separate from Performance. Show a compact progress summary and a way to choose a competition. If no progress exists, offer the competition selection path.
- **Questions:** choosing a competition opens its questions. Ordinary practice stays within that competition; filters, including subject, topic and missed questions, appear on the same page. Each question shows the source fields available in the data.
- **Performance:** accessed through the avatar menu. Show accuracy and strengths and weaknesses by competition, subject and topic. Link a weak topic or missed questions to filtered practice in the relevant competition.
- **Mock exams:** accessible from Questions. Provide entry to a new mock, previous mocks, and their results and progress. A competition-specific mock uses that competition's rules once verified. A mixed mock can draw from multiple competitions and is identified as mixed, not as an official exam.

## Mixed mock configuration

For the initial design, offer a choice between a competition-specific mock and a mixed mock. A mixed mock lets the user choose two or more competitions and optionally narrow the questions by subject or topic; show the selected scope before starting. Questions retain their individual provenance. The exact selection controls, question count, ordering, scoring and timing are later interaction and rules decisions, not assumptions about an official exam.

## Metrics and source evidence

Accuracy is correct attempts divided by all recorded attempts, with both counts visible; distinguish practice and mock results and avoid strong conclusions from small samples. Show exam, year, examining board and organization for each question when present; never fabricate missing values.

The release record links the official Dataprev booklet and records its observed basic format. The repository does not currently contain the question files or complete verified scoring rules. Validate available metadata, answer keys, scoring and amendments against actual source materials before implementation. The prototype must not imply unavailable data or unverified rules are known.

## Path checks

- Home → select a competition → Questions → filter missed questions.
- Avatar → Performance → weak topic → Questions scoped to its competition and topic.
- Questions → Mock exams → select a specific or mixed scope → start, or open previous results.

These paths have been checked against the map, not tested with an interactive prototype. The screen inventory, user flows and prototype should validate missing states, detailed interactions and discoverability.
