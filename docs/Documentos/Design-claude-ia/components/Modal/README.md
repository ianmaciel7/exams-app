Modals ask for a decision or short input and block the page behind them, for example "Finish exam?". The dialog is `canvas`, 12px radius, 32px padding, up to 480px wide, with `shadow-popover` over the `overlay` scrim. Title in display-sm serif, body in body-md, actions right-aligned: secondary left, primary right. A close button (36px) sits top right.

**States.** Default, destructive (primary button uses `error` fill and the title says what is lost), loading action (button disabled with text "Saving…").

**Accessibility.** `role="dialog"` (or `alertdialog` for destructive) with `aria-modal="true"`, `aria-labelledby` and `aria-describedby`. Focus moves inside on open, is trapped, Escape closes, and focus returns to the trigger. The page behind is inert. Use sparingly; prefer inline confirmation when possible.

**Consumer provides** title, content and actions.
