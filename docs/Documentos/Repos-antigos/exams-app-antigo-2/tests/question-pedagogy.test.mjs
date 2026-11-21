import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const html=readFileSync(new URL('../prototype/exam-app-0.1.1__index.html',import.meta.url),'utf8');
const start=html.indexOf('/* Pedagogical tab surface shared by question object');
const end=html.indexOf('function questaoPage(q){',start);
assert.ok(start>=0&&end>start,'real pedagogy functions found');
const source=html.slice(start,end)+'\n({qPedStats,qPedModule,qPedKey})';
const q={id:'q1',n:1,conc:'dataprev',materia:'Engenharia',assunto:'Testes',gabarito:'B',
  comentario:'B é válida. A confunde escopo.',doc:'tipo1',ed:'dataprev-2026'};
function harness(records=[],note=''){
  const mem=new Map(),listeners=[];
  const env={space:'dataprev',view:{addEventListener:(...xs)=>listeners.push(xs)},
    histAll:()=>records,store:{get:k=>mem.get(k),set:(k,v)=>mem.set(k,v)},
    esc:x=>String(x).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;'),
    fmtDT:at=>String(at),nbMembership:()=>'<button data-nb-single="q1">Criar caderno</button>',
    aiRow:()=>'<button data-ai="expl">Explicar questão</button>',
    qFlag:()=>({note}),qOrig:()=> 'oficial',discEnt:()=>({id:'software'}),
    qSetFlag:()=>{},toast:()=>{},Date,Map,Set,Math
  };
  return {api:runInNewContext(source,env),mem,listeners};
}
test('five pedagogy tabs are real panels in question and practice, not in unfinished exam',()=>{
  const h=harness(),htmlResult=h.api.qPedModule(q,false);
  for(const title of ['Gabarito Comentado','Estatísticas','Cadernos','Anotações','Fontes & Edital'])
    assert.ok(htmlResult.includes(title),title);
  assert.equal((htmlResult.match(/role="tab"/g)||[]).length,5);
  assert.equal((htmlResult.match(/role="tabpanel"/g)||[]).length,5);
  assert.match(html,/qPedModule\(q,!!r\)/);
  assert.match(html,/examMode\?'':qPedModule\(q,!!answer\)/);
  assert.match(html,/data-qped-close/);
});
test('unanswered question never exposes correctness nor comments',()=>{
  const h=harness(),markup=h.api.qPedModule(q,false);
  assert.doesNotMatch(markup,/Gabarito: <strong>B/);
  assert.doesNotMatch(markup,/B é válida/);
  assert.doesNotMatch(markup,/Explicar questão/);
  assert.match(markup,/Responda e confirme para liberar o gabarito/);
  assert.match(h.api.qPedModule(q,true),/Gabarito: <strong>B/);
  assert.match(h.api.qPedModule(q,true),/B é válida/);
});
test('personal donut and per-alternative bar values use only real recorded attempts',()=>{
  const records=[{q:'q1',a:'A',ok:false,t:100},{q:'q1',a:'B',ok:true,t:200},
    {q:'q1',a:'B',ok:true,t:300},{q:'other',a:'E',ok:false,t:400}];
  const h=harness(records),stats=h.api.qPedStats(q);
  assert.match(stats,/Rendimento pessoal: 2 acertos em 3 tentativas/);
  assert.match(stats,/stroke-dasharray="67 100"/);
  assert.match(stats,/Alternativa B: 2 respostas/);
  assert.match(stats,/Alternativa A: 1 resposta/);
  assert.match(stats,/Alternativa E: 0 respostas/);
  assert.equal((stats.match(/href="#\/resposta\//g)||[]).length,3);
  assert.match(stats,/Dados pessoais, não estatísticas globais/);
  assert.doesNotMatch(stats,/69%/);
});
test('notes are escaped, formatted without unsafe HTML output and scoped to question/space',()=>{
  const h=harness([],'<img src=x onerror=alert(1)>'),markup=h.api.qPedModule(q,false);
  assert.match(markup,/&lt;img/);
  assert.doesNotMatch(markup,/<img src/);
  assert.match(markup,/data-qnote="q1"/);
  assert.match(markup,/data-qped-save="q1"/);
  assert.match(markup,/data-qped-format="bold"/);
  assert.equal(h.api.qPedKey(q.id),'question-pedagogy:dataprev:q1');
});
test('zero history shows real empty state, not global statistics',()=>{
  const h=harness(),stats=h.api.qPedStats(q);
  assert.match(stats,/Nenhuma resposta registrada nesta questão/);
  assert.match(stats,/0 respostas no histórico pessoal/);
  assert.match(stats,/0 acertos em 0 tentativas/);
});
