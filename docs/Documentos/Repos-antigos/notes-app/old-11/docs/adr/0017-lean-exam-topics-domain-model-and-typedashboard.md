# 0017. Lean ExamTopics Domain Model and TypeDashboard Navigation

- **Status:** Accepted
- **Date:** 2026-10-03
- **Canonical Owner:** `ARCHITECTURE.md`
- **Supersedes:** `docs/adr/0014-certification-exam-and-study-simulator-domain-model.md`
- **Amended by:** `docs/adr/0018-unified-question-type-system.md` (the Question `properties` shape in section 1, answer evaluation, and the Attempt payload in section 3; the `format` / `correctOptionIds` shape below is the legacy ExamTopics shape)

## Context and Problem Statement

The platform requires an active recall and certification exam simulation engine inspired by lean assessment platforms (Exam, Question, Answer, Grounded Explanation). The domain model must operate within the strict architectural and persistence constraints of `notes-app`:

1. **Firestore Document Budget (1MB limit) and Shallow Reads**: Storing entire exams with hundreds of rich questions, option lists, and explanations inside a single document would breach Firestore document limits, cause excessive bandwidth consumption, and prevent fast shallow listing. Conversely, reading questions must be fast and granular.
2. **Polymorphic Entity Model (`DER.md` schemaVersion 4)**: The repository models all domain entities as polymorphic `Object` documents (`/users/{uid}/spaces/{spaceId}/objects/{objectId}`). Introducing disconnected root collections (as explored in early drafts such as ADR 0014) breaks graph interoperability and tenant security invariants.
3. **Separation of Assessment Structure vs. User Annotations**: Learners require the ability to author personal notes, reflections, and links on questions. Storing user notes in the same structure as authoritative question metadata risks schema corruption and conflates imported content with private learner commentary.
4. **Answer Provenance (`INV-9`)**: Authoritative certification study demands unambiguous distinction between official exam answers, community consensus, AI-generated explanations, and user overrides without conflating source trust.
5. **Single-Record Graph Relations (`INV-10`)**: Associations between exams, questions, and knowledge concepts must follow the single-record relation model (`/users/{uid}/spaces/{spaceId}/relations/{relationId}`) rather than bespoke join tables.
6. **Immutable Practice Logs (`INV-11`)**: Question attempts, whether during self-paced study or timed mock exams, must be recorded as append-only immutable records (`/users/{uid}/spaces/{spaceId}/attempts/{attemptId}`).
7. **Workspace Ergonomics & Zero-Friction Active Recall**: Learners require instant feedback when clicking answers—immediately displaying whether the selected option was correct or incorrect and revealing the grounded explanation whenever available, with a clear path toward scalable Capacities-style Object Dashboards in future phases.

## Decision Outcome

We standardize the domain architecture for exams, questions, and assessment navigation:

### 1. Polymorphic Object Representation for Exam and Question

`Exam` and `Question` are first-class polymorphic `Object` documents under `/users/{uid}/spaces/{spaceId}/objects/{objectId}` conforming to `DER.md` `schemaVersion: 4`:

- **Exam (`objectTypeId: "exam"`)**:
  - `title`: Exam or certification title (e.g., "Google Cloud Certified Professional Cloud Architect").
  - `properties`:
    - `provider`: Certification authority or source organization (e.g., "Google Cloud", "AWS").
    - `code`: Official exam code (e.g., "GCP-PCA").
    - `totalQuestionsCount`: Total number of questions in the catalog.
    - `passingScorePercentage`: Target passing threshold (e.g., 70).
    - `timeLimitMinutes`: Optional allocated duration for simulation mode.
    - `questionIds`: Ordered array of question `objectId`s serving as the primary sequence driver for instant continuous feed rendering.

- **Question (`objectTypeId: "question"`)**:
  - `title`: Short question summary or identifier (e.g., "PCA Question 042").
  - `conceptIds`: Array of Concept Object IDs for tag-based filtering and concept mastery tracking (`DER.md`).
  - `properties`:
    - `statement`: Question prompt and scenario (Markdown with code formatting).
    - `options`: Array of selectable choices:
      ```typescript
      interface QuestionOption {
        id: string;
        text: string;
      }
      ```
    - `correctOptionIds`: Array of correct option IDs (`string[]`).
    - `groundedExplanation` (optional): Authoritative rationale linking correct choices directly to official documentation URLs and architectural insights with mandatory provenance (`INV-9`), present when explanations exist:
      ```typescript
      interface GroundedExplanation {
        text: string;
        referenceUrls: string[];
        answerProvenance: "official" | "suggested" | "community" | "user" | "ai";
      }
      ```
    - `examId`: Parent `Exam` object ID for fast indexed queries.
    - `orderIndex`: Canonical sequence index within the parent exam.
    - `format`: `'single_choice' | 'multiple_choice'`.
  - `content`: User personal notes serialized as `BlockEditorDocumentV4` AST (depth $\le 8$). The question's prompt, choices, and explanation stay strictly in `properties`, leaving `content` completely free for private annotations.

