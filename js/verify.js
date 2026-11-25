/* VERIFICACIÓN: compara run() con una búsqueda ingenua (comparar letra por letra).
   Revisa que la casilla i esté encendida tras leer la letra j  <=>  las últimas i+1 letras leídas
   son iguales a las primeras i+1 del patrón; y que las coincidencias sean las mismas. */
const _A=typeof require!=="undefined"?require("./algorithm.js"):{run,norm};
function ref(P,T){return T.map((_,j)=>P.map((__,i)=>j-i>=0&&T.slice(j-i,j+1).join('')===P.slice(0,i+1).join('')))}
function selfTest(N,impl=_A){
  let bad=0;const al='ab ';
  const r=n=>Array.from({length:n},()=>al[Math.random()*3|0]).join('');
  for(let q=0;q<N;q++){
    const D=impl.run(r(1+Math.random()*6|0),r(Math.random()*16|0)),cols=ref(D.P,D.T);
    D.steps.forEach((s,t)=>{if(!t)return;for(let i=0;i<D.m;i++)if(!((s.R>>BigInt(i))&1n)!==cols[t-1][i])bad++});
    const naive=[];for(let s=0;s+D.m<=D.n;s++)if(D.T.slice(s,s+D.m).join('')===D.P.join(''))naive.push(s);
    if(JSON.stringify(naive)!==JSON.stringify(D.matches.map(x=>x.s)))bad++;
  }
  return bad;
}
if(typeof module!=='undefined')module.exports={selfTest,ref};
