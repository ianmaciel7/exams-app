import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const html=readFileSync(new URL('../prototype/exam-app-0.1.1__index.html',import.meta.url),'utf8');
const begin=html.indexOf('function graphStoredMeta(sp,href,kind){');
const end=html.indexOf('const GR_CACHE=new Map();',begin);
assert.ok(begin>=0&&end>begin,'G read model functions are present');

function fixture(space='s1'){
  const notes=new Map([['q1',{note:'Anotação de teste sobre prazo de recurso',noteHtml:'<p><strong>Prazo</strong></p>'}]]);
  const q={id:'q1',n:1,sp:'s1',materia:'Direito',assunto:'Prazos',enunciado:'Qual o prazo?',gabarito:'A',alternativas:{A:'5 dias'}};
  const env={space,store:{get:()=>null},CONCURSOS:[],edicoesOf:()=>[],docsOf:()=>[],
    qObjs:()=>[q],qFlag:id=>notes.get(id)||{},qTitle:q=>'Questão '+q.n,
    isT:()=>false,cargosOf:()=>[],findEnt:()=>null,concOrgaoName:()=>'',edBancaName:()=>'',edOrgaoName:()=>'',discEnt:()=>null,kn:k=>k,console:{warn:()=>{}}};
  const api=runInNewContext(html.slice(begin,end)+'\n({G,graphSearchText})',env);
  return {api,notes,q};
}

test('real saved question note becomes a navigable node with a real relation to question',()=>{
  const {api}=fixture();
  const g=api.G('s1'),note=g.N.get('#/nota/q1'),q=g.N.get('#/questao/q1');
  assert.ok(note&&q,'both native question and saved note appear');
  assert.equal(note.kind,'nota');
  assert.ok(api.graphSearchText(note).includes('prazo de recurso'));
  assert.equal(note.out.length,1);
  assert.equal(note.out[0][0],q.href);
  assert.equal(note.out[0][1],'Questão');
  assert.ok(q.inn.some(([id])=>id===note.href));
});

test('no saved note creates no phantom knowledge graph object',()=>{
  const h=fixture();h.notes.delete('q1');
  assert.equal(h.api.G('s1').N.has('#/nota/q1'),false);
});

test('notes are scoped to space and never expose another space question',()=>{
  const {api}=fixture();
  assert.equal(api.G('s2').N.has('#/nota/q1'),false);
});

test('WYSIWYG sanitizer, text-only paste and note URI route are present',()=>{
  assert.match(html,/function qPedSafeHtml\(source\)\{/);
  assert.match(html,/const blocked=new Set\(\['script','style','svg','iframe','object','embed','img'/);
  assert.match(html,/data-qnote-rich/);
  assert.match(html,/role="textbox" aria-multiline="true"/);
  assert.match(html,/clipboardData\?\.getData\('text\/plain'\)/);
  assert.match(html,/qSetFlag\(id,\{note:plain,noteHtml:safe\}\)/);
  assert.match(html,/h0\.startsWith\('\/nota\/'\)/);
  assert.match(html,/GR_CACHE\.delete\(space\)/);
});
