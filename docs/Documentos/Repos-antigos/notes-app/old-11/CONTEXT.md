# Notes App Context

Canonical vocabulary for product and engineering concepts used in code,
documentation, commits, prompts, and review.

This file owns ubiquitous language. Product requirements and decisions belong to the
detailed product specification; architecture belongs to `ARCHITECTURE.md`.

> **Current implementation boundary:** `User` and `Space` are implemented today.
> The remaining product terms below are preserved as future knowledge-workspace
> vocabulary and must not be interpreted as implemented Firestore entities until
> promoted by the current-scope documents.

## Engineering Vocabulary

**Application Shell**  
The structural application frame that provides global layout, typography, viewport,
and theme context.  
_Avoid_: Master Page, App Wrapper

**Theme**  
The visual appearance mode applied across the interface: light, dark, or inherited
from the system preference. Runtime wiring belongs to `ARCHITECTURE.md`.  
_Avoid_: UI Skin, Theme Colorway

**UI Primitive**  
A reusable, domain-neutral interface building block from the shared UI layer. Its
visual semantics belong to `DESIGN.md` and coding rules to `CONVENTIONS.md`.  
_Avoid_: UI Widget, UI Gadget

**Component Story**  
An isolated state/example of a UI component rendered by the component workbench for
visual and interaction verification. Testing policy belongs to `TESTING.md`.  
_Avoid_: Story Mockup, Preview Fixture


## Product Vocabulary

The headings below preserve the vocabulary from former INTENT §4 so historical
references remain understandable while vocabulary has one canonical owner.

Single source of truth for project vocabulary. Format: **UI display name (PT-BR)** · `code_name (EN)`. The UI is localized (`en`, `pt-BR`, `es`; see Locale) and the display names below are the PT-BR ones; code, database, and API use the English name. Use these terms in code, schema, API, and UI; do not create synonyms. When a new term is approved, add it here.

### User and Spaces

**Usu&aacute;rio** · `User`:
Person who uses the app, authenticated via Firebase Authentication (`uid`). Each User has their own Spaces; nothing is shared across Users.  
**Avoid in this product context:** Account (in code), profile, workspace, team

**Space** · `Space`:  
A user-owned, isolated knowledge context. The current implementation persists Space documents under `/users/{uid}/spaces/{spaceId}`, supports creation/listing/switching, and prevents cross-user reads/writes. Future Types, Concepts, Collections, Views, and Objects remain scoped to exactly one Space.  
**Avoid in this product context:** Vault, Workspace, folder, project

**Mover** · `move`:  
Transfers an Object and its Dependents to another Space. Cross-space links are removed. Each Concept tagged on the Object is linked to the Concept of the same name or Synonym in the target Space or, if non-existent, created there without parents. All changes are previewed for confirmation.  
**Avoid in this product context:** copy, migrate, export/import

### Objects and Structure

**Objeto** · `Object`:  
Anything with its own identity in the app: Note, Concept, Highlight, Question, Source, or user-defined Object. Has title, Properties, content, and Links.  
**Avoid in this product context:** item, record, page, card

**Tipo** · `ObjectType`:  
Defines the structure of a set of Objects: their Properties, Templates, and default visualization. Includes built-in app Types (Note, Concept, Highlight, Question, Exam, PDF, Weblink, Video, Audio, Image, File, Table, Daily Note, Chat, Saved query) and user-defined Types (e.g., Book), matching Capacities. The user can convert an Object from one Type to another by mapping Properties.  
**Avoid in this product context:** category, class, database, template

**Campo** · `Property`:  
Structured data field defined on an ObjectType and populated on each Object (text, number, date, select, multi-select, checkbox, URL, relation to another Object). Built-in Types have fixed Properties and accept additional user-defined Properties.  
**Avoid in this product context:** property (in PT-BR UI), attribute, column, field

**Painel de tipo** · `TypeDashboard`:  
Collapsible secondary lateral column adjacent to the space sidebar, displaying the catalog and views for a specific ObjectType (e.g., Exams), matching Capacities' object navigation panel. Allows filtering, sorting, and browsing all Objects of that Type.  
**Avoid in this product context:** dashboard, type home, listing

**Template** · `Template`:  
Initial content and Properties applied when instantiating an Object of a given Type.  
**Avoid in this product context:** model, skeleton

**Dependente** · `Dependent`:  
An entity that lives inside an Object and cannot exist without it (e.g., Highlights belonging to a Source). Accompanies the parent Object on Move, Archive, and Trash. Objects merely linked via Relations are not Dependents.  
**Avoid in this product context:** child, subitem, related

