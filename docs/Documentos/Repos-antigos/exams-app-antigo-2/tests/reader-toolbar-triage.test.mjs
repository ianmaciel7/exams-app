import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const html=readFileSync(new URL('../prototype/exam-app-0.1.1__index.html',import.meta.url),'utf8');
const first=html.indexOf('function readerTriageSync(');
const last=html.indexOf('\nconst hasPdf=',first);
assert.ok(first>=0&&last>first);
function setup(){
  const values=new Map(),nodes=new Map();
  for(const id of ['readerTriageTools','readerLater','readerShortlist','readerArchive']){
    nodes.set(id,{hidden:id==='readerTriageTools',disabled:false,attrs:{},callbacks:{},
      setAttribute(k,v){this.attrs[k]=v;},
      getAttribute(k){return this.attrs[k];},
      addEventListener(k,fn){this.callbacks[k]=fn;}});
  }
  const calls=[];
  const ctx={cur:null,space:'s1',store:{set:(k,v)=>values.set(k,v),get:k=>values.get(k)},
    tdReaderStatus:d=>values.get('reader-triage:s1:'+d.id)||'inbox',
    tdReaderKey:id=>'reader-triage:s1:'+id,
    $:id=>nodes.get(id),paintNav:()=>calls.push('paint'),toast:msg=>calls.push(msg)};
  const api=runInNewContext(html.slice(first,last)+
    '\n({readerTriageMove,readerTriageSync,setCur:d=>cur=d})',ctx);
  return {api,values,nodes,calls};
}
const doc={id:'edital',type:'pdf'};

test('PDF toolbar hides without reader and reflects actual persisted stage',()=>{
  const h=setup(),n=id=>h.nodes.get(id);
  h.api.readerTriageSync(null);
  assert.equal(n('readerTriageTools').hidden,true);
  assert.equal(n('readerArchive').disabled,true);
  h.api.setCur({d:doc,pdf:{numPages:10}});
  h.api.readerTriageSync(doc);
  assert.equal(n('readerTriageTools').hidden,false);
  assert.equal(n('readerLater').getAttribute('aria-pressed'),'false');
  h.values.set('reader-triage:s1:edital','shortlist');
  h.api.readerTriageSync(doc);
  assert.equal(n('readerShortlist').getAttribute('aria-pressed'),'true');
});

test('toolbar buttons mutate the same per-space triage state as library filters',()=>{
  const h=setup(),n=id=>h.nodes.get(id);
  assert.equal(h.api.readerTriageMove('archive'),false,'no document open');
  h.api.setCur({d:doc,pdf:{numPages:10}});
  h.api.readerTriageMove('later');
  assert.equal(h.values.get('reader-triage:s1:edital'),'later');
  assert.equal(n('readerLater').getAttribute('aria-pressed'),'true');
  h.api.readerTriageMove('shortlist');
  assert.equal(h.values.get('reader-triage:s1:edital'),'shortlist');
  h.api.readerTriageMove('archive');
  assert.equal(h.values.get('reader-triage:s1:edital'),'archive');
  assert.equal(n('readerArchive').getAttribute('aria-pressed'),'true');
  assert.ok(h.calls.filter(x=>x==='paint').length===3);
  assert.equal(h.api.readerTriageMove('other'),false,'unrecognized state rejected');
});

test('reader shortcut registry uses central guarded dispatcher and does not hijack text input',()=>{
  assert.match(html,/command\('reader\.archive','Arquivar PDF','e','Leitura',58,\(\)=>!!cur\?\.pdf,\(\)=>readerTriageMove\('archive'\)\)/);
  assert.match(html,/command\('reader\.later','Mover PDF para Ler depois','l','Leitura',58,\(\)=>!!cur\?\.pdf,\(\)=>readerTriageMove\('later'\)\)/);
  assert.match(html,/if\(commandTargetEditable\(target\)\)return/);
  assert.match(html,/if\(\$\('dlg'\)\?\.classList\.contains\('on'\)\)return/);
  assert.match(html,/readerTriageSync\(null\)/);
  assert.match(html,/readerTriageSync\(d\)/);
  assert.match(html,/bar\.innerHTML\+=readerTriageButtons\(\)/);
  assert.match(html,/data-reader-triage/);
  assert.match(html,/readerTriageMove\(action\.dataset\.readerTriage\)/);
  assert.doesNotMatch(html,/<span class="reader-triage-tools" id="readerTriageTools" role="group" aria-label="Triagem do PDF aberto" hidden>/);
});
