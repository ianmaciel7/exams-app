import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const BASE_UI = {
  doc: "docs/agents/base-ui-principles.md",
  rulesDir: ".ast-grep/rules/base-ui",
  marker: "base-ui-version",
  packageName: "@base-ui/react",
};

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
    (file) =>
      String(file).replaceAll("\\", "/").split("/").pop() === `${id}.yml`,
  );
}

function guardError(guard, root) {
  const [kind, ...rest] = guard.split(":");
  const value = rest.join(":").trim();
  const exists = {
    rule: () => findRule(root, value),
    check: () => existsSync(join(root, "scripts/checks", `check-${value}.mjs`)),
    test: () => existsSync(join(root, value)),
    manual: () => value.length >= 10,
  }[kind];
  if (!exists) return `unknown guard "${guard}"`;
  if (exists()) return null;
  return kind === "manual"
    ? "manual guard needs a reason"
    : `${kind} ${value} does not exist`;
}

function versionError(markdown, installedVersion, config) {
  const marker = markdown.match(
    new RegExp(`<!-- ${config.marker}: ([\\d.]+) -->`),
  );
  if (!marker) return `${config.doc} lacks the ${config.marker} marker`;
  if (installedVersion && marker[1] !== installedVersion)
    return `${config.doc} was reviewed for ${config.packageName} ${marker[1]} but ${installedVersion} is installed; read the release notes and update the table`;
  return null;
}

function unlistedRuleErrors(root, listed, config) {
  const dir = join(root, config.rulesDir);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((file) => file.endsWith(".yml"))
    .map((file) => file.replace(/\.yml$/, ""))
    .filter((id) => !listed.has(id))
    .map((id) => `rule ${id} is not listed in ${config.doc}`);
}

/** Returns every problem found; an empty array means the matrix is sound. */
export function inspectPrinciples({
  markdown,
  root,
  installedVersion,
  config = BASE_UI,
}) {
  const rows = parsePrinciples(markdown);
  const errors = [];
  if (rows.length === 0) errors.push(`${config.doc} has no principle rows`);
  errors.push(versionError(markdown, installedVersion, config));
  const listed = new Set();
  for (const { principle, guards } of rows) {
    if (guards.length === 0) errors.push(`"${principle}" has no guard`);
    for (const guard of guards) {
      if (guard.startsWith("rule:")) listed.add(guard.slice(5).trim());
      const error = guardError(guard, root);
      if (error) errors.push(`"${principle}": ${error}`);
    }
  }
  errors.push(...unlistedRuleErrors(root, listed, config));
  return errors.filter(Boolean);
}

/** Runs the matrix check for one rule group; shared by the Base UI and shadcn guards. */
export function runPrinciplesCheck(config, packageJsonPath) {
  const root = process.cwd();
  const installedVersion = JSON.parse(
    readFileSync(resolve(root, packageJsonPath), "utf8"),
  ).version;
  const errors = inspectPrinciples({
    markdown: readFileSync(resolve(root, config.doc), "utf8"),
    root,
    installedVersion,
    config,
  });
  if (errors.length > 0) {
    console.error(
      `${config.packageName} principle guards are incomplete:\n${errors.join("\n")}`,
    );
    process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runPrinciplesCheck(BASE_UI, "node_modules/@base-ui/react/package.json");
}
