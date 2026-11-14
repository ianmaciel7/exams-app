import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const evidenceDir=path.resolve('prototypes/board-exam-app/assets');
await mkdir(evidenceDir,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const report={date:new Date().toISOString(),cases:[],pageErrors:[],limitations:[
  'Chromium desktop automation: OS-reserved shortcuts and physical keyboard IME require manual testing.',
  'Covers global search, sidebar, new-item menu and shortcut help; graph, full questions and all contextual components are not exhaustively tested.'
]};
const addr=port=>'http://127.0.0.1:'+port+'/exam-app-0.1.1/index.html#/espaco';
async function snap(page,filename){
  await page.screenshot({path:path.join(evidenceDir,'issue139_'+filename+'.png'),animations:'disabled',fullPage:false});
}
async function openAt(port){
  const ctx=await browser.newContext({viewport:{width:1366,height:850},reducedMotion:'reduce'});
  const page=await ctx.newPage();
  page.on('pageerror',err=>report.pageErrors.push(err.message));
  await page.goto(addr(port),{waitUntil:'domcontentloaded'});
  await page.locator('#sideNewBtn').waitFor({timeout:25000});
  return {ctx,page};
}

try{
  const baseline=await openAt(8766);
  try{
    await baseline.page.locator('#btnFootShortcuts').click();
    await baseline.page.locator('#dlg.on').waitFor();
    const text=(await baseline.page.locator('#dlg .keys').innerText()).trim();
    assert.ok(text.includes('Ctrl B')&&text.includes('Ctrl K'));
    await snap(baseline.page,'before_help');
    report.cases.push({phase:'before',interaction:'static-help',containsStaticLabels:true,screenshot:'issue139_before_help.png'});
  }finally{await baseline.ctx.close();}

  const {ctx,page}=await openAt(8765);
  try{
    await page.locator('#btnFootShortcuts').click();
    await page.locator('#dlg.on').waitFor();
    const html=await page.locator('#dlg .keys').innerText();
    assert.ok(html.includes('Buscar documentos'),'dynamic command catalog visible');
    assert.ok(html.includes('Ctrl + K'),'platform-specific modifier visible');
    assert.ok(html.includes('Criar novo objeto'),'registered commands included');
    await snap(page,'after_help');
    let collapsedBefore=await page.locator('#app').evaluate(x=>x.classList.contains('collapsed'));
    await page.keyboard.press('Control+b');
    let collapsedAfter=await page.locator('#app').evaluate(x=>x.classList.contains('collapsed'));
    assert.equal(collapsedAfter,collapsedBefore,'modal must suppress global Ctrl+B');
    await page.locator('#dlg [data-x="1"]').click();

    await page.locator('body').click({position:{x:1200,y:700}});
    await page.keyboard.press('Control+k');
    await page.locator('#pal.on').waitFor();
    await page.locator('#palIn').waitFor();
    assert.equal(await page.locator('#palIn').evaluate(x=>document.activeElement===x),true);
    await snap(page,'after_search');
    collapsedBefore=await page.locator('#app').evaluate(x=>x.classList.contains('collapsed'));
    await page.keyboard.press('Control+b');
    collapsedAfter=await page.locator('#app').evaluate(x=>x.classList.contains('collapsed'));
    assert.equal(collapsedBefore,collapsedAfter,'typing search must not toggle sidebar');
    await page.locator('#palIn').press('Escape');
    await page.locator('#pal:not(.on)').waitFor({state:'hidden'});
    report.cases.push({phase:'after',interaction:'search-and-modal',searchFocus:true,modalSuppression:true,screenshot:'issue139_after_search.png'});

    await page.locator('body').click({position:{x:1200,y:700}});
    collapsedBefore=await page.locator('#app').evaluate(x=>x.classList.contains('collapsed'));
    await page.keyboard.press('Control+b');
    collapsedAfter=await page.locator('#app').evaluate(x=>x.classList.contains('collapsed'));
    assert.notEqual(collapsedAfter,collapsedBefore,'global Ctrl+B toggles once');
    await page.keyboard.press('Control+b');
    assert.equal(await page.locator('#app').evaluate(x=>x.classList.contains('collapsed')),collapsedBefore,'second Ctrl+B restores sidebar');

    await page.keyboard.press('Control+Alt+n');
    await page.locator('#newMenu.open').waitFor();
    await page.locator('#newMenuIn').fill('quest');
    const count=await page.locator('#newMenuList .nm-item').count();
    assert.ok(count>0,'new-object menu remains usable');
    await snap(page,'after_new_item');
    collapsedBefore=await page.locator('#app').evaluate(x=>x.classList.contains('collapsed'));
    await page.keyboard.press('Control+b');
    assert.equal(await page.locator('#app').evaluate(x=>x.classList.contains('collapsed')),collapsedBefore,'new-item input must not dispatch global Ctrl+B');
    await page.locator('#newMenuIn').press('Escape');
    await page.locator('#newMenu:not(.open)').waitFor({state:'hidden'});
    report.cases.push({phase:'after',interaction:'global-chords',sidebarToggledTwice:true,newItemOptions:count,screenshot:'issue139_after_new_item.png'});

    assert.deepEqual(report.pageErrors,[],'no uncaught browser JavaScript errors');
    console.log('Workspace commands: dynamic help, Ctrl+K, Ctrl+B, Ctrl+Alt+N, editable/modal exclusion PASS');
  }finally{await ctx.close();}
}finally{
  await browser.close();
  await writeFile('prototypes/board-exam-app/issue139_commands_e2e.json',JSON.stringify(report,null,2)+'\n');
}
