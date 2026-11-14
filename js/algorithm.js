/* ALGORITMO: Shift-Or / Bitap aproximado (Wu–Manber, distancia de Levenshtein).
   Sin dependencias del navegador. 0 = casilla activa, 1 = descartada.
   run() devuelve todos los pasos (estados, operaciones) que luego dibuja ui.js. */
const norm=ch=>ch.normalize('NFD')[0].toUpperCase();
function ed(a,b){let p=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){const c=[i];for(let j=1;j<=b.length;j++)c[j]=Math.min(p[j-1]+(a[i-1]===b[j-1]?0:1),p[j]+1,c[j-1]+1);p=c}return p[b.length]}
function frag(P,T,j,e,k){const m=P.length;let best=null;for(let len=Math.max(1,m-k);len<=m+k&&len<=j+1;len++){const s=j+1-len,d=ed(P,T.slice(s,j+1));if(d<=k&&(!best||d<best.e||(d===best.e&&Math.abs(len-m)<Math.abs(best.len-m))))best={s,end:j,e:d,len}}return best||{s:j,end:j,e,len:1}}
function run(pat,txt,k){
  const O=[...txt],Po=[...pat],P=Po.map(norm),T=O.map(norm),m=P.length,n=T.length;
  const full=(1n<<BigInt(m))-1n,masks={};
  P.forEach((c,i)=>{masks[c]=(masks[c]??full)&~(1n<<BigInt(i))});
  const mk=c=>masks[c]??full;
  const minE=R=>{const E=[];for(let i=0;i<m;i++){let e=null;for(let d=0;d<=k;d++)if(!((R[d]>>BigInt(i))&1n)){e=d;break}E.push(e)}return E};
  let R=Array.from({length:k+1},(_,d)=>(full<<BigInt(d))&full);
  const steps=[{R,E:minE(R)}],matches=[];
  for(let j=0;j<n;j++){
    const old=R,M=mk(T[j]),nw=[],ops=[];
    for(let d=0;d<=k;d++){
      const A=((old[d]<<1n)|M)&full;
      if(!d){nw[0]=A;ops.push({A})}
      else{const S=(old[d-1]<<1n)&full,Dl=(nw[d-1]<<1n)&full,I=old[d-1];nw[d]=A&S&Dl&I;ops.push({A,S,Dl,I})}
    }
    R=nw;const E=minE(R),e=E[m-1];let match=null;
    if(e!=null){match=frag(P,T,j,e,k);matches.push({...match,t:j+1})}
    steps.push({R,E,ops,M,c:T[j],match});
  }
  return {O,Po,P,T,m,n,k,steps,matches};
}
if(typeof module!=='undefined')module.exports={norm,run};
