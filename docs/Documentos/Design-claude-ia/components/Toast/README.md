Toasts confirm an action or report a background result without interrupting the task, for example "Answer saved" or "Sync failed". 360px wide, floating bottom-center on mobile and bottom-right on desktop, 12px radius, 16px padding, `shadow-popover`. Variants: neutral (`surface-dark`, `on-dark`), success, info and error (soft fills with `ink` text). Every variant has an icon and a word, not only a color. An optional action ("Undo") is a text button.

**Behavior.** Auto-dismisses after 5s (8s with an action), pauses on hover and focus, can be closed, and stacks at most three. Errors that need action should be a Banner, not a toast.

**Accessibility.** `role="status"` (polite) for neutral and success; `role="alert"` for errors. Do not move focus. Respect reduced motion.

**Consumer provides** message, variant and optional action.
