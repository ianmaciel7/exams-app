import assert from 'node:assert/strict';
import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const dir=path.resolve('prototypes/board-exam-app/assets');
await mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const report={date:new Date().toISOString(),events:[],errors:[]};
const manual=[
  {id:'u-filter70-js',conc:'dataprev',ed:'dataprev-2026',cg:'dataprev-2026-ti-dev',
    materia:'Língua Portuguesa',assunto:'Interpretação de Texto',modalidade:'Múltipla escolha',dificuldade:'Média',
    enunciado:'QUESTAO FILTRO JAVASCRIPT - Como interpretar este enunciado?',
    alternativas:{A:'Resultado incorreto',B:'Resultado correto'},gabarito:'B',origem:'manual',criada:1763140000000},
  {id:'u-filter70-other',conc:'dataprev',ed:'dataprev-2026',cg:'dataprev-2026-ti-dev',
    materia:'Conhecimentos Específicos',assunto:'APIs REST',modalidade:'Múltipla escolha',dificuldade:'Difícil',
    enunciado:'QUESTAO FILTRO REST - Qual arquitetura aplicar?',
    alternativas:{A:'Correto',B:'Incorreto'},gabarito:'A',origem:'manual',anulada:true,criada:1763140000001},
];
const url=(port,hash)=>'http://127.0.0.1:'+port+'/exam-app-0.1.1/index.html#'+hash;
async function pageFor(port){
  const context=await browser.newContext({viewport:{width:1366,height:900},deviceScaleFactor:1,reducedMotion:'reduce'});
  const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
  await page.goto(url(port,'/espaco'),{waitUntil:'domcontentloaded'});
  await page.evaluate(q=>{
    localStorage.clear();
    localStorage.setItem('leitor:uq',JSON.stringify(q));
    localStorage.setItem('leitor:cadernos',JSON.stringify([{id:'cbfilter70',sp:'dataprev',name:'Revisão de Português',goal:80,questionIds:[q[0].id],retakeIds:[],created:Date.now()}]));
    localStorage.setItem('leitor:qflags',JSON.stringify({[q[0].id]:{note:'Anotar contexto semântico'}}));
  },manual);
  await page.goto(url(port,'/questoes'),{waitUntil:'domcontentloaded'});
  await page.locator('[data-qf="study"] [data-qf-text]').waitFor({timeout:20000});
  return {page,context};
}
async function shot(page,name){
  await page.screenshot({path:path.join(dir,'issue70_'+name+'.png'),animations:'disabled'});
  report.events.push({name,hash:new URL(page.url()).hash});
}
async function expectCount(page,matcher){
  await assert.doesNotReject(async()=>assert.match(await page.locator('[data-qf="study"] .qf-count').innerText(),matcher));
}
try{
  const before=await pageFor('8766');
  try{
    await shot(before.page,'before_simple');
    assert.equal(await before.page.locator('[data-qf-panel]').count(),0);
  }finally{await before.context.close();}

  const after=await pageFor('8765');
  const page=after.page;
  try{
    await expectCount(page,/72/);
    const toggle=page.locator('[data-qf="study"] .qf-panel-toggle');
    await toggle.click();
    assert.equal(await toggle.getAttribute('aria-expanded'),'true');
    assert.equal(await page.locator('[data-qf-field="assunto"]').isDisabled(),true);
    await shot(page,'after_open_panel');

    await page.locator('[data-qf-field="disc"]').selectOption('Língua Portuguesa');
    assert.equal(await page.locator('[data-qf-field="assunto"]').isEnabled(),true);
    await page.locator('[data-qf-field="assunto"]').selectOption('Interpretação de Texto');
    await page.locator('[data-qid="u-filter70-js"]').waitFor();
    await expectCount(page,/1 de 72/);
    assert.match(page.url(),/disc=L%C3%ADngua\+Portuguesa/);
    assert.match(page.url(),/assunto=Interpreta%C3%A7%C3%A3o\+de\+Texto/);
    await shot(page,'after_cascade');

    await page.locator('[data-qf-flag="cadernos"]').check();
    await expectCount(page,/0 de 72/);
    assert.match(page.url(),/x_cadernos=1/);
    await shot(page,'after_exclusion');
    await page.locator('[data-qf-flag="cadernos"]').uncheck();
    await expectCount(page,/1 de 72/);
    await page.locator('[data-qf-flag="anotacoes"]').check();
    await expectCount(page,/1 de 72/);
    await page.reload({waitUntil:'domcontentloaded'});
    await page.locator('[data-qf="study"] [data-qf-text]').waitFor({timeout:20000});
    await expectCount(page,/1 de 72/);
    assert.match(page.url(),/x_anotacoes=1/);
    await page.locator('[data-qf="study"] .qf-panel-toggle').click();
    assert.equal(await page.locator('[data-qf-flag="anotacoes"]').isChecked(),true);
    await shot(page,'after_reload_flags');

    await page.locator('[data-qf-flag="anotacoes"]').uncheck();
    await page.locator('[data-qf-apply]').click();
    assert.equal(await page.locator('.qf-advanced-body').isHidden(),true);
    await page.locator('[data-qf-save-filter="study"]').click();
    await page.locator('#dlgIn').fill('Interpretação de texto');
    await page.locator('#dlg [data-x="1"]').click();
    const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('leitor:savedQuestionFilters')||'[]'));
    assert.equal(saved.length,1);
    assert.deepEqual(saved[0].query.f.disc,['Língua Portuguesa']);
    assert.deepEqual(saved[0].query.f.assunto,['Interpretação de Texto']);
    assert.equal(saved[0].query.x.anuladas,true);
    await shot(page,'after_saved');

    await page.goto(url('8765','/filtros'),{waitUntil:'domcontentloaded'});
    await page.locator('a[href^="#/questoes?"]').first().click();
    await page.locator('[data-qid="u-filter70-js"]').waitFor();
    await expectCount(page,/1 de 72/);

    for(const label of ['Gerar Caderno','Meus Cadernos','Meus filtros','Criar Simulado','Salvar filtro']){
      const actions=await page.locator('[data-qf="study"] .qf-saved-actions').innerText();
      assert.ok(actions.includes(label),'missing action '+label);
    }
    await page.locator('[data-qf-sim="study"]').click();
    await page.waitForURL(/#\/simulado\/exec/);
    const attempt=await page.evaluate(()=>JSON.parse(localStorage.getItem('study:exam:dataprev-2026-tipo1')||'null'));
    assert.deepEqual(attempt.order,['u-filter70-js']);
    await shot(page,'after_simulado_filtrado');

    await page.goto(url('8765','/questoes'),{waitUntil:'domcontentloaded'});
    await page.locator('[data-qf="study"] .qf-panel-toggle').click();
    await page.locator('[data-qf-flag="anuladas"]').uncheck();
    await expectCount(page,/72/); // With default exclusion disabled, the annulled manual question is visible.
    await page.locator('[data-qf-clear]').last().click();
    await expectCount(page,/71/); // default "Anuladas" excludes one manual question from 72
    await shot(page,'after_clear_defaults');

    await page.setViewportSize({width:390,height:800});
    await page.locator('[data-qf="study"] .qf-panel-toggle').click();
    const metrics=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth}));
    assert.ok(metrics.scrollWidth<=metrics.width+2,'mobile horizontal overflow '+JSON.stringify(metrics));
    await shot(page,'after_mobile');
  }finally{await after.context.close();}
  assert.deepEqual(report.errors,[],'no unhandled page errors');
  console.log('Advanced filters: cascading Disciplina->Assunto, URL flags, saved Queries, exclude notebook, mobile, filtered simulation E2E PASSED.');
}finally{
  await browser.close();
  await writeFile('prototypes/board-exam-app/issue70_e2e.json',JSON.stringify(report,null,2)+'\n');
}
