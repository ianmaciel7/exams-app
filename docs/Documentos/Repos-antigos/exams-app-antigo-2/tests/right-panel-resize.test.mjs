import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const html=readFileSync(new URL('../prototype/exam-app-0.1.1__index.html',import.meta.url),'utf8');
const first=html.indexOf('function rpUpdateTabLayout(){');
const last=html.indexOf('function rpPaintTabs(){',first);
assert.ok(first>0&&last>first,'contextual layout function exists');
const source=html.slice(first,last);
function setup({count=3,width=420,natural=300,compressed=180,visible=true}={}){
  let compact=false,closed=0;
  const current={id:'t1',views:[{id:'v1',type:'search'}]};
  const rpTabs={
    get clientWidth(){return width;},
    get scrollWidth(){return compact?compressed:natural;},
    scrollLeft:0,
    classList:{
      remove(k){if(k==='compact')compact=false;},
      toggle(k,v){if(k==='compact')compact=v;}
    },
    querySelector(){return null;}
  };
  const overflow={hidden:true},menu={hidden:true},search={value:''};
  const context={
    RP:{tabs:Array.from({length:count},(_,i)=>({...current,id:'t'+i}))},
    rpVisible:()=>visible,
    $:id=>({rpTabs,rpOverflow:overflow,rpTabMenu:menu,rpTabSearch:search}[id]),
    rpCloseOverflowMenu:()=>closed++,rpRenderTabMenu:()=>{}
  };
  const update=runInNewContext(source+'\nrpUpdateTabLayout',context);
  return {update,rpTabs,overflow,setWidth:v=>{width=v;},setVisible:v=>{visible=v;},
    get compact(){return compact;},get closed(){return closed;}};
}

test('three contextual tabs compact only when actual available width is insufficient',()=>{
  const h=setup({count:3,width:430,natural:340});
  h.update();
  assert.equal(h.compact,false);
  assert.equal(h.overflow.hidden,true);
  h.setWidth(240);
  h.update();
  assert.equal(h.compact,true);
  assert.equal(h.overflow.hidden,false);
  h.setWidth(430);
  h.update();
  assert.equal(h.compact,false,'compact state must be recalculated after expansion');
  assert.equal(h.overflow.hidden,true);
});

test('five tabs always expose searchable overflow regardless of width',()=>{
  const h=setup({count:5,width:640,natural:500});
  h.update();
  assert.equal(h.compact,true);
  assert.equal(h.overflow.hidden,false);
});

test('closed panel avoids resizing hidden tab strip',()=>{
  const h=setup({count:4,width:240,natural:390,visible:false});
  h.update();
  assert.equal(h.compact,false);
  assert.equal(h.closed,0);
});

test('ResizeObserver is registered for the panel and its tab strip',()=>{
  assert.match(html,/const rpLayoutObserver=new ResizeObserver\(\(\)=>\{/);
  assert.match(html,/rpLayoutObserver\.observe\(\$\('rpanel'\)\)/);
  assert.match(html,/rpLayoutObserver\.observe\(\$\('rpTabs'\)\)/);
  assert.match(html,/if\(rpVisible\(\)\) rpUpdateTabLayout\(\)/);
});
