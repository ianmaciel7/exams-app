Progress bars show how far the person is through a mock exam, a deck or a daily goal. The track is 8px high, pill radius, `surface-card` fill with a 1px `border-strong` outline; the fill is `primary` (or `accent-teal` for goals reached). A text label with the value ("34 of 60") is always shown beside or above the bar.

**States.** Default, complete (teal fill and a check), indeterminate (loading, animated unless reduced motion is on) and segmented (one segment per question, used in the exam header).

**Accessibility.** `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and `aria-label`; indeterminate omits `aria-valuenow`. The value is also written as text, so the color is never the only cue.

**Consumer provides** value, maximum and label.
