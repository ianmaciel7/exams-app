import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const html=readFileSync(new URL('../prototype/exam-app-0.1.1__index.html',import.meta.url),'utf8');
const start=html.indexOf('function opFooterRelations(iid){');
const end=html.indexOf('\nfunction opPage(o){',start);
assert.ok(start>=0&&end>start,'the graph-backed object footer module is present');

function fixture(space='s1'){
  const values=new Map();
  const a={href:'#/concurso/a',title:'Concurso A',kind:'concurso',out:[],inn:[['#/edicao/b','Concurso']]};
  const b={href:'#/edicao/b',title:'Edição B',kind:'edicao',out:[['#/concurso/a','Concurso']],inn:[['#/cargo/c','Edição']]};
  const c={href:'#/cargo/c',title:'Cargo C',kind:'cargo',out:[['#/edicao/b','Edição']],inn:[]};
  const n=new Map([a,b,c].map(x=>[x.href,x]));
  const env={
    view:{addEventListener(){}}, space,store:{get:key=>values.get(key),set:(key,val)=>values.set(key,val)},
    nodeOf:href=>n.get(href),gr:()=>({N:n}),
    nbrs:node=>{
      const all=new Set([...node.out,...node.inn].map(x=>x[0]));
      return [...all].map(href=>n.get(href)).filter(Boolean);
    },
    esc:s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;'),
    kn:k=>({concurso:'Concurso',edicao:'Edição',cargo:'Cargo'})[k]||k
  };
  const api=runInNewContext(html.slice(start,end)+'\n({opFooterRelations,opConnectionFooter})',env);
  return {api,values,n};
}

test('incoming edges show real backlinks and second-hop relations, without duplicating direct neighbors',()=>{
  const {api}=fixture();
  const r=api.opFooterRelations('concurso:a');
  assert.equal(r.back.length,1);
  assert.equal(r.back[0].href,'#/edicao/b');
  assert.equal(r.back[0].detail,'Concurso');
  assert.equal(r.related.length,1);
  assert.equal(r.related[0].href,'#/cargo/c');
  assert.ok(r.related[0].detail.includes('Edição B'));
  assert.ok(!r.related.some(x=>x.href==='#/edicao/b'));
});

test('accessible tabs, labels and actual link destinations are in markup',()=>{
  const {api}=fixture();
  const out=api.opConnectionFooter('concurso:a');
  assert.equal((out.match(/role="tab"/g)||[]).length,2);
  assert.equal((out.match(/role="tabpanel"/g)||[]).length,2);
  assert.match(out,/aria-selected="true"/);
  assert.match(out,/href="#\/edicao\/b"/);
  assert.match(out,/role="tablist" aria-label="Relações do objeto"/);
  assert.match(out,/data-op-footer="concurso:a\|related"/);
});

test('selected tab persists per space/object; absent graph renders honest empty state',()=>{
  const {api,values}=fixture();
  values.set('object-footer:s1:concurso:a','related');
  const selected=api.opConnectionFooter('concurso:a');
  assert.match(selected,/id="op-link-panel-concurso-a-related" aria-labelledby="op-link-tab-concurso-a-related" >[^]*Cargo C/);
  assert.match(selected,/id="op-link-panel-concurso-a-back"[^]*hidden/);
  assert.doesNotMatch(fixture('s2').api.opConnectionFooter('concurso:a'),/aria-selected="true"[^>]*data-op-footer="concurso:a\|related"/);
  const missing=api.opConnectionFooter('concurso:missing');
  assert.match(missing,/Ainda não há links de entrada/);
  assert.match(missing,/Ainda não há conteúdo relacionado/);
});

test('graph source titles are escaped and keyboard supports roving arrow controls',()=>{
  const {api,n}=fixture();
  n.get('#/edicao/b').title='Edição <script> B';
  const out=api.opConnectionFooter('concurso:a');
  assert.match(out,/Edição &lt;script> B/);
  assert.doesNotMatch(out,/<script>/);
  assert.ok(html.includes("['ArrowLeft','ArrowRight','Home','End']"));
});
