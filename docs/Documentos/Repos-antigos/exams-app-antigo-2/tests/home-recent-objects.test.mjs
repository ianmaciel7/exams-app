import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const html=readFileSync(new URL('../prototype/exam-app-0.1.1__index.html',import.meta.url),'utf8');
const from=html.indexOf('function ehRecentEntries(');
const to=html.indexOf('function opEspacoPage(',from);
assert.ok(from>=0&&to>from,'home recent records extraction exists');
const recent=runInNewContext(html.slice(from,to)+'\nehRecentEntries',{
 objHref:d=>d.type==='pdf'?'#'+d.id:'#/'+d.type+'/'+d.id,
 qTitle:q=>q.enunciado||('Questão '+q.id)
});
const base=Date.UTC(2026,10,16,12);
test('all timestamped object types are sorted by activity, not source array order',()=>{
 const objects=[
   {id:'old',type:'concurso',t:'Concurso',createdAt:base-3000},
   {id:'edition',type:'edicao',t:'Edição',createdAt:base-2000},
   {id:'post',type:'cargo',t:'Cargo',createdAt:base-1000},
   {id:'note',type:'custom-note',t:'Nota',createdAt:base-6000,updatedAt:base+2000},
   {id:'pdf',type:'pdf',t:'PDF',createdAt:base+1000}
 ];
 const rows=Array.from(recent(objects,[],[],[],9),x=>x.title);
 assert.deepEqual(rows,['Nota','PDF','Cargo','Edição','Concurso']);
});
test('a confirmed answer supersedes question creation and preserves its actual time',()=>{
 const q={id:'custom-1',user:true,createdAt:base,criada:base,enunciado:'Enunciado real'};
 const rows=recent([],[q],[],[{q:'custom-1',t:base+1000,a:'A',ok:true,n:'Resposta'}]);
 assert.equal(rows.length,1);
 assert.equal(rows[0].description,'Respondida');
 assert.equal(rows[0].at,base+1000);
 assert.equal(rows[0].href,'#/questao/custom-1');
 assert.equal(rows[0].title,'Enunciado real');
});
test('legacy objects without timestamps are not silently backfilled',()=>{
 const rows=recent([
   {id:'legacy',type:'pdf',t:'PDF sem data'},
   {id:'new',type:'pdf',t:'Arquivo importado',createdAt:base}
 ],[],[],[]);
 assert.equal(rows.length,1);
 assert.equal(rows[0].title,'Arquivo importado');
});
test('invalid timestamps and duplicate objects do not corrupt the sorted queue',()=>{
 const rows=recent([
   {id:'bad',type:'pdf',t:'Inválido',createdAt:'not-a-date'},
   {id:'one',type:'pdf',t:'Primeiro',createdAt:base},
   {id:'one',type:'pdf',t:'Editado',createdAt:base-100,updatedAt:base+100}
 ],[],[],[],6);
 assert.equal(rows.length,1);
 assert.equal(rows[0].title,'Editado');
 assert.equal(rows[0].description,'Editado');
});
test('object creation paths record actual dates; old static fixtures are not modified',()=>{
 for(const phrase of [
   'e={id,type:t,t:n,sp:space,createdAt:Date.now()}',
   "const o={id,sp,type:'concurso',t:v.nome,orgao:oe?oe.t:v.orgao,createdAt:Date.now()}",
   'obj.updatedAt=Date.now()',
   'body:v.conteudo,createdAt:Date.now()',
   'm:\'só nesta sessão\',createdAt:Date.now()'
 ])assert.ok(html.includes(phrase),phrase);
});
