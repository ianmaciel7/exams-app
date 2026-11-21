import path from "node:path";

// Limits are owned by AGENTS.md "Operating contract".
export const AGENTS_TARGET_CHARS = 12000;
export const AGENTS_MAX_BYTES = 16000;

const EXCLUDED_SEGMENTS = new Set([
  "node_modules",
  ".worktrees",
  "graphify-out",
  "generated",
  ".next",
]);

// Roots that legitimately may not exist on a clean checkout (generated,
// machine-local, or optional outputs), so docs may mention them freely.
const IGNORED_ROOTS = new Set([
  ".git",
  ".next",
  ".codex",
  ".gemini",
  ".vscode",
  ".cursor",
  ".windsurf",
  ".serena",
  "coverage",
  "dist",
  "build",
  "out",
  "graphify-out",
  "node_modules",
  "tasks",
  ".worktrees",
  ".claude",
]);
const IGNORED_PATH_PREFIXES = [
  ".agents/generated",
  ".agents/local.json",
  ".agents/mcp_config.json",
];
const KNOWN_ROOTS = new Set(["src", "scripts", "docs", ".agents"]);

const PNPM_BUILTINS = new Set([
  "add",
  "approve-builds",
  "audit",
  "bin",
  "cache",
  "completion",
  "config",
  "create",
  "dedupe",
  "deploy",
  "dlx",
  "doctor",
  "env",
  "exec",
  "fetch",
  "help",
  "i",
  "import",
  "init",
  "install",
  "licenses",
  "link",
  "list",
  "ls",
  "outdated",
  "pack",
  "patch",
  "patch-commit",
  "pkg",
  "prune",
  "publish",
  "rebuild",
  "remove",
  "rm",
  "root",
  "self-update",
  "setup",
  "store",
  "uninstall",
  "unlink",
  "up",
  "update",
  "upgrade",
  "version",
  "why",
]);

const EXTERNAL_TARGET = /^([a-z][a-z0-9+.-]*:|\/\/)/i;

export function isDocInScope(rel, remoteSkills = new Set()) {
  if (!rel.endsWith(".md")) {
    return false;
  }
  const parts = rel.split("/");
  if (parts.some((part) => EXCLUDED_SEGMENTS.has(part))) {
    return false;
  }
  if (parts.length === 1 || parts[0] === "docs") {
    return true;
  }
  if (parts[0] !== ".agents") {
    return false;
  }
  if (parts[1] !== "skills") {
    return true;
  }
  if (parts.length === 3) {
    return parts[2] === "README.md";
  }
  const [, , skill, ...rest] = parts;
  return (
    !remoteSkills.has(skill) && rest.length === 1 && rest[0] === "SKILL.md"
  );
}

function finding(severity, rule, file, line, message) {
  return { severity, rule, file, line, message };
}

