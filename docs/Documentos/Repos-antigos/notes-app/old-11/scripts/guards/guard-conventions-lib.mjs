import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { isApplicationComponentPath } from "./component-scope-lib.mjs";

// `src/components/ui/` and `src/components/firebase/` are registry-installed and
// intentionally excluded from project-wide convention enforcement. All other
// project source is in scope.
const EXCLUDED_PREFIXES = ["src/components/ui/", "src/components/firebase/"];
const UI_PREFIX = "src/components/ui/";
const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs"]);
const STYLE_EXTENSIONS = new Set([...SOURCE_EXTENSIONS, ".css"]);
const TSX_ONLY = new Set([".tsx"]);

// Next.js route/config entrypoints that the framework requires to default-export.
const DEFAULT_EXPORT_ALLOWED = [
  /^src\/app\/(?:.+\/)?(?:page|layout|error|global-error|not-found|loading|template|default)\.tsx$/,
  /^src\/i18n\/request\.ts$/,
  /^src\/(?:proxy|middleware)\.ts$/,
  /\.stories\.tsx$/,
];
const STORIES = [/\.stories\.tsx$/];

const PALETTE =
  "white|black|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";
const COLOR_UTILITY =
  "bg|text|border|ring|fill|stroke|from|via|to|outline|divide|shadow|accent|caret|decoration|placeholder";
const PALETTE_CLASS = new RegExp(
  `\\b(?:${COLOR_UTILITY})-(?:${PALETTE})(?:-\\d{2,3})?(?:/\\d+)?(?![\\w-])|\\b(?:${COLOR_UTILITY})-\\[#[0-9a-fA-F]{3,8}\\]`
);
const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ROUTE_SEGMENT = /^(?:\[{1,2}(?:\.{3})?\w+\]{1,2}|\((.+)\))$/;
const MAX_FILENAME_LENGTH = 45;
const directive = (name) =>
  new RegExp(
    `^(?:\\s*(?:\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/))*\\s*["']${name}["']`
  );
const USE_CLIENT = directive("use client");
const USE_SERVER = directive("use server");
const SERVER_ACTION_FILE = /(?:^|\/)(?:[\w-]+[.-])?actions?\.tsx?$/;

function lineHits(regex, code) {
  const hits = [];
  const lines = code.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (regex.test(lines[i])) {
      hits.push({ line: i + 1 });
    }
  }
  return hits;
}

function patternRule(id, message, regex, options = {}) {
  return {
    id,
    message,
    extensions: options.extensions ?? SOURCE_EXTENSIONS,
    includeTests: options.includeTests ?? false,
    uiOnly: options.uiOnly ?? false,
    allowed: options.allowed ?? [],
    check: ({ code }) => lineHits(regex, code),
  };
}

const MAX_COMPONENT_LINES = 400;

// A name that places a component inside a surface (`space-sidebar-empty`,
// `sidebar-user-menu`) must be backed by that surface's primitive. The last
// segment is the component's own role and is exempt.
const SURFACE_TOKENS = ["sidebar", "dialog", "sheet", "drawer", "popover"];

// `data-testid="id"` or the static start of `data-testid={`id-${x}`}`.
const TESTID_ATTRIBUTE = /data-testid=(?:"([^"]*)"|\{`([^`$]*))/g;

// Arbitrary px/rem values where Tailwind's scale has an equivalent
// (`text-[13px]` -> `text-sm`, `w-[500px]` -> `w-125`).
const ARBITRARY_SCALE_VALUE =
  /\b(?:text|gap|size|[hw]|p[xytblr]?|m[xytblr]?|space-[xy])-\[-?[\d.]+(?:px|rem)\]/;

