import assert from 'node:assert/strict';
import path from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';

const assets=path.resolve('prototype');
await mkdir(assets,{recursive:true});
const report={at:new Date().toISOString(),cases:[],errors:[],limitations:[
 'Headless Chromium mobile/desktop emulation; physical touch and assistive technology not independently assessed.'
]};
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 for(const width of [390,1366]){
  const ctx=await browser.newContext({viewport:{width,height:850},reducedMotion:'reduce'});
  const page=await ctx.newPage();
  page.on('pageerror',e=>report.errors.push(e.message));
  try{
    await page.goto('http://127.0.0.1:8765/exam-app-0.1.1__index.html#/espaco',{waitUntil:'domcontentloaded'});
    await page.locator('#rpToggle').waitFor();
    if(await page.locator('#rpanel').isHidden())await page.locator('#rpToggle').click();
    await page.locator('#rpBody .rp-launch-grid').waitFor();
    const search=page.locator('#rpBody .rp-explore-search');
    await search.locator('summary').first().click();
    const object=page.locator('#rpBody .rp-explore-search a.rp-row[href^="#/"]').first();
    await object.waitFor({timeout:12000});
    const href=await object.getAttribute('href'),before=await page.evaluate(()=>location.hash);
    await object.click({modifiers:['Shift']});
    assert.equal(await page.evaluate(()=>location.hash),before,'Shift does not change the main location');
    assert.equal(await page.locator('#rpTabs [data-rp-tab].on').count(),1);
    const selected=await page.locator('#rpTabs [data-rp-tab].on').getAttribute('aria-label');
    assert.notEqual(selected,'Explorar','Shift targets a contextual object tab');
    assert.ok(await page.locator('#rpBody [data-vmain]').count(),'object view opened in contextual panel');
    const afterFirst=await page.locator('#rpTabs [data-rp-tab]').count();
    await page.screenshot({path:path.join(assets,'issue55_shift_click_'+width+'.png'),animations:'disabled'});

    await page.locator('#rpAdd').click();
    await page.locator('.ws-menu [role="menuitem"]').filter({hasText:'Explorar'}).click();
    const searchAgain=page.locator('#rpBody .rp-explore-search');
    await searchAgain.locator('summary').first().click();
    const same=page.locator('#rpBody .rp-explore-search a.rp-row[href="'+href+'"]').first();
    await same.waitFor();
    const beforeRepeat=await page.locator('#rpTabs [data-rp-tab]').count();
    await same.click({modifiers:['Shift']});
    assert.equal(await page.locator('#rpTabs [data-rp-tab]').count(),beforeRepeat,'same view is focused instead of duplicated');
    assert.equal(await page.locator('#rpTabs [data-rp-tab].on').getAttribute('aria-label'),selected);
    await page.reload({waitUntil:'domcontentloaded'});
    await page.locator('#rpanel').waitFor({state:'attached'});
    if(await page.locator('#rpanel').isHidden()){
      await page.locator('#rpToggle').waitFor({state:'visible'});
      await page.locator('#rpToggle').click();
    }
    await page.locator('#rpTabs [data-rp-tab].on').waitFor();
    assert.equal(await page.locator('#rpTabs [data-rp-tab].on').getAttribute('aria-label'),selected,'contextual tab survives refresh');
    report.cases.push({width,href,initialTabs:afterFirst,afterRepeat:beforeRepeat,selected,
      screenshot:'issue55_shift_click_'+width+'.png'});
  }finally{await ctx.close();}
 }
 assert.deepEqual(report.errors,[],'no unhandled browser errors');
}finally{
 await browser.close();
 await writeFile('prototype/issue55_shift_click_e2e.json',JSON.stringify(report,null,2)+'\n');
}
