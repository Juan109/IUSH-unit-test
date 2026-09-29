import { determinarNivelAlerta, calcularPorcentajeOcupacion } from '../src/alertas';

describe('RN-08 determinarNivelAlerta', () => {
  // ----- PARTICIÓN 1: NINGUNA [0 a 5] -----
  it('determinarNivelAlerta_conRetrasoDeCeroMinutos_debeRetornarNinguna', () => {
    // Límite inferior exacto
    expect(determinarNivelAlerta(0)).toBe('NINGUNA');
  });

  it('determinarNivelAlerta_conRetrasoRepresentativoNinguna_debeRetornarNinguna', () => {
    // Valor representativo del medio
    expect(determinarNivelAlerta(3)).toBe('NINGUNA');
  });

  it('determinarNivelAlerta_conRetrasoDeCincoMinutos_debeRetornarNinguna', () => {
    // Límite superior exacto
    expect(determinarNivelAlerta(5)).toBe('NINGUNA');
  });

  // ----- PARTICIÓN 2: LEVE (5 a 15] -----
  it('determinarNivelAlerta_conRetrasoDeSeisMinutos_debeRetornarLeve', () => {
    // Límite inferior de esta partición
    expect(determinarNivelAlerta(6)).toBe('LEVE');
  });

  it('determinarNivelAlerta_conRetrasoDeQuinceMinutos_debeRetornarLeve', () => {
    // Límite superior exacto
    expect(determinarNivelAlerta(15)).toBe('LEVE');
  });

  // ----- PARTICIÓN 3: GRAVE (> 15) -----
  it('determinarNivelAlerta_conRetrasoDeDieciseisMinutos_debeRetornarGrave', () => {
    // Límite inferior de esta partición
    expect(determinarNivelAlerta(16)).toBe('GRAVE');
  });

  it('determinarNivelAlerta_conRetrasoMuyAlto_debeRetornarGrave', () => {
    // Valor representativo
    expect(determinarNivelAlerta(45)).toBe('GRAVE');
  });

  // ----- CASO DE ERROR -----
  it('determinarNivelAlerta_conRetrasoNegativo_debeLanzarRangeError', () => {
    expect(() => { 
      determinarNivelAlerta(-1); 
    }).toThrow(RangeError);
  });
});

describe('RN-09 calcularPorcentajeOcupacion', () => {
  // ----- CASOS FELICES Y REGLAS DE NEGOCIO -----
  it('calcularPorcentajeOcupacion_conBusMedioLleno_debeRetornar50', () => {
    // 20 estudiantes de 40 de capacidad
    expect(calcularPorcentajeOcupacion(20, 40)).toBe(50);
  });

  it('calcularPorcentajeOcupacion_conDecimalesPeriodicos_debeRedondearAUnDecimal', () => {
    // 2 estudiantes en un bus de 3 de capacidad da 66.6666...%
    // Según la regla, se debe redondear a 1 decimal (66.7)
    expect(calcularPorcentajeOcupacion(2, 3)).toBe(66.7);
  });

  it('calcularPorcentajeOcupacion_conSobrecupo_debeRetornarMasDe100', () => {
    // 45 estudiantes en un bus de 40 de capacidad = 112.5%
    expect(calcularPorcentajeOcupacion(45, 40)).toBe(112.5);
  });

  // ----- CASOS DE ERROR -----
  it('calcularPorcentajeOcupacion_conCapacidadCero_debeLanzarRangeError', () => {
    expect(() => { 
      calcularPorcentajeOcupacion(20, 0); 
    }).toThrow(RangeError);
  });

  it('calcularPorcentajeOcupacion_conCapacidadNegativa_debeLanzarRangeError', () => {
    expect(() => { 
      calcularPorcentajeOcupacion(20, -5); 
    }).toThrow(RangeError);
  });

  it('calcularPorcentajeOcupacion_conEstudiantesNegativos_debeLanzarRangeError', () => {
    expect(() => { 
      calcularPorcentajeOcupacion(-2, 40); 
    }).toThrow(RangeError);
  });
});