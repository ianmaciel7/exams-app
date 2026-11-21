// spec.md §5.5 "Shortcut dispatch": "Editable targets and IME composition
// suppress unrelated global shortcuts." Shared by every global single-key
// shortcut (sidebar/context-panel collapse, study self-grade, etc.) so they
// agree on what counts as "editable."
export function isEditableTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}
