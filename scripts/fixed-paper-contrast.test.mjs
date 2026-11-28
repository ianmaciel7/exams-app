import test from 'node:test';
import assert from 'node:assert/strict';
import { ratio, safeInk, insideOutline } from './fixed-paper-contrast.mjs';
test('preserves adequate native ink and corrects weak fixed-paper ink',()=>{
  assert.equal(safeInk('#262626','#ffffff'),null);
  assert.equal(safeInk('#b5b5b5','#ffffff'),'#262626');
  assert.equal(safeInk('#b5b5b5','#f1f1f1'),'#262626');
  assert.equal(safeInk('#262626','#191919'),'#efefef');
  assert.equal(safeInk('currentColor','#ffffff'),null);
  assert.ok(ratio('#262626','#f1f1f1')>=4.5);
});

test('only text strictly inside a verified transparent outline can see through it',()=>{
 const a={x:90,y:180,w:1280,h:500};
 assert.equal(insideOutline(a,{x:402,y:245,w:740,h:24}),true);
 assert.equal(insideOutline(a,{x:90,y:180,w:100,h:20}),false);
 assert.equal(insideOutline(a,{x:1360,y:245,w:50,h:24}),false);
});
