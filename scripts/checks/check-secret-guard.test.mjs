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

test("rejects a pre-commit hook that skips when gitleaks is missing", () => {
  const skipping = `if command -v gitleaks >/dev/null 2>&1; then
  gitleaks protect --staged
else
  echo "husky: 'gitleaks' not found; skipping staged secret scanning" >&2
fi`;
  const issues = validatePreCommitHook(skipping);
  assert.equal(issues.length, 1);
  assert.match(issues[0], /must fail, not skip/);
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
          // biome-ignore lint/suspicious/noTemplateCurlyInString: VS Code variable syntax
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