**Arquivar** · `archive`:  
Removes an Object from active circulation without deleting it: leaves Review, Mock Exams, Inbox, and default Views, while retaining content, Links, and history. The recommended path for Questions no longer actively studied.  
**Avoid in this product context:** hide, deactivate, conceal

**Lixeira** · `Trash`:  
Destination for deleted entities along with their Dependents. Retained for 30 days before permanent purging. Deleting a Question also deletes its Attempts.  
**Avoid in this product context:** archive, archived

### Links

**Link** · `Link`:  
Connection from one Object to another, created via `@` or `[[ ]]` in content or via a relation Property, identical to Capacities. Represents a single underlying relation regardless of where it was created.  
**Avoid in this product context:** relation (in UI), connection, reference

**Backlink** · `Backlink`:  
List on an Object's page showing everything that points to it, displaying the text excerpt where the Link appears.  
**Avoid in this product context:** reverse link, references

**Refer&ecirc;ncia de bloco** · `BlockReference`:
Link or embed pointing to a specific block within another Object's content, created with `(( ))`, matching Capacities.  
**Avoid in this product context:** citation, transclusion

**Men&ccedil;&atilde;o n&atilde;o linkada** · `UnlinkedMention`:
Occurrence of an Object's title or Synonym in unlinked text, suggested for conversion into an active Link.  
**Avoid in this product context:** link suggestion

### Sources and Highlights

**Fonte** · `Source`:  
Group of built-in Types representing a raw content origin supporting Highlights: PDF, Weblink, Video, Audio, and Image. Not a single Type itself: each format has its own viewer and specific Properties.  
**Avoid in this product context:** document, material, reference

**Weblink** · `Weblink`:  
Source representing a web page, identified by URL, stored with a saved local snapshot.  
**Avoid in this product context:** link, URL, bookmark, article

**PDF** · `Pdf`:  
Source representing an uploaded PDF document, with a dedicated page reader; Highlights capture text or page regions.  
**Avoid in this product context:** document, file

**Imagem** · `Image`:  
Source representing an uploaded image, reusable across any Object, matching Capacities; Highlights mark image bounding regions.  
**Avoid in this product context:** photo, picture, attachment

**&Aacute;udio** · `Audio`:
Source representing audio media (e.g., podcast, recording) accompanied by transcription; Highlights mark transcript excerpts and timestamps.  
**Avoid in this product context:** podcast (as type), recording

**V&iacute;deo** · `Video`:
Source representing video media (e.g., YouTube) accompanied by transcription; Highlights mark transcript excerpts and timestamps.  
**Avoid in this product context:** lecture, media

**Highlight** · `Highlight`:  
First-class Object, Dependent on a Source, marking an excerpt (text span, PDF region, or video timestamp range). Created by selecting content and clicking to highlight; visible overlaid on the Source and opens as an Object on double-click. User commentary resides directly in the Highlight's content. Always allows jumping back to the source location.  
**Avoid in this product context:** excerpt, annotation, marker

**Extens&atilde;o** · `BrowserExtension`:
Browser extension, identical in function to Readwise Reader: saves pages as Weblinks to the Inbox and allows highlighting text and images directly on external sites, with Highlights appearing in the app.  
**Avoid in this product context:** clipper, web clipper, plugin

### Knowledge

**Conceito** · `Concept`:  
Subject matter the user wants to understand (e.g., OAuth 2.0). Functions as a tag with a dedicated page: can tag any Object, and its page gathers notes written on the topic, custom Properties (by default, Status: Not Started, Learning, Mastered; the user may add others), and everything tagged with it or its descendants. The sole tagging mechanism: separate tags do not exist.  
**Avoid in this product context:** Tag, topic, subject, category, MOC

**Conceito pai / Conceito filho** · `broader` / `narrower`:  
Hierarchical relationship between Concepts (SKOS model): broader is parent, narrower is child. A Concept MAY have multiple parents; cycles MUST NOT occur.  
**Avoid in this product context:** category, folder, subtag

**Conceito relacionado** · `related`:  
Non-hierarchical associative relationship between two Concepts. MUST NOT be used between Concepts already connected hierarchically.  
**Avoid in this product context:** link, connection, associated

**Sin&ocirc;nimo** · `altLabel`:
Alternative label for a Concept, used in search and autocompletion when tagging (e.g., "OAuth2" for "OAuth 2.0").  
**Avoid in this product context:** alias, nickname

