Tables compare structured records such as exam history, scores per topic or a question bank. Header cells use caption type in `muted` on `surface-soft` with a hairline bottom border; rows are 48px with hairline-soft dividers; numbers are right-aligned in tabular figures. No zebra stripes. Wrap in a horizontal scroll container on small screens and keep the first column sticky.

**States.** Row hover (`surface-soft`), selected (`surface-card` plus a checked checkbox), focus on interactive cells (2px coral outline), sorted column (header text `ink` plus an arrow; `aria-sort`), empty (EmptyState inside) and loading (Skeleton rows).

**Accessibility.** A real `table` with `caption`, `th scope`, `aria-sort` on the sorted header, and status written as text in a Badge, never color alone.

**Consumer provides** columns, rows, sorting and selection.
