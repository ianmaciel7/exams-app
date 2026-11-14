with open('prototypes/exam-app-0.1.1/js/claude-storage-sync.js', encoding='utf-8') as f:
    engine_code = f.read()

with open('prototypes/exam-app-0.1.1/index.html', encoding='utf-8') as f:
    html = f.read()

# 1. Inline fallback de ClaudeStorageSyncEngine
old_script = '<script src="js/claude-storage-sync.js"></script>'
new_script = '<script src="js/claude-storage-sync.js"></script>\n<script>\nif(typeof ClaudeStorageSyncEngine==="undefined"){\n' + engine_code + '\n}\n</script>'
assert old_script in html, 'old_script not found'
html = html.replace(old_script, new_script, 1)

# 2. saveSpaces com syncEngine
old_spaces = "function saveSpaces(){ store.set('spaces',spaces.filter(s=>s.id!=='dataprev')); store.set('spaceOrder',spaces.map(s=>s.id)); store.set('baseName',BASE_SP.name); }"
new_spaces = "function saveSpaces(){ store.set('spaces',spaces.filter(s=>s.id!=='dataprev')); store.set('spaceOrder',spaces.map(s=>s.id)); store.set('baseName',BASE_SP.name); if(window.syncEngine){ window.syncEngine.enqueue('exam_app_spaces','spaces_list',{spaces:spaces.filter(s=>s.id!=='dataprev'),spaceOrder:spaces.map(s=>s.id),updatedAt:Date.now()}); } }"
assert old_spaces in html, 'old_spaces not found'
html = html.replace(old_spaces, new_spaces, 1)

# 3. studyStats com filtro de deleted
old_stats = "const studyStats=()=>{const a=getAnswers(),done=Object.keys(a).length,correct=Object.values(a).filter(x=>x&&x.correct).length;return {total:70,done,correct,wrong:done-correct,remaining:70-done};};"
new_stats = "const studyStats=()=>{const a=getAnswers(),done=Object.keys(a).filter(k=>a[k]&&!a[k].deleted&&a[k].selected).length,correct=Object.values(a).filter(x=>x&&!x.deleted&&x.correct).length;return {total:70,done,correct,wrong:done-correct,remaining:70-done};};"
assert old_stats in html, 'old_stats not found'
html = html.replace(old_stats, new_stats, 1)

# 4. qSel com checagem de deleted
old_qsel = "function qSel(q){ if(q.user) return uqAns()[q.id]||null; const a=getAnswers()[q.n]; return a?a.selected:null; }"
new_qsel = "function qSel(q){ if(q.user) return uqAns()[q.id]||null; const a=getAnswers()[q.n]; return (a&&!a.deleted)?a.selected:null; }"
assert old_qsel in html, 'old_qsel not found'
html = html.replace(old_qsel, new_qsel, 1)

# 5. nbSave com syncEngine
old_nbsave = "const nbSave=items=>store.set('cadernos',items);"
new_nbsave = "const nbSave=items=>{ store.set('cadernos',items); if(window.syncEngine){ window.syncEngine.enqueue('exam_app_study','cadernos',{cadernos:items,updatedAt:Date.now()}); } };"
assert old_nbsave in html, 'old_nbsave not found'
html = html.replace(old_nbsave, new_nbsave, 1)

# 6. qCorrect com version e deleted: false
old_qcorrect = "else{const a=getAnswers();a[q.n]={selected:val,correct:val===q.gabarito};saveAnswers(a);}"
new_qcorrect = "else{const a=getAnswers(),prev=a[q.n]||{};a[q.n]={selected:val,correct:val===q.gabarito,updatedAt:Date.now(),version:(prev.version||0)+1,deleted:false};saveAnswers(a);}"
assert old_qcorrect in html, 'old_qcorrect not found'
html = html.replace(old_qcorrect, new_qcorrect, 1)

# 7. data-qo-ans e data-qo-reset com tombstones
old_qo = """ const qa=e.target.closest('[data-qo-ans]'); if(qa){ const [id,l]=qa.dataset.qoAns.split('|'); const q=qObjs().find(x=>x.id===id); if(q&&!qSel(q)){ if(q.user){ const m=uqAns(); m[id]=l; store.set('uqAns',m); } else { const a=getAnswers(); a[q.n]={selected:l,correct:l===q.gabarito}; saveAnswers(a); } recHist(q,l===q.gabarito,'Prática',0,l); } rrKeep(); return; }
 const qr=e.target.closest('[data-qo-reset]'); if(qr){ const q=qObjs().find(x=>x.id===qr.dataset.qoReset); if(q){ if(q.user){ const m=uqAns(); delete m[q.id]; store.set('uqAns',m); } else { const a=getAnswers(); delete a[q.n]; saveAnswers(a); } } rr0(); return; }"""

new_qo = """ const qa=e.target.closest('[data-qo-ans]'); if(qa){ const [id,l]=qa.dataset.qoAns.split('|'); const q=qObjs().find(x=>x.id===id); if(q&&!qSel(q)){ if(q.user){ const m=uqAns(); m[id]=l; store.set('uqAns',m); } else { const a=getAnswers(),prev=a[q.n]||{}; a[q.n]={selected:l,correct:l===q.gabarito,updatedAt:Date.now(),version:(prev.version||0)+1,deleted:false}; saveAnswers(a); } recHist(q,l===q.gabarito,'Prática',0,l); } rrKeep(); return; }
 const qr=e.target.closest('[data-qo-reset]'); if(qr){ const q=qObjs().find(x=>x.id===qr.dataset.qoReset); if(q){ if(q.user){ const m=uqAns(); delete m[q.id]; store.set('uqAns',m); } else { const a=getAnswers(),prev=a[q.n]||{}; a[q.n]={selected:null,correct:null,updatedAt:Date.now(),version:(prev.version||0)+1,deleted:true}; saveAnswers(a); } } rr0(); return; }"""

assert old_qo in html, 'old_qo not found'
html = html.replace(old_qo, new_qo, 1)

with open('prototypes/exam-app-0.1.1/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print('index.html atualizado com sucesso!')
