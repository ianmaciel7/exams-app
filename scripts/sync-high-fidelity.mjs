import {readFileSync,writeFileSync,readdirSync,unlinkSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import board from './high-fidelity-components.cjs';
const root='docs/releases/v0.1.0/high-fidelity-wireframe/db';
const json=o=>JSON.stringify(o,null,2)+'\n';
export function syncHighFidelity({write=false}={}){const errors=[];const expected={v:1,title:'High-Fidelity Wireframe — v0.1.0',order:Object.keys(board.elements)};for(const [path,data] of [[root+'/board/meta.json',expected],...Object.entries(board.elements).map(([id,e])=>[root+'/elements/'+id+'.json',e])]){let actual;try{actual=readFileSync(path,'utf8')}catch{}if(actual!==json(data)){if(write)writeFileSync(path,json(data));else errors.push('High-Fidelity generated drift: '+path);}}for(const file of readdirSync(root+'/elements').filter(f=>f.endsWith('.json')))if(!Object.hasOwn(board.elements,file.slice(0,-5))){if(write)unlinkSync(root+'/elements/'+file);else errors.push('High-Fidelity orphan: '+file);}return errors;}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){const errors=syncHighFidelity({write:process.argv.includes('--write')});if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log('High-Fidelity source synchronized');}
