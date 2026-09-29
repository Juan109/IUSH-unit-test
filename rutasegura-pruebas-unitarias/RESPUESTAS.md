# Respuestas del taller — RutaSegura

Integrantes:
- Juan Jose Pulido 
- Brayan Rivera 

## Ejercicio 1 — Diseño de casos (RN-01 a RN-04)

| Regla | Entradas (velocidad, distancia, factor) | Resultado esperado (calculado a mano) | Tipo (feliz / límite / error) |
|---|---|---|---|
| RN-01 | vel: 40 km/h , dis: 10 , factor : 1.5 | 23 minutos| feliz
| RN-01 | vel: 40 km/h , dis: 10 , factor : 1   | 15 minutos| Limite
| RN-01 | vel: 40 km/h , dis: 10 , factor : 3   | 45 minutos| Limite
| RN-01 | vel: 40 km/h , dis: 10 , factor : 3.5 | RangeError| Error

| Regla | Entradas (velocidad, distancia, factor) | Resultado esperado (calculado a mano) | Tipo (feliz / límite / error) |
|---|---|---|---|
| RN-02 | vel: 55 km/h , dis: 8 , factor : 1.6 | 14 minutos | feliz
| RN-02 | vel: 55 km/h , dis: 0 , factor : 1.5 | 0 minutos  | Limite
| RN-02 | vel: 0 km/h , dis: 8 , factor : 1.5 | Null       | Limite
| RN-02 | vel: 0 km/h , dis: -5 , factor : 1.5 | RangeError | Error (Distancia Negativa)

| Regla | Entradas (velocidad, distancia, factor) | Resultado esperado (calculado a mano) | Tipo (feliz / límite / error) |
|---|---|---|---|
| RN-03 | vel: 30 km/h , dis: 5 , factor : 1.0 | 10 minutos| feliz
| RN-03 | vel: 1 km/h , dis: 10 , factor : 1.0 | 600 minutos| Limite
| RN-03 | vel: 50 km/h , dis: 1 , factor : 1.0 | 2 minutos| Limite
| RN-03 | vel: 40 km/h , dis: -5 , factor : 1.0 | RangeError| Error 

| Regla | Entradas (velocidad, distancia, factor) | Resultado esperado (calculado a mano) | Tipo (feliz / límite / error) |
|---|---|---|---|
| RN-04 | vel: 40 km/h , dis: 10 , factor : 2 | 30 minutos| feliz
| RN-04 | vel: 40 km/h , dis: 10 , factor : 1.0 | 15 minutos| Limite
| RN-04 | vel: 40 km/h , dis: 10 , factor : 3.0 | 45 minutos| Limite
| RN-04 | vel: 40 km/h , dis: 10 , factor : 3.1 | RangeError| Error 
## Preguntas

Respondan cada pregunta con base en SUS pruebas (citen el nombre del `it` cuando aplique). Respuestas genéricas copiadas de internet no suman puntos.

**1.** Para `calcularMinutosEstimados`, ¿qué valores de entrada escogieron para el caso feliz y por qué esos y no otros? ¿Qué demuestra esa prueba y qué NO demuestra?
R/  Para calcular 'calcularMinutosEstimados' usamos valores cotidianos como velocidad de 40km/h , 10 km y 1.5 de Factor Trafico  , y no escogi valores irreales mucho mas altos ya que seria algo absurdo para este escenario en especifico.
Esta prueba demuestra que aplicando la formula dada es util para escenarios ideales , pero la funcion es inutil para excepciones como cuando la velocidad es 0.

**2.** Tomen su prueba de caso feliz de RN-01 y cambien únicamente el dato `factorTrafico` a `1.0` (ajustando el valor esperado según la fórmula). ¿Cambia el resultado de la prueba (pasa / falla)? ¿Qué les enseña esto sobre la selección de datos de prueba?
R/ Si pasa , pero erroneamente ya que al estar mal la formula (divicion en vez de multiplicacion) si usamos el 1.0 para multiplicar o dividir da lo mismo , esto nos enseña que debemos usar datos que no sean neutros como 1 , para evaluar correctamente los pruebas.

**3.** En RN-06 y RN-08, ¿por qué probaron exactamente los valores límite (90, -90, 5, 15, etc.) y no solo valores "del medio" como 45 o 10? Expliquen con el resultado que obtuvieron.
R/  Porque generalmente los errores estan en los limites como el caso de la prueba DEF-04 al enviar 15 obtuvimos GRAVE en lugar de LEVE ,y el caso del DEF-06 que enviamos 90 esperando que el limite diera 'True' y el resultado dio 'False' Si se hubieran probado valores del medio como 10 , no se hubiera podido detectar que hubo un error de signos.

**4.** Una prueba que pasa, ¿demuestra que la función es correcta? Argumenten usando un ejemplo real de su suite.
R/ No, solo demuestra que la función cumple el camino específico que se evaluó,en la prueba esPlacaValida_conFormatoEstandar_debeRetornarTrue (con la placa 'WPX482') pasa en verde. Sin embargo, eso no demuestra que la función sea correcta si un usuario ingresa una placa con caracteres especiales o de longitud inválida, escenarios que obligatoriamente requieren sus propias pruebas.