### 2. Graph Relations, Sequencing, and Batch Limits (`INV-10`)

The hierarchy between an `Exam` and its `Question` objects is tracked using the unified `relations` subcollection (`/users/{uid}/spaces/{spaceId}/relations/{relationId}`):
- `sourceObjectId`: Exam ID.
- `targetObjectId`: Question ID.
- `relationType`: `"contains"`.
- `sortOrder`: Matches `orderIndex` for manual or canonical ordering.

**Sequence Authority and Batching:**
- `Exam.properties.questionIds` is the **primary sequence driver** for the client study feed, enabling instant deterministic order resolution without issuing separate graph queries.
- `Question.properties.orderIndex` and `Relation.sortOrder` act as secondary indexed mirrors for queries and graph traversals.
- Reordering operations and batch imports must respect Firestore's 500-write limit: batch writes must be partitioned into chunks ($\le 400$ operations per batch) or orchestrated via Cloud Functions / transactions.

### 3. Immutable Append-Only Attempts and Card Mutation Dual-Write (`INV-11`)

Submissions in study or simulation modes are recorded directly into the space's `attempts` collection (`/users/{uid}/spaces/{spaceId}/attempts/{attemptId}`):
- `schemaVersion`: `4`
- `spaceId`: Tenant space ID.
- `questionId`: References the `Question` object.
- `cardId`: References the companion `Card` (`/users/{uid}/spaces/{spaceId}/cards/{cardId}`). Every Question provisions a companion Card in the same transaction or batch when imported or initialized.
- `rating`: Rating integer `1..4` (`1` = Incorrect / Forgot, `2` = Hard, `3` = Correct / Good, `4` = Correct / Easy) conforming to `firestore.rules` and FSRS v5.
- `reviewMode`: `"review" | "mockExam"`.
- `elapsedMilliseconds`: Active time spent answering (non-negative integer).
- `userConfidence`: Optional confidence level (`"guessed" | "uncertain" | "confident"`).
- `fsrsSnapshot`: Pre-review Card scheduling state map (`{ state, due, stability, difficulty, reps, lapses, lastReview }`).
- `reviewedAt`: `serverTimestamp()` (immutable submission time).

**Atomic Dual-Write & Instant Evaluation:**
Clicking to answer a question immediately triggers an atomic Firestore `writeBatch` executing two operations:
1. `create` on `/users/{uid}/spaces/{spaceId}/attempts/{attemptId}` logging the immutable practice event and capturing the pre-transition `fsrsSnapshot` (`INV-11`).
2. `update` on `/users/{uid}/spaces/{spaceId}/cards/{cardId}` incrementing `stateVersion = stateVersion + 1` and advancing FSRS scheduling parameters (`due`, `stability`, `difficulty`, `reps`, `lapses`, `lastReview`).

In the continuous study feed:
- **Single-choice questions**: Clicking an option immediately evaluates correctness (`selectedOptionId === correctOptionIds[0]`). If correct, it assigns rating `3` (Good); if incorrect, it assigns rating `1` (Forgot). The card schedule updates immediately, and the `groundedExplanation` expands automatically if present.
- **Multiple-choice questions**: Selecting options toggles choices; once the required option count is reached (or on confirmation), the set is evaluated against `correctOptionIds`, logging the attempt and revealing the explanation.

### 4. Presentation, Navigation Roadmap, and Visual Design & Semantic Tokens Invariant (`DESIGN.md`, `ADR 0016`)

Following explicit user direction to defer complex multi-column management for a future phase ("not for now, leave this for the future"), the navigation and interface architecture follows a phased rollout:

#### Phase 1 (Immediate / Active): Continuous Question Feed & Semantic Design Tokens

