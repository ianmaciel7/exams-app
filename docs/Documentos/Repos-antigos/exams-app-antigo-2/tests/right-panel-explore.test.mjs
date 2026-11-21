import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const html=readFileSync(new URL('../prototype/exam-app-0.1.1__index.html',import.meta.url),'utf8');
const extract=(begin,end)=>{
  const a=html.indexOf(begin),b=html.indexOf(end,a+begin.length);
  assert.ok(a>=0&&b>a,'source region '+begin);
  return html.slice(a,b);
};
const source=extract('function rpSearchBlock(v,expanded=false){','const exChips=')+'\n'+
  extract('function bodyInternos(v){','function bodyBack(v){')+
  '\n({bodyExplorar,bodyInternos,bodySearch})';
function harness({context=true,missingFixed=false}={}){
  const a={href:'#/edicao/e1',title:'Dataprev 2026',kind:'edicao',sub:'Edição'};
  const b={href:'#/orgao/o1',title:'Dataprev',kind:'orgao',sub:'Órgão'};
  const root={title:'Analista de TI',out:[[a.href,'Edição'],[a.href,'Outro vínculo'],[b.href,'Órgão']]};
  const nodes=new Map([[a.href,a],[b.href,b]]);
  const env={
    RT:{graf:{ic:'g'},back:{ic:'b'},internos:{ic:'o'},rel:{ic:'r'},ia:{ic:'a'}},
    WI:{search:'s'},KORD:['edicao','orgao'],
    gr:()=>({N:nodes}),vNode:()=>missingFixed?null:context?root:null,nbrs:()=>[a,b],
    esc:x=>String(x).replaceAll('&','&amp;').replaceAll('"','&quot;'),
    kn:x=>x,exChips:()=>'<div>chips</div>',exRows:()=>'<p>found</p>',
    rpRow:(n,sub)=>'<a href="'+n.href+'">'+n.title+' '+(sub||'')+'</a>',
    ctxBar:()=>'<div>context</div>',rpEmpty:(title)=>'<p>'+title+'</p>',needCtx:()=>'<p>select context</p>'
  };
  return runInNewContext(source,env);
}
test('Explore renders six actionable contextual tools and relevant real links',()=>{
  const h=harness();const html=h.bodyExplorar({id:'v1'});
  assert.equal((html.match(/class="rp-launch-btn"/g)||[]).length,6);
  for(const title of ['Grafo','Links de entrada','Objetos internos','Conteúdo relacionado','Chat de IA','Buscar'])
    assert.ok(html.includes(title),title);
  assert.match(html,/data-rp-new="internos"/);
  assert.match(html,/data-rp-new="search"/);
  assert.match(html,/Conteúdo relevante/);
  assert.match(html,/Dataprev 2026/);
  assert.match(html,/data-rp-find/);
});
test('Outgoing objects are grouped by real type and deduplicated by href',()=>{
  const h=harness();const html=h.bodyInternos({id:'v1'});
  assert.match(html,/edicao/);assert.match(html,/orgao/);
  assert.equal((html.match(/Dataprev 2026/g)||[]).length,1);
  assert.equal((html.match(/href="#\/edicao\/e1"/g)||[]).length,1);
});
test('Context guards refuse leaking pinned objects from another space',()=>{
  const h=harness({missingFixed:true});
  assert.match(h.bodyInternos({id:'v1',ref:'#/edicao/other'}),/Objeto indisponível neste espaço/);
  assert.match(h.bodyInternos({id:'v1'}),/Seguir contexto|select context/);
});
test('Search is registered as a full contextual tool in the panel and plus menu',()=>{
  assert.ok(html.includes("'ia','search'].map(k=>"),'Search is available in the plus menu');
  assert.match(html,/const BODY=\{explorar:bodyExplorar,search:bodySearch,back:bodyBack,internos:bodyInternos/);
  assert.match(html,/data-rp-new="rel"/);
  const search=harness().bodySearch({id:'s1',q:'Dataprev'});
  assert.match(search,/data-rp-find open/);
  assert.match(search,/data-ex-q="s1"/);
  assert.match(search,/value="Dataprev"/);
  assert.match(search,/data-ex-list/);
});
