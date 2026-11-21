import assert from 'node:assert/strict';
import path from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';

const root=path.resolve('prototype'),assets=root;
await mkdir(assets,{recursive:true});
const report={created:new Date().toISOString(),checks:[],errors:[],limitations:[
 'Chromium desktop/mobile emulation; actual touch device and screen-reader audits remain separate.',
 'Question timers run only after explicit Start; automatic background throttling is controlled by the browser.'
]};
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const base='http://127.0.0.1:8765/exam-app-0.1.1__index.html';
try{
  const context=await browser.newContext({viewport:{width:1366,height:870},reducedMotion:'reduce'});
  const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
  try{
    await page.goto(base+'#/questoes',{waitUntil:'domcontentloaded'});
    const link=page.locator('a[href^="#/questao/"]').first();
    await link.waitFor({timeout:25000});
    await page.goto(base+await link.getAttribute('href'),{waitUntil:'domcontentloaded'});
    const dock=page.locator('.qo .q-dock');await dock.waitFor();
    assert.equal(await dock.locator('.q-dock-tools button').count(),7);
    assert.equal(await dock.locator('[data-q-dock-srs]').count(),1,'saved highlight can become an SRS card');
    const target=page.locator('.qo [data-q-highlight$="|statement"]');
    await target.waitFor();
    await page.evaluate(()=>{
      const text=document.querySelector('.qo [data-q-highlight$="|statement"]').firstChild;
      const end=Math.min(text.textContent.length,8);
      const range=document.createRange();range.setStart(text,0);range.setEnd(text,end);
      const sel=window.getSelection();sel.removeAllRanges();sel.addRange(range);
    });
    await dock.locator('[data-q-dock-highlight]').click();
    assert.ok(await target.locator('mark.q-highlight').count()>=1,'selected statement highlighted');
    await page.screenshot({path:path.join(assets,'issue74_highlight_1366.png'),animations:'disabled'});
    await page.reload({waitUntil:'domcontentloaded'});
    await page.locator('.qo .q-dock').waitFor();
    assert.ok(await page.locator('.qo mark.q-highlight').count()>=1,'highlight survives refresh');
    await page.locator('.qo mark.q-highlight').first().click();
    assert.equal(await page.locator('.qo mark.q-highlight').count(),0,'highlight can be removed');
    report.checks.push('selection-based highlight persisted and removed by clicking mark');

    const dock2=page.locator('.qo .q-dock');
    await dock2.locator('[data-q-dock-font="up"]').click();
    assert.equal(await page.locator('.qo').evaluate(el=>el.style.getPropertyValue('--q-dock-font')),'17px');
    await page.reload({waitUntil:'domcontentloaded'});
    await page.locator('.qo .q-dock').waitFor();
    assert.equal(await page.locator('.qo').evaluate(el=>el.style.getPropertyValue('--q-dock-font')),'17px');
    report.checks.push('font changes persist in supported 14–20px range');

    const focus=page.locator('.qo [data-q-dock-focus]');
    await focus.click();
    assert.equal(await page.locator('#app.study-focus').count(),1);
    assert.equal(await focus.getAttribute('aria-pressed'),'true');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#app.study-focus').count(),0);
    report.checks.push('focus hides distractions and exits via Escape');

    const timer=page.locator('.qo [data-q-dock-timer]');
    await timer.click();
    assert.equal(await timer.getAttribute('aria-pressed'),'true');
    await page.waitForTimeout(1300);
    const reading=await page.locator('.qo [data-q-dock-clock]').innerText();
    assert.notEqual(reading,'00:00','timer advances');
    await timer.click();
    assert.equal(await timer.getAttribute('aria-pressed'),'false');
    await page.reload({waitUntil:'domcontentloaded'});
    assert.notEqual(await page.locator('.qo [data-q-dock-clock]').innerText(),'00:00','elapsed time persists');
    report.checks.push('progressive timer starts, pauses and persists without leaking answer');

    const sheet=page.locator('.qo [data-q-dock-sheet]');
    await sheet.click();
    assert.equal(await sheet.getAttribute('aria-expanded'),'true');
    assert.ok(await page.locator('.qo .q-dock-sheet .q-grid a').count()>0);
    await page.screenshot({path:path.join(assets,'issue74_sheet_1366.png'),animations:'disabled'});
    await sheet.click();
    assert.equal(await sheet.getAttribute('aria-expanded'),'false');
    report.checks.push('real answer sheet toggles for individual question');

    await page.goto(base+'#/questoes',{waitUntil:'domcontentloaded'});
    await page.locator('.s-question .q-dock').first().waitFor({timeout:25000});
    assert.equal(await page.locator('.s-question .q-dock-tools button').first().count(),1);
    const practiceSheet=page.locator('.s-question .q-dock [data-q-dock-sheet]').first();
    await practiceSheet.click();
    assert.ok(await page.locator('.s-question .q-dock-sheet .s-navigator button').first().count()>0);
    report.checks.push('practice dock reuses existing navigator actions');

    await page.goto(base+'#/simulado',{waitUntil:'domcontentloaded'});
    await page.locator('[data-s-start]').waitFor();
    await page.locator('[data-s-start]').click();
    await page.locator('.s-question .q-dock[data-q-dock-mode="exam"]').waitFor({timeout:25000});
    await page.locator('.s-question .q-dock [data-q-dock-sheet]').click();
    assert.ok(await page.locator('.s-question .q-dock-sheet [data-s-jump]').count()>0);
    assert.equal(await page.locator('.s-feedback').count(),0,'no answer revealed in unfinished exam');
    await page.screenshot({path:path.join(assets,'issue74_exam_1366.png'),animations:'disabled'});
    report.checks.push('exam dock and navigation do not reveal gabarito');
  }finally{await context.close();}
  assert.deepEqual(report.errors,[],'no uncaught JS errors');
}finally{await browser.close();await writeFile(path.join(root,'issue74_study_dock_e2e.json'),JSON.stringify(report,null,2)+'\n');}
