import assert from 'node:assert/strict';
import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const output = path.resolve('prototypes/board-exam-app/assets');
await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const report={date:new Date().toISOString(),cases:[],pageErrors:[],limitations:[
  'Chromium pointer/keyboard and mobile emulation tested; physical touch hardware and a screen reader were not tested.',
  'Scope is the space switcher only; the app still stores spaces in browser-local storage, not a cloud database.'
]};
const url=(port)=>'http://127.0.0.1:'+port+'/exam-app-0.1.1/index.html#/espaco';
const afterPort=8765,beforePort=8766;
async function capture(page,filename){
  await page.screenshot({path:path.join(output,'issue138_'+filename+'.png'),animations:'disabled',fullPage:false});
}
async function listNames(page){return page.locator('#spItems .sp-select .t').allTextContents();}
async function open(page){await page.locator('#spBtn').click();await page.locator('#spSearch').waitFor(); }
async function create(page,name){
  await open(page);
  await page.locator('#spPop .sp-create').click();
  await page.locator('#dlgIn').fill(name);
  await page.locator('#dlg [data-x="1"]').click();
  await page.locator('#spName').getByText(name,{exact:true}).waitFor();
}
const context=await browser.newContext({viewport:{width:1366,height:880},reducedMotion:'reduce'});
const page=await context.newPage();
page.on('pageerror',e=>report.pageErrors.push(e.message));
try {
  const before=await browser.newContext({viewport:{width:1366,height:880},reducedMotion:'reduce'});
  const baseline=await before.newPage();
  try{
    await baseline.goto(url(beforePort),{waitUntil:'domcontentloaded'});
    await baseline.locator('#spBtn').click();
    assert.equal(await baseline.locator('#spSearch').count(),0,'real baseline has no space search input');
    await capture(baseline,'before_desktop');
    report.cases.push({phase:'before',search:false,photo:'issue138_before_desktop.png'});
  }finally{await before.close();}
  await page.goto(url(afterPort),{waitUntil:'domcontentloaded'});
  await create(page,'Área Alfa');
  await create(page,'Área Beta');
  const selected=await page.locator('#spName').innerText();
  assert.equal(selected,'Área Beta');
  await open(page);
  let names=await listNames(page);
  assert.deepEqual(names,['Concurso de TI','Área Alfa','Área Beta']);
  const search=page.locator('#spSearch');
  assert.equal(await search.evaluate(x=>document.activeElement===x),true,'search receives initial focus');
  await search.fill('area alfa');
  assert.deepEqual(await listNames(page),['Área Alfa'],'case/accent-insensitive search');
  assert.equal(await page.locator('#spPop .sp-grip:enabled').count(),0,'no reorder while filtered');
  await capture(page,'search_desktop');
  await search.fill('nenhum resultado');
  assert.equal(await page.locator('#spPop .sp-empty').innerText(),'Nenhum espaço encontrado.');
  await search.fill(''); 
  const betaGrip=page.locator('#spPop [data-spdrag]').last();
  await betaGrip.focus();
  await page.keyboard.press('Alt+ArrowUp');
  names=await listNames(page);
  assert.deepEqual(names,['Concurso de TI','Área Beta','Área Alfa'],'keyboard reorders the list');
  assert.equal(await page.locator('#spName').innerText(),selected,'reorder must not activate a new space');
  await capture(page,'after_keyboard_desktop');
  report.cases.push({phase:'after',interaction:'keyboard',names,selected,photo:'issue138_after_keyboard_desktop.png'});
  await page.reload({waitUntil:'domcontentloaded'});
  await open(page);
  assert.deepEqual(await listNames(page),names,'space ID order persisted across reload');
  assert.equal(await page.locator('#spName').innerText(),selected,'active space preserved across reload');
  let start=page.locator('[data-spentry]').last().locator('.sp-grip'),target=page.locator('[data-spentry]').nth(1);
  const from=await start.boundingBox(),to=await target.boundingBox();
  assert.ok(from&&to,'drag target must be visible');
  await page.mouse.move(from.x+from.width/2,from.y+from.height/2);
  await page.mouse.down();
  await page.mouse.move(to.x+to.width/2,to.y+3,{steps:12});
  await page.mouse.up();
  names=await listNames(page);
  assert.deepEqual(names,['Concurso de TI','Área Alfa','Área Beta'],'pointer drag restores original order');
  assert.equal(await page.locator('#spName').innerText(),selected);
  await capture(page,'after_drag_desktop');
  report.cases.push({phase:'after',interaction:'pointer',names,selected,photo:'issue138_after_drag_desktop.png'});
  // Escape during an in-progress drag must revert without closing or reordering.
  start=page.locator('[data-spentry]').last().locator('.sp-grip');target=page.locator('[data-spentry]').nth(1);
  const from2=await start.boundingBox(),to2=await target.boundingBox();
  await page.mouse.move(from2.x+from2.width/2,from2.y+from2.height/2);
  await page.mouse.down();
  await page.mouse.move(to2.x+to2.width/2,to2.y+3,{steps:8});
  await page.keyboard.press('Escape');
  await page.mouse.up();
  assert.deepEqual(await listNames(page),names,'cancelled pointer drag must not mutate persistent order');
  assert.equal(await page.locator('#spPop.open').count(),1,'cancelled drag keeps popover open');
  await page.locator('#spSearch').focus();
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#spPop.open').count(),0,'Escape closes switcher');
  assert.equal(await page.locator('#spBtn').evaluate(x=>document.activeElement===x),true,'Escape restores trigger focus');

  const mobile=await browser.newContext({viewport:{width:390,height:800},isMobile:true,hasTouch:true,deviceScaleFactor:2,reducedMotion:'reduce'});
  const mp=await mobile.newPage();
  mp.on('pageerror',e=>report.pageErrors.push(e.message));
  try{
    await mp.goto(url(afterPort),{waitUntil:'domcontentloaded'});
    await open(mp);
    const rect=await mp.locator('#spPop').boundingBox();
    assert.ok(rect&&rect.width<=390&&rect.x>=0&&rect.x+rect.width<=390,'space switcher must fit viewport');
    assert.deepEqual(await listNames(mp),names,'mobile shares persistent ordering on same local origin/context');
    await mp.locator('#spSearch').fill('beta');
    assert.deepEqual(await listNames(mp),['Área Beta']);
    await capture(mp,'after_mobile_390');
    await mp.locator('#spPop .sp-select').click();
    assert.equal(await mp.locator('#spName').innerText(),'Área Beta');
    report.cases.push({phase:'after',interaction:'mobile-search-and-select',width:390,photo:'issue138_after_mobile_390.png'});
  }finally{await mobile.close();}
  assert.deepEqual(report.pageErrors,[], 'no runtime browser errors');
  console.log('SpaceSwitcher: searchable, keyboard reordering, pointer drag and cancel, persisted order and mobile PASS');
}finally{
 await context.close(); await browser.close();
 await writeFile('prototypes/board-exam-app/issue138_spaces_e2e.json',JSON.stringify(report,null,2)+'\n');
}
