import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const adrDirectory = "docs/adr";
const adrFilePattern = /^(\d{4})-[a-z0-9]+(?:-[a-z0-9]+)*\.md$/;

// Areas whose existence requires a recorded architecture decision. Add a row
// when a new top-level area of infrastructure or tooling is introduced.
export const decisionAreas = [
  { path: "infra", keyword: /terraform/i, label: "Terraform infrastructure" },
  {
    path: "tests/rules",
    keyword: /rules-unit-testing/i,
    label: "Firebase security rules emulator tests",
  },
  {
    path: "src/app/_lib/firebase-loaders.ts",
    keyword: /firebase-loaders/i,
    label: "on-demand Firebase loading",
  },
  {
    path: "src/components/ui/extensions/form-field.tsx",
    keyword: /Form and Field/i,
    label: "Base UI form model",
  },
];

function readAdrs(root) {
  const directory = join(root, adrDirectory);
  if (!existsSync(directory)) return [];
  return readdirSync(directory)
    .filter((name) => adrFilePattern.test(name))
    .sort()
    .map((name) => ({
      name,
      number: Number(name.slice(0, 4)),
      text: readFileSync(join(directory, name), "utf8"),
    }));
}

export function inspectAdrs(root) {
  const problems = [];
  const adrs = readAdrs(root);
  const indexPath = join(root, adrDirectory, "README.md");
  const index = existsSync(indexPath) ? readFileSync(indexPath, "utf8") : "";

  adrs.forEach((adr, position) => {
    if (adr.number !== position + 1) {
      problems.push(
        `${adrDirectory}/${adr.name}: expected ADR number ${String(position + 1).padStart(4, "0")}; numbers must be sequential without gaps`,
      );
    }
    if (!index.includes(`(${adr.name})`)) {
      problems.push(
        `${adrDirectory}/README.md: missing index entry for ${adr.name}`,
      );
    }
    for (const match of adr.text.matchAll(/(?<!ormer |# )ADR (\d{4})/g)) {
      if (Number(match[1]) > adrs.length) {
        problems.push(
          `${adrDirectory}/${adr.name}: refers to ADR ${match[1]}, which does not exist; merged records live under a "Former ADR" heading`,
        );
      }
    }
    const heading = `# ADR ${String(adr.number).padStart(4, "0")}: `;
    if (!adr.text.includes(heading)) {
      problems.push(
        `${adrDirectory}/${adr.name}: missing heading "${heading}"`,
      );
    }
  });

  for (const area of decisionAreas) {
    if (!existsSync(join(root, area.path))) continue;
    if (!adrs.some((adr) => area.keyword.test(adr.text))) {
      problems.push(
        `${area.path}/ exists but no ADR in ${adrDirectory}/ records the ${area.label} decision; add one before merging`,
      );
    }
  }

  return problems;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const problems = inspectAdrs(resolve("."));
  if (problems.length > 0) {
    console.error(problems.join("\n"));
    process.exit(1);
  }
  console.log("ADR check passed.");
}
