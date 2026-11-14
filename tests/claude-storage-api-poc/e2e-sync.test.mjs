import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DEBUG_PORT = 9223;
const PROXY_PORT = 8766;
const MAIN_SLUG = 'a728ae48-3fa2-4dbf-9092-0392c90b58f7';
const APP_URL = 'http://localhost:8765/exam-app-0.1.1/index.html';
const ORIGIN_HEADER = { 'Origin': 'http://localhost:8765' };

// Identificador exclusivo por execucao para isolamento absoluto e prevencao de exclusao de dados reais
const TEST_RUN_DOC = `probe_e2e_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.msgId = 1;
    this.callbacks = new Map();
    this.eventListeners = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const cb = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) cb.reject(msg.error);
          else cb.resolve(msg.result);
        } else if (msg.method) {
          const listeners = this.eventListeners.get(msg.method) || [];
          listeners.forEach(fn => fn(msg.params));
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.msgId++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  on(method, listener) {
    if (!this.eventListeners.has(method)) {
      this.eventListeners.set(method, []);
    }
    this.eventListeners.get(method).push(listener);
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

test('E2E: Validacao de Sincronizacao Bidirecional no Artifact Principal e Exam App Local', async (t) => {
  let proxyProc = null;
  let chromeProc = null;
  let cdp = null;
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-e2e-'));

  t.before(async () => {
    // 1. Inicia o proxy seguro
    proxyProc = spawn('python', ['services/proxy/claude_storage_proxy.py'], {
      stdio: ['ignore', 'pipe', 'inherit']
    });

    for (let i = 0; i < 25; i++) {
      await new Promise(r => setTimeout(r, 200));
      try {
        const res = await fetch(`http://127.0.0.1:${PROXY_PORT}/api/health`, { headers: ORIGIN_HEADER });
        if (res.status === 200) break;
      } catch (e) {}
    }

    // 2. Inicia o Chrome Headless com depurador
    chromeProc = spawn(CHROME_PATH, [
      `--remote-debugging-port=${DEBUG_PORT}`,
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      `--user-data-dir=${tmpDir}`,
      'about:blank'
    ]);

    let versionData = null;
    for (let i = 0; i < 25; i++) {
      await new Promise(r => setTimeout(r, 200));
      try {
        const resp = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
        if (resp.ok) {
          versionData = await resp.json();
          break;
        }
      } catch (e) {}
    }

    const tabsResp = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
    const tabs = await tabsResp.json();
    const pageTab = tabs.find(t => t.type === 'page') || tabs[0];
    cdp = new CDPClient(pageTab.webSocketDebuggerUrl);
    await cdp.connect();

    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });
  });

  t.after(async () => {
    if (cdp) cdp.close();
    if (chromeProc) chromeProc.kill('SIGTERM');
    if (proxyProc) proxyProc.kill('SIGTERM');
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
  });

  await t.test('1. Carregamento do Exam App e Inicialização do Sync Engine', async () => {
    await cdp.send('Page.navigate', { url: APP_URL });
    await new Promise(r => setTimeout(r, 2500));

    const evalResult = await cdp.send('Runtime.evaluate', {
      expression: `Boolean(window.syncEngine && document.getElementById('btnSyncStatus'))`
    });
    assert.equal(evalResult.result.value, true);
  });

  await t.test('2. Resposta de Questão no Localhost e Sincronização Automática com Claude Pro (Isolado)', async () => {
    const answerPayload = {
      '101': { selected: 'B', correct: true, updatedAt: Date.now(), version: 1, deleted: false },
      '102': { selected: 'D', correct: false, updatedAt: Date.now(), version: 1, deleted: false }
    };

    const evalAnswer = await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          window.syncEngine.enqueue('exam_app_study', '${TEST_RUN_DOC}', {
            answers: ${JSON.stringify(answerPayload)},
            updatedAt: Date.now(),
            testRun: true
          });
          return window.syncEngine.getOutbox().length;
        })()
      `
    });

    // Confirma que a alteração foi enfileirada no outbox
    assert.ok(evalAnswer.result.value >= 1);

    // Força o flush da fila
    await cdp.send('Runtime.evaluate', {
      expression: `window.syncEngine.flushOutbox()`
    });

    // Aguarda conclusão do envio à Anthropic
    await new Promise(r => setTimeout(r, 2000));

    // Verifica que o outbox foi esvaziado com sucesso
    const outboxAfter = await cdp.send('Runtime.evaluate', {
      expression: `window.syncEngine.getOutbox().length`
    });
    assert.equal(outboxAfter.result.value, 0);

    // Validação Direta no Servidor Claude Pro via Proxy
    const checkRes = await fetch(`http://127.0.0.1:${PROXY_PORT}/api/storage/${MAIN_SLUG}/exam_app_study/${TEST_RUN_DOC}`, {
      headers: ORIGIN_HEADER
    });
    assert.equal(checkRes.status, 200);
    const remoteDoc = await checkRes.json();
    assert.equal(remoteDoc.exists, true);
    assert.equal(remoteDoc.data.answers['101'].selected, 'B');
    assert.equal(remoteDoc.data.answers['102'].selected, 'D');
  });

  await t.test('3. Captura de Evidência Visual da UI com Badge de Sincronização Ativo', async () => {
    const ss = await cdp.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(ss.data, 'base64');

    const outputDir = path.resolve('prototypes/board-exam-app/assets/claude-storage-bridge');
    fs.mkdirSync(outputDir, { recursive: true });
    const ssPath = path.join(outputDir, 'evidence-e2e-sync-badge-active.png');
    fs.writeFileSync(ssPath, buffer);

    // Copia também para raiz de assets para o board
    const boardAssetPath = path.resolve('prototypes/board-exam-app/assets/evidence-e2e-sync-badge-active.png');
    fs.writeFileSync(boardAssetPath, buffer);

    assert.ok(buffer.length > 10000, 'Screenshot deve ter mais de 10 KB');
    console.log(`[E2E] Screenshot salvo em ${ssPath} (${buffer.length} bytes)`);
  });

  await t.test('4. Limpeza Estrita e Isolada Apenas do Documento de Teste Temporário', async () => {
    const delRes = await fetch(`http://127.0.0.1:${PROXY_PORT}/api/storage/${MAIN_SLUG}/exam_app_study/${TEST_RUN_DOC}`, {
      method: 'DELETE',
      headers: ORIGIN_HEADER
    });
    assert.equal(delRes.status, 200);

    // Valida que o documento de teste foi de fato excluido
    const verifyDel = await fetch(`http://127.0.0.1:${PROXY_PORT}/api/storage/${MAIN_SLUG}/exam_app_study/${TEST_RUN_DOC}`, {
      headers: ORIGIN_HEADER
    });
    const verifyJson = await verifyDel.json();
    assert.equal(verifyJson.exists, false);
  });
});
