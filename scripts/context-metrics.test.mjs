import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMeter } from './context-metrics.mjs';

test('aggregates telemetry without exposing call arguments or outputs', () => {
  const meter = createMeter();
  meter.add({ type: 'compacted' });
  meter.add({ payload: { type: 'function_call', call_id: '1', name: 'spawn_agent', arguments: '{"model":"example","fork_turns":"none","private":"secret"}' } });
  meter.add({ payload: { type: 'function_call_output', call_id: '1', output: 'private output' } });
  meter.add({ payload: { type: 'token_count', info: { total_token_usage: { input_tokens: 100, cached_input_tokens: 80, output_tokens: 4 } } } });
  const result = meter.result();
  assert.deepEqual(result.delegation, { requested: 1, explicitModel: 1, fullHistory: 0, unknownArguments: 0 });
  assert.equal(result.compactions, 1);
  assert.equal(result.tools.spawn_agent.bytes, 14);
  assert.equal(result.usage.total_token_usage.cached_input_tokens, 80);
  assert.doesNotMatch(JSON.stringify(result), /secret|private output/);
});

test('counts malformed delegation arguments without inventing model details', () => {
  const meter = createMeter();
  meter.add({ payload: { type: 'function_call', call_id: '1', name: 'spawn_agent', arguments: '{' } });
  assert.deepEqual(meter.result().delegation, { requested: 1, explicitModel: 0, fullHistory: 0, unknownArguments: 1 });
  assert.equal(meter.result().usage, null);
});
