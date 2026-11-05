import { readdirSync } from "node:fs";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

// A colocated unit test is named after the file it tests: `page.tsx` is
// tested by `page.test.tsx`, `dal.ts` by `dal.test.ts`. A variant suffix such
// as `.browser` is allowed (`button.browser.test.tsx` tests `button.tsx`).
// Tests that deliberately cover several modules are listed in `exceptions`
// with their reason; adding one needs review.

const roots = ["src", "scripts", "functions", ".agents"];
const skipped = new Set(["node_modules", ".next", "dist", "coverage"]);
const testPattern = /^(.+?)(?:\.[a-z]+)?\.test\.(?:[cm]?[jt]sx?)$/;
const sourcePattern = /^(.+)\.(?:[cm]?[jt]sx?)$/;

export const exceptions = new Map([
  [
    "src/app/(protected)/routes.test.tsx",
    "route contract suite (see review-route-test-sdk-mock)",
  ],
  [
    "src/app/(public)/routes.test.tsx",
    "route contract suite spanning sign-in, register and recovery pages",
  ],
  [
    "src/components/ai-elements/review-findings.test.tsx",
    "review suite over many ai-elements modules",
  ],
  [
    "src/components/ai-elements/review-findings.browser.test.tsx",
    "review suite over many ai-elements modules",
  ],
  [
    "src/lib/firebase/auth-service-worker.test.ts",
    "tests public/firebase-auth-sw.js, which is not a module of src/lib",
  ],
  ["src/messages/messages.test.ts", "contract suite over the JSON catalogs"],
  [
    "scripts/ci/check-results.test.mjs",
    "tests the jq predicate inside .github/workflows/ci.yml",
  ],
  [
    "functions/public-surface.test.cjs",
    "contract suite over the exports of functions/index.js",
  ],
]);

function walk(dir, root, found = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (skipped.has(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path, root, found);
    else found.push(relative(root, path).split(sep).join("/"));
  }
  return found;
}

/**
 * Returns one message per test file whose base name matches no sibling
 * source file. `files` are repository-relative POSIX paths.
 */
export function inspectTestNames(files, allowed = exceptions) {
  const present = new Set(files);
  const errors = [];
  for (const file of files) {
    const name = basename(file);
    const match = testPattern.exec(name);
    if (!match || allowed.has(file)) continue;
    const dir = dirname(file);
    const subject = match[1];
    const hasSubject = files.some((candidate) => {
      if (dirname(candidate) !== dir || candidate === file) return false;
      const sibling = basename(candidate);
      if (testPattern.test(sibling)) return false;
      return sourcePattern.exec(sibling)?.[1] === subject;
    });
    if (!hasSubject) {
      errors.push(
        `${file}: no sibling source named "${subject}.*" in ${dir}/. Name the test after the file it tests (page.tsx -> page.test.tsx) or list it in exceptions with a reason.`,
      );
    }
  }
  for (const file of allowed.keys()) {
    if (!present.has(file)) {
      errors.push(`${file}: stale entry in the test-name exceptions.`);
    }
  }
  return errors;
}

export function checkTestNames(root) {
  const files = roots.flatMap((name) => {
    try {
      return walk(join(root, name), root);
    } catch {
      return [];
    }
  });
  return inspectTestNames(files);
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const errors = checkTestNames(
    fileURLToPath(new URL("../../", import.meta.url)),
  );
  if (errors.length) {
    console.error(errors.join("\n"));
    process.exit(1);
  }
  console.log("Test files are named after the modules they test.");
}
