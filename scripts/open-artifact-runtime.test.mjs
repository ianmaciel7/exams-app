import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync,mkdirSync,writeFileSync,rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join,dirname } from 'node:path';
import { assertNode,inspectSkill,resolveRuntime,VERSION,TYPES,projectEnv,ROOT } from './open-artifact-runtime.mjs';
import { catalog } from './board-catalog.mjs';
test('enforces upstream Node minimum',()=>{assert.throws(()=>assertNode('22.16.0'));assert.doesNotThrow(()=>assertNode('22.18.0'));assert.doesNotThrow(()=>assertNode('24.0.0'));});
test('version and all nine types required; override cannot bypass validation',()=>{
 const root=mkdtempSync(join(tmpdir(),'exam-oa-'));
 const skill=join(root,'skill'),vendor=join(skill,'vendor');
 const write=(path,content='')=>{mkdirSync(dirname(path),{recursive:true});writeFileSync(path,content);};
 try{
  write(join(vendor,'runtime.json'),JSON.stringify({version:'0.16.3'}));assert.throws(()=>inspectSkill(skill),/Expected/);
  write(join(vendor,'runtime.json'),JSON.stringify({version:VERSION}));assert.throws(()=>inspectSkill(skill),/Incomplete/);
  write(join(skill,'scripts','open-artifact.mjs'));write(join(vendor,'open-artifact.mjs'));const cli=join(vendor,'artifact-types','whiteboard','scripts','cli.mjs');write(cli);
  for(const type of TYPES)write(join(vendor,'artifact-types',type,'artifact-type.json'),'{}');
  assert.equal(resolveRuntime({OPEN_ARTIFACT_SKILL_DIR:skill}).version,VERSION);
  assert.equal(resolveRuntime({OPEN_ARTIFACT_WHITEBOARD_CLI:cli}).whiteboard,cli);
  assert.throws(()=>resolveRuntime({OPEN_ARTIFACT_SKILL_DIR:'relative'}),/absolute/);
 }finally{rmSync(root,{recursive:true,force:true});}
});
test('project fallback isolates daemon home and requires confinement',()=>{const env=projectEnv({OPEN_ARTIFACT_HOME:'other',OPEN_ARTIFACT_WORKSPACE_FOLDERS_ONLY:'0'});assert.equal(env.OPEN_ARTIFACT_WORKSPACE_FOLDERS_ONLY,'1');assert.ok(env.OPEN_ARTIFACT_HOME.startsWith(ROOT));});

test('catalog has eleven unique native board roots and preview IDs',()=>{const rows=catalog();assert.equal(rows.length,11);assert.equal(new Set(rows.map(x=>x.folder)).size,11);assert.equal(new Set(rows.map(x=>x.previewId)).size,11);});
test('fallback strips inherited remote and runtime settings',()=>{const env=projectEnv({OPEN_ARTIFACT_REMOTE:'example',OPEN_ARTIFACT_REMOTE_TOKEN:'secret',OPEN_ARTIFACT_BUILTIN_TYPES:'wrong',PATH:'test'});assert.equal(env.OPEN_ARTIFACT_REMOTE,undefined);assert.equal(env.OPEN_ARTIFACT_REMOTE_TOKEN,undefined);assert.equal(env.OPEN_ARTIFACT_BUILTIN_TYPES,undefined);assert.equal(env.PATH,'test');});
