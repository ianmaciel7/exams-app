import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const html=readFileSync(new URL('../prototype/exam-app-0.1.1__index.html',import.meta.url),'utf8');
function source(a,b){
  const i=html.indexOf(a),j=html.indexOf(b,i+a.length);
  assert.ok(i>=0&&j>i,'source anchors: '+a);
  return html.slice(i,j);
}
function harness(space='s1'){
  const values=new Map();
  const ctx={view:{addEventListener(){}}, space,store:{get:k=>values.get(k),set:(k,v)=>values.set(k,v)},
    TYPES:{pdf:{n:'PDF'}},nodeOf:()=>null,gr:()=>({N:new Map()}),
    esc:x=>String(x??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;')};
  const script=source('const TD_LAYOUTS=','const tdKey=')+'\n'+
    source('function tdParseQuery(expression){','function tdTypePage(')+
    '\n({tdReaderStatus,tdReadMetrics,tdReaderRow,tdReaderKey,tdParseQuery,tdQueryMatch,tdSavedQueryMatch,tdQueryContext})';
  const api=runInNewContext(script,ctx);
  return {api,ctx,values};
}
const pdf={id:'edital',href:'#/edital',kind:'pdf',name:'Edital 2026',detail:'DOU · Edital'};

test('new documents start in Inbox and triage transitions are scoped by space',()=>{
  const h=harness();
  assert.equal(h.api.tdReaderStatus(pdf),'inbox');
  h.values.set('reader-triage:s1:edital','later');
  assert.equal(h.api.tdReaderStatus(pdf),'later');
  h.values.set('reader-triage:s1:edital','archive');
  assert.equal(h.api.tdReaderStatus(pdf),'archive');
  h.values.set('reader-triage:s1:edital','invalid');
  assert.equal(h.api.tdReaderStatus(pdf),'inbox');
  assert.equal(harness('s2').api.tdReaderStatus(pdf),'inbox');
});

test('reading progress uses actual saved pages and labels missing metrics honestly',()=>{
  const h=harness();
  assert.equal(h.api.tdReadMetrics(pdf).progress,null);
  assert.equal(h.api.tdReadMetrics(pdf).minutes,null);
  h.values.set('pages:edital',8);
  assert.equal(h.api.tdReadMetrics(pdf).progress,null,'pages alone cannot imply reading');
  h.values.set('pos:edital',{page:3,total:8});
  const m=h.api.tdReadMetrics(pdf);
  assert.equal(m.progress,38);
  assert.equal(m.minutes,10);
  assert.equal(m.remaining,5);
  h.values.set('pos:edital',{page:800,total:8});
  assert.equal(h.api.tdReadMetrics(pdf).progress,100,'clamps out of bounds position');
});

test('PDF filtered view grammar supports state, tags, page progress and estimate comparisons',()=>{
  const h=harness();const {api,values}=h;
  values.set('object-meta:s1:pdf:edital',{tags:['Lei seca','edital']});
  values.set('pos:edital',{page:4,total:10});
  const c=api.tdQueryContext(pdf);
  assert.equal(c.triage,'inbox');
  assert.equal(c.progress,40);
  assert.equal(c.minutes,12);
  assert.equal(api.tdQueryMatch(pdf,'in:inbox AND tag:edital AND progress < 100',c),true);
  assert.equal(api.tdQueryMatch(pdf,'in:archive OR minutes < 15',c),true);
  assert.equal(api.tdQueryMatch(pdf,'category:DOU AND progress >= 40',c),true);
  assert.equal(api.tdQueryMatch(pdf,'minutes < 10',c),false);
  values.set('reader-triage:s1:edital','archive');
  assert.equal(api.tdQueryMatch(pdf,'in:inbox',api.tdQueryContext(pdf)),false);
  assert.equal(api.tdQueryMatch(pdf,'in:archive',api.tdQueryContext(pdf)),true);
  values.delete('pos:edital');
  assert.equal(api.tdQueryMatch(pdf,'progress < 100',api.tdQueryContext(pdf)),false,'never equate missing progress with 0%');
});

test('query parser rejects invalid expressions, unknown operators and out-of-range percentages',()=>{
  const {api}=harness();
  assert.equal(api.tdParseQuery('in:inbox AND minutes < 15').length,2);
  for(const q of ['progress < -1','progress < 101','minutes < nope','progress != 30','in:','name:a XOR name:b','tag:foo AND ']){
    assert.equal(api.tdParseQuery(q),null,q);
  }
});

test('triage rows expose independent document links, controls, safe title, and keyboard eligibility',()=>{
  const {api}=harness();
  const output=api.tdReaderRow({...pdf,name:'Edital <script>alert(1)</script>'},'', '');
  assert.match(output,/data-td-reader-id="edital"/);
  assert.match(output,/role="group"/);
  assert.match(output,/data-td-target="archive"/);
  assert.match(output,/data-td-target="later"/);
  assert.match(output,/data-td-target="shortlist"/);
  assert.match(output,/Progresso não registrado/);
  assert.doesNotMatch(output,/<script>/);
  assert.ok(html.includes('if(!row||e.target!==row)return;'),'single key must not hijack input or buttons');
});
