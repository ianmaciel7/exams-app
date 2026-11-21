Pagination moves between pages of a long list. Buttons are 36px squares with an 8px radius; the current page uses `surface-cream-strong` fill with `ink` text and weight 600, others are transparent with `ink` text. Previous and Next carry text plus a chevron; at the ends they are disabled.

**States.** Default, hover (`surface-soft`), current, focus (2px coral outline), disabled (`muted-soft` text).

**Accessibility.** `nav aria-label="Pagination"`; the current page has `aria-current="page"`; each button has an accessible name ("Page 3", "Previous page"). Ellipsis is `aria-hidden`. For infinite lists prefer a "Load more" button.

**Consumer provides** page count, current page and handler.
