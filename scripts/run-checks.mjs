import { spawnSync } from "node:child_process";
import { globSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = fileURLToPath(new URL("../", import.meta.url));

export async function discoverChecks(root) {
  const files = globSync("scripts/checks/check-*.mjs", { cwd: root })
    .map((file) => file.replaceAll("\\", "/"))
    .sort();
  const tests = files.filter((file) => file.endsWith(".test.mjs"));
  const checks = [];
  for (const file of files.filter((file) => !file.endsWith(".test.mjs"))) {
    const { checkMode = "repo" } = await import(
      pathToFileURL(join(root, file))
    );
    if (!["repo", "manual", "helper"].includes(checkMode)) {
      throw new Error(`${file}: unknown checkMode ${checkMode}`);
    }
    if (checkMode === "repo") checks.push(file);
  }
  if (!checks.length || !tests.length) {
    throw new Error(
      "Repository checks and regression tests must not be empty.",
    );
  }
  for (const file of checks) {
    if (!tests.includes(file.replace(/\.mjs$/, ".test.mjs"))) {
      throw new Error(`${file}: missing colocated regression suite`);
    }
  }
  return { tests, checks };
}

export async function runChecks(root = repoRoot, execute = spawnSync) {
  const { tests, checks } = await discoverChecks(root);
  console.log(
    `Discovered ${checks.length} repository checks and ${tests.length} regression suites.`,
  );
  const commands = [
    ["--test", ...tests],
    ...checks.map((file) => [resolve(root, file)]),
  ];
  for (const args of commands) {
    const result = execute(process.execPath, args, {
      cwd: root,
      stdio: "inherit",
    });
    if (result.error) throw result.error;
    if (result.status !== 0) {
      throw new Error(
        `Check command failed (${result.signal ?? result.status}): node ${args.join(" ")}`,
      );
    }
  }
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await runChecks();
}
