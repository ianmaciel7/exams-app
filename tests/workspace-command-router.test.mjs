import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const html=readFileSync(new URL('../prototypes/exam-app-0.1.1/index.html',import.meta.url),'utf8');
const a=html.indexOf('/* ---- centralized workspace command registry (#139) ----');
const b=html.indexOf('/* ---- in-page dialog',a);
assert.ok(a>=0&&b>a,'command registry anchors exist');

function harness({mac=false}={}){
  const calls=[];
  const doc={querySelector:()=>null,addEventListener(type,fn){if(type==='keydown')this.keyHandler=fn;}};
  const ctx={
    document:doc,navigator:{platform:mac?'MacIntel':'Win32'},
    $:()=>({classList:{contains:()=>false}}),
    app:{classList:{contains:()=>false,remove:()=>{}}},
    MQT:{matches:false},ovOpen:false,palOpen:false,WS:{tabs:[{id:'a'},{id:'b'}],active:'a'},
    cur:{d:{id:'abc'},pdf:false},
    openSearch:(newTab)=>calls.push('search:'+!!newTab),
    openNewMenu:()=>calls.push('new-menu'),
    toggleSide:()=>calls.push('side'),
    openRP:()=>calls.push('panel'),
    rpVisible:()=>false,
    wsStep:n=>calls.push('step:'+n),
    wsClose:()=>calls.push('close-tab'),
    wsActivate:id=>calls.push('activate:'+id),
    closePal:()=>{},closePops:()=>{},closeCtx:()=>{},
    palItems:[],palSel:0,markSel:()=>{},choose:()=>{},
    startRename:()=>{},setZoom:()=>{},docsOf:()=>[],
    esc:s=>s
  };
  const source='(function(){'+html.slice(a,b)+'\nreturn {workspaceCommands,shortcutMatches,formatShortcut,routeWorkspaceShortcut,commandTargetEditable,shortcutCatalogHtml};})()';
  const api=runInNewContext(source,ctx);
  function key(k,mods={}){
    const e={key:k,ctrlKey:false,metaKey:false,altKey:false,shiftKey:false,isComposing:false,defaultPrevented:false,
      target:{isContentEditable:false,closest:()=>null},
      preventDefault(){this.defaultPrevented=true;},stopImmediatePropagation(){this.stopped=true;},...mods};
    api.routeWorkspaceShortcut(e);
    return e;
  }
  return {api,calls,key,ctx};
}
test('chords are canonical on Windows and macOS; wrong modifiers do not match',()=>{
  const a=harness();
  assert.equal(a.api.shortcutMatches({key:'k',ctrlKey:true,metaKey:false,altKey:false,shiftKey:false},'Mod+k'),true);
  assert.equal(a.api.shortcutMatches({key:'k',ctrlKey:true,metaKey:false,altKey:true,shiftKey:false},'Mod+k'),false);
  assert.equal(a.api.formatShortcut('Mod+Alt+n'),'Ctrl + Alt + n');
  const m=harness({mac:true});
  assert.equal(m.api.formatShortcut('Mod+Alt+n'),'⌘ + Option + n');
});
test('global commands execute once and are suppressed in textboxes, IME, and modal',()=>{
  const h=harness();
  h.key('k',{ctrlKey:true});
  assert.deepEqual(h.calls,['search:false']);
  h.key('b',{ctrlKey:true,target:{closest:()=>({tagName:'INPUT'})}});
  assert.deepEqual(h.calls,['search:false']);
  h.key('b',{ctrlKey:true,isComposing:true});
  assert.deepEqual(h.calls,['search:false']);
  h.ctx.$=()=>({classList:{contains:()=>true}});
  h.key('b',{ctrlKey:true});
  assert.deepEqual(h.calls,['search:false']);
  h.ctx.$=()=>({classList:{contains:()=>false}});
  h.key('b',{ctrlKey:true});
  assert.deepEqual(h.calls,['search:false','side']);
});
test('workspace history chords route to one owner with no duplicate browser fallback',()=>{
  const h=harness();
  h.key('ArrowLeft',{altKey:true});
  h.key('ArrowRight',{altKey:true});
  assert.deepEqual(h.calls,['step:-1','step:1']);
  assert.doesNotMatch(html,/history\.back\(\); \}\s*else if\(\(alt&&e\.key===/);
});
test('command catalog is generated rather than a static hardcoded table',()=>{
  const h=harness();
  const ids=h.api.workspaceCommands.map(x=>x.id);
  assert.ok(ids.includes('workspace.search')&&ids.includes('question.answer-A'));
  assert.ok(ids.includes('workspace.sidebar'));
  assert.match(h.api.shortcutCatalogHtml(),/Buscar documentos/);
  assert.match(html,/html:shortcutCatalogHtml\(\)/);
});
