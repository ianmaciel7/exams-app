The question navigator shows every question of an exam as a numbered grid so the person can jump and see status at a glance. Cells are 36px squares with an 8px radius in a wrapping grid (6 to 10 per row), number in 14px/500 tabular. Status uses shape plus text, not color alone: unanswered (outline), answered (`surface-cream-strong` fill), flagged (corner flag icon and the word in the accessible name), current (2px `ink` border) and, after review, correct and incorrect (soft fills with ✓ or ✕).

**Layout.** A side panel on desktop, a bottom sheet on mobile. A legend under the grid explains every state, and a summary line says "34 answered, 3 flagged, 23 left".

**Accessibility.** Each cell is a button with a name such as "Question 7, flagged, answered"; the current one has `aria-current="true"`. The grid is a list, arrow keys move between cells.

**Consumer provides** the status per question and the jump handler.
