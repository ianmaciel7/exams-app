import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../prototype/exam-app-0.1.1__index.html', import.meta.url), 'utf8');

test('linked object preview uses existing graph object metadata only (#57)', () => {
  assert.match(html, /const n=nodeOf\(link\.getAttribute\('href'\)\)/);
  assert.match(html, /if\(!n\)return;/);
  assert.match(html, /esc\(n\.title\|\|link\.textContent\.trim\(\)\)/);
  assert.match(html, /Array\.isArray\(n\.extra\)/);
  assert.match(html, /card\.setAttribute\('role','tooltip'\)/);
});
test('hover delay, keyboard focus, exit and content scroll are supported (#57)', () => {
  assert.match(html, /setTimeout\(\(\)=>opHoverShow\(link\),200\)/);
  assert.match(html, /view\.addEventListener\('focusin'/);
  assert.match(html, /view\.addEventListener\('focusout'/);
  assert.match(html, /view\.addEventListener\('pointerout'/);
  assert.match(html, /view\.addEventListener\('scroll',opHoverClose/);
  assert.match(html, /addEventListener\('hashchange',opHoverClose\)/);
});
test('hovercard remains read-only and preserves existing accessibility descriptions (#57)', () => {
  assert.match(html, /if\(opHoverLink&&opHoverCard\)\{/);
  assert.match(html, /opHoverLink\.setAttribute\('aria-describedby',opHoverDesc\)/);
  assert.match(html, /link\.setAttribute\('aria-describedby',\(\(opHoverDesc\|\|''\)/);
  assert.match(html, /\.op-object-hovercard\{position:fixed;z-index:90/);
  assert.match(html, /pointer-events:none/);
});
