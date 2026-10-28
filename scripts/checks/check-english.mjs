import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const textExtensions = /\.(md|mdx|ts|tsx|js|jsx|mjs|cjs|yml|yaml|css)$/;
// Localized content and generated or vendored output are intentionally exempt.
const exemptPaths = [
  /^src\/messages\//,
  /^graphify-out\//,
  /^\.gemini\//,
  /^playwright-report\//,
  /^test-results\//,
  /^reports\//,
  /^pnpm-lock\.yaml$/,
  /^scripts\/checks\/check-english(\.test)?\.mjs$/,
  /^\.agents\/skills\/save\/SKILL\.md$/,
];
const accentedPattern = /[ãõçÃÕÇ]/;
const markerWords = new Set([
  "não",
  "uma",
  "para",
  "com",
  "são",
  "está",
  "também",
  "isso",
  "pelo",
  "pela",
  "dos",
  "das",
  "foi",
  "sem",
  "sobre",
  "deve",
  "mais",
  "quando",
  "arquivo",
  "arquivos",
  "revisão",
  "classificação",
  "conclusão",
  "identificação",
  "escopo",
  "nenhum",
  "problemas",
  "riscos",
  "recomendações",
]);

function stripCode(line) {
  return line.replace(/`[^`]*`/g, " ").replace(/\(https?:[^)]*\)/g, " ");
}

function isPortuguese(line) {
  const text = stripCode(line);
  if (accentedPattern.test(text)) return true;
  const words = text.toLowerCase().match(/[a-zà-ú]+/g) ?? [];
  const hits = new Set(words.filter((word) => markerWords.has(word)));
  return hits.size >= 2;
}

function findViolations(path, source) {
  const violations = [];
  const lines = source.split(/\r?\n/);
  for (const [index, line] of lines.entries()) {
    if (!line.includes("check-english-ignore") && isPortuguese(line))
      violations.push({ line: index + 1, path });
  }
  return violations;
}

function isChecked(path) {
  return (
    textExtensions.test(path) && !exemptPaths.some((rule) => rule.test(path))
  );
}

function trackedFiles(root) {
  const output = execFileSync("git", ["ls-files", "-z"], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  return output.split("\0").filter(Boolean);
}

function run(root) {
  const violations = [];
  for (const path of trackedFiles(root).filter(isChecked)) {
    let source;
    try {
      source = readFileSync(resolve(root, path), "utf8");
    } catch {
      continue;
    }
    violations.push(...findViolations(path, source));
  }
  return violations;
}

export { findViolations, isChecked, isPortuguese };

function report(root, violations) {
  for (const { line, path } of violations) {
    console.error(
      `${relative(root, resolve(root, path))}:${line} non-English text`,
    );
  }
  if (violations.length > 0) {
    console.error(
      `
${violations.length} line(s) not in English. See .agents/rules/README.md.`,
    );
    process.exit(1);
  }
}

function checkFiles(root, paths) {
  const violations = [];
  const relativePaths = paths.map((path) =>
    relative(root, resolve(root, path)).split(sep).join("/"),
  );
  for (const path of relativePaths.filter(isChecked)) {
    try {
      violations.push(
        ...findViolations(path, readFileSync(resolve(root, path), "utf8")),
      );
    } catch {
      // Deleted or unreadable paths are not language violations.
    }
  }
  return violations;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = resolve(fileURLToPath(import.meta.url), "..", "..", "..");
  const [first, ...rest] = process.argv.slice(2);
  let violations;
  if (first === "--message") {
    // Commit messages are checked by the commit-msg hook.
    violations = findViolations(rest[0], readFileSync(rest[0], "utf8"));
  } else if (first === undefined) {
    violations = run(root);
  } else {
    violations = checkFiles(root, [first, ...rest]);
  }
  report(root, violations);
  console.log("check:english passed");
}
