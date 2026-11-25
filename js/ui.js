/* INTERFAZ: validación, renderizado, controles, eventos y cambio de idioma. */
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const st={s:0,t:0,ex:0,bo:false,timer:null,D:null,msg:''};
const L=a=>a.length?a.map(i=>i+1).join(', '):T('none');
const on=(R,m)=>[...Array(m).keys()].filter(i=>!((R>>BigInt(i))&1n));
const frag=(D,m)=>D.O.slice(m.s,m.end+1).join('');
const exm=i=>({n:EXAMPLES[i].n[LANG],p:EXAMPLES[i].p[LANG],t:EXAMPLES[i].t[LANG]});

function validate(p,t){
  if(!p.trim())return'e_pat';
  if([...p].length>24)return'e_len';
  if(!t.trim())return'e_txt';
  return'';
}
function setInputs(){if(st.ex>=0){const e=exm(st.ex);$('#pat').value=e.p;$('#txt').value=e.t}}
function load(){
  const c=STAGES[st.s];stop();
  let p,t;
  if(c.free){p=$('#pat').value;t=$('#txt').value}else{const e=exm(Math.max(st.ex,0));p=e.p;t=e.t}
  st.msg=validate(p,t);st.D=st.msg?null:run(p,t);st.t=0;render();
}
function bitCells(x,m){let h='';for(let i=0;i<m;i++){const b=(x>>BigInt(i))&1n;h+=`<i class="bit ${b?'one':'zero'}${i==m-1?' last':''}">${b?1:0}</i>`}return h}
function bitsPanel(D,t){
  const s=D.steps[t],m=D.m;
  const row=(l,x)=>`<div class="brow"><span class="lbl">${l}</span><span class="bits">${bitCells(x,m)}</span></div>`;
  let h=`<div class="brow"><span class="lbl">${T('bp_boxes')}</span><span class="bits">${D.Po.map(c=>`<i class="bit hd">${esc(c)}</i>`).join('')}</span></div><h4>${T('bp_masks')}</h4>`;
  const seen=new Set();
  D.Po.forEach((c,i)=>{const k=D.P[i];if(seen.has(k))return;seen.add(k);h+=row(T('bp_mask',esc(c)),D.masks[k])});
  h+=row(T('bp_other'),D.full)+`<h4>${T('bp_step')}</h4>`;
  if(!t)return h+row(T('bp_init'),s.R);
  return h+row(T('bp_prev'),s.Rb)+row(T('bp_shift'),s.sh)+row(T('bp_mask',esc(D.O[t-1])),s.M)+row(T('bp_new'),s.R);
}
function explain(D,t){   // explicación en casillas
  if(!t)return T('e0');
  const s=D.steps[t],inP=D.P.map((c,i)=>c===s.c?i+1:0).filter(Boolean),a=on(s.R,D.m),b=on(s.Rb,D.m),moved=a.filter(i=>i>0);
  let x=T('eRead',D.O[t-1],t,D.n)+(inP.length?T('eIn',inP.join(', '),inP.length):T('eNot'));
  if(moved.length)x+=T('eMove',moved.map(i=>i+1).join(', '),moved.length);
  if(a.includes(0))x+=T('eStart');
  if(!a.length)x+=b.length?T('eDied'):T('eNone');
  if(s.match)x+=T('eMatch',frag(D,s.match),s.match.s+1,s.match.end+1);
  return x;
}
function explainBits(D,t){   // explicación en operaciones binarias
  if(!t)return T('b0');
  const s=D.steps[t],m=D.m;
  let x=T('bRead',D.O[t-1],L(on(s.M,m)),L(on(s.sh,m)),L(on(s.R,m)));
  if(s.match)x+=T('bMatch',frag(D,s.match),s.match.s+1,s.match.end+1);
  return x;
}
function render(){
  const c=STAGES[st.s],D=st.D,t=st.t;
  $('#nav').innerHTML=STAGES.map((x,i)=>`<button data-s="${i}" ${i==st.s?'aria-current="step"':''}>${T(x.tk)}</button>`).join('');
  $('#stage').innerHTML=`<h2 id="stTitle">${T(c.tk)}</h2>${T(c.bk)}`;
  $('#freeBox').hidden=!c.free;
  $('#chips').innerHTML=EXAMPLES.map((e,i)=>`<button data-i="${i}" aria-pressed="${i==st.ex}">${esc(e.n[LANG])}</button>`).join('');
  $('#bPlay').textContent=st.timer?T('pause'):T('play');
  const v=$('#view');
  if(!D){
    v.innerHTML=`<div class="card">${st.msg?`<div class="err" role="alert">⚠ ${esc(T(st.msg))}</div>`:''}</div>`;
    ['bPrev','bPlay','bNext','bReset'].forEach(i=>$('#'+i).disabled=true);$('#prog').textContent='';return;
  }
  const s=D.steps[t];
  const chars=D.O.map((ch,i)=>{
    let cl='ch';if(i<t-1)cl+=' done';if(i==t-1)cl+=' cur';
    D.matches.forEach(m=>{if(m.t<=t&&i>=m.s&&i<=m.end){cl+=' m';if(m.t==t)cl+=' mc'}});
    return`<div class="${cl}" ${i==t-1?'aria-current="true"':''}>${ch==' '?'␣':esc(ch)}<small>${i+1}</small></div>`}).join('');
  const cells=D.Po.map((ch,i)=>{const o=!((s.R>>BigInt(i))&1n),win=o&&i==D.m-1;
    return`<div class="cell ${o?'on':'off'}${win?' win':''}"><b>${esc(ch)}</b><span>${o?'●'+(win?' ✓':''):'○'}</span></div>`}).join('');
  const found=D.matches.filter(m=>m.t<=t).map(m=>`<span class="found">✓ «${esc(frag(D,m))}» ${T('pos')} ${m.s+1}–${m.end+1}</span>`).join('');
  const panel=c.bits?`<h3>${T('bitsTitle')}</h3><p class="sub">${T('bitsLegend')}</p><div class="bitsbox">${bitsPanel(D,t)}</div>`:'';
  v.innerHTML=`<div class="card"><h3>${T('text')} <span class="badge">${t?T('reading',t):T('unread')}</span></h3><div class="strip" role="img" aria-label="${esc(T('textAria',D.O.join(''),t?D.O[t-1]:''))}">${chars}</div>
  ${c.cells?`<h3>${T('pattern')}</h3><div class="cells">${cells}</div>`:''}</div>
  <div class="card expl" aria-live="polite"><b>${T('what')}</b><br>${esc(c.mode=='bits'?explainBits(D,t):explain(D,t))}${c.found?`<div class="foundrow"><b>${T('found')}</b> ${found||T('noneYet')}${t==D.n?T('total',D.matches.length):''}</div>`:''}</div>
  ${c.bits?(c.fold?`<details class="card more" id="bd" ${st.bo?'open':''}><summary>${T('fold')}</summary>${panel}</details>`:`<div class="card">${panel}</div>`):''}`;
  const bd=$('#bd');if(bd)bd.ontoggle=()=>{st.bo=bd.open};
  $('#bPrev').disabled=t==0;$('#bNext').disabled=t==D.n;$('#bReset').disabled=false;$('#bPlay').disabled=false;
  $('#bPlay').setAttribute('aria-pressed',!!st.timer);
  $('#prog').textContent=T('prog',t,D.n);
}
const delay=()=>2600-$('#spd').value*230;
function stop(){if(st.timer){clearInterval(st.timer);st.timer=null}}
function tick(){if(st.t>=st.D.n)stop();else st.t++;render()}
function play(){if(!st.D)return;if(st.timer){stop();render();return}if(st.t>=st.D.n)st.t=0;st.timer=setInterval(tick,delay());render()}
const bad=selfTest(1500);
const setTest=()=>{const e=$('#test');if(e)e.textContent=bad?T('test_bad',bad):T('test_ok')};
function setLang(l){LANG=l;try{localStorage.setItem('lang',l)}catch(e){}applyAll()}
function applyAll(){applyStatic();$('#lang').textContent=T('langBtn');$('#lang').setAttribute('aria-label',T('langAria'));setTest();
  const t0=st.t;if(STAGES[st.s].free)setInputs();load();if(st.D){st.t=Math.min(t0,st.D.n);render()}}
$('#lang').onclick=()=>setLang(LANG=='es'?'en':'es');
$('#bPlay').onclick=play;
$('#bNext').onclick=()=>{stop();if(st.t<st.D.n)st.t++;render()};
$('#bPrev').onclick=()=>{stop();if(st.t>0)st.t--;render()};
$('#bReset').onclick=()=>{stop();st.t=0;render()};
$('#nav').onclick=e=>{const b=e.target.closest('button');if(b){st.s=+b.dataset.s;if(STAGES[st.s].free)setInputs();load()}};
['pat','txt'].forEach(i=>$('#'+i).addEventListener('input',()=>{st.ex=-1;load()}));
$('#chips').onclick=e=>{const b=e.target.closest('button');if(b){st.ex=+b.dataset.i;if(STAGES[st.s].free)setInputs();load()}};
document.addEventListener('keydown',e=>{if(/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)||!st.D)return;if(e.key=='ArrowRight')$('#bNext').click();if(e.key=='ArrowLeft')$('#bPrev').click()});
applyAll();