The active implementation priority focuses entirely on a high-velocity, clean, and distraction-free study experience:
- **Strictly Functional Reference (ExamTopics Pattern)**: The reference to ExamTopics provided by the user is **strictly a functional reference** for displaying questions on the screen: a continuous vertical stream of question cards, statement prompt, answer choices with instant click-to-validate feedback, conditional grounded explanation, and a floating scroll-to-top button.
- **Visual Design & Semantic Tokens Invariant (`DESIGN.md`)**:
  - The visual appearance, typography, spacing, borders, shadows, and colors **NEVER copy external styles verbatim**.
  - All visual styling **MUST ALWAYS be 100% derived from the semantic design tokens in `DESIGN.md`** (using shadcn/ui `base-nova` style, Base UI primitives, and Tailwind CSS v4 variables: `bg-card`, `border-border`, `bg-primary`, `text-primary-foreground`, `text-foreground`, `rounded-xl`, etc.) with full first-class support for both light and dark modes.
- **Card Functional Anatomy & Instant Click-to-Validate Semantics**:
  - **Semantic Card Header**: The card header uses semantic tokens (`bg-muted/50 border-b border-border` or `text-foreground font-semibold` with badge primitives), **never an ad-hoc blue banner** or external brand color. It displays question indices alongside parent exam/topic metadata and status badges.
  - **Scenario Statement**: Formatted in Markdown with high-contrast typography (`text-foreground`, `font-sans`) and syntax-highlighted code snippets (`font-mono`) respecting dark and light theme tokens.
  - **Instant Click-to-Validate Options**: Selectable choices (`A.`, `B.`, `C.`, `D.`) using semantic border, hover, and selection states (`border-border`, `hover:bg-muted/50`). Clicking an option triggers instant verification:
    - **Correct Selected Choice**: Styled with semantic primary/success tokens (`border-primary bg-primary/10 text-foreground font-medium`).
    - **Incorrect Selected Choice**: Styled with semantic destructive tokens (`border-destructive bg-destructive/10 text-destructive`).
    - **Correct Key Indicator**: The true correct option is surfaced so the learner immediately sees the right answer.
  - **Conditional Grounded Explanation Expansion**: If the Question contains a `groundedExplanation`, it automatically reveals and expands directly below the choices upon validation, presenting authoritative vendor documentation URLs and architectural insights. If no explanation exists, the card cleanly displays the correct/incorrect verification without empty placeholders.
  - **Secondary "Show Answer" Action**: A discrete secondary button allows learners to view the correct answer and explanation without logging an active recall test score.
  - **Floating Scroll-to-Top Button**: Unobtrusive floating action button (`rounded-full shadow-md bg-background border border-border text-foreground hover:bg-muted`) providing immediate return to the top of long question feeds.
- **Component Architecture & Behavior Ownership (`ADR 0016`, `CONSTRAINTS.md`)**:
  - Domain surfaces follow the simple domain component pattern: `ExamFeedView` renders the continuous feed, while its dedicated hook `useExamFeed` owns query pagination, active question indices, and scroll position tracking.
  - Individual question cards are encapsulated in `QuestionCard`, while its dedicated hook `useQuestionCard` owns local choice selection, instant correctness validation, explanation expansion, and atomic FSRS attempt submissions.
  - All user-facing strings (e.g. `exam.questionIndex`, `exam.showAnswer`, `exam.groundedExplanation`) must be localized via `next-intl` message catalogs (`CONSTRAINTS.md`).

#### Phase 2 (Future / Deferred): Complex Multi-Column TypeDashboard

Deferred to a later milestone when multi-type catalog curation and cross-collection organization are required:
- **Primary Space Sidebar**: Permanent left column containing user profile, space switcher, global search, inbox, and ObjectType navigation links.
- **Secondary Collapsible TypeDashboard**: Lateral secondary column adjacent to the primary sidebar, invoked when an ObjectType (such as Exams) is active:
  - Displays type-specific catalogs, predefined views (All Exams, In Progress, Completed), collections, and recently accessed items.
  - Allows selecting an item to open it directly in the main canvas.
  - Collapsible or expandable to maximize reading canvas width, rendering as a slide-over sheet on compact/mobile viewports.

### 5. URL Routing Architecture vs. Firestore Storage Topology

To reconcile human-readable navigation with polymorphic persistence, the system separates the frontend URL hierarchy from the backend persistence topology:

- **Frontend Routing (Next.js App Router)**: Exposes semantic, user-friendly, type-qualified slugs that map naturally to user mental models and browser history:
  - **Type Catalog / TypeDashboard**: `/[spaceId]/[objectTypeSlug]` (e.g., `/[spaceId]/exams`, `/[spaceId]/questions`).
  - **Specific Item View / Editor**: `/[spaceId]/[objectTypeSlug]/[objectId]` (e.g., `/[spaceId]/exams/[examId]`, `/[spaceId]/questions/[questionId]`).
  - This structure enables deep-linking directly into a specific type's catalog or a concrete entity while retaining contextual breadcrumbs and layout hierarchy in the URL bar.

