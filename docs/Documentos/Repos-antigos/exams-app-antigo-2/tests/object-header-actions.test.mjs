import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const html=readFileSync(new URL('../prototype/exam-app-0.1.1__index.html',import.meta.url),'utf8');
const start=html.indexOf('function opFooterRelations(iid){');
const end=html.indexOf('\nfunction opStats(){',start);
assert.ok(start>=0&&end>start,'object page source found');

function harness(space='test'){
  const values=new Map();
  const env={
    view:{addEventListener(){}}, space,store:{get:k=>values.get(k),set:(k,v)=>values.set(k,v)},
    tdCollections:()=>[],tdCollectionHrefs:()=>[],
    esc:s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;'),
    opIcon:()=>'<span class="op-icon"></span>',opNav:()=>'',opProps:()=>'',studyOk:()=>false,OV:()=>({}),
    nodeOf:()=>null,gr:()=>({N:new Map()}),nbrs:()=>[],kn:k=>k,
    // Stub: bloco de incorporações (embedQueriesHTML) fica fora desta fatia; cabeçalho não depende dele.
    embedQueriesHTML:()=>''
  };
  // opSec é helper real da página (fora da fatia) usado por opFooterRelations.
  const secLine=html.slice(html.indexOf('const opSec='),html.indexOf('\n',html.indexOf('const opSec=')));
  const opPage=runInNewContext(secLine+'\n'+html.slice(start,end)+'\nopPage',env);
  return {opPage,values};
}
const page=(id='concurso:demo')=>({
  iid:id,title:'Concurso Demo',kind:'Concurso',icon:'concurso',body:'<p>Conteúdo</p>'
});

test('object header has accessible width, AI, more, and metadata actions (#57)',()=>{
  const h=harness();
  const markup=h.opPage(page());
  for(const a of ['data-op-width','data-op-assistant','data-op-more','data-op-meta']){
    assert.match(markup,new RegExp(a+'="concurso:demo"'));
  }
  assert.match(markup,/aria-pressed="false"/);
  assert.match(markup,/role="group" aria-label="Ações do objeto"/);
  assert.match(markup,/Alias e etiquetas/);
  assert.match(markup,/op-kind-row/);
  assert.doesNotMatch(markup,/\bop-wide\b/);
});

test('per-space wide choice and aliases/tags persist safely in rendered object',()=>{
  const h=harness('dataprev');
  h.values.set('object-wide:dataprev:concurso:demo',true);
  h.values.set('object-meta:dataprev:concurso:demo',{
    alias:'Demo <unsafe>',tags:['Tag A','Jurisprudência <script>']
  });
  const markup=h.opPage(page());
  assert.match(markup,/class="op op-wide"/);
  assert.match(markup,/aria-pressed="true"/);
  assert.match(markup,/Alias: Demo &lt;unsafe>/);
  assert.match(markup,/Jurisprudência &lt;script>/);
  assert.doesNotMatch(markup,/<script>/);
  const other=harness('outro').opPage(page());
  assert.doesNotMatch(other,/Alias: Demo/);
});

test('type dashboards and subordinate pages do not gain unrelated object tools',()=>{
  const h=harness();
  const type=h.opPage({...page('tipo:concurso'),body:'<p>Tipo</p>'});
  const sub=h.opPage({...page(),tab:'questoes'});
  assert.doesNotMatch(type,/data-op-width/);
  assert.doesNotMatch(sub,/data-op-width/);
});

test('actions wire to real saved state, dialogs, right panel and context menus',()=>{
  for(const fragment of [
    "store.set(key,!store.get(key));route(true)",
    "title:'Aliases e etiquetas'",
    "store.set(key,{alias,tags});GR_CACHE.delete(space);route(true)",
    "rpAddTab('ia'",
    "rpAddTab('back',href)",
    "rpAddTab('rel',href)",
    "navigator.clipboard.writeText"
  ])assert.ok(html.includes(fragment),fragment);
});
