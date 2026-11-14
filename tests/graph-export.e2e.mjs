import assert from 'node:assert/strict';
import path from 'node:path';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const dir = path.resolve('prototypes/board-exam-app/assets');
await mkdir(dir, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const report = { date: new Date().toISOString(), cases: [], errors: [], limits: [
  'This is a functional PNG export test, not completion of all graph controls in Issue #68.',
] };

try {
  for (const width of [390, 1366]) {
    const context = await browser.newContext({
      viewport: { width, height: 850 }, acceptDownloads: true, reducedMotion: 'reduce',
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    page.on('pageerror', e => report.errors.push(e.message));
    try {
      await page.goto('http://127.0.0.1:8765/exam-app-0.1.1/index.html#/grafico', { waitUntil: 'domcontentloaded' });
      await page.locator('#gvExport').waitFor({ timeout: 30000 });
      await page.waitForFunction(() => {
        const status = document.querySelector('.gv-info');
        return status && !status.textContent.includes('carregando');
      });
      const button = page.locator('#gvExport');
      assert.equal(await button.getAttribute('aria-label'), 'Exportar grafo como imagem PNG');
      const dims = await page.locator('#gvc').evaluate(cv => ({
        width: cv.width, height: cv.height,
        cssWidth: cv.clientWidth, cssHeight: cv.clientHeight,
      }));
      await page.screenshot({
        path: path.join(dir, 'issue68_graph_toolbar_' + width + '.png'),
        animations: 'disabled', fullPage: false,
      });
      await button.focus();
      assert.equal(await button.evaluate(el => document.activeElement === el), true);
      const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
      await page.keyboard.press('Enter');
      const download = await downloadPromise;
      assert.equal(download.suggestedFilename(), 'exam-app-grafo.png');
      const filename = 'issue68_export_graph_' + width + '.png';
      await download.saveAs(path.join(dir, filename));
      const bytes = await readFile(path.join(dir, filename));
      assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], 'real PNG signature');
      assert.ok(bytes.length > 10000, 'PNG must not be empty');
      assert.equal(bytes.readUInt32BE(16), dims.width, 'export matches canvas pixel width');
      assert.equal(bytes.readUInt32BE(20), dims.height, 'export matches canvas pixel height');
      report.cases.push({ width, ...dims, savedFile: filename, pngBytes: bytes.length,
        screenshot: 'issue68_graph_toolbar_' + width + '.png', keyboardExport: true });
    } finally {
      await context.close();
    }
  }
  assert.deepEqual(report.errors, [], 'no uncaught browser errors');
  console.log('Graph export E2E passed: keyboard-accessible PNG in mobile and desktop at DPR 2.');
} finally {
  await browser.close();
  await writeFile('prototypes/board-exam-app/issue68_export_e2e.json', JSON.stringify(report, null, 2) + '\n');
}
