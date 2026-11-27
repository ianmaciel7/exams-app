# Information Architecture — v0.1.0

Current stage: Mid-Fidelity Wireframe — in progress; 21 variants; owner visual approval pending.

One workspace, not 21 destinations. Left sidebar locates competitions; main region contains the vertically scrolling list. First available item selected automatically on entry. Ghost collapse/expand is available across desktop and narrow states, independent of question lifecycle; the collapsed expand icon is hidden at pointer rest and revealed on hover/focus. Collapse preserves selection, page, scroll context and answers. Changing competition or page discards responses.

## Navigation and pagination

Competition label: `Name · Year · Position/exam`; one line with ellipsis on desktop and full name discoverable via focus or hover; phone drawer labels wrap without relying on hover. DATAPREV and PPSA examples are illustrative; PPSA's full position title requires confirmation. No redundant section heading or repeated competition heading in the main region. Ten questions per page; pagination follows the last question and page change resets scroll to top. Previous disabled on first page, Next disabled on last page. The phone footer uses compact previous/current/next specimens for all three boundary positions. No page-size chooser or new route.

## Structural studies

Expanded and collapsed narrow views, closed/open phone drawer, navigation loading/failure and empty sidebar are visual studies of the approved behavior. The phone drawer overlays content; empty navigation displays a message only, and competition-list failure offers manual Retry. Exact breakpoint, data source and implementation details require technical validation. See [screen inventory](../screen-inventory/README.md), [flows](../user-flows/README.md) and [product](../product/README.md).

Historical [Sketch](../sketch/README.md) and [Low-Fidelity](../low-fidelity-wireframe/README.md) remain approved snapshots. The [prior record](https://github.com/ianmaciel7/exams-app/blob/45e695cbdcb450c3851d603eee05aa8f62e066ac/docs/releases/v0.1.0/information-architecture/README.md) preserves earlier geometry and decisions.

## Collapsed navigation and action states

A Ghost sidebar trigger is available across workspace states. On desktop, the collapse icon remains visible while expanded; when collapsed, the expand icon is hidden at pointer rest and revealed on rail/header hover or keyboard focus, without moving the layout. Activation, not hover, expands the sidebar. A visible accessible alternative is required on touch/no-hover devices. Collapse/expand preserves current page, selection, scroll context and answers.

External component studies clarify default, hover and pressed actions, the collapsed hover/focus/no-hover trigger, localized phone geometry and wrapped-option feedback without increasing the 21 workspace variants. No automatic hover expansion or runtime interaction is implied.

## Approved product decisions — 2026-11-27

| Topic | Approved decision |
| --- | --- |
| Question ordering | Original exam order |
| Empty competition list | Message only; no action button |
| Phone sidebar | Overlay drawer |
| Competition list failure | Error and manual Retry |
| Unknown submission outcome | Retain choice and permit safe retry |
| Interface languages | Brazilian Portuguese and English |

The six owner decisions are resolved. Exact responsive breakpoint, competition-list data source, safe-retry implementation and locale selection/default behavior require technical design and prototype validation. Exam-content translation is not implied. The navigation loading treatment remains a visual study. Native visual review, runtime, usability and accessibility validation remain pending.
