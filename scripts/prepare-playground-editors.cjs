// Reuse only immutable compiled editor assets, never seeds, screenshots or release manifests.
// All downstream exact-SHA browser and publication gates still run on cache hits.
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {execFileSync}=require('node:child_process');
const hash=b=>createHash('sha256').update(b).digest('hex');
function files(dir,base=dir){
  return fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name)).flatMap(e=>{
    const p=path.join(dir,e.name);
    if(e.isDirectory())return files(p,base);
    if(!e.isFile())throw Error('Unexpected editor cache entry '+p);
    return [{path:path.relative(base,p).split(path.sep).join('/'),sha256:hash(fs.readFileSync(p))}];
  });
}
function prepareEditors({upstream,root,run,pin,types}){
  const known=['design','design-system','motion','whiteboard'];
  if(JSON.stringify(types)!==JSON.stringify(known))throw Error('Review required for new published editor types: '+types.join(','));
  const patches=execFileSync('git',['diff','--binary','HEAD','--','packages','scripts','package-lock.json','package.json'],{cwd:upstream,maxBuffer:16*1024*1024});
  const key=hash(JSON.stringify({pin,types,node:process.version,platform:process.platform,arch:process.arch,image:process.env.ImageVersion??'',patch:hash(patches),helper:hash(fs.readFileSync(__filename))}));
  const base=path.join(root,'.ci-cache','open-artifact-editors');
  const cache=path.join(base,'payload');
  const output=path.join(upstream,'dist','server');
  const required=['support.js',...types.map(t=>'editors/'+t+'/index.html')];
  const metadata=path.join(base,'manifest.json');
  const complete=dir=>required.every(f=>fs.existsSync(path.join(dir,f)));
  const started=Date.now();
  let hit=false;
  if(process.env.CI==='true'&&fs.existsSync(metadata)&&fs.existsSync(cache)){
    try{
      const m=JSON.parse(fs.readFileSync(metadata,'utf8'));
      hit=m.key===key&&complete(cache)&&JSON.stringify(m.files)===JSON.stringify(files(cache));
    }catch(error){console.warn('Editor cache invalid; rebuilding',error.message);}
  }
  if(hit){
    fs.mkdirSync(output,{recursive:true});
    fs.cpSync(cache,output,{recursive:true});
    console.log('Verified editor cache HIT',key,((Date.now()-started)/1000).toFixed(1)+'s');
    return;
  }
  console.log('Editor cache MISS',key);
  // Use upstream's exact support builder and Vite configs, omitting CLI/PDF,
  // unused editors, daemon frame-host and plugin packaging. Upstream support
  // task also builds its own shell/copies, as required by its implementation.
  run(process.execPath,['scripts/build.mjs','--only','support'],upstream);
  for(const type of types){
    run(process.execPath,['node_modules/vite/bin/vite.js','build','--config','packages/'+type+'-editor/vite.config.ts','--logLevel','warn'],upstream);
  }
  if(!complete(output))throw Error('Incomplete selected editor build');
  if(process.env.CI==='true'){
    fs.rmSync(base,{recursive:true,force:true});
    fs.mkdirSync(path.join(cache,'editors'),{recursive:true});
    fs.copyFileSync(path.join(output,'support.js'),path.join(cache,'support.js'));
    for(const type of types)fs.cpSync(path.join(output,'editors',type),path.join(cache,'editors',type),{recursive:true});
    fs.writeFileSync(metadata,JSON.stringify({key,files:files(cache)},null,2));
  }
  console.log('Selected editor build complete',((Date.now()-started)/1000).toFixed(1)+'s');
}
module.exports={prepareEditors};
