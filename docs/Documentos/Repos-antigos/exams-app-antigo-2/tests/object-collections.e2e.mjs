import assert from 'node:assert/strict';
import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const root = path.resolve('prototype');
const assets = root;
await mkdir(assets, { recursive: true });
const report = {
  issue: [56, 57],
  at: new Date().toISOString(),
  cases: [],
  errors: [],
  limitations: ['Headless Chromium responsive emulation; physical touch, screen reader and server synchronization remain unverified.']
};
const url = 'http://127.0.0.1:8765/exam-app-0.1.1__index.html';
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
try {
  for (const width of [390, 1366]) {
    const ctx = await browser.newContext({
      viewport: { width, height: 900 },
      reducedMotion: 'reduce'
    });
    const page = await ctx.newPage();
    page.on('pageerror', error => report.errors.push(error.message));
    try {
      const name = 'Coleção de testes ' + width;
      await page.goto(url + '#/concurso/dataprev', { waitUntil: 'domcontentloaded' });
      let button = page.locator('#view [data-op-collections="concurso"]');
      await button.waitFor({ timeout: 15000 });
      assert.equal(await button.getAttribute('data-op-href'), '#/concurso/dataprev');
      await button.click();

      const newCollection = page.locator('.ws-menu [role="menuitem"]').filter({ hasText: 'Criar coleção' });
      await newCollection.waitFor();
      await newCollection.click();
      const input = page.locator('#dlg #fd_nome');
      await input.waitFor();
      await input.fill(name);
      await page.locator('#dlg [data-x="1"]').click();
      button = page.locator('#view [data-op-collections="concurso"]');
      await button.waitFor();
      assert.match(await button.innerText(), /Coleções\s+1/);
      await page.screenshot({
        path: path.join(assets, 'issues56_57_object_collection_' + width + '.png'),
        animations: 'disabled'
      });

      await page.reload({ waitUntil: 'domcontentloaded' });
      button = page.locator('#view [data-op-collections="concurso"]');
      await button.waitFor();
      assert.match(await button.innerText(), /Coleções\s+1/, 'membership survives reload');

      await button.click();
      await page.locator('.ws-menu [role="menuitem"]').filter({ hasText: name }).click();
      button = page.locator('#view [data-op-collections="concurso"]');
      assert.doesNotMatch(await button.innerText(), /1/, 'membership removal updates header');

      await button.click();
      await page.locator('.ws-menu [role="menuitem"]').filter({ hasText: name }).click();
      assert.match(await button.innerText(), /Coleções\s+1/, 'membership can be restored');

      await page.goto(url + '#/tipo/concurso', { waitUntil: 'domcontentloaded' });
      await page.locator('[data-td-tab="concurso|overview"]').click();
      const savedCollection = page.locator('[data-td-open-collection]').filter({ hasText: name });
      await savedCollection.waitFor();
      assert.match(await savedCollection.innerText(), /1 objetos/);
      await savedCollection.click();

      const count = page.locator('[data-td-count]');
      await count.waitFor();
      assert.equal(await count.innerText(), '1', 'filtered view contains only the member');
      const banner = page.locator('[data-td-clear-collection="concurso"]');
      await banner.waitFor();
      assert.match(await banner.locator('..').innerText(), /Coleção:/);
      assert.equal(await page.locator('#view [data-td-item]:visible').count(), 1);

      await page.screenshot({
        path: path.join(assets, 'issues56_57_collection_filter_' + width + '.png'),
        animations: 'disabled'
      });
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.locator('[data-td-clear-collection="concurso"]').waitFor();
      assert.equal(await page.locator('[data-td-count]').innerText(), '1', 'collection filter survives reload');
      await page.locator('[data-td-clear-collection="concurso"]').click();
      assert.equal(await page.locator('[data-td-clear-collection="concurso"]').count(), 0, 'user can clear collection filter');

      report.cases.push({ width, collection: name, created: true, membershipToggle: true,
        reloadPersistence: true, filterCount: 1, filterClear: true });
    } finally {
      await ctx.close();
    }
  }
  assert.deepEqual(report.errors, [], 'no browser JavaScript errors');
} finally {
  await browser.close();
  await writeFile(
    path.join(root, 'issues56_57_object_collections_e2e.json'),
    JSON.stringify(report, null, 2) + '\n'
  );
}
