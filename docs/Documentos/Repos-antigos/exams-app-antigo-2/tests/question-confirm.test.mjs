import { runInNewContext as vmRunInNewContext } from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const html=readFileSync(new URL('../prototype/exam-app-0.1.1__index.html',import.meta.url),'utf8');
const section=(from,to)=>{const i=html.indexOf(from),j=html.indexOf(to,i+from.length);assert.ok(i>=0&&j>i);return html.slice(i,j);};
const page=section('function questaoPage(q){','function ');
const handlers=section("view.addEventListener('keydown',e=>{","const rr0=");
test('single-question route renders a disabled Respond button before selection',()=>{
  assert.match(page,/data-qo-submit/);
  assert.match(page,/!selected\?' disabled':''/);
  assert.match(page,/aria-pressed/);
  assert.match(page,/class="sc-alt'/);
});
test('choice click only sets a pending answer and changes visual selection',()=>{
  assert.match(html,/qPend\[id\]=l; const card=qa\.closest\('\.qo'\)/);
  assert.match(html,/b\.classList\.toggle\('picked',picked\)/);
  assert.match(html,/submit\.disabled=false/);
  assert.match(html,/data-qo-submit/);
  assert.match(html,/qCorrect\(q\.id,qPend\[q\.id\],'single'\)/);
  assert.doesNotMatch(html, /const qa=e\.target\.closest\('\[data-qo-ans\]'\); if\(qa\)\{[\s\S]{0,180}saveAnswers\(/);
});
test('Enter can confirm and practice defaults to explicit confirmation',()=>{
  assert.match(html,/qAuto=store\.get\('qAuto'\)===true/);
  assert.match(html,/if\(e\.key==='Enter'&&e\.target\.matches\('\.qo-alts \[data-qo-ans\]'\)\)/);
  assert.match(html,/question\.confirm/);
  assert.match(html,/data-qo-submit\]:not\(:disabled\)/);
});
test('reset clears pending state and correct answer only appears after grading',()=>{
  assert.match(html,/const qr=e\.target\.closest\('\[data-qo-reset\],\[data-q-retry\]'\)/);
  assert.match(html,/qResetForRetry\(q,key\)/);
  assert.match(html,/closest\('\[data-practice-key\]'\)/);
  assert.match(html,/delete qPend\[q\.id\]/);
  assert.match(page,/r\?'<p class="s-note">/);
});


test('all three routes render a separate, keyboard-accessible scissor control',()=>{
  assert.match(html,/function qExcludeButton\(q,l,locked=false\)/);
  assert.match(html,/aria-pressed="'\+off\+'" aria-label="/);
  assert.match(html,/qExcludeButton\(q,l,!!r\)/);
  assert.match(html,/qExcludeButton\(q,k,!examMode&&!!answer\)/);
  assert.match(html,/q-choice-row/);
  assert.match(html,/\.q-choice-row\.excluded>/);
  assert.match(html,/const saved=new Set\(qExcluded\(q\)\)/);
  assert.match(html,/store\.set\(qExcludedKey\(q\),\[\.\.\.saved\]\)/);
  assert.match(html,/if\(off&&qPend\[id\]===letter\)/);
  assert.match(html,/if\(off&&option\?\.checked\)/);
});
test('single-question object puts metadata after content and uses a two-line context header',()=>{
  assert.match(page,/qCompactMeta\(q,i\)/);
  assert.match(page,/qAssociated\(q\)/);
  assert.match(page,/class="qo-metadata"/);
  assert.match(page,/title:qTitle\(q\),body:body/);
  assert.doesNotMatch(page,/title:qTitle\(q\),props,body/);
  assert.match(html,/class="q-compact-secondary"/);
});
test('associated text only hides a separate provided source; never hides the question itself',()=>{
  const from=html.indexOf('const qExcludedKey='),to=html.indexOf('function questaoPage(q){',from);
  assert.ok(from>=0&&to>from);
  const {runInNewContext}=requireWorkaround();
  const storeData=new Map(),env={
    space:'test',view:{addEventListener(){}},store:{get:k=>storeData.get(k),set:(k,v)=>storeData.set(k,v)},
    esc:x=>String(x).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;'),
    discEnt:()=>null,edicaoById:()=>null,valHref:()=>null
  };
  const api=runInNewContext(html.slice(from,to)+'\n({qExcluded,qExcludedKey,qIsExcluded,qExcludeButton,qAssociated,qCompactMeta})',env);
  const question={id:'q91',n:91,enunciado:'Marque a alternativa correta.',textoAssociado:'Apoio separado & literal.',alternativas:{A:'Resposta'}};
  assert.equal(api.qExcluded(question).length,0);
  assert.match(api.qAssociated(question),/<details class="q-associated">/);
  assert.match(api.qAssociated(question),/Apoio separado &amp; literal/);
  assert.equal(api.qAssociated({...question,textoAssociado:''}),'');
  assert.match(api.qCompactMeta(question,0),/q-compact-primary/);
  storeData.set(api.qExcludedKey(question),['A']);
  assert.equal(api.qIsExcluded(question,'A'),true);
  assert.match(api.qExcludeButton(question,'A'),/aria-pressed="true"/);
});
function requireWorkaround(){
  // Dynamically importing is unnecessary; use the same node:vm import as the other tests.
  return {runInNewContext:vmRunInNewContext};
}
