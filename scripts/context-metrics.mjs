import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

// Aggregates a user-selected Codex JSONL log without printing its content.
export function createMeter() {
  const calls = new Map();
  const tools = {};
  const delegation = { requested: 0, explicitModel: 0, fullHistory: 0, unknownArguments: 0 };
  let compactions = 0;
  let usage = null;
  return {
    add(record) {
      if (record.type === 'compacted') compactions++;
      const item = record.payload ?? {};
      if (item.type === 'token_count' && item.info?.total_token_usage) usage = item.info;
      if (item.type === 'function_call' || item.type === 'custom_tool_call') {
        calls.set(item.call_id, item.name ?? 'unknown');
        if (item.name === 'spawn_agent') {
          delegation.requested++;
          try {
            const args = JSON.parse(item.arguments ?? '{}');
            if (args.model) delegation.explicitModel++;
            if ((args.fork_turns ?? 'all') === 'all') delegation.fullHistory++;
          } catch { delegation.unknownArguments++; }
        }
      }
      if (item.type === 'function_call_output' || item.type === 'custom_tool_call_output') {
        const name = calls.get(item.call_id) ?? 'unknown';
        const data = typeof item.output === 'string' ? item.output : JSON.stringify(item.output ?? '');
        const bytes = Buffer.byteLength(data);
        const entry = tools[name] ??= { results: 0, bytes: 0, maxBytes: 0 };
        entry.results++;
        entry.bytes += bytes;
        entry.maxBytes = Math.max(entry.maxBytes, bytes);
      }
    },
    result() {
      return { usage, compactions, delegation, tools,
        notes: 'Reported usage is session telemetry, not plan billing. Tool result bytes may include encoded images and are not token counts.' };
    },
  };
}

async function main() {
  const path = process.argv[2];
  if (!path || path === '--help') {
    console.log('Usage: node scripts/context-metrics.mjs <local-session.jsonl>');
    return path ? 0 : 2;
  }
  const meter = createMeter();
  let invalidLines = 0;
  for await (const line of createInterface({ input: createReadStream(path), crlfDelay: Infinity })) {
    try { meter.add(JSON.parse(line)); } catch { invalidLines++; }
  }
  console.log(JSON.stringify({ ...meter.result(), invalidLines }, null, 2));
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().then((code) => { process.exitCode = code; }).catch((error) => {
    console.error(`Could not read session (${error.code ?? 'unknown error'}).`);
    process.exitCode = 1;
  });
}
