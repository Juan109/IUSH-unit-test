# Reporte de defectos — RutaSegura

Integrantes:
- Juan Jose Pulido 
- Brayan Rivera 

Reporten aquí cada prueba que falla porque el código no cumple la especificación. Copien el bloque por cada defecto.

---

### DEF-01

| Campo | Detalle |
|---|---|
| Regla incumplida (RN-XX) | RN-01 |
| Función | calcularMinutosEstimados |
| Prueba que lo detecta (nombre exacto del `it`) | calcularMinutosEstimados_conDatosNormales_debeCalcularSegunFormula |
| Datos de entrada | Vel : 40 , dis:10 , factorTrafico:1.5|
| Resultado esperado (según README) | 23 minutos |
| Resultado obtenido | 10 Minutos |
| Severidad (Alta / Media / Baja) y por qué | Alta ya que afecta la principal funcionalidad del sistema que es el calculo del tiempo , este tipo de errore son los que causan que el usuario deje de confiar en el sistema. |
| Falla que vería el usuario final (acudiente, conductor o coordinación) | El acudiente seria el mas afectado ya  que la app le mostraria que el bus llegaria en 10 minutos , pero debido al trafico y al calculo erroneo ,tardara 23 minutos. El usuario saldria y al no ver que llega pensara que ya paso , y perdio el bus, causando inconformimades en los usuarios. |
| Causa probable en el código (línea / condición) | En el codigo hay un signo matematico mal utilizado , en el momento de aplicar el 'FactorTrafico' se utiliza la '/' divicion en vez de la '*' multiplicacion , causando el calculo erroneo del tiempo.|

### DEF-02

| Campo | Detalle |
|---|---|
| Regla incumplida (RN-XX) | RN-04 |
| Función | calcularMinutosEstimados |
| Prueba que lo detecta (nombre exacto del `it`) |   calcularMinutosEstimados_conFactorEnLimiteSuperior_debeCalcular |
| Datos de entrada | Vel : 40 , dis:10 , factorTrafico:3|
| Resultado esperado (según README) | 45 |
| Resultado obtenido | 5 |
| Severidad (Alta / Media / Baja) y por qué | Alta , en el peor escenario de trafico (3.0) , calcula el tiempo muy bajo , lo cual haria desorientar al usuario y perderia credibilidad el sistema , ya que el sistema arrojaria datos falsos. |
| Falla que vería el usuario final (acudiente, conductor o coordinación) | El acudiente recibiría una alerta indicando que el bus llega en 5 minutos en medio de un trancón. Saldría a la calle a esperar el bus que demoraria 40 minutos mas. |
| Causa probable en el código (línea / condición) |Es el mismo defecto de código del DEF-01 , ya que esta dividiendo en vez de multiplicar.Al tomar el tiempo base de 15 minutos y dividirlo por 3.0, el código arroja 5, deberia multiplicarlo y daria 45 que seria el resultado correcto.

### DEF-03

| Campo | Detalle |
|---|---|
| Regla incumplida (RN-XX) | RN-05 |
| Función | calcularHoraEstimadaLlegada |
| Prueba que lo detecta (nombre exacto del `it`) | calcularHoraEstimadaLlegada_conDatosNormales_debeSumarMinutosAHoraActual |
| Datos de entrada | Vel : 40 , dis:10 , factorTrafico:1.5, horaActual: 6:30AM|
| Resultado esperado (según README) | 2026-09-22T11:53:00.000Z (06:53 AM) |
| Resultado obtenido | 2026-09-22T11:40:00.000Z (06:40 AM) |
| Severidad (Alta / Media / Baja) y por qué | Alta.La información que ven todos los usuarios del sistema sobre la hora exacta de llegada estaria totalmente errorenea. |
| Falla que vería el usuario final (acudiente, conductor o coordinación) | La pantalla principal de la app del acudiente y el panel de coordinación del colegio mostrarán que el bus llega a las 06:40 AM en lugar de las 06:53 AM ,generando reportes falsos de "retraso" cuando den las 06:41 AM y el bus aún no haya llegado.|
| Causa probable en el código (línea / condición) | Es un defecto en cascada ya que desde el DEF-01 hay error en los calculos ; El 'calcularHoraEstimadaLlegada' usa 'calcularMinutosEstimados' para saber cuánto tiempo sumar, y esa función está devolviendo 10 minutos (por el error de división) en lugar de 23, a la hora actual (06:30) se le están sumando 10 minutos en lugar de 23.|

