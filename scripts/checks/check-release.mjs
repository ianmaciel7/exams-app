import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const tagVariable = "NEXT_PUBLIC_GIT_TAG";

function appHostingTag(source) {
  const pattern = new RegExp(
    `variable:\\s*${tagVariable}\\s*\\r?\\n\\s*value:\\s*"?([^"\\r\\n]+)"?`,
  );
  return source.match(pattern)?.[1]?.trim();
}

// The version the app shows comes from apphosting.yaml, and the release workflow
// requires the GitHub release tag to equal it, so all three must agree before a release.
export function inspectRelease(root) {
  const packagePath = join(root, "package.json");
  const appHostingPath = join(root, "apphosting.yaml");
  if (!existsSync(packagePath) || !existsSync(appHostingPath)) return [];

  const { version } = JSON.parse(readFileSync(packagePath, "utf8"));
  const tag = appHostingTag(readFileSync(appHostingPath, "utf8"));
  const problems = [];

  if (!/^\d+\.\d+\.\d+$/.test(version ?? "")) {
    problems.push(
      `package.json: version "${version}" must be a stable Semantic Version (X.Y.Z)`,
    );
  }
  if (!tag) {
    problems.push(`apphosting.yaml: missing the ${tagVariable} variable`);
  } else if (tag !== `v${version}`) {
    problems.push(
      `apphosting.yaml: ${tagVariable} is "${tag}" but package.json version is "${version}"; release tags are v<version>`,
    );
  }
  return problems;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const problems = inspectRelease(resolve("."));
  if (problems.length > 0) {
    console.error(problems.join("\n"));
    process.exit(1);
  }
  console.log("Release check passed.");
}
