import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Built-in pnpm commands that are not package scripts.
const pnpmBuiltins = new Set(["add", "dlx", "exec", "install", "run"]);

function referencedScripts(source) {
  return [...source.matchAll(/\bpnpm(?:\s+run)?\s+([a-z][\w:-]*)/g)]
    .map((match) => match[1])
    .filter((name) => !pnpmBuiltins.has(name));
}

/**
 * Rejects aliases (two scripts with the same command) and `pnpm <name>` calls
 * to scripts that do not exist, in scripts and in workflow files.
 */
export function inspectPackageScripts(scripts, workflows = {}) {
  const errors = [];
  const byCommand = new Map();
  for (const [name, command] of Object.entries(scripts)) {
    const twin = byCommand.get(command);
    if (twin) errors.push(`"${name}" duplicates "${twin}"`);
    else byCommand.set(command, name);
  }
  const sources = [
    ...Object.entries(scripts).map(([name, command]) => [
      `script "${name}"`,
      command,
    ]),
    ...Object.entries(workflows),
  ];
  for (const [origin, source] of sources)
    for (const name of referencedScripts(source))
      if (!(name in scripts))
        errors.push(`${origin} calls missing script "pnpm ${name}"`);
  return errors;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = process.cwd();
  const { scripts } = JSON.parse(
    readFileSync(resolve(root, "package.json"), "utf8"),
  );
  const workflowDir = resolve(root, ".github/workflows");
  const workflows = Object.fromEntries(
    readdirSync(workflowDir)
      .filter((file) => /\.ya?ml$/.test(file))
      .map((file) => [
        `.github/workflows/${file}`,
        readFileSync(resolve(workflowDir, file), "utf8"),
      ]),
  );
  const errors = inspectPackageScripts(scripts, workflows);
  for (const error of errors) console.error(error);
  if (errors.length) process.exit(1);
  console.log("Package scripts are unique and every pnpm call resolves.");
}
