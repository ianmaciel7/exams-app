import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const html=readFileSync(new URL('../prototype/exam-app-0.1.1__index.html',import.meta.url),'utf8');
const between=(a,b)=>{const i=html.indexOf(a),j=html.indexOf(b,i+a.length);assert.ok(i>=0&&j>i,a);return html.slice(i,j);};
const source=between('const srsKey=()=>','/* Frequency tuning acts')+'\n'+
  between('function srsCreateCard(', 'function srsCreateFromQuestionHighlight(');
function harness(){
  const storage=new Map(),clock=Date.UTC(2026,10,16,12);
  const env={
    space:'current',Date,Math,
    store:{get:k=>storage.get(k)||null,set:(k,v)=>storage.set(k,structuredClone(v))},
    esc:s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;'),
    srsRecordActivity:()=>{}
  };
  const api=runInNewContext(source+'\n({srsCreateCard,srsLoad,srsSave,srsEditCard,srsOriginalContent,srsEffectiveContent,srsSpeakText,srsCardMarkup})',env);
  return {api,storage,clock};
}
test('editing QA highlight saves a separate copy and note without corrupting original or scheduling',()=>{
  const h=harness(),original='O prazo legal é 5 dias úteis.';
  const card=h.api.srsCreateCard('qa','','Qual é o prazo?',original,'Direito',h.clock,
    {kind:'question-highlight',id:'q1:0-30',label:'Grifo da questão',ref:'#/questao/q1'});
  const snapshot=structuredClone(card),modified='O prazo é 5 dias úteis, contados após ciência.';
  assert.equal(card.originalText,original);
  assert.ok(h.api.srsEditCard(card.id,modified,'Art. 23 · Memorizar'));
  const saved=h.api.srsLoad().cards[0];
  assert.equal(saved.originalText,original);
  assert.equal(saved.answer,original);
  assert.equal(saved.editedText,modified);
  assert.equal(saved.note,'Art. 23 · Memorizar');
  assert.equal(saved.dueAt,snapshot.dueAt,'no scheduling changes on edit');
  assert.equal(saved.sourceRef,snapshot.sourceRef);
  assert.equal(h.api.srsEffectiveContent(saved),modified);
  assert.equal(h.api.srsOriginalContent(saved),original);
  const rendered=h.api.srsCardMarkup(saved,true);
  assert.match(rendered,/Art\. 23 · Memorizar/);
  assert.match(rendered,/contados após ciência/);
});
test('editing a QA answer remains private in speech until reveal',()=>{
  const h=harness(),card=h.api.srsCreateCard('qa','','Qual a resposta?','Original','',h.clock);
  h.api.srsEditCard(card.id,'Texto editado','Nota secreta');
  const saved=h.api.srsLoad().cards[0];
  const before=h.api.srsSpeakText(saved,false),after=h.api.srsSpeakText(saved,true);
  assert.equal(before,'Qual a resposta?');
  assert.equal(after,'Qual a resposta? Texto editado');
  assert.doesNotMatch(h.api.srsCardMarkup(saved,false),/Nota secreta/);
  assert.match(h.api.srsCardMarkup(saved,true),/Nota secreta/);
});
test('cloze edits keep the omission and original immutable, reject malformed deletion',()=>{
  const h=harness(),card=h.api.srsCreateCard('cloze','O prazo é {{c1::5 dias}}.','Prazo?', '', 'Direito',h.clock);
  assert.equal(card.originalText,'O prazo é 5 dias.');
  assert.equal(h.api.srsEditCard(card.id,'Texto sem cloze','Nota'),null);
  assert.equal(h.api.srsLoad().cards[0].note,undefined,'invalid edits cannot save partial data');
  const edited='O prazo continua {{c1::5 dias úteis}}.';
  assert.ok(h.api.srsEditCard(card.id,edited,'Mnemônico'));
  const c=h.api.srsLoad().cards[0];
  assert.equal(c.text,'O prazo é {{c1::5 dias}}.');
  assert.equal(c.originalText,'O prazo é 5 dias.');
  assert.match(h.api.srsCardMarkup(c,false),/_____ \(3 words\)/);
  assert.doesNotMatch(h.api.srsSpeakText(c,false),/5 dias úteis/);
  assert.match(h.api.srsSpeakText(c,true),/5 dias úteis/);
});
test('restoring base answer removes edited overlay but preserves optional note',()=>{
  const h=harness(),c=h.api.srsCreateCard('qa','','Pergunta','Original','',h.clock);
  h.api.srsEditCard(c.id,'Alterado','Uma nota');
  h.api.srsEditCard(c.id,'Original','');
  const v=h.api.srsLoad().cards[0];
  assert.equal(v.editedText,undefined);
  assert.equal(v.note,'');
  assert.equal(v.originalText,'Original');
});
test('legacy cards obtain originalText before any edit, unsafe notes and answers are escaped',()=>{
  const h=harness(),card={id:'legacy',kind:'qa',question:'Enunciado',answer:'Texto histórico',dueAt:h.clock};
  h.api.srsSave({cards:[card]});
  h.api.srsEditCard('legacy','<img src=x onerror=alert(1)>','<script>alert(1)</script>');
  const c=h.api.srsLoad().cards[0],ui=h.api.srsCardMarkup(c,true);
  assert.equal(c.originalText,'Texto histórico');
  assert.equal(c.answer,'Texto histórico');
  assert.match(ui,/&lt;img/);
  assert.match(ui,/&lt;script&gt;/);
  assert.doesNotMatch(ui,/<script>|<img/);
});
test('editing dialog is properly wired to multiline textarea, read-only original and cancel',()=>{
  assert.match(html,/f\.type==='textarea'/);
  assert.match(html,/readonly aria-readonly="true"/);
  assert.match(html,/input,select,textarea,button:not\(\[disabled\]\)/);
  assert.match(html,/const edit=e\.target\.closest\('\[data-srs-edit\]'\)/);
  assert.match(html,/title:'Editar destaque e nota'/);
  assert.match(html,/\.then\(value=>\{if\(value&&srsEditCard/);
});
