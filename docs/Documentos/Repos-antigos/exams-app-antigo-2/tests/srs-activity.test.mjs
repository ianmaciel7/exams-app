import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const html=readFileSync(new URL('../prototype/exam-app-0.1.1__index.html',import.meta.url),'utf8');
const first=html.indexOf('/* ---- Daily Review / spaced repetition (#82) ---- */');
const last=html.indexOf('function showReview()',first);
assert.ok(first>=0&&last>first,'Daily Review helpers exist');
const values=new Map();
const store={
  get:k=>values.get(k)||null,
  set:(k,v)=>values.set(k,structuredClone(v))
};
const context={store,space:'alpha',Date,Math,esc:s=>String(s).replaceAll('&','&amp;')};
runInNewContext(html.slice(first,last),context);
const api=runInNewContext('({load:srsLoad,create:srsCreateCard,grade:srsGradeCard,days:srsActivityDays,streak:srsReviewStreak,markup:srsActivityMarkup,day:srsLocalDay,setSpace:v=>{space=v}})',context);
const noon=(y,m,d)=>new Date(y,m-1,d,12).getTime();

test('cards and graded reviews persist true events, never backfill historical days',()=>{
  const t=noon(2026,11,12);
  const a=api.create('qa','','Question','Answer','Law',t);
  const d=api.load();
  assert.equal(d.activity.cards[api.day(t)],1);
  assert.equal(Object.keys(d.activity.reviews||{}).length,0);
  api.grade(a.id,'soon',t);
  api.grade(a.id,'later',t+1000);
  const again=api.load();
  assert.equal(again.activity.reviews[api.day(t)],2);
  assert.equal(again.activity.cards[api.day(t)],1);
  assert.equal(again.done,2);
  const days=api.days(again.activity,t,91);
  assert.equal(days.length,91);
  assert.equal(days.at(-1).reviews,2);
  assert.equal(days.at(-1).cards,1);
  assert.ok(days.slice(0,-1).every(x=>x.reviews===0&&x.cards===0));
});

test('streak uses actual calendar dates across gaps and leap days',()=>{
  const source={'2026-11-08':1,'2026-11-09':4,'2026-11-10':2,'2026-11-12':1,'2026-11-13':1};
  const a=api.streak(source,noon(2026,11,13));
  assert.equal(a.longest,3);
  assert.equal(a.current,2);
  assert.equal(a.reviewedDays,5);
  assert.equal(api.streak(source,noon(2026,11,14)).current,2,'yesterday keeps active streak');
  assert.equal(api.streak(source,noon(2026,11,15)).current,0,'streak expires after missing two days');
  assert.equal(api.streak({'2024-02-28':1,'2024-02-29':1,'2024-03-01':1},noon(2024,3,1)).longest,3);
});

test('activity map renders actual review and new-card cells, labels and 91-day bounds',()=>{
  const t=noon(2026,11,13);
  const markup=api.markup({activity:{reviews:{'2026-11-13':4},cards:{'2026-11-12':2}}},t);
  assert.equal((markup.match(/class="srs-day"/g)||[]).length,182);
  assert.match(markup,/Revisões · 4 nos últimos 91 dias/);
  assert.match(markup,/Novos cartões · 2 nos últimos 91 dias/);
  assert.match(markup,/data-srs-day="2026-11-13"/);
  assert.match(markup,/data-level="2"/);
  assert.match(markup,/Não são estimadas atividades passadas/);
  assert.match(markup,/role="img" aria-label="Revisões:/);
});

test('space isolation prevents mixing local activity ledgers',()=>{
  const alpha=api.load().activity;
  api.setSpace('beta');
  assert.equal(api.load().activity,undefined);
  const b=api.create('qa','','Other','Answer','History',noon(2026,11,14));
  api.grade(b.id,'someday',noon(2026,11,14));
  assert.equal(api.load().activity.reviews['2026-11-14'],1);
  api.setSpace('alpha');
  assert.equal(api.load().activity.cards['2026-11-12'],alpha.cards['2026-11-12']);
  assert.equal(api.load().activity.reviews['2026-11-14'],undefined);
});
