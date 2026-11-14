import test from 'node:test';
import assert from 'node:assert/strict';
import { ClaudeStorageSyncEngine } from '../prototypes/exam-app-0.1.1/js/claude-storage-sync.js';

// Polyfill minimalista de localStorage em memoria para Node.js
class MockLocalStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }
  setItem(key, value) {
    this.store.set(key, String(value));
  }
  removeItem(key) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

globalThis.localStorage = new MockLocalStorage();

test('Suite de Testes do ClaudeStorageSyncEngine (Offline-First & Concurrency)', async (t) => {
  t.beforeEach(() => {
    globalThis.localStorage.clear();
  });

  await t.test('1. Fila de Saida Persistente (Outbox) com ID Unico e Versao de Operacao', () => {
    const engine = new ClaudeStorageSyncEngine({ slug: 'test-slug' });
    const op1 = engine.enqueue('exam_app_study', 'doc1', { a: 1 });
    const op2 = engine.enqueue('exam_app_study', 'doc2', { b: 2 });

    const queue = engine.getOutbox();
    assert.equal(queue.length, 2);
    assert.equal(queue[0].opId, op1);
    assert.equal(queue[1].opId, op2);
    assert.equal(queue[0].status, 'pending');
    assert.equal(queue[0].opVersion, 1);
    engine.destroy();
  });

  await t.test('2. Preservacao de Alteracoes Inseridas Durante Envio em Voo (In-Flight Race Condition)', async () => {
    const engine = new ClaudeStorageSyncEngine({ slug: 'test-slug' });

    // Mock do envio remoto com latencia artificial
    let remoteCallCount = 0;
    engine.sendToRemote = async (col, doc, data) => {
      remoteCallCount++;
      // Simula tempo de rede de 50ms
      await new Promise(r => setTimeout(r, 50));
      return { ok: true };
    };

    // 1. Enfileira item A
    engine.enqueue('exam_app_study', 'docA', { score: 10 });

    // 2. Dispara flush manual
    const flushPromise = engine.flushOutbox();

    // 3. Durante o envio em voo (in-flight), usuario responde outra questao (item B)
    await new Promise(r => setTimeout(r, 10));
    engine.enqueue('exam_app_study', 'docB', { score: 20 });

    // Aguarda termino do primeiro flush
    await flushPromise;

    // Item A foi confirmado e removido, mas Item B DEVE ter sido preservado intacto na fila!
    const outboxAfterFirstFlush = engine.getOutbox();
    assert.equal(outboxAfterFirstFlush.length, 1, 'Item B deve estar preservado no outbox');
    assert.equal(outboxAfterFirstFlush[0].docId, 'docB');
    assert.deepEqual(outboxAfterFirstFlush[0].data, { score: 20 });

    // 4. Executa segundo flush para o item B
    await engine.flushOutbox();
    assert.equal(engine.getOutbox().length, 0, 'Outbox deve estar completamente vazio apos descarregar item B');
    assert.equal(remoteCallCount, 2, 'Dois envios remotos independentes devem ter ocorrido');

    engine.destroy();
  });

  await t.test('3. Reconciliação Deterministica LWW por Questão com Suporte a Tombstones e Versao', () => {
    const engine = new ClaudeStorageSyncEngine({ slug: 'test-slug' });

    // Caso 1: Versao superior vence independente do relogio
    const local1 = { '1': { selected: 'A', version: 1, updatedAt: 1000 } };
    const remote1 = { '1': { selected: 'B', version: 2, updatedAt: 900 } };
    const res1 = engine.reconcileAnswers(local1, remote1);
    assert.equal(res1['1'].selected, 'B');

    // Caso 2: Em empate de versao, timestamp superior vence
    const local2 = { '2': { selected: 'C', version: 1, updatedAt: 2000 } };
    const remote2 = { '2': { selected: 'D', version: 1, updatedAt: 1500 } };
    const res2 = engine.reconcileAnswers(local2, remote2);
    assert.equal(res2['2'].selected, 'C');

    // Caso 3: Tombstone (exclusao recente de resposta) vence versao anterior e nao e ressuscitada
    const localDeleted = {
      '3': { selected: null, correct: null, deleted: true, version: 2, updatedAt: 3000 }
    };
    const remoteOld = {
      '3': { selected: 'A', correct: true, deleted: false, version: 1, updatedAt: 1000 }
    };
    const res3 = engine.reconcileAnswers(localDeleted, remoteOld);
    assert.equal(res3['3'].deleted, true, 'Tombstone deve prevalecer sobre resposta antiga');
    assert.equal(res3['3'].selected, null);

    // Caso 4: Se o usuario responder novamente apos a exclusao (versao/timestamp maior), a nova resposta vence
    const localNewAnswer = {
      '3': { selected: 'E', correct: true, deleted: false, version: 3, updatedAt: 4000 }
    };
    const res4 = engine.reconcileAnswers(localNewAnswer, res3);
    assert.equal(res4['3'].selected, 'E');
    assert.equal(res4['3'].deleted, false);

    engine.destroy();
  });

  await t.test('4. Retenção de Fila em Caso de Falha de Conexão e Estado de Erro sem Perda de Dados', async () => {
    const engine = new ClaudeStorageSyncEngine({ slug: 'test-slug' });

    // Simula falha persistente de rede
    engine.sendToRemote = async () => {
      throw new Error('ECONNREFUSED - Proxy fora do ar');
    };

    engine.enqueue('exam_app_study', 'doc_fail', { important: 'data' });

    let reportedState = null;
    engine.onStatusChange(({ state }) => {
      reportedState = state;
    });

    await engine.flushOutbox();

    // A fila nao pode ter sido descartada silenciosamente
    const outbox = engine.getOutbox();
    assert.equal(outbox.length, 1);
    assert.equal(outbox[0].docId, 'doc_fail');
    assert.equal(outbox[0].attempts, 1);
    assert.ok(outbox[0].lastError.includes('ECONNREFUSED'));
    assert.equal(reportedState, 'pending');

    // Forca atingir o limite maximo de tentativas
    for (let i = 0; i < 5; i++) {
      await engine.flushOutbox();
    }

    const outboxMax = engine.getOutbox();
    assert.equal(outboxMax[0].status, 'failed');
    assert.equal(reportedState, 'error', 'Status deve ser de erro apos esgotar tentativas sem descarte de dados');

    engine.destroy();
  });

  await t.test('5. Recuperacao de Fila Apos Reinicializacao do Navegador / Recarregamento da Pagina', () => {
    // 1. Primeira sessao adiciona item e sofre crash/close no meio
    const engine1 = new ClaudeStorageSyncEngine({ slug: 'test-slug' });
    engine1.enqueue('exam_app_study', 'crash_doc', { state: 'saved_before_reload' });
    engine1.destroy();

    // 2. Segunda sessao inicializa com os mesmos dados em localStorage
    const engine2 = new ClaudeStorageSyncEngine({ slug: 'test-slug' });
    const recovered = engine2.getOutbox();

    assert.equal(recovered.length, 1);
    assert.equal(recovered[0].docId, 'crash_doc');
    assert.deepEqual(recovered[0].data, { state: 'saved_before_reload' });

    engine2.destroy();
  });

  await t.test('5b. Falha ao ler documento composto retém a mutação sem sobrescrita cega', async () => {
    const engine = new ClaudeStorageSyncEngine({ slug: 'test-slug' });
    let sent = false;
    engine.fetchRemote = async () => { throw new Error('leitura indisponível'); };
    engine.sendToRemote = async () => { sent = true; };
    engine.enqueue('exam_app_study', 'user_answers', { answers: { '1': { selected: 'A' } } });
    await engine.flushOutbox();
    const [queued] = engine.getOutbox();
    assert.equal(sent, false, 'não deve gravar sem leitura/mesclagem remota');
    assert.equal(queued.status, 'pending');
    assert.match(queued.lastError, /Leitura remota obrigatória/);
    engine.destroy();
  });

  await t.test('6. Reconciliacao de Simulados (reconcileExam) com Fusao de Respostas e Marcadas', () => {
    const engine = new ClaudeStorageSyncEngine({ slug: 'test-slug' });

    const localExam = {
      started: 1000,
      updatedAt: 1200,
      index: 5,
      answers: { '1': 'A', '2': 'B' },
      marked: [2],
      finished: null
    };

    const remoteExam = {
      started: 1000,
      updatedAt: 1500,
      index: 8,
      answers: { '2': 'C', '3': 'D' },
      marked: [3],
      finished: null
    };

    const merged = engine.reconcileExam(localExam, remoteExam);
    assert.equal(merged.answers['1'], 'A', 'Resposta 1 preservada da sessao local');
    assert.equal(merged.answers['2'], 'C', 'Resposta 2 atualizada pela versao remota mais recente');
    assert.equal(merged.answers['3'], 'D', 'Resposta 3 integrada da sessao remota');
    assert.deepEqual(merged.marked.sort(), [2, 3], 'Marcadas devem ser a uniao deterministica');
    assert.equal(merged.index, 8, 'Indice do mais recente deve ser adotado');

    engine.destroy();
  });

  await t.test('7. Reconciliacao de Cadernos (reconcileCadernos) com Tombstones e Uniao de Questoes', () => {
    const engine = new ClaudeStorageSyncEngine({ slug: 'test-slug' });

    const localCadernos = [
      { id: 'c1', name: 'Direito Const', questionIds: ['10', '11'], updatedAt: 1000, deleted: false },
      { id: 'c2', name: 'Informatica', questionIds: ['20'], updatedAt: 2000, deleted: true } // tombstone
    ];

    const remoteCadernos = [
      { id: 'c1', name: 'Direito Const Atualizado', questionIds: ['11', '12'], updatedAt: 1500, deleted: false },
      { id: 'c2', name: 'Informatica Antigo', questionIds: ['20'], updatedAt: 1000, deleted: false },
      { id: 'c3', name: 'Raciocinio Logico', questionIds: ['30'], updatedAt: 1200, deleted: false }
    ];

    const merged = engine.reconcileCadernos(localCadernos, remoteCadernos);
    assert.equal(merged.length, 2, 'c2 deve ter sido removido pelo tombstone local mais recente');

    const c1 = merged.find(c => c.id === 'c1');
    assert.equal(c1.name, 'Direito Const Atualizado');
    assert.deepEqual(c1.questionIds.sort(), ['10', '11', '12'], 'Questoes devem ser a uniao');

    const c3 = merged.find(c => c.id === 'c3');
    assert.ok(c3, 'Caderno c3 remoto deve ser incluido');

    engine.destroy();
  });

  await t.test('8. Reconciliacao de Espacos (reconcileSpaces) e Ordem de Sidebar', () => {
    const engine = new ClaudeStorageSyncEngine({ slug: 'test-slug' });

    const localSpaces = [
      { id: 'sp1', name: 'Concurso BB', icon: 'bank', updatedAt: 1000 }
    ];
    const remoteSpaces = [
      { id: 'sp1', name: 'Concurso Banco do Brasil', icon: 'bank', updatedAt: 2000 },
      { id: 'sp2', name: 'INSS 2026', icon: 'file', updatedAt: 1500 }
    ];

    const { spaces, spaceOrder } = engine.reconcileSpaces(localSpaces, remoteSpaces, ['sp1'], ['dataprev', 'sp1', 'sp2']);
    assert.equal(spaces.length, 2);
    const sp1 = spaces.find(s => s.id === 'sp1');
    assert.equal(sp1.name, 'Concurso Banco do Brasil');
    assert.ok(spaceOrder.includes('dataprev'));
    assert.ok(spaceOrder.includes('sp1'));
    assert.ok(spaceOrder.includes('sp2'));

    engine.destroy();
  });

  await t.test('9. Reconciliacao de Workspaces (reconcileWorkspace) sem Fechamento Inadvertido de Abas', () => {
    const engine = new ClaudeStorageSyncEngine({ slug: 'test-slug' });

    const localWs = {
      active: 'tab_local',
      tabs: [{ id: 'tab1', hist: ['#/concurso'], i: 0 }, { id: 'tab_local', hist: ['#/simulado'], i: 0 }],
      updatedAt: 2000
    };
    const remoteWs = {
      active: 'tab_remote',
      tabs: [{ id: 'tab1', hist: ['#/concurso'], i: 0 }, { id: 'tab_remote', hist: ['#/cadernos'], i: 0 }],
      updatedAt: 1000
    };

    const merged = engine.reconcileWorkspace(localWs, remoteWs);
    assert.equal(merged.tabs.length, 3, 'Todas as 3 abas abertas devem ser preservadas');
    assert.equal(merged.active, 'tab_local', 'Aba ativa do workspace mais recente deve prevalecer');

    engine.destroy();
  });

  await t.test('10. Reconciliacao de Questoes Avulsas e Respostas (reconcileUserQuestions)', () => {
    const engine = new ClaudeStorageSyncEngine({ slug: 'test-slug' });

    const localUq = [{ id: 'u1', enunciado: 'Q1 local', updatedAt: 1000 }];
    const remoteUq = [{ id: 'u1', enunciado: 'Q1 editada remota', updatedAt: 2000 }, { id: 'u2', enunciado: 'Q2 remota', updatedAt: 1500 }];
    const localAns = { 'u1': 'A' };
    const remoteAns = { 'u2': 'C' };

    const merged = engine.reconcileUserQuestions(localUq, remoteUq, localAns, remoteAns);
    assert.equal(merged.uq.length, 2);
    const u1 = merged.uq.find(q => q.id === 'u1');
    assert.equal(u1.enunciado, 'Q1 editada remota');
    assert.equal(merged.uqAns['u1'], 'A');
    assert.equal(merged.uqAns['u2'], 'C');

    engine.destroy();
  });

  await t.test('11. Recuperacao Completa Multi-Categoria (recoverAllRemote)', async () => {
    const engine = new ClaudeStorageSyncEngine({ slug: 'test-slug' });

    engine.fetchRemote = async (col, doc) => {
      if (col === 'exam_app_study' && doc === 'user_answers') return { answers: { '1': { selected: 'B' } } };
      if (col === 'exam_app_study' && doc === 'exam_state') return { exam: { index: 3 } };
      if (col === 'exam_app_study' && doc === 'cadernos') return { cadernos: [{ id: 'c1' }] };
      if (col === 'exam_app_spaces' && doc === 'spaces_list') return { spaces: [{ id: 'sp1' }] };
      if (col === 'exam_app_state' && doc === 'workspace_state') return { tabs: [{ id: 't1' }] };
      if (col === 'exam_app_study' && doc === 'user_questions') return { uq: [{ id: 'u1' }], uqAns: { 'u1': 'A' } };
      return null;
    };

    const res = await engine.recoverAllRemote();
    assert.ok(res.answers);
    assert.ok(res.exam);
    assert.ok(res.cadernos);
    assert.ok(res.spaces);
    assert.ok(res.workspace);
    assert.ok(res.userQuestions);

    engine.destroy();
  });
});
