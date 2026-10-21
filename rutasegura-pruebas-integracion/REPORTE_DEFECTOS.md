# Reporte de defectos de integración — RutaSegura v1.1

**Integrantes:**

- Juan Jose Pulido
- Brayan Rivera

> Aquí se reporta cada prueba que falla porque el código no cumple la especificación (un bloque por defecto).

## Resumen

| ID | Regla | Interfaz que falla | Severidad |
|---|---|---|---|
| DEF-INT-01 | RN-18 | `MonitorRuta` ↔ `ProveedorGPS` / `eta` | Alta |
| DEF-INT-02 | RN-20 | `MonitorRuta` ↔ `alertas` | Alta |

---

## DEF-INT-01

**Regla incumplida:** RN-18

**Severidad:** Alta

### Módulos involucrados (¿qué interfaz falla?)

`MonitorRuta` ↔ `ProveedorGPS` (`servicios.ts`) y `eta` (`calcularMinutosEstimados` / `calcularHoraEstimadaLlegada`).

Hay una incompatibilidad de unidades en la interfaz: `ProveedorGPS` entrega velocidad en `m/s` (`velocidadMs`) y `eta` exige velocidad en `km/h` (`velocidadKmh`).

### Estrategia y nivel que lo detectó

Top-down Nivel 1 y Top-down Nivel 2.

### Prueba que lo detecta (nombre exacto del `it`)

1. `monitorear_conVelocidadEnMetrosPorSegundo_debeConvertirlaAKmhAntesDeCalcularETA` (N1)
2. `monitorear_conBusMuyRetrasado_debeReportarAlertaGrave` (N1)
3. `monitorear_debeEnviarSMSConLosMinutosCalculadosPorEtaYNoOtros` (N2)

### Stubs / drivers usados y cómo se configuraron

- **N1 (prueba 1) y N2 (prueba 3):**
  - `ProveedorGPSStub` configurado con `BUS_CERCA` (1.322 km) y `velocidadMs: 10`
  - `ServicioTraficoStub(1.0)`
  - `RepositorioRutasStub` con ruta `WPX482`
  - `NotificadorStub` (en N1) / `NotificadorAcudientes` real + `MensajeriaStub` (en N2)
- **N1 (prueba 2):**
  - `ProveedorGPSStub` con `BUS_LEJOS` (3.314 km) y `velocidadMs: 5`
  - `ServicioTraficoStub(3.0)`
  - Hora programada `06:40`

### Resultado esperado (según README)

- Con 10 m/s (36 km/h) y 1.322 km:
  - `minutosEstimados = 3`
  - SMS: `"RutaSegura: el bus WPX482 llegará en aproximadamente 3 minutos."`
- Con 5 m/s (18 km/h), 3.314 km y factor 3.0:
  - `minutosEstimados = 34`
  - `minutosRetraso = 24`

### Resultado obtenido

- Con 10 m/s:
  - `minutosEstimados = 8`
  - SMS: `"RutaSegura: el bus WPX482 llegará en aproximadamente 8 minutos."`
- Con 5 m/s:
  - `minutosEstimados = 120`
  - `minutosRetraso = 110`

### ¿Lo habrían detectado las pruebas unitarias? ¿Por qué?

No. En las pruebas unitarias probamos `eta.ts` pasándole directamente valores en `km/h` porque eso pedía su firma. El módulo `eta` funciona bien aisladamente, pero el defecto ocurre en el acoplamiento cuando `MonitorRuta` toma el dato crudo del GPS (`m/s`) y se lo entrega a `eta` sin convertirlo.

### Severidad: Alta, y por qué

Corrompe todos los tiempos estimados de llegada (los infla 3.6 veces), distorsiona el cálculo de retrasos/alertas y envía mensajes de texto con tiempos falsos a los acudientes.

### Falla que vería el usuario final (acudiente, conductor o coordinación)

El acudiente recibe un SMS diciendo que el bus llegará en 8 minutos cuando en realidad está a 3 minutos; cuando salga al paradero, el bus ya se habrá ido. Además, coordinación verá retrasos falsos de casi 2 horas (110 min) cuando el retraso real es de 24 minutos.

### Causa probable en el código (línea / condición)

En `src/monitorRuta.ts`, línea 72:

```ts
const velocidadKmh = posicion.velocidadMs;
```

Falta multiplicar por `3.6`:

```ts
const velocidadKmh = posicion.velocidadMs * 3.6;
```

---

## DEF-INT-02

**Regla incumplida:** RN-20

**Severidad:** Alta

### Módulos involucrados (¿qué interfaz falla?)

`MonitorRuta` ↔ `alertas` (`determinarNivelAlerta`).

`MonitorRuta` viola la precondición del contrato de `determinarNivelAlerta`, la cual exige que `minutosRetraso >= 0`.

### Estrategia y nivel que lo detectó

Top-down Nivel 1.

### Prueba que lo detecta (nombre exacto del `it`)

`monitorear_conBusQueLlegaAntesDeLaHoraProgramada_debeReportarRetrasoCeroYAlertaNinguna`

### Stubs / drivers usados y cómo se configuraron

- `ProveedorGPSStub` con `BUS_CERCA` y `velocidadMs: 10`
- `ServicioTraficoStub(1.0)`
- `NotificadorStub`
- `RepositorioRutasStub` con `horaProgramadaLlegada: 2026-10-13T06:45:00-05:00` (y `HORA_ACTUAL` a las `06:30`)

### Resultado esperado (según README)

- `estado: 'EN_RUTA'`
- `minutosRetraso: 0`
- `nivelAlerta: 'NINGUNA'`

### Resultado obtenido

La promesa es rechazada lanzando una excepción no controlada:

```
RangeError: El retraso no puede ser negativo
```

### ¿Lo habrían detectado las pruebas unitarias? ¿Por qué?

No. En las pruebas unitarias verificamos que `determinarNivelAlerta` lanzara `RangeError` ante números negativos (cumpliendo RN-08). El defecto nace al integrar `MonitorRuta` con `alertas`, porque `MonitorRuta` no trunca los valores negativos a `0` cuando el bus va adelantado antes de invocar a `determinarNivelAlerta`.

### Severidad: Alta, y por qué

Provoca una caída total (excepción no capturada) del flujo de monitoreo cada vez que un bus escolar va adelantado respecto a su hora programada, impidiendo además que se envíen los SMS a los acudientes.

### Falla que vería el usuario final (acudiente, conductor o coordinación)

Si el bus tiene vía libre y va a llegar antes de la hora programada, el sistema de monitoreo se cae con un error 500, la pantalla de seguimiento deja de actualizarse y ningún acudiente recibe el SMS de proximidad.

### Causa probable en el código (línea / condición)

En `src/monitorRuta.ts`, líneas 91-93:

```ts
const minutosRetraso = Math.ceil(
  (horaEstimadaLlegada.getTime() - ruta.horaProgramadaLlegada.getTime()) / 60_000
);
```

Falta envolver el cálculo en `Math.max(0, ...)`, tal como sí lo hacía el `driverCalculoLlegada`:

```ts
const minutosRetraso = Math.max(
  0,
  Math.ceil(
    (horaEstimadaLlegada.getTime() - ruta.horaProgramadaLlegada.getTime()) / 60_000
  )
);
```

---