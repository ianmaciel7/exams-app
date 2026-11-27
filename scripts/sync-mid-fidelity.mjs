import {readFileSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import components from './mid-fidelity-components.cjs';
const root='docs/releases/v0.1.0/mid-fidelity-wireframe/db';
export function checkMidFidelityComponents(){
 const meta=JSON.parse(readFileSync(join(root,'board/meta.json'),'utf8'));
 const expected={...components.shared(),...components.studies()};
 const errors=[];
 for(const [id,element] of Object.entries(expected)){
  if(!meta.order.includes(id)){errors.push('Missing shared element '+id);continue;}
  try{const actual=JSON.parse(readFileSync(join(root,'elements',id+'.json'),'utf8'));if(JSON.stringify(actual)!==JSON.stringify(element))errors.push('Shared component drift: '+id);}catch(e){errors.push(id+': '+e.message);}
 }
 const toggles=meta.order.filter(id=>id.endsWith('_toggle_panel'));
 if(toggles.length!==components.states.length)errors.push('Expected one toggle in every variant');
 if(components.states.some(id=>!meta.order.includes(id+'_note')))errors.push('Missing state note');
 return errors;
}
if(process.argv[1]?.endsWith('sync-mid-fidelity.mjs')){
 if(process.argv.includes('--write'))for(const [id,e] of Object.entries({...components.shared(),...components.studies()}))writeFileSync(join(root,'elements',id+'.json'),JSON.stringify(e,null,2)+'\n');
 const errors=checkMidFidelityComponents();if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log('Shared Mid-Fidelity components: OK');
}
