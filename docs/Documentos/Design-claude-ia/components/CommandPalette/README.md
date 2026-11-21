The command palette searches and jumps to anything (exams, questions, notes, actions) from the keyboard, opened with Ctrl or Cmd plus K. A 560px dialog on `canvas` with hairline border, 12px radius and `shadow-popover` over the `overlay` scrim. Search input on top (no visible border, hairline divider below), grouped results with caption-uppercase headings, the active row on `surface-card`, shortcuts in `muted` mono.

**States.** Empty (recent items), typing, results, no results (EmptyState text), active row and loading (Skeleton rows).

**Accessibility.** `role="dialog"` with a labelled combobox pattern: input `role="combobox"`, results `role="listbox"` with `aria-activedescendant`. Escape closes and restores focus; the match is highlighted with weight, not color alone.

**Consumer provides** the commands, search and navigation handlers.
