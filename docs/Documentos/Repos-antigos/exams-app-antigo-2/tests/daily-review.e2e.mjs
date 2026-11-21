import assert from 'node:assert/strict';
import path from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';

const root=path.resolve('prototype'),assets=root;
await mkdir(assets,{recursive:true});
const evidence={at:new Date().toISOString(),checks:[],errors:[],limitations:[
  'Chromium desktop/mobile simulation, not a physical screen-reader or IME validation.',
  'Imported highlights are question selections and question comments; PDF annotations require reader integration.'
]};
const base='http://127.0.0.1:8765/exam-app-0.1.1__index.html';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
  for(const width of [390,1366]){
    const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
    const page=await context.newPage();
    page.on('pageerror',e=>evidence.errors.push({width,error:e.message}));
    await page.addInitScript(()=>{
      Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{
        cancel(){},speak(utterance){(window.__spoken||=[]).push(String(utterance.text));}
      }});
      window.SpeechSynthesisUtterance=class {constructor(text){this.text=text;}};
    });
    try{
      await page.goto(base+'#/revisao',{waitUntil:'domcontentloaded'});
      await page.locator('.srs-wrap').waitFor({timeout:20000});
      assert.ok(await page.getByText('Tudo em dia').count()>=1);
      await page.locator('[data-srs-open-create]').click();
      await page.locator('[data-srs-tab="qa"]').click();
      await page.locator('summary').filter({hasText:'Configurações da revisão'}).click();
      await page.locator('#srs-card-theme').fill('Direito Administrativo');
      await page.locator('#srs-text').fill('O princípio da publicidade orienta a Administração.');
      await page.locator('#srs-question').fill('Qual princípio rege a transparência?');
      await page.locator('[data-srs-use-highlight]').click();
      assert.equal(await page.locator('#srs-answer').inputValue(),'O princípio da publicidade orienta a Administração.');
      await page.locator('[data-srs-save-qa]').click();
      await page.locator('.srs-card').first().waitFor();
      assert.ok(await page.locator('.srs-wrap').innerText().then(t=>t.includes('Qual princípio rege')));
      assert.equal(await page.locator('.srs-answer').count(),0,'answer is not visible before reveal');
      await page.locator('#srs-tuning summary').click();
      const themeSlider=page.locator('#srs-tuning [data-srs-tune="theme:direito administrativo"]');
      await themeSlider.waitFor();
      assert.equal(await themeSlider.inputValue(),'50');
      await themeSlider.evaluate(el=>{el.value='0';el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));});
      assert.ok(await page.getByText('Tudo em dia').count()>0,'0% silences a due discipline without deleting it');
      await page.screenshot({path:path.join(assets,'issue83_frequency_silent_'+width+'.png'),animations:'disabled'});
      await page.reload({waitUntil:'domcontentloaded'});
      await page.locator('.srs-wrap').waitFor();
      assert.ok(await page.getByText('Tudo em dia').count()>0,'muted source persists across reload');
      await page.locator('#srs-tuning summary').click();
      const restore=page.locator('#srs-tuning [data-srs-tune="theme:direito administrativo"]');
      assert.equal(await restore.inputValue(),'0');
      await restore.evaluate(el=>{el.value='50';el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));});
      await page.locator('.srs-card').first().waitFor();
      evidence.checks.push({width,case:'tuning by discipline, mute without deletion, persist after reload and restore'});
      await page.locator('[data-srs-speak]').first().click();
      const spokenBefore=await page.evaluate(()=>window.__spoken?.at(-1)||'');
      assert.ok(spokenBefore.includes('Qual princípio'),'pre-reveal TTS reads the question');
      assert.ok(!spokenBefore.includes('O princípio da publicidade'),'TTS does not leak answer');
      await page.locator('[data-srs-reveal]').first().click();
      assert.match(await page.locator('.srs-answer').first().innerText(),/princípio da publicidade/);
      await page.screenshot({path:path.join(assets,'issue82_qa_revealed_'+width+'.png'),animations:'disabled'});
      await page.locator('[data-srs-feedback]').first().click();
      const modal=page.locator('#dlg .dlg-box');
      await modal.waitFor();
      assert.match(await modal.innerText(),/Calibrar intervalo de revisão/);
      assert.equal(await modal.locator('select').count(),1);
      assert.equal(await modal.locator('select option').count(),4);
      await page.screenshot({path:path.join(assets,'issue82_feedback_dialog_'+width+'.png'),animations:'disabled'});
      await modal.getByRole('button',{name:'Cancelar'}).click();
      assert.equal(await modal.count(),0,'cancel does not modify the current card');
      assert.ok(await page.locator('[data-srs-grade="soon"]').count()>0,'card remains gradable');
      await page.locator('[data-srs-edit]').first().click();
      const editDialog=page.locator('#dlg .dlg-box');
      await editDialog.waitFor();
      assert.equal(await editDialog.locator('#fd_original').getAttribute('readonly'),'','original highlight remains read-only');
      assert.equal(await editDialog.locator('#fd_original').inputValue(),'O princípio da publicidade orienta a Administração.');
      await editDialog.locator('#fd_edited').fill('Texto editado: o princípio da publicidade orienta a Administração.');
      await editDialog.locator('#fd_note').fill('Mnemônico: transparência na administração.');
      await page.screenshot({path:path.join(assets,'issue83_nondestructive_edit_'+width+'.png'),animations:'disabled'});
      await editDialog.locator('[data-x="1"]').click();
      // The dialog saves through a Promise callback. Wait for both edited fields
      // to persist before revealing the next card; a visible card may be stale.
      await page.waitForFunction(() => {
        const card=Object.keys(localStorage).filter(k=>k.includes('daily-review:'))
          .flatMap(k=>JSON.parse(localStorage.getItem(k)||'{}').cards||[])
          .find(c=>c.question==='Qual princípio rege a transparência?');
        return card?.editedText==='Texto editado: o princípio da publicidade orienta a Administração.' &&
          card?.note==='Mnemônico: transparência na administração.';
      },null,{timeout:10000});
      await page.locator('.srs-card').first().waitFor();
      assert.equal(await page.locator('.srs-answer').count(),0,'edited answer remains hidden after save');
      await page.locator('[data-srs-reveal]').first().click();
      assert.match(await page.locator('.srs-answer').first().innerText(),/Texto editado: o princípio/);
      assert.match(await page.locator('.srs-note').first().innerText(),/Mnemônico: transparência/);
      const savedHighlight=await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.includes('daily-review:'))
        .flatMap(k=>JSON.parse(localStorage.getItem(k)).cards||[])
        .find(c=>c.question==='Qual princípio rege a transparência?'));
      assert.equal(savedHighlight.originalText,'O princípio da publicidade orienta a Administração.');
      assert.equal(savedHighlight.answer,savedHighlight.originalText,'editing never overwrites original answer');
      assert.match(savedHighlight.editedText,/Texto editado:/);
      await page.locator('[data-srs-grade="soon"]').first().click();
      assert.ok(await page.getByText('Tudo em dia').count()>=1,'correct grading schedules the card');
      assert.equal(await page.locator('.srs-heat-section').count(),2,'real activity has two 91-day heatmaps');
      assert.equal(await page.locator('.srs-heatmap .srs-day').count(),182,'review and new-card days are visible');
      assert.match(await page.locator('.srs-activity').innerText(),/Revisões · 1 nos últimos 91 dias/);
      assert.match(await page.locator('.srs-activity').innerText(),/Novos cartões · 1 nos últimos 91 dias/);
      await page.screenshot({path:path.join(assets,'issue83_review_heatmap_'+width+'.png'),animations:'disabled'});
      await page.reload({waitUntil:'domcontentloaded'});
      await page.locator('.srs-wrap').waitFor();
      assert.ok(await page.getByText('Tudo em dia').count()>=1,'future due date persists after reload');
      assert.match(await page.locator('.srs-activity').innerText(),/Revisões · 1 nos últimos 91 dias/,'review activity persists after reload');
      await page.locator('[data-srs-setting="recency"]').evaluate(el=>{el.value='0';el.dispatchEvent(new Event('input',{bubbles:true}));});
      assert.equal(await page.locator('[data-srs-setting="recency"]').inputValue(),'0');
      await page.reload({waitUntil:'domcontentloaded'});
      await page.locator('.srs-wrap').waitFor();
      assert.equal(await page.locator('[data-srs-setting="recency"]').inputValue(),'0','zero is preserved on the slider');

      await page.locator('[data-srs-open-create]').click();
      await page.locator('#srs-text').fill('A competência administrativa é definida por lei.');
      await page.locator('[data-srs-word]').filter({hasText:'competência'}).click();
      await page.locator('[data-srs-save-cloze]').click();
      assert.ok(await page.locator('.srs-card').first().innerText().then(t=>t.includes('_____')));
      await page.locator('[data-srs-speak]').first().click();
      assert.match(await page.evaluate(()=>window.__spoken.at(-1)),/lacuna/);
      await page.screenshot({path:path.join(assets,'issue82_cloze_'+width+'.png'),animations:'disabled'});
      await page.locator('[data-srs-reveal]').first().click();
      await page.locator('[data-srs-feedback]').first().click();
      await page.locator('#dlg select').selectOption('later');
      await page.locator('#dlg [data-x="1"]').click();
      assert.ok(await page.getByText('Tudo em dia').count()>=1,'feedback grade schedules active cloze');
      evidence.checks.push({width,case:'QA, TTS privacy, scheduling/reload, recency zero, cloze and modal feedback'});

      await page.goto(base+'#/questoes',{waitUntil:'domcontentloaded'});
      const link=page.locator('a[href^="#/questao/"]').first();
      await link.waitFor({timeout:25000});
      await page.goto(base+await link.getAttribute('href'),{waitUntil:'domcontentloaded'});
      const dock=page.locator('.qo .q-dock');
      await dock.waitFor({timeout:15000});
      assert.equal(await dock.locator('[data-q-dock-srs]').count(),1);
      const target=page.locator('.qo [data-q-highlight$="|statement"]').first();
      await target.waitFor();
      await page.evaluate(()=>{
        const text=document.querySelector('.qo [data-q-highlight$="|statement"]').firstChild;
        const range=document.createRange();range.setStart(text,0);range.setEnd(text,Math.min(16,text.textContent.length));
        const sel=window.getSelection();sel.removeAllRanges();sel.addRange(range);
      });
      await dock.locator('[data-q-dock-highlight]').click();
      const count=()=>page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('leitor:daily-review:')).map(k=>JSON.parse(localStorage.getItem(k))).reduce((n,d)=>n+(d.cards?.length||0),0));
      const before=await count();
      await dock.locator('[data-q-dock-srs]').click();
      assert.equal(await count(),before+1,'direct question highlight creates a linked SRS card');
      await dock.locator('[data-q-dock-srs]').click();
      assert.equal(await count(),before+1,'repeated import does not duplicate');
      const origins=await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('leitor:daily-review:')).flatMap(k=>JSON.parse(localStorage.getItem(k)).cards||[]).map(c=>c.sourceKind));
      assert.ok(origins.includes('question-highlight'),'question source is recorded');
      await page.screenshot({path:path.join(assets,'issue82_question_import_'+width+'.png'),animations:'disabled'});
      evidence.checks.push({width,case:'real question saved-highlight import is persistently linked and deduplicated'});
      if(width===390){
        const bbox=await page.locator('.qo .q-dock').boundingBox();
        assert.ok(bbox&&bbox.x>=-2&&bbox.x+bbox.width<=width+3,'study dock fits mobile viewport');
      }
    } finally {await context.close();}
  }
  assert.deepEqual(evidence.errors,[],'no unhandled page errors');
} finally {
  await browser.close();
  await writeFile(path.join(root,'issue82_daily_review_e2e.json'),JSON.stringify(evidence,null,2)+'\n');
}
