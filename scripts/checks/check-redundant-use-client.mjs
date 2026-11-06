import { globSync, readFileSync } from "node:fs";
import { dirname, posix, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Next.js: "You do not need to add the 'use client' directive to every file
// that contains Client Components. You only need to add it to the files whose
// components you want to render directly within Server Components." A module
// that declares the directive although only client modules import it is a
// redundant boundary: drop the directive and let it be a neutral module of the
// client graph. Browser integrations (`-client`) and the Next.js documentation
// effect components keep the directive because check:components requires it.
// The rule is judged by the import graph, not by a list of files.

const ownedScope =
  /^src\/(?:app\/.*\/(?:_components|_hooks)\/[^/]+|components\/ui\/extensions\/[^/]+)\.tsx?$/;
const testFile = /\.(?:test|spec|stories|browser\.test)\.[cm]?[jt]sx?$/;
const keepsDirective = /(?:-client|^navigation-events|^web-vitals)$/;
const directive = /^\s*(?:\/\/.*\n|\/\*[\s\S]*?\*\/\s*)*["']use client["']/;
const importSpecifier = /(?:from|import)\s*\(?\s*["']([^"']+)["']/g;

function resolveImport(specifier, from, files) {
  const base = specifier.startsWith("@/")
    ? `src/${specifier.slice(2)}`
    : specifier.startsWith(".")
      ? posix.normalize(posix.join(posix.dirname(from), specifier))
      : null;
  if (!base) return null;
  return [".tsx", ".ts", "/index.tsx", "/index.ts"]
    .map((suffix) => base + suffix)
    .find((candidate) => files.has(candidate));
}

/** `sources` maps repository-relative POSIX paths to file text. */
export function inspectRedundantUseClient(sources) {
  const files = new Set(Object.keys(sources));
  const importers = new Map();
  for (const [file, text] of Object.entries(sources)) {
    if (testFile.test(file)) continue;
    for (const match of text.matchAll(importSpecifier)) {
      const target = resolveImport(match[1], file, files);
      if (!target) continue;
      importers.set(target, [...(importers.get(target) ?? []), file]);
    }
  }
  const errors = [];
  for (const [file, text] of Object.entries(sources)) {
    if (!ownedScope.test(file) || testFile.test(file) || !directive.test(text))
      continue;
    const stem = file
      .split("/")
      .at(-1)
      .replace(/\.tsx?$/, "");
    if (keepsDirective.test(stem)) continue;
    const parents = importers.get(file) ?? [];
    if (parents.length && parents.every((p) => directive.test(sources[p]))) {
      errors.push(
        `${file}: "use client" is redundant, only client modules import it (${parents.join(", ")}). Remove the directive; it is a neutral module of the client graph (Next.js use-client docs).`,
      );
    }
  }
  return errors;
}

export function checkRedundantUseClient(base) {
  const sources = {};
  for (const file of globSync("src/**/*.{ts,tsx}", { cwd: base })) {
    const path = file.replaceAll("\\", "/");
    sources[path] = readFileSync(resolve(base, file), "utf8");
  }
  return inspectRedundantUseClient(sources);
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const errors = checkRedundantUseClient(
    resolve(dirname(fileURLToPath(import.meta.url)), "../.."),
  );
  if (errors.length) {
    console.error(errors.join("\n"));
    process.exit(1);
  }
  console.log("No redundant use client directives.");
}
