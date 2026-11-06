import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const DOC = "docs/agents/base-ui-principles.md";
const RULES_DIR = ".ast-grep/rules/base-ui";

/** Parses the principle table: `| principle | guard, guard |` rows. */
export function parsePrinciples(markdown) {
  const rows = [];
  for (const line of markdown.split("\n")) {
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());
    if (cells.length !== 2 || /^-+$/.test(cells[0]) || cells[0] === "Principle")
      continue;
    rows.push({ principle: cells[0], guards: splitGuards(cells[1]) });
  }
  return rows;
}

function splitGuards(cell) {
  // A manual guard keeps its reason, which may contain commas, to the end.
  if (cell.startsWith("manual:")) return [cell];
  return cell
    .split(",")
    .map((guard) => guard.trim())
    .filter(Boolean);
}

function findRule(root, id) {
  const dir = join(root, ".ast-grep/rules");
  if (!existsSync(dir)) return false;
  return readdirSync(dir, { recursive: true }).some(
    (file) => String(file).replaceAll("\\", "/").split("/").pop() === `${id}.yml`,
  );
}

/** Returns every problem found; an empty array means the matrix is sound. */
export function inspectPrinciples({ markdown, root, installedVersion }) {
  const errors = [];
  const rows = parsePrinciples(markdown);
  if (rows.length === 0) errors.push(`${DOC} has no principle rows`);
  const marker = markdown.match(/<!-- base-ui-version: ([\d.]+) -->/);
  if (!marker) errors.push(`${DOC} lacks the base-ui-version marker`);
  else if (installedVersion && marker[1] !== installedVersion)
    errors.push(
      `${DOC} was reviewed for @base-ui/react ${marker[1]} but ${installedVersion} is installed; read the release notes and update the table`,
    );
  const referencedRules = new Set();
  for (const { principle, guards } of rows) {
    if (guards.length === 0) errors.push(`"${principle}" has no guard`);
    for (const guard of guards) {
      const [kind, ...rest] = guard.split(":");
      const value = rest.join(":").trim();
      if (kind === "rule") {
        referencedRules.add(value);
        if (!findRule(root, value))
          errors.push(`"${principle}": rule ${value} does not exist`);
      } else if (kind === "check") {
        if (!existsSync(join(root, "scripts/checks", `check-${value}.mjs`)))
          errors.push(`"${principle}": check ${value} does not exist`);
      } else if (kind === "test") {
        if (!existsSync(join(root, value)))
          errors.push(`"${principle}": test ${value} does not exist`);
      } else if (kind === "manual") {
        if (value.length < 10)
          errors.push(`"${principle}": manual guard needs a reason`);
      } else {
        errors.push(`"${principle}": unknown guard "${guard}"`);
      }
    }
  }
  const ruleFiles = existsSync(join(root, RULES_DIR))
    ? readdirSync(join(root, RULES_DIR)).filter((file) => file.endsWith(".yml"))
    : [];
  for (const file of ruleFiles) {
    const id = file.replace(/\.yml$/, "");
    if (!referencedRules.has(id))
      errors.push(`rule ${id} is not listed in ${DOC}`);
  }
  return errors;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = process.cwd();
  const installedVersion = JSON.parse(
    readFileSync(
      resolve(root, "node_modules/@base-ui/react/package.json"),
      "utf8",
    ),
  ).version;
  const errors = inspectPrinciples({
    markdown: readFileSync(resolve(root, DOC), "utf8"),
    root,
    installedVersion,
  });
  if (errors.length > 0) {
    console.error(`Base UI principle guards are incomplete:\n${errors.join("\n")}`);
    process.exit(1);
  }
}
