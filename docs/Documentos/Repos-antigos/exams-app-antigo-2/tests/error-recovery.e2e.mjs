import assert from 'node:assert/strict';
import path from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';

const root=path.resolve('prototype'),assets=root;
await mkdir(assets,{recursive:true});
const report={created:new Date().toISOString(),checks:[],pageErrors:[],limitations:[
 'Chromium desktop browser local persistence; multi-device synchronization and actual study outcomes are outside this test.',
 'Recovery scheduling is derived exclusively from confirmed attempts in local history.'
]};
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:1366,height:860},reducedMotion:'reduce'});
const page=await context.newPage();page.on('pageerror',e=>report.pageErrors.push(e.message));
const base='http://127.0.0.1:8765/exam-app-0.1.1__index.html';
const go=async route=>page.goto(base+route,{waitUntil:'domcontentloaded'});
async function submitChoice(index){
  await page.locator('.qo [data-qo-ans]').nth(index).click();
  await page.locator('[data-qo-submit]').click();
  await page.locator('[data-qo-reset]').waitFor();
  return page.locator('.qo .s-note').first().innerText();
}
try{
  await go('#/questoes');
  const first=page.locator('a[href^="#/questao/"]').first();await first.waitFor({timeout:30000});
  const href=await first.getAttribute('href');
  await go(href);
  await page.locator('.qo [data-qo-ans]').first().waitFor();
  const choices=page.locator('.qo [data-qo-ans]');
  assert.ok(await choices.count()>=2);
  const firstAnswer=await submitChoice(0);
  let wrongMessage=firstAnswer;
  if(!/Resposta incorreta/.test(firstAnswer)){
    await page.locator('[data-qo-reset]').click();
    wrongMessage=await submitChoice(1);
  }
  assert.match(wrongMessage,/Resposta incorreta/,'one of first two different answers must be wrong');
  const correct=/Gabarito oficial:\s*([A-E])/.exec(wrongMessage)?.[1];
  assert.ok(correct,'actual official answer revealed only after first confirmation');
  report.checks.push('first incorrect attempt recorded after actual submit');
  await page.screenshot({path:path.join(assets,'issue76_wrong_confirmed.png'),animations:'disabled'});

  await page.locator('.qo .qped [data-qped-tab$="|gabarito"]').click();
  assert.match(await page.locator('.qo .qped [role=tabpanel]:visible').innerText(),/Gabarito:/);
  await go('#/espaco');
  await page.locator('#eh-tab-erros').waitFor();
  await page.locator('#eh-tab-erros').click();
  assert.equal(await page.locator('#eh-panel-erros .eh-error-entry[href="'+href+'"]').count(),1,
    'viewing a solution must never count as recovery');
  assert.match(await page.locator('.eh-error-notebook').innerText(),/Semana de/);
  await page.screenshot({path:path.join(assets,'issue76_notebook_pending.png'),animations:'disabled'});
  report.checks.push('notebook groups unresolved mistake by week/topic and opening solution does not heal');

  await go('#/questoes/erradas');
  await page.locator('.s-recovery-notebook .eh-error-entry[href="'+href+'"]').waitFor({timeout:30000});
  const study=page.locator('.s-question').first();
  await study.waitFor();
  const retry=study.locator('[data-q-retry]');
  await retry.waitFor();
  await retry.click();
  await page.locator('.s-question .main-cta[data-q-check]').first().waitFor();
  assert.ok(await page.locator('.s-recovery-notebook .eh-error-entry[href="'+href+'"]').count()>0,
    'clearing a prior answer does not remove pending error from the filter');
  report.checks.push('retry reset keeps unresolved question in error filter');

  await page.locator('.s-question input[type=radio][value="'+correct+'"]').first().check();
  await page.locator('[data-q-check]').first().click();
  await page.locator('.s-recovery-notebook .eh-error-entry[href="'+href+'"]').waitFor({state:'detached',timeout:20000});
  await page.screenshot({path:path.join(assets,'issue76_recovered.png'),animations:'disabled'});
  report.checks.push('only a new correct confirmed practice answer recovers wrong item');
  await go('#/espaco');
  await page.locator('#eh-tab-erros').click();
  const recoveredEntry=page.locator('#eh-panel-erros .eh-error-entry[href="'+href+'"]');
  assert.equal(await recoveredEntry.count(),1,'weekly cohort preserves recovered questions');
  assert.match(await recoveredEntry.innerText(),/Recuperada/,'cohort explicitly marks the recovered state');
  assert.match(await page.locator('#eh-panel-erros .eh-error-week h3').innerText(),/Errou 1 · Recuperou 1/);
  assert.match(await page.locator('.eh-review').innerText(),/1 questão recuperada/);

  await page.locator('#eh-tab-raiox').click();
  const theory=page.locator('[data-edital-theory]').first();
  await theory.waitFor();
  await theory.check();
  const savedKey=await theory.getAttribute('data-edital-theory');
  await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('#eh-tab-raiox').waitFor();
  await page.locator('#eh-tab-raiox').click();
  assert.equal(await page.locator('[data-edital-theory="'+savedKey+'"]').isChecked(),true,
    'explicit theory studied marker persists');
  assert.ok(await page.locator('.eh-ray-topic .eh-topic-status').count()>0);
  const progress=await page.locator('.eh-ray-topic').first().innerText();
  const progressCount=new RegExp('Questões resolvidas (\\d+)/(\\d+)').exec(progress);
  assert.ok(progressCount,'topic row displays resolved questions over its cataloged total');
  assert.ok(Number(progressCount[1])<=Number(progressCount[2]));
  await page.screenshot({path:path.join(assets,'issue76_raiox_vertical.png'),animations:'disabled'});
  report.checks.push('verticalized topic priorities and theory study checkboxes persist');

  const practice=page.locator('[data-topic-practice]').first();
  await practice.waitFor();
  const practiceHref=await practice.getAttribute('href');
  const filters=new URLSearchParams(practiceHref.split('?')[1]||'');
  assert.ok(filters.get('disc')&&filters.get('assunto'),'topic action carries both catalog filters');
  await practice.click();
  const disciplineChip=page.locator('[data-qf-chip="disc"]');
  const topicChip=page.locator('[data-qf-chip="assunto"]');
  await disciplineChip.waitFor();
  await topicChip.waitFor();
  assert.equal(await disciplineChip.getAttribute('title'),filters.get('disc'));
  assert.equal(await topicChip.getAttribute('title'),filters.get('assunto'));
  report.checks.push('topic practice action opens the question bank with matching discipline and subject filters');
  assert.deepEqual(report.pageErrors,[],'no uncaught browser JS errors');
}finally{
  await context.close();await browser.close();
  await writeFile(path.join(root,'issue76_recovery_e2e.json'),JSON.stringify(report,null,2)+'\n');
}
