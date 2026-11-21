import assert from "node:assert/strict";
import test from "node:test";
import {
  AGENTS_MAX_BYTES,
  checkAbsolutePaths,
  checkAgentsSize,
  checkCodePaths,
  checkCommands,
  checkDocsTree,
  checkDuplicates,
  checkLanguage,
  checkLinks,
  checkScriptDocs,
  checkSkills,
  headingSlugs,
  isDocInScope,
  slugify,
  summarize,
} from "./verify-docs-lib.mjs";

function makeCtx(files, overrides = {}) {
  const map = new Map(Object.entries(files));
  const extra = new Set(overrides.existing ?? []);
  return {
    files: map,
    exists: (rel) => map.has(rel) || extra.has(rel),
    topLevel: new Set(["src", "scripts", "docs", ".agents", "README.md"]),
    packageScripts: new Set(overrides.scripts ?? ["test", "check:ci"]),
    allSkills: overrides.allSkills ?? [],
    projectSkills: overrides.projectSkills ?? [],
    scriptFiles: overrides.scriptFiles ?? [],
  };
}

const rules = (findings) => findings.map((f) => f.rule);

test("scope keeps project docs and drops remote skills and generated output", () => {
  const remote = new Set(["shadcn"]);
  assert.equal(isDocInScope("AGENTS.md", remote), true);
  assert.equal(isDocInScope("docs/adr/0001-x.md", remote), true);
  assert.equal(isDocInScope(".agents/rules/a.md", remote), true);
  assert.equal(isDocInScope(".agents/skills/mine/SKILL.md", remote), true);
  assert.equal(
    isDocInScope(".agents/skills/mine/references/t.md", remote),
    false
  );
  assert.equal(isDocInScope(".agents/skills/shadcn/SKILL.md", remote), false);
  assert.equal(isDocInScope("node_modules/x/README.md", remote), false);
  assert.equal(isDocInScope("src/app/notes.txt", remote), false);
});

test("slugs follow GitHub rules including duplicates", () => {
  assert.equal(slugify("Hello, `World` & Co"), "hello-world--co");
  const slugs = headingSlugs("# A\n## A\n```\n# ignored\n```\n");
  assert.deepEqual([...slugs], ["a", "a-1"]);
});

test("broken relative links and anchors are errors", () => {
  const ctx = makeCtx({
    "README.md":
      "[ok](./docs/a.md#intro) [gone](./nope.md) [bad](./docs/a.md#missing) [web](https://x.dev)",
    "docs/a.md": "# Intro\n",
  });
  const found = checkLinks(ctx);
  assert.deepEqual(rules(found), ["broken-link", "broken-anchor"]);
});

test("links inside code are ignored", () => {
  const ctx = makeCtx({
    "README.md": "`[x](./nope.md)`\n```\n[y](./nope.md)\n```\n",
  });
  assert.deepEqual(checkLinks(ctx), []);
});

test("backticked repo paths must exist unless illustrative or placeholders", () => {
  const ctx = makeCtx(
    {
      "README.md": [
        "See `scripts/real.mjs` and `scripts/gone.mjs`.",
        "Use `docs/adr/NNNN-slug.md` or `docs/<name>.md`.",
        "For example `src/domain/` might exist.",
        "Never create `.agents/docs/`.",
        "Ignored `graphify-out/graph.json` and `.agents/local.json`.",
        "```bash\nnode scripts/missing-in-fence.mjs\n```",
      ].join("\n"),
    },
    { existing: ["scripts/real.mjs"] }
  );
  const messages = checkCodePaths(ctx).map((f) => f.message);
  assert.deepEqual(messages, [
    "path not found: scripts/gone.mjs",
    "path not found: scripts/missing-in-fence.mjs",
  ]);
});

test("pnpm commands must be scripts, builtins, or installed bins", () => {
  const ctx = makeCtx(
    {
      "README.md": [
        "Run `pnpm check:ci`, `pnpm install`, `pnpm dlx shadcn@latest`.",
        "Then `pnpm run ghost` and `pnpm biome check` and `pnpm nothing`.",
        "```bash\nrtk pnpm test\nrtk pnpm run phantom\n```",
      ].join("\n"),
    },
    { existing: ["node_modules/.bin/biome"] }
  );
  const names = checkCommands(ctx).map((f) => f.message);
  assert.deepEqual(names, [
    'package.json has no script "ghost"',
    'package.json has no script "nothing"',
    'package.json has no script "phantom"',
  ]);
});

test("real absolute machine paths fail but ellipsis examples pass", () => {
  const ctx = makeCtx({
    "A.md": "Bad: C:\\Users\\jane\\repo and /home/jane/x",
    "B.md": "Example: `C:\\Users\\...` and `/home/...`",
  });
  const found = checkAbsolutePaths(ctx);
  assert.deepEqual(
    found.map((f) => f.file),
    ["A.md"]
  );
});

test("non-English text is reported once per file", () => {
  const ctx = makeCtx({
    "CONTEXT.md": "Referência\nplain\nÁudio\n",
    "README.md": "plain ascii — arrows → fine ✓",
  });
  const found = checkLanguage(ctx);
  assert.equal(found.length, 1);
  assert.equal(found[0].file, "CONTEXT.md");
  assert.match(found[0].message, /^2 line\(s\)/);
});

