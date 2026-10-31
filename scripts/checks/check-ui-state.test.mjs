import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { findUnsafeFeedback } from "./check-ui-state.mjs";

describe("UI state feedback guard", () => {
  it("accepts translated safe fallback messages", () => {
    assert.deepEqual(
      findUnsafeFeedback(
        'try { await save(); } catch (error) { setError("root", { message: t("saveFailed") }); }',
      ),
      [],
    );
  });

  it("accepts domain errors normalized before display", () => {
    assert.deepEqual(
      findUnsafeFeedback(
        'try { await save(); } catch (error) { setError("root", { message: error instanceof DomainError ? error.message : t("saveFailed") }); }',
      ),
      [],
    );
  });

  it("rejects raw exception coercion in JSX with a source line", () => {
    assert.deepEqual(
      findUnsafeFeedback(
        "function Notice({ error }) {\n  return <p>{String(error)}</p>;\n}",
        "notice.tsx",
      ),
      [{ line: 2, sink: "JSX content" }],
    );
  });

  it("rejects raw exception coercion passed to form errors and toasts", () => {
    const violations = findUnsafeFeedback(
      'form.setError("root", { message: String(error) });\ntoast.add({ title: String(cause) });',
    );
    assert.deepEqual(violations, [
      { line: 1, sink: "form error" },
      { line: 2, sink: "toast notification" },
    ]);
  });

  it("rejects template literal exception interpolation in JSX, form errors, and toasts", () => {
    const source = [
      "function View({ error }) {",
      "  toast.add({ title: `Error: " + "$" + "{error}` });",
      '  form.setError("root", { message: `Failed: ' + "$" + "{cause}` });",
      "  return <span>{`Detail: " + "$" + "{err}`}</span>;",
      "}",
    ].join("\n");
    const violations = findUnsafeFeedback(source, "view.tsx");
    assert.deepEqual(violations, [
      { line: 2, sink: "toast notification" },
      { line: 3, sink: "form error" },
      { line: 4, sink: "JSX content" },
    ]);
  });

  it("accepts intentional exceptions when preceded or marked with check-ui-state-ignore", () => {
    const violations = findUnsafeFeedback(
      "// check-ui-state-ignore: internal debug display\nfunction Debug({ error }) {\n  return <pre>{String(error)}</pre>;\n}",
      "debug.tsx",
    );
    assert.deepEqual(violations, []);
  });
});
