// Regression for #226: the tab bars must expose only role=tab children to their
// role=tablist, keep pin/close controls out of the accessibility tree and out of
// the tab sequence, and keep the 46px bar / 32px tab geometry.
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const base = 'http://127.0.0.1:8765/exam-app-0.1.1__index.html';
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
try {
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 }, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(base + '#/concurso/dataprev', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#wsTabList [role="tab"]');
  if (await page.locator('#rpToggle').isVisible()) await page.locator('#rpToggle').click();
  await page.locator('#rpAdd').click();
  await page.locator('.ctx.open [data-mi]').filter({ hasText: 'Gráfico' }).first().click();

  for (const list of ['#wsTabList', '#rpTabs']) {
    const bad = await page.evaluate(sel => {
      const L = document.querySelector(sel);
      // Any control inside the tablist must be hidden from AT and skipped by Tab.
      return [...L.querySelectorAll('button, a[href], [tabindex]')]
        .filter(el => !el.closest('[aria-hidden="true"]') && el.getAttribute('role') !== 'tab')
        .map(el => (el.className || el.tagName) + ' tabindex=' + el.tabIndex);
    }, list);
    assert.deepEqual(bad, [], `${list} exposes controls to AT or to the Tab sequence`);
  }

  const seq = await page.evaluate(() => [...document.querySelectorAll('#wsTabList [role="tab"]')].map(t => t.tabIndex));
  assert.ok(seq.filter(i => i === 0).length === 1, 'exactly one tab in the main bar is in the tab sequence');

  const geo = await page.evaluate(() => {
    const bar = document.querySelector('#wsTabs').getBoundingClientRect().height;
    const tab = document.querySelector('#wsTabList .ws-tab').getBoundingClientRect().height;
    return { bar, tab };
  });
  assert.equal(geo.bar, 46, 'main bar is 46px');
  assert.equal(geo.tab, 32, 'tab is 32px');

  const errs = errors;
  assert.deepEqual(errs, [], 'no page errors');
  console.log('tabs-a11y-structure: ok');
} finally {
  await browser.close();
}
