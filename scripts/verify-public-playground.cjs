// Verify the actual served Pages revision, not merely a successful build.
const { chromium } = require('playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const base = new URL('https://ianmaciel7.github.io/exams-app/');
const sha=process.env.GITHUB_SHA;
if(!/^[0-9a-f]{40}$/.test(sha??''))throw Error('Expected exact GITHUB_SHA');
const versioned=p=>{const u=new URL(p,base);u.searchParams.set('v',sha);return u.href;};
async function currentInventory(){
  for(let i=0;i<24;i++){
    try{
      const [m,p]=await Promise.all(['manifest.json','playground/publication-inventory.json'].map(async f=>{const r=await fetch(versioned(f),{cache:'no-store',signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error(f+' '+r.status);return r.json();}));
      if(m.commit===sha&&p.commit===sha)return {m,p};
      console.log('Waiting for exact served revision',m.commit,p.commit);
    }catch(e){console.log('Pages fetch retry:',e.message);}
    await new Promise(r=>setTimeout(r,5000));
  }
  throw Error('Deployed revision did not become publicly verifiable: '+sha);
}
(async()=>{
  const {m,p}=await currentInventory();
  assert.equal(m.boards.length,11);assert.equal(p.boards.length,11);assert.equal(p.studies.length,3);
  const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  try{
    const page=await browser.newPage({viewport:{width:1600,height:1000},colorScheme:'dark'});
    await page.goto(versioned('playground/'),{waitUntil:'domcontentloaded'});
    await page.locator('a.artifact').first().waitFor();
    assert.equal(await page.locator('a.artifact').count(),11);
    assert.equal(await page.locator('a[data-study-id]').count(),3);
    for(const board of [...p.boards,...p.studies]){
      const errors=[];const onError=e=>errors.push(e.message);page.on('pageerror',onError);
      try{
        const res=await page.goto(versioned('playground/'+board.href),{waitUntil:'domcontentloaded'});
        assert.ok(res?.ok(),board.id+' response');
        const iframe=page.frameLocator('iframe[name="open-artifact-shell"]');
        await page.waitForFunction(()=>!!window.__PLAYGROUND__?.store&&!document.querySelector('[data-shell-loading]'),{},{timeout:45000});
        if(board.type==='whiteboard'){
          const meta=JSON.parse(fs.readFileSync(board.path+'/db/board/meta.json','utf8'));
          const expected=meta.order.slice().sort();
          await iframe.locator('.wb-elements').waitFor();
          await iframe.locator('.wb-elements').evaluate((el,ids)=>{const actual=[...new Set([...el.querySelectorAll('[data-wb-id]')].map(e=>e.getAttribute('data-wb-id')))].sort();if(JSON.stringify(actual)!==JSON.stringify(ids))throw Error('Rendered IDs mismatch');},expected);
          for(const link of board.nativeLinks??[]){
            const anchor=iframe.locator('[data-wb-id="'+link.element+'"] a[data-wb-link]').first();
            await anchor.waitFor({state:'attached'});
            assert.equal(await anchor.getAttribute('data-wb-link'),link.href);
            const target=new URL(await anchor.getAttribute('href'),base);
            assert.equal(target.pathname,base.pathname+'playground/demo.html');
            assert.equal(target.searchParams.get('type'),link.seed);
          }
          if(board.id==='highfidelity'){
            for(const id of ['desktop_q_stem','collapsed_q_stem','redline_q_stem']){
              await iframe.locator('[data-wb-id="'+id+'"]').evaluate(el=>{const ink=getComputedStyle(el).getPropertyValue('--wb-ink').trim();if(!/^#[0-9a-f]{6}$/i.test(ink)||parseInt(ink.slice(1,3),16)>=100)throw Error('Dark fixed-paper text contrast not corrected: '+el.getAttribute('data-wb-id')+' '+ink);});
            }
          }
        }else{
          const expected=board.filePaths.filter(p=>!p.startsWith('_blobs/')).map(p=>p.startsWith('db/')?p.replace(/\.json$/,''):p).sort();
          const actual=await page.evaluate(()=>[...window.__PLAYGROUND__.store.entries.keys()].sort());
          assert.deepEqual(actual,expected,board.id+' source/store keys');
          for(const fragment of board.visibleText){const until=Date.now()+20000;let found=false;while(!found&&Date.now()<until){for(const frame of page.frames().filter(f=>f!==page.mainFrame())){try{found=await frame.evaluate(t=>document.body?.innerText?.toLowerCase().includes(t.toLowerCase()),fragment);if(found)break;}catch{}}if(!found)await new Promise(r=>setTimeout(r,200));}assert.ok(found,board.id+' rendered '+fragment);}
        }
        assert.ok(await page.getByRole('link',{name:'Back to artifacts',exact:true}).isVisible(),board.id+' return link');
        assert.deepEqual(errors,[],board.id+' page errors');
        console.log('Public artifact verified:',board.id,sha);
      }finally{page.off('pageerror',onError);}
    }
    await page.getByRole('link',{name:'Back to artifacts',exact:true}).click();
    await page.locator('a.artifact').first().waitFor();
    console.log('Public deployment verified:',sha,'14 artifacts');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
