import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const services = [
  { name: "firestore", rules: "firestore.rules", test: "firestore.test.mjs" },
  { name: "storage", rules: "storage.rules", test: "storage.test.mjs" },
  {
    name: "database",
    rules: "database.rules.json",
    test: "database.test.mjs",
  },
];

/** Literal path segments after `match /`, ignoring `{wildcards}`. */
function matchedSegments(rules) {
  const names = new Set();
  for (const [, path] of rules.matchAll(
    /match\s+(\/[^\s{]*(?:\/\{[^}]+\}[^\s{]*)*)\s*\{/g,
  ))
    for (const segment of path.split("/"))
      if (
        segment &&
        !segment.startsWith("{") &&
        segment !== "databases" &&
        segment !== "documents" &&
        segment !== "b" &&
        segment !== "o"
      )
        names.add(segment);
  return [...names];
}

function inspectService({ name, rules, test }, files) {
  const source = files[rules];
  if (source === undefined) return [];
  const testSource = files[`tests/rules/${test}`];
  if (testSource === undefined)
    return [`${rules} has no emulator test at tests/rules/${test}`];
  const errors = [];
  if (/if\s+true\b/.test(source) || /":\s*"?true"?\s*[,}]/.test(source))
    errors.push(`${rules} allows access unconditionally`);
  if (name !== "database")
    for (const segment of matchedSegments(source))
      if (!testSource.includes(segment))
        errors.push(
          `${rules} path "${segment}" is not exercised in tests/rules/${test}`,
        );
  return errors;
}

/**
 * Every deployed rules file needs an emulator test that names each matched
 * path, no rule may allow everything, and CI must run the rules tests.
 * `files` maps repository paths to their text (or undefined when missing).
 */
export function inspectFirebaseRules(files) {
  const errors = services.flatMap((service) => inspectService(service, files));
  if (!(files[".github/workflows/ci.yml"] ?? "").includes("tests/rules"))
    errors.push(
      "CI must run the rules tests in tests/rules with the emulators",
    );
  return errors;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = process.cwd();
  const read = (path) =>
    existsSync(resolve(root, path))
      ? readFileSync(resolve(root, path), "utf8")
      : undefined;
  const paths = [
    ".github/workflows/ci.yml",
    ...services.flatMap(({ rules, test }) => [rules, `tests/rules/${test}`]),
  ];
  const errors = inspectFirebaseRules(
    Object.fromEntries(paths.map((path) => [path, read(path)])),
  );
  for (const error of errors) console.error(error);
  if (errors.length) process.exit(1);
  console.log("Every Firebase rules file has an emulator test run by CI.");
}
