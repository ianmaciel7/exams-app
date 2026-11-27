# Tokens

Every token is a CSS custom property defined by `tokens.css`.

## Colors

Themes: `light` (Light), `dark` (Dark).

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--ground` | `#fafbf8` | `#141e1b` | Main reading surface. |
| `--ink` | `#192823` | `#f4f8f4` | Primary text on ground. |
| `--muted` | `#4d6158` | `#b6c9bf` | Secondary text on ground. |
| `--brand` | `#155b55` | `#8cd7ba` | Mark and primary actions. |
| `--on-brand` | `#ffffff` | `#102c26` | Text and symbol on brand. |
| `--tint` | `#dbede2` | `#304d40` | Selected surfaces with an explicit selection cue. |
| `--focus` | `#155b55` | `#8cd7ba` | Separated keyboard focus outline on ground. |
| `--correct` | `#286044` | `#a0deb4` | Correct label on ground. |
| `--incorrect` | `#9a3731` | `#fdb1a4` | Incorrect label on ground. |

## Text styles

| Class | Family | Size / line height | Weight | Usage |
|---|---|---|---|---|
| `.display` | var(--font-sans) | 72px / 0.95 | 750 |  |
| `.heading` | var(--font-sans) | 28px / 36px | 700 |  |
| `.question` | var(--font-sans) | 20px / 30px | 600 |  |
| `.body` | var(--font-sans) | 16px / 25px | 400 |  |
| `.label` | var(--font-sans) | 14px / 20px | 600 |  |

## Font families

- `--font-sans`: system-ui, sans-serif

## Spacing

| Token | Value | Usage |
|---|---|---|
| `--space-1` | `4px` | Focus separation and inline gaps. |
| `--space-2` | `8px` | Gap between related controls and labels. |
| `--space-4` | `16px` | Control and compact surface padding. |
| `--space-8` | `32px` | Space between question groups. |

## Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-none` | `0px` | Flush workspace boundary. |
| `--radius-control` | `6px` | Control and brand tile corners. |
| `--radius-group` | `12px` | Contained samples and overlay surfaces. |
