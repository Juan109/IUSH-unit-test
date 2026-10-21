# Respuestas del taller — RutaSegura (Integración)

Integrantes:
- Juan Jose Pulido
- Brayan Rivera

## Ejercicio 1 — Orden de integración

1. **¿Quién llama al `ProveedorGPSStub`? ¿Y a quién llama el `driverCalculoLlegada`?**
   - A `ProveedorGPSStub` lo llama el módulo `MonitorRuta` (en las pruebas top-down).
   - `driverCalculoLlegada` llama a los módulos de bajo nivel: `geo` (`calcularDistanciaKm`), `eta` (`calcularMinutosEstimados`, `calcularHoraEstimadaLlegada`) y `alertas` (`determinarNivelAlerta`).

2. **¿Qué componente real reemplaza cada uno?**
   - `ProveedorGPSStub` reemplaza al hardware/servicio externo real del GPS del bus.
   - `driverCalculoLlegada` reemplaza temporalmente al módulo orquestador `MonitorRuta` cuando aún no ha sido construido o cuando queremos probar los módulos inferiores por separado.

3. **¿Para qué sirve el arreglo `llamadas` del stub?**
   - Sirve para espiar y verificar las interacciones entre módulos. Permite comprobar mediante aserciones (`expect`) si `MonitorRuta` consultó o no al GPS (por ejemplo, que no lo llame si la placa es inválida) y que le haya pasado la placa ya normalizada en mayúsculas y sin espacios.

> *"El stub está **debajo** del módulo bajo prueba (es llamado por él) y el driver está **encima** del módulo bajo prueba (es quien lo llama)."*

| Paso | Top-down: módulos reales | Stubs necesarios | Bottom-up: módulos reales | Drivers necesarios |
|---|---|---|---|---|
| 1 | `MonitorRuta`, `validaciones`, `geo`, `eta`, `alertas` | `ProveedorGPSStub`, `RepositorioRutasStub`, `ServicioTraficoStub`, `NotificadorStub` | Cluster 1: `geo`, `eta`, `alertas`<br>Cluster 2: `eta`, `NotificadorAcudientes` (con `MensajeriaStub`) | `driverCalculoLlegada` y `driverNotificacion` |
| 2 | `MonitorRuta`, `validaciones`, `geo`, `eta`, `alertas`, `NotificadorAcudientes` | `ProveedorGPSStub`, `RepositorioRutasStub`, `ServicioTraficoStub`, `MensajeriaStub` | `MonitorRuta` integrando todos los módulos de lógica de negocio (con stubs de infraestructura externa) | Ninguno (las pruebas invocan directamente a `MonitorRuta.monitorear`) |
| 3 | Sistema completo con servicios externos reales | Ninguno | Sistema completo con servicios externos reales | Ninguno |

### 2.1 Calcular a mano antes de programar

| Escenario | Distancia | Velocidad | Factor | Minutos ETA | Hora llegada | Programada | Retraso | Alerta |
|---|---|---|---|---|---|---|---|---|
| Ejemplo (ya hecho) | 1.322 km | 30 km/h | 1.0 | 3 | 06:33 | 06:40 | 0 | NINGUNA |
| Lejos y trancón | 3.314 km | 15 km/h | 3.0 | 40 | 07:10 | 06:40 | 30 | GRAVE |
| Retraso de exactamente 15 | 1.322 km | 30 km/h | 1.0 | 3 | 06:33 | 06:18 | 15 | LEVE |
| Bus en el paradero | 0 km | 30 km/h | 1.0 | 0 | 06:30 | 06:40 | 0 | NINGUNA |
| Bus detenido | 1.322 km | 0 km/h | 1.0 | null | null | 06:40 | null | null |

---

## Preguntas

**1. Con sus palabras y usando un archivo de este repositorio como ejemplo: ¿cuál es la diferencia entre un stub y un driver? ¿En qué dirección de la llamada está cada uno?**
R/ Un **Driver** se ubica **arriba** del módulo bajo prueba e inicia la llamada: por ejemplo, `driverCalculoLlegada.ts` invoca a `geo`, `eta` y `alertas` haciendo el papel de `MonitorRuta`. En cambio, un **Stub** se ubica **abajo** del módulo bajo prueba y recibe la llamada: por ejemplo, `ProveedorGPSStub.ts` es invocado por `MonitorRuta` y le devuelve coordenadas preconfiguradas sin conectarse a un satélite real.

