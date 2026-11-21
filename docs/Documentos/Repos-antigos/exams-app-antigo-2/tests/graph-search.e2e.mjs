import assert from 'node:assert/strict';
import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const assets=path.resolve('prototype');
await mkdir(assets,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const report={date:new Date().toISOString(),cases:[],errors:[],limitations:[
  'Chromium desktop/mobile emulation; screen reader, physical touch and full reduced-motion transitions need separate audit.',
  'Browser asserts the rendered search output and canvas camera redraw; the deterministic bounds geometry is covered in the Node contract.',
  'This PR implements only search auto-fit, not all of issue #68.'
]};
try{
  for(const width of [390,1366]){
    const context=await browser.newContext({viewport:{width,height:820},reducedMotion:'reduce'});
    const page=await context.newPage();
    page.on('pageerror',e=>report.errors.push(e.message));
    await page.addInitScript(()=>{
      window.__graphCameraTransforms=[];
      const set=CanvasRenderingContext2D.prototype.setTransform;
      CanvasRenderingContext2D.prototype.setTransform=function(...args){
        if(this.canvas?.id==='gvc'&&args.length===6){
          window.__graphCameraTransforms.push(args);
        }
        return set.apply(this,args);
      };
    });
    try{
      await page.goto('http://127.0.0.1:8765/exam-app-0.1.1__index.html#/grafico',{waitUntil:'domcontentloaded'});
      await page.locator('#gvc').waitFor({timeout:30000});
      await page.waitForFunction(()=>{
        const info=document.querySelector('.gv-info');
        return !!info&&!info.textContent.includes('carregando');
      },null,{timeout:30000});
      await page.waitForFunction(()=>window.__graphCameraTransforms?.length>0,null,{timeout:10000});
      const search=page.locator('#gvq');
      const before=await page.evaluate(()=>window.__graphCameraTransforms?.slice(-1)[0]||null);
      assert.ok(before,'global canvas has a recorded camera transform');
      let query=null,countLabel='';
      for(const candidate of ['Dataprev','Analista','FGV','Português','Questão']){
        await search.fill(candidate);
        countLabel=await page.locator('#gvMatchCount').textContent()||'';
        if(countLabel.includes('objeto encontrado')||countLabel.includes('objetos encontrados')){
          query=candidate;break;
        }
      }
      assert.ok(query,'at least one known object can be found by the graph search');
      await page.waitForFunction(previous=>{
        const current=window.__graphCameraTransforms?.slice(-1)[0];
        return !!current&&JSON.stringify(current)!==JSON.stringify(previous);
      },before,{timeout:10000});
      const after=await page.evaluate(()=>window.__graphCameraTransforms?.slice(-1)[0]||null);
      assert.ok(after,'search rerenders the graph camera');
      assert.notDeepEqual(after,before,'search auto-frames the matching cluster');
      await page.screenshot({path:path.join(assets,'issue68_search_autofit_'+width+'.png'),animations:'disabled'});

      await search.fill('unfindable-graph-object-unique-2026');
      assert.equal(await page.locator('#gvMatchCount').textContent(),'Nenhum objeto encontrado');
      await search.press('Escape');
      assert.equal(await search.inputValue(),'');
      assert.equal(await page.locator('#gvMatchCount').textContent(),'');
      const kind=page.locator('.gv-leg [data-gk]').first();
      assert.ok(await kind.count(),'type filter exists');
      const pressed=await kind.getAttribute('aria-pressed');
      await kind.click();
      assert.notEqual(await kind.getAttribute('aria-pressed'),pressed);
      const hub=page.locator('#gvHubToggle');
      assert.equal(await hub.getAttribute('aria-pressed'),'false','hub suppression starts opt-in');
      await hub.click();
      assert.equal(await hub.getAttribute('aria-pressed'),'true','hub suppression toggles on');
      assert.match(await page.locator('.gv-info').textContent(),/\d+ de \d+ objetos visíveis/,'visible node count updates');
      await page.screenshot({path:path.join(assets,'issue68_hubs_'+width+'.png'),animations:'disabled'});
      await hub.click();
      assert.equal(await hub.getAttribute('aria-pressed'),'false','hub suppression can be disabled again');
      report.cases.push({viewportWidth:width,query,matchResult:countLabel,checks:[
        'search changes camera transformation','accessible match counter','empty state',
        'Escape clears results','type facet remains usable','hub suppression toggles and updates counts'
      ],screenshot:'issue68_search_autofit_'+width+'.png'});
    }catch(error){
      report.errors.push('viewport '+width+': '+String(error.message||error));
      await page.screenshot({path:path.join(assets,'issue68_search_failure_'+width+'.png'),animations:'disabled'}).catch(()=>{});
      throw error;
    }finally{await context.close();}
  }
  assert.deepEqual(report.errors,[],'No uncaught browser errors');
}finally{
  await browser.close();
  await writeFile('prototype/issue68_search_autofit_e2e.json',JSON.stringify(report,null,2)+'\n');
}
