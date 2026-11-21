import assert from 'node:assert/strict';
import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const root = path.resolve('prototype');
const assets = root;
await mkdir(assets, { recursive: true });
const report = { at: new Date().toISOString(), issue: 57, cases: [], errors: [], limitations: [
  'Headless Chromium responsive emulation; full Capacities comparison and assistive-technology audit remain pending.'
] };
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const url = 'http://127.0.0.1:8765/exam-app-0.1.1__index.html';
try {
  for (const width of [390, 1366]) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    page.on('pageerror', error => report.errors.push(error.message));
    try {
      for (const route of ['#/concurso/dataprev', '#/edicao/dataprev-2026', '#/cargo/dataprev-2026-ti-dev']) {
        await page.goto(url + route, { waitUntil: 'domcontentloaded' });
        const side = page.locator('#view .op-side');
        await side.waitFor({ timeout: 15000 });
        const list = side.locator('dl.op-props-inline');
        assert.equal(await list.count(), 1, 'object properties are inline: ' + route);
        assert.equal(await side.locator('.props-card').count(), 0, 'no boxed collapsible card: ' + route);
        assert.equal(await side.getAttribute('aria-label'), 'Propriedades do objeto');
        const rows = await list.locator('.op-prop').count();
        assert.ok(rows >= 2, 'existing metadata rows still visible: ' + route);
        const css = await list.evaluate(el => {
          const s = getComputedStyle(el);
          return { border: s.borderTopWidth, background: s.backgroundColor };
        });
        assert.equal(css.border, '0px', 'no top border on inline properties');
        assert.match(css.background, /rgba?\(0, 0, 0, 0\)|transparent/);
        report.cases.push({ width, route, rows, css });
      }
      await page.goto(url + '#/concurso/dataprev', { waitUntil: 'domcontentloaded' });
      const side = page.locator('#view .op-side');
      const edit = side.locator('[data-edit-prop]').first();
      await edit.waitFor({ timeout: 15000 });
      await edit.click();
      const field = side.locator('input.op-in').first();
      await field.waitFor({ timeout: 8000 });
      const newValue = 'Situação validada ' + width;
      await field.fill(newValue);
      await field.press('Enter');
      await page.waitForFunction(value => document.querySelector('#view .op-side')?.textContent?.includes(value), newValue);
      await page.screenshot({ path: path.join(assets, 'issue57_inline_properties_' + width + '.png'), animations: 'disabled' });
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.locator('#view .op-side').waitFor({ timeout: 15000 });
      assert.ok((await page.locator('#view .op-side').innerText()).includes(newValue),
        'existing inline editor persists changes after reload');
      report.cases.push({ width, interaction: 'editable property persisted after reload' });

      const tools = page.locator('#view .op-head-tools');
      assert.equal(await tools.locator('button').count(), 3, 'width, IA, more actions rendered');
      const wide = tools.locator('[data-op-width]');
      assert.equal(await wide.getAttribute('aria-pressed'), 'false');
      await wide.click();
      await page.waitForFunction(() => document.querySelector('#view .op')?.classList.contains('op-wide'));
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.locator('#view [data-op-width]').waitFor({ timeout: 15000 });
      assert.equal(await page.locator('#view [data-op-width]').getAttribute('aria-pressed'), 'true',
        'per-object width preference persists');

      await page.locator('#view [data-op-meta]').click();
      // formDialog sets initial focus asynchronously; wait before filling
      // another field so its focus callback cannot steal typed metadata.
      await page.waitForFunction(() => document.activeElement?.id === 'fd_alias');
      await page.locator('#fd_alias').fill('Apelido do concurso');
      await page.locator('#fd_tags').fill('Lei seca, Revisão, Lei seca');
      await page.locator('#dlg [data-x="1"]').click();
      await page.waitForFunction(() => document.querySelector('#view .op-meta')?.textContent?.includes('Apelido do concurso'));
      await page.waitForFunction(() => document.querySelectorAll('#view .op-meta .op-meta-chip').length===3,
        null,{timeout:12000});
      assert.equal(await page.locator('#view .op-meta .op-meta-chip').count(), 3,
        'one alias and two deduplicated tags');
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.locator('#view .op-meta').waitFor({ timeout: 15000 });
      assert.match(await page.locator('#view .op-meta').innerText(), /Apelido do concurso/);
      assert.equal(await page.locator('#view .op-meta .op-meta-chip').count(), 3,
        'metadata persists after reload');
      await page.locator('#view [data-op-more]').click();
      assert.ok(await page.getByRole('menuitem', { name: 'Links de entrada no painel' }).count() > 0);
      await page.keyboard.press('Escape');
      await page.screenshot({ path: path.join(assets, 'issue57_object_header_' + width + '.png'), animations: 'disabled' });
      report.cases.push({ width, interaction: 'object width, aliases, tags, menu and reload verified' });

      // Graph-backed page footer must be available without opening the right panel.
      const relationTabs=page.locator('#view .op-link-tabs [role="tab"]');
      assert.equal(await relationTabs.count(),2,'object has incoming/related tabs');
      assert.equal(await relationTabs.first().getAttribute('aria-selected'),'true','backlinks active initially');
      const incoming=page.locator('#view .op-link-panel:visible .op-link-item');
      assert.ok(await incoming.count()>0,'native Concurso has real inbound links');
      assert.match(await incoming.first().getAttribute('href'),/^#\/(edicao|cargo|questao|pdf)\//);
      await relationTabs.last().click();
      assert.equal(await relationTabs.last().getAttribute('aria-selected'),'true');
      assert.equal(await page.locator('#view .op-link-panel:visible').count(),1,'only selected relation panel is shown');
      await page.reload({waitUntil:'domcontentloaded'});
      const selected=page.locator('#view .op-link-tabs [role="tab"]').last();
      await selected.waitFor({timeout:15000});
      assert.equal(await selected.getAttribute('aria-selected'),'true','footer selection persists');
      await selected.press('ArrowLeft');
      assert.equal(await page.locator('#view .op-link-tabs [role="tab"]').first().getAttribute('aria-selected'),'true',
        'keyboard arrow selects backlinks');
      await page.screenshot({path:path.join(assets,'issue57_object_relations_'+width+'.png'),animations:'disabled'});
      report.cases.push({width,interaction:'backlinks, related tab, keyboard, persistence and screenshot'});
    } finally { await ctx.close(); }
  }
  assert.deepEqual(report.errors, [], 'no page JavaScript exceptions');
} finally {
  await browser.close();
  await writeFile(path.join(root, 'issue57_inline_properties_e2e.json'), JSON.stringify(report, null, 2) + '\n');
}
