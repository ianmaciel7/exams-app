import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const html = readFileSync(new URL('../prototypes/exam-app-0.1.1/index.html', import.meta.url), 'utf8');

test('workspace loading eliminates blind 5s timeout and blind 260ms mutation observer', () => {
  // Ensure the old blind timers are completely gone
  assert.doesNotMatch(html, /ldT\s*=\s*setTimeout\(\(\s*\)\s*=>\s*wsLoading\(false\)\s*,\s*5000\)/);
  assert.doesNotMatch(html, /q\s*=\s*setTimeout\(\(\s*\)\s*=>\s*wsLoading\(false\)\s*,\s*260\)/);

  // Ensure state machine and monotonic counter are defined
  assert.match(html, /let wsNavSeq=0,\s*wsLoadState='idle'/);
  assert.match(html, /function wsLoadingStart\(/);
  assert.match(html, /function wsLoadingEnd\(/);
  assert.match(html, /window\.wsLoadingState\s*=/);
});

test('workspace loading CSS contains state classes and respects prefers-reduced-motion', () => {
  assert.match(html, /\.ws-load\.pending\s+i/);
  assert.match(html, /\.ws-load\.success\s+i/);
  assert.match(html, /\.ws-load\.empty\s+i/);
  assert.match(html, /\.ws-load\.failed\s+i/);
  assert.match(html, /\.ws-load\.timed-out\s+i/);
  assert.match(html, /\.ws-load-banner/);
  assert.match(html, /@media\(prefers-reduced-motion:reduce\)\s*\{\s*\.ws-load\s+i\s*\{\s*animation:none!important/);
});

test('workspace loading state machine transitions, accessibility and race cancellation', () => {
  const extractSnippet = () => {
    const startAnchor = '/* ---- workspace loading state machine (Issue #161) ---- */';
    const endAnchor = 'new MutationObserver(()=>{ const t=curTab(), s=($(\'docTitle\').textContent';
    const i = html.indexOf(startAnchor);
    const j = html.indexOf(endAnchor, i);
    assert.ok(i >= 0 && j > i, 'could not extract loading state machine snippet');
    return html.slice(i, j);
  };

  const snippet = extractSnippet();

  class MockElement {
    constructor(id = '', tag = 'div') {
      this.id = id;
      this.tagName = tag.toUpperCase();
      this.className = '';
      this.attributes = new Map();
      this.children = [];
      this.parentNode = null;
      this.textContent = '';
      this.nextSibling = null;
    }
    setAttribute(name, value) { this.attributes.set(name, String(value)); }
    getAttribute(name) { return this.attributes.get(name) || null; }
    hasAttribute(name) { return this.attributes.has(name); }
    removeAttribute(name) { this.attributes.delete(name); }
    appendChild(child) {
      child.parentNode = this;
      this.children.push(child);
      return child;
    }
    insertBefore(newChild, refChild) {
      newChild.parentNode = this;
      const idx = this.children.indexOf(refChild);
      if (idx >= 0) this.children.splice(idx, 0, newChild);
      else this.children.push(newChild);
      return newChild;
    }
    remove() {
      if (this.parentNode) {
        const idx = this.parentNode.children.indexOf(this);
        if (idx >= 0) this.parentNode.children.splice(idx, 1);
        this.parentNode = null;
      }
    }
    querySelector(sel) {
      if (sel === '.ws-load-label') return this.children.find(c => c.className.includes('ws-load-label')) || null;
      if (sel === '.ws-load-banner-msg') return this.children.find(c => c.className.includes('ws-load-banner-msg')) || null;
      return null;
    }
  }

  const wsTabs = new MockElement('wsTabs');
  const main = new MockElement('main');
  main.appendChild(wsTabs);
  const wsLoad = new MockElement('wsLoad');
  wsTabs.appendChild(wsLoad);

  const elements = new Map([
    ['wsTabs', wsTabs],
    ['wsLoad', wsLoad],
    ['main', main]
  ]);

  const findById = (root, id) => {
    if (root.id === id) return root;
    for (const child of root.children) {
      const found = findById(child, id);
      if (found) return found;
    }
    return null;
  };

  let registeredClickListener = null;

  const sandbox = {
    $: id => findById(main, id) || elements.get(id) || null,
    esc: s => String(s || ''),
    location: { hash: '#/espaco' },
    clearTimeout: id => clearTimeout(id),
    setTimeout: (fn, ms) => setTimeout(fn, ms),
    document: {
      getElementById: id => findById(main, id) || elements.get(id) || null,
      createElement: tag => new MockElement('', tag),
      addEventListener: (evt, handler) => {
        if (evt === 'click') registeredClickListener = handler;
      }
    },
    window: {}
  };

  runInNewContext(snippet, sandbox);

  const api = sandbox.window.wsLoadingState;
  assert.ok(api, 'wsLoadingState must be exposed on window');

  // 1. Initial State
  assert.equal(api.state, 'idle');
  assert.equal(api.seq, 0);

  // 2. Start navigation -> pending
  const seq1 = api.start('#/concurso/dataprev');
  assert.equal(seq1, 1);
  assert.equal(api.seq, 1);
  assert.equal(api.state, 'pending');
  assert.equal(wsLoad.getAttribute('data-state'), 'pending');
  assert.equal(wsLoad.getAttribute('aria-busy'), 'true');
  assert.equal(wsLoad.getAttribute('role'), 'status');
  assert.equal(wsLoad.getAttribute('aria-live'), 'polite');
  const label = wsLoad.querySelector('.ws-load-label');
  assert.ok(label);
  assert.equal(label.textContent, 'Carregando área de trabalho…');

  // 3. Race condition / Stale navigation protection
  // Start second navigation before first completes
  const seq2 = api.start('#/quadro');
  assert.equal(seq2, 2);
  assert.equal(api.seq, 2);

  // Stale completion from seq 1 must be rejected
  const staleRes = api.end('success', { seq: seq1 });
  assert.equal(staleRes, false, 'Stale seq1 must be rejected');
  assert.equal(api.state, 'pending', 'State must remain pending for seq2');
  assert.equal(api.seq, 2);

  // 4. Successful completion for seq 2
  const validRes = api.end('success', { seq: seq2 });
  assert.equal(validRes, true);
  assert.equal(api.state, 'success');
  assert.equal(wsLoad.getAttribute('data-state'), 'success');
  assert.equal(wsLoad.getAttribute('aria-busy'), 'false');
  assert.equal(label.textContent, 'Conteúdo carregado com sucesso');

  // 5. Empty completion
  const seq3 = api.start('#/lixeira');
  assert.equal(seq3, 3);
  api.end('empty', { seq: seq3 });
  assert.equal(api.state, 'empty');
  assert.equal(wsLoad.getAttribute('data-state'), 'empty');
  assert.equal(label.textContent, 'Conteúdo carregado (nenhum item encontrado)');

  // 6. Failure with recovery action
  const seq4 = api.start('#/documento-inexistente');
  api.end('failed', { seq: seq4, error: 'Documento não encontrado' });
  assert.equal(api.state, 'failed');
  assert.equal(wsLoad.getAttribute('data-state'), 'failed');
  assert.equal(wsLoad.getAttribute('role'), 'alert');
  assert.match(label.textContent, /Erro ao carregar/);

  // Banner should have been mounted
  const banner = main.children.find(c => c.id === 'wsLoadBanner');
  assert.ok(banner, 'Recovery banner must be present on failure');
  assert.equal(banner.getAttribute('role'), 'alert');
  assert.match(banner.className, /failed/);
  assert.match(banner.innerHTML, /data-ws-retry/);
  assert.match(banner.innerHTML, /Voltar ao início/);

  // 7. Timeout with recovery action
  const seq5 = api.start('#/rota-lenta');
  api.end('timed-out', { seq: seq5 });
  assert.equal(api.state, 'timed-out');
  assert.equal(wsLoad.getAttribute('data-state'), 'timed-out');
  assert.equal(wsLoad.getAttribute('role'), 'alert');
  assert.equal(label.textContent, 'Tempo limite de carregamento esgotado');

  const timeoutBanner = main.children.find(c => c.id === 'wsLoadBanner');
  assert.ok(timeoutBanner, 'Recovery banner must be present on timed-out');
  assert.match(timeoutBanner.className, /timed-out/);
});

test('workspace loading satisfies zero emoji policy', () => {
  const emojiPattern = /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/u;
  const startAnchor = '/* ---- workspace loading state machine (Issue #161) ---- */';
  const endAnchor = 'new MutationObserver(()=>{ const t=curTab(), s=($(\'docTitle\').textContent';
  const i = html.indexOf(startAnchor);
  const j = html.indexOf(endAnchor, i);
  const snippet = html.slice(i, j);
  assert.doesNotMatch(snippet, emojiPattern, 'Zero Emoji Policy violation in loading state machine code');
});
