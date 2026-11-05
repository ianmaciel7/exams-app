import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import {
  checkComponentStructure,
  inheritedTag,
  inspectComponentStructure,
} from "./check-component-structure.mjs";

const file = "src/app/_components/home-card.tsx";
const messages = (content, path = file) =>
  inspectComponentStructure(content, path).map((issue) => issue.message);

const valid = `
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
type CardProps = ComponentProps<"div">;
function Card({ className, ...props }: CardProps) {
  return <div data-slot="card" className={cn("flex", className)} {...props} />;
}
export { Card };
`;

describe("component structure", () => {
  it("accepts the shadcn structure", () => {
    assert.deepEqual(messages(valid), []);
  });

  it("requires data-slot on the root", () => {
    assert.match(
      messages(valid.replace(' data-slot="card"', "")).join(" "),
      /data-slot/,
    );
  });

  it("requires the root to be the tag the props describe", () => {
    assert.match(
      messages(valid.replace("<div", "<main")).join(" "),
      /renders <main>/,
    );
  });

  it("requires the remaining props to be spread exactly once", () => {
    assert.match(
      messages(valid.replace(" {...props}", "")).join(" "),
      /exactly once; found 0/,
    );
    assert.match(
      messages(valid.replace(" {...props}", " {...props} {...props}")).join(
        " ",
      ),
      /exactly once; found 2/,
    );
  });

  it("requires className to be merged with cn as the last argument", () => {
    assert.match(
      messages(valid.replace('cn("flex", className)', "className")).join(" "),
      /Merge className/,
    );
    assert.match(
      messages(
        valid.replace('cn("flex", className)', 'cn(className, "flex")'),
      ).join(" "),
      /Merge className/,
    );
  });

  it("follows aliases, Omit and intersections to the tag", () => {
    const tagOf = (type) => {
      const source = ts.createSourceFile(
        "x.tsx",
        `type P = ComponentProps<"p">; type T = ${type};`,
        ts.ScriptTarget.Latest,
        true,
      );
      return inheritedTag(source.statements[1].type, source);
    };
    assert.equal(tagOf('Omit<ComponentProps<"h1">, "id">'), "h1");
    assert.equal(tagOf('{ a: 1 } & React.ComponentProps<"ul">'), "ul");
    assert.equal(tagOf("P"), "p");
    assert.equal(tagOf("{ a: 1 }"), undefined);
  });

  it("leaves component roots to the primitive adapter checks", () => {
    assert.deepEqual(
      messages(
        `type P = ComponentProps<typeof Card>;
function Wrapper(props: ComponentProps<"div">) { return <Card {...props} />; }`,
      ),
      [],
    );
  });

  it("requires mergeProps next to useRender", () => {
    const render = `import { useRender } from "@base-ui/react/use-render";
export function Version() { return useRender({ defaultTagName: "span" }); }`;
    assert.match(messages(render).join(" "), /mergeProps/);
    assert.deepEqual(
      messages(
        `import { mergeProps } from "@base-ui/react/merge-props";\n${render}`,
      ),
      [],
    );
  });

  it("ignores files that are not owned components", () => {
    assert.deepEqual(
      messages(
        valid.replace(' data-slot="card"', ""),
        "src/components/ui/card.tsx",
      ),
      [],
    );
  });

  it("passes on the repository", () => {
    assert.deepEqual(
      checkComponentStructure(
        fileURLToPath(new URL("../../", import.meta.url)),
      ),
      [],
    );
  });
});