- **Backend / Database Topology (Firestore)**: Strictly preserves the single polymorphic collection path under `/users/{uid}/spaces/{spaceId}/objects/{objectId}`:
  - **Polymorphic Queries**: Preserves cross-type queries such as Omnisearch, recent activity, and global space-wide filters across all types in a space without multi-collection fans.
  - **Zero-Migration Renaming & Type Conversions**: Converting an object from one `objectTypeId` to another or updating `objectTypeSlug` definitions does not require physically moving or migrating documents across collections.
  - **Unified Graph Relations**: Keeps graph edges under `/users/{uid}/spaces/{spaceId}/relations/{relationId}` unified and simple, where `sourceObjectId` and `targetObjectId` reference identifiers in the single `objects` collection regardless of domain type.
  - **Centralized Security Enforcement**: Strictly adheres to the centralized tenant security rules in `firestore.rules`, avoiding fragmented security policies across arbitrary domain-specific root or subcollections.

### 6. Firestore Indexing Specifications

To serve continuous question feeds ordered by sequence within an Exam without client-side sorting overhead and filtering only active items (`lifecycleState: "active"`), the following composite index will be defined in `firestore.indexes.json` and registered in `firebase.json`:

- **Index Definition**:
  - `collectionGroup`: `"objects"`
  - `queryScope`: `"COLLECTION"`
  - `fields`:
    - `lifecycleState`: `ASCENDING`
    - `objectTypeId`: `ASCENDING`
    - `properties.examId`: `ASCENDING`
    - `properties.orderIndex`: `ASCENDING`

- **Firebase Configuration Registration**:
  `firebase.json` must explicitly declare `"indexes": "firestore.indexes.json"` within the `firestore` configuration block alongside `"rules": "firestore.rules"` to ensure emulator and deployment targets load index definitions.

## Consequences

### Positive Consequences

- **Optimized Shallow Reads**: Listing exams reads only lightweight exam documents. Individual questions are fetched on demand or streamed sequentially during study sessions, avoiding large single-document payloads.
- **Zero-Friction Active Recall**: Instant click-to-validate feedback gives immediate confirmation of whether an answer was right or wrong without requiring redundant clicks or separate modal dialogues, accelerating retention.
- **Adaptive Explanation Display**: Authoritative grounded explanations expand immediately when available, anchoring active learning in official documentation and architectural insight without cluttering questions that lack explanations.
- **100% Architectural Compliance**: Seamlessly integrates with `DER.md` `schemaVersion: 4` and existing `firestore.rules` without creating ad-hoc collections or security exceptions.
- **Decoupled Learner Notes & Provenance Tracking**: Separating assessment data in `properties` from user notes in `content` allows learners to write rich notes and link concepts without risking corruption of the question prompt or authoritative canonical answers, while `INV-9` guarantees clear explanation provenance.
- **Auditability and Progress Tracking**: Immutable attempt logs provide an unforgeable history for accuracy analytics, streak tracking, and FSRS spaced repetition.
- **Strict Separation of Concerns (`ADR 0016`)**: Component responsibilities remain clean, separating rendering (`ExamFeedView`, `QuestionCard`) from stateful async logic (`useExamFeed`, `useQuestionCard`).
- **Future-Proof Extensibility (Phase 2)**: Preserves the architectural blueprint for Capacities-style TypeDashboards without slowing down the immediate delivery of the core certification engine.

### Trade-offs and Mitigations

- **Client Memory Visibility**: In client-driven study mode, `correctOptionIds` is delivered in the Question document properties.
  - *Mitigation*: For study and self-assessment modes, immediate local access to the canonical answer and grounded explanation is desirable for zero-latency feedback. If high-stakes proctored test modes are required in the future, answer checking can be delegated to a serverless function that strips answers before delivering questions.
- **Sequence Updates and Batch Size Limits**: Reordering questions within an exam requires updating the Exam's `questionIds` array and corresponding relation records.
  - *Mitigation*: Handled via chunked Firestore `writeBatch` operations ($\le 400$ writes per batch) to ensure scalability across large question sets without hitting Firestore's 500-write limit.
- **Deferred Multi-Type Organization**: TypeDashboard views, collections, and custom type-level triage are deferred to Phase 2.
  - *Mitigation*: The single-column continuous feed satisfies the immediate user priority for certification study, while URL routes (`/[spaceId]/exams/[examId]`) remain fully compatible with the future TypeDashboard layout.
