import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import '../prototypes/exam-app-0.1.1/js/claude-storage-sync.js';

// Mock de localStorage para ambiente Node.js
class LocalStorageMock {
  constructor() { this.store = new Map(); }
  getItem(key) { return this.store.get(key) || null; }
  setItem(key, val) { this.store.set(key, String(val)); }
  removeItem(key) { this.store.delete(key); }
  clear() { this.store.clear(); }
}

globalThis.localStorage = new LocalStorageMock();
if (typeof navigator !== 'undefined') {
  try {
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true, writable: true });
  } catch (e) {}
}

test('Suite de Testes do ClaudeStorageSyncEngine (Offline-First & Outbox Queue)', async (t) => {
  let proxyProc = null;
  const PROXY_PORT = 8766;
  const TEST_SLUG = '34cd390a-738f-4dfc-8ae2-6c4f90794d74';

  t.before(async () => {
    localStorage.clear();
    proxyProc = spawn('python', ['services/proxy/claude_storage_proxy.py'], {
      stdio: ['ignore', 'pipe', 'inherit']
    });

    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 200));
      try {
        const res = await fetch(`http://127.0.0.1:${PROXY_PORT}/api/health`);
        if (res.status === 200) break;
      } catch (e) {}
    }
  });

  t.after(() => {
    if (proxyProc) proxyProc.kill('SIGTERM');
  });

  await t.test('1. Fila de Saida Persistente (Outbox) e Enfileiramento', () => {
    const engine = new globalThis.ClaudeStorageSyncEngine({
      slug: TEST_SLUG,
      proxyBase: 'http://127.0.0.1:8766'
    });

    engine.enqueue('exam_app_study', 'user_answers', { q1: { alt: 'B', timestamp: 1000 } });
    const outbox = engine.getOutbox();
    assert.equal(outbox.length, 1);
    assert.equal(outbox[0].collection, 'exam_app_study');
    assert.equal(outbox[0].docId, 'user_answers');
    assert.equal(outbox[0].data.q1.alt, 'B');

    // Segundo enfileiramento mescla dados no mesmo documento pendente
    engine.enqueue('exam_app_study', 'user_answers', { q2: { alt: 'C', timestamp: 2000 } });
    const updatedOutbox = engine.getOutbox();
    assert.equal(updatedOutbox.length, 1);
    assert.equal(updatedOutbox[0].data.q1.alt, 'B');
    assert.equal(updatedOutbox[0].data.q2.alt, 'C');
    engine.destroy();
  });

  await t.test('2. Reconciliação Bidirecional Inteligente (LWW por Questão)', () => {
    const engine = new globalThis.ClaudeStorageSyncEngine({ slug: TEST_SLUG });

    const localAnswers = {
      q1: { alt: 'A', timestamp: 1000 },
      q2: { alt: 'B', timestamp: 5000 } // Local mais recente
    };

    const remoteAnswers = {
      q1: { alt: 'D', timestamp: 2000 }, // Remoto mais recente
      q2: { alt: 'A', timestamp: 3000 }, // Remoto mais antigo
      q3: { alt: 'E', timestamp: 4000 }  // Apenas remoto
    };

    const merged = engine.reconcileAnswers(localAnswers, remoteAnswers);

    // q1 deve pegar o remoto (t=2000 > t=1000)
    assert.equal(merged.q1.alt, 'D');
    // q2 deve manter o local (t=5000 > t=3000)
    assert.equal(merged.q2.alt, 'B');
    // q3 deve ser adicionado do remoto
    assert.equal(merged.q3.alt, 'E');
    engine.destroy();
  });

  await t.test('3. Sincronização Real e Esvaziamento da Fila para Claude Pro', async () => {
    localStorage.clear();
    const engine = new globalThis.ClaudeStorageSyncEngine({
      slug: TEST_SLUG,
      proxyBase: 'http://127.0.0.1:8766'
    });

    const testDocId = 'probe_test_flush_' + Date.now();
    engine.enqueue('exam_app_study', testDocId, {
      status: 'offline_first_synced',
      itemsCount: 42,
      timestamp: Date.now()
    });

    assert.equal(engine.getOutbox().length > 0, true);

    // Executa flush
    await engine.flushOutbox();

    // Fila deve estar vazia após sucesso
    assert.equal(engine.getOutbox().length, 0);

    // Leitura direta do documento gravado para comprovar no servidor remoto
    const remoteData = await engine.fetchRemote('exam_app_study', testDocId);
    assert.ok(remoteData);
    assert.equal(remoteData.status, 'offline_first_synced');
    assert.equal(remoteData.itemsCount, 42);

    // Cleanup
    await fetch(`http://127.0.0.1:${PROXY_PORT}/api/storage/${TEST_SLUG}/exam_app_study/${testDocId}`, {
      method: 'DELETE'
    });
    engine.destroy();
  });

  await t.test('4. Retenção de Fila em Caso de Falha de Conexão', async () => {
    localStorage.clear();
    // Aponta para porta inexistente simulando servidor offline
    const origWarn = console.warn;
    console.warn = () => {};

    const engine = new globalThis.ClaudeStorageSyncEngine({
      slug: TEST_SLUG,
      proxyBase: 'http://127.0.0.1:9999'
    });

    engine.enqueue('exam_app_study', 'offline_doc_1', { data: 'test' });
    assert.equal(engine.getOutbox().length, 1);

    await engine.flushOutbox();

    // Como falhou a conexao, o item DEVE permanecer na fila com attempts incrementado
    const outbox = engine.getOutbox();
    assert.equal(outbox.length, 1);
    assert.ok(outbox[0].attempts >= 1);

    engine.destroy();
    console.warn = origWarn;
  });
});
