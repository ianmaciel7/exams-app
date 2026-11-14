import assert from 'node:assert/strict';
import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const dir = path.resolve('prototypes/board-exam-app/assets');
await mkdir(dir, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const report = { created: new Date().toISOString(), cases: [], pageErrors: [], limitations: [
  'Measured with headless Chromium on CI, not physical Android/iOS or screen reader.',
  'This test does not establish a CPU/battery/FPS budget or full WCAG conformance.',
  'Only the global graph route is covered, not the right contextual mini-graph.',
] };
const addr = 'http://127.0.0.1:8765/exam-app-0.1.1/index.html#/grafico';

async function openGraph(width) {
  const ctx = await browser.newContext({
    viewport: { width, height: 850 }, reducedMotion: 'reduce', deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  page.on('pageerror', err => report.pageErrors.push(err.message));
  await page.addInitScript(() => {
    window.__graphDrawCalls = 0;
    const oldClear = CanvasRenderingContext2D.prototype.clearRect;
    CanvasRenderingContext2D.prototype.clearRect = function(...args) {
      if (this.canvas?.id === 'gvc') window.__graphDrawCalls++;
      return oldClear.apply(this, args);
    };
  });
  const t0 = Date.now();
  await page.goto(addr, { waitUntil: 'domcontentloaded' });
  await page.locator('#gvc').waitFor({ timeout: 30000 });
  await page.waitForFunction(() => {
    const info = document.querySelector('.gv-info');
    return info && !info.textContent.includes('carregando');
  }, { timeout: 30000 });
  await page.waitForTimeout(180);
  return { ctx, page, navigateToCanvasMs: Date.now() - t0 };
}

async function state(page) {
  return page.evaluate(() => {
    const cv = document.getElementById('gvc');
    const label = cv.getAttribute('aria-label') || '';
    const nodes = label.match(/(\d+) objetos/);
    const edges = label.match(/(\d+) relações/);
    return {
      reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
      nodeCount: nodes ? Number(nodes[1]) : 0,
      edgeCount: edges ? Number(edges[1]) : 0,
      hidden: document.visibilityState !== 'visible',
      canvasWidth: cv.width,
      canvasHeight: cv.height,
      drawCalls: window.__graphDrawCalls,
    };
  });
}

async function shot(page, name) {
  await page.screenshot({
    path: path.join(dir, 'issue128_' + name + '.png'),
    animations: 'disabled', fullPage: false,
  });
}

try {
  for (const width of [390, 1366]) {
    const { ctx, page, navigateToCanvasMs } = await openGraph(width);
    try {
      const start = await state(page);
      assert.equal(start.reduced, true, 'reduced motion must be active before navigation');
      assert.ok(start.canvasWidth > 100 && start.canvasHeight > 100);
      assert.ok(start.nodeCount > 0);
      assert.ok(start.drawCalls >= 1, 'at least one graph draw occurred');

      await page.waitForTimeout(250);
      const idle = await state(page);
      assert.equal(idle.drawCalls, start.drawCalls, 'no background drawing with reduced motion');

      await page.locator('#gvc').focus();
      await page.keyboard.press('Equal');
      await page.waitForTimeout(150);
      const zoomed = await state(page);
      assert.ok(zoomed.drawCalls > idle.drawCalls, 'keyboard zoom redraws a single frame');

      const chip = page.locator('.gv-leg [data-gk]').first();
      assert.ok(await chip.count(), 'graph filter actions exist');
      const pressed = await chip.getAttribute('aria-pressed');
      await chip.click();
      assert.notEqual(await chip.getAttribute('aria-pressed'), pressed, 'filter toggles');
      await page.waitForTimeout(150);
      const filtered = await state(page);
      assert.ok(filtered.drawCalls > zoomed.drawCalls, 'filter applies and redraws');

      await shot(page, 'reduced_' + width);
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.waitForTimeout(250);
      const normal = await state(page);
      assert.equal(normal.reduced, false, 'dynamic preference change applies to existing graph');
      if (normal.nodeCount <= 240) {
        assert.ok(normal.drawCalls > filtered.drawCalls, 'non-reduced physics renders new frames');
      }
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.waitForTimeout(200);
      const restored = await state(page);
      assert.equal(restored.reduced, true);
      await page.waitForTimeout(250);
      const restoredIdle = await state(page);
      assert.equal(restoredIdle.drawCalls, restored.drawCalls, 'reduced motion must stop subsequent redraws');
      await shot(page, 'restored_' + width);

      report.cases.push({
        width, navigateToCanvasMs, reduced: start, idle, zoomed, filtered, normal, restored,
        screenshot: 'issue128_restored_' + width + '.png',
      });
    } finally {
      await ctx.close();
    }
  }
  assert.deepEqual(report.pageErrors, [], 'No unhandled JavaScript errors');
  console.log('Global graph: reduced-motion, idle, keyboard, filters and dynamic preference E2E PASS.');
} finally {
  await browser.close();
  await writeFile('prototypes/board-exam-app/issue128_motion_e2e.json', JSON.stringify(report, null, 2) + '\n');
}
