import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import {
  classifyBashCommand,
  classifyDelegation,
  classifyEmulatorRun,
  classifyPath,
  classifyTypecheckRun,
  isBiomeChecked,
  isFirestoreRules,
  isStopHookActive,
  parseHookFilePath,
  preToolUseDecision,
  repoRelativePath,
} from "./hooks-lib.mjs";

const bash = (command) =>
  classifyBashCommand(JSON.stringify({ tool_input: { command } }));

const root = path.resolve("repo-root");

test("hook payload yields the edited file path", () => {
  assert.equal(
    parseHookFilePath('{"tool_input":{"file_path":"src/a.ts"}}'),
    "src/a.ts"
  );
  assert.equal(
    parseHookFilePath(
      '{"toolCall":{"name":"write_to_file","args":{"TargetFile":"src/b.ts"}}}'
    ),
    "src/b.ts"
  );
  assert.equal(
    parseHookFilePath(
      '{"toolCall":{"name":"write_file","args":{"path":"src/c.ts"}}}'
    ),
    "src/c.ts"
  );
});

test("malformed or path-less payloads yield null", () => {
  assert.equal(parseHookFilePath("not json"), null);
  assert.equal(parseHookFilePath('{"tool_input":{}}'), null);
  assert.equal(parseHookFilePath('{"tool_input":{"file_path":3}}'), null);
});

test("paths resolve to repo-relative POSIX form", () => {
  assert.equal(repoRelativePath(root, "src/a.ts"), "src/a.ts");
  assert.equal(
    repoRelativePath(root, path.join(root, "src", "a.ts")),
    "src/a.ts"
  );
});

test("paths outside the repo resolve to null", () => {
  assert.equal(repoRelativePath(root, path.join(root, "..", "other.ts")), null);
  assert.equal(repoRelativePath(root, "."), null);
});

test("only Biome-supported extensions are checked", () => {
  assert.equal(isBiomeChecked("src/a.tsx"), true);
  assert.equal(isBiomeChecked("scripts/a.mjs"), true);
  assert.equal(isBiomeChecked("README.md"), false);
  assert.equal(isBiomeChecked("pnpm-lock.yaml"), false);
});

test("generated outputs are denied", () => {
  for (const file of [
    ".agents/generated/sync.state.json",
    "graphify-out/graph.json",
    ".next/build.json",
    "CLAUDE.md",
    ".mcp.json",
  ]) {
    assert.equal(classifyPath(file)?.action, "deny", file);
  }
});

test("controlled files ask for confirmation", () => {
  for (const file of [
    "skills-lock.json",
    "pnpm-lock.yaml",
    ".env",
    ".env.local",
    "apps/web/.env.production",
  ]) {
    assert.equal(classifyPath(file)?.action, "ask", file);
  }
});

test("native Agent subagents are denied", () => {
  for (const type of ["Explore", "general-purpose", "Plan", "code-reviewer"]) {
    const verdict = classifyDelegation(
      JSON.stringify({ tool_input: { subagent_type: type } })
    );
    assert.equal(verdict?.action, "deny", type);
    assert.match(verdict.reason, /codex:codex-rescue/, type);
  }
});

test("an omitted or empty subagent_type counts as general-purpose", () => {
  for (const input of [{}, { subagent_type: "" }, { subagent_type: 3 }]) {
    const verdict = classifyDelegation(JSON.stringify({ tool_input: input }));
    assert.equal(verdict?.action, "deny", JSON.stringify(input));
    assert.match(verdict.reason, /general-purpose/);
  }
});

test("the Codex rescue agent is allowed", () => {
  assert.equal(
    classifyDelegation(
      JSON.stringify({ tool_input: { subagent_type: "codex:codex-rescue" } })
    ),
    null
  );
});

test("payloads without tool input are not judged", () => {
  assert.equal(classifyDelegation("not json"), null);
  assert.equal(classifyDelegation("{}"), null);
  assert.equal(classifyDelegation('{"tool_input":"x"}'), null);
  assert.equal(
    classifyDelegation('{"toolCall":{"name":"write_file","args":{}}}'),
    null
  );
});

