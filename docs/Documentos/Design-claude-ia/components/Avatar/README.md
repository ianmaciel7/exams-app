Avatars identify the person with a photo or, when none exists, two initials. Sizes 24, 32 and 40px, always circular (`radius-full`). Initials use title-sm weight on `surface-cream-strong` with `ink` text (never colored fills). An online or "studying now" dot uses `accent-teal` with a canvas ring and a text equivalent. Groups overlap by 8px with a 2px canvas ring and end with a "+N" counter.

**States.** Photo, initials, group, with status, and focus (2px coral outline) when the avatar is a button for the account menu.

**Accessibility.** Photos have `alt` with the name (or empty alt when the name is adjacent); initials use `aria-label` with the full name; status is announced in text ("Online").

**Consumer provides** the name, photo and status.
