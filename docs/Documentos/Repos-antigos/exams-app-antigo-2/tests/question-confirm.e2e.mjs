import assert from 'node:assert/strict';
import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const root=path.resolve('prototype');
const assets=root;
await mkdir(assets,{recursive:true});
const report={at:new Date().toISOString(),checks:[],errors:[],limitations:[
  'Desktop Chromium only; physical keyboard screen-reader announcement must be tested separately.',
  'This covers explicit answer confirmation; header compactness, elimination and associated text are separate requirements.'
]};
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:1366,height:900},reducedMotion:'reduce'});
const page=await context.newPage();
page.on('pageerror',e=>report.errors.push(e.message));
const base='http://127.0.0.1:8765/exam-app-0.1.1__index.html';
try {
  await page.goto(base+'#/questoes',{waitUntil:'domcontentloaded'});
  const link=page.locator('a[href^="#/questao/"]').first();
  await link.waitFor({timeout:25000});
  const href=await link.getAttribute('href');
  await page.goto(base+href,{waitUntil:'domcontentloaded'});
  const options=page.locator('.qo-alts [data-qo-ans]');
  await options.first().waitFor({timeout:25000});
  assert.ok(await options.count()>=2,'question has alternatives');
  const submit=page.locator('[data-qo-submit]');
  assert.equal(await submit.isDisabled(),true,'cannot grade without selection');
  assert.equal(await page.locator('.q-compact-primary').count(),1,'compact primary question metadata');
  assert.equal(await page.locator('.q-compact-secondary').count(),1,'compact secondary metadata');
  assert.equal(await page.locator('.qo-metadata:not([open])').count(),1,'full metadata starts collapsed');
  const cut=page.locator('.qo .q-exclude').first();
  await cut.click();
  assert.equal(await cut.getAttribute('aria-pressed'),'true','scissor toggles discarded state');
  assert.equal(await options.first().isDisabled(),true,'discarded option cannot be selected');
  await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('.qo .q-exclude').first().waitFor();
  assert.equal(await page.locator('.qo .q-exclude').first().getAttribute('aria-pressed'),'true','elimination persists through refresh');
  await page.locator('.qo .q-exclude').first().click();
  assert.equal(await page.locator('.qo .q-exclude').first().getAttribute('aria-pressed'),'false','option can be restored');
  assert.equal(await options.first().isEnabled(),true);
  await page.screenshot({path:path.join(assets,'issue71_before_selection.png'),animations:'disabled'});
  await options.first().click();
  assert.equal(await submit.isEnabled(),true);
  assert.equal(await page.locator('[data-qo-reset]').count(),0,'not graded on first click');
  assert.equal(await page.locator('.qo-alts [aria-pressed="true"]').count(),1);
  await options.nth(1).click();
  assert.equal(await options.nth(1).getAttribute('aria-pressed'),'true','answer can change until confirmation');
  assert.equal(await options.first().getAttribute('aria-pressed'),'false');
  await page.screenshot({path:path.join(assets,'issue71_pending_selection.png'),animations:'disabled'});
  report.checks.push('selection changes without grading or writing answer');

  await submit.click();
  await page.locator('[data-qo-reset]').waitFor();
  assert.equal(await page.locator('[data-qo-submit]').count(),0,'submit disappears after grading');
  assert.ok(await page.locator('.qo .s-note').count()>0,'feedback appears after confirmation');
  await page.screenshot({path:path.join(assets,'issue71_after_submit.png'),animations:'disabled'});
  report.checks.push('Respond records answer and shows feedback');

  await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('[data-qo-reset]').waitFor();
  report.checks.push('confirmed answer persists across reload');
  await page.locator('[data-qo-reset]').click();
  await page.locator('[data-qo-submit]').waitFor();
  assert.equal(await page.locator('[data-qo-submit]').isDisabled(),true,'reset clears answer');
  report.checks.push('reset restores unanswered state');

  await page.goto(base+'#/questoes',{waitUntil:'domcontentloaded'});
  await page.locator('#qAuto').waitFor();
  assert.equal(await page.locator('#qAuto').isChecked(),false,'manual grading default in practice');
  const practiceCut=page.locator('.s-question .q-exclude').first();
  await practiceCut.click();
  assert.equal(await page.locator('.s-question input[type=radio]').first().isDisabled(),true,'scissor disables practice option');
  await practiceCut.click();
  assert.equal(await page.locator('.s-question input[type=radio]').first().isEnabled(),true);
  await page.locator('label.s-option input[type=radio]').first().check();
  assert.equal(await page.locator('.s-question .main-cta').first().isVisible(),true,'Responder action available in practice');
  report.checks.push('study practice defaults to select then Respond');
  await page.goto(base+'#/simulado',{waitUntil:'domcontentloaded'});
  await page.locator('[data-s-start]').waitFor({timeout:20000});
  await page.locator('[data-s-start]').click();
  await page.locator('#view .s-question').waitFor({timeout:20000});
  const examCut=page.locator('#view .s-question .q-exclude').first();
  const examRadio=page.locator('#view .s-question input[type=radio]').first();
  await examCut.click();
  assert.equal(await examRadio.isDisabled(),true,'scissor disables exam option without revealing answer');
  assert.equal(await page.locator('#view .s-feedback').count(),0,'exam answer remains hidden');
  await examCut.click();
  assert.equal(await examRadio.isEnabled(),true);
  report.checks.push('exam elimination remains separate from answer and keeps gabarito hidden');
  assert.deepEqual(report.errors,[],'no uncaught page JavaScript errors');
}finally{
  await browser.close();
  await writeFile(path.join(root,'issue71_confirm_e2e.json'),JSON.stringify(report,null,2)+'\n');
}
