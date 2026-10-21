import { MonitorRuta } from '../../src/monitorRuta';
import { InfoRuta } from '../../src/servicios';
import { ProveedorGPSStub } from '../stubs/ProveedorGPSStub';
import { RepositorioRutasStub } from '../stubs/RepositorioRutasStub';
import { ServicioTraficoStub } from '../stubs/ServicioTraficoStub';
import { NotificadorStub } from '../stubs/NotificadorStub';
import { ACUDIENTES, BUS_CERCA, BUS_LEJOS, HORA_ACTUAL, PLACA, crearRuta } from '../datosPrueba';

describe('Top-down N1 - MonitorRuta con todos los colaboradores como stubs', () => {
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
      const { monitor, gps } = crearMonitor();

      const reporte = await monitor.monitorear('BUS-1', HORA_ACTUAL);

      expect(reporte.estado).toBe('PLACA_INVALIDA');
      expect(gps.llamadas).toHaveLength(0);
    });

    it('monitorear_conPlacaSinRutaAsignada_debeRetornarRutaNoEncontrada', async () => {
      const { monitor, gps, trafico, notificador } = crearMonitor();

      const reporte = await monitor.monitorear('ABC123', HORA_ACTUAL);

      expect(reporte.estado).toBe('RUTA_NO_ENCONTRADA');
      expect(gps.llamadas).toHaveLength(0);
      expect(trafico.llamadas).toBe(0);
      expect(notificador.llamadas).toHaveLength(0);
    });

    it('monitorear_conPlacaEnMinusculasYEspacios_debeNormalizarlaAntesDeConsultarLaRuta', async () => {
      const { monitor, gps } = crearMonitor();

      const reporte = await monitor.monitorear('  wpx482 ', HORA_ACTUAL);

      expect(reporte.placa).toBe('WPX482');
      expect(reporte.estado).not.toBe('RUTA_NO_ENCONTRADA');
      expect(gps.llamadas).toEqual(['WPX482']);
    });
  });

  describe('RN-16 lectura del GPS', () => {
    it('monitorear_conGPSSinSenal_debeRetornarSinSenalYNoNotificar', async () => {
      const gps = new ProveedorGPSStub({ ...BUS_CERCA, velocidadMs: 10 }).simularSinSenal();
      const { monitor, notificador } = crearMonitor({ gps });

      const reporte = await monitor.monitorear(PLACA, HORA_ACTUAL);

      expect(reporte.estado).toBe('SIN_SENAL');
      expect(reporte.smsEnviados).toBe(0);
      expect(notificador.llamadas).toHaveLength(0);
    });

    it('monitorear_conCoordenadasFueraDeRango_debeRetornarGpsInvalidoSinConsultarTrafico', async () => {
      const gps = new ProveedorGPSStub({ latitud: 95, longitud: -75.575, velocidadMs: 10 });
      const { monitor, trafico, notificador } = crearMonitor({ gps });

      const reporte = await monitor.monitorear(PLACA, HORA_ACTUAL);

      expect(reporte.estado).toBe('GPS_INVALIDO');
      expect(trafico.llamadas).toBe(0);
      expect(notificador.llamadas).toHaveLength(0);
    });
  });

  describe('RN-17 servicio de tráfico', () => {
    it('monitorear_conServicioDeTraficoCaido_debeUsarFactorPorDefecto15', async () => {
      const caido = crearMonitor({ trafico: new ServicioTraficoStub(1.0).simularCaida() });
      const conFactor = crearMonitor({ trafico: new ServicioTraficoStub(1.5) });

      const reporteCaido = await caido.monitor.monitorear(PLACA, HORA_ACTUAL);
      const reporteConFactor = await conFactor.monitor.monitorear(PLACA, HORA_ACTUAL);

      expect(reporteCaido.estado).toBe('EN_RUTA');
      expect(caido.trafico.llamadas).toBe(1);
      expect(reporteCaido.minutosEstimados).toBe(reporteConFactor.minutosEstimados);
    });
  });

  describe('RN-18 conversión de unidades y ETA', () => {
    it('monitorear_conVelocidadEnMetrosPorSegundo_debeConvertirlaAKmhAntesDeCalcularETA', async () => {
      const { monitor } = crearMonitor();

      const reporte = await monitor.monitorear(PLACA, HORA_ACTUAL);

      expect(reporte.estado).toBe('EN_RUTA');
      expect(reporte.minutosEstimados).toBe(3);
    });
  });

  describe('RN-19 bus detenido', () => {
    it('monitorear_conVelocidadCero_debeRetornarDetenidoSinNotificar', async () => {
      const gps = new ProveedorGPSStub({ ...BUS_CERCA, velocidadMs: 0 });
      const { monitor, notificador } = crearMonitor({ gps });

      const reporte = await monitor.monitorear(PLACA, HORA_ACTUAL);

      expect(reporte.estado).toBe('DETENIDO');
      expect(reporte.distanciaKm).toBeCloseTo(1.322, 3);
      expect(reporte.porcentajeOcupacion).toBe(75);
      expect(reporte.minutosEstimados).toBeNull();
      expect(reporte.horaEstimadaLlegada).toBeNull();
      expect(reporte.minutosRetraso).toBeNull();
      expect(reporte.nivelAlerta).toBeNull();
      expect(notificador.llamadas).toHaveLength(0);
    });
  });

  describe('RN-20 retraso y alerta', () => {
    it('monitorear_conBusQueLlegaAntesDeLaHoraProgramada_debeReportarRetrasoCeroYAlertaNinguna', async () => {
      const ruta = crearRuta({ horaProgramadaLlegada: new Date('2026-10-13T06:45:00-05:00') });
      const { monitor } = crearMonitor({ ruta });

      const reporte = await monitor.monitorear(PLACA, HORA_ACTUAL);

      expect(reporte.estado).toBe('EN_RUTA');
      expect(reporte.minutosRetraso).toBe(0);
      expect(reporte.nivelAlerta).toBe('NINGUNA');
    });

    it('monitorear_conBusMuyRetrasado_debeReportarAlertaGrave', async () => {
      const gps = new ProveedorGPSStub({ ...BUS_LEJOS, velocidadMs: 5 });
      const trafico = new ServicioTraficoStub(3.0);
      const ruta = crearRuta({ horaProgramadaLlegada: new Date('2026-10-13T06:40:00-05:00') });
      const { monitor } = crearMonitor({ gps, trafico, ruta });

      const reporte = await monitor.monitorear(PLACA, HORA_ACTUAL);

      expect(reporte.minutosRetraso).toBe(24);
      expect(reporte.nivelAlerta).toBe('GRAVE');
    });
  });

  describe('RN-21 llamada al notificador', () => {
    it('monitorear_debeEntregarAlNotificadorLaPlacaLosMinutosYLosAcudientesDeLaRuta', async () => {
      const { monitor, notificador } = crearMonitor();

      const reporte = await monitor.monitorear(PLACA, HORA_ACTUAL);

      expect(notificador.llamadas).toEqual([
        { placa: PLACA, minutosEstimados: reporte.minutosEstimados, acudientes: ACUDIENTES },
      ]);
    });
  });
});