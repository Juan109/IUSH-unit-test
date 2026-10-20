import { driverCalculoLlegada } from '../drivers/driverCalculoLlegada';
import { BUS_CERCA, BUS_LEJOS,HORA_ACTUAL, PARADERO_COLEGIO } from '../datosPrueba';

/**
 * INTEGRACIÓN ASCENDENTE (bottom-up) — geo + eta + alertas
 *
 * Aquí MonitorRuta "no existe": el DRIVER (tests/drivers/driverCalculoLlegada.ts) hace su papel
 * llamando a los módulos de bajo nivel en el orden correcto.
 *
 *   driverCalculoLlegada  (driver, reemplaza a MonitorRuta)
 *        ├──> geo       (real)
 *        ├──> eta       (real)
 *        └──> alertas   (real)
 */
describe('Bottom-up - geo + eta + alertas mediante driver', () => {
  it('driverCalculoLlegada_conBusCercaAViaLibre_debeEncadenarDistanciaETAyAlerta', () => {
    // Arrange
    const escenario = {
      bus: BUS_CERCA,
      paradero: PARADERO_COLEGIO,
      velocidadKmh: 30,
      factorTrafico: 1.0,
      horaActual: HORA_ACTUAL,
      horaProgramadaLlegada: new Date('2026-10-13T06:40:00-05:00'),
    };

    // Act
    const r = driverCalculoLlegada(escenario);

    // Assert: 1.322 km a 30 km/h = 2.64 min -> 3 min -> llega 06:33, antes de las 06:40
    expect(r.distanciaKm).toBeCloseTo(1.322, 3);
    expect(r.minutosEstimados).toBe(3);
    expect(r.horaEstimadaLlegada).toEqual(new Date('2026-10-13T06:33:00-05:00'));
    expect(r.minutosRetraso).toBe(0);
    expect(r.nivelAlerta).toBe('NINGUNA');
  });

  const base = {
  bus: BUS_CERCA,
  paradero: PARADERO_COLEGIO,
  velocidadKmh: 30,
  factorTrafico: 1.0,
  horaActual: HORA_ACTUAL,
  horaProgramadaLlegada: new Date('2026-10-13T06:40:00-05:00'),
};

it('driverCalculoLlegada_conBusLejosYTrancon_debeReportarAlertaGrave', () => {
  // Act
  const r = driverCalculoLlegada({ ...base, bus: BUS_LEJOS, velocidadKmh: 15, factorTrafico: 3.0 });

  // Assert: 3.314 km a 15 km/h con factor 3 = 39.77 min -> 40 min -> llega 07:10, 30 min tarde
  expect(r.minutosEstimados).toBe(40);
  expect(r.horaEstimadaLlegada).toEqual(new Date('2026-10-13T07:10:00-05:00'));
  expect(r.minutosRetraso).toBe(30);
  expect(r.nivelAlerta).toBe('GRAVE');
});

it('driverCalculoLlegada_conRetrasoDeExactamente15Minutos_debeReportarAlertaLeve', () => {
  // Act: llega 06:33, programada 06:18
  const r = driverCalculoLlegada({
    ...base,
    horaProgramadaLlegada: new Date('2026-10-13T06:18:00-05:00'),
  });

  // Assert
  expect(r.minutosEstimados).toBe(3);
  expect(r.minutosRetraso).toBe(15);
  expect(r.nivelAlerta).toBe('LEVE');
});

it('driverCalculoLlegada_conBusEnElParadero_debeRetornarCeroMinutos', () => {
  // Arrange: el bus tiene exactamente las coordenadas del paradero
  const busEnParadero = {
    ...BUS_CERCA,
    latitud: PARADERO_COLEGIO.latitud,
    longitud: PARADERO_COLEGIO.longitud,
  };

  // Act
  const r = driverCalculoLlegada({ ...base, bus: busEnParadero });

  // Assert
  expect(r.distanciaKm).toBe(0);
  expect(r.minutosEstimados).toBe(0);
  expect(r.horaEstimadaLlegada).toEqual(HORA_ACTUAL);
  expect(r.minutosRetraso).toBe(0);
  expect(r.nivelAlerta).toBe('NINGUNA');
});

it('driverCalculoLlegada_conBusDetenido_debeRetornarETAyAlertaNull', () => {
  // Act
  const r = driverCalculoLlegada({ ...base, velocidadKmh: 0 });

  // Assert: sin velocidad no hay ETA, y sin ETA no hay alerta
  expect(r.minutosEstimados).toBeNull();
  expect(r.nivelAlerta).toBeNull();
});

});
