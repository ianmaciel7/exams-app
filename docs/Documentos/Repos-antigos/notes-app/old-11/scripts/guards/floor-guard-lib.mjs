export function normalizePatchPath(value) {
  if (!value || value === "/dev/null") {
    return "";
  }
  return value.replace(/^[ab]\//, "").replaceAll("\\", "/");
}

export function parsePatch(diff) {
  const added = [];
  const removed = [];
  let oldFile = "";
  let newFile = "";
  for (const line of diff.split("\n")) {
    if (line.startsWith("--- ")) {
      oldFile = normalizePatchPath(line.slice(4).trim());
    } else if (line.startsWith("+++ ")) {
      newFile = normalizePatchPath(line.slice(4).trim());
    } else if (line.startsWith("+")) {
      added.push({ file: newFile, text: line.slice(1) });
    } else if (line.startsWith("-")) {
      removed.push({ file: oldFile, text: line.slice(1) });
    }
  }
  return { added, removed };
}

export function isTestFile(file) {
  return /(^|\/)(test_|.*\.(test|spec)\.|.*_test\.)/i.test(file);
}

export function deletedTestFiles(nameStatus) {
  return nameStatus
    .split(/\r?\n/)
    .filter(Boolean)
    .flatMap((line) => {
      const [status, ...parts] = line.split("\t");
      const file = parts.at(-1) ?? "";
      return status === "D" && isTestFile(file) ? [file] : [];
    });
}

function numericFields(text, names) {
  const result = new Map();
  for (const name of names) {
    const match = text.match(
      new RegExp(`\\b${name}\\s*:\\s*([0-9]+(?:\\.[0-9]+)?)`)
    );
    if (match) {
      result.set(name, Number(match[1]));
    }
  }
  return result;
}

function lighthouseAssertions(text) {
  const result = new Map();
  const regex =
    /"categories:([^"]+)"\s*:\s*\["(error|warn)",\s*\{\s*minScore:\s*([0-9.]+)/g;
  for (const match of text.matchAll(regex)) {
    result.set(match[1], { severity: match[2], score: Number(match[3]) });
  }
  return result;
}

function checkVitestRegressions(baseline, current) {
  const findings = [];
  const fields = ["lines", "functions", "branches", "statements"];
  const before = numericFields(baseline, fields);
  const after = numericFields(current, fields);
  for (const [name, value] of before) {
    if (!after.has(name) || after.get(name) < value) {
      findings.push(
        `coverage ${name}: ${value} -> ${after.get(name) ?? "missing"}`
      );
    }
  }
  return findings;
}

function checkJscpdRegressions(baseline, current) {
  try {
    const before = JSON.parse(baseline).threshold;
    const after = JSON.parse(current).threshold;
    if (
      typeof before === "number" &&
      (typeof after !== "number" || after > before)
    ) {
      return [`duplication threshold: ${before} -> ${after ?? "missing"}`];
    }
  } catch {
    return [];
  }
  return [];
}

function checkLighthouseRegressions(baseline, current) {
  const findings = [];
  const rank = { error: 2, warn: 1 };
  const before = lighthouseAssertions(baseline);
  const after = lighthouseAssertions(current);
  for (const [name, rule] of before) {
    const next = after.get(name);
    if (
      !next ||
      next.score < rule.score ||
      (rank[next.severity] ?? 0) < (rank[rule.severity] ?? 0)
    ) {
      findings.push(
        `Lighthouse ${name}: ${rule.severity}/${rule.score} -> ${next ? `${next.severity}/${next.score}` : "missing"}`
      );
    }
  }
  return findings;
}

function checkDepCruiserRegressions(baseline, current) {
  const findings = [];
  const names = (text) =>
    new Set([...text.matchAll(/\bname:\s*"([^"]+)"/g)].map((m) => m[1]));
  const before = names(baseline);
  const after = names(current);
  for (const name of before) {
    if (!after.has(name)) {
      findings.push(`dependency rule removed: ${name}`);
    }
  }
  return findings;
}

// A floor file added on this branch has no merge-base version, so it is also
// compared against HEAD; otherwise a floor lowered before the first commit of
// that file would pass unnoticed. Missing baselines are skipped, not errors.
export function baselineRegressions(path, current, readBaseline, refs) {
  const findings = new Set();
  for (const ref of new Set(refs)) {
    const baseline = readBaseline(ref, path);
    if (baseline === null) {
      continue;
    }
    for (const detail of qualityRegressions(path, baseline, current)) {
      findings.add(detail);
    }
  }
  return [...findings];
}

export function qualityRegressions(path, baseline, current) {
  if (path === "vitest.config.ts") {
    return checkVitestRegressions(baseline, current);
  }
  if (path === ".jscpd.json") {
    return checkJscpdRegressions(baseline, current);
  }
  if (path === "lighthouserc.cjs") {
    return checkLighthouseRegressions(baseline, current);
  }
  if (path === ".dependency-cruiser.cjs") {
    return checkDepCruiserRegressions(baseline, current);
  }
  return [];
}
