import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const html=readFileSync(new URL('../prototype/exam-app-0.1.1__index.html',import.meta.url),'utf8');
const slice=(a,b)=>{
  const i=html.indexOf(a),j=html.indexOf(b,i+a.length);
  assert.ok(i>=0&&j>i,'script source anchors exist: '+a);
  return html.slice(i,j);
};
const src=slice('const RP_CV=new Map()','function rpCvView(')+
  slice('function bodyGraf(v){','function bodyObj(v){')+
  '\n'+slice('function rpFromView(v,h)','const toolMenu=')+
  '\n({bodyGraf,rpFromView})';

function harness(size=20){
  const root={href:'#/concurso/root',title:'Raiz',kind:'concurso',out:[],inn:[]};
  const others=Array.from({length:size},(_,i)=>({
    href:'#/questao/q'+i,title:'Questão '+String(99-i).padStart(2,'0'),
    kind:i%2?'questao':'cargo',out:[],inn:[]
  }));
  root.out=others.map(n=>[n.href,'Relacionada']);
  const nodes=new Map([root,...others].map(n=>[n.href,n]));
  const actions=[];
  const env={
    gr:()=>({N:nodes}),vNode:()=>root,ctxBar:()=>'<div>Contexto</div>',
    rpEmpty:(title)=>'<p>'+title+'</p>',
    curHref:()=>root.href,nbrs:()=>others.slice().reverse(),
    KORD:['concurso','cargo','questao'],kn:x=>x,WI:{graph:'G'},esc:x=>String(x).replaceAll('&','&amp;').replaceAll('"','&quot;'),
    rpRow:n=>'<a href="'+n.href+'">'+n.title+'</a>',
    MQT:{matches:false},wsOpenMain:h=>actions.push(['navigate',h]),
    openRP:()=>actions.push(['close']),wsSave:()=>actions.push(['save'])
  };
  return {api:runInNewContext(src,env),root,others,actions};
}
test('empty and one-neighbor states have truthful global CTA',()=>{
  const empty=harness(0).api.bodyGraf({id:'g'});
  assert.match(empty,/Sem ligações diretas/);
  assert.match(empty,/Ver grafo global/);
  const one=harness(1).api.bodyGraf({id:'g'});
  assert.match(one,/rp-graph-single/);
  assert.match(one,/Ver grafo global/);
  assert.doesNotMatch(one,/Abrir gráfico completo/);
});
test('with 20 links, all 6 hidden neighbors remain accessible in details',()=>{
  const {api}=harness(20);
  const graph=api.bodyGraf({id:'g'});
  assert.match(graph,/Ver as 6 ligações adicionais/);
  assert.match(graph,/<details class="rp-more rp-hidden-links">/);
  assert.match(graph,/#\/questao\/q0/);
  assert.match(graph,/#\/questao\/q19/);
  assert.equal((graph.match(/class="g-n /g)||[]).length,15,'14 visible neighbors plus center');
  assert.equal((graph.match(/<a href="#\/questao\/q\d+">/g)||[]).length,6,'all 6 additional links listed');
  assert.match(graph,/Ver grafo global/);
});
test('graph renders same deterministic neighbors regardless of input order',()=>{
  const a=harness(20),g1=a.api.bodyGraf({id:'g'});
  a.others.reverse();
  const g2=a.api.bodyGraf({id:'g'});
  assert.equal(g1,g2,'node selection and geometry stable across insertion order');
});
test('clicking graph neighbor navigates main page without silently pinning',()=>{
  const h=harness(2),v={type:'graf',id:'g'};
  h.api.rpFromView(v,'#/questao/q1');
  assert.equal(v.ref,undefined,'no implicit pin');
  assert.deepEqual(h.actions,[['navigate','#/questao/q1']]);
});
test('collection/global CTAs clearly describe the global scope',()=>{
  const graphSection=slice('function bodyGraf(v){','function bodyObj(v){');
  assert.doesNotMatch(graphSection,/Abrir gráfico completo/);
  assert.equal((graphSection.match(/Ver grafo global/g)||[]).length,4);
});

function collectionGraph(count){
  const nodes=new Map(Array.from({length:count},(_,i)=>{
    const n={href:'#/questao/q'+i,title:'Questão '+i,kind:'questao',out:[],inn:[]};
    return [n.href,n];
  }));
  const env={
    gr:()=>({N:nodes}),vNode:()=>null,curHref:()=>'#/tipo/questao',
    kn:x=>x,esc:x=>String(x),WI:{graph:'G'}
  };
  return runInNewContext(src,env).bodyGraf({id:'collection'});
}

test('contextual collection graph (canvas) initially fits all nodes, including dense collections (#54, #227)',()=>{
  const layoutSrc=html.slice(html.indexOf('function collectionRingLayout('),html.indexOf('function rpCvView('));
  const layout=runInNewContext(layoutSrc+'\ncollectionRingLayout');
  for(const count of [1,3,50,120]){
    const graph=collectionGraph(count);
    assert.match(graph,/<canvas class="rp-graph-cv" id="rpcv\d+" data-rpg-cv/,'collection renders on canvas');
    assert.equal((graph.match(/<li><a /g)||[]).length,count,'every collection item is listed for keyboard and screen-reader users');
    const L=layout(count), {x,y,w,h}=L.fit;
    assert.ok(w>=300&&h>=240,'initial frame at least baseline dimensions');
    for(const [px,py] of L.pts){
      assert.ok(px-8.5>=x&&px+8.5<=x+w,'node visible horizontally');
      assert.ok(py-8.5>=y&&py+8.5<=y+h,'node visible vertically');
    }
    if(count>=50)assert.ok(w>300,'dense graph must enlarge initial fit');
  }
});

test('contextual graph Reset and zoom preserve dynamically fitted viewport (#54)',()=>{
  const html=readFileSync(new URL('../prototype/exam-app-0.1.1__index.html',import.meta.url),'utf8');
  assert.match(html,/fw=\+svg\.dataset\.fitW\|\|300,fh=\+svg\.dataset\.fitH\|\|240/);
  assert.match(html,/Math\.max\(2400,fw\*2\)/,'zoom-out allows the original large extent');
  assert.match(html,/nh=nw\*fh\/fw/,'zoom preserves frame aspect ratio');
});
