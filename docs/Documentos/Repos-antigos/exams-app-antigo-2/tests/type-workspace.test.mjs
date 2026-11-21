import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const html=readFileSync(new URL('../prototype/exam-app-0.1.1__index.html',import.meta.url),'utf8');
const start=html.indexOf('const TD_LAYOUTS='),end=html.indexOf('function opValorPage(',start);
assert.ok(start>=0&&end>start,'type dashboard extracted from real source');
const code=html.slice(start,end)+'\n({tdTypePage,tdState,tdUpdate,tdObjectsMarkup,tdItems,tdOrder,tdCollections,tdCollectionHrefs,tdToggleMember})';
function setup(){
 const state=new Map(),listeners=[];
 const env={space:'test',store:{get:k=>state.get(k),set:(k,v)=>state.set(k,v)},
   view:{addEventListener:(...a)=>listeners.push(a)},
   esc:s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;'),
   TYPES:{nota:{n:'Nota',custom:true,own:[]},questao:{n:'Questão'},simulado:{n:'Simulado'},resposta:{n:'Resposta'}},
   objHref:d=>d.href||'#/custom-object/'+d.id,
   iconSvg:()=>'<svg aria-hidden="true"></svg>',OPI:()=>({}),SI:{file:'<svg></svg>'},
   opPage:o=>o,miniMenu:()=>{},tdMenu:()=>{},formDialog:()=>Promise.resolve(null),toast:()=>{},
   showObjs:()=>{},navigator:{clipboard:{writeText:()=>Promise.resolve()}},location:{origin:'https://example.org',pathname:'/app'}
 };
 return {api:runInNewContext(code,env),state,listeners};
}
const objects=()=>[{id:'2',type:'nota',t:'Zebra',cat:'Teoria',createdAt:123,body:'Texto'},
  {id:'1',type:'nota',t:'Álgebra',cat:'Teoria',createdAt:456},
  {id:'3',type:'nota',t:'Redes',cat:'Prática',createdAt:1000}];
