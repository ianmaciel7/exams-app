Tabs switch between related views in the same page without leaving it, such as "Questions", "Notes" and "Discussion". The tab system has four variants that share one behavior.

**Variants.**
- **Line** (default): tabs on a hairline baseline; the selected tab has `ink` text and a 2px `ink` underline, others `muted`. Padding 10px by 16px, nav-link type.
- **Segmented**: the control on claude.com pricing (Individual, Team & Enterprise, API): a rounded track (12px radius, `surface-soft`, hairline, 4px padding) with a `surface-raised` selected segment (8px radius, hairline ring and a faint 1px shadow).
- **Nav pills**: the top navigation of the Claude Platform docs: 36px tabs with an 8px radius; the selected one fills `surface-cream-strong` with `ink` text, others `muted`. Use to switch between sibling sections.
- **Vertical**: a 200px column of tabs at the left of the panel for settings and long sections; the selected tab has `surface-card` fill and a 2px `ink` bar on its inner edge, plus bold text.
- **With icon and counter**: a 16px line icon before the label and a count pill after it (for example "Due 24"). The count is part of the accessible name.
- **Scrollable**: when tabs do not fit (mobile), the list scrolls horizontally with `overflow-x:auto`, hidden scrollbar, and a faded edge; the selected tab scrolls into view. Never wrap tabs on two lines.

**States.** Default, hover (`ink` text, `surface-soft` fill on pills), selected, focus (2px coral outline, inset), disabled (`muted-soft` text and `aria-disabled`, still reachable by arrows is optional; here it is skipped).

**Keyboard.** One tab stop for the list (roving tabindex: the selected tab has `tabindex="0"`, others `-1`). Left and Right arrows (Up and Down when vertical) move and wrap; Home and End jump to first and last; activation follows focus (automatic) unless a panel is slow to load, then Enter or Space activates (manual). Tab moves into the panel.

**Accessibility.** `role="tablist"` with `aria-label` (and `aria-orientation="vertical"` for vertical), `role="tab"` with `aria-selected` and `aria-controls`, and `role="tabpanel"` with `aria-labelledby` and `tabindex="0"` when it holds no focusable content. Compare CategoryTab, which filters a grid and has no panels.

**Consumer provides** the labels, counts, icons and panels.