**2. Todos los módulos de `src/` pasaron sus pruebas unitarias en el taller anterior. ¿Por qué aun así pueden aparecer defectos al integrarlos? Den un ejemplo que hayan encontrado.**
R/ Porque las pruebas unitarias evalúan cada función de forma aislada asumiendo que recibe los datos en el formato y rango correctos, pero no evalúan el **contrato de interfaz** entre dos módulos. Un ejemplo claro es el **DEF-INT-01**: `eta.ts` pasó todas sus pruebas unitarias porque espera `velocidadKmh`, pero al integrarlo con `MonitorRuta` y `ProveedorGPS`, el GPS entrega `velocidadMs` (metros por segundo) y `MonitorRuta` se lo pasa directo a `eta` sin multiplicar por `3.6`. Otro ejemplo es el **DEF-INT-02**: `MonitorRuta` le pasa un retraso negativo (`-7`) a `determinarNivelAlerta` cuando el bus va adelantado, disparando un `RangeError`.

**3. En `monitorRuta.nivel1.test.ts` el notificador es un stub y en `monitorRuta.nivel2.test.ts` es el real. ¿Qué defecto podría pasar desapercibido en el nivel 1 pero detectarse en el nivel 2?**
R/ En el Nivel 1, la prueba `monitorear_debeEntregarAlNotificadorLaPlacaLosMinutosYLosAcudientesDeLaRuta` pasa en verde porque compara `minutosEstimados: reporte.minutosEstimados` contra lo recibido por `NotificadorStub`, sin validar cómo reacciona el notificador real con ese número ni el texto final del SMS. En el Nivel 2, al integrar `NotificadorAcudientes` real en `monitorear_debeEnviarSMSConLosMinutosCalculadosPorEtaYNoOtros`, se detecta cómo el error de unidades de `MonitorRuta` contamina el mensaje de texto final que llega al celular del acudiente (`"llegará en aproximadamente 8 minutos."` en lugar de `3 minutos`), o si un ETA inflado supera el umbral de 10 minutos (RN-10) e impide por completo que se envíe la notificación.

**4. Un stub siempre responde lo que ustedes le configuran. ¿Qué riesgo hay si el stub no se comporta como el componente real (por ejemplo, si `ProveedorGPSStub` devolviera km/h en lugar de m/s)? ¿Cómo lo mitigarían?**
R/ El riesgo es obtener **falsos positivos**: nuestras pruebas de integración pasarían en verde, pero el sistema fallaría en producción cuando se conecte al GPS real. Si `ProveedorGPSStub` devolviera `36` (en km/h) en vez de `10` (en m/s), jamás habríamos descubierto el **DEF-INT-01** (que `MonitorRuta` olvidó multiplicar por `3.6`). Se mitiga definiendo contratos tipados estrictos en TypeScript (`interface PosicionGPS { velocidadMs: number }` en `servicios.ts`), documentando explícitamente las unidades en la especificación y aplicando pruebas de contrato (*Contract Testing*) contra el servicio real.

**5. Comparen `npm run driver` (driver de consola) con `tests/bottom-up/calculoLlegada.test.ts`. ¿Qué ventajas tiene el segundo? ¿Hay algún caso en que el driver de consola sea útil?**
R/ La ventaja de `calculoLlegada.test.ts` es que es **autovalidable (Self-Validating del principio FIRST)** y automatizable: Jest verifica con `expect` cada salida y falla inmediatamente en un pipeline de CI/CD si algo cambia, mientras que `driverConsola.ts` exige que un humano lea la tabla en pantalla y calcule mentalmente si los números están bien (lo cual es propenso a errores y lento). El driver de consola solo es útil para demostraciones rápidas en vivo, exploración visual inicial o depuración rápida durante el desarrollo.

**6. ¿Qué estrategia (top-down o bottom-up) les permitió encontrar primero cada defecto? ¿Por qué?**
R/ La estrategia **Top-Down (Nivel 1)** nos permitió encontrar ambos defectos (**DEF-INT-01** y **DEF-INT-02**), mientras que en **Bottom-Up** las 9 pruebas pasaron en verde sin detectar defectos. Esto ocurrió porque los módulos de bajo nivel (`geo`, `eta`, `alertas`, `notificador`) ya habían sido corregidos en la versión 1.1 y los drivers (`driverCalculoLlegada` y `driverNotificacion`) estaban bien programados (incluyendo el `Math.max(0, ...)`). Los defectos estaban dentro del módulo orquestador superior (`MonitorRuta`), el cual solo se ejercita cuando probamos desde arriba en Top-Down.

