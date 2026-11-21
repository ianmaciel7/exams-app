Textareas collect multi-line text such as notes on a question or an explanation. Same skin as Input: 8px radius, 1px `border-strong` outline, 10px by 14px padding, body-md type, minimum height 96px, vertical resize only.

**States.** Default, hover (`surface-soft`), focus (coral border plus `shadow-focus`), disabled, error (`error` border, icon and message) and read-only (no border, `surface-card`).

**Accessibility.** A visible `label`; helper and counter text are linked with `aria-describedby`; errors use `aria-invalid="true"` and an inline message, never color alone. The character counter is not announced on every key.

**Consumer provides** label, value, limit and validation.
