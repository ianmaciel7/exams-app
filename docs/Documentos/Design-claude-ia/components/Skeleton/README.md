Skeletons hold the place of content while it loads, so the layout does not jump. Shapes match the final content: text lines (12px high, last line shorter), a 40px circle for avatars, a 12px-radius block for cards. Fill is `surface-card` with a slow pulse (1.4s, opacity .6 to 1); with reduced motion on it is static.

**Rules.** Use for waits over 300ms; show real content as soon as it arrives; for waits over 10s add a text message. Do not use for errors (use Banner) or empty lists (use EmptyState).

**Accessibility.** The container has `aria-busy="true"` and a polite status text for assistive tech ("Loading questions"); the placeholder shapes are `aria-hidden`.

**Consumer provides** the shape and when loading ends.
