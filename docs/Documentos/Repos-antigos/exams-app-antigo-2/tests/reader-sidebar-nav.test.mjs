import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const html=readFileSync(new URL('../prototype/exam-app-0.1.1__index.html',import.meta.url),'utf8');
const from=html.indexOf('function tdReaderNavSection(){');
const to=html.indexOf("\nnav.addEventListener('click',e=>{",from);
assert.ok(from>0&&to>from,'reader sidebar function can be isolated');
function harness(){
  const values=new Map([['typeQueries:s1:pdf',[
    {id:'saved-a',name:'Leis & Editais',term:'tag:edital AND progress < 100'}
  ]]]);
  const docs=[{id:'a',type:'pdf'},{id:'b',type:'pdf'},{id:'c',type:'pdf'}];
  const statuses=new Map([['a','inbox'],['b','later'],['c','archive']]);
  const env={
    space:'s1',location:{hash:'#/tipo/pdf'},closedSecs:new Set(),docsOf:()=>docs,tdState:()=>({query:'',triage:'all'}),
    TD_TRIAGE:[['all','Todos'],['inbox','Caixa de entrada'],['later','Ler depois'],['shortlist','Prioritários'],['archive','Arquivados']],
    tdReaderStatus:d=>statuses.get(d.id)||'inbox',store:{get:key=>values.get(key)},secHead:()=>'<header>Leituras</header>',
    esc:x=>String(x??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;')
  };
  return {api:runInNewContext(html.slice(from,to)+'\ntdReaderNavSection',env),env,values};
}
test('all PDF reader folders render along with saved query links (regression: missing concatenation)',()=>{
  const h=harness();
  const out=h.api();
  for(const state of ['all','inbox','later','shortlist','archive']){
    assert.ok(out.includes('data-nav-reader-stage="'+state+'"'),state);
  }
  assert.match(out,/data-nav-reader-query="saved-a"/);
  assert.match(out,/Leis &amp; Editais/);
  assert.match(out,/aria-current="page"/);
  assert.match(out,/3<\/span>|Leituras/);
  assert.match(out,/Visões filtradas/);
});
test('saved query title is escaped and isolation follows source space',()=>{
  const h=harness();
  h.values.set('typeQueries:s1:pdf',[{id:'x',name:'<script>',term:'tag:edital'}]);
  const out=h.api();
  assert.ok(!out.includes('<script>'));
  assert.ok(out.includes('&lt;script>'));
  h.env.space='s2';
  assert.doesNotMatch(h.api(),/data-nav-reader-query/);
});
