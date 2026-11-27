import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const source='docs/releases/v0.1.0/current-state.json';
export function outputs(s){
 const base="docs/releases/v0.1.0/",out={};
 const txt=(root,id,text)=>out[root+"/db/elements/"+id+".json"]={text};
 const tbl=(root,id,heads,rows)=>out[root+"/db/elements/"+id+".json"]={rows:Object.fromEntries([heads,...rows].map((r,i)=>["r"+i,{at:i,...Object.fromEntries(r.map((v,k)=>["c"+k,v]))}]))};
 const md=(headers,rows)=>["| "+headers.join(" | ")+" |","| "+headers.map(()=> "---").join(" | ")+" |",...rows.map(r=>"| "+r.join(" | ")+" |")].join("\n");
 const block=(path,content)=>out[path]=content.trimEnd()+"\n";
 const run=(e)=>`[${e.commit.slice(0,7)}](https://github.com/ianmaciel7/exams-app/commit/${e.commit}) · [CI ${e.run}](https://github.com/ianmaciel7/exams-app/actions/runs/${e.run})`;
 const evidence=`## Capture evidence\n\nLast verified successful capture: ${run(s.lastSuccessfulCapture)}. Manifest verified: ${s.lastSuccessfulCapture.boardCount} native boards, both Light and Dark. This is evidence for that commit only, not visual approval of the current revision.\n\nLast recorded Mid-Fidelity review requiring changes: ${run(s.lastReviewedCapture)} — ${s.lastReviewedCapture.assessment}\n\nLast recorded planning-board review requiring changes: ${run(s.lastReviewedPlanningCapture)} — ${s.lastReviewedPlanningCapture.assessment}\n\nNew revisions require their own capture; owner visual approval of Mid-Fidelity remains pending.`;
 const status=s.status;
 const common=`${status}\n\n${evidence}`;
 const history=`Historical decisions, source links and prior geometry are preserved in the [pre-reconciliation revision](https://github.com/ianmaciel7/exams-app/tree/165f554320d9077545296c0e252189bb5d0f22e6/docs/releases/v0.1.0). They are not current requirements.`;
 const stageRows=s.stages.map(x=>[x.name,x.status]);
 const inventoryRows=s.inventory.map((v,i)=>[String(i+1),v.id,v.category]);
 const decisionRows=s.decisions;
 const pending=s.pendingDecisions.length?md(["Topic","Status"],s.pendingDecisions):"No outstanding owner decisions in the current decision register.";
 const technical=md(["Topic","Status"],s.technicalValidation??[]);
 const rel="docs/boards/release-stages",hub="docs/boards/project-hub";
 tbl(rel,"stage_table",["Stage","Current status"],stageRows);
 txt(rel,"release_v010_status",s.stageNote);
 txt(hub,"summary",`${s.release} · Mid-Fidelity in progress · ${s.variantCount} variants`);
 txt(hub,"scope",s.hubScope);
 txt(hub,"pending","**Pending review**\nOwner visual approval of Mid-Fidelity and capture review of new revisions. "+(s.pendingDecisions.length?s.pendingDecisions.map(x=>x[0]).join("; "):"Six owner decisions resolved; technical validation remains")+". Later stages not started.");
 for(const [i,x] of s.stages.filter(x=>x.board).entries()){
  txt(hub,"stage_status_"+i,x.status);
  for(const [root,id] of [[hub,"stage_"+i],[rel,"stage_link_"+i]])out[root+"/db/elements/"+id+".json"]={title:x.name,href:"open-artifact://artifact/"+x.artifactId};
 }
 for(const [dir,n] of Object.entries(s.notes))txt(base+dir,"note",n);
 tbl(base+"product","decisions",["Area","Approved decision"],decisionRows);
 tbl(base+"screen-inventory","inventory",["#","State","Category"],inventoryRows);
 tbl(base+"user-flows","transitions",["Event","Result"],s.flows);
 txt(base+"screen-inventory","subtitle",`${s.variantCount} representations of one workspace, not ${s.variantCount} screens/routes`);
 txt(base+"product","subtitle","Current product decisions · Mid-Fidelity in review");
 block(base+"README.md",`# Release ${s.release}\n\n${status}\n\n## Current scope and decisions\n\n${s.approved}\n\n## Stages\n\n${md(["Stage","Current status"],s.stages.map(x=>[x.board?"["+x.name+"]("+x.board+"/README.md)":x.name,x.status]))}\n\n## Open decisions\n\n${pending}\n\n## Technical validation\n\n${technical}\n\n${s.open}\n\n${evidence}\n\n[Canonical release state](current-state.json) · [Ideas Board](../../boards/overview/README.md)\n\n${history}`);
 block(base+"product/README.md",`# Product — ${s.release}\n\n${status}\n\n## Current release baseline\n\nOne workspace for browsing and answering questions of the selected competition. DATAPREV and PPSA are illustrative examples, not a confirmed exam dataset. No additional destinations, scoring, filters, simulations or persistent answer history are approved.\n\n## Approved Mid-Fidelity decisions — 2026-11-27\n\n${s.approved}\n\n${md(["Area","Approved decision"],decisionRows)}\n\nCompetition labels: \`Name · Year · Position/exam\`; use one-line ellipsis on desktop with full-name discovery by hover/focus; wrap labels on phones without relying on hover. PPSA's full position title still requires confirmation. English remains the project-authored design language; the application interface supports Brazilian Portuguese and English. The final page may contain fewer than ten questions; no page-size chooser. Late responses must not restore discarded answers.\n\n## Open decisions\n\n${pending}\n\n## Technical validation\n\n${technical}\n\n${s.open}\n\nEvidence: [QConcursos study](../../../references/2026-11-25-qconcursos-archive-evidence.md) and [historical archive inventory](https://github.com/ianmaciel7/exams-app-archive/blob/main/inventory/exams-app-branch-files.json). Original ExamTopics flow, pagination and retry bytes were not recovered. Scroll reset and manual retry are owner-approved decisions.\n\n${history}\n\n[Current state](../current-state.json) · [Release record](../README.md)`);
 block(base+"screen-inventory/README.md",`# Screen Inventory — ${s.release}\n\n${status}\n\nOne workspace, not separate destinations. Main region contains a scrolling question list, left-aligned Answer/result, and end-of-list pagination. The Ghost control is available across states; collapsed desktop pointer-rest shows the Ghost icon without a background. External component specimens are not additional variants. ${s.responsiveStudies??""}\n\n${md(["#","Native state ID","Review category"],inventoryRows.map(([n,id,cat])=>[n,"\`"+id+"\`",cat]))}\n\n## Boundaries\n\n${s.approved}\n\n${s.open}\n\n[Current state](../current-state.json) · [Mid-Fidelity](../mid-fidelity-wireframe/README.md)\n\n${history}`);
 block(base+"user-flows/README.md",`# User Flows — ${s.release}\n\n${status}\n\n## Approved transitions\n\n${md(["Event","Result"],s.flows)}\n\n${s.approved}\n\nLate responses must not restore discarded answers. Exact cancellation and ambiguous server outcomes require prototype validation. Competition-list Retry is distinct from question-list Retry. Empty competitions and phone overlay drawer are approved; exact behavior requires prototype validation.\n\n${s.open}\n\n[Current state](../current-state.json) · [Product decisions](../product/README.md#approved-mid-fidelity-decisions--2026-11-27)\n\n${history}`);
 block("docs/README.md",`# Project documentation\n\nStart with [Project Hub](boards/project-hub/README.md) or [Ideas Board](boards/overview/README.md). [Release Stages](boards/release-stages/README.md) and [Release ${s.release}](releases/v0.1.0/README.md) summarize current progress. [References](references/) support research, not approved scope.\n\n## Open Artifact\n\nRun \`node scripts/open-boards.mjs\` (Node.js 22+ and Open Artifact CLI required). The launcher registers all ten populated native boards. Set \`OPEN_ARTIFACT_WHITEBOARD_CLI\` to override CLI discovery. Use downloadable native capture artifacts for review.\n\nRun \`node scripts/sync-release-state.mjs --write\` to regenerate planning data and \`node scripts/sync-mid-fidelity.mjs --write\` to synchronize managed wireframe elements. Validate with \`node scripts/check-boards.mjs\` and \`node --test scripts/check-boards.test.mjs scripts/marker-sketch.test.mjs scripts/marker-sketch-ink.test.mjs\`. Structural checks are not visual or functional approval.\n\nFollow [AGENTS.md](../AGENTS.md) and [whiteboard guidelines](boards/whiteboard-guidelines.md).\n\n## Current release\n\n${common}\n\n[PRODUCT.md](../PRODUCT.md) · [DESIGN.md](../DESIGN.md) · [Canonical state](releases/v0.1.0/current-state.json)\n\n[Immutable previous planning snapshot](https://github.com/ianmaciel7/exams-app/tree/bbadef4ceab610f8696fcc10cbee5e400aba4900) · [Archive branch](https://github.com/ianmaciel7/exams-app/tree/archive/v0.1.0-before-reset-20261126).`);
 return {out,evidence};
}
export function syncReleaseState({write=false}={}){
 const state=JSON.parse(readFileSync(source,'utf8'));
 const {out}=outputs(state),errors=[];
 for(const [path,expected] of Object.entries(out)){
  const raw=readFileSync(path,'utf8');
  if(typeof expected==='string'){
   if(raw!==expected){if(write)writeFileSync(path,expected);else errors.push('Generated document drift: '+path);}
  }else{
   const actual=JSON.parse(raw);const mismatch=Object.entries(expected).some(([k,v])=>JSON.stringify(actual[k])!==JSON.stringify(v));
   if(mismatch){if(write)writeFileSync(path,JSON.stringify({...actual,...expected},null,2)+'\n');else errors.push('Generated board drift: '+path);}
  }
 }
 return errors;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){const errors=syncReleaseState({write:process.argv.includes('--write')});if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log('Release projections synchronized');}