### DEF-04

| Campo | Detalle |
|---|---|
| Regla incumplida (RN-XX) | RN-08 |
| Función | determinarNivelAlerta |
| Prueba que lo detecta (nombre exacto del `it`) | determinarNivelAlerta_conRetrasoDeQuinceMinutos_debeRetornarLeve |
| Datos de entrada | minutosRetraso: 15 |
| Resultado esperado (según README) | 'LEVE' |
| Resultado obtenido | 'GRAVE' |
| Severidad (Alta / Media / Baja) y por qué | Media. Aunque el sistema no colapsa, envía información alarmante por un límite matemático mal configurado |
| Falla que vería el usuario final (acudiente, conductor o coordinación) |Cuando el bus se retrase exactamente 15 minutos, el acudiente recibirá una notificación de alerta "GRAVE" (que sugiere un accidente o problema mayor) en lugar de una alerta "LEVE" (retraso normal de tráfico), lo que puede generar preocupación innecesaria.|
| Causa probable en el código (línea / condición) | Error en el operador relacional de la condición. En el condicional probablemente se usó >= 15 en lugar de > 15 para determinar el nivel GRAVE|

### DEF-05

| Campo | Detalle |
|---|---|
| Regla incumplida (RN-XX) | RN-11 |
| Función | notificarProximidad |
| Prueba que lo detecta (nombre exacto del `it`) | notificarProximidad_conAcudienteConNotificacionesDesactivadas_noDebeEnviarleSMS |
| Datos de entrada | Lista con 2 acudientes: uno con notificacionesActivas: false y otro con true. |
| Resultado esperado (según README) | 1 (Solo se debe ejecutar el envío 1 vez para el acudiente activo). |
| Resultado obtenido | 2 (Se ejecutaron envíos para ambos acudientes). |
| Severidad (Alta / Media / Baja) y por qué | Media. No rompe la aplicación, pero genera un gasto económico innecesario para el colegio (consumo de saldo SMS) |
| Falla que vería el usuario final (acudiente, conductor o coordinación) |Un acudiente que explícitamente desactivó las alertas (quizás porque está en una reunión diaria a esa hora o ya no recoge al estudiante) seguirá recibiendo mensajes de texto molestos todos los días|
| Causa probable en el código (línea / condición) | Ausencia de validación lógica. Dentro del ciclo que recorre la lista de acudientes|

### DEF-06

| Campo | Detalle |
|---|---|
| Regla incumplida (RN-XX) |RN-06 |
| Función | validarCoordenadas |
| Prueba que lo detecta (nombre exacto del `it`) | validarCoordenadas_conLatitudExactaEnLimiteSuperior_debeRetornarTrue |
| Datos de entrada |latitud: 90 (y -90), longitud: 0 |
| Resultado esperado (según README) | true (Los límites 90 y -90 son coordenadas geográficas válidas) |
| Resultado obtenido |false |
| Severidad (Alta / Media / Baja) y por qué | Media. Rechaza datos válidos provenientes de los GPS, impidiendo que el sistema procese ubicaciones en esas latitudes específicas.|
| Falla que vería el usuario final (acudiente, conductor o coordinación) |Si un colegio llegara a usar el sistema cerca de los polos (o si hay una calibración del GPS que envíe ese número exacto temporalmente), la app rechazaría la ubicación, el bus desaparecería del mapa y los acudientes perderían el rastro.|
| Causa probable en el código (línea / condición) |Error de operador lógico en los límites (off-by-one error). El código está usando el operador estricto < 90 en lugar del inclusivo <= 90 exigido por las reglas de negocio.|
---
