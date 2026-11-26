import test from 'node:test';
import assert from 'node:assert/strict';
import { inks,markerInk,markerPoints,markerElement } from './marker-sketch.mjs';
const luminance=hex=>{
  const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
  return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];
};
const contrast=(a,b)=>(Math.max(luminance(a),luminance(b))+.05)/(Math.min(luminance(a),luminance(b))+.05);
const darkenForCanvas=hex=>'#'+[1,3,5].map(i=>Math.round(parseInt(hex.slice(i,i+2),16)*.45+239*.55).toString(16).padStart(2,'0')).join('');
test('semantic inks preserve contrast on both canvases',()=>{
  for(const color of Object.values(inks)){
    const light=color==='ink'?'#0B0B0B':color, dark=color==='ink'?'#EFEFEF':darkenForCanvas(color);
    assert.ok(contrast(light,'#FFFFFF')>=4.5,color+' light');
    assert.ok(contrast(dark,'#191919')>=4.5,color+' dark');
  }
  assert.equal(markerInk('#e0e0e0'),'ink');
  assert.equal(markerInk('#88aaff'),inks.blue);
});
test('rectangle is densified and remains closed',()=>{
  const p=markerPoints([0,0,180,0,180,185,0,185,0,0],'pop_box');
  assert.ok(p.length>10);assert.deepEqual(p.slice(-2),[0,0]);
  assert.ok(p.every((v,i)=>v>=0&&v<=(i%2?185:180)));
});
test('straight strokes are stable, bounded and preserve endpoints',()=>{
  const p=markerPoints([0,0,50,.6,100,0],'line');
  assert.deepEqual(p.slice(0,2),[0,0]);assert.deepEqual(p.slice(-2),[100,0]);
  assert.deepEqual(markerPoints(p,'line'),p);
});
test('text and non-sketch elements remain editable and unchanged in content',()=>{
  const t={type:'text',x:1,y:2,text:'Actual question',color:'#ffffff'};
  assert.deepEqual(markerElement(t,'q'),{...t,color:'ink'});
  assert.deepEqual(markerElement({type:'note',color:'yellow'},'note'),{type:'note',color:'yellow'});
});
