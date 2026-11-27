# Whiteboard Guidelines

### Open Artifact Whiteboard Tools & Architecture

Follow [agent access](../agent-access.md) for the pinned v0.17.0 runtime, diagnostics, and the distinction between the native standalone viewer, persistent Shell and static Playground.

All project whiteboards are powered by the Open Artifact Whiteboard runtime, persisted as granular files under `<board-dir>/db/`:
- **Data Persistence Architecture:**
  - `db/board/meta.json`: Core metadata (`id`, `title`, and `order`: an array of element IDs establishing strict layer order and render z-index).
  - `db/board/inks.json`: Palette definitions and custom stroke/fill swatches.
  - `db/elements/<element-id>.json`: One atomic JSON file per element, ensuring fine-grained Git tracking, conflict-free concurrent editing, and easy programmatic manipulation.

- **Available Native Tools & Elements:**
  - **Text (`type: "text"`) and native sticky notes (`type: "note"`):**
    - Properties: `x`, `y`, `text`, `size` (`small`, `body`, `large`, `title`), `color` (hex string).
    - Multi-line & word wrapping: for native text use the version-supported `wrap`/`width` property; for native `note` use `x`, `y`, `w`, `h`, `text`, a supported `color` and optional `tilt`. Do not substitute a free-text element for a native sticky note. Verify the installed schema.
    - Usage: Structural headings, section titles, metadata chips, note callouts, code blocks, and data labels.
  - **Hand-drawn Vector Linework & Pen Tool (`type: "stroke"`):**
    - Properties: `x`, `y`, `points` (flat coordinate array `[x0, y0, x1, y1, ...]` relative to `(x, y)`), `width` (native stroke thickness from 1.0 to 40; use the reusable marker-sketch preset (typically 1.8–3.4) for Sketch boards), `color` (hex string).
    - Usage: Loose paper-sketch polylines, arrows, borders, underline emphasis, dividers, and hand-drawn UI vector icons.
  - **Containers, Frames & Macro-Sections:**
    - Constructed using paired horizontal and vertical strokes (`_frame_t`, `_frame_b`, `_frame_l`, `_frame_r`).
    - Use macro-section frames and concise banners only when they help the owning stage communicate its purpose. A simple Sketch does not require multiple macro-sections, formal banners or specification panels. When a banner is useful, it may contain:
      1. Section tag (e.g. `SECTION 1 · APPLICATION SHELL`, size: `small`, accent color).
      2. Section title (e.g. `Application Workspace & Navigation`, size: `title`).
      3. Section subtitle / description (size: `body`, muted gray).
      4. Header divider stroke separating banner from content.
  - **Hand-Drawn UI Vector Iconography:**
    - Never substitute drawn UI icons with emojis or unicode text symbols.
    - Construct all icons as vector stroke primitives:
      - Terminals: `[> _]` (window outline + prompt chevron + cursor).
      - Briefcases: briefcase (rounded rectangular body + upper handle).
      - Home: home (slanted roof lines + body rectangle).
      - Questions: `[?]` (circle outline + question mark arc + dot).
      - Settings: gear (gear outline with central circular hole).
      - Theme: crescent (crescent moon curve).
      - Status: Segmented dashed circle (6 discrete diagonal arc strokes).
      - Share / Exit: Curved forward arrow with arched tail.
  - **Popover Menus & Elevated Cards:**
    - Enclosing card frame with directional pointer triangle pointing to the triggering anchor (e.g. user avatar).
    - Elevated internal items separated by divider strokes, with icon + text alignment and generous padding.
  - **Connectors, Dividers & Flow Arrows:**
    - Directed polylines connecting steps in user flows or separating structural card regions.

- **Layout, Baselines & Quality Gates:**
  - **Macro-baselines:** Align comparable section headers when multiple sections are actually needed. Do not impose production-level precision or extra section containers on exploratory Sketches.
  - **Padding, breathing room & spacious composition:** Never compress distinct views or artboards (such as an expanded workspace and a collapsed rail) into a single tight bounding box. Maintain generous visual clearance (150px to 250px) between separate states or artboards to prevent spatial congestion. Place external design notes comfortably beneath interfaces with ample margin (80px to 120px).
  - **Token-Efficient Verification & Native CLI Tooling:**
    - Do not launch heavy browser subagents for routine visual inspection or coordinate guessing.
    - Use Open Artifact native CLI commands (`context <dir>` to inspect active viewer viewport and zoom; `comments <dir>` / `wait <dir>` to read canvas comments; `write-db <dir>` for batch atomic mutations).
    - Validate structural and data integrity via `node scripts/check-boards.mjs`.
    - When visual verification is required, prefer Open Artifact native snapshot tools or direct viewer confirmation over multi-turn browser subagent loops.

## Screen and variant layout convention

Arrange distinct screens/destinations vertically, one row per screen. Arrange states, scroll positions, responsive variants and alternative versions of the same screen horizontally within its row. Align the top of comparable artboards and leave clear spacing; do not imply a separate route just because a state has its own artboard. A page's pagination footer at the end of scroll is a horizontal variant of that same page, not a separate destination. Apply this convention to future UI sketch and wireframe boards unless the product owner specifies otherwise.

## Sketch review and evidence

Use the UI/UX Specialist and Impeccable to refine hierarchy, density, and legibility without importing unapproved production features. Keep notes concise and outside application frames, with native comment threads on related external annotations when direct pins obscure controls. Preserve the original review target and open decision. Capture full boards and individual states in Light/Dark from the native runtime; label SHA and any crop. Static images do not prove interactions. Review companion documentation before publishing changes.

## Planning-board spacing

Measure actual native renderer bounds before placing adjacent elements. In the current Open Artifact renderer link cards occupy approximately 320 × 56 canvas units. Use at least 24 units between link cards and 12 units between a card and its supporting caption; the Project Hub uses a 112-unit row cadence. Keep board navigation in its own region outside headings and descriptions. Use the content's actual height for native notes, with enough breathing room and no clipping. These are project-specific board layout values, not application UI tokens. Check both themes and capture views before claiming visual approval.

## Fidelity boundary and review evidence

For each board record the stage-specific question, inherited decisions, new evidence, representative scenarios, review findings and exit criterion. Reuse composition, not entire state matrices by default. Separate supporting component studies from workspace variants; keep coverage in the inventory. Preserve approved historical snapshots and distinguish structural, visual and functional verification. See the evidence-based progression gate in [AGENTS.md](../../AGENTS.md).
