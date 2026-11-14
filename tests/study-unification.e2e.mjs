import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const dir = path.resolve('prototypes/board-exam-app/assets');
await mkdir(dir, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const manual = {
  id: 'u-e2e-manual',
  conc: 'dataprev', ed: 'dataprev-2026', cg: 'dataprev-2026-ti-dev',
  materia: 'Língua Portuguesa', origem: 'manual',
  enunciado: 'QUESTAO MANUAL UNIFICADA - qual alternativa está correta?',
  alternativas: { A: 'Alternativa incorreta', B: 'Alternativa correta' },
  gabarito: 'B', criada: 1763140000000,
};
const errors = [];
const baseUrl = (port, route) => 'http://127.0.0.1:' + port + '/exam-app-0.1.1/index.html#' + route;

async function newPage() {
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.on('pageerror', e => errors.push(e.message));
  return { page, context };
}
async function seed(page, port) {
  await page.goto(baseUrl(port, '/espaco'), { waitUntil: 'domcontentloaded' });
  await page.evaluate(q => {
    localStorage.clear();
    localStorage.setItem('leitor:uq', JSON.stringify([q]));
  }, manual);
}
async function shot(page, name) {
  await page.screenshot({ path: path.join(dir, 'issue100_' + name + '.png'), animations: 'disabled' });
}
async function baseline() {
  const { page, context } = await newPage();
  try {
    await seed(page, 8766);
    await page.goto(baseUrl(8766, '/questoes'), { waitUntil: 'domcontentloaded' });
    await page.locator('#qSearch').waitFor({ timeout: 20000 });
    await shot(page, 'before_global');
    await page.locator('#qSearch').fill('QUESTAO MANUAL UNIFICADA');
    await shot(page, 'before_manual');
    await page.goto(baseUrl(8766, '/simulado'), { waitUntil: 'domcontentloaded' });
    await page.locator('[data-s-start]').waitFor({ timeout: 20000 });
    await shot(page, 'before_simulado');
  } finally { await context.close(); }
}
async function after() {
  const { page, context } = await newPage();
  try {
    await seed(page, 8765);
    await page.goto(baseUrl(8765, '/espaco'), { waitUntil: 'domcontentloaded' });
    await page.locator('a.dash-act-btn[href="#/questoes"]').first().click();
    await page.locator('[data-qf="study"] [data-qf-text]').waitFor({ timeout: 25000 });
    assert.match(await page.locator('[data-qf="study"] .qf-count').innerText(), /71/);
    await shot(page, 'after_global');

    await page.locator('[data-qf="study"] [data-qf-text]').fill('QUESTAO MANUAL UNIFICADA');
    await page.locator('[data-qid="u-e2e-manual"]').waitFor();
    assert.match(new URL(page.url()).hash, /busca=QUESTAO/);
    await shot(page, 'after_manual');

    await page.locator('[data-qid="u-e2e-manual"] label.s-option').filter({ has: page.locator('input[value="B"]') }).click();
    await page.locator('[data-qid="u-e2e-manual"] .s-feedback.good').waitFor();
    const answers = await page.evaluate(() => JSON.parse(localStorage.getItem('leitor:uqAns') || '{}'));
    assert.equal(answers['u-e2e-manual'], 'B', 'manual answer must be persisted in the same practice');
    await shot(page, 'after_answer');

    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('[data-qid="u-e2e-manual"] .s-feedback.good').waitFor({ timeout: 20000 });
    assert.match(page.url(), /busca=QUESTAO/);
    await page.locator('.s-breadcrumb a[href="#/espaco"]').click();
    await page.goBack();
    await page.locator('[data-qid="u-e2e-manual"] .s-feedback.good').waitFor({ timeout: 20000 });
    assert.match(page.url(), /busca=QUESTAO/, 'back restores filter and question state');

    await page.locator('[data-qf-sim="study"]').click();
    await page.waitForURL('**#/simulado/exec');
    await page.locator('.s-question').waitFor();
    const attempt = await page.evaluate(() => JSON.parse(localStorage.getItem('study:exam:dataprev-2026-tipo1')));
    assert.deepEqual(attempt.order, ['u-e2e-manual'], 'simulated selection must use filtered manual question');
    await shot(page, 'after_manual_simulado');
    await page.locator('[data-s-finish]').click();
    await page.locator('#dlg [data-x="1"]').click();
    await page.waitForURL('**#/simulado/resultado');
    await page.locator('.study-shell').waitFor();

    await page.goto(baseUrl(8765, '/concurso/dataprev/questoes'), { waitUntil: 'domcontentloaded' });
    await page.locator('[data-qf="concurso:dataprev"] [data-qf-text]').waitFor({ timeout: 20000 });
    await page.locator('[data-qf="concurso:dataprev"] [data-qf-text]').fill('QUESTAO MANUAL UNIFICADA');
    await page.locator('[data-qid="u-e2e-manual"] .s-feedback.good').waitFor();
    await shot(page, 'after_contexto');

    await page.goto(baseUrl(8765, '/espaco'), { waitUntil: 'domcontentloaded' });
    await page.locator('a.dash-act-btn[href="#/simulado"]').first().click();
    await page.locator('#simQty').waitFor({ timeout: 20000 });
    await page.selectOption('#simQty', '10');
    await page.selectOption('#simDuration', '30');
    await shot(page, 'after_simulado');
    await page.locator('[data-s-start]').click();
    await page.waitForURL('**#/simulado/exec');
    const configured = await page.evaluate(() => JSON.parse(localStorage.getItem('study:exam:dataprev-2026-tipo1')));
    assert.equal(configured.order.length, 10, 'configured quantity must be applied');
    assert.equal(configured.durationMin, 30, 'configured time must be applied');

    await page.evaluate(() => localStorage.setItem('leitor:uqAns', JSON.stringify({ 'u-e2e-manual': 'A' })));
    await page.goto(baseUrl(8765, '/questoes/erradas'), { waitUntil: 'domcontentloaded' });
    await page.locator('[data-qf="study"] .qf-count').waitFor({ timeout: 20000 });
    assert.match(await page.locator('[data-qf="study"] .qf-count').innerText(), /1 de 71/);
    await page.locator('[data-qid="u-e2e-manual"]').waitFor();
    await shot(page, 'after_erros');
    const other = await newPage();
    try {
      await other.page.goto(baseUrl(8765, '/espaco'), { waitUntil: 'domcontentloaded' });
      await other.page.evaluate(() => {
        localStorage.setItem('leitor:spaces', JSON.stringify([{ id: 'empty-space', name: 'Espaço sem Dataprev' }]));
        localStorage.setItem('leitor:space', JSON.stringify('empty-space'));
      });
      await other.page.reload({ waitUntil: 'domcontentloaded' });
      await other.page.locator('.dash-hero-title').waitFor({ timeout: 20000 });
      assert.equal((await other.page.locator('.dash-hero-title').innerText()).trim(), 'Espaço sem Dataprev');
    } finally { await other.context.close(); }
  } finally { await context.close(); }
}
try {
  await baseline();
  await after();
  assert.deepEqual(errors, [], 'browser JS errors');
  console.log('E2E passed: manual + official global bank, filtering, answering, reload, scoped list, simulated selection, timed simulation, error shortcut.');
  console.log('Captured before/after screenshots under ' + dir);
} finally {
  await browser.close();
}