**5.** En `NotificadorAcudientes`, ¿por qué usaron un mock en lugar del proveedor real de SMS? ¿Qué verifica `toHaveBeenCalledWith` que no verifica el valor de retorno de la función?
R/ Usamos un mock porque las pruebas deben ser rápidas, gratuitas y deterministas. Llamar a un proveedor real consumiría saldo económico y haría fallar la prueba si no hay conexión a internet y el toHaveBeenCalledWith verifica el contrato de integración: nos garantiza que nuestra función le entregó al proveedor el número de teléfono correcto del acudiente.

**6.** ¿Qué porcentaje de cobertura obtuvieron? ¿Es posible tener 100 % de cobertura y aun así tener un defecto sin detectar? Muestren un ejemplo concreto con el código de RutaSegura.
R/ Obtuve el 100% de cobertura , y si es posible tener defectos sin detectar. Un ejemplo es el DEF-05 el código tenía 100% de cobertura, pero el desarrollador olvidó programar el if para filtrar a los acudientes con notificaciones desactivadas. Jest leyó todas las líneas existentes, pero no pudo avisar que faltaba una regla de negocio.

**7.** Para cada defecto encontrado, describan la cadena **error → defecto → falla** (Unidad 3): ¿qué equivocación humana lo originó, dónde está en el código y qué le pasaría al acudiente o al colegio si llega a producción?
1. En el módulo de tiempos (DEF-01), descubrí que la fórmula principal falla porque el desarrollador usó una división en lugar de una multiplicación al aplicar el factor de tráfico. Esto hace que el sistema calcule tiempos de espera muchísimo más cortos que la realidad.

2. Este error matemático generó una falla en cascada al evaluar el tráfico pesado (DEF-02). Al probar el límite superior (un factor de 3.0), la aplicación calculó absurdamente que el bus llegaría en solo 5 minutos, cuando en realidad debería tardar 45 minutos.

3. Por culpa de este mismo defecto base, la sincronización del reloj también falló (DEF-03). Como los minutos se están calculando mal, la función que le suma ese tiempo a la hora actual termina mostrando en la pantalla del acudiente una hora de llegada completamente desfasada.

4. Al aplicar la técnica de valores límite en las alertas, encontré un error de operadores relacionales (DEF-04). Si el bus se retrasa exactamente 15 minutos, el sistema dispara una alerta "GRAVE" en lugar de "LEVE", simplemente porque el programador usó el operador equivocado y excluyó el número 15.

5. En Mocks (simuladores) en el módulo de notificaciones, me di cuenta de que el código ignora las preferencias de privacidad (DEF-05). El sistema le envía mensajes de texto a todos los acudientes, incluso a los que desactivaron las notificaciones, porque al desarrollador se le olvidó programar el condicional if

6. En el (DEF-06) probando los límites de las coordenadas , descubrí que la aplicación rechaza las latitudes exactas de 90 y -90 grados. Esto ocurre por otro error lógico en la condición matemática, ya que usaron el símbolo "menor estricto" (<) en vez del "menor o igual" (<=) que exigía el requisito.

**8.** ¿Su suite cumple el principio **FIRST**? Den un ejemplo de una prueba suya que cumpla cada letra, y digan si alguna prueba lo viola (por ejemplo, depender de `new Date()` sin fijar la hora).
R/ Si cumple el principio first :
Fast: Las 47 pruebas se ejecutan en aproximadamente 13 segundos gracias a que aislamos la red con mocks.
Independent: En notificador.test.ts usamos beforeEach para reiniciar el mock de SMS, evitando que una prueba contamine a la siguiente.
Repeatable: Cumplimos esta letra en calcularHoraEstimadaLlegada_conDatosNormales... inyectando una fecha estática (new Date(2026, 8, 22, 6, 30)). Si hubiéramos usado new Date() vacío, violaríamos el principio porque la prueba daría un resultado distinto si se ejecuta mañana.
Self-Validating: Las pruebas reportan éxito o fallo mediante aserciones de Jest (expect), sin requerir inspección manual de logs.
Timely: Las pruebas se diseñaron estructurando los casos límite antes de revisar la lógica interna.

**9.** Supongan que el equipo de desarrollo corrige todos los defectos mañana. ¿Qué valor tiene conservar sus pruebas en el repositorio? ¿Qué pasaría si dentro de seis meses alguien vuelve a introducir el error de RN-01?
Conservar las pruebas nos brinda una suite de regresión. El valor radica en blindar el código contra modificaciones futuras. Si en seis meses un nuevo desarrollador altera el módulo ETA para agregar una nueva funcionalidad y accidentalmente vuelve a cambiar la multiplicación por una división (RN-01), nuestra prueba fallará en la consola (o en el pipeline de GitHub Actions) inmediatamente, bloqueando el despliegue a producción de ese código defectuoso.

**10.** Si por tiempo solo pudieran entregar **3 pruebas** de todo el repositorio, ¿cuáles escogerían y por qué? Justifiquen según el riesgo para los estudiantes y acudientes.
1. Cálculo ETA normal (RN-01): Porque es el "core business" (núcleo) de RutaSegura. Si esto falla, la app pierde su propósito fundamental de informar tiempos.

2. Límite de alerta GRAVE (RN-08): Un fallo aquí implica un riesgo directo a la seguridad física del estudiante. Si hay un accidente o el bus se vara (más de 15 min) y no se clasifica como GRAVE, el protocolo de reacción del colegio no se activará.

3. Tolerancia a fallos de SMS (RN-13 con mockRejectedValue): Porque las redes de telecomunicaciones fallan con frecuencia en la vida real. Si la app no captura este error, una caída del proveedor de SMS tumbaría todo el servidor de RutaSegura, dejando a todos los acudientes a ciegas.