import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  configuredRules,
  readFirebaseConfig,
} from "../lib/firebase-config.mjs";

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

function inspectService({ service: name, rules }, files) {
  const test = `${name}.test.mjs`;
  const source = files[rules];
  if (source === undefined)
    return [`firebase.json references missing rules file: ${rules}`];
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
 * Every configured rules file needs an emulator test that names each matched
 * path, no rule may allow everything, and CI must run the rules tests.
 * Text matching is a structural hint, not proof of behavioral coverage.
 * `files` maps repository paths to their text (or undefined when missing).
 */
export function inspectFirebaseRules(files) {
  let services;
  try {
    services = configuredRules(JSON.parse(files["firebase.json"]));
  } catch (error) {
    return [`Invalid Firebase configuration: ${error.message}`];
  }
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
    "firebase.json",
    ".github/workflows/ci.yml",
    ...configuredRules(readFirebaseConfig(root)).flatMap(
      ({ rules, service }) => [rules, `tests/rules/${service}.test.mjs`],
    ),
  ];
  const errors = inspectFirebaseRules(
    Object.fromEntries(paths.map((path) => [path, read(path)])),
  );
  for (const error of errors) console.error(error);
  if (errors.length) process.exit(1);
  console.log("Every Firebase rules file has an emulator test run by CI.");
}
