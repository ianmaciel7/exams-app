import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const html=readFileSync(new URL('../prototype/exam-app-0.1.1__index.html',import.meta.url),'utf8');
const begin=html.indexOf('const a=T.closest(\'a[href^="#"]\'); if(a){');
const end=html.indexOf("  const ai=T.closest('[data-ai]');",begin);
assert.ok(begin>=0&&end>begin,'real panel link handler is present');
const source=html.slice(begin,end);
function run(modifiers={},isMain=false){
  const actions=[];
  const anchor={
    getAttribute:()=> '#/orgao/dataprev',
    hasAttribute: name=>isMain&&name==='data-main-link',
    closest:()=>({dataset:{v:'v1'}})
  };
  const T={closest:sel=>sel==='a[href^="#"]'?anchor:null};
  const context={
    wsOpenMain:h=>actions.push(['main',h]),
    wsOpenTab:h=>actions.push(['tab',h]),
    rpOpenObj:h=>actions.push(['panel',h]),
    rpFromView:(v,h)=>actions.push(['from-view',h]),
    viewById:()=>({id:'v1',type:'explorar'}),
    MQT:{matches:false},openRP:()=>{}
  };
  const handler=runInNewContext('(function(e,T){'+source+'})',context);
  let prevented=false;
  handler({preventDefault(){prevented=true;},...modifiers},T);
  return {actions,prevented};
}
test('Shift+Click opens object in the right contextual panel instead of navigating the center',()=>{
 const r=run({shiftKey:true});
 assert.deepEqual(r.actions,[['panel','#/orgao/dataprev']]);
 assert.equal(r.prevented,true);
});
test('normal contextual click retains in-view navigation',()=>{
 const r=run();
 assert.deepEqual(r.actions,[['from-view','#/orgao/dataprev']]);
});
test('Ctrl/Meta take precedence over Shift to open a main workspace tab',()=>{
 assert.deepEqual(run({ctrlKey:true,shiftKey:true}).actions,[['tab','#/orgao/dataprev']]);
 assert.deepEqual(run({metaKey:true,shiftKey:true}).actions,[['tab','#/orgao/dataprev']]);
});
test('explicit global-graph CTA still opens the main area',()=>{
 assert.deepEqual(run({shiftKey:true},true).actions,[['main','#/orgao/dataprev']]);
});
