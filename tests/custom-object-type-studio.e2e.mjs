import assert from 'node:assert/strict';
import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const dir=path.resolve('prototypes/board-exam-app/assets');
await mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const report={date:new Date().toISOString(),cases:[],pageErrors:[],limitations:[
  'Only browser-local HTML prototype data. No cloud sync, object query engine, SRS flashcards or production domain persistence.',
  'Chromium automation, not a substitute for physical mobile/touch and screen-reader testing.'
]};
const base=port=>'http://127.0.0.1:'+port+'/exam-app-0.1.1/index.html#/espaco';
async function openAt(port){
  const context=await browser.newContext({viewport:{width:1366,height:880},reducedMotion:'reduce'});
  const page=await context.newPage();
  page.on('pageerror',e=>report.pageErrors.push(e.message));
  await page.goto(base(port),{waitUntil:'domcontentloaded'});
  await page.locator('#nav [data-sec-add][data-kind="types"]').waitFor({timeout:30000});
  return {context,page};
}
async function snap(page,name){
  await page.screenshot({path:path.join(dir,'issue140_'+name+'.png'),animations:'disabled',fullPage:false});
}
async function studio(page){
  await page.locator('#nav [data-sec-add][data-kind="types"]').click();
  await page.locator('#studioSearch').waitFor({timeout:15000});
}
async function submit(page){await page.locator('#dlg [data-x="1"]').click();}
async function gotoType(page,name){
  const row=page.locator('#nav .tree-link',{hasText:name});
  await row.first().click();
}
try{
  const before=await openAt(8766);
  try{
    await before.page.locator('#nav [data-sec-add][data-kind="types"]').click();
    assert.equal(await before.page.locator('#studioSearch').count(),0,'old flow lacks type-studio search');
    await snap(before.page,'before_desktop');
    report.cases.push({phase:'before',screenshot:'issue140_before_desktop.png',search:false});
  }finally{await before.context.close();}

  const {context,page}=await openAt(8765);
  try{
    await studio(page);
    await page.locator('#studioSearch').fill('flashcard');
    const visible=page.locator('#dlg .type-studio-item:not([hidden])');
    assert.ok(await visible.count()>=1);
    await visible.first().click();
    const preview=await page.locator('#studioPreview').innerText();
    assert.ok(preview.includes('Flashcard'),'preview matches selected type preset');
    await snap(page,'preset_preview');
    await page.locator('#dlg [data-x="0"]').click();
    assert.equal(await page.locator('#dlg.on').count(),0,'cancel closes without creating type');
    assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('leitor:customObjectTypes')||'[]').length),0);
    report.cases.push({phase:'after',step:'search-preview-cancel',screenshot:'issue140_preset_preview.png'});

    await studio(page);
    await submit(page);
    await page.locator('#fd_nome').waitFor();
    await page.locator('#fd_nome').fill('Concurso');
    await page.locator('#fd_plural').fill('Concursos');
    await submit(page);
    assert.equal(await page.locator('#fd_nome[aria-invalid="true"]').count(),1,'duplicates rejected');
    await page.locator('#fd_nome').fill('Nota Jurídica');
    await page.locator('#fd_plural').fill('Notas Jurídicas');
    await page.locator('#fd_icone').selectOption('book');
    await page.locator('#fd_tom').selectOption('green');
    await submit(page);
    await page.waitForURL(/#\/tipo\/custom-nota-juridica$/);
    assert.equal(await page.locator('.op-head h1').innerText(),'Nota Jurídica');
    const typeState=await page.evaluate(()=>JSON.parse(localStorage.getItem('leitor:customObjectTypes')));
    assert.ok(typeState.some(x=>x.id==='custom-nota-juridica'&&x.plural==='Notas Jurídicas'&&x.tone==='green'));
    await snap(page,'created_type');
    report.cases.push({phase:'after',step:'create-type-and-duplicate-validation',type:'custom-nota-juridica',screenshot:'issue140_created_type.png'});

    await page.locator('[data-new="custom-nota-juridica"]').first().click();
    await page.locator('#fd_nome').fill('Lei 14.133 - observações');
    await page.locator('#fd_conteudo').fill('Revisar regras de contratação pública.');
    await submit(page);
    await page.waitForURL(/#\/custom-object\/custom-object-/);
    assert.equal(await page.locator('.op-head h1').innerText(),'Lei 14.133 - observações');
    assert.ok((await page.locator('.custom-object-body').innerText()).includes('Revisar regras de contratação pública.'));
    const objectUrl=page.url();
    await page.locator('[data-custom-edit]').click();
    await page.locator('#fd_conteudo').fill('Revisar capítulo de licitações.');
    await submit(page);
    assert.ok((await page.locator('.custom-object-body').innerText()).includes('Revisar capítulo de licitações.'));
    await snap(page,'created_object');
    report.cases.push({phase:'after',step:'create-and-edit-object',screenshot:'issue140_created_object.png',path:new URL(objectUrl).hash});

    await page.reload({waitUntil:'domcontentloaded'});
    await page.locator('.custom-object-body').waitFor({timeout:15000});
    assert.ok((await page.locator('.custom-object-body').innerText()).includes('licitações'),'edit survived reload');
    await page.goto(base(8765).replace('#/espaco','#/tipo/custom-nota-juridica'));
    await page.locator('.op-head h1').waitFor();
    assert.ok((await page.locator('.op-list').innerText()).includes('Lei 14.133'),'type dashboard lists saved objects');
    await snap(page,'after_reload');
    report.cases.push({phase:'after',step:'persist-after-reload',screenshot:'issue140_after_reload.png'});

    await page.evaluate(()=>localStorage.setItem('leitor:hiddenTypes',JSON.stringify(['banca'])));
    await page.reload({waitUntil:'domcontentloaded'});
    await studio(page);
    await page.locator('#studioSearch').fill('Banca');
    const restore=page.locator('[data-studio="restore:banca"]');
    assert.equal(await restore.count(),1);
    await restore.click();
    assert.ok((await page.locator('#studioPreview').innerText()).includes('preservando'));
    await submit(page);
    const hidden=await page.evaluate(()=>JSON.parse(localStorage.getItem('leitor:hiddenTypes')||'[]'));
    assert.equal(hidden.includes('banca'),false,'hidden built-in restored without re-identification');
    await snap(page,'restored_builtin');
    report.cases.push({phase:'after',step:'restore-existing-type',screenshot:'issue140_restored_builtin.png'});
    assert.deepEqual(report.pageErrors,[],'No uncaught page errors');
    console.log('Type studio: preset preview, cancel, duplicate, create type/objects, edit, reload and restore PASS.');
  }finally{await context.close();}
}finally{
  await browser.close();
  await writeFile('prototypes/board-exam-app/issue140_type_studio_e2e.json',JSON.stringify(report,null,2)+'\n');
}
