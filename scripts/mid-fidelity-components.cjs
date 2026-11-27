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
function shared(){
const out={};const put=(id,n,e)=>out[id+"_"+n]=e;
for(const id of existing){const {ox,l,w,center}=layout(id);put(id,"toggle_panel",toggle(ox+(id==="collapsed"?l+24:l+w-38),111));if(id!=="no-items")for(let k=0;k<2;k++)put(id,"nav_icon"+k,icon(ox+l+24,153+k*42,k));if(["end","page-middle","page-last"].includes(id)){const x=center-180;put(id,"prev_upper",chevron(ox+x,729,false,id==="end"));put(id,"next_upper",chevron(ox+x+337,729,true,id==="page-last"));}}
return out;}
function studies(){
const out={};const put=(id,n,e)=>out[id+"_"+n]=e;
for(const id of states.slice(18)){
const {ox,l,r,w,main,center}=layout(id);
const t=(n,x,y,v,size="body",color="ink",more={})=>put(id,n,text(ox+x,y,v,size,color,more));
const s=(n,x,y,ww,h,color,kind="rect",label="",more={})=>put(id,n,shape(ox+x,y,ww,h,color,kind,label,more));
const note=(v,x=56)=>put(id,"note",{type:"note",x:ox+x,y:875,w:640,h:120,color:"yellow",text:v});
if(id==="mobile"){
const x=460,ww=390;t("caption",x,18,"19 · Phone layout (proposal)","large");s("frame",x,76,ww,709,colors.paper);t("app",x+44,100,"**Exam App**");put(id,"toggle_panel",toggle(ox+x+16,101));t("context",x+16,145,"DATAPREV · 2026 · Analyst…","small",colors.muted);t("q0_title",x+16,194,"**Question 1**");t("q0_stem",x+16,226,"Which HTTP method is defined as safe and idempotent?","body",colors.ink,{wrap:350});for(let k=0;k<5;k++){let y=298+k*40;s("q0_radio"+k,x+16,y,16,16,colors.paper,"ellipse","",{hollow:true,stroke:"#555555",solid:true});t("q0_option"+k,x+42,y-2,String.fromCharCode(65+k)+". "+["POST","GET","PATCH","CONNECT","None of the above"][k]);}s("q0_answer",x+16,508,120,36,"#e6e6e6","rounded","Answer",{size:"small",ink:colors.muted});t("q1_title",x+16,576,"**Question 2**");t("q1_stem",x+16,608,"Which SQL clause filters rows before grouping?","body",colors.ink,{wrap:350});for(let k=0;k<2;k++){let y=680+k*40;s("q1_radio"+k,x+16,y,16,16,colors.paper,"ellipse","",{hollow:true,stroke:"#555555",solid:true});t("q1_option"+k,x+42,y-2,["A. ORDER BY","B. HAVING"][k]);}note("Phone study only: full-width question content, visible Ghost navigation trigger and current competition context. Proposed drawer interaction and breakpoint require approval; no runtime responsiveness is claimed.",x);continue;}
const loading=id==="sidebar-loading";t("caption",l,18,loading?"20 · Sidebar loading (proposal)":"21 · Sidebar load failure (proposal)","large");s("frame",l,76,r-l,709,colors.paper);s("sidebar",l,76,w,709,colors.sidebar);put(id,"sidebar_seam",vector(ox+l+w-14,76,14,709,'<rect width="14" height="709" fill="rgb(240,240,240)"/>'));t("app",l+24,110,"**Exam App**");put(id,"toggle_panel",toggle(ox+l+w-38,111));if(loading){for(let k=0;k<2;k++){s("sk_icon"+k,l+24,153+k*42,16,16,colors.skeleton,"rounded");s("sk_label"+k,l+48,157+k*42,160,10,colors.skeleton)}t("status",center-240,365,"Loading competitions…","large","ink",{wrap:480,textAlign:"center"});note("Proposal if the competition list is fetched asynchronously: show navigation skeletons, then automatically select the first available item. Do not start question loading before a valid selection.");}else{t("error",l+24,151,"Could not load competitions.","small",colors.ink,{wrap:216});s("retry",l+24,198,120,36,"#424242","rounded","Retry",{size:"small",ink:"#ffffff"});t("status",center-240,350,"Could not load competitions","large","ink",{wrap:480,textAlign:"center"});t("detail",center-240,393,"Retry from the sidebar.","body",colors.muted,{wrap:480,textAlign:"center"});note("Proposal if loading competitions can fail: Retry reloads navigation, not a question list. No selection exists until navigation loads. Data source and recovery policy remain open.");}}
return out;}
return {states,existing,layout,shared,studies};
}
module.exports=components();
