/* INTERFAZ: validación, renderizado, controles y eventos. */
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const st={s:0,t:0,timer:null,D:null,msg:''};
const pl=(n,w)=>n+' '+w+(n==1?'':'es');

function validate(p,t,k){
  if(!p.trim())return'Escribe un patrón para empezar (por ejemplo, GATO).';
  if([...p].length>24)return'El patrón puede tener como máximo 24 letras.';
  if(!t.trim())return'Escribe un texto donde buscar.';
  if(k>=[...p].length)return`Con ${pl(k,'error')} y un patrón de ${[...p].length} letra(s) todo coincidiría trivialmente. Elige menos errores que letras del patrón.`;
  return'';
}
function load(){
  const c=STAGES[st.s];stop();
  let p=c.pat,t=c.txt,k=c.k;
  if(c.free){p=$('#pat').value;t=$('#txt').value;k=+$('#k').value}
  st.msg=validate(p,t,k);st.D=st.msg?null:run(p,t,k);st.t=0;render();
}
function bitCells(x,m){let h='';for(let i=0;i<m;i++){const b=(x>>BigInt(i))&1n;h+=`<i class="bit ${b?'one':'zero'}${i==m-1?' last':''}">${b?1:0}</i>`}return h}
function bitsPanel(D,t){
  const s=D.steps[t],m=D.m;
  const row=(l,x)=>`<div class="brow"><span class="lbl">${l}</span><span class="bits">${bitCells(x,m)}</span></div>`;
  let h=`<div class="brow"><span class="lbl">Casillas del patrón</span><span class="bits">${D.Po.map(c=>`<i class="bit hd">${esc(c)}</i>`).join('')}</span></div>`;
  if(t)h+=row(`Máscara de «${esc(D.O[t-1])}»`,s.M);
  for(let d=0;d<=D.k;d++){
    h+=`<h4>Hasta ${pl(d,'error')} (nivel ${d})</h4>`;
    if(!t){h+=row('Estado inicial',s.R[d]);continue}
    const o=s.ops[d],p=D.steps[t-1];
    h+=row('Antes',p.R[d])+row('Coincide: (Antes ≪ 1) OR máscara',o.A);
    if(d)h+=row('Sustitución: Antes del nivel anterior ≪ 1',o.S)+row('Eliminación: Después del nivel anterior ≪ 1',o.Dl)+row('Inserción: Antes del nivel anterior',o.I);
    h+=row(d?'Después = AND de las 4 filas':'Después',s.R[d]);
  }
  return h;
}
function explain(D,t){
  const k=D.k,s=D.steps[t];
  const act=s.E.map((e,i)=>e==null?'':`${i+1}ª (${pl(e,'error')})`).filter(Boolean);
  if(!t)return`Aún no se ha leído nada. `+(k?`Como se permite${k>1?'n':''} ${pl(k,'error')}, las primeras ${k} casilla${k>1?'s':''} ya aparecen encendidas: equivale a poder saltarse esas letras del patrón (eliminaciones). `:`Ninguna casilla está encendida todavía. `)+`Pulsa Siguiente para leer la primera letra.`;
  const inP=D.P.map((c,i)=>c===s.c?i+1:0).filter(Boolean);
  let x=`Leo «${D.O[t-1]}» (posición ${t} de ${D.n}). `+(inP.length?`En el patrón esa letra está en la casilla ${inP.join(', ')}. `:`Esa letra no está en el patrón. `);
  x+=act.length?`Casillas encendidas ahora: ${act.join('; ')}. `:`No queda ninguna casilla encendida. `;
  if(k&&s.E.some(e=>e>0))x+=`Un error significa que la señal siguió gracias a una sustitución, una inserción o una eliminación. `;
  if(s.match)x+=`¡Coincidencia! «${D.O.slice(s.match.s,s.match.end+1).join('')}» (posiciones ${s.match.s+1}–${s.match.end+1}) se parece al patrón con ${pl(s.match.e,'error')}.`;
  return x;
}
function render(){
  const c=STAGES[st.s],D=st.D,t=st.t;
  $('#nav').innerHTML=STAGES.map((x,i)=>`<button data-s="${i}" ${i==st.s?'aria-current="step"':''}>${x.t}</button>`).join('');
  $('#stage').innerHTML=`<h2 id="stTitle">${c.t}</h2>${c.body}`;
  $('#freeBox').hidden=!c.free;
  const v=$('#view');
  if(!D){
    v.innerHTML=`<div class="card">${st.msg?`<div class="err" role="alert">⚠ ${esc(st.msg)}</div>`:''}</div>`;
    ['bPrev','bPlay','bNext','bReset'].forEach(i=>$('#'+i).disabled=true);$('#prog').textContent='';return;
  }
  const s=D.steps[t],last=D.n;
  const chars=D.O.map((ch,i)=>{
    let cl='ch';if(i<t-1)cl+=' done';if(i==t-1)cl+=' cur';
    D.matches.forEach(m=>{if(m.t<=t&&i>=m.s&&i<=m.end){cl+=' m';if(m.t==t)cl+=' mc'}});
    return`<div class="${cl}" ${i==t-1?'aria-current="true"':''}>${ch==' '?'␣':esc(ch)}<small>${i+1}</small></div>`}).join('');
  const cells=D.Po.map((ch,i)=>{const e=s.E[i];
    const on=e!=null,win=on&&i==D.m-1;
    return`<div class="cell ${on?'on':'off'}${win?' win':''}"><b>${esc(ch)}</b><span>${on?(e?`◆${e}`:'●')+(win?' ✓':''):'○'}</span></div>`}).join('');
  const found=D.matches.filter(m=>m.t<=t).map(m=>`<span class="found">✓ «${esc(D.O.slice(m.s,m.end+1).join(''))}» pos. ${m.s+1}–${m.end+1}, ${pl(m.e,'error')}</span>`).join('');
  v.innerHTML=`<div class="card"><h3>Texto <span class="badge">${t?`leyendo la letra ${t}`:'sin leer'}</span></h3><div class="strip" role="img" aria-label="Texto: ${esc(D.O.join(''))}. ${t?'Letra actual '+esc(D.O[t-1]):''}">${chars}</div>
  <h3>Patrón: casillas activas (máx. ${pl(D.k,'error')})</h3><div class="cells">${cells}</div></div>
  <div class="card expl" aria-live="polite"><b>¿Qué acaba de pasar?</b><br>${esc(explain(D,t))}</div>
  <div class="card"><h3>Coincidencias encontradas hasta ahora</h3>${found||'<span class="sub">Todavía ninguna.</span>'}<p class="sub" style="margin:8px 0 0">Al final: ${D.matches.length?pl(D.matches.length,'coincidencia').replace('ciaes','cias')+' (puede haber varias que terminan en letras vecinas).':'sin coincidencias con este máximo de errores.'}</p></div>
  ${c.bits?`<div class="card"><h3>Vista de bits</h3><p class="sub">0 = casilla encendida · 1 = apagada · el borde marca la última casilla del patrón.</p><div class="bitsbox">${bitsPanel(D,t)}</div></div>`:''}`;
  $('#bPrev').disabled=t==0;$('#bNext').disabled=t==last;$('#bReset').disabled=false;
  $('#bPlay').disabled=false;
  $('#bPlay').textContent=st.timer?'⏸ Pausar':'▶ Reproducir';$('#bPlay').setAttribute('aria-pressed',!!st.timer);
  $('#prog').textContent=`Paso ${t} de ${last}`;
}
const delay=()=>2600-$('#spd').value*230;
function stop(){if(st.timer){clearInterval(st.timer);st.timer=null}}
function tick(){if(st.t>=st.D.n){stop()}else st.t++;render()}
function play(){if(!st.D)return;if(st.timer){stop();render();return}if(st.t>=st.D.n)st.t=0;st.timer=setInterval(tick,delay());render()}
$('#bPlay').onclick=play;
$('#bNext').onclick=()=>{stop();if(st.t<st.D.n)st.t++;render()};
$('#bPrev').onclick=()=>{stop();if(st.t>0)st.t--;render()};
$('#bReset').onclick=()=>{stop();st.t=0;render()};
$('#spd').oninput=()=>{if(st.timer){stop();play()}};
$('#nav').onclick=e=>{const b=e.target.closest('button');if(b){st.s=+b.dataset.s;load()}};
['pat','txt','k'].forEach(i=>$('#'+i).addEventListener('input',load));
$('#freeBox .chips').onclick=e=>{const b=e.target.closest('button');if(b){$('#pat').value=b.dataset.p;$('#txt').value=b.dataset.t;$('#k').value=b.dataset.k;load()}};
document.addEventListener('keydown',e=>{if(/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)||!st.D)return;if(e.key=='ArrowRight')$('#bNext').click();if(e.key=='ArrowLeft')$('#bPrev').click()});
load();
const bad=selfTest(1500);
$('#test').textContent=bad?`⚠ Autoverificación: ${bad} diferencias con la referencia.`:'✓ Autoverificación: 1 500 casos aleatorios coinciden, casilla por casilla y paso a paso, con una implementación de referencia de programación dinámica (distancia de edición).';
