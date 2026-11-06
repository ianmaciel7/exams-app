import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// ast-grep ids come in `-ts` / `-tsx` pairs that TOOLING.md lists as one row.
function registryName(id) {
  return id.replace(/-tsx?$/, "");
}

function ruleIds(root) {
  const dir = join(root, ".ast-grep/rules");
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { recursive: true })
    .filter((file) => /\.ya?ml$/.test(file))
    .flatMap((file) => {
      const id = readFileSync(join(dir, file), "utf8").match(/^id:\s*(\S+)/m);
      return id ? [id[1]] : [];
    });
}

// Lifecycle hooks run implicitly, so nobody invokes them as commands.
const lifecycleScripts = new Set(["prepare"]);

// TOOLING.md is the inventory of record. Fail when a package script, an
// ast-grep rule, or a GitHub workflow exists without being mentioned in it.
export function inspectToolingDocs(root, workflows = []) {
  const toolingPath = join(root, "TOOLING.md");
  const packagePath = join(root, "package.json");
  if (!existsSync(toolingPath) || !existsSync(packagePath)) return [];

  const tooling = readFileSync(toolingPath, "utf8");
  const { scripts = {} } = JSON.parse(readFileSync(packagePath, "utf8"));
  const problems = [];

  for (const name of Object.keys(scripts)) {
    if (lifecycleScripts.has(name)) continue;
    if (!tooling.includes(`pnpm ${name}`) && !tooling.includes(`\`${name}\``)) {
      problems.push(`TOOLING.md: package script "${name}" is not documented`);
    }
  }
  for (const id of ruleIds(root)) {
    if (!tooling.includes(registryName(id))) {
      problems.push(`TOOLING.md: ast-grep rule "${id}" is not in the registry`);
    }
  }
  for (const file of workflows) {
    if (!tooling.includes(file)) {
      problems.push(`TOOLING.md: workflow ${file} is not documented`);
    }
  }
  return problems;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = resolve(".");
  const workflowDir = join(root, ".github/workflows");
  const workflows = existsSync(workflowDir)
    ? execFileSync("git", ["ls-files", ".github/workflows"], {
        cwd: root,
        encoding: "utf8",
      })
        .split("\n")
        .filter((file) => /\.ya?ml$/.test(file))
        .map((file) => file.split("/").pop())
    : [];
  const problems = inspectToolingDocs(root, workflows);
  if (problems.length > 0) {
    console.error(problems.join("\n"));
    process.exit(1);
  }
  console.log("Tooling documentation check passed.");
}
