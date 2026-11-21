import test from 'node:test';
import assert from 'node:assert/strict';
import { ClaudeStorageClient } from './claude-storage-client.mjs';

test('offline delete never removes the last local copy',async()=>{
  const originalFetch=globalThis.fetch;
  const originalStorage=globalThis.localStorage;
  const values=new Map([['bridge-poc:study-progress',JSON.stringify({answered:13})]]);
  globalThis.localStorage={
    getItem(key){return values.get(key)??null;},
    setItem(key,v){values.set(key,v);},
    removeItem(key){values.delete(key);}
  };
  globalThis.fetch=async()=>{throw new Error('offline network')};
  try{
    const client=new ClaudeStorageClient({timeoutMs:100,onLog:()=>{}});
    await assert.rejects(()=>client.delete('study-progress'),/offline network/);
    assert.deepEqual(JSON.parse(values.get('bridge-poc:study-progress')),{answered:13});
    const outcome=await client.set('study-progress',{answered:14});
    assert.equal(outcome,'local-fallback','fallback is not remotely synced');
    assert.deepEqual(JSON.parse(values.get('bridge-poc:study-progress')),{answered:14});
  }finally{
    globalThis.fetch=originalFetch;
    globalThis.localStorage=originalStorage;
  }
});
