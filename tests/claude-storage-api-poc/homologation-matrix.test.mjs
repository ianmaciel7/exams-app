import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { ClaudeStorageSyncEngine } from '../../prototypes/exam-app-0.1.1/js/claude-storage-sync.js';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DEBUG_PORT_1 = 9225;
const DEBUG_PORT_2 = 9226;
const PROXY_PORT = 8766;
const MAIN_SLUG = 'a728ae48-3fa2-4dbf-9092-0392c90b58f7';
const APP_URL = 'http://localhost:8765/exam-app-0.1.1/index.html';
const ORIGIN_HEADER = { 'Origin': 'http://localhost:8765' };

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

async function spawnChrome(debugPort, dataDir) {
  const proc = spawn(CHROME_PATH, [
    `--remote-debugging-port=${debugPort}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${dataDir}`,
    'about:blank'
  ]);

  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 200));
    try {
      const resp = await fetch(`http://127.0.0.1:${debugPort}/json/version`);
      if (resp.ok) break;
    } catch (e) {}
  }

  const tabsResp = await fetch(`http://127.0.0.1:${debugPort}/json/list`);
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

  return { proc, cdp };
}

test('Homologacao Rigorosa: Claude Pro Storage <-> Exam App', async (t) => {
  let proxyProc = null;

  t.before(async () => {
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
  });

  t.after(() => {
    if (proxyProc) proxyProc.kill('SIGTERM');
  });

  // =========================================================================
  // CENARIO 1: Recuperação Completa em Navegador Limpo (Sem Dados Pré-existentes)
  // =========================================================================
  await t.test('Cenario 1: Recuperacao Completa de Dados em Navegador Limpo', async () => {
    const probeDocId = `probe_recup_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const cloudPayload = {
      answers: {
        '10': { selected: 'A', correct: true, updatedAt: Date.now(), version: 1, deleted: false },
        '11': { selected: 'C', correct: false, updatedAt: Date.now(), version: 1, deleted: false }
      },
      exam: { index: 5, answers: { '1': 'A', '2': 'B' }, finished: false, updatedAt: Date.now() },
      cadernos: [
        { id: 'cad_probe_1', name: 'Caderno Homologacao', goal: 85, questionIds: ['10', '11'] }
      ],
      spaces: [
        { id: 'sp_probe_1', name: 'Espaco Concurso Federal', icon: 'star' }
      ],
      workspace: { active: 'tab_recup', tabs: [{ id: 'tab_recup', title: 'Aba Recuperada' }] }
    };

    // 1. Grava os dados na nuvem da Anthropic usando chaves temporarias isoladas
    const writeRes = await fetch(`http://127.0.0.1:${PROXY_PORT}/api/storage/${MAIN_SLUG}/exam_app_study/${probeDocId}`, {
      method: 'POST',
      headers: { ...ORIGIN_HEADER, 'Content-Type': 'application/json' },
      body: JSON.stringify(cloudPayload)
    });
    assert.equal(writeRes.status, 200);

    // 2. Abre um navegador Chromium TOTALMENTE LIMPO (diretório temporário virgem)
    const cleanDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-clean-'));
    const { proc: cleanChrome, cdp: cleanCDP } = await spawnChrome(DEBUG_PORT_1, cleanDir);

    try {
      await cleanCDP.send('Page.navigate', { url: APP_URL });
      await new Promise(r => setTimeout(r, 2000));

      // 3. Simula recuperacao de boot pelo SyncEngine no navegador limpo
      const evalRecovery = await cleanCDP.send('Runtime.evaluate', {
        expression: `
          (async () => {
            const remote = await window.syncEngine.fetchRemote('exam_app_study', '${probeDocId}');
            if (!remote) return { success: false, reason: 'Remote null' };

            // Restaura respostas
            const answers = window.syncEngine.reconcileAnswers({}, remote.answers);
            localStorage.setItem('study:answers:dataprev-2026-tipo1', JSON.stringify(answers));

            // Restaura cadernos e espacos
            localStorage.setItem('cadernos', JSON.stringify(remote.cadernos));
            localStorage.setItem('spaces', JSON.stringify(remote.spaces));

            return {
              success: true,
              answersCount: Object.keys(answers).length,
              cadernosCount: remote.cadernos.length,
              spacesCount: remote.spaces.length
            };
          })()
        `,
        awaitPromise: true,
        returnByValue: true
      });

      const res = evalRecovery.result.value;
      assert.ok(res && res.success === true, 'Recuperacao deve retornar sucesso');
      assert.equal(res.answersCount, 2);
      assert.equal(res.cadernosCount, 1);
      assert.equal(res.spacesCount, 1);

      // Captura screenshot da recuperacao no navegador limpo
      const ss = await cleanCDP.send('Page.captureScreenshot', { format: 'png' });
      const buffer = Buffer.from(ss.data, 'base64');
      const outPath = path.resolve('prototypes/board-exam-app/assets/claude-storage-bridge/evidence-homologation-clean-recovery.png');
      fs.writeFileSync(outPath, buffer);
      assert.ok(buffer.length > 10000);
    } finally {
      cleanCDP.close();
      cleanChrome.kill('SIGTERM');
      try { fs.rmSync(cleanDir, { recursive: true, force: true }); } catch (e) {}

      // Limpa dados temporarios da nuvem
      await fetch(`http://127.0.0.1:${PROXY_PORT}/api/storage/${MAIN_SLUG}/exam_app_study/${probeDocId}`, {
        method: 'DELETE',
        headers: ORIGIN_HEADER
      });
    }
  });

  // =========================================================================
  // CENARIO 2: Concorrência entre Duas Sessões Independentes (Sem Sobrescrita)
  // =========================================================================
  await t.test('Cenario 2: Concorrencia Real Entre Duas Sessoes e Resolucoes Simultaneas', async () => {
    const probeDocId = `probe_concurrent_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const engineA = new ClaudeStorageSyncEngine({ slug: MAIN_SLUG });
    const engineB = new ClaudeStorageSyncEngine({ slug: MAIN_SLUG });

    // Sessao A responde a Questao 1 com alternativa B
    const sessionA_answers = {
      '1': { selected: 'B', correct: true, updatedAt: 1000, version: 1, deleted: false }
    };

    // Sessao B responde a Questao 2 com alternativa C simultaneamente
    const sessionB_answers = {
      '2': { selected: 'C', correct: false, updatedAt: 1050, version: 1, deleted: false }
    };

    // Envia sessao A
    await engineA.sendToRemote('exam_app_study', probeDocId, { answers: sessionA_answers });

    // Sessao B busca remoto, reconcilia com suas proprias respostas locais e envia
    const remoteInB = await engineB.fetchRemote('exam_app_study', probeDocId);
    const mergedInB = engineB.reconcileAnswers(sessionB_answers, remoteInB.answers);
    assert.equal(mergedInB['1'].selected, 'B', 'Resposta da Sessao A preservada');
    assert.equal(mergedInB['2'].selected, 'C', 'Resposta da Sessao B preservada');

    await engineB.sendToRemote('exam_app_study', probeDocId, { answers: mergedInB });

    // Conflito na mesma questao: Sessao A re-responde questao 1 para 'D' (versao 2, timestamp 2000)
    const sessionA_updated = {
      ...sessionA_answers,
      '1': { selected: 'D', correct: false, updatedAt: 2000, version: 2, deleted: false }
    };
    const finalMerge = engineA.reconcileAnswers(sessionA_updated, mergedInB);

    assert.equal(finalMerge['1'].selected, 'D', 'Versao mais recente deve prevalecer no conflito');
    assert.equal(finalMerge['2'].selected, 'C', 'Questao 2 deve continuar intacta sem ser sobrescrita');

    // Limpeza estrita do documento temporario
    await fetch(`http://127.0.0.1:${PROXY_PORT}/api/storage/${MAIN_SLUG}/exam_app_study/${probeDocId}`, {
      method: 'DELETE',
      headers: ORIGIN_HEADER
    });
    engineA.destroy();
    engineB.destroy();
  });

  // =========================================================================
  // CENARIO 3: Persistência Offline, Fechamento Brusco e Retomada na Reconexão
  // =========================================================================
  await t.test('Cenario 3: Persistencia Offline, Fechamento de Navegador e Retomada', async () => {
    const probeDocId = `probe_offline_restart_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-offline-restart-'));

    // 1. Abre navegador
    let { proc: chromeProc, cdp } = await spawnChrome(DEBUG_PORT_2, profileDir);

    try {
      await cdp.send('Page.navigate', { url: APP_URL });
      await new Promise(r => setTimeout(r, 2000));

      // 2. Coloca emulacao de offline no navegador
      await cdp.send('Network.enable');
      await cdp.send('Network.emulateNetworkConditions', {
        offline: true,
        latency: 0,
        downloadThroughput: 0,
        uploadThroughput: 0
      });

      // 3. Usuario responde questoes enquanto offline
      await cdp.send('Runtime.evaluate', {
        expression: `
          window.syncEngine.enqueue('exam_app_study', '${probeDocId}', {
            answers: { '99': { selected: 'E', correct: true, updatedAt: Date.now(), version: 1 } },
            offlineQueueTest: true
          });
        `
      });

      // Confirma que a operacao esta retida na fila
      const outboxCheck = await cdp.send('Runtime.evaluate', {
        expression: `window.syncEngine.getOutbox().length`,
        returnByValue: true
      });
      assert.equal(outboxCheck.result.value, 1, 'Operacao deve estar no Outbox');

      // 4. Fechamento brusco do navegador (Crash/Close)
      // Garante que o Chromium comitou o localStorage no disco antes de fechar
      await new Promise(r => setTimeout(r, 1200));
      cdp.close();
      chromeProc.kill('SIGTERM');
      await new Promise(r => setTimeout(r, 1000));

      // 5. Reabre o navegador usando o MESMO diretorio de perfil
      const reopened = await spawnChrome(DEBUG_PORT_2, profileDir);
      chromeProc = reopened.proc;
      cdp = reopened.cdp;

      await cdp.send('Page.navigate', { url: APP_URL });

      // 6. Aguarda ate 8 segundos para que o motor inicialize e descarregue a fila de reconexao
      let synced = false;
      let finalDoc = null;
      for (let i = 0; i < 16; i++) {
        await new Promise(r => setTimeout(r, 500));
        try {
          const res = await fetch(`http://127.0.0.1:${PROXY_PORT}/api/storage/${MAIN_SLUG}/exam_app_study/${probeDocId}`, {
            headers: ORIGIN_HEADER
          });
          if (res.status === 200) {
            const doc = await res.json();
            if (doc.exists && doc.data?.answers?.['99']?.selected === 'E') {
              synced = true;
              finalDoc = doc;
              break;
            }
          }
        } catch (e) {}
      }
      assert.ok(synced, 'Documento enfileirado offline deve persistir no Claude DB apos reabertura do navegador');
      assert.equal(finalDoc.data.answers['99'].selected, 'E');

      // 7. Confirma que o outbox foi esvaziado apos confirmacao do servidor
      const afterFlush = await cdp.send('Runtime.evaluate', {
        expression: `window.syncEngine.getOutbox().length`,
        returnByValue: true
      });
      assert.equal(afterFlush.result.value, 0, 'Outbox deve estar esvaziado apos flush de reconexao');

      // Limpeza estrita
      await fetch(`http://127.0.0.1:${PROXY_PORT}/api/storage/${MAIN_SLUG}/exam_app_study/${probeDocId}`, {
        method: 'DELETE',
        headers: ORIGIN_HEADER
      });
    } finally {
      if (cdp) cdp.close();
      if (chromeProc) chromeProc.kill('SIGTERM');
      try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch (e) {}
    }
  });

  // =========================================================================
  // CENARIO 4: Exclusão com Tombstone (Prevenção de Ressuscitação de Resposta)
  // =========================================================================
  await t.test('Cenario 4: Exclusao e Tombstone sem Ressuscitacao Indevida', async () => {
    const probeDocId = `probe_tombstone_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const engine = new ClaudeStorageSyncEngine({ slug: MAIN_SLUG });

    // 1. Grava resposta ativa
    await engine.sendToRemote('exam_app_study', probeDocId, {
      answers: {
        '50': { selected: 'A', correct: true, updatedAt: 1000, version: 1, deleted: false }
      }
    });

    // 2. Usuario exclui a resposta localmente (grava tombstone)
    const localDeleted = {
      '50': { selected: null, correct: null, updatedAt: 2000, version: 2, deleted: true }
    };

    // 3. Reconcilia com o documento anterior da nuvem
    const remoteDoc = await engine.fetchRemote('exam_app_study', probeDocId);
    const reconciled = engine.reconcileAnswers(localDeleted, remoteDoc.answers);

    // O tombstone deve prevalecer
    assert.equal(reconciled['50'].deleted, true);
    assert.equal(reconciled['50'].selected, null);

    // Envia tombstone para a nuvem
    await engine.sendToRemote('exam_app_study', probeDocId, { answers: reconciled });

    // 4. Outro dispositivo sincroniza do zero
    const deviceB_answers = {};
    const remoteUpdated = await engine.fetchRemote('exam_app_study', probeDocId);
    const deviceB_merged = engine.reconcileAnswers(deviceB_answers, remoteUpdated.answers);

    // Confirma que o outro dispositivo nao ressuscita a questao
    assert.equal(deviceB_merged['50'].deleted, true);
    assert.equal(deviceB_merged['50'].selected, null);

    // Limpeza
    await fetch(`http://127.0.0.1:${PROXY_PORT}/api/storage/${MAIN_SLUG}/exam_app_study/${probeDocId}`, {
      method: 'DELETE',
      headers: ORIGIN_HEADER
    });
    engine.destroy();
  });
});
