import assert from 'node:assert/strict';
import path from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';

const root=path.resolve('prototype'),assets=root;
await mkdir(assets,{recursive:true});
const report={at:new Date().toISOString(),checks:[],errors:[],limits:[
  'Chromium emulation at 390/1366px; not a physical keyboard/screen-reader verification.',
  'PDF progress reflects an actual saved page position, not an invented word count.'
]};
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const base='http://127.0.0.1:8765/exam-app-0.1.1__index.html';
try {
 for(const width of [390,1366]){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
  const page=await context.newPage();
  page.on('pageerror',e=>report.errors.push(e.message));
  try {
   await page.goto(base+'#edital',{waitUntil:'domcontentloaded'});
   const tools=page.locator('#readerTriageTools');
   await tools.waitFor({state:'visible',timeout:30000});
   const later=page.locator('#readerLater'),priority=page.locator('#readerShortlist'),archive=page.locator('#readerArchive');
   assert.equal(await tools.getAttribute('aria-label'),'Triagem do PDF aberto');
   for(const button of [later,priority,archive])assert.equal(await button.getAttribute('aria-pressed'),'false');
   await later.click();
   assert.equal(await later.getAttribute('aria-pressed'),'true','Later action uses real reader document');
   await priority.click();
   assert.equal(await priority.getAttribute('aria-pressed'),'true','Priority action supersedes Later');
   assert.equal(await later.getAttribute('aria-pressed'),'false');
   await page.locator('#view').focus();
   await page.keyboard.press('e');
   assert.equal(await archive.getAttribute('aria-pressed'),'true','e archives in opened document');
   await page.locator('#view').focus();
   await page.keyboard.press('l');
   assert.equal(await later.getAttribute('aria-pressed'),'true','l marks reader PDF for Later');
   await page.screenshot({path:path.join(assets,'issue81_reader_toolbar_'+width+'.png'),animations:'disabled'});

   await page.goto(base+'#/tipo/pdf',{waitUntil:'domcontentloaded'});
   await page.locator('.td-layout-triage').waitFor({timeout:15000});
   assert.equal(await tools.isHidden(),true,'toolbar is hidden outside reader');
   await page.locator('[data-td-triage="pdf|later"]').click();
   const row=page.locator('.td-reader-row[data-td-reader-id="edital"]');
   assert.equal(await row.count(),1,'PDF reader action immediately affects library filter');
   assert.equal(await row.locator('[data-td-target="later"]').getAttribute('aria-pressed'),'true');
   await page.reload({waitUntil:'domcontentloaded'});
   await row.waitFor({timeout:15000});
   assert.equal(await row.count(),1,'reading queue persists across refresh');

   // Another PDF remains in Inbox by default.
   await page.locator('[data-td-triage="pdf|inbox"]').click();
   assert.ok(await page.locator('.td-reader-row:visible').count()>0,'other PDFs remain in Inbox');
   report.checks.push({width,steps:'real PDF toolbar, Later, Shortlist, keyboard Archive, persistence, filtered library'});
  } finally { await context.close(); }
 }
 assert.deepEqual(report.errors,[],'no browser page errors');
} finally {
 await browser.close();
 await writeFile(path.join(root,'issue81_reader_toolbar_e2e.json'),JSON.stringify(report,null,2)+'\n');
}
