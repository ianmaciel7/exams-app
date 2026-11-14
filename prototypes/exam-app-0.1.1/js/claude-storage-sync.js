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
      this.needsFlushAgain = false;
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
          // 2. Read-Merge-Write (3-Way Merge determinístico) para documentos compostos:
          // Se outros clientes alteraram o mesmo documento no servidor, unifica antes de gravar
          let payloadToSend = op.data;
          try {
            if (op.collection === 'exam_app_study' && op.docId === 'user_answers') {
              const remote = await this.fetchRemote('exam_app_study', 'user_answers');
              if (remote && remote.answers) {
                const merged = this.reconcileAnswers(op.data?.answers || {}, remote.answers);
                payloadToSend = { ...op.data, answers: merged, updatedAt: Date.now() };
              }
            } else if (op.collection === 'exam_app_study' && op.docId === 'cadernos') {
              const remote = await this.fetchRemote('exam_app_study', 'cadernos');
              if (remote && remote.cadernos) {
                const merged = this.reconcileCadernos(op.data?.cadernos || [], remote.cadernos);
                payloadToSend = { ...op.data, cadernos: merged, updatedAt: Date.now() };
              }
            } else if (op.collection === 'exam_app_spaces' && op.docId === 'spaces_list') {
              const remote = await this.fetchRemote('exam_app_spaces', 'spaces_list');
              if (remote && remote.spaces) {
                const merged = this.reconcileSpaces(op.data?.spaces || [], remote.spaces, op.data?.spaceOrder || [], remote.spaceOrder || []);
                payloadToSend = { ...op.data, spaces: merged.spaces, spaceOrder: merged.spaceOrder, updatedAt: Date.now() };
              }
            } else if (op.collection === 'exam_app_study' && op.docId === 'exam_state') {
              const remote = await this.fetchRemote('exam_app_study', 'exam_state');
              if (remote && remote.exam) {
                const merged = this.reconcileExam(op.data?.exam, remote.exam);
                payloadToSend = { ...op.data, exam: merged, updatedAt: Date.now() };
              }
            } else if (op.collection === 'exam_app_state' && op.docId === 'workspace_state') {
              const remote = await this.fetchRemote('exam_app_state', 'workspace_state');
              if (remote && remote.tabs) {
                const merged = this.reconcileWorkspace(op.data, remote);
                payloadToSend = { ...op.data, ...merged, updatedAt: Date.now() };
              }
            } else if (op.collection === 'exam_app_study' && op.docId === 'user_questions') {
              const remote = await this.fetchRemote('exam_app_study', 'user_questions');
              if (remote) {
                const merged = this.reconcileUserQuestions(op.data?.uq || [], remote.uq || [], op.data?.uqAns || {}, remote.uqAns || {});
                payloadToSend = { ...op.data, uq: merged.uq, uqAns: merged.uqAns, updatedAt: Date.now() };
              }
            }
          } catch (mergeErr) {
            // Em caso de falha transitória de leitura, segue com op.data original
          }

          // 2. Envia para o servidor remoto
          await this.sendToRemote(op.collection, op.docId, payloadToSend);

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
        const hasFresh = remainingQueue.some(op => op.status === 'pending' && (!op.attempts || op.attempts === 0));
        const delay = hasFresh
          ? 150
          : Math.min(2000 * Math.pow(1.5, remainingQueue[0].attempts || 1), 30000) + Math.floor(Math.random() * 500);
        this.notifyStatus('pending', `${remainingQueue.length} item(ns) pendente(s). Sincronizando...`);

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
      const localMap = (localAnswers && typeof localAnswers === 'object') ? localAnswers : {};
      const remoteMap = (remoteAnswers && typeof remoteAnswers === 'object') ? remoteAnswers : {};
      const merged = {};
      const allQids = new Set([...Object.keys(localMap), ...Object.keys(remoteMap)]);

      for (const qid of allQids) {
        const local = localMap[qid];
        const remote = remoteMap[qid];

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

    /**
     * Reconcilia estado de simulado em andamento (respostas, marcadas e status).
     */
    reconcileExam(localExam = null, remoteExam = null) {
      const l = (localExam && typeof localExam === 'object') ? localExam : null;
      const r = (remoteExam && typeof remoteExam === 'object') ? remoteExam : null;
      if (!l && r) return r;
      if (l && !r) return l;
      if (!l && !r) return null;

      const localTime = Number(l.updatedAt || l.started || 0);
      const remoteTime = Number(r.updatedAt || r.started || 0);

      const base = remoteTime > localTime ? { ...r } : { ...l };
      const other = remoteTime > localTime ? l : r;

      const mergedAnswers = { ...(other.answers || {}), ...(base.answers || {}) };
      const mergedMarked = Array.from(new Set([...(l.marked || []), ...(r.marked || [])]));

      base.answers = mergedAnswers;
      base.marked = mergedMarked;
      base.updatedAt = Math.max(localTime, remoteTime);
      base.finished = (l.finished || r.finished) ? (base.finished || other.finished) : null;
      return base;
    }

    /**
     * Reconcilia cadernos de estudo e de erros com preservacao de tombstone e uniao de questoes.
     */
    reconcileCadernos(localCadernos = [], remoteCadernos = []) {
      const map = new Map();
      const localList = Array.isArray(localCadernos) ? localCadernos : [];
      const remoteList = Array.isArray(remoteCadernos) ? remoteCadernos : [];

      for (const item of localList) {
        if (item && item.id) map.set(item.id, { ...item, _source: 'local' });
      }

      for (const rItem of remoteList) {
        if (!rItem || !rItem.id) continue;
        if (!map.has(rItem.id)) {
          map.set(rItem.id, { ...rItem, _source: 'remote' });
        } else {
          const lItem = map.get(rItem.id);
          const lTime = Number(lItem.updatedAt || lItem.createdAt || 0);
          const rTime = Number(rItem.updatedAt || rItem.createdAt || 0);

          if (rItem.deleted && rTime >= lTime) {
            map.set(rItem.id, { ...rItem, deleted: true });
          } else if (lItem.deleted && lTime >= rTime) {
            map.set(rItem.id, { ...lItem, deleted: true });
          } else {
            const winner = rTime > lTime ? rItem : lItem;
            const qSet = new Set([...(lItem.questionIds || []), ...(rItem.questionIds || [])]);
            map.set(rItem.id, {
              ...winner,
              questionIds: Array.from(qSet),
              updatedAt: Math.max(lTime, rTime)
            });
          }
        }
      }

      return Array.from(map.values()).filter(c => !c.deleted);
    }

    /**
     * Reconcilia espacos de estudo e preserva ordenacao de sidebar.
     */
    reconcileSpaces(localSpaces = [], remoteSpaces = [], localOrder = [], remoteOrder = []) {
      const map = new Map();
      const lList = Array.isArray(localSpaces) ? localSpaces : [];
      const rList = Array.isArray(remoteSpaces) ? remoteSpaces : [];

      for (const s of lList) {
        if (s && s.id && s.id !== 'dataprev') map.set(s.id, { ...s });
      }

      for (const s of rList) {
        if (!s || !s.id || s.id === 'dataprev') continue;
        if (!map.has(s.id)) {
          map.set(s.id, { ...s });
        } else {
          const l = map.get(s.id);
          const lTime = Number(l.updatedAt || 0);
          const rTime = Number(s.updatedAt || 0);
          map.set(s.id, rTime > lTime ? { ...l, ...s } : { ...s, ...l });
        }
      }

      const orderSet = new Set([...(remoteOrder || []), ...(localOrder || [])]);
      const spaces = Array.from(map.values());
      const sortedOrder = Array.from(orderSet).filter(id => id === 'dataprev' || map.has(id));

      return { spaces, spaceOrder: sortedOrder };
    }

    /**
     * Reconcilia estado de workspaces (abas abertas e historico).
     */
    reconcileWorkspace(localWs = null, remoteWs = null) {
      const l = (localWs && typeof localWs === 'object') ? localWs : null;
      const r = (remoteWs && typeof remoteWs === 'object') ? remoteWs : null;
      if (!l && r) return r;
      if (l && !r) return l;
      if (!l && !r) return null;

      const lTabs = Array.isArray(l.tabs) ? l.tabs : [];
      const rTabs = Array.isArray(r.tabs) ? r.tabs : [];

      const tabMap = new Map();
      for (const t of rTabs) if (t && t.id) tabMap.set(t.id, t);
      for (const t of lTabs) if (t && t.id) tabMap.set(t.id, t);

      const lTime = Number(l.updatedAt || 0);
      const rTime = Number(r.updatedAt || 0);
      const active = (lTime >= rTime ? l.active : r.active) || (Array.from(tabMap.keys())[0] || null);

      return {
        active,
        tabs: Array.from(tabMap.values()),
        updatedAt: Math.max(lTime, rTime)
      };
    }

    /**
     * Reconcilia questoes avulsas do usuario (uq) e suas respostas (uqAns).
     */
    reconcileUserQuestions(localUq = [], remoteUq = [], localAns = {}, remoteAns = {}) {
      const qMap = new Map();
      for (const q of (Array.isArray(localUq) ? localUq : [])) {
        if (q && q.id) qMap.set(q.id, q);
      }
      for (const q of (Array.isArray(remoteUq) ? remoteUq : [])) {
        if (!q || !q.id) continue;
        if (!qMap.has(q.id)) {
          qMap.set(q.id, q);
        } else {
          const l = qMap.get(q.id);
          const lTime = Number(l.updatedAt || 0);
          const rTime = Number(q.updatedAt || 0);
          qMap.set(q.id, rTime > lTime ? q : l);
        }
      }

      const mergedAns = { ...(localAns || {}), ...(remoteAns || {}) };

      return {
        uq: Array.from(qMap.values()),
        uqAns: mergedAns
      };
    }

    /**
     * Recupera todas as 5 categorias de dados persistidos no Claude Pro DB:
     * - user_answers
     * - exam_state
     * - cadernos
     * - spaces_list
     * - workspace_state
     * - user_questions
     */
    async recoverAllRemote() {
      const results = {
        answers: null,
        exam: null,
        cadernos: null,
        spaces: null,
        workspace: null,
        userQuestions: null
      };

      try {
        const [ansDoc, examDoc, cadDoc, spDoc, wsDoc, uqDoc] = await Promise.allSettled([
          this.fetchRemote('exam_app_study', 'user_answers'),
          this.fetchRemote('exam_app_study', 'exam_state'),
          this.fetchRemote('exam_app_study', 'cadernos'),
          this.fetchRemote('exam_app_spaces', 'spaces_list'),
          this.fetchRemote('exam_app_state', 'workspace_state'),
          this.fetchRemote('exam_app_study', 'user_questions')
        ]);

        if (ansDoc.status === 'fulfilled' && ansDoc.value?.answers) {
          results.answers = ansDoc.value.answers;
        }
        if (examDoc.status === 'fulfilled' && examDoc.value?.exam) {
          results.exam = examDoc.value.exam;
        }
        if (cadDoc.status === 'fulfilled' && cadDoc.value?.cadernos) {
          results.cadernos = cadDoc.value.cadernos;
        }
        if (spDoc.status === 'fulfilled' && spDoc.value) {
          results.spaces = spDoc.value;
        }
        if (wsDoc.status === 'fulfilled' && wsDoc.value) {
          results.workspace = wsDoc.value;
        }
        if (uqDoc.status === 'fulfilled' && uqDoc.value) {
          results.userQuestions = uqDoc.value;
        }
      } catch (err) {
        console.warn('[SyncEngine] Falha ao recuperar dados remotos no boot:', err);
      }

      return results;
    }
  }

  // Exportacao universal
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ClaudeStorageSyncEngine };
  } else {
    global.ClaudeStorageSyncEngine = ClaudeStorageSyncEngine;
  }
})(typeof window !== 'undefined' ? window : globalThis);
