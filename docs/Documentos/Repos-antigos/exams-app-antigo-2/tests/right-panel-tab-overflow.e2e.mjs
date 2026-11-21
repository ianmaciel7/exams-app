import assert from 'node:assert/strict';
import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const root=path.resolve('prototype');
const assets=root;await mkdir(assets,{recursive:true});
const report={at:new Date().toISOString(),checks:[],errors:[],limitations:['Desktop Chromium only; actual IME and screen reader need additional manual verification.']};
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:1366,height:850},reducedMotion:'reduce'});
const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
try{
  await page.goto('http://127.0.0.1:8765/exam-app-0.1.1__index.html#/espaco',{waitUntil:'domcontentloaded'});
  await page.locator('#rpToggle').waitFor();
  if(await page.locator('#rpanel').isHidden())await page.locator('#rpToggle').click();
  await page.locator('#rpBody').waitFor();
  assert.equal(await page.locator('#rpStack').count(),0,'redundant stack action removed from header');

  // Exercise the real UI instead of calling an IIFE-private function from the test.
  for(const label of ['Gráfico','Links de entrada','Objetos internos','Conteúdo relacionado','Chat de IA','Explorar']){
    await page.locator('#rpAdd').click();
    await page.locator('.ws-menu [role="menuitem"]').filter({hasText:label}).click();
  }
  assert.ok(await page.locator('#rpTabs [data-rp-tab]').count()>=5);
  assert.equal(await page.locator('#rpOverflow').isVisible(),true,'overflow is visible for many tabs');
  assert.equal(await page.locator('#rpTabs.compact').count(),1,'tab list compacted');
  report.checks.push('five-plus tabs become compact and searchable');

  await page.locator('#rpOverflow').click();
  await page.locator('#rpTabSearch').fill('Links de entrada');
  assert.equal(await page.locator('#rpTabMenuList .rp-tab-menu-item').count(),1,'filter matches exact contextual title');
  await page.screenshot({path:path.join(assets,'issue55_tabs_filter_chromium.png'),animations:'disabled'});
  await page.locator('#rpTabMenuList [data-rp-menu-activate]').click();
  assert.equal(await page.locator('#rpTabMenu').isHidden(),true,'activation closes menu');
  assert.ok((await page.locator('#rpTabs [data-rp-tab].on').innerText()).includes('Links de entrada'));
  report.checks.push('select contextual tab by full title');

  await page.locator('#rpOverflow').click();
  await page.locator('#rpTabSearch').fill('Chat de IA');
  assert.equal(await page.locator('#rpTabMenuList .rp-tab-menu-item').count(),1,'chat tab found');
  await page.locator('#rpTabMenuList [data-rp-menu-close]').click();
  assert.equal(await page.locator('#rpTabs [data-rp-tab]').count(),5,'close button removes only selected tab');
  await page.locator('#rpTabSearch').press('Escape');
  assert.equal(await page.locator('#rpTabMenu').isHidden(),true,'Escape closes menu');
  assert.equal(await page.locator('#rpOverflow').evaluate(el=>document.activeElement===el),true,'focus restored');
  report.checks.push('close tab individually, Escape and focus restoration');
  assert.deepEqual(report.errors,[],'no unhandled browser errors');
}finally{
  await browser.close();
  await writeFile(path.join(root,'issue55_tabs_e2e.json'),JSON.stringify(report,null,2)+'\n');
}
