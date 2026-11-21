import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const evidenceDir=path.resolve('prototype');
await mkdir(evidenceDir,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const sourceDigest=createHash('sha256').update([
  'prototype/exam-app-0.1.1__index.html',
  'tests/workspace-command-router.test.mjs',
  'tests/workspace-command-router.e2e.mjs',
  '.github/workflows/e2e-workspace-command-router.yml'
].map(file=>readFileSync(file,'utf8')).join('')).digest('hex');
const report={sourceDigest,cases:[],pageErrors:[],limitations:[
  'Chromium desktop automation: OS-reserved shortcuts and physical keyboard IME require manual testing.',
  'Covers global search, sidebar, new-item menu, shortcut help, the real question practice route and global graph route, editor suppression, Escape focus restoration, and non-interception of Ctrl+Tab. Physical IME and OS-level key reservation still require manual platform testing.'
]};
const addr=port=>'http://127.0.0.1:'+port+'/exam-app-0.1.1__index.html#/espaco';
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



    await page.goto(addr(8765).replace('#/espaco','#/questoes'),{waitUntil:'domcontentloaded'});
    await page.locator('#view .s-question').waitFor({timeout:25000});
    const options=page.locator('#view .s-question input[type=radio]');
    await options.first().waitFor({timeout:25000});
    await page.locator('#sideNewBtn').focus();
    await page.keyboard.press('Control+k');
    await page.locator('#pal.on').waitFor();
    await page.locator('#palIn').focus();
    await page.keyboard.press('a');
    assert.equal(await page.locator('#palIn').inputValue(),'a','search editor receives typed text');
    assert.equal(await options.evaluateAll(nodes=>nodes.some(node=>node.checked)),false,
      'typing in the real search editor must not select a practice answer');
    await page.locator('#palIn').press('Escape');
    await page.locator('#pal:not(.on)').waitFor({state:'hidden'});
    assert.equal(await page.evaluate(()=>document.activeElement?.id),'sideNewBtn',
      'Escape restores focus to the visible search opener');
    await page.keyboard.press('1');
    assert.equal(await options.evaluateAll(nodes=>nodes.some(node=>node.checked)),true,
      'question answer shortcut selects an available answer on the real practice route');
    report.cases.push({phase:'after',interaction:'real-question-route-and-editor',
      questionRoute:true,questionAnswerShortcutSelected:true,searchEditorSuppressedAnswer:true,searchEscapeRestoredFocus:true});

    await page.evaluate(()=>{
      window.__issue139GraphDraws=0;
      window.__issue139GraphScale=null;
      let awaitingGraphTransform=false;
      const oldClear=CanvasRenderingContext2D.prototype.clearRect;
      CanvasRenderingContext2D.prototype.clearRect=function(...args){
        if(this.canvas?.id==='gvc'){window.__issue139GraphDraws++;awaitingGraphTransform=true;}
        return oldClear.apply(this,args);
      };
      const oldSet=CanvasRenderingContext2D.prototype.setTransform;
      CanvasRenderingContext2D.prototype.setTransform=function(...args){
        if(this.canvas?.id==='gvc'&&awaitingGraphTransform){
          window.__issue139GraphScale=args[0]/(window.devicePixelRatio||1);
          awaitingGraphTransform=false;
        }
        return oldSet.apply(this,args);
      };
    });
    await page.goto(addr(8765).replace('#/espaco','#/grafico'),{waitUntil:'domcontentloaded'});
    await page.locator('#gvc').waitFor({timeout:25000});
    await page.waitForFunction(()=>{
      const info=document.querySelector('.gv-info');
      return info&&!info.textContent.includes('carregando');
    },{timeout:25000});
    await page.waitForTimeout(180);
    await page.locator('#gvc').focus();
    const drawBefore=await page.evaluate(()=>window.__issue139GraphDraws);
    const graphScaleBefore=await page.evaluate(()=>window.__issue139GraphScale);
    assert.ok(Number.isFinite(graphScaleBefore),'real canvas transform exposes the graph zoom before shortcut');
    await page.keyboard.press('Equal');
    await page.waitForTimeout(180);
    const drawAfter=await page.evaluate(()=>window.__issue139GraphDraws);
    const graphScaleAfter=await page.evaluate(()=>window.__issue139GraphScale);
    assert.ok(drawAfter>drawBefore,'real graph redraws after the keyboard chord');
    assert.ok(graphScaleAfter>graphScaleBefore,'Equal zoom chord increases the actual rendered graph scale');
    const sidebarBeforeGraphChord=await page.locator('#app').evaluate(x=>x.classList.contains('collapsed'));
    await page.keyboard.press('Control+b');
    assert.equal(await page.locator('#app').evaluate(x=>x.classList.contains('collapsed')),sidebarBeforeGraphChord,
      'real graph canvas keeps Ctrl+B from dispatching a global sidebar command');
    const reservedDefaultPrevented=await page.locator('body').evaluate(el=>{
      const ev=new KeyboardEvent('keydown',{key:'Tab',ctrlKey:true,bubbles:true,cancelable:true});
      el.dispatchEvent(ev);return ev.defaultPrevented;
    });
    assert.equal(reservedDefaultPrevented,false,'router does not prevent browser-reserved Ctrl+Tab');
    await snap(page,'after_contexts');
    report.cases.push({phase:'after',interaction:'real-graph-route-and-reserved-chord',
      graphRoute:true,graphKeyRedrewCanvas:true,graphZoomIn:true,graphScaleBefore,graphScaleAfter,graphSuppressedGlobalSidebar:true,
      reservedCtrlTabPrevented:false,screenshot:'issue139_after_contexts.png'});

    assert.deepEqual(report.pageErrors,[],'no uncaught browser JavaScript errors');
    console.log('Workspace commands: dynamic help, Ctrl+K, Ctrl+B, Ctrl+Alt+N, editable/modal exclusion PASS');
  }finally{await ctx.close();}
}finally{
  await browser.close();
  await writeFile('prototype/issue139_commands_e2e.json',JSON.stringify(report,null,2)+'\n');
}
