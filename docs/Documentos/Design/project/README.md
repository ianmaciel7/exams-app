A calm, plain study tool for competitive exams (concursos) and IT certifications: question practice, mock exams, spaced review, PDF reading and notes. The interface stays out of the way of the question; color is spent on meaning (selected, correct, incorrect, marked), not decoration.

## Content fundamentals

- Write in English, in sentence case: "Spaced review", "Mock exams", not "Spaced Review".
- Address the learner as "you"; the app never says "I" or "we".
- Short, literal labels that name the action: "Check answer", "Next question", "Mark for review". No exclamation marks, no emoji.
- Describe a feature by what it does for the learner, as the board does: "Review missed or marked questions on a schedule." "Find questions by topic, exam and status."
- Results state the fact first: "Incorrect. The answer is C." Never "Oops!" or "Great job!".
- Never copy a reference product's logo, brand, wording or questions.

## Visual foundations

**Color.** Neutral first. Page on `bg`; panels and question cards on `surface` with a `border` hairline and `radius-lg`; cards nested in a panel go back to `bg` with `radius-md`. Body copy in `text`, secondary copy in `muted`. `accent` is the only hue in idle UI: primary actions, links, tags, progress and the learner's selected option before it is checked. Text on an `accent` fill uses `on-accent`.

**Answer states.** After an answer is checked, the right option takes `correct` (border and icon) on `correct-subtle`; the learner's wrong pick takes `incorrect` on `incorrect-subtle`. `correct` is a bluish green and `incorrect` an orange, but they have similar lightness, so every state also carries an icon and a word ("Correct", "Incorrect", "Marked"). Never rely on color alone. Questions flagged for review use `marked` on `marked-subtle`.

**Borders.** `border` is a decorative hairline (below 3:1) for panels and cards only. Anything the learner operates (answer options, inputs, checkboxes, secondary buttons) gets `border-strong`, which meets 3:1 on `bg` and `surface` in both themes.

**Focus.** Every interactive element shows a 2px solid `focus-ring` outline at a 2px offset. Never remove it.

**Type.** One family, the system UI stack (`sans`); no web fonts to load. `title` once per screen, `heading` for sections, `question` for stems and answer text, `body` for explanations, `body-sm` in `muted` for descriptions, `label` uppercase in `muted` for group headings, `caption` for tags and the timer.

**Spacing and layout.** Spacing comes from four steps: `space-1` 8px, `space-2` 12px, `space-3` 16px, `space-4` 32px. Content sits in a centered column up to 1000px wide with `space-3` gutters and `space-4` top padding. Reading text is capped near 68 characters per line. Grids collapse to one column below 720px.

**Shape and depth.** Radii are `radius-md` (cards, options, buttons), `radius-lg` (panels) and `radius-pill` (tags, progress). Surfaces are flat: separation comes from `bg`/`surface` contrast and hairlines, not shadows. No gradients.

**Themes.** Light and dark are both first-class and follow the system setting. In dark, `accent` lightens, so fills of it take dark `on-accent` text.

**Motion.** Minimal and functional: state changes may fade in under 150ms; respect reduced motion.

## Iconography

No icon set has been chosen yet. Until one is, use a single outline set at 20px with a 1.5px stroke, inheriting the text color; state icons (check, cross, flag) take the state color. The components draw three placeholder icons in that style (check for correct, cross for incorrect, flag for marked); replace them when a set is chosen.

## Components

Build practice screens from `QuestionCard`, which holds `AnswerOption`s and, after checking, a `ResultBanner` plus `Button`s in its footer. Use `ProgressBar` above the card in sessions and mock exams. Lists of exams, topics and roadmap items use `Card` inside a `surface` panel, labelled with `Tag`. No emoji. There is no logo: set the name "Exam App" in `title` type.
