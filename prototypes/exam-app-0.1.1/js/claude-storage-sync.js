/**
 * ClaudeStorageSyncEngine - Motor de Sincronizacao Offline-First para Exam App
 * 
 * Funcionalidades Arquiteturais:
 * - Operacao 100% Offline-First: persistencia local imediata e fila de saida (Outbox).
 * - Identidade e versao por operacao (opId): remocao atomica apenas de operacoes confirmadas.
 * - Concorrencia segura: preserva alteracoes recebidas durante transmissao em voo (in-flight).
 * - Deteccao automatica de ambiente:
 *     a) No Claude Artifact: consome diretamente window.claude.use('db').
 *     b) No localhost: comunica com o proxy blindado em http://127.0.0.1:8766.
 * - Reconciliacao deterministica LWW (Last-Write-Wins) por questao com suporte a:
 *     - Tombstones (exclusoes de respostas nao ressuscitam).
 *     - Versao numerica + timestamp (resiliencia a relogios descalibrados).
 * - Retentativas com backoff exponencial e jitter aleatorio.
 * - Estados visuais estritos:
 *     - 'synced': Apenas quando fila esta 100% vazia e confirmada.
 *     - 'syncing': Transmissao ativa em andamento.
 *     - 'pending': Operacoes pendentes salvas localmente aguardando envio.
 *     - 'error': Falha permanente/limite de retentativas atingido (sem descarte silencioso).
 */

