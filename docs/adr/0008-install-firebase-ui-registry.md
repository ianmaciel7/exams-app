# ADR 0008: Install Firebase UI registry

- **Status**: Accepted
- **Date**: 2026-10-19
- **Deciders**: ianmaciel7

## Context

Firebase Open Source publishes UI components (authentication forms, screens,
OAuth buttons, multi-factor flows) as a shadcn registry at
`https://firebaseopensource.com/r/{name}.json`. The shadcn CLI has no
documented option that installs a whole registry, so `shadcn add @firebase --all`
is not available. The registry grows over time, so a hardcoded component list
would go stale, and a committed installer script or `package.json` script would
add maintained code for a one-off operation.

The installation is intended to work on Windows PowerShell, Windows CMD, Linux,
and macOS and to protect existing project files; those properties have not been
verified across all shells, and the command's protection has limits below.

Three further constraints came from running the first version of the command:

- A `shadcn add` exit code is not proof of a complete install. The first
  version printed `Done: 30 components installed` after calls that exited with
  code 0 while only two component files had been written.
- The registry sources assume a flat `src/components/` layout and a few import
  paths are wrong or undeclared, so a faithful copy does not type-check as is.
- The vendored sources are upstream code. If formatters, lint autofixes, or
  agents edit them, the project can no longer tell its own changes from
  upstream's, and a later update cannot be reviewed.

## Decision

Install every component with one copy-and-paste `node -e` command. The command
creates the reference files and manifest, may modify the stylesheet, dependency
files and package-manager state, adds no package scripts, and keeps no component
list. The integrity test and tool configuration are separate setup steps.

