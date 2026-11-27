// Exercise the owner-operated Library API on copies of every existing board.
// No actual board or user daemon is touched.
import assert from 'node:assert/strict';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { ROOT, CACHE, resolveRuntime, projectEnv } from './open-artifact-runtime.mjs';
import { catalog } from './board-catalog.mjs';
const runtime=resolveRuntime();
mkdirSync(CACHE,{recursive:true});
const scratch=mkdtempSync(join(CACHE,'library-test-'));
const workspace=join(scratch,'workspace'),home=join(scratch,'home');
const env={...projectEnv(),OPEN_ARTIFACT_HOME:home,OPEN_ARTIFACT_TYPE_SERVER_HOME:join(scratch,'servers'),OPEN_ARTIFACT_BROWSER:'none'};
delete env.OPEN_ARTIFACT_WORKSPACE_FOLDERS_ONLY;
for(const key of ['CLAUDECODE','CLAUDE_CODE_SESSION_ID','CODEX_THREAD_ID','ANTIGRAVITY_AGENT','ANTIGRAVITY_CONVERSATION_ID','OPEN_ARTIFACT_SESSION'])delete env[key];
function run(args,expected=0){
 const r=spawnSync(process.execPath,args,{cwd:workspace,env,encoding:'utf8',timeout:90000});
 assert.equal(r.status,expected,r.error?.message??r.stderr??r.stdout);
 return r.stdout.trim();
}
function hashes(dir){
 const out={};
 function walk(path){
  for(const e of readdirSync(path,{withFileTypes:true})){
   const f=join(path,e.name);
   if(e.isDirectory())walk(f);
   else if(e.isFile()&&e.name!=='.artifact.json')out[relative(dir,f)]=createHash('sha256').update(readFileSync(f)).digest('hex');
  }
 }
 walk(dir);return out;
}
const script=join(workspace,'scripts','open-artifact-library.mjs');
try{
 mkdirSync(join(workspace,'scripts'),{recursive:true});
 for(const file of ['open-artifact-library.mjs','open-artifact-runtime.mjs','open-artifact-pin.json','board-catalog.mjs'])cpSync(join(ROOT,'scripts',file),join(workspace,'scripts',file));
 for(const b of catalog()){
  const dest=join(workspace,b.path);
  mkdirSync(dest,{recursive:true});
  cpSync(b.folder,dest,{recursive:true,filter:src=>!src.endsWith('.artifact.json')});
 }
 const before=hashes(join(workspace,'docs'));
 run([runtime.main,'daemon','ensure']);
 const initial=JSON.parse(run([script,'status']));
 assert.equal(initial.registered,0);
 run([script,'register'],1);
 assert.equal(JSON.parse(run([script,'status'])).registered,0);
 const first=JSON.parse(run([script,'register','--apply']));
 assert.equal(first.registered,11);assert.equal(new Set(first.boards.map(b=>b.nativeId)).size,11);
 const second=JSON.parse(run([script,'register','--apply']));
 assert.deepEqual(second.boards,first.boards);
 assert.deepEqual(hashes(join(workspace,'docs')),before,'registration changed board content');
 const state=JSON.parse(readFileSync(join(home,'daemon.json'),'utf8'));
 const records=await fetch(new URL('/api/open-artifact.artifacts',state.url),{headers:{Authorization:'Bearer '+state.token},redirect:'error'}).then(r=>r.json());
 assert.equal(records.artifacts.length,11);
 assert.ok(records.artifacts.every(a=>a.owner===null&&a.type==='whiteboard'));
 // Test the actual native shell routes, not preview identifiers.
 for(const b of first.boards){
  assert.ok(existsSync(join(workspace,b.path,'.artifact.json')));
  const marker=JSON.parse(readFileSync(join(workspace,b.path,'.artifact.json'),'utf8'));
  assert.equal(marker.id,b.nativeId);
  const read=await fetch(new URL('/api/open-artifact.artifact?id='+encodeURIComponent(b.nativeId),state.url),{headers:{Authorization:'Bearer '+state.token},redirect:'error'});
  assert.equal(read.status,200);
  const detail=await read.json();assert.equal(detail.id,b.nativeId);
 }
 console.log('Library: 11 existing boards, explicit approval guard, stable repeat registration, no duplicate records, unchanged content, owner remains null, 11 native routes verified.');
}finally{
 spawnSync(process.execPath,[runtime.main,'daemon','stop'],{cwd:workspace,env,stdio:'ignore',timeout:15000});
 rmSync(scratch,{recursive:true,force:true,maxRetries:15,retryDelay:300});
}
