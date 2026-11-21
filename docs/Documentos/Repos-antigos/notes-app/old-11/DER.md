# Entity-Relationship Documentation (DER / ERD)

This document owns the target **Entity-Relationship Model (Diagrama Entidade-Relacionamento)** for `notes-app`, defining the intended Firestore hierarchy, entity attributes, primary/foreign keys, cardinality constraints, and indexing topologies.

> **Current implemented subset:** `USER → SPACE` only. Space documents live at
> `/users/{uid}/spaces/{spaceId}` with owner isolation and schema/state-version
> validation in `firestore.rules`. Every other entity in the diagrams below remains
> a target model until promoted by `INTENT.md` and `ARCHITECTURE.md`.

- Canonical domain vocabulary: [`CONTEXT.md`](./CONTEXT.md)
- Bounded context boundaries: [`CONTEXT-MAP.md`](./CONTEXT-MAP.md)
- System architecture: [`ARCHITECTURE.md`](./ARCHITECTURE.md)
- Database decision record: [`ADR 0013: Native Firebase Firestore with Persistent Local Cache`](./docs/adr/0013-adopt-native-firebase-firestore-with-persistent-local-cache.md)

---

## 1. Target Entity-Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ SPACE : owns

    SPACE ||--o{ OBJECT_TYPE : defines
    SPACE ||--o{ TEMPLATE : provides
    SPACE ||--o{ OBJECT : contains
    SPACE ||--o{ RELATION : indexes
    SPACE ||--o{ CARD : schedules
    SPACE ||--o{ ATTEMPT : logs
    SPACE ||--o{ VIEW : presents
    SPACE ||--o{ INBOX_ITEM : triages

    OBJECT_TYPE ||--o{ PROPERTY_DEFINITION : declares
    OBJECT_TYPE ||--o{ OBJECT : classifies
    OBJECT_TYPE ||--o{ TEMPLATE : configures

    OBJECT ||--o{ RELATION : "source or target"
    OBJECT ||--o{ CARD : "spawns (for Questions)"
    OBJECT ||--o{ ATTEMPT : "tested in"

    CARD ||--o{ ATTEMPT : records
    VIEW ||--o{ OBJECT : projects

    USER {
        string uid PK "Firebase Auth UID"
        string email "User email address"
        string displayName "User display name"
        string activeLocale "Cookie/Preference sync (en, pt-BR, es)"
        timestamp createdAt "Registration timestamp"
        timestamp updatedAt "Last profile update"
    }

    SPACE {
        string id PK "Space UUID"
        string ownerId FK "References USER.uid"
        string name "Space name"
        string description "Optional description"
        string icon "Visual icon identifier"
        int stateVersion "Optimistic Concurrency Control counter"
        timestamp createdAt "Creation timestamp"
        timestamp updatedAt "Last update timestamp"
    }

    OBJECT_TYPE {
        string id PK "ObjectType UUID / slug (e.g. note, concept, question)"
        string spaceId FK "References SPACE.id"
        string name "Type display name"
        string pluralName "Plural display name"
        string icon "Icon identifier"
        string color "Color token"
        boolean isNative "System built-in vs user-defined"
        string defaultTemplateId FK "Optional TEMPLATE.id"
        int sortOrder "Display ordering index"
        int stateVersion "OCC version counter"
        timestamp createdAt "Creation timestamp"
        timestamp updatedAt "Last update timestamp"
    }

    PROPERTY_DEFINITION {
        string id PK "Property UUID"
        string objectTypeId FK "References OBJECT_TYPE.id"
        string name "Field label"
        string type "text, number, date, select, multiSelect, checkbox, url, relation"
        boolean isSystem "Built-in fixed property vs custom"
        boolean isRequired "Validation rule"
        string relationTargetTypeId FK "Optional target OBJECT_TYPE.id"
        string inverseRelationName "Bidirectional backlink label"
    }

    OBJECT {
        string id PK "Object UUID"
        string spaceId FK "References SPACE.id"
        string objectTypeId FK "References OBJECT_TYPE.id"
        string title "Object title"
        string lifecycleState "active, archived, trash, pendingApproval"
        json properties "Dynamic key-value property map"
        json content "BlockEditorDocumentV4 AST (depth <= 8)"
        stringArray conceptIds "Denormalized Concept Object IDs"
        stringArray outgoingLinkIds "Denormalized Target Object IDs"
        json generationMetadata "AI / MCP citation and prompt provenance"
        int stateVersion "OCC version counter"
        timestamp deletedAt "Trash timestamp (30-day purge)"
        timestamp createdAt "Creation timestamp"
        timestamp updatedAt "Last update timestamp"
    }

    RELATION {
        string id PK "Relation UUID"
        string spaceId FK "References SPACE.id"
        string sourceObjectId FK "References OBJECT.id"
        string targetObjectId FK "References OBJECT.id"
        string sourceBlockId "Optional BlockId block:<uuid> for transclusions"
        string relationType "references, transclusion, broader, narrower, related, tests, derivedFrom, property:<id>"
        boolean isBidirectional "True if reciprocal navigation is enabled"
        int sortOrder "Manual arrangement index"
        timestamp deletedAt "Tombstone set when an endpoint Object is trashed"
        timestamp createdAt "Creation timestamp"
        timestamp updatedAt "Last update timestamp"
    }

    CARD {
        string id PK "Card UUID"
        string spaceId FK "References SPACE.id"
        string questionId FK "References OBJECT.id (Question)"
        int cardIndex "0 for basic, 1..N for cloze deletions"
        int state "FSRS State: 0=New, 1=Learning, 2=Review, 3=Relearning"
        timestamp due "Next scheduled review date"
        float stability "FSRS memory stability in days"
        float difficulty "FSRS difficulty (1.0 to 10.0)"
        int elapsedDays "Days elapsed since previous review"
        int scheduledDays "Calculated interval for current review"
        int reps "Total review repetitions"
        int lapses "Total review lapse count"
        timestamp lastReview "Previous review timestamp"
        int stateVersion "OCC version counter"
        timestamp updatedAt "Last update timestamp"
    }

    ATTEMPT {
        string id PK "Attempt UUID"
        string spaceId FK "References SPACE.id"
        string questionId FK "References OBJECT.id"
        string cardId FK "References CARD.id"
        int rating "1=Forgot, 2=Hard, 3=Good, 4=Easy"
        string reviewMode "review or mockExam"
        int elapsedMilliseconds "Time spent answering"
        string userConfidence "guessed, uncertain, confident"
        json fsrsSnapshot "Full pre-review Card state (state, due, stability, difficulty, reps, lapses, lastReview)"
        timestamp reviewedAt "Immutable review timestamp"
    }

    VIEW {
        string id PK "View UUID"
        string spaceId FK "References SPACE.id"
        string objectTypeId FK "Optional target OBJECT_TYPE.id"
        string name "View title"
        string layout "table, gallery, wall, list, kanban, calendar"
        json filterConfig "Declarative query filters"
        json sortConfig "Sorting rules"
        json groupConfig "Grouping rules"
        int stateVersion "OCC version counter"
        timestamp updatedAt "Last update timestamp"
    }

    TEMPLATE {
        string id PK "Template UUID"
        string spaceId FK "References SPACE.id"
        string objectTypeId FK "References OBJECT_TYPE.id"
        string name "Template title"
        json defaultProperties "Preset property values"
        json initialContent "Initial BlockEditorDocumentV4 AST"
        timestamp createdAt "Creation timestamp"
        timestamp updatedAt "Last update timestamp"
    }

    INBOX_ITEM {
        string id PK "Inbox Item UUID"
        string spaceId FK "References SPACE.id"
        string objectId FK "References OBJECT.id"
        string intakeType "weblink, webClipper, aiGenerated, fileUpload"
        string triageTab "toRead or pendingApproval"
        json metadata "Source URL, clipper excerpt, agent model metadata"
        timestamp createdAt "Intake timestamp"
        timestamp processedAt "Approval or archive timestamp"
    }
```

---

## 2. Firestore Storage Hierarchy & Collection Paths

In accordance with Hard Space Isolation (`INV-1`) and ADR 0013, all application data is stored in hierarchical subcollections isolated by tenant:

```text
/users/{uid}                                            <-- User document
  ├── /spaces/{spaceId}                                 <-- Space document (Tenancy Boundary)
  │     ├── /objectTypes/{objectTypeId}                 <-- Object Type schemas
  │     ├── /templates/{templateId}                     <-- Object Type templates
  │     ├── /objects/{objectId}                         <-- Canonical Objects (Notes, Concepts, Questions)
  │     ├── /relations/{relationId}                     <-- Unified Graph Relations (INV-10)
  │     ├── /cards/{cardId}                             <-- FSRS v5 Cards
  │     ├── /attempts/{attemptId}                       <-- Immutable Practice Logs (INV-11)
  │     ├── /views/{viewId}                             <-- Presentation Views & Queries
  │     └── /inbox/{inboxItemId}                        <-- Triage Queue
```

---

## 3. Entity Catalog & Detailed Specifications

### 3.1 `OBJECT`
The central polymorphic entity of the knowledge graph.

- **Collection Path**: `/users/{uid}/spaces/{spaceId}/objects/{objectId}`
- **Primary Key**: `objectId` (RFC 4122 UUID v4)
- **Attributes**:
  - `schemaVersion` (`int`, constant `4`): Schema migration version.
  - `spaceId` (`string`, required): Parent space ID.
  - `objectTypeId` (`string`, required): References `OBJECT_TYPE.id`.
  - `title` (`string`, required): Display title of the object.
  - `lifecycleState` (`string`, enum: `"active" | "archived" | "trash" | "pendingApproval"`): Operational state.
  - `properties` (`map<string, any>`): Dynamic property values conforming to the object type's property definitions.
  - `content` (`map<string, any>`, nullable): Serialized `BlockEditorDocumentV4` AST. Strictly bounded to a tree depth $\le 8$.
  - `conceptIds` (`array<string>`): Denormalized array of tagged Concept Object IDs for fast local filtering.
  - `outgoingLinkIds` (`array<string>`): Denormalized array of target Object IDs for graph traversals.
  - `generationMetadata` (`map`, optional): For AI/agent-generated items, contains `agentId`, `model`, `promptInstruction`, and `contextObjectIds` (`INV-6`, `INV-12`).
  - `stateVersion` (`int`, default `1`): Optimistic Concurrency Control integer incremented on every update.
  - `deletedAt` (`timestamp`, nullable): Populated when moved to Trash. Purged after 30 days.
  - `createdAt` (`timestamp`), `updatedAt` (`timestamp`).

#### Specialized Object Extensions
- **Exam** (`objectTypeId: "exam"`): Top-level certification assessment object. Stores `provider` (authority/vendor), `code` (e.g. `GCP-PCA`), `totalQuestionsCount`, `passingScorePercentage`, `timeLimitMinutes`, and an in-document `questionIds` array for deterministic sequential navigation ([ADR 0017](./docs/adr/0017-lean-exam-topics-domain-model-and-typedashboard.md)).
- **Question** (`objectTypeId: "question"`): Assessment item object discriminated by `properties.type` (`single-choice`, `multiple-choice`, `true-false`, `fill-blank`, `dropdown`, `matching`, `ordering`, `drag-and-drop`, `hotspot`, `matrix`, `simulation`, `case-study`). Common `properties`: `prompt` (scenario Markdown), optional `promptImage` (`{ url, alt }`), `correctAnswer` (shape fixed by the type), `explanation` (optional, with `text`, `referenceUrls`, and `answerProvenance` per `INV-9`), optional `source`, `examId` (parent Exam object ID), `orderIndex`, and optional `difficulty` and `tags`. Type-specific `properties`: `options` (`{ id, text, explanation?, imageUrl?, imageAlt? }`) for the choice types, `leftItems` / `rightItems` for `matching`, optional `variant` (`true-false` or `yes-no`) for `true-false`, `dropdowns` for `dropdown`, `items` for `ordering`, `items` / `slots` for `drag-and-drop`, `image` / `areas` for `hotspot`, `columns` / `rows` for `matrix`, `scenarioDescription` / optional `terminalPrompt` / `allowedCommands` for `simulation`, `title` / `context` / `sections` / `parts` for `case-study`. Fields foreign to the type are rejected by `validateQuestionProperties`. Free-form learner reflections and notes are stored in `content` AST ([ADR 0017](./docs/adr/0017-lean-exam-topics-domain-model-and-typedashboard.md), [ADR 0018](./docs/adr/0018-unified-question-type-system.md)). The legacy shape (`statement`, `options`, `correctOptionIds`, `format`, no `type`) is converted by `migrate-legacy-question` and rewritten by `scripts/tooling/migrate-questions.mjs`; no new data uses it.
- **Concept**: Stores `prefLabel`, `altLabels` (synonyms), `broaderConceptIds` (parents), `narrowerConceptIds` (children), and `status` (`not_started`, `learning`, `mastered`).
- **Source**: Stores source media metadata (`pdfUrl`, `weblinkUrl`, `durationSeconds`, `localSnapshotUrl`).
- **Highlight**: Stores `sourceObjectId` (`Dependent` on Source), W3C selector locator, color tone, and excerpt text.

---

### 3.2 `RELATION` (Single-Record Relation Model, `INV-10`)
Unifies all connections across the knowledge graph (inline mentions, transclusions, concept taxonomy, and property links) into a single collection.

- **Collection Path**: `/users/{uid}/spaces/{spaceId}/relations/{relationId}`
- **Primary Key**: `relationId` (UUID v4)
- **Attributes**:
  - `schemaVersion` (`int`, constant `4`)
  - `spaceId` (`string`, required)
  - `sourceObjectId` (`string`, required): Origin Object ID.
  - `targetObjectId` (`string`, required): Target Object ID.
  - `sourceBlockId` (`string`, optional): Specific block ID (`block:<uuid>`) for transclusions (`(( ))`).
  - `relationType` (`string`, required): Semantic relationship type:
    - `"references"`: Standard `@` or `[[ ]]` inline link.
    - `"transclusion"`: Block reference embed.
    - `"broader"` / `"narrower"` / `"related"`: SKOS Concept taxonomy edges.
    - `"tests"`: Question-to-Concept or Question-to-Note link.
    - `"derivedFrom"`: Highlight or Question created from a Source.
    - `"property:<propId>"`: Structured relation property link.
  - `isBidirectional` (`boolean`, default `true`): Governs bidirectional navigation in UI.
  - `sortOrder` (`int`, optional): Manual arrangement index.
  - `deletedAt` (`timestamp`, nullable): Tombstone written when either endpoint Object is moved to Trash; cleared on restore, purged with the Object.
  - `createdAt` (`timestamp`), `updatedAt` (`timestamp`).

---

### 3.3 `CARD` (FSRS v5 Spaced Repetition)
Manages the memory state for Questions practicing active recall.

- **Collection Path**: `/users/{uid}/spaces/{spaceId}/cards/{cardId}`
- **Primary Key**: `cardId` (UUID v4)
- **Attributes**:
  - `schemaVersion` (`int`, constant `4`)
  - `spaceId` (`string`, required)
  - `questionId` (`string`, required): References `OBJECT.id`.
  - `cardIndex` (`int`, default `0`): Deletion index for cloze cards or prompt index.
  - `state` (`int`, enum `0..3`): Free Spaced Repetition Scheduler state:
    - `0 = New`
    - `1 = Learning`
    - `2 = Review`
    - `3 = Relearning`
  - `due` (`timestamp`, required): Scheduled date/time for the next review.
  - `stability` (`float`, required): Memory stability in days.
  - `difficulty` (`float`, required): Card difficulty rating (1.0 to 10.0).
  - `elapsedDays` (`int`, required): Days since previous review.
  - `scheduledDays` (`int`, required): Days until next scheduled review.
  - `reps` (`int`, default `0`): Total successful reviews completed.
  - `lapses` (`int`, default `0`): Number of times card was forgotten (`rating == 1`).
  - `lastReview` (`timestamp`, optional): Timestamp of the last review.
  - `stateVersion` (`int`, default `1`): OCC version counter to prevent concurrent review overwrites.
  - `updatedAt` (`timestamp`).

---

### 3.4 `ATTEMPT` (Immutable Practice Log, `INV-11`)
Provides an append-only audit trail of every practice event.

- **Collection Path**: `/users/{uid}/spaces/{spaceId}/attempts/{attemptId}`
- **Primary Key**: `attemptId` (UUID v4)
- **Attributes**:
  - `schemaVersion` (`int`, constant `4`)
  - `spaceId` (`string`, required)
  - `questionId` (`string`, required): References `OBJECT.id`.
  - `cardId` (`string`, required): References `CARD.id`.
  - `rating` (`int`, enum `1..4`):
    - `1 = Forgot / Again`
    - `2 = Hard / Earlier`
    - `3 = Good / Normal`
    - `4 = Easy / Later`
  - `reviewMode` (`string`, enum `"review" | "mockExam"`): Practice context.
  - `elapsedMilliseconds` (`int`, required): Active time spent answering.
  - `userConfidence` (`string`, optional, enum `"guessed" | "uncertain" | "confident"`).
  - `fsrsSnapshot` (`map`): Complete Card scheduling state before the transition (`{ state, due, stability, difficulty, reps, lapses, lastReview }`). Together with `rating` and `reviewedAt` this is enough to replay history and recompute schedules or switch algorithms (`INV-11`).
  - `questionType` (`string`, optional): The Question `type` at submission time (`single-choice`, `multiple-choice`, `true-false`, `fill-blank`, `dropdown`, `matching`, `ordering`, `drag-and-drop`, `hotspot`, `matrix`, `simulation`, `case-study`). Absent on attempts written before [ADR 0018](./docs/adr/0018-unified-question-type-system.md).
  - `submittedAnswer` (`map`, optional): The answer that was sent, as `{ type, value }`; `value` is a string, a list of ids, or a map of ids according to `type`.
  - `isCorrect` (`boolean`, optional): Whether the submitted answer matched the key. `rating` stays `3` for correct and `1` for incorrect.
  - `reviewedAt` (`timestamp`, immutable): Exact submission time.

---

## 4. Firestore Indexing Specifications

To avoid unindexed full-collection scans and N+1 query amplification, the following composite indexes are defined in `firestore.indexes.json`, which `firebase.json` registers for deployment and the emulator.

Firestore serves queries that combine only equality filters (no `orderBy`) from its automatic single-field indexes via index merging, so those queries need no composite entry.

### 4.1 Relations & Backlinks Query Index
Enables indexed backlink lookups (`targetObjectId ==`, optional `relationType ==`, newest first) for any opened Object:

```json
{
  "collectionGroup": "relations",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "targetObjectId", "order": "ASCENDING" },
    { "fieldPath": "relationType", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}
```

Outgoing-relation lookups (`sourceObjectId ==`, optional `relationType ==`) use equality filters only and are served by single-field index merging; no composite index is required unless an `orderBy` is added.

### 4.2 Study Queue Priority Index
Enables efficient retrieval of due cards ordered by due date without in-memory filtering:

```json
{
  "collectionGroup": "cards",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "state", "order": "ASCENDING" },
    { "fieldPath": "due", "order": "ASCENDING" }
  ]
}
```

### 4.3 Attempt Analytics Index
Enables fast calculation of retention rates and lapse counts per question:

```json
{
  "collectionGroup": "attempts",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "questionId", "order": "ASCENDING" },
    { "fieldPath": "reviewedAt", "order": "DESCENDING" }
  ]
}
```

### 4.4 Exam Question Feed Index
Enables the ordered exam feed (`objectTypeId == "question"`, `properties.examId ==`, ascending `properties.orderIndex`) read by `useExamList`:

```json
{
  "collectionGroup": "objects",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "objectTypeId", "order": "ASCENDING" },
    { "fieldPath": "properties.examId", "order": "ASCENDING" },
    { "fieldPath": "properties.orderIndex", "order": "ASCENDING" }
  ]
}
```

---

## 5. Architectural Integrity & Security Rules

1. **Client Read/Write Policy**:
   - Clients interact with Firestore through the Firebase Web SDK (version owned by `package.json`) configured with `persistentLocalCache` and multi-tab synchronization ([ADR 0013](./docs/adr/0013-adopt-native-firebase-firestore-with-persistent-local-cache.md)).
   - `firestore.rules` enforces that users can only read and write documents where `/users/{uid}/...` matches their authenticated `request.auth.uid`.
   - Current `firestore.rules` grants the owner read and delete over `/users/{uid}/**`. Creates and updates are validated per collection: `spaces` (shape and `stateVersion`), and under a space `objects`, `relations`, `cards` and `attempts` (required fields, types, enums, `spaceId`, `schemaVersion == 4`, and a parent space that exists). `stateVersion` increments are enforced for `objects` and `cards`, and `attempts` have no update rule (`INV-11`). Collections without a documented schema (`objectTypes`, `templates`, `views`, `inbox`) are not writable until their rules are added. Rules do not yet check the Object extension fields (Concept, Question, Source, Highlight), the `content` AST depth, or that an Attempt's `cardId`/`questionId` reference existing documents.
2. **Concurrency & Atomicity Invariants**:
   - Firestore `runTransaction` requires a server round-trip and does not run while the client is offline, which conflicts with the offline-first goal of ADR 0013. Offline-capable mutations must use `updateDoc` / `writeBatch`, which apply to the local cache immediately and sync later.
   - Optimistic concurrency on `ObjectRecord` and `CardRecord` is therefore enforced by `firestore.rules` (`request.resource.data.stateVersion == resource.data.stateVersion + 1`), so a stale queued write is rejected on sync. Client code increments `stateVersion` on every update.
   - Multi-document changes (Object plus its Relations, Concept arrays, or Dependents) go in a single `writeBatch` (max 500 writes) so they commit atomically.
   - Deleting an Object cascades to its `Dependent` entities (Highlights, Attempts) and sets `deletedAt` on its Relations. Deleting a Question is the only permitted deletion of its Attempts (`INV-11`).
