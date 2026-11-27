// Explicit owner-operated registration using the pinned upstream local Library API.
// No global config changes, no cloud publication, no copying, no transfer of ownership.
import { readFileSync, existsSync, realpathSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { homedir } from 'node:os';
import { ROOT, VERSION, assertNode } from './open-artifact-runtime.mjs';
import { catalog } from './board-catalog.mjs';

const canonical = path => {try{return realpathSync(path);}catch{return resolve(path);}};
async function main(){
 assertNode();
 const action=process.argv[2]??'catalog';
 const boards=catalog();
 if(action==='catalog'){console.log(JSON.stringify(boards.map(({folder,...entry})=>entry),null,2));return;}
 if(!['status','register'].includes(action))throw Error('Usage: catalog | status | register --apply (owner only)');
 if(action==='register'){
  if(!process.argv.includes('--apply'))throw Error('Registration requires the owner to run register --apply explicitly.');
  if(['CLAUDECODE','CLAUDE_CODE_SESSION_ID','CODEX_THREAD_ID','ANTIGRAVITY_AGENT','ANTIGRAVITY_CONVERSATION_ID','OPEN_ARTIFACT_SESSION'].some(key=>process.env[key]))throw Error('Run registration in your own terminal, not an agent session.');
 }
 const home=process.env.OPEN_ARTIFACT_HOME??join(homedir(),'.agents','open-artifact');
 const statePath=join(home,'daemon.json');
 if(!existsSync(statePath))throw Error('Native daemon is not running. Start the official plugin and open its library first.');
 const state=JSON.parse(readFileSync(statePath,'utf8'));
 const origin=new URL(state.url);
 if(origin.protocol!=='http:'||!['127.0.0.1','[::1]','localhost'].includes(origin.hostname)||origin.username||origin.password||!state.token)throw Error('Expected an authenticated local daemon.');
 const req=async(name,body)=>{
  const res=await fetch(new URL('/api/open-artifact.'+name,origin),{method:body===undefined?'GET':'POST',headers:{Authorization:'Bearer '+state.token,...(body===undefined?{}:{'Content-Type':'application/json'})},...(body===undefined?{}:{body:JSON.stringify(body)}),redirect:'error',signal:AbortSignal.timeout(15000)});
  if(!res.ok)throw Error('Library '+name+' failed: HTTP '+res.status);
  return res.json();
 };
 const health=await fetch(new URL('/__open-artifact/health',origin),{redirect:'error',signal:AbortSignal.timeout(3000)}).then(r=>r.json());
 if(health.openArtifact!==1||health.version!==VERSION)throw Error('Native daemon must run pinned version '+VERSION+'; found '+health.version);
 let list=(await req('artifacts')).artifacts;
 if(!Array.isArray(list))throw Error('Unexpected library response');
 // Check every path before mutating anything. No automatic relocation of another checkout.
 for(const b of boards){
  const matches=list.filter(a=>canonical(a.root)===b.folder);
  if(matches.length>1||matches.some(a=>a.type!=='whiteboard'))throw Error('Conflicting library records for '+b.path);
  if(b.hasMarker){
   const marker=JSON.parse(readFileSync(join(b.folder,'.artifact.json'),'utf8'));
   if(marker.type!=='whiteboard'||list.some(a=>a.id===marker.id&&canonical(a.root)!==b.folder)||matches.some(a=>a.id!==marker.id))throw Error('Conflicting marker for '+b.path+'; resolve in native library.');
  }
 }
 if(action==='register'){
  const remote=await req('remotes');
  if(remote.cloud?.publish!=='manual')throw Error('Cannot prove automatic cloud publishing is disabled. Turn it off in the native UI and retry.');
  for(const b of boards){
   if(list.some(a=>canonical(a.root)===b.folder))continue;
   const result=await req('artifacts.add',{folder:b.folder});
   if(result.type!=='whiteboard'||canonical(result.root)!==b.folder||typeof result.id!=='string')throw Error('Unexpected registered board: '+b.path);
   list.push(result);
  }
  list=(await req('artifacts')).artifacts;
 }
 const result=boards.map(b=>{
  const entry=list.find(a=>canonical(a.root)===b.folder);
  return {key:b.key,path:b.path,title:b.title,previewId:b.previewId,nativeId:entry?.id??null,url:entry?.url??null,registered:!!entry};
 });
 console.log(JSON.stringify({registered:result.filter(b=>b.registered).length,total:boards.length,boards:result,notice:'Native IDs are allocated by the daemon. Preview IDs are distinct. Existing /a/ preview links are not assumed to work in the native library.'},null,2));
 if(action==='register'&&result.some(x=>!x.registered))throw Error('Registration incomplete');
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
