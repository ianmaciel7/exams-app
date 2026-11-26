import test from 'node:test';
import assert from 'node:assert/strict';
import { compare } from './compare-adaptive-routing.mjs';

const cases = [{ id: 'auth' }];
const run = { correct: true, routing_appropriate: true, evidence: 'review', model: 'observed', effort: 'unknown', wall_ms: 4 };

test('reports missing pairs and unknown metrics', () => {
  const result = compare(cases, { auth: { baseline: run } });
  assert.match(result.findings[0], /missing baseline or adaptive/);
  assert.equal(result.totals.tokens.pairs, 0);
});

test('detects correctness regressions and inappropriate routing', () => {
  const result = compare(cases, { auth: { baseline: run, adaptive: { ...run, correct: false, routing_appropriate: false } } });
  assert.ok(result.findings.some((item) => item.includes('correctness regression')));
  assert.ok(result.findings.some((item) => item.includes('inappropriate adaptive routing')));
});

test('compares only measured, valid pairs and rejects unknown cases', () => {
  const result = compare(cases, { auth: { baseline: run, adaptive: { ...run, wall_ms: 8, tokens: -1 } }, extra: {} });
  assert.deepEqual(result.totals.wall_ms, { baseline: 4, adaptive: 8, pairs: 1 });
  assert.equal(result.totals.tokens.pairs, 0);
  assert.ok(result.findings.some((item) => item.includes('invalid tokens')));
  assert.ok(result.findings.some((item) => item.includes('unknown case')));
});
