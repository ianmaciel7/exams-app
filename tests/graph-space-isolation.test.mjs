import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const html = readFileSync(new URL('../prototypes/exam-app-0.1.1/index.html', import.meta.url), 'utf8');

const section = (start, end) => {
  const i = html.indexOf(start);
  const j = html.indexOf(end, i + start.length);
  assert.ok(i >= 0 && j > i, 'source anchors: ' + start);
  return html.slice(i, j);
};

const graphSource = section('/* ---- grafo de objetos do espaço', '/* ---- estado das abas principais');
const panelSource = section('function vNode(v){', 'function bodyIa(v){');

function createHarness() {
  const trashSet = new Set();
  const storeData = {};
  const store = {
    get: k => storeData[k],
    set: (k, v) => { storeData[k] = v; }
  };

  const CONCURSOS = [
    { id: 'c-a', t: 'Concurso A', sp: 'space-a', orgao: 'Org A' },
    { id: 'c-b', t: 'Concurso B', sp: 'space-b', orgao: 'Org B' },
  ];
  const EDICOES = [
    { id: 'ed-a', t: 'Edição A', conc: 'c-a', ano: '2026', banca: 'Banca A' },
    { id: 'ed-b', t: 'Edição B', conc: 'c-b', ano: '2025', banca: 'Banca B' },
  ];
  const CARGOS = [
    { id: 'cg-a', t: 'Analista A', edicao: 'ed-a', resumo: 'TI' },
    { id: 'cg-b', t: 'Técnico B', edicao: 'ed-b', resumo: 'Adm' },
  ];
  const DOCS = [
    { id: 'doc-a', t: 'Edital A', sp: 'space-a', edicao: 'ed-a', cat: 'Edital', g: 'PDF', m: 'Edital Oficial' },
    { id: 'doc-b', t: 'Edital B', sp: 'space-b', edicao: 'ed-b', cat: 'Edital', g: 'PDF', m: 'Edital B' },
  ];
  const QUESTIONS = [
    { id: 'q-a', t: 'Questão A', n: 1, sp: 'space-a', conc: 'c-a', ed: 'ed-a', cg: 'cg-a', materia: 'Direito', banca: 'Banca A', enunciado: 'Enunciado A' },
    { id: 'q-b', t: 'Questão B', n: 2, sp: 'space-b', conc: 'c-b', ed: 'ed-b', cg: 'cg-b', materia: 'Português', banca: 'Banca B', enunciado: 'Enunciado B' },
  ];
  const ENTS = [
    { id: 'orgao-org-a', t: 'Org A', type: 'orgao' },
    { id: 'orgao-org-b', t: 'Org B', type: 'orgao' },
    { id: 'banca-banca-a', t: 'Banca A', type: 'banca' },
    { id: 'banca-banca-b', t: 'Banca B', type: 'banca' },
    { id: 'disc-direito', t: 'Direito', type: 'disciplina' },
    { id: 'disc-portugues', t: 'Português', type: 'disciplina' },
  ];

  let currentSpace = 'space-a';

  const context = {
    get space() { return currentSpace; },
    set space(v) { currentSpace = v; },
    CONCURSOS,
    CARGOS,
    store,
    trashSet,
    isT: id => trashSet.has(id),
    edicoesOf: sp => EDICOES.filter(e => (CONCURSOS.find(c => c.id === e.conc) || {}).sp === sp && !trashSet.has(e.id)),
    cargosOf: ed => CARGOS.filter(c => c.edicao === ed && !trashSet.has(c.id)),
    docsOf: sp => DOCS.filter(d => d.sp === sp && !trashSet.has(d.id)),
    qObjs: () => QUESTIONS.filter(q => !trashSet.has(q.id)),
    qTitle: q => q.t || ('Questão ' + q.n),
    findEnt: (type, name) => ENTS.find(e => e.type === type && e.t === name) || null,
    discEnt: m => ENTS.find(e => e.type === 'disciplina' && e.t === m) || null,
    concursoById: id => CONCURSOS.find(c => c.id === id) || null,
    edicaoById: id => EDICOES.find(e => e.id === id) || null,
    cargoById: id => CARGOS.find(c => c.id === id) || null,
    concOrgaoName: c => { const v = (store.get('ov') || {})['prop:concurso:' + c.id + '|Órgão']; return v !== undefined ? v : (c.orgao || ''); },
    edBancaName: e => { const v = (store.get('ov') || {})['prop:edicao:' + e.id + '|Banca']; return v !== undefined ? v : (e.banca || ''); },
    edOrgaoName: e => { const v = (store.get('ov') || {})['prop:edicao:' + e.id + '|Órgão']; return v !== undefined ? v : ((CONCURSOS.find(c => c.id === e.conc) || {}).orgao || ''); },
    kn: k => k,
    esc: s => String(s || ''),
    norm: s => String(s || '').toLowerCase(),
    KORD: ['concurso', 'edicao', 'cargo', 'pdf', 'questao', 'orgao', 'banca', 'disciplina'],
    WI: { search: '<svg search></svg>', graph: '<svg graph></svg>' },
    RT: { graf: { n: 'Gráfico', ic: '<svg>' }, back: { n: 'Backlinks', ic: '<svg>' }, rel: { n: 'Relacionados', ic: '<svg>' } },
    curHref: () => '#/concurso/' + (currentSpace === 'space-a' ? 'c-a' : 'c-b'),
    rpRow: (n, sub) => `<div class="rp-row">${n.title} (${sub || n.kind})</div>`,
    rpEmpty: (t, s, extra) => `<div class="rp-empty"><b>${t}</b>${s || ''}${extra || ''}</div>`,
    exChips: () => '',
    exRows: () => '',
    performance: { now: () => Date.now() },
    console: { warn: () => {} }
  };

  const code = [
    graphSource,
    panelSource,
    '({ G, gsig, gr, nodeOf, nbrs, ctxBar, bodyBack, bodyRel, bodyGraf, bodyObj, vNode: (v) => nodeOf(v.ref || curHref()) })'
  ].join('\n');

  const api = runInNewContext(code, context);
  return { api, context, trashSet, store, CONCURSOS, EDICOES, CARGOS, DOCS, QUESTIONS, ENTS };
}

