import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const html=readFileSync(new URL('../prototype/exam-app-0.1.1__index.html',import.meta.url),'utf8');
const start=html.indexOf('function tdParseQuery(expression){');
const end=html.indexOf('\nfunction tdTypePage(',start);
assert.ok(start>=0&&end>start,'query parser and evaluator extracted from actual prototype');
const values=new Map();
const graph=new Map();
const api=runInNewContext(html.slice(start,end)+
  '\n({tdParseQuery,tdQueryMatch,tdSavedQueryMatch,tdQueryContext})',{
  space:'s1',view:{addEventListener(){}},store:{get:key=>values.get(key)},TYPES:{concurso:{n:'Concurso'}},
  nodeOf:href=>graph.get(href)||null,gr:()=>({N:graph})
});
const item={href:'#/concurso/dataprev',kind:'concurso',name:'Concurso Dataprev',detail:'Tecnologia da Informação'};

test('validates bounded AND/OR field:value grammar without evaluating arbitrary code',()=>{
  assert.equal(api.tdParseQuery('name:Dataprev AND tag:"Lei seca"').length,2);
  assert.equal(api.tdParseQuery('type:concurso OR prop:Ano=2026').length,2);
  for(const expression of ['', 'banana', 'name:', 'js:eval()', 'tag:foo AND ', 'name:a XOR name:b', 'name:a AND OR tag:b','x'.repeat(401)]){
    assert.equal(api.tdParseQuery(expression),null,expression);
  }
});

test('AND/OR filters type, category, accents, tags and property key-value',()=>{
  const context={typeName:'Concurso',tags:['Revisão','Lei seca'],props:[['Ano','2026'],['Banca','FGV']],links:[]};
  assert.equal(api.tdQueryMatch(item,'type:concurso AND tag:revisao',context),true);
  assert.equal(api.tdQueryMatch(item,'category:tecnologia AND prop:Banca=FGV',context),true);
  assert.equal(api.tdQueryMatch(item,'tag:inexistente OR prop:Ano=2026',context),true);
  assert.equal(api.tdQueryMatch(item,'tag:inexistente AND prop:Ano=2026',context),false);
  assert.equal(api.tdQueryMatch(item,'prop:Banca=CESPE',context),false);
  assert.equal(api.tdQueryMatch(item,'type:PDF',context),false);
});

test('typed property/tag/link context comes from real graph and persisted metadata',()=>{
  values.set('object-meta:s1:concurso:dataprev',{tags:['Prioridade alta']});
  const linked={href:'#/edicao/a',title:'Dataprev 2026',kind:'edicao',out:[],inn:[]};
  graph.set('#/concurso/dataprev',{href:item.href,kind:item.kind,extra:[['Ano','2026']],out:[['#/edicao/a','Edição']],inn:[]});
  graph.set(linked.href,linked);
  const context=api.tdQueryContext(item);
  assert.equal(api.tdQueryMatch(item,'tag:Prioridade AND prop:Ano=2026 AND link:Dataprev',context),true);
  assert.equal(api.tdQueryMatch(item,'link:Desconhecido',context),false);
  assert.equal(api.tdQueryMatch(item,'tag:Outro',context),false);
});

test('legacy free-text saved queries retain search semantics without allowing malformed grammar',()=>{
  assert.equal(api.tdSavedQueryMatch(item,'dataprev',{}),true);
  assert.equal(api.tdSavedQueryMatch(item,'informação',{}),true);
  assert.equal(api.tdSavedQueryMatch(item,'name:Dataprev',{}),true);
  assert.equal(api.tdSavedQueryMatch(item,'script:alert(1)',{}),false);
  assert.equal(api.tdSavedQueryMatch(item,'',{}),false);
});
