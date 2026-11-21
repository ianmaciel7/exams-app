The tab bar is the browser-style strip of open views at the top of the Space: several tabs open at once, create with `+`, close, pin, reorder by dragging, overflow menu and keyboard shortcuts. It sits in the 46px unified top bar: space selector, sidebar toggle, back and forward history, a separator, the tab list, `+`, overflow, and the right-panel toggle.

**Visual (Claude look).** Bar on `surface-soft` with a hairline, 12px radius. Tabs are 32px high with an 8px radius, 13px type, minimum width 82px and a 4px gap (`MAIN_TAB_MIN_WIDTH`, `MAIN_TAB_GAP`). Inactive tabs are transparent with `muted` text and a 1px vertical separator between them that fades on hover and selection; hover fills `surface-card`; the selected tab is `surface-raised` with a hairline ring, `ink` text, weight 500 and a faint 1px shadow. The pin and close buttons appear on hover and on focus, are 24px square (WCAG 2.5.8) and are never hover-only for keyboard users. Pinned tabs collapse to the icon, sit first and have no close button. The tab being dragged shows a 2px `ink` drop marker before or after the target.

**Behavior.**
- New tab (`+`) opens next to the active tab. Closing the active tab selects the tab that slid into its slot, or the last one; the document behind a tab is never deleted, a tab is only a view. A closed tab can be undone with a toast (original `toast('Aba fechada', undo)`). The original keeps at most 8 tabs in the older Recall app (`maxTabs = 8`) and persists open tabs by id.
- Overflow: when tabs do not fit, a chevron button opens a 256px searchable menu (`Buscar abas`) listing every tab; the current one is bold. Tabs never wrap.
- Context menu (right click, the Menu key or Shift+F10): Fechar, Fechar outras, Fechar à direita, separator, Fixar or Desafixar, Duplicar, Abrir no painel direito.
- History: the back and forward buttons step through the tab's own history, disabled at the ends.

**Keyboard** (implemented in the preview; same as the prototype): `Alt T` new tab, `Alt W` close tab, `Alt 1` to `Alt 9` activate (9 is the last), `Alt Shift Right` and `Alt Shift Left` next and previous, `Shift P` pin or unpin the focused tab, Left, Right, Home and End move focus in the list, Enter or Space activates. `Ctrl T`, `Ctrl W` and `Ctrl Tab` are browser-reserved: the app does not intercept or advertise them (the original tests assert that `Ctrl Tab` is not prevented).

**Accessibility.** `role="tablist"` with `role="tab"`, `aria-selected`, roving `tabindex`, `aria-keyshortcuts="Shift+P"`, a polite live region for create, close, pin and move, icon buttons with names, focus ring 2px coral. The app view is a navigation target: the original `space-tabs.tsx` deliberately uses a `nav` instead of a tablist when every tab is a URL.

**Origin.**
- `exams-app-antigo-2`, branch `dev`: `prototype/exam-app-0.1.1__index.html` (CSS `.ws-tabs`, `.ws-tab`, `.ws-tabmenu`; JS `wsPaint`, `wsOpenTab`, `wsClose`, `wsCloseMany`, `wsDuplicate`, `tabMenu`, drag handlers `dragstart` and `dragover` on `#wsTabList`, command registry `command('workspace.new-tab', ...)`). `DESIGN.md` section 5 "Diretrizes da Barra Superior Unificada". `AGENTS.md` line 1221 and `tests/workspace-command-router.*` for the shortcut rules.
- `notes-app`, branch `old-10`: `src/components/recall/space-tabs.tsx`, `src/domain/tabs.ts` (`maxTabs`, `nextActiveTab`, cookie `recall-tabs`), `spec.md` section 9 ("Main space tabs", "Tab keyboard interaction").
- Not found: a right-panel tab strip is described in the prototype (`#rpTabs`, compact mode) but is not part of this component; `Ctrl T` and `Ctrl W` as in-app shortcuts do not exist by design.

**Consumer provides** the tabs, titles, icons, history and handlers.
