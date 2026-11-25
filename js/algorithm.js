/* ALGORITMO: Shift-Or clásico (Baeza-Yates y Gonnet), búsqueda EXACTA.
   R tiene un bit por letra del patrón: 0 = casilla encendida, 1 = apagada.
   Por cada letra c del texto:   R = (R << 1) OR S[c]
   Hay coincidencia cuando el bit de la última casilla vale 0.
   run() guarda cada paso (R antes, desplazado, máscara, R después) para dibujarlo en ui.js. */
const norm=ch=>ch.normalize('NFD')[0].toUpperCase();   // ignora mayúsculas y acentos

function run(pat,txt){
  const O=[...txt],Po=[...pat],P=Po.map(norm),T=O.map(norm),m=P.length,n=T.length;
  const full=(1n<<BigInt(m))-1n,masks={};
  // Máscara S[c]: 0 en las casillas donde el patrón tiene la letra c, 1 en las demás.
  P.forEach((c,i)=>{masks[c]=(masks[c]??full)&~(1n<<BigInt(i))});
  const mk=c=>masks[c]??full;
  let R=full;                                   // al inicio todo apagado
  const steps=[{R}],matches=[];
  for(let j=0;j<n;j++){
    const M=mk(T[j]);
    const sh=(R<<1n)&full;                      // desplazamiento: entra un 0 por la casilla 1
    const nw=sh|M;                              // OR con la máscara de la letra leída
    const match=((nw>>BigInt(m-1))&1n)?null:{s:j-m+1,end:j,t:j+1};
    if(match)matches.push(match);
    steps.push({R:nw,Rb:R,sh,M,c:T[j],match});
    R=nw;
  }
  return {O,Po,P,T,m,n,masks,full,steps,matches};
}
if(typeof module!=='undefined')module.exports={norm,run};
