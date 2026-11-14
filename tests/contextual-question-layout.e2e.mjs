import assert from 'node:assert/strict';
import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const dir = path.resolve('prototypes/board-exam-app/assets');
await mkdir(dir, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const result = { date: new Date().toISOString(), cases: [], errors: [], limitations: [
  'Chromium captures are genuine but not the original user-provided screenshot.',
  'This test covers the contextual question list, global study list and primary radio selection; other journeys require their own E2E.',
] };

async function open(port, route, width) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.on('pageerror', e => result.errors.push(e.message));
  await page.goto('http://127.0.0.1:' + port + '/exam-app-0.1.1/index.html#' + route, { waitUntil: 'domcontentloaded' });
  await page.locator('.qf-list .s-option').first().waitFor({ timeout: 30000 });
  return { context, page };
}

async function measure(page) {
  return page.evaluate(() => {
    const card = document.querySelector('.qf-list .s-question');
    const heading = card?.querySelector('.s-eyebrow');
    const choices = [...(card?.querySelectorAll('label.s-option') || [])];
    const rect = card?.getBoundingClientRect();
    const options = choices.map(el => {
      const r = el.getBoundingClientRect();
      return { display: getComputedStyle(el).display, top: r.top, left: r.left, right: r.right, height: r.height, text: el.innerText.trim().slice(0, 70) };
    });
    return {
      card: rect && { left: rect.left, right: rect.right, width: rect.width },
      heading: { display: getComputedStyle(heading).display, text: heading.innerText },
      options, count: choices.length, practiceList: !!document.querySelector('.practice-list'),
    };
  });
}

const route = '/concurso/dataprev/questoes';
try {
  const before = await open(8766, route, 1366);
  try {
    const initial = await measure(before.page);
    assert.ok(initial.count >= 2, 'baseline must contain real question alternatives');
    assert.notEqual(initial.options[0].display, 'flex', 'baseline must reproduce broken contextual options');
    await before.page.screenshot({ path: path.join(dir, 'issue136_before_context_1366.png'), animations: 'disabled' });
    result.cases.push({ phase: 'before', route, width: 1366, ...initial, screenshot: 'issue136_before_context_1366.png' });
  } finally { await before.context.close(); }

  for (const [routeName, width] of [[route, 1366], [route, 390], ['/questoes', 1366]]) {
    const { context, page } = await open(8765, routeName, width);
    try {
      const current = await measure(page);
      assert.equal(current.practiceList, true, 'reusable practice list exists');
      assert.equal(current.heading.display, 'block', 'number and discipline must be separated');
      assert.ok(current.count >= 2);
      for (let i = 0; i < current.options.length; i++) {
        const option = current.options[i];
        assert.equal(option.display, 'flex', 'option is row/large clickable area: ' + i);
        assert.ok(option.height >= 35, 'option must have visible clickable height');
        if (i) assert.ok(option.top > current.options[i-1].top + 20, 'each option in separate row');
      }
      if (width === 390) {
        assert.ok(current.card.left >= -2 && current.card.right <= width + 2, 'mobile question card should fit: ' + JSON.stringify(current.card));
      }
      const filename = 'issue136_after_' + (routeName === '/questoes' ? 'global' : 'context') + '_' + width + '.png';
      await page.screenshot({ path: path.join(dir, filename), animations: 'disabled' });

      const option = page.locator('.qf-list .s-question').first().locator('label.s-option').first();
      await option.click();
      assert.equal(await page.locator('.qf-list .s-question').first().locator('input[type=radio]:checked').count(), 1, 'question selection remains functional');
      result.cases.push({ phase: 'after', route: routeName, width, ...current, screenshot: filename, answerSelected: true });
    } finally { await context.close(); }
  }
  assert.deepEqual(result.errors, [], 'no uncaught JavaScript errors');
  console.log('Contextual question presentation: baseline reproduced, options stacked at 1366/390 and global flow functional.');
} finally {
  await browser.close();
  await writeFile('prototypes/board-exam-app/issue136_e2e.json', JSON.stringify(result, null, 2) + '\n');
}
