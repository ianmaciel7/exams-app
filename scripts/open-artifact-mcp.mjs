import { spawn } from 'node:child_process';
import { ROOT, assertNode, resolveRuntime, projectEnv } from './open-artifact-runtime.mjs';
try {
  assertNode();
  const harness=process.argv[2];
  if(!['codex','claude-code','antigravity'].includes(harness)) throw Error('Expected codex, claude-code or antigravity');
  const runtime=resolveRuntime();
  const child=spawn(process.execPath,[runtime.main,'mcp','--harness',harness],{cwd:ROOT,env:projectEnv(),stdio:'inherit'});
  child.on('error',error=>{console.error(error.message);process.exitCode=1;});
  child.on('exit',(code,signal)=>{process.exitCode=code??(signal?1:0);});
  for(const signal of ['SIGINT','SIGTERM']) process.on(signal,()=>child.kill(signal));
} catch(error){console.error(error.message);process.exitCode=1;}
