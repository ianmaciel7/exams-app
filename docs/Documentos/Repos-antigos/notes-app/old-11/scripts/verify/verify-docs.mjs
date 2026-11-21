#!/usr/bin/env node
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  formatFindings,
  isDocInScope,
  runChecks,
  summarize,
} from "./verify-docs-lib.mjs";

const root = fileURLToPath(new URL("../../", import.meta.url));
const args = new Set(process.argv.slice(2));
const asJson = args.has("--json");
const strict = args.has("--strict");
const skipControlDocs = args.has("--skip-control-docs");

function gitFiles() {
  try {
    const out = execFileSync(
      "git",
      ["ls-files", "-z", "--cached", "--others", "--exclude-standard"],
      { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }
    );
    return [...new Set(out.split("\0").filter(Boolean))].map((f) =>
      f.replaceAll("\\", "/")
    );
  } catch (error) {
    console.error(
      `verify-docs: cannot list repository files (${error.message})`
    );
    process.exit(2);
  }
}

function readJson(rel) {
  try {
    return JSON.parse(readFileSync(path.join(root, rel), "utf8"));
  } catch {
    return {};
  }
}

function remoteSkillDirs() {
  const dirs = new Set();
  for (const [key, entry] of Object.entries(
    readJson("skills-lock.json").skills ?? {}
  )) {
    dirs.add(key.toLowerCase().replaceAll(" ", "-"));
    const parts = String(entry.skillPath ?? "").split("/");
    if (parts.length >= 2) {
      dirs.add(parts.at(-2));
    }
  }
  return dirs;
}

function skillDirs() {
  const base = path.join(root, ".agents/skills");
  if (!existsSync(base)) {
    return [];
  }
  return readdirSync(base, { withFileTypes: true })
    .filter(
      (d) =>
        d.isDirectory() &&
        ["SKILL.md", "skill.md"].some((entry) =>
          existsSync(path.join(base, d.name, entry))
        )
    )
    .map((d) => d.name);
}

function listScriptFiles(current = path.join(root, "scripts"), prefix = "") {
  return readdirSync(current, { withFileTypes: true }).flatMap((entry) => {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      return listScriptFiles(path.join(current, entry.name), relative);
    }
    return entry.isFile() ? [relative] : [];
  });
}

function controlDocsFinding() {
  const result = spawnSync(
    process.execPath,
    [path.join(root, "scripts/verify/verify-control-docs.mjs")],
    { cwd: root, encoding: "utf8" }
  );
  if (result.status === 0) {
    return [];
  }
  const detail = `${result.stderr}${result.stdout}`
    .trim()
    .split(/\r?\n/)
    .slice(0, 6)
    .join(" | ");
  return [
    {
      severity: "error",
      rule: "control-docs",
      file: "scripts/verify/verify-control-docs.mjs",
      line: 1,
      message: detail || "control-doc verifiers failed",
    },
  ];
}

const remote = remoteSkillDirs();
const allSkills = skillDirs();
const files = new Map();
for (const rel of gitFiles()) {
  if (isDocInScope(rel, remote) && existsSync(path.join(root, rel))) {
    files.set(rel, readFileSync(path.join(root, rel), "utf8"));
  }
}

const ctx = {
  files,
  exists: (rel) => existsSync(path.join(root, rel)),
  topLevel: new Set(readdirSync(root)),
  packageScripts: new Set(Object.keys(readJson("package.json").scripts ?? {})),
  allSkills,
  projectSkills: allSkills.filter((name) => !remote.has(name)),
  scriptFiles: listScriptFiles(),
};

const findings = [
  ...(skipControlDocs ? [] : controlDocsFinding()),
  ...runChecks(ctx),
];
const { errors, warnings } = summarize(findings);

if (asJson) {
  console.log(JSON.stringify({ errors, warnings, findings }, null, 2));
} else {
  if (findings.length) {
    console.log(formatFindings(findings));
  }
  console.log(
    `docs: ${errors} error(s), ${warnings} warning(s) across ${files.size} markdown files`
  );
}
process.exit(errors > 0 || (strict && warnings > 0) ? 1 : 0);
