/**
 * ============================================================================
 * SERVICIO PRINCIPAL DE CÁLCULO DE CLIMA LABORAL (calculadorClimaService.ts)
 * ============================================================================
 * Orquestador principal que consolida el promedio global de todas las encuestas
 * y re-exporta los submódulos de cálculo y normalización en español.
 */

import type { RegistroRespuesta } from '@/Almacenes/encuestas/tiposEncuestas'
import {
  type ResultadoEvaluacionClima,
  esPreguntaDemograficaContexto,
  normalizarValorAEscalaCinco
} from './calculadorClima/normalizadorValores'
import { calcularPuntajeDeRegistro } from './calculadorClima/calculadorRegistroIndividual'

export type { ResultadoEvaluacionClima }
export {
  esPreguntaDemograficaContexto,
  normalizarValorAEscalaCinco,
  calcularPuntajeDeRegistro
}

/**
 * Promedia todas las encuestas respondidas para obtener el % global de Clima Laboral
 * y su clasificación (Bueno, Regular o Malo).
 */
export function calcularClimaGlobalDeRespuestas(
  registros: RegistroRespuesta[] | undefined
): ResultadoEvaluacionClima {
  if (!Array.isArray(registros) || registros.length === 0) {
    return {
      puntajePromedio: 0,
      porcentajeClima: 0,
      respuestasBuenas: 0,
      respuestasRegulares: 0,
      respuestasMalas: 0,
      clasificacion: 'Sin Datos',
      etiquetaEstado: 'Sin Respuestas'
    }
  }

  let sumaPuntajes = 0
  let sumaPorcentajes = 0
  let totalBuenas = 0
  let totalRegulares = 0
  let totalMalas = 0
  let registrosValidos = 0

  registros.forEach(reg => {
    const evalReg = calcularPuntajeDeRegistro(reg.respuestas, reg.puntajeGeneral)
    if (evalReg.clasificacion !== 'Sin Datos' || (reg.respuestas && reg.respuestas.length > 0)) {
      sumaPuntajes += evalReg.puntajePromedio
      sumaPorcentajes += evalReg.porcentajeClima
      totalBuenas += evalReg.respuestasBuenas
      totalRegulares += evalReg.respuestasRegulares
      totalMalas += evalReg.respuestasMalas
      registrosValidos++
    }
  })

  if (registrosValidos === 0) {
    return {
      puntajePromedio: 0,
      porcentajeClima: 0,
      respuestasBuenas: 0,
      respuestasRegulares: 0,
      respuestasMalas: 0,
      clasificacion: 'Sin Datos',
      etiquetaEstado: 'Sin Respuestas'
    }
  }

  const puntajePromedio = Number((sumaPuntajes / registrosValidos).toFixed(2))
  const porcentajeClima = Math.max(0, Math.min(100, Math.round(sumaPorcentajes / registrosValidos)))

  const clasificacion: ResultadoEvaluacionClima['clasificacion'] =
    porcentajeClima >= 70 ? 'Bueno' : porcentajeClima >= 50 ? 'Regular' : 'Malo'

  const etiquetaEstado =
    clasificacion === 'Bueno'
      ? 'Clima Laboral Bueno'
      : clasificacion === 'Regular'
        ? 'Clima Laboral Regular'
        : 'Clima Laboral Malo'

  return {
    puntajePromedio,
    porcentajeClima,
    respuestasBuenas: totalBuenas,
    respuestasRegulares: totalRegulares,
    respuestasMalas: totalMalas,
    clasificacion,
    etiquetaEstado
  }
}
