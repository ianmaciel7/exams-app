import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const html=readFileSync(new URL('../prototype/exam-app-0.1.1__index.html',import.meta.url),'utf8');
const start=html.indexOf('const srsKey=()=>'),end=html.indexOf('function srsActivityDays(',start);
assert.ok(start>=0&&end>start,'SRS queue and tuning functions are present');
const code=html.slice(start,end);
function harness(questions=[],history=[]){
 let space='current';const saved=new Map();
 const store={get:key=>saved.get(key)||null,set:(key,val)=>saved.set(key,structuredClone(val))};
 const env={store,get space(){return space;},set space(v){space=v;},qObjs:()=>questions,histAll:()=>history,
   esc:s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;'),
   Math,Date};
 const api=runInNewContext(code+'\n({srsLoad,srsSave,srsCreateCard,srsDueCards,srsCardTuning,srsTuneKey,srsTunePreference,srsTuningMarkup,srsThemeSuggestion})',env);
 const setSpace=v=>{env.space=v;};
 return {api,store,saved,setSpace};
}
const date=Date.UTC(2026,10,16,12);

test('0% silences a discipline without discarding it, unmute restores the due card',()=>{
 const h=harness();
 h.api.srsCreateCard('qa','','Constitucional?','Sim','Direito',date);
 const ref=h.api.srsCreateCard('qa','','Redes?','TCP','Redes',date+100);
 const key=h.api.srsTuneKey('theme','Direito');
 const d=h.api.srsLoad();d.tuning={[key]:0};h.api.srsSave(d);
 const due=Array.from(h.api.srsDueCards(date+1000),x=>x.question);
 assert.deepEqual(due,['Redes?']);
 assert.equal(h.api.srsLoad().cards.length,2,'silenced card remains stored');
 assert.equal(h.api.srsLoad().cards[0].discarded,undefined);
 d.tuning[key]=50;h.api.srsSave(d);
 assert.equal(h.api.srsDueCards(date+1000).length,2,'restored without rewriting dueAt');
 assert.equal(ref.source,'Texto inserido manualmente');
});

test('priority 100 sorts due card ahead of neutral; 25 sorts behind even with recency biased',()=>{
 const h=harness();
 h.api.srsCreateCard('qa','','Direito?','Resposta','Direito',date);
 h.api.srsCreateCard('qa','','Redes?','Resposta','Redes',date+100);
 const d=h.api.srsLoad(),key=h.api.srsTuneKey('theme','Direito');
 d.recency=100;d.tuning={[key]:100};h.api.srsSave(d);
 assert.equal(h.api.srsDueCards(date+500)[0].question,'Direito?','priority overcomes recency');
 d.tuning[key]=25;h.api.srsSave(d);
 assert.equal(h.api.srsDueCards(date+500)[0].question,'Redes?','reduced source loses priority');
});

test('source mute and discipline mute both apply to a linked card',()=>{
 const h=harness();
 const a=h.api.srsCreateCard('qa','','Artigo','Texto','Direito',date,{
    kind:'pdf-highlight',id:'page-10',label:'PDF Lei 8112',ref:'#/pdf/lei8112'
 });
 h.api.srsCreateCard('qa','','Outro','Texto','Direito',date+1);
 const d=h.api.srsLoad();
 d.tuning={[h.api.srsTuneKey('source',a.sourceRef)]:0};h.api.srsSave(d);
 assert.deepEqual(Array.from(h.api.srsDueCards(date+500),x=>x.question),['Outro']);
 assert.equal(h.api.srsDueCards(date+500).find(x=>x.id===a.id),undefined);
 d.tuning={[h.api.srsTuneKey('theme','Direito')]:0};h.api.srsSave(d);
 assert.equal(h.api.srsDueCards(date+500).length,0,'theme also silences source');
 assert.equal(h.api.srsLoad().cards.length,2);
});

test('latest confirmed answers produce justified hints without automated writes',()=>{
 const qs=Array.from({length:4},(_,i)=>({id:'q'+i,materia:'Direito'}));
 const hist=qs.map((q,i)=>({q:q.id,t:date+i,a:'A',ok:i===0}));
 const h=harness(qs,hist);
 const r=h.api.srsThemeSuggestion('Direito');
 assert.equal(r.attempted,4);
 assert.equal(r.accuracy,25);
 assert.equal(r.priority,75);
 assert.match(r.label,/25% de acertos em 4 questões/);
 const high=h.api.srsThemeSuggestion('Direito',hist.map(x=>({...x,ok:true})),qs);
 assert.equal(high.priority,25);
 const missing=h.api.srsThemeSuggestion('Redes');
 assert.equal(missing.priority,50);
 assert.equal(missing.accuracy,null);
 assert.equal(h.api.srsLoad().tuning,undefined,'suggestions never change user preferences');
});

test('tuning HTML exposes persisted source and discipline sliders with safe labels',()=>{
 const h=harness();
 const a=h.api.srsCreateCard('qa','','Qual lei?','Lei 8.112','Direito',date,{
   kind:'pdf-highlight',id:'s1',label:'Lei',ref:'#/pdf/lei-8112'
 });
 const d=h.api.srsLoad();d.tuning={[h.api.srsTuneKey('source',a.sourceRef)]:75};h.api.srsSave(d);
 const markup=h.api.srsTuningMarkup(h.api.srsLoad());
 assert.match(markup,/id="srs-tuning"/);
 assert.match(markup,/Disciplina: Direito/);
 assert.match(markup,/Fonte: #\/pdf\/lei-8112/);
 assert.equal((markup.match(/data-srs-tune="/g)||[]).length,2);
 assert.match(markup,/value="75" data-srs-tune="source:#\/pdf\/lei-8112"/);
 assert.match(markup,/0% silencia a fonte sem excluir cartões/);
});

test('different spaces retain independent frequency tuning',()=>{
 const h=harness();
 h.api.srsCreateCard('qa','','Direito','A','Direito',date);
 const first=h.api.srsLoad();first.tuning={[h.api.srsTuneKey('theme','Direito')]:0};h.api.srsSave(first);
 h.setSpace('other');
 h.api.srsCreateCard('qa','','Direito','B','Direito',date);
 assert.equal(h.api.srsDueCards(date+100).length,1);
 h.setSpace('current');
 assert.equal(h.api.srsDueCards(date+100).length,0);
});
