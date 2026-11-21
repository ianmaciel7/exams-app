import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { findViolations, isChecked, isPortuguese } from "./check-english.mjs";

describe("check-english", () => {
  it("flags Portuguese prose", () => {
    assert.equal(isPortuguese("- Responsabilidade: revisão individual"), true);
    assert.equal(isPortuguese("O arquivo não declara uma diretiva"), true);
  });

  it("accepts English prose", () => {
    assert.equal(isPortuguese("The file declares a client directive."), false);
    assert.equal(isPortuguese("Use `revisão` as an identifier"), false);
  });

  it("reports the offending line number", () => {
    const result = findViolations(
      "a.md",
      "# Title\n\nNenhum problema, não há.\n",
    );
    assert.deepEqual(result, [{ line: 3, path: "a.md" }]);
  });

  it("exempts localized catalogs and generated output", () => {
    assert.equal(isChecked("src/messages/pt-BR.json"), false);
    assert.equal(isChecked("graphify-out/GRAPH_REPORT.md"), false);
    assert.equal(isChecked("docs/code-review/reports/a.md"), true);
  });

  it("checks commit messages the same way", () => {
    assert.equal(findViolations("msg", "feat: add profile page").length, 0);
    assert.equal(
      findViolations("msg", "feat: não adiciona uma página").length,
      1,
    );
  });
});
