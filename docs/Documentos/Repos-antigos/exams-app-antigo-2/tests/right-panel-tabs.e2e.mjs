import assert from 'node:assert/strict';
import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const assets = path.resolve('prototype');
await mkdir(assets, { recursive: true });
const report = { at: new Date().toISOString(), issue: 55, checks: [], errors: [] };
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const base = 'http://127.0.0.1:8765/exam-app-0.1.1__index.html';
try {
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 }, reducedMotion: 'reduce' });
  try {
    const page = await context.newPage();
    page.on('pageerror', error => report.errors.push(error.message));
    await page.goto(base + '#/concurso/dataprev', { waitUntil: 'domcontentloaded' });
    if (await page.locator('#rpToggle').isVisible()) await page.locator('#rpToggle').click();

    const tabs = page.locator('#rpTabs [data-rp-tab]');
    const openGraph = async () => {
      await page.locator('#rpAdd').click();
      await page.locator('.ctx.open [data-mi]').filter({ hasText: 'Gráfico' }).first().click();
    };
    await openGraph();
    assert.equal(await tabs.count(), 1, 'first graph replaces the pristine Explore tab');
    let selected = page.locator('#rpTabs [data-rp-tab].on');
    assert.match(await selected.locator('[role="tab"]').getAttribute('aria-label'), /Gráfico.*Dataprev.*seguindo contexto/i);
    assert.equal(await selected.locator('.rp-context-pin').count(), 0);
    report.checks.push('Following-context graph is announced and has no pin badge');
    await page.screenshot({ path: path.join(assets, 'issue55_graph_follow.png'), animations: 'disabled' });

    await page.locator('#rpBody [data-pin-to-ctx]').first().click();
    selected = page.locator('#rpTabs [data-rp-tab].on');
    assert.match(await selected.locator('[role="tab"]').getAttribute('aria-label'), /Gráfico.*Dataprev.*fixado/i);
    assert.match(await selected.getAttribute('title'), /fixado/i);
    assert.equal(await selected.locator('.rp-context-pin').count(), 1);
    report.checks.push('Pin immediately updates tab accessibility name, tooltip and visible badge');
    await page.screenshot({ path: path.join(assets, 'issue55_graph_pinned.png'), animations: 'disabled' });

    await page.goto(base + '#/cargo/dataprev-2026-ti-dev', { waitUntil: 'domcontentloaded' });
    selected = page.locator('#rpTabs [data-rp-tab].on');
    assert.match(await selected.locator('[role="tab"]').getAttribute('aria-label'), /Dataprev.*fixado/i, 'pinned context survives navigation');
    await page.locator('#rpBody [data-unpin]').first().click();
    assert.match(await selected.locator('[role="tab"]').getAttribute('aria-label'), /Gráfico.*seguindo contexto/i);
    assert.doesNotMatch(await selected.locator('[role="tab"]').getAttribute('aria-label'), /fixado/i);
    assert.equal(await selected.locator('.rp-context-pin').count(), 0);
    report.checks.push('Unpin switches graph to current context without stale pinned badge');
    await page.reload({ waitUntil: 'domcontentloaded' });
    selected = page.locator('#rpTabs [data-rp-tab].on');
    assert.match(await selected.locator('[role="tab"]').getAttribute('aria-label'), /seguindo contexto/i);
    await openGraph();
    assert.equal(await tabs.count(), 1, 'opening the same following graph focuses its existing tab');
    report.checks.push('Following mode survives refresh and graph reopening deduplicates');
    await page.screenshot({ path: path.join(assets, 'issue55_graph_after_reload.png'), animations: 'disabled' });
    assert.deepEqual(report.errors, [], 'no uncaught browser JavaScript errors');
  } finally { await context.close(); }
} finally {
  await browser.close();
  await writeFile(path.resolve('prototype/issue55_graph_e2e.json'), JSON.stringify(report, null, 2) + '\n');
}
