import fs from "node:fs";
import path from "node:path";

const BIOME_EXTENSIONS = new Set([
  ".cjs",
  ".css",
  ".js",
  ".json",
  ".jsonc",
  ".mjs",
  ".ts",
  ".tsx",
]);

const GENERATED = [
  { test: (p) => p.startsWith(".agents/generated/"), owner: "`agents sync`" },
  { test: (p) => p.startsWith("graphify-out/"), owner: "graphify" },
  { test: (p) => p.startsWith(".next/"), owner: "`next build`" },
  { test: (p) => p === "CLAUDE.md", owner: "`agents sync`" },
  { test: (p) => p === ".mcp.json", owner: "`agents sync`" },
];

const CONTROLLED = [
  {
    test: (p) => p === "skills-lock.json",
    reason: "skills-lock.json is controlled configuration",
  },
  {
    test: (p) => p === "pnpm-lock.yaml",
    reason: "pnpm-lock.yaml is changed by pnpm, not by hand",
  },
  {
    test: (p) => /^\.env(\..+)?$/.test(path.posix.basename(p)),
    reason: "environment files can hold secrets",
  },
];

export function detectAgentType(raw) {
  try {
    const data = JSON.parse(raw);
    if (data?.toolCall || data?.conversationId) {
      return "antigravity";
    }
    if (data?.tool_input || data?.hookSpecificOutput) {
      return "claude";
    }
    return "generic";
  } catch {
    return "unknown";
  }
}

export function findRepoRoot(startDir = process.cwd()) {
  let curr = path.resolve(startDir);
  while (true) {
    if (fs.existsSync(path.join(curr, "package.json"))) {
      return curr;
    }
    const parent = path.dirname(curr);
    if (parent === curr) {
      return path.resolve(startDir);
    }
    curr = parent;
  }
}

export function parseHookFilePath(raw) {
  try {
    const data = JSON.parse(raw);
    const filePath =
      data?.tool_input?.file_path ??
      data?.toolCall?.args?.TargetFile ??
      data?.toolCall?.args?.path ??
      data?.tool_input?.path;
    return typeof filePath === "string" ? filePath : null;
  } catch {
    return null;
  }
}

export function repoRelativePath(root, filePath) {
  const relative = path.relative(root, path.resolve(root, filePath));
  if (
    relative === "" ||
    relative.startsWith("..") ||
    path.isAbsolute(relative)
  ) {
    return null;
  }
  return relative.split(path.sep).join("/");
}

const ALLOWED_SUBAGENT = "codex:codex-rescue";

export function classifyDelegation(raw) {
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  const input = data?.tool_input;
  if (!input || typeof input !== "object") {
    return null;
  }
  // An omitted subagent_type falls back to the native general-purpose agent.
  const type =
    typeof input.subagent_type === "string" && input.subagent_type !== ""
      ? input.subagent_type
      : "general-purpose";
  if (type === ALLOWED_SUBAGENT) {
    return null;
  }
  return {
    action: "deny",
    reason: `Native Agent subagent "${type}" is blocked in this project. Delegate through the Codex plugin: use the ${ALLOWED_SUBAGENT} agent or the /codex:* commands. Do exploration and reads inline (Read, Grep, Serena, graphify).`,
  };
}

// Flags that skip the quality gates the harness relies on (AGENTS.md: never
// bypass hooks/checks merely to obtain a pass).
const HOOKED_SUBCOMMANDS = new Set([
  "commit",
  "push",
  "merge",
  "rebase",
  "cherry-pick",
  "am",
]);

// git global options that take their value as the next token.
const GLOBAL_OPTIONS_WITH_VALUE = new Set([
  "-C",
  "-c",
  "--git-dir",
  "--work-tree",
  "--namespace",
  "--exec-path",
  "--super-prefix",
  "--config-env",
]);

// Splits "git [global options] <subcommand> <args>" into subcommand and args.
function parseGitInvocation(segment) {
  const tokens = segment.split(/\s+/);
  let i = tokens[0] === "rtk" ? 2 : 1;
  while (i < tokens.length && tokens[i].startsWith("-")) {
    i += GLOBAL_OPTIONS_WITH_VALUE.has(tokens[i]) ? 2 : 1;
  }
  return { sub: tokens[i], args: tokens.slice(i + 1) };
}

