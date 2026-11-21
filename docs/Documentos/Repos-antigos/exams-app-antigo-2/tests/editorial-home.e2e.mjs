import assert from 'node:assert/strict';
import path from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';

const root=path.resolve('prototype'),assets=root;
await mkdir(assets,{recursive:true});
const report={at:new Date().toISOString(),checks:[],errors:[],limitations:[
  'Desktop/mobile Chromium emulation only; physical touch/assistive technology is not validated.',
  'Counts are derived from local prototype answers and the actual loaded question bank.'
]};
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const url='http://127.0.0.1:8765/exam-app-0.1.1__index.html#/espaco';
try{
  for(const width of [390,1366]){
    const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
    const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
    try{
      await page.goto(url,{waitUntil:'domcontentloaded'});
      await page.locator('.home-editorial').waitFor({timeout:20000});
      const home=page.locator('.home-editorial');
      await page.waitForFunction(()=>document.querySelector('.eh-head-stats .eh-metric strong')?.textContent?.trim()!=='—',{timeout:25000});
      assert.equal(await home.locator('.eh-tabs [role=tab]').count(),4);
      assert.ok(await home.locator('.eh-head-stats .eh-metric').count()===3);
      assert.equal(await page.locator('.eh-bank-error').count(),0,'question bank actually loaded');
      assert.ok(await page.locator('.eh-disc-list [data-home-disc]').count()>0,'real disciplines rendered');
      const content=await home.innerText();
      assert.doesNotMatch(content,/1\.248|84%|🎉|🔥|🎯/);
      const rect=await home.boundingBox();
      assert.ok(rect&&rect.x>=-2&&rect.x+rect.width<=width+2,'Home should fit viewport '+width+': '+JSON.stringify(rect));
      assert.equal(await page.locator('.dash-actions a[href="#/simulado"]').count(),1);
      const firstCount=await page.locator('.eh-head-stats .eh-metric').first().locator('strong').innerText();
      assert.ok(Number(firstCount)>0,'question count must be the loaded question bank count, not a hardcoded fallback');
      await page.screenshot({path:path.join(assets,'issue58_69_home_'+width+'.png'),animations:'disabled'});
      report.checks.push({width,case:'editorial home, computed question count and responsive layout',count:firstCount});
      await page.goto(url.replace('#/espaco','#/revisao'),{waitUntil:'domcontentloaded'});
      await page.locator('.srs-wrap').waitFor();
      await page.locator('[data-srs-open-create]').click();
      await page.locator('[data-srs-tab="qa"]').click();
      await page.locator('#srs-question').fill('Qual é o prazo?');
      await page.locator('#srs-answer').fill('5 dias úteis');
      await page.locator('[data-srs-save-qa]').click();
      await page.locator('.srs-card').first().waitFor();
      await page.goto(url,{waitUntil:'domcontentloaded'});
      await page.locator('.eh-review-number').waitFor();
      assert.equal(await page.locator('.eh-review-number').innerText(),'1','real due SRS card appears in Home review count');
      assert.match(await page.locator('.eh-review').innerText(),/1 cartão SRS vencido/);
      assert.equal(await page.locator('.eh-review a[href="#/revisao"]').count(),1);
      assert.equal(await page.locator('.eh-review a[href="#/questoes/erradas"]').count(),1);
      await page.screenshot({path:path.join(assets,'issue58_srs_due_home_'+width+'.png'),animations:'disabled'});
      report.checks.push({width,case:'due SRS card created in actual UI appears in Home without fake pending errors'});
      await page.goto(url.replace('#/espaco','#/tipo/orgao'),{waitUntil:'domcontentloaded'});
      await page.locator('[data-new="orgao"]').waitFor();
      await page.locator('[data-new="orgao"]').click();
      await page.locator('#dlg #fd_nome').waitFor();
      const newOrg='Órgão recente '+width;
      await page.locator('#dlg #fd_nome').fill(newOrg);
      await page.locator('#dlg [data-x="1"]').click();
      await page.waitForURL(/#\/orgao\//);
      await page.goto(url,{waitUntil:'domcontentloaded'});
      await page.locator('.eh-recents').waitFor();
      assert.ok((await page.locator('.eh-recents').innerText()).includes(newOrg),
        'new real Organization entity appears in recently changed objects');
      const orgRow=page.locator('.eh-recents .eh-recent').filter({hasText:newOrg});
      assert.equal(await orgRow.count(),1);
      assert.match(await orgRow.getAttribute('href'),/#\/orgao\//);
      await page.screenshot({path:path.join(assets,'issue58_real_recent_objects_'+width+'.png'),animations:'disabled'});
      report.checks.push({width,case:'new Organization entity timestamp persists in recent objects with semantic link'});
      await page.locator('#eh-tab-raiox').click();
      assert.equal(await page.locator('#eh-panel-raiox').isVisible(),true,'Raio-X tab activated');
      await page.locator('#eh-tab-raiox').press('ArrowRight');
      assert.equal(await page.locator('#eh-tab-erros').getAttribute('aria-selected'),'true','keyboard moves to Caderno de Erros');
      await page.locator('#eh-tab-disciplinas').click();
      const disciplines=page.locator('[data-home-disc]');
      const n=await disciplines.count();
      if(n>1){
        await disciplines.nth(1).click();
        assert.equal(await disciplines.nth(1).getAttribute('aria-pressed'),'true');
        assert.equal(await page.locator('[data-home-disc-pane]:visible').count(),1);
        await page.reload({waitUntil:'domcontentloaded'});
        await page.locator('.home-editorial').waitFor();
        assert.equal(await page.locator('#eh-tab-disciplinas').getAttribute('aria-selected'),'true');
        assert.equal(await page.locator('[data-home-disc]:nth-child(2)').getAttribute('aria-pressed'),'true','discipline selection persisted');
      }
      await page.locator('#eh-tab-erros').click();
      await page.reload({waitUntil:'domcontentloaded'});
      await page.locator('.home-editorial').waitFor();
      assert.equal(await page.locator('#eh-tab-erros').getAttribute('aria-selected'),'true','content tab persisted across reload');
      report.checks.push({width,case:'four tab selectors, keyboard navigation, persistence and master-detail'});
    } finally {await context.close();}
  }
  assert.deepEqual(report.errors,[],'no uncaught JavaScript errors in home');
}finally{
  await browser.close();
  await writeFile(path.join(root,'issues58_69_home_e2e.json'),JSON.stringify(report,null,2)+'\n');
}
