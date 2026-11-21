import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const html=readFileSync(new URL('../prototype/exam-app-0.1.1__index.html',import.meta.url),'utf8');
const from=html.indexOf('function graphStoredMeta(sp,href,kind){');
const until=html.indexOf('const GR_CACHE=new Map();',from);
assert.ok(from>0&&until>from,'graph metadata read model source exists');
const values=new Map();
const env={
  space:'s1',store:{get:k=>values.get(k)},
  CONCURSOS:[{id:'dataprev',sp:'s1',t:'Dataprev'},{id:'dataprev',sp:'s2',t:'Other Dataprev'}],
  edicoesOf:()=>[],docsOf:()=>[],qObjs:()=>[],isT:()=>false,cargosOf:()=>[],
  findEnt:()=>null,concOrgaoName:()=>'',edBancaName:()=>'',edOrgaoName:()=>'',discEnt:()=>null,
  kn:s=>s,qTitle:()=>'',console:{warn:()=>{}}
};
const api=runInNewContext(html.slice(from,until)+'\n({graphStoredMeta,graphSearchText,G})',env);

test('graph projects persisted alias and tags for real native object, not invented nodes',()=>{
  values.set('object-meta:s1:concurso:dataprev',{alias:'VMSS',tags:['Cloud','Infraestrutura']});
  const g=api.G('s1');
  assert.equal(g.N.size,1);
  const n=g.N.get('#/concurso/dataprev');
  assert.equal(n.title,'Dataprev','canonical title remains unchanged');
  assert.equal(n.alias,'VMSS');
  assert.equal(n.tags.join('|'),'Cloud|Infraestrutura');
  assert.equal(n.extra.find(([k])=>k==='Alias')[1],'VMSS');
  assert.equal(n.extra.find(([k])=>k==='Etiquetas')[1],'Cloud, Infraestrutura');
  assert.ok(api.graphSearchText(n).includes('VMSS'));
  assert.ok(api.graphSearchText(n).includes('Cloud'));
  assert.equal(n.out.length,0);
});

test('same object identifier from another space never inherits metadata',()=>{
  values.set('object-meta:s1:concurso:dataprev',{alias:'only-space-1',tags:['Private']});
  const g=api.G('s2'),n=g.N.get('#/concurso/dataprev');
  assert.equal(n.title,'Other Dataprev');
  assert.equal(n.alias,'');
  assert.deepEqual([...n.tags],[]);
  assert.equal(api.graphSearchText(n).includes('Private'),false);
});

test('PDF identities map to pdf:id, not a fictitious object route',()=>{
  values.set('object-meta:s1:pdf:edital',{alias:'DOU',tags:['Lei seca']});
  const meta=api.graphStoredMeta('s1','#edital','pdf');
  assert.equal(meta.alias,'DOU');
  assert.equal(meta.tags[0],'Lei seca');
});

test('untrusted persisted metadata is bounded before projection',()=>{
  values.set('object-meta:s1:concurso:dataprev',{alias:'A'.repeat(120),tags:[' X ','Y'.repeat(95),12,null]});
  const n=api.G('s1').N.get('#/concurso/dataprev');
  assert.equal(n.alias.length,80);
  assert.equal(n.tags.length,2);
  assert.equal(n.tags[0],'X');
  assert.equal(n.tags[1].length,40);
});

test('editing invalidates cached graph and search uses canonical title, alias and tags',()=>{
  assert.ok(html.includes("store.set(key,{alias,tags});GR_CACHE.delete(space);route(true)"));
  assert.ok(html.includes("norm(graphSearchText(n)).includes(q)"));
  assert.ok(html.includes("norm(graphSearchText(o.n)).includes(q)"));
});
