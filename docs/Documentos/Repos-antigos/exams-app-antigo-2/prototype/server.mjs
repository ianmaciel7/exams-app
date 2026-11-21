import {
  BRIDGE_ACTION,
  COMMANDS,
  ERROR_CODES,
  isAllowedKey,
  createResponse
} from './protocol.mjs';

/**
 * Servidor / Responder que executa dentro do Artifact ou ambiente simulado.
 */
export class ClaudeStorageBridgeServer {
  constructor(options = {}) {
    this.allowedOrigins = options.allowedOrigins || ['http://localhost:8765', 'http://127.0.0.1:8765'];
    this.keyPrefix = options.keyPrefix || 'bridge-poc:';
    this.storage = options.storage || new Map(); // default in-memory or window.storage adapter
    this.onLog = options.onLog || (() => {});
  }

  async handleMessage(event, port = null) {
    const origin = event.origin || '';
    const data = event.data;

    // Se houver origens restritas e origin for especificada (em navegadores reais)
    if (this.allowedOrigins.length > 0 && origin && origin !== 'null' && !this.allowedOrigins.includes(origin)) {
      this.onLog(`[Server] Origem rejeitada: ${origin}`);
      const errResp = createResponse(data?.id || 'unknown', false, null, {
        code: ERROR_CODES.INVALID_ORIGIN,
        message: `Origem não autorizada: ${origin}`
      });
      this.reply(event, port, errResp);
      return;
    }

    if (!data || data.action !== BRIDGE_ACTION) {
      return; // Ignora mensagens alheias
    }

    const { id, command, payload } = data;

    try {
      switch (command) {
        case COMMANDS.PING: {
          this.reply(event, port, createResponse(id, true, { pong: true, timestamp: Date.now() }));
          break;
        }

        case COMMANDS.GET: {
          const { key } = payload || {};
          if (!isAllowedKey(key, this.keyPrefix)) {
            throw { code: ERROR_CODES.DISALLOWED_KEY, message: `Chave fora do escopo permitido: ${key}` };
          }
          const val = await this.storageGet(key);
          this.reply(event, port, createResponse(id, true, { key, value: val }));
          break;
        }

        case COMMANDS.SET: {
          const { key, value } = payload || {};
          if (!isAllowedKey(key, this.keyPrefix)) {
            throw { code: ERROR_CODES.DISALLOWED_KEY, message: `Chave fora do escopo permitido: ${key}` };
          }
          await this.storageSet(key, value);
          this.reply(event, port, createResponse(id, true, { key, success: true }));
          break;
        }

        case COMMANDS.LIST: {
          const { prefix } = payload || {};
          const effectivePrefix = prefix || this.keyPrefix;
          if (!effectivePrefix.startsWith(this.keyPrefix)) {
            throw { code: ERROR_CODES.DISALLOWED_KEY, message: `Prefixo fora do escopo permitido: ${effectivePrefix}` };
          }
          const keys = await this.storageList(effectivePrefix);
          this.reply(event, port, createResponse(id, true, { keys }));
          break;
        }

        case COMMANDS.DELETE: {
          const { key } = payload || {};
          if (!isAllowedKey(key, this.keyPrefix)) {
            throw { code: ERROR_CODES.DISALLOWED_KEY, message: `Chave fora do escopo permitido: ${key}` };
          }
          await this.storageDelete(key);
          this.reply(event, port, createResponse(id, true, { key, deleted: true }));
          break;
        }

        default: {
          throw { code: ERROR_CODES.UNKNOWN_COMMAND, message: `Comando desconhecido: ${command}` };
        }
      }
    } catch (err) {
      const errorObj = {
        code: err.code || ERROR_CODES.STORAGE_ERROR,
        message: err.message || String(err)
      };
      this.reply(event, port, createResponse(id, false, null, errorObj));
    }
  }

  reply(event, port, response) {
    if (port && typeof port.postMessage === 'function') {
      port.postMessage(response);
    } else if (event.ports && event.ports[0]) {
      event.ports[0].postMessage(response);
    } else if (event.source && typeof event.source.postMessage === 'function') {
      const targetOrigin = (event.origin && event.origin !== 'null') ? event.origin : '*';
      event.source.postMessage(response, targetOrigin);
    }
  }

  // Abstração de armazenamento (funciona com Map ou window.storage nativo)
  async storageGet(key) {
    if (this.storage.get && typeof this.storage.get === 'function') {
      const val = await this.storage.get(key);
      return val ?? null;
    }
    return this.storage.get(key) ?? null;
  }

  async storageSet(key, value) {
    if (this.storage.set && typeof this.storage.set === 'function') {
      return await this.storage.set(key, value);
    }
    this.storage.set(key, value);
  }

  async storageDelete(key) {
    if (this.storage.delete && typeof this.storage.delete === 'function') {
      return await this.storage.delete(key);
    }
    this.storage.delete(key);
  }

  async storageList(prefix) {
    if (this.storage.list && typeof this.storage.list === 'function') {
      const all = await this.storage.list(prefix);
      if (Array.isArray(all)) return all.filter(k => k.startsWith(prefix));
      return all;
    }
    // Caso Map em memória
    if (typeof this.storage.keys === 'function') {
      const res = [];
      for (const k of this.storage.keys()) {
        if (k.startsWith(prefix)) res.push(k);
      }
      return res;
    }
    return [];
  }
}
