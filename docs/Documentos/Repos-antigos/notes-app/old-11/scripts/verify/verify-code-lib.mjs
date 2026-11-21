import { parseIndex } from "./verify-conventions-index-lib.mjs";

// Earlier tiers run in more situations: `task` gates run at every task end,
// `ci` gates only in CI, `on-demand` gates for specific kinds of change.
const TIERS = ["task", "ci", "on-demand"];
const SCOPES = {
  task: ["task"],
  ci: ["task", "ci"],
  all: TIERS,
};
const CONSTRAINTS_HEADING = /^##\s+Enforced with numbers\s*$/m;

export const SCOPE_NAMES = Object.keys(SCOPES);

function sectionBody(markdown, heading) {
  const start = markdown.match(heading);
  if (!start) {
    return null;
  }
  const rest = markdown.slice(start.index + start[0].length);
  const next = rest.search(/^##\s/m);
  return next === -1 ? rest : rest.slice(0, next);
}

function tableRows(body) {
  return body
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|"))
    .map((line) =>
      line
        .replace(/^\||\|$/g, "")
        .split("|")
        .map((cell) => cell.trim())
    )
    .filter((cells) => !cells.every((cell) => /^:?-{3,}:?$/.test(cell)))
    .slice(1);
}

export function classifyTier(runsAt) {
  const text = runsAt.toLowerCase();
  if (/task end/.test(text)) {
    return "task";
  }
  if (text === "ci") {
    return "ci";
  }
  return "on-demand";
}

export function parseConstraintGates(markdown) {
  const body = sectionBody(markdown, CONSTRAINTS_HEADING);
  if (body === null) {
    return null;
  }
  return tableRows(body).map(([dimension, rule, checkedBy, runsAt]) => ({
    dimension,
    rule,
    checkedBy,
    runsAt,
    script: checkedBy?.match(/`pnpm run ([\w:.-]+)`/)?.[1] ?? null,
    tier: classifyTier(runsAt ?? ""),
  }));
}

export function reviewChecklistGaps(reviewIds, checklistMarkdown) {
  return reviewIds.filter((id) => !checklistMarkdown.includes(`\`${id}\``));
}

function earlierTier(a, b) {
  return TIERS.indexOf(a) <= TIERS.indexOf(b) ? a : b;
}

function collectSteps(gates, index, scripts, errors) {
  const steps = new Map();
  const skipped = [];
  const step = (script, tier) => {
    const existing = steps.get(script);
    if (existing) {
      existing.tier = earlierTier(existing.tier, tier);
      return existing;
    }
    const created = { script, tier, dimensions: [], rules: [] };
    steps.set(script, created);
    return created;
  };

  for (const gate of gates) {
    if (gate.script === null) {
      skipped.push({
        dimension: gate.dimension,
        tier: gate.tier,
        reason: `no \`pnpm run\` command (${gate.checkedBy})`,
      });
    } else if (!(gate.script in scripts)) {
      errors.push(
        `CONSTRAINTS.md: "${gate.dimension}" runs \`${gate.script}\`, which is not in package.json`
      );
    } else {
      step(gate.script, gate.tier).dimensions.push(gate.dimension);
    }
  }
  // Index enforcers run in check:fast, so they are task-end gates even when
  // CONSTRAINTS.md does not name them.
  for (const row of index.filter((candidate) => !candidate.reviewOnly)) {
    for (const script of row.scripts) {
      if (script in scripts) {
        step(script, "task").rules.push(row.id);
      } else {
        errors.push(
          `CONVENTIONS.md: rule \`${row.id}\` names \`${script}\`, which is not in package.json`
        );
      }
    }
  }
  return { steps: [...steps.values()], skipped };
}

/**
 * Turns CONSTRAINTS.md (what must pass) and the CONVENTIONS.md Enforcement
 * Index (which rule each gate enforces) into an ordered list of gates to run.
 * The docs stay the single source of truth; nothing is hard-coded here.
 */
export function buildPlan({
  constraints,
  conventions,
  scripts,
  checklist = null,
  scope = "task",
  only = [],
}) {
  const errors = [];
  const gates = parseConstraintGates(constraints);
  if (gates === null) {
    errors.push('CONSTRAINTS.md has no "Enforced with numbers" table');
  }
  const index = parseIndex(conventions);
  if (index === null) {
    errors.push("CONVENTIONS.md has no Enforcement Index section");
  }
  if (!(scope in SCOPES)) {
    errors.push(`unknown scope "${scope}" (use ${SCOPE_NAMES.join(", ")})`);
  }
  if (gates === null || index === null || !(scope in SCOPES)) {
    return { scope, steps: [], skipped: [], reviewOnly: [], errors };
  }

  const collected = collectSteps(gates, index, scripts, errors);
  const reviewOnly = index.filter((row) => row.reviewOnly).map((row) => row.id);
  if (checklist !== null) {
    for (const id of reviewChecklistGaps(reviewOnly, checklist)) {
      errors.push(
        `review-only rule \`${id}\` has no entry in the review checklist`
      );
    }
  }

  const inScope = new Set(SCOPES[scope]);
  let steps = collected.steps.filter((step) => inScope.has(step.tier));
  if (only.length > 0) {
    for (const name of only) {
      if (!collected.steps.some((step) => step.script === name)) {
        errors.push(
          `--only \`${name}\` is not a gate in CONSTRAINTS.md or the Enforcement Index`
        );
      }
    }
    steps = collected.steps.filter((step) => only.includes(step.script));
  }
  return {
    scope,
    steps,
    skipped:
      only.length > 0
        ? []
        : collected.skipped.filter((item) => inScope.has(item.tier)),
    reviewOnly,
    errors,
  };
}

/**
 * pnpm forwards the `--` in `pnpm run verify:code -- --list` to the script, and
 * parseArgs would then treat every flag after it as a positional argument.
 */
export function stripPassthroughSeparator(argv) {
  return argv[0] === "--" ? argv.slice(1) : argv;
}

export function tailOf(text, lines = 15) {
  return text.trim().split("\n").slice(-lines).join("\n");
}

function describe(step) {
  const labels =
    step.dimensions.length > 0 ? step.dimensions : ["Convention rules"];
  return labels.join(", ");
}

export function formatPlan(plan) {
  const lines = [`verify-code plan (scope: ${plan.scope})`];
  for (const step of plan.steps) {
    lines.push(`  ${step.script.padEnd(22)} [${step.tier}] ${describe(step)}`);
  }
  for (const item of plan.skipped) {
    lines.push(`  skipped: ${item.dimension} - ${item.reason}`);
  }
  return lines.join("\n");
}

/** Failed gates first-class: name the convention rules each one enforces. */
export function formatReport({ plan, results, checklistPath }) {
  const failed = results.filter((result) => !result.pass);
  const lines = [`verify-code (scope: ${plan.scope})`, ""];
  for (const result of results) {
    const mark = result.pass ? "PASS" : "FAIL";
    lines.push(
      `${mark}  ${result.script.padEnd(22)} ${String(result.seconds).padStart(7)}s  ${result.dimensions.join(", ")}`
    );
  }
  lines.push(
    "",
    `Passed ${results.length - failed.length}/${results.length} gates.`
  );

  for (const result of failed) {
    lines.push("", `--- ${result.script} failed ---`);
    if (result.rules.length > 0) {
      lines.push(
        `Convention rules behind this gate: ${result.rules.join(", ")}`
      );
    }
    lines.push(result.error);
  }
  for (const item of plan.skipped) {
    lines.push("", `Not run: ${item.dimension} - ${item.reason}`);
  }
  if (plan.reviewOnly.length > 0) {
    lines.push(
      "",
      "Review-only rules (no tool decides these; review the diff by hand):",
      `  ${plan.reviewOnly.join(", ")}`,
      `  Checklist: ${checklistPath}`
    );
  }
  return lines.join("\n");
}
