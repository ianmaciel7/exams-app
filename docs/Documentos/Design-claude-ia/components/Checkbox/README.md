Checkboxes let the person toggle independent options on or off, or select rows in a table. The box is 20px with a 4px radius and a 1.5px `border-strong` outline; checked and indeterminate fill with `primary` and a white mark.

**States.** Unchecked, checked, indeterminate, hover (`surface-soft` halo), focus (2px coral outline), disabled (`primary-disabled`) and error (`error` border and helper text).

**Accessibility.** Use a real `input type="checkbox"` with a `label`; the label is clickable and 24px high at least. Indeterminate is set through the `indeterminate` property and exposed as `aria-checked="mixed"`. Never rely on color alone: the mark changes shape.

**Consumer provides** the label and checked state.
