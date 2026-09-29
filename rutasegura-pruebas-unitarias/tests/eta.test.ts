import { calcularMinutosEstimados, calcularHoraEstimadaLlegada } from '../src/eta';

describe('RN-01 calcularMinutosEstimados - fórmula', () => {
  // Prueba 1: Caso feliz
  it('calcularMinutosEstimados_conDatosNormales_debeCalcularSegunFormula', () => {
    // Arrange
    const velocidad = 40;
    const distancia = 10;
    const factor = 1.5;

    // Act
    const resultado = calcularMinutosEstimados(velocidad, distancia, factor);

    // Assert
    expect(resultado).toBe(23); // (10 / 40) * 60 * 1.5 = 22.5 -> redondea a 23
  });

  // Prueba 2: Límite (factor 1.0)
  it('calcularMinutosEstimados_conFactorUno_debeRetornar15', () => {
    const velocidad = 40;
    const distancia = 10;
    const factor = 1.0;
    
    const resultado = calcularMinutosEstimados(velocidad, distancia, factor);
    
    expect(resultado).toBe(15);
  });
});

describe('RN-02 calcularMinutosEstimados - bus detenido / en paradero', () => {
  // Prueba 1: Límite de velocidad (bus detenido)
  it('calcularMinutosEstimados_conVelocidadCero_debeRetornarNull', () => {
    const velocidad = 0;
    const distancia = 8;
    const factor = 1.5;
    
    const resultado = calcularMinutosEstimados(velocidad, distancia, factor);
    
    expect(resultado).toBeNull();
  });

  // Prueba 2: Límite de distancia (bus en el paradero)
  it('calcularMinutosEstimados_conDistanciaCero_debeRetornar0', () => {
    const velocidad = 55;
    const distancia = 0;
    const factor = 1.5;
    
    const resultado = calcularMinutosEstimados(velocidad, distancia, factor);
    
    expect(resultado).toBe(0);
  });
});

describe('RN-03 calcularMinutosEstimados - datos negativos', () => {
  // Prueba 1: Error de distancia
  it('calcularMinutosEstimados_conDistanciaNegativa_debeLanzarRangeError', () => {
    const velocidad = 40;
    const distancia = -5;
    const factor = 1.0;
    
    // Para capturar errores, envolvemos la ejecución en una función de flecha
    expect(() => {
      calcularMinutosEstimados(velocidad, distancia, factor);
    }).toThrow(RangeError);
  });

  // Prueba 2: Error de velocidad
  it('calcularMinutosEstimados_conVelocidadNegativa_debeLanzarRangeError', () => {
    const velocidad = -10;
    const distancia = 5;
    const factor = 1.0;
    
    expect(() => {
      calcularMinutosEstimados(velocidad, distancia, factor);
    }).toThrow(RangeError);
  });
});

describe('RN-04 calcularMinutosEstimados - rango del factor de tráfico', () => {
  // Prueba 1: Límite superior
  it('calcularMinutosEstimados_conFactorEnLimiteSuperior_debeCalcular', () => {
    const velocidad = 40;
    const distancia = 10;
    const factor = 3.0; // Límite exacto superior
    
    const resultado = calcularMinutosEstimados(velocidad, distancia, factor);
    
    expect(resultado).toBe(45);
  });

  // Prueba 2: Error fuera de rango
  it('calcularMinutosEstimados_conFactorFueraDeRango_debeLanzarRangeError', () => {
    const velocidad = 40;
    const distancia = 10;
    const factor = 3.1; // Excede el límite
    
    expect(() => {
      calcularMinutosEstimados(velocidad, distancia, factor);
    }).toThrow(RangeError);
  });
});

describe('RN-05 calcularHoraEstimadaLlegada', () => {
  // Prueba 1: Caso normal y verificación de no mutación
  it('calcularHoraEstimadaLlegada_conDatosNormales_debeSumarMinutosAHoraActual', () => {
    const velocidad = 40;
    const distancia = 10;
    const factor = 1.5; // Sabemos por la RN-01 que esto da 23 minutos
    
    // Fijamos la fecha para cumplir FIRST (Repetible)
    const horaActual = new Date(2026, 8, 22, 6, 30); // 6:30 AM
    // Guardamos una copia exacta para comprobar que la función no daña la variable original
    const copiaHoraActual = new Date(horaActual.getTime());
    
    const resultado = calcularHoraEstimadaLlegada(velocidad, distancia, factor, horaActual);
    
    // A las 6:30 le sumamos 23 minutos = 6:53 AM
    const horaEsperada = new Date(2026, 8, 22, 6, 53);
    
    expect(resultado).toEqual(horaEsperada);
    
    // Demostramos que la función no modificó la horaActual
    expect(horaActual).toEqual(copiaHoraActual);
  });

  // Prueba 2: Bus detenido devuelve nulo
  it('calcularHoraEstimadaLlegada_conVelocidadCero_debeRetornarNull', () => {
    const velocidad = 0;
    const distancia = 10;
    const factor = 1.5;
    const horaActual = new Date(2026, 8, 22, 6, 30);
    
    const resultado = calcularHoraEstimadaLlegada(velocidad, distancia, factor, horaActual);
    
    expect(resultado).toBeNull();
  });
});