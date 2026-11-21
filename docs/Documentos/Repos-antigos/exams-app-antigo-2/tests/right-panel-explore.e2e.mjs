import assert from 'node:assert/strict';
import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const root=path.resolve('prototype');
const assets=root;
await mkdir(assets,{recursive:true});
const report={at:new Date().toISOString(),checks:[],errors:[],limitations:[
  'Headless desktop Chromium only; real screen-reader and touch-device interaction remain to be verified.',
  'Screenshots are uploaded as CI artifacts; full Capacities parity, local graph physics, and panel resize are separate issues.'
]};
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:1366,height:850},reducedMotion:'reduce'});
const page=await context.newPage();
page.on('pageerror',e=>report.errors.push(e.message));
const base='http://127.0.0.1:8765/exam-app-0.1.1__index.html';
const snap=async name=>page.screenshot({path:path.join(assets,name),animations:'disabled'});
try{
  await page.goto(base+'#/espaco',{waitUntil:'domcontentloaded'});
  await page.locator('#rpToggle').waitFor();
  if(await page.locator('#rpanel').isHidden()) await page.locator('#rpToggle').click();
  await page.locator('#rpBody .rp-launch-grid').waitFor({timeout:15000});
  assert.equal(await page.locator('#rpBody .rp-launch-btn').count(),6,'six real tools');
  await snap('issue54_explore_chromium.png');
  report.checks.push('six contextual tools visibly rendered');

  await page.locator('#rpBody [data-rp-new="search"]').click();
  await page.locator('#rpBody [data-ex-q]').waitFor();
  assert.equal(await page.locator('#rpTabs [data-rp-tab].on [role="tab"]').getAttribute('aria-label'),'Buscar','Search is a dedicated panel tab');
  await page.waitForFunction(()=>document.activeElement?.hasAttribute('data-ex-q'));
  await page.locator('#rpBody [data-ex-q]').fill('dataprev');
  assert.equal(await page.locator('#rpBody [data-rp-find]').evaluate(el=>el.open),true,'search tool stays open');
  assert.ok(await page.locator('#rpBody [data-ex-list]').count(),'contextual search has results');
  report.checks.push('standalone Search tool, automatic focus and query');

  await page.locator('#rpAdd').click();
  await page.locator('.ws-menu [role="menuitem"]').filter({hasText:'Explorar'}).click();
  await page.locator('#rpBody [data-rp-new="internos"]').click();
  assert.ok((await page.locator('#rpTabs [data-rp-tab].on').innerText()).includes('Objetos internos'),'real internal tool activates');
  await snap('issue54_internos_chromium.png');
  report.checks.push('internal objects activates with panel tab');

  await page.goto(base+'#/concurso/dataprev',{waitUntil:'domcontentloaded'});
  await page.locator('#rpBody').waitFor();
  assert.ok((await page.locator('#rpTabs [data-rp-tab].on').innerText()).includes('Objetos internos'),'context navigation keeps tool');
  await page.locator('#rpTabs [data-rp-tab]').filter({hasText:'Explorar'}).click();
  assert.ok((await page.locator('#rpBody .rp-relevant').count())>0,'relevant content section');
  await snap('issue54_relevant_chromium.png');
  report.checks.push('contextual relevant section after navigating entity');
  const sideBefore=await page.locator('#rpanel').evaluate(el=>el.getBoundingClientRect().width);
  await page.locator('#rpRz').focus();
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(180);
  const sideAfter=await page.locator('#rpanel').evaluate(el=>el.getBoundingClientRect().width);
  assert.ok(sideAfter>sideBefore,'keyboard resizing widens the contextual panel');
  await snap('issue66_panel_resized_chromium.png');
  report.checks.push('ResizeObserver-responsive contextual panel width');

  await page.locator('#rpAdd').click();
  await page.locator('.ws-menu [role="menuitem"]').filter({hasText:'Gráfico'}).click();
  const globalLink=page.locator('#rpBody .rp-acts a[href="#/grafico"]');
  await globalLink.waitFor({timeout:10000});
  assert.match(await globalLink.innerText(),/Ver grafo global/,'scope of graph CTA must be truthful');
  report.checks.push('graph CTA explicitly announces global graph scope');
  assert.deepEqual(report.errors,[],'no uncaught page JavaScript errors');
}finally{
  await browser.close();
  await writeFile(path.join(root,'issue54_explore_e2e.json'),JSON.stringify(report,null,2)+'\n');
}
