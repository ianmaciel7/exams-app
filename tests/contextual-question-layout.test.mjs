import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../prototypes/exam-app-0.1.1/index.html', import.meta.url), 'utf8');
test('contextual and global question cards share one rendering implementation', () => {
  assert.match(html, /function renderPracticeList\(filtered,key\)/);
  assert.match(html, /qfHTML\([\s\S]*?renderList:renderPracticeList/);
  assert.match(html, /<div class="qf-list practice-list">/);
});
test('visible options and navigation use shared component CSS instead of requiring .study-shell', () => {
  for (const target of ['s-option','s-question','s-layout','s-feedback','s-navigator','s-inlineactions','s-button','s-maincol','s-asidecol']) {
    assert.ok(html.includes(':is(.study-shell,.practice-list) .' + target), 'shared component rule missing: ' + target);
  }
  assert.match(html, /\.practice-list \.s-question \.s-eyebrow\{display:block;/);
  assert.match(html, /\.practice-list \.s-option:focus-within\{outline:/);
  assert.match(html, /\.practice-list \.s-option span\{[^}]*overflow-wrap:anywhere/);
});
