// Comparative audit only. Keep the published site and original design files untouched.
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const {auditWorkspace}=require('./audit-rendered-workspace.cjs');
const {directions,status}=require('../designs/exam-app-identity/color-directions.json');
(async()=>{
  if(status!=='exploratory-not-approved')throw Error('Unexpected decision state');
  const sha=process.env.GITHUB_SHA;
  if(!/^[a-f0-9]{40}$/.test(sha??''))throw Error('Expected exact SHA');
  const base='https://ianmaciel7.github.io/exams-app/';
  let current=false;
  for(let i=0;i<24&&!current;i++){
    try{const r=await fetch(base+'manifest.json?v='+sha,{cache:'no-store',signal:AbortSignal.timeout(10000)});current=r.ok&&(await r.json()).commit===sha;}catch{}
    if(!current)await new Promise(r=>setTimeout(r,5000));
  }
  if(!current)throw Error('Exact deployed revision unavailable');
  const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  const out='_site/candidate-review';
  const results=[];
  try{
    for(const candidate of directions){
      // Capture native canvas at high device density rather than upscale a low-resolution PNG.
      const page=await browser.newPage({viewport:{width:1600,height:1000},deviceScaleFactor:5});
      try{
        await page.goto(base+'playground/demo.html?type=study-exam-app-workspace-mockup&v='+sha,{waitUntil:'domcontentloaded'});
        const evidence=await auditWorkspace(page,process.cwd(),sha,out,candidate);
        // Record actual native-renderer captures at its current canvas scale.
        // These are comparison evidence, not guaranteed full-size independent mockups.
        const editor=page.frameLocator('iframe[name="open-artifact-shell"]');
        for(const id of ['Main.dc.html','Desktop-Expanded-Dark.dc.html','Mobile-Workspace-Light.dc.html','Mobile-Workspace-Dark.dc.html']){
          const frame=editor.frameLocator('iframe[data-board='+JSON.stringify(id)+']');
          const surface=frame.locator('[data-theme]').first();
          const bounds=await surface.boundingBox();
          if(!bounds||bounds.width<=0||bounds.height<=0)throw Error('No capture surface '+id);
          const file=candidate.id+'-'+id.replace('.dc.html','')+'.png';
          await surface.evaluate(async el=>{await el.ownerDocument.fonts.ready;await Promise.all([...el.querySelectorAll('img')].map(img=>img.decode()));await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});
          const buffer=await surface.screenshot({path:path.join(out,file),timeout:15000,animations:'disabled',scale:'device'});
          const board=evidence.artboards.find(a=>a.id===id);
          const width=buffer.readUInt32BE(16),height=buffer.readUInt32BE(20);
          if(width<board.width||height<board.height)throw Error('Candidate capture below native pixel dimensions '+id+': '+width+'x'+height);
          results.push({candidate:candidate.id,id,file,width,height,nativeBoardWidth:board.width,nativeBoardHeight:board.height,canvasScale:bounds.width/board.width,deviceScaleFactor:5});
        }
      }finally{await page.close();}
    }
  }finally{
    await browser.close();
    fs.mkdirSync(out,{recursive:true});
    fs.writeFileSync(path.join(out,'comparison-manifest.json'),JSON.stringify({commit:sha,status:'exploratory-not-approved',captures:results,limitations:['Temporary color overlays on native design, not full-system alternatives.','Original provisional logo unchanged; screenshots rendered at DPR 5, with native minimum pixel dimensions enforced; inspect optical quality before approval.','No user approval, interaction or WCAG conformance claim.']},null,2));
  }
})().catch(e=>{console.error(e);process.exitCode=1;});
