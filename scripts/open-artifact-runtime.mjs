import { existsSync, readFileSync, readdirSync, mkdirSync, mkdtempSync, rmSync, renameSync, createWriteStream } from 'node:fs';
import { resolve, join, dirname, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { Readable, Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';

export const ROOT = fileURLToPath(new URL('../', import.meta.url));
export const VERSION = '0.17.0';
export const COMMIT = '0f6079853c8b0d2f4e9bddf5465ddbda722ce5a9';
export const SHA256 = '161e146bfd38207e4b1a4f3a515f049f87c4424fba551d439763943a2ed40a3d';
export const RELEASE_URL = 'https://github.com/JimLiu/open-artifact/releases/download/v'+VERSION+'/open-artifact-plugins.zip';
export const CACHE = join(ROOT, '.open-artifact-runtime');
export const INSTALL = join(CACHE, 'v'+VERSION);
export const TYPES = ['data','design','design-system','docs','motion','page','sheets','slides','whiteboard'];
export function assertNode(version = process.versions.node) {
  const [major, minor] = version.split('.').map(Number);
  if (major < 22 || (major === 22 && minor < 18)) throw Error('Open Artifact requires Node.js >=22.18; found '+version);
}
export function inspectSkill(skill) {
  const vendor = join(skill, 'vendor');
  const runtime = JSON.parse(readFileSync(join(vendor,'runtime.json'),'utf8'));
  if (runtime.version !== VERSION) throw Error('Expected Open Artifact '+VERSION+', found '+runtime.version+' in '+skill);
  const main = join(skill,'scripts','open-artifact.mjs');
  const whiteboard = join(vendor,'artifact-types','whiteboard','scripts','cli.mjs');
  for (const file of [main,whiteboard,join(vendor,'open-artifact.mjs'),...TYPES.map(type=>join(vendor,'artifact-types',type,'artifact-type.json'))]) {
    if (!existsSync(file)) throw Error('Incomplete runtime: '+file);
  }
  return {skill,vendor,main,whiteboard,version:runtime.version};
}
export function discoverDistribution(dir) {
  for (const candidate of [dir,...readdirSync(dir,{withFileTypes:true}).filter(x=>x.isDirectory()).map(x=>join(dir,x.name))]) {
    const skill=join(candidate,'codex','skills','open-artifact');
    if (existsSync(join(skill,'vendor','runtime.json'))) return {distribution:candidate,...inspectSkill(skill)};
  }
  throw Error('Official Codex distribution not found in '+dir);
}
export function resolveRuntime(env = process.env) {
  if (env.OPEN_ARTIFACT_SKILL_DIR) {
    if (!isAbsolute(env.OPEN_ARTIFACT_SKILL_DIR)) throw Error('OPEN_ARTIFACT_SKILL_DIR must be absolute');
    return inspectSkill(env.OPEN_ARTIFACT_SKILL_DIR);
  }
  if (env.OPEN_ARTIFACT_WHITEBOARD_CLI) {
    const cli=resolve(env.OPEN_ARTIFACT_WHITEBOARD_CLI);
    const skill=resolve(dirname(cli),'../../../..');
    const runtime=inspectSkill(skill);
    if (runtime.whiteboard!==cli) throw Error('Override must point to the pinned canonical whiteboard CLI; use OPEN_ARTIFACT_SKILL_DIR otherwise');
    return runtime;
  }
  if (!existsSync(INSTALL)) throw Error('Pinned runtime missing. Run node scripts/open-artifact-runtime.mjs install from the repository root.');
  return discoverDistribution(INSTALL);
}
function run(command,args,options={}) {
  const result=spawnSync(command,args,{cwd:ROOT,stdio:'inherit',...options});
  if (result.error) throw result.error;
  if (result.status!==0) throw Error(command+' exited with '+result.status);
}
export async function install() {
  assertNode();
  if (existsSync(INSTALL)) return discoverDistribution(INSTALL);
  mkdirSync(CACHE,{recursive:true});
  const temp=mkdtempSync(join(CACHE,'stage-'));
  try {
    const zip=join(temp,'release.zip'), unpack=join(temp,'unpacked');
    const res=await fetch(RELEASE_URL,{redirect:'follow',signal:AbortSignal.timeout(300000)});
    if (!res.ok || !res.body) throw Error('Official download failed: HTTP '+res.status);
    const hash=createHash('sha256');
    await pipeline(Readable.fromWeb(res.body),new Transform({transform(chunk,enc,cb){hash.update(chunk);cb(null,chunk);}}),createWriteStream(zip,{flags:'wx'}));
    if (hash.digest('hex')!==SHA256) throw Error('Release SHA-256 mismatch; refusing extraction');
    mkdirSync(unpack);
    if (process.platform==='win32') run('tar.exe',['-xf',zip,'-C',unpack]);
    else run('unzip',['-q',zip,'-d',unpack]);
    discoverDistribution(unpack);
    if (!existsSync(INSTALL)) renameSync(unpack,INSTALL);
    return discoverDistribution(INSTALL);
  } finally { rmSync(temp,{recursive:true,force:true}); }
}
export function projectEnv(env=process.env) {
  return {...env,OPEN_ARTIFACT_HOME:join(CACHE,'home'),OPEN_ARTIFACT_WORKSPACE_FOLDERS_ONLY:'1'};
}
if (process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try {
    assertNode();
    const action=process.argv[2]??'resolve';
    const runtime=action==='install'?await install():resolveRuntime();
    if (action==='install'||action==='resolve') console.log(JSON.stringify(runtime,null,2));
    else if(action==='doctor') {
      const harness=process.argv[3]??'cli';
      if(!['cli','codex','claude-code','antigravity','chatgpt'].includes(harness)) throw Error('Unknown harness '+harness);
      run(process.execPath,[runtime.main,'doctor','--workspace',ROOT,'--harness',harness,'--json'],{env:projectEnv()});
    } else if(action==='cli') run(process.execPath,[runtime.main,...process.argv.slice(3)],{env:projectEnv()});
    else throw Error('Usage: install | resolve | doctor [harness] | cli <official arguments>');
  } catch(error){console.error(error.message);process.exitCode=1;}
}
