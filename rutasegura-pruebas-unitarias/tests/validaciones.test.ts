import { validarCoordenadas } from '../src/validaciones';

describe('RN-06 validarCoordenadas', () => {
  // 1. Valor del medio (Caso Feliz)
  it('validarCoordenadas_conCoordenadaDeMedellin_debeRetornarTrue', () => {
    // Latitud y longitud normales dentro del rango
    expect(validarCoordenadas(6.24, -75.57)).toBe(true);
  });

  // 2. Valores límite (Los extremos exactos permitidos - 'a' y 'b')
  it('validarCoordenadas_conLatitudExactaEnLimiteSuperior_debeRetornarTrue', () => {
    expect(validarCoordenadas(90, 0)).toBe(true);
  });

  it('validarCoordenadas_conLatitudExactaEnLimiteInferior_debeRetornarTrue', () => {
    expect(validarCoordenadas(-90, 0)).toBe(true);
  });

  it('validarCoordenadas_conLongitudExactaEnLimiteSuperior_debeRetornarTrue', () => {
    expect(validarCoordenadas(0, 180)).toBe(true);
  });

  it('validarCoordenadas_conLongitudExactaEnLimiteInferior_debeRetornarTrue', () => {
    expect(validarCoordenadas(0, -180)).toBe(true);
  });

  // 3. Valores justo por fuera (Para atrapar defectos de validación)
  it('validarCoordenadas_conLatitudPorFueraDelLimiteSuperior_debeRetornarFalse', () => {
    expect(validarCoordenadas(90.1, 0)).toBe(false);
  });

  it('validarCoordenadas_conLatitudPorFueraDelLimiteInferior_debeRetornarFalse', () => {
    expect(validarCoordenadas(-90.1, 0)).toBe(false);
  });

  it('validarCoordenadas_conLongitudPorFueraDelLimiteSuperior_debeRetornarFalse', () => {
    expect(validarCoordenadas(0, 180.1)).toBe(false);
  });

  it('validarCoordenadas_conLongitudPorFueraDelLimiteInferior_debeRetornarFalse', () => {
    expect(validarCoordenadas(0, -180.1)).toBe(false);
  });

  // 4. Casos de error (Regla explícita del README)
  it('validarCoordenadas_conLatitudNaN_debeRetornarFalse', () => {
    expect(validarCoordenadas(NaN, -75.57)).toBe(false);
  });

  it('validarCoordenadas_conLongitudNaN_debeRetornarFalse', () => {
    expect(validarCoordenadas(6.24, NaN)).toBe(false);
  });
});