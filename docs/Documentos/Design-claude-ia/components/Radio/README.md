Radios let the person choose exactly one option from a small, always visible set. The control is a 20px circle with a `border-strong` ring; the selected one shows a `primary` fill with a canvas dot. Group them in a `fieldset` with a `legend`.

**States.** Unselected, selected, hover (`surface-soft` halo), focus (2px coral outline), disabled and error. For exam answers use the Question card, which wraps a radio in a full-width option row.

**Accessibility.** Native `input type="radio"` sharing a `name`; arrow keys move selection inside the group; the group has a legend. Hit area is at least 24px.

**Consumer provides** the legend, option labels and value.
