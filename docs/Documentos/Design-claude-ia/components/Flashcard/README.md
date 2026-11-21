Flashcards present a prompt on the front and the answer on the back for spaced repetition. 12px radius, 32px padding, minimum height 200px, `surface-card` for the front and `canvas` with a hairline border for the back so the two faces are told apart by more than color; a face label ("Front", "Back") is always visible in caption-uppercase. Content is display-sm serif for short prompts and body-md for long ones. A "Show answer" button flips it; the rating buttons then appear (see RatingButtons).

**States.** Front, back, focus (2px coral outline) and flipped-with-animation (a 150ms fade; with reduced motion no animation).

**Accessibility.** Do not rely on a visual flip: the card is a region with `aria-live="polite"` and the answer is added to the DOM on reveal. Space or Enter shows the answer; number keys 1 to 4 rate. Tags and the deck name are plain text.

**Consumer provides** the front, back and deck.
