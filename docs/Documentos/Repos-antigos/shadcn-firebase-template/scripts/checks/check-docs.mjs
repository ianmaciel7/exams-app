import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const historicalSource = "docs/adr/0003-configure-theming.md";
const historicalTarget = "src/components/ui/extensions/theme-provider.tsx";
const currentTarget = "src/components/ui/extensions/theme-provider-client.tsx";

function prose(source) {
  return source
    .replace(
      /^ {0,3}(`{3,}|~{3,})[^\n]*\n[\s\S]*?^ {0,3}\1[ \t]*$/gm,
      (block) => block.replace(/[^\n]/g, " "),
    )
    .replace(/(`+)[^\n]*?\1/g, (code) => " ".repeat(code.length));
}

function headingIds(source) {
  const counts = new Map();
  return new Set(
    [...source.matchAll(/^#{1,6}\s+(.+)$/gm)].map((match) => {
      const base = match[1]
        .toLowerCase()
        .replace(/[^\p{L}\p{N}_\s-]/gu, "")
        .replace(/\s/g, "-");
      const count = counts.get(base) ?? 0;
      counts.set(base, count + 1);
      return count ? `${base}-${count}` : base;
    }),
  );
}

function historicalReplacement(root, file, target) {
  return (
    file === historicalSource &&
    relative(root, target).split(sep).join("/") === historicalTarget &&
    existsSync(resolve(root, currentTarget))
  );
}

function inspectTarget(root, file, href) {
  if (/^(?:[a-z][\w+.-]*:|\/\/)/i.test(href)) return;
  const [path, fragment] = href.split("#");
  const target = path
    ? resolve(root, dirname(file), decodeURIComponent(path))
    : resolve(root, file);
  if (!existsSync(target)) {
    if (historicalReplacement(root, file, target)) return;
    return `Missing link target: ${href}`;
  }
  if (fragment && target.endsWith(".md")) {
    const headings = headingIds(readFileSync(target, "utf8"));
    if (!headings.has(decodeURIComponent(fragment))) {
      return `Missing heading anchor: ${href}`;
    }
  }
}

export function inspectLinks(root, file, source) {
  const text = prose(source);
  const issues = [];
  const links = text.matchAll(
    /!?\[[^\]\n]*\]\((<[^>\n]+>|[^)\s]+)(?:\s+"[^"]*")?\)/g,
  );
  for (const match of links) {
    const href = match[1].replace(/^<|>$/g, "");
    let issue;
    try {
      issue = inspectTarget(root, file, href);
    } catch {
      issue = `Unreadable link target: ${href}`;
    }
    if (issue) {
      const line = text.slice(0, match.index).split("\n").length;
      issues.push(`${file}:${line} ${issue}`);
    }
  }
  return issues;
}

export function inspectSkillInventory(files, inventory) {
  const installed = new Set(
    files.flatMap((file) => {
      const match = file.match(/^\.agents\/skills\/([^/]+)\/SKILL\.md$/);
      return match ? [match[1]] : [];
    }),
  );
  const listed = new Set(
    [...inventory.matchAll(/^\| ([a-z][a-z0-9-]+) \|/gm)].map(
      (match) => match[1],
    ),
  );
  return [
    ...[...installed]
      .filter((name) => !listed.has(name))
      .map((name) => `Missing skill inventory entry: ${name}`),
    ...[...listed]
      .filter((name) => !installed.has(name))
      .map((name) => `Obsolete skill inventory entry: ${name}`),
  ];
}

function ownedDocument(file) {
  if (!file.endsWith(".md")) return false;
  if (file.startsWith("graphify-out/") || file.startsWith(".serena/")) {
    return false;
  }
  return (
    !file.startsWith(".agents/skills/") || file === ".agents/skills/README.md"
  );
}

export function checkDocumentation(root) {
  const files = execFileSync("git", ["ls-files", "-z"], {
    cwd: root,
    encoding: "utf8",
  })
    .split("\0")
    .filter(Boolean);
  const documents = files.filter(ownedDocument);
  const issues = documents.flatMap((file) =>
    inspectLinks(root, file, readFileSync(resolve(root, file), "utf8")),
  );
  const inventory = readFileSync(
    resolve(root, ".agents/skills/README.md"),
    "utf8",
  );
  issues.push(...inspectSkillInventory(files, inventory));
  return { documents: documents.length, issues };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
  const result = checkDocumentation(root);
  if (result.issues.length) {
    console.error(result.issues.join("\n"));
    process.exitCode = 1;
  } else {
    console.log(`Documentation integrity passed: ${result.documents} files.`);
  }
}
