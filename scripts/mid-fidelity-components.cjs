// Shared structural controls and proposed studies; native board JSON is the editable output.
function components(){
const states=["top","end","selected","correct","wrong","loading","empty","failure","narrow","hover","focus","submitting","submit-failure","no-items","collapsed","long-content","page-middle","page-last","mobile","sidebar-loading","sidebar-failure"];
const existing=states.slice(0,18);
const colors={paper:"#ffffff",sidebar:"#f0f0f0",ink:"#262626",muted:"#626262",selected:"#d8d8d8",skeleton:"#dddddd"};
const vector=(x,y,w,h,body)=>({type:"image",x,y,w,h,src:"data:image/svg+xml,"+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${body}</svg>`),by:"agent"});
const toggle=(x,y)=>vector(x,y,16,14,'<rect x="1" y="1" width="14" height="12" rx="2" fill="none" stroke="rgb(85,85,85)" stroke-width="1.5"/><path d="M6 1 V13" stroke="rgb(85,85,85)" stroke-width="1.5"/>');
const icon=(x,y,k)=>vector(x,y,16,16,`<rect x=".5" y=".5" width="15" height="15" rx="3" fill="rgb(220,220,220)"/><path d="${k===0?'M4 4 H12 V12 H4 Z M4 8 H12':'M4 5 H12 M4 8 H12 M4 11 H9'}" fill="none" stroke="rgb(85,85,85)" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>`);
const chevron=(x,y,right,disabled)=>vector(x,y,8,14,`<path d="${right?'M2 2 L7 7 L2 12':'M6 2 L1 7 L6 12'}" fill="none" stroke="${disabled?'rgb(150,150,150)':'rgb(38,38,38)'}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`);
const text=(x,y,value,size="body",color="ink",more={})=>({type:"text",x,y,text:value,size,color,...more});
const shape=(x,y,w,h,color,kind="rect",label="",more={})=>({type:"shape",kind,x,y,w,h,color,text:label,...more});
const layout=id=>{const i=states.indexOf(id),ox=i*1460,narrow=["narrow","collapsed"].includes(id),l=narrow?220:56,r=narrow?1090:1254,w=id==="collapsed"?64:narrow?230:264;return {ox,l,r,w,main:l+w+32,center:(l+w+r)/2}};
function aligned({states,existing,layout,text,shape,vector,toggle,chevron}){
const out={};const put=(id,n,e)=>out[id+"_"+n]=e;
const navIcon=(x,y,k)=>vector(x,y,16,16,`<rect x="1.5" y="1.5" width="13" height="13" rx="2" fill="none" stroke="rgb(85,85,85)" stroke-width="1.4"/><path d="${k===0?'M4.5 6 H11.5 M4.5 10 H11.5':'M5 5 H11 M5 8 H11 M5 11 H9'}" fill="none" stroke="rgb(85,85,85)" stroke-width="1.4" stroke-linecap="round"/>`);
for(const id of existing){const {ox,l,w,center,main}=layout(id),collapsed=id==="collapsed",narrow=id==="narrow";
const hx=collapsed?l+(w-16)/2:l+w-36;put(id,"toggle_panel",toggle(ox+hx,113));
if(!collapsed)put(id,"app",text(ox+l+24,110,"**Exam App**"));
if(id!=="no-items"){
put(id,"nav_selection",shape(ox+l+12,142,w-24,36,"#d8d8d8","rounded"));
if(id==="hover")put(id,"nav_hover",shape(ox+l+12,184,w-24,36,"#e8e8e8","rounded"));
for(let k=0;k<2;k++){const rowCenter=160+k*42;put(id,"nav_icon"+k,navIcon(ox+(collapsed?l+(w-16)/2:l+24),rowCenter-8,k));
if(!collapsed)put(id,"nav_label"+k,text(ox+l+48,rowCenter-10,k===0?(narrow?"**DATAPREV** · 2026…":"**DATAPREV** · 2026 · Anal…"):(narrow?"PPSA · 2025…":"PPSA · 2025 · Analyst…"),"small"));}
}
if(["end","page-middle","page-last"].includes(id)){
const x=center-196,active=id==="end"?0:id==="page-middle"?2:4,prev=id==="end",next=id==="page-last",muted="#777777",ink="#262626";
put(id,"prev_upper",chevron(ox+x+8,728,false,prev));put(id,"prev",text(ox+x+24,726,"Previous","small",prev?muted:ink));
put(id,"next",text(ox+x+328,726,"Next","small",next?muted:ink));put(id,"next_upper",chevron(ox+x+374,728,true,next));
for(let k=0;k<5;k++){const px=ox+x+116+k*40-18;put(id,"page"+k,text(px,726,String(k+1),"small","ink",{wrap:36,textAlign:"center"}));if(k===active)put(id,"page_active",shape(px,717,36,36,"#d8d8d8","rounded"));}
}
if(id==="correct"||id==="wrong"){
put(id,"q0_correct",text(ox+main+112,205,"Correct","small","#262626"));
if(id==="wrong")put(id,"q0_wrong",text(ox+main+112,233,"Your answer","small","#262626"));
put(id,"q0_result",text(ox+main,331,id==="correct"?"**Correct answer**":"**Incorrect answer**","body"));
put(id,"q0_locked",text(ox+main+192,333,"Answer locked","small","#626262"));
}
}
return out;
}
function longContent({text,shape,layout}){
const id="long-content",{ox,main}=layout(id),x=ox+main,out={};const put=(n,e)=>out[id+"_"+n]=e;
const radio=y=>shape(x,y,16,16,"#ffffff","ellipse","",{hollow:true,stroke:"#555555",solid:true});
const button=y=>shape(x,y,120,36,"#e6e6e6","rounded","Answer",{size:"small",ink:"#626262"});
const opts=["Repeat the request without checking the previous outcome.","Attach a unique operation identifier and ensure that retries with the same identifier do not create another record.","Disable all retries, even when the original request has not reached the server.","Increase the network timeout without changing how duplicate requests are handled.","Create a new record for every submission and remove duplicates manually."];
const ys=[242,270,322,350,378];
for(let k=0;k<5;k++){put("radio"+k,radio(ys[k]));put("letter"+k,text(x+26,ys[k]-2,String.fromCharCode(65+k)+".","body","#262626"));put("option"+k,text(x+48,ys[k]-2,opts[k],"body","#262626",{wrap:692}));}
put("answer",button(412));put("next_title",text(x,480,"**Question 2**","body","#262626"));put("next_stem",text(x,512,"Which SQL clause filters rows before grouping?","body","#262626",{wrap:740}));
for(let k=0;k<5;k++){const y=548+k*28;put("next_radio"+k,radio(y));put("next_option"+k,text(x+26,y-2,String.fromCharCode(65+k)+". "+["ORDER BY","HAVING","WHERE","GROUP BY","LIMIT"][k],"body","#262626",{wrap:714}));}
put("next_answer",button(694));put("third_title",text(x,762,"**Question 3**","body","#262626"));
return out;
}
function actions({states,layout,shape,text,vector,toggle}){
const out={};const put=(id,n,e)=>out[id+"_"+n]=e;
const focusRing=(x,y)=>vector(x-5,y-5,122,44,'<rect x="1" y="1" width="120" height="42" rx="9" fill="none" stroke="rgb(102,102,102)" stroke-width="2"/>');
const btn=(x,y,label="Answer",state="disabled")=>shape(x,y+1,112,34,({disabled:"#f4f4f4",pending:"#eeeeee",enabled:"#333333",hover:"#262626",pressed:"#191919",skeleton:"#dddddd"})[state],"rounded",label,{size:"small",ink:["enabled","hover","pressed"].includes(state)?"#ffffff":"#666666"});
for(const id of states.slice(0,18)){const {ox,main,center,l,w}=layout(id),x=ox+main;
if(["top","selected","correct","wrong","narrow","hover","focus","submitting","submit-failure","collapsed"].includes(id)){
 if(!["correct","wrong"].includes(id))put(id,"q0_answer",btn(x,324,id==="submitting"?"Submitting…":"Answer",id==="submitting"?"pending":["selected","focus","submit-failure"].includes(id)?"enabled":"disabled"));
 put(id,"q1_answer",btn(x,606));
 if(id==="focus"){put(id,"q0_focus_outer",focusRing(x,325));}
 if(id==="submit-failure")put(id,"q0_error",text(x+128,332,"Answer not confirmed. Try again.","small","#262626"));
}
if(["end","page-middle","page-last"].includes(id)){put(id,"previous_question_tail",btn(x,85));put(id,"q0_answer",btn(x,367));put(id,"q1_answer",btn(x,649));}
if(id==="long-content"){put(id,"answer",btn(x,412));put(id,"next_answer",btn(x,694));}
if(id==="loading")for(let n=0;n<2;n++)put(id,"sk_action"+n,btn(x,324+n*282,"","skeleton"));
if(id==="failure")put(id,"retry",btn(ox+center-56,436,"Retry","enabled"));
if(id==="collapsed"){
 // Reserved transparent slot: hidden at desktop rest; the external hover specimen is visible.
 put(id,"toggle_panel",vector(ox+l+(w-16)/2,113,16,14,'<rect width="16" height="14" fill="none"/>'));
 put(id,"note",{type:"note",x:ox+l,y:875,w:640,h:120,color:"yellow",text:"Collapsed rail: hide the expand icon at pointer rest; reveal on rail/header hover or keyboard focus, with no layout shift. Activate explicitly to expand. On touch/no-hover, keep an accessible visible trigger. Preserve selected item, scroll and answers."});
 put(id,"reveal_caption",text(ox+885,875,"Hover","small","ink"));
 put(id,"reveal_surface",shape(ox+885,904,64,64,"#f0f0f0","rounded"));
 put(id,"reveal_hover",shape(ox+903,922,28,28,"#e4e4e4","rounded"));
 put(id,"reveal_icon",toggle(ox+909,929));
 put(id,"reveal_focus_caption",text(ox+1005,875,"Keyboard focus","small","ink"));
 put(id,"reveal_focus_sample",vector(ox+1005,904,64,64,'<rect width="64" height="64" rx="5" fill="rgb(240,240,240)"/><rect x="15" y="15" width="34" height="34" rx="6" fill="none" stroke="rgb(102,102,102)" stroke-width="2"/><rect x="25" y="26" width="14" height="12" rx="2" fill="none" stroke="rgb(85,85,85)" stroke-width="1.5"/><path d="M30 26 V38" stroke="rgb(85,85,85)" stroke-width="1.5"/>'));
}
if(id==="focus"){
 const start=ox+728;
 put(id,"button_spec_surface",shape(start-12,865,532,102,"#ffffff","rect"));
 for(const [k,label,state] of [[0,"Default","enabled"],[1,"Hover","hover"],[2,"Pressed","pressed"],[3,"Focus","enabled"]]){
 const px=start+k*128;put(id,"button_spec_"+k+"_label",text(px,880,label,"small","ink"));put(id,"button_spec_"+k,btn(px,908,"Answer",state));if(k===3)put(id,"button_spec_focus_ring",focusRing(px,909));}
}
}
put("mobile","q0_answer",btn(18*1460+476,508));
put("sidebar-failure","retry",btn(20*1460+80,198,"Retry","enabled"));
return out;
}
function shared(){return {...aligned({states,existing,layout,text,shape,vector,toggle,chevron}),...longContent({text,shape,layout}),...actions({states,layout,shape,text,vector,toggle})};}
function studies(){
const out={};const put=(id,n,e)=>out[id+"_"+n]=e;
for(const id of states.slice(18)){
const {ox,l,r,w,main,center}=layout(id);
const t=(n,x,y,v,size="body",color="ink",more={})=>put(id,n,text(ox+x,y,v,size,color,more));
const s=(n,x,y,ww,h,color,kind="rect",label="",more={})=>put(id,n,shape(ox+x,y,ww,h,color,kind,label,more));
const note=(v,x=56)=>put(id,"note",{type:"note",x:ox+x,y:875,w:640,h:120,color:"yellow",text:v});
if(id==="mobile"){
const x=460,ww=390;t("caption",x,18,"19 · Phone · Drawer closed","large");s("frame",x,76,ww,709,colors.paper);t("app",x+44,100,"**Exam App**");put(id,"toggle_panel",toggle(ox+x+16,103));t("context",x+16,145,"DATAPREV · 2026 · Analyst…","small",colors.muted);t("q0_title",x+16,194,"**Question 1**");t("q0_stem",x+16,226,"Which HTTP method is defined as safe and idempotent?","body",colors.ink,{wrap:350});for(let k=0;k<5;k++){let y=298+k*40;s("q0_radio"+k,x+16,y,16,16,colors.paper,"ellipse","",{hollow:true,stroke:"#555555",solid:true});t("q0_option"+k,x+42,y-2,String.fromCharCode(65+k)+". "+["POST","GET","PATCH","CONNECT","None of the above"][k]);}put(id,"q0_answer",actions({states,layout,shape,text,vector,toggle})[id+"_q0_answer"]);t("q1_title",x+16,576,"**Question 2**");t("q1_stem",x+16,608,"Which SQL clause filters rows before grouping?","body",colors.ink,{wrap:350});for(let k=0;k<2;k++){let y=680+k*40;s("q1_radio"+k,x+16,y,16,16,colors.paper,"ellipse","",{hollow:true,stroke:"#555555",solid:true});t("q1_option"+k,x+42,y-2,["A. ORDER BY","B. HAVING"][k]);}note("Approved phone overlay drawer: compare closed workspace and open drawer specimen; background stays in place, current answers and scroll are preserved. Prototype must validate dismissal, focus restoration, touch and exact breakpoint. The vector specimen is static.",x);t("drawer_caption",900,18,"Phone · Drawer open","large");put(id,"drawer_open",vector(ox+900,76,390,709,"<rect x=\"0\" y=\"0\" width=\"390\" height=\"709\" rx=\"6\" fill=\"white\"/><g fill=\"#333\" font-family=\"Arial,sans-serif\"><text x=\"20\" y=\"38\" font-size=\"16\" font-weight=\"bold\">Exam App</text><text x=\"16\" y=\"80\" font-size=\"12\">DATAPREV · 2026 · Analyst…</text><text x=\"16\" y=\"125\" font-size=\"15\" font-weight=\"bold\">Question 1</text><text x=\"16\" y=\"153\" font-size=\"13\">Which HTTP method is defined</text><text x=\"16\" y=\"172\" font-size=\"13\">as safe and idempotent?</text><text x=\"32\" y=\"225\" font-size=\"13\">A. POST</text><text x=\"32\" y=\"265\" font-size=\"13\">B. GET</text></g><rect width=\"390\" height=\"709\" rx=\"6\" fill=\"#000\" opacity=\".28\"/><rect width=\"288\" height=\"709\" rx=\"5\" fill=\"#f0f0f0\"/><g fill=\"#333\" font-family=\"Arial,sans-serif\"><text x=\"24\" y=\"44\" font-size=\"16\" font-weight=\"bold\">Exam App</text><rect x=\"12\" y=\"70\" width=\"264\" height=\"36\" rx=\"5\" fill=\"#d8d8d8\"/><text x=\"49\" y=\"93\" font-size=\"13\" font-weight=\"bold\">DATAPREV · 2026 · Anal…</text><text x=\"49\" y=\"135\" font-size=\"13\">PPSA · 2025 · Analyst…</text></g><g fill=\"none\" stroke=\"#555\" stroke-width=\"1.5\" stroke-linecap=\"round\"><rect x=\"250\" y=\"29\" width=\"15\" height=\"13\" rx=\"2\"/><path d=\"M255 29V42\"/><rect x=\"24\" y=\"81\" width=\"14\" height=\"14\" rx=\"2\"/><path d=\"M28 86H34M28 90H34\"/><rect x=\"24\" y=\"123\" width=\"14\" height=\"14\" rx=\"2\"/><path d=\"M28 127H34M28 131H34\"/></g>"));continue;}
const loading=id==="sidebar-loading";t("caption",l,18,loading?"20 · Sidebar loading (study)":"21 · Sidebar load failure","large");s("frame",l,76,r-l,709,colors.paper);s("sidebar",l,76,w,709,colors.sidebar);put(id,"sidebar_seam",vector(ox+l+w-14,76,14,709,'<rect width="14" height="709" fill="rgb(240,240,240)"/>'));t("app",l+24,110,"**Exam App**");put(id,"toggle_panel",toggle(ox+l+w-36,113));if(loading){for(let k=0;k<2;k++){s("sk_icon"+k,l+24,153+k*42,16,16,colors.skeleton,"rounded");s("sk_label"+k,l+48,157+k*42,160,10,colors.skeleton)}t("status",center-240,365,"Loading competitions…","large","ink",{wrap:480,textAlign:"center"});note("Navigation loading study: show skeletons if loading is asynchronous, then select the first available item. Do not start question loading before valid selection. Data source remains a technical decision.");}else{t("error",l+24,151,"Could not load competitions.","small",colors.ink,{wrap:216});put(id,"retry",actions({states,layout,shape,text,vector,toggle})[id+"_retry"]);t("status",center-240,350,"Could not load competitions","large","ink",{wrap:480,textAlign:"center"});t("detail",center-240,393,"Retry from the sidebar.","body",colors.muted,{wrap:480,textAlign:"center"});note("Approved: competition-list failure shows error and manual Retry. Retry reloads navigation, not questions. No selection until navigation loads. Data source and runtime recovery require technical validation.");}}
return out;}
function reviewSpecimens(){
 const out={};
 const put=(id,e)=>{out[id]=e;};
 const x=18*1460, cx=14*1460;
 // Consolidate repeated loading-only geometry; retain each original skeleton row.
 for(let n=0;n<3;n++){
  const widths=[178,133,215,163,237];
  const count=n===2?1:5;
  let body="";
  for(let k=0;k<count;k++){const y=k*28;body+=`<circle cx="8" cy="${y+8}" r="8" fill="rgb(221,221,221)"/><rect x="26" y="${y+3}" width="${widths[k]}" height="10" rx="2" fill="rgb(221,221,221)"/>`;}
  put("loading_sk_group"+n,vector(7652,178+n*282,264,(count-1)*28+16,body));
 }
 // Full-height collapsed rail specimens: the hidden rest state is unchanged.
 const rail=`<rect width="64" height="709" rx="5" fill="rgb(240,240,240)"/><rect x="12" y="66" width="40" height="36" rx="5" fill="rgb(216,216,216)"/><g fill="none" stroke="rgb(85,85,85)" stroke-width="1.4" stroke-linecap="round"><rect x="25" y="77" width="13" height="13" rx="2"/><path d="M28 81H35M28 85H35"/><rect x="25" y="119" width="13" height="13" rx="2"/><path d="M28 123H35M28 127H33"/></g>`;
 put("collapsed_reveal_caption",text(cx+1122,18,"Hover","small"));
 put("collapsed_reveal_surface",vector(cx+1122,76,64,709,rail));
 put("collapsed_reveal_hover",shape(cx+1140,106,28,28,"#e4e4e4","rounded"));
 put("collapsed_reveal_icon",toggle(cx+1146,113));
 put("collapsed_reveal_focus_caption",text(cx+1240,18,"Keyboard focus","small"));
 put("collapsed_reveal_focus_sample",vector(cx+1240,76,64,709,rail+`<rect x="15" y="27" width="34" height="34" rx="6" fill="none" stroke="rgb(102,102,102)" stroke-width="2"/><rect x="25" y="38" width="14" height="12" rx="2" fill="none" stroke="rgb(85,85,85)" stroke-width="1.5"/><path d="M30 38V50" stroke="rgb(85,85,85)" stroke-width="1.5"/>`));
 put("collapsed_note",{type:"note",x:cx+220,y:875,w:640,h:120,color:"yellow",text:"Desktop rail at rest hides the expand icon. Full-height hover and keyboard-focus specimens show the same slot and navigation items, without layout shift. Activate explicitly to expand; no automatic peek. Touch/no-hover requires a visible accessible control."});
 // Native editable overlay; do not rely on a single large SVG containing text.
 const d=x+900;
 put("mobile_drawer_open",shape(d,76,390,709,"#bdbdbd"));
 put("mobile_drawer_underlay",text(d+294,226,"safe and","small","#555555",{wrap:88}));
 put("mobile_drawer_panel",shape(d,76,288,709,"#f0f0f0"));
 put("mobile_drawer_title",text(d+24,110,"**Exam App**"));
 put("mobile_drawer_toggle",toggle(d+252,113));
 put("mobile_drawer_selection",shape(d+12,142,264,36,"#d8d8d8","rounded"));
 put("mobile_drawer_icon0",icon(d+24,152,0));
 put("mobile_drawer_label0",text(d+48,150,"**DATAPREV** · 2026 · Anal…","small","#262626"));
 put("mobile_drawer_icon1",icon(d+24,194,1));
 put("mobile_drawer_label1",text(d+48,192,"PPSA · 2025 · Analyst…","small","#262626"));
 put("mobile_note",{type:"note",x:x+460,y:875,w:640,h:120,color:"yellow",text:"Approved overlay drawer: compare closed phone and native open specimen. The dimmed question workspace stays behind the drawer; selection and scroll are preserved. Left-side component studies cover footer pagination, full competition label and interface copy in both languages. Prototype validates focus, dismissal, touch and breakpoint."});
 // Stress-test a longer answer in the existing phone state without inventing a destination.
 put("mobile_q1_option0",text(x+502,678,"A. ORDER BY — sorts rows after filtering and grouping.","body","#262626",{wrap:324}));
 put("mobile_q1_radio1",shape(x+476,748,16,16,colors.paper,"ellipse","",{hollow:true,stroke:"#555555",solid:true}));
 put("mobile_q1_option1",text(x+502,746,"B. HAVING","body","#262626",{wrap:324}));
 // Component studies, not new workspace variants or approved locale-selection UI.
 const s=x+56;
 put("mobile_pagination_caption",text(s,18,"Phone · End-of-page pagination","body"));
 put("mobile_pagination_surface",shape(s,76,350,154,"#ffffff"));
 put("mobile_pagination_answer",shape(s+16,94,112,34,"#f4f4f4","rounded","Answer",{size:"small",ink:"#666666"}));
 put("mobile_pagination_previous",text(s+16,170,"Previous","small","#777777"));
 put("mobile_pagination_pages",text(s+91,170,"**1**    2    3    4    5","small","#262626",{wrap:176,textAlign:"center"}));
 put("mobile_pagination_next",text(s+287,170,"Next","small","#262626"));
 put("mobile_full_label_caption",text(s,278,"Full label on hover / focus / touch","body"));
 put("mobile_full_label_surface",shape(s,315,350,56,"#f0f0f0","rounded","DATAPREV · 2026 · Analyst (illustrative)",{size:"small",ink:"#262626"}));
 put("mobile_locale_caption",text(s,420,"Interface copy · English / pt-BR","body"));
 put("mobile_locale_copy",text(s,462,"English: Answer · Retry · Question 1\npt-BR: Responder · Tentar novamente · Questão 1","body","#262626",{wrap:350}));
 return out;
}
function refined(){
 const out={};const put=(id,e)=>out[id]=e;
 const x=18*1460,cx=14*1460,d=x+900,s=x+56;
 // Keep the exact existing scrollbar geometry in a single simple vector per state.
 for(const id of ["top","end","selected","correct","wrong","loading","narrow","hover","focus","submitting","submit-failure","collapsed","long-content","page-middle","page-last"]){
  const {ox,r}=layout(id),bottom=["end","page-middle","page-last"].includes(id);
  put(id+"_scroll_track",vector(ox+r-18,100,8,660,`<rect width="8" height="660" rx="4" fill="rgb(241,241,241)"/><rect y="${bottom?516:0}" width="8" height="144" rx="4" fill="rgb(153,153,153)"/>`));
 }
 // Consolidate only repeated, non-semantic navigation skeleton geometry.
 put("sidebar-loading_sk_icon0",vector(20*1460-1460+80,153,184,58,`<g fill="rgb(221,221,221)"><rect width="16" height="16" rx="3"/><rect x="24" y="4" width="160" height="10" rx="2"/><rect y="42" width="16" height="16" rx="3"/><rect x="24" y="46" width="160" height="10" rx="2"/></g>`));
 // Same rail geometry and toggle slot, with a permanent visible trigger for no-hover.
 const rail=`<rect width="64" height="709" rx="5" fill="rgb(240,240,240)"/><rect x="12" y="66" width="40" height="36" rx="5" fill="rgb(216,216,216)"/><g fill="none" stroke="rgb(85,85,85)" stroke-width="1.4" stroke-linecap="round"><rect x="25" y="77" width="13" height="13" rx="2"/><path d="M28 81H35M28 85H35"/><rect x="25" y="119" width="13" height="13" rx="2"/><path d="M28 123H35M28 127H33"/></g>`;
 const glyph=`<g fill="none" stroke="rgb(85,85,85)" stroke-width="1.5"><rect x="25" y="38" width="14" height="12" rx="2"/><path d="M30 38V50"/></g>`;
 put("collapsed_reveal_caption",text(cx+1110,18,"Hover","small"));
 put("collapsed_reveal_surface",vector(cx+1110,76,64,709,rail+`<rect x="18" y="30" width="28" height="28" rx="5" fill="rgb(228,228,228)"/>`+glyph));
 put("collapsed_reveal_focus_caption",text(cx+1212,18,"Focus","small"));
 put("collapsed_reveal_focus_sample",vector(cx+1212,76,64,709,rail+`<rect x="15" y="27" width="34" height="34" rx="6" fill="none" stroke="rgb(102,102,102)" stroke-width="2"/>`+glyph));
 put("collapsed_nohover_caption",text(cx+1314,18,"No hover","small"));
 put("collapsed_nohover_sample",vector(cx+1314,76,64,709,rail+glyph));
 put("collapsed_note",{type:"note",x:cx+220,y:875,w:640,h:120,color:"yellow",text:"Desktop rest hides the expand icon; hover and keyboard focus reveal it in the same slot. No-hover devices keep the trigger visible. Activate explicitly; no hover peek. Preserve selection, scroll and answers. Validate keyboard tab order, focus ring, target size and touch in the prototype."});
 // A dimmed copy of the same phone's visible question text and positions.
 put("mobile_drawer_open",shape(d,76,390,709,"#bdbdbd"));
 put("mobile_drawer_underlay",text(d+16,226,"Which HTTP method is defined as safe and idempotent?","body","#4b4b4b",{wrap:350}));
 put("mobile_drawer_underlay_q1",text(d+16,608,"Which SQL clause filters rows before grouping?","body","#4b4b4b",{wrap:350}));
 put("mobile_drawer_underlay_choice",text(d+42,678,"A. ORDER BY — sorts rows after filtering and grouping.","body","#4b4b4b",{wrap:324}));
 put("mobile_drawer_panel",shape(d,76,288,709,"#f0f0f0"));
 put("mobile_drawer_selection",shape(d+12,142,264,52,"#d8d8d8","rounded"));
 put("mobile_drawer_label0",text(d+48,148,"**DATAPREV · 2026**\nAnalyst","small","#262626",{wrap:218}));
 put("mobile_drawer_icon0",icon(d+24,160,0));
 put("mobile_drawer_label1",text(d+48,207,"PPSA · 2025\nAnalyst","small","#262626",{wrap:218}));
 put("mobile_drawer_icon1",icon(d+24,220,1));
 // Compact previous/current/next; boundary states remain on desktop and first page here.
 put("mobile_pagination_previous",vector(s+16,151,44,44,`<rect x=".5" y=".5" width="43" height="43" rx="5" fill="rgb(244,244,244)"/><path d="M25 15L18 22L25 29" fill="none" stroke="rgb(150,150,150)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`));
 put("mobile_pagination_pages",text(s+65,166,"Page 1 of 5","body","#262626",{wrap:220,textAlign:"center"}));
 put("mobile_pagination_next",vector(s+290,151,44,44,`<rect x=".5" y=".5" width="43" height="43" rx="5" fill="rgb(240,240,240)"/><path d="M19 15L26 22L19 29" fill="none" stroke="rgb(38,38,38)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`));
 // Anchor full-label discovery to a real truncated row, external to workspace.
 put("mobile_full_label_caption",text(s,875,"Desktop · Full-label tooltip","small"));
 put("mobile_full_label_surface",shape(s,903,150,36,"#f0f0f0","rounded","DATAPREV · 2026 · Anal…",{size:"small",ink:"#262626"}));
 put("mobile_full_label_tip",shape(s+158,897,235,48,"#333333","rounded","DATAPREV · 2026 · Analyst",{size:"small",ink:"#ffffff"}));
 put("mobile_full_label_pointer",vector(s+150,915,8,12,`<path d="M8 0L0 6L8 12Z" fill="rgb(51,51,51)"/>`));
 // Native Portuguese phone workspace specimen, same example question and answer action.
 const p=s, y=288;
 put("mobile_locale_caption",text(p,y-28,"Phone · Portuguese (pt-BR)","body"));
 put("mobile_locale_copy",shape(p,y,350,497,"#ffffff"));
 put("mobile_pt_title",text(p+44,y+18,"**Exam App**"));
 put("mobile_pt_toggle",toggle(p+16,y+21));
 put("mobile_pt_context",text(p+16,y+54,"DATAPREV · 2026 · Analista","small","#626262",{wrap:318}));
 put("mobile_pt_question",text(p+16,y+98,"**Questão 1**"));
 put("mobile_pt_stem",text(p+16,y+128,"Qual método HTTP é definido como seguro e idempotente?","body","#262626",{wrap:318}));
 put("mobile_pt_radios",vector(p+16,y+200,16,176,Array.from({length:5},(_,i)=>`<circle cx="8" cy="${8+i*40}" r="7" fill="none" stroke="rgb(85,85,85)" stroke-width="1.5"/>`).join("")));
 ["A. POST","B. GET","C. PATCH","D. CONNECT","E. Nenhuma das anteriores"].forEach((v,i)=>put("mobile_pt_option"+i,text(p+42,y+198+i*40,v,"body","#262626",{wrap:292})));
 put("mobile_pt_answer",shape(p+16,y+402,112,34,"#f4f4f4","rounded","Responder",{size:"small",ink:"#666666"}));
 put("mobile_pt_next",text(p+16,y+460,"**Questão 2**"));
 put("mobile_note",{type:"note",x:x+460,y:875,w:640,h:120,color:"yellow",text:"Mobile: the open drawer overlays the same question context with a dimmed background; labels wrap instead of relying on hover. Compact footer shows page and previous/next with 44-unit illustrative targets. Portuguese specimen checks translated layout; tooltip remains a desktop study. Prototype validates dismissal, focus restoration, actual touch targets, locale and breakpoint."});
 return out;
}
return {states,existing,layout,shared:()=>{const o=shared();for(const id of ["collapsed_reveal_hover","collapsed_reveal_icon","sidebar-loading_sk_label0","sidebar-loading_sk_icon1","sidebar-loading_sk_label1","top_scroll_thumb","end_scroll_thumb","selected_scroll_thumb","correct_scroll_thumb","wrong_scroll_thumb","loading_scroll_thumb","narrow_scroll_thumb","hover_scroll_thumb","focus_scroll_thumb","submitting_scroll_thumb","submit-failure_scroll_thumb","collapsed_scroll_thumb","long-content_scroll_thumb","page-middle_scroll_thumb","page-last_scroll_thumb"])delete o[id];return o;},studies:()=>{const o={...studies(),...reviewSpecimens(),...refined()};for(const id of ["collapsed_reveal_hover","collapsed_reveal_icon","sidebar-loading_sk_label0","sidebar-loading_sk_icon1","sidebar-loading_sk_label1","top_scroll_thumb","end_scroll_thumb","selected_scroll_thumb","correct_scroll_thumb","wrong_scroll_thumb","loading_scroll_thumb","narrow_scroll_thumb","hover_scroll_thumb","focus_scroll_thumb","submitting_scroll_thumb","submit-failure_scroll_thumb","collapsed_scroll_thumb","long-content_scroll_thumb","page-middle_scroll_thumb","page-last_scroll_thumb"])delete o[id];return o;}};
}
module.exports=components();
