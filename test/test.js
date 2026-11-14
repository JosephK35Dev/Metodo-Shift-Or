const {selfTest}=require('../js/verify.js');
const {run}=require('../js/algorithm.js');
const bad=selfTest(20000);
const g=run('GATO','EL GAXO ESTÁ AQUÍ',1).matches.map(m=>[m.s+1,m.end+1,m.e]);
console.log('Diferencias con la referencia:',bad,'| GATO k=1 ->',JSON.stringify(g));
process.exit(bad||JSON.stringify(g)!=='[[4,7,1]]'?1:0);
