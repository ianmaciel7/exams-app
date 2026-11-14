import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { request } from 'node:http';
import path from 'node:path';

const BASE='http://127.0.0.1:8766';
const SLUG='34cd390a-738f-4dfc-8ae2-6c4f90794d74';
const ROOT='/api/storage/'+SLUG+'/bridge-poc';
const TRUSTED='http://localhost:8765';

async function fetchProxy(route, options={}){
  const headers={Origin:TRUSTED,...options.headers};
  return fetch(BASE+route,{...options,headers});
}
function forgedHost(route){
  return new Promise((resolve,reject)=>{
    const req=request(BASE+route,{method:'GET',headers:{Origin:TRUSTED,Host:'untrusted.example'}},res=>{
      let text='';
      res.on('data',chunk=>text+=chunk);
      res.on('end',()=>resolve({status:res.statusCode,body:text,headers:res.headers}));
    });
    req.once('error',reject);
    req.end();
  });
}

test('local Frame DB proxy denies unauthorized callers before touching OAuth',async t=>{
  const stub=path.resolve('tests/claude-storage-api-poc/fixtures');
  const proc=spawn(process.env.PYTHON||'python3',['-u','tests/claude-storage-api-poc/proxy.py'],{
    env:{...process.env,PYTHONPATH:stub},stdio:['ignore','pipe','pipe']
  });
  let out='';
  proc.stdout.on('data',x=>out+=String(x));
  proc.stderr.on('data',x=>out+=String(x));
  const delay=ms=>new Promise(r=>setTimeout(r,ms));
  try{
    let ready=false;
    for(let i=0;i<60;i++){
      if(proc.exitCode!==null)break;
      try{
        const response=await fetchProxy(ROOT+'/alive');
        if(response.status===200){ready=true;break;}
      }catch{}
      await delay(150);
    }
    assert.ok(ready,'stubbed proxy did not launch; output: '+out.slice(0,200));

    await t.test('correct preflight and CORS, no allow-origin for forbidden sites',async()=>{
      const okay=await fetchProxy(ROOT+'/case1',{method:'OPTIONS'});
      assert.equal(okay.status,204);
      assert.equal(okay.headers.get('access-control-allow-origin'),TRUSTED);
      const evil=await fetchProxy(ROOT+'/case1',{method:'OPTIONS',headers:{Origin:'https://evil.example'}});
      assert.equal(evil.status,403);
      assert.equal(evil.headers.get('access-control-allow-origin'),null);
    });

    await t.test('bad/missing Origin and Host blocked even for read and delete',async()=>{
      const bad=await fetchProxy(ROOT+'/case1',{headers:{Origin:'https://evil.example'}});
      assert.equal(bad.status,403);
      const noOrigin=await fetch(BASE+ROOT+'/case1');
      assert.equal(noOrigin.status,403);
      const badDelete=await fetchProxy(ROOT+'/case1',{method:'DELETE',headers:{Origin:'https://evil.example'}});
      assert.equal(badDelete.status,403);
      const badHost=await forgedHost(ROOT+'/case1');
      assert.equal(badHost.status,403);
    });

    await t.test('slug cannot be changed and collection must match exactly',async()=>{
      const wrongSlug=await fetchProxy('/api/storage/other-artifact/bridge-poc/doc');
      assert.equal(wrongSlug.status,403);
      const wrongColl=await fetchProxy('/api/storage/'+SLUG+'/bridge-poc-secret/doc');
      assert.equal(wrongColl.status,403);
    });

    await t.test('encoded slash, path traversal and query are rejected',async()=>{
      for(const route of [ROOT+'/foo%2Fbar',ROOT+'/..%2Fsomething',ROOT+'/item?verb=delete']){
        const response=await fetchProxy(route);
        assert.equal(response.status,400,'Route should be rejected: '+route);
      }
    });

    await t.test('writes require JSON object and Content-Type',async()=>{
      const unsupported=await fetchProxy(ROOT+'/document',{method:'POST',
        headers:{'Content-Type':'text/plain'},body:'{"data":1}'});
      assert.equal(unsupported.status,415);
      const invalid=await fetchProxy(ROOT+'/document',{method:'POST',
        headers:{'Content-Type':'application/json'},body:'[1,2]'});
      assert.equal(invalid.status,400);
      const invalidJson=await fetchProxy(ROOT+'/document',{method:'POST',
        headers:{'Content-Type':'application/json'},body:'{broken'});
      assert.equal(invalidJson.status,400);
    });

    await t.test('CRUD works against in-memory stub and never requires actual Claude login',async()=>{
      const payload={title:'Safe offline fixture'};
      const set=await fetchProxy(ROOT+'/document',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      assert.equal(set.status,200);
      const state=await fetchProxy(ROOT+'/document');
      assert.equal(state.status,200);
      const j=await state.json();
      assert.equal(j.exists,true);
      assert.deepEqual(j.data,payload);
      const list=await fetchProxy(ROOT);
      assert.equal(list.status,200);
      assert.ok((await list.json()).docs.some(x=>x.id==='document'));
      const del=await fetchProxy(ROOT+'/document',{method:'DELETE'});
      assert.equal(del.status,200);
      assert.equal((await (await fetchProxy(ROOT+'/document')).json()).exists,false);
    });

    await t.test('errors do not reveal any upstream credentials',async()=>{
      const r=await fetchProxy(ROOT+'/raise-upstream');
      assert.equal(r.status,502);
      const body=await r.text();
      assert.equal(body.includes('Bearer'),false);
      assert.equal(body.includes('confidential-upstream-secret'),false);
      assert.match(body,/UPSTREAM_UNAVAILABLE/);
      assert.equal(out.includes('confidential-upstream-secret'),false);
    });
  }finally{
    proc.kill('SIGTERM');
    await delay(150);
    assert.equal(out.includes('TEST_ONLY_FAKE_TOKEN_DO_NOT_USE'),false,'proxy logged auth token');
  }
});
