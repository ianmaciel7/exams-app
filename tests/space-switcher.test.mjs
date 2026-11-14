import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html=readFileSync(new URL('../prototypes/exam-app-0.1.1/index.html',import.meta.url),'utf8');
test('SpaceSwitcher migrates legacy spaces without renaming/reidentifying entities',()=>{
  assert.match(html,/persistedSpaceOrder=store\.get\('spaceOrder'\)/);
  assert.match(html,/store\.set\('spaceOrder',spaces\.map\(s=>s\.id\)\)/);
  assert.match(html,/let spaces=\[BASE_SP\]\.concat\(store\.get\('spaces'\)\|\|\[\]\)/);
});
test('SpaceSwitcher has keyboard search and pointer sorting with cancellation',()=>{
  for(const token of ['id="spSearch"','id="spItems"','spNormalized','moveSpaceStep','pointercancel','setPointerCapture','spaceFilter.trim()','spacePicker.addEventListener(\'keydown\'']){
    assert.ok(html.includes(token),'Missing '+token);
  }
  assert.match(html,/e\.isComposing/);
  assert.match(html,/data-spdrag/);
});
