const {chromium}=require('playwright');
const {readFileSync,mkdirSync,writeFileSync}=require('node:fs');
const {createHash}=require('node:crypto');
const assert=require('node:assert/strict');
const path=require('node:path');
const source=readFileSync(path.join(__dirname,'index.html'));
const sha256=createHash('sha256').update(source).digest('hex');
assert.equal(sha256,'8b84e455e17f1303302fb13b80ec4295689bf34d9b6bead861bdad67fb30bb74','Reviewed source changed; update evidence intentionally');
(async()=>{
 const out=process.env.CURRENT_EVIDENCE_DIR||'current-evidence';
 mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1180,height:900},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',error=>errors.push(String(error)));
 const captures=[];
 async function capture(name){
   await page.mouse.move((page.viewportSize()?.width||1)-1,(page.viewportSize()?.height||1)-1);
   await page.waitForTimeout(250);
   const buffer=await page.screenshot({path:path.join(out,name),animations:'disabled'});
   captures.push({name,width:buffer.readUInt32BE(16),height:buffer.readUInt32BE(20),sha256:createHash('sha256').update(buffer).digest('hex')});
 }
 try {
   await page.setContent(source.toString('utf8'),{waitUntil:'load'});
   await page.locator('input[data-id="0"][value="2"]').check();
   await page.locator('[data-answer="0"]').click();
   await page.locator('.result.bad').waitFor();
   assert.equal(await page.locator('.option.correct .cue').textContent(),'Correta');
   assert.equal(await page.locator('.option.wrong .cue').textContent(),'Sua resposta');
   assert(await page.locator('input[data-id="0"][value="2"]').isDisabled());
   await page.locator('input[data-id="1"][value="2"]').check();
   await capture('light.png');
   await page.locator('.theme-toggle').click();
   assert.equal(await page.locator('#app').getAttribute('data-dark'),'true');
   await capture('dark.png');
   await page.setViewportSize({width:390,height:844});
   await page.locator('.theme-toggle').click();
   assert.equal(await page.locator('#app').getAttribute('data-dark'),'false');
   await capture('mobile.png');
   assert(await page.evaluate(()=>document.documentElement.scrollWidth===innerWidth));
   await page.locator('.mobiletoggle').click();
   assert(await page.locator('.drawer').evaluate(el=>el.open));
   await page.keyboard.press('Escape');
   assert(!(await page.locator('.drawer').evaluate(el=>el.open)));
   await page.locator('#fail').evaluate(el=>el.click());
   await page.locator('[data-answer="1"]').click();
   await page.locator('.result.error').waitFor();
   assert(await page.locator('input[data-id="1"][value="2"]').isChecked());
   await page.locator('[data-answer="1"]').click();
   await page.locator('.result.ok').waitFor();
   assert.deepEqual(errors,[]);
   writeFileSync(path.join(out,'manifest.json'),JSON.stringify({commit:process.env.GITHUB_SHA||null,sourceSha256:sha256,chromium:browser.version(),captures,checks:['incorrect and correct cue','locked answer','theme','mobile width','drawer and Escape','failure preserves choice','successful retry','no page errors'],limitations:'Exploratory sample only; no full accessibility or product acceptance.'},null,2)+'\n');
 } finally {await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
