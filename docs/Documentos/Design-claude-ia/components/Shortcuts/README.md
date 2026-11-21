The keyboard shortcuts page lists every shortcut of the app in one dialog, grouped by category (Espaço, Abas, Barra lateral, Leitura, Questões), searchable, with a Windows and Linux or macOS switch. It is generated from the same catalog as the tooltips and the command palette, so a shortcut can never be advertised that is not implemented.

**Visual.** A 16px-radius `surface-raised` dialog with `shadow-popover`, serif title, a segmented platform control, a search field, two columns of rows (title left, keys right) separated by `hairline-soft`, category headings in title-sm weight 600, and a footer note. Keys use the Kbd component; alternatives are joined with "ou".

**Rules.** `Mod` is Ctrl on Windows and Linux and ⌘ on macOS, `Alt` is Option. Single-key shortcuts are ignored inside inputs, textareas, selects, editors, dialogs and during IME composition. Browser-reserved chords (Ctrl T, Ctrl W, Ctrl Tab) are not captured. Opened from the command palette or a Help menu; closes with Esc and returns focus to the opener.

**Accessibility.** `role="dialog"` with a labelled title, a search field with a label, results announced as a status when empty, every key a real `kbd`. Tab order: platform switch, search, list.

**Origin (what existed).**
- `exams-app-antigo-2`, branch `dev`, `prototype/exam-app-0.1.1__index.html`: command registry `command(...)` (section "centralized workspace command registry (#139)") with `formatShortcut`, `shortcutMatches`, `shortcutCatalogHtml` (the in-app shortcuts window is generated from it); commands: `Mod+Alt+N`, `Mod+B`, `Mod+K`, `Alt+T`, `Alt+W`, `Mod+\`, `Alt+Left` or `Mod+[`, `Alt+Right` or `Mod+]`, `Alt+Shift+Right`, `Alt+Shift+Left`, `Alt+1` to `Alt+9`, `Escape`, `F2`, `E`, `L`, `Plus`, `-`, `J`, `K`, answers `1` to `5` or `A` to `E`, `Enter`, `J`, `K`; `Shift+P` pins a tab (tablist `keydown`). Tests: `tests/workspace-command-router.test.mjs` and `.e2e.mjs`; `prototype/BOARD.md` section 46.
- `notes-app`, branch `old-10`: `src/components/space-frame.tsx` (`[` toggles the sidebar, resize separator with Left, Right, Home, End, step 16), `src/components/recall/context-panel.tsx` (`]`), `src/components/recall/command-palette.tsx` (`Mod+K` or `Mod+P`), `src/components/recall/study-panel.tsx` (keys `0` to `5` grade a card after answering), `src/lib/keyboard.ts` (`isEditableTarget`), `spec.md` section 9.
- Not found: the keyboard-command spec of `old-4` (`openspec/specs/ui/keyboard-command-system`) is cited by `spec.md` but branch `old-4` was not recovered, so any shortcuts defined only there are missing. No `Ctrl T`, `Ctrl W` or `Ctrl Tab` in-app shortcuts exist, on purpose.

**Consumer provides** the catalog and the platform.