// Sized controls must use a `size` variant, never a `size-*`/`h-*` override.
const SIZE_OVERRIDE = /(?:^|[\s"'`])(?:size|h)-\d/;
const CLASS_NAME_ATTRIBUTE = /className=(?:"[^"]*"|\{[^}]*\})/;

// Index of the `>` closing the JSX opening tag that starts at `from`. Braces
// and quotes are tracked so `=>` inside an attribute expression is skipped.
function tagEnd(code, from) {
  const token = /"[^"]*"|'[^']*'|`[^`]*`|[{}>]/g;
  token.lastIndex = from;
  let depth = 0;
  for (let hit = token.exec(code); hit; hit = token.exec(code)) {
    if (hit[0] === "{") {
      depth++;
    } else if (hit[0] === "}") {
      depth--;
    } else if (hit[0] === ">" && depth === 0) {
      return hit.index;
    }
  }
  return code.length;
}

function openingTags(code, name) {
  const start = new RegExp(`<${name}(?=[\\s/>])`, "g");
  return [...code.matchAll(start)].map((match) => ({
    text: code.slice(match.index, tagEnd(code, match.index) + 1),
    line: code.slice(0, match.index).split("\n").length,
  }));
}

function isKebabSegment(segment) {
  const route = segment.match(ROUTE_SEGMENT);
  if (!route) {
    return KEBAB.test(segment);
  }
  return route[1] === undefined || KEBAB.test(route[1]);
}

export const CONVENTION_RULES = [
  patternRule(
    "no-forward-ref",
    "React 19 passes `ref` as a normal prop; do not use `forwardRef`.",
    /\bforwardRef\b/
  ),
  patternRule(
    "no-use-context",
    "Use `use(Context)` for new context access instead of `useContext`.",
    /\buseContext\s*\(/
  ),
  patternRule(
    "no-preemptive-memo",
    "React Compiler is enabled; do not add `useMemo`/`useCallback`/`memo` without a measured need.",
    /\b(?:useMemo|useCallback|memo)\s*\(/
  ),
  patternRule(
    "no-window-location",
    "Do not mutate `window.location`; use `useRouter()`, `redirect()` or `<Link>`.",
    /\bwindow\.location(?:\.href)?\s*=(?!=)|\bwindow\.location\.(?:assign|replace|reload)\s*\(/
  ),
  patternRule(
    "no-hardcoded-color",
    "Use semantic design tokens (e.g. `bg-background`, `text-foreground`) instead of palette colors or hex values.",
    PALETTE_CLASS
  ),
  patternRule(
    "no-important",
    "Avoid `!important`; fix specificity at the source.",
    /!important/,
    { extensions: STYLE_EXTENSIONS }
  ),
  patternRule(
    "use-cn-for-class-merge",
    "Merge classes with `cn()`, not template literals or string concatenation.",
    /className=\{\s*`[^`]*\$\{|className=\{\s*["'][^"']*["']\s*\+/,
    { extensions: TSX_ONLY }
  ),
  patternRule(
    "prefer-standard-scale",
    "Use the Tailwind scale instead of arbitrary px/rem values (`text-[13px]` -> `text-sm`, `w-[500px]` -> `w-125`).",
    ARBITRARY_SCALE_VALUE,
    { extensions: TSX_ONLY }
  ),
  {
    id: "button-size-variant",
    message:
      "Pick a `Button` size variant (`icon-xs`, `icon-sm`, `sm`, ...) instead of overriding it with `size-*`/`h-*` in `className`.",
    extensions: TSX_ONLY,
    includeTests: false,
    uiOnly: false,
    allowed: [],
    check: ({ code }) =>
      openingTags(code, "Button")
        .filter(({ text }) =>
          SIZE_OVERRIDE.test(text.match(CLASS_NAME_ATTRIBUTE)?.[0] ?? "")
        )
        .map(({ line }) => ({ line })),
  },
  {
    id: "name-matches-surface",
    message:
      "The file name places this component inside a surface it does not use. Name it after what it renders (e.g. `spaces-empty`, not `space-sidebar-empty`) or compose the surface primitive.",
    extensions: TSX_ONLY,
    includeTests: false,
    uiOnly: false,
    allowed: [],
    appliesTo: (relPath) => isApplicationComponentPath(relPath),
    check({ relPath, code }) {
      const stem = path.posix.basename(relPath, ".tsx");
      return stem
        .split("-")
        .slice(0, -1)
        .filter((token) => SURFACE_TOKENS.includes(token))
        .filter((token) => !code.includes(`@/components/ui/${token}"`))
        .map((token) => ({ line: 1, detail: `("${token}" in "${stem}")` }));
    },
  },
  {
    id: "testid-starts-with-component",
    message:
      "`data-testid` must start with the component's file name (`spaces-empty.tsx` -> `spaces-empty`, `spaces-empty-create-btn`), so a renamed or extracted component cannot keep a stale id.",
    extensions: TSX_ONLY,
    includeTests: false,
    uiOnly: false,
    allowed: [],
    appliesTo: (relPath) => isApplicationComponentPath(relPath),
    check({ relPath, code }) {
      const stem = path.posix.basename(relPath, ".tsx");
      const hits = [];
      for (const match of code.matchAll(TESTID_ATTRIBUTE)) {
        const id = match[1] ?? match[2];
        if (id === stem || id.startsWith(`${stem}-`)) {
          continue;
        }
        hits.push({
          line: code.slice(0, match.index).split("\n").length,
          detail: `("${id}" in "${stem}")`,
        });
      }
      return hits;
    },
  },
  {
    id: "max-component-lines",
    message: `Application components stay under ${MAX_COMPONENT_LINES} lines; split unrelated responsibilities into their own component files.`,
    extensions: TSX_ONLY,
    includeTests: false,
    uiOnly: false,
    allowed: [],
    appliesTo: (relPath) => isApplicationComponentPath(relPath),
    check({ content }) {
      const count = content.split("\n").length;
      return count > MAX_COMPONENT_LINES
        ? [{ line: 1, detail: `(${count} lines)` }]
        : [];
    },
  },
  patternRule(
    "no-render-props-api",
    "Use Base UI's standard `render` prop for element composition; do not invent `renderX` APIs.",
    /\brender[A-Z]\w*\??\s*:/,
    { extensions: TSX_ONLY }
  ),
  patternRule(
    "no-as-child",
    "Base UI composes custom elements with the `render` prop; do not introduce Radix-style `asChild`.",
    /\basChild\b/,
    { extensions: TSX_ONLY }
  ),
  patternRule(
    "no-classic-form-api",
    "Build new forms with `Field`/`FieldGroup`; the classic shadcn `Form*` API is compatibility-only.",
    /from\s+["']@\/components\/ui\/form["']/
  ),
  patternRule(
    "named-default-export",
    "Components must have explicit identifiers; anonymous default exports break Fast Refresh.",
    /^\s*export\s+default\s+(?:async\s+)?(?:function\s*\*?\s*\(|class\s*\{|\()/,
    { allowed: STORIES }
  ),
  {
    id: "no-default-export",
    message:
      "Use named exports. Default exports are allowed only for Next.js route/config entrypoints.",
    extensions: SOURCE_EXTENSIONS,
    includeTests: false,
    uiOnly: false,
    allowed: DEFAULT_EXPORT_ALLOWED,
    check: ({ code }) =>
      lineHits(
        /^\s*export\s+default\b|^\s*export\s*\{[^}]*\bas\s+default\b/,
        code
      ),
  },
  {
    id: "error-boundary-use-client",
    message:
      "Next.js `error.tsx` and `global-error.tsx` must declare 'use client'.",
    extensions: TSX_ONLY,
    includeTests: false,
    uiOnly: false,
    allowed: [],
    appliesTo: (relPath) => /(?:^|\/)(?:global-)?error\.tsx$/.test(relPath),
    check: ({ content }) => (USE_CLIENT.test(content) ? [] : [{ line: 1 }]),
  },
  {
    id: "server-action-use-server",
    message: "Server Action modules must declare 'use server'.",
    extensions: new Set([".ts", ".tsx"]),
    includeTests: false,
    uiOnly: false,
    allowed: [],
    appliesTo: (relPath) => SERVER_ACTION_FILE.test(relPath),
    check: ({ content }) => (USE_SERVER.test(content) ? [] : [{ line: 1 }]),
  },
  {
    id: "server-action-validates-input",
    message: "Server Actions must validate inbound data with a Zod schema.",
    extensions: new Set([".ts", ".tsx"]),
    includeTests: false,
    uiOnly: false,
    allowed: [],
    check: ({ content }) =>
      !USE_SERVER.test(content) || /from\s+["']zod["']/.test(content)
        ? []
        : [{ line: 1 }],
  },
  {
    id: "kebab-case-filename",
    message:
      "Files and folders use kebab-case (Next.js route segments `[param]` and `(group)` are exempt).",
    extensions: STYLE_EXTENSIONS,
    includeTests: true,
    uiOnly: false,
    allowed: [],
    check({ relPath }) {
      const parts = relPath.split("/").slice(1);
      const file = parts.pop() ?? "";
      const stem = file.split(".")[0];
      const bad = [...parts, stem].find((part) => !isKebabSegment(part));
      return bad === undefined ? [] : [{ line: 1, detail: `"${bad}"` }];
    },
  },
  {
    id: "max-filename-length",
    message: `File names must not exceed ${MAX_FILENAME_LENGTH} characters (excluding extension); keep names concise and avoid redundant prefixes.`,
    extensions: STYLE_EXTENSIONS,
    includeTests: true,
    uiOnly: false,
    allowed: [],
    check({ relPath }) {
      const file = relPath.split("/").pop() ?? "";
      const stem = file.split(".")[0];
      return stem.length > MAX_FILENAME_LENGTH
        ? [
            {
              line: 1,
              detail: `("${stem}" is ${stem.length} chars, limit is ${MAX_FILENAME_LENGTH})`,
            },
          ]
        : [];
    },
  },
];

export function normalizeRelative(root, file) {
  const relative = path.relative(root, path.resolve(root, file));
  return relative.split(path.sep).join("/");
}

export function isTestFile(relPath) {
  return /\.(?:test|spec)\.[cm]?[jt]sx?$/.test(relPath);
}

export function isUiPrimitive(relPath) {
  return relPath.startsWith(UI_PREFIX);
}

export function isInScope(relPath) {
  if (!relPath.startsWith("src/")) {
    return false;
  }
  if (EXCLUDED_PREFIXES.some((prefix) => relPath.startsWith(prefix))) {
    return false;
  }
  return STYLE_EXTENSIONS.has(path.posix.extname(relPath));
}

export function stripComments(content) {
  return content
    .replace(/\/\*[\s\S]*?\*\//g, (block) => block.replace(/[^\n]/g, " "))
    .replace(/(^|[^:"'`\\])\/\/[^\n]*/gm, "$1");
}

function ruleApplies(rule, relPath) {
  if (rule.uiOnly !== isUiPrimitive(relPath)) {
    return false;
  }
  if (!rule.extensions.has(path.posix.extname(relPath))) {
    return false;
  }
  if (isTestFile(relPath) && !rule.includeTests) {
    return false;
  }
  if (rule.appliesTo && !rule.appliesTo(relPath)) {
    return false;
  }
  return !rule.allowed.some((allow) => allow.test(relPath));
}

export function checkFile(relPath, content) {
  if (!isInScope(relPath)) {
    return [];
  }
  const code = stripComments(content);
  const lines = content.split("\n");
  const violations = [];
  for (const rule of CONVENTION_RULES.filter((r) => ruleApplies(r, relPath))) {
    for (const hit of rule.check({ relPath, content, code })) {
      violations.push({
        rule: rule.id,
        file: relPath,
        line: hit.line,
        message: hit.detail ? `${rule.message} ${hit.detail}` : rule.message,
        snippet: (lines[hit.line - 1] ?? "").trim(),
      });
    }
  }
  return violations;
}

export function listSourceFiles(root, dir = "src") {
  const files = [];
  for (const entry of readdirSync(path.join(root, dir), {
    withFileTypes: true,
  })) {
    const relPath = `${dir}/${entry.name}`;
    if (entry.isDirectory()) {
      files.push(...listSourceFiles(root, relPath));
    } else if (isInScope(relPath)) {
      files.push(relPath);
    }
  }
  return files;
}

export function runChecks(root, files = listSourceFiles(root)) {
  return files.flatMap((relPath) =>
    checkFile(relPath, readFileSync(path.join(root, relPath), "utf8"))
  );
}
