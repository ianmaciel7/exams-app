Breadcrumbs show where the current page sits, for example Exams / Microsoft / AZ-900 / Questions. Items use body-sm type in `muted`; links turn `ink` on hover with an underline; the current page is `ink` at weight 500 and is not a link. Separators are a slash in `muted-soft` and hidden from assistive tech.

**States.** Default link, hover, focus (2px coral outline), current. Long trails collapse the middle items into an ellipsis menu on narrow screens.

**Accessibility.** `nav aria-label="Breadcrumb"` containing an ordered list; the current item has `aria-current="page"`.

**Consumer provides** the trail and routes.
