import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { runPrinciplesCheck } from "./check-base-ui-principles.mjs";

export const SHADCN = {
  doc: "docs/agents/shadcn-principles.md",
  rulesDir: ".ast-grep/rules/shadcn",
  marker: "shadcn-version",
  packageName: "shadcn",
};

/**
 * The project uses the Base UI library (ADR 0002): a `base-*` style and the
 * lucide icon set. Switching either changes every component API.
 */
export function inspectComponentsJson(config) {
  const errors = [];
  if (!String(config.style ?? "").startsWith("base-"))
    errors.push(
      `components.json style "${config.style}" must be a base-* style (Base UI)`,
    );
  if (config.iconLibrary !== "lucide")
    errors.push(
      `components.json iconLibrary "${config.iconLibrary}" must be lucide`,
    );
  return errors;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const errors = inspectComponentsJson(
    JSON.parse(readFileSync(resolve(process.cwd(), "components.json"), "utf8")),
  );
  if (errors.length > 0) {
    console.error(errors.join("\n"));
    process.exit(1);
  }
  runPrinciplesCheck(SHADCN, "node_modules/shadcn/package.json");
}
