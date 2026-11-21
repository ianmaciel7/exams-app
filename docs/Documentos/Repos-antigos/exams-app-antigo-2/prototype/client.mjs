import {
  BRIDGE_ACTION,
  COMMANDS,
  ERROR_CODES,
  isAllowedKey,
  createRequest
} from './protocol.mjs';

/**
 * Cliente que executa no localhost (Exam App) para interagir com a ponte.
 */
export class ClaudeStorageBridgeClient {
  constructor(options = {}) {
    this.targetWindow = options.targetWindow || null;
    this.targetPort = options.targetPort || null;
    this.targetOrigin = options.targetOrigin || '*';
    this.timeoutMs = options.timeoutMs || 3000;
    this.keyPrefix = options.keyPrefix || 'bridge-poc:';
    this.pendingRequests = new Map();
    this.onLog = options.onLog || (() => {});
  }

  setTarget(targetWindow, targetOrigin = '*') {
    this.targetWindow = targetWindow;
    this.targetOrigin = targetOrigin;
  }

  setPort(port) {
    this.targetPort = port;
    if (this.targetPort) {
      this.targetPort.onmessage = (event) => this.handleResponse(event.data);
    }
  }

  handleResponse(data) {
    if (!data || data.action !== BRIDGE_ACTION || !data.id) return;
    const pending = this.pendingRequests.get(data.id);
    if (!pending) return;

    clearTimeout(pending.timer);
    this.pendingRequests.delete(data.id);

    if (data.success) {
      pending.resolve(data.data);
    } else {
      pending.reject(data.error || { code: ERROR_CODES.STORAGE_ERROR, message: 'Falha desconhecida na operação' });
    }
  }

  send(command, payload = {}) {
    return new Promise((resolve, reject) => {
      if (!this.targetPort && !this.targetWindow) {
        return reject({ code: ERROR_CODES.DISCONNECTED, message: 'Nenhum canal ou janela alvo configurada' });
      }

      const req = createRequest(command, payload);
      const timer = setTimeout(() => {
        if (this.pendingRequests.has(req.id)) {
          this.pendingRequests.delete(req.id);
          reject({
            code: ERROR_CODES.TIMEOUT,
            message: `Tempo limite de resposta (${this.timeoutMs}ms) excedido para ${command}`
          });
        }
      }, this.timeoutMs);

      this.pendingRequests.set(req.id, { resolve, reject, timer });

      try {
        if (this.targetPort) {
          this.targetPort.postMessage(req);
        } else if (this.targetWindow) {
          this.targetWindow.postMessage(req, this.targetOrigin);
        }
      } catch (err) {
        clearTimeout(timer);
        this.pendingRequests.delete(req.id);
        reject({ code: ERROR_CODES.DISCONNECTED, message: err.message || String(err) });
      }
    });
  }

  async ping() {
    return this.send(COMMANDS.PING);
  }

  async get(key) {
    if (!isAllowedKey(key, this.keyPrefix)) {
      throw { code: ERROR_CODES.DISALLOWED_KEY, message: `Chave fora do escopo permitido: ${key}` };
    }
    const res = await this.send(COMMANDS.GET, { key });
    return res.value;
  }

  async set(key, value) {
    if (!isAllowedKey(key, this.keyPrefix)) {
      throw { code: ERROR_CODES.DISALLOWED_KEY, message: `Chave fora do escopo permitido: ${key}` };
    }
    const res = await this.send(COMMANDS.SET, { key, value });
    return res.success;
  }

  async list(prefix) {
    const effective = prefix || this.keyPrefix;
    if (!effective.startsWith(this.keyPrefix)) {
      throw { code: ERROR_CODES.DISALLOWED_KEY, message: `Prefixo fora do escopo permitido: ${effective}` };
    }
    const res = await this.send(COMMANDS.LIST, { prefix: effective });
    return res.keys;
  }

  async delete(key) {
    if (!isAllowedKey(key, this.keyPrefix)) {
      throw { code: ERROR_CODES.DISALLOWED_KEY, message: `Chave fora do escopo permitido: ${key}` };
    }
    const res = await this.send(COMMANDS.DELETE, { key });
    return res.deleted;
  }
}
