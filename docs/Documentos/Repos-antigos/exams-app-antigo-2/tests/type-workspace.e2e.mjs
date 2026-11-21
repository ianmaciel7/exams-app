import assert from 'node:assert/strict';
import path from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';

const root=path.resolve('prototype'),assets=root;
await mkdir(assets,{recursive:true});
const report={created:new Date().toISOString(),checks:[],errors:[],
  limitations:['Responsive Chromium emulation; not a physical device or screen reader.',
    'The type workspace collection and query create dialogs are local-prototype persistence; full bidirectional object membership is a separate task.']};
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const base='http://127.0.0.1:8765/exam-app-0.1.1__index.html';
try{
  for(const width of [390,1366]){
    const ctx=await browser.newContext({viewport:{width,height:860},reducedMotion:'reduce'});
    const page=await ctx.newPage();page.on('pageerror',e=>report.errors.push(e.message));
    try{
      await page.goto(base+'#/tipo/orgao',{waitUntil:'domcontentloaded'});
      const panel=page.locator('.td-content');await panel.waitFor({timeout:20000});
      assert.equal(await page.locator('.td-tabs [role="tab"]').count(),2);
      assert.equal(await page.locator('[data-td-item]').count()>0,true,'at least one real entity');
      assert.equal(await page.locator('.td-layout-gallery').count(),1);
      assert.ok(await page.locator('.td-layout-gallery .td-type-pill').count()>0,'gallery has semantic type pill');
      assert.equal(await page.locator('.td-layout-gallery .td-type-pill').first().innerText(),'Órgão');
      assert.equal(await page.locator('.td-header-tools [role="button"]').count(),0,'toolbar uses native buttons');
      assert.equal(await page.locator('.td-header-tools button').count(),2,'search and more share an accessible pill');
      const bb=await panel.boundingBox();assert.ok(bb&&bb.x>=-2&&bb.x+bb.width<=width+2,'panel fits viewport');
      await page.screenshot({path:path.join(assets,'issue56_type_gallery_'+width+'.png'),animations:'disabled'});
      await page.locator('[data-td-layout="orgao"]').selectOption('table');
      await page.locator('.td-layout-table').waitFor();
      assert.ok(await page.locator('.td-table-row').count()>0);
      await page.locator('[data-td-layout="orgao"]').selectOption('board');
      await page.locator('.td-layout-board').waitFor();
      assert.ok(await page.locator('.td-column').count()>0);
      await page.locator('[data-td-layout="orgao"]').selectOption('mural');
      await page.locator('.td-layout-mural').waitFor();
      await page.locator('[data-td-layout="orgao"]').selectOption('embed');
      await page.locator('.td-layout-embed').waitFor();
      assert.ok(await page.locator('[data-td-copy]').count()>0);
      await page.locator('[data-td-layout="orgao"]').selectOption('list');
      await page.locator('.td-layout-list').waitFor();
      await page.locator('[data-td-search="orgao"]').fill('sem-resultado-xyz');
      assert.equal(await page.locator('[data-td-item]:visible').count(),0,'search filters current layout');
      await page.reload({waitUntil:'domcontentloaded'});
      await page.locator('.td-content').waitFor();
      assert.equal(await page.locator('[data-td-item]:visible').count(),0,'persisted search remains filtered after reload');
      await page.locator('[data-td-search="orgao"]').fill('');
      assert.ok(await page.locator('[data-td-item]:visible').count()>0,'clear after reload restores entries');
      await page.locator('[data-td-search="orgao"]').fill('sem-resultado-xyz');
      await page.locator('[data-td-layout="orgao"]').selectOption('embed');
      await page.locator('.td-layout-embed').waitFor({state:'attached'});
      assert.equal(await page.locator('[data-td-layout="orgao"]').inputValue(),'embed','embedded layout selected while search has no matches');
      assert.equal(await page.locator('[data-td-item]:visible').count(),0,'persisted search filters embedded layout');
      await page.reload({waitUntil:'domcontentloaded'});
      await page.locator('.td-content').waitFor();
      assert.equal(await page.locator('[data-td-item]:visible').count(),0,'embedded search remains filtered after reload');
      await page.locator('[data-td-search="orgao"]').fill('');
      assert.ok(await page.locator('[data-td-item]:visible').count()>0,'clear in embedded layout restores entries');
      await page.locator('[data-td-layout="orgao"]').selectOption('list');
      await page.locator('[data-td-tab="orgao|overview"]').click();
      await page.locator('#td-panel-overview').waitFor();
      assert.equal(await page.locator('#td-tab-overview').getAttribute('aria-selected'),'true');
      await page.reload({waitUntil:'domcontentloaded'});
      await page.locator('.td-content').waitFor();
      assert.equal(await page.locator('#td-tab-overview').getAttribute('aria-selected'),'true','overview tab persists');
      await page.locator('[data-td-tab="orgao|all"]').click();
      assert.equal(await page.locator('[data-td-layout="orgao"]').inputValue(),'list','layout persists');
      report.checks.push({width,steps:'gallery, table, Kanban, mural, embed, list, search, overview persistence'});

      // Saved queries filter real objects, survive reload and can be cleared (#56).
      await page.locator('[data-td-tab="orgao|overview"]').click();
      await page.locator('[data-td-create-query="orgao"]').click();
      await page.locator('#fd_nome').fill('Filtro por tipo e nome');
      await page.locator('#fd_busca').fill('unknown:javascript');
      await page.locator('#dlg [data-x="1"]').click();
      assert.ok(await page.locator('#fe_busca:not([hidden])').count()>0,'malformed query rejected');
      await page.locator('#fd_busca').fill('type:orgao AND name:sem-resultado-xyz');
      await page.locator('#dlg [data-x="1"]').click();
      const query=page.locator('[data-td-apply-query^="orgao|"]').filter({hasText:'Filtro por tipo e nome'});
      await query.waitFor();
      await query.click();
      assert.equal(await page.locator('[data-td-item]:visible').count(),0,'AND query filters out unmatched objects');
      assert.match(await page.locator('.td-collection-banner').innerText(),/type:orgao AND name:sem-resultado-xyz/);
      await page.screenshot({path:path.join(assets,'issue56_saved_query_'+width+'.png'),animations:'disabled'});
      await page.reload({waitUntil:'domcontentloaded'});
      await page.locator('[data-td-clear-query="orgao"]').waitFor();
      assert.equal(await page.locator('[data-td-item]:visible').count(),0,'query persists across reload');
      await page.locator('[data-td-clear-query="orgao"]').click();
      assert.ok(await page.locator('[data-td-item]:visible').count()>0,'clearing saved query restores objects');
      report.checks.push({width,steps:'typed AND query validation, save, apply, reload, clear and screenshot'});

      if(width===1366){
        await page.goto(base+'#/tipo/questao',{waitUntil:'domcontentloaded'});
        await page.locator('.td-content').waitFor({timeout:20000});
        await page.locator('.qf-list').waitFor({timeout:30000});
        assert.equal(await page.locator('[data-td-layout="questao"]').inputValue(),'list','rich question filter preserved');
        await page.locator('[data-td-layout="questao"]').selectOption('gallery');
        await page.locator('.td-layout-gallery [data-td-item]').first().waitFor();
        assert.ok(await page.locator('.td-layout-gallery .td-type-pill').count()>0,'question gallery retains object type chips');
        await page.screenshot({path:path.join(assets,'issue56_questions_gallery_1366.png'),animations:'disabled'});
        report.checks.push({width,steps:'existing question filter remains functional and gallery is available'});

        // Verify typed saved queries against actual entity tags, graph properties and links (#56).
        await page.goto(base+'#/concurso/dataprev',{waitUntil:'domcontentloaded'});
        await page.locator('#view [data-op-meta="concurso:dataprev"]').click();
        await page.locator('#fd_tags').fill('Prioridade de estudo, Revisão');
        await page.locator('#dlg [data-x="1"]').click();
        await page.goto(base+'#/tipo/concurso',{waitUntil:'domcontentloaded'});
        const saveTyped=async(type,name,expression)=>{
          await page.locator('[data-td-tab="'+type+'|overview"]').click();
          await page.locator('[data-td-create-query="'+type+'"]').click();
          await page.locator('#fd_nome').fill(name);
          await page.locator('#fd_busca').fill(expression);
          await page.locator('#dlg [data-x="1"]').click();
          await page.locator('[data-td-apply-query^="'+type+'|"]').filter({hasText:name}).click();
          await page.locator('[data-td-clear-query="'+type+'"]').waitFor();
        };
        await saveTyped('concurso','Filtro real por etiqueta','tag:Prioridade de estudo');
        assert.ok(await page.locator('[data-td-item]:visible').count()>0,'tag query uses persisted object metadata');
        await page.screenshot({path:path.join(assets,'issue56_real_tag_query_1366.png'),animations:'disabled'});
        await page.goto(base+'#/tipo/edicao',{waitUntil:'domcontentloaded'});
        await saveTyped('edicao','Filtro por ano','prop:Ano=2026');
        assert.ok(await page.locator('[data-td-item]:visible').count()>0,'property query finds edition with actual year');
        await page.goto(base+'#/tipo/cargo',{waitUntil:'domcontentloaded'});
        await saveTyped('cargo','Filtro por vínculo','link:Dataprev');
        assert.ok(await page.locator('[data-td-item]:visible').count()>0,'link query uses real graph relationships');
        report.checks.push({width,steps:'real tag, year property and graph link queries'});

      }
    }finally{await ctx.close();}
  }
  assert.deepEqual(report.errors,[],'no unexpected browser errors');
}finally{await browser.close();await writeFile(path.join(root,'issue56_type_workspace_e2e.json'),JSON.stringify(report,null,2)+'\n');}
