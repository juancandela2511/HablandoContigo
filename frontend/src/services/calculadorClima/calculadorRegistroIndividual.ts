/**
 * ============================================================================
 * CÁLCULO DE PUNTAJE POR REGISTRO INDIVIDUAL (calculadorRegistroIndividual.ts)
 * ============================================================================
 * Aplica la regla de ponderación neta a las respuestas de un único colaborador:
 * las respuestas buenas suman y las malas restan a las buenas en español.
 */

import type { RespuestaItem } from '@/Almacenes/encuestas/tiposEncuestas'
import {
  type ResultadoEvaluacionClima,
  esPreguntaDemograficaContexto,
  normalizarValorAEscalaCinco
} from './normalizadorValores'

export function calcularPuntajeDeRegistro(
  items: RespuestaItem[] | undefined,
  puntajeFallback?: number
): ResultadoEvaluacionClima {
  if (!Array.isArray(items) || items.length === 0) {
    if (typeof puntajeFallback === 'number' && !isNaN(puntajeFallback) && puntajeFallback > 0) {
      const pNorm = puntajeFallback <= 5 ? puntajeFallback : (puntajeFallback / 100) * 5
      const pct = Math.min(100, Math.max(0, Math.round((pNorm / 5) * 100)))
      const clasificacion = pct >= 70 ? 'Bueno' : pct >= 50 ? 'Regular' : 'Malo'
      return {
        puntajePromedio: Number(pNorm.toFixed(2)),
        porcentajeClima: pct,
        respuestasBuenas: 0,
        respuestasRegulares: 0,
        respuestasMalas: 0,
        clasificacion,
        etiquetaEstado: clasificacion === 'Bueno' ? 'Clima Bueno' : clasificacion === 'Regular' ? 'Clima Regular' : 'Clima Malo'
      }
    }
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

  let sumaNetaPuntos = 0
  let totalEvaluadas = 0
  let buenas = 0
  let regulares = 0
  let malas = 0

  items.forEach(item => {
    if (esPreguntaDemograficaContexto(item)) return

    const valorNum = typeof item.valor === 'number' ? item.valor : Number(item.valor)
    const tieneValorNumerico = !isNaN(valorNum) && valorNum > 0
    const textoResp = typeof item.respuesta === 'string'
      ? item.respuesta
      : (typeof item.respuesta === 'object' && item.respuesta !== null ? String((item.respuesta as any).texto || '') : '')

    if (!tieneValorNumerico && !item.esAlerta && !textoResp) return
    if (!tieneValorNumerico && !item.esAlerta && item.idPregunta?.includes('comentarios-libres')) return

    const nivel = normalizarValorAEscalaCinco(tieneValorNumerico ? valorNum : undefined, item.esAlerta, textoResp)
    if (!tieneValorNumerico && !item.esAlerta && nivel === 3) return

    totalEvaluadas++

    if (item.esAlerta || nivel <= 2) {
      malas++
    } else if (nivel === 3) {
      regulares++
    } else {
      buenas++
    }

    // Cada pregunta evalúa de 1 a 5. Respuestas con alerta asignan puntaje acorde a su severidad.
    const puntosPregunta = item.esAlerta
      ? (item.severidadAlerta === 'Crítica' ? 1.0 : Math.min(nivel, 2.0))
      : nivel

    sumaNetaPuntos += puntosPregunta
  })

  if (totalEvaluadas === 0) {
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

  const promedioBruto = sumaNetaPuntos / totalEvaluadas
  const puntajePromedio = Number(Math.max(1, Math.min(5, promedioBruto)).toFixed(2))
  const porcentajeClima = Math.max(0, Math.min(100, Math.round((puntajePromedio / 5) * 100)))

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
    respuestasBuenas: buenas,
    respuestasRegulares: regulares,
    respuestasMalas: malas,
    clasificacion,
    etiquetaEstado
  }
}
