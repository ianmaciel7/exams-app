import assert from 'node:assert/strict';
import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const assets = path.resolve('prototype');
await mkdir(assets, { recursive: true });
const report = { at: new Date().toISOString(), issue: 55, cases: [], errors: [], limitations: [
  'Chromium emulation does not replace screen-reader or physical touch validation.'
] };
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
try {
  for (const width of [390, 1366]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', error => report.errors.push(error.message));
    try {
      await page.goto('http://127.0.0.1:8765/exam-app-0.1.1__index.html#/espaco', { waitUntil: 'domcontentloaded' });
      let tab = page.locator('#wsTabList [data-tab].on');
      await tab.waitFor({ timeout: 15000 });
      const id = await tab.getAttribute('data-tab');
      assert.equal(await tab.locator('[role="tab"]').getAttribute('aria-keyshortcuts'), 'Shift+P');
      assert.match(await tab.locator('[role="tab"]').getAttribute('aria-description'), /Shift\+P/);
      await tab.locator('[role="tab"]').focus();
      await tab.locator('[role="tab"]').press('Shift+P');
      tab = page.locator('#wsTabList [data-tab="' + id + '"]');
      assert.ok((await tab.getAttribute('class')).includes('pinned'));
      assert.match(await tab.locator('[role="tab"]').getAttribute('aria-label'), /fixada/);
      assert.equal(await tab.locator('[role="tab"]').evaluate(el => document.activeElement === el), true, 'focus preserved after pin');
      await page.screenshot({ path: path.join(assets, 'issue55_keyboard_pinned_' + width + '.png'), animations: 'disabled' });

      await tab.locator('[role="tab"]').press('Shift+P');
      assert.doesNotMatch(await tab.locator('[role="tab"]').getAttribute('aria-label'), /fixada/);
      assert.ok(!(await tab.getAttribute('class')).includes('pinned'));
      await tab.locator('[role="tab"]').press('Shift+P');
      await page.reload({ waitUntil: 'domcontentloaded' });
      tab = page.locator('#wsTabList [data-tab="' + id + '"]');
      await tab.waitFor({ timeout: 15000 });
      assert.match(await tab.locator('[role="tab"]').getAttribute('aria-label'), /fixada/, 'pin persists after reload');
      assert.equal(await tab.locator('[role="tab"]').getAttribute('aria-keyshortcuts'), 'Shift+P');

      const objectLink = page.locator('#view a[href^="#/"]:visible').first();
      await objectLink.waitFor({ timeout: 12000 });
      await objectLink.click({ modifiers: ['Control'] });
      assert.ok(await page.locator('#wsTabList [data-tab]').count() >= 2, 'Ctrl+Click opens a second workspace tab');
      const currentTab = page.locator('#wsTabList [data-tab].on');
      await currentTab.hover();
      const close = currentTab.locator('[data-tab-close]');
      await close.waitFor({ timeout: 12000 });
      const closeBox = await close.evaluate(el => { const r = el.getBoundingClientRect(); return { width: r.width, height: r.height }; });
      assert.ok(closeBox && closeBox.width >= 24 && closeBox.height >= 24,
        'main tab close target must be at least 24x24: ' + JSON.stringify(closeBox));
      const pin = currentTab.locator('[data-tab-pin]');
      if (await pin.isVisible()) {
        const pinBox = await pin.evaluate(el => { const r = el.getBoundingClientRect(); return { width: r.width, height: r.height }; });
        assert.ok(pinBox.width >= 24 && pinBox.height >= 24, 'visible pin target at least 24x24');
      }

      if (await page.locator('#rpToggle').isVisible()) await page.locator('#rpToggle').click();
      const sideTab = page.locator('#rpTabs [data-rp-tab].on');
      await sideTab.hover();
      const sideClose = sideTab.locator('[data-rp-tabx]');
      await sideClose.waitFor({ timeout: 12000 });
      const sideBox = await sideClose.evaluate(el => { const r = el.getBoundingClientRect(); return { width: r.width, height: r.height }; });
      assert.ok(sideBox && sideBox.width >= 24 && sideBox.height >= 24,
        'contextual tab close target must be at least 24x24: ' + JSON.stringify(sideBox));
      await page.screenshot({ path: path.join(assets, 'issue55_keyboard_targets_' + width + '.png'), animations: 'disabled' });

      report.cases.push({ width, pinPersistence: true, keyboardFocusPreserved: true,
        mainClose: { width: closeBox.width, height: closeBox.height },
        contextualClose: { width: sideBox.width, height: sideBox.height } });
    } finally { await context.close(); }
  }
  assert.deepEqual(report.errors, [], 'no uncaught browser errors');
} finally {
  await browser.close();
  await writeFile('prototype/issue55_keyboard_targets_e2e.json', JSON.stringify(report, null, 2) + '\n');
}
