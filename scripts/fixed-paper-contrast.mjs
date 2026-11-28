// Project-local view compatibility for native Open Artifact v0.17.0.
// The original SVG, text elements, ids, editability and geometry stay intact.
// Only correct inadequate free-text ink over verified solid grayscale SVG paper
// in the High-Fidelity board; leave native backdrop-aware text alone.
export function ratio(a,b){
  const lum=h=>h.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
  const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
}
const hex=v=>/^#[0-9a-f]{6}$/i.test(v??'')?v.toLowerCase():null;
export function safeInk(ink,paper){
  if(!hex(ink)||!hex(paper)||ratio(ink,paper)>=4.5)return null;
  return ratio('#262626',paper)>=ratio('#efefef',paper)?'#262626':'#efefef';
}
export function solidPaper(source,parse){
  try{
    if(!source?.startsWith('data:image/svg+xml'))return null;
    const i=source.indexOf(',');if(i<0)return null;
    const raw=source.slice(0,i).includes(';base64')?atob(source.slice(i+1)):decodeURIComponent(source.slice(i+1));
    const doc=parse(raw),svg=doc.documentElement;
    if(svg.localName!=='svg'||svg.namespaceURI!=='http://www.w3.org/2000/svg'||svg.children.length!==1)return null;
    const child=svg.firstElementChild,box=(svg.getAttribute('viewBox')??'').trim().split(/[ ,]+/).map(Number);
    if(box.length!==4||box[0]!==0||box[1]!==0||!(box[2]>0&&box[3]>0))return null;
    if([...svg.attributes].some(a=>!['xmlns','viewBox','color','width','height'].includes(a.name)))return null;
    const fill=hex(child.getAttribute('fill'));
    if(!fill||!/^#([0-9a-f]{2})\1\1$/i.test(fill))return null;
    const allowed=['fill','stroke','width','height','x','y','d','rx','ry'];
    if([...child.attributes].some(a=>!allowed.includes(a.name))||!['none',null].includes(child.getAttribute('stroke')))return null;
    const w=box[2],h=box[3];
    if(child.localName==='rect'&&Number(child.getAttribute('x')??0)===0&&Number(child.getAttribute('y')??0)===0&&Number(child.getAttribute('width'))===w&&Number(child.getAttribute('height'))===h&&Number(child.getAttribute('rx')??0)===0&&Number(child.getAttribute('ry')??0)===0)return {fill,inset:0};
    // Exact project drawer path, with square left seam and two right 12-unit corners.
    if(child.localName==='path'&&child.getAttribute('d')===`M 0 0 L ${w-12} 0 A 12 12 0 0 1 ${w} 12 L ${w} ${h-12} A 12 12 0 0 1 ${w-12} ${h} L 0 ${h} Z`)return {fill,inset:12};
    return null;
  }catch{return null;}
}
function bounds(el){return {x:el.offsetLeft,y:el.offsetTop,w:el.offsetWidth,h:el.offsetHeight};}
function contains(a,b,inset=0){return b.x>=a.x-2&&b.y>=a.y+inset-2&&b.x+b.w<=a.x+a.w+2&&b.y+b.h<=a.y+a.h-inset+2;}
function overlaps(a,b){return Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x)>4&&Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y)>4;}
export function install(root=document){
  const style=root.createElement('style');style.id='exam-fixed-paper-contrast';
  style.textContent='.wb-text[data-exam-fixed-paper-ink]{--wb-ink:var(--exam-fixed-paper-ink)!important}';
  root.head.append(style);
  let queued=false, observed=null, observer;
  const cache=new WeakMap();
  function update(){
    queued=false;
    const layer=root.querySelector('.wb-elements');
    if(layer!==observed){
      observer?.disconnect();observed=layer;
      if(layer){observer=new MutationObserver(schedule);observer.observe(layer,{subtree:true,childList:true,attributes:true,attributeFilter:['style','class','src','data-wb-backdrop'],characterData:true});}
    }
    if(!layer||!layer.querySelector('[data-wb-id="desktop_q_stem"]')||!layer.querySelector('[data-wb-id="redline_desktop"]'))return;
    const seen=[];
    for(const el of layer.children){
      if(!el.hasAttribute('data-wb-id'))continue;
      const b=bounds(el);
      if(el.classList.contains('wb-text')){
        let corrected=null;
        if(!el.hasAttribute('data-wb-backdrop')&&b.w>0&&b.h>0){
          for(let i=seen.length-1;i>=0;i--){
            const item=seen[i];if(!overlaps(item.b,b))continue;
            if(item.paper&&contains(item.b,b,item.paper.inset))corrected=safeInk(el.style.getPropertyValue('--wb-ink').trim(),item.paper.fill);
            // Do not guess through a later opaque item, an unknown image, or partially covered paper.
            break;
          }
        }
        const old=el.style.getPropertyValue('--exam-fixed-paper-ink');
        if(corrected&&old!==corrected){el.style.setProperty('--exam-fixed-paper-ink',corrected);el.setAttribute('data-exam-fixed-paper-ink','');}
        else if(!corrected&&old){el.style.removeProperty('--exam-fixed-paper-ink');el.removeAttribute('data-exam-fixed-paper-ink');}
      }else if(el.classList.contains('wb-image')){
        const src=el.querySelector('img')?.getAttribute('src');
        let entry=cache.get(el);if(!entry||entry.src!==src){entry={src,paper:solidPaper(src,s=>new DOMParser().parseFromString(s,'image/svg+xml'))};cache.set(el,entry);}
        seen.push({b,paper:entry.paper});
      }else if(el.classList.contains('wb-shape')||el.classList.contains('wb-note')||el.classList.contains('wb-html')||el.classList.contains('wb-table')){
        const shape=el.querySelector('.wb-shape-svg path');
        if(shape?.getAttribute('fill')==='none')continue;
        seen.push({b,paper:null});
      }
    }
  }
  function schedule(){if(!queued){queued=true;requestAnimationFrame(update);}}
  const outer=new MutationObserver(()=>{if(root.querySelector('.wb-elements')!==observed)schedule();});
  outer.observe(root.body,{subtree:true,childList:true});
  new MutationObserver(schedule).observe(root.documentElement,{attributes:true,attributeFilter:['data-theme']});
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change',schedule);
  schedule();
}
if(typeof document!=='undefined')install();
