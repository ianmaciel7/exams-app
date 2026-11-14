import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DEBUG_PORT = 9222;
const TEST_URL = 'http://localhost:8765/claude-storage-test/index.html';

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

async function run() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-poc-'));
  console.log(`[CDP] Diretório temporário: ${tmpDir}`);

  const chromeProc = spawn(CHROME_PATH, [
    `--remote-debugging-port=${DEBUG_PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-popup-blocking',
    `--user-data-dir=${tmpDir}`,
    'about:blank'
  ]);

  let cdp = null;
  const consoleLogs = [];
  const networkEvents = [];

  try {
    // Aguarda porta do Chrome
    console.log('[CDP] Aguardando inicialização do Chrome...');
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

    if (!versionData) {
      throw new Error('Chrome não respondeu na porta de depuração');
    }

    console.log('[CDP] Conectado ao Chrome:', versionData.Browser);

    // Obter lista de abas
    const tabsResp = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
    const tabs = await tabsResp.json();
    const pageTab = tabs.find(t => t.type === 'page') || tabs[0];
    const wsUrl = pageTab.webSocketDebuggerUrl;

    cdp = new CDPClient(wsUrl);
    await cdp.connect();
    console.log('[CDP] WebSocket CDP conectado!');

    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Log.enable');
    await cdp.send('Network.enable');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 1050,
      deviceScaleFactor: 1,
      mobile: false
    });

    cdp.on('Runtime.consoleAPICalled', (params) => {
      const text = params.args.map(a => a.value || a.description || JSON.stringify(a)).join(' ');
      consoleLogs.push({ type: params.type, text, timestamp: Date.now() });
      console.log(`[Browser Console ${params.type}] ${text}`);
    });

    cdp.on('Log.entryAdded', (params) => {
      const entry = params.entry;
      consoleLogs.push({ type: entry.level, text: `[${entry.source}] ${entry.text}`, url: entry.url, timestamp: Date.now() });
      console.log(`[Browser Log ${entry.level}] ${entry.text}`);
    });

    cdp.on('Network.responseReceived', (params) => {
      networkEvents.push({
        url: params.response.url,
        status: params.response.status,
        headers: params.response.headers
      });
      if (params.response.url.includes('claude.ai') || params.response.url.includes('claudeusercontent')) {
        console.log(`[Network Response] ${params.response.status} ${params.response.url}`);
      }
    });

    console.log(`[CDP] Navegando para ${TEST_URL}...`);
    await cdp.send('Page.navigate', { url: TEST_URL });
    await new Promise(r => setTimeout(r, 2000));

    // 1. Executar Teste de Simulação
    console.log('[CDP] Clicando em btn-test-sim...');
    await cdp.send('Runtime.evaluate', {
      expression: `document.getElementById('btn-test-sim').click()`
    });
    await new Promise(r => setTimeout(r, 3000));

    // 2. Executar Teste de Iframe Real
    console.log('[CDP] Clicando em btn-test-iframe (tentativa de incorporar Claude real)...');
    await cdp.send('Runtime.evaluate', {
      expression: `document.getElementById('btn-test-iframe').click()`
    });
    await new Promise(r => setTimeout(r, 4000));

    // 3. Executar Teste de Popup Real
    console.log('[CDP] Clicando em btn-test-popup (tentativa de conectar via window.open)...');
    await cdp.send('Runtime.evaluate', {
      expression: `document.getElementById('btn-test-popup').click()`
    });
    await new Promise(r => setTimeout(r, 4000));

    // 4. Capturar Screenshot da interface de teste com os resultados
    console.log('[CDP] Capturando screenshot de evidência...');
    const ss = await cdp.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(ss.data, 'base64');

    const outputDirAssets = path.resolve('prototypes/board-exam-app/assets/claude-storage-bridge');
    fs.mkdirSync(outputDirAssets, { recursive: true });
    const ssPath = path.join(outputDirAssets, 'evidence-iframe-csp-blocked.png');
    fs.writeFileSync(ssPath, buffer);
    console.log(`[CDP] Screenshot salvo em: ${ssPath} (${buffer.length} bytes)`);

    // Salvar relatório estruturado
    const reportDir = path.resolve('docs/reports/claude-storage-bridge');
    fs.mkdirSync(reportDir, { recursive: true });
    const reportData = {
      timestamp: new Date().toISOString(),
      browser: versionData.Browser,
      testUrl: TEST_URL,
      consoleLogs,
      networkEvents: networkEvents.filter(e => e.url.includes('claude') || e.url.includes('artifact') || e.status >= 400)
    };
    fs.writeFileSync(path.join(reportDir, 'cdp-execution-log.json'), JSON.stringify(reportData, null, 2));
    console.log(`[CDP] Relatório JSON salvo em: ${path.join(reportDir, 'cdp-execution-log.json')}`);

  } catch (err) {
    console.error('[CDP] Erro durante a execução:', err);
  } finally {
    if (cdp) cdp.close();
    chromeProc.kill('SIGTERM');
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (e) {}
  }
}

run();
