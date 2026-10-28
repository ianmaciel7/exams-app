import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import {
  createTempDirs,
  lintJson,
  removeTempPaths,
  root,
  sweepStaleTempDirs,
} from "../test-helpers";

const locations = [
  "src/app/_hooks",
  "src/app/(protected)/_hooks",
  "src/app/(protected)/_lib",
  "src/app/(protected)/profile/_hooks",
  "src/app/(protected)/profile/_lib",
  "src/app/(public)/_hooks",
  "src/app/(public)/forgot-password/_hooks",
  "src/app/(public)/register/_hooks",
  "src/app/(public)/sign-in/_hooks",
  "src/lib",
  "src/hooks",
  "src/i18n",
  "src/components/ui/extensions",
] as const;

const vendorParents = [
  "src/components/ui",
  "src/components/ai-elements",
] as const;
sweepStaleTempDirs(vendorParents, "complexity-native-");

const directories = createTempDirs(locations, "complexity-native-");
const vendorFiles = vendorParents.map((directory) =>
  join(root, directory, `complexity-native-${process.pid}.tsx`),
);

afterAll(() => {
  removeTempPaths([...directories, ...vendorFiles]);
});

function lint(
  source: string,
  file = join(directories[0], "fixture.ts"),
  extraFlags: readonly string[] = [],
) {
  writeFileSync(file, source);
  return lintJson(file, extraFlags);
}

function branches(count: number) {
  const checks = Array.from(
    { length: count },
    (_, index) => `if (value > ${index}) result += 1;`,
  ).join("\n");
  return `export function choose(value: number) { let result = 0;\n${checks}\nreturn result; }`;
}

function lines(count: number) {
  return `export function longFunction() {\n${Array.from({ length: count }, () => 'console.log("step");').join("\n")}\n}`;
}

function nested(depth: number) {
  let call = "1";
  for (let index = 0; index < depth; index++)
    call = `Promise.resolve(1).then(() => ${call})`;
  return `export function nestedCallbacks() { return ${call}; }`;
}

const categories = {
  cognitive: "lint/complexity/noExcessiveCognitiveComplexity",
  lines: "lint/complexity/noExcessiveLinesPerFunction",
  callbacks: "lint/nursery/noExcessiveNestedCallbacks",
};

const ruleFlags = {
  cognitive: ["--only=complexity/noExcessiveCognitiveComplexity"],
  lines: ["--only=complexity/noExcessiveLinesPerFunction"],
  callbacks: ["--only=nursery/noExcessiveNestedCallbacks"],
} as const;

describe("owned function complexity budgets", () => {
  it.each([
    ["cognitive", branches(8), branches(9)],
    ["lines", lines(40), lines(41)],
    ["callbacks", nested(2), nested(3)],
  ] as const)(
    "accepts the exact %s limit and blocks the next value",
    (kind, valid, invalid) => {
      const flags = ruleFlags[kind];
      expect(
        lint(valid, undefined, flags).diagnostics.filter(
          ({ category }) => category === categories[kind],
        ),
      ).toEqual([]);
      expect(lint(invalid, undefined, flags).diagnostics).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            category: categories[kind],
            severity: "error",
          }),
        ]),
      );
    },
  );

  it.each(locations)(
    "captures long functions in owned %s modules",
    (location) => {
      const directory = directories[locations.indexOf(location)];
      expect(
        lint(
          lines(41),
          join(directory, "fixture.ts"),
          ruleFlags.lines,
        ).diagnostics.some(({ category }) => category === categories.lines),
      ).toBe(true);
    },
  );

  it("does not let an IIFE bypass the function size budget", () => {
    const source = `export const value = (() => {\n${Array.from({ length: 41 }, () => 'console.log("step");').join("\n")}\n})();`;
    expect(
      lint(source, undefined, ruleFlags.lines).diagnostics.some(
        ({ category }) => category === categories.lines,
      ),
    ).toBe(true);
  });

  it("also covers TSX hook functions", () => {
    expect(
      lint(
        branches(9),
        join(directories[0], "fixture.tsx"),
        ruleFlags.cognitive,
      ).diagnostics.some(({ category }) => category === categories.cognitive),
    ).toBe(true);
  });

  it("keeps blank lines from consuming the function budget", () => {
    expect(
      lint(
        lines(40).replaceAll("\n", "\n\n"),
        undefined,
        ruleFlags.lines,
      ).diagnostics.filter(({ category }) => category === categories.lines),
    ).toEqual([]);
  });

  it.each(["test", "spec", "stories"])(
    "preserves %s fixture exclusions",
    (kind) => {
      const result = lint(
        `${branches(9)}\n${lines(41)}\n${nested(3)}`,
        join(directories[0], `fixture.${kind}.tsx`),
      );
      expect(
        result.diagnostics.filter(({ category }) =>
          Object.values(categories).includes(category),
        ),
      ).toEqual([]);
    },
  );

  it.each(vendorFiles)("preserves copied registry exclusions: %s", (file) => {
    expect(
      lint(
        `${branches(9)}\n${lines(41)}\n${nested(3)}`,
        file,
      ).diagnostics.filter(({ category }) =>
        Object.values(categories).includes(category),
      ),
    ).toEqual([]);
  });
});
