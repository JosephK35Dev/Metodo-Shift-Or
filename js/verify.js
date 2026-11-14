/* VERIFICACIÓN: compara run() con una referencia de programación dinámica (Sellers). */
const _A=typeof require!=="undefined"?require("./algorithm.js"):{run,norm};
// Referencia sencilla: programación dinámica de Sellers (columna D[0..m] por cada letra del texto)
function ref(P,T){const m=P.length;let prev=Array.from({length:m+1},(_,i)=>i);const cols=[prev];for(const c of T){const cur=[0];for(let i=1;i<=m;i++)cur[i]=Math.min(prev[i-1]+(P[i-1]===c?0:1),prev[i]+1,cur[i-1]+1);cols.push(cur);prev=cur}return cols}
function selfTest(N,impl=_A){let bad=0;const al='abc ';for(let q=0;q<N;q++){const r=n=>Array.from({length:n},()=>al[Math.random()*4|0]).join('');const pat=r(1+Math.random()*6|0),txt=r(Math.random()*14|0),k=Math.random()*4|0;const D=impl.run(pat,txt,k),cols=ref(D.P,D.T);D.steps.forEach((s,t)=>{for(let i=0;i<D.m;i++){const x=cols[t][i+1];if(s.E[i]!==(x<=k?x:null))bad++}})}return bad}
if(typeof module!=='undefined')module.exports={selfTest,ref};
