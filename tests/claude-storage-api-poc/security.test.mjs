import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { spawn } from 'node:child_process';

const PROXY_PORT = 8766;
const SLUG = '34cd390a-738f-4dfc-8ae2-6c4f90794d74';

function rawRequest({ method = 'GET', path = '/api/health', host = '127.0.0.1:8766', origin = 'http://localhost:8765', body = null }) {
  return new Promise((resolve, reject) => {
    const headers = {
      'Host': host,
      'Connection': 'close'
    };
    if (origin) headers['Origin'] = origin;
    if (body) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(body);
    }

    const req = http.request({
      hostname: '127.0.0.1',
      port: PROXY_PORT,
      path,
      method,
      headers
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed = null;
        try { parsed = JSON.parse(data); } catch (e) {}
        resolve({ status: res.statusCode, headers: res.headers, body: data, json: parsed });
      });
    });

    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

test('Auditoria de Seguranca do Hardened Claude Storage Proxy', async (t) => {
  let proxyProc = null;

  t.before(async () => {
    proxyProc = spawn('python', ['services/proxy/claude_storage_proxy.py'], {
      stdio: ['ignore', 'pipe', 'inherit']
    });

    for (let i = 0; i < 25; i++) {
      await new Promise(r => setTimeout(r, 200));
      try {
        const res = await rawRequest({ path: '/api/health' });
        if (res.status === 200) break;
      } catch (e) {}
    }
  });

  t.after(() => {
    if (proxyProc) proxyProc.kill('SIGTERM');
  });

  await t.test('1. Protecao contra DNS Rebinding (Host Header Spoofing)', async () => {
    const res = await rawRequest({
      path: '/api/health',
      host: 'malicious-attacker.com'
    });
    assert.equal(res.status, 403);
    assert.equal(res.json?.error, 'INVALID_HOST');
  });

  await t.test('2. Rejeicao de Origens Nao Autorizadas (CORS Strict Rejection)', async () => {
    const res = await rawRequest({
      path: `/api/storage/${SLUG}/bridge-poc`,
      origin: 'http://evil-website.com'
    });
    assert.equal(res.status, 403);
    assert.equal(res.json?.error, 'INVALID_ORIGIN');
  });

  await t.test('3. Bloqueio de Path Traversal e Injeção de Caracteres Especiais', async () => {
    const maliciousPaths = [
      `/api/storage/${SLUG}/../secrets`,
      `/api/storage/${SLUG}/bridge-poc/../../etc/passwd`,
      `/api/storage/${SLUG}/bridge-poc/doc%00nullbyte`,
      `/api/storage/invalid$slug/bridge-poc/doc1`
    ];

    for (const p of maliciousPaths) {
      const res = await rawRequest({ path: p });
      assert.ok(res.status === 400 || res.status === 403, `Falhou para ${p}: status=${res.status}`);
    }
  });

  await t.test('4. Bloqueio de Coleções Fora da Allowlist', async () => {
    const res = await rawRequest({
      path: `/api/storage/${SLUG}/system_credentials/admin`
    });
    assert.equal(res.status, 403);
    assert.equal(res.json?.error, 'DISALLOWED_COLLECTION');
  });

  await t.test('5. Rejeicao de Payload Excessivo (> 512 KB)', async () => {
    const largeData = JSON.stringify({ blob: 'x'.repeat(550 * 1024) });
    const res = await rawRequest({
      method: 'POST',
      path: `/api/storage/${SLUG}/bridge-poc/large-doc`,
      body: largeData
    });
    assert.equal(res.status, 413);
    assert.equal(res.json?.error, 'PAYLOAD_TOO_LARGE');
  });

  await t.test('6. Healthcheck Seguro (Zero Exposição de Tokens)', async () => {
    const res = await rawRequest({ path: '/api/health' });
    assert.equal(res.status, 200);
    assert.equal(res.json?.status, 'ok');
    assert.equal(res.json?.authenticated, true);
    assert.equal(res.body.includes('sk-ant'), false);
    assert.equal(res.body.includes('Bearer'), false);
  });
});
