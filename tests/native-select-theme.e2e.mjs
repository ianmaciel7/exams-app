import assert from 'node:assert/strict';
import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const evidenceDir = path.resolve('prototypes/board-exam-app/assets');
await mkdir(evidenceDir, { recursive: true });
const report = { browser: 'Chromium', platform: process.platform, scenarios: [], errors: [], limitations: [
  'Native OS popup content may not be included in Playwright screenshots.',
  'A human must still verify popup contrast on supported Windows and browsers before closing #120.',
] };
const browser = await chromium.launch({ headless: true });

const startUrl = 'http://127.0.0.1:8765/exam-app-0.1.1/index.html#/questoes';

async function start(colorScheme, viewport = { width: 1366, height: 900 }) {
  const context = await browser.newContext({ colorScheme, viewport, reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.on('pageerror', (error) => report.errors.push(error.message));
  await page.goto(startUrl, { waitUntil: 'domcontentloaded' });
  await page.locator('#qPer').waitFor({ timeout: 30000 });
  return { context, page };
}

async function verify(page, scenario, expected, screenshot) {
  const actual = await page.evaluate(() => ({
    document: getComputedStyle(document.documentElement).colorScheme,
    select: getComputedStyle(document.querySelector('#qPer')).colorScheme,
    theme: document.documentElement.dataset.theme || 'auto',
  }));
  assert.equal(actual.document, expected, scenario + ' root color scheme');
  assert.equal(actual.select, expected, scenario + ' select color scheme');
  const values = await page.locator('#qPer option').evaluateAll((opts) => opts.map((x) => x.value));
  assert.deepEqual(values, ['1', '5', '10', '20']);
  await page.screenshot({ path: path.join(evidenceDir, 'issue120_' + screenshot + '.png'), animations: 'disabled' });
  report.scenarios.push({ scenario, expected, actual, screenshot: 'issue120_' + screenshot + '.png', url: page.url() });
}

async function setUiTheme(page, theme) {
  await page.locator('#btnFootSettings').click();
  await page.locator('#dlg [data-cfg="' + theme + '"]').click();
  await page.locator('#dlg [data-x="1"]').click();
}

try {
  const darkOs = await start('dark');
  try {
    const page = darkOs.page;
    await verify(page, 'OS escuro / automatico', 'dark', 'after_auto_dark');
    await setUiTheme(page, 'light');
    await verify(page, 'SO escuro / escolha claro sem reload', 'light', 'after_explicit_light');
    await setUiTheme(page, 'dark');
    await verify(page, 'SO escuro / escolha escuro sem reload', 'dark', 'after_explicit_dark');
    await setUiTheme(page, 'auto');
    await verify(page, 'SO escuro / volta a automatico sem reload', 'dark', 'after_auto_restored');

    for (const option of ['1', '5', '10', '20']) {
      await page.locator('#qPer').selectOption(option);
      assert.equal(await page.locator('#qPer').inputValue(), option, 'option ' + option);
      assert.equal(await page.locator('html').evaluate((el) => getComputedStyle(el).colorScheme), 'dark');
    }
    await page.locator('#qPer').focus();
    assert.equal(await page.locator('#qPer').evaluate((el) => document.activeElement === el), true);
    await page.keyboard.press('Escape');
    await page.locator('#btnFootTheme').click();
    await verify(page, 'Botao de alternar tema sem reload', 'light', 'after_toggle_light');
    await page.setViewportSize({ width: 390, height: 800 });
    await page.locator('#qPer').waitFor();
    await verify(page, 'Viewport mobile 390px / tema claro', 'light', 'after_mobile');
  } finally {
    await darkOs.context.close();
  }

  const lightOs = await start('light');
  try {
    await verify(lightOs.page, 'OS claro / automatico', 'light', 'after_auto_light');
    await setUiTheme(lightOs.page, 'dark');
    await verify(lightOs.page, 'SO claro / escolha escuro', 'dark', 'after_dark_on_light_os');
    await setUiTheme(lightOs.page, 'auto');
    await verify(lightOs.page, 'SO claro / volta ao automatico', 'light', 'after_auto_light_restored');
  } finally {
    await lightOs.context.close();
  }

  assert.deepEqual(report.errors, [], 'No uncaught page errors');
  console.log('Native selector theme regression: 9 theme/OS/viewport scenarios + values 1/5/10/20 passed.');
} finally {
  await browser.close();
  await writeFile('prototypes/board-exam-app/issue120_e2e.json', JSON.stringify(report, null, 2) + '\n');
}
