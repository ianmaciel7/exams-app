import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import hf from './high-fidelity-components.cjs';
const root='docs/releases/v0.1.0';
export function checkFidelityCoverage(state,ids){
 const gate=state.highFidelity?.coverageGate;if(!gate)return ['Missing inherited fidelity coverage ledger'];
 const errors=[],seen=new Set();
 const sg=state.highFidelity.specificationGate;
 if(!sg||!Array.isArray(sg.criteria))errors.push("Missing High-Fidelity specification ledger");
 else {const required=["dimensions","type-hierarchy","spacing","component-anatomy","responsive","accessibility-intent","stage-boundary"];for(const id of required){const c=sg.criteria.find(x=>x.id===id);if(!c||!c.elements?.length||!c.elements.every(x=>ids.has(x)))errors.push("Missing specification evidence: "+id);}}
 if(!gate.baselineCommit||!Array.isArray(gate.obligations)||!gate.obligations.length)return ['Invalid inherited coverage ledger'];
 for(const o of gate.obligations){if(!o.id||seen.has(o.id))errors.push('Missing/duplicate obligation ID '+o.id);seen.add(o.id);if(!['represented','missing','deferred'].includes(o.status))errors.push('Invalid status '+o.id);if(!o.baseline||!o.requirement)errors.push('Missing traceability '+o.id);if(o.status==='represented'&&(!o.elementIds?.length||!o.reviewEvidence))errors.push('Missing representation evidence '+o.id);for(const id of o.elementIds??[])if(!ids.has(id))errors.push('Missing target '+o.id+': '+id);if(o.status==='deferred'&&(!o.reason||!o.targetStage||!o.source))errors.push('Unjustified deferral '+o.id);}
 const required=['question-complete','pagination','correct','wrong','selected','question-loading','question-empty','question-failure','submission-pending','submission-recovery','navigation-empty','navigation-loading','navigation-failure','navigation-expanded','navigation-collapsed','control-states','full-label','long-content','phone-closed','phone-open','localized','responsive'];for(const id of required)if(!seen.has(id))errors.push('Required obligation omitted '+id);
 const blocked=gate.obligations.some(o=>o.status==='missing')||gate.visualReview!=='verified'||sg?.visualReview!=='verified';
 if(blocked&&gate.status!=='blocked')errors.push('Coverage gate must remain blocked');
 const stage=state.stages.find(s=>s.name==='High-Fidelity Wireframe');
 if(blocked&&(state.stage!=='High-Fidelity Wireframe'||!stage?.status.startsWith('In progress')))errors.push('Cannot advance High-Fidelity with unresolved coverage or visual review');
 return errors;
}
export function checkCurrentFidelityCoverage(){const state=JSON.parse(readFileSync(root+'/current-state.json','utf8'));const ids=new Set(JSON.parse(readFileSync(root+'/high-fidelity-wireframe/db/board/meta.json','utf8')).order);const errors=checkFidelityCoverage(state,ids);if(JSON.stringify(state.highFidelity.structuralSpec)!==JSON.stringify(hf.spec))errors.push('Structural specification differs from generator');return errors;}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){const errors=checkCurrentFidelityCoverage();if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log('Fidelity coverage ledger valid (stage closure separately gated)');}
