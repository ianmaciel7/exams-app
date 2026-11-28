import test from 'node:test';
import assert from 'node:assert/strict';
import { ratio, safeInk } from './fixed-paper-contrast.mjs';
test('preserves adequate native ink and corrects weak fixed-paper ink',()=>{
  assert.equal(safeInk('#262626','#ffffff'),null);
  assert.equal(safeInk('#b5b5b5','#ffffff'),'#262626');
  assert.equal(safeInk('#b5b5b5','#f1f1f1'),'#262626');
  assert.equal(safeInk('#262626','#191919'),'#efefef');
  assert.equal(safeInk('currentColor','#ffffff'),null);
  assert.ok(ratio('#262626','#f1f1f1')>=4.5);
});
