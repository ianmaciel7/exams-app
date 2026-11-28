// Token-level identity audit; not a rendered accessibility test.
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
function luminance(hex){if(!/^#[0-9a-f]{6}$/i.test(hex))throw Error("Expected opaque sRGB hex: "+hex);const rgb=hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=0.04045?x/12.92:((x+0.055)/1.055)**2.4);return rgb[0]*0.2126+rgb[1]*0.7152+rgb[2]*0.0722;}
function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);}
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
}
console.log('Token pairs only; no rendered or interaction conformance claim.');
if(failures)process.exitCode=1;
