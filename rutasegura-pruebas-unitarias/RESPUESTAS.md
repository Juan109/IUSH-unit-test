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

| RN-02 | vel: 55 km/h , dis: 8 , factor : 1.6 | 14 minutos | feliz
| RN-02 | vel: 55 km/h , dis: 0 , factor : 1.5 | 0 minutos  | Limite
| RN-02 | vel: 0 km/h , dis: 8 , factor : 1.5 | Null       | Limite
| RN-02 | vel: 0 km/h , dis: -5 , factor : 1.5 | RangeError | Error (Distancia Negativa)

| RN-03 | vel: 30 km/h , dis: 5 , factor : 1.0 | 10 minutos| feliz
| RN-03 | vel: 1 km/h , dis: 10 , factor : 1.0 | 600 minutos| Limite
| RN-03 | vel: 50 km/h , dis: 1 , factor : 1.0 | 2 minutos| Limite
| RN-03 | vel: 40 km/h , dis: -5 , factor : 1.0 | RangeError| Error 

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

**5.** En `NotificadorAcudientes`, ¿por qué usaron un mock en lugar del proveedor real de SMS? ¿Qué verifica `toHaveBeenCalledWith` que no verifica el valor de retorno de la función?

**6.** ¿Qué porcentaje de cobertura obtuvieron? ¿Es posible tener 100 % de cobertura y aun así tener un defecto sin detectar? Muestren un ejemplo concreto con el código de RutaSegura.

**7.** Para cada defecto encontrado, describan la cadena **error → defecto → falla** (Unidad 3): ¿qué equivocación humana lo originó, dónde está en el código y qué le pasaría al acudiente o al colegio si llega a producción?

**8.** ¿Su suite cumple el principio **FIRST**? Den un ejemplo de una prueba suya que cumpla cada letra, y digan si alguna prueba lo viola (por ejemplo, depender de `new Date()` sin fijar la hora).

**9.** Supongan que el equipo de desarrollo corrige todos los defectos mañana. ¿Qué valor tiene conservar sus pruebas en el repositorio? ¿Qué pasaría si dentro de seis meses alguien vuelve a introducir el error de RN-01?

**10.** Si por tiempo solo pudieran entregar **3 pruebas** de todo el repositorio, ¿cuáles escogerían y por qué? Justifiquen según el riesgo para los estudiantes y acudientes.
