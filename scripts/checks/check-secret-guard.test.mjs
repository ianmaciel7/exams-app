import assert from "node:assert/strict";
import test from "node:test";
import {
  validateLaunchConfig,
  validatePreCommitHook,
} from "./check-secret-guard.mjs";

test("accepts a pre-commit hook that runs gitleaks protect", () => {
  const valid = "gitleaks protect --staged --no-banner --redact";
  assert.deepEqual(validatePreCommitHook(valid), []);
});

test("rejects a pre-commit hook without gitleaks protect", () => {
  const invalid = "pnpm exec lint-staged";
  const issues = validatePreCommitHook(invalid);
  assert.ok(issues.length > 0);
  assert.match(issues[0], /gitleaks protect --staged/);
});

test("accepts a launch.json referencing an envFile without inline secrets", () => {
  const valid = JSON.stringify(
    {
      version: "0.2.0",
      configurations: [
        {
          name: "Next.js: Dev",
          type: "node",
          request: "launch",
          envFile: "${workspaceFolder}/.env.production.local",
        },
      ],
    },
    null,
    2,
  );
  assert.deepEqual(validateLaunchConfig(valid), []);
});

test("rejects a launch.json with hardcoded GCP API key", () => {
  const invalid = JSON.stringify(
    {
      version: "0.2.0",
      configurations: [
        {
          name: "Next.js: Dev",
          type: "node",
          request: "launch",
          env: {
            API_KEY: "AIzaSyDpuq9aUKLI1EjKj8afSGxOgP8oSSwUWqQ", // gitleaks:allow
          },
        },
      ],
    },
    null,
    2,
  );
  const issues = validateLaunchConfig(invalid);
  assert.ok(issues.length > 0);
  assert.match(issues[0], /contains hardcoded GCP API key/);
});

test("accepts an inline key when explicitly exempted with gitleaks:allow", () => {
  const exempted =
    '{\n  "key": "AIzaSyDpuq9aUKLI1EjKj8afSGxOgP8oSSwUWqQ" /* gitleaks:allow */\n}';
  assert.deepEqual(validateLaunchConfig(exempted), []);
});