test('type workspace builds accessible overview/all tabs and 6 layout choices',()=>{
  const {api}=setup(),result=api.tdTypePage('nota',{n:'Nota',custom:true},objects());
  assert.match(result.body,/Visão geral/);
  assert.match(result.body,/Tudo/);
  assert.equal((result.body.match(/role="tabpanel"/g)||[]).length,2);
  assert.equal((result.body.match(/data-td-layout="nota"/g)||[]).length,1);
  assert.equal((result.body.match(/<option value="/g)||[]).length,8,'2 sort options + 6 layout options');
  assert.match(result.actions,/data-new="nota"/);
  assert.match(result.actions,/data-td-menu="nota"/);
  assert.match(html,/\.td-layout-gallery\{display:grid;grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
});
test('layout controls really change card/table/grouped/embeddable UI',()=>{
  const {api}=setup();
  for(const mode of ['gallery','list','table','board','mural','embed']){
    api.tdUpdate('nota',{layout:mode});
    const rendered=api.tdTypePage('nota',{n:'Nota',custom:true},objects());
    assert.ok(rendered.body.includes('td-layout-'+mode),mode);
    if(mode==='table')assert.match(rendered.body,/td-table-row/);
    if(mode==='embed')assert.match(rendered.body,/data-td-copy/);
    if(mode==='board'||mode==='mural')assert.match(rendered.body,/td-column/);
  }
});
test('filter sort and active tab are stored by type and workspace',()=>{
  const {api,state}=setup();
  api.tdUpdate('nota',{tab:'overview',search:'Redes',sort:'recent',layout:'gallery'});
  const result=api.tdTypePage('nota',{n:'Nota',custom:true},objects());
  assert.match(result.body,/data-td-count>1</);
  assert.match(result.body,/td-panel-overview/);
  assert.match(result.body,/id="td-panel-all"[^>]* hidden/);
  assert.equal(state.get('type-dashboard:test:nota').search,'Redes');
  const entries=api.tdOrder(api.tdItems('nota',objects()),'recent');
  assert.equal(entries[0].name,'Redes');
  assert.equal(entries[2].name,'Zebra');
});
test('empty states cannot masquerade as mock objects, XSS is escaped',()=>{
  const {api}=setup();
  let result=api.tdTypePage('nota',{n:'Nota',custom:true},[]);
  assert.match(result.body,/Nenhum objeto deste tipo/);
  const malicious=[{id:'bad',type:'nota',t:'<script>alert(1)</script>'}];
  result=api.tdTypePage('nota',{n:'Nota',custom:true},malicious);
  assert.doesNotMatch(result.body,/<script>alert/);
  assert.match(result.body,/&lt;script>/);
});

test('gallery cards use semantic object-type pills and only factual category chips (#56)',()=>{
  const {api}=setup();
  api.tdUpdate('nota',{layout:'gallery'});
  const result=api.tdTypePage('nota',{n:'Nota',custom:true},objects());
  assert.equal((result.body.match(/class="td-type-pill tone-type-nota"/g)||[]).length,3);
  assert.equal((result.body.match(/class="td-property-chip tone-type-nota"/g)||[]).length,3);
  assert.match(result.body,/class="td-card-tags"/);
  assert.match(result.body,/Prática/);
  assert.match(result.actions,/class="td-header-tools" role="group"/);
  assert.match(result.actions,/data-td-search-focus="nota"/);
  assert.match(result.actions,/data-td-more="nota"/);

  const minimal=api.tdTypePage('nota',{n:'Nota',custom:true},[{id:'empty',type:'nota',t:'Sem tag'}]);
  assert.match(minimal.body,/Sem propriedades categorizadas/);
  assert.doesNotMatch(minimal.body,/class="td-property-chip[^"]*">Sem propriedades/);
});


test('collections accept object membership without losing older saved collections (#56 #57)',()=>{
  const {api,state}=setup();
  state.set('typeCollections:test:nota',[
    {id:'c1',name:'Revisão',term:''},
    {id:'c2',name:'Outra',members:['#/custom-object/2']}
  ]);
  assert.equal(api.tdCollectionHrefs(api.tdCollections('nota')[0]).length,0,'legacy records without members remain valid');
  api.tdToggleMember('nota','c1','#/custom-object/1');
  assert.equal(api.tdCollectionHrefs(api.tdCollections('nota')[0]).length,1);
  assert.equal(api.tdCollectionHrefs(api.tdCollections('nota')[0])[0],'#/custom-object/1');
  assert.equal(api.tdCollectionHrefs(api.tdCollections('nota')[1])[0],'#/custom-object/2','unrelated collections are unchanged');
  api.tdToggleMember('nota','c1','#/custom-object/1');
  assert.equal(api.tdCollectionHrefs(api.tdCollections('nota')[0]).length,0,'second toggle removes member');
});

test('opening a saved collection filters the All view to actual members, with clear control (#56)',()=>{
  const {api,state}=setup();
  state.set('typeCollections:test:nota',[{id:'c1',name:'Só álgebra',members:['#/custom-object/1']}]);
  api.tdUpdate('nota',{tab:'all',layout:'gallery',collection:'c1'});
  const page=api.tdTypePage('nota',{n:'Nota',custom:true},objects());
  assert.match(page.body,/data-td-open-collection="nota\|c1"/);
  assert.match(page.body,/data-td-clear-collection="nota"/);
  assert.match(page.body,/data-td-count>1</);
  assert.equal((page.body.match(/class="td-card-title"/g)||[]).length,1);
  assert.match(page.body,/td-card-title">Álgebra/);
  assert.equal(api.tdState('nota').collection,'c1');
  api.tdUpdate('nota',{collection:''});
  const unfiltered=api.tdTypePage('nota',{n:'Nota',custom:true},objects());
  assert.equal((unfiltered.body.match(/class="td-card-title"/g)||[]).length,3);
});

test('collection state is specific to space and type; unknown/legacy filters are safe (#56)',()=>{
  const {api,state}=setup();
  state.set('typeCollections:test:nota',[{id:'legacy',name:'Antiga'}]);
  api.tdUpdate('nota',{tab:'all',collection:'legacy'});
  const legacy=api.tdTypePage('nota',{n:'Nota',custom:true},objects());
  assert.match(legacy.body,/data-td-count>0</);
  assert.match(legacy.body,/Nenhum objeto deste tipo cadastrado/);
  assert.equal(api.tdCollections('simulado').length,0,'other type does not inherit collections');
  assert.ok(!state.has('typeCollections:another-space:nota'));
});
