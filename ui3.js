
/* ===== v28: ҰМЛ 2026-27 ережесіне сай тіркеу (жыныс құлпы, құрам, өңдеу, кеш қосылу) ===== */
(function(){
const g=id=>document.getElementById(id);
const nrm=s=>String(s??'').trim().toLocaleLowerCase('kk').replace(/\s+/g,' ');
const uid3=()=>'u3_'+(crypto.randomUUID?.()||Date.now().toString(36)+Math.random().toString(36).slice(2));
const isIntra=()=>comp&&comp.level==='Мектепішілік';
const FBMIN={'5–6 сынып':8,'7–8 сынып':10,'9–11 сынып':13};
/* Ереже: мандаттық құрам (ҰМЛ 2026-27) */
const REG={
  basketball:{mode:'sep',min:8,max:12,coach:2},
  volleyball:{mode:'sep',min:8,max:12,coach:2},
  handball:{mode:'sep',min:8,max:12,coach:2},
  football:{mode:'sep',min:null,max:15,coach:2},
  futsal:{mode:'sep',min:8,max:12,coach:2},
  asyk:{mode:'sep',min:3,max:3,exact:true,coach:2},
  athletics:{mode:'sep',min:5,max:5,coach:2},
  chess:{mode:'mixed',boys:3,girls:1},
  togyz:{mode:'mixed',boys:2,girls:2},
  tabletennis:{mode:'mixed',boys:2,girls:1}
};
window.UML_REG=REG;
const reg=()=>REG[comp.sport]||{mode:'sep',min:1,max:99};
const minFor=()=>{const r=reg();return r.min??(FBMIN[comp.age]||8)};
/* Жарыс жынысы: Аралас тек аралас командалық (шахмат, тоғызқұмалақ, үстел теннисі) */
function genderOptions(sportId,kind){
  const r=REG[sportId]||{};
  if(kind==='team'&&r.mode==='mixed')return ['Аралас'];
  return ['Ұлдар','Қыздар'];
}
function refreshGender(){
  const sel=g('gender');if(!sel||!g('sport'))return;
  const prev=sel.value,opts=genderOptions(g('sport').value,g('kind')?.value||'team');
  sel.innerHTML=opts.map(o=>`<option>${o}</option>`).join('');
  sel.value=opts.includes(prev)?prev:opts[0];
  sel.disabled=opts.length===1;
  let hint=g('genderHint');
  if(!hint){hint=document.createElement('small');hint.id='genderHint';hint.className='muted';sel.parentElement.appendChild(hint)}
  const s=g('sport').value;
  hint.textContent=opts.length===1?'Аралас команда: ереже бойынша ұлдар мен қыздар бірге ойнайды.':(s==='asyk'?'Ұлдар — асық ату, қыздар — бес асық. Бөлек жарыс.':'Ұлдар мен қыздар бөлек ойнайды: бір жарысқа тек таңдалған жыныс тіркеледі.');
}
const _us=window.updateSport;
window.updateSport=function(){_us();refreshGender()};
document.addEventListener('change',e=>{if(e.target&&(e.target.id==='sport'||e.target.id==='kind'))setTimeout(refreshGender,0)});
setTimeout(refreshGender,0);
const _cc=window.createCompetition;
window.createCompetition=function(){
  refreshGender();
  const sp=g('sport').value,age=g('age').value,r=REG[sp];
  if(sp==='futsal'&&age!=='9–11 сынып')return alert('Футзал ереже бойынша тек 9–11 сыныпқа арналған.');
  return _cc();
};

/* ===== Тіркеу формасы ===== */
const lastForm={};
window.entryForm=function(){
  if(!comp)return;
  const f=g('entryForm');if(!f)return;
  const ed=comp.editId?comp.entries.find(e=>e.id===comp.editId):null;
  const r=reg(),gen=comp.gender||'Ұлдар';
  const v=k=>ed?(ed[k]??''):'';
  const sch=ed?ed.school:(comp.lastSchool||(isIntra()?(comp.organizer||''):''));
  let html='<div class="notice" id="genderBanner"><b>Санат: '+esc(gen)+'</b> · '+(comp.age||'')+' · '+(
    comp.kind==='team'
      ?(r.mode==='mixed'?'Аралас команда: '+r.boys+' ұл + '+r.girls+' қыз (ұл орнына қыз ойнауға болмайды)':'Тек '+(gen==='Қыздар'?'қыз балалар':'ұл балалар')+' тіркеледі')
      :(gen==='Аралас'?'Жынысы әр қатысушыға таңдалады':'Тек '+(gen==='Қыздар'?'қыз балалар':'ұл балалар')+' тіркеледі'))+'</div>';
  html+='<div class="grid"><div><label>Мектеп / ұйым</label><input id="school" autocomplete="off" value="'+esc(sch)+'"></div>';
  if(comp.kind==='team'){
    html+='<div><label>Команда атауы</label><input id="entryName" autocomplete="off" value="'+esc(v('name'))+'"></div>';
    html+='<div><label>Жаттықтырушы / дене тәрбиесі мұғалімі</label><input id="coach" autocomplete="off" value="'+esc(v('coach'))+'"></div></div>';
    if(r.mode==='mixed'){
      const bs=ed?(ed.boys||[]):[],gs=ed?(ed.girls||[]):[];
      html+='<div class="grid">';
      for(let i=0;i<r.boys;i++)html+='<div><label>'+(i+1)+'-ұл бала (аты-жөні)</label><input id="pb'+i+'" autocomplete="off" value="'+esc(bs[i]||'')+'"></div>';
      for(let i=0;i<r.girls;i++)html+='<div><label>'+(r.girls>1?(i+1)+'-қыз бала':'Қыз бала')+' (аты-жөні)</label><input id="pg'+i+'" autocomplete="off" value="'+esc(gs[i]||'')+'"></div>';
      html+='</div>';
    }else{
      const pl=ed?(ed.players||[...(ed.boys||[]),...(ed.girls||[])]):[];
      html+='<div><label>Ойыншылар (әр жолға бір оқушы)</label><textarea id="players" rows="6" autocomplete="off" placeholder="Әр жолға бір оқушы:&#10;Асан Бекенов&#10;Нұрлан Сәрсен">'+esc(pl.join('\n'))+'</textarea><small class="muted" id="plCount"></small></div>';
    }
  }else{
    html+='<div><label>Спортшының аты-жөні</label><input id="entryName" autocomplete="off" value="'+esc(v('name'))+'"></div>';
    html+='<div><label>Сыныбы</label><input id="className" autocomplete="off" value="'+esc(v('className'))+'"></div>';
    if(!isIntra())html+='<div><label>Туған жылы</label><input id="birth" type="number" value="'+esc(v('birth'))+'"></div>';
    if(comp.gender==='Аралас')html+='<div><label>Жынысы</label><select id="sex"><option'+(v('gender')==='Ұлдар'?' selected':'')+'>Ұлдар</option><option'+(v('gender')==='Қыздар'?' selected':'')+'>Қыздар</option></select></div>';
    if(comp.sport==='athletics')html+='<div><label>Команда (мектеп / сынып)</label><input id="teamKey" autocomplete="off" value="'+esc(ed?(ed.team||''):'')+'" placeholder="бос қалса — мектеп аты"></div>';
    html+='</div>';
  }
  if(ed)html+='<div class="notice">✏️ Өңдеу режимі: «'+esc(ed.name)+'» · <button class="alt" type="button" onclick="cancelEdit()">Болдырмау</button></div>';
  f.innerHTML=html;
  const ab=document.querySelector('#entryForm')?.parentElement?.querySelector('.actions button');
  if(ab)ab.textContent=ed?'Өзгерісті сақтау':'Тіркеу';
  updateCount();
  const pl=g('players');if(pl)pl.addEventListener('input',updateCount);
  const nm=g('entryName');
  if(nm){if(window.__umlFocus||ed){nm.focus();window.__umlFocus=false}}
};
function listPlayers(){return String(g('players')?.value||'').split(/[\n;,]+/).map(x=>x.trim()).filter(Boolean)}
function updateCount(){
  const el=g('plCount');if(!el||!comp)return;
  const r=reg(),n=listPlayers().length,mn=minFor();
  const ok=n>=mn&&n<=r.max;
  el.style.color=ok?'#0a7a3d':'#b45309';
  el.textContent='Енгізілді: '+n+' · '+(r.exact?'дәл '+r.max:('керек: '+mn+'–'+r.max))+(ok?' ✓':'')+(isIntra()&&n<mn?' (мектепішілікте рұқсат етіледі)':'');
}
window.cancelEdit=function(){if(!comp)return;comp.editId=null;entryForm()};
window.editEntry=function(i){
  const e=comp?.entries?.[i];if(!e)return;
  comp.editId=e.id;entryForm();
  g('entryForm').scrollIntoView({behavior:'smooth',block:'center'});
};

/* ===== Қосу / өзгерту ===== */
window.addEntry=function(){
  if(!comp)return;
  const r=reg(),gen=comp.gender||'Ұлдар';
  const school=g('school')?.value.trim()||'',name=g('entryName')?.value.trim()||'';
  if(!school||!name)return alert('Мектеп/ұйым және команда/қатысушы атауын толтырыңыз.');
  const edId=comp.editId,ed=edId?comp.entries.find(e=>e.id===edId):null;
  const others=comp.entries.filter(e=>e!==ed);
  if(others.some(e=>nrm(e.name)===nrm(name)&&nrm(e.school)===nrm(school)))return alert('Осы мектептің мұндай атаудағы '+(comp.kind==='team'?'командасы':'қатысушысы')+' тіркелген.');
  const e=ed||{id:uid3(),school,name};
  e.school=school;e.name=name;
  if(comp.kind==='team'){
    e.coach=g('coach')?.value.trim()||'';
    let players;
    if(r.mode==='mixed'){
      const bs=[],gs=[];
      for(let i=0;i<r.boys;i++)bs.push((g('pb'+i)?.value||'').trim());
      for(let i=0;i<r.girls;i++)gs.push((g('pg'+i)?.value||'').trim());
      if(bs.some(x=>!x)||gs.some(x=>!x))return alert('Құрам толық емес: '+r.boys+' ұл және '+r.girls+' қыздың аты-жөнін жазыңыз. Ереже бойынша құрам толық болмаса команда жарысқа жіберілмейді.');
      players=[...bs,...gs];
      if(new Set(players.map(nrm)).size!==players.length)return alert('Команда құрамында бір ойыншы қайталанып тұр.');
      e.boys=bs;e.girls=gs;e.players=players;
      if(comp.sport==='chess')e.roster=[...bs,...gs];
    }else{
      players=listPlayers();
      if(new Set(players.map(nrm)).size!==players.length)return alert('Команда құрамында бір ойыншы қайталанып тұр.');
      const mn=minFor();
      if(players.length>r.max)return alert('Ережеде ең көбі '+r.max+' ойыншыға рұқсат етіледі. Енгізілді: '+players.length+'.');
      if(r.exact&&players.length!==r.max)return alert('Бұл спорт түрінде құрам дәл '+r.max+' оқушыдан тұрады. Енгізілді: '+players.length+'.');
      if(players.length<mn){
        if(!isIntra())return alert('Ереже бойынша құрам кемінде '+mn+' ойыншыдан тұруы керек (қазір '+players.length+'). Құрамы толық емес команда жарысқа жіберілмейді.');
        if(!confirm('Ережеде кемінде '+mn+' ойыншы керек, ал қазір '+players.length+'. Мектепішілік жарыс болғандықтан сақтауға болады. Сақтау керек пе?'))return;
      }
      e.players=players;
      if(gen==='Қыздар'){e.girls=players;e.boys=[]}else{e.boys=players;e.girls=[]}
    }
    e.gender=r.mode==='mixed'?'Аралас':gen;
    const roster=[...(e.players||[])].map(nrm);
    const existing=others.flatMap(x=>x.players||[...(x.boys||[]),...(x.girls||[])]).map(nrm);
    const dup=roster.find(x=>existing.includes(x));
    if(dup)return alert('Бұл спортшы басқа командаға тіркелген: '+dup);
  }else{
    e.className=g('className')?.value.trim()||'';
    if(!e.className)return alert('Оқушының сыныбын енгізіңіз.');
    if(!isIntra()){
      const b=g('birth')?.value||'';
      if(!/^\d{4}$/.test(String(b)))return alert('Туған жылын 4 санмен енгізіңіз.');
      if(Number(b)<1990||Number(b)>new Date().getFullYear())return alert('Туған жыл дұрыс емес.');
      e.birth=b;
    }else e.birth=e.birth||'';
    e.gender=comp.gender==='Аралас'?(g('sex')?.value||'Ұлдар'):comp.gender;
    if(comp.sport==='athletics')e.team=(g('teamKey')?.value.trim())||(isIntra()?e.className:school);
    if(others.some(x=>nrm(x.name)===nrm(name)&&nrm(x.className)===nrm(e.className)))return alert('Осындай аты-жөні мен сыныбы бар қатысушы тіркелген. Қайталануды тексеріңіз.');
  }
  const late=!ed&&(comp.matches||[]).length>0;
  if(!ed)comp.entries.push(e);
  comp.editId=null;
  if(comp.level&&isIntra()||true)comp.lastSchool=school;
  let msg='';
  if(late)msg=integrateLate(e);
  window.__lastAdded=(ed?'Өзгертілді: ':'Тіркелді: ')+e.name+(msg?' · '+msg:'');
  persist();window.__umlFocus=true;renderAll();entryForm();
  const st=g('lastAdded');if(st)st.textContent=window.__lastAdded;
};

/* ===== Жеребеден кейін кеш келген қатысушыны қосу (бұрынғы жеребе сақталады) ===== */
function mkm(round,stage,a,b,extra){
  const m={id:uid3(),round,stage,a,b:b||null,bye:!b,...(extra||{})};
  if(comp.sport==='chess'&&b){
    if(comp.kind==='team')m.teamAWhite=Math.random()<.5;
    else{m.colorA='Ақ';m.colorB='Қара'}
  }
  comp.matches.push(m);return m;
}
const done3=(m,i)=>{try{return window.__umlCalc(m,i).done}catch(_){return false}};
function integrateLate(e){
  if(comp.sport==='athletics')return '';
  const ms=comp.matches,sys=comp.system;
  const isPOm=m=>String(m.stage||'').startsWith('Плей-офф');
  if(sys==='swiss'){
    const cur=Math.max(0,...ms.map(m=>m.round||0));
    const idx=ms.map((m,i)=>[m,i]).filter(([m])=>m.round===cur);
    const bye=idx.find(([m,i])=>m.bye&&!m.b);
    const noRes=idx.every(([m,i])=>!m.b||!done3(m,i));
    if(bye&&noRes){const m=bye[0];m.b=e.id;m.bye=false;
      if(comp.sport==='chess'){if(comp.kind==='team')m.teamAWhite=Math.random()<.5;else{m.colorA='Ақ';m.colorB='Қара'}}
      return cur+'-турда бос тұрған қатысушымен жұптастырылды';}
    const st=(idx[0]&&idx[0][0].stage)||'Швейцариялық жүйе';
    mkm(cur||1,st,e.id,null);
    return (cur||1)+'-турда бос тур берілді, келесі турдан бастап жұптасады';
  }
  if(sys==='groups'){
    if(ms.some(isPOm)){e.unseeded=true;return 'ЕСКЕРТУ: плей-офф басталған, енді жеребеге қосылмайды';}
    const gs=comp.groups||[];if(!gs.length){e.unseeded=true;return '';}
    const small=[...gs].sort((a,b)=>a.ids.length-b.ids.length)[0];
    const mr=Math.max(0,...ms.filter(m=>m.group===small.name).map(m=>m.round||0));
    small.ids.slice().forEach((id,k)=>mkm(mr+1+k,'Топтық кезең · '+small.name,e.id,id,{group:small.name}));
    small.ids.push(e.id);
    return small.name+' тобына қосылды, бұрынғы кесте мен нәтижелер сақталды';
  }
  if(sys==='round'){
    const mr=Math.max(0,...ms.map(m=>m.round||0));
    comp.entries.filter(x=>x.id!==e.id).forEach((o,k)=>mkm(mr+1+k,'Айналмалы жүйе',e.id,o.id));
    return 'барлық қатысушымен қосымша ойындар кестеге қосылды';
  }
  if(sys==='ko'){
    const r1=ms.filter(m=>m.round===1);
    const slot=r1.find(m=>!m.b&&(!isPOm(m)||true));
    const anyRes=ms.some((m,i)=>m.b&&done3(m,i));
    if(slot&&!anyRes&&(comp.playoffRound||1)===1){slot.b=e.id;slot.bye=false;return 'бос орынға қойылды';}
    e.unseeded=true;return 'ЕСКЕРТУ: жеребеде бос орын жоқ';
  }
  return '';
}
window.umlIntegrateLate=integrateLate;

/* ===== Тізім: әдепкіде жасырын, батырмамен ашылады ===== */
window.__showEntries=window.__showEntries||{};
window.toggleEntries=function(){if(!comp)return;window.__showEntries[comp.id]=!window.__showEntries[comp.id];renderEntries()};
window.renderEntries=function(){
  if(!comp)return;const el=g('entries');if(!el)return;
  const open=!!window.__showEntries[comp.id],n=comp.entries.length;
  const r=reg();
  let tot='<div class="notice" style="display:flex;gap:12px;align-items:center;flex-wrap:wrap"><b>Тіркелген: '+n+(comp.kind==='team'?' команда':' қатысушы')+'</b><span class="muted" id="lastAdded">'+esc(window.__lastAdded||'')+'</span><button type="button" class="alt" onclick="toggleEntries()" style="margin-left:auto">'+(open?'Тізімді жасыру':'Тізімді көрсету')+'</button></div>';
  if(!open){el.innerHTML=tot;return}
  const rows=comp.entries.map((e,i)=>{
    const comp_=comp.kind==='team'?esc((e.players||[...(e.boys||[]),...(e.girls||[])]).join(', '))+(e.coach?'<br><small>Жаттықтырушы: '+esc(e.coach)+'</small>':''):esc((e.className||'')+(e.gender&&comp.gender==='Аралас'?' · '+e.gender:''));
    const warn=e.unseeded?' <b style="color:#b45309">жеребеге қосылмаған</b>':'';
    return '<tr><td>'+(i+1)+'</td><td>'+esc(e.school)+'</td><td>'+esc(e.name)+warn+'</td><td>'+comp_+'</td><td style="white-space:nowrap"><button type="button" class="alt" onclick="editEntry('+i+')">Өзгерту</button> <button type="button" class="danger" onclick="removeEntry('+i+')">Өшіру</button></td></tr>';
  }).join('');
  el.innerHTML=tot+'<div style="overflow-x:auto"><table><tr><th>№</th><th>Мектеп / ұйым</th><th>Команда / қатысушы</th><th>Құрамы</th><th></th></tr>'+rows+'</table></div>';
};
/* Қатысушыны өшіргенде басқа матчтар сақталады (v14 мінезі), тек өңдеу режимін тазалау */
const _re=window.removeEntry;
window.removeEntry=function(i){if(comp)comp.editId=null;_re(i);try{entryForm()}catch(_){}};
const _oc=window.openCompetition;
window.openCompetition=function(id){_oc(id);if(comp){comp.editId=null;try{entryForm()}catch(_){}}};
document.addEventListener('keydown',e=>{
  if(e.key==='Enter'&&e.target&&e.target.closest&&e.target.closest('#entryForm')&&e.target.tagName==='INPUT'){e.preventDefault();window.addEntry()}
  if(e.key==='Escape'&&comp&&comp.editId&&e.target.closest&&e.target.closest('#entryForm'))window.cancelEdit();
},true);
})();
