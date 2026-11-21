Banners keep an important message visible until the issue is resolved or dismissed, for example "Offline: answers will sync later". Full-width inside the container, 12px radius, 16px padding, a soft fill (`info-soft`, `success-soft`, `warning-soft`, `error-soft`), `ink` text, an icon and a bold lead. An optional action is a text link or small button; the dismiss button is 36px.

**Variants.** Info (teal tint), success, warning and error. Neutral announcements use Toast instead. Do not stack more than one banner per page.

**Accessibility.** `role="alert"` for errors and warnings that appear after load; `role="status"` for info and success; static banners present at load need no role. Contrast between `ink` and each soft fill is above 4.5:1 in both themes; the icon and the word carry the meaning, not the tint.

**Consumer provides** message, variant, action and dismiss handler.
