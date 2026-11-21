# Origem dos componentes recuperados
Resumo de onde veio cada componente (detalhes e arquivos em cada README). Nada foi inventado: o que não foi achado está listado no fim.

## TabBar
**Origin.**
- `exams-app-antigo-2`, branch `dev`: `prototype/exam-app-0.1.1__index.html` (CSS `.ws-tabs`, `.ws-tab`, `.ws-tabmenu`; JS `wsPaint`, `wsOpenTab`, `wsClose`, `wsCloseMany`, `wsDuplicate`, `tabMenu`, drag handlers `dragstart` and `dragover` on `#wsTabList`, command registry `command('workspace.new-tab', ...)`). `DESIGN.md` section 5 "Diretrizes da Barra Superior Unificada". `AGENTS.md` line 1221 and `tests/workspace-command-router.*` for the shortcut rules.
- `notes-app`, branch `old-10`: `src/components/recall/space-tabs.tsx`, `src/domain/tabs.ts` (`maxTabs`, `nextActiveTab`, cookie `recall-tabs`), `spec.md` section 9 ("Main space tabs", "Tab keyboard interaction").
- Not found: a right-panel tab strip is described in the prototype (`#rpTabs`, compact mode) but is not part of this component; `Ctrl T` and `Ctrl W` as in-app shortcuts do not exist by design.

## Sidebar
**Origin.**
- `notes-app`, branch `old-10`: `src/components/space-frame.tsx` (the live sidebar: collapsed, peek timers 300ms and 150ms, drag resize, keyboard resize, `[` shortcut, nested groups `navGroups`, mobile drawer focus handling), `src/domain/sidebar.ts` (160, 360, 240, step 16, cookies `sidebar_state` and `sidebar_width`, 7 days), `spec.md` sections 5.4 and 9.16 (Fluid Functionalism reference behavior, adopted as a contract). `src/components/ui/sidebar.tsx` exists but is an unused shadcn scaffold.
- `exams-app-antigo-2`, branch `dev`: `prototype/exam-app-0.1.1__index.html` (`.side` 284px, `.app.collapsed .side` off-canvas, `toggleSide`, `setCollapsed`, resizer `srz`, mobile `.side` fixed 300px or 86vw, sections `secHead` and `closedSecs`, tree `treeNode` with concurso, edição and cargo, pins, `Mod+B`), `DESIGN.md` section 5.
- Not found: the `old-2`, `old-4` and `old-5` sidebar parity specs cited by `spec.md` were not recovered (those branches are not in the copy), and the context-panel (right panel) is not part of this component.

## Kbd
**Origin.** `notes-app`, branch `old-10`: `src/components/ui/kbd.tsx` is named in `spec.md` (section 7: "Data Display / Key Hint") and used in `src/components/space-frame.tsx` (`<Kbd>⌘K</Kbd>`). `exams-app-antigo-2`, branch `dev`: `prototype/exam-app-0.1.1__index.html`, `formatShortcut()` (Mod to Ctrl or ⌘, Alt to Option). Visual restyled to the Claude look of this system.

## Shortcuts
**Origin (what existed).**
- `exams-app-antigo-2`, branch `dev`, `prototype/exam-app-0.1.1__index.html`: command registry `command(...)` (section "centralized workspace command registry (#139)") with `formatShortcut`, `shortcutMatches`, `shortcutCatalogHtml` (the in-app shortcuts window is generated from it); commands: `Mod+Alt+N`, `Mod+B`, `Mod+K`, `Alt+T`, `Alt+W`, `Mod+\`, `Alt+Left` or `Mod+[`, `Alt+Right` or `Mod+]`, `Alt+Shift+Right`, `Alt+Shift+Left`, `Alt+1` to `Alt+9`, `Escape`, `F2`, `E`, `L`, `Plus`, `-`, `J`, `K`, answers `1` to `5` or `A` to `E`, `Enter`, `J`, `K`; `Shift+P` pins a tab (tablist `keydown`). Tests: `tests/workspace-command-router.test.mjs` and `.e2e.mjs`; `prototype/BOARD.md` section 46.
- `notes-app`, branch `old-10`: `src/components/space-frame.tsx` (`[` toggles the sidebar, resize separator with Left, Right, Home, End, step 16), `src/components/recall/context-panel.tsx` (`]`), `src/components/recall/command-palette.tsx` (`Mod+K` or `Mod+P`), `src/components/recall/study-panel.tsx` (keys `0` to `5` grade a card after answering), `src/lib/keyboard.ts` (`isEditableTarget`), `spec.md` section 9.
- Not found: the keyboard-command spec of `old-4` (`openspec/specs/ui/keyboard-command-system`) is cited by `spec.md` but branch `old-4` was not recovered, so any shortcuts defined only there are missing. No `Ctrl T`, `Ctrl W` or `Ctrl Tab` in-app shortcuts exist, on purpose.

## Não encontrado
- Spec `old-4` (keyboard-command-system) citada no `spec.md` do notes-app, mas a branch `old-4` não foi recuperada.
- Specs de `old-2` e `old-5` sem conteúdo sobre abas/sidebar.
- Abas do painel direito (`#rpTabs`) existem só como descrição no protótipo; não viraram componente.
- Ctrl+T, Ctrl+W e Ctrl+Tab não existem no app antigo (reservados pelo navegador, de propósito).
