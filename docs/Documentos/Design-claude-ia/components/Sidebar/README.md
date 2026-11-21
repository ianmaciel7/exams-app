The sidebar is the primary navigation of the app on desktop: a collapsible, resizable column with the space switcher, search, collapsible sections (pinned, study, readings, contests as a tree), rows with hover actions, and a drawer on mobile. Visual language follows the Claude Platform docs navigation: no icons per row, section headings in title-sm weight 600 (sentence case), 14px rows, the active row filled with `surface-cream-strong`, hover `surface-card`, hairline edge and a search field with a Ctrl K hint.

**States.**
- **Open** (default 240px, resizable 160 to 360px) and **collapsed** (0px, off-canvas). Collapsing is persisted on desktop only.
- **Peek**: while collapsed, hovering the toggle or the left edge (300ms dwell to open, 150ms to close) or focusing it shows the sidebar as a floating `surface-raised` overlay with `shadow-popover`; it is dismissed by Esc or an outside press and never pins or saves the state. `open`, `peek` and `mobileOpen` are three separate states.
- **Resize**: drag the divider; dragging below 160px collapses. The divider is a `separator` with `aria-valuemin`, `aria-valuemax`, `aria-valuenow`; keys Left and Right change the width by 16px, Home and End jump to 160 and 360.
- **Sections** collapse with `aria-expanded`; tree rows (contest, edition, role) indent 14px per level and expand with a chevron. Each nested row owns its own hover, active and focus highlight, so a parent heading and its children never compete.
- **Row actions** (pin, more) appear on the row's own hover or focus, reserve their gutter so the label does not reflow, and the active row has `aria-current="page"`; counters carry hidden text ("pendentes").
- **Mobile** (under 768px): modal drawer, up to 300px or 86% of the screen, with a scrim; focus moves in, returns to the opener, Esc closes; the drawer state is never persisted.

**Keyboard.** `Ctrl B` (⌘ B on macOS) or `[` toggles; `Esc` closes peek or drawer; single-key shortcuts are ignored in editable fields and during IME composition.

**Accessibility.** `aside` named "Principal" with a `nav`; heading buttons are real buttons with `aria-expanded`; focus ring 2px coral inset; do not make an icon-only rail the default (the source spec warns it harms discoverability).

**Origin.**
- `notes-app`, branch `old-10`: `src/components/space-frame.tsx` (the live sidebar: collapsed, peek timers 300ms and 150ms, drag resize, keyboard resize, `[` shortcut, nested groups `navGroups`, mobile drawer focus handling), `src/domain/sidebar.ts` (160, 360, 240, step 16, cookies `sidebar_state` and `sidebar_width`, 7 days), `spec.md` sections 5.4 and 9.16 (Fluid Functionalism reference behavior, adopted as a contract). `src/components/ui/sidebar.tsx` exists but is an unused shadcn scaffold.
- `exams-app-antigo-2`, branch `dev`: `prototype/exam-app-0.1.1__index.html` (`.side` 284px, `.app.collapsed .side` off-canvas, `toggleSide`, `setCollapsed`, resizer `srz`, mobile `.side` fixed 300px or 86vw, sections `secHead` and `closedSecs`, tree `treeNode` with concurso, edição and cargo, pins, `Mod+B`), `DESIGN.md` section 5.
- Not found: the `old-2`, `old-4` and `old-5` sidebar parity specs cited by `spec.md` were not recovered (those branches are not in the copy), and the context-panel (right panel) is not part of this component.

**Consumer provides** the sections, items, routes, counters and persistence.