**Nota** · `Note`:  
Free-form writing Object, identical to Capacities' Page: title, content, and Concepts, without fixed Properties. To gain custom Properties, it is converted into a user-defined ObjectType.  
**Avoid in this product context:** page, document, annotation

**Arquivo** · `File`:  
Object storing generic uploaded files (e.g., .zip, .docx), matching Capacities' Files, linkable and taggable with Concepts. Does not accept Highlights.  
**Avoid in this product context:** attachment, upload, document

**Tabela** · `Table`:  
Structured data arranged in rows and columns, used inline as a content block or as a standalone Object, matching Capacities.  
**Avoid in this product context:** spreadsheet, grid, database

**Di&aacute;rio** · `DailyNote`:
Object automatically provisioned for each calendar day within a Space, matching Capacities, intended for rapid ephemeral logging.  
**Avoid in this product context:** journal, day note

### Study and Practice

**Exame** · `Exam`:  
Top-level certification assessment object (`objectTypeId: "exam"`), maintaining metadata and an ordered sequence of questions.  
**Avoid in this product context:** certification (as entity), test, course

**Quest&atilde;o** · `Question`:  
Assessment item object (`objectTypeId: "question"`) containing a `type`, prompt, type-specific data, correct answer, and grounded explanation in `properties`, while leaving `content` free for user personal notes.  
**Avoid in this product context:** Flashcard, card, item, exercise

**Tipo de quest&atilde;o** · `QuestionType`:  
Discriminator of a Question (`single-choice`, `multiple-choice`, `true-false`, `fill-blank`, `dropdown`, `matching`, `ordering`, `drag-and-drop`, `hotspot`, `matrix`, `simulation`, `case-study`) that fixes which fields it requires and forbids and which control answers it. An image is an attribute of a Question or option, never a type.  
**Avoid in this product context:** format, kind, image question

**Resposta enviada** · `SubmittedAnswer`:  
The answer a learner sent for a Question, stored with its Attempt as `{ type, value }` and never edited afterward.  
**Avoid in this product context:** user answer, response

**Explica&ccedil;&atilde;o fundamentada** · `GroundedExplanation`:  
Rationale within a Question linking correct choices to official documentation URLs and architectural insights.  
**Avoid in this product context:** commentary, opinion, ungrounded rationale

**Resposta com origem** · `Answer`:  
An answer option or response to a Question tagged with its provenance: official, suggested, community, user, or AI. Community answers can include votes and discussion threads inserted manually or via file; the app does not scrape external sites.  
**Avoid in this product context:** answer key, solution

**Revis&atilde;o** · `Review`:
Spaced memorization mode: the app schedules Questions nearing forgetting (FSRS algorithm). After revealing the answer, the user selects Forgot, Earlier, Normal, or Later, with each button showing the scheduled interval; "Forgot" logs a failure.  
**Avoid in this product context:** study, daily review, flashcards

**Simulado** · `MockExam`:  
Exam simulation mode: Questions filtered by criteria, answered sequentially, optionally timed, with a final score. Configurable formats (default: multiple choice only); open formats without automatic grading are self-assessed.  
**Avoid in this product context:** test, exam, quiz, Simulation

**Tentativa** · `Attempt`:  
Append-only immutable record of each answer submitted to a Question in Review or Mock Exam, including the Submitted Answer and whether it was correct. Forms a single unified history; failing a Question during a Mock Exam accelerates its next Review appearance.  
**Avoid in this product context:** review log, response, history

**Plano de prova** · `ExamPlan`:  
Target exam date configured on an Exam Object or Saved query, matching RemNote's Exam Scheduler. Review mode prioritizes these Questions, paces new items to complete before the deadline, triggers a full review wave in the final days, and alerts if falling behind schedule.  
**Avoid in this product context:** cram, study schedule, syllabus

**Limite di&aacute;rio** · `DailyLimit`:
Upper threshold on new Questions and daily reviews, along with target retention rate (e.g., 90%), matching Anki deck options and FSRS parameters.  
**Avoid in this product context:** goal, quota

**Quest&atilde;o dif&iacute;cil** · `Leech`:
Question automatically flagged after repeated failures (default: 8 "Forgot" ratings), matching Anki leeches. Highlighted on dashboards for reformulation, splitting, or archiving.  
**Avoid in this product context:** leech (in PT-BR UI), problem card

**Painel de progresso** · `ProgressDashboard`:  
Analytics view for the Space: accuracy per Concept (and ancestors), review forecast, Exam Plan pacing, and study streaks.  
**Avoid in this product context:** report, analytics, metrics

