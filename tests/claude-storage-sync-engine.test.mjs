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
});