test('Space A vs Space B graph isolation: entities from Space A never leak into Space B', () => {
  const h = createHarness();
  const graphA = h.api.G('space-a');
  const graphB = h.api.G('space-b');

  // Space A verification
  assert.ok(graphA.N.has('#/concurso/c-a'), 'Space A contains Concurso A');
  assert.ok(graphA.N.has('#/edicao/ed-a'), 'Space A contains Edição A');
  assert.ok(graphA.N.has('#/cargo/cg-a'), 'Space A contains Cargo A');
  assert.ok(graphA.N.has('#doc-a'), 'Space A contains Doc A');
  assert.ok(graphA.N.has('#/questao/q-a'), 'Space A contains Questão A');
  assert.ok(graphA.N.has('#/orgao/orgao-org-a'), 'Space A references Órgão A');
  assert.ok(graphA.N.has('#/banca/banca-banca-a'), 'Space A references Banca A');
  assert.ok(graphA.N.has('#/disciplina/disc-direito'), 'Space A references Disciplina Direito');

  // Space A must NOT contain Space B entities
  assert.ok(!graphA.N.has('#/concurso/c-b'), 'Space A must NOT contain Concurso B');
  assert.ok(!graphA.N.has('#/edicao/ed-b'), 'Space A must NOT contain Edição B');
  assert.ok(!graphA.N.has('#/cargo/cg-b'), 'Space A must NOT contain Cargo B');
  assert.ok(!graphA.N.has('#doc-b'), 'Space A must NOT contain Doc B');
  assert.ok(!graphA.N.has('#/questao/q-b'), 'Space A must NOT contain Questão B');
  assert.ok(!graphA.N.has('#/orgao/orgao-org-b'), 'Space A must NOT contain Órgão B');
  assert.ok(!graphA.N.has('#/banca/banca-banca-b'), 'Space A must NOT contain Banca B');
  assert.ok(!graphA.N.has('#/disciplina/disc-portugues'), 'Space A must NOT contain Disciplina Português');

  // Space B verification
  assert.ok(graphB.N.has('#/concurso/c-b'), 'Space B contains Concurso B');
  assert.ok(graphB.N.has('#/edicao/ed-b'), 'Space B contains Edição B');
  assert.ok(!graphB.N.has('#/concurso/c-a'), 'Space B must NOT contain Concurso A');
  assert.ok(!graphB.N.has('#/questao/q-a'), 'Space B must NOT contain Questão A');
});