const BASH_BYPASS_RULES = [
  {
    test: ({ sub, args }) =>
      HOOKED_SUBCOMMANDS.has(sub) &&
      args.some((a) => a === "--no-verify" || a === "-n"),
    reason: "skips git hooks (--no-verify)",
  },
  {
    test: ({ args }) => args.includes("--no-gpg-sign"),
    reason: "bypasses commit signing (--no-gpg-sign)",
  },
  {
    test: ({ sub, args }) =>
      sub === "push" &&
      args.some((a) => a === "--force" || a === "-f") &&
      !args.some((a) => a.startsWith("--force-with-lease")),
    reason: "force-pushes without --force-with-lease",
  },
];

export function classifyBashCommand(raw) {
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  const command = data?.tool_input?.command;
  if (typeof command !== "string") {
    return null;
  }
  // Judge only segments that start with git, so quoted text or heredoc bodies
  // that merely mention a flag are not mistaken for a command.
  const withoutHeredocs = command.replace(
    /<<-?\s*(['"]?)(\w+)\1[^\n]*\n[\s\S]*?\n\s*\2(?=\n|$)/g,
    ""
  );
  const segments = withoutHeredocs
    .split(/&&|\|\||[;|\n]/)
    .map((segment) => segment.trim())
    .filter((segment) => /^(rtk\s+)?git\s/.test(segment))
    .map(parseGitInvocation);
  const rule = BASH_BYPASS_RULES.find((r) => segments.some((s) => r.test(s)));
  if (!rule) {
    return null;
  }
  return {
    action: "deny",
    reason: `Command ${rule.reason}. Fix the failing check instead, or ask the user to run it explicitly.`,
  };
}

// PreToolUse decision in the shape Claude Code documents: exit 0 plus JSON.
export function preToolUseDecision(action, reason) {
  return JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: action,
      permissionDecisionReason: reason,
    },
  });
}

// Local JSONL telemetry so harness rules can be judged by how often they fire.
export function logHookEvent(root, event) {
  try {
    const dir = path.join(root, ".agents", "logs");
    fs.mkdirSync(dir, { recursive: true });
    fs.appendFileSync(
      path.join(dir, "hook-events.jsonl"),
      `${JSON.stringify({ ts: new Date().toISOString(), ...event })}\n`
    );
  } catch {
    // Telemetry must never break an edit.
  }
}

export function isBiomeChecked(relative) {
  return BIOME_EXTENSIONS.has(path.posix.extname(relative));
}

export function isFirestoreRules(relative) {
  return relative === "firestore.rules";
}

// Verdict for a spawned check: "pass", "fail" (the check ran and found real
// problems; safe to block on) or "environment" (it could not run properly, for
// example no Java for the Firestore emulator; never block on this).
function classifyRun({ error, status, output }, failurePattern) {
  if (error) {
    return "environment";
  }
  if (status === 0) {
    return "pass";
  }
  // biome-ignore lint/suspicious/noControlCharactersInRegex: strips ANSI colors
  const plain = (output ?? "").replace(/\u001b\[[0-9;]*m/g, "");
  return failurePattern.test(plain) ? "fail" : "environment";
}

// Vitest prints these only after the emulators started and tests executed.
const VITEST_FAILURE =
  /^\s*(FAIL\s|Test Files\s+\d+ failed|Tests\s+\d+ failed)/m;

export function classifyEmulatorRun(run) {
  return classifyRun(run, VITEST_FAILURE);
}

// tsc reports real type errors as "error TS1234"; a crashed `next typegen`
// does not.
export function classifyTypecheckRun(run) {
  return classifyRun(run, /error TS\d+/);
}

// A Stop hook that blocks re-fires after Claude continues; this flag is the
// only protection against an endless block loop.
export function isStopHookActive(raw) {
  try {
    return JSON.parse(raw)?.stop_hook_active === true;
  } catch {
    return false;
  }
}

export function classifyPath(relative) {
  const generated = GENERATED.find((rule) => rule.test(relative));
  if (generated) {
    return {
      action: "deny",
      reason: `${relative} is a generated output. Change its source and regenerate it with ${generated.owner}.`,
    };
  }
  const controlled = CONTROLLED.find((rule) => rule.test(relative));
  if (controlled) {
    return {
      action: "ask",
      reason: `${controlled.reason}. Confirm this edit is intended.`,
    };
  }
  return null;
}

export async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}
