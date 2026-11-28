// Build the upstream static Playground as the only public interface.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execFileSync, spawn } = require('node:child_process');
const { chromium } = require('playwright');
const pin = require('./open-artifact-pin.json');
const upstreamCommit = pin.commit;
const root = process.cwd();
const site = path.join(root, '_site');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'exam-playground-'));
const upstream = path.join(tmp, 'upstream');
const pg = path.join(upstream, 'website/playground');
const run = (cmd, args, cwd = root, opts = {}) => execFileSync(cmd, args, {cwd, stdio:'inherit', ...opts});
const write = (p, content) => fs.writeFileSync(p, content);
const read = p => fs.readFileSync(p, 'utf8');
const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const replace = (p, before, after) => {const s=read(p); if(!s.includes(before)) throw Error('Upstream patch no longer matches: '+p); write(p,s.replace(before,after));};
const manifest = JSON.parse(read(path.join(site,'manifest.json')));
const seeds = manifest.boards.map(b => ({...b, seed: b.id==='overview'?'whiteboard':'exam-'+b.id}));
const release = JSON.parse(execFileSync('git',['show',manifest.commit+':docs/releases/v0.1.0/current-state.json'],{cwd:root,encoding:'utf8'}));
const projectBoards = seeds.filter(b=>b.dir.startsWith('docs/boards/'));
const releaseBoards = release.stages.flatMap((stage,index)=>{
  if(!stage.board)return [];
  const b=seeds.find(b=>b.dir==='docs/releases/'+release.release+'/'+stage.board);
  if(!b)throw Error('Missing release board: '+stage.board);
  return [{...b,stageNumber:index+1,stageStatus:stage.status,current:stage.name===release.stage}];
});
const orderedBoards=[...projectBoards,...releaseBoards];
if(orderedBoards.length!==seeds.length||new Set(orderedBoards.map(b=>b.id)).size!==seeds.length)throw Error('Library order does not cover the board manifest');
// Explicit publication inventory: native board previews plus source-only public studies.
// Unknown design directories fail closed until classified and reviewed.
const studyDefinitions={
  'exam-app-identity': {title:'Exam App identity',type:'design-system',typeTitle:'Design system',visibleText:['ground','brand']},
  'exam-app-workspace-mockup': {title:'Workspace visual study',type:'design',typeTitle:'Design',visibleText:['Desktop Expanded','Mobile Drawer']},
  'exam-app-workspace-motion': {title:'Workspace motion study',type:'motion',typeTitle:'Motion',visibleText:['Sidebar collapse','Answer feedback']}
};
const studyDirs=execFileSync('git',['ls-tree','-d','--name-only',manifest.commit+':designs'],{cwd:root,encoding:'utf8'}).trim().split('\n').filter(Boolean);
if(studyDirs.length!==Object.keys(studyDefinitions).length||studyDirs.some(id=>!Object.hasOwn(studyDefinitions,id)))throw Error('Unclassified or missing design study: '+studyDirs.join(', '));
const sourceStudies=studyDirs.map(id=>({id,...studyDefinitions[id],path:'designs/'+id,status:'provisional',publication:'native-preview',seed:'study-'+id,href:'demo.html?type=study-'+id,sourceHref:'https://github.com/ianmaciel7/exams-app/tree/'+manifest.commit+'/designs/'+id}));
const publicationInventory={commit:manifest.commit,boards:orderedBoards.map(b=>({id:b.id,path:b.dir,type:'whiteboard',publication:'native-preview',href:'demo.html?type='+b.seed})),studies:sourceStudies,exclusions:['Private/local comments and history','Unstarted stages','Uncommitted machine state and non-artifact files']};
const currentBoard=releaseBoards.find(b=>b.current);
if(!currentBoard)throw Error('Current stage has no published board');
async function verify(out) {
  // Test the actual static build under the same repository subpath as GitHub Pages.
  const web = path.join(tmp,'web'); fs.mkdirSync(path.join(web,'exams-app'),{recursive:true});
  fs.symlinkSync(out,path.join(web,'exams-app','playground'),'dir');
  fs.copyFileSync(path.join(root,'docs/portal/playground-entry.html'),path.join(web,'exams-app','index.html'));
  fs.symlinkSync(path.join(site,'boards'),path.join(web,'exams-app','boards'),'dir');
  const server = spawn('python3',['-m','http.server','18765','--bind','127.0.0.1','--directory',web],{stdio:'ignore'});
  let browser;
  try {
    for(let i=0;i<50;i++){try{if((await fetch('http://127.0.0.1:18765/exams-app/playground/')).ok)break;}catch{} await new Promise(r=>setTimeout(r,200));}
    browser=await chromium.launch({headless:true,args:['--no-sandbox']});
    const page=await browser.newPage({viewport:{width:1600,height:1000}});
    // The Pages deployment link must land on the one public library.
    await page.goto('http://127.0.0.1:18765/exams-app/',{waitUntil:'domcontentloaded'});
    await page.waitForURL('**/exams-app/playground/');
    await page.locator('a.artifact').first().waitFor();
    if(await page.getByRole('link',{name:'Screenshot portal',exact:true}).count())throw Error('Legacy portal link remains');
    console.log('Pages root redirects to native Playground');
    // Verify the home itself before navigating to the native boards.
    for(const [width,height,colorScheme] of [[1440,900,'dark'],[390,844,'light']]){
      await page.setViewportSize({width,height});
      await page.emulateMedia({colorScheme});
      const homeUrl='http://127.0.0.1:18765/exams-app/playground/';
      const response=await page.goto(homeUrl,{waitUntil:'domcontentloaded'});
      if(!response?.ok())throw Error('Native library failed to load');
      const cards=page.locator('a.artifact');
      if(await cards.count()!==seeds.length)throw Error('Native library card count mismatch');
      for(let i=0;i<orderedBoards.length;i++){
        const link=cards.nth(i);
        if(await link.getAttribute('href')!=='demo.html?type='+orderedBoards[i].seed)throw Error('Native library link mismatch: '+orderedBoards[i].id);
        await link.locator('img').scrollIntoViewIfNeeded();
        await link.locator('img').evaluate(async img=>{await img.decode();if(!img.naturalWidth)throw Error('Thumbnail missing');});
      }
      const checkStudyLinks=async()=>{
        const links=page.locator('a[data-study-id]');
        if(await links.count()!==sourceStudies.length)throw Error('Source-only study inventory mismatch');
        for(const study of sourceStudies){
          const link=page.locator('a[data-study-id="'+study.id+'"]');
          if(await link.count()!==1||await link.getAttribute('href')!==study.href||!await link.isVisible())throw Error('Missing or incorrect study preview: '+study.id);
          const source=page.locator('a[data-study-source="'+study.id+'"]');
          if(await source.count()!==1||await source.getAttribute('href')!==study.sourceHref)throw Error('Missing source fallback: '+study.id);
        }
      };
      await checkStudyLinks();
      if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Native library horizontal overflow at '+width);
      if(await page.locator('a.artifact[data-current="true"]').count()!==1)throw Error('Current stage highlight missing');
      if(await page.locator('.current-link').getAttribute('href')!=='demo.html?type='+currentBoard.seed)throw Error('Current stage link mismatch');
      const stageNumbers=await page.locator('.stage-number').allTextContents();
      if(stageNumbers.join(',')!==releaseBoards.map(b=>String(b.stageNumber).padStart(2,'0')).join(','))throw Error('Stage sequence mismatch');
      await page.getByRole('button',{name:'List',exact:true}).click();
      if(await page.locator('body').getAttribute('data-view')!=='list')throw Error('List view failed');
      await checkStudyLinks();
      if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('List view horizontal overflow at '+width);
      await page.reload({waitUntil:'domcontentloaded'});
      if(await page.locator('body').getAttribute('data-view')!=='list')throw Error('List view preference not restored');
      await page.getByRole('button',{name:'Grid',exact:true}).click();
      if(await page.locator('body').getAttribute('data-view')!=='grid')throw Error('Grid view failed');
      await page.locator('h1').scrollIntoViewIfNeeded();
      await cards.first().focus();
      if(!await cards.first().evaluate(el=>el.matches(':focus')))throw Error('Native library card is not focusable');
      await page.keyboard.press('Enter');
      await page.waitForURL('**/demo.html?type='+orderedBoards[0].seed);
      console.log('Native library verified:',width+'x'+height,colorScheme,seeds.length,'cards and thumbnails');
    }
    await page.setViewportSize({width:1600,height:1000});
    await page.emulateMedia({colorScheme:'dark'});
    for(const b of seeds){
      const errors=[];const onError=e=>errors.push(e.message);page.on('pageerror',onError);
      try {
        const url='http://127.0.0.1:18765/exams-app/playground/demo.html?type='+b.seed;
        const response=await page.goto(url,{waitUntil:'domcontentloaded'});
        if(!response?.ok())throw Error('Page failed: '+b.id);
        const expected=JSON.parse(read(path.join(root,b.dir,'db/board/meta.json'))).order;
        await page.waitForFunction(ids=>{
          const frame=document.querySelector('iframe[name="open-artifact-shell"]');
          const layer=frame?.contentDocument?.querySelector('.wb-elements');
          if(!layer)return false;
          const rendered=new Set([...layer.querySelectorAll('[data-wb-id]')].map(el=>el.getAttribute('data-wb-id')));
          const store=window.__PLAYGROUND__?.store;
          return store?.listDocs('elements').length===ids.length && rendered.size===ids.length && ids.every(id=>rendered.has(id));
        },expected,{timeout:45000});
        const back=page.getByRole('link',{name:'Back to artifacts',exact:true});
        if(!await back.isVisible()||!await page.locator('[data-exam-preview-status]').isVisible())throw Error('Native preview header controls missing: '+b.id);
        if(await page.locator('.pg-hint,[data-pg-lang],[data-pg-close]').count())throw Error('Legacy demo banner remains');
        if(await back.getAttribute('href')!=='http://127.0.0.1:18765/exams-app/playground/')throw Error('Library return link mismatch: '+b.id);
        if(b.id===seeds[seeds.length-1].id){
          await page.setViewportSize({width:390,height:844});
          if(!await back.isVisible()||!await page.locator('[data-exam-preview-status]').isVisible())throw Error('Mobile preview header missing');
          await back.focus();
          await page.keyboard.press('Enter');
          await page.waitForURL('**/exams-app/playground/');
          console.log('Native preview header verified: no demo banner; mobile keyboard return to library');
        }
        if(errors.length)throw Error(b.id+': '+errors.join('; '));
        console.log('Native Playground verified:',b.id,expected.length,'elements');
      } finally {page.off('pageerror',onError);}
    }
    // Verify the real non-whiteboard editors, source file coverage, and representative rendered content.
    for(const study of sourceStudies){
      await page.setViewportSize({width:1600,height:1000});
      const errors=[]; const onError=e=>errors.push(e.message); page.on('pageerror',onError);
      try {
        const response=await page.goto('http://127.0.0.1:18765/exams-app/playground/'+study.href,{waitUntil:'domcontentloaded'});
        if(!response?.ok())throw Error('Study route failed: '+study.id);
        const generated=JSON.parse(read(path.join(pg,'src/seeds/generated',study.seed+'.json')));
        const expected=Object.keys(generated.files).filter(p=>!p.startsWith('_blobs/')).sort();
        const committed=study.filePaths.filter(p=>!p.startsWith('_blobs/')).sort();
        if(JSON.stringify(expected)!==JSON.stringify(committed))throw Error('Study seed path coverage mismatch: '+study.id);
        try {
        await page.waitForFunction(({id,type,expected})=>{
          const frame=document.querySelector('iframe[name="open-artifact-shell"]');
          const store=window.__PLAYGROUND__?.store;
          return !!frame&&frame.src.includes('/editors/'+type+'/')&&store?.id==='demo-'+id&&!document.querySelector('[data-shell-loading]')&&expected.every(p=>store.entries.has(p.startsWith('db/')?p.replace(/\.json$/,''):p));
        },{id:study.seed,type:study.type,expected},{timeout:45000});
        }catch(error){
          const diagnostics=await page.evaluate(()=>({title:document.title,frame:document.querySelector('iframe[name="open-artifact-shell"]')?.src,loading:!!document.querySelector('[data-shell-loading]'),storeId:window.__PLAYGROUND__?.store?.id,keys:[...(window.__PLAYGROUND__?.store?.entries?.keys()??[])]}));
          throw Error('Study load failed: '+study.id+' '+JSON.stringify({diagnostics,errors}),{cause:error});
        }
        // DB document keys omit the final storage .json extension, unlike project files.
        const actual=await page.evaluate(()=>[...window.__PLAYGROUND__.store.entries.keys()].sort());
        const expectedKeys=expected.map(p=>p.startsWith('db/')?p.replace(/\.json$/,''):p).sort();
        if(JSON.stringify(actual)!==JSON.stringify(expectedKeys))throw Error('Study store key mismatch: '+study.id);
        for(const fragment of study.visibleText){
          const deadline=Date.now()+20000;let found=false;
          while(Date.now()<deadline&&!found){
            for(const frame of page.frames().filter(f=>f!==page.mainFrame())){
              try{found=await frame.evaluate(t=>document.body?.innerText?.toLowerCase().includes(t.toLowerCase()),fragment);if(found)break;}catch{}
            }
            if(!found)await new Promise(r=>setTimeout(r,200));
          }
          if(!found)throw Error('Missing rendered study text: '+study.id+' / '+fragment);
        }
        if(!await page.getByRole('link',{name:'Back to artifacts',exact:true}).isVisible())throw Error('Study return link missing: '+study.id);
        if(errors.length)throw Error(study.id+': '+errors.join('; '));
        console.log('Native design study verified:',study.id,expected.length,'source entries and representative visible text');
      }finally{page.off('pageerror',onError);}
    }
    await page.close();
  } finally {try{await browser?.close();}finally{server.kill();}}
}
(async()=>{
  try {
    run('git',['clone','--depth','1','--branch','v'+pin.version,'https://github.com/JimLiu/open-artifact.git',upstream]);
    if(execFileSync('git',['rev-parse','HEAD'],{cwd:upstream,encoding:'utf8'}).trim()!==upstreamCommit)throw Error('Unexpected upstream release commit');
    // Copy only the committed snapshot; never publish local runtime state or private comments.
    for(const b of seeds){
      const target=path.join(upstream,'exam-boards',b.id);
      fs.mkdirSync(target,{recursive:true});
      const files=execFileSync('git',['ls-tree','-r','--name-only','-z',manifest.commit,'--',b.dir],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean);
      for(const file of files){
        const rel=file.slice(b.dir.length+1);
        if(!/^(db\/|_blobs\/|project\/)/.test(rel)||rel.endsWith('.gitkeep'))continue;
        const dest=path.join(target,rel);fs.mkdirSync(path.dirname(dest),{recursive:true});
        write(dest,execFileSync('git',['show',manifest.commit+':'+file],{cwd:root,maxBuffer:32*1024*1024}));
      }
      const meta=JSON.parse(read(path.join(target,'db/board/meta.json')));
      if(meta.order.length!==b.elementCount)throw Error('Snapshot mismatch: '+b.id);
    }
    const demos=path.join(pg,'demos');
    for(const f of fs.readdirSync(demos))if(f.endsWith('.demo.json'))fs.unlinkSync(path.join(demos,f));
    for(const b of seeds)write(path.join(demos,b.seed+'.demo.json'),JSON.stringify({id:b.seed,type:'whiteboard',typeTitle:'Whiteboard',title:b.label,source:'exam-boards/'+b.id,agent:{name:'Unavailable',thinkMs:0,responses:[]}}));
    for(const study of sourceStudies){
      const target=path.join(upstream,'exam-studies',study.id);
      fs.mkdirSync(target,{recursive:true});
      const files=execFileSync('git',['ls-tree','-r','--name-only','-z',manifest.commit,'--',study.path],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean);
      study.filePaths=[];
      for(const file of files){
        const rel=file.slice(study.path.length+1);
        if(!/^(db\/|_blobs\/|project\/)/.test(rel)||rel.endsWith('.gitkeep'))continue;
        const dest=path.join(target,rel);fs.mkdirSync(path.dirname(dest),{recursive:true});
        write(dest,execFileSync('git',['show',manifest.commit+':'+file],{cwd:root,maxBuffer:32*1024*1024}));
        study.filePaths.push(rel);
      }
      if(!study.filePaths.length)throw Error('No eligible files: '+study.id);
      write(path.join(demos,study.seed+'.demo.json'),JSON.stringify({id:study.seed,type:study.type,typeTitle:study.typeTitle,title:study.title+' (Provisional)',source:'exam-studies/'+study.id,agent:{name:'Unavailable',thinkMs:0,responses:[]}}));
    }
    // No scripted agent responses, even if a visitor attempts to send a request.
    const provider=path.join(pg,'src/provider/demo-provider.ts');
    replace(provider,'status: async () => agent.status(),','status: async () => ({ available: false, busy: false }),');
    replace(provider,"agent.request(request.text);\n      return { status: 'delivered' };","throw new ArtifactError('invalid', 'No agent is connected in this static preview.');");
    replace(provider,"const thread = comments.markSent(threadId, options?.unasked === true);\n      const asked = [...thread.messages].reverse().find((m) => m.author.kind === 'person');\n      agent.request(asked?.text ?? '', threadId);\n      return thread;","throw new ArtifactError('invalid', 'No agent is connected in this static preview.');");
    // Integrate preview navigation and its persistence warning into the native Shell top bar.
    // Remove the demo website banner (including its unrelated language and dismiss controls).
    const demo=path.join(pg,'demo.html');
    write(demo,'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="playground-root" content="./"><title>Exam App artifact</title><script type="module" src="./src/shell-demo/main.tsx"></script></head><body><div id="root"></div></body></html>');
    const topBar=path.join(upstream,'packages/shell/src/shell/components/TopBar.tsx');
    replace(topBar,"import { PanelLeft, CloudAlert, History, LoaderCircle, Lock, MessageSquare, RotateCw, X } from 'lucide-react';","import { ArrowLeft, Info, PanelLeft, CloudAlert, History, LoaderCircle, Lock, MessageSquare, RotateCw, X } from 'lucide-react';");
    replace(topBar,'<div className="flex min-w-0 flex-1 items-center gap-1.5">',[
      '<div className="flex min-w-0 flex-1 items-center gap-1.5">',
      '  <a data-exam-library-link="" href={new URL(document.querySelector(\'meta[name="playground-root"]\')?.getAttribute(\'content\') ?? \'./\', location.href).href} aria-label="Back to artifacts" title="Back to artifacts" className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-fg-muted hover:bg-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-select"><ArrowLeft className="size-4" /></a>',
    ].join('\n'));
    replace(topBar,'        <SaveState />',[
      '        <SaveState />',
      '        <span data-exam-preview-status="" className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-xs text-fg-muted" title="Edits and comments are temporary. No agent is connected and changes are not saved to GitHub.">',
      '          <Info className="size-3.5" aria-hidden="true" /><span>Temporary edits</span><span className="sr-only">. No connected agent or GitHub persistence.</span>',
      '        </span>',
    ].join('\n'));
    run('npm',['ci'],upstream);
    run('npm',['run','build'],upstream);
    run('npm',['ci'],pg);
    run('npm',['run','build'],pg);
    const out=path.join(pg,'dist');
    // Apply the same project-local native-view compatibility pass as the board launcher.
    const wb=path.join(out,'editors/whiteboard');
    fs.copyFileSync(path.join(root,'scripts/fixed-paper-contrast.mjs'),path.join(wb,'exam-fixed-paper-contrast.mjs'));
    replace(path.join(wb,'index.html'),'</head>','<script type="module" src="./exam-fixed-paper-contrast.mjs"></script></head>');
    // Match the upstream native artifact library: responsive cards with real thumbnails and native color tokens.
    const nativeCss=read(path.join(upstream,'packages/ui/src/styles.css'));
    const tokenStart=nativeCss.indexOf('/* Light theme (default). */');
    const tokenEnd=nativeCss.indexOf('@layer base {');
    if(tokenStart<0||tokenEnd<=tokenStart)throw Error('Native UI tokens not found');
    const tokens=nativeCss.slice(tokenStart,tokenEnd);
    const icon='<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11.52 8.25A5 5 0 1 0 8.25 11.52"/><rect x="8.25" y="8.25" width="10" height="10" rx="2.25"/></svg>';
    const card=b=>'<a class="artifact" data-current="'+Boolean(b.current)+'" href="demo.html?type='+escape(b.seed)+'"><picture class="thumbnail"><source media="(prefers-color-scheme: dark)" srcset="../'+escape(b.images.dark)+'"><img src="../'+escape(b.images.light)+'" alt="" loading="lazy" decoding="async"></picture><div class="details"><div class="name-row">'+(b.stageNumber?'<span class="stage-number">'+String(b.stageNumber).padStart(2,'0')+'</span>':'')+'<span class="name">'+escape(b.label)+'</span></div>'+(b.stageStatus?'<div class="stage-status">'+escape(b.stageStatus)+'</div>':'')+'<div class="metadata"><span class="type">'+icon+'Whiteboard</span>'+(b.current?'<span class="current-marker">Current stage</span>':'<span>'+b.elementCount+' elements</span>')+'</div></div></a>';
    const section=(name,boards)=>boards.length?'<section><div class="section-heading"><h2>'+escape(name)+'</h2><span class="count">'+boards.length+'</span></div><div class="grid">'+boards.map(card).join('')+'</div></section>':'';
    const studySection='<section><div class="section-heading"><h2>Exploratory design studies</h2><span class="count">'+sourceStudies.length+'</span></div><p class="stage-status">Provisional, not approved. Open a native study or its exact committed source.</p><div class="grid">'+sourceStudies.map(s=>'<div class="artifact-source"><div class="details"><a data-study-id="'+escape(s.id)+'" href="'+escape(s.href)+'" class="name">'+escape(s.title)+'</a><span class="stage-status">'+escape(s.typeTitle)+' · Provisional</span><a data-study-source="'+escape(s.id)+'" href="'+escape(s.sourceHref)+'">View source on GitHub</a></div></div>').join('')+'</div></section>';
    const sections=section('Project boards',projectBoards)+section(release.release+' / Product and structure',releaseBoards.filter(b=>b.stageNumber<=4))+section(release.release+' / Interface design',releaseBoards.filter(b=>b.stageNumber>4))+studySection;
    const current='<a class="current-link" href="demo.html?type='+escape(currentBoard.seed)+'"><span class="current-label">Current stage · '+escape(release.release)+'</span><span class="current-name">'+escape(currentBoard.label)+'</span></a>';
    const home=read(path.join(root,'docs/portal/playground-home.html')).replace('/* THEME_TOKENS */',tokens).replace('<!-- BOARD_SECTIONS -->',sections).replace('<!-- CURRENT_STAGE -->',current).replace('COMMIT_FULL',escape(manifest.commit)).replace('COMMIT_SHORT',escape(manifest.commit.slice(0,7)));
    write(path.join(out,'index.html'),home);
    write(path.join(out,'publication-inventory.json'),JSON.stringify(publicationInventory,null,2));
    await verify(out);
    // Publish only after every board passes; preserve screenshot assets, not the old public viewer.
    const destination=path.join(site,'playground');
    fs.cpSync(out,destination,{recursive:true});
    fs.copyFileSync(path.join(root,'docs/portal/playground-entry.html'),path.join(site,'index.html'));
  } catch(error) {
    fs.rmSync(path.join(site,'playground'),{recursive:true,force:true});
    throw error;
  } finally {fs.rmSync(tmp,{recursive:true,force:true});}
})().catch(error=>{console.error(error);process.exitCode=1;});