test('Switching spaces immediately updates gr() without stale 400ms TTL', () => {
  const h = createHarness();
  h.context.space = 'space-a';
  const gA = h.api.gr();
  assert.equal(gA.space, 'space-a');
  assert.ok(gA.N.has('#/concurso/c-a'));
  assert.ok(!gA.N.has('#/concurso/c-b'));

  // Immediate switch to space-b
  h.context.space = 'space-b';
  const gB = h.api.gr();
  assert.equal(gB.space, 'space-b');
  assert.ok(gB.N.has('#/concurso/c-b'));
  assert.ok(!gB.N.has('#/concurso/c-a'));

  // Switch back to space-a restores clean graph A
  h.context.space = 'space-a';
  const gA2 = h.api.gr();
  assert.equal(gA2.space, 'space-a');
  assert.ok(gA2.N.has('#/concurso/c-a'));
  assert.ok(!gA2.N.has('#/concurso/c-b'));
});

test('Modifying relations or metadata immediately invalidates cache', () => {
  const h = createHarness();
  h.context.space = 'space-a';
  const g1 = h.api.gr();

  // If nothing changed, gr() returns cached reference
  const gCached = h.api.gr();
  assert.equal(g1, gCached, 'Cache returns same graph when unchanged');

  // Override banca for Edição A
  h.store.set('ov', { 'prop:edicao:ed-a|Banca': 'Nova Banca' });
  h.ENTS.push({ id: 'banca-nova-banca', t: 'Nova Banca', type: 'banca' });

  const g2 = h.api.gr();
  assert.notEqual(g1, g2, 'gr() recalculates immediately when override changes');
  assert.ok(g2.N.has('#/banca/banca-nova-banca'), 'New banca node is present in recalculated graph');
});

test('Deleting an entity removes it and avoids orphan edges', () => {
  const h = createHarness();
  h.context.space = 'space-a';
  const g1 = h.api.gr();
  assert.ok(g1.N.has('#/cargo/cg-a'));

  // Move cargo to trash
  h.trashSet.add('cg-a');
  const g2 = h.api.gr();
  assert.ok(!g2.N.has('#/cargo/cg-a'), 'Deleted cargo is removed from graph');

  // Verify that Edição A has no dangling link to the deleted cargo
  const edNode = g2.N.get('#/edicao/ed-a');
  assert.ok(edNode, 'Edição A still exists');
  assert.ok(!edNode.inn.some(([h]) => h === '#/cargo/cg-a'), 'No incoming link from deleted cargo');
  assert.ok(!edNode.out.some(([h]) => h === '#/cargo/cg-a'), 'No outgoing link to deleted cargo');
});

test('Foreign pinned reference across space switch displays explicit warning', () => {
  const h = createHarness();
  h.context.space = 'space-b'; // active space is B

  // View pinned to Concurso A (which belongs to space-a)
  const view = { id: 'tab-pinned', type: 'graf', ref: '#/concurso/c-a' };
  const node = h.api.nodeOf(view.ref);
  assert.equal(node, null, 'nodeOf must return null for foreign space object');

  // Check ctxBar
  const barHtml = h.api.ctxBar(view, node);
  assert.ok(barHtml.includes('Objeto de outro espaço'), 'Banner warns that object is from another space');
  assert.ok(barHtml.includes('data-unpin="tab-pinned"'), 'Banner offers unpin action');

  // Check bodyGraf, bodyBack, bodyRel
  const grafHtml = h.api.bodyGraf(view);
  assert.ok(grafHtml.includes('Objeto não pertence a este espaço'), 'bodyGraf indicates foreign space');
  assert.ok(grafHtml.includes('data-unpin="tab-pinned"'), 'bodyGraf provides unpin button');

  const backHtml = h.api.bodyBack(view);
  assert.ok(backHtml.includes('Objeto não pertence a este espaço'), 'bodyBack indicates foreign space');

  const relHtml = h.api.bodyRel(view);
  assert.ok(relHtml.includes('Objeto não pertence a este espaço'), 'bodyRel indicates foreign space');
});
