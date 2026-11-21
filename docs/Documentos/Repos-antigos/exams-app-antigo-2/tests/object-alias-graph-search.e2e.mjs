import assert from 'node:assert/strict';
import path from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';

const root=path.resolve('prototype'),assets=root;
await mkdir(assets,{recursive:true});
const report={at:new Date().toISOString(),checks:[],errors:[],limitations:[
  'Responsive Chromium emulation, not a full manual NVDA/VoiceOver and physical-touch audit.',
  'Aliases and tags remain local prototype metadata, now consistently consumed by the graph read model.'
]};
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const base='http://127.0.0.1:8765/exam-app-0.1.1__index.html';
try{
  for(const width of [390,1366]){
    const context=await browser.newContext({viewport:{width,height:850},reducedMotion:'reduce'});
    const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
    try{
      await page.goto(base+'#/concurso/dataprev',{waitUntil:'domcontentloaded'});
      const meta=page.locator('#view [data-op-meta="concurso:dataprev"]');
      await meta.waitFor({timeout:18000});
      await meta.click();
      const alias='AliasGraph'+width;
      const tag='BuscaProjeto'+width;
      await page.locator('#fd_alias').fill(alias);
      await page.locator('#fd_tags').fill(tag+', Revisão');
      await page.locator('#dlg [data-x="1"]').click();
      await page.locator('#view .op-meta-chip').filter({hasText:alias}).waitFor();
      await page.goto(base+'#/grafico',{waitUntil:'domcontentloaded'});
      const search=page.locator('#gvq');
      await search.waitFor({timeout:30000});
      await page.waitForFunction(()=>!document.querySelector('.gv-info')?.textContent?.includes('carregando'),null,{timeout:30000});
      await search.fill(alias);
      await page.waitForFunction(()=>document.querySelector('#gvMatchCount')?.textContent?.includes('1 objeto encontrado'));
      assert.equal(await page.locator('#gvMatchCount').innerText(),'1 objeto encontrado','global graph finds alias of real Concurso');
      await page.screenshot({path:path.join(assets,'issue57_graph_alias_'+width+'.png'),animations:'disabled'});
      await search.fill(tag);
      assert.equal(await page.locator('#gvMatchCount').innerText(),'1 objeto encontrado','graph also finds persisted tag');
      await search.press('Enter');
      await page.waitForURL(/#\/concurso\/dataprev/);
      assert.match(await page.locator('#view .op-meta').innerText(),new RegExp(alias),'alias persisted after graph navigation');

      if(width>=768){
        if(await page.locator('#rpanel').isHidden())await page.locator('#rpToggle').click();
        const start=page.locator('#rpBody [data-rp-new="search"]');
        if(await start.isVisible())await start.click();
        else{
          await page.locator('#rpAdd').click();
          await page.locator('.ws-menu [role="menuitem"]').filter({hasText:'Buscar'}).click();
        }
        const contextual=page.locator('#rpBody [data-ex-q]');
        await contextual.waitFor({timeout:12000});
        await contextual.fill(tag);
        const entries=page.locator('#rpBody [data-ex-list] a[href="#/concurso/dataprev"]');
        await entries.first().waitFor({timeout:12000});
        assert.ok(await entries.count()>=1,'contextual search finds tags in graph projection');
        await page.screenshot({path:path.join(assets,'issue57_context_alias_1366.png'),animations:'disabled'});
      }
      report.checks.push({width,checks:'alias+tags are editable, persist, searchable in global graph and contextual panel'});
    }finally{await context.close();}
  }
  assert.deepEqual(report.errors,[],'no browser errors');
}finally{
  await browser.close();
  await writeFile(path.join(root,'issue57_alias_graph_e2e.json'),JSON.stringify(report,null,2)+'\n');
}
