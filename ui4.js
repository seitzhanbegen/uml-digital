/* ===== v28 · ҰМЛ ережесіне сай ойын қозғалтқышы (шахмат пен жеңіл атлетикадан басқа спорттар) ===== */
(function(){
'use strict';
const g=id=>document.getElementById(id);
const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const own=()=>comp&&comp.sport!=='chess'&&comp.sport!=='athletics';
const uid=()=>'m'+Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const KIND={football:'goals',futsal:'goals',handball:'goals',basketball:'goals',volleyball:'sets',tabletennis:'tt',asyk:'asyk',togyz:'togyz'};
const isPO=m=>String(m.stage||'').startsWith('Плей-офф');
const isFinalStage=m=>/Финал/.test(m.stage||'')&&!/Жартылай|1\/4/.test(m.stage||'');
const num=v=>(v===''||v===undefined||v===null||isNaN(Number(v)))?null:Number(v);
const ent=id=>comp.entries.find(e=>e.id===id);
const nm=id=>id?(ent(id)?.name||'?'):'—';
const TT_PAIRS=['A–X','B–Y','C–Z (қыздар)','A–Y','B–X'];

/* ---------- Бір ойынның нәтижесі ---------- */
function calc(m,i){
  const s=(comp.scores&&comp.scores[i])||{},k=KIND[comp.sport]||'goals';
  const R={done:false,w:0,pa:0,pb:0,ga:0,gb:0,sa:0,sb:0,note:''};
  if(!m.b){R.done=true;R.bye=true;return R}
  if(k==='goals'){
    let a=num(s.a),b=num(s.b);
    if(a===null&&s.p1!==undefined){a=(+s.p1||0)+(+s.p2||0)+(+s.otA||0);b=(+s.q1||0)+(+s.q2||0)+(+s.otB||0)}
    if(a===null||b===null)return R;
    R.ga=a;R.gb=b;
    if(a===b){
      if(comp.sport==='basketball'){R.note='Баскетболда тең есеп болмайды (қосымша уақыт)';return R}
      if(isPO(m)){
        if(s.penWinner!=='a'&&s.penWinner!=='b'){R.note='Плей-оффта тең болса — пенальти/қосымша жеңімпазын таңдаңыз';return R}
        R.w=s.penWinner==='a'?1:-1;R.done=true;
        R.pa=R.w>0?1:0;R.pb=R.w<0?1:0;return R;
      }
      R.w=0;R.done=true;R.pa=R.pb=1;return R;
    }
    R.w=a>b?1:-1;R.done=true;
    const W=comp.sport==='handball'?2:comp.sport==='basketball'?2:3,L=comp.sport==='basketball'?1:0;
    R.pa=R.w>0?W:L;R.pb=R.w<0?W:L;return R;
  }
  if(k==='sets'){
    const need=(isPO(m)&&isFinalStage(m))?3:2,sets=(s.sets||[]);
    let wa=0,wb=0,pa=0,pb=0;
    for(const z of sets){const a=num(z&&z.a),b=num(z&&z.b);if(a===null||b===null||a===b)continue;pa+=a;pb+=b;if(a>b)wa++;else wb++;if(wa===need||wb===need)break}
    R.sa=wa;R.sb=wb;R.ga=pa;R.gb=pb;
    if(wa<need&&wb<need)return R;
    R.done=true;R.w=wa>wb?1:-1;
    if(wa>wb){R.pa=wb===0?3:2;R.pb=wb===0?0:1}else{R.pb=wa===0?3:2;R.pa=wa===0?0:1}
    if(need===3){R.pa=R.w>0?1:0;R.pb=R.w<0?1:0}
    return R;
  }
  if(k==='tt'){
    const r=s.r||[];let wa=0,wb=0;
    for(let j=0;j<5;j++){if(r[j]==='a')wa++;else if(r[j]==='b')wb++;if(wa===3||wb===3)break}
    R.sa=wa;R.sb=wb;if(wa<3&&wb<3)return R;
    R.done=true;R.w=wa>wb?1:-1;R.pa=R.w>0?1:0;R.pb=R.w<0?1:0;return R;
  }
  if(k==='asyk'){
    const a=num(s.a),b=num(s.b);
    if(a===null||b===null||a<0||b<0||a+b!==3)return R;
    R.sa=a;R.sb=b;R.ga=num(s.ga)||0;R.gb=num(s.gb)||0;R.done=true;R.w=a>b?1:-1;
    R.pa=R.w>0?1:0;R.pb=R.w<0?1:0;return R;
  }
  if(k==='togyz'){
    const bd=s.b||[];if(bd.length<4||bd.slice(0,4).some(x=>!x))return R;
    let a=0,b=0;bd.slice(0,4).forEach(x=>{if(x==='a')a++;else if(x==='b')b++;else{a+=.5;b+=.5}});
    R.sa=a;R.sb=b;R.done=true;R.w=a>b?1:a<b?-1:0;
    R.pa=a>b?2:a===b?1:0;R.pb=b>a?2:a===b?1:0;return R;
  }
  return R;
}
window.__umlCalc=calc;
window.normalizedMatch=function(m,i){if(!own())return null;const r=calc(m,i);return r.done?r.w:null};
window.scoreComplete=function(m,s){const i=comp.matches.indexOf(m);return i<0?false:calc(m,i).done};
window.scoreSummary=function(m,i){const r=calc(m,i);return {complete:r.done,a:r.sa||r.ga,b:r.sb||r.gb,sa:r.sa,sb:r.sb,r}};

/* ---------- Кесте ---------- */
function tableOf(ids,ms){ // ms: [[m,i]]
  const rows=ids.map(id=>({id,name:nm(id),school:ent(id)?.school||'',played:0,w:0,d:0,l:0,pts:0,gf:0,ga:0,sf:0,sa:0,ptsF:0,ptsA:0,e:ent(id)}));
  const by={};rows.forEach(r=>by[r.id]=r);
  for(const [m,i] of ms){
    if(!m.b){if(by[m.a]){by[m.a].pts+=(comp.sport==='togyz'||comp.sport==='asyk')?1:0;by[m.a].bye=1}continue}
    const c=calc(m,i);if(!c.done)continue;const x=by[m.a],y=by[m.b];if(!x||!y)continue;
    x.played++;y.played++;x.pts+=c.pa;y.pts+=c.pb;x.gf+=c.ga;x.ga+=c.gb;y.gf+=c.gb;y.ga+=c.ga;x.sf+=c.sa;x.sa+=c.sb;y.sf+=c.sb;y.sa+=c.sa;
    if(c.w>0){x.w++;y.l++}else if(c.w<0){y.w++;x.l++}else{x.d++;y.d++}
  }
  rows.forEach(r=>{r.diff=r.gf-r.ga;r.sdiff=r.sf-r.sa});
  return rank(rows,ms);
}
function h2h(ids,ms){const sub=ids.map(id=>({id,pts:0,diff:0,gf:0,sd:0}));const by={};sub.forEach(r=>by[r.id]=r);
  for(const [m,i] of ms){if(!m.b||!by[m.a]||!by[m.b])continue;const c=calc(m,i);if(!c.done)continue;by[m.a].pts+=c.pa;by[m.b].pts+=c.pb;by[m.a].diff+=c.ga-c.gb;by[m.b].diff+=c.gb-c.ga;by[m.a].gf+=c.ga;by[m.b].gf+=c.gb;by[m.a].sd+=c.sa-c.sb;by[m.b].sd+=c.sb-c.sa}
  return by}
function keyOf(r,H,sport){ // ұпайы тең топ ішіндегі салыстыру кілті
  const h=H[r.id]||{pts:0,diff:0,gf:0,sd:0};
  if(sport==='football'||sport==='futsal')return [r.w,h.pts,h.diff,h.gf,r.diff,r.gf];
  if(sport==='volleyball')return [r.w,h.pts,r.sdiff,r.gf-r.ga,r.gf];
  if(sport==='tabletennis')return [h.pts,r.sdiff,r.sf];
  if(sport==='asyk')return [h.pts,r.sdiff,r.gf-r.ga];
  if(sport==='togyz')return [h.pts,r.sdiff,r.sf];
  return [h.pts,r.diff,r.diff,r.gf];
}
function rank(rows,ms){
  const sport=comp.sport;
  rows.sort((a,b)=>b.pts-a.pts);
  const out=[];let i=0;
  while(i<rows.length){
    let j=i;while(j<rows.length&&rows[j].pts===rows[i].pts)j++;
    let blk=rows.slice(i,j);
    if(blk.length>1){
      let H=h2h(blk.map(x=>x.id),ms);
      blk.sort((a,b)=>{const ka=keyOf(a,H,sport),kb=keyOf(b,H,sport);for(let t=0;t<ka.length;t++)if(ka[t]!==kb[t])return kb[t]-ka[t];return 0});
      for(let t=0;t<blk.length;t++){const ka=keyOf(blk[t],H,sport);blk[t].lot=blk.some((o,u)=>u!==t&&keyOf(o,H,sport).join()===ka.join())}
    }
    out.push(...blk);i=j;
  }
  out.forEach((r,t)=>r.rank=t+1);
  return out;
}
const idx=()=>comp.matches.map((m,i)=>[m,i]);
const groupMs=gn=>idx().filter(([m])=>!isPO(m)&&(gn?m.group===gn:true));

function standingsAll(){
  const ids=comp.entries.map(e=>e.id);
  if(comp.finalRanking&&comp.finalRanking.length){
    const base=tableOf(ids,groupMs()),by={};base.forEach(r=>by[r.id]=r);
    const seen=new Set(),out=[];
    comp.finalRanking.forEach(id=>{if(by[id]&&!seen.has(id)){seen.add(id);out.push({...by[id]})}});
    base.forEach(r=>{if(!seen.has(r.id))out.push({...r})});
    out.forEach((r,t)=>r.rank=t+1);return out;
  }
  if(comp.system==='groups'&&comp.groups?.length){
    const out=[];comp.groups.forEach(gr=>{const t=tableOf(gr.ids,groupMs(gr.name));t.forEach(r=>{r.grp=gr.name;out.push(r)})});
    out.forEach((r,t)=>r.rank=t+1);return out;
  }
  return tableOf(ids,idx().filter(([m])=>!isPO(m)));
}
const _std=window.standings;
window.standings=function(){return own()?standingsAll():_std.apply(this,arguments)};

/* ---------- Жеребе ---------- */
function groupsFor(n){return n<=6?1:n<=8?2:n<=11?3:4}
function shuffle2(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function rrRounds(ids){ // шеңбер әдісі
  let b=[...ids];if(b.length%2)b.push(null);const n=b.length,out=[];
  for(let r=0;r<n-1;r++){const pr=[];for(let k=0;k<n/2;k++){const x=b[k],y=b[n-1-k];if(x&&y)pr.push([x,y])}out.push(pr);b=[b[0],b[n-1],...b.slice(1,n-1)]}
  return out;
}
function hasResults(){return comp.matches.some((m,i)=>m.b&&calc(m,i).done)}
const prevDraw=window.makeDraw;
window.makeDraw=function(){
  if(!comp||!own())return prevDraw.apply(this,arguments);
  const n=comp.entries.length;
  if(n<2)return alert('Жеребе үшін кемінде 2 команда/қатысушы керек.');
  if(comp.matches.length&&hasResults())return alert('Нәтижесі бар жеребені қайта құруға болмайды. Кеш келген қатысушы бұрынғы жеребені бұзбай қосылады — «Тіркеу» батырмасын басыңыз.');
  comp.matches=[];comp.scores={};comp.groups=[];comp.finalRanking=null;comp.champion=null;comp.phase=null;comp.swissRound=0;comp.playoffRound=0;
  const sys=comp.system||'groups';
  if(sys==='groups'){
    const G=groupsFor(n),sh=shuffle2(comp.entries.map(e=>e.id)),names='ABCD'.split('');
    comp.groups=names.slice(0,G).map(nme=>({name:nme,ids:[]}));
    sh.forEach((id,k)=>comp.groups[k%G].ids.push(id));
    const di=g('groupNum');if(di)di.value=G;
    comp.groups.forEach(gr=>rrRounds(gr.ids).forEach((pr,r)=>pr.forEach(([a,b])=>comp.matches.push({id:uid(),round:r+1,stage:'Топтық кезең · '+gr.name+' тобы',group:gr.name,a,b}))));
    comp.groupCount=G;
  }else if(sys==='round'){
    rrRounds(shuffle2(comp.entries.map(e=>e.id))).forEach((pr,r)=>pr.forEach(([a,b])=>comp.matches.push({id:uid(),round:r+1,stage:'Айналмалы жүйе',a,b})));
  }else if(sys==='swiss'){
    return swissNext(true);
  }else if(sys==='ko'){
    const ids=shuffle2(comp.entries.map(e=>e.id));let size=1;while(size<ids.length)size*=2;
    const slots=Array(size).fill(null);let k=0;
    for(let t=0;t<size&&k<ids.length;t+=2){slots[t]=ids[k++]} // жоғарғы орындар бос өтетіндей
    for(let t=1;t<size&&k<ids.length;t+=2){slots[t]=ids[k++]}
    for(let t=0;t<size;t+=2){const a=slots[t]||slots[t+1],b=slots[t]&&slots[t+1]?slots[t+1]:null;comp.matches.push({id:uid(),round:1,stage:koName(size),a,b,bye:!b})}
    comp.playoffRound=1;comp.phase='KO';
  }
  persist();renderAll();
};
function koName(n){return n<=2?'Плей-офф · Финал':n===4?'Плей-офф · Жартылай финал':n===8?'Плей-офф · 1/4 финал':'Плей-офф · 1/'+(n/2)+' финал'}

/* ---------- Швейцар жүйесі (тоғызқұмалақ т.б.) ---------- */
function swissNext(first){
  const total=Math.max(1,Math.min(15,Number(g('roundNum')?.value)||(comp.sport==='togyz'?7:5)));
  const cur=Number(comp.swissRound||0);
  if(!first){
    if(cur>=total)return alert('Барлық тур аяқталды.');
    const pend=idx().filter(([m,i])=>m.round===cur&&m.b&&!calc(m,i).done);
    if(pend.length)return alert('Алдымен '+cur+'-турдың барлық нәтижесін енгізіңіз ('+pend.length+' ойын қалды).');
  }
  const ids=comp.entries.map(e=>e.id);
  const tb=tableOf(ids,idx().filter(([m])=>!isPO(m)));
  const sc={};tb.forEach(r=>sc[r.id]=r.pts);
  const order=tb.map(r=>r.id);
  const pk=new Set();comp.matches.forEach(m=>{if(m.b){pk.add(m.a+'|'+m.b);pk.add(m.b+'|'+m.a)}});
  const byes=new Set(comp.matches.filter(m=>!m.b).map(m=>m.a));
  let pool=[...order],bye=null;
  if(pool.length%2){bye=[...pool].reverse().find(id=>!byes.has(id))||pool[pool.length-1];pool=pool.filter(id=>id!==bye)}
  let nodes=0;const LIM=400000;
  function dfs(rem){if(!rem.length)return[];if(++nodes>LIM)return null;const a=rem[0];
    const cand=rem.slice(1).filter(b=>!pk.has(a+'|'+b)).sort((x,y)=>Math.abs(sc[a]-sc[x])-Math.abs(sc[a]-sc[y]));
    for(const b of cand){const r=dfs(rem.filter(x=>x!==a&&x!==b));if(r)return[[a,b],...r];if(nodes>LIM)return null}return null}
  const found=dfs(pool);
  if(!found)return alert('Қайталанбайтын жұптау табылмады. Бұрынғы нәтижелер сақталды; төреші шешім қабылдауы керек.');
  const rnd=cur+1;
  if(bye)comp.matches.push({id:uid(),round:rnd,stage:'Швейцариялық жүйе',a:bye,b:null,bye:true});
  found.forEach(([a,b])=>comp.matches.push({id:uid(),round:rnd,stage:'Швейцариялық жүйе',a,b}));
  comp.swissRound=rnd;persist();renderAll();
}
const prevSwiss=window.makeNextSwissRound;
window.makeNextSwissRound=function(first){if(!own())return prevSwiss.apply(this,arguments);return swissNext(!!first)};

/* ---------- Плей-офф ---------- */
function winnerOf(m,i){const c=calc(m,i);return c.w>0?m.a:c.w<0?m.b:null}
function loserOf(m,i){const c=calc(m,i);return c.w>0?m.b:c.w<0?m.a:null}
function stageMs(name){return idx().filter(([m])=>m.stage===name)}
function pushPO(rnd,stage,a,b){comp.matches.push({id:uid(),round:rnd,stage,a,b:b||null,bye:!b})}
function rrAdd(rnd,stage,ids){rrRounds(ids).forEach((pr,r)=>pr.forEach(([a,b])=>pushPO(rnd+r,stage,a,b)))}
function groupTops(){return comp.groups.map(gr=>tableOf(gr.ids,groupMs(gr.name)).map(r=>r.id))}
const allDone=ms=>ms.length&&ms.every(([m,i])=>!m.b||calc(m,i).done);

window.advancePlayoff=function(){
  if(!own())return;
  if(!comp.groups?.length)return alert('Топтық жеребе құрылмаған.');
  if(comp.groups.length===1)return alert('6 командаға дейін бір айналмалы топ: плей-офф жоқ, орын кестеге сай беріледі.');
  if(comp.matches.some(isPO))return alert('Плей-офф бұрын құрылған.');
  const gm=groupMs();if(!allDone(gm))return alert('Топтық кезеңнің барлық ойынының нәтижесін енгізіңіз.');
  const T=groupTops(),G=T.length;
  if(G===2){pushPO(1,'Плей-офф · Жартылай финал',T[0][0],T[1][1]);pushPO(1,'Плей-офф · Жартылай финал',T[1][0],T[0][1]);comp.phase='SF2'}
  else if(G===3){pushPO(1,'Плей-офф · Жартылай финал',T[0][0],T[2][1]);pushPO(1,'Плей-офф · Жартылай финал',T[2][0],T[1][1]);pushPO(1,'Плей-офф · Жартылай финал',T[1][0],T[0][1]);comp.phase='SF3'}
  else{pushPO(1,'Плей-офф · 1/4 финал',T[0][0],T[3][1]);pushPO(1,'Плей-офф · 1/4 финал',T[3][0],T[0][1]);pushPO(1,'Плей-офф · 1/4 финал',T[1][0],T[2][1]);pushPO(1,'Плей-офф · 1/4 финал',T[2][0],T[1][1]);comp.phase='QF'}
  comp.playoffRound=1;persist();renderAll();
};
function finish(order){comp.finalRanking=order.filter(Boolean);comp.champion=comp.finalRanking[0]||null;comp.phase='done'}
window.generateNextKnockout=function(){
  if(!own())return;
  const ph=comp.phase;
  if(ph==='KO'){ // жай ойын-шығу
    const cur=comp.playoffRound,ms=idx().filter(([m])=>isPO(m)&&m.round===cur);
    if(!allDone(ms))return alert('Осы кезеңнің барлық нәтижесін енгізіңіз.');
    const w=ms.map(([m,i])=>m.b?winnerOf(m,i):m.a);
    if(w.length===1){const [m,i]=ms[0];finish([w[0],loserOf(m,i)||null]);persist();renderAll();return}
    for(let k=0;k<w.length;k+=2)pushPO(cur+1,koName(w.length),w[k],w[k+1]||null);
    comp.playoffRound=cur+1;persist();renderAll();return;
  }
  const S=n=>stageMs(n),W=n=>S(n).map(([m,i])=>winnerOf(m,i)),L=n=>S(n).map(([m,i])=>loserOf(m,i));
  const need=n=>{const s=S(n);if(!allDone(s)){alert('Осы кезеңнің барлық нәтижесін енгізіңіз.');return false}return true};
  const rk=(id)=>id;
  if(ph==='SF2'){
    if(!need('Плей-офф · Жартылай финал'))return;
    const w=W('Плей-офф · Жартылай финал'),l=L('Плей-офф · Жартылай финал');
    pushPO(2,'Плей-офф · Финал',w[0],w[1]);pushPO(2,'Плей-офф · 3-4 орын',l[0],l[1]);comp.phase='F2';comp.playoffRound=2;
  }else if(ph==='F2'){
    if(!need('Плей-офф · Финал')||!need('Плей-офф · 3-4 орын'))return;
    const f=S('Плей-офф · Финал')[0],t=S('Плей-офф · 3-4 орын')[0];
    finish([winnerOf(...f),loserOf(...f),winnerOf(...t),loserOf(...t)]);
  }else if(ph==='SF3'){
    if(!need('Плей-офф · Жартылай финал'))return;
    rrAdd(2,'Плей-офф · 1–3 орын (айналмалы)',W('Плей-офф · Жартылай финал'));rrAdd(2,'Плей-офф · 4–6 орын (айналмалы)',L('Плей-офф · Жартылай финал'));
    comp.phase='RR3';comp.playoffRound=2;
  }else if(ph==='RR3'){
    const a='Плей-офф · 1–3 орын (айналмалы)',b='Плей-офф · 4–6 орын (айналмалы)';
    if(!need(a)||!need(b))return;
    const ids=[...new Set(stageMs(a).flatMap(([m])=>[m.a,m.b]))],ids2=[...new Set(stageMs(b).flatMap(([m])=>[m.a,m.b]))];
    finish([...tableOf(ids,stageMs(a)).map(r=>r.id),...tableOf(ids2,stageMs(b)).map(r=>r.id)]);
  }else if(ph==='QF'){
    if(!need('Плей-офф · 1/4 финал'))return;
    const w=W('Плей-офф · 1/4 финал'),l=L('Плей-офф · 1/4 финал');
    pushPO(2,'Плей-офф · Жартылай финал',w[0],w[3]);pushPO(2,'Плей-офф · Жартылай финал',w[1],w[2]);
    pushPO(2,'Плей-офф · 5–8 орын жартылай финал',l[0],l[3]);pushPO(2,'Плей-офф · 5–8 орын жартылай финал',l[1],l[2]);
    comp.phase='SF4';comp.playoffRound=2;
  }else if(ph==='SF4'){
    if(!need('Плей-офф · Жартылай финал')||!need('Плей-офф · 5–8 орын жартылай финал'))return;
    const w=W('Плей-офф · Жартылай финал'),l=L('Плей-офф · Жартылай финал'),w5=W('Плей-офф · 5–8 орын жартылай финал'),l5=L('Плей-офф · 5–8 орын жартылай финал');
    pushPO(3,'Плей-офф · Финал',w[0],w[1]);pushPO(3,'Плей-офф · 3-4 орын',l[0],l[1]);pushPO(3,'Плей-офф · 5-6 орын',w5[0],w5[1]);pushPO(3,'Плей-офф · 7-8 орын',l5[0],l5[1]);
    comp.phase='F4';comp.playoffRound=3;
  }else if(ph==='F4'){
    const ns=['Плей-офф · Финал','Плей-офф · 3-4 орын','Плей-офф · 5-6 орын','Плей-офф · 7-8 орын'];
    if(!ns.every(need))return;
    const o=[];ns.forEach(n=>{const [m,i]=S(n)[0];o.push(winnerOf(m,i),loserOf(m,i))});finish(o);
  }else return alert('Алдымен «Топтан плей-офф құру» батырмасын басыңыз.');
  persist();renderAll();
};

/* ---------- Нәтиже енгізу ---------- */
function ensure(i){comp.scores=comp.scores||{};comp.scores[i]=comp.scores[i]||{};return comp.scores[i]}
window.uS=(i,f,v)=>{const s=ensure(i);if(v==='')delete s[f];else s[f]=(f==='penWinner'||f==='winner')?v:Number(v);persist();renderAll()};
window.uSet=(i,k,f,v)=>{const s=ensure(i);s.sets=s.sets||[];s.sets[k]=s.sets[k]||{};if(v==='')delete s.sets[k][f];else s.sets[k][f]=Number(v);persist();renderAll()};
window.uTT=(i,k,v)=>{const s=ensure(i);s.r=s.r||[];s.r[k]=v;persist();renderAll()};
window.uTg=(i,k,v)=>{const s=ensure(i);s.b=s.b||[];s.b[k]=v;persist();renderAll()};
function inputs(m,i){
  const s=comp.scores?.[i]||{},a=E(nm(m.a)),b=E(nm(m.b)),k=KIND[comp.sport];
  if(k==='goals'){
    const lbl=comp.sport==='basketball'?'ұпай':'гол';
    let h='<div class="grid"><div><label>'+a+' · '+lbl+'</label><input type="number" min="0" value="'+(num(s.a)??'')+'" onchange="uS('+i+',\'a\',this.value)"></div><div><label>'+b+' · '+lbl+'</label><input type="number" min="0" value="'+(num(s.b)??'')+'" onchange="uS('+i+',\'b\',this.value)"></div></div>';
    if(isPO(m)&&num(s.a)!==null&&num(s.a)===num(s.b))h+='<label>Тең есеп: жеңімпаз (пенальти / қосымша уақыт)</label><select onchange="uS('+i+',\'penWinner\',this.value)"><option value="">Таңдаңыз</option><option value="a"'+(s.penWinner==='a'?' selected':'')+'>'+a+'</option><option value="b"'+(s.penWinner==='b'?' selected':'')+'>'+b+'</option></select>';
    return h;
  }
  if(k==='sets'){
    const need=(isPO(m)&&isFinalStage(m))?3:2,max=need===3?5:3;let h='<p class="muted"><b>'+(need===3?'Финал: 5 партияға дейін (3 жеңіске дейін)':'3 партияға дейін (2 жеңіске дейін)')+'</b></p><div class="grid">';
    for(let q=0;q<max;q++){const z=(s.sets||[])[q]||{};h+='<div class="notice"><b>'+(q+1)+'-партия</b><input type="number" min="0" placeholder="'+a+'" value="'+(num(z.a)??'')+'" onchange="uSet('+i+','+q+',\'a\',this.value)"><input type="number" min="0" placeholder="'+b+'" value="'+(num(z.b)??'')+'" onchange="uSet('+i+','+q+',\'b\',this.value)"></div>'}
    return h+'</div>';
  }
  if(k==='tt'){
    let h='<p class="muted"><b>5 партия, 3 жеңіске дейін</b> · '+a+' (A,B,C) — '+b+' (X,Y,Z)</p><div class="grid">';
    for(let q=0;q<5;q++){const r=(s.r||[])[q]||'';h+='<div><label>'+TT_PAIRS[q]+'</label><select onchange="uTT('+i+','+q+',this.value)"><option value="">—</option><option value="a"'+(r==='a'?' selected':'')+'>'+a+' жеңді</option><option value="b"'+(r==='b'?' selected':'')+'>'+b+' жеңді</option></select></div>'}
    return h+'</div>';
  }
  if(k==='asyk'){
    const bes=comp.gender==='Қыздар';
    return '<p class="muted"><b>'+(bes?'Бес асық':'Асық ату')+'</b>: команда жеңісі (3:0 немесе 2:1) хаттамаға 1 ұпай. Екі команданың ұтқан ойыншылары қосындысы 3.</p><div class="grid"><div><label>'+a+' · ұтқан ойыншы (0–3)</label><input type="number" min="0" max="3" value="'+(num(s.a)??'')+'" onchange="uS('+i+',\'a\',this.value)"></div><div><label>'+b+' · ұтқан ойыншы (0–3)</label><input type="number" min="0" max="3" value="'+(num(s.b)??'')+'" onchange="uS('+i+',\'b\',this.value)"></div><div><label>'+a+' · жиналған ұпай (тай-брейк үшін)</label><input type="number" min="0" value="'+(num(s.ga)??'')+'" onchange="uS('+i+',\'ga\',this.value)"></div><div><label>'+b+' · жиналған ұпай (тай-брейк үшін)</label><input type="number" min="0" value="'+(num(s.gb)??'')+'" onchange="uS('+i+',\'gb\',this.value)"></div></div>';
  }
  if(k==='togyz'){
    let h='<p class="muted"><b>4 тақта</b> (2 ұл + 2 қыз) · команда жеңісі 2, тең 1, жеңіліс 0 ұпай</p><div class="grid">';
    for(let q=0;q<4;q++){const r=(s.b||[])[q]||'';h+='<div><label>'+(q+1)+'-тақта'+(q>=2?' (қыздар)':' (ұлдар)')+'</label><select onchange="uTg('+i+','+q+',this.value)"><option value="">—</option><option value="a"'+(r==='a'?' selected':'')+'>'+a+' жеңді</option><option value="d"'+(r==='d'?' selected':'')+'>Тең</option><option value="b"'+(r==='b'?' selected':'')+'>'+b+' жеңді</option></select></div>'}
    return h+'</div>';
  }
  return '';
}
const prevRR=window.renderResults;
window.renderResults=function(){
  if(!own())return prevRR.apply(this,arguments);
  const el=g('results');if(!el)return;
  if(!comp.matches.length){el.innerHTML='<p class="muted">Алдымен жеребе құрыңыз.</p>';return}
  const stages=[];comp.matches.forEach((m,i)=>{let s=stages.find(x=>x.n===m.stage);if(!s){s={n:m.stage,l:[]};stages.push(s)}s.l.push([m,i])});
  el.innerHTML=stages.map(st=>{
    const pend=st.l.filter(([m,i])=>m.b&&!calc(m,i).done).length;
    const open=pend>0&&(isPO(st.l[0][0])||comp.matches.length<40||st.l.length<=12);
    return '<details'+(open?' open':'')+'><summary><b>'+E(st.n||'Ойындар')+'</b> · '+st.l.length+' ойын'+(pend?' · <span style="color:#b45309">қалды: '+pend+'</span>':' · <span style="color:#0a7a3d">толық ✓</span>')+'</summary>'+
    st.l.map(([m,i])=>{
      if(!m.b)return '<div class="match-card"><b>'+E(nm(m.a))+' — бос тур</b></div>';
      const c=calc(m,i);
      return '<div class="match-card"><b>'+(m.round?m.round+'-тур · ':'')+E(nm(m.a))+' — '+E(nm(m.b))+'</b>'+inputs(m,i)+'<p class="muted">'+(c.done?'Нәтиже тіркелді':(c.note||'Нәтиже толық емес'))+'</p></div>'}).join('')+'</details>'}).join('');
};

/* ---------- Кесте мен қорытынды көрінісі ---------- */
const prevRF=window.renderFixtures;
window.renderFixtures=function(){
  if(!own())return prevRF.apply(this,arguments);
  const el=g('fixtures');if(!el)return;
  if(!comp.matches.length){el.innerHTML='<p class="muted">Жеребе әлі құрылмаған.</p>';return}
  let html='';
  const sys=comp.system||'groups',n=comp.entries.length;
  if(sys==='groups'&&comp.groups?.length){
    html+='<div class="notice"><b>Жүйе:</b> '+n+' команда → '+comp.groups.length+' топ'+(comp.groups.length===1?' (айналмалы жүйе)':'')+' · әр топтан 1–2 орын плей-оффқа. '+comp.groups.map(gr=>'<br><b>'+gr.name+' тобы:</b> '+gr.ids.map(id=>E(nm(id))).join(', ')).join('')+'</div>';
  }
  const stages=[];comp.matches.forEach(m=>{let s=stages.find(x=>x.n===m.stage);if(!s){s={n:m.stage,l:[]};stages.push(s)}s.l.push(m)});
  html+=stages.map(st=>'<details'+(comp.matches.length<=60?' open':'')+'><summary><b>'+E(st.n)+'</b> ('+st.l.length+')</summary><table><tr><th>Тур</th><th>А жағы</th><th>В жағы</th></tr>'+st.l.map(m=>'<tr><td>'+(m.round||'')+'</td><td>'+E(nm(m.a))+'</td><td>'+(m.b?E(nm(m.b)):'Бос тур')+'</td></tr>').join('')+'</table></details>').join('');
  const act=[];
  if(sys==='groups'&&comp.groups?.length>1&&!comp.matches.some(isPO))act.push('<button class="alt" onclick="advancePlayoff()">Топтан плей-офф құру</button>');
  if(comp.matches.some(isPO)&&comp.phase!=='done')act.push('<button onclick="generateNextKnockout()">Келесі кезеңді құру</button>');
  if(sys==='swiss'&&comp.swissRound<Math.max(1,Number(g('roundNum')?.value)||7))act.push('<button onclick="makeNextSwissRound()">Келесі турдың жеребесін құру</button>');
  if(act.length)html+='<div class="actions">'+act.join('')+'</div>';
  el.innerHTML=html;
};
const prevRS=window.renderStandings;
window.renderStandings=function(){
  if(!own())return prevRS.apply(this,arguments);
  const el=g('standings');if(!el)return;
  const k=KIND[comp.sport],ext=k==='sets'?'Партия':k==='goals'?'Доп/ұпай':k==='togyz'?'Тақта ұпайы':k==='asyk'?'Ойыншы':'Партия';
  const exv=r=>k==='sets'?r.sf+':'+r.sa:k==='goals'?r.gf+':'+r.ga:k==='togyz'?r.sf+':'+r.sa:k==='asyk'?r.sf+':'+r.sa:r.sf+':'+r.sa;
  const tbl=(rows,title)=>(title?'<h3>'+E(title)+'</h3>':'')+'<table><tr><th>Орын</th><th>Команда / қатысушы</th><th>Ойын</th><th>Жеңіс</th>'+(k==='goals'||k==='togyz'?'<th>Тең</th>':'')+'<th>Ұтылыс</th><th>Ұпай</th><th>'+ext+'</th></tr>'+rows.map(r=>'<tr><td><b>'+r.rank+'</b></td><td>'+E(r.name)+'<br><small>'+E(r.school)+'</small></td><td>'+r.played+'</td><td>'+r.w+'</td>'+(k==='goals'||k==='togyz'?'<td>'+r.d+'</td>':'')+'<td>'+r.l+'</td><td><b>'+r.pts+'</b>'+(r.lot?' <small title="Барлық тай-брейк тең — жеребе">⚠</small>':'')+'</td><td>'+exv(r)+'</td></tr>').join('')+'</table>';
  let html='';
  if(comp.finalRanking?.length){html+='<div class="notice"><b>🏆 Қорытынды орындар</b></div>'+tbl(standingsAll())}
  if(comp.system==='groups'&&comp.groups?.length){html+=comp.groups.map(gr=>tbl(tableOf(gr.ids,groupMs(gr.name)),gr.name+' тобы')).join('')}
  else if(!comp.finalRanking?.length)html+=tbl(standingsAll());
  el.innerHTML=html||'<p class="muted">Нәтиже әлі жоқ.</p>';
};
/* G=1 немесе айналмалы/швейцар жүйеде нәтижелер толған соң қорытынды орындар кестеден алынады */
const prevPersist=window.persist;
})();
