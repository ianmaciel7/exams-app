import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

// Open Artifact v0.16.3: whiteboard-core/src/schema.ts (MAX_BOARD_ELEMENTS).
export const MAX_BOARD_ELEMENTS = 800;

export function checkBoard(root) {
  const errors = [];
  const db = join(root, 'db');
  try {
    const meta = JSON.parse(readFileSync(join(db, 'board/meta.json'), 'utf8'));
    if (!Array.isArray(meta.order)) throw new Error('meta.order must be an array');
    if (meta.order.length > MAX_BOARD_ELEMENTS) errors.push(`board exceeds ${MAX_BOARD_ELEMENTS} elements (${meta.order.length})`);
    const ids = new Set(meta.order);
    if (ids.size !== meta.order.length) errors.push('duplicate IDs in meta.order');
    const files = readdirSync(join(db, 'elements')).filter((name) => name.endsWith('.json'));
    for (const id of meta.order) {
      const path = join(db, 'elements', `${id}.json`);
      if (!existsSync(path)) { errors.push(`missing element: ${id}`); continue; }
      const element = JSON.parse(readFileSync(path, 'utf8'));
      if (element.type === 'arrow') {
        for (const side of ['from', 'to']) {
          if (typeof element[side] === 'string' && !ids.has(element[side])) errors.push(`broken arrow: ${id}.${side}`);
        }
      }
      if (element.type === 'link' && /https?:\/\/(localhost|127\.0\.0\.1)(:|\/)/i.test(element.href ?? '')) errors.push(`local URL in link: ${id}`);
    }
    for (const file of files) if (!ids.has(file.slice(0, -5))) errors.push(`unlisted element: ${file}`);
  } catch (error) { errors.push(error.message); }
  return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const boards = ['docs/boards/overview', 'docs/boards/project-hub', 'docs/boards/release-stages', ...['product', 'information-architecture', 'screen-inventory', 'user-flows', 'sketch', 'low-fidelity-wireframe'].map((name) => `docs/releases/v0.1.0/${name}`)];
  let failed = false;
  for (const board of boards) {
    const errors = checkBoard(board);
    console.log(`${board}: ${errors.length ? errors.join('; ') : 'OK'}`);
    failed ||= errors.length > 0;
  }
  if (failed) process.exitCode = 1;
}
