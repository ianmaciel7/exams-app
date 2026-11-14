import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import path from 'node:path';

const PROXY_URL = 'http://127.0.0.1:8766';
const TEST_SLUG = '34cd390a-738f-4dfc-8ae2-6c4f90794d74';
const COLLECTION = 'bridge-poc';
const DOC_ID = 'teste-001';

test('Suite de Testes da API HTTP do Claude Storage via Proxy Local', async (t) => {
  let proxyProc = null;

  t.before(async () => {
    proxyProc = spawn('python', ['tests/claude-storage-api-poc/proxy.py'], {
      stdio: ['ignore', 'pipe', 'inherit']
    });

    // Aguardar servidor inicializar
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 200));
      try {
        const res = await fetch(`${PROXY_URL}/api/storage/${TEST_SLUG}/${COLLECTION}/${DOC_ID}`, {
          method: 'OPTIONS',
          headers: { 'Origin': 'http://localhost:8765' }
        });
        if (res.status === 204) {
          console.log('[Test] Proxy local respondendo em 127.0.0.1:8766');
          break;
        }
      } catch (e) {}
    }
  });

  t.after(() => {
    if (proxyProc) {
      proxyProc.kill('SIGTERM');
    }
  });

  await t.test('1. CORS e Preflight OPTIONS', async () => {
    const res = await fetch(`${PROXY_URL}/api/storage/${TEST_SLUG}/${COLLECTION}/${DOC_ID}`, {
      method: 'OPTIONS',
      headers: { 'Origin': 'http://localhost:8765' }
    });
    assert.equal(res.status, 204);
    assert.equal(res.headers.get('access-control-allow-origin'), 'http://localhost:8765');
    assert.ok(res.headers.get('access-control-allow-methods').includes('POST'));
  });

  await t.test('2. Segurança: Rejeição de coleções fora do escopo permitido (bridge-poc)', async () => {
    const res = await fetch(`${PROXY_URL}/api/storage/${TEST_SLUG}/users/me`, {
      method: 'GET',
      headers: { 'Origin': 'http://localhost:8765' }
    });
    assert.equal(res.status, 403);
    const data = await res.json();
    assert.equal(data.error, 'DISALLOWED_COLLECTION');
  });

  await t.test('3. Gravação real no Claude Pro (POST /api/storage/...)', async () => {
    const payload = {
      titulo: 'salvo-pelo-localhost',
      timestamp: Date.now(),
      origem: 'teste-automatizado'
    };
    const res = await fetch(`${PROXY_URL}/api/storage/${TEST_SLUG}/${COLLECTION}/${DOC_ID}`, {
      method: 'POST',
      headers: {
        'Origin': 'http://localhost:8765',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.version >= 1);
  });

  await t.test('4. Leitura real do mesmo registro (GET /api/storage/...)', async () => {
    const res = await fetch(`${PROXY_URL}/api/storage/${TEST_SLUG}/${COLLECTION}/${DOC_ID}`, {
      method: 'GET',
      headers: { 'Origin': 'http://localhost:8765' }
    });

    assert.equal(res.status, 200);
    const record = await res.json();
    assert.equal(record.exists, true);
    assert.equal(record.data.titulo, 'salvo-pelo-localhost');
    assert.equal(record.data.origem, 'teste-automatizado');
  });

  await t.test('5. Listagem de documentos da coleção', async () => {
    const res = await fetch(`${PROXY_URL}/api/storage/${TEST_SLUG}/${COLLECTION}`, {
      method: 'GET',
      headers: { 'Origin': 'http://localhost:8765' }
    });

    assert.equal(res.status, 200);
    const list = await res.json();
    assert.ok(Array.isArray(list.docs));
    const found = list.docs.find(d => d.id === DOC_ID);
    assert.ok(found);
  });

  await t.test('6. Proteção contra vazamento de credenciais', async () => {
    const res = await fetch(`${PROXY_URL}/api/storage/${TEST_SLUG}/${COLLECTION}/${DOC_ID}`, {
      method: 'GET',
      headers: { 'Origin': 'http://localhost:8765' }
    });

    const bodyStr = await res.text();
    // Confirma que nenhum token ou bearer aparece na resposta HTTP enviada ao cliente
    assert.equal(bodyStr.includes('sk-ant'), false);
    assert.equal(bodyStr.includes('Bearer'), false);
    assert.equal(res.headers.has('authorization'), false);
  });

  await t.test('7. Exclusão de documento temporário (DELETE /api/storage/...)', async () => {
    const res = await fetch(`${PROXY_URL}/api/storage/${TEST_SLUG}/${COLLECTION}/${DOC_ID}`, {
      method: 'DELETE',
      headers: { 'Origin': 'http://localhost:8765' }
    });

    assert.equal(res.status, 200);

    // Confirmar que o documento não existe mais
    const checkRes = await fetch(`${PROXY_URL}/api/storage/${TEST_SLUG}/${COLLECTION}/${DOC_ID}`, {
      method: 'GET',
      headers: { 'Origin': 'http://localhost:8765' }
    });
    const checkData = await checkRes.json();
    assert.equal(checkData.exists, false);
  });
});
