Dropdown menus offer a short list of actions from a trigger, for example "More" on a question. The panel is `canvas` with a hairline border, 8px radius, 4px padding and `shadow-popover`; items are 36px high. Destructive items use `error` text; disabled items use `muted-soft`; keyboard hints use `muted`. Dividers are `hairline-soft`.

**States.** Item default, hover or keyboard highlight (`surface-card`), focus, disabled, destructive. The trigger shows `aria-expanded`.

**Accessibility.** `role="menu"` with `role="menuitem"`; opens on click or Enter, arrow keys move, type-ahead jumps, Escape closes and returns focus to the trigger. Not for navigation (use Sidebar) and not for form values (use Select).

**Consumer provides** items and handlers.
