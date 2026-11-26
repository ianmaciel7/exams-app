import test from 'node:test';
import assert from 'node:assert/strict';
import { inkProfile, sketchPath } from './marker-sketch-ink.mjs';

test('small icon and macro stroke both get bounded deterministic drift', () => {
  for (const length of [12, 80, 1400]) {
    const sample = s => ({x:s,y:0});
    const a=sketchPath(sample,length,length,'icon-'+length,2.2);
    assert.deepEqual(a,sketchPath(sample,length,length,'icon-'+length,2.2));
    assert.ok(a.points.slice(1,-1).some(p=>Math.abs(p.y)>0.001));
    assert.ok(a.points.every(p=>Math.abs(p.y)<=a.amplitude+0.001));
    assert.deepEqual(a.points[0],{x:0,y:0});
    assert.deepEqual(a.points.at(-1),{x:length,y:0});
    assert.ok(a.width>=2.2*.93&&a.width<=2.2*1.07);
  }
});
test('closed radios stay closed and preserve approximate radius', () => {
  const radius=6,length=2*Math.PI*radius;
  const sample=s=>({x:radius*Math.cos(s/radius),y:radius*Math.sin(s/radius)});
  const a=sketchPath(sample,length,12,'radio',2.2);
  assert.equal(a.closed,true);
  assert.deepEqual(a.points[0],a.points.at(-1));
  assert.ok(a.points.every(p=>Math.abs(Math.hypot(p.x,p.y)-radius)<=a.amplitude+0.001));
});
test('different strokes have different seeded weight and bounded amplitude', () => {
  assert.notDeepEqual(inkProfile('search',14,2.2),inkProfile('collapse',14,2.2));
  assert.ok(inkProfile('small',14,2.2).amplitude<inkProfile('large',200,2.2).amplitude);
  assert.equal(sketchPath(()=>({x:0,y:0}),0,0,'dot',2),null);
});

test('thin rectangular geometry receives denser sampling than macro span alone', () => {
  const sample = s => ({x:s,y:0});
  const a = sketchPath(sample,235,235,'frame',2.4,42);
  const b = sketchPath(sample,235,235,'frame',2.4);
  assert.ok(a.points.length > b.points.length);
  assert.deepEqual(a.points.at(-1), {x:235,y:0});
});
