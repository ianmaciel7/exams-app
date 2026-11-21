# Exams App Design System

A warm, literary system: cream canvas, one coral accent, serif display headlines, dark showcase bands. Chat-product chrome (message bubbles, sidebars) is not covered.

## Content fundamentals
- Voice is calm, plain and confident. Short declarative headlines ("Think bigger with an AI at your side"), sentence case, no exclamation marks, no emoji.
- Buttons are verbs: "Try Exams App", "Sign in". Labels are one to three words.
- Headlines use the serif, body and UI use the sans. Never set a display headline in the sans.

## Visual foundations
- **Canvas.** Pages sit on `canvas` (#faf9f5), never white. Alternate cream bands and `surface-dark` bands to set pacing; never repeat the same mode in consecutive bands. Keep `space-section` (96px) between bands.
- **Coral is scarce.** `primary` is for primary CTAs, text links and full-bleed callout bands. Do not paint it on other accents.
- **Type.** Display styles use the serif at weight 400 with negative letter-spacing; never bold them. Copernicus and StyreneB are proprietary: the fallback stacks (Tiempos Headline / Cormorant Garamond, Inter) are used when they are absent.
- **Depth.** Cream vs dark contrast, hairlines (`hairline`, 1px) and fills, not shadows. `shadow-subtle` only for rare hover states.
- **Radius.** 8px controls (`radius-md`), 12px cards (`radius-lg`), 16px hero containers, pills for badges.
- **Layout.** About 1200px centered on 12 columns. Breakpoints: 768 / 1024 / 1440. Feature grids 3 / 2 / 1 columns. Touch targets at least 40px (36px for icon buttons).
- **Do not** use cool grays, pure white, blue or cyan accents, or hover styling beyond the primary darkening on press.

## Iconography and logo
No logo or icon files are included: the brand mark was not copied. Use plain wordmark type in the serif and a line icon set of your choice at 1.5px stroke in `ink` or `muted`.

## Accessibility notes
`ink`, `body-strong` and `body` pass 4.5:1 on `canvas`. White on `primary` is about 3.4:1: keep coral buttons at 14px/500 or larger. `muted-soft` is for captions and decoration only.

## Themes
Two themes: **Cream** (light, default) and **Dark** (warm near-black, `data-theme="dark"`). Every color token has a value in both. In Dark, `primary` is a lighter coral (#d9876b) and `on-primary` flips to near-black so text on coral keeps 4.5:1 or more. `border-strong` is new: control borders must reach 3:1 against the canvas (WCAG 1.4.11), unlike decorative `hairline`.

## Interaction states
The original system had no hover styling. Form and navigation components added later define a quiet hover (a `surface-soft` or `surface-card` fill, never a shadow) and a visible focus ring (2px coral outline, 2px offset) in both themes. Primary coral buttons keep the original rule: only the pressed state darkens.

## Components
**Original:** Button, Card, Input, Badge, CtaBand, CodeWindow, TopNav, CategoryTab, PricingTier, ConnectorTile, Footer, CookieCard.

**Forms:** Select, Checkbox, Radio, Switch, Textarea.

**Navigation:** Tabs (line, pill, vertical, icon and counter, scrollable, keyboard navigation), Breadcrumb, Pagination, Sidebar (collapsible, peek, resizable), TabBar (browser-style tabs), Kbd, Shortcuts (shortcut catalogue), Dropdown, CommandPalette.

**Feedback:** Modal, Tooltip, Toast, Banner, Progress, Skeleton, EmptyState.

**Data:** Table, Avatar.

**Study:** QuestionCard (with answer options), Timer, Flashcard, QuestionNavigator, RatingButtons.

Each has a guideline and a live preview in both themes. `DESIGN.md` is the same system as one file for AI tools.

> Origem: baseado em extração de design do claude.com (não oficial; community DESIGN.md de VoltAgent/awesome-design-md).
