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
async function verify(out) {
  // Test the actual static build under the same repository subpath as GitHub Pages.
  const web = path.join(tmp,'web'); fs.mkdirSync(path.join(web,'exams-app'),{recursive:true});
  fs.symlinkSync(out,path.join(web,'exams-app','playground'),'dir');
  const server = spawn('python3',['-m','http.server','18765','--bind','127.0.0.1','--directory',web],{stdio:'ignore'});
  let browser;
  try {
    for(let i=0;i<50;i++){try{if((await fetch('http://127.0.0.1:18765/exams-app/playground/')).ok)break;}catch{} await new Promise(r=>setTimeout(r,200));}
    browser=await chromium.launch({headless:true,args:['--no-sandbox']});
    const page=await browser.newPage({viewport:{width:1600,height:1000}});
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
    write(path.join(out,'index.html'),'<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Exam App native board preview</title><style>body{color-scheme:dark;background:#141517;color:#f1f2f4;font:16px system-ui;max-width:850px;margin:40px auto;padding:0 20px}a{color:#a7c7ff}li{padding:8px 0}</style><h1>Exam App native board preview</h1><p>Open Artifact v0.17.0. Changes are temporary; no agent or shared persistence. The screenshot portal remains the stable view.</p><p><a href="../">Back to screenshot portal</a></p><p>Commit: '+escape(manifest.commit.slice(0,7))+'</p><ul>'+seeds.map(b=>'<li><a href="demo.html?type='+b.seed+'">'+escape(b.label)+'</a> ('+b.elementCount+' elements)</li>').join('')+'</ul></html>');
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
