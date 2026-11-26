# Information Architecture — v0.1.0

This is the initial architecture baseline, not a user-validated final design. The whiteboard separates destinations, navigation, area content, and decisions and research into distinct regions. Destinations sit at the same visual level without asserting unconfirmed hierarchy; navigation arrows appear separately. Home is the entry point, not an assumed parent of every destination.

Information architecture is broader than a sitemap. The area descriptions and navigation paths below are a concise architecture overview, not a complete screen inventory or detailed user flows.

## Release-stage boundaries

- **Information architecture:** maintain the destination map, content groupings, labels, findability and high-level navigation here and on this board.
- **Screen inventory:** the separate [screen inventory board](../screen-inventory/) is a working draft of screens and states. Keep this architecture overview concise instead of duplicating the inventory.
- **User flows:** the separate [user flows board](../user-flows/) is a working draft of key task paths; the navigation overview here remains high-level.
- **Research and decisions:** retain release decisions in [product.md](../product/product.md) and source material in [docs/references](../../../references/). The board holds concise findings and references, not duplicate full records.

The [release stages board](../../../boards/release-stages/) tracks these outputs. The [release decision register](../product/product.md#current-release-baseline) distinguishes recorded approvals from design baselines. Home's summary and competition selector, the weak-topic link, and detailed mixed-mock setup are design baselines. Navigation has been reviewed against the map. Usability validation remains pending.

## Destinations and navigation

- **Home:** the entry page, separate from Performance. Show a compact progress summary and a way to choose a competition. If no progress exists, offer the competition selection path.
- **Questions:** selecting a competition card directly in the sidebar opens its questions workspace. Ordinary practice stays within that competition; filters, including subject, topic and missed questions, appear on the same page. Each question shows the source fields available in the data.
- **Performance:** accessed directly above the sidebar footer. Show accuracy and strengths and weaknesses by competition, subject and topic. The design baseline links a weak topic to filtered practice in the relevant competition. A direct link to the missed-question filter is exploratory.
- **Mock exams:** accessible directly within Questions, using the same question-page structure. Provide entry to a new mock, previous mocks, and their results and progress. A competition-specific mock uses that competition's rules once verified. A mixed mock can draw from multiple competitions and is identified as mixed, not as an official exam. The detailed presentation of configuration, history and results remains for screen inventory and flows.

## Organization, labels and findability

- **Organization:** Home, Questions and Performance are the three base destinations. Mock exams is an assessment overlay within Questions, reached through its header action. The sidebar is structured around the user's active competition cards.
- **Labels:** These English names are the release's accepted working labels. The relationship and terminology of a competition and a particular exam or edition still need clarification against source materials.
- **Content relationships:** Questions have source provenance and may be classified by subject and topic. Subjects or topics can recur across competitions; this is a findability observation, not a strict hierarchy or approved data model. Ordinary practice remains within one selected competition; mixing competitions is limited to mock exams.
- **Navigation:** The sidebar lists active competitions; clicking a competition opens its questions workspace; Performance is a direct navigation item above the footer; Settings is a single footer gear. Mock exams is entered from Questions; Missed (Errei) is a Status filter and Performance review path. There is no account popover. Other cross-links are described below as path checks.
- **Findability:** Subject, topic and missed-question filters are on Questions. Missed means the latest checked attempt was incorrect; a later correct attempt removes the question from this filter without erasing history. A mixed mock can optionally narrow its scope by subject or topic. Free-text search is not an agreed v0.1.0 requirement. The actual filter labels and availability depend on the source data.

### Working terminology

- **Competition:** the selection process the learner chooses for ordinary practice.
- **Exam:** an assessment associated with a competition; its precise relationship to editions, stages and official booklets requires source review.
- **Mock exam:** a practice assessment; a mixed mock may draw from more than one competition and is not presented as one official exam.
- **Subject / topic:** working labels for classifying question content; the same subject or topic can recur in different competitions. **Question** means an individual item to answer.
- **Performance / accuracy:** performance is the progress area; accuracy is correct attempts divided by all attempts in the selected context.

These are working distinctions for the interface, not an approved domain or database model. Verify terminology against the official materials before locking labels or relationships.

## Mixed mock configuration

The design baseline offers competition-specific and mixed mocks. A mixed mock lets the user choose two or more competitions and optionally narrow the questions by subject or topic. Questions retain their individual provenance. The recorded decisions cover original or chosen question counts and timed sessions. The selection controls, mixed-mock composition, ordering, scoring and timer configuration remain open.

## Metrics and source evidence

Accuracy is correct attempts divided by all recorded attempts, with both counts visible; distinguish practice and mock results and avoid strong conclusions from small samples. Show exam, year, examining board and organization for each question when present; never fabricate missing values.

The release record links the official Dataprev booklet and records its observed basic format. The repository does not currently contain the question files or complete verified scoring rules. Validate available metadata, answer keys, scoring and amendments against actual source materials before implementation. The prototype must not imply unavailable data or unverified rules are known.

## Path checks

- [Flows 01–02](../user-flows/#primary-study-flows) cover Home → select a competition → Questions → filter missed questions.
- [Flow 03](../user-flows/#03-weak-topic-practice-from-performance) covers Sidebar → Performance → weak topic → Questions scoped to its competition and topic.
- [Flows 04–06](../user-flows/#04-taking-a-competition-specific-mock-exam) cover Questions → Mock exams → start a competition-specific or mixed mock, or open previous results.

These paths have been checked against the map, not tested with an interactive prototype. The screen inventory, user flows and prototype should validate missing states, detailed interactions and discoverability. For this personal first release, walk through these tasks with the owner and test them in the prototype. A small tree test can be used if finding a destination remains uncertain; formal card sorting is optional and should not be treated as a prerequisite.

## Research and evidence limits

- [NN/g: Information Architecture vs. Sitemaps](https://www.nngroup.com/articles/information-architecture-sitemaps/) distinguishes the wider discipline from a sitemap.
- [NN/g: IA and Navigation](https://www.nngroup.com/articles/ia-vs-navigation/) distinguishes content organization from controls for navigating it.
- [Yale: Site Mapping and Information Architecture](https://usability.yale.edu/ux/plan/establish-structure-findability/site-mapping-and-information-architecture) describes structuring content and features around findability.
- [NN/g: Tree Testing](https://www.nngroup.com/articles/tree-testing/) describes testing whether people can locate items in a hierarchy.
- [NN/g: Iterative Design](https://www.nngroup.com/articles/parallel-and-iterative-design/) and [Figma: Prototyping](https://www.figma.com/resource-library/what-is-prototyping/) describe testing and revising at different fidelities. For this release, inventory and flows can evolve together; validate key paths early and use additional fidelity only when it answers a specific question.
- The historical Exams Archive was consulted on 2026-11-25. While historical IA documents themselves were not recovered, historical QConcursos interface captures and sidebar prototypes were subsequently recovered and visually inspected (documented in [QConcursos archive evidence](../../../references/2026-11-25-qconcursos-archive-evidence.md) and [Performance and account menu research](../../../references/2026-11-25-performance-and-account-menu-research.md)). These provide historical visual references for the bottom sidebar avatar placement, filters, and question source metadata. Automatic answer checking is a user decision; the inspected screenshots do not establish that QConcursos offers it.

## Current workspace refinements

The conceptual Questions destination remains unchanged; its visible redundant subtitle is removed under the competition heading. The collapsed rail preserves access to competitions and Performance. Question metadata link affordances include ID, subject, topic/subtopic, year, board, organization and exam when present; exact navigation targets and filter dependencies remain proposed. Statistics expands inline; no separate Associated text or Commented key control. See [V010-16–19](../product/product.md#current-release-baseline) for scope and status.
