import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import components from './mid-fidelity-components.cjs';
import {syncReleaseState} from './sync-release-state.mjs';
import {checkCurrentFidelityCoverage} from './check-fidelity-coverage.mjs';
const release='docs/releases/v0.1.0';
const read=p=>readFileSync(p,'utf8');
const json=p=>JSON.parse(read(p));
export function checkReleaseConsistency(){
 const errors=[...syncReleaseState(),...checkCurrentFidelityCoverage()];
 const minimums={'docs/boards/project-hub':12,'docs/boards/release-stages':8,'docs/boards/overview':60,...Object.fromEntries(['product','information-architecture','screen-inventory','user-flows'].map(dir=>[join(release,dir),5]))};
 for(const [path,min] of Object.entries(minimums)){const meta=json(join(path,'db/board/meta.json'));if(meta.order.length<min)errors.push('Incomplete or blank planning board: '+path);}
 // Native link cards measure 320 × 56 canvas units in the current renderer.
 const linkW=320,linkH=56,gap=24;
 for(const path of Object.keys(minimums)){
  const meta=json(join(path,'db/board/meta.json'));
  const elements=meta.order.map(id=>({id,...json(join(path,'db/elements',id+'.json'))}));
  const links=elements.filter(e=>e.type==='link');
  for(let i=0;i<links.length;i++)for(let j=i+1;j<links.length;j++){
   const a=links[i],b=links[j];
   if(Math.abs(a.x-b.x)<linkW+gap&&Math.abs(a.y-b.y)<linkH+gap)errors.push('Crowded link cards: '+path+' '+a.id+' / '+b.id);
  }
  if(path==='docs/boards/project-hub'){
   for(let i=0;i<8;i++){const a=elements.find(e=>e.id==='stage_'+i),b=elements.find(e=>e.id==='stage_status_'+i);if(!a||!b||b.y<a.y+linkH+12||a.x!==b.x)errors.push('Crowded or misaligned stage caption: '+i);}
   for(const id of ['ideas','releases']){const a=elements.find(e=>e.id===id),b=elements.find(e=>e.id===(id==='ideas'?'ideas_context':'release_context'));if(!a||!b||b.y<a.y+linkH+12)errors.push('Crowded project caption: '+id);}
  }
  if(path==='docs/boards/overview'&&links.some(e=>e.y+linkH+24>0))errors.push('Ideas Board navigation intrudes into header');
 }
 const state=json(join(release,'current-state.json'));
 for(const p of ['PRODUCT.md',join(release,'README.md'),join(release,'product/README.md'),join(release,'screen-inventory/README.md'),join(release,'user-flows/README.md')])if(!read(p).includes(state.approved))errors.push('Approved product decisions drift: '+p);
 for(const p of ['PRODUCT.md','DESIGN.md',join(release,'README.md'),join(release,'product/README.md'),join(release,'screen-inventory/README.md'),join(release,'user-flows/README.md')])if(!read(p).includes(state.open))errors.push('Open product decisions drift: '+p);
 const meta=json(join(release,'mid-fidelity-wireframe/db/board/meta.json'));
 const count=meta.order.filter(id=>id.endsWith('_note')).length;
 if(state.inventory.map(x=>x.id).join('|')!==components.states.join('|'))errors.push('Canonical inventory order drift');
 if(state.stages.length!==11||state.stages.filter(x=>x.board).length!==8)errors.push('Release stage inventory drift');
 if(count!==state.variantCount||count!==components.states.length)errors.push('Mid-Fidelity variant count drift');
 for(const [dir,expected] of Object.entries(state.notes)){
  if(json(join(release,dir,'db/elements/note.json')).text!==expected)errors.push('Planning board drift: '+dir);
 }
 if(json('docs/boards/release-stages/db/elements/release_v010_status.json').text!==state.stageNote)errors.push('Release stage board drift');
 for(const p of ['PRODUCT.md','DESIGN.md','docs/README.md',join(release,'README.md'),...['product','information-architecture','screen-inventory','user-flows','high-fidelity-wireframe'].map(dir=>join(release,dir,'README.md'))])if(!read(p).includes(state.status))errors.push('Current release status drift: '+p);
 for(const [dir,key] of [['sketch','sketch'],['low-fidelity-wireframe','lowFidelity'],['mid-fidelity-wireframe','midFidelity']]){
  const m=json(join(release,dir,'db/board/meta.json'));
  if(m.order.filter(id=>id.endsWith('_note')).length!==state.previousStages[key].count)errors.push('Historical state count drift: '+dir);
 }
 return errors;
}
