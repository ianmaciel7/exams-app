/**
 * Adaptador Modular de Armazenamento para o Exam App.
 * Permite alternar entre o Claude Pro Database (via Proxy Local 127.0.0.1:8766)
 * e o armazenamento local (localStorage) como fallback resiliente.
 */

export class ClaudeStorageClient {
  constructor(options = {}) {
    // Experimental private API. A successful local fallback is NOT a confirmed cloud sync.
    this.proxyUrl = options.proxyUrl || 'http://127.0.0.1:8766';
    this.slug = options.slug || '34cd390a-738f-4dfc-8ae2-6c4f90794d74';
    this.collection = options.collection || 'bridge-poc';
    this.timeoutMs = options.timeoutMs || 4000;
    this.fallbackToLocal = options.fallbackToLocal ?? true;
    this.onLog = options.onLog || (() => {});
  }

  async fetchWithTimeout(url, fetchOpts = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await fetch(url, { ...fetchOpts, signal: controller.signal });
      clearTimeout(timer);
      return res;
    } catch (err) {
      clearTimeout(timer);
      if (err.name === 'AbortError') {
        throw new Error(`Timeout de ${this.timeoutMs}ms excedido na requisição`);
      }
      throw err;
    }
  }

  async get(key) {
    const url = `${this.proxyUrl}/api/storage/${this.slug}/${this.collection}/${encodeURIComponent(key)}`;
    try {
      const res = await this.fetchWithTimeout(url, { method: 'GET' });
      if (!res.ok) {
        throw new Error(`Proxy respondeu HTTP ${res.status}`);
      }
      const data = await res.json();
      if (!data.exists) return null;
      return data.data?.value ?? data.data;
    } catch (err) {
      this.onLog(`[ClaudeStorageClient] Falha ao ler do Claude Pro: ${err.message}.`);
      if (this.fallbackToLocal && typeof localStorage !== 'undefined') {
        this.onLog(`[ClaudeStorageClient] Recorrendo ao localStorage para a chave ${key}`);
        const local = localStorage.getItem(`${this.collection}:${key}`);
        return local ? JSON.parse(local) : null;
      }
      throw err;
    }
  }

  async set(key, value) {
    const url = `${this.proxyUrl}/api/storage/${this.slug}/${this.collection}/${encodeURIComponent(key)}`;
    const payload = typeof value === 'object' ? value : { value };

    try {
      const res = await this.fetchWithTimeout(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        throw new Error(`Proxy respondeu HTTP ${res.status}`);
      }
      const data = await res.json();
      
      // Sincroniza localmente se habilitado
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(`${this.collection}:${key}`, JSON.stringify(value));
      }
      return data.version;
    } catch (err) {
      this.onLog(`[ClaudeStorageClient] Falha ao gravar no Claude Pro: ${err.message}`);
      if (this.fallbackToLocal && typeof localStorage !== 'undefined') {
        this.onLog(`[ClaudeStorageClient] Gravando apenas no localStorage como contingência offline`);
        localStorage.setItem(`${this.collection}:${key}`, JSON.stringify(value));
        return 'local-fallback';
      }
      throw err;
    }
  }

  async delete(key) {
    const url = `${this.proxyUrl}/api/storage/${this.slug}/${this.collection}/${encodeURIComponent(key)}`;
    try {
      const res = await this.fetchWithTimeout(url, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error(`Proxy respondeu HTTP ${res.status}`);
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(`${this.collection}:${key}`);
      }
      return true;
    } catch (err) {
      // Remote deletion failed: retain local data instead of silently losing the only copy.
      this.onLog('[ClaudeStorageClient] Exclusão remota não confirmada; dados locais preservados.');
      throw err;
    }
  }
}
