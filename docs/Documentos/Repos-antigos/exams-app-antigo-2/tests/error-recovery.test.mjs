import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const html=readFileSync(new URL('../prototype/exam-app-0.1.1__index.html',import.meta.url),'utf8');
const start=html.indexOf('const histAll=()=>'),end=html.indexOf('function histMeta(',start);
assert.ok(start>=0&&end>start,'real immutable attempt-history ledger is present');
const code=html.slice(start,end)+'\n({errorLedger,errorReviewSummary,errorNotebookMarkup,errorTopicMetrics,qResetForRetry,mergeConfirmedAttemptFallback})';
const day=86400000,base=Date.UTC(2026,10,9,10,0,0),id='q1';
const record=(at,ok,a=ok?'B':'A',qid=id)=>({q:qid,t:at,ok,a,src:'Prática'});
function harness(log=[]){
 const values=new Map([['hist',log],['cadernoAnswers',{book42:{q1:{selected:'A',at:base}}}]]),answers={1:{selected:'A',correct:false,deleted:false,version:1}},
   pending={q1:'A'},writes=[];
 const env={store:{get:k=>values.get(k),set:(k,v)=>{values.set(k,v);writes.push([k,v]);}},
   qPend:pending,uqAns:()=>({}),saveUqAns:()=>{},getAnswers:()=>answers,
   nbFind:bid=>bid==='book42'?{id:bid}:null,nbAnswerMap:()=>values.get('cadernoAnswers')||{},
   saveAnswers:a=>{values.set('answers',a);writes.push(['answers',a]);},
   esc:t=>String(t).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;'),
   qTitle:q=>'Questão '+q.id,wOf:q=>!q.user&&q.materia==='Conhecimentos Específicos'?2.5:1,Date,Number,Math,Array,Set,Map,String
 };
 return {api:runInNewContext(code,env),values,answers,pending,writes};
}
test('a mistaken answer remains pending until a later confirmed correct attempt',()=>{
 const initial=harness([record(base,false)]).api.errorLedger(id);
 assert.equal(initial.open,true);assert.equal(initial.recovered,false);
 assert.equal(initial.intervalDays,1);assert.equal(initial.dueAt,base+day);
 const wrongAgain=harness([record(base,false),record(base+5000,false)]).api.errorLedger(id);
 assert.equal(wrongAgain.open,true);assert.equal(wrongAgain.errors,2);
 assert.equal(wrongAgain.dueAt,base+5000+day);
 const recovered=harness([record(base,false),record(base+5000,false),record(base+6000,true)]).api.errorLedger(id);
 assert.equal(recovered.open,false);assert.equal(recovered.recovered,true);
 assert.equal(recovered.correctReviews,1);assert.equal(recovered.intervalDays,3);
 assert.equal(recovered.dueAt,base+6000+3*day);
});
test('SRS steps 1/3/7/21 days are deterministic and regress to day 1 on a new error',()=>{
 const attempts=[record(base,false),record(base+day,true),record(base+4*day,true),record(base+11*day,true)];
 const h=harness(attempts),done=h.api.errorLedger(id);
 assert.equal(done.intervalDays,21);assert.equal(done.stage,3);
 assert.equal(done.dueAt,base+32*day);
 const reopened=harness(attempts.concat(record(base+15*day,false))).api.errorLedger(id);
 assert.equal(reopened.recovered,false);assert.equal(reopened.open,true);
 assert.equal(reopened.stage,0);assert.equal(reopened.dueAt,base+16*day);
});
test('unanswered, malformed, unrelated and never-wrong correct logs do not enter error recovery',()=>{
 const h=harness([record(base,true),record(base+1,false,'',id),record(base+2,false,'A','other'),
   {q:id,t:base+3,a:'A',ok:null}]);
 const state=h.api.errorLedger(id);
 assert.equal(state.everWrong,false);assert.equal(state.open,false);
 assert.equal(state.dueAt,0);assert.equal(state.attempts,1);
});
test('viewing solutions or clearing an answer does not mutate history or declare recovery',()=>{
 const h=harness([record(base,false)]);
 const before=JSON.stringify(h.values.get('hist'));
 h.api.errorNotebookMarkup([{id:'q1',n:1,materia:'Direito',assunto:'Princípios'}],base+day);
 assert.equal(h.api.errorLedger(id).open,true);
 h.api.qResetForRetry({id,n:1,user:false});
 assert.equal(JSON.stringify(h.values.get('hist')),before,'clearing a current selection does not write history');
 assert.equal(h.api.errorLedger(id).open,true,'reset does not heal a past error');
 assert.equal(h.values.get('answers')[1].deleted,true);
 assert.equal(h.pending.q1,undefined);
 assert.equal(h.writes.filter(([k])=>k==='hist').length,0);
});
test('retry inside a notebook clears only its scoped answer and preserves general practice',()=>{
 const h=harness([record(base,false)]);
 const before=JSON.stringify(h.values.get('hist'));
 h.api.qResetForRetry({id,n:1,user:false},'book:book42');
 assert.equal(h.values.get('cadernoAnswers').book42.q1,undefined);
 assert.equal(h.answers[1].selected,'A','unrelated global practice answer must survive');
 assert.equal(JSON.stringify(h.values.get('hist')),before,'immutable attempt ledger must survive');
 assert.equal(h.writes.filter(([k])=>k==='answers').length,0);
 assert.equal(h.pending.q1,undefined);
 assert.match(html,/closest\('\[data-practice-key\]'\)/,'retry action obtains notebook context');
 assert.match(html,/if\(key\.startsWith\('book:'\)\)nbRender/,'retry rerenders notebook route');
});
test('retry without a valid notebook does not clear global answers',()=>{
 const h=harness([record(base,false)]);
 h.api.qResetForRetry({id,n:1,user:false},'book:missing');
 assert.equal(h.answers[1].selected,'A');
 assert.equal(h.writes.length,0);
});
test('pending, recovered, due and scheduled counts are distinct and based on actual timestamps',()=>{
 const data=[record(base,false,'A','q1'),record(base,false,'A','q2'),
   record(base+100,true,'B','q2'),record(base+200,true,'B','q3')];
 const h=harness(data),qs=[{id:'q1'},{id:'q2'},{id:'q3'}];
 const result=h.api.errorReviewSummary(qs,base+day+1);
 assert.equal(result.pending.length,1);
 assert.equal(result.recovered.length,1);
 assert.equal(result.due.length,1);
 assert.equal(result.scheduled.length,1);
 assert.equal(result.total,3);
});
test('error notebook is grouped by actual week and discipline, and escapes arbitrary titles',()=>{
 const h=harness([record(base,false)]),markup=h.api.errorNotebookMarkup([
   {id:'q1',n:1,materia:'Engenharia & Software',assunto:'<img src=x>'}],base+day+1);
 assert.match(markup,/Semana de/);assert.match(markup,/Engenharia &amp; Software/);
 assert.match(markup,/&lt;img src=x&gt;/);
 assert.match(markup,/Revisar agora/);assert.match(markup,/#\/questao\/q1/);
 assert.doesNotMatch(markup,/<img/);
});
test('question filters and practice route preserve unresolved ledger status after reset',()=>{
 assert.match(html,/state=errorLedger\(q\.id\)/);
 assert.match(html,/if\(state\.open&&!a\.includes\('erradas'\)\)a\.push\('erradas'\)/);
 assert.match(html,/data-q-retry/);
 assert.match(html,/errorOnly=path\.split\('\?'\)\[0\]==='\/questoes\/erradas'/);
 assert.match(html,/errorNotebookMarkup\(all\)/);
 assert.match(html,/errorLedger\(q\.id\)\.open/);
});

test('remote restored wrong practice answers recover a minimum immutable attempt record',()=>{
 const h=harness([]);
 const restored={1:{selected:'A',correct:false,updatedAt:base,deleted:false}};
 const first=h.api.mergeConfirmedAttemptFallback([],restored,[],{},base+day);
 assert.equal(first.length,1);
 assert.equal(first[0].src,'Resposta confirmada restaurada');
 assert.equal(h.api.errorLedger(id,first).open,true);
 const repeat=h.api.mergeConfirmedAttemptFallback(first,restored,[],{},base+day);
 assert.equal(repeat.length,1,'recovery is idempotent');
 const updated={1:{selected:'B',correct:true,updatedAt:base+day,deleted:false}};
 const second=h.api.mergeConfirmedAttemptFallback(first,updated,[],{},base+2*day);
 assert.equal(second.length,2);
 assert.equal(h.api.errorLedger(id,second).recovered,true);
 const newerLocal=h.api.mergeConfirmedAttemptFallback(second,restored,[],{},base+3*day);
 assert.equal(newerLocal.length,2,'older restored state cannot regress recovered history');
});
test('legacy custom-question answer snapshot preserves pending wrong status after restore',()=>{
 const h=harness([]);
 const questions=[{id:'user-one',gabarito:'B',materia:'Direito',updatedAt:base}];
 const migrated=h.api.mergeConfirmedAttemptFallback([],{},questions,{'user-one':'A'},base+day);
 assert.equal(migrated.length,1);
 assert.equal(h.api.errorLedger('user-one',migrated).open,true);
 const again=h.api.mergeConfirmedAttemptFallback(migrated,{},questions,{'user-one':'A'},base+day);
 assert.equal(again.length,1);
 assert.equal(h.api.mergeConfirmedAttemptFallback([], {1:{selected:'A',correct:false,deleted:true}},[],{},base).length,0);
 assert.match(html,/mergeConfirmedAttemptFallback\(oldHistory,getAnswers\(\)/,'recovery is wired to boot reconciliation');
});
test('weekly error cohort keeps recovered questions and shows wrong/recovered counts',()=>{
 const data=[record(base,false,'A','q1'),record(base+day,true,'B','q1'),
   record(base+2*day,false,'A','q2')];
 const h=harness(data),questions=[
   {id:'q1',n:1,materia:'Direito',assunto:'Base'},{id:'q2',n:2,materia:'Direito',assunto:'Base'}
 ];
 const notebook=h.api.errorNotebookMarkup(questions,base+3*day);
 assert.ok(!notebook.includes('#/questao/q1'),'the pending notebook removes recovered questions');
 assert.ok(notebook.includes('#/questao/q2'),'the pending notebook retains unresolved questions');
 const home=h.api.errorNotebookMarkup(questions,base+3*day,true);
 assert.match(home,/Errou 2 · Recuperou 1/);
 assert.match(home,/Recuperada/);
});
test('topic priority combines catalog question incidence and weight with latest-answer coverage and accuracy',()=>{
 const all=Array.from({length:10},(_,i)=>({id:'q'+i,materia:i<2?'Conhecimentos Específicos':'Geral'}));
 const important=all.slice(0,2),lowExposure=all.slice(2,3),history=[record(base,false,'A','q0')];
 const h=harness(history),high=h.api.errorTopicMetrics(important,all,history);
 assert.equal(high.questionShare,.2);
 assert.equal(high.weightShare,5/13);
 assert.equal(high.coverage,.5);
 assert.equal(high.accuracy,0);
 assert.equal(high.priority,'Alta');
 const unstudied=h.api.errorTopicMetrics(lowExposure,all,[]);
 assert.equal(unstudied.priority,'Média');
 const mastered=h.api.errorTopicMetrics(lowExposure,all,[record(base,true,'B','q2')]);
 assert.equal(mastered.coverage,1);
 assert.equal(mastered.accuracy,1);
 assert.equal(mastered.score,0);
 assert.equal(mastered.priority,'Baixa');
});
test('topic accuracy uses latest confirmed attempt and UI explains its incidence-weight-coverage score',()=>{
 const item={id:'q1',materia:'Geral'},log=[record(base,false,'A'),record(base+day,true,'B')];
 const h=harness(log),metrics=h.api.errorTopicMetrics([item],[item],log);
 assert.equal(metrics.accuracy,1);
 assert.equal(metrics.priority,'Baixa');
 assert.match(html,/Incidência .*peso/);
 assert.match(html,/Cobertura/);
});

test('catalog exposure denominator spans the whole edital so subject weights affect equal-size topics',()=>{
 const all=[{id:'q1',materia:'Conhecimentos Específicos'},{id:'q2',materia:'Geral'}];
 const h=harness([]),specific=h.api.errorTopicMetrics([all[0]],all,[]),general=h.api.errorTopicMetrics([all[1]],all,[]);
 assert.equal(specific.questionShare,general.questionShare);
 assert.notEqual(specific.weightShare,general.weightShare);
 assert.ok(specific.score>general.score,'equal coverage and accuracy rank the higher-weight topic higher');
});
