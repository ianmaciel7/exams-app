// Teste de navegador da visão de features do Board Mestre. Uso: node mestre_features_e2e.js <base-url> <dir-saida-screenshots>
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const base = process.argv[2] || 'http://localhost:8765/prototype/mestre.html';
const shots = process.argv[3] || '.';
const widths = [320, 390, 768, 1366, 1920];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const results = [];
  for (const w of widths) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 800 }, deviceScaleFactor: w <= 390 ? 2 : 1 });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', x => errs.push('pageerror: ' + x.message));
    const checks = {};
    const step = async (name, fn) => { try { checks[name] = (await fn()) ? 'pass' : 'fail'; } catch (x) { checks[name] = 'fail: ' + x.message.split('\n')[0]; } };
    await page.goto(base + '#features', { waitUntil: 'load' });
    await page.waitForSelector('article.card');
    await step('lista de features', async () => (await page.locator('article.card h3 a').count()) === 8);
    await step('filtro de estado', async () => { await page.click('[data-fs="parcial"]'); const n = await page.locator('article.card').count(); await page.click('[data-fs=""]'); return n === 3; });
    await step('busca', async () => { await page.fill('#q', 'grafo'); const n = await page.locator('article.card').count(); await page.fill('#q', ''); return n === 1; });
    await page.goto(base + '#feature/questoes', { waitUntil: 'load' });
    await page.waitForSelector('.feat-head');
    await step('detalhe com evidências', async () => (await page.locator('.ev img').count()) > 0);
    await step('diagrama Mermaid renderizado', async () => { await page.waitForFunction(() => document.querySelectorAll('.mermaid-box svg').length > 0 || document.querySelectorAll('.mermaid-box').length && [...document.querySelectorAll('.mermaid-box')].every(b => !b.textContent.startsWith('Renderizando')), null, { timeout: 15000 }).catch(() => {}); return (await page.locator('.mermaid-box svg').count()) === 3; });
    await step('ADR sem vínculo mostrado como vazio', async () => (await page.locator('#sec-adrs').textContent()).includes('Nenhum ADR'));
    await step('retorno ao Board Mestre', async () => { await page.click('.crumbs a[href="#"]'); await page.waitForTimeout(200); return (await page.locator('#vf').getAttribute('aria-pressed')) === 'false'; });
    await page.goto(base + '#feature/questoes', { waitUntil: 'load' });
    await step('grupo volta ao board', async () => { await page.click('#sec-grupos a >> nth=0'); await page.waitForTimeout(300); return (await page.locator('#grp-e1155').count()) === 1; });
    await step('teclado: foco em link de feature', async () => { await page.goto(base + '#features', { waitUntil: 'load' }); await page.waitForSelector('article.card'); await page.locator('article.card h3 a').first().focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(200); return (await page.locator('.feat-head').count()) === 1; });
    await page.waitForTimeout(300);
    await step('sem rolagem horizontal', async () => (await page.evaluate(() => document.documentElement.scrollWidth)) <= w);
    await step('sem erros de página', async () => errs.length === 0);
    if (w === 390 || w === 1366) await page.screenshot({ path: path.join(shots, 'mestre-features-' + w + '.png'), fullPage: false });
    results.push({ largura: w, checks, erros: errs });
    await ctx.close();
  }
  await browser.close();
  const failed = results.flatMap(r => Object.entries(r.checks).filter(([, v]) => v !== 'pass').map(([k, v]) => r.largura + 'px ' + k + ': ' + v));
  const out = { executado_em: new Date().toISOString(), resultados: results, falhas: failed };
  fs.writeFileSync(path.join(__dirname, 'mestre_features_e2e.json'), JSON.stringify(out, null, 1));
  console.log(failed.length ? 'FAIL\n' + failed.join('\n') : 'PASS todos');
})();
