/**
 * Protocolo de Comunicação: Claude Storage Bridge PoC
 * Define a estrutura de mensagens, comandos suportados, códigos de erro e validações.
 */

export const BRIDGE_ACTION = 'CLAUDE_STORAGE_BRIDGE';

export const COMMANDS = {
  GET: 'get',
  SET: 'set',
  LIST: 'list',
  DELETE: 'delete',
  PING: 'ping'
};

export const ERROR_CODES = {
  INVALID_ORIGIN: 'INVALID_ORIGIN',
  INVALID_MESSAGE: 'INVALID_MESSAGE',
  DISALLOWED_KEY: 'DISALLOWED_KEY',
  TIMEOUT: 'TIMEOUT',
  DISCONNECTED: 'DISCONNECTED',
  STORAGE_ERROR: 'STORAGE_ERROR',
  UNKNOWN_COMMAND: 'UNKNOWN_COMMAND'
};

export const DEFAULT_ALLOWED_KEY_PREFIX = 'bridge-poc:';

export function isAllowedKey(key, prefix = DEFAULT_ALLOWED_KEY_PREFIX) {
  if (typeof key !== 'string') return false;
  return key.startsWith(prefix);
}

export function createRequest(command, payload = {}, id = null) {
  return {
    action: BRIDGE_ACTION,
    id: id || `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    command,
    payload,
    timestamp: Date.now()
  };
}

export function createResponse(requestId, success, data = null, error = null) {
  return {
    action: BRIDGE_ACTION,
    id: requestId,
    success,
    data,
    error,
    timestamp: Date.now()
  };
}

export function validateMessage(msg) {
  if (!msg || typeof msg !== 'object') return false;
  return msg.action === BRIDGE_ACTION && typeof msg.id === 'string' && typeof msg.command === 'string';
}
