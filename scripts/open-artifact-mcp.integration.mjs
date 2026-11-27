// A real MCP stdio smoke, not a mock or a host-specific permission certification.
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { createInterface } from 'node:readline';
import { mkdtempSync, mkdirSync, existsSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ROOT, CACHE, TYPES, resolveRuntime, projectEnv } from './open-artifact-runtime.mjs';

const runtime=resolveRuntime();
mkdirSync(CACHE,{recursive:true});
const scratch=mkdtempSync(join(CACHE,'mcp-test-'));
const outside=mkdtempSync(join(tmpdir(),'exam-oa-outside-'));
const home=join(scratch,'home');
const env={...projectEnv(),OPEN_ARTIFACT_HOME:home,OPEN_ARTIFACT_TYPE_SERVER_HOME:join(scratch,'servers'),OPEN_ARTIFACT_BROWSER:'none'};
const clients=[];
function client(harness){
 const child=spawn(process.execPath,[runtime.main,'mcp','--harness',harness],{cwd:ROOT,env:{...env,OPEN_ARTIFACT_HARNESS:harness,OPEN_ARTIFACT_SESSION:'exam-ci-'+harness},stdio:['pipe','pipe','pipe']});
 clients.push(child);
 let next=0;const pending=new Map();
 const lines=createInterface({input:child.stdout});
 let stderr='';child.stderr.on('data',d=>{stderr=(stderr+d).slice(-4000);});
 child.on('error',e=>{for(const p of pending.values())p.reject(e);pending.clear();});
 child.on('exit',()=>{for(const p of pending.values())p.reject(Error(harness+' exited: '+stderr));pending.clear();});
 lines.on('line',line=>{let m;try{m=JSON.parse(line);}catch{return;}const p=pending.get(m.id);if(!p)return;clearTimeout(p.timer);pending.delete(m.id);if(m.error)p.reject(Error(JSON.stringify(m.error)));else p.resolve(m.result);});
 const rpc=(method,params)=>new Promise((resolve,reject)=>{const id=++next;const timer=setTimeout(()=>{pending.delete(id);reject(Error(harness+' timeout: '+method+' '+stderr));},60000);pending.set(id,{resolve,reject,timer});child.stdin.write(JSON.stringify({jsonrpc:'2.0',id,method,params})+'\n');});
 const notify=(method,params)=>child.stdin.write(JSON.stringify({jsonrpc:'2.0',method,params})+'\n');
 const call=async(name,args)=>{const r=await rpc('tools/call',{name,arguments:args});return r.structuredContent??JSON.parse(r.content.find(c=>c.type==='text').text);};
 return {rpc,notify,call};
}
async function connect(harness){
 const c=client(harness);
 await c.rpc('initialize',{protocolVersion:'2025-03-26',capabilities:{},clientInfo:{name:'exam-ci',version:'1'}});
 c.notify('notifications/initialized',{});
 const tools=(await c.rpc('tools/list',{})).tools.map(t=>t.name);
 for(const name of ['Artifact','ArtifactData','ArtifactComments'])assert.ok(tools.includes(name),harness+' missing '+name);
 return c;
}
try{
 const codex=await connect('codex');
 const claude=await connect('claude-code');
 const agy=await connect('antigravity');
 const list=await codex.call('Artifact',{action:'list',scope:'types'});
 const types=list.types??list.artifacts??[];
 for(const type of TYPES)assert.ok(types.some(t=>t.id===type||t.type_url==='open-artifact://type/'+type),type+' missing');
 const page=await codex.call('Artifact',{action:'publish',type_url:'open-artifact://type/page',title:'CI isolated page',folder:join(scratch,'page'),open:'never'});
 assert.ok(page.url&&!page.error,JSON.stringify(page.error));
 assert.ok(!(await codex.call('Artifact',{action:'publish',url:page.url,files:{'index.html':'<!doctype html><h1>Exam MCP test</h1>'}})).error);
 const got=await claude.call('Artifact',{action:'read',url:page.url,path:'index.html'});
 assert.ok(!got.error&&JSON.stringify(got).includes('Exam MCP test'));
 const board=await codex.call('Artifact',{action:'publish',type_url:'open-artifact://type/whiteboard',title:'CI isolated board',folder:join(scratch,'board'),open:'never'});
 assert.ok(board.url&&!board.error,JSON.stringify(board.error));
 const note={type:'note',x:0,y:0,text:'Original',color:'yellow'};
 const set=await codex.call('ArtifactData',{action:'set',url:board.url,path:'elements/n1',data:note});
 assert.ok(!set.error,JSON.stringify(set.error));
 const first=await claude.call('ArtifactData',{action:'get',url:board.url,path:'elements/n1'});
 assert.equal(first.data.text,'Original');assert.equal(typeof first.sha256,'string');
 const stale=await agy.call('ArtifactData',{action:'set',url:board.url,path:'elements/n1',data:{...note,text:'Wrong'},if_match:'b'.repeat(64)});
 assert.equal(stale.error?.code,'conflict');
 assert.equal(stale.executionStatus,'not_executed');
 const saved=await codex.call('ArtifactData',{action:'get',url:board.url,path:'elements/n1'});
 assert.equal(saved.data.text,'Original');
 const blocked=await agy.call('Artifact',{action:'publish',type_url:'open-artifact://type/page',title:'Escape',folder:join(outside,'blocked'),open:'never'});
 assert.equal(blocked.error?.code,'not_granted');
 assert.equal(existsSync(join(outside,'blocked')),false);
 const comments=await agy.call('ArtifactComments',{action:'read',url:board.url});
 assert.ok(!comments.error,JSON.stringify(comments.error));
 console.log('MCP: 3 harnesses, 9 types, shared page/board reads, write, stale-write rejection, outside-workspace denial, comment read passed.');

 // Exercise the real native comment API and host hook dialects in isolated sessions.
 const state=JSON.parse(readFileSync(join(home,'daemon.json'),'utf8'));
 const headers={Authorization:'Bearer '+state.token,'Content-Type':'application/json'};
 const post=async(name,body)=>{
  const r=await fetch(new URL('/api/open-artifact.'+name,state.url),{method:'POST',headers,body:JSON.stringify(body),redirect:'error'});
  assert.ok(r.ok,name+' HTTP '+r.status);
  return r.json();
 };
 const hook=(harness,event)=>{
  const r=spawnSync(process.execPath,[runtime.main,'hook',event,'--harness',harness],{
   cwd:ROOT,env:{...env,OPEN_ARTIFACT_HARNESS:harness,OPEN_ARTIFACT_SESSION:'exam-ci-'+harness},
   input:JSON.stringify({session_id:'exam-ci-'+harness,cwd:ROOT}),encoding:'utf8',timeout:30000});
  assert.equal(r.status,0,r.stderr);return r.stdout.trim();
 };
 for(const [harness,c] of [['codex',codex],['claude-code',claude],['antigravity',agy]]){
  const own=await c.call('Artifact',{action:'publish',type_url:'open-artifact://type/whiteboard',title:'Hook '+harness,folder:join(scratch,'hook-'+harness),open:'never'});
  assert.ok(own.url&&!own.error,JSON.stringify(own.error));
  const id=own.url.split('/').at(-1);
  const msg='isolated hook request '+harness;
  const sent=await post('artifacts.ask',{id,text:msg});
  assert.equal(sent.via,'inbox',JSON.stringify(sent));
  const other=harness==='codex'?'claude-code':'codex';
  assert.ok(!hook(other,'UserPromptSubmit').includes(msg),'request leaked to another session');
  const event=harness==='antigravity'?'PreInvocation':'UserPromptSubmit';
  const answer=hook(harness,event);
  assert.ok(answer.includes(msg),harness+' hook did not deliver request: '+answer);
  assert.ok(!hook(harness,event).includes(msg),'request delivered twice');
  const stopped='isolated stop request '+harness;
  await post('artifacts.ask',{id,text:stopped});
  const stop=JSON.parse(hook(harness,'Stop'));
  assert.equal(stop.decision,harness==='antigravity'?'continue':'block');
  assert.ok(JSON.stringify(stop).includes(stopped));
 }
 // The board's own page creates a real anchored comment; an agent answers through MCP.
 const boardId=board.url.split('/').at(-1);
 const boot=await fetch(new URL('/api/open-artifact.artifacts.boot?id='+encodeURIComponent(boardId),state.url),{headers,redirect:'error'}).then(r=>r.json());
 assert.ok(boot.pageUrl&&!boot.problem,JSON.stringify(boot.problem));
 const pagePost=async(route,body)=>{
  const url=new URL(route,boot.pageUrl);
  const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json',Origin:url.origin},body:JSON.stringify(body),redirect:'error'});
  if(!r.ok)throw Error(route+' HTTP '+r.status+' '+await r.text());return r.json();
 };
 const anchor='#wb-n1 > wx50005000:nth-of-type(1)';
 const marker='Review original note in isolated test';
 // Use native routes, rather than writing fabricated comment files.
 const created=await pagePost('_api/comments/create',{input:{anchor,label:'Original note',text:marker,to:['agent'],location:{x:0,y:0,ids:['n1']}}});
 assert.equal(created.thread.anchor,anchor);
 const threadId=created.thread.id;
 await pagePost('_api/comments/send',{threadId});
 const delivered=hook('codex','UserPromptSubmit');
 assert.ok(delivered.includes(marker),'anchored comment not delivered to owner');
 assert.ok(!hook('codex','UserPromptSubmit').includes(marker),'comment delivered twice');
 const read=await codex.call('ArtifactComments',{action:'read',url:board.url,thread_id:threadId});
 assert.ok(!read.error&&JSON.stringify(read).includes(marker));
 const reply=await codex.call('ArtifactComments',{action:'reply',url:board.url,thread_id:threadId,text:'Verified note.',resolve:true});
 assert.ok(!reply.error,JSON.stringify(reply.error));
 const resolved=await codex.call('ArtifactComments',{action:'read',url:board.url,thread_id:threadId,all:true});
 assert.ok(JSON.stringify(resolved).includes('Verified note.'));
 assert.equal(resolved.threads[0].status,'resolved');
 console.log('Collaboration: 3 hook dialects, owner-only delivery, no duplicate delivery, Stop response, native anchored comment, MCP reply and resolution passed.');

}finally{
 for(const child of clients)child.stdin.end();
 for(const child of clients)if(child.exitCode===null)child.kill();
 spawnSync(process.execPath,[runtime.main,'daemon','stop'],{cwd:ROOT,env,stdio:'ignore',timeout:15000});
 rmSync(scratch,{recursive:true,force:true,maxRetries:10,retryDelay:300});
 rmSync(outside,{recursive:true,force:true,maxRetries:5});
}
