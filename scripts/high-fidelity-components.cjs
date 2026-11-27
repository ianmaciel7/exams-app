/* Native High-Fidelity board source; geometry is a proposal, not production UI. */
function build(){
 const elements={}, groups=[];let originX=0,originY=0;
 const spec={desktop:{sidebar:272,rail:64,inset:40,maxContent:740,optionPitch:32},compact:{min:768,sidebar:240,inset:24},phone:{max:767,inset:20,optionPitch:44,drawerMax:304,drawerRemainder:56},control:{radio:18,actionWidth:112,actionHeight:44,focusOffset:5},type:{question:"16/24 semibold",stem:"16/24 regular",option:"16/24 regular",feedback:"14/20 regular",navigation:"14/20 medium",button:"14/20 medium"},spacing:{titleToStem:30,questionGap:24,optionIndent:28,actionGap:8}};
 const paper="#ffffff",nav="#f1f1f1",ink="#262626",muted="#626262",sel="#d8d8d8",line="#dddddd";
 const put=(id,e)=>{if(elements[id])throw Error("duplicate "+id);elements[id]=e;};
 const T=(id,x,y,text,size="body",color=ink,wrap)=>put(id,{type:"text",x:originX+x,y:originY+y,text,size,color,...(wrap?{wrap}:{})});
 const R=(id,x,y,w,h,color,kind="rect",text="",more={})=>put(id,{type:"shape",kind,x:originX+x,y:originY+y,w,h,color,text,...more});
 const V=(id,x,y,w,h,body)=>put(id,{type:"image",x:originX+x,y:originY+y,w,h,src:"data:image/svg+xml,"+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${body}</svg>`),by:"agent"});
 const N=(id,x,y,w,h,text)=>put(id,{type:"note",x:originX+x,y:originY+y,w,h,color:"yellow",text});
 const group=(id,x,y,w,h,title,draw)=>{originX=x;originY=y;groups.push({id,x,y,w,h});T(id+"_heading",0,0,title,"large","ink");draw();};
 const glyph=(kind)=>kind==="panel"?'<rect x="2" y="3" width="16" height="14" rx="2" fill="none" stroke="#464646" stroke-width="1.5"/><path d="M7 3V17" stroke="#464646" stroke-width="1.5"/>':'<rect x="3" y="3" width="14" height="14" rx="2" fill="none" stroke="#464646" stroke-width="1.4"/><path d="M6 7H14M6 11H13" stroke="#464646" stroke-width="1.4" stroke-linecap="round"/>';
 const icon=(id,x,y,kind)=>V(id,x,y,20,20,glyph(kind));
 const radio=(id,x,y,checked=false)=>{R(id,x,y,spec.control.radio,spec.control.radio,paper,"ellipse","",{hollow:true,stroke:"#555555",solid:true});if(checked)R(id+"_dot",x+5,y+5,8,8,"#333333","ellipse");};
 const button=(id,x,y,label="Answer",state="default",w=spec.control.actionWidth,h=spec.control.actionHeight)=>R(id,x,y,w,h,({default:"#333333",hover:"#262626",pressed:"#191919",disabled:"#f4f4f4",pending:"#eeeeee",focus:"#333333"})[state],"rounded",label,{size:"small",ink:["disabled","pending"].includes(state)?muted:paper});
 const focus=(id,x,y,w,h)=>V(id,x-5,y-5,w+10,h+10,`<rect x="1" y="1" width="${w+8}" height="${h+8}" rx="9" fill="none" stroke="#666666" stroke-width="2"/>`);
 const q1=["POST","GET","PATCH","CONNECT","None of the above"],q2=["ORDER BY","HAVING","WHERE","GROUP BY","LIMIT"],q3=["Queue","Stack","Linked list","Tree","Graph"];
 function q(id,x,y,w,num,mode="unanswered",mobile=false,pt=false,limit=5){
  const title=pt?"Questão":"Question";
  const stem=["Which HTTP method is defined as safe and idempotent?","Which SQL clause filters rows before grouping?","Which data structure follows last-in, first-out order?"][num-1];
  const options=[q1,q2,q3][num-1], rh=mobile?spec.phone.optionPitch:spec.desktop.optionPitch;
  const evaluated=["wrong","correct"].includes(mode), correct=num===1?1:num===2?2:1;
  const chosen=mode==="wrong"?2:mode==="unanswered"?-1:correct;
  T(id+"_title",x,y,`**${title} ${num}**`);
  T(id+"_stem",x,y+spec.spacing.titleToStem,stem,"body",ink,w);
  // At constrained widths reserve two (or three) native body lines plus a clear gap.
  const start=y+(w<310?108:w<=520?92:68);
  for(let k=0;k<limit;k++){
   const yy=start+k*rh, important=evaluated&&(k===chosen||k===correct);
   radio(id+"_radio"+k,x,yy,k===chosen);
   T(id+"_option"+k,x+spec.spacing.optionIndent,yy-1,`${String.fromCharCode(65+k)}. ${options[k]}`,"body",evaluated&&!important?muted:ink,w-32);
   if(evaluated&&k===correct)T(id+"_correct",x+126,yy+1,pt?"Correta":"Correct","small",ink,w-130);
   if(mode==="wrong"&&k===chosen)T(id+"_wrong",x+126,yy+1,pt?"Sua resposta":"Your answer","small",ink,w-130);
  }
  if(limit<5)return start+limit*rh;
  const ay=start+5*rh+spec.spacing.actionGap;
  if(evaluated){T(id+"_result",x,ay+4,mode==="wrong"?(pt?"**Resposta incorreta**":"**Incorrect answer**"):(pt?"**Resposta correta**":"**Correct answer**"),"body",ink,w);
   T(id+"_locked",x+(mobile?0:192),ay+(mobile?30:6),pt?"Resposta bloqueada":"Answer locked","small",muted,w-(mobile?0:192));}
  else {button(id+"_answer",x,ay,mode==="pending"?(pt?"Enviando…":"Submitting…"):pt?"Responder":"Answer",mode==="unanswered"?"disabled":mode==="pending"?"pending":"default");
   if(mode==="recovery")T(id+"_error",x,ay+56,pt?"Resposta não confirmada. Tente novamente.":"Answer not confirmed. Try again.","small",ink,w);}
  return ay+(mode==="recovery"?88:evaluated&&!mobile?38:60);
 }
 function sidebar(id,x,y,w,h,collapsed=false,state="normal"){
  R(id+"_sidebar",x,y,w,h,nav);
  if(!collapsed)T(id+"_app",x+20,y+20,"**Exam App**");
  icon(id+"_toggle",x+w-(collapsed?42:38),y+20,"panel");
  if(state==="empty"){T(id+"_empty",x+20,y+76,"No competitions available","small",muted,w-40);return}
  if(state==="failure"){T(id+"_error",x+20,y+76,"Could not load competitions.","small",ink,w-40);button(id+"_retry",x+20,y+128,"Retry");return}
  if(state==="loading"){for(let i=0;i<2;i++){R(id+"_sk_icon"+i,x+20,y+80+i*48,18,18,line,"rounded");R(id+"_sk_label"+i,x+52,y+83+i*48,w-76,12,line,"rounded")}return}
  for(let k=0;k<2;k++){let yy=y+68+k*48;if(k===0)R(id+"_nav_sel",x+8,yy,w-16,44,sel,"rounded");icon(id+"_nav"+k,x+(collapsed?22:20),yy+12,"doc");if(!collapsed)T(id+"_label"+k,x+52,yy+11,k===0?(w<250?"**DATAPREV** · 2026…":"**DATAPREV** · 2026 · Anal…"):(w<250?"PPSA · 2025…":"PPSA · 2025 · Analyst…"),"small",ink,w-60);}
 }
 function desktop(id,x,y,w,h,collapsed=false,mode="wrong"){
  const sw=collapsed?spec.desktop.rail:spec.desktop.sidebar;R(id+"_frame",x,y,w,h,paper);sidebar(id,x,y,sw,h,collapsed);const main=x+sw+spec.desktop.inset,cw=Math.min(spec.desktop.maxContent,w-sw-2*spec.desktop.inset);const bottom=q(id+"_q",main,y+30,cw,1,mode);const tail=q(id+"_q2",main,bottom+spec.spacing.questionGap,cw,2,"unanswered");const third=tail+spec.spacing.questionGap;const thirdLimit=Math.min(4,Math.max(0,Math.floor((y+h-24-third-68)/32)));if(thirdLimit>0)q(id+"_q3",main,third,cw,3,"unanswered",false,false,thirdLimit);
  R(id+"_scroll",x+w-12,y+20,5,h-40,"#e5e5e5","rounded");R(id+"_thumb",x+w-12,y+20,5,144,"#999999","rounded");
 }
 // Identical closed/open viewport: draw the same content with precomposited neutral colors in the overlay.
 function phone(id,x,y,w,open=false,pt=true){
  const start=Object.keys(elements).length;const h=800,margin=spec.phone.inset,cw=w-margin*2;
  R(id+"_frame",x,y,w,h,paper);icon(id+"_toggle",x+20,y+20,"panel");T(id+"_app",x+56,y+20,"**Exam App**");T(id+"_context",x+20,y+70,"DATAPREV · 2026 · Analyst…","small",muted,cw);
  const firstEnd=q(id+"_q",x+margin,y+112,cw,1,"selected",true,pt);
  const second=firstEnd+20;const stemSpace=cw<310?108:92;
  const visible=Math.min(4,Math.max(0,Math.floor((y+h-20-second-stemSpace)/44)));
  q(id+"_q2",x+margin,second,cw,2,"unanswered",true,pt,visible);
  R(id+"_scroll",x+w-8,y+102,3,h-118,"#e5e5e5","rounded");R(id+"_thumb",x+w-8,y+102,3,100,"#999999","rounded");
  if(open){
   const dims=c=>typeof c==="string"&&/^#[0-9a-f]{6}$/i.test(c)?"#"+[1,3,5].map(i=>Math.round(parseInt(c.slice(i,i+2),16)*.74).toString(16).padStart(2,"0")).join(""):c;
   for(const k of Object.keys(elements).slice(start)){const e=elements[k];for(const p of ["color","ink","stroke"])if(e[p])e[p]=dims(e[p]);if(e.type==="image"){e.src="data:image/svg+xml,"+encodeURIComponent(decodeURIComponent(e.src.split(",").slice(1).join(",")).replace(/#[0-9a-f]{6}/gi,dims));}}
   const dw=Math.min(spec.phone.drawerMax,w-spec.phone.drawerRemainder);R(id+"_drawer",x,y,dw,h,nav);T(id+"_drawer_title",x+20,y+20,"**Exam App**");icon(id+"_drawer_toggle",x+dw-42,y+20,"panel");
   for(let k=0;k<2;k++){let yy=y+72+k*80;if(k===0)R(id+"_nav_sel",x+8,yy,dw-16,68,sel,"rounded");icon(id+"_nav"+k,x+20,yy+20,"doc");T(id+"_nav_label"+k,x+52,yy+10,k===0?"**DATAPREV** · 2026\nAnalyst":"PPSA · 2025\nAnalyst","body",ink,dw-64);}
   T(id+"_discard_warning",x+20,y+244,pt?"Trocar de concurso apaga as respostas desta página.":"Changing competitions clears answers on this page.","small",ink,dw-40);
  }
 }
 function statePanel(id,x,y,w,h,title,kind,navState="normal"){
  T(id+"_caption",x,y-30,title,"small","ink");R(id+"_frame",x,y,w,h,paper);sidebar(id,x,y,224,h,false,navState);
  const mx=x+248,cw=w-272;
  if(kind==="loading"){for(let k=0;k<2;k++){R(id+"_heading"+k,mx,y+28+k*124,116,14,line,"rounded");for(let i=0;i<3;i++){R(id+"_s"+k+"_"+i,mx,y+56+k*124+i*20,Math.min(cw,220-i*30),10,line,"rounded");}R(id+"_sk_button"+k,mx,y+112+k*124,112,30,line,"rounded");}}
  else{const labels={empty:"No questions available",failure:"Could not load questions",navempty:"No competitions available",navloading:"Loading competitions…",navfailure:"Retry from the sidebar to continue."};T(id+"_status",mx,y+110,labels[kind],"body",ink,cw);if(kind==="failure")button(id+"_retry",mx,y+156,"Retry");}
 }
 const pageFooter=(id,x,y,w,current,mobile=false)=>{const gap=mobile?12:10;const bw=mobile?44:96;
  const center=w/2;const prev=current===1,next=current===5;
  if(mobile){button(id+"_prev",x+16,y,"‹",prev?"disabled":"default",44);T(id+"_current",x+70,y+12,`Page ${current} of 5`,"body",ink,w-140);button(id+"_next",x+w-60,y,"›",next?"disabled":"default",44);}
  else{const total=2*bw+5*44+6*gap;let xx=x+(w-total)/2;button(id+"_prev",xx,y,"‹ Previous",prev?"disabled":"default",bw);xx+=bw+gap;for(let i=1;i<=5;i++){R(id+"_page"+i,xx,y,44,44,i===current?sel:paper,"rounded",String(i),{size:"small",ink});xx+=44+gap;}button(id+"_next",xx,y,"Next ›",next?"disabled":"default",bw);}
 };
 group("desktop",0,0,1320,1080,"01 · Desktop · 1280 × 900 · Incorrect evaluation",()=>{desktop("desktop",0,48,1280,900,false,"wrong");N("desktop_note",0,968,1280,90,"Two complete questions and the visible beginning of Question 3; the rest is below the scroll viewport. Inline evaluation labels and subdued locked options preserve the approved Mid-Fidelity anatomy. 32-unit desktop option rhythm; no dividers.");});
 group("collapsed",1400,0,1064,1080,"02 · Desktop · 1024 × 900 · Selected",()=>{desktop("collapsed",0,48,1024,900,true,"selected");N("collapsed_note",0,968,1024,90,"64-unit rail; visible Ghost trigger at rest. Explicit activation; current content and scroll preserved. Same compact question anatomy as the expanded desktop.");});
 group("phone",2540,0,1320,1080,"03 · Phone · 390 / 320 · Closed / open",()=>{T("phone_caption",0,36,"390 · pt-BR · closed","small","ink");T("drawer_caption",430,36,"390 · same workspace / open","small","ink");T("phone320_caption",860,36,"320 · en · closed","small","ink");phone("phone",0,76,390);phone("drawer",430,76,390,true);phone("phone320",860,76,320,false,false);N("phone_note",0,900,1180,150,"Phone gutter 20; 44-unit option and action rhythm; drawer clamped at 304 or viewport minus 56. Q2 intentionally continues below the viewport: see the separate phone continuation. Underlay generated from the same complete visible content; no fabricated replacement. Locale chrome only.");});
 group("continuation",0,1160,1320,1000,"04 · Phone continuation and pagination boundaries",()=>{R("continuation_frame",0,48,390,800,paper);T("continuation_caption",20,64,"Scrolled · Questão 2","small",muted);q("continuation_q",20,104,350,2,"unanswered",true,true);T("continuation_end",20,640,"End of question list · illustrative final item","small",muted,350);pageFooter("continuation_footer",0,690,390,5,true);
  for(let k=0;k<3;k++){let yy=80+k*124;T("pagination_caption"+k,450,yy,["First page","Middle page","Last page"][k],"body","ink");R("pagination_surface"+k,450,yy+32,840,74,paper);pageFooter("pagination"+k,450,yy+47,840,[1,3,5][k]);}
  for(let k=0;k<3;k++){let yy=510+k*110;T("mobile_footer_caption"+k,450,yy,["Phone · first","Phone · middle","Phone · last"][k],"small","ink");R("mobile_footer_surface"+k,450,yy+28,350,66,paper);pageFooter("mobile_footer"+k,450,yy+39,350,[1,3,5][k],true);}
  T("pagination_single_caption",850,510,"Single page · no pagination","small",ink);
  R("pagination_single_surface",850,538,440,66,paper);
  T("pagination_single_end",866,557,"End of question list","small",muted);
  T("pagination_risk_caption",850,620,"Multiple pages · answers at risk","small",ink);
  R("pagination_risk_surface",850,648,440,110,paper);
  T("pagination_risk_warning",866,658,"Changing pages clears answers on this page.","small",ink,408);
  pageFooter("pagination_risk",850,698,440,3,true);
  N("pagination_note",450,860,840,115,"Pagination follows the final question; ten per page in original exam order. Hide pagination for a single page. On multiple pages, disable unavailable boundary controls and reset scroll on page change. Show the inline warning near available navigation only when selected or evaluated answers would be cleared. Check whether people notice and understand it in the prototype.");});
 group("lifecycle",1400,1160,1560,970,"05 · Question and navigation lifecycle",()=>{statePanel("question_loading",0,80,740,340,"Question list · loading","loading");statePanel("question_empty",780,80,740,340,"Question list · empty","empty");statePanel("question_failure",0,500,740,340,"Question list · error","failure");statePanel("navigation_empty",780,500,740,340,"Competition list · empty","navempty","empty");N("lifecycle_note",0,868,1520,90,"Question Retry reloads the selected competition only. Empty competition list has no action. Loading placeholders are a structural specimen; no actual network behavior is claimed.");});
 group("navigation",3040,1160,1320,970,"06 · Competition loading / recovery and narrow desktop",()=>{statePanel("navigation_loading",0,80,630,330,"Competition list · loading","navloading","loading");statePanel("navigation_failure",660,80,630,330,"Competition list · failure","navfailure","failure");T("narrow_caption",0,450,"768 · compact expanded navigation · structural sample","small","ink");R("narrow_frame",0,484,768,388,paper);sidebar("narrow",0,484,240,388);q("narrow_q",264,508,476,1,"unanswered");N("narrow_note",810,484,480,388,"768 specimen uses the same question structure, including all five alternatives and disabled Answer. Reserve two lines for the stem at narrow widths. The actual breakpoint and runtime reflow remain prototype work.");});
 group("feedback",0,2240,1560,720,"07 · Answer lifecycle and long-content feedback",()=>{const modes=["correct","pending","recovery"];for(let k=0;k<3;k++){const x=k*510;T("feedback_caption"+k,x,44,["Correct · locked","Submitting · pending","Unknown outcome · safe retry"][k],"small","ink");R("feedback_surface"+k,x,76,490,490,paper);q("feedback_"+modes[k],x+24,100,442,1,modes[k]);}
 N("feedback_note",0,590,1510,110,"Retain the selected option when outcome is not confirmed. Retry through Answer with identical footprint; prohibit duplicate evaluation while pending. Text labels identify correctness without color alone; no runtime claim.");});
 group("controls",1640,2240,1560,720,"08 · Control anatomy and label discovery",()=>{R("control_surface",0,48,1520,230,paper);const states=["default","hover","pressed","focus","disabled","pending"];for(let k=0;k<states.length;k++){const x=24+k*246;T("control_caption"+k,x,72,states[k],"small",muted);button("control_"+states[k],x,104,states[k]==="pending"?"Submitting…":"Answer",states[k]);if(states[k]==="focus")focus("control_focus_ring",x,104,112,44);button("retry_"+states[k],x,180,states[k]==="pending"?"Retrying…":"Retry",states[k]);if(states[k]==="focus")focus("retry_focus_ring",x,180,112,44);}
  for(let k=0;k<4;k++){const x=k*112;T("rail_caption"+k,x,310,["Rest","Hover","Focus","No hover"][k],"small","ink");R("rail"+k,x,344,64,248,nav);if(k===1)R("rail_hover",x+10,354,44,44,"#e4e4e4","rounded");if(k===2)focus("rail_focus",x+10,354,44,44);icon("rail_toggle"+k,x+22,366,"panel");R("rail_selection"+k,x+8,410,48,44,sel,"rounded");icon("rail_icon"+k,x+22,422,"doc");}
  R("tooltip_surface",490,344,990,248,paper);T("tooltip_caption",510,366,"Desktop · full-label discovery","body");R("tooltip_row",510,410,240,44,sel,"rounded");icon("tooltip_icon",524,422,"doc");T("tooltip_truncated",556,421,"DATAPREV · 2026 · Anal…","small",ink,184);R("tooltip_bubble",762,405,278,52,"#333333","rounded");T("tooltip_full",776,420,"DATAPREV · 2026 · Analyst","small",paper,254);T("tooltip_note",510,486,"Hover/focus reveals full label; phone wraps instead.","body",ink,920);N("controls_note",0,616,1520,90,"44-unit action footprint proposal; one visible external focus ring; Ghost remains visible without background at rest. No animation or functional state is implemented.");});
 group("long",3280,2240,1060,840,"09 · Long content and evaluated option wrapping",()=>{
  R("long_frame",0,48,1020,644,paper);T("long_title",24,72,"**Question 1**");
  T("long_stem",24,102,"Which approach prevents duplicate records when the outcome of a previous request is unknown and the client needs to retry safely?","body",ink,970);
  const texts=["Repeat the request without checking the previous outcome.","Attach a unique operation identifier and ensure that retries with the same identifier do not create another record.","Disable all retries, even when the original request has not reached the server.","Increase the network timeout without changing how duplicate requests are handled.","Create a new record for every submission and remove duplicates manually."];
  let yy=180;for(let k=0;k<5;k++){const important=k===1||k===4;radio("long_radio"+k,24,yy,k===4);
   T("long_letter"+k,52,yy-1,String.fromCharCode(65+k)+".","body",important?ink:muted);
   T("long_option"+k,76,yy-1,texts[k],"body",important?ink:muted,900);
   const lines=k===1?2:1;const contentEnd=yy+lines*24;
   if(important)T("long_feedback"+k,76,contentEnd+4,k===1?"Correct":"Your answer","small",ink,900);
   yy=contentEnd+(important?42:14);
  }
  T("long_result",24,yy+12,"**Incorrect answer**","body",ink,960);T("long_locked",216,yy+14,"Answer locked","small",muted,760);
  N("long_note",0,718,1020,100,"Restore all five approved alternatives. Hanging-indent text wraps under the answer text, with discrete feedback on its own line. Locked non-evaluated alternatives use subdued text, no full-width fills. Verify actual text bounds before approval.");
 });

 const dim=(id,x1,y1,x2,y2,label,labelOffset=-24)=>{const red="#a63232",h=y1===y2;
 const stroke=(suffix,x,y,dx,dy)=>put(id+suffix,{type:"stroke",x:originX+x,y:originY+y,points:[0,0,dx,dy],width:1,color:red});
 if(h){stroke("_line",x1,y1,x2-x1,0);stroke("_tick0",x1,y1-5,0,10);stroke("_tick1",x2,y1-5,0,10);T(id+"_label",x1+Math.max(0,(x2-x1-64)/2),y1+labelOffset,label,"small",red);}
 else{stroke("_line",x1,y1,0,y2-y1);stroke("_tick0",x1-5,y1,10,0);stroke("_tick1",x1-5,y2,10,0);T(id+"_label",x1+12,y1+Math.max(0,(y2-y1-18)/2),label,"small",red);}};
 group("redlines",0,3160,1510,1130,"10 · Workspace redlines · canvas units",()=>{
 R("redline_plate",0,50,1470,950,paper);
 R("redline_desktop",90,180,1280,500,paper);R("redline_sidebar",90,180,272,500,nav);
 R("redline_outline",90,180,1280,500,paper,"rect","",{hollow:true,stroke:"#777777",solid:true});
 T("redline_app",110,200,"**Exam App**");icon("redline_toggle",322,200,"panel");
 R("redline_nav",102,248,248,44,sel,"rounded");T("redline_nav_text",126,259,"DATAPREV · 2026 · Analyst…","small",ink,208);
 q("redline_q",402,215,740,1,"selected");
 dim("measure_viewport",90,112,1370,112,"1280");dim("measure_sidebar",90,153,362,153,"272");dim("measure_content",402,153,1142,153,"max 740");
 dim("measure_inset",362,710,402,710,"40");dim("measure_title",1180,215,1180,245,"30");dim("measure_pitch",1180,283,1180,315,"32");
 dim("measure_button",402,530,514,530,"112");dim("measure_button_h",542,451,542,495,"44");
 T("redline_note1",90,760,"Horizontal: 272 sidebar + 40 inset; content capped at 740; remaining width flexible.","body",ink,1250);
 T("redline_note2",90,810,"Question: title → stem offset 30; option pitch 32; glyph 18; action 112 × 44.","body",ink,1250);
 T("redline_note3",90,860,"At constrained widths reserve wrapping space; implementation measures actual text height.","body",ink,1250);
 N("redlines_note",0,1020,1470,90,"Proposed structural dimensions. Annotation plate stays separate from the interface. Viewport height in this study is illustrative.");
 });
 group("anatomy",1580,3160,1500,1410,"11 · Component anatomy · reading order and type hierarchy",()=>{
 R("anatomy_plate",0,50,1460,950,paper);T("anatomy_question_caption",36,78,"Question anatomy","large",ink);q("anatomy_q",36,128,620,1,"wrong");
 const label=(id,y,value)=>{R(id+"_leader",690,y+10,36,1,"#a63232");T(id,742,y,value,"body",ink,650);};
 label("anatomy_label_title",128,"01 · Question heading — 16/24 semibold target");label("anatomy_label_stem",158,"02 · Stem — 16/24 regular; wrap at content width");label("anatomy_label_radio",195,"03 · Radio glyph 18; full option row is the target");
 label("anatomy_label_option",231,"04 · Option text — 16/24; indent 28");label("anatomy_label_status",267,"05 · Correct / Your answer — 14/20; not color alone");label("anatomy_label_result",365,"06 · Result and lock replace action");
 R("anatomy_rule",36,456,1388,1,"#cccccc");T("anatomy_controls_caption",36,482,"Answer / Retry / radio / navigation","large",ink);
 button("anatomy_answer",56,544,"Answer");button("anatomy_disabled",216,544,"Answer","disabled");button("anatomy_pending",376,544,"Submitting…","pending");focus("anatomy_focus_outline",536,544,112,44);button("anatomy_focus",536,544,"Answer");
 dim("anatomy_action_w",56,598,56+spec.control.actionWidth,598,String(spec.control.actionWidth),8);dim("anatomy_action_h",680,544,680,544+spec.control.actionHeight,String(spec.control.actionHeight));
 T("anatomy_control_note",56,638,"Button label 14/20 medium; stable footprint through states.","body",ink,1300);
 R("anatomy_option_surface",56,672,430,72,"#f5f5f5","rounded");radio("anatomy_radio",76,699,true);T("anatomy_option",104,697,"B. GET","body",ink);
 dim("anatomy_radio_w",76,687,94,687,"18");dim("anatomy_indent",76,765,104,765,"28");
 T("anatomy_row_target",512,690,"Option row target: 44 on phone; 32 pitch on desktop.","body",ink,900);
 R("anatomy_nav_surface",56,814,430,64,nav,"rounded");R("anatomy_nav_row",68,824,406,44,sel,"rounded");icon("anatomy_nav_icon",80,836,"doc");T("anatomy_nav_label",112,835,"DATAPREV · 2026 · Analyst","small",ink,340);
 T("anatomy_nav_note",512,833,"Navigation: icon 20; row 44; label 14/20; truncate desktop, wrap phone.","body",ink,900);
 T("anatomy_type_limit",36,920,"Type values are implementation targets; native board uses body/small presets. Font family and final tokens belong to Mockup.","small",muted,1360);
 N("anatomy_note",0,1020,1460,90,"Reading order: title → stem → options → action/result → next question. Keyboard order and accessible names are specifications, not tests.");
 R("option_states_plate",0,1150,1460,230,paper);
 T("option_states_heading",36,1174,"Answer options before submission","large",ink);
 const optionStates=[
  ["rest","At rest",paper,false,false],
  ["hover","Hover",nav,false,false],
  ["focus","Keyboard focus",paper,false,true],
  ["selected","Selected",sel,true,false],
  ["selected_focus","Selected with focus",sel,true,true],
 ];
 for(const [index,[state,label,fill,checked,focused]] of optionStates.entries()){
  const id="option_state_"+state,x=36+index*282,y=1266,w=248,h=spec.phone.optionPitch;
  T(id+"_label",x,1234,label,"small",muted);
  R(id+"_row",x,y,w,h,fill,"rounded");
  radio(id+"_radio",x+12,y+13,checked);
  T(id+"_text",x+40,y+12,"B. GET","body",ink);
  if(focused)focus(id+"_ring",x,y,w,h);
 }
 T("option_states_touch",36,1334,"Tap anywhere in the row to select. Submit separately with Answer.","body",ink,1388);
 });
 group("responsive",3160,3160,1430,1130,"12 · Responsive contract and accessibility intent",()=>{
 R("responsive_plate",0,50,1390,950,paper);T("responsive_intro",30,78,"Proposed layout ranges · same question source and state","large",ink);
 const ranges=[["≥ 1024","Expanded 272 or collapsed 64","40 inset · max 740","Desktop / keyboard and pointer"],["768–1023","Compact expanded 240 or collapsed 64","24 inset · flexible content","Tablet / no-hover trigger remains visible"],["≤ 767","Drawer overlay, closed at rest","20 inset · drawer min(304, width − 56)","Phone / preserve selection and scroll"]];
 for(let i=0;i<3;i++){const y=140+i*150;T("responsive_range"+i,30,y,ranges[i][0],"large",ink);const ww=[560,448,300][i],sw=[119,105,0][i];R("responsive_shell"+i,30,y+36,ww,92,paper,"rect","",{hollow:true,stroke:"#777777",solid:true});if(sw)R("responsive_sidebar"+i,30,y+36,sw,92,nav);else icon("responsive_phone_toggle",42,y+46,"panel");const xx=30+sw+(sw?16:48);R("responsive_stem"+i,xx,y+50,Math.min(220,ww-sw-64),6,line);for(let k=0;k<2;k++){radio("responsive_radio"+i+"_"+k,xx,y+66+k*24);R("responsive_option"+i+"_"+k,xx+28,y+72+k*24,Math.min(150,ww-sw-100),5,line);}T("responsive_rule"+i,650,y+20,ranges[i][1]+"\n"+ranges[i][2]+"\n"+ranges[i][3],"body",ink,690);}
 R("responsive_access_divider",30,610,1330,1,"#cccccc");T("responsive_a11y_title",30,635,"Accessibility & overflow requirements","large",ink);
 const rows=[["Keyboard","Tab through navigation and question groups; arrows select radio options; Enter/Space activates actions."],["Focus","Move visible focus into the drawer and keep it inside. Escape or visible Close restores focus to the trigger."],["Feedback","Preserve the answer choice during Retry. Choosing a competition closes the drawer and announces the change."],["Overflow","320/390/768/1024/1280; no horizontal scroll; wrap stems/options; discover full truncated desktop label."],["Localization","pt-BR and en interface strings; question content stays in source language. Check long labels."]];
 for(let i=0;i<rows.length;i++){const y=686+i*57;T("responsive_a11y_key"+i,30,y,"**"+rows[i][0]+"**","body",ink,162);T("responsive_a11y_val"+i,210,y,rows[i][1],"small",ink,1130);}
 N("responsive_note",0,1020,1390,90,"Ranges are wireframe proposals. Start testing at 1024 CSS px and let content fit determine the breakpoint. Test resize, keyboard, screen reader, zoom and focus in the prototype. Static specimens do not establish accessibility conformance.");
 });

 return {elements,groups,spec};
}
module.exports=build();
