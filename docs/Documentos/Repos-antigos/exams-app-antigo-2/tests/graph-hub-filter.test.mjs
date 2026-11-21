import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const html=readFileSync(new URL('../prototype/exam-app-0.1.1__index.html',import.meta.url),'utf8');
const begin=html.indexOf('const graphNodeVisible=');
const end=html.indexOf('function stopGV()',begin);
assert.ok(begin>=0&&end>begin,'hub predicate source anchors exist');
const predicate=runInNewContext(html.slice(begin,end)+'\ngraphNodeVisible');

test('hub suppression respects type toggles and a strict 40-link threshold (#68)',()=>{
  assert.equal(predicate(40,true,true),true,'40 links remain visible');
  assert.equal(predicate(41,true,true),false,'41 links are considered a hub');
  assert.equal(predicate(100,true,false),true,'disabled hub filter preserves objects');
  assert.equal(predicate(1,false,false),false,'disabled object kinds stay hidden');
  assert.equal(predicate(1,false,true),false,'hub toggling never overrides type filters');
});

test('hub toggle updates nodes, edges, live counts and search without losing state (#68)',()=>{
  const start=html.indexOf('  const updateGraphVisibility=()=>{');
  const stop=html.indexOf("  cv.style.cursor='grab';",start);
  assert.ok(start>=0&&stop>start,'global hub controls source anchors exist');
  const code=html.slice(start,stop);
  const nodes=[
    {n:{kind:'concurso'},deg:44,on:true},
    {n:{kind:'questao'},deg:3,on:true},
    {n:{kind:'questao'},deg:40,on:true}
  ];
  const edges=[[0,1],[1,2]];
  const st={alpha:0,hover:2};
  const hubButton={value:'false',setAttribute(k,v){if(k==='aria-pressed')this.value=v;}};
  const info={textContent:''};
  const kindButton={dataset:{gk:'questao'},pressed:'true',
    getAttribute(){return this.pressed;},
    setAttribute(k,v){if(k==='aria-pressed')this.pressed=v;}
  };
  let click,updates=0;
  const wrap={querySelector:sel=>sel==='.gv-leg'?{addEventListener:(type,fn)=>{click=fn;}}:info};
  const scope={nodes,edges,st,GVK:{concurso:true,questao:true},GV_HIDE_HUBS:false,
    graphNodeVisible:predicate,$:()=>hubButton,wrap,updateGraphSearch:()=>updates++};
  runInNewContext(code,scope);
  assert.equal(typeof click,'function','event listener installed');
  click({target:{closest:sel=>sel==='#gvHubToggle'?hubButton:null}});
  assert.equal(hubButton.value,'true');
  assert.deepEqual(nodes.map(n=>n.on),[false,true,true]);
  assert.match(info.textContent,/2 de 3 objetos visíveis · 1 relações/);
  assert.equal(st.hover,-1);
  assert.equal(updates,1);
  click({target:{closest:sel=>sel==='[data-gk]'?kindButton:null}});
  assert.equal(kindButton.pressed,'false','type filter updates separately');
  assert.deepEqual(nodes.map(n=>n.on),[false,false,false]);
  assert.match(info.textContent,/0 de 3 objetos visíveis · 0 relações/);
  click({target:{closest:sel=>sel==='#gvHubToggle'?hubButton:null}});
  assert.equal(hubButton.value,'false');
  assert.deepEqual(nodes.map(n=>n.on),[true,false,false]);
  assert.equal(updates,3);
});

test('global UI exposes an accessible hub suppression control (#68)',()=>{
  assert.match(html,/id="gvHubToggle" aria-pressed/);
  assert.match(html,/aria-label="Ocultar objetos com mais de 40 ligações"/);
  assert.match(html,/const updateGraphVisibility=\(\)=>/);
});