All Firebase UI components live under `src/components/firebase/`, never
directly under `src/components/` or `src/components/ui/`. That directory was initially configured as an immutable, read-only upstream reference layer (subsequently amended to follow shadcn's local source-ownership model; see Amendment below):

- No one edits the vendored files by hand, and no application-owned component
  goes in the directory. shadcn/ui primitives stay in `src/components/ui/`.
- Formatters, lint autofixes, and agents must not modify it. Read-only means
  architectural immutability enforced by an automated integrity check, not by
  operating-system file permissions, so `chmod`, `attrib`, and ACLs are not used.
- The layer changes only through the explicit update procedure below.

Verified against shadcn CLI 4.22.1, `shadcn list @firebase --json` returns:

```json
{
  "pagination": { "total": 30, "offset": 0, "limit": 100, "hasMore": false },
  "items": [
    {
      "name": "apple-sign-in-button",
      "registry": "@firebase",
      "addCommandArgument": "@firebase/apple-sign-in-button"
    }
  ]
}
```

An offset past the end returns `items: []` with `hasMore: false`.

Each registry item at `https://firebaseopensource.com/r/<name>.json` carries the
metadata the command relies on:

- `files[].path` is `src/components/<name>.tsx`; its basename is the expected
  installed file.
- `dependencies` lists npm packages (for example `@firebase-oss/ui-react`).
- `registryDependencies` mixes bare names (`button`, `separator`), which are
  shadcn/ui primitives, with full `https://firebaseopensource.com/r/<name>.json`
  URLs, which are other Firebase components.

`npx shadcn view <names>` returns, for primitives, their own
`registryDependencies` and file names (for example `field` depends on `label`
and `separator`) in the project's style.

The command runs in one of two modes. The argument is passed after the closing
quote: `node -e "<command>" update`.

**Default mode** installs when `src/components/firebase/` is absent and only
verifies when it exists. It never regenerates the manifest, and it exits with an
error when the manifest is missing or the layer differs from it.

**`update` mode** is the explicit maintenance mode and the only way to create or
refresh the manifest. It backs up the current layer to the operating system's
temporary directory, deletes it, installs from scratch, prints the added,
removed, and modified files against the previous manifest, writes the new
manifest, re-reads the layer to verify it, and removes the backup. Some detected
failures restore the previous layer, but rollback is not transactional; see
the recovery instructions below. Normal
read-only enforcement needs no step to restore: the guard in `tests/unit/` runs
on every test run.

The command:

1. Reads `components.json` and exits with an error unless
   `registries["@firebase"]` is a URL template containing `{name}`. It never
   writes to `components.json`.
2. Prints the shadcn CLI version, then pages through `npx --yes shadcn@latest
   list @firebase --json --limit 100 --offset N`, advancing by the number of
   returned items until `hasMore` is false or a page is empty. It validates the
   response shape on every page.
3. Keeps items whose `registry` is `@firebase` and whose `addCommandArgument`
   matches `@firebase/<slug>`, de-duplicates them in a `Set`, and warns about
   anything skipped.
4. Fetches each item's metadata and builds the expected file inventory, the
   npm dependencies, and the primitive set. A `registryDependency` that is a
   URL must be one of the discovered Firebase items. The primitive set is then
   expanded transitively with `shadcn view`, so the file names that the shadcn
   registry itself declares for those primitives are known.
5. Runs `npx --yes shadcn@latest add <up to 10 items> --path
   src/components/firebase --yes` per batch, without `--overwrite`.
6. After the last batch, normalizes imports. An import of `@/components/<name>`
   whose `<name>.tsx` is a Firebase file in the inventory is rewritten to
   `@/components/firebase/<name>`. Imports of `@/components/ui/` are never
   changed. This runs once, after all batches, so a component installed in a
   different batch than its dependent resolves the same way.
7. Removes shadcn primitive copies with registry evidence. A file in
   `src/components/firebase/` is deleted only when all of these hold: it is
   not in the Firebase inventory, the shadcn registry declares that file name
   for a primitive, a file of that name exists in the directory named by
   `aliases.ui`, and no Firebase file imports the copy. A file whose owner
   cannot be determined stops the run with an error and nothing else is deleted.
   A matching file name alone is never enough.
8. Verifies the result and rejects an incomplete install even when every
   `shadcn add` exited with code 0: every expected file must exist, no new file
   may appear elsewhere under `src/components/`, and every `@/components/...`
   import in the layer must resolve. It reports the number of expected files
   present, the primitives removed, and the files whose imports were normalized.
9. Scans the layer's bare imports and the metadata dependencies, and adds those
   missing from `package.json` with the package manager that matches the
   lockfile (`pnpm`, `yarn`, `bun`, or `npm`). A package named in the peer
   dependencies of `@firebase-oss/ui-react` uses the highest major in that
   range (`firebase@12`), and one named in its dependencies uses that version.
   In default mode it reports undeclared packages instead of installing them.
10. Prints a notice when the Tailwind stylesheet from `components.json` changed,
    because the registry installer merges CSS.
11. Exits with code 1 and an `ERROR:` message on any failure.

`--path` is declared as `-p, --path <path>` ("the path to add the component to")
by the `add` command. Running it with `--path src/components/firebase` on shadcn
CLI 4.22.1 wrote every file of every item into that single directory, and the
imports between Firebase files were rewritten to
`@/components/firebase/<name>`. The primitives (`button`, `input`, `label`,
`select`, `card`, `alert`, `field`, `separator`, `input-otp`) are also written
there, as copies that differ from the project's `src/components/ui/` files. The
Firebase components import primitives from `@/components/ui/`, so the copies are
unused; the shadcn CLI has no option to skip registry dependencies, so step 7
removes them. The project's `src/components/ui/` files are not modified.

The command is cross-platform because it uses `child_process.execSync` with a
command string, which avoids the Windows `npx.cmd` spawn restriction, and
`fetch`, which needs no shell. Its JavaScript uses only single quotes and avoids
double quotes inside the command, `$`, backticks, and `%`. Carets, `&&`, and `||`
appear only inside the double-quoted argument, where CMD and PowerShell treat them
as literal text, so one string should work in PowerShell, CMD, and POSIX shells. The CMD command line is
limited to 8,191 characters; the command is 7,965 characters long.

```bash
node -e "const fs=require('fs'),cp=require('child_process'),cr=require('crypto'),os=require('os'),P='npx --yes shadcn@latest ',D='src/components/firebase',M='tests/unit/firebase-reference.manifest.sha256',LF=String.fromCharCode(10),CR=String.fromCharCode(13),Q=[34,39].map(x=>String.fromCharCode(x)),ex=fs.existsSync,J=f=>JSON.parse(fs.readFileSync(f,'utf8')),die=m=>{console.error('ERROR: '+m);process.exit(1)},U=process.argv[1]==='update';if(process.argv.length>2||(process.argv[1]&&!U))die('usage: node -e <command> [update]');let c;try{c=J('components.json')}catch(e){die('cannot read components.json in '+process.cwd()+' ('+e.message+')')}const r=c.registries&&c.registries['@firebase'];if(typeof r!=='string'||r.indexOf('{name}')<0)die('components.json needs registries[@firebase] = https://firebaseopensource.com/r/{name}.json (add it manually; it is not modified here)');const UI=((c.aliases&&c.aliases.ui)||'@/components/ui').replace('@/','src/'),CSS=c.tailwind&&c.tailwind.css,W=(d,p)=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?W(d+'/'+e.name,p+e.name+'/'):[p+e.name]),H=f=>cr.createHash('sha256').update(fs.readFileSync(f,'utf8').split(CR+LF).join(LF)).digest('hex'),S=()=>{const m={};if(ex(D))for(const f of W(D,'').sort())m[f]=H(D+'/'+f);return m},R=()=>{const m={};if(ex(M))for(const l of fs.readFileSync(M,'utf8').split(CR+LF).join(LF).split(LF)){const i=l.indexOf('  ');if(i>0)m[l.slice(i+2)]=l.slice(0,i)}return m},C=(a,b)=>({added:Object.keys(b).filter(k=>!(k in a)),removed:Object.keys(a).filter(k=>!(k in b)),modified:Object.keys(a).filter(k=>k in b&&a[k]!==b[k])}),Z=d=>!d.added.length&&!d.removed.length&&!d.modified.length,run=s=>cp.execSync(s,{encoding:'utf8',stdio:['ignore','pipe','inherit'],maxBuffer:50000000}),O=()=>ex('src/components')?W('src/components','').filter(f=>f.indexOf('firebase/')!==0):[];(async()=>{const found=new Set();let off=0;console.log('shadcn CLI '+run(P+'--version').trim());for(;;){let o;try{o=JSON.parse(run(P+'list @firebase --json --limit 100 --offset '+off))}catch(e){die('listing failed at offset '+off+': '+e.message)}if(!o||!Array.isArray(o.items))die('unexpected list response at offset '+off);for(const i of o.items){const a=i&&i.addCommandArgument;if(i.registry==='@firebase'&&typeof a==='string'&&/^@firebase\/[a-z0-9][a-z0-9._-]*$/.test(a))found.add(a);else console.warn('skipping unrecognised item: '+JSON.stringify(i&&i.name))}off+=o.items.length;if(!o.items.length||!(o.pagination&&o.pagination.hasMore))break}const all=[...found];if(!all.length)die('no @firebase components discovered');console.log('Discovered '+all.length+' @firebase components'+(U?' (update mode)':''));const EXP=new Set,PRIM=new Set,DEP=new Set;for(const s of all){let j;try{const x=await fetch(r.replace('{name}',s.slice(10)));if(!x.ok)throw new Error('HTTP '+x.status);j=await x.json()}catch(e){die('metadata for '+s+' failed: '+e.message)}if(j.name!==s.slice(10)||!Array.isArray(j.files)||!j.files.length)die('unexpected metadata for '+s);j.files.forEach(f=>EXP.add(f.path.split('/').pop()));(j.dependencies||[]).forEach(d=>DEP.add(d));(j.registryDependencies||[]).forEach(d=>{if(d.indexOf('http')!==0)PRIM.add(d);else if(!found.has('@firebase/'+d.split('/').pop().replace('.json','')))die('unexpected registry dependency '+d+' in '+s)})}const PF=new Set,sn=new Set;for(;;){const b=[...PRIM].filter(n=>!sn.has(n));if(!b.length)break;b.forEach(n=>sn.add(n));let v;try{v=JSON.parse(run(P+'view '+b.join(' ')))}catch(e){die('shadcn view failed for '+b.join(' ')+': '+e.message)}if(!Array.isArray(v))die('unexpected shadcn view response');v.forEach(i=>{(i.files||[]).forEach(f=>PF.add(f.path.split('/').pop()));(i.registryDependencies||[]).forEach(d=>{if(d.indexOf('http')!==0)PRIM.add(d)})})}const T=()=>ex(D)?W(D,'').filter(f=>f.slice(-4)==='.tsx'):[],F=f=>fs.readFileSync(D+'/'+f,'utf8'),B=new Set(O()),K=CSS&&ex(CSS)?H(CSS):'',bak=os.tmpdir()+'/firebase-ui-backup-'+Date.now(),rm=[],fix=[];const back=()=>{if(U&&ex(bak)){fs.rmSync(D,{recursive:true,force:true});fs.cpSync(bak,D,{recursive:true});console.error('previous reference layer restored')}};const fail=m=>{back();die(m)};const inst=U||!ex(D);if(U&&ex(D)){fs.cpSync(D,bak,{recursive:true});fs.rmSync(D,{recursive:true,force:true})}if(inst){for(let n=0;n<all.length;n+=10){const b=all.slice(n,n+10);console.log('Installing '+(n+1)+'-'+(n+b.length)+' of '+all.length+': '+b.join(' '));try{cp.execSync(P+'add '+b.join(' ')+' --path '+D+' --yes',{stdio:'inherit'})}catch(e){fail('shadcn add failed for batch starting at '+(n+1))}}for(const f of T()){const t=F(f),n=t.replace(new RegExp('from (.)@/components/([a-z0-9-]+)(.)','g'),(m,a,b,d)=>Q.includes(a)&&a===d&&EXP.has(b+'.tsx')?'from '+a+'@/components/firebase/'+b+a:m);if(n!==t){fs.writeFileSync(D+'/'+f,n);fix.push(f)}}const kept=[];for(const f of fs.readdirSync(D)){if(EXP.has(f))continue;const n=f.slice(0,f.lastIndexOf('.'));if(PF.has(f)&&ex(UI+'/'+f)&&!T().some(g=>Q.some(q=>F(g).indexOf('@/components/firebase/'+n+q)>=0))){fs.unlinkSync(D+'/'+f);rm.push(f)}else kept.push(f)}if(kept.length)fail('cannot determine the owner of '+kept.join(', ')+'; nothing else was deleted');const mis=O().filter(f=>!B.has(f));if(mis.length)fail('files outside '+D+': '+mis.join(', '))}const miss=[...EXP].filter(f=>!ex(D+'/'+f)),bad=[],pk=new Set(DEP);for(const f of T())for(const ch of F(f).split('from ').slice(1)){const q=ch[0];if(!Q.includes(q))continue;const s=ch.slice(1,ch.indexOf(q,1));if(s.indexOf('@/components/')===0){const p='src/'+s.slice(2);if(!(ex(p+'.tsx')||ex(p+'.ts')||ex(p+'/index.tsx')))bad.push(f+' -> '+s)}else if(s[0]!=='.'&&s.indexOf('@/')!==0&&s.indexOf('node:')!==0){const g=s.split('/');pk.add(s[0]==='@'?g[0]+'/'+g[1]:g[0])}}console.log('Firebase files present: '+(EXP.size-miss.length)+'/'+EXP.size+(rm.length?'; shadcn primitive copies removed: '+rm.join(', '):'')+(fix.length?'; imports normalized in: '+fix.join(', '):''));if(miss.length)fail('missing expected files: '+miss.join(', '));if(bad.length)fail('unresolved imports: '+bad.join('; '));const pj=J('package.json'),have=Object.assign({},pj.dependencies,pj.devDependencies),need=[...pk].filter(n=>!have[n]&&!require('module').builtinModules.includes(n));if(need.length){if(!inst)die('undeclared dependencies: '+need.join(', '));const up=ex('node_modules/@firebase-oss/ui-react/package.json')?J('node_modules/@firebase-oss/ui-react/package.json'):{},v=n=>{const x=(up.peerDependencies||{})[n],y=(up.dependencies||{})[n];return n+(x?'@'+x.split('||').pop().trim().replace('^','').replace('~',''):y?'@'+y.replace('^','').replace('~',''):'')},pm=ex('pnpm-lock.yaml')?'pnpm add ':ex('yarn.lock')?'yarn add ':ex('bun.lock')||ex('bun.lockb')?'bun add ':'npm install ';console.log('Adding direct dependencies: '+need.map(v).join(' '));try{cp.execSync(pm+need.map(v).join(' '),{stdio:'inherit'})}catch(e){fail('dependency install failed')}}if(CSS&&ex(CSS)&&H(CSS)!==K)console.log('NOTICE: '+CSS+' was modified by the registry installer (CSS merge); review its diff');const now=S(),n2=Object.keys(now).length;if(U){const d=C(R(),now);console.log('Changes against the previous manifest:');if(Z(d))console.log('  (none)');else{d.added.forEach(k=>console.log('  + '+k));d.removed.forEach(k=>console.log('  - '+k));d.modified.forEach(k=>console.log('  ~ '+k))}fs.mkdirSync('tests/unit',{recursive:true});fs.writeFileSync(M,Object.keys(now).sort().map(k=>now[k]+'  '+k).join(LF)+LF);if(!Z(C(R(),S())))fail('integrity check failed after update');fs.rmSync(bak,{recursive:true,force:true});console.log('Manifest regenerated for '+n2+' files; integrity verified')}else{const d=C(R(),now);if(!ex(M))die('no baseline manifest; run the command with the update argument to approve it');if(!Z(d))die('reference layer differs from the manifest (+'+d.added+' -'+d.removed+' ~'+d.modified+'); run with the update argument to accept');console.log('Integrity verified: '+n2+' reference files match the manifest')}})().catch(e=>die(e.message))"
```

Run `update` once to install and approve the first baseline:

```bash
node -e "const fs=require('fs'),cp=require('child_process'),cr=require('crypto'),os=require('os'),P='npx --yes shadcn@latest ',D='src/components/firebase',M='tests/unit/firebase-reference.manifest.sha256',LF=String.fromCharCode(10),CR=String.fromCharCode(13),Q=[34,39].map(x=>String.fromCharCode(x)),ex=fs.existsSync,J=f=>JSON.parse(fs.readFileSync(f,'utf8')),die=m=>{console.error('ERROR: '+m);process.exit(1)},U=process.argv[1]==='update';if(process.argv.length>2||(process.argv[1]&&!U))die('usage: node -e <command> [update]');let c;try{c=J('components.json')}catch(e){die('cannot read components.json in '+process.cwd()+' ('+e.message+')')}const r=c.registries&&c.registries['@firebase'];if(typeof r!=='string'||r.indexOf('{name}')<0)die('components.json needs registries[@firebase] = https://firebaseopensource.com/r/{name}.json (add it manually; it is not modified here)');const UI=((c.aliases&&c.aliases.ui)||'@/components/ui').replace('@/','src/'),CSS=c.tailwind&&c.tailwind.css,W=(d,p)=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?W(d+'/'+e.name,p+e.name+'/'):[p+e.name]),H=f=>cr.createHash('sha256').update(fs.readFileSync(f,'utf8').split(CR+LF).join(LF)).digest('hex'),S=()=>{const m={};if(ex(D))for(const f of W(D,'').sort())m[f]=H(D+'/'+f);return m},R=()=>{const m={};if(ex(M))for(const l of fs.readFileSync(M,'utf8').split(CR+LF).join(LF).split(LF)){const i=l.indexOf('  ');if(i>0)m[l.slice(i+2)]=l.slice(0,i)}return m},C=(a,b)=>({added:Object.keys(b).filter(k=>!(k in a)),removed:Object.keys(a).filter(k=>!(k in b)),modified:Object.keys(a).filter(k=>k in b&&a[k]!==b[k])}),Z=d=>!d.added.length&&!d.removed.length&&!d.modified.length,run=s=>cp.execSync(s,{encoding:'utf8',stdio:['ignore','pipe','inherit'],maxBuffer:50000000}),O=()=>ex('src/components')?W('src/components','').filter(f=>f.indexOf('firebase/')!==0):[];(async()=>{const found=new Set();let off=0;console.log('shadcn CLI '+run(P+'--version').trim());for(;;){let o;try{o=JSON.parse(run(P+'list @firebase --json --limit 100 --offset '+off))}catch(e){die('listing failed at offset '+off+': '+e.message)}if(!o||!Array.isArray(o.items))die('unexpected list response at offset '+off);for(const i of o.items){const a=i&&i.addCommandArgument;if(i.registry==='@firebase'&&typeof a==='string'&&/^@firebase\/[a-z0-9][a-z0-9._-]*$/.test(a))found.add(a);else console.warn('skipping unrecognised item: '+JSON.stringify(i&&i.name))}off+=o.items.length;if(!o.items.length||!(o.pagination&&o.pagination.hasMore))break}const all=[...found];if(!all.length)die('no @firebase components discovered');console.log('Discovered '+all.length+' @firebase components'+(U?' (update mode)':''));const EXP=new Set,PRIM=new Set,DEP=new Set;for(const s of all){let j;try{const x=await fetch(r.replace('{name}',s.slice(10)));if(!x.ok)throw new Error('HTTP '+x.status);j=await x.json()}catch(e){die('metadata for '+s+' failed: '+e.message)}if(j.name!==s.slice(10)||!Array.isArray(j.files)||!j.files.length)die('unexpected metadata for '+s);j.files.forEach(f=>EXP.add(f.path.split('/').pop()));(j.dependencies||[]).forEach(d=>DEP.add(d));(j.registryDependencies||[]).forEach(d=>{if(d.indexOf('http')!==0)PRIM.add(d);else if(!found.has('@firebase/'+d.split('/').pop().replace('.json','')))die('unexpected registry dependency '+d+' in '+s)})}const PF=new Set,sn=new Set;for(;;){const b=[...PRIM].filter(n=>!sn.has(n));if(!b.length)break;b.forEach(n=>sn.add(n));let v;try{v=JSON.parse(run(P+'view '+b.join(' ')))}catch(e){die('shadcn view failed for '+b.join(' ')+': '+e.message)}if(!Array.isArray(v))die('unexpected shadcn view response');v.forEach(i=>{(i.files||[]).forEach(f=>PF.add(f.path.split('/').pop()));(i.registryDependencies||[]).forEach(d=>{if(d.indexOf('http')!==0)PRIM.add(d)})})}const T=()=>ex(D)?W(D,'').filter(f=>f.slice(-4)==='.tsx'):[],F=f=>fs.readFileSync(D+'/'+f,'utf8'),B=new Set(O()),K=CSS&&ex(CSS)?H(CSS):'',bak=os.tmpdir()+'/firebase-ui-backup-'+Date.now(),rm=[],fix=[];const back=()=>{if(U&&ex(bak)){fs.rmSync(D,{recursive:true,force:true});fs.cpSync(bak,D,{recursive:true});console.error('previous reference layer restored')}};const fail=m=>{back();die(m)};const inst=U||!ex(D);if(U&&ex(D)){fs.cpSync(D,bak,{recursive:true});fs.rmSync(D,{recursive:true,force:true})}if(inst){for(let n=0;n<all.length;n+=10){const b=all.slice(n,n+10);console.log('Installing '+(n+1)+'-'+(n+b.length)+' of '+all.length+': '+b.join(' '));try{cp.execSync(P+'add '+b.join(' ')+' --path '+D+' --yes',{stdio:'inherit'})}catch(e){fail('shadcn add failed for batch starting at '+(n+1))}}for(const f of T()){const t=F(f),n=t.replace(new RegExp('from (.)@/components/([a-z0-9-]+)(.)','g'),(m,a,b,d)=>Q.includes(a)&&a===d&&EXP.has(b+'.tsx')?'from '+a+'@/components/firebase/'+b+a:m);if(n!==t){fs.writeFileSync(D+'/'+f,n);fix.push(f)}}const kept=[];for(const f of fs.readdirSync(D)){if(EXP.has(f))continue;const n=f.slice(0,f.lastIndexOf('.'));if(PF.has(f)&&ex(UI+'/'+f)&&!T().some(g=>Q.some(q=>F(g).indexOf('@/components/firebase/'+n+q)>=0))){fs.unlinkSync(D+'/'+f);rm.push(f)}else kept.push(f)}if(kept.length)fail('cannot determine the owner of '+kept.join(', ')+'; nothing else was deleted');const mis=O().filter(f=>!B.has(f));if(mis.length)fail('files outside '+D+': '+mis.join(', '))}const miss=[...EXP].filter(f=>!ex(D+'/'+f)),bad=[],pk=new Set(DEP);for(const f of T())for(const ch of F(f).split('from ').slice(1)){const q=ch[0];if(!Q.includes(q))continue;const s=ch.slice(1,ch.indexOf(q,1));if(s.indexOf('@/components/')===0){const p='src/'+s.slice(2);if(!(ex(p+'.tsx')||ex(p+'.ts')||ex(p+'/index.tsx')))bad.push(f+' -> '+s)}else if(s[0]!=='.'&&s.indexOf('@/')!==0&&s.indexOf('node:')!==0){const g=s.split('/');pk.add(s[0]==='@'?g[0]+'/'+g[1]:g[0])}}console.log('Firebase files present: '+(EXP.size-miss.length)+'/'+EXP.size+(rm.length?'; shadcn primitive copies removed: '+rm.join(', '):'')+(fix.length?'; imports normalized in: '+fix.join(', '):''));if(miss.length)fail('missing expected files: '+miss.join(', '));if(bad.length)fail('unresolved imports: '+bad.join('; '));const pj=J('package.json'),have=Object.assign({},pj.dependencies,pj.devDependencies),need=[...pk].filter(n=>!have[n]&&!require('module').builtinModules.includes(n));if(need.length){if(!inst)die('undeclared dependencies: '+need.join(', '));const up=ex('node_modules/@firebase-oss/ui-react/package.json')?J('node_modules/@firebase-oss/ui-react/package.json'):{},v=n=>{const x=(up.peerDependencies||{})[n],y=(up.dependencies||{})[n];return n+(x?'@'+x.split('||').pop().trim().replace('^','').replace('~',''):y?'@'+y.replace('^','').replace('~',''):'')},pm=ex('pnpm-lock.yaml')?'pnpm add ':ex('yarn.lock')?'yarn add ':ex('bun.lock')||ex('bun.lockb')?'bun add ':'npm install ';console.log('Adding direct dependencies: '+need.map(v).join(' '));try{cp.execSync(pm+need.map(v).join(' '),{stdio:'inherit'})}catch(e){fail('dependency install failed')}}if(CSS&&ex(CSS)&&H(CSS)!==K)console.log('NOTICE: '+CSS+' was modified by the registry installer (CSS merge); review its diff');const now=S(),n2=Object.keys(now).length;if(U){const d=C(R(),now);console.log('Changes against the previous manifest:');if(Z(d))console.log('  (none)');else{d.added.forEach(k=>console.log('  + '+k));d.removed.forEach(k=>console.log('  - '+k));d.modified.forEach(k=>console.log('  ~ '+k))}fs.mkdirSync('tests/unit',{recursive:true});fs.writeFileSync(M,Object.keys(now).sort().map(k=>now[k]+'  '+k).join(LF)+LF);if(!Z(C(R(),S())))fail('integrity check failed after update');fs.rmSync(bak,{recursive:true,force:true});console.log('Manifest regenerated for '+n2+' files; integrity verified')}else{const d=C(R(),now);if(!ex(M))die('no baseline manifest; run the command with the update argument to approve it');if(!Z(d))die('reference layer differs from the manifest (+'+d.added+' -'+d.removed+' ~'+d.modified+'); run with the update argument to accept');console.log('Integrity verified: '+n2+' reference files match the manifest')}})().catch(e=>die(e.message))" update
```

> [!NOTE]
> The SHA-256 manifest and integrity test described in this section were subsequently retired when adopting the local source-ownership model (see Amendment below). Registry updates are managed via source diffs rather than automated hash manifests.

`tests/unit/firebase-reference.test.ts` and
`tests/unit/firebase-reference.manifest.sha256` protect the layer:

- The manifest has one `<sha256>  <relative path>` line per file, sorted, with LF
  endings. The test lists the directory recursively, hashes each file after
  normalizing CRLF to LF, and fails on any modified, deleted, or unexpected
  file. It does not hardcode the number or the names of components.
- The test runs in the Vitest `unit` project, which `pnpm test`,
  `pnpm verify:fast`, and `pnpm verify:static` (the CI `static` job, through
  `pnpm test:coverage`) execute. `vitest.config.mts` includes `tests/unit/`, and
  `playwright.config.ts` restricts Playwright to `*.spec.ts` so it does not pick
  the Vitest file up.
- Tests and normal installs never write the manifest; only `update` does.

These changes keep automated tools from rewriting the layer or reporting upstream
code as project defects. Application-owned code is still validated, and no rule
was changed.

| Tool | Change |
| --- | --- |
| Biome (and so `lint-staged`) | `!src/components/firebase` in `files.includes` |
| TypeScript | `src/components/firebase` excluded in `tsconfig.build.json`, but included in the editor's `tsconfig.json` |
| CSpell | `src/components/firebase` in `ignorePaths` |
| jscpd | `**/components/firebase/**` in `ignore` |
| Knip | `unresolved` ignored for `src/components/firebase/**` only |
| Vitest coverage | `src/components/firebase/**` in `exclude` |
| Fallow health, React Doctor | `src/components/firebase/**` ignored |

Dependency-cruiser and ast-grep still scan the layer. Dependency-cruiser reports
no violation. ast-grep reports one `no-hardcoded-ui-attribute` warning in
the multi-factor enrollment form that renders a QR code, left unfixed because
the file is immutable. GritQL rules apply through Biome, which skips the directory. Excluding
the directory from TypeScript does not make its code safe to import: TypeScript
still checks any file the application imports.

The root `tsconfig.json` includes the Firebase files so the editor applies the
project's `@/*` alias and reports their actual type errors. The separate root
`tsconfig.build.json` extends it and excludes the reference layer. Next.js uses
that build configuration through `typescript.tsconfigPath` in `next.config.ts`,
and `pnpm typecheck` passes it explicitly to `tsc`. Exclusion only affects root
files: imported Firebase files are still checked. Next.js watches only
`tsconfig.json` during development, so restart the dev server after changing
`tsconfig.build.json`.

### Reproducing this setup in another repository

This is a project-specific procedure, not a universal installer. It was verified
in a scratch copy of this repository, not in a different repository. Before
using it elsewhere, inspect and adapt the command for that repository; the same
result is not guaranteed when versions, layout, registry metadata or tools differ.

1. Start from a clean, committed worktree and run the command from the repository
   root. Preserve a separate backup of the reference directory and manifest for
   updates. Check the diff after every attempt, including failures.
2. The command assumes `src/components/firebase`, `src/components/ui`,
   `tests/unit`, `package.json`, a lockfile and a `components.json` stylesheet.
   It hardcodes `@/components/` and resolves `@/` to `src/`. The target project
   must use these paths and aliases or the command and integrity test must be
   adapted and reviewed first. Do not run it in a monorepo from the wrong root.
3. Configure the registry, package-manager build policy and existing UI
   primitives as described below. Review compatibility with the target project's
   shadcn style, primitive library, React, Firebase and package versions.
4. Run the `update` command below. Review the inventory, manifest, dependency
   and lockfile changes, and stylesheet diff. The command itself does not install
   the test or configure the tools listed in the table above.
5. Copy and adapt `tests/unit/firebase-reference.test.ts` from this repository,
   integrate it into the target test runner and CI, and commit it together with
   the generated manifest and reference files. Ensure none are Git-ignored.
   Apply equivalent formatter, lint and other tool exclusions where appropriate;
   verify the guard fails for a changed, added or deleted file.
6. Configure TypeScript for the target project. For a Next.js project matching
   this one, include the Firebase directory in the root `tsconfig.json` for the
   editor; create `tsconfig.build.json` extending it and exclude the directory
   there. Set `typescript.tsconfigPath` in `next.config.ts` and pass
   `-p tsconfig.build.json` to the typecheck command. Preserve all other existing
   exclusions. Check the target Next.js version's documentation first. A project
   using different tooling must integrate an equivalent build configuration.
7. Run the target project's lint, typecheck, integrity test, build and relevant CI
   checks. Check editor diagnostics and test actual imports before using any
   component. Record results and unresolved compatibility errors in that project.

The command's checks are limited: it checks new paths outside the layer, not
changes to existing files; parses a subset of import syntax; does not validate
peer compatibility in general; and relies on the current registry and CLI output
shapes. It does not detect every collision, overwrite, or future registry change.
Review all changes rather than treating a zero exit code as proof of portability.

### Failure recovery

The backup covers only the existing Firebase directory. Explicit `fail(...)`
paths attempt to restore it in update mode; unexpected exceptions, direct
`die(...)` calls and process termination can bypass restoration. A failure after
the manifest is written can leave it changed, and a first install has no prior
layer to restore. CSS, dependencies, lock files and other files are never rolled
back by the command. Keep an independent backup and use the worktree diff to
restore or review every affected file after a failure. Do not rerun `update`
until the previous state and the cause have been checked.

### Prerequisites

- `components.json` contains the registry entry. If absent, add it before
  running the command:

  ```json
  "registries": { "@firebase": "https://firebaseopensource.com/r/{name}.json" }
  ```

- The target pnpm version and policy may require a decision for the build scripts of `@firebase/util` and
  `protobufjs`, which `@firebase-oss/ui-react` pulls in. Without one, pnpm 11
  aborts the first batch with `ERR_PNPM_IGNORED_BUILDS`. Record the decision in
  `allowBuilds` in `pnpm-workspace.yaml` following the target project's policy
  and pnpm version documentation.
- Every primitive the Firebase components import must already exist under
  `aliases.ui`. If one is missing, the import check fails and names the
  primitive; install it with `shadcn add <name>`.
- Node.js 18 or later (for `fetch` and `fs.cpSync`) and network access to
  `firebaseopensource.com`.
- The first baseline needs `update`; default mode cannot approve one.

### Known issue: missing `@firebase-oss/ui-core`

Resolved. This section keeps the history and the verified outcome.

After the first install, `pnpm exec tsc --noEmit` failed with:

```text
src/components/firebase/policies.tsx(2,32): error TS2307: Cannot find module '@firebase-oss/ui-core' or its corresponding type declarations.
src/components/firebase/google-sign-in-button.tsx(3,36): error TS2307: Cannot find module 'firebase/auth' or its corresponding type declarations.
```

The installed components import `@firebase-oss/ui-core` and `firebase/auth`. The
registry metadata lists only `@firebase-oss/ui-react` (and form libraries) as
dependencies, so the install did not add `@firebase-oss/ui-core` or `firebase`.
pnpm does not hoist transitive packages into the project's `node_modules`, so
the imports could not resolve.

Verified outcome:

- Step 9 of the command now adds both packages as direct dependencies. In a
  scratch install from the original `package.json` it added `firebase@12` and
  `@firebase-oss/ui-core@7.1.0` (recorded as `^12.19.0` and `7.1.0`).
- The version of `firebase` matters. The first remedy ran `pnpm add firebase`,
  which installed `firebase@13.0.0`. Both `@firebase-oss/ui-react@7.1.0` and
  `@firebase-oss/ui-core@7.1.0` declare the peer dependency
  `firebase: ^11 || ^12`, so 13 left `pnpm peers check` reporting an unmet peer.
  Version 12 satisfies it. Changing to 12 did not change the TypeScript errors.
- `pnpm exec next typegen` must run before `tsc`; without it `tsc` reports an
  unrelated `LayoutProps` error in `src/app/layout.tsx`.

Remaining TypeScript limitations, checked by compiling `src/components/firebase`
with the project's strict configuration. They are not installation errors, and
this ADR does not claim complete TypeScript compatibility:

- Resolved: `email-link-auth-screen.tsx` imports
  `@/components/multi-factor-auth-assertion-screen`. The registry item does not
  declare that dependency, so the shadcn CLI could not rewrite the path. Step 6
  rewrites it deterministically during the install, before the manifest is
  approved. This one file therefore differs from upstream bytes.
- Open, upstream: `phone-auth-form.tsx`, `sign-in-auth-form.tsx`, and
  `sign-up-auth-form.tsx` pass `void | UserCredential` where `UserCredential` is
  expected (`TS2345`). `@firebase-oss/ui-core@7.1.0`, the latest published
  release, declares `signInWithEmailAndPassword(...): Promise<UserCredential |
  void>`. No newer official release fixes it, and the sources are not patched.
- Open, project-specific: `country-selector.tsx` passes a
  `(code: CountryCode) => void` handler to `onValueChange` (`TS2322`). The
  registry assumes a Radix-style select, while this project's `Select` is built
  on Base UI and also calls the handler with `null`.

These four errors remain. The build configuration excludes the directory, so they
do not fail `pnpm typecheck`, but they surface in the editor and as soon as the
application imports those files.

<!-- cspell:ignore TOTP totp -->

**Known functional defect: TOTP enrollment.**
`totp-multi-factor-enrollment-form.tsx` passes the verification code as the
third argument of `enrollWithMultiFactorAssertion` instead of the chosen display
name. The enrolled factor can therefore be labeled with the one-time code.
This reference component is not suitable for use as-is. An application requiring
TOTP enrollment must provide and test a corrected application-owned implementation
outside the reference layer, or adopt a verified upstream fix through the update
procedure. The integrity manifest does not certify functional correctness.

The registry installer can modify files outside `src/components/firebase/`. The
Firebase items carry CSS, and the shadcn CLI merged it into `src/app/globals.css`
by appending a `@layer components` block and a `@variant dark` block of 66 lines
(no existing line changed or removed) for `button[data-provider=...]` and
`data-themed`. Review:

- Required: `oauth-button.tsx` sets `data-provider` and `data-themed`, and these
  rules color the provider buttons.
- Compatible: the rules use `--primary`, `--primary-foreground`, `--color-white`,
  and `--color-black`. The production build (`pnpm build`) passed and emitted
  both color variables and the rules, and `@custom-variant dark` in
  `globals.css` defines the `dark` variant they use.
- Not idempotent after reformatting. The merge skips rules that are byte-identical
  to the file. A re-run on an unformatted file added nothing, but after Biome
  rewrote the single quotes to double quotes a re-run appended a second copy
  (126 lines). Step 10 prints a notice when the stylesheet changes; review that
  diff and keep one copy.

### Verification status

- Verified: JSON shape and pagination behavior on shadcn CLI 4.22.1; the registry
  metadata fields listed above; `shadcn view` returning transitive primitives.
- Verified in a scratch copy installed from the original `package.json` and
  lockfile, with `@firebase/util` and `protobufjs` set to `false` in
  `allowBuilds`: `update` exited 0, found 30 components, reported
  `Firebase files present: 30/30`, removed 9 primitive copies (`alert`, `button`,
  `card`, `field`, `input`, `input-otp`, `label`, `select`, `separator`),
  normalized one file, added `firebase@12` and `@firebase-oss/ui-core@7.1.0`,
  and wrote a 30-line manifest. Nothing was left outside
  `src/components/firebase/`, and `src/components/ui/` was not modified.
- Verified safety behavior: before transitive primitives were resolved, the
  command refused to delete `label.tsx` ("cannot determine the owner") instead of
  guessing by file name; default mode only verifies and reported
  `Integrity verified: 30 reference files match the manifest`; a second `update`
  reported no changes and an identical manifest; with the Tailwind CSS path
  broken, `update` failed in the first batch, restored the previous layer, and
  left the manifest unchanged; a deleted Firebase file produced
  `missing expected files`.
- Verified integrity guard: the Vitest file passes with 8 tests. Appending a line
  to a vendored file, adding a file, and deleting a file each failed the test with
  the exact path listed, and a CRLF-only change passed.
- Verified in the repository after the final `update`: 30 files in
  `src/components/firebase/`; `pnpm lint:ci`, `pnpm typecheck`, `pnpm test`,
  `pnpm test:coverage`, `pnpm check:unused`, `pnpm check:duplicates`,
  `pnpm check:architecture`, `pnpm check:structure`, `pnpm check:spelling`,
  `pnpm check:markdown`, `pnpm check:security`, and `pnpm build` all exited 0.
  `pnpm verify:static` was not run as a whole.
- Corrected: earlier versions of this ADR said all 30 components were installed
  after only checking the CLI exit code. That was not proven. The first run
  without `--path` exited 0 and printed `Done: 30 components installed`, but in
  non-interactive mode it prompted
  `The file button.tsx already exists. Would you like to overwrite?` (and the same
  for `input.tsx`) and only `policies.tsx` and `redirect-error.tsx` appeared. The
  first cleanup also deleted files because a file of the same name existed in
  `src/components/ui/`, which is not evidence of ownership; both behaviors are
  replaced by steps 7 and 8.
- Not verified: execution in PowerShell, CMD, Linux, and macOS (quoting and the
  CMD length limit were checked by reasoning and by measuring the length, not by
  running those shells); a hosted CI run (the commands the workflow calls were
  run locally); automatic handling of a future registry change, such as a new
  component, a removed one, or a new transitive primitive (the last stops the run
  by design); the dependency step with `yarn`, `bun`, or `npm` (only `pnpm` was
  run); and the interactive overwrite prompt in a terminal.

## Consequences

- **Positive**:
  - New Firebase UI components are installed without editing any list.
  - An incomplete or misplaced install is rejected instead of reported as done.
  - Any unapproved change to the vendored code fails the test suite, in CI too.
  - Upstream updates stay possible through one reviewable procedure that prints
    added, removed, and modified files before the manifest changes.
  - No installer file, package script, alias, or function needs maintenance.
  - Primitive copies are removed only with the registry evidence described above.
- **Negative / Trade-offs**:
  - The command depends on the `shadcn list --json` and `shadcn view` output
    shapes and on the registry item metadata, which are CLI and registry
    behavior and not documented contracts. A shape change makes it stop with an
    `ERROR:` message.
  - `npx shadcn@latest` is unpinned, so CLI changes apply without review. The
    command prints the CLI version it ran with.
  - The command is long and must be pasted by hand; it is not discoverable from
    `package.json`.
  - One vendored file (`email-link-auth-screen.tsx`) differs from upstream by an
    import path, and every `update` must reproduce that change.
  - The shared primitives are downloaded before being deleted, and a primitive the
    project does not have under `aliases.ui` stops the run.
  - The CSS merge can append a second copy of the provider styles after the
    stylesheet is reformatted.
  - The install modifies `src/app/globals.css`, outside the layer.
  - Four type errors remain in the vendored sources (see the known issue), and
    `tsc` does not check the directory until the application imports it.
  - ast-grep reports one warning in the layer that cannot be fixed in place.
  - `update` is not transactional and can leave changes after a failure; an
    independent backup and review of the complete worktree diff are required.

## Amendment: Adoption of locally owned source model

### Context of amendment

The authentication routes need FirebaseUI screens that match this shadcn
project. The official Firebase registry distributes shadcn components as source
files, while `@firebase-oss/ui-react` supplies the shared runtime and hooks.
The installed registry source has upstream type mismatches in sign-in and
sign-up action callbacks. TypeScript includes excluded files again when routes
import them, so the build cannot ignore those errors through `tsconfig.exclude`.

Treating the entire registry directory as an immutable upstream mirror conflicted
with shadcn's source-ownership model and prevented the local fixes needed by
the application.

### Decision of amendment

Use the copied Firebase registry components directly from
`src/components/firebase` in application routes. Treat registry files as
project source that may be adapted to the app and its installed APIs. Keep
`@firebase-oss/ui-react` as a runtime dependency; registry components use its
hooks, types, and shared UI behavior.

Supersede the initial immutable/read-only rule and SHA-256 integrity guard for
this directory. Keep the generated registry components grouped under
`src/components/firebase`. Continue excluding untouched registry source from
bulk formatting, lint, spelling, and coverage jobs. Include the full directory
in application typechecking. When changing a component, run the relevant
typecheck and behavior checks.

Sign-in, sign-up, and phone verification forms call success callbacks only when
the action returns a `UserCredential`. A `void` result is a supported FirebaseUI
outcome, so screen-level auth-state handling remains responsible for those
cases. The country selector also handles Base UI's optional selection value.

### Consequences of amendment

- Auth routes use the source form of FirebaseUI recommended for shadcn apps.
- Local UI and type compatibility fixes are reviewable in the project source.
- The Firebase registry source is no longer protected by an upstream hash
  manifest; registry updates require reviewing and merging source diffs.
- The package remains required for FirebaseUI runtime APIs even when screens
  are imported from the local registry directory.
- The generated components remain excluded from broad style and coverage jobs;
  typechecking covers them all.

Firebase project configuration and Auth Emulator behavior are maintained
separately in [ADR 0009](0009-integrate-firebase-authentication.md). The
registry package does not impose a project ID naming convention; local emulator
use is controlled by the application's development-only runtime guard.

## Alternatives considered

- **`shadcn add @firebase --all`**: not confirmed by the official documentation
  to install a whole registry, so it is not used.
- **Hardcoded component list**: goes stale as the registry grows.
- **Package script or committed installer file**: adds maintained code for a
  one-off operation and conflicts with the requirement to create no files.
- **Shell pipelines with `jq`, `grep`, or `xargs`**: not available on every
  supported platform.
- **Operating-system read-only flags, `chmod`, or ACLs**: platform-specific, easily
  reset by Git operations, and invisible to CI. The SHA-256 guard works the same on
  every platform.
- **Deleting duplicates by file name**: unsafe, because a matching name does not
  prove ownership. Replaced by registry metadata.
- **Fixing imports and type errors by hand**: silently diverges from upstream and
  is not repeatable. Only one deterministic import rewrite is applied during the
  install, and the type errors are documented instead.
- **Letting default mode create the first manifest**: would approve whatever was
  installed without an explicit decision, so only `update` writes it.
- **A separate update script or `package.json` command**: rejected for the same
  reason as an installer script; the `update` argument keeps one command.

## References

- [Firebase UI registry](https://firebaseopensource.com/r/)
- [shadcn registry documentation](https://ui.shadcn.com/docs/registry)
- [ADR 0002](0002-configure-shadcn-ui.md): shadcn/ui setup and locally owned components
- [ADR 0006](0006-configure-testing.md): Vitest projects and CI test layers
- [ADR 0007](0007-configure-ci.md): continuous integration and layered verification
