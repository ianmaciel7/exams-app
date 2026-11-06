import { globSync, readFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// `src/lib/<name>.ts` is the single owner of the Next.js module `next/<name>`.
// It is detected, never listed: any non-test lib module directly under
// `src/lib` that imports or re-exports from `next/<name>` (headers,
// navigation, server, and any module added later) owns that Next.js module.
// Every other source file must import from `@/lib/<name>` instead, so the
// project has one place to wrap, constrain and mock each Next.js surface.

const ownerPattern = /^src\/lib\/([a-z][a-z0-9-]*)\.tsx?$/;
const testPattern = /\.(?:test|spec|stories)\.[cm]?[jt]sx?$/;
const specifier = (name) =>
  new RegExp(
    String.raw`(?:from|import)\s*\(?\s*["']next/${name}["']|require\(\s*["']next/${name}["']\s*\)`,
  );

/**
 * `sources` maps repository-relative POSIX paths to file text. Returns one
 * message per file that imports a Next.js module owned by a lib module.
 */
export function inspectLibOwnership(sources) {
  const files = Object.keys(sources).filter((file) => !testPattern.test(file));
  const owners = new Map();
  for (const file of files) {
    const name = ownerPattern.exec(file)?.[1];
    if (name && specifier(name).test(sources[file])) owners.set(name, file);
  }
  const errors = [];
  for (const [name, owner] of owners) {
    const pattern = specifier(name);
    for (const file of files) {
      if (file !== owner && pattern.test(sources[file])) {
        errors.push(
          `${file}: import from "@/lib/${name}" instead of "next/${name}"; ${owner} owns that Next.js module. Re-export what is missing from the owner.`,
        );
      }
    }
  }
  return errors;
}

export function checkLibOwnership(root) {
  const sources = {};
  for (const file of globSync("src/**/*.{ts,tsx}", { cwd: root })) {
    const path = file.replaceAll("\\", "/");
    if (path.endsWith(".d.ts") || basename(path) === "next-env.d.ts") continue;
    sources[path] = readFileSync(resolve(root, file), "utf8");
  }
  return inspectLibOwnership(sources);
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const errors = checkLibOwnership(
    fileURLToPath(new URL("../../", import.meta.url)),
  );
  if (errors.length) {
    console.error(errors.join("\n"));
    process.exit(1);
  }
  console.log(
    "Each Next.js module is imported only through its src/lib owner.",
  );
}
