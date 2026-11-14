import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const base=path.resolve('prototypes/board-exam-app/assets');
await mkdir(base,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const errors=[];
const report={date:new Date().toISOString(),scenarios:[],errors};
const q={
 id:'u-e2e-book',conc:'dataprev',ed:'dataprev-2026',cg:'dataprev-2026-ti-dev',
 materia:'Língua Portuguesa',enunciado:'QUESTAO DO CADERNO - Qual é a resposta?',
 alternativas:{A:'Errado',B:'Correto'},gabarito:'B',origem:'manual',criada:1763140000000,
};
const url=(port,route)=>'http://127.0.0.1:'+port+'/exam-app-0.1.1/index.html#'+route;
const shot=async(page,name)=>{
 await page.screenshot({path:path.join(base,'issue75_'+name+'.png'),animations:'disabled'});
 report.scenarios.push({screenshot:'issue75_'+name+'.png',url:page.url()});
};
async function setup(port){
 const context=await browser.newContext({viewport:{width:1366,height:900},deviceScaleFactor:1,reducedMotion:'reduce'});
 const page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(url(port,'/espaco'),{waitUntil:'domcontentloaded'});
 await page.evaluate(data=>{
  localStorage.clear();
  localStorage.setItem('leitor:uq',JSON.stringify([data]));
 },q);
 await page.goto(url(port,'/questoes'),{waitUntil:'domcontentloaded'});
 return {page,context};
}
try{
 {
  const {page,context}=await setup('8766');
  try{
   await page.locator('[data-qf="study"] [data-qf-text]').waitFor({timeout:30000});
   await shot(page,'before_no_notebooks');
   assert.equal(await page.locator('[data-qf-create-book]').count(),0);
  }finally{await context.close();}
 }
 const {page,context}=await setup('8765');
 try{
  await page.locator('[data-qf="study"] [data-qf-text]').waitFor({timeout:30000});
  await page.locator('[data-qf="study"] [data-qf-text]').fill('QUESTAO DO CADERNO');
  await page.locator('[data-qid="u-e2e-book"]').waitFor();
  await shot(page,'after_filter');

  await page.locator('[data-qf-create-book="study"]').click();
  await page.locator('#dlgIn').fill('Revisão de Software');
  await page.locator('#nbGoal').fill('80');
  await page.locator('#dlg [data-x="1"]').click();
  await page.waitForURL(/#\/caderno\//);
  await page.locator('.nb-stats').waitFor({timeout:30000});
  const books=await page.evaluate(()=>JSON.parse(localStorage.getItem('leitor:cadernos')||'[]'));
  assert.equal(books.length,1);
  const id=books[0].id;
  assert.deepEqual(books[0].questionIds,['u-e2e-book']);
  assert.equal(books[0].goal,80);
  assert.match(await page.locator('.nb-stats').innerText(),/0 \/ 1/);
  await shot(page,'after_book_created');

  await page.locator('[data-qid="u-e2e-book"] .s-option').filter({has:page.locator('input[value="B"]')}).click();
  await page.locator('[data-qid="u-e2e-book"] .s-feedback.good').waitFor();
  let answers=await page.evaluate(()=>JSON.parse(localStorage.getItem('leitor:cadernoAnswers')||'{}'));
  assert.equal(answers[id]['u-e2e-book'].selected,'B');
  assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('leitor:uqAns')||'{}')),{},'book progress must not overwrite global answer');
  assert.match(await page.locator('.nb-stats').innerText(),/100%/);
  await shot(page,'after_book_answer');

  await page.locator('[data-nb-reset="'+id+'"]').click();
  await page.locator('#dlg [data-x="1"]').click();
  await page.locator('.s-option input[value="A"]').waitFor();
  assert.match(await page.locator('.nb-stats').innerText(),/0 \/ 1/);
  answers=await page.evaluate(()=>JSON.parse(localStorage.getItem('leitor:cadernoAnswers')||'{}'));
  assert.ok(!answers[id], 'reset only book attempts');

  await page.locator('[data-qid="u-e2e-book"] .s-option').filter({has:page.locator('input[value="A"]')}).click();
  await page.locator('[data-qid="u-e2e-book"] .s-feedback.bad').waitFor();
  await page.locator('[data-nb-retake="'+id+'"]').click();
  await page.locator('#dlg [data-x="1"]').click();
  await page.waitForURL(new RegExp('/caderno/'+id+'/erradas'));
  await page.locator('.s-question').waitFor();
  answers=await page.evaluate(()=>JSON.parse(localStorage.getItem('leitor:cadernoAnswers')||'{}'));
  assert.equal(answers[id]?.['u-e2e-book'],undefined);
  await shot(page,'after_retake_errors');
  await page.locator('[data-qid="u-e2e-book"] .s-option').filter({has:page.locator('input[value="B"]')}).click();
  await page.locator('.s-feedback.good').waitFor();

  await page.goto(url('8765','/questao/q1'),{waitUntil:'domcontentloaded'});
  await page.locator('.nb-membership').first().waitFor({timeout:30000});
  await page.locator('.nb-membership summary').first().click();
  await page.locator('[data-nb-member="q1|'+id+'"]').check();
  const updated=await page.evaluate(()=>JSON.parse(localStorage.getItem('leitor:cadernos')||'[]'));
  assert.ok(updated[0].questionIds.includes('q1'));
  await shot(page,'after_question_member');

  await page.goto(url('8765','/questoes'),{waitUntil:'domcontentloaded'});
  await page.locator('[data-qf="study"] [data-qf-text]').waitFor({timeout:30000});
  await page.locator('[data-qf="study"] [data-qf-text]').fill('QUESTAO DO CADERNO');
  await page.locator('[data-qf-save-filter="study"]').click();
  await page.locator('#dlgIn').fill('Buscar questão do caderno');
  await page.locator('#dlg [data-x="1"]').click();
  const filters=await page.evaluate(()=>JSON.parse(localStorage.getItem('leitor:savedQuestionFilters')||'[]'));
  assert.equal(filters.length,1);
  assert.equal(filters[0].query.text,'QUESTAO DO CADERNO');
  await page.goto(url('8765','/tipo/questao'),{waitUntil:'domcontentloaded'});
  await page.locator('a[href^="#/questoes?busca=QUESTAO"]').first().waitFor({timeout:30000});
  await shot(page,'after_saved_query');

  await page.goto(url('8765','/filtros'),{waitUntil:'domcontentloaded'});
  await page.locator('a[href^="#/questoes?busca=QUESTAO"]').first().click();
  await page.waitForURL(/#\/questoes\?busca=QUESTAO/);
  await page.locator('[data-qid="u-e2e-book"]').waitFor();

  await page.goto(url('8765','/cadernos'),{waitUntil:'domcontentloaded'});
  await page.locator('.nb-card').waitFor({timeout:30000});
  await page.locator('[data-nb-continue="'+id+'"]').first().click();
  await page.waitForURL(/#\/caderno\/cb.*at=1/);
  await page.locator('[data-qid="q1"]').waitFor();
  await shot(page,'after_continue_pending');

  await page.setViewportSize({width:390,height:800});
  await page.goto(url('8765','/cadernos'),{waitUntil:'domcontentloaded'});
  await page.locator('.nb-card').waitFor({timeout:30000});
  const mobile=await page.evaluate(()=>({w:innerWidth,scrollWidth:document.documentElement.scrollWidth}));
  assert.ok(mobile.scrollWidth<=mobile.w+2,'notebook page must avoid horizontal overflow on mobile');
  await shot(page,'after_mobile');
 }finally{await context.close();}
 assert.deepEqual(errors,[], 'no unhandled page JS errors');
 console.log('Notebooks E2E passed: create from filtered bank, goal, independent attempts, retake errors, assignment, saved Queries, resume and mobile.');
}finally{
 await browser.close();
 await writeFile('prototypes/board-exam-app/issue75_e2e.json',JSON.stringify(report,null,2)+'\n');
}
