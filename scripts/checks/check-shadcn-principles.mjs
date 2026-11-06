import { fileURLToPath } from "node:url";
import { runPrinciplesCheck } from "./check-base-ui-principles.mjs";

export const SHADCN = {
  doc: "docs/agents/shadcn-principles.md",
  rulesDir: ".ast-grep/rules/shadcn",
  marker: "shadcn-version",
  packageName: "shadcn",
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runPrinciplesCheck(SHADCN, "node_modules/shadcn/package.json");
}
