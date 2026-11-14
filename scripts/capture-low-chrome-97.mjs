import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const dir = path.resolve('prototypes/board-exam-app/assets');
await mkdir(dir, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const results = [];
const widths = [1366, 1024, 768];
const themes = ['light', 'dark'];
const layouts = [
  { side: true, right: true },
  { side: true, right: false },
  { side: false, right: true },
  { side: false, right: false },
];
const errors = [];
try {
  for (const version of ['before', 'after']) {
    const port = version === 'before' ? '8766' : '8765';
    for (const width of widths) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
      for (const theme of themes) {
        for (const layout of layouts) {
          const page = await context.newPage();
          const label = [version, theme, width, layout.side ? 'sideopen' : 'sideclosed', layout.right ? 'rightopen' : 'rightclosed'].join('_');
          page.on('pageerror', error => errors.push(label + ': ' + error.message));
          await page.goto('http://127.0.0.1:' + port + '/exam-app-0.1.1/index.html#/espaco', { waitUntil: 'domcontentloaded', timeout: 30000 });
          await page.locator('#app').waitFor({ state: 'visible', timeout: 15000 });
          await page.evaluate(({ theme, side, right }) => {
            document.documentElement.dataset.theme = theme;
            if (typeof setCollapsed === 'function') setCollapsed(!side);
            document.getElementById('app').classList.toggle('open', side);
            if (typeof openRP === 'function') openRP(right);
          }, { theme, ...layout });
          await page.waitForTimeout(150);
          const metrics = await page.evaluate(() => {
            const side = document.querySelector('.side');
            const tabs = document.querySelector('.ws-tabs');
            const main = document.querySelector('.main');
            const panel = document.getElementById('rpanel');
            return {
              sideBorder: getComputedStyle(side).borderRightWidth,
              tabsBorder: getComputedStyle(tabs).borderBottomWidth,
              sideWidth: Math.round(side.getBoundingClientRect().width),
              mainWidth: Math.round(main.getBoundingClientRect().width),
              rightVisible: panel && !panel.hidden,
              horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 2,
            };
          });
          if (version === 'after' && (metrics.sideBorder !== '0px' || metrics.tabsBorder !== '0px')) {
            errors.push(label + ': border regression ' + JSON.stringify(metrics));
          }
          if (metrics.horizontalOverflow) errors.push(label + ': horizontal overflow');
          await page.screenshot({ path: path.join(dir, 'lowchrome_97_' + label + '.png'), fullPage: false, animations: 'disabled' });
          results.push({ label, version, width, theme, ...layout, ...metrics });
          await page.close();
        }
      }
      await context.close();
    }
  }
} finally {
  await browser.close();
}
await writeFile('prototypes/board-exam-app/lowchrome_97_manifest.json', JSON.stringify({ recordedAt: new Date().toISOString(), states: results, errors }, null, 2) + '\n');
console.log('Captured ' + results.length + ' screenshots, errors: ' + errors.length);
console.log('Before/after primary:', results.filter(x => x.width === 1366 && x.theme === 'light' && x.side && x.right));
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
