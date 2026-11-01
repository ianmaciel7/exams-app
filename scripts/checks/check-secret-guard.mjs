import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// GCP API key pattern (e.g. Firebase Web API key)
const gcpApiKeyPattern = /AIza[0-9A-Za-z-_]{35}/;
const privateKeyPattern = /-----BEGIN (?:RSA )?PRIVATE KEY-----/;

export function validatePreCommitHook(content) {
  const issues = [];
  if (!content.includes("gitleaks protect --staged")) {
    issues.push(
      ".husky/pre-commit: must run 'gitleaks protect --staged' before creating commits.",
    );
  }
  return issues;
}

export function validateLaunchConfig(content) {
  const issues = [];
  if (gcpApiKeyPattern.test(content) && !content.includes("gitleaks:allow")) {
    issues.push(
      ".vscode/launch.json: contains hardcoded GCP API key. Use 'envFile' pointing to a Git-ignored .env file instead.",
    );
  }
  if (privateKeyPattern.test(content)) {
    issues.push(
      ".vscode/launch.json: contains hardcoded private key. Never commit private credentials.",
    );
  }
  return issues;
}

export function inspectSecretGuard(root) {
  const issues = [];

  const preCommitPath = join(root, ".husky", "pre-commit");
  if (existsSync(preCommitPath)) {
    const preCommit = readFileSync(preCommitPath, "utf8");
    issues.push(...validatePreCommitHook(preCommit));
  } else {
    issues.push(".husky/pre-commit: hook file not found.");
  }

  const launchJsonPath = join(root, ".vscode", "launch.json");
  if (existsSync(launchJsonPath)) {
    const launchJson = readFileSync(launchJsonPath, "utf8");
    issues.push(...validateLaunchConfig(launchJson));
  }

  return issues;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const issues = inspectSecretGuard(resolve("."));
  if (issues.length > 0) {
    console.error(issues.join("\n"));
    process.exit(1);
  }
  console.log("Secret guard check passed.");
}
