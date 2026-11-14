import assert from 'node:assert/strict';
import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const assets = path.resolve('prototypes/board-exam-app/assets');
await mkdir(assets, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const report = { created: new Date().toISOString(), cases: [], pageErrors: [], limitations: [
  'Chromium emulation does not replace tests on a real Android/iOS device.',
  'This test covers the primary Home CTAs and layout, not every screen and drawer of Issue #132.',
] };
const widths = [320, 360, 375, 390, 412, 480, 600, 768, 820, 1024, 1280, 1440];
const url = (port) => 'http://127.0.0.1:' + port + '/exam-app-0.1.1/index.html#/espaco';

async function openAt(port, width) {
  const context = await browser.newContext({ viewport: { width, height: 850 }, reducedMotion: 'reduce', deviceScaleFactor: 1 });
  const page = await context.newPage();
  page.on('pageerror', (err) => report.pageErrors.push(err.message));
  await page.goto(url(port), { waitUntil: 'domcontentloaded' });
  await page.locator('.dash-actions .dash-act-btn').first().waitFor({ timeout: 30000 });
  return { context, page };
}

async function capture(page, slug) {
  await page.screenshot({ path: path.join(assets, 'issue132_' + slug + '.png'), animations: 'disabled', fullPage: false });
}

async function checkHome(page, width) {
  const details = await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('.dash-actions .dash-act-btn')];
    const candidate = buttons.find(x => x.textContent.includes('Fazer simulado'));
    if (!candidate) return null;
    const icon = candidate.querySelector('.dash-act-ico');
    const text = candidate.querySelector('.dash-act-txt');
    const rect = candidate.getBoundingClientRect(), txt = text?.getBoundingClientRect();
    return {
      width: innerWidth,
      docScrollWidth: document.documentElement.scrollWidth,
      iconText: icon?.textContent.trim(),
      svgCount: icon?.querySelectorAll('svg').length || 0,
      label: candidate.innerText,
      target: candidate.getAttribute('href'),
      rect: { left: rect.left, right: rect.right, width: rect.width },
      textWidth: txt?.width,
      textScrollWidth: text?.scrollWidth,
    };
  });
  assert.ok(details, 'Missing primary Fazer simulado action at width ' + width);
  assert.equal(details.svgCount, 1, 'Timer icon must exist at ' + width);
  assert.equal(details.iconText, '', 'No undefined placeholder at ' + width);
  assert.ok(details.rect.left >= -1 && details.rect.right <= width + 1, 'CTA clipped: ' + JSON.stringify(details));
  assert.ok(details.rect.width > 100, 'CTA unexpectedly narrow at ' + width);
  assert.ok(details.textScrollWidth <= details.textWidth + 2, 'CTA text overflow at ' + width);
  assert.equal(details.target, '#/simulado');
  return details;
}

try {
  const before = await openAt(8766, 390);
  try {
    const icon = await before.page.locator('.dash-actions .dash-act-btn', { hasText: 'Fazer simulado' }).first().locator('.dash-act-ico').innerText();
    assert.equal(icon.trim(), 'undefined', 'Baseline must genuinely exhibit the reported issue');
    await capture(before.page, 'before_390');
    report.cases.push({ phase: 'before', width: 390, observed: 'undefined in icon slot', screenshot: 'issue132_before_390.png' });
  } finally {
    await before.context.close();
  }

  for (const width of widths) {
    const { context, page } = await openAt(8765, width);
    try {
      const metrics = await checkHome(page, width);
      if (width === 320 || width === 390 || width === 768 || width === 1280) {
        await capture(page, 'after_' + width);
        metrics.screenshot = 'issue132_after_' + width + '.png';
      }
      report.cases.push({ phase: 'after', ...metrics });
      if (width === 390) {
        await page.locator('.dash-actions .dash-act-btn', { hasText: 'Fazer simulado' }).first().click();
        await page.waitForURL(/#\/simulado/);
        assert.ok(page.url().includes('#/simulado'), 'Simulado navigation must remain functional');
      }
    } finally {
      await context.close();
    }
  }

  assert.deepEqual(report.pageErrors, [], 'No uncaught page JavaScript errors');
  console.log('Responsive primary Home CTAs: genuine before/after and 12 widths PASS.');
} finally {
  await browser.close();
  await writeFile('prototypes/board-exam-app/issue132_home_e2e.json', JSON.stringify(report, null, 2) + '\n');
}
