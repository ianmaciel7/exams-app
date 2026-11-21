import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';

const html=readFileSync(new URL('../prototype/exam-app-0.1.1__index.html',import.meta.url),'utf8');
const source=(from,to)=>{
  const a=html.indexOf(from),b=html.indexOf(to,a+from.length);
  assert.ok(a>=0&&b>a,'source anchors: '+from);return html.slice(a,b);
};
test('workspace tabs expose role=tab on focusable label, pin/close controls remain siblings (#55)',()=>{
  const s=source('function wsPaint(){','function wsActivate(');
  assert.match(s,/class="ws-tmain ws-tab-control" role="tab"/);
  assert.match(s,/aria-controls="view"/);
  assert.ok(s.includes('aria-selected='));
  assert.match(s,/id="wst-/);
  assert.match(s,/data-tab-pin/);
  assert.match(s,/data-tab-close/);
  assert.match(s,/<\/span><\/span><span class="ws-tact" aria-hidden="true">/,'pin/close should follow the closing label tag and stay out of the AT tree');
  assert.doesNotMatch(s,/data-tab=.*role="tab"/,'wrapper must not have tab role');
});
test('contextual tabs expose a separate focusable tab, outside close action (#55)',()=>{
  const s=source('function rpPaintTabs(){','const rpRow=');
  assert.match(s,/data-rp-tab=/);
  assert.match(s,/class="ws-tmain ws-tab-control" role="tab"/);
  assert.match(s,/aria-selected=/);
  assert.match(s,/<span style="display:contents" aria-hidden="true"><button type="button" class="ws-tx" tabindex="-1"/);
  assert.match(s,/data-rp-tabx/);
});
test('keyboard changes focus to actual tab control instead of presentation wrapper (#55)',()=>{
  assert.match(html,/n\.querySelector\('\[role="tab"\]'\)\|\|n/);
  assert.match(html,/all\[e\.key==='Home'\?0:all\.length-1\]\?\.querySelector\('\[role="tab"\]'\)/);
  assert.match(html,/\.ws-tab-control:focus-visible/);
});