**7. El servicio de tráfico "lo está construyendo otro equipo". ¿Cómo les permitió el stub avanzar sin esperarlo? ¿Qué pruebas tendrán que repetir cuando el servicio real esté listo?**
R/ `ServicioTraficoStub` nos permitió simular tanto respuestas normales (factores `1.0`, `1.5`, `3.0`) como caídas del servicio (`simularCaida()`) implementando la interfaz `ServicioTrafico`, desbloqueando las pruebas de `MonitorRuta` (RN-17) sin depender del otro equipo. Cuando el servicio real esté listo, tendremos que ejecutar pruebas de integración con el componente real verificando que respete el contrato (que retorne números entre `1.0` y `3.0` para coordenadas de Medellín y maneje timeouts/errores de red correctamente).

**8. ¿Por qué todas las pruebas usan `HORA_ACTUAL` fija en vez de `new Date()`? ¿Qué pasaría con la prueba de retraso a las 6:30 a. m. y a las 2:00 p. m.?**
R/ Para cumplir la propiedad **Repeatable (Repetible)** del principio **FIRST**. Como `horaProgramadaLlegada` es fija (`06:40 a. m.`), el cálculo de `minutosRetraso` depende directamente de `horaActual`. Si usáramos `new Date()`, al correr la prueba a las 6:30 a. m. el bus llegaría a las 6:33 a. m. (0 minutos de retraso, alerta `NINGUNA`), pero al correr la misma prueba a las 2:00 p. m. el bus tendría más de 7 horas de retraso (alerta `GRAVE`), haciendo que la prueba pase o falle según la hora del día.

**9. Si el proyecto hubiera usado integración big bang, ¿cómo habría sido el diagnóstico de los defectos que encontraron?**
R/ Habría sido mucho más lento y confuso porque ambos defectos se habrían mezclado en una sola falla general. Por ejemplo, al probar el flujo completo con un bus adelantado (`monitorear_conBusQueLlegaAntesDeLaHoraProgramada`), debido al **DEF-INT-01** el tiempo estimado sube de 3 a 8 minutos (llega 06:38 en vez de 06:33), y luego debido al **DEF-INT-02** el cálculo de retraso da `-7` y explota en `alertas.ts` con un `RangeError`. En Big Bang veríamos una caída en el módulo de alertas y no sabríamos a simple vista si la culpa es de `geo`, `eta`, `alertas`, el GPS o `MonitorRuta`.

**10. Para cada defecto encontrado, describan la cadena error → defecto → falla. ¿Es un defecto de una unidad o de la interfaz entre unidades? Justifiquen.**
R/
- **DEF-INT-01 (RN-18):**
  - **Error (humano):** El desarrollador de `MonitorRuta` asumió que `posicion.velocidadMs` ya venía en km/h o pasó por alto la conversión de unidades (`× 3.6`).
  - **Defecto (en código):** En `src/monitorRuta.ts` (línea 72) se asigna `const velocidadKmh = posicion.velocidadMs;` sin multiplicar por `3.6`.
  - **Falla (en ejecución):** El sistema calcula un ETA de 8 minutos en vez de 3 (o 120 en vez de 34) y envía SMS con tiempos erróneos a los acudientes.
  - **Clasificación:** Es un **defecto de interfaz entre unidades** (`MonitorRuta` ↔ `ProveedorGPS` / `eta`), ya que cada unidad por separado funciona bien, pero hay un desajuste semántico de unidades de medida (`m/s` vs `km/h`) al comunicar los datos.
- **DEF-INT-02 (RN-20):**
  - **Error (humano):** El desarrollador de `MonitorRuta` restó las fechas para hallar el retraso pero olvidó la regla RN-20 que indica que si el bus va adelantado el retraso debe ser `0`.
  - **Defecto (en código):** En `src/monitorRuta.ts` (líneas 91-93) falta aplicar `Math.max(0, ...)` antes de llamar a `determinarNivelAlerta(minutosRetraso)`.
  - **Falla (en ejecución):** Cuando un bus va adelantado, el método `monitorear` lanza una excepción `RangeError` no controlada y detiene el monitoreo.
  - **Clasificación:** Es un **defecto de interfaz entre unidades** (`MonitorRuta` ↔ `alertas`), porque `MonitorRuta` incumple la precondición del contrato de `determinarNivelAlerta` (no enviar valores negativos).