test("ordinary files and lookalikes are allowed", () => {
  for (const file of [
    "src/lib/utils.ts",
    "AGENTS.md",
    ".agents/agents.json",
    "docs/CLAUDE.md",
    "src/environment.ts",
  ]) {
    assert.equal(classifyPath(file), null, file);
  }
});

test("git commands that bypass hooks or signing are denied", () => {
  for (const command of [
    "git commit --no-verify -m x",
    "git commit -n -m x",
    "git push --no-verify",
    "git commit --no-gpg-sign -m x",
    "git push --force origin main",
    "git push -f",
    "pnpm test && git commit --no-verify",
    "rtk git commit --no-verify -m x",
    "cd repo && rtk git push -f",
    "git -C repo push -f",
    "rtk git --no-pager push -f",
    "git -c core.hooksPath=x -C repo commit --no-verify",
    "git --git-dir=.git --work-tree=. push --force origin main",
    "git push origin main --force",
  ]) {
    assert.equal(bash(command)?.action, "deny", command);
  }
});

test("ordinary git commands and lookalikes are allowed", () => {
  for (const command of [
    "git commit -m x",
    "git push --force-with-lease",
    "git status",
    "git log -n 5",
    "git -C repo log -n 5",
    "git -C repo push --force-with-lease origin main",
    "rtk git --no-pager diff",
    "rtk git diff",
    'echo "git commit --no-verify"',
    "cat <<'X'\n  git push -f\nX",
  ]) {
    assert.equal(bash(command), null, command);
  }
});

test("non-Bash payloads are not judged by the Bash guard", () => {
  assert.equal(classifyBashCommand("not json"), null);
  assert.equal(classifyBashCommand("{}"), null);
  assert.equal(classifyBashCommand('{"tool_input":{"command":3}}'), null);
});

test("only the Firestore rules file triggers the rules hook", () => {
  assert.equal(isFirestoreRules("firestore.rules"), true);
  for (const file of [
    "firestore.indexes.json",
    "docs/firestore.rules",
    "src/lib/firebase/firestore-emulator.test.ts",
  ]) {
    assert.equal(isFirestoreRules(file), false, file);
  }
});

test("emulator runs block only on failing tests", () => {
  const run = (status, output, error) =>
    classifyEmulatorRun({ status, output, error });
  assert.equal(run(0, "Tests  4 passed (4)"), "pass");
  assert.equal(
    run(1, " FAIL  src/lib/firebase/firestore-emulator.test.ts"),
    "fail"
  );
  assert.equal(run(1, "Test Files  1 failed | 1 passed (2)"), "fail");
  assert.equal(run(1, "\u001b[31m FAIL \u001b[39m rules denies read"), "fail");
});

test("emulator environment failures never block", () => {
  const run = (status, output, error) =>
    classifyEmulatorRun({ status, output, error });
  for (const output of [
    "Error: Could not spawn `java -version`. Please make sure Java is installed",
    "Port 8080 is not open on localhost, could not start Firestore Emulator.",
    "",
  ]) {
    assert.equal(run(1, output), "environment", output);
  }
  assert.equal(run(null, "", new Error("ETIMEDOUT")), "environment");
  assert.equal(run(null, "FAIL", new Error("ENOENT")), "environment");
});

test("typecheck runs block only on real type errors", () => {
  const run = (status, output) => classifyTypecheckRun({ status, output });
  assert.equal(run(0, ""), "pass");
  assert.equal(run(2, "src/a.ts(1,1): error TS2322: bad"), "fail");
  assert.equal(run(1, "next typegen crashed: EPERM"), "environment");
});

test("a continuing Stop hook is detected from its payload", () => {
  assert.equal(isStopHookActive('{"stop_hook_active":true}'), true);
  for (const payload of ['{"stop_hook_active":false}', "{}", "not json"]) {
    assert.equal(isStopHookActive(payload), false, payload);
  }
});

test("PreToolUse decisions use the documented JSON shape", () => {
  assert.deepEqual(JSON.parse(preToolUseDecision("deny", "why")), {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: "why",
    },
  });
});
