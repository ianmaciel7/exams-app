Tooltips give a short label or hint for a control on hover and focus, mostly for icon buttons. `surface-dark` fill with `on-dark` text at 13px/500, 6px radius, 6px by 10px padding, maximum 240px, a 6px arrow and a hairline edge so it stays visible on dark canvas.

**States.** Hidden, visible after 300ms hover or on keyboard focus, and dismissed by Escape or blur. Never put essential information or interactive content in a tooltip.

**Accessibility.** The trigger references the tooltip through `aria-describedby`; the tip has `role="tooltip"`. Content must also be reachable without hover (touch has none), so use visible text for anything required.

**Consumer provides** the text and placement.
