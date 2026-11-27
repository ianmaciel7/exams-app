// Build the upstream static Playground alongside the stable screenshot portal.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execFileSync, spawn } = require('node:child_process');
const { chromium } = require('playwright');
const upstreamCommit = '0f6079853c8b0d2f4e9bddf5465ddbda722ce5a9'; // v0.17.0
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
const currentBoard=releaseBoards.find(b=>b.current);
if(!currentBoard)throw Error('Current stage has no published board');
async function verify(out) {
  // Test the actual static build under the same repository subpath as GitHub Pages.
  const web = path.join(tmp,'web'); fs.mkdirSync(path.join(web,'exams-app'),{recursive:true});
  fs.symlinkSync(out,path.join(web,'exams-app','playground'),'dir');
  fs.symlinkSync(path.join(site,'boards'),path.join(web,'exams-app','boards'),'dir');
  const server = spawn('python3',['-m','http.server','18765','--bind','127.0.0.1','--directory',web],{stdio:'ignore'});
  let browser;
  try {
    for(let i=0;i<50;i++){try{if((await fetch('http://127.0.0.1:18765/exams-app/playground/')).ok)break;}catch{} await new Promise(r=>setTimeout(r,200));}
    browser=await chromium.launch({headless:true,args:['--no-sandbox']});
    const page=await browser.newPage({viewport:{width:1600,height:1000}});
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
      if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Native library horizontal overflow at '+width);
      if(await page.locator('a.artifact[data-current="true"]').count()!==1)throw Error('Current stage highlight missing');
      if(await page.locator('.current-link').getAttribute('href')!=='demo.html?type='+currentBoard.seed)throw Error('Current stage link mismatch');
      const stageNumbers=await page.locator('.stage-number').allTextContents();
      if(stageNumbers.join(',')!==releaseBoards.map(b=>String(b.stageNumber).padStart(2,'0')).join(','))throw Error('Stage sequence mismatch');
      await page.getByRole('button',{name:'List',exact:true}).click();
      if(await page.locator('body').getAttribute('data-view')!=='list')throw Error('List view failed');
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
        if(errors.length)throw Error(b.id+': '+errors.join('; '));
        console.log('Native Playground verified:',b.id,expected.length,'elements');
      } finally {page.off('pageerror',onError);}
    }
    await page.close();
  } finally {try{await browser?.close();}finally{server.kill();}}
}
(async()=>{
  try {
    run('git',['clone','--depth','1','--branch','v0.17.0','https://github.com/JimLiu/open-artifact.git',upstream]);
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
    // No scripted agent responses, even if a visitor attempts to send a request.
    const provider=path.join(pg,'src/provider/demo-provider.ts');
    replace(provider,'status: async () => agent.status(),','status: async () => ({ available: false, busy: false }),');
    replace(provider,"agent.request(request.text);\n      return { status: 'delivered' };","throw new ArtifactError('invalid', 'No agent is connected in this static preview.');");
    replace(provider,"const thread = comments.markSent(threadId, options?.unasked === true);\n      const asked = [...thread.messages].reverse().find((m) => m.author.kind === 'person');\n      agent.request(asked?.text ?? '', threadId);\n      return thread;","throw new ArtifactError('invalid', 'No agent is connected in this static preview.');");
    // Keep the native Shell/editor, but make the preview boundary explicit.
    const demo=path.join(pg,'demo.html');
    const html=read(demo).replace(/<span class="pg-text">[\s\S]*?<\/span>\s*<a data-pg-href=""/,'<span class="pg-text"><b>Exam App preview</b> — local temporary edits only; no connected agent or GitHub writes.</span><a data-pg-href=""').replace(/<a data-pg-href=""[^>]*>[\s\S]*?<\/a>/,'<a href="./">Boards</a>').replace(/<a data-pg-href="\.\.\/"[^>]*>[\s\S]*?<\/a>/,'<a href="../">Screenshot portal</a>');
    write(demo,html);
    run('npm',['ci'],upstream);
    run('npm',['run','build'],upstream);
    run('npm',['ci'],pg);
    run('npm',['run','build'],pg);
    const out=path.join(pg,'dist');
    // Match the upstream native artifact library: responsive cards with real thumbnails and native color tokens.
    const nativeCss=read(path.join(upstream,'packages/ui/src/styles.css'));
    const tokenStart=nativeCss.indexOf('/* Light theme (default). */');
    const tokenEnd=nativeCss.indexOf('@layer base {');
    if(tokenStart<0||tokenEnd<=tokenStart)throw Error('Native UI tokens not found');
    const tokens=nativeCss.slice(tokenStart,tokenEnd);
    const icon='<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11.52 8.25A5 5 0 1 0 8.25 11.52"/><rect x="8.25" y="8.25" width="10" height="10" rx="2.25"/></svg>';
    const card=b=>'<a class="artifact" data-current="'+Boolean(b.current)+'" href="demo.html?type='+escape(b.seed)+'"><picture class="thumbnail"><source media="(prefers-color-scheme: dark)" srcset="../'+escape(b.images.dark)+'"><img src="../'+escape(b.images.light)+'" alt="" loading="lazy" decoding="async"></picture><div class="details"><div class="name-row">'+(b.stageNumber?'<span class="stage-number">'+String(b.stageNumber).padStart(2,'0')+'</span>':'')+'<span class="name">'+escape(b.label)+'</span></div>'+(b.stageStatus?'<div class="stage-status">'+escape(b.stageStatus)+'</div>':'')+'<div class="metadata"><span class="type">'+icon+'Whiteboard</span>'+(b.current?'<span class="current-marker">Current stage</span>':'<span>'+b.elementCount+' elements</span>')+'</div></div></a>';
    const section=(name,boards)=>boards.length?'<section><div class="section-heading"><h2>'+escape(name)+'</h2><span class="count">'+boards.length+'</span></div><div class="grid">'+boards.map(card).join('')+'</div></section>':'';
    const sections=section('Project boards',projectBoards)+section(release.release+' / Product and structure',releaseBoards.filter(b=>b.stageNumber<=4))+section(release.release+' / Interface design',releaseBoards.filter(b=>b.stageNumber>4));
    const current='<a class="current-link" href="demo.html?type='+escape(currentBoard.seed)+'"><span class="current-label">Current stage · '+escape(release.release)+'</span><span class="current-name">'+escape(currentBoard.label)+'</span></a>';
    const home=read(path.join(root,'docs/portal/playground-home.html')).replace('/* THEME_TOKENS */',tokens).replace('<!-- BOARD_SECTIONS -->',sections).replace('<!-- CURRENT_STAGE -->',current).replace('COMMIT_FULL',escape(manifest.commit)).replace('COMMIT_SHORT',escape(manifest.commit.slice(0,7)));
    write(path.join(out,'index.html'),home);
    await verify(out);
    // Publish only after every board passes. The existing root and screenshots remain unchanged.
    const destination=path.join(site,'playground');
    fs.cpSync(out,destination,{recursive:true});
    const index=path.join(site,'index.html');
    replace(index,'<span class="muted">Boards · dev</span>','<span class="muted">Boards · dev</span><a href="playground/">Native board preview</a>');
  } catch(error) {
    fs.rmSync(path.join(site,'playground'),{recursive:true,force:true});
    throw error;
  } finally {fs.rmSync(tmp,{recursive:true,force:true});}
})().catch(error=>{console.error(error);process.exitCode=1;});
