import { MonitorRuta } from '../../src/monitorRuta';
import { NotificadorAcudientes } from '../../src/notificador';
import { InfoRuta } from '../../src/servicios';
import { ProveedorGPSStub } from '../stubs/ProveedorGPSStub';
import { RepositorioRutasStub } from '../stubs/RepositorioRutasStub';
import { ServicioTraficoStub } from '../stubs/ServicioTraficoStub';
import { MensajeriaStub } from '../stubs/MensajeriaStub';
import { BUS_CERCA, BUS_LEJOS, HORA_ACTUAL, PLACA, crearRuta } from '../datosPrueba';

describe('Top-down N2 - MonitorRuta + NotificadorAcudientes real', () => {
  function crearMonitorN2(
    opciones: {
      gps?: ProveedorGPSStub;
      trafico?: ServicioTraficoStub;
      ruta?: InfoRuta;
      mensajeria?: MensajeriaStub;
    } = {}
  ) {
    const mensajeria = opciones.mensajeria ?? new MensajeriaStub();
    const gps = opciones.gps ?? new ProveedorGPSStub({ ...BUS_CERCA, velocidadMs: 10 });
    const trafico = opciones.trafico ?? new ServicioTraficoStub(1.0);
    const rutas = new RepositorioRutasStub().conRuta(PLACA, opciones.ruta ?? crearRuta());
    const monitor = new MonitorRuta(gps, rutas, trafico, new NotificadorAcudientes(mensajeria));
    return { monitor, mensajeria, gps, trafico };
  }

  it('monitorear_conBusCerca_debeEnviarSMSSoloAAcudientesConNotificacionesActivas', async () => {
    const { monitor, mensajeria } = crearMonitorN2();

    const reporte = await monitor.monitorear(PLACA, HORA_ACTUAL);

    expect(reporte.estado).toBe('EN_RUTA');
    expect(reporte.smsEnviados).toBe(2);
    expect(mensajeria.enviados.map((e) => e.telefono)).toEqual(['3001112233', '3007778899']);
  });

  it('monitorear_debeEnviarSMSConLosMinutosCalculadosPorEtaYNoOtros', async () => {
    const { monitor, mensajeria } = crearMonitorN2();

    await monitor.monitorear(PLACA, HORA_ACTUAL);

    expect(mensajeria.enviados[0].mensaje).toBe(
      'RutaSegura: el bus WPX482 llegará en aproximadamente 3 minutos.'
    );
  });

  it('monitorear_conFalloDeUnSMS_debeReportarSoloLosEnviosExitosos', async () => {
    const mensajeria = new MensajeriaStub().fallarPara('3007778899');
    const { monitor } = crearMonitorN2({ mensajeria });

    const reporte = await monitor.monitorear(PLACA, HORA_ACTUAL);

    expect(reporte.smsEnviados).toBe(1);
    expect(mensajeria.enviados).toHaveLength(1);
    expect(mensajeria.enviados[0].telefono).toBe('3001112233');
  });

  it('monitorear_conBusLejosAMasDeDiezMinutos_noDebeEnviarNingunSMS', async () => {
    const gps = new ProveedorGPSStub({ ...BUS_LEJOS, velocidadMs: 5 });
    const { monitor, mensajeria } = crearMonitorN2({ gps });

    const reporte = await monitor.monitorear(PLACA, HORA_ACTUAL);

    expect(reporte.estado).toBe('EN_RUTA');
    expect(reporte.smsEnviados).toBe(0);
    expect(mensajeria.enviados).toHaveLength(0);
  });
});