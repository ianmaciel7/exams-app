import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { join, relative, isAbsolute } from 'node:path';
import { ROOT } from './open-artifact-runtime.mjs';

export const BOARDS = Object.freeze({
  overview: ['art_examappoverview', 'docs/boards/overview'],
  releases: ['art_examappreleasestages', 'docs/boards/release-stages'],
  hub: ['art_examappprojecthub', 'docs/boards/project-hub'],
  product: ['art_examappproductv010', 'docs/releases/v0.1.0/product'],
  architecture: ['art_examappinformationarchitecturev010', 'docs/releases/v0.1.0/information-architecture'],
  screens: ['art_examappscreeninventoryv010', 'docs/releases/v0.1.0/screen-inventory'],
  flows: ['art_examappuserflowsv010', 'docs/releases/v0.1.0/user-flows'],
  sketch: ['art_examappsketchv010', 'docs/releases/v0.1.0/sketch'],
  lowfidelity: ['art_examapplowfidelityv010', 'docs/releases/v0.1.0/low-fidelity-wireframe'],
  midfidelity: ['art_examappmidfidelityv010', 'docs/releases/v0.1.0/mid-fidelity-wireframe'],
  highfidelity: ['art_examapphighfidelityv010', 'docs/releases/v0.1.0/high-fidelity-wireframe'],
});
export function catalog(root=ROOT) {
 const base=realpathSync(root);
 return Object.entries(BOARDS).map(([key,[previewId,path]])=>{
  const folder=realpathSync(join(base,path)),rel=relative(base,folder);
  if(isAbsolute(rel)||rel==='..'||rel.startsWith('..'+(process.platform==='win32'?'\\':'/'))) throw Error('Board outside workspace: '+path);
  const meta=JSON.parse(readFileSync(join(folder,'db','board','meta.json'),'utf8'));
  if(!Array.isArray(meta.order)||typeof meta.title!=='string')throw Error('Invalid board metadata: '+path);
  return {key,previewId,path,folder,title:meta.title,elements:meta.order.length,hasMarker:existsSync(join(folder,'.artifact.json'))};
 });
}
