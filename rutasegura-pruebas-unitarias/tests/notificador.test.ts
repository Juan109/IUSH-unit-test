import { NotificadorAcudientes, ServicioMensajeria, Acudiente } from '../src/notificador';

describe('Módulo Notificador (RN-10 a RN-13)', () => {
  let mensajeria: jest.Mocked<ServicioMensajeria>;
  let notificador: NotificadorAcudientes;

  // Se ejecuta antes de cada 'it' para asegurar pruebas independientes
  beforeEach(() => {
    mensajeria = { 
      enviarSMS: jest.fn().mockResolvedValue(true) 
    };
    notificador = new NotificadorAcudientes(mensajeria);
  });

  describe('RN-10 notificarProximidad - umbral de minutos', () => {
    it('notificarProximidad_conBusAMasDeDiezMinutos_noDebeEnviarSMS', async () => {
      // Arrange - Agregamos el campo 'nombre' requerido por TypeScript
      const acudientes: Acudiente[] = [{ nombre: 'Juan', telefono: '3001234567', notificacionesActivas: true }];
      
      // Act
      const resultado = await notificador.notificarProximidad('ABC123', 15, acudientes);
      
      // Assert
      expect(resultado).toBe(0);
      expect(mensajeria.enviarSMS).not.toHaveBeenCalled();
    });

    it('notificarProximidad_conMinutosNull_noDebeEnviarSMS', async () => {
      // Arrange
      const acudientes: Acudiente[] = [{ nombre: 'Juan', telefono: '3001234567', notificacionesActivas: true }];
      
      // Act
      const resultado = await notificador.notificarProximidad('ABC123', null, acudientes);
      
      // Assert
      expect(resultado).toBe(0);
      expect(mensajeria.enviarSMS).not.toHaveBeenCalled();
    });
  });

  describe('RN-11 notificarProximidad - preferencias del acudiente', () => {
    it('notificarProximidad_conAcudienteConNotificacionesDesactivadas_noDebeEnviarleSMS', async () => {
      // Arrange
      const acudientes: Acudiente[] = [
        { nombre: 'Maria', telefono: '3001111111', notificacionesActivas: false },
        { nombre: 'Pedro', telefono: '3002222222', notificacionesActivas: true }
      ];
      
      // Act
      const resultado = await notificador.notificarProximidad('ABC123', 5, acudientes);
      
      // Assert
      expect(resultado).toBe(1); // Solo un envío exitoso
      expect(mensajeria.enviarSMS).toHaveBeenCalledTimes(1); // Se llamó solo 1 vez
      expect(mensajeria.enviarSMS).toHaveBeenCalledWith('3002222222', expect.any(String));
    });
  });

  describe('RN-12 notificarProximidad - contenido del mensaje', () => {
    it('notificarProximidad_debeEnviarMensajeConPlacaYMinutos', async () => {
      // Arrange
      const acudientes: Acudiente[] = [{ nombre: 'Luis', telefono: '3003333333', notificacionesActivas: true }];
      
      // Act
      await notificador.notificarProximidad('XYZ789', 8, acudientes);
      
      // Assert
      const mensajeEsperado = 'RutaSegura: el bus XYZ789 llegará en aproximadamente 8 minutos.';
      expect(mensajeria.enviarSMS).toHaveBeenCalledWith('3003333333', mensajeEsperado);
    });
  });

  describe('RN-13 notificarProximidad - tolerancia a fallos', () => {
    it('notificarProximidad_conUnEnvioFallido_debeContinuarYContarSoloExitosos', async () => {
      // Arrange
      const acudientes: Acudiente[] = [
        { nombre: 'Ana', telefono: '111', notificacionesActivas: true },
        { nombre: 'Carlos', telefono: '222', notificacionesActivas: true },
        { nombre: 'Sofia', telefono: '333', notificacionesActivas: true }
      ];

      // Simulamos los fallos de red
      mensajeria.enviarSMS
        .mockRejectedValueOnce(new Error('Sin señal'))
        .mockResolvedValueOnce(false);

      // Act
      const resultado = await notificador.notificarProximidad('ABC123', 5, acudientes);

      // Assert
      expect(mensajeria.enviarSMS).toHaveBeenCalledTimes(3); 
      expect(resultado).toBe(1); 
    });
  });
});