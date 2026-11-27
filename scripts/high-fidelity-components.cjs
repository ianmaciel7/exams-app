/* Native High-Fidelity board source; geometry is a proposal, not production UI. */
function build(){
 const elements={}, groups=[];let originX=0,originY=0;
 const spec={desktop:{sidebar:272,rail:64,inset:40,maxContent:740,optionPitch:32},compact:{min:768,sidebar:240,inset:24},phone:{max:767,inset:20,optionPitch:44,drawerMax:304,drawerRemainder:56},control:{radio:18,actionWidth:112,actionHeight:44,focusOffset:5,railTarget:44,railGlyph:20},surfaceRadius:{shell:0,control:6,overlay:12},type:{question:"16/24 semibold",stem:"16/24 regular",option:"16/24 regular",feedback:"14/20 regular",navigation:"14/20 medium",button:"14/20 medium"},spacing:{titleToStem:30,questionGap:24,optionIndent:28,actionGap:8}};
 const paper="#ffffff",nav="#f1f1f1",ink="#262626",muted="#626262",sel="#d8d8d8",line="#dddddd";
 const put=(id,e)=>{if(elements[id])throw Error("duplicate "+id);elements[id]=e;};
 const T=(id,x,y,text,size="body",color=ink,wrap)=>put(id,{type:"text",x:originX+x,y:originY+y,text,size,color,...(wrap?{wrap}:{})});
 const R=(id,x,y,w,h,color,kind="rect",text="",more={})=>put(id,{type:"shape",kind,x:originX+x,y:originY+y,w,h,color,text,...more});
 const V=(id,x,y,w,h,body)=>put(id,{type:"image",x:originX+x,y:originY+y,w,h,src:"data:image/svg+xml,"+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${body}</svg>`),by:"agent"});
 const N=(id,x,y,w,h,text)=>put(id,{type:"note",x:originX+x,y:originY+y,w,h,color:"yellow",text});
 const group=(id,x,y,w,h,title,draw)=>{originX=x;originY=y;groups.push({id,x,y,w,h});T(id+"_heading",0,0,title,"large","ink");draw();};
 const shellSurface=(id,x,y,w,h,color)=>V(id,x,y,w,h,`<rect width="${w}" height="${h}" fill="${color}"/>`);
 const shellOutline=(id,x,y,w,h,stroke="#777777",fill="none")=>V(id,x,y,w,h,`<rect x="0.5" y="0.5" width="${w-1}" height="${h-1}" fill="${fill}" stroke="${stroke}" stroke-width="1"/>`);
 const drawerSheet=(id,x,y,w,h,color)=>V(id,x,y,w,h,`<path d="M 0 0 L ${w-12} 0 A 12 12 0 0 1 ${w} 12 L ${w} ${h-12} A 12 12 0 0 1 ${w-12} ${h} L 0 ${h} Z" fill="${color}"/>`);
 const glyph=(kind)=>{
  if(kind==="panel-expand")return '<rect x="2" y="3" width="16" height="14" rx="2" fill="none" stroke="#464646" stroke-width="1.5"/><path d="M7 3V17M11 8L14 10L11 12" fill="none" stroke="#464646" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>';
  if(kind==="panel-collapse")return '<rect x="2" y="3" width="16" height="14" rx="2" fill="none" stroke="#464646" stroke-width="1.5"/><path d="M7 3V17M14 8L11 10L14 12" fill="none" stroke="#464646" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>';
  if(kind==="drawer-close")return '<path d="M5 5L15 15M15 5L5 15" fill="none" stroke="#464646" stroke-width="1.8" stroke-linecap="round"/>';
  if(kind==="comp0")return '<rect x="3" y="3" width="14" height="14" rx="2" fill="none" stroke="#464646" stroke-width="1.4"/><path d="M3.5 7H16.5M6 10.5H14M6 13.5H11" stroke="#464646" stroke-width="1.4" stroke-linecap="round"/>';
  if(kind==="comp1")return '<rect x="3" y="3" width="14" height="14" rx="2" fill="none" stroke="#464646" stroke-width="1.4"/><rect x="5.8" y="6.2" width="2.2" height="2.2" rx="0.5" fill="#464646"/><path d="M10 7.3H14M5.8 11.8H8M10 11.8H14" stroke="#464646" stroke-width="1.4" stroke-linecap="round"/>';
  return '<rect x="3" y="3" width="14" height="14" rx="2" fill="none" stroke="#464646" stroke-width="1.4"/><path d="M6 7H14M6 11H13" stroke="#464646" stroke-width="1.4" stroke-linecap="round"/>';
 };
 const icon=(id,x,y,kind)=>V(id,x,y,20,20,glyph(kind));
 // Neutral grayscale provisional stepped-page mark (identity approval pending #10).
 const brandMark=(id,x,y)=>V(id,x,y,20,20,'<rect width="20" height="20" rx="4" fill="#464646"/><path d="M5.5 5H14.5M5.5 5V15H14.5V11.8H10.1M8.3 8.4H14.5" fill="none" stroke="#ffffff" stroke-width="1.6" stroke-linecap="square" stroke-linejoin="round"/>');
 const brandHeader=(id,x,y)=>{brandMark(id+"_brand",x,y);T(id,x+28,y,"**Exam App**");};
 const radio=(id,x,y,checked=false)=>{R(id,x,y,spec.control.radio,spec.control.radio,paper,"ellipse","",{hollow:true,stroke:"#555555",solid:true});if(checked)R(id+"_dot",x+5,y+5,8,8,"#333333","ellipse");};
 const button=(id,x,y,label="Answer",state="default",w=spec.control.actionWidth,h=spec.control.actionHeight)=>R(id,x,y,w,h,({default:"#333333",hover:"#262626",pressed:"#191919",disabled:"#f4f4f4",pending:"#eeeeee",focus:"#333333"})[state],"rounded",label,{size:"small",ink:["disabled","pending"].includes(state)?muted:paper});
 const focus=(id,x,y,w,h)=>V(id,x-5,y-5,w+10,h+10,`<rect x="1" y="1" width="${w+8}" height="${h+8}" rx="9" fill="none" stroke="#666666" stroke-width="2"/>`);
 const linesFor=(text,maxW,charW=9.6)=>{let total=0;for(const para of String(text).replace(/\*\*/g,"").split("\n")){const words=para.split(/\s+/).filter(Boolean);if(!words.length){total++;continue;}let lineLen=0,lines=1;for(const word of words){const wl=word.length*charW;if(lineLen>0&&lineLen+charW+wl>maxW){lines++;lineLen=wl;}else lineLen=lineLen===0?wl:lineLen+charW+wl;}total+=lines;}return Math.max(1,total);};
 const q1=["POST","GET","PATCH","CONNECT","None of the above"],q2=["ORDER BY","HAVING","WHERE","GROUP BY","LIMIT"],q3=["Queue","Stack","Linked list","Tree","Graph"];
 function q(id,x,y,w,num,mode="unanswered",mobile=false,pt=false,limit=5){
  const title=pt?"Questão":"Question";
  const stem=["Which HTTP method is defined as safe and idempotent?","Which SQL clause filters rows before grouping?","Which data structure follows last-in, first-out order?"][num-1];
  const options=[q1,q2,q3][num-1], rh=mobile?spec.phone.optionPitch:spec.desktop.optionPitch;
  const evaluated=["wrong","correct"].includes(mode), correct=num===1?1:num===2?2:1;
  const chosen=mode==="wrong"?2:mode==="unanswered"?-1:correct;
  T(id+"_title",x,y,`**${title} ${num}**`);
  T(id+"_stem",x,y+spec.spacing.titleToStem,stem,"body",ink,w);
  const stemLines=linesFor(stem,w,9.6);
  let yy=y+spec.spacing.titleToStem+stemLines*24+14;
  const optW=w-spec.spacing.optionIndent-4;
  const groupRadios=mode==="unanswered"&&(id.endsWith("_q2")||id.endsWith("_q3"));
  const radioYs=[];
  for(let k=0;k<limit;k++){
   const important=evaluated&&(k===chosen||k===correct);
   const optText=`${String.fromCharCode(65+k)}. ${options[k]}`;
   const optLines=linesFor(optText,optW,9.6);
   if(groupRadios)radioYs.push(yy);
   else radio(id+"_radio"+k,x,yy,k===chosen);
   T(id+"_option"+k,x+spec.spacing.optionIndent,yy-1,optText,"body",evaluated&&!important?muted:ink,optW);
   const textEnd=yy+optLines*24;
   let extra=0;
   if(evaluated&&k===correct){T(id+"_correct",x+spec.spacing.optionIndent,textEnd+2,pt?"Correta":"Correct","small",ink,optW);extra=26;}
   else if(mode==="wrong"&&k===chosen){T(id+"_wrong",x+spec.spacing.optionIndent,textEnd+2,pt?"Sua resposta":"Your answer","small",ink,optW);extra=26;}
   yy+=Math.max(rh,optLines*24+8+extra);
  }
  if(groupRadios&&radioYs.length){const y0=radioYs[0],rhTot=radioYs[radioYs.length-1]-y0+spec.control.radio;V(id+"_radios",x,y0,spec.control.radio,rhTot,radioYs.map((ry)=>`<circle cx="9" cy="${(ry-y0)+9}" r="8" fill="#ffffff" stroke="#555555" stroke-width="1.8"/>`).join(""));}
  if(limit<5)return yy;
  const ay=yy+spec.spacing.actionGap;
  if(evaluated){T(id+"_result",x,ay+4,mode==="wrong"?(pt?"**Resposta incorreta**":"**Incorrect answer**"):(pt?"**Resposta correta**":"**Correct answer**"),"body",ink,w<360?w:184);
   T(id+"_locked",x+(w<360?0:192),ay+(w<360?30:6),pt?"Resposta bloqueada":"Answer locked","small",muted,w-(w<360?0:192));}
  else {button(id+"_answer",x,ay,mode==="pending"?(pt?"Enviando…":"Submitting…"):pt?"Responder":"Answer",mode==="unanswered"?"disabled":mode==="pending"?"pending":"default");
   if(mode==="recovery")T(id+"_error",x,ay+56,pt?"Resposta não confirmada. Tente novamente.":"Answer not confirmed. Try again.","small",ink,w);}
  return ay+(mode==="recovery"?88:evaluated&&w>=360?38:60);
 }
 function sidebar(id,x,y,w,h,collapsed=false,state="normal"){
  shellSurface(id+"_sidebar",x,y,w,h,nav);
  if(collapsed)brandMark(id+"_brand",x+22,y+20);
  else {brandHeader(id+"_app",x+20,y+20);icon(id+"_toggle",x+w-38,y+20,"panel-collapse");}
  if(state==="empty"){T(id+"_empty",x+20,y+76,"No competitions available","small",muted,w-40);return}
  if(state==="failure"){T(id+"_error",x+20,y+76,"Could not load competitions.","small",ink,w-40);button(id+"_retry",x+20,y+128,"Retry");return}
  if(state==="loading"){for(let i=0;i<2;i++){const yy=y+68+i*48;R(id+"_sk_icon"+i,x+20,yy+13,18,18,line,"rounded");R(id+"_sk_label"+i,x+52,yy+16,w-76,12,line,"rounded")}return}
  for(let k=0;k<2;k++){let yy=y+68+k*48;if(k===0)R(id+"_nav_sel",x+8,yy,w-16,44,sel,"rounded");icon(id+"_nav"+k,x+(collapsed?22:20),yy+12,"comp"+k);if(!collapsed)T(id+"_label"+k,x+52,yy+11,k===0?(w<250?"**DATAPREV** · 2026…":"**DATAPREV** · 2026 · Anal…"):(w<250?"PPSA · 2025…":"PPSA · 2025 · Analyst…"),"small",ink,w-60);}
 }
 function scrollbar(id,x,y,w,h,thumbH){
  const r=w/2;
  V(id+"_scroll",x,y,w,h,`<rect width="${w}" height="${h}" rx="${r}" fill="#e5e5e5"/><rect width="${w}" height="${thumbH}" rx="${r}" fill="#999999"/>`);
 }
 function desktop(id,x,y,w,h,collapsed=false,mode="wrong"){
  const sw=collapsed?spec.desktop.rail:spec.desktop.sidebar;shellSurface(id+"_frame",x,y,w,h,paper);sidebar(id,x,y,sw,h,collapsed);const main=x+sw+spec.desktop.inset,cw=Math.min(spec.desktop.maxContent,w-sw-2*spec.desktop.inset);const bottom=q(id+"_q",main,y+30,cw,1,mode);const tail=q(id+"_q2",main,bottom+spec.spacing.questionGap,cw,2,"unanswered");const third=tail+spec.spacing.questionGap;const thirdLimit=Math.min(4,Math.max(0,Math.floor((y+h-24-third-68)/32)));if(thirdLimit>0)q(id+"_q3",main,third,cw,3,"unanswered",false,false,thirdLimit);
  scrollbar(id,x+w-12,y+20,5,h-40,144);
 }
 // Identical closed/open viewport: draw the same content with precomposited neutral colors in the overlay.
 function phone(id,x,y,w,open=false,pt=true){
  const start=Object.keys(elements).length;const h=800,margin=spec.phone.inset,cw=w-margin*2;
  shellSurface(id+"_frame",x,y,w,h,paper);icon(id+"_toggle",x+20,y+20,"panel-expand");brandHeader(id+"_app",x+56,y+20);T(id+"_context",x+20,y+70,"DATAPREV · 2026 · Analyst…","small",muted,cw);
  const firstEnd=q(id+"_q",x+margin,y+112,cw,1,"selected",true,pt);
  const second=firstEnd+20;const stemSpace=linesFor("Which SQL clause filters rows before grouping?",cw,9.6)*24+44;
  const visible=Math.min(4,Math.max(0,Math.floor((y+h-20-second-stemSpace)/44)));
  q(id+"_q2",x+margin,second,cw,2,"unanswered",true,pt,visible);
  scrollbar(id,x+w-8,y+102,3,h-118,100);
  if(open){
   const dims=c=>typeof c==="string"&&/^#[0-9a-f]{6}$/i.test(c)?"#"+[1,3,5].map(i=>Math.round(parseInt(c.slice(i,i+2),16)*.74).toString(16).padStart(2,"0")).join(""):c;
   for(const k of Object.keys(elements).slice(start)){const e=elements[k];for(const p of ["color","ink","stroke"])if(e[p])e[p]=dims(e[p]);if(e.type==="image"){e.src="data:image/svg+xml,"+encodeURIComponent(decodeURIComponent(e.src.split(",").slice(1).join(",")).replace(/#[0-9a-f]{6}/gi,dims));}}
   const dw=Math.min(spec.phone.drawerMax,w-spec.phone.drawerRemainder);drawerSheet(id+"_drawer",x,y,dw,h,nav);brandHeader(id+"_drawer_title",x+56,y+20);icon(id+"_drawer_toggle",x+20,y+20,"drawer-close");
   for(let k=0;k<2;k++){let yy=y+72+k*80;if(k===0)R(id+"_nav_sel",x+8,yy,dw-16,68,sel,"rounded");icon(id+"_nav"+k,x+20,yy+20,"comp"+k);T(id+"_nav_label"+k,x+52,yy+10,k===0?"**DATAPREV** · 2026\nAnalyst":"PPSA · 2025\nAnalyst","body",ink,dw-64);}
   T(id+"_discard_warning",x+20,y+244,pt?"Trocar de concurso apaga as respostas desta página.":"Changing competitions clears answers on this page.","small",ink,dw-40);
  }
 }
 function statePanel(id,x,y,w,h,title,kind,navState="normal"){
  T(id+"_caption",x,y-30,title,"small","ink");shellSurface(id+"_frame",x,y,w,h,paper);sidebar(id,x,y,224,h,false,navState);
  const mx=x+248,cw=w-272;
  if(kind==="loading"){
   R(id+"_heading0",mx,y+28,116,16,line,"rounded");
   let q1Body=`<rect x="0" y="0" width="${Math.min(cw,420)}" height="12" rx="4" fill="${line}"/><rect x="0" y="22" width="${Math.min(cw,280)}" height="12" rx="4" fill="${line}"/>`;
   const optWidths=[110,96,120,136,192];
   for(let k=0;k<5;k++){const oy=58+k*32;q1Body+=`<circle cx="9" cy="${oy+9}" r="8" fill="none" stroke="${line}" stroke-width="2"/><rect x="28" y="${oy+3}" width="${Math.min(cw-32,optWidths[k])}" height="12" rx="4" fill="${line}"/>`;}
   V(id+"_s0",mx,y+58,cw,214,q1Body);
   R(id+"_sk_button0",mx,y+284,spec.control.actionWidth,spec.control.actionHeight,line,"rounded");
   R(id+"_heading1",mx,y+352,116,16,line,"rounded");
   V(id+"_s1",mx,y+380,cw,14,`<rect x="0" y="0" width="${Math.min(cw,380)}" height="12" rx="4" fill="${line}"/>`);
  }
  else{const labels={empty:"No questions available",failure:"Could not load questions",navempty:"No competitions available",navloading:"Loading competitions…",navfailure:"Retry from the sidebar to continue."};T(id+"_status",mx,y+110,labels[kind],"body",ink,cw);if(kind==="failure")button(id+"_retry",mx,y+156,"Retry");}
 }
 const pageFooter=(id,x,y,w,current,mobile=false)=>{const gap=mobile?12:10;const bw=mobile?44:96;
  const prev=current===1,next=current===5;
  if(mobile){button(id+"_prev",x+16,y,"‹",prev?"disabled":"default",44);T(id+"_current",x+70,y+12,`Page ${current} of 5`,"body",ink,w-140);button(id+"_next",x+w-60,y,"›",next?"disabled":"default",44);}
  else{const total=2*bw+5*44+6*gap;let xx=x+(w-total)/2;button(id+"_prev",xx,y,"‹ Previous",prev?"disabled":"default",bw);xx+=bw+gap;for(let i=1;i<=5;i++){const cur=i===current;R(id+"_page"+i,xx,y,44,44,cur?sel:paper,"rounded",cur?`**${i}**`:String(i),{size:"small",ink,...(cur?{stroke:"#555555",solid:true}:{stroke:"#cccccc",solid:true})});xx+=44+gap;}button(id+"_next",xx,y,"Next ›",next?"disabled":"default",bw);}
 };
 group("desktop",0,0,1320,1080,"01 · Desktop · 1280 × 900 · Incorrect evaluation",()=>{desktop("desktop",0,48,1280,900,false,"wrong");N("desktop_note",0,968,1280,90,"Flush square App Shell surfaces with zero unintended borders/radii. Two complete questions and visible Q3 start. Below-option feedback with hanging alignment prevents collisions. 32-unit desktop option rhythm; no dividers.");});
 group("collapsed",1400,0,1064,1080,"02 · Desktop · 1024 × 900 · Selected",()=>{desktop("collapsed",0,48,1024,900,true,"selected");N("collapsed_note",0,968,1024,90,"64-unit square rail. Rest shows only the compact provisional Exam App mark on the shared header axis; hover/focus swaps the expand glyph into the exact same 44 × 44 slot (see Section 08). Touch/no-hover keeps the expand glyph visible.");});
 group("phone",2540,0,1720,1080,"03 · Phone · 390 (pt-BR & en) / 320 · Closed / open",()=>{
  T("phone_caption",0,36,"390 · pt-BR · closed","small","ink");T("drawer_caption",430,36,"390 · pt-BR · same workspace / open","small","ink");T("phone_en_caption",860,36,"390 · en · closed (identical width)","small","ink");T("phone320_caption",1290,36,"320 · en · closed","small","ink");
  phone("phone",0,76,390,false,true);phone("drawer",430,76,390,true,true);phone("phone_en",860,76,390,false,false);phone("phone320",1290,76,320,false,false);
  N("phone_note",0,900,1610,150,"Phone gutter 20; 44-unit option and action rhythm; drawer min(304, width − 56) with flush left edge and rounded inner edge. EN and pt-BR are compared at identical 390 width plus 320 minimum width. Open/close triggers occupy identical coordinates with distinct contextual glyphs.");
 });
 group("continuation",0,1160,1320,1120,"04 · Phone continuation, pagination boundaries and control states",()=>{
  shellSurface("continuation_frame",0,48,390,800,paper);T("continuation_caption",20,64,"Scrolled · Questão 2","small",muted);q("continuation_q",20,104,350,2,"unanswered",true,true);T("continuation_end",20,640,"End of question list · illustrative final item","small",muted,350);pageFooter("continuation_footer",0,690,390,5,true);
  for(let k=0;k<3;k++){let yy=80+k*118;T("pagination_caption"+k,450,yy,["First page","Middle page","Last page"][k],"body","ink");R("pagination_surface"+k,450,yy+30,840,72,paper);pageFooter("pagination"+k,450,yy+44,840,[1,3,5][k]);}
  for(let k=0;k<3;k++){let yy=446+k*102;T("mobile_footer_caption"+k,450,yy,["Phone · first","Phone · middle","Phone · last"][k],"small","ink");R("mobile_footer_surface"+k,450,yy+26,350,62,paper);pageFooter("mobile_footer"+k,450,yy+35,350,[1,3,5][k],true);}
  T("pagination_single_caption",850,446,"Single page · no pagination","small",ink);R("pagination_single_surface",850,472,440,62,paper);T("pagination_single_end",866,491,"End of question list","small",muted);
  T("pagination_risk_caption",850,554,"Multiple pages · answers at risk","small",ink);R("pagination_risk_surface",850,580,440,112,paper);T("pagination_risk_warning",866,590,"Changing pages clears answers on this page.","small",ink,408);pageFooter("pagination_risk",850,632,440,3,true);
  T("pagination_states_caption",450,764,"Pagination control states · enabled, current & disabled","small",ink);R("pagination_states_surface",450,790,840,126,paper);
  const pStates=[["rest","Rest",paper,ink,"2","#cccccc"],["hover","Hover","#e4e4e4",ink,"2","#cccccc"],["pressed","Pressed","#d4d4d4",ink,"**2**","#999999"],["focus","Focus",paper,ink,"2","#cccccc"],["current","Current",sel,ink,"**3**","#555555"],["disabled","Disabled","#f4f4f4",muted,"‹ Prev",null]];
  for(const [i,[key,lbl,bg,fg,txt,bd]] of pStates.entries()){const px=474+i*134,pw=key==="disabled"?76:44;T("pagination_state_"+key+"_cap",px,806,lbl,"small",muted);if(key==="focus")focus("pagination_state_focus_ring",px,842,pw,44);R("pagination_state_"+key,px,842,pw,44,bg,"rounded",txt,{size:"small",ink:fg,...(bd?{stroke:bd,solid:true}:{})});}
  N("pagination_note",450,940,840,130,"Ten questions per page in original exam order. Hide pagination for a single page. Disable unavailable boundary controls and reset scroll on page change. Show the inline warning near navigation only when answers would be discarded. Current page uses bold label + fill + border (not color alone).");
 });
 group("lifecycle",1400,1160,1560,1120,"05 · Question and navigation lifecycle",()=>{
  statePanel("question_loading",0,80,740,400,"Question list · loading","loading");statePanel("question_empty",780,80,740,400,"Question list · empty","empty");
  statePanel("question_failure",0,540,740,400,"Question list · error","failure");statePanel("navigation_empty",780,540,740,400,"Competition list · empty","navempty","empty");
  N("lifecycle_note",0,968,1520,90,"Loading skeleton mirrors question heading, stem, 5-option 32-pitch rhythm, and 112 × 44 Answer footprint. Question Retry reloads the selected competition only. Empty competition list has no action.");
 });
 group("navigation",3040,1160,1520,1120,"06 · Competition loading / recovery, compact 768 & desktop warning",()=>{
  statePanel("navigation_loading",0,80,630,340,"Competition list · loading","navloading","loading");statePanel("navigation_failure",660,80,630,340,"Competition list · failure","navfailure","failure");
  T("narrow_caption",0,450,"768 · compact expanded navigation · structural sample (proposal)","small","ink");shellSurface("narrow_frame",0,484,768,388,paper);sidebar("narrow",0,484,240,388);q("narrow_q",264,508,480,1,"unanswered");
  T("desktop_risk_caption",920,450,"Desktop · sidebar · answers at risk (nonmodal warning)","small","ink");shellSurface("desktop_risk_frame",920,484,560,388,paper);sidebar("desktop_risk",920,484,272,388);
  R("desktop_risk_warning_box",932,664,248,68,paper,"rounded","",{stroke:"#777777",solid:true});T("desktop_risk_warning",944,676,"Changing competitions clears answers on this page.","small",ink,224);
  T("desktop_risk_context",1220,520,"Q1 has selected or evaluated answer.\n\nNo warning appears when no answers are at risk.","small",muted,232);
  N("narrow_note",0,910,1480,120,"768 compact specimen (240 sidebar + 24 inset + 480 content) remains a wireframe proposal aligned with the 1024 CSS px initial prototype test threshold. Desktop nonmodal answer-loss warning appears near competition navigation only when selected or evaluated answers would be discarded.");
 });
 group("feedback",0,2360,1560,760,"07 · Answer lifecycle and long-content feedback",()=>{
  const modes=["correct","pending","recovery"];for(let k=0;k<3;k++){const x=k*510;T("feedback_caption"+k,x,44,["Correct · locked","Submitting · pending","Unknown outcome · safe retry"][k],"small","ink");R("feedback_surface"+k,x,76,490,520,paper);q("feedback_"+modes[k],x+24,100,442,1,modes[k]);}
  N("feedback_note",0,620,1510,110,"Correct / Your answer stack below option text at hanging indent so feedback never collides with options. Retain the selected option when outcome is not confirmed. Retry through Answer with identical 112 × 44 footprint; prohibit duplicate evaluation while pending.");
 });
 group("controls",1640,2360,1560,860,"08 · Control anatomy, rail swap, nav states and label discovery",()=>{
  R("control_surface",0,48,1520,230,paper);const states=["default","hover","pressed","focus","disabled","pending"];
  for(let k=0;k<states.length;k++){const x=24+k*246;T("control_caption"+k,x,72,states[k],"small",muted);if(states[k]==="focus")focus("control_focus_ring",x,104,112,44);button("control_"+states[k],x,104,states[k]==="pending"?"Submitting…":"Answer",states[k]);if(states[k]==="focus")focus("retry_focus_ring",x,180,112,44);button("retry_"+states[k],x,180,states[k]==="pending"?"Retrying…":"Retry",states[k]);}
  const railCols=[["Rest","rest"],["Hover","hover"],["Focus","focus"],["No hover","nohover"],["Pressed","pressed"]];
  for(let k=0;k<railCols.length;k++){
   const x=k*104,[lbl,mode]=railCols[k];T("rail_caption"+k,x,310,lbl,"small","ink");shellSurface("rail"+k,x,344,64,248,nav);
   if(mode==="rest")brandMark("rail_brand"+k,x+22,364);
   else{
    if(mode==="hover")R("rail_hover",x+10,352,44,44,"#e4e4e4","rounded");
    if(mode==="pressed")R("rail_pressed",x+10,352,44,44,"#d4d4d4","rounded");
    if(mode==="focus")focus("rail_focus",x+10,352,44,44);
    icon("rail_toggle"+k,x+22,364,"panel-expand");
   }
   R("rail_selection"+k,x+8,412,48,44,sel,"rounded");icon("rail_icon"+k,x+22,424,"comp0");icon("rail_icon_b"+k,x+22,472,"comp1");
  }
  T("rail_caption5",520,310,"Expanded","small","ink");shellSurface("rail5",520,344,140,248,nav);brandMark("rail_exp_brand",532,364);T("rail_exp_title",558,364,"**Exam**","small",ink);icon("rail_exp_toggle",630,364,"panel-collapse");R("rail_exp_sel",528,412,124,44,sel,"rounded");icon("rail_exp_icon0",538,424,"comp0");T("rail_exp_lbl0",564,424,"DATAPREV…","small",ink);
  R("tooltip_surface",688,344,832,248,paper);T("tooltip_caption",708,364,"Desktop · full-label & rail action tooltips","body");
  R("tooltip_row",708,402,240,44,sel,"rounded");icon("tooltip_icon",722,414,"comp0");T("tooltip_truncated",754,413,"DATAPREV · 2026 · Anal…","small",ink,184);
  R("tooltip_bubble",962,398,278,50,"#333333","rounded");T("tooltip_full",976,412,"DATAPREV · 2026 · Analyst","small",paper,254);
  R("action_tip_target",708,478,44,44,"#e4e4e4","rounded");icon("action_tip_icon",720,490,"panel-expand");
  R("action_tip_bubble",766,478,220,44,"#333333","rounded");T("action_tip_text",782,490,"Expand sidebar","small",paper,190);
  T("tooltip_note",708,542,"Hover/focus reveals full label & supplementary action tooltip; phone wraps instead.","small",muted,780);
  R("nav_states_surface",0,616,1520,120,paper);T("nav_states_heading",24,626,"Navigation row states · stable 44-unit target","small",ink);
  const navRows=[["rest","Rest",nav,false,false],["hover","Hover","#e4e4e4",false,false],["focus","Focus",nav,false,true],["active","Active",sel,true,false],["active_hover","Active + hover","#cccccc",true,false],["active_focus","Active + focus",sel,true,true]];
  for(const [i,[key,lbl,bg,act,foc]] of navRows.entries()){
   const rx=24+i*248,ry=674;T("nav_state_"+key+"_cap",rx,652,lbl,"small",muted);
   if(foc)focus("nav_state_"+key+"_ring",rx,ry,220,44);
   R("nav_state_"+key,rx,ry,220,44,bg,"rounded","",{...(key==="active_hover"?{stroke:"#888888",solid:true}:{})});
   icon("nav_state_"+key+"_icon",rx+12,ry+12,act?"comp0":"comp1");
   T("nav_state_"+key+"_lbl",rx+40,ry+11,act?"**DATAPREV** · 2026…":"PPSA · 2025 · Analyst…","small",ink,172);
  }
  N("controls_note",0,756,1520,90,"Collapsed rail Rest shows ONLY the compact provisional Exam App mark on the shared header axis; hover/focus/pressed swap the expand glyph into the exact same 44 × 44 slot without layout shift. Touch/no-hover shows expand directly. Distinct comp0/comp1 cues distinguish competition shortcuts.");
 });
 group("long",3280,2360,1440,860,"09 · Long content and evaluated option wrapping (1020 & 320)",()=>{
  R("long_frame",0,48,1020,664,paper);T("long_title",24,72,"**Question 1**");
  T("long_stem",24,102,"Which approach prevents duplicate records when the outcome of a previous request is unknown and the client needs to retry safely?","body",ink,970);
  const texts=["Repeat the request without checking the previous outcome.","Attach a unique operation identifier and ensure that retries with the same identifier do not create another record.","Disable all retries, even when the original request has not reached the server.","Increase the network timeout without changing how duplicate requests are handled.","Create a new record for every submission and remove duplicates manually."];
  let yy=180;for(let k=0;k<5;k++){const important=k===1||k===4;radio("long_radio"+k,24,yy,k===4);
   T("long_letter"+k,52,yy-1,String.fromCharCode(65+k)+".","body",important?ink:muted);
   T("long_option"+k,76,yy-1,texts[k],"body",important?ink:muted,900);
   const lines=linesFor(texts[k],900,9.6);const contentEnd=yy+lines*24;
   if(important)T("long_feedback"+k,76,contentEnd+4,k===1?"Correct":"Your answer","small",ink,900);
   yy=contentEnd+(important?42:14);
  }
  T("long_result",24,yy+12,"**Incorrect answer**","body",ink,184);T("long_locked",216,yy+14,"Answer locked","small",muted,760);
  shellSurface("long320_frame",1060,48,320,664,paper);T("long320_caption",1060,24,"320 · constrained width · zero collision","small",ink);
  T("long320_title",1080,68,"**Question 1**");
  const s320="Which approach prevents duplicate records on retry?";T("long320_stem",1080,98,s320,"body",ink,280);
  let y3=98+linesFor(s320,280,9.6)*24+14;const y3Start=y3,r3Ys=[];
  const t320=["Repeat without checking.","Attach unique operation ID to prevent duplicates.","Disable all retries.","Increase timeout only.","Create duplicate and clean manually."];
  for(let k=0;k<5;k++){const imp=k===1||k===4,txt=`${String.fromCharCode(65+k)}. ${t320[k]}`,ln=linesFor(txt,248,9.6);r3Ys.push(y3-y3Start);T("long320_o"+k,1108,y3-1,txt,"body",imp?ink:muted,248);const ce=y3+ln*24;if(imp)T("long320_f"+k,1108,ce+2,k===1?"Correct":"Your answer","small",ink,248);y3=ce+(imp?32:10);}
  V("long320_radios",1080,y3Start,18,r3Ys[4]+18,r3Ys.map((ry,k)=>`<circle cx="9" cy="${ry+9}" r="8" fill="#ffffff" stroke="#555555" stroke-width="1.8"/>${k===4?`<circle cx="9" cy="${ry+9}" r="4" fill="#333333"/>`:""}`).join(""));
  T("long320_result",1080,y3+8,"**Incorrect answer**","body",ink,280);T("long320_locked",1080,y3+34,"Answer locked","small",muted,280);
  N("long_note",0,738,1380,100,"All five approved alternatives with hanging indent and discrete below-option feedback. Both 1020 desktop and 320 phone widths prevent Correct / Your answer / Answer locked collisions with wrapped stems and options.");
 });

 const dim=(id,x1,y1,x2,y2,label,labelOffset=-24)=>{const red="#a63232",h=y1===y2;
  if(h){const x=Math.min(x1,x2),w=Math.abs(x2-x1);V(id+"_rule",x,y1-5,w,10,`<path d="M0.5 5H${w-0.5}M0.5 0V10M${w-0.5} 0V10" fill="none" stroke="${red}" stroke-width="1"/>`);T(id+"_label",x+Math.max(0,(w-64)/2),y1+labelOffset,label,"small",red);}
  else{const y=Math.min(y1,y2),hgt=Math.abs(y2-y1);V(id+"_rule",x1-5,y,10,hgt,`<path d="M5 0.5V${hgt-0.5}M0 0.5H10M0 ${hgt-0.5}H10" fill="none" stroke="${red}" stroke-width="1"/>`);T(id+"_label",x1+12,y+Math.max(0,(hgt-18)/2),label,"small",red);}
 };
 group("redlines",0,3340,1510,1130,"10 · Workspace redlines · canvas units",()=>{
  R("redline_plate",0,50,1470,950,paper);
  shellSurface("redline_desktop",90,180,1280,500,paper);shellSurface("redline_sidebar",90,180,272,500,nav);
  shellOutline("redline_outline",90,180,1280,500,"#777777");
  brandHeader("redline_app",110,200);icon("redline_toggle",322,200,"panel-collapse");
  R("redline_nav",102,248,248,44,sel,"rounded");T("redline_nav_text",126,259,"DATAPREV · 2026 · Analyst…","small",ink,208);
  q("redline_q",402,215,740,1,"selected");
  dim("measure_viewport",90,112,1370,112,"1280");dim("measure_sidebar",90,153,362,153,"272");dim("measure_content",402,153,1142,153,"max 740");
  dim("measure_inset",362,710,402,710,"40");dim("measure_title",1180,215,1180,245,"30");dim("measure_pitch",1180,283,1180,315,"32");
  dim("measure_button",402,530,514,530,"112");dim("measure_button_h",542,451,542,495,"44");
  T("redline_note1",90,760,"Horizontal: 272 sidebar + 40 inset; content capped at 740; remaining width flexible. App Shell seams square (0 provisional radius).","body",ink,1250);
  T("redline_note2",90,810,"Question: title → stem offset 30; option pitch 32; glyph 18; action 112 × 44.","body",ink,1250);
  T("redline_note3",90,860,"At constrained widths reserve wrapping space; implementation measures actual text height.","body",ink,1250);
  N("redlines_note",0,1020,1470,90,"Proposed structural dimensions. Annotation plate stays separate from the interface. Viewport height in this study is illustrative.");
 });
 group("anatomy",1580,3340,1500,1510,"11 · Component anatomy · reading order and type hierarchy",()=>{
  R("anatomy_plate",0,50,1460,990,paper);T("anatomy_question_caption",36,78,"Question anatomy","large",ink);const qEnd=q("anatomy_q",36,128,620,1,"wrong");
  const label=(id,y,value)=>T(id,742,y,value,"body",ink,650);
  V("anatomy_leaders",690,138,36,qEnd-138,`<path d="M0 0H36M0 30H36M0 67H36M0 103H36M0 155H36M0 ${qEnd-166}H36" fill="none" stroke="#a63232" stroke-width="1.5"/>`);
  label("anatomy_label_title",128,"01 · Question heading — 16/24 semibold target");label("anatomy_label_stem",158,"02 · Stem — 16/24 regular; wrap at content width");label("anatomy_label_radio",195,"03 · Radio glyph 18; full option row is the target");
  label("anatomy_label_option",231,"04 · Option text — 16/24; indent 28");label("anatomy_label_status",283,"05 · Correct / Your answer — 14/20 below option; not color alone");label("anatomy_label_result",qEnd-38,"06 · Result and lock replace action");
  const ry=qEnd+20;
  R("anatomy_rule",36,ry,1388,1,"#cccccc");T("anatomy_controls_caption",36,ry+26,"Answer / Retry / radio / navigation","large",ink);
  const by=ry+88;
  button("anatomy_answer",56,by,"Answer");button("anatomy_disabled",216,by,"Answer","disabled");button("anatomy_pending",376,by,"Submitting…","pending");focus("anatomy_focus_outline",536,by,112,44);button("anatomy_focus",536,by,"Answer");
  dim("anatomy_action_w",56,by+54,56+spec.control.actionWidth,by+54,String(spec.control.actionWidth),8);dim("anatomy_action_h",680,by,680,by+spec.control.actionHeight,String(spec.control.actionHeight));
  T("anatomy_control_note",56,by+94,"Button label 14/20 medium; stable footprint through states.","body",ink,1300);
  R("anatomy_option_surface",56,by+128,430,72,"#f5f5f5","rounded");radio("anatomy_radio",76,by+155,true);T("anatomy_option",104,by+153,"B. GET","body",ink);
  dim("anatomy_radio_w",76,by+143,94,by+143,"18");dim("anatomy_indent",76,by+221,104,by+221,"28");
  T("anatomy_row_target",512,by+146,"Option row target: 44 on phone; 32 pitch on desktop.","body",ink,900);
  R("anatomy_nav_surface",56,by+270,430,64,nav,"rounded");R("anatomy_nav_row",68,by+280,406,44,sel,"rounded");icon("anatomy_nav_icon",80,by+292,"comp0");T("anatomy_nav_label",112,by+291,"DATAPREV · 2026 · Analyst","small",ink,340);
  T("anatomy_nav_note",512,by+289,"Navigation: icon 20; row 44; label 14/20; truncate desktop, wrap phone.","body",ink,900);
  T("anatomy_type_limit",36,by+376,"Type values are implementation targets; native board uses body/small presets. Font family and final tokens belong to Mockup.","small",muted,1360);
  N("anatomy_note",0,1060,1460,90,"Reading order: title → stem → options → action/result → next question. Keyboard order and accessible names are specifications, not tests.");
  R("option_states_plate",0,1190,1460,300,paper);
  T("option_states_heading",36,1212,"Answer options · pre-submit, evaluated locked & pending","large",ink);
  const optionStates=[
   ["rest","At rest",paper,false,false,null],
   ["hover","Hover",nav,false,false,null],
   ["focus","Keyboard focus",paper,false,true,null],
   ["selected","Selected",sel,true,false,null],
   ["selected_hover","Selected + hover","#cccccc",true,false,null],
   ["selected_focus","Selected + focus",sel,true,true,null],
   ["locked","Evaluated · locked",paper,true,false,"Correct · locked"],
   ["pending","Pending · submitting","#eeeeee",true,false,"Submitting…"],
  ];
  for(const [index,[state,labelTxt,fill,checked,focused,tag]] of optionStates.entries()){
   const col=index%4,row=Math.floor(index/4),id="option_state_"+state,x=36+col*350,y=1286+row*104,w=318,h=spec.phone.optionPitch;
   T(id+"_label",x,y-28,labelTxt,"small",muted);
   if(focused)focus(id+"_ring",x,y,w,h);
   R(id+"_row",x,y,w,h,fill,"rounded","",{...(state==="selected_hover"?{stroke:"#888888",solid:true}:{})});
   radio(id+"_radio",x+12,y+13,checked);
   T(id+"_text",x+40,y+12,"B. GET","body",state==="pending"?muted:ink);
   if(tag)T(id+"_tag",x+148,y+14,tag,"small",state==="locked"?ink:muted,160);
  }
  T("option_states_touch",36,1452,"Tap anywhere in the row to select. Submit separately with Answer. Non-color cues distinguish selection, focus, lock and pending.","body",ink,1388);
 });
 group("responsive",3160,3340,1430,1130,"12 · Responsive contract and accessibility intent",()=>{
  R("responsive_plate",0,50,1390,950,paper);T("responsive_intro",30,78,"Proposed layout ranges · 320 / 390 / 768 / 1024 / 1280 width budgets","large",ink);
  const ranges=[
   ["≥ 1024 (initial threshold)","Expanded 272 (content 672–740) or collapsed 64 (content 740)","40 inset · main pane scrolls · zero horizontal overflow","Desktop / keyboard and pointer; prototype testing starts at 1024 CSS px"],
   ["768–1023 (proposal)","Compact expanded 240 (content 480 at 768) or collapsed 64","24 inset · flexible content · main pane scrolls","Tablet proposal / validate against 1024 threshold; no-hover trigger visible"],
   ["≤ 767 (phone)","Overlay drawer min(304, w − 56) (264 at 320; 304 at 390)","20 inset · content 280–350 · closed at rest","Phone / contextual open vs close cues; preserve selection & scroll"]
  ];
  for(let i=0;i<3;i++){
   const y=140+i*150;T("responsive_range"+i,30,y,ranges[i][0],"large",ink);
   const ww=[560,448,300][i],sw=[119,105,0][i];
   shellOutline("responsive_shell"+i,30,y+36,ww,92,"#777777",paper);
   if(sw)shellSurface("responsive_sidebar"+i,30,y+36,sw,92,nav);
   else icon("responsive_phone_toggle",42,y+46,"panel-expand");
   const xx=30+sw+(sw?16:48);
   const sw1=Math.min(220,ww-sw-64),ow=Math.min(150,ww-sw-100);
   V("responsive_diagram"+i,xx,y+50,Math.max(sw1,ow+28),66,`<rect width="${sw1}" height="6" rx="3" fill="${line}"/><circle cx="9" cy="25" r="8" fill="none" stroke="#555555" stroke-width="1.5"/><rect x="28" y="22" width="${ow}" height="5" rx="2.5" fill="${line}"/><circle cx="9" cy="49" r="8" fill="none" stroke="#555555" stroke-width="1.5"/><rect x="28" y="46" width="${ow}" height="5" rx="2.5" fill="${line}"/>`);
   T("responsive_rule"+i,650,y+16,ranges[i][1]+"\n"+ranges[i][2]+"\n"+ranges[i][3],"body",ink,710);
  }
  R("responsive_access_divider",30,610,1330,1,"#cccccc");T("responsive_a11y_title",30,635,"Accessibility & overflow requirements","large",ink);
  const rows=[
   ["Keyboard","Tab through navigation and question groups; arrows select radio options; Enter/Space activates actions."],
   ["Focus","Drawer moves visible focus inside, traps focus and makes background inert; Escape or Close restores focus to trigger."],
   ["Feedback","Preserve choice during safe Retry; choosing a competition closes drawer, announces change and resets scroll on page change."],
   ["Overflow","320 / 390 / 768 / 1024 / 1280 and zoom: zero horizontal scroll; wrap stems/options; expose full truncated desktop label."],
   ["Localization","pt-BR and en interface strings tested at identical widths; question content stays in source language."]
  ];
  for(let i=0;i<rows.length;i++){const y=686+i*57;T("responsive_a11y_key"+i,30,y,"**"+rows[i][0]+"**","body",ink,162);T("responsive_a11y_val"+i,210,y,rows[i][1],"small",ink,1130);}
  N("responsive_note",0,1020,1390,90,"Widths and breakpoints are wireframe proposals. Start prototype testing at 1024 CSS px and validate 768, zoom, keyboard, screen reader, inert backdrop and focus restoration in the prototype. Static specimens do not establish accessibility conformance.");
 });

 return {elements,groups,spec};
}
module.exports=build();
