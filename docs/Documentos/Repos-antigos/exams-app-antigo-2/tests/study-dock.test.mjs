import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const html=readFileSync(new URL('../prototype/exam-app-0.1.1__index.html',import.meta.url),'utf8');
const start=html.indexOf('/* Shared study dock: highlights, focus, timer, typography, answer sheet');
const end=html.indexOf('function questaoPage(q){',start);
assert.ok(start>=0&&end>start,'study dock functions available');
const src=html.slice(start,end)+'\n({qDockRanges,qHighlightMarkup,qDockFontSize,qDockClock,qDockFmt,qDock,qDockHighlightKey})';
function setup(){
 const mem=new Map(),events=[];
 const env={space:'dataprev',store:{get:k=>mem.get(k),set:(k,v)=>mem.set(k,v)},view:{addEventListener:(...a)=>events.push(a)},
  app:{classList:{contains:()=>false}},esc:x=>String(x).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;'),
  UIICON:{timer:'<svg></svg>'},Math,Date,Number,String,Set,Array,
  setInterval:()=>1,clearInterval:()=>{},qObjs:()=>[],toast:()=>{},window:{}};
 return {api:runInNewContext(src,env),mem,events};
}
test('all question modes share functional study tools without grading answers',()=>{
 const {api}=setup(),q={id:'q1',n:1};
 for(const mode of ['single','practice','exam']){
   const markup=api.qDock(q,mode);
   assert.match(markup,new RegExp('data-q-dock-mode="'+mode+'"'));
   for(const action of ['data-q-dock-highlight','data-q-dock-focus','data-q-dock-timer','data-q-dock-font="up"',
     'data-q-dock-font="down"','data-q-dock-sheet'])assert.ok(markup.includes(action),action);
   assert.doesNotMatch(markup,/Gabarito:/);
 }
 assert.match(html,/qDock\(q,'single'\)/);
 assert.match(html,/qDock\(q,examMode\?'exam':'practice'\)/);
});
test('grip ranges are scoped to question and literal text rendering is escaped',()=>{
 const {api,mem}=setup(),q={id:'q1',n:1};
 mem.set(api.qDockHighlightKey(q.id),{statement:[{start:0,end:4},{start:5,end:10}]});
 const markup=api.qHighlightMarkup(q,'A&B <script>alert(1)</script>','statement');
 assert.match(markup,/data-q-highlight-remove="q1\|statement\|0\|4"/);
 assert.equal((markup.match(/<mark/g)||[]).length,2);
 assert.doesNotMatch(markup,/<script>/);
 assert.match(markup,/&lt;/);
 assert.match(markup,/&gt;/);
 assert.equal(api.qDockRanges('q2','statement').length,0,'separate question has no highlights');
});
test('invalid saved ranges are ignored and typography clamps 14–20px',()=>{
 const {api,mem}=setup();
 assert.equal(api.qDockFontSize(),16,'unset font preference must default to 16px');
 mem.set(api.qDockHighlightKey('q1'),{statement:[{start:-1,end:2},{start:3,end:3},{start:0,end:1000}]});
 assert.equal(api.qHighlightMarkup({id:'q1'},'abc','statement'),'abc');
 mem.set('question-font:dataprev',99);assert.equal(api.qDockFontSize(),20);
 mem.set('question-font:dataprev',1);assert.equal(api.qDockFontSize(),14);
 mem.set('question-font:dataprev',17);assert.equal(api.qDockFontSize(),17);
});
test('timer represents recorded milliseconds and running state honestly',()=>{
 const {api,mem}=setup();
 mem.set('question-clock:dataprev:q1',{elapsed:125000,runningAt:null});
 assert.equal(api.qDockClock('q1').seconds,125);
 assert.equal(api.qDockFmt(125),'02:05');
 assert.match(api.qDock({id:'q1',n:1},'single'),/>02:05</);
 assert.equal(api.qDockClock('q2').seconds,0);
});
test('focus controls have a keyboard exit, selection is explicitly opt-in',()=>{
 assert.match(html,/data-q-dock-focus/);
 assert.match(html,/e\.key==='Escape'&&app\.classList\.contains\('study-focus'\)/);
 assert.match(html,/if\(e\.target\.closest\('\[data-q-dock-highlight\]'\)\)e\.preventDefault\(\)/);
 assert.match(html,/getSelection\(\)/);
 assert.match(html,/setEnd\(range\.startContainer,range\.startOffset\)/);
});
