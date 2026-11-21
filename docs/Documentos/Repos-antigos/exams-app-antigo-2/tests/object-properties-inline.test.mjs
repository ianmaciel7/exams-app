import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../prototype/exam-app-0.1.1__index.html', import.meta.url), 'utf8');

test('object page renders borderless inline properties and an accessible landmark', () => {
  assert.match(html, /const opProps=\(rows,iid,inline=false\)=>\{/);
  assert.ok(html.includes('if(inline) return \'<dl class="op-props flat op-props-inline"'));
  assert.ok(html.includes('opProps(o.props,o.iid,true)'));
  assert.match(html, /aria-label="Propriedades do objeto"/);
  assert.match(html, /\.op-side \.op-props\.op-props-inline\{margin:0;padding:0;border:0;background:transparent\}/);
});
test('detail panels retain the collapsible editable card', () => {
  assert.match(html, /return '<div class="props-card'/);
  assert.match(html, /data-edit-prop/);
  assert.match(html, /data-edit-chip/);
  assert.match(html, /data-edit-cv/);
});