test("AGENTS.md size limits: target warns, hard maximum fails", () => {
  const warn = checkAgentsSize(makeCtx({ "AGENTS.md": "x".repeat(12001) }));
  assert.equal(warn[0].severity, "warn");
  const fail = checkAgentsSize(
    makeCtx({ "AGENTS.md": "x".repeat(AGENTS_MAX_BYTES + 1) })
  );
  assert.equal(fail[0].severity, "error");
  assert.deepEqual(checkAgentsSize(makeCtx({ "AGENTS.md": "small" })), []);
});

const routingTable = [
  "## Skill routing",
  "| Trigger | Skill |",
  "| --- | --- |",
  "| A | `alpha` |",
  "| B | `ghost` |",
  "## Next",
].join("\n");

test("skill frontmatter and routing are cross-checked", () => {
  const ctx = makeCtx(
    {
      "AGENTS.md": routingTable,
      ".agents/skills/alpha/SKILL.md":
        "---\nname: alpha\ndescription: Does A\n---\n",
      ".agents/skills/beta/SKILL.md": "---\nname: wrong\ndescription:\n---\n",
      ".agents/skills/gamma/SKILL.md": "no frontmatter",
    },
    {
      allSkills: ["alpha", "beta", "gamma"],
      projectSkills: ["alpha", "beta", "gamma"],
    }
  );
  const found = checkSkills(ctx);
  assert.deepEqual(
    found.map((f) => `${f.rule}:${f.message}`).sort(),
    [
      'missing-skill:routed skill "ghost" has no .agents/skills/ghost/SKILL.md',
      "skill-frontmatter:description is missing or empty",
      "skill-frontmatter:missing YAML frontmatter",
      'skill-frontmatter:name "wrong" must equal directory "beta"',
      'unrouted-skill:project skill "beta" is missing from the Skill routing table',
      'unrouted-skill:project skill "gamma" is missing from the Skill routing table',
    ].sort()
  );
});

test("ADRs need sequential numbers, kebab names, and a title", () => {
  const ctx = makeCtx({
    "docs/adr/0001-first.md": "# First\n",
    "docs/adr/0003-third.md": "# Third\n",
    "docs/adr/Bad_Name.md": "no title\n",
  });
  const found = checkDocsTree(ctx).filter((f) => f.rule.startsWith("adr-"));
  assert.deepEqual(rules(found).sort(), [
    "adr-naming",
    "adr-sequence",
    "adr-title",
  ]);
});

const planTemplate = "# Plan\n## Objective\n## Scope\n## Completion\n";

test("plans must match the template and their lifecycle folder", () => {
  const ctx = makeCtx({
    "docs/exec-plans/template.md": planTemplate,
    "docs/exec-plans/README.md": "# Plans\n",
    "docs/exec-plans/active/a.md":
      "**Status:** Completed\n## Objective\n## Scope\n## Completion\n",
    "docs/exec-plans/completed/b.md":
      "**Status:** Active\n## Objective\n- [ ] open\n",
  });
  const found = checkDocsTree(ctx).filter((f) => f.rule.startsWith("plan-"));
  assert.deepEqual(found.map((f) => `${f.file}:${f.rule}`).sort(), [
    "docs/exec-plans/active/a.md:plan-status",
    "docs/exec-plans/completed/b.md:plan-open-items",
    "docs/exec-plans/completed/b.md:plan-sections",
    "docs/exec-plans/completed/b.md:plan-sections",
    "docs/exec-plans/completed/b.md:plan-status",
  ]);
});

test("product-spec index must list every spec and only real files", () => {
  const ctx = makeCtx({
    "docs/product-specs/index.md": "See `real.md` and `ghost.md`.\n",
    "docs/product-specs/real.md": "# Real\n",
    "docs/product-specs/extra.md": "# Extra\n",
  });
  const found = checkDocsTree(ctx).filter((f) => f.rule === "spec-index");
  assert.deepEqual(found.map((f) => f.message).sort(), [
    "index does not reference extra.md",
    "index references missing file ghost.md",
  ]);
});

test("docs that nothing links to are orphans", () => {
  const ctx = makeCtx({
    "README.md": "[guide](./docs/guide/linked.md)",
    "docs/guide/linked.md": "# Linked\n",
    "docs/guide/lonely.md": "# Lonely\n",
  });
  const orphans = checkDocsTree(ctx).filter((f) => f.rule === "orphan-doc");
  assert.deepEqual(
    orphans.map((f) => f.file),
    ["docs/guide/lonely.md"]
  );
});

test("long rules repeated across documents are flagged once", () => {
  const rule =
    "- Every rule, fact, threshold or workflow must have exactly one canonical owner document in the repository.";
  const ctx = makeCtx({
    "README.md": rule,
    "CONTRIBUTING.md": rule,
    "docs/a.md": "short line",
  });
  const found = checkDuplicates(ctx);
  assert.equal(found.length, 1);
  assert.match(found[0].message, /CONTRIBUTING\.md:1/);
});

test("entry scripts must be documented; libs and tests are exempt", () => {
  const ctx = makeCtx(
    { "README.md": "Run `scripts/known.mjs`." },
    {
      scriptFiles: [
        "known.mjs",
        "secret.mjs",
        "known-lib.mjs",
        "known.test.mjs",
      ],
    }
  );
  assert.deepEqual(
    checkScriptDocs(ctx).map((f) => f.file),
    ["scripts/secret.mjs"]
  );
});

test("summarize counts errors and warnings separately", () => {
  assert.deepEqual(
    summarize([
      { severity: "error" },
      { severity: "warn" },
      { severity: "warn" },
    ]),
    { errors: 1, warnings: 2 }
  );
});
