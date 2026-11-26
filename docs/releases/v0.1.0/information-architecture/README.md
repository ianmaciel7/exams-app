# Information Architecture — v0.1.0

This is the initial architecture baseline, not a user-validated final design. The whiteboard separates destinations, navigation, area content, and decisions and research into distinct regions. Destinations sit at the same visual level without asserting unconfirmed hierarchy; navigation arrows appear separately. Home is the entry point, not an assumed parent of every destination.

Information architecture is broader than a sitemap. The area descriptions and navigation paths below are a concise architecture overview, not a complete screen inventory or detailed user flows.

## Release-stage boundaries

- **Information architecture:** maintain the destination map, content groupings, labels, findability and high-level navigation here and on this board.
- **Screen inventory:** the separate [screen inventory board](../screen-inventory/) is a working draft of screens and states. Keep this architecture overview concise instead of duplicating the inventory.
- **User flows:** the separate [user flows board](../user-flows/) is a working draft of key task paths; the navigation overview here remains high-level.
- **Research and decisions:** retain release decisions in [product.md](../product/product.md) and source material in [docs/references](../../../references/). The board holds concise findings and references, not duplicate full records.

The [release stages board](../../../boards/release-stages/) tracks these outputs. The [release decision register](../product/product.md#current-release-baseline) distinguishes recorded approvals from design baselines. Home's summary and competition selector and the detailed mixed-mock setup are design baselines. Navigation has been reviewed against the map. Usability validation remains pending.

## Destinations and navigation

- **Home:** the entry page, separate from Performance. Show a compact progress summary and a way to choose a competition. If no progress exists, offer the competition selection path.
- **Questions:** selecting a competition in the sidebar opens its questions workspace. Ordinary practice stays within that competition. Each question shows its available source fields.
- **Performance:** accessed directly above the sidebar footer. Show accuracy and strengths and weaknesses by competition, subject and topic. Filtered weak-topic practice and missed-question review links are unprioritized ideas.
- **Mock exams:** accessible directly within Questions, using the same question-page structure. Provide entry to a new mock, previous mocks, and their results and progress. A competition-specific mock uses that competition's rules once verified. A mixed mock can draw from multiple competitions and is identified as mixed, not as an official exam. The detailed presentation of configuration, history and results remains for screen inventory and flows.

## Organization, labels and findability

- **Organization:** Home, Questions and Performance are the three base destinations. Mock exams is an assessment overlay within Questions, reached through its header action. The sidebar is structured around the user's active competition cards.
- **Labels:** These English names are the release's accepted working labels. The relationship and terminology of a competition and a particular exam or edition still need clarification against source materials.
- **Content relationships:** Questions have source provenance and may be classified by subject and topic. Subjects or topics can recur across competitions; this is a findability observation, not a strict hierarchy or approved data model. Ordinary practice remains within one selected competition; mixing competitions is limited to mock exams.
- **Navigation:** the sidebar lists active competitions and opens Questions for the selected competition. Performance is accessible above the footer and Settings uses one footer gear. Enter Mock exams from Questions.
- **Findability:** competition selection provides entry to Questions. The mixed mock configuration may narrow its scope by subject or topic as a design baseline.

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

- [Flow 01](../user-flows/#01-ordinary-question-practice) covers Home → select a competition → Questions → answer.
- The sidebar opens Performance directly to view accuracy and topic metrics.
- [Flows 04–06](../user-flows/#04-taking-a-competition-specific-mock-exam) cover Questions → Mock exams → start a competition-specific or mixed mock, or open previous results.

These paths have been checked against the map, not tested with an interactive prototype. The screen inventory, user flows and prototype should validate missing states, detailed interactions and discoverability. For this personal first release, walk through these tasks with the owner and test them in the prototype. A small tree test can be used if finding a destination remains uncertain; formal card sorting is optional and should not be treated as a prerequisite.

## Research and evidence limits

- [NN/g: Information Architecture vs. Sitemaps](https://www.nngroup.com/articles/information-architecture-sitemaps/) distinguishes the wider discipline from a sitemap.
- [NN/g: IA and Navigation](https://www.nngroup.com/articles/ia-vs-navigation/) distinguishes content organization from controls for navigating it.
- [Yale: Site Mapping and Information Architecture](https://usability.yale.edu/ux/plan/establish-structure-findability/site-mapping-and-information-architecture) describes structuring content and features around findability.
- [NN/g: Tree Testing](https://www.nngroup.com/articles/tree-testing/) describes testing whether people can locate items in a hierarchy.
- [NN/g: Iterative Design](https://www.nngroup.com/articles/parallel-and-iterative-design/) and [Figma: Prototyping](https://www.figma.com/resource-library/what-is-prototyping/) describe testing and revising at different fidelities. For this release, inventory and flows can evolve together; validate key paths early and use additional fidelity only when it answers a specific question.
- The historical Exams Archive was consulted on 2026-11-25. While historical IA documents themselves were not recovered, historical QConcursos interface captures and sidebar prototypes were subsequently recovered and visually inspected (documented in [QConcursos archive evidence](../../../references/2026-11-25-qconcursos-archive-evidence.md) and [Performance and account menu research](../../../references/2026-11-25-performance-and-account-menu-research.md)). These provide historical visual references for the bottom sidebar avatar placement, filters, and question source metadata. Automatic answer checking was previously requested for Exam App and is now an unprioritized idea. The inspected captures do not establish that QConcursos offers it.

## Current workspace refinements

The competition heading omits a redundant Questions subtitle. The collapsed rail preserves access to competitions and Performance. Question metadata uses link affordances when fields are present. Exact navigation targets remain open. The Questions toolbar (filters, Auto-check, sorting, result count, questions per page, and List/One) and per-question Statistics are unprioritized ideas with no release assignment. See the [release decision register](../product/product.md#current-release-baseline).
