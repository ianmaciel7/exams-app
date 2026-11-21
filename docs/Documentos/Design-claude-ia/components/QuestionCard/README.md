The question card is the core of the app: one exam question with its answer options and actions. Container is `canvas` with a hairline border, 12px radius and 32px padding. Header: "Question 12 of 60" in caption, topic Badge, and a flag button. Statement in body-md (title-sm for the lead), then options as full-width rows (48px at least, 8px radius, 1px `border-strong`), radio on the left. Footer: secondary "Flag for review" and primary "Check answer".

**Option states.** Default, hover (`surface-soft`), focus (2px coral outline), selected (`surface-cream-strong` fill, `ink` border 2px), correct (`success-soft` fill, check icon, "Correct"), incorrect (`error-soft` fill, cross icon, "Incorrect"), disabled after submission. Feedback is always text plus icon, never color alone.

**Accessibility.** `fieldset` with the statement as `legend`, native radios (or checkboxes for multi-answer, and the statement says "Select two"). After checking, a polite live region announces the result and the explanation panel receives focus on request.

**Consumer provides** the statement, options, correct answer and explanation.
