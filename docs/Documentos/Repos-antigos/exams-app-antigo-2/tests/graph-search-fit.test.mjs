import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const html=readFileSync(new URL('../prototype/exam-app-0.1.1__index.html',import.meta.url),'utf8');
const start=html.indexOf('function graphFocusBounds(points,width,height,pad=60){');
const end=html.indexOf('function buildGraph(seq){',start);
assert.ok(start>=0&&end>start,'graph camera helper is declared');
const fit=runInNewContext(html.slice(start,end)+'\ngraphFocusBounds',{Math,Infinity});

test('search camera fits a single target in view',()=>{
  const f=fit([{x:200,y:-60}],960,620);
  assert.equal(f.k,2.2);
  assert.equal(200*f.k+f.tx,480);
  assert.equal(-60*f.k+f.ty,310);
});

test('search camera centers and fits clusters with safe padding',()=>{
  for(const width of [320,390,1366]){
    const points=[{x:-410,y:-280},{x:240,y:100},{x:500,y:360},{x:-50,y:90}];
    const frame=fit(points,width,760);
    assert.ok(frame.k>=.25&&frame.k<=2.2);
    const left=Math.min(...points.map(p=>p.x*frame.k+frame.tx));
    const right=Math.max(...points.map(p=>p.x*frame.k+frame.tx));
    const top=Math.min(...points.map(p=>p.y*frame.k+frame.ty));
    const bottom=Math.max(...points.map(p=>p.y*frame.k+frame.ty));
    assert.ok(left>=0&&right<=width,'horizontal cluster bounds fit');
    assert.ok(top>=0&&bottom<=760,'vertical cluster bounds fit');
  }
});

test('empty and invalid viewport have no camera change',()=>{
  assert.equal(fit([],1000,800),null);
  assert.equal(fit([{x:0,y:0}],0,800),null);
});

test('search updates result count, focuses cluster, resets on Escape and respects filters',()=>{
  assert.match(html,/id="gvMatchCount"[^>]+role="status" aria-live="polite"/);
  assert.match(html,/function graphFocusBounds\(points,width,height,pad=60\)/);
  assert.match(html,/const updateGraphSearch=\(\)=>\{/);
  assert.match(html,/matchCount\.textContent=st\.match\.size===0\?'Nenhum objeto encontrado'/);
  assert.match(html,/if\(frame\)\{ st\.k=frame\.k; st\.tx=frame\.tx; st\.ty=frame\.ty; \}/);
  assert.match(html,/else if\(e\.key==='Escape'\)\{ gq\.value=''; updateGraphSearch\(\); \}/);
  assert.match(html,/st\.alpha=Math\.max\(st\.alpha,\.5\);\s*updateGraphSearch\(\);/);
  assert.match(html,/const updateGraphVisibility=\(\)=>/);
});
