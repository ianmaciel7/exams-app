Rating buttons let the person grade how well they remembered a card (Again, Hard, Good, Easy), which sets the next review date in spaced repetition. Four buttons in a row, 56px high, 8px radius; each shows the label in 14px/500 and, below it, the next interval in caption `muted` ("&lt;1 min", "6 min", "1 day", "4 days"). Good is the primary (`primary` fill); the others use `border-strong` outlines. Again uses `error` text on the label, always with the word.

**States.** Default, hover (`surface-soft`), pressed, focus (2px coral outline), disabled until the answer is shown. On narrow screens they become a 2x2 grid.

**Accessibility.** Names include the interval ("Good, next review in 1 day"); keyboard shortcuts 1 to 4 are shown in the label and work when no input is focused. Targets are 56px for fast, error-free tapping.

**Consumer provides** the intervals and the rating handler.
