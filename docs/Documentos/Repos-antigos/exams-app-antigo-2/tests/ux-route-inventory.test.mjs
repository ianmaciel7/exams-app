import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../prototype/exam-app-0.1.1__index.html', import.meta.url), 'utf8');
const guide = readFileSync(new URL('../prototype/arquitetura-informacao-navegacao.md', import.meta.url), 'utf8');

test('current route inventory is grounded in actual dispatch logic', () => {
  const active = [
    "'/questoes'", "'/simulado'", "'/simulado/exec'", "'/simulado/resultado'",
    "'/espaco'", "'/revisao'", "'/tipo/'", "'/concurso/'", "'/questao/'",
  ];
  for (const literal of active) assert.ok(source.includes(literal), 'missing route ' + literal);
  assert.match(source, /if\(h0\.startsWith\('\/questoes'\)\|\|h0==='\/simulado'\)\{ showStudyRoute\(h0\); return; \}/);
  assert.match(source, /if\(h0==='\/revisao'\)\{ showReview\(\); return; \}/);
  assert.doesNotMatch(source, /if\(h0==='\/revisao'\)\{ location\.replace\('#\/questoes\/erradas'\); return; \}/);
});

test('guide distinguishes implemented navigation from future contracts', () => {
  for (const label of ['Status', 'Implementado (I)', 'Parcial (P)', 'Proposto (R)', 'Benchmark (B)']) {
    assert.ok(guide.includes(label), 'missing status boundary: ' + label);
  }
  for (const route of [
    '#/espaco', '#/questoes', '#/simulado', '#/questoes/erradas', '#/simulado/exec',
    '#/simulado/resultado', '#/tipo/questao', '#/questao/:id', '#/revisao',
  ]) {
    assert.ok(guide.includes(route), 'route not documented: ' + route);
  }
  assert.match(guide, /#\/questoes\?status=erradas.*R, não implementado/);
});

test('guide covers decisions, empirical validation, and issue boundaries', () => {
  for (const label of [
    'Matriz de escolha', 'Página única contínua', 'Múltiplas páginas/rotas',
    'Accordion/details', 'Popover', 'Drawer', 'Painel contextual', 'Wizard/etapas',
    'Teste de árvore', 'primeiro clique', 'Teste moderado', 'WCAG 2.2',
    '#100', '#70', '#75', '#69', '#21', 'SHA inicial', 'SHA final',
  ]) {
    assert.ok(guide.includes(label), 'missing acceptance artifact: ' + label);
  }
});


test('SRS cards persist, reveal, grade, isolate spaces, and apply theme/recency settings', () => {
  const begin = source.indexOf('/* ---- Daily Review / spaced repetition (#82) ---- */');
  const end = source.indexOf('function showReview()', begin);
  assert.ok(begin >= 0 && end > begin, 'SRS helpers are present');
  const values = new Map();
  const storage = {
    get(key) { return JSON.parse(values.get('leitor:' + key) || 'null'); },
    set(key, value) { values.set('leitor:' + key, JSON.stringify(value)); },
  };
  const context = { store: storage, space: 'alpha', esc: value => String(value).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])) };
  runInNewContext(source.slice(begin, end), context);
  const srs = runInNewContext('({ setSpace(v){space=v}, load:srsLoad, save:srsSave, create:srsCreateCard, grade:srsGradeCard, due:srsDueCards, markup:srsCardMarkup, speak:srsSpeakText })', context);

  const qa = srs.create('qa', '', 'What is the answer?', 'Stored answer', 'Constitutional', 1000);
  const afterReload = srs.load();
  assert.equal(afterReload.cards.length, 1);
  assert.match(srs.markup(afterReload.cards[0], false), /Revelar resposta/);
  assert.doesNotMatch(srs.markup(afterReload.cards[0], false), /Stored answer/);
  assert.match(srs.markup(afterReload.cards[0], true), /Stored answer/);
  assert.doesNotMatch(srs.speak(afterReload.cards[0]), /Stored answer/);
  assert.match(srs.speak(afterReload.cards[0], true), /Stored answer/);
  const cloze = srs.create('cloze', 'The {{c1::quorum}} must be met.', '', '', 'Cloze', 1050);
  assert.match(srs.speak(cloze), /lacuna/);
  assert.match(srs.speak(cloze, true), /quorum/);

  srs.grade(qa.id, 'soon', 1000);
  assert.equal(srs.due(1001).length, 0);
  assert.equal(srs.load().cards[0].dueAt, 1000 + 2 * 86400000);
  srs.setSpace('beta');
  assert.equal((srs.load().cards || []).length, 0);
  srs.create('qa', '', 'Other space?', 'Other answer', 'History', 1000);
  assert.equal(srs.load().cards.length, 1);
  srs.setSpace('alpha');
  assert.equal(srs.load().cards.length, 2);

  srs.create('qa', '', 'Older card?', 'Old', 'Constitutional', 2000);
  srs.create('qa', '', 'Other topic?', 'Topic', 'History', 3000);
  const settings = srs.load();
  settings.theme = 'Constitutional';
  settings.recency = 0;
  settings.goal = 10;
  srs.save(settings);
  const filtered = srs.due(3000000000);
  assert.deepEqual(Array.from(filtered, card => card.question), ['What is the answer?', 'Older card?']);
  const mastered = srs.grade(qa.id, 'never', 4000);
  assert.equal(mastered.mastered, true);
  assert.equal(srs.load().done, 2);
});

