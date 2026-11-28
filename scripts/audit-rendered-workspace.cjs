// Audit real rendered DC artboards, not a recreated CSS fixture.
// Results are evidence for provisional identity, not app WCAG conformance.
const fs=require('node:fs');
const path=require('node:path');
async function auditWorkspace(page,root,commit,site){
  const canvas=JSON.parse(fs.readFileSync(path.join(root,'designs/exam-app-workspace-mockup/project/canvas.json'),'utf8'));
  const expected=canvas.order.filter(id=>Object.hasOwn(canvas.boards,id));
  if(expected.length!==Object.keys(canvas.boards).length)throw Error('Workspace canvas inventory drift');
  const url=new URL(page.url());url.searchParams.set('qa-artboards','all');
  await page.goto(url.href,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(ids=>{
    const editor=document.querySelector('iframe[name="open-artifact-shell"]')?.contentDocument;
    return !!editor&&ids.every(id=>{
      const frame=[...editor.querySelectorAll('iframe[data-board]')].find(x=>x.getAttribute('data-board')===id);
      return !!frame?.contentDocument?.querySelector('[data-dc-root] [data-theme]');
    });
  },expected,{timeout:60000});
  const editor=page.frameLocator('iframe[name="open-artifact-shell"]');
  const reports=[];
  for(const id of expected){
    const frame=editor.frameLocator('iframe[data-board='+JSON.stringify(id)+']');
    const report=await frame.locator('[data-dc-root]').evaluate((root)=>{
      // Preserve fractional sRGB values. Unsupported colors are reported, never guessed.
      const readColor=s=>{
        let m=/^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\)$/i.exec(s);
        if(m)return [+m[1],+m[2],+m[3],m[4]===undefined?1:+m[4]];
        m=/^rgba?\(([^)]+)\)$/i.exec(s);
        if(!m)return null;
        const n=m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
        return n.length>=3&&n.every(Number.isFinite)?[n[0]/255,n[1]/255,n[2]/255,n[3]??1]:null;
      };
      const over=(a,b)=>{const alpha=a[3]+b[3]*(1-a[3]);return alpha===0?[0,0,0,0]:[...a.slice(0,3).map((v,i)=>(v*a[3]+b[i]*b[3]*(1-a[3]))/alpha),alpha];};
      const lum=c=>c.slice(0,3).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
      const ratio=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
      const visible=el=>{for(let e=el;e;e=e.parentElement){const c=getComputedStyle(e);if(c.display==='none'||c.visibility==='hidden'||e.getAttribute('aria-hidden')==='true')return false;}return !!el.getClientRects().length;};
      const surface=el=>{
        let bg=[0,0,0,0];
        for(let e=el;e;e=e.parentElement){
          const c=getComputedStyle(e);
          if(c.backgroundImage!=='none'||Number(c.opacity)!==1||c.mixBlendMode!=='normal')return null;
          const rgba=readColor(c.backgroundColor);if(!rgba)return null;
          bg=over(bg,rgba);if(bg[3]>=.999999)return bg;
        }
        return null;
      };
      const text=[],indicators=[],unsupported=[];
      const push=(dest,kind,label,fg,bg,min)=>{
        if(!fg||!bg){unsupported.push({kind,label,reason:'Unknown or non-solid composited surface/color'});return;}
        const r=ratio(over(fg,bg),bg);dest.push({kind,label,ratio:r,min,pass:r>=min});
      };
      for(const el of root.querySelectorAll('*')){
        if(!visible(el)||el.closest('svg,script,style'))continue;
        const label=[...el.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent.trim()).filter(Boolean).join(' ');
        if(!label||!el.closest('[data-theme]'))continue;
        const c=getComputedStyle(el);
        const font=parseFloat(c.fontSize),weight=parseInt(c.fontWeight,10);
        const min=font>=24||(font>=18.6667&&weight>=700)?3:4.5;
        // Disabled elements are reported separately; disabled contrast is not an AA requirement.
        const disabled=!!el.closest(':disabled,[aria-disabled="true"]');
        if(disabled){unsupported.push({kind:'disabled-text',label:label.slice(0,120),reason:'Inactive-control exception; not threshold-bearing'});continue;}
        push(text,'text',label.slice(0,120),readColor(c.color),surface(el),min);
      }
      for(const radio of root.querySelectorAll('[role="radio"]')){
        if(!visible(radio)||radio.matches(':disabled,[aria-disabled="true"]'))continue;
        const ring=radio.querySelector('span[aria-hidden="true"]');
        if(!ring){unsupported.push({kind:'radio',label:radio.textContent.trim(),reason:'No measurable radio ring'});continue;}
        const css=getComputedStyle(ring),label=radio.textContent.trim().slice(0,120);
        push(indicators,'radio-ring-outer',label,readColor(css.borderTopColor),surface(radio),3);
        if(radio.getAttribute('aria-checked')==='true'){
          const dot=ring.querySelector('span');
          push(indicators,'radio-dot',label,dot?readColor(getComputedStyle(dot).backgroundColor):null,surface(ring),3);
        }
      }
      return {text,indicators,unsupported,states:{radioCount:root.querySelectorAll('[role="radio"]').length,checked:root.querySelectorAll('[role="radio"][aria-checked="true"]').length,lockedText:root.innerText.includes('Answer locked'),correctText:root.innerText.includes('Correct'),yourAnswerText:root.innerText.includes('Your answer'),currentNav:root.querySelectorAll('[aria-current="page"]').length,dialog:root.querySelectorAll('[role="dialog"][aria-modal="true"]').length}};
    });
    if(!report.text.length)throw Error('No auditable text in real artboard '+id);
    reports.push({id,title:canvas.boards[id].title,width:canvas.boards[id].w,height:canvas.boards[id].h,...report});
  }
  const all=reports.flatMap(r=>[...r.text,...r.indicators]);
  const failures=all.filter(r=>!r.pass);
  const evidence={commit,kind:'rendered-provisional-artboard-audit',artboards:reports,summary:{artboards:reports.length,measured:all.length,failures:failures.length,unsupported:reports.reduce((s,r)=>s+r.unsupported.length,0)},limitations:['Default rendered states only; no claim of keyboard, focus, touch, reflow, forced colors or screen reader conformance.','Text over unknown surfaces and disabled text are reported separately.','Artboard-level DOM geometry is not a production runtime or screenshot visibility guarantee.']};
  fs.mkdirSync(path.join(site,'qa'),{recursive:true});
  fs.writeFileSync(path.join(site,'qa','rendered-color-audit.json'),JSON.stringify(evidence,null,2));
  console.log('Rendered workspace audit:',JSON.stringify(evidence.summary));
  for(const board of reports)for(const finding of [...board.text,...board.indicators].filter(r=>!r.pass))console.warn('PROVISIONAL ACCESSIBILITY FINDING',board.id,JSON.stringify(finding));
  // The exploration is explicitly unapproved and has a separate accessibility acceptance gate.
  // Preserve the report even if it contains failures; do not describe a failed candidate as approved.
}
module.exports={auditWorkspace};
