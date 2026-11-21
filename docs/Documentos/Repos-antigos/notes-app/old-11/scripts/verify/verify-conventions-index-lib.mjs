const INDEX_HEADING = /^##\s+\d+\.\s+Enforcement Index\s*$/m;
const REVIEW_ONLY = "review-only";

export function parseIndex(markdown) {
  const heading = markdown.match(INDEX_HEADING);
  if (!heading) {
    return null;
  }
  const section = markdown.slice(heading.index + heading[0].length);
  const next = section.search(/^##\s/m);
  const body = next === -1 ? section : section.slice(0, next);
  const rows = [];
  for (const line of body.split("\n")) {
    const cells = line.split("|").map((cell) => cell.trim());
    const id = cells[1]?.match(/^`([a-z0-9-]+)`$/)?.[1];
    if (!id) {
      continue;
    }
    const enforcer = cells[2] ?? "";
    const scripts = [...enforcer.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
    rows.push({ id, enforcer, scripts, reviewOnly: enforcer === REVIEW_ONLY });
  }
  return rows;
}

export function reachableScripts(scripts, entry) {
  const seen = new Set();
  const queue = [entry];
  while (queue.length > 0) {
    const name = queue.pop();
    if (seen.has(name) || !(name in scripts)) {
      continue;
    }
    seen.add(name);
    for (const match of scripts[name].matchAll(/pnpm run ([\w:.-]+)/g)) {
      queue.push(match[1]);
    }
  }
  return seen;
}

function checkRowScripts(row, scripts, gated, gate) {
  if (row.reviewOnly) {
    return [];
  }
  const errors = [];
  if (row.scripts.length === 0) {
    errors.push(
      `\`${row.id}\`: enforcer must be \`${REVIEW_ONLY}\` or package.json script names`
    );
  }
  for (const script of row.scripts) {
    if (!(script in scripts)) {
      errors.push(`\`${row.id}\`: script \`${script}\` is not in package.json`);
    } else if (!gated.has(script)) {
      errors.push(
        `\`${row.id}\`: script \`${script}\` does not run in \`${gate}\``
      );
    }
  }
  return errors;
}

function checkGuardRule(rows, id) {
  const row = rows.find((candidate) => candidate.id === id);
  if (!row) {
    return [`guard rule \`${id}\` is missing from the Enforcement Index`];
  }
  if (row.scripts.includes("check:conventions")) {
    return [];
  }
  return [
    `\`${id}\`: guard rule must list \`check:conventions\` as its enforcer`,
  ];
}

function duplicateIds(rows) {
  const seen = new Set();
  const errors = [];
  for (const { id } of rows) {
    if (seen.has(id)) {
      errors.push(`duplicate rule id \`${id}\``);
    }
    seen.add(id);
  }
  return errors;
}

export function verifyIndex({
  markdown,
  scripts,
  ruleIds,
  gate = "check:fast",
}) {
  const rows = parseIndex(markdown);
  if (!rows) {
    return { errors: ["CONVENTIONS.md has no Enforcement Index section"] };
  }
  const gated = reachableScripts(scripts, gate);
  const errors = [
    ...duplicateIds(rows),
    ...rows.flatMap((row) => checkRowScripts(row, scripts, gated, gate)),
    ...ruleIds.flatMap((id) => checkGuardRule(rows, id)),
  ];
  const reviewOnly = rows.filter((row) => row.reviewOnly).length;
  return { errors, enforced: rows.length - reviewOnly, reviewOnly };
}
