import { esPlacaValida } from '../src/validaciones';

/**
 * PRUEBA DE EJEMPLO — patrón Arrange / Act / Assert (AAA).
 * Úsenla como guía para escribir las demás. Pueden ampliar este archivo con más casos de RN-07.
 */
describe('RN-07 esPlacaValida', () => {
  it('esPlacaValida_conFormatoEstandar_debeRetornarTrue', () => {
    // Arrange: preparar los datos de entrada
    const placa = 'WPX482';

    // Act: ejecutar la unidad bajo prueba
    const resultado = esPlacaValida(placa);

    // Assert: verificar el resultado contra la especificación
    expect(resultado).toBe(true);
  });

  it('esPlacaValida_conLetrasMinusculas_debeRetornarTrue', () => {
    // Arrange
    const placa = 'wpx482';
    // Act
    const resultado = esPlacaValida(placa);
    // Assert
    expect(resultado).toBe(true);
  });

  it('esPlacaValida_conEspaciosAlInicioYFinal_debeRetornarTrue', () => {
    // Arrange
    const placa = '  WPX482  ';
    // Act
    const resultado = esPlacaValida(placa);
    // Assert
    expect(resultado).toBe(true);
  });

  // ----- FORMATOS INVÁLIDOS (Casos de Error) -----
  
  it('esPlacaValida_conFaltaDeLetras_debeRetornarFalse', () => {
    // Arrange (Solo 2 letras)
    const placa = 'WP482'; 
    // Act
    const resultado = esPlacaValida(placa);
    // Assert
    expect(resultado).toBe(false);
  });

  it('esPlacaValida_conFaltaDeNumeros_debeRetornarFalse', () => {
    // Arrange (Solo 2 números)
    const placa = 'WPX48'; 
    // Act
    const resultado = esPlacaValida(placa);
    // Assert
    expect(resultado).toBe(false);
  });

  it('esPlacaValida_conExcesoDeCaracteres_debeRetornarFalse', () => {
    // Arrange (4 letras en lugar de 3)
    const placa = 'WPXD482'; 
    // Act
    const resultado = esPlacaValida(placa);
    // Assert
    expect(resultado).toBe(false);
  });

  it('esPlacaValida_conEspacioEnElMedio_debeRetornarFalse', () => {
    // Arrange (El README no permite espacios intermedios)
    const placa = 'WPX 482'; 
    // Act
    const resultado = esPlacaValida(placa);
    // Assert
    expect(resultado).toBe(false);
  });
});


