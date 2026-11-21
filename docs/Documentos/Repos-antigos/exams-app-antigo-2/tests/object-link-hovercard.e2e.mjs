import assert from 'node:assert/strict';
import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const root = path.resolve('prototype');
const assets = root;
await mkdir(assets, { recursive: true });
const report = {
  at: new Date().toISOString(),
  issue: 57,
  cases: [],
  errors: [],
  limitations: ['Headless Chromium, no independent assistive-technology or physical touch audit.']
};
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const url = 'http://127.0.0.1:8765/exam-app-0.1.1__index.html';
try {
  for (const width of [390, 1366]) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    page.on('pageerror', error => report.errors.push(error.message));
    try {
      await page.goto(url + '#/cargo/dataprev-2026-ti-dev', { waitUntil: 'domcontentloaded' });
      const link = page.locator('#view .op-side a.chip[href^="#/edicao/"]').first();
      await link.waitFor({ timeout: 15000 });
      const tooltip = page.locator('#op-object-hovercard');
      assert.equal(await tooltip.count(), 0, 'no preview before hovering');

      await link.evaluate(el => el.setAttribute('aria-describedby', 'previous-description'));
      await link.hover();
      await tooltip.waitFor({ timeout: 8000 });
      assert.equal(await tooltip.getAttribute('role'), 'tooltip');
      assert.match(await tooltip.innerText(), /Edição/);
      assert.ok((await tooltip.locator('strong').innerText()).length > 0);
      assert.equal(await link.getAttribute('aria-describedby'), 'previous-description op-object-hovercard');
      const bounds = await tooltip.boundingBox();
      assert.ok(bounds && bounds.x >= 0 && bounds.x + bounds.width <= width + 1, 'preview fits viewport');
      await page.screenshot({
        path: path.join(assets, 'issue57_relation_hovercard_' + width + '.png'),
        animations: 'disabled'
      });

      await page.mouse.move(1, 1);
      await tooltip.waitFor({ state: 'detached', timeout: 8000 });
      assert.equal(await link.getAttribute('aria-describedby'), 'previous-description', 'original description is restored');
      await link.focus();
      await tooltip.waitFor({ timeout: 8000 });
      assert.match(await link.getAttribute('aria-describedby'), /op-object-hovercard/);
      await page.screenshot({
        path: path.join(assets, 'issue57_relation_keyboard_' + width + '.png'),
        animations: 'disabled'
      });

      await link.press('Tab');
      await tooltip.waitFor({ state: 'detached', timeout: 8000 });
      await link.focus();
      await tooltip.waitFor({ timeout: 8000 });
      await page.goto(url + '#/tipo/cargo', { waitUntil: 'domcontentloaded' });
      await tooltip.waitFor({ state: 'detached', timeout: 8000 });
      report.cases.push({ width, hover: true, focus: true, cleanup: true,
        existingAriaPreserved: true, viewportClamped: true, routeCleanup: true });
    } finally {
      await ctx.close();
    }
  }
  assert.deepEqual(report.errors, [], 'no browser runtime errors');
} finally {
  await browser.close();
  await writeFile(path.join(root, 'issue57_link_hovercard_e2e.json'), JSON.stringify(report, null, 2) + '\n');
}
