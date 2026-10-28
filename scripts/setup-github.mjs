import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

if (process.env.GITHUB_TOKEN && !process.env.GH_TOKEN) {
  process.env.GH_TOKEN = process.env.GITHUB_TOKEN;
}

// 1. Verify gh CLI authentication
try {
  execFileSync("gh", ["auth", "status"], { stdio: "ignore" });
} catch {
  console.error(
    "Error: GitHub CLI ('gh') is not installed or not authenticated.",
  );
  console.error("Please run 'gh auth login' to authenticate.");
  process.exit(1);
}

// 2. Identify the target repository
let repo;
try {
  repo = execFileSync(
    "gh",
    ["repo", "view", "--json", "nameWithOwner", "-q", ".nameWithOwner"],
    { encoding: "utf8" },
  ).trim();
} catch (err) {
  console.error(
    "Could not determine GitHub repository info:",
    err instanceof Error ? err.message : err,
  );
  process.exit(1);
}

console.log(`Configuring GitHub repository and rulesets for ${repo}...`);

let hasError = false;

// 3. Configure repository merge options (Squash only, Auto-merge enabled)
try {
  execFileSync(
    "gh",
    [
      "api",
      "--method",
      "PATCH",
      `repos/${repo}`,
      "-F",
      "allow_merge_commit=false",
      "-F",
      "allow_rebase_merge=false",
      "-F",
      "allow_auto_merge=true",
      "-F",
      "delete_branch_on_merge=false",
    ],
    { stdio: "ignore" },
  );
  console.log(
    "✔ Configured pull request merge options (Squash only, Auto-merge enabled).",
  );
} catch (err) {
  hasError = true;
  console.error(
    "Failed to update repository settings:",
    err instanceof Error ? err.message : err,
  );
}

// 4. Configure modern GitHub Repository Ruleset (~DEFAULT_BRANCH protection)
const rulesetFilePath = resolve(
  import.meta.dirname,
  "../.github/rulesets/default-branch.json",
);

try {
  const rulesetPayload = readFileSync(rulesetFilePath, "utf8");
  const parsed = JSON.parse(rulesetPayload);

  // Check if repository ruleset already exists (excluding inherited organization rulesets)
  const existingRulesets = JSON.parse(
    execFileSync(
      "gh",
      ["api", `repos/${repo}/rulesets?includes_parents=false`],
      {
        encoding: "utf8",
      },
    ),
  );

  const matched = Array.isArray(existingRulesets)
    ? existingRulesets.find(
        (r) => r.name === parsed.name && r.source_type === "Repository",
      )
    : null;

  if (matched) {
    execFileSync(
      "gh",
      [
        "api",
        "--method",
        "PUT",
        `repos/${repo}/rulesets/${matched.id}`,
        "--input",
        "-",
      ],
      {
        input: rulesetPayload,
        stdio: ["pipe", "ignore", "inherit"],
      },
    );
    console.log(
      `✔ Updated existing ruleset '${parsed.name}' (ID: ${matched.id}).`,
    );
  } else {
    const created = JSON.parse(
      execFileSync(
        "gh",
        ["api", "--method", "POST", `repos/${repo}/rulesets`, "--input", "-"],
        {
          input: rulesetPayload,
          encoding: "utf8",
          stdio: ["pipe", "pipe", "inherit"],
        },
      ),
    );
    console.log(
      `✔ Created modern GitHub Ruleset '${parsed.name}' (ID: ${created.id}).`,
    );
  }
} catch (err) {
  hasError = true;
  console.error(
    "Failed to configure GitHub repository ruleset:",
    err instanceof Error ? err.message : err,
  );
}

if (hasError) {
  process.exit(1);
}
