import { MonitorRuta } from '../../src/monitorRuta';
import { InfoRuta } from '../../src/servicios';
import { ProveedorGPSStub } from '../stubs/ProveedorGPSStub';
import { RepositorioRutasStub } from '../stubs/RepositorioRutasStub';
import { ServicioTraficoStub } from '../stubs/ServicioTraficoStub';
import { NotificadorStub } from '../stubs/NotificadorStub';
import { ACUDIENTES, BUS_CERCA, BUS_LEJOS, HORA_ACTUAL, PLACA, crearRuta } from '../datosPrueba';

/**
 * INTEGRACIÓN DESCENDENTE (top-down) — NIVEL 1
 *
 * Se prueba el módulo de más arriba (MonitorRuta) integrado con los módulos internos reales
 * (validaciones, geo, eta, alertas), pero con TODOS sus colaboradores externos reemplazados
 * por STUBS, incluido el notificador.
 *
 *   [MonitorRuta] ──> validaciones, geo, eta, alertas (reales)
 *        │
 *        ├──> ProveedorGPSStub
 *        ├──> RepositorioRutasStub
 *        ├──> ServicioTraficoStub
 *        └──> NotificadorStub          <- en el nivel 2 se reemplaza por el real
 */
describe('Top-down N1 - MonitorRuta con todos los colaboradores como stubs', () => {
  // Patrón: cada prueba arma su propio "mundo" para no depender de otras (FIRST: Independent).
  // Por defecto: bus cerca a 10 m/s, tráfico 1.0 y la ruta de datosPrueba. Cambien solo lo que necesiten.
  function crearMonitor(
    opciones: {
      gps?: ProveedorGPSStub;
      trafico?: ServicioTraficoStub;
      ruta?: InfoRuta;
      notificador?: NotificadorStub;
    } = {}
  ) {
    const gps = opciones.gps ?? new ProveedorGPSStub({ ...BUS_CERCA, velocidadMs: 10 });
    const trafico = opciones.trafico ?? new ServicioTraficoStub(1.0);
    const rutas = new RepositorioRutasStub().conRuta(PLACA, opciones.ruta ?? crearRuta());
    const notificador = opciones.notificador ?? new NotificadorStub();
    return { monitor: new MonitorRuta(gps, rutas, trafico, notificador), gps, trafico, notificador };
  }

  describe('RN-15 placa y ruta', () => {
    it('monitorear_conPlacaInvalida_debeRetornarPlacaInvalidaSinConsultarGPS', async () => {
      // Arrange
      const { monitor, gps } = crearMonitor();

      // Act
      const reporte = await monitor.monitorear('BUS-1', HORA_ACTUAL);

      // Assert: el resultado Y la interacción con el componente de abajo
      expect(reporte.estado).toBe('PLACA_INVALIDA');
      expect(gps.llamadas).toHaveLength(0);
    });

    it('monitorear_conPlacaSinRutaAsignada_debeRetornarRutaNoEncontrada', async () => {
      // Arrange: placa válida que el repositorio no conoce
      const { monitor, gps, trafico, notificador } = crearMonitor();

      // Act
      const reporte = await monitor.monitorear('ABC123', HORA_ACTUAL);

      // Assert: sin ruta no hay paradero, ni acudientes, ni nada que consultar o notificar
      expect(reporte.estado).toBe('RUTA_NO_ENCONTRADA');
      expect(gps.llamadas).toHaveLength(0);
      expect(trafico.llamadas).toHaveLength(0);
      expect(notificador.llamadas).toHaveLength(0);
    });

    it('monitorear_conPlacaEnMinusculasYEspacios_debeNormalizarlaAntesDeConsultarLaRuta', async () => {
      // Arrange
      const { monitor, gps } = crearMonitor();

      // Act
      const reporte = await monitor.monitorear('  wpx482 ', HORA_ACTUAL);

      // Assert: se normaliza, se encuentra la ruta y el GPS recibe la placa normalizada
      expect(reporte.placa).toBe('WPX482');
      expect(reporte.estado).not.toBe('RUTA_NO_ENCONTRADA');
      expect(gps.llamadas).toEqual(['WPX482']);
    });
  });

  describe('RN-16 lectura del GPS', () => {
    it('monitorear_conGPSSinSenal_debeRetornarSinSenalYNoNotificar', async () => {
      // Arrange
      const gps = new ProveedorGPSStub({ ...BUS_CERCA, velocidadMs: 10 }).simularSinSenal();
      const { monitor, notificador } = crearMonitor({ gps });

      // Act
      const reporte = await monitor.monitorear(PLACA, HORA_ACTUAL);

      // Assert
      expect(reporte.estado).toBe('SIN_SENAL');
      expect(reporte.smsEnviados).toBe(0);
      expect(notificador.llamadas).toHaveLength(0);
    });

    it('monitorear_conCoordenadasFueraDeRango_debeRetornarGpsInvalidoSinConsultarTrafico', async () => {
      // Arrange: latitud 95 no existe (rango válido: -90 a 90)
      const gps = new ProveedorGPSStub({ latitud: 95, longitud: -75.575, velocidadMs: 10 });
      const { monitor, trafico, notificador } = crearMonitor({ gps });

      // Act
      const reporte = await monitor.monitorear(PLACA, HORA_ACTUAL);

      // Assert
      expect(reporte.estado).toBe('GPS_INVALIDO');
      expect(trafico.llamadas).toHaveLength(0);
      expect(notificador.llamadas).toHaveLength(0);
    });
  });

  describe('RN-17 servicio de tráfico', () => {
    it('monitorear_conServicioDeTraficoCaido_debeUsarFactorPorDefecto15', async () => {
      // Arrange: oráculo relativo. Un monitor con el tráfico caído y otro con factor 1.5 explícito.
      // Si hay otro defecto en el ETA, afecta a ambos por igual y se cancela en la comparación.
      const caido = crearMonitor({ trafico: new ServicioTraficoStub(1.0).simularCaida() });
      const conFactor = crearMonitor({ trafico: new ServicioTraficoStub(1.5) });

      // Act
      const reporteCaido = await caido.monitor.monitorear(PLACA, HORA_ACTUAL);
      const reporteConFactor = await conFactor.monitor.monitorear(PLACA, HORA_ACTUAL);

      // Assert
      expect(reporteCaido.estado).toBe('EN_RUTA');
      expect(caido.trafico.llamadas).toHaveLength(1);
      expect(reporteCaido.minutosEstimados).toBe(reporteConFactor.minutosEstimados);
    });
  });

  describe('RN-18 conversión de unidades y ETA', () => {
    // 10 m/s x 3.6 = 36 km/h; 1.322 km / 36 km/h x 60 = 2.20 min -> 3 min (RN-01)
    it('monitorear_conVelocidadEnMetrosPorSegundo_debeConvertirlaAKmhAntesDeCalcularETA', async () => {
      // Arrange: valores por defecto (BUS_CERCA, 10 m/s, factor 1.0)
      const { monitor } = crearMonitor();

      // Act
      const reporte = await monitor.monitorear(PLACA, HORA_ACTUAL);

      // Assert
      expect(reporte.estado).toBe('EN_RUTA');
      expect(reporte.minutosEstimados).toBe(3);
    });
  });

  describe('RN-19 bus detenido', () => {
    it('monitorear_conVelocidadCero_debeRetornarDetenidoSinNotificar', async () => {
      // Arrange
      const gps = new ProveedorGPSStub({ ...BUS_CERCA, velocidadMs: 0 });
      const { monitor, notificador } = crearMonitor({ gps });

      // Act
      const reporte = await monitor.monitorear(PLACA, HORA_ACTUAL);

      // Assert: trae distancia y ocupación, no calcula alerta y no notifica
      expect(reporte.estado).toBe('DETENIDO');
      expect(reporte.distanciaKm).toBeCloseTo(1.322, 3);
      expect(reporte.porcentajeOcupacion).toBe(75); // 30 de 40 estudiantes a bordo
      expect(reporte.nivelAlerta).toBeFalsy();
      expect(notificador.llamadas).toHaveLength(0);
    });
  });

  describe('RN-20 retraso y alerta', () => {
    it('monitorear_conBusQueLlegaAntesDeLaHoraProgramada_debeReportarRetrasoCeroYAlertaNinguna', async () => {
      // Arrange: llega 06:33 (3 min), programada 06:45 -> va 12 min adelantado
      const ruta = crearRuta({ horaProgramadaLlegada: new Date('2026-10-13T06:45:00-05:00') });
      const { monitor } = crearMonitor({ ruta });

      // Act
      const reporte = await monitor.monitorear(PLACA, HORA_ACTUAL);

      // Assert: el retraso nunca es negativo
      expect(reporte.estado).toBe('EN_RUTA');
      expect(reporte.minutosRetraso).toBe(0);
      expect(reporte.nivelAlerta).toBe('NINGUNA');
    });

    it('monitorear_conBusMuyRetrasado_debeReportarAlertaGrave', async () => {
      // Arrange: 5 m/s = 18 km/h; 3.314 km / 18 x 60 x 3.0 = 33.14 -> 34 min -> llega 07:04
      const gps = new ProveedorGPSStub({ ...BUS_LEJOS, velocidadMs: 5 });
      const trafico = new ServicioTraficoStub(3.0);
      const ruta = crearRuta({ horaProgramadaLlegada: new Date('2026-10-13T06:40:00-05:00') });
      const { monitor } = crearMonitor({ gps, trafico, ruta });

      // Act
      const reporte = await monitor.monitorear(PLACA, HORA_ACTUAL);

      // Assert: 07:04 - 06:40 = 24 min de retraso (> 15)
      expect(reporte.minutosRetraso).toBe(24);
      expect(reporte.nivelAlerta).toBe('GRAVE');
    });
  });

  describe('RN-21 llamada al notificador', () => {
    it('monitorear_debeEntregarAlNotificadorLaPlacaLosMinutosYLosAcudientesDeLaRuta', async () => {
      // Arrange
      const { monitor, notificador } = crearMonitor();

      // Act
      const reporte = await monitor.monitorear(PLACA, HORA_ACTUAL);

      // Assert: los minutos se toman del reporte para probar solo la entrega (el valor lo cubre RN-18)
      expect(notificador.llamadas).toEqual([
        { placa: PLACA, minutosEstimados: reporte.minutosEstimados, acudientes: ACUDIENTES },
      ]);
    });
  });
});