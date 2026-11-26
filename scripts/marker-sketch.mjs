import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

// Dark-on-paper inks; Open Artifact maps custom inks to the dark canvas.
// Use the same semantic values in both themes, not two copies of the board.
export const inks = Object.freeze({
  primary: 'ink', secondary: '#545454', blue: '#194F9B',
  green: '#166534', red: '#A12B20', amber: '#80530B', purple: '#6741A5',
});
const named = { ink: 'ink', blue: inks.blue, green: inks.green, terracotta: inks.red, purple: inks.purple };

export function markerInk(color, { secondary = false } = {}) {
  if (color === 'ink') return secondary ? inks.secondary : inks.primary;
  if (Object.values(inks).some(v => v.toLowerCase() === String(color).toLowerCase())) return color;
  if (named[color]) return named[color];
  if (!/^#[0-9a-f]{6}$/i.test(color ?? '')) return color;
  const [r,g,b] = [1,3,5].map(i => parseInt(color.slice(i,i+2),16));
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  if (max-min < 24) return secondary || max < 165 ? inks.secondary : inks.primary;
  const d = max-min;
  let h = max===r ? (g-b)/d : max===g ? (b-r)/d+2 : (r-g)/d+4;
  h = ((h*60)%360+360)%360;
  return h<15||h>=330 ? inks.red : h<70 ? inks.amber : h<170 ? inks.green : h<255 ? inks.blue : inks.purple;
}

function seed(id) {
  let v=2166136261;
  for(const c of id) v=Math.imul(v^c.charCodeAt(0),16777619);
  return (v>>>0)/4294967296;
}
const round = n=>Math.round(n*100)/100 || 0;
function linePoints(x0,y0,x1,y1,id) {
  const dx=x1-x0,dy=y1-y0,len=Math.hypot(dx,dy);
  if(len<1) return [x0,y0,x1,y1];
  const sign=seed(id)<.5?-1:1;
  const amp=sign*Math.min(1.9,len*.008)*(.65+seed(id+'a')*.35);
  const n=Math.max(2,Math.ceil(len/24)), out=[];
  for(let i=0;i<=n;i++){
    const t=i/n, bow=amp*Math.sin(Math.PI*t);
    out.push(round(x0+dx*t-dy/len*bow),round(y0+dy*t+dx/len*bow));
  }
  return out;
}

export function markerPoints(points,id) {
  if(!Array.isArray(points)||points.length<4) return points;
  // The renderer rounds sparse five-point rectangles into ovals.
  // Give their corners closely spaced samples, without changing their bounds.
  const rect=points.length===10&&points[0]===points[8]&&points[1]===points[9]&&
    [0,2,4,6].every(i=>points[i]===points[i+2]||points[i+1]===points[i+3]);
  if(rect) {
    const out=[];
    for(let i=0;i<8;i+=2) {
      const x=points[i],y=points[i+1],X=points[i+2],Y=points[i+3];
      const len=Math.hypot(X-x,Y-y), n=Math.max(2,Math.ceil(len/10));
      for(let j=0;j<n;j++) {
        const t=j/n;
        out.push(round(x+(X-x)*t),round(y+(Y-y)*t));
      }
    }
    return [...out,points[0],points[1]];
  }
  // Only adjust essentially straight strokes. Keep intentional curves/icons.
  const x0=points[0],y0=points[1],x1=points.at(-2),y1=points.at(-1);
  const dx=x1-x0,dy=y1-y0,len=Math.hypot(dx,dy);
  if(len<40) return points;
  const dev=Math.max(...points.filter((_,i)=>i%2===0).map((x,i)=>Math.abs((x-x0)*dy-(points[i*2+1]-y0)*dx)/len));
  return dev<=Math.min(6,len*.045)?linePoints(x0,y0,x1,y1,id):points;
}
export function markerElement(element,id) {
  const e={...element};
  if(e.type!=='stroke'&&e.type!=='text') return e;
  const secondary=/(?:_frame_|_div|_desc|_note|_subtitle|_strike|^board_subtitle)/.test(id);
  if(e.color) e.color=markerInk(e.color,{secondary});
  if(e.type==='stroke'){
    const xs=e.points.filter((_,i)=>i%2===0),ys=e.points.filter((_,i)=>i%2===1);
    const span=Math.max(Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys));
    e.points=markerPoints(e.points,id);
    e.width=secondary?1.8:span>=180?3.4:span>=45?2.7:2.2;
  }
  return e;
}
export function applyMarkerSketch(board,{write=false}={}) {
  const dir=join(board,'db','elements');
  let changed=0;
  for(const file of readdirSync(dir).filter(f=>f.endsWith('.json'))){
    const path=join(dir,file), original=JSON.parse(readFileSync(path,'utf8'));
    const updated=markerElement(original,file.slice(0,-5));
    if(JSON.stringify(original)===JSON.stringify(updated)) continue;
    changed++;
    if(write)writeFileSync(path,JSON.stringify(updated)+'\n');
  }
  return changed;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  const board=resolve(process.argv[2]??'docs/releases/v0.1.0/sketch');
  const write=process.argv.includes('--write');
  console.log('Marker sketch: '+applyMarkerSketch(board,{write})+' elements '+(write?'updated':'would change'));
}
