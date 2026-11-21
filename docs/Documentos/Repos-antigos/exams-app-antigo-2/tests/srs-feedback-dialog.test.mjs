import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const html=readFileSync(new URL('../prototype/exam-app-0.1.1__index.html',import.meta.url),'utf8');
const first=html.indexOf(" const fb=e.target.closest('[data-srs-feedback]');if(fb){");
const last=html.indexOf(" const discard=e.target.closest('[data-srs-discard]');",first);
assert.ok(first>=0&&last>first,'real SRS Feedback event source exists');
const code=html.slice(first,last);
async function trigger(choice){
  const calls={grade:[],renders:0,dialog:null};
  const card={id:'srs-question',question:'Qual conceito?',lastGrade:'later'};
  const el={dataset:{srsCard:card.id}};
  const fb={closest:selector=>selector==='[data-srs-card]'?el:null};
  const e={target:{closest:selector=>selector==='[data-srs-feedback]'?fb:null}};
  const env={
    srsLoad:()=>({cards:[card]}),
    formDialog:o=>{calls.dialog=o;return Promise.resolve(choice);},
    srsGradeCard:(id,grade)=>{calls.grade.push({id,grade});return card;},
    showReview:()=>calls.renders++
  };
  const handler=runInNewContext('(function(e){'+code+'})',env);
  handler(e);
  await Promise.resolve();
  return calls;
}
test('feedback displays a native accessible formDialog select with all four real intervals',async()=>{
  const c=await trigger(null);
  assert.equal(c.dialog.title,'Calibrar intervalo de revisão');
  assert.equal(c.dialog.fields[0].type,'select');
  assert.equal(c.dialog.fields[0].value,'later','last grade is restored in selector');
  assert.deepEqual(Array.from(c.dialog.fields[0].options,x=>x[0]),['never','soon','later','someday']);
  assert.equal(c.grade.length,0,'cancelling leaves grade unchanged');
  assert.equal(c.renders,0);
});
test('valid choice grades card and updates view once; invalid choice cannot grade',async()=>{
  const a=await trigger({grade:'soon'});
  assert.deepEqual(a.grade,[{id:'srs-question',grade:'soon'}]);
  assert.equal(a.renders,1);
  const b=await trigger({grade:'unsupported'});
  assert.equal(b.grade.length,0);
  assert.equal(b.renders,0);
});
test('legacy blocking prompt is absent from feedback handler',()=>{
  assert.doesNotMatch(code,/\bprompt\(/);
  assert.match(code,/\.then\(choice=>/);
});
