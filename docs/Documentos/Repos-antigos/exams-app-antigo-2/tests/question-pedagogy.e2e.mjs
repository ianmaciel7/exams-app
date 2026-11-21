import assert from 'node:assert/strict';
import path from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';

const root=path.resolve('prototype'),assets=root;
await mkdir(assets,{recursive:true});
const report={created:new Date().toISOString(),steps:[],errors:[],limitations:[
  'Browser emulation; real assistive technology and physical touch testing not included.',
  'Statistics use personal saved attempts, not crowd answer distributions or global platform data.'
]};
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const base='http://127.0.0.1:8765/exam-app-0.1.1__index.html';
const context=await browser.newContext({viewport:{width:1366,height:870},reducedMotion:'reduce'});
const page=await context.newPage();
page.on('pageerror',e=>report.errors.push(e.message));
try{
  await page.goto(base+'#/questoes',{waitUntil:'domcontentloaded'});
  const link=page.locator('a[href^="#/questao/"]').first();await link.waitFor({timeout:25000});
  const href=await link.getAttribute('href');
  await page.goto(base+href,{waitUntil:'domcontentloaded'});
  const ped=page.locator('.qo .qped');await ped.waitFor({timeout:25000});
  assert.equal(await ped.locator('[role=tab]').count(),5,'five tab controls in single question');
  await ped.locator('[data-qped-tab$="|gabarito"]').click();
  assert.match(await ped.locator('[role=tabpanel]:visible').innerText(),/Responda e confirme/);
  assert.doesNotMatch(await ped.locator('[role=tabpanel]:visible').innerText(),/Gabarito: [A-E]/);
  await ped.locator('[data-qped-tab$="|estatisticas"]').click();
  const stats=ped.locator('[role=tabpanel]:visible');
  assert.equal(await stats.locator('svg[role=img]').count(),2,'personal donut and A-E chart');
  assert.match(await stats.innerText(),/pessoal/);
  await page.screenshot({path:path.join(assets,'issue72_stats_before_1366.png'),animations:'disabled'});
  await ped.locator('[data-qped-tab$="|anotacoes"]').click();
  await ped.locator('[data-qnote]').fill('Nota sobre a questão');
  await ped.locator('[data-qped-format="bold"]').click();
  await ped.locator('[data-qped-save]').click();
  assert.match(await ped.locator('[data-qnote]').inputValue(),/\*\*texto\*\*/);
  await page.reload({waitUntil:'domcontentloaded'});
  const restored=page.locator('.qo .qped');await restored.waitFor();
  await restored.locator('[data-qped-tab$="|anotacoes"]').click();
  assert.match(await restored.locator('[data-qnote]').inputValue(),/Nota sobre a questão/);
  await restored.locator('[data-qped-tab$="|fontes"]').click();
  assert.ok(await restored.locator('[role=tabpanel]:visible a').count()>0,'real source links');
  await restored.locator('[data-qped-close]').click();
  assert.equal(await restored.locator('.qped-panel:visible').count(),0,'close hides all tabs');
  report.steps.push('single: no gabarito leak, donut/bars, note format save/reload, sources, close');
  await page.locator('.qo [data-qo-ans]').first().click();
  await page.locator('[data-qo-submit]').click();
  await page.locator('.qo .qped [data-qped-tab$="|gabarito"]').click();
  assert.match(await page.locator('.qo .qped [role=tabpanel]:visible').innerText(),/Gabarito:/);
  await page.locator('.qo .qped [data-qped-tab$="|estatisticas"]').click();
  assert.ok(await page.locator('.qo .qped .qped-history a').count()>0,'confirmed attempt appears in historical stats');
  await page.screenshot({path:path.join(assets,'issue72_after_answer_1366.png'),animations:'disabled'});
  report.steps.push('confirmed answer unlocks commentary and renders personal attempt history');

  await page.goto(base+'#/questoes',{waitUntil:'domcontentloaded'});
  const study=page.locator('.s-question .qped').first();await study.waitFor({timeout:25000});
  assert.equal(await study.locator('[role=tab]').count(),5,'practice uses same pedagogy component');
  await study.locator('[data-qped-tab$="|cadernos"]').click();
  assert.ok(await study.locator('[data-nb-single]').count()>0,'real notebook action in pedagogy tab');
  await study.locator('[data-qped-tab$="|estatisticas"]').click();
  assert.equal(await study.locator('svg[role=img]').count(),2);
  await page.screenshot({path:path.join(assets,'issue72_practice_1366.png'),animations:'disabled'});
  report.steps.push('practice: cadernos and personal charts accessible');
  assert.deepEqual(report.errors,[],'no uncaught page JS errors');
}finally{
  await context.close();await browser.close();
  await writeFile(path.join(root,'issue72_pedagogy_e2e.json'),JSON.stringify(report,null,2)+'\n');
}
