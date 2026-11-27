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
function shared(){return {...aligned({states,existing,layout,text,shape,vector,toggle,chevron}),...longContent({text,shape,layout})};}
function studies(){
const out={};const put=(id,n,e)=>out[id+"_"+n]=e;
for(const id of states.slice(18)){
const {ox,l,r,w,main,center}=layout(id);
const t=(n,x,y,v,size="body",color="ink",more={})=>put(id,n,text(ox+x,y,v,size,color,more));
const s=(n,x,y,ww,h,color,kind="rect",label="",more={})=>put(id,n,shape(ox+x,y,ww,h,color,kind,label,more));
const note=(v,x=56)=>put(id,"note",{type:"note",x:ox+x,y:875,w:640,h:120,color:"yellow",text:v});
if(id==="mobile"){
const x=460,ww=390;t("caption",x,18,"19 · Phone layout (proposal)","large");s("frame",x,76,ww,709,colors.paper);t("app",x+44,100,"**Exam App**");put(id,"toggle_panel",toggle(ox+x+16,103));t("context",x+16,145,"DATAPREV · 2026 · Analyst…","small",colors.muted);t("q0_title",x+16,194,"**Question 1**");t("q0_stem",x+16,226,"Which HTTP method is defined as safe and idempotent?","body",colors.ink,{wrap:350});for(let k=0;k<5;k++){let y=298+k*40;s("q0_radio"+k,x+16,y,16,16,colors.paper,"ellipse","",{hollow:true,stroke:"#555555",solid:true});t("q0_option"+k,x+42,y-2,String.fromCharCode(65+k)+". "+["POST","GET","PATCH","CONNECT","None of the above"][k]);}s("q0_answer",x+16,508,120,36,"#e6e6e6","rounded","Answer",{size:"small",ink:colors.muted});t("q1_title",x+16,576,"**Question 2**");t("q1_stem",x+16,608,"Which SQL clause filters rows before grouping?","body",colors.ink,{wrap:350});for(let k=0;k<2;k++){let y=680+k*40;s("q1_radio"+k,x+16,y,16,16,colors.paper,"ellipse","",{hollow:true,stroke:"#555555",solid:true});t("q1_option"+k,x+42,y-2,["A. ORDER BY","B. HAVING"][k]);}note("Phone study only: full-width question content, visible Ghost navigation trigger and current competition context. Proposed drawer interaction and breakpoint require approval; no runtime responsiveness is claimed.",x);continue;}
const loading=id==="sidebar-loading";t("caption",l,18,loading?"20 · Sidebar loading (proposal)":"21 · Sidebar load failure (proposal)","large");s("frame",l,76,r-l,709,colors.paper);s("sidebar",l,76,w,709,colors.sidebar);put(id,"sidebar_seam",vector(ox+l+w-14,76,14,709,'<rect width="14" height="709" fill="rgb(240,240,240)"/>'));t("app",l+24,110,"**Exam App**");put(id,"toggle_panel",toggle(ox+l+w-36,113));if(loading){for(let k=0;k<2;k++){s("sk_icon"+k,l+24,153+k*42,16,16,colors.skeleton,"rounded");s("sk_label"+k,l+48,157+k*42,160,10,colors.skeleton)}t("status",center-240,365,"Loading competitions…","large","ink",{wrap:480,textAlign:"center"});note("Proposal if the competition list is fetched asynchronously: show navigation skeletons, then automatically select the first available item. Do not start question loading before a valid selection.");}else{t("error",l+24,151,"Could not load competitions.","small",colors.ink,{wrap:216});s("retry",l+24,198,120,36,"#424242","rounded","Retry",{size:"small",ink:"#ffffff"});t("status",center-240,350,"Could not load competitions","large","ink",{wrap:480,textAlign:"center"});t("detail",center-240,393,"Retry from the sidebar.","body",colors.muted,{wrap:480,textAlign:"center"});note("Proposal if loading competitions can fail: Retry reloads navigation, not a question list. No selection exists until navigation loads. Data source and recovery policy remain open.");}}
return out;}
return {states,existing,layout,shared,studies};
}
module.exports=components();
