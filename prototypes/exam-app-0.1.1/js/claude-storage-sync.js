/**
 * ClaudeStorageSyncEngine - Motor de Sincronizacao Offline-First para Exam App
 * 
 * Funcionalidades:
 * - Operacao 100% Offline-First: escritas e leituras locais sao imediatas.
 * - Fila de saida persistente em localStorage (Outbox Queue).
 * - Deteccao automatica de ambiente:
 *     a) No Claude Artifact: consome diretamente window.claude.use('db').
 *     b) No localhost: comunica com o proxy blindado em http://127.0.0.1:8766.
 * - Reconciliacao bidirecional de questoes e progresso (Merge por timestamp).
 * - Notificacao visual de status via badge SVG (Zero Emoji Policy).
 */

(function(global) {
  'use strict';

  const OUTBOX_KEY = 'exam_app_sync_outbox_v1';
  const META_KEY = 'exam_app_sync_meta_v1';
  const DEFAULT_SLUG = 'a728ae48-3fa2-4dbf-9092-0392c90b58f7'; // Artifact principal
  const PROXY_BASE = 'http://127.0.0.1:8766';

  class ClaudeStorageSyncEngine {
    constructor(options = {}) {
      this.slug = options.slug || DEFAULT_SLUG;
      this.proxyBase = options.proxyBase || PROXY_BASE;
      this.isOnline = navigator.onLine;
      this.isSyncing = false;
      this.syncListeners = [];
      this.directDb = null;
      this.isClaudeArtifact = false;
      this.flushTimer = null;
      this.retryDelay = 2000;

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
          this.notifyStatus('offline', 'Modo offline. Alterações salvas na fila.');
        });
      }

      // Tenta descarregar a fila pendente inicial
      this.initTimer = setTimeout(() => this.flushOutbox(), 1500);
      if (this.initTimer && typeof this.initTimer.unref === 'function') {
        this.initTimer.unref();
      }

      // Sincronizacao periodica a cada 45 segundos se houver fila
      this.intervalTimer = setInterval(() => {
        if (!this.isSyncing && this.getOutbox().length > 0) {
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
    }

    notifyStatus(state, message) {
      const meta = this.getMeta();
      meta.lastState = state;
      meta.lastMessage = message;
      this.setMeta(meta);

      const count = this.getOutbox().length;
      this.syncListeners.forEach(fn => fn({ state, message, pendingCount: count }));
    }

    getMeta() {
      try {
        return JSON.parse(localStorage.getItem(META_KEY)) || { lastSyncTime: 0, lastState: 'idle' };
      } catch (e) {
        return { lastSyncTime: 0, lastState: 'idle' };
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
     * Enfileira uma alteracao na fila de sincronizacao (Outbox).
     */
    enqueue(collection, docId, data, mergeKey = null) {
      const queue = this.getOutbox();
      const itemIndex = queue.findIndex(q => q.collection === collection && q.docId === docId);

      const item = {
        id: 'sync_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
        collection,
        docId,
        data,
        mergeKey,
        timestamp: Date.now(),
        attempts: 0
      };

      if (itemIndex >= 0) {
        // Se ja houver item pendente para este doc, mescla os dados
        if (typeof data === 'object' && typeof queue[itemIndex].data === 'object') {
          item.data = { ...queue[itemIndex].data, ...data };
        }
        queue[itemIndex] = item;
      } else {
        queue.push(item);
      }

      this.saveOutbox(queue);
      this.notifyStatus('pending', `${queue.length} alteração(ões) pendente(s)`);

      // Agenda tentativa de sincronizacao com debounce
      clearTimeout(this.flushTimer);
      this.flushTimer = setTimeout(() => this.flushOutbox(), 1200);
      if (this.flushTimer && typeof this.flushTimer.unref === 'function') {
        this.flushTimer.unref();
      }
    }

    /**
     * Processa e descarrega a fila de saida (Outbox).
     */
    async flushOutbox() {
      if (this.isSyncing) return;
      const queue = this.getOutbox();
      if (queue.length === 0) {
        this.notifyStatus('synced', 'Tudo sincronizado');
        return;
      }

      this.isSyncing = true;
      this.notifyStatus('syncing', `Sincronizando ${queue.length} item(ns)...`);

      const remaining = [];
      let successCount = 0;

      for (const item of queue) {
        try {
          await this.sendToRemote(item.collection, item.docId, item.data);
          successCount++;
        } catch (err) {
          console.warn('[SyncEngine] Falha ao enviar item remoto:', item, err);
          item.attempts = (item.attempts || 0) + 1;
          remaining.push(item);
        }
      }

      this.saveOutbox(remaining);
      this.isSyncing = false;

      if (remaining.length === 0) {
        const meta = this.getMeta();
        meta.lastSyncTime = Date.now();
        this.setMeta(meta);
        this.retryDelay = 2000;
        this.notifyStatus('synced', 'Sincronizado com Claude Pro');
      } else {
        this.notifyStatus('offline', `${remaining.length} item(ns) aguardando conexão`);
        // Backoff exponencial para proxima tentativa
        this.retryDelay = Math.min(this.retryDelay * 1.5, 30000);
        clearTimeout(this.flushTimer);
        this.flushTimer = setTimeout(() => this.flushOutbox(), this.retryDelay);
        if (this.flushTimer && typeof this.flushTimer.unref === 'function') {
          this.flushTimer.unref();
        }
      }
    }

    /**
     * Envia um documento individual para o Claude Pro DB (Direto ou via Proxy).
     */
    async sendToRemote(collection, docId, data) {
      if (this.isClaudeArtifact && this.directDb) {
        // Envio direto via runtime interno do Artifact
        const docRef = this.directDb.doc(`${collection}/${docId}`);
        await docRef.set(data, { merge: true });
        return true;
      }

      // Envio via proxy local (localhost)
      const url = `${this.proxyBase}/api/storage/${this.slug}/${collection}/${encodeURIComponent(docId)}`;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6000);

      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          signal: controller.signal
        });
        clearTimeout(timer);

        if (!res.ok) {
          throw new Error(`Proxy respondeu status HTTP ${res.status}`);
        }
        return true;
      } catch (err) {
        clearTimeout(timer);
        throw err;
      }
    }

    /**
     * Le um documento remoto do Claude Pro DB.
     */
    async fetchRemote(collection, docId) {
      if (this.isClaudeArtifact && this.directDb) {
        const docRef = this.directDb.doc(`${collection}/${docId}`);
        const snap = await docRef.get();
        return snap.exists ? snap.data() : null;
      }

      const url = `${this.proxyBase}/api/storage/${this.slug}/${collection}/${encodeURIComponent(docId)}`;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6000);

      try {
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timer);
        if (!res.ok) return null;
        const json = await res.json();
        return json.exists ? json.data : null;
      } catch (e) {
        clearTimeout(timer);
        return null;
      }
    }

    /**
     * Reconciliacao Inteligente de Respostas de Questoes (LWW por Questao).
     */
    reconcileAnswers(localAnswers, remoteAnswers) {
      const merged = { ...localAnswers };
      if (!remoteAnswers || typeof remoteAnswers !== 'object') return merged;

      for (const [qId, rAns] of Object.entries(remoteAnswers)) {
        if (!merged[qId]) {
          merged[qId] = rAns;
        } else {
          const lAns = merged[qId];
          const lTime = lAns?.timestamp || 0;
          const rTime = rAns?.timestamp || 0;
          if (rTime > lTime) {
            merged[qId] = rAns;
          }
        }
      }
      return merged;
    }
  }

  // Exportacao global
  global.ClaudeStorageSyncEngine = ClaudeStorageSyncEngine;

})(typeof window !== 'undefined' ? window : globalThis);
