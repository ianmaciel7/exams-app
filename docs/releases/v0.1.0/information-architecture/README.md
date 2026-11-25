# Information architecture — v0.1.0

This is the initial architecture baseline, not a user-validated final design. The whiteboard separates destinations, navigation, area content, and decisions and research into distinct regions. Destinations sit at the same visual level without asserting unconfirmed hierarchy; navigation arrows appear separately. Home is the entry point, not an assumed parent of every destination.

Information architecture is broader than a sitemap. The compact page descriptions below inventory current content and capabilities; the release's dedicated screen inventory and user flows are later stage outputs, not completed by this document.

## Destinations and navigation

- **Home:** the entry page, separate from Performance. Show a compact progress summary and a way to choose a competition. If no progress exists, offer the competition selection path.
- **Questions:** choosing a competition opens its questions. Ordinary practice stays within that competition; filters, including subject, topic and missed questions, appear on the same page. Each question shows the source fields available in the data.
- **Performance:** accessed through the avatar menu. Show accuracy and strengths and weaknesses by competition, subject and topic. Link a weak topic or missed questions to filtered practice in the relevant competition.
- **Mock exams:** accessible from Questions. Provide entry to a new mock, previous mocks, and their results and progress. A competition-specific mock uses that competition's rules once verified. A mixed mock can draw from multiple competitions and is identified as mixed, not as an official exam. Whether this destination becomes a separate screen or an in-page experience remains open until screen inventory and flows.

## Organization, labels and findability

- **Organization:** Home, Questions, Mock exams and Performance are working destinations or areas. They are shown together for orientation, not to assert that each is a child of Home.
- **Labels:** These English names are the release's accepted working labels. The relationship and terminology of a competition and a particular exam or edition still need clarification against source materials.
- **Content relationships:** Questions have source provenance and may be classified by subject and topic. Subjects or topics can recur across competitions; this is a findability observation, not a strict hierarchy or approved data model. Ordinary practice remains within one selected competition; mixing competitions is limited to mock exams.
- **Navigation:** The avatar menu offers Performance; choosing a competition opens Questions; Questions offers access to Mock exams. Other cross-links are described below as path checks.
- **Findability:** Subject, topic and missed-question filters are on Questions; a mixed mock can optionally narrow its scope by subject or topic. Free-text search is not an agreed v0.1.0 requirement. The actual filter labels and availability depend on the source data.

## Mixed mock configuration

For the initial design, offer a choice between a competition-specific mock and a mixed mock. A mixed mock lets the user choose two or more competitions and optionally narrow the questions by subject or topic; show the selected scope before starting. Questions retain their individual provenance. The exact selection controls, question count, ordering, scoring and timing are later interaction and rules decisions, not assumptions about an official exam.

## Metrics and source evidence

Accuracy is correct attempts divided by all recorded attempts, with both counts visible; distinguish practice and mock results and avoid strong conclusions from small samples. Show exam, year, examining board and organization for each question when present; never fabricate missing values.

The release record links the official Dataprev booklet and records its observed basic format. The repository does not currently contain the question files or complete verified scoring rules. Validate available metadata, answer keys, scoring and amendments against actual source materials before implementation. The prototype must not imply unavailable data or unverified rules are known.

## Path checks

- Home → select a competition → Questions → filter missed questions.
- Avatar → Performance → weak topic → Questions scoped to its competition and topic.
- Questions → Mock exams → select a specific or mixed scope → start, or open previous results.

These paths have been checked against the map, not tested with an interactive prototype. The screen inventory, user flows and prototype should validate missing states, detailed interactions and discoverability. For this personal first release, walk through these tasks with the owner and test them in the prototype. A small tree test can be used if finding a destination remains uncertain; formal card sorting is optional and should not be treated as a prerequisite.

## Research and evidence limits

- [NN/g: Information Architecture vs. Sitemaps](https://www.nngroup.com/articles/information-architecture-sitemaps/) distinguishes the wider discipline from a sitemap.
- [NN/g: IA and Navigation](https://www.nngroup.com/articles/ia-vs-navigation/) distinguishes content organization from controls for navigating it.
- [Yale: Site Mapping and Information Architecture](https://usability.yale.edu/ux/plan/establish-structure-findability/site-mapping-and-information-architecture) describes structuring content and features around findability.
- [NN/g: Tree Testing](https://www.nngroup.com/articles/tree-testing/) describes testing whether people can locate items in a hierarchy.
- The historical Exams Archive was consulted on 2026-11-25, but its searchable local index was unavailable and no historical IA source content was recovered. Archive reports list historical search categories only; they do not substantiate a specific navigation decision. Earlier research and its limitations remain recorded on the board and in `docs/references/`.
