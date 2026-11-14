import assert from 'node:assert/strict';
import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const dir=path.resolve('prototypes/board-exam-app/assets');
await mkdir(dir,{recursive:true});
const report={source:'Playwright Chromium',viewport:{width:1100,height:850},scenarios:[],errors:[]};
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const pdfName='edital-2a-retificacao.pdf';
const versions=[['before','8766'],['after','8765']];
const sample=(r)=>report.scenarios.push(r);

async function launch(version,port,dpr){
 const context=await browser.newContext({viewport:report.viewport,deviceScaleFactor:dpr,reducedMotion:'reduce',permissions:['clipboard-read','clipboard-write']});
 const page=await context.newPage();
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:'+port+'/exam-app-0.1.1/index.html#ret2',{waitUntil:'domcontentloaded',timeout:30000});
 await page.locator('.page[data-p="1"] canvas').waitFor({timeout:45000});
 return {page,context,errors,version,port,dpr};
}
async function pageNumber(page){
 return page.evaluate(async()=>{
  const doc=await pdfjsLib.getDocument('pdfs/'+ 'edital-2a-retificacao.pdf').promise;
  try{
   for(let p=1;p<=doc.numPages;p++){
    const text=(await (await doc.getPage(p)).getTextContent()).items.map(i=>i.str).join(' ');
    if(text.includes('6.6.2'))return p;
   }
   return 1;
  }finally{await doc.destroy();}
 });
}
async function inspect(target,pageno,zoom){
 const {page,version,dpr}=target;
 if(zoom!==1)await page.evaluate(z=>localStorage.setItem('leitor:zoom',JSON.stringify(z)),zoom);
 // PDF viewer rerenders on zoom controls; clicking updates both canvas and textLayer.
 if(zoom!==1){
  await page.evaluate(z=>{
   // Set using the actual +/- controls (each increment = 10%).
   const current=Math.round(Number(document.getElementById('zfit').textContent.replace('%','')));
   const requested=Math.round(z*100),step=requested>current?'zin':'zout';
   for(let val=current;step==='zin'?val<requested:val>requested;val+=step==='zin'?10:-10)document.getElementById(step).click();
  },zoom);
 }
 await page.evaluate(p=>document.querySelector('.page[data-p="'+p+'"]').scrollIntoView({block:'start'}),pageno);
 const el=page.locator('.page[data-p="'+pageno+'"]');
 await el.locator('canvas').waitFor({timeout:45000});
 await el.locator('.textLayer span').first().waitFor({timeout:30000});
 const m=await el.evaluate(holder=>{
   const cv=holder.querySelector('canvas'),tl=holder.querySelector('.textLayer');
   const cs=holder.getBoundingClientRect(),tr=tl.getBoundingClientRect();
   const spans=[...tl.querySelectorAll('span')].filter(x=>x.textContent?.trim()).slice(0,20);
   return {
    canvasBacking:{w:cv.width,h:cv.height},
    css:{w:cs.width,h:cs.height},
    ratio:cv.width/cs.width,
    textSpanCount:tl.querySelectorAll('span').length,
    textLayer:{w:tr.width,h:tr.height},
    selectionProbe:spans[0]?.textContent||'',
    status:holder.dataset.textStatus||'untracked',
    horizontalDelta:Math.abs(tr.width-cs.width),
    verticalDelta:Math.abs(tr.height-cs.height),
   };
 });
 assert.ok(m.textSpanCount>0,'textLayer must contain selectable spans');
 assert.ok(m.ratio>=dpr*.94&&m.ratio<=dpr*1.06,'canvas resolution must follow DPR, version '+version+': '+JSON.stringify(m));
 assert.ok(m.horizontalDelta<2,'textLayer must cover the same CSS width as the page');
 sample({version,dpr,zoom,page:pageno,...m});
 return m;
}
async function selectionTest(target,pageno){
 const {page,version,dpr}=target;
 const picked=await page.evaluate(p=>{
   const host=document.querySelector('.page[data-p="'+p+'"] .textLayer');
   const span=[...host.querySelectorAll('span')].find(x=>x.textContent?.trim().length>3);
   if(!span)return null;
   const range=document.createRange();range.selectNodeContents(span);
   const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);
   return {expected:span.textContent,actual:selection.toString(),rect:span.getBoundingClientRect().toJSON()};
 },pageno);
 assert.ok(picked?.actual?.trim(),'must select real text');
 assert.equal(picked.actual.trim(),picked.expected.trim(),'selection content must match visible text layer');
 const copied=await page.evaluate(async()=>{const text=window.getSelection()?.toString()||'';await navigator.clipboard.writeText(text);return navigator.clipboard.readText();});
 assert.equal(copied,picked.actual,'clipboard must preserve PDF text including accents');
 sample({version,dpr,selection:picked.actual,copy:copied});
}
async function recoveryTest(target,pageno){
 const {page}=target;
 // The bundled PDF.js export has a read-only accessor, so directly monkeypatching
 // pdfjsLib.renderTextLayer does not reliably inject an engine error. Instead
 // recreate the user-visible failure state and exercise the actual retry handler.
 await page.evaluate(p=>{
   const holder=document.querySelector('.page[data-p="'+p+'"]');
   holder.querySelector('.textLayer')?.remove();
   holder.dataset.textStatus='error';
   const notice=document.createElement('div');notice.className='pdf-page-notice';
   notice.dataset.pdfNotice='text';notice.setAttribute('role','status');
   const text=document.createElement('span');text.textContent='Não foi possível habilitar a seleção de texto nesta página.';
   const btn=document.createElement('button');btn.type='button';btn.dataset.pdfRetry='text';btn.dataset.pdfPage=String(p);btn.textContent='Tentar novamente';
   notice.append(text,btn);holder.appendChild(notice);
 },pageno);
 const el=page.locator('.page[data-p="'+pageno+'"]');
 await el.locator('[data-pdf-notice="text"]').waitFor({timeout:10000});
 assert.equal(await el.getAttribute('data-text-status'),'error');
 assert.ok(await el.locator('canvas').count(),'canvas must survive an unavailable text layer');
 await el.locator('[data-pdf-retry="text"]').click();
 await el.locator('.textLayer span').first().waitFor({timeout:30000});
 assert.equal(await el.getAttribute('data-text-status'),'ready');
 sample({version:'after',dpr:target.dpr,recovery:'synthetic textLayer error UI state + real retry handler succeeds, canvas preserved'});
}
try{
 for(const [version,port] of versions)for(const dpr of [1,2]){
  const target=await launch(version,port,dpr);
  try{
   const p=await pageNumber(target.page);
   if(version==='after'&&dpr===1)assert.ok(p>0);
   for(const z of [1,1.5,2]){
    const metrics=await inspect(target,p,z);
    if((z===1||z===2)&&dpr===2){
     const name='pdf112_'+version+'_dpr2_zoom'+String(z).replace('.','-')+'.png';
     await target.page.screenshot({path:path.join(dir,name),animations:'disabled'});
     sample({screenshot:name,version,dpr,zoom:z,page:p,textCount:metrics.textSpanCount});
    }
   }
   if(version==='after'){
    await selectionTest(target,p);
    if(dpr===1)await recoveryTest(target,p);
   }
   report.errors.push(...target.errors.map(msg=>({version,dpr,msg})));
  }finally{await target.context.close();}
 }
 // The synthetic failure state must recover without unhandled page errors.
 assert.deepEqual(report.errors,[],'unexpected JS errors');
 console.log('PDF diagnostic passed across DPR 1/2 and zoom 100/150/200, with selection/copy and synthetic-state retry.');
}finally{
 await browser.close();
 await writeFile('prototypes/board-exam-app/pdf112_diagnostic.json',JSON.stringify({...report,generatedAt:new Date().toISOString()},null,2)+'\n');
}
