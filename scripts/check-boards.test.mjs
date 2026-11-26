import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { isAbsolute, join, relative } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkBoard, MAX_BOARD_ELEMENTS } from './check-boards.mjs';

test('detects broken references, orphans and local links', () => {
  const root = mkdtempSync(join(tmpdir(), 'exam-board-check-'));
  try {
    mkdirSync(join(root, 'db/board'), { recursive: true });
    mkdirSync(join(root, 'db/elements'), { recursive: true });
    const put = (path, data) => writeFileSync(join(root, path), JSON.stringify(data));
    put('db/board/meta.json', { order: ['one'] });
    put('db/elements/one.json', { type: 'text', text: 'Example' });
    assert.deepEqual(checkBoard(root), []);
    put('db/board/meta.json', { order: ['one', 'one', 'missing', 'arrow'] });
    put('db/elements/one.json', { type: 'link', href: 'http://127.0.0.1:1234/' });
    put('db/elements/arrow.json', { type: 'arrow', from: 'absent', to: 'one' });
    put('db/elements/orphan.json', { type: 'text' });
    const errors = checkBoard(root).join('\n');
    for (const expected of ['duplicate', 'missing element', 'broken arrow', 'local URL', 'unlisted']) assert.match(errors, new RegExp(expected));
  } finally {
    const withinTemp = relative(tmpdir(), root);
    if (!withinTemp || withinTemp.startsWith('..') || isAbsolute(withinTemp)) throw new Error('Unexpected temporary path');
    rmSync(root, { recursive: true, force: true });
  }
});

test('accepts the native board limit and rejects overflow', () => {
  const root = mkdtempSync(join(tmpdir(), 'exam-board-limit-'));
  try {
    mkdirSync(join(root, 'db/board'), { recursive: true });
    mkdirSync(join(root, 'db/elements'), { recursive: true });
    const order = Array.from({ length: MAX_BOARD_ELEMENTS }, (_, i) => `e${i}`);
    for (const id of order) writeFileSync(join(root, `db/elements/${id}.json`), JSON.stringify({ type: 'text', text: 'Example' }));
    const meta = join(root, 'db/board/meta.json');
    writeFileSync(meta, JSON.stringify({ order }));
    assert.deepEqual(checkBoard(root), []);
    order.push('overflow');
    writeFileSync(join(root, 'db/elements/overflow.json'), JSON.stringify({ type: 'text' }));
    writeFileSync(meta, JSON.stringify({ order }));
    assert.match(checkBoard(root).join('\n'), /board exceeds 800 elements \(801\)/);
  } finally {
    const withinTemp = relative(tmpdir(), root);
    if (!withinTemp || withinTemp.startsWith('..') || isAbsolute(withinTemp)) throw new Error('Unexpected temporary path');
    rmSync(root, { recursive: true, force: true });
  }
});
