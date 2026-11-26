import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

// Evaluate recorded observations; this does not run agents or collect telemetry.
export function compare(cases, observations) {
  const findings = [];
  const metrics = ['wall_ms', 'tool_calls', 'agent_calls', 'tokens'];
  const totals = Object.fromEntries(metrics.map((key) => [key, { baseline: 0, adaptive: 0, pairs: 0 }]));
  const ids = new Set(cases.map((item) => item.id));
  for (const id of Object.keys(observations)) if (!ids.has(id)) findings.push(`${id}: unknown case`);
  for (const { id } of cases) {
    const pair = observations[id];
    if (!pair?.baseline || !pair?.adaptive) {
      findings.push(`${id}: missing baseline or adaptive observation`);
      continue;
    }
    for (const name of ['baseline', 'adaptive']) {
      const run = pair[name];
      if (typeof run.correct !== 'boolean' || typeof run.routing_appropriate !== 'boolean' || !run.evidence || !run.model || !run.effort) {
        findings.push(`${id}/${name}: missing required assessment, model, effort or evidence`);
      }
      for (const metric of metrics) {
        if (run[metric] != null && (typeof run[metric] !== 'number' || !Number.isFinite(run[metric]) || run[metric] < 0)) {
          findings.push(`${id}/${name}: invalid ${metric}`);
        }
      }
    }
    if (pair.baseline.correct === true && pair.adaptive.correct === false) findings.push(`${id}: correctness regression`);
    if (pair.adaptive.correct === false) findings.push(`${id}: adaptive acceptance failed`);
    if (pair.adaptive.routing_appropriate === false) findings.push(`${id}: inappropriate adaptive routing`);
    for (const metric of metrics) {
      const a = pair.baseline[metric], b = pair.adaptive[metric];
      if ([a, b].every((n) => typeof n === 'number' && Number.isFinite(n) && n >= 0)) {
        totals[metric].baseline += a;
        totals[metric].adaptive += b;
        totals[metric].pairs++;
      }
    }
  }
  return { findings, totals, cases: cases.length };
}

async function main() {
  const file = process.argv[2];
  if (!file) throw new Error('Usage: node evals/compare-adaptive-routing.mjs <observations.json>');
  const cases = JSON.parse(await readFile(new URL('./adaptive-routing-cases.json', import.meta.url), 'utf8')).cases;
  const observations = JSON.parse(await readFile(file, 'utf8'));
  const result = compare(cases, observations);
  for (const finding of result.findings) console.log(`FAIL: ${finding}`);
  for (const [name, value] of Object.entries(result.totals)) {
    console.log(value.pairs === result.cases ? `${name}: baseline ${value.baseline}, adaptive ${value.adaptive}` : `${name}: unknown (${value.pairs}/${result.cases} paired observations)`);
  }
  console.log(result.findings.length ? 'Evaluation incomplete or failed.' : 'Recorded assessments passed; verify evidence independently.');
  if (result.findings.length) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch((error) => { console.error(error.message); process.exitCode = 1; });
