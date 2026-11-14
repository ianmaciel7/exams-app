import test from 'node:test';
import assert from 'node:assert/strict';
import { MessageChannel } from 'node:worker_threads';
import { ClaudeStorageBridgeServer } from './server.mjs';
import { ClaudeStorageBridgeClient } from './client.mjs';
import { COMMANDS, ERROR_CODES } from './protocol.mjs';

test('Claude Storage Bridge PoC - Suite de Testes Automatizados', async (t) => {

  await t.test('1. Conexão e Ping via MessageChannel', async () => {
    const channel = new MessageChannel();
    const serverStorage = new Map();
    const server = new ClaudeStorageBridgeServer({ storage: serverStorage });
    const client = new ClaudeStorageBridgeClient();

    // Conectar porta do servidor
    channel.port2.on('message', (msg) => server.handleMessage({ data: msg }, channel.port2));
    
    // Conectar porta do cliente
    client.setPort(channel.port1);
    channel.port1.on('message', (msg) => client.handleResponse(msg));

    const pong = await client.ping();
    assert.equal(pong.pong, true);
    assert.ok(typeof pong.timestamp === 'number');

    channel.port1.close();
    channel.port2.close();
  });

  await t.test('2. Operações CRUD: set, get, list e delete com chaves de teste autorizadas', async () => {
    const channel = new MessageChannel();
    const serverStorage = new Map();
    const server = new ClaudeStorageBridgeServer({ storage: serverStorage });
    const client = new ClaudeStorageBridgeClient({ keyPrefix: 'bridge-poc:' });

    channel.port2.on('message', (msg) => server.handleMessage({ data: msg }, channel.port2));
    client.setPort(channel.port1);
    channel.port1.on('message', (msg) => client.handleResponse(msg));

    // 2.1 SET
    const testKey1 = 'bridge-poc:teste-001';
    const testVal1 = 'salvo-pelo-claude';
    const setSuccess = await client.set(testKey1, testVal1);
    assert.equal(setSuccess, true);
    assert.equal(serverStorage.get(testKey1), testVal1);

    // 2.2 GET
    const retrievedVal = await client.get(testKey1);
    assert.equal(retrievedVal, testVal1);

    // 2.3 LIST
    const testKey2 = 'bridge-poc:outro-teste';
    await client.set(testKey2, 'outro-valor');
    const keys = await client.list();
    assert.ok(Array.isArray(keys));
    assert.ok(keys.includes(testKey1));
    assert.ok(keys.includes(testKey2));

    // 2.4 DELETE
    const delResult = await client.delete(testKey1);
    assert.equal(delResult, true);
    const getAfterDel = await client.get(testKey1);
    assert.equal(getAfterDel, null);

    channel.port1.close();
    channel.port2.close();
  });

  await t.test('3. Restrição e isolamento: Rejeição de chaves fora do prefixo permitido', async () => {
    const channel = new MessageChannel();
    const serverStorage = new Map();
    serverStorage.set('user:secrets', 'dados_reais');
    const server = new ClaudeStorageBridgeServer({ storage: serverStorage });
    const client = new ClaudeStorageBridgeClient({ keyPrefix: 'bridge-poc:' });

    channel.port2.on('message', (msg) => server.handleMessage({ data: msg }, channel.port2));
    client.setPort(channel.port1);
    channel.port1.on('message', (msg) => client.handleResponse(msg));

    // Tentar acessar chave de produção/fora do escopo
    await assert.rejects(
      async () => await client.get('user:secrets'),
      (err) => {
        assert.equal(err.code, ERROR_CODES.DISALLOWED_KEY);
        return true;
      }
    );

    // Tentar gravar em chave fora do escopo
    await assert.rejects(
      async () => await client.set('exam-app:settings', 'hacked'),
      (err) => {
        assert.equal(err.code, ERROR_CODES.DISALLOWED_KEY);
        return true;
      }
    );

    channel.port1.close();
    channel.port2.close();
  });

  await t.test('4. Validação de Origem (Origin Checking)', async () => {
    const server = new ClaudeStorageBridgeServer({
      allowedOrigins: ['http://localhost:8765']
    });

    let sentResponse = null;
    const fakePort = {
      postMessage: (resp) => { sentResponse = resp; }
    };

    // Mensagem de origem maliciosa/não autorizada
    await server.handleMessage({
      origin: 'https://malicious-site.com',
      data: {
        action: 'CLAUDE_STORAGE_BRIDGE',
        id: 'req_evil_1',
        command: COMMANDS.GET,
        payload: { key: 'bridge-poc:test' }
      }
    }, fakePort);

    assert.ok(sentResponse);
    assert.equal(sentResponse.success, false);
    assert.equal(sentResponse.error.code, ERROR_CODES.INVALID_ORIGIN);

    // Mensagem de origem autorizada
    sentResponse = null;
    await server.handleMessage({
      origin: 'http://localhost:8765',
      data: {
        action: 'CLAUDE_STORAGE_BRIDGE',
        id: 'req_valid_1',
        command: COMMANDS.PING
      }
    }, fakePort);

    assert.ok(sentResponse);
    assert.equal(sentResponse.success, true);
  });

  await t.test('5. Tratamento de Timeout e Desconexão', async () => {
    const client = new ClaudeStorageBridgeClient({ timeoutMs: 100 });

    // Sem porta nem janela configurada
    await assert.rejects(
      async () => await client.ping(),
      (err) => {
        assert.equal(err.code, ERROR_CODES.DISCONNECTED);
        return true;
      }
    );

    // Porta conectada que nunca responde
    const channel = new MessageChannel();
    client.setPort(channel.port1);
    // Não registramos handler em port2 (silêncio total)

    await assert.rejects(
      async () => await client.ping(),
      (err) => {
        assert.equal(err.code, ERROR_CODES.TIMEOUT);
        return true;
      }
    );

    channel.port1.close();
    channel.port2.close();
  });

});
