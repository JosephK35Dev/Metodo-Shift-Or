# Shift-Or: simulador didáctico de búsqueda de patrones

Aplicación web interactiva que explica, paso a paso y con lenguaje sencillo, el algoritmo **Shift-Or** (Baeza-Yates y Gonnet) para buscar un patrón dentro de un texto. Está pensada para personas que lo ven por primera vez: no requiere saber programación, binario ni algoritmos.

## Autores y datos del trabajo

| Campo | Dato |
|---|---|
| Autor | Joseph Adrian Rubio Rivera (código 1152520) |
| Correo | josephadrianrr@ufps.edu.co |
| Fecha | 24 de noviembre de 2026 |
| Materia | Análisis de Algoritmos |
| Carrera | Ingeniería de Sistemas |
| Universidad | Universidad Francisco de Paula Santander (UFPS) |
| Localización | Cúcuta, Norte de Santander, Colombia |
| Profesor | Marco Antonio Adarme Jaimes |
| Repositorio | https://github.com/JosephK35Dev/Metodo-Shift-Or.git |
 
## Ejecución
 
No necesita instalación ni servidor: descarga o clona el repositorio y abre `index.html` con doble clic en un navegador moderno.
También disponible de forma web con Github Pages: https://josephk35dev.github.io/Metodo-Shift-Or/
 
Pruebas del algoritmo (opcional, requiere Node.js):
 
```bash
node test/test.js
```
 
## ¿Qué problema resuelve?
 
Dado un **patrón** (por ejemplo `GATO`) y un **texto**, encontrar en qué posiciones aparece el patrón leyendo el texto **una sola vez**, sin volver atrás.
 
## El método
 
### Idea intuitiva
 
Cada letra del patrón es una casilla. Al leer el texto, una señal avanza de casilla en casilla cada vez que la letra leída coincide con la siguiente. Si la señal llega a la última casilla, hay una coincidencia. Si una letra no coincide, esa señal se apaga.
 
### Representación con bits
 
Se usa un número binario `R` con **un bit por casilla** del patrón (`m` bits). En Shift-Or, **0 = casilla encendida** (los primeros `i+1` caracteres del patrón coinciden con los últimos `i+1` leídos) y **1 = casilla apagada**.
 
- **Máscara `S[c]`** de una letra `c`: tiene un 0 en las posiciones donde el patrón contiene `c` y 1 en las demás. Se calcula una sola vez antes de buscar.
- **Desplazamiento (`<< 1`)**: mueve cada señal una casilla adelante; entra un 0 por la primera casilla, que permite iniciar una coincidencia nueva en cada letra.
- **OR con la máscara**: apaga las casillas que no coinciden con la letra leída.
### Algoritmo
 
```
R = 1…1                      (todo apagado)
por cada letra c del texto:
    R = (R << 1) OR S[c]
    si el bit de la última casilla es 0 → coincidencia que termina en esta letra
```
 
### Ejemplo con `GATO`
 
En pantalla la casilla 1 está a la izquierda, y el desplazamiento mueve los bits hacia la derecha.
 
| Letra leída | Máscara | Estado `R` | Casilla encendida |
|---|---|---|---|
| (inicio) | | `1111` | ninguna |
| G | `0111` | `0111` | 1 (G) |
| A | `1011` | `1011` | 2 (A) |
| T | `1101` | `1101` | 3 (T) |
| O | `1110` | `1110` | 4 (O): **coincidencia** |
 
### Complejidad y límites
 
- Preprocesamiento (máscaras): `O(m + σ)`, con `σ` el tamaño del alfabeto.
- Búsqueda: `O(n)`, con `n` la longitud del texto, independiente del patrón y del alfabeto, **siempre que el patrón quepa en una palabra de máquina**.
- La versión clásica guarda `R` en **una palabra de máquina** (32 o 64 bits), así que `m` no puede superar ese tamaño. Este simulador usa `BigInt` (longitud arbitraria) y limita el patrón a **24 letras** solo para que los bits quepan en pantalla.
- Solo busca coincidencias **exactas**. Mayúsculas y acentos se ignoran al comparar.
## Validación
 
`js/verify.js` compara el algoritmo con una **búsqueda ingenua** (comparar letra por letra) y revisa el estado de **cada casilla en cada paso**, además de las posiciones de las coincidencias. `node test/test.js` ejecuta 20 000 casos aleatorios (0 diferencias) y la página repite la verificación con 1 500 casos al cargar. Los pasos que se visualizan son los mismos que calcula el algoritmo.
 
## ¿Qué necesita un autocorrector?
 
Shift-Or **no conoce palabras, no tiene diccionario y no corrige por sí solo**: solo indica dónde aparece un patrón exacto. Un autocorrector necesita además un **diccionario**, una forma de generar **candidatos**, un criterio para **elegir** entre ellos (frecuencia, contexto) y **reglas de lengua**. Para tolerar errores existen extensiones del método (como Wu–Manber/Bitap), que no forman parte de este proyecto.
 
## Estructura del proyecto
 
```
index.html          estructura de la página
css/styles.css      estilos (paleta blanco y rojo)
js/i18n.js          textos en español e inglés y cambio de idioma (botón 🌐)
js/algorithm.js     algoritmo Shift-Or y generación de pasos
js/verify.js        referencia ingenua y autoverificación
js/stages.js        etapas, ejemplos y textos didácticos
js/ui.js            interfaz, controles y eventos
test/test.js        pruebas en Node
img/logo-ufps.png   logo de la universidad (guárdalo aquí con ese nombre)
```
 
## Referencias
 
- R. Baeza-Yates y G. Gonnet. *A new approach to text searching*. Communications of the ACM, 35(10), 1992.
- T. Lecroq. *Shift Or algorithm*: http://www-igm.univ-mlv.fr/~lecroq/string/node6.html
- G. Navarro y M. Raffinot. *Flexible Pattern Matching in Strings*. Cambridge University Press, 2002.
