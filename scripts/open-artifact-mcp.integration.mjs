// A real MCP stdio smoke, not a mock or a host-specific permission certification.
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { createInterface } from 'node:readline';
import { mkdtempSync, mkdirSync, existsSync, rmSync } from 'node:fs';
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
}finally{
 for(const child of clients)child.stdin.end();
 for(const child of clients)if(child.exitCode===null)child.kill();
 spawnSync(process.execPath,[runtime.main,'daemon','stop'],{cwd:ROOT,env,stdio:'ignore',timeout:15000});
 rmSync(scratch,{recursive:true,force:true,maxRetries:10,retryDelay:300});
 rmSync(outside,{recursive:true,force:true,maxRetries:5});
}
