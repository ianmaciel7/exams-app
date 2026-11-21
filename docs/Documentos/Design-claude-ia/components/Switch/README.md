Switches turn a single setting on or off with immediate effect, for example "Show timer" or "Daily reminder". The track is 40x24px with a pill radius; on uses `primary`, off uses `surface-cream-strong` with a `border-strong` outline. The thumb is `canvas` and always shows an outline.

**States.** Off, on, hover (`surface-soft` halo), focus (2px coral outline) and disabled. Use a checkbox instead when the change needs a Save button.

**Accessibility.** `input type="checkbox" role="switch"` with a visible label; the state is also stated in text where it matters ("On"). Space toggles.

**Consumer provides** the label and state.
