// Token-level identity audit; not a rendered accessibility test.
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
function luminance(hex){if(!/^#[0-9a-f]{6}$/i.test(hex))throw Error("Expected opaque sRGB hex: "+hex);const rgb=hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=0.04045?x/12.92:((x+0.055)/1.055)**2.4);return rgb[0]*0.2126+rgb[1]*0.7152+rgb[2]*0.0722;}
function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);}
// CSS color-mix(in srgb) uses gamma-encoded channel interpolation before luminance conversion.
function channels(hex){if(!/^#[0-9a-f]{6}$/i.test(hex))throw Error('Expected opaque sRGB hex: '+hex);return hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255);}
function lumChannels(rgb){const v=rgb.map(x=>x<=0.04045?x/12.92:((x+0.055)/1.055)**2.4);return v[0]*0.2126+v[1]*0.7152+v[2]*0.0722;}
function mixedContrast(fg,overlay,background,opacity){assert.ok(opacity>=0&&opacity<=1);const a=channels(overlay),b=channels(background);const x=lumChannels(channels(fg)),y=lumChannels(a.map((v,i)=>v*opacity+b[i]*(1-opacity)));return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);}
assert.equal(mixedContrast('#000000','#000000','#ffffff',0),21);
assert.equal(mixedContrast('#000000','#000000','#ffffff',1),1);
assert.ok(mixedContrast('#ffffff','#000000','#ffffff',0.1)<1.4);
assert.equal(contrast('#000000','#ffffff'),21);
assert.equal(contrast('#ffffff','#ffffff'),1);
assert.ok(contrast('#777777','#ffffff')<4.5);
assert.ok(contrast('#767676','#ffffff')>=4.5);
const pairs = [
  [
    "ink",
    "ground",
    4.5
  ],
  [
    "muted",
    "ground",
    4.5
  ],
  [
    "on-brand",
    "brand",
    4.5
  ],
  [
    "focus",
    "ground",
    3
  ],
  [
    "correct",
    "ground",
    4.5
  ],
  [
    "incorrect",
    "ground",
    4.5
  ],
  [
    "ink",
    "tint",
    4.5
  ],
  [
    "muted",
    "tint",
    4.5
  ],
  [
    "brand",
    "tint",
    3
  ],
  [
    "focus",
    "tint",
    3
  ],
  [
    "correct",
    "tint",
    4.5
  ],
  [
    "incorrect",
    "tint",
    4.5
  ],
  [
    "brand",
    "ground",
    3
  ],
  [
    "tint",
    "ground",
    null
  ],
  [
    "focus",
    "brand",
    null
  ]
];
const tokens=JSON.parse(readFileSync(new URL('../designs/exam-app-identity/project/tokens.json',import.meta.url),'utf8'));
const css=readFileSync(new URL('../designs/exam-app-identity/project/tokens.css',import.meta.url),'utf8');
const contract=JSON.parse(readFileSync(new URL('../designs/exam-app-identity/semantic-color-contract.json',import.meta.url),'utf8'));
assert.equal(contract.status,'provisional-not-approved');
assert.deepEqual(contract.surfaceMixes,[4,5,6,8,10]);
const mockupCss=readFileSync(new URL('../designs/exam-app-workspace-mockup/project/ds/examapp/tokens.css',import.meta.url),'utf8');
assert.equal(mockupCss,css,'Mockup token CSS differs from canonical generated CSS');
let failures=0;
for(const {id} of tokens.color.themes){
  const values=Object.fromEntries(tokens.color.tokens.map(t=>[t.name,t.value[id]]));
  const start=css.indexOf('[data-theme="'+id+'"] {');
  assert.ok(start>=0,'Missing generated theme '+id);
  const block=css.slice(start,css.indexOf('}',start));
  for(const [name,value] of Object.entries(values)){
    assert.ok(block.includes('--'+name+': '+value.toLowerCase()+';'),'Generated CSS drift: '+id+' '+name);
  }
  for(const [fg,bg,min] of pairs){
    const ratio=contrast(values[fg],values[bg]);
    // Compare the full value; round only the display.
    const pass=min===null?null:ratio>=min;
    console.log(id+' '+fg+'/'+bg+' '+ratio.toFixed(3)+' '+(pass===null?'informational':pass?'pass':'FAIL'));
    if(pass===false)failures++;
  }
  for(const percent of contract.surfaceMixes){
    for(const [fg,min] of [['ink',4.5],['muted',4.5],['brand',3],['focus',3]]){
      const ratio=mixedContrast(values[fg],values.ink,values.ground,percent/100);
      const pass=ratio>=min;
      console.log(id+' '+fg+'/ink-'+percent+'%-ground '+ratio.toFixed(3)+' '+(pass?'pass':'FAIL'));
      if(!pass)failures++;
    }
  }
  for(const row of contract.compositeInformational){
    if(row.theme&&row.theme!==id)continue;
    const overlay=row.foreground.startsWith('#')?row.foreground:values[row.foreground];
    const ratio=mixedContrast(values[row.background],overlay,values[row.background],row.opacity);
    console.log(id+' '+row.name+' '+ratio.toFixed(3)+' informational; actual adjacency and cue requirements pending');
  }
}
console.log('Token and composited candidate pairs only; no rendered or interaction conformance claim.');
if(failures)process.exitCode=1;
