# Claude Cloud Project & Workspace UI Parity Learnings

## Context & Thread Origin
- **Source Thread:** Claude Code Cloud session `chan_013qMDV6HM5kW8Z4atVzkN6s` (message `cmsg_013qMDV6HM5kW8Z4atVzkN6s298qSTZuxaWSzzduMnxzFg`).
- **Goal:** UI Parity & Tab System refinement for `prototypes/exam-app-0.1.1/index.html` based on legacy specifications in `docs/archives/` (specifically bundle `notes-app-old-4`).
- **Repository Location:** `C:\Users\ianma\workspace\exams\dev` on branch `dev`.

## UI Parity Findings (from notes-app-old-4)
- **Bar Height Parity:** Both main and right panels require a standardized ~46px header height.
- **Tab Geometry & Styling:**
  - Tab height: 32px, `rounded-[8px]`, font 13px, padding `3px 2px 3px 6px`.
  - Active tab: white/base background, subtle border, font-weight 500.
  - Vertical separator: 18x0.5px between tabs (hides on hover).
  - Pin / Close actions: separate 38px block (200ms transition), never obscuring tab center or triggering accidental tab switch.
  - Hover preview: 256px HoverCard with 200ms delay.
- **Tab Calculation & Overflow Logic:**
  - `MAIN_TAB_MIN_WIDTH = 82px`, `MAIN_TAB_GAP = 5px`, 28px reserved for tab list button.
  - Dynamic `getVisibleRange` logic with `cramped` mode: active tab is guaranteed to stay within the visible window.
  - Overflow button: opens 256px searchable tab list dropdown when tabs exceed visible space.
- **Design Tokens (OKLCH):**
  - `--app-tab-bg-base`: `oklch(1 0.0001 263.28)`
  - `--app-tab-bg-back`: `oklch(0.9856 0.0016 67)`
  - `--app-tab-bg-back-hover`: `oklch(0.9676 0.0016 67)`
  - `--app-tab-border`: `oklch(0.9163 0.0017 67)`
  - Accent / Brand: `#5c6fbd`, Inter font.
