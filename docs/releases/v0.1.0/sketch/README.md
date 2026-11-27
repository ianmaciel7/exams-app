# Sketch — v0.1.0

> **Historical baseline — scope reset 2026-11-26.** This artifact is preserved for reference. No feature or design in it is currently assigned to the new v0.1.0 scope. See the [release index](../README.md) and [Ideas Board](../../../boards/overview/).

## Purpose and status

Explore the multi-screen desktop layouts and core workspace for Exam App v0.1.0: composition, hierarchy, unified competition-centric navigation, and the visual states necessary to validate the stage hypotheses. This is an editable low-fidelity Open Artifact sketch adhering to stage-appropriate abstraction, not a high-fidelity mockup or working prototype. Progress: In progress. User review, usability and functional validation remain pending.

Source of truth: [release decisions](../product/product.md#current-release-baseline), [stage responsibilities](../../../../AGENTS.md#stage-responsibilities-and-fidelity-boundaries), [IA](../information-architecture/), [screen inventory](../screen-inventory/) and [user flows](../user-flows/).

## Multi-screen sketch layout

The sketch encompasses the core application screens and surfaces, organized in a clean, natural left-to-right progression with 250px spacing between frames, sharing an identical app shell and unified sidebar:

1. **Screen 1: Home (Entry Point & Competition Selection)** (x: 100 to 1500, y: 100 to 1100): Personal study dashboard displaying active competition cards (DATAPREV, PPSA) with start/resume practice buttons, quick progress summary card (accuracy, solved questions, mocks), and recent activity list.
2. **Screen 2: Questions Workspace (Active Competition Practice)** (x: 1750 to 3150, y: 100 to 1100): Primary study workspace within the selected active competition (DATAPREV). Contains competition heading, Mock exams entry button, kebab menu, question card with metadata link affordances, abstract question strokes, 5 lettered options (A-E), Verify button, and correctness feedback.
3. **Screen 2.B: Questions with Collapsed Rail (Focus Practice)** (x: 3400 to 4800, y: 100 to 1100): 70px icon rail maximizing reading workspace width to 1330px while preserving quick competition switching via icon anchors (DATAPREV, PPSA), search, and the rail expansion toggle.
4. **Screen 3: Mock Exam (Setup Dialog & Timed Focus Session)** (x: 5050 to 6450, y: 100 to 1100): Comprehensive assessment flow showing both the 3.A Setup Modal dialog overlay (scope, questions count, timer limit, start/cancel controls) and the 3.B Timed Focus Session workspace with distraction-free top bar, persistent countdown timer, question card, and 5x10 question navigation palette.
5. **Screen 4: Performance & Analytics (Study Metrics)** (x: 6700 to 8100, y: 100 to 1100): Dedicated analytics workspace presenting overall accuracy summary KPIs, breakdown by subject proficiency, practice vs. mock exam comparison, revision priorities, and attempt history.

## Unified competition-centric sidebar architecture

Across all application screens and states, the sidebar architecture is strictly unified:
- **Header:** Application title (`Exam App`), Search button, and sidebar Collapse toggle.
- **Body:** Strictly contains active competition cards (`DATAPREV` and `PPSA`) acting as a direct competition switcher. Distinct semantic vector icons differentiate institutions (software terminal icon for DATAPREV; executive briefcase icon for PPSA).
- **Navigation Lists:** Zero sidebar navigation lists. Destinations such as `Home`, `Questions`, and `Performance` are conceptual views rather than sidebar navigation list items.
- **Footer:** All unapproved utility and account controls (avatar menu, profile, performance links, theme toggles, status rings, and settings gears) are pruned from the sidebar to preserve consistency and focus.

## Low-fidelity abstract wireframe grammar

The visual grammar adheres strictly to exploratory low-fidelity requirements:
- **Abstract content representation:** Question statements, reading passages, and option choices use abstract horizontal strokes to avoid premature content commitment while preserving visual weight and rhythm.
- **Provenance and link affordances:** Metadata items (ID, discipline, topic, year, board, organization, exam) use underlined blue semantic strokes to signify clickable link affordances without asserting production visual tokens.
- **Hand-drawn vector icons:** All interface iconography is constructed using native hand-drawn vector primitives (strokes, rectangles, paths). Decorative emojis, pseudo-emoji unicode symbols (such as bracketed symbols or glyphs), and icon font text characters are strictly prohibited.
- **Native external sticky notes:** Rationale, stage boundaries, and open questions are documented exclusively via native yellow sticky note elements (`type: "note"`) placed comfortably outside interface bounding boxes (150px to 250px whitespace gap) rather than decomposing notes into disjointed text elements.
- **Sketch ink styling:** A shared, deterministic project-local viewer pass (`scripts/marker-sketch-ink.mjs`) styles visible strokes with consistent hand-drawn characteristics. Original geometry remains fully preserved for editing and native Open Artifact export.
- **Element budget:** The board stays comfortably within the Open Artifact v0.16.3 budget limit (< 800 elements).

## Verification

Open via `node scripts/open-boards.mjs`. Validate schema and integrity via `node scripts/check-boards.mjs` and run the test suite via `node --test scripts/check-boards.test.mjs scripts/marker-sketch.test.mjs scripts/marker-sketch-ink.test.mjs`. Inspect real browser captures in Light and Dark themes to verify stroke coverage, icon styling, and spatial composition.
