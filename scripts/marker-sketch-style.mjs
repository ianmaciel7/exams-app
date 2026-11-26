import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// Excalifont Latin subset, SIL OFL 1.1. Cache only in the ignored launcher directory.
// An offline launch retains the board and falls back to a system font.
const fontUrl='https://raw.githubusercontent.com/excalidraw/excalidraw/dabd83c4aa6b9e42d0dd0a42be62200eb8e3cce9/packages/excalidraw/fonts/Excalifont/Excalifont-Regular-a88b72a24fb54c9f94e3b5fdaa7481c9.woff2';
export async function markerSketchCss(cache){
  mkdirSync(cache,{recursive:true});
  const font=join(cache,'excalifont-latin.woff2');
  let source='';
  try{
    if(!existsSync(font)){
      const response=await fetch(fontUrl,{signal:AbortSignal.timeout(8000)});
      if(!response.ok)throw new Error('HTTP '+response.status);
      const data=Buffer.from(await response.arrayBuffer());
      if(data.length!==24956||data.subarray(0,4).toString()!=='wOF2')throw new Error('Unexpected font format or length');
      writeFileSync(font,data);
    }
    source='@font-face{font-family:ExamMarker;src:url(data:font/woff2;base64,'+readFileSync(font).toString('base64')+') format("woff2");font-display:swap;}';
  }catch(e){console.warn('Marker sketch font unavailable; using fallback: '+e.message);}
  return source+'\nhtml[data-exam-marker-sketch] .wb-text,html[data-exam-marker-sketch] .wb-text *{font-family:ExamMarker,"Comic Sans MS",system-ui,sans-serif!important;letter-spacing:-0.25px;}';
}
