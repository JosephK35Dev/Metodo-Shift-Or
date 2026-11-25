/* CONTENIDO DIDÁCTICO: ejemplos y pestañas (los textos están en i18n.js).
   Cada pestaña decide QUÉ se muestra del simulador:
   cells = casillas del patrón · found = lista de coincidencias · bits = panel de bits
   fold = el panel de bits va plegable · free = se pueden escribir patrón y texto
   mode = tipo de explicación ('idea' en casillas, 'bits' en operaciones binarias) */
const EXAMPLES=[
 {n:{es:'GATO',en:'CAT'},p:{es:'GATO',en:'CAT'},t:{es:'EL GATO ESTÁ AQUÍ',en:'THE CAT IS HERE'}},
 {n:{es:'CASA: la señal se apaga',en:'CASE: the signal goes out'},p:{es:'CASA',en:'CASE'},t:{es:'UNA CASCADA Y UNA CASA',en:'A CASCADE AND A CASE'}},
 {n:{es:'ANA: coincidencias solapadas',en:'ANA: overlapping matches'},p:{es:'ANA',en:'ANA'},t:{es:'BANANA',en:'BANANA'}}];
const STAGES=[
 {tk:'s1t',bk:'s1b',mode:'idea',cells:1,found:1},
 {tk:'s2t',bk:'s2b',mode:'bits',bits:1},
 {tk:'s3t',bk:'s3b',mode:'idea',cells:1,found:1,bits:1,fold:1,free:1}];
