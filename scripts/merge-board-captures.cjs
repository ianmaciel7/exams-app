// Merge independent native capture jobs without relabeling older screenshots.
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const THEMES=['dark','light'];
function mergeCaptures(input,output,sha){
  assert.match(sha,/^[a-f0-9]{40}$/);
  const manifests=THEMES.map(t=>JSON.parse(fs.readFileSync(path.join(input,'capture-'+t,'manifest.json'),'utf8')));
  const [a,b]=manifests;
  const refs=JSON.parse(JSON.stringify(a.boards));
  for(const [i,theme] of THEMES.entries()){
    const m=manifests[i];
    assert.equal(m.commit,sha,'Capture SHA mismatch');
    assert.deepEqual(m.captureThemes,[theme],'Capture theme mismatch');
    assert.equal(m.playwrightVersion,a.playwrightVersion,'Playwright version mismatch');
    assert.equal(m.browserVersion,a.browserVersion,'Chromium version mismatch');
    assert.equal(m.boards.length,11);
    assert.equal(new Set(m.boards.map(x=>x.id)).size,11);
    assert.equal(m.boards.find(x=>x.id==='highfidelity')?.states?.length,12);
    assert.equal(m.boards.find(x=>x.id==='midfidelity')?.states?.length,21);
    const seen=new Set();
    function copy(images){
      assert.deepEqual(Object.keys(images),[theme]);
      const name=images[theme];
      assert.match(name,new RegExp('^boards/[a-z0-9-]+-'+theme+'\\.png$'));
      assert.ok(!seen.has(name),'Duplicate capture '+name);seen.add(name);
      const source=path.join(input,'capture-'+theme,name);
      const file=fs.readFileSync(source);
      assert.ok(file.length>24&&file.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),'Invalid PNG '+name);
      const dest=path.join(output,name);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,file);
    }
    for(const [j,board] of m.boards.entries()){
      const ref=refs[j];
      assert.deepEqual([board.id,board.label,board.dir,board.elementCount],[ref.id,ref.label,ref.dir,ref.elementCount],'Board inventory mismatch');
      const meta=JSON.parse(fs.readFileSync(path.join(board.dir,'db/board/meta.json'),'utf8'));
      assert.equal(board.elementCount,meta.order.length);
      copy(board.images);
      assert.deepEqual((board.states??[]).map(s=>s.id),(ref.states??[]).map(s=>s.id),'Section inventory mismatch');
      for(const state of board.states??[])copy(state.images);
      if(i===1){
        Object.assign(ref.images,board.images);
        for(const [k,state] of (board.states??[]).entries())Object.assign(ref.states[k].images,state.images);
      }
    }
  }
  const merged={...a,commit:sha,generatedAt:new Date().toISOString(),captureThemes:THEMES,captureJobs:manifests.map(m=>({theme:m.captureThemes[0],generatedAt:m.generatedAt,commit:m.commit})),boards:refs};
  fs.mkdirSync(output,{recursive:true});fs.writeFileSync(path.join(output,'manifest.json'),JSON.stringify(merged,null,2));
  console.log('Merged fresh captures:',sha,refs.length,'boards, two themes, 12 High-Fidelity sections per theme');
  return merged;
}
if(require.main===module)mergeCaptures(process.argv[2]??'/tmp/capture-parts',process.argv[3]??'_site',process.env.GITHUB_SHA??execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim());
module.exports={mergeCaptures};
