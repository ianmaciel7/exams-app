import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DEBUG_PORT = 9224;
const ARTIFACT_URL = 'https://claude.ai/code/artifact/a728ae48-3fa2-4dbf-9092-0392c90b58f7';

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.msgId = 1;
    this.callbacks = new Map();
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

  close() {
    if (this.ws) this.ws.close();
  }
}

async function run() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-claude-web-'));
  const chromeProc = spawn(CHROME_PATH, [
    `--remote-debugging-port=${DEBUG_PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${tmpDir}`,
    'about:blank'
  ]);

  try {
    for (let i = 0; i < 25; i++) {
      await new Promise(r => setTimeout(r, 200));
      try {
        const resp = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
        if (resp.ok) break;
      } catch (e) {}
    }

    const tabsResp = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
    const tabs = await tabsResp.json();
    const pageTab = tabs.find(t => t.type === 'page') || tabs[0];
    const cdp = new CDPClient(pageTab.webSocketDebuggerUrl);
    await cdp.connect();

    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });

    console.log('[Test] Navegando para o Artifact Claude real:', ARTIFACT_URL);
    await cdp.send('Page.navigate', { url: ARTIFACT_URL });

    // Aguarda carregamento do container
    await new Promise(r => setTimeout(r, 6000));

    // Captura screenshot da pagina do Artifact
    const ss = await cdp.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(ss.data, 'base64');
    const outPath = path.resolve('prototypes/board-exam-app/assets/claude-storage-bridge/evidence-claude-web-artifact-public.png');
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, buffer);
    console.log(`[Test] Screenshot do Artifact Claude salvo: ${outPath} (${buffer.length} bytes)`);

    // Inspeciona os targets/iframes
    const targets = await cdp.send('Target.getTargets');
    console.log('[Test] Targets encontrados:', targets.targetInfos.map(t => ({ type: t.type, url: t.url.slice(0, 80) })));

    // Avalia o titulo e documento principal
    const titleRes = await cdp.send('Runtime.evaluate', { expression: 'document.title' });
    console.log('[Test] Document title:', titleRes.result.value);

    cdp.close();
  } finally {
    chromeProc.kill('SIGTERM');
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
  }
}

run().catch(console.error);