test('saved question highlights are imported into SRS with provenance and no duplicates', () => {
  const begin=source.indexOf('/* ---- Daily Review / spaced repetition (#82) ---- */');
  const end=source.indexOf('function showReview()',begin);
  const saved=new Map();
  const data={get:k=>saved.get(k)||null,set:(k,v)=>saved.set(k,structuredClone(v))};
  const env={store:data,space:'alpha',esc:s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])),
    qDockRanges:(id,part)=>id==='q42'&&part==='statement'?[{start:10,end:20}]:[]};
  runInNewContext(source.slice(begin,end),env);
  const api=runInNewContext('({from:srsCreateFromQuestionHighlight,load:srsLoad,create:srsCreateCard,day:srsLocalDay})',env);
  const q={id:'q42',n:42,enunciado:'Um trecho correto pode virar cartão de estudo.',materia:'Direito'};
  const first=api.from(q);
  assert.ok(first,'first saved statement highlight creates a card');
  assert.equal(first.answer,q.enunciado.slice(10,20));
  assert.equal(first.sourceKind,'question-highlight');
  assert.equal(first.sourceRef,'#/questao/q42');
  assert.equal(first.theme,'Direito');
  const second=api.from(q);
  assert.equal(second.id,first.id,'repeated import reuses one active linked card');
  assert.equal(api.load().cards.length,1,'stored card count is stable after duplicate selection');
  const comment=api.create('qa','','Explique a questão','Comentário validado','Direito',1000,
    {label:'Comentário de questão',ref:'#/questao/q42',kind:'question-comment',id:'q42'});
  assert.equal(comment.sourceKind,'question-comment');
  assert.equal(api.load().cards.length,2);
  assert.ok(!api.from({id:'q99',n:99,enunciado:'Sem grifos'}));
  assert.match(source,/data-q-dock-srs/,'user can directly import selected highlights');
  assert.match(source,/data-qped-srs-comment/,'commentary export is available after confirmation');
});
test('recency slider displays persisted zero and daily reset follows local day',()=>{
  assert.ok(source.includes('(d.recency===undefined?50:d.recency)'), 'zero is not treated as a falsy fallback');
  assert.match(source,/d\.doneDay===srsLocalDay\(\)/);
});

test('SRS merge preserves recovered-attempt ledger, contextual tabs and both evidence sections',()=>{
  assert.ok(source.includes('mergeConfirmedAttemptFallback'),'issue 76 remote recovery ledger must survive');
  assert.ok(source.includes('Alt+Shift+ArrowRight'),'issue 139 browser-safe shortcut must survive');
  assert.ok(source.includes('data-q-dock-srs'),'SRS import must survive');
  const board=JSON.parse(readFileSync(new URL('../prototype/board.json',import.meta.url),'utf8'));
  const titles=Object.values(board.elements).filter(e=>e.type==='container').map(e=>e.text||'');
  assert.ok(titles.some(s=>s.includes('50. Recuperação estrita')),'issue 76 evidence remains in board');
  assert.ok(titles.some(s=>s.includes('51. Revisão diária')),'issue 82 evidence is in the board');
  const refs=Object.values(board.elements).filter(e=>e.type==='image').map(e=>e.src||'');
  assert.ok(refs.some(s=>s.includes('issue76_'))&&refs.some(s=>s.includes('issue82_')),'screenshots of both issues preserved');
});
