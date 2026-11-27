import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {outputs,syncReleaseState} from './sync-release-state.mjs';
const s=JSON.parse(readFileSync('docs/releases/v0.1.0/current-state.json','utf8'));
test('all current release projections agree with persisted artifacts',()=>{assert.deepEqual(syncReleaseState(),[]);});
test('stage updates propagate to native board table, hub and release document',()=>{const changed=structuredClone(s);changed.stages[0].status='TEST status';const {out}=outputs(changed);assert.equal(out['docs/boards/release-stages/db/elements/stage_table.json'].rows.r1.c1,'TEST status');assert.equal(out['docs/boards/project-hub/db/elements/stage_status_0.json'].text,'TEST status');assert.match(out['docs/releases/v0.1.0/README.md'],/TEST status/);});
test('capture provenance is distinct from review and approval',()=>{const {out}=outputs(s);const doc=out['docs/releases/v0.1.0/README.md'];assert.ok(doc.includes(s.lastSuccessfulCapture.commit));assert.ok(doc.includes(s.lastReviewedCapture.commit));assert.match(doc,/not visual approval/);});
