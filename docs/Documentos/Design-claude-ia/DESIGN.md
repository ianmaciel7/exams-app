# Exams App Design System (DESIGN.md)

Unofficial design extraction (see README for origin). Cream canvas, one coral accent, serif display, dark showcase bands.

## Colors
- `primary` #cc785c: Signature coral. Primary CTAs, text links and full-bleed callout bands only.
- `primary-active` #a9583e: Pressed or darker coral state of primary.
- `primary-disabled` #e6dfd8: Desaturated cream-tinted disabled fill. Same value as hairline.
- `accent-teal` #5db8a6: Sparing secondary accent: status dots, connection indicators.
- `accent-amber` #e8a55a: Companion warm tone for category badges and highlights.
- `canvas` #faf9f5: Default page background. Tinted cream, never pure white.
- `surface-soft` #f5f0e8: Section dividers and soft bands.
- `surface-card` #efe9de: Feature and content card background.
- `surface-cream-strong` #e8e0d2: Selected tabs and emphasized bands.
- `surface-dark` #181715: Warm near-black. Code mockups, showcase cards, footer.
- `surface-dark-elevated` #252320: Raised panels inside dark areas.
- `surface-dark-soft` #1f1e1b: Code block fill inside larger dark cards.
- `hairline` #e6dfd8: 1px borders on cream surfaces.
- `hairline-soft` #ebe6df: Faint dividers inside a band.
- `ink` #141413: Headlines and primary text on canvas.
- `body-strong` #252523: Lead paragraphs and emphasis.
- `body` #3d3d3a: Default running text.
- `muted` #6c6a64: Subheadings, breadcrumbs. Use on canvas only.
- `muted-soft` #8e8b82: Captions, fine print, line numbers. Below 4.5:1 on canvas: decorative or large text only.
- `on-primary` #ffffff: Text on coral. About 3.4:1 on primary: use at 14px/500 or larger in buttons, never for small body text.
- `on-dark` #faf9f5: Text on dark surfaces.
- `on-dark-soft` #a09d96: Footer body and secondary dark labels.
- `success` #5db872: Available and status indicators.
- `warning` #d4a017: Rare warning callouts.
- `error` #c64545: Validation errors.

## Typography
- serif: Copernicus, "Tiempos Headline", "Cormorant Garamond", Garamond, "Times New Roman", serif
- sans: StyreneB, Inter, system-ui, sans-serif
- mono: "JetBrains Mono", ui-monospace, monospace
- `display-xl` (serif) 64px / 400 / lh 1.05 / ls -1.5px
- `display-lg` (serif) 48px / 400 / lh 1.1 / ls -1px
- `display-md` (serif) 36px / 400 / lh 1.15 / ls -0.5px
- `display-sm` (serif) 28px / 400 / lh 1.2 / ls -0.3px
- `title-lg` (sans) 22px / 500 / lh 1.3 / ls 0px
- `title-md` (sans) 18px / 500 / lh 1.4 / ls 0px
- `title-sm` (sans) 16px / 500 / lh 1.4 / ls 0px
- `body-md` (sans) 16px / 400 / lh 1.55 / ls 0px
- `body-sm` (sans) 14px / 400 / lh 1.55 / ls 0px
- `caption` (sans) 13px / 500 / lh 1.4 / ls 0px
- `caption-uppercase` (sans) 12px / 500 / lh 1.4 / ls 1.5px
- `button` (sans) 14px / 500 / lh 1 / ls 0px
- `nav-link` (sans) 14px / 500 / lh 1.4 / ls 0px
- `code` (mono) 14px / 400 / lh 1.6 / ls 0px

## Spacing
- `space-xxs` 4px: Tight gaps, badge padding.
- `space-xs` 8px: Icon gaps, tab padding.
- `space-sm` 12px: Button vertical padding.
- `space-md` 16px: Default gap.
- `space-lg` 24px: Card gaps, code card padding.
- `space-xl` 32px: Card padding.
- `space-xxl` 48px: Callout card padding.
- `space-section` 96px: Vertical space between major bands.

## Radius
- `radius-xs` 4px: Badge accents, tiny dropdowns.
- `radius-sm` 6px: Small inline buttons, dropdown items.
- `radius-md` 8px: Buttons, inputs, category tabs.
- `radius-lg` 12px: Content and product cards.
- `radius-xl` 16px: Hero illustration container.
- `radius-pill` 9999px: Badges.
- `radius-full` 9999px: Avatars and circular icon buttons.

## Shadow
- `shadow-subtle` 0 1px 3px rgba(20,20,19,0.08): Rare hover-elevated states. Depth comes from cream vs dark contrast, not shadows.
- `shadow-focus` 0 0 0 3px rgba(204,120,92,0.15): Focus ring on inputs, with a coral border.

## Rules
- Cream canvas, never pure white. Coral only for primary CTAs, links and callout bands.
- Serif at weight 400 for display, negative tracking. Never bold the serif.
- Depth from cream vs dark contrast and hairlines, not shadows.
- Alternate cream and dark bands; 96px between bands.
- No cool grays, blue or cyan accents. No hover styling beyond the primary pressed state.
- Buttons 40px high, 8px radius. Cards 12px radius, 32px padding.

## Dark theme
Same token names, different values. `canvas` #181715, `surface-soft` #1f1e1b, `surface-card` #252320, `surface-cream-strong` #2f2c27, `surface-dark` #0f0e0d, `surface-dark-elevated` #252320, `surface-dark-soft` #181715, `hairline` #3a3733, `hairline-soft` #2d2b27, `ink` #faf9f5, `body-strong` #ece9e2, `body` #cfccc4, `muted` #a09d96, `muted-soft` #8e8b82, `primary` #d9876b, `primary-active` #cc785c, `primary-disabled` #3a3733, `on-primary` #141413, `error` #e06b6b. Others are unchanged. `shadow-focus` becomes 0 0 0 3px rgba(217,135,107,0.35).

## Added tokens
- `border-strong` #8e8b82 (dark #77746c): borders of form controls, 3:1 on canvas.
- `success-soft` #e3f1e6 (#1d3022), `warning-soft` #f6ecd0 (#352c14), `error-soft` #f8e5e1 (#3a1f1d), `info-soft` #def0ec (#1b3430): fills for banners, toasts, correct and incorrect answers; text on them is `ink`.
- `overlay` #14141380 (#000000a6): scrim behind modal and command palette.
- `shadow-popover` 0 8px 24px rgba(20,20,19,0.12) (dark rgba(0,0,0,0.5)): floating layers only.

## Components
Original: Button, Card, Input, Badge, CtaBand, CodeWindow, TopNav, CategoryTab, PricingTier, ConnectorTile, Footer, CookieCard.
Forms: Select, Checkbox, Radio, Switch, Textarea.
Navigation: Tabs (line, pill, vertical, icon and counter, scrollable, arrow-key navigation), Breadcrumb, Pagination, Sidebar (collapsible, peek, resizable), TabBar (browser-style tabs), Kbd, Shortcuts, Dropdown, CommandPalette.
Feedback: Modal, Tooltip, Toast, Banner, Progress, Skeleton, EmptyState.
Data: Table, Avatar.
Study: QuestionCard, Timer, Flashcard, QuestionNavigator, RatingButtons.

## Added rules
- Form and navigation components have a quiet hover (soft fill, no shadow) and a visible focus ring: 2px coral outline, 2px offset.
- Feedback is never color alone: always an icon or a word (Correct, Incorrect, Passed).
- Control borders use `border-strong`; `hairline` stays for decorative dividers.
