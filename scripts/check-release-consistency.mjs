import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import components from './mid-fidelity-components.cjs';
const release='docs/releases/v0.1.0';
const read=p=>readFileSync(p,'utf8');
const json=p=>JSON.parse(read(p));
export function checkReleaseConsistency(){
 const errors=[];
 const minimums={'docs/boards/project-hub':12,'docs/boards/release-stages':8,'docs/boards/overview':60,...Object.fromEntries(['product','information-architecture','screen-inventory','user-flows'].map(dir=>[join(release,dir),5]))};
 for(const [path,min] of Object.entries(minimums)){const meta=json(join(path,'db/board/meta.json'));if(meta.order.length<min)errors.push('Incomplete or blank planning board: '+path);}
 const state=json(join(release,'current-state.json'));
 const meta=json(join(release,'mid-fidelity-wireframe/db/board/meta.json'));
 const count=meta.order.filter(id=>id.endsWith('_note')).length;
 if(count!==state.variantCount||count!==components.states.length)errors.push('Mid-Fidelity variant count drift');
 for(const [dir,expected] of Object.entries(state.notes)){
  if(json(join(release,dir,'db/elements/note.json')).text!==expected)errors.push('Planning board drift: '+dir);
 }
 if(json('docs/boards/release-stages/db/elements/release_v010_status.json').text!==state.stageNote)errors.push('Release stage board drift');
 for(const p of ['PRODUCT.md','DESIGN.md','docs/README.md',join(release,'README.md'),...['product','information-architecture','screen-inventory','user-flows','mid-fidelity-wireframe'].map(dir=>join(release,dir,'README.md'))])if(!read(p).includes(state.status))errors.push('Current release status drift: '+p);
 for(const [dir,key] of [['sketch','sketch'],['low-fidelity-wireframe','lowFidelity']]){
  const m=json(join(release,dir,'db/board/meta.json'));
  if(m.order.filter(id=>id.endsWith('_note')).length!==state.previousStages[key].count)errors.push('Historical state count drift: '+dir);
 }
 return errors;
}