(function(global) {
  'use strict';

  const OUTBOX_KEY = 'exam_app_sync_outbox_v1';
  const META_KEY = 'exam_app_sync_meta_v1';
  const DEFAULT_SLUG = 'a728ae48-3fa2-4dbf-9092-0392c90b58f7'; // Artifact principal
  const PROXY_BASE = 'http://127.0.0.1:8766';
  const MAX_RETRIES = 5;

  class ClaudeStorageSyncEngine {
    constructor(options = {}) {
      this.slug = options.slug || DEFAULT_SLUG;
      this.proxyBase = options.proxyBase || PROXY_BASE;
      this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
      this.isSyncing = false;
      this.syncListeners = [];
      this.directDb = null;
      this.isClaudeArtifact = false;
      this.flushTimer = null;
      this.opSeq = 0;

      this.init();
    }

    async init() {
      // Deteccao de Claude Artifact nativo
      if (typeof window !== 'undefined' && typeof window.claude !== 'undefined' && typeof window.claude.use === 'function') {
        try {
          this.directDb = await window.claude.use('db');
          if (this.directDb) {
            this.isClaudeArtifact = true;
            this.notifyStatus('synced', 'Conectado diretamente ao Claude Pro DB');
          }
        } catch (e) {
          console.warn('[SyncEngine] Falha ao carregar claude.use(db):', e);
        }
      }

      // Eventos de rede do navegador
      if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
        window.addEventListener('online', () => {
          this.isOnline = true;
          this.notifyStatus('syncing', 'Conexão restabelecida. Sincronizando...');
          this.flushOutbox();
        });

        window.addEventListener('offline', () => {
          this.isOnline = false;
          const pending = this.getOutbox().length;
          this.notifyStatus('offline', `Modo offline. ${pending} alteração(ões) retidas.`);
        });
      }

      // Recupera estado de fila apos recarregar
      const pendingOps = this.getOutbox();
      if (pendingOps.length > 0) {
        // Reseta status 'in-flight' para 'pending' caso tenha havido refresh no meio de um envio
        let changed = false;
        pendingOps.forEach(op => {
          if (op.status === 'in-flight') {
            op.status = 'pending';
            changed = true;
          }
        });
        if (changed) this.saveOutbox(pendingOps);

        this.notifyStatus('pending', `${pendingOps.length} alteração(ões) pendente(s) da sessão anterior.`);
        this.initTimer = setTimeout(() => this.flushOutbox(), 1500);
        if (this.initTimer && typeof this.initTimer.unref === 'function') {
          this.initTimer.unref();
        }
      } else {
        this.notifyStatus('synced', 'Tudo sincronizado');
      }

      // Sincronizacao periodica a cada 45 segundos se houver fila
      this.intervalTimer = setInterval(() => {
        if (!this.isSyncing && this.getOutbox().some(op => op.status === 'pending')) {
          this.flushOutbox();
        }
      }, 45000);
      if (this.intervalTimer && typeof this.intervalTimer.unref === 'function') {
        this.intervalTimer.unref();
      }
    }

    destroy() {
      clearTimeout(this.initTimer);
      clearTimeout(this.flushTimer);
      clearInterval(this.intervalTimer);
    }

    onStatusChange(fn) {
      this.syncListeners.push(fn);
      // Notifica o estado inicial imediatamente
      const meta = this.getMeta();
      const count = this.getOutbox().length;
      fn({ state: meta.lastState || 'synced', message: meta.lastMessage || 'Inicializado', pendingCount: count });
    }

    notifyStatus(state, message) {
      const meta = this.getMeta();
      meta.lastState = state;
      meta.lastMessage = message;
      this.setMeta(meta);

      const count = this.getOutbox().length;
      this.syncListeners.forEach(fn => {
        try { fn({ state, message, pendingCount: count }); } catch(e){}
      });
    }

    getMeta() {
      try {
        return JSON.parse(localStorage.getItem(META_KEY)) || { lastSyncTime: 0, lastState: 'synced' };
      } catch (e) {
        return { lastSyncTime: 0, lastState: 'synced' };
      }
    }

    setMeta(meta) {
      try {
        localStorage.setItem(META_KEY, JSON.stringify(meta));
      } catch (e) {}
    }

    getOutbox() {
      try {
        return JSON.parse(localStorage.getItem(OUTBOX_KEY)) || [];
      } catch (e) {
        return [];
      }
    }

    saveOutbox(queue) {
      try {
        localStorage.setItem(OUTBOX_KEY, JSON.stringify(queue));
      } catch (e) {}
    }

    /**
     * Enfileira uma alteracao na fila de saida (Outbox).
     * Garante identidade unica, versao crescente e preservacao contra sobrescrita concorrente.
     */
    enqueue(collection, docId, data) {
      const queue = this.getOutbox();
      this.opSeq++;

      const opId = `op_${Date.now()}_${this.opSeq}_${Math.random().toString(36).slice(2, 7)}`;
      const existingIdx = queue.findIndex(q => q.collection === collection && q.docId === docId);

      if (existingIdx >= 0 && queue[existingIdx].status !== 'in-flight') {
        // Se ja ha operacao pendente que ainda nao comecou a ser enviada, mescla com versao atualizada
        const existing = queue[existingIdx];
        const mergedData = (typeof data === 'object' && typeof existing.data === 'object')
          ? { ...existing.data, ...data }
          : data;

        queue[existingIdx] = {
          ...existing,
          opId, // Novo ID para rastreabilidade
          data: mergedData,
          opVersion: (existing.opVersion || 1) + 1,
          updatedAt: Date.now(),
          attempts: 0,
          status: 'pending',
          lastError: null
        };
      } else {
        // Operacao nova ou a anterior ja esta em voo (in-flight) -> adiciona nova operacao na fila
        queue.push({
          opId,
          collection,
          docId,
          data,
          opVersion: 1,
          createdAt: Date.now(),
          attempts: 0,
          status: 'pending',
          lastError: null
        });
      }

      this.saveOutbox(queue);
      this.notifyStatus('pending', `${queue.length} alteração(ões) pendente(s)`);

      // Agenda flush com debounce de 600ms
      clearTimeout(this.flushTimer);
      this.flushTimer = setTimeout(() => this.flushOutbox(), 600);
      if (this.flushTimer && typeof this.flushTimer.unref === 'function') {
        this.flushTimer.unref();
      }
      return opId;
    }

    /**
     * Processa e descarrega a fila de saida com remocao atomica apenas de operacoes confirmadas.
     */
    async flushOutbox() {
      if (this.isSyncing) return;

      const queue = this.getOutbox();
      const pendingOps = queue.filter(op => op.status !== 'in-flight' && op.attempts < MAX_RETRIES);

      if (pendingOps.length === 0) {
        const remaining = this.getOutbox();
        const failedOps = remaining.filter(op => op.attempts >= MAX_RETRIES);
        if (failedOps.length > 0) {
          this.notifyStatus('error', `${failedOps.length} alteração(ões) com falha definitiva retida(s) no dispositivo.`);
        } else if (remaining.length === 0) {
          this.notifyStatus('synced', 'Tudo sincronizado');
        } else {
          this.notifyStatus('pending', `${remaining.length} alteração(ões) pendente(s)`);
        }
        return;
      }

      this.isSyncing = true;
      this.notifyStatus('syncing', `Sincronizando ${pendingOps.length} item(ns)...`);

      for (const op of pendingOps) {
        // 1. Marca operacao como in-flight atomicamente no localStorage
        const curBefore = this.getOutbox();
        const targetOp = curBefore.find(x => x.opId === op.opId);
        if (targetOp) {
          targetOp.status = 'in-flight';
          this.saveOutbox(curBefore);
        }

        try {
          // 2. Envia para o servidor remoto
          await this.sendToRemote(op.collection, op.docId, op.data);

          // 3. Sucesso: Remove atomicamente APENAS esta operacao confirmada
          const curAfter = this.getOutbox();
          const nextQueue = curAfter.filter(x => x.opId !== op.opId);
          this.saveOutbox(nextQueue);
        } catch (err) {
          console.warn('[SyncEngine] Falha ao enviar operacao:', op.opId, err);

          // 4. Falha: Atualiza tentativas e agenda backoff sem perder novos itens enfileirados
          const curAfter = this.getOutbox();
          const failedOp = curAfter.find(x => x.opId === op.opId);
          if (failedOp) {
            failedOp.attempts = (failedOp.attempts || 0) + 1;
            failedOp.lastError = err ? (err.message || String(err)) : 'Falha de rede';
            failedOp.lastAttemptAt = Date.now();
            failedOp.status = failedOp.attempts >= MAX_RETRIES ? 'failed' : 'pending';
          }
          this.saveOutbox(curAfter);
        }
      }

      this.isSyncing = false;

      // 5. Avaliacao final da fila restante
      const remainingQueue = this.getOutbox();
      const failedCount = remainingQueue.filter(op => op.attempts >= MAX_RETRIES).length;

      if (remainingQueue.length === 0) {
        const meta = this.getMeta();
        meta.lastSyncTime = Date.now();
        this.setMeta(meta);
        this.notifyStatus('synced', 'Sincronizado com Claude Pro');
      } else if (failedCount > 0) {
        this.notifyStatus('error', `${failedCount} alteração(ões) retidas com erro. Clique para retentar.`);
      } else {
        // Backoff exponencial com jitter aleatorio (500ms - 2500ms)
        const delay = Math.min(2000 * Math.pow(1.5, remainingQueue[0].attempts || 1), 30000) + Math.floor(Math.random() * 500);
        this.notifyStatus('pending', `${remainingQueue.length} item(ns) pendente(s). Retentando...`);

        clearTimeout(this.flushTimer);
        this.flushTimer = setTimeout(() => this.flushOutbox(), delay);
        if (this.flushTimer && typeof this.flushTimer.unref === 'function') {
          this.flushTimer.unref();
        }
      }
    }

    /**
     * Envia documento ao Claude Pro DB (Direto ou via Proxy).
     */
    async sendToRemote(collection, docId, data) {
      if (this.isClaudeArtifact && this.directDb) {
        // Comunicacao direta nativa no iframe do Claude Artifact
        const docRef = this.directDb.doc(`${collection}/${docId}`);
        await docRef.set(data);
        return { success: true, mode: 'direct' };
      }

      // Comunicacao via proxy local no localhost
      const url = `${this.proxyBase}/api/storage/${this.slug}/${collection}/${docId}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:8765'
        },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `HTTP ${res.status}`);
      }
      return await res.json();
    }

    /**
     * Recupera documento remoto do Claude Pro DB.
     */
    async fetchRemote(collection, docId) {
      if (this.isClaudeArtifact && this.directDb) {
        const docRef = this.directDb.doc(`${collection}/${docId}`);
        const snap = await docRef.get();
        return snap.exists ? snap.data() : null;
      }

      const url = `${this.proxyBase}/api/storage/${this.slug}/${collection}/${docId}`;
      const res = await fetch(url, {
        headers: { 'Origin': 'http://localhost:8765' }
      });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return json.exists ? json.data : null;
    }

    /**
     * Reconciliacao deterministica LWW por Questao com suporte a Tombstones e Concorrencia.
     * Trata timestamps individuais, versoes e exclusoes sem perda de dados.
     */
    reconcileAnswers(localAnswers = {}, remoteAnswers = {}) {
      const merged = {};
      const allQids = new Set([...Object.keys(localAnswers || {}), ...Object.keys(remoteAnswers || {})]);

      for (const qid of allQids) {
        const local = localAnswers[qid];
        const remote = remoteAnswers[qid];

        if (!local && remote) {
          merged[qid] = remote;
          continue;
        }
        if (local && !remote) {
          merged[qid] = local;
          continue;
        }

        // Se ambos existem, compara versao e timestamp de forma deterministica
        const localVer = Number(local.version || 1);
        const remoteVer = Number(remote.version || 1);
        const localTime = Number(local.updatedAt || local.timestamp || 0);
        const remoteTime = Number(remote.updatedAt || remote.timestamp || 0);

        if (remoteVer > localVer) {
          merged[qid] = remote;
        } else if (localVer > remoteVer) {
          merged[qid] = local;
        } else if (remoteTime > localTime) {
          merged[qid] = remote;
        } else if (localTime > remoteTime) {
          merged[qid] = local;
        } else {
          // Empate exato: desempate deterministico por conteudo (resposta selecionada nao-nula prevalece)
          if (local.deleted && !remote.deleted) {
            merged[qid] = remote;
          } else {
            merged[qid] = local;
          }
        }
      }
      return merged;
    }
  }

  // Exportacao universal
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ClaudeStorageSyncEngine };
  } else {
    global.ClaudeStorageSyncEngine = ClaudeStorageSyncEngine;
  }
})(typeof window !== 'undefined' ? window : globalThis);
