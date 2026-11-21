import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const html=readFileSync(new URL('../prototype/exam-app-0.1.1__index.html',import.meta.url),'utf8');
const from=html.indexOf("let ehBankState='idle'");
const until=html.indexOf('/* ---- Histórico de respostas, tentativas (Simulado) e Desempenho ---- */',from);
assert.ok(from>=0&&until>from,'home implementation exists');
const recoveryStart=html.indexOf('const ERROR_REVIEW_DAY=');
const recoveryEnd=html.indexOf('function histMeta(',recoveryStart);
assert.ok(recoveryStart>=0&&recoveryEnd>recoveryStart,'history recovery helpers found');
const source=html.slice(recoveryStart,recoveryEnd)+'\n'+html.slice(from,until);
function run({questions=[],docs=[],history=[],dueCards=[],objects=[],entities=[]}={}){
  const state=new Map();const calls=[],sims=[];
  const env={
    space:'dataprev',questionBank:{questoes:[]},loadQuestions:()=>Promise.resolve(),showObjs:()=>{},location:{hash:'#/espaco'},view:{addEventListener(){}},
    store:{get:k=>state.get(k),set:(k,v)=>state.set(k,v)},docsOf:()=>docs,
    objsOf:()=>objects,entsAll:()=>entities,gr:()=>({N:new Map(entities.map(e=>['#/'+e.type+'/'+e.id,e]))}),
    objHref:d=>d.type==='pdf'?'#'+d.id:'#/'+d.type+'/'+d.id,
    iconSvg:()=>'<svg></svg>',OPI:()=>({}),SI:{file:'<svg></svg>'},
    qObjs:()=>questions,qSel:q=>q.selected||null,histAll:()=>history,srsDueCards:()=>dueCards,
    edicoesOf:()=>[],cargosOf:()=>[],CONCURSOS:[{sp:'dataprev',id:'dataprev',t:'Concurso de TI'}],
    isT:()=>false,examDateISO:()=>null,daysTo:()=>null,
    wOf:q=>q.materia==='Conhecimentos Específicos'?2.5:1,
    qTitle:q=>'Questão '+(q.n||q.id),
    UIICON:{book:'<svg></svg>',timer:'<svg></svg>',filePlus:'<svg></svg>'},
    esc:x=>String(x??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;'),
    Date,Math,Set,Map
  };
  const {opEspacoPage}=runInNewContext(source+'\n({opEspacoPage})',env);
  return {markup:opEspacoPage({name:'Espaço de Teste'},[]),state,calls,sims};
}
test('editorial shell contains accessible 4-tab outline and no decorative emoji',()=>{
  const {markup}=run();
  for(const label of ['VISÃO GERAL DO ESPAÇO','HOJE · PRÓXIMA AÇÃO','REVISÃO DE HOJE','SEU RITMO HOJE',
    'Disciplinas & Assuntos','Caderno de Questões','Raio-X da Banca','Caderno de Erros','Objetos recentes'])
    assert.ok(markup.includes(label),label);
  assert.equal((markup.match(/role="tab" id="eh-tab-/g)||[]).length,4);
  assert.equal((markup.match(/role="tabpanel" id="eh-panel-/g)||[]).length,4);
  assert.doesNotMatch(markup,/1\.248|84%|12 dias|🎯|📅|🎉|🔥|📖/);
  assert.match(markup,/Nenhum|nenhum|Sem perguntas|Sem questões/);
});
test('metrics come only from actual question and history records',()=>{
  const questions=[
    {id:'q1',n:1,conc:'dataprev',materia:'Engenharia',assunto:'API',gabarito:'A',selected:'A'},
    {id:'q2',n:2,conc:'dataprev',materia:'Engenharia',assunto:'API',gabarito:'B',selected:'A'}
  ];
  const now=Date.now(),history=[
    {q:'q1',conc:'dataprev',m:'Engenharia',ok:true,t:now,a:'A'},
    {q:'q2',conc:'dataprev',m:'Engenharia',ok:false,t:now,a:'A'}
  ];
  const {markup}=run({questions,history});
  assert.match(markup,/>2<\/strong><span>Questões<\/span>/);
  assert.match(markup,/>0<\/strong><span>Para revisar<\/span>/,'wrong answer recorded now is not due until tomorrow');
  assert.match(markup,/50% de acerto/);
  assert.match(markup,/Questão 1/);
  assert.match(markup,/Questão 2/);
  assert.match(markup,/Recomendado/);
});
test('zero initial history is represented without false computed exam scores',()=>{
  const {markup}=run({questions:[],history:[]});
  assert.match(markup,/Sem respostas hoje/);
  assert.match(markup,/Sem questões cadastradas/);
  assert.match(markup,/Nenhuma revisão vencida hoje/);
});

test('Home combines real due SRS cards with confirmed error-recovery tasks, not all errors (#58)',()=>{
  const now=Date.now();
  const questions=[
    {id:'q1',n:1,conc:'dataprev',materia:'Direito',assunto:'Artigo',gabarito:'B',selected:'A'},
    {id:'q2',n:2,conc:'dataprev',materia:'Direito',assunto:'Outro',gabarito:'B',selected:'A'}
  ];
  const history=[
    {q:'q1',conc:'dataprev',m:'Direito',ok:false,t:now-3*86400000,a:'A'},
    {q:'q2',conc:'dataprev',m:'Direito',ok:false,t:now,a:'A'}
  ];
  const {markup}=run({questions,history,dueCards:[{id:'card-1'},{id:'card-2'}]});
  assert.match(markup,/>3<\/strong><span>Para revisar<\/span>/);
  assert.match(markup,/class="eh-review-number">3<\/strong>/);
  assert.match(markup,/2 cartões SRS vencidos/);
  assert.match(markup,/1 questão com recuperação vencida/);
  assert.match(markup,/2 questões pendentes de recuperação/);
  assert.match(markup,/href="#\/revisao">Abrir revisão espaçada/);
  assert.match(markup,/href="#\/questoes\/erradas">Abrir caderno de erros/);
});

test('editorial recent objects includes real dated custom entities and imported PDFs but no undated fixtures (#58)',()=>{
  const now=Date.now();
  const {markup}=run({objects:[
    {id:'legacy',type:'concurso',t:'Histórico sem data'},
    {id:'c1',type:'concurso',t:'Concurso recente',createdAt:now-2000},
    {id:'custom-object-a',type:'custom-resumo',t:'Resumo novo',createdAt:now-1000},
    {id:'pdf-new',type:'pdf',t:'PDF importado',createdAt:now}
  ],entities:[{id:'orgao-x',type:'orgao',t:'Órgão criado',sp:'dataprev',createdAt:now-1500}]});
  const recents=markup.slice(markup.indexOf('<section class="eh-recents">'));
  for(const title of ['Concurso recente','Resumo novo','PDF importado','Órgão criado'])
    assert.ok(recents.includes(title),title);
  assert.doesNotMatch(recents,/Histórico sem data/);
  assert.ok(recents.indexOf('PDF importado')<recents.indexOf('Resumo novo'));
  assert.ok(recents.indexOf('Resumo novo')<recents.indexOf('Órgão criado'));
  assert.ok(recents.includes('tone-type-custom-resumo'));
  assert.ok(recents.includes('tone-type-orgao'));
});
