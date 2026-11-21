Selects let the person pick one option from a short list. The trigger is 40px high with an 8px radius and a `border-strong` outline; the list opens below as a `shadow-popover` panel on `canvas` with a hairline border.

**States.** Default, hover (`surface-soft` fill), focus (coral border plus `shadow-focus`), disabled (`primary-disabled` fill, `muted` text), error (`error` border and helper text) and open. The selected option shows a check and `aria-selected="true"`.

**Accessibility.** The trigger is a `button` with `aria-haspopup="listbox"`, `aria-expanded` and a visible label. Options are `role="option"` inside `role="listbox"`; arrow keys move, Enter selects, Escape closes. Use a native `select` on mobile.

**Consumer provides** the label, options, value and change handler.
