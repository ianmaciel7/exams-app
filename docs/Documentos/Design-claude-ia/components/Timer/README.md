The timer shows the time left (or elapsed) in a mock exam. JetBrains Mono at 20px/500 with tabular figures, in a pill with `surface-card` fill and a clock icon; the label "Time left" is visible. Thresholds change the surface and add text: under 10 minutes `warning-soft` and "10 min left", under 1 minute `error-soft` with "Under 1 min", and the pill never flashes. Paused shows "Paused" and dims the questions.

**States.** Running, warning, critical, paused, expired ("Time is up").

**Accessibility.** `role="timer"` with `aria-live="off"`; do not announce every second. Announce at fixed marks (10 min, 5 min, 1 min) through a separate polite `status`. Offer a setting to hide the timer for people with anxiety or time-pressure needs, and extended time options in the exam settings.

**Consumer provides** the remaining seconds and the thresholds.
