Kbd renders a keyboard key hint, such as the `Ctrl` `K` at the right of the sidebar search or in a tooltip. A key is 20px high, 6px radius, a 1px `hairline` border on `surface-raised`, `muted` text at 11px/500 in the sans (not mono), 5px horizontal padding. Chords are separate keys, never one box ("Ctrl" "Alt" "N"); on macOS the label is the symbol (⌘, ⌥).

**Rules.** Platform labels come from one catalog so tooltips, menus and the Shortcuts page never disagree (`Mod` is Ctrl on Windows and Linux, ⌘ on macOS). Use the real `kbd` element and, on the trigger, `aria-keyshortcuts`. A key hint never replaces a visible label.

**Origin.** `notes-app`, branch `old-10`: `src/components/ui/kbd.tsx` is named in `spec.md` (section 7: "Data Display / Key Hint") and used in `src/components/space-frame.tsx` (`<Kbd>⌘K</Kbd>`). `exams-app-antigo-2`, branch `dev`: `prototype/exam-app-0.1.1__index.html`, `formatShortcut()` (Mod to Ctrl or ⌘, Alt to Option). Visual restyled to the Claude look of this system.

**Consumer provides** the key labels.