### Organization and Views

**Filtro salvo** · `Query`:  
Declarative rules selecting Objects within a Space (by Type, Properties, Concepts, full-text). A first-class Object: can be linked, embedded, and contextualized (e.g., "Questions testing `this`" inside a Concept template).  
**Avoid in this product context:** saved search, smart folder, query (in PT-BR UI)

**Collection** · `Collection`:  
Manually curated grouping of Objects sharing the same Type, identical to Capacities: the user hand-picks each member (e.g., "Questions to review before the exam"). An Object MAY belong to multiple Collections. Viewable in any layout and embeddable within other Objects. Displays on the Type Dashboard. Use Saved queries for rule-based membership; use Collections for curated sets.  
**Avoid in this product context:** folder, list, collection (in code)

**View** · `View`:  
Visual presentation format for a collection of Objects, matching Capacities: Table, Gallery, Wall, List, Kanban, and Embed. Never stores internal state or separate data.  
**Avoid in this product context:** layout, base

**Quadro** · `Whiteboard`:  
Infinite canvas where users position and visually link existing Objects (Heptabase, Obsidian Canvas). Canvas nodes reference real Objects, never detached duplicates.  
**Avoid in this product context:** canvas, board, mural

**Mapa mental** · `MindMap`:  
Visualization mapping an Object's heading outline into a tree structure, toggleable with document text (Brainio).  
**Avoid in this product context:** mind map, diagram, tree

**Grafo local** · `LocalGraph`:  
Visual graph of connections centered on the currently opened Object, matching Capacities. A whole-space global graph is intentionally omitted.  
**Avoid in this product context:** Graph View, full graph, map

**Busca** · `Search`:  
Full-text search across titles, body content, Highlights, indexed PDFs, and web snapshots within the active Space, recognizing Concept Synonyms and filtering by Type and Concept.  
**Avoid in this product context:** find, search (in PT-BR UI)

**Calend&aacute;rio** · `CalendarView`:
View mapping Objects onto dates (Daily Notes, Exam dates, scheduled reviews), matching Notion and Capacities.  
**Avoid in this product context:** schedule, timeline

**Hist&oacute;rico de vers&otilde;es** · `VersionHistory`:
Previous revisions of Object content, enabling comparison and restoration, matching Capacities and Obsidian File Recovery.  
**Avoid in this product context:** backup, snapshot, undo

**Favoritos** · `Pin`:  
Objects, Saved queries, and Views pinned to the sidebar for instant access, matching Obsidian Bookmarks.  
**Avoid in this product context:** star, shortcut, bookmark

**Paleta de comandos** · `CommandPalette`:  
Keyboard-invoked modal (Ctrl/Cmd+K) to navigate to any Object and trigger actions, matching Obsidian, Capacities, and Reader.  
**Avoid in this product context:** quick open, command menu

**Painel lateral** · `SidePanel`:  
Splits the screen to view an Object alongside the active document, with hover previews on Links, matching Capacities, Notion side peek, and Obsidian page preview.  
**Avoid in this product context:** split, popup, modal

### Triage and AI

**Inbox** · `Inbox`:  
Central triage hub for a Space, containing tabs **To read** (saved, unprocessed Sources) and **Pending approval** (agent-generated Objects awaiting review).  
**Avoid in this product context:** incoming, queue, notifications

**Para aprovar** · `pendingApproval`:  
Lifecycle state for an Object created by an agent (MCP or AI) that has not yet been accepted by the user. Excluded from Review, Mock Exams, and graph Links until approved, edited, or rejected. Enabled by default for agents; can be toggled off.  
**Avoid in this product context:** draft, suggestion, pending

**Chat** · `Chat`:  
AI conversation grounded in the current Space or an explicit selection of its Objects. Every response cites specific Objects and source excerpts. Can be saved as a permanent Object, matching Capacities AI Chat.  
**Avoid in this product context:** assistant, bot, copilot

### Internationalization and Locales

**Idioma** · `Locale`:  
The active language/regional preference (`en`, `pt-BR`, `es`) resolved via cookie (`NEXT_LOCALE`), synchronized with client storage and Firebase Auth user preferences, without mutating URL routes.  
**Avoid in this product context:** languageCode, langParam, urlLocale

**Mensagem Localizada** · `LocalizedMessage`:  
A UI display string looked up dynamically from namespace dictionaries (`messages/*.json`) using typed message keys, keeping data schemas and canonical model identifiers in English.  
**Avoid in this product context:** translationKey, translatedSchema, i18nString

---
