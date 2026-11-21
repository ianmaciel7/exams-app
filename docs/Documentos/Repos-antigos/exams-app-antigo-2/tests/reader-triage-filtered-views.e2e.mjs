import assert from 'node:assert/strict';
import path from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';

const root=path.resolve('prototype'),assets=root;
await mkdir(assets,{recursive:true});
const report={at:new Date().toISOString(),checks:[],errors:[],limitations:[
  'Chromium responsive emulation is not a physical touch or screen-reader audit.',
  'Time remaining is an explicitly labelled 2 minutes/page estimate, not a word-count measurement.',
  'Reading percentage is omitted where no real saved reading position exists.'
]};
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const base='http://127.0.0.1:8765/exam-app-0.1.1__index.html#/tipo/pdf';
try{
  for(const width of [390,1366]){
    const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
    const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
    try{
      await page.goto(base,{waitUntil:'domcontentloaded'});
      await page.locator('.td-layout-triage').waitFor({timeout:18000});
      const rows=page.locator('.td-reader-row:visible');
      const count=await rows.count();assert.ok(count>2,'actual PDF documents are shown');
      assert.equal(await page.locator('[data-td-layout="pdf"]').inputValue(),'triage');
      assert.equal(await page.locator('[data-td-triage^="pdf|"]').count(),5);
      assert.equal(await page.locator('#nav [data-nav-reader-stage]').count(),5,'sidebar exposes four reader states plus All');
      assert.ok((await rows.first().innerText()).includes('Progresso não registrado'));
      assert.equal(await page.locator('a[href^="#/"]:visible').first().count(),1);
      await page.screenshot({path:path.join(assets,'issue81_inbox_'+width+'.png'),animations:'disabled'});

      const first=rows.first(),firstId=await first.getAttribute('data-td-reader-id');
      await first.locator('[data-td-target="later"]').click();
      assert.equal(await page.locator('[data-td-reader-id="'+firstId+'"] [data-td-target="later"]').getAttribute('aria-pressed'),'true');
      await page.locator('[data-td-triage="pdf|later"]').click();
      assert.equal(await page.locator('.td-reader-row:visible').count(),1,'later filter matches the moved PDF');

      await page.locator('[data-td-triage="pdf|inbox"]').click();
      const second=page.locator('.td-reader-row:visible').first();
      const secondId=await second.getAttribute('data-td-reader-id');
      await second.focus();
      await second.press('e');
      await page.locator('[data-td-triage="pdf|archive"]').click();
      assert.equal(await page.locator('.td-reader-row:visible').count(),1,'e archives only focused row');
      assert.equal(await page.locator('.td-reader-row:visible').first().getAttribute('data-td-reader-id'),secondId);
      await page.locator('.td-reader-row:visible').first().locator('[data-td-target="shortlist"]').click();
      await page.locator('[data-td-triage="pdf|shortlist"]').click();
      assert.equal(await page.locator('.td-reader-row:visible').count(),1,'shortlist is a distinct persisted stage');

      // Editing a PDF tag changes the queryable state, but never mutates the PDF bytes.
      await page.locator('[data-td-triage="pdf|later"]').click();
      await page.locator('.td-reader-row:visible').first().locator('[data-td-tags]').click();
      await page.locator('#fd_tags').fill('edital, lei-seca');
      await page.locator('#dlg [data-x="1"]').click();
      await page.locator('[data-td-tab="pdf|overview"]').click();
      await page.locator('[data-td-create-query="pdf"]').click();
      await page.locator('#fd_nome').fill('Editais para ler depois');
      await page.locator('#fd_busca').fill('in:later AND tag:edital AND type:pdf');
      await page.locator('#dlg [data-x="1"]').click();
      await page.locator('[data-td-apply-query^="pdf|"]').filter({hasText:'Editais para ler depois'}).click();
      assert.equal(await page.locator('.td-reader-row:visible').count(),1,'saved AND query matches actual persisted state and tag');
      assert.equal(await page.locator('#nav [data-nav-reader-query]').count(),1,'saved filtered view is exposed in the space sidebar');
      assert.equal(await page.locator('.td-reader-row:visible').first().getAttribute('data-td-reader-id'),firstId);
      await page.screenshot({path:path.join(assets,'issue81_saved_view_'+width+'.png'),animations:'disabled'});
      await page.reload({waitUntil:'domcontentloaded'});
      await page.locator('[data-td-clear-query="pdf"]').waitFor();
      assert.equal(await page.locator('.td-reader-row:visible').count(),1,'saved query survives reload');
      await page.locator('[data-td-clear-query="pdf"]').click();
      assert.equal(await page.locator('.td-reader-row:visible').count(),1,'manual later filter persists independently');
      if(width>768){
        await page.locator('#nav [data-nav-reader-query]').click();
        assert.equal(await page.locator('.td-reader-row:visible').count(),1,'sidebar saved view navigates to its real result');
        await page.locator('#nav [data-nav-reader-stage="all"]').click();
      }else await page.locator('[data-td-triage="pdf|all"]').click();
      assert.equal(await page.locator('.td-reader-row:visible').count(),count,'clear filters restores all documents');
      const r=await page.locator('.td-content').boundingBox();
      assert.ok(r&&r.x>=-2&&r.x+r.width<=width+2,'triage fits viewport '+width+': '+JSON.stringify(r));
      report.checks.push({width,count,steps:'default inbox, direct moves, keyboard archive, shortlist, tags, saved AND view, reload and responsive screenshots'});
    }finally{await context.close();}
  }
  assert.deepEqual(report.errors,[],'no unexpected JavaScript errors');
}finally{
  await browser.close();
  await writeFile(path.join(root,'issue81_reader_triage_e2e.json'),JSON.stringify(report,null,2)+'\n');
}
