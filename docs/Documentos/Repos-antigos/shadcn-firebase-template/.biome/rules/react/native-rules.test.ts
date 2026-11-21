import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import {
  createTempDirs,
  diagnosticsForFile,
  lintJson,
  lintText,
  removeTempPaths,
  root,
  sweepStaleTempDirs,
} from "../test-helpers";

const targetParents = [
  "src/app",
  "src/components",
  "src/hooks",
  "src/components/ui/extensions",
] as const;

sweepStaleTempDirs(["src/components/ui"], "react-native-");
const directories = createTempDirs(targetParents, "react-native-rules-");
const vendorFile = join(
  root,
  "src/components/ui",
  `react-native-${process.pid}.tsx`,
);

afterAll(() => {
  removeTempPaths([...directories, vendorFile]);
});

function lintSingle(directoryOrFile: string, source: string) {
  const file = directoryOrFile.endsWith(".tsx")
    ? directoryOrFile
    : join(directoryOrFile, "fixture.tsx");
  writeFileSync(file, source);
  return lintText(file);
}

const invalid = [
  {
    rule: "useHookAtTopLevel",
    category: "lint/correctness/useHookAtTopLevel",
    only: "correctness/useHookAtTopLevel",
    source:
      'import { useState } from "react"; export function Demo({ enabled }) { if (enabled) { const [value] = useState(0); return <span>{value}</span>; } return null; }',
  },
  {
    rule: "useExhaustiveDependencies",
    category: "lint/correctness/useExhaustiveDependencies",
    only: "correctness/useExhaustiveDependencies",
    source:
      'import { useEffect } from "react"; export function Demo({ value }) { useEffect(() => { console.log(value); }, []); return null; }',
  },
  {
    rule: "noNestedComponentDefinitions",
    category: "lint/correctness/noNestedComponentDefinitions",
    only: "correctness/noNestedComponentDefinitions",
    source:
      "export function Demo() { function Child() { return <span />; } return <Child />; }",
  },
  {
    rule: "noReactPropAssignments",
    category: "lint/correctness/noReactPropAssignments",
    only: "correctness/noReactPropAssignments",
    source:
      "export function Demo(props) { props.value = 1; return <span>{props.value}</span>; }",
  },
  {
    rule: "noReactForwardRef",
    category: "lint/suspicious/noReactForwardRef",
    only: "suspicious/noReactForwardRef",
    source:
      'import { forwardRef } from "react"; export const Demo = forwardRef((props, ref) => <input ref={ref} {...props} />);',
  },
];

describe("native React guard configuration", () => {
  it.each(invalid)(
    "enforces $rule throughout owned code",
    ({ category, only, source }) => {
      const files = directories.map((directory) => {
        const file = join(directory, "fixture.tsx");
        writeFileSync(file, source);
        return file;
      });
      const result = lintJson(files, [`--only=${only}`]);
      for (const file of files) {
        expect(
          diagnosticsForFile(result, file).some(
            (diagnostic) => diagnostic.category === category,
          ),
        ).toBe(true);
      }
    },
  );

  it.each([
    [
      "top-level state",
      'import { useState } from "react"; export function Demo() { const [value] = useState(0); return <span>{value}</span>; }',
    ],
    [
      "complete dependencies",
      'import { useEffect } from "react"; export function Demo({ value }) { useEffect(() => { console.log(value); }, [value]); return null; }',
    ],
    [
      "stable component identity",
      "function Child() { return <span />; } export function Demo() { return <Child />; }",
    ],
    [
      "local copies of props",
      "export function Demo(props) { const copy = { ...props, value: 1 }; return <span>{copy.value}</span>; }",
    ],
    [
      "React 19 ref props",
      'import type { ComponentProps } from "react"; export function Demo({ ref, ...props }: ComponentProps<"input">) { return <input ref={ref} {...props} />; }',
    ],
    [
      "conditional React use",
      'import { use } from "react"; export function Demo({ enabled, data }) { if (enabled) { const value = use(data); return <span>{value}</span>; } return null; }',
    ],
  ])("accepts %s", (_name, source) => {
    const output = lintSingle(directories[1], source);
    for (const { rule } of invalid) expect(output).not.toContain(`/${rule}`);
    expect(output).not.toContain("parse");
  });

  it("allows explicit UI phase flags", () => {
    const output = lintSingle(
      directories[1],
      "type State = { isLoading: boolean; name: string | null }; export function Demo({ state }: { state: State }) { if (state.isLoading) return null; return <span>{state.name}</span>; }",
    );
    expect(output).not.toContain("plugin");
    expect(output).not.toContain("parse");
  });

  it("preserves registry exclusions for the newly configured policies", () => {
    const output = lintSingle(
      vendorFile,
      "export function Demo(props) { props.value = 1; function Child() { return <span />; } return <Child />; }",
    );
    expect(output).not.toContain("/noReactPropAssignments");
    expect(output).not.toContain("/noNestedComponentDefinitions");
  });
});
