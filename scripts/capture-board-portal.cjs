const { chromium } = require('playwright');
const fs = require('node:fs');
const { execFileSync } = require('node:child_process');
const boards = [
  ['overview','Ideas Board','docs/boards/overview'],
  ['hub','Project Hub','docs/boards/project-hub'],
  ['releases','Release Stages','docs/boards/release-stages'],
  ['product','Product','docs/releases/v0.1.0/product'],
  ['architecture','Information Architecture','docs/releases/v0.1.0/information-architecture'],
  ['screens','Screen Inventory','docs/releases/v0.1.0/screen-inventory'],
  ['flows','User Flows','docs/releases/v0.1.0/user-flows'],
  ['sketch','Sketch','docs/releases/v0.1.0/sketch'],
];
const urls = Object.fromEntries(fs.readFileSync('/tmp/board-urls','utf8').split(/\r?\n/).map(line=>line.match(/^(\w+): (http\S+)$/)).filter(Boolean).map(m=>[m[1],m[2]]));
(async()=>{
  const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  const manifest={commit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),generatedAt:new Date().toISOString(),boards:[]};
  try {
    await Promise.all(boards.map(async ([id,label,dir],index)=>{
      if(!urls[id]) throw Error('Missing board URL: '+id);
      const meta=JSON.parse(fs.readFileSync(dir+'/db/board/meta.json','utf8'));
      const expected=meta.order.length;
      const board={id,label,dir,elementCount:expected,images:{}};
      for(const theme of ['dark','light']){
        const page=await browser.newPage({viewport:{width:2560,height:1440},deviceScaleFactor:2,colorScheme:theme});
        const errors=[];
        page.on('pageerror',e=>errors.push(e.message));
        try {
          await page.goto(urls[id],{waitUntil:'domcontentloaded'});
          await page.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);
          await page.waitForTimeout(3000);
          // A stroke/arrow can expose its ID on multiple DOM nodes.
          // Require the exact set of persisted element IDs, not the number of nodes.
          const expectedIds=meta.order;
          try {
            await page.waitForFunction(ids=>{
              const layer=document.querySelector('.wb-elements');
              if(!layer) return false;
              const rendered=new Set([...layer.querySelectorAll('[data-wb-id]')].map(el=>el.getAttribute('data-wb-id')));
              return rendered.size===ids.length && ids.every(id=>rendered.has(id));
            },expectedIds,{timeout:30000});
          } catch(error) {
            const rendered=await page.evaluate(()=>[...new Set([...document.querySelectorAll('.wb-elements [data-wb-id]')].map(el=>el.getAttribute('data-wb-id')))]);
            throw Error(id+' '+theme+' render mismatch: '+JSON.stringify({expected:expectedIds.length,rendered:rendered.length,missing:expectedIds.filter(id=>!rendered.includes(id)),unexpected:rendered.filter(id=>!expectedIds.includes(id)),errors}),{cause:error});
          }
          await page.evaluate(()=>document.fonts.ready);
          const status=await page.evaluate(()=>({title:document.title,theme:document.documentElement.dataset.theme,count:new Set([...document.querySelectorAll('.wb-elements [data-wb-id]')].map(el=>el.getAttribute('data-wb-id'))).size}));
          if(status.theme!==theme||status.count!==expected||errors.length) throw Error(id+' '+theme+': '+JSON.stringify({status,errors}));
          const path='boards/'+id+'-'+theme+'.png';
          await page.screenshot({path:'_site/'+path});
          board.images[theme]=path;
          console.log(id,theme,expected);
        } finally { await page.close(); }
      }
      manifest.boards[index]=board;
    }));
  } finally { await browser.close(); }
  fs.writeFileSync('_site/manifest.json',JSON.stringify(manifest,null,2));
})().catch(e=>{console.error(e);process.exit(1)});
