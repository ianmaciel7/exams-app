import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

// Runs the actual graph scheduler source in a tiny DOM/rAF harness.
// This is not a substitute for real-browser, accessibility or performance tests.
const html = readFileSync(new URL('../prototypes/exam-app-0.1.1/index.html', import.meta.url), 'utf8');
const start = html.indexOf("  st.motionMQ=matchMedia('(prefers-reduced-motion: reduce)');");
const end = html.indexOf('  const hit=(px,py)=>', start);
assert.ok(start >= 0 && end > start, 'graph scheduler anchors exist');
const scheduler = html.slice(start, end);

function harness({ reduced = false, physicsEnabled = true, intersection = false } = {}) {
  const frames = new Map();
  const listeners = new Map();
  const mediaListeners = new Set();
  let nextFrame = 0, ticks = 0, draws = 0, io;
  const nodes = [{ vx: 2, vy: -1 }, { vx: -1, vy: 3 }];
  const st = {
    stop: false, raf: 0, dirty: true, alpha: 1, drag: -1,
    physicsEnabled, intersecting: true, W: 0, H: 0, dpr: 1
  };
  const motionMQ = {
    matches: reduced,
    addEventListener(type, fn) { if (type === 'change') mediaListeners.add(fn); },
    removeEventListener(type, fn) { if (type === 'change') mediaListeners.delete(fn); }
  };
  const document = {
    visibilityState: 'visible',
    body: { contains: () => true },
    addEventListener(type, fn) { listeners.set(type, fn); },
    removeEventListener(type, fn) { if (listeners.get(type) === fn) listeners.delete(type); }
  };
  const wrap = {
    getClientRects: () => [{}],
    getBoundingClientRect: () => ({ width: 480, height: 320 })
  };
  const cv = { style: {} };
  const window = {};
  if (intersection) {
    window.IntersectionObserver = class {
      constructor(cb) { this.cb = cb; io = this; }
      observe() {}
      disconnect() {}
    };
  }
  const ctx = {
    st, nodes, motionMQ, document, wrap, cv, window, IntersectionObserver: window.IntersectionObserver, devicePixelRatio: 1,
    matchMedia: () => motionMQ,
    requestAnimationFrame(fn) { const id = ++nextFrame; frames.set(id, fn); return id; },
    cancelAnimationFrame(id) { frames.delete(id); },
    tick() { ticks++; st.alpha *= 0.5; },
    draw() { draws++; },
    fit() {}
  };
  const api = runInNewContext(`(function(){${scheduler}\nreturn { invalidate, pause }; })()`, ctx);
  return {
    st, nodes, document, motionMQ, api,
    get ticks() { return ticks; },
    get draws() { return draws; },
    get pending() { return frames.size; },
    flush() {
      assert.ok(frames.size > 0, 'frame is scheduled');
      const [id, fn] = frames.entries().next().value;
      frames.delete(id);
      fn();
    },
    setReduced(value) {
      motionMQ.matches = value;
      for (const fn of mediaListeners) fn({ matches: value });
    },
    setVisible(value) {
      document.visibilityState = value ? 'visible' : 'hidden';
      listeners.get('visibilitychange')?.();
    },
    setIntersecting(value) {
      assert.ok(io, 'IntersectionObserver exists');
      io.cb([{ isIntersecting: value }]);
    }
  };
}

test('reduced motion draws once without any physics loop', () => {
  const h = harness({ reduced: true });
  assert.equal(h.pending, 1);
  h.flush();
  assert.equal(h.ticks, 0);
  assert.equal(h.draws, 1);
  assert.equal(h.pending, 0);
  h.api.invalidate();
  h.flush();
  assert.equal(h.ticks, 0);
  assert.equal(h.draws, 2);
  assert.equal(h.pending, 0);
});

test('switching reduced motion on cancels the loop and zeros velocities', () => {
  const h = harness();
  h.flush();
  assert.equal(h.ticks, 1);
  assert.equal(h.pending, 1);
  h.setReduced(true);
  assert.equal(h.pending, 1, 'single redraw is queued after cancelling physics');
  assert.ok(h.nodes.every(n => n.vx === 0 && n.vy === 0));
  h.flush();
  assert.equal(h.ticks, 1);
  assert.equal(h.pending, 0);
  h.setReduced(false);
  assert.equal(h.pending, 1);
  h.flush();
  assert.equal(h.ticks, 2);
});

test('hidden tab and offscreen canvas pause and resume scheduling', () => {
  const h = harness({ intersection: true });
  h.flush();
  assert.equal(h.pending, 1);
  h.setVisible(false);
  assert.equal(h.pending, 0);
  h.setVisible(true);
  assert.equal(h.pending, 1);
  h.setIntersecting(false);
  assert.equal(h.pending, 0);
  h.setIntersecting(true);
  assert.equal(h.pending, 1);
  h.flush();
  assert.equal(h.ticks, 2);
});

test('dense graph falls back to event-driven static drawing', () => {
  const h = harness({ physicsEnabled: false });
  h.flush();
  assert.equal(h.ticks, 0);
  assert.equal(h.pending, 0);
  h.api.invalidate();
  h.flush();
  assert.equal(h.draws, 2);
  assert.equal(h.ticks, 0);
});

test('normal physics eventually stops at rest', () => {
  const h = harness();
  let count = 0;
  while (h.pending && count++ < 30) h.flush();
  assert.equal(h.pending, 0);
  assert.ok(h.ticks > 0 && h.ticks < 30);
});