function fenceMarker(raw) {
  return raw.trim().match(/^(```+|~~~+)/)?.[1]?.[0] ?? null;
}

function scanLines(text) {
  const lines = [];
  let fence = null;
  text.split(/\r?\n/).forEach((raw, index) => {
    const marker = fenceMarker(raw);
    const opens = marker !== null && fence === null;
    const closes = marker !== null && fence === marker;
    const fenced = fence !== null || opens;
    if (opens) {
      fence = marker;
    } else if (closes) {
      fence = null;
    }
    lines.push({ n: index + 1, text: raw, fenced });
  });
  return lines;
}

function inlineCodeTokens(line) {
  return [...line.matchAll(/`([^`\n]+)`/g)].map((match) => match[1].trim());
}

export function slugify(heading) {
  return heading
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[`*]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, "")
    .replace(/\s/g, "-");
}

export function headingSlugs(text) {
  const seen = new Map();
  const slugs = new Set();
  for (const line of scanLines(text)) {
    const match = line.fenced
      ? null
      : line.text.match(/^#{1,6}\s+(.*?)\s*#*\s*$/);
    if (!match) {
      continue;
    }
    const base = slugify(match[1]);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    slugs.add(count === 0 ? base : `${base}-${count}`);
  }
  return slugs;
}

function resolveFrom(file, target) {
  const joined = path.posix.normalize(
    path.posix.join(path.posix.dirname(file), target)
  );
  return joined.startsWith("../") || joined === ".." ? null : joined;
}

function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function linkTargets(text) {
  const found = [];
  for (const line of scanLines(text)) {
    if (line.fenced) {
      continue;
    }
    const bare = line.text.replace(/`[^`\n]*`/g, "");
    for (const match of bare.matchAll(
      /\[[^\]]*\]\(<?([^)\s>]+)>?(?:\s+"[^"]*")?\)/g
    )) {
      found.push({ n: line.n, target: match[1] });
    }
  }
  return found;
}

function checkLinkTarget(ctx, file, { n, target }, slugsOf) {
  if (EXTERNAL_TARGET.test(target)) {
    return [];
  }
  const [rawPath, rawAnchor] = target.split("#");
  const pathPart = safeDecode(rawPath.split("?")[0]);
  const resolved = pathPart === "" ? file : resolveFrom(file, pathPart);
  if (resolved === null || !ctx.exists(resolved)) {
    return [
      finding(
        "error",
        "broken-link",
        file,
        n,
        `link target not found: ${target}`
      ),
    ];
  }
  if (!rawAnchor || !ctx.files.has(resolved)) {
    return [];
  }
  if (slugsOf(resolved).has(safeDecode(rawAnchor).toLowerCase())) {
    return [];
  }
  return [
    finding(
      "error",
      "broken-anchor",
      file,
      n,
      `anchor not found in ${resolved}: #${rawAnchor}`
    ),
  ];
}

export function checkLinks(ctx) {
  const slugCache = new Map();
  const slugsOf = (file) => {
    if (!slugCache.has(file)) {
      slugCache.set(file, headingSlugs(ctx.files.get(file)));
    }
    return slugCache.get(file);
  };
  return [...ctx.files].flatMap(([file, text]) =>
    linkTargets(text).flatMap((link) =>
      checkLinkTarget(ctx, file, link, slugsOf)
    )
  );
}

function cleanToken(token) {
  return token.replace(/:\d+(?:-\d+)?$/, "").replace(/[,;.]+$/, "");
}

function isPlainPath(token) {
  return (
    token.length > 0 &&
    !/[<>*{}$|\s()\\]|\.\.\.|YYYY|N{4,}|X{4,}|^~|^@|^[a-z]+:\/\//i.test(token)
  );
}

// Paths named as examples or as things not to create are not claims that the
// file exists, so lines like these are exempt from the missing-path check.
const ILLUSTRATIVE_LINE =
  /\be\.g\.|\bi\.e\.|\bfor example\b|\bsuch as\b|\bnever\b|\bdo not\b|\bdon't\b/i;

function isIgnoredPath(normalized) {
  return (
    IGNORED_ROOTS.has(normalized.split("/")[0]) ||
    IGNORED_PATH_PREFIXES.some((prefix) => normalized.startsWith(prefix))
  );
}

function resolvesAnywhere(ctx, file, token, normalized) {
  return [normalized, resolveFrom(file, token)].some(
    (candidate) => candidate && ctx.exists(candidate)
  );
}

// Returns the token when it names a repo path that does not exist.
function missingInlinePath(ctx, file, raw) {
  const token = cleanToken(raw);
  if (!isPlainPath(token)) {
    return null;
  }
  const normalized = token.replace(/^\.\//, "");
  if (!normalized.includes("/")) {
    return null;
  }
  const first = normalized.split("/")[0];
  const knownRoot = ctx.topLevel.has(first) || KNOWN_ROOTS.has(first);
  if (!knownRoot || isIgnoredPath(normalized)) {
    return null;
  }
  return resolvesAnywhere(ctx, file, token, normalized) ? null : token;
}

function fencedPathTokens(text) {
  return [
    ...text.matchAll(
      /(?<![\w/.-])((?:scripts|\.agents)\/[\w./-]+\.(?:mjs|cjs|js|ts|json|md))/g
    ),
  ]
    .map((match) => match[1])
    .filter((token) => !isIgnoredPath(token));
}

function missingPathsInLine(ctx, file, line) {
  if (line.fenced) {
    return fencedPathTokens(line.text).filter((token) => !ctx.exists(token));
  }
  if (ILLUSTRATIVE_LINE.test(line.text)) {
    return [];
  }
  return inlineCodeTokens(line.text)
    .map((raw) => missingInlinePath(ctx, file, raw))
    .filter(Boolean);
}

function missingPathFindings(ctx, file, text) {
  const seen = new Set();
  const findings = [];
  for (const line of scanLines(text)) {
    for (const token of missingPathsInLine(ctx, file, line)) {
      if (seen.has(token)) {
        continue;
      }
      seen.add(token);
      findings.push(
        finding(
          "error",
          "missing-path",
          file,
          line.n,
          `path not found: ${token}`
        )
      );
    }
  }
  return findings;
}

export function checkCodePaths(ctx) {
  return [...ctx.files].flatMap(([file, text]) =>
    missingPathFindings(ctx, file, text)
  );
}

function pnpmInvocations(chunk) {
  const found = [];
  for (const match of chunk.matchAll(/\bpnpm\s+(run\s+)?([A-Za-z][\w:.-]*)/g)) {
    const name = match[2].replace(/[.:-]+$/, "");
    if (match[1] || !PNPM_BUILTINS.has(name)) {
      found.push({ name, explicitRun: Boolean(match[1]) });
    }
  }
  return found;
}

// `pnpm <name>` falls back to an installed bin when no script matches.
function isResolvable(ctx, { name, explicitRun }) {
  if (ctx.packageScripts.has(name)) {
    return true;
  }
  return !explicitRun && ctx.exists(`node_modules/.bin/${name}`);
}

function commandFindings(ctx, file, text) {
  const seen = new Set();
  const findings = [];
  for (const line of scanLines(text)) {
    const chunks = line.fenced ? [line.text] : inlineCodeTokens(line.text);
    for (const invocation of chunks.flatMap(pnpmInvocations)) {
      const { name } = invocation;
      if (isResolvable(ctx, invocation) || seen.has(name)) {
        continue;
      }
      seen.add(name);
      findings.push(
        finding(
          "error",
          "missing-script",
          file,
          line.n,
          `package.json has no script "${name}"`
        )
      );
    }
  }
  return findings;
}

export function checkCommands(ctx) {
  return [...ctx.files].flatMap(([file, text]) =>
    commandFindings(ctx, file, text)
  );
}

const ABSOLUTE_PATH_PATTERNS = [
  /[A-Za-z]:[\\/]+Users[\\/]+[A-Za-z0-9_-]+/,
  /\/home\/[a-z0-9_-]+\//,
  /\/Users\/[A-Za-z0-9_-]+\//,
];

export function checkAbsolutePaths(ctx) {
  const findings = [];
  for (const [file, text] of ctx.files) {
    for (const line of scanLines(text)) {
      if (!ABSOLUTE_PATH_PATTERNS.some((p) => p.test(line.text))) {
        continue;
      }
      findings.push(
        finding(
          "error",
          "absolute-path",
          file,
          line.n,
          "hardcoded absolute machine path (use repo-relative paths)"
        )
      );
    }
  }
  return findings;
}

function firstNonAsciiLetter(text) {
  return [...text].find((ch) => ch.codePointAt(0) > 0x7f && /\p{L}/u.test(ch));
}

// One finding per file: a glossary of product terms can span many lines and
// the reviewer only needs to know where to look.
export function checkLanguage(ctx) {
  const findings = [];
  for (const [file, text] of ctx.files) {
    const hits = scanLines(text)
      .map((line) => ({ n: line.n, ch: firstNonAsciiLetter(line.text) }))
      .filter((hit) => hit.ch);
    if (hits.length === 0) {
      continue;
    }
    findings.push(
      finding(
        "warn",
        "non-english",
        file,
        hits[0].n,
        `${hits.length} line(s) with non-ASCII letters, first "${hits[0].ch}" (docs must be English unless requested; confirm these are intentional product terms)`
      )
    );
  }
  return findings;
}

export function checkAgentsSize(ctx) {
  const findings = [];
  for (const [file, text] of ctx.files) {
    if (path.posix.basename(file) !== "AGENTS.md") {
      continue;
    }
    const bytes = Buffer.byteLength(text, "utf8");
    if (bytes > AGENTS_MAX_BYTES) {
      findings.push(
        finding(
          "error",
          "agents-size",
          file,
          1,
          `${bytes} bytes exceeds the ${AGENTS_MAX_BYTES}-byte hard maximum`
        )
      );
    } else if (text.length > AGENTS_TARGET_CHARS) {
      findings.push(
        finding(
          "warn",
          "agents-size",
          file,
          1,
          `${text.length} chars exceeds the ${AGENTS_TARGET_CHARS}-char target`
        )
      );
    }
  }
  return findings;
}

function frontmatter(text) {
  return text.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? null;
}

function skillFrontmatterFindings(dir, text) {
  const file = `.agents/skills/${dir}/SKILL.md`;
  const fm = frontmatter(text);
  if (fm === null) {
    return [
      finding(
        "error",
        "skill-frontmatter",
        file,
        1,
        "missing YAML frontmatter"
      ),
    ];
  }
  const findings = [];
  const name = fm.match(/^name:\s*["']?([^"'\r\n]+?)["']?\s*$/m)?.[1];
  if (name !== dir) {
    findings.push(
      finding(
        "error",
        "skill-frontmatter",
        file,
        2,
        `name "${name ?? ""}" must equal directory "${dir}"`
      )
    );
  }
  const description = fm.match(/^description:\s*(.*)$/m)?.[1]?.trim() ?? "";
  if (!description) {
    findings.push(
      finding(
        "error",
        "skill-frontmatter",
        file,
        2,
        "description is missing or empty"
      )
    );
  }
  return findings;
}

function routedSkills(agentsText) {
  const routed = new Set();
  let inSection = false;
  for (const line of agentsText.split(/\r?\n/)) {
    if (/^##\s+Skill routing/i.test(line)) {
      inSection = true;
    } else if (inSection && /^##\s/.test(line)) {
      break;
    } else if (inSection && line.startsWith("|")) {
      const last = line
        .split("|")
        .map((c) => c.trim())
        .filter(Boolean)
        .at(-1);
      for (const name of inlineCodeTokens(last ?? "")) {
        routed.add(name);
      }
    }
  }
  return routed;
}

function skillRoutingFindings(ctx, agentsText) {
  const routed = routedSkills(agentsText);
  if (routed.size === 0) {
    return [];
  }
  const all = new Set(ctx.allSkills);
  const findings = [];
  for (const name of routed) {
    if (all.has(name)) {
      continue;
    }
    findings.push(
      finding(
        "error",
        "missing-skill",
        "AGENTS.md",
        1,
        `routed skill "${name}" has no .agents/skills/${name}/SKILL.md`
      )
    );
  }
  for (const dir of ctx.projectSkills) {
    if (routed.has(dir)) {
      continue;
    }
    findings.push(
      finding(
        "warn",
        "unrouted-skill",
        "AGENTS.md",
        1,
        `project skill "${dir}" is missing from the Skill routing table`
      )
    );
  }
  return findings;
}

export function checkSkills(ctx) {
  const findings = ctx.projectSkills.flatMap((dir) => {
    const text = ctx.files.get(`.agents/skills/${dir}/SKILL.md`);
    return text === undefined ? [] : skillFrontmatterFindings(dir, text);
  });
  const agents = ctx.files.get("AGENTS.md");
  return agents === undefined
    ? findings
    : [...findings, ...skillRoutingFindings(ctx, agents)];
}

function adrFileFindings(file, text) {
  const findings = [];
  const match = path.posix
    .basename(file)
    .match(/^(\d{4})-[a-z0-9]+(?:-[a-z0-9]+)*\.md$/);
  if (!match) {
    findings.push(
      finding(
        "error",
        "adr-naming",
        file,
        1,
        "ADR filename must be NNNN-kebab-case.md"
      )
    );
  }
  if (
    !text
      .split(/\r?\n/)
      .find((l) => l.trim())
      ?.startsWith("# ")
  ) {
    findings.push(
      finding("error", "adr-title", file, 1, "ADR must start with a `# ` title")
    );
  }
  return { findings, number: match ? Number(match[1]) : null };
}

function checkAdrs(ctx) {
  const adrs = [...ctx.files.keys()]
    .filter(
      (f) => /^docs\/adr\/[^/]+\.md$/.test(f) && !f.endsWith("/README.md")
    )
    .sort();
  const findings = [];
  const numbers = [];
  for (const file of adrs) {
    const result = adrFileFindings(file, ctx.files.get(file));
    findings.push(...result.findings);
    if (result.number !== null) {
      numbers.push(result.number);
    }
  }
  const gap = numbers.findIndex((num, index) => num !== index + 1);
  if (gap >= 0) {
    findings.push(
      finding(
        "error",
        "adr-sequence",
        "docs/adr",
        1,
        `ADR numbers must be unique and contiguous from 0001 (found ${String(numbers[gap]).padStart(4, "0")} at position ${gap + 1})`
      )
    );
  }
  return findings;
}

function h2Set(text) {
  return new Set(
    scanLines(text)
      .filter((l) => !l.fenced)
      .map((l) => l.text.match(/^##\s+(.*?)\s*$/)?.[1])
      .filter(Boolean)
  );
}

function planStatusFindings(file, state, text) {
  const status = text.match(/^\*\*Status:\*\*\s*(.+?)\s*$/m)?.[1] ?? "";
  const done = /complete/i.test(status);
  if (state === "completed" && !done) {
    return [
      finding(
        "error",
        "plan-status",
        file,
        1,
        `plan is in completed/ but Status is "${status || "missing"}"`
      ),
    ];
  }
  if (state === "active" && done) {
    return [
      finding(
        "error",
        "plan-status",
        file,
        1,
        "plan Status is Completed but it is still in active/"
      ),
    ];
  }
  return [];
}

function planHygieneFindings(file, state, text) {
  const findings = [];
  if (/<short title>|YYYY-MM-DD/.test(text)) {
    findings.push(
      finding(
        "warn",
        "plan-placeholder",
        file,
        1,
        "template placeholder text left in plan"
      )
    );
  }
  if (state === "completed" && /^\s*- \[ \]/m.test(text)) {
    findings.push(
      finding(
        "warn",
        "plan-open-items",
        file,
        1,
        "completed plan still has unchecked items"
      )
    );
  }
  return findings;
}

function planFindings(file, state, text, required) {
  const have = h2Set(text);
  const missing = required
    .filter((section) => !have.has(section))
    .map((section) =>
      finding(
        "error",
        "plan-sections",
        file,
        1,
        `missing template section "## ${section}"`
      )
    );
  return [
    ...missing,
    ...planStatusFindings(file, state, text),
    ...planHygieneFindings(file, state, text),
  ];
}

function checkPlans(ctx) {
  const template = ctx.files.get("docs/exec-plans/template.md");
  const required = template ? [...h2Set(template)] : [];
  const findings = [];
  for (const [file, text] of ctx.files) {
    const match = file.match(
      /^docs\/exec-plans\/(active|completed)\/([^/]+)\.md$/
    );
    if (!match || match[2] === "README") {
      continue;
    }
    findings.push(...planFindings(file, match[1], text, required));
  }
  return findings;
}

function checkSpecIndex(ctx) {
  const indexFile = "docs/product-specs/index.md";
  const index = ctx.files.get(indexFile);
  if (index === undefined) {
    return [];
  }
  const unreferenced = [...ctx.files.keys()]
    .map((file) => file.match(/^docs\/product-specs\/([^/]+\.md)$/)?.[1])
    .filter((name) => name && name !== "index.md" && !index.includes(name))
    .map((name) =>
      finding(
        "error",
        "spec-index",
        indexFile,
        1,
        `index does not reference ${name}`
      )
    );
  const dangling = scanLines(index)
    .filter((line) => !line.fenced)
    .flatMap((line) =>
      inlineCodeTokens(line.text)
        .filter((token) => /^[a-z0-9][\w.-]*\.md$/.test(token))
        .filter((token) => !ctx.exists(`docs/product-specs/${token}`))
        .map((token) =>
          finding(
            "error",
            "spec-index",
            indexFile,
            line.n,
            `index references missing file ${token}`
          )
        )
    );
  return [...unreferenced, ...dangling];
}

function linkedFiles(ctx) {
  const linked = new Map();
  for (const [file, text] of ctx.files) {
    for (const { target } of linkTargets(text)) {
      if (target.startsWith("#") || EXTERNAL_TARGET.test(target)) {
        continue;
      }
      const resolved = resolveFrom(file, safeDecode(target.split(/[#?]/)[0]));
      if (!resolved || resolved === file) {
        continue;
      }
      if (!linked.has(resolved)) {
        linked.set(resolved, new Set());
      }
      linked.get(resolved).add(file);
    }
  }
  return linked;
}

function isMentioned(ctx, file) {
  const base = path.posix.basename(file);
  const dir = path.posix.dirname(file);
  return [...ctx.files].some(
    ([other, text]) =>
      other !== file &&
      (text.includes(file) ||
        (path.posix.dirname(other) === dir && text.includes(base)))
  );
}

function isOrphanCandidate(file) {
  const base = path.posix.basename(file);
  return (
    file.startsWith("docs/") &&
    !/^docs\/exec-plans\/(active|completed)\//.test(file) &&
    base !== "README.md" &&
    base !== "index.md"
  );
}

function checkOrphans(ctx) {
  const linked = linkedFiles(ctx);
  return [...ctx.files.keys()]
    .filter(isOrphanCandidate)
    .filter((file) => !linked.has(file) && !isMentioned(ctx, file))
    .map((file) =>
      finding(
        "warn",
        "orphan-doc",
        file,
        1,
        "no other doc links to or mentions this file"
      )
    );
}

export function checkDocsTree(ctx) {
  return [
    ...checkAdrs(ctx),
    ...checkPlans(ctx),
    ...checkSpecIndex(ctx),
    ...checkOrphans(ctx),
  ];
}

function isDuplicateScope(file) {
  return (
    !file.includes("/") ||
    file.startsWith("docs/") ||
    file.startsWith(".agents/rules/")
  );
}

function normalizeRule(text) {
  return text
    .replace(/^\s*(?:[-*]|\d+\.)\s+(?:\[[ x]\]\s+)?/, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function duplicateCandidates(text) {
  return scanLines(text)
    .filter((l) => !l.fenced && !/^\s*(#|>|\|[\s:|-]*\|?\s*$)/.test(l.text))
    .map((l) => ({ n: l.n, key: normalizeRule(l.text) }))
    .filter((l) => l.key.length >= 90);
}

export function checkDuplicates(ctx) {
  const groups = new Map();
  for (const [file, text] of ctx.files) {
    if (!isDuplicateScope(file)) {
      continue;
    }
    for (const { n, key } of duplicateCandidates(text)) {
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push({ file, n });
    }
  }
  return [...groups.values()]
    .filter((places) => new Set(places.map((p) => p.file)).size > 1)
    .map(([first, ...rest]) =>
      finding(
        "warn",
        "duplicate-rule",
        first.file,
        first.n,
        `line repeated verbatim in ${rest.map((p) => `${p.file}:${p.n}`).join(", ")} (keep one canonical owner, point from the others)`
      )
    );
}

export function checkScriptDocs(ctx) {
  const corpus = [...ctx.files.values()].join("\n");
  return ctx.scriptFiles
    .filter((name) => /\.(mjs|cjs|js)$/.test(name))
    .filter((name) => !/-lib\.mjs$|\.test\.mjs$/.test(name))
    .filter((name) => !corpus.includes(name))
    .map((name) =>
      finding(
        "warn",
        "undocumented-script",
        `scripts/${name}`,
        1,
        "entry script is not mentioned in any documentation"
      )
    );
}

export function runChecks(ctx) {
  return [
    ...checkLinks(ctx),
    ...checkCodePaths(ctx),
    ...checkCommands(ctx),
    ...checkAbsolutePaths(ctx),
    ...checkLanguage(ctx),
    ...checkAgentsSize(ctx),
    ...checkSkills(ctx),
    ...checkDocsTree(ctx),
    ...checkDuplicates(ctx),
    ...checkScriptDocs(ctx),
  ].sort(
    (a, b) =>
      a.file.localeCompare(b.file) ||
      a.line - b.line ||
      a.rule.localeCompare(b.rule)
  );
}

export function summarize(findings) {
  return {
    errors: findings.filter((f) => f.severity === "error").length,
    warnings: findings.filter((f) => f.severity === "warn").length,
  };
}

export function formatFindings(findings) {
  return findings
    .map(
      (f) =>
        `${f.severity === "error" ? "error" : "warn "} ${f.rule.padEnd(18)} ${f.file}:${f.line}  ${f.message}`
    )
    .join("\n");
}
