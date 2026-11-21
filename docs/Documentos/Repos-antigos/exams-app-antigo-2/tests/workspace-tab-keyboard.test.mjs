import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../prototype/exam-app-0.1.1__index.html', import.meta.url), 'utf8');

test('workspace tab exposes documented keyboard shortcut and pin state', () => {
  assert.match(html, /aria-keyshortcuts="Shift\+P"/);
  assert.match(html, /aria-description="Pressione Shift\+P para fixar ou desafixar esta aba"/);
  assert.match(html, /esc\(ttl\+\(t\.pinned\?' · fixada':''\)\)/);
});
test('mouse and keyboard share the same pin toggle implementation', () => {
  assert.match(html, /function wsTogglePinned\(id\)\{/);
  assert.match(html, /wsTogglePinned\(pn\.dataset\.tabPin\)/);
  assert.match(html, /e\.shiftKey&&!e\.altKey&&!e\.ctrlKey&&!e\.metaKey&&e\.key\.toLowerCase\(\)==='p'/);
  assert.match(html, /wsTogglePinned\(t\.dataset\.tab\)/);
});
test('main and contextual tab action targets have a 24 px layout minimum', () => {
  assert.match(html, /\.ws-tact button\{width:24px;height:24px;/);
  assert.match(html, /\.rp-top \.ws-tab \.ws-tx\{width:24px;height:24px\}/);
});
