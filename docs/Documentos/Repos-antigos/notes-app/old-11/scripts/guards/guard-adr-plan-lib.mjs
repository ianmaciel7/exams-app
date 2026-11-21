import fs from "node:fs";
import path from "node:path";
import { normalizePath } from "./guard-doc-sync-lib.mjs";

/**
 * Extracts ADR number prefix (e.g. "0017") from a filename.
 * @param {string} filePath
 * @returns {string|null}
 */
export function extractAdrNumber(filePath) {
  const match = path.basename(filePath).match(/^(\d{4})/);
  return match ? match[1] : null;
}

function safeReadFile(filePath) {
  try {
    return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
  } catch {
    return "";
  }
}

function readDiskPlans(activePlansDir) {
  if (!fs.existsSync(activePlansDir)) {
    return [];
  }
  const entries = fs.readdirSync(activePlansDir);
  const result = [];
  for (const f of entries) {
    if (f.endsWith(".md") && f !== "README.md" && f !== "template.md") {
      const content = safeReadFile(path.join(activePlansDir, f));
      result.push({ path: `docs/exec-plans/active/${f}`, content });
    }
  }
  return result;
}

function readDiskSpecs(specsDir) {
  if (!fs.existsSync(specsDir)) {
    return [];
  }
  const entries = fs.readdirSync(specsDir);
  const result = [];
  for (const f of entries) {
    if (f.endsWith(".md") && f !== "README.md" && f !== "index.md") {
      const content = safeReadFile(path.join(specsDir, f));
      result.push({ path: `docs/product-specs/${f}`, content });
    }
  }
  return result;
}

function readCandidateArtifacts(root, normalized) {
  const diskPlans = readDiskPlans(
    path.join(root, "docs", "exec-plans", "active")
  );
  const diskSpecs = readDiskSpecs(path.join(root, "docs", "product-specs"));

  const isExtraPlan = (f) =>
    (f.startsWith("docs/exec-plans/active/") &&
      f.endsWith(".md") &&
      !f.endsWith("README.md") &&
      !f.endsWith("template.md")) ||
    (f.startsWith(".scratch/") && f.endsWith(".md"));

  const isExtraSpec = (f) =>
    f.startsWith("docs/product-specs/") &&
    f.endsWith(".md") &&
    !f.endsWith("README.md") &&
    !f.endsWith("index.md");

  const plans = [...diskPlans];
  const specs = [...diskSpecs];

  for (const f of normalized) {
    if (isExtraPlan(f) && !plans.some((p) => p.path === f)) {
      plans.push({ path: f, content: safeReadFile(path.join(root, f)) });
    }
    if (isExtraSpec(f) && !specs.some((s) => s.path === f)) {
      specs.push({ path: f, content: safeReadFile(path.join(root, f)) });
    }
  }

  return { plans, specs };
}

function matchesArtifact(item, num, baseSlug) {
  const pBase = path.basename(item.path);
  if (num && (pBase.startsWith(num) || item.path.includes(num))) {
    return true;
  }
  if (
    (num &&
      (item.content.includes(`ADR ${num}`) ||
        item.content.includes(`adr/${num}`) ||
        item.content.includes(`00${num}`))) ||
    item.content.includes(baseSlug) ||
    item.path.includes(baseSlug)
  ) {
    return true;
  }
  return false;
}

/**
 * Checks whether an ADR has BOTH:
 * 1. A Product/Feature Spec in `docs/product-specs/` (defining User Stories, problem, solution, test seams).
 * 2. An active execution plan in `docs/exec-plans/active/` OR tracer-bullet tickets in `.scratch/`.
 */
export function checkAdrPlanGuard(changedFiles = [], options = {}) {
  const root = options.root || process.cwd();
  const normalized = changedFiles.map(normalizePath).filter(Boolean);

  const adrFiles = normalized.filter(
    (f) =>
      f.startsWith("docs/adr/") && f.endsWith(".md") && !f.endsWith("README.md")
  );

  if (adrFiles.length === 0) {
    return {
      pass: true,
      reason: "no-adr-changes",
      adrFiles: [],
      missingSpecs: [],
      missingPlans: [],
      message: "No ADR modifications requiring lifecycle verification.",
    };
  }

  if (options.allowNoPlan) {
    return {
      pass: true,
      reason: "bypassed",
      adrFiles,
      missingSpecs: [],
      missingPlans: [],
      message: `ADR lifecycle guard explicitly bypassed for ${adrFiles.length} ADR file(s).`,
    };
  }

  const { plans, specs } = readCandidateArtifacts(root, normalized);
  const missingSpecs = [];
  const missingPlans = [];

  for (const adrFile of adrFiles) {
    const num = extractAdrNumber(adrFile);
    const baseSlug = path.basename(adrFile, ".md");

    const hasSpec = specs.some((s) => matchesArtifact(s, num, baseSlug));
    const hasPlan = plans.some((p) => matchesArtifact(p, num, baseSlug));

    if (!hasSpec) {
      missingSpecs.push(adrFile);
    }
    if (!hasPlan) {
      missingPlans.push(adrFile);
    }
  }

  if (missingSpecs.length > 0 || missingPlans.length > 0) {
    return {
      pass: false,
      reason: "missing-lifecycle-artifacts",
      adrFiles,
      missingSpecs,
      missingPlans,
      message: `ADR lifecycle incomplete: ${missingSpecs.length} missing feature spec(s), ${missingPlans.length} missing execution plan/ticket(s).`,
    };
  }

  return {
    pass: true,
    reason: "lifecycle-verified",
    adrFiles,
    missingSpecs: [],
    missingPlans: [],
    message: `All changed ADRs have verified Product Specs and Execution Plans/Tickets.`,
  };
}

export function formatAdrPlanFindings(result) {
  if (result.pass) {
    return `[guard-adr-lifecycle] ✓ ${result.message}`;
  }

  const lines = [
    `[guard-adr-lifecycle] ✗ Incomplete ADR lifecycle detected!`,
    `Every ADR requires both a Product Spec (/to-spec) and an Execution Plan/Tickets (/to-tickets) before implementation:`,
  ];

  if (result.missingSpecs.length > 0) {
    lines.push(
      "",
      "Missing Product Specification (User Stories & Test Seams):"
    );
    for (const f of result.missingSpecs) {
      lines.push(
        `  • ${f} -> Needs docs/product-specs/<name>.md (or run /to-spec)`
      );
    }
  }

  if (result.missingPlans.length > 0) {
    lines.push("", "Missing Execution Plan or Tracer-Bullet Tickets:");
    for (const f of result.missingPlans) {
      lines.push(
        `  • ${f} -> Needs docs/exec-plans/active/<name>.md or .scratch/<name>/issues/ (or run /to-tickets)`
      );
    }
  }

  lines.push(
    "",
    "Remediation:",
    "  1. Run /to-spec targeting the ADR to create docs/product-specs/<feature>.md with User Stories.",
    "  2. Run /to-tickets or initialize docs/exec-plans/active/<name>.md with atomic tracer-bullets.",
    "  3. Bypass only for editorial typos via --allow-no-plan or [skip-plan] commit message."
  );

  return lines.join("\n");
}
