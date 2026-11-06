/**
 * ============================================================================
 * SERVICIO DE CÁLCULO DE CLIMA LABORAL (calculadorClimaService.ts)
 * ============================================================================
 * Implementa la regla de negocio:
 * 1. Las respuestas BUENAS suman puntos (+4 a +5).
 * 2. Las respuestas MALAS (o con alerta) RESTAN a las buenas (-2.5 a -5).
 * 3. Se obtiene el puntaje neto de cada encuesta respondida (0 a 5) y su %.
 * 4. Luego se promedia entre todas las respuestas registradas para obtener
 *    el porcentaje global de Clima Laboral y determinar si es BUENO o MALO.
 */

import type { RegistroRespuesta, RespuestaItem } from '@/Almacenes/encuestas/tiposEncuestas'

export interface ResultadoEvaluacionClima {
  puntajePromedio: number        // Escala 0.0 a 5.0
  porcentajeClima: number        // Escala 0% a 100%
  respuestasBuenas: number
  respuestasRegulares: number
  respuestasMalas: number
  clasificacion: 'Bueno' | 'Regular' | 'Malo' | 'Sin Datos'
  etiquetaEstado: string
}

/**
 * Determina si una pregunta es puramente demográfica / de segmentación (Bloque 1)
 * y no debe alterar el cálculo de satisfacción de clima laboral.
 */
export function esPreguntaDemograficaContexto(item: RespuestaItem): boolean {
  const id = (item.idPregunta || '').toLowerCase()
  const cat = (item.categoria || '').toLowerCase()
  const txt = (item.textoPregunta || '').toLowerCase()

  if (
    id.includes('tiempo-empresa') ||
    id.includes('antiguedad') ||
    id.includes('area-departamento') ||
    id.includes('b6-p33-estudia') ||
    id.includes('b6-p33b-que-estudia') ||
    cat.includes('datos de contexto y segmentación') ||
    cat.includes('datos de contexto y segmentacion') ||
    txt.includes('cuánto tiempo llevas trabajando') ||
    txt.includes('a qué departamento o área perteneces') ||
    txt.includes('cursando algún estudio') ||
    txt.includes('especifica qué estudias')
  ) {
    return true
  }
  return false
}

/**
 * Normaliza el valor de una opción (ya sea en escala 1-5 o 0-100) a un nivel de 1 a 5.
 */
export function normalizarValorAEscalaCinco(
  valorRaw: number | undefined,
  esAlerta?: boolean,
  textoRespuesta?: string
): number {
  const txt = (textoRespuesta || '').toLowerCase()
  const esTextoCritico =
    txt.includes('estrés extremo') ||
    txt.includes('burnout') ||
    txt.includes('fatiga física y mental constante') ||
    txt.includes('ambiente hostil') ||
    txt.includes('conflicto grave') ||
    txt.startsWith('1 —') ||
    txt.startsWith('1 -')

  const esTextoNegativo =
    esTextoCritico ||
    txt.startsWith('2 —') ||
    txt.startsWith('2 -') ||
    txt.includes('poco satisfactorias') ||
    txt.includes('pocas oportunidades') ||
    txt.includes('frecuentemente siento estrés') ||
    txt.includes('agotamiento físico') ||
    txt.includes('fallas frecuentes') ||
    txt.includes('malos tratos') ||
    txt.includes('roces o tensiones')

  if (typeof valorRaw !== 'number' || isNaN(valorRaw)) {
    if (esTextoCritico) return 1
    if (esAlerta || esTextoNegativo) return 2
    return 3
  }

  // En preguntas.json antiguas, valorRaw === 5 en opciones de alerta significaba 5% de 100% (Crítico)
  if (valorRaw === 5 && (esAlerta || esTextoCritico)) {
    return 1
  }

  let nivel = 3
  if (valorRaw <= 5) {
    // Escala 1 a 5
    nivel = Math.max(1, Math.min(5, Math.round(valorRaw)))
  } else {
    // Escala 0 a 100 (como en preguntas.json)
    if (valorRaw >= 90) nivel = 5
    else if (valorRaw >= 70) nivel = 4
    else if (valorRaw >= 50) nivel = 3
    else if (valorRaw >= 25) nivel = 2
    else nivel = 1
  }

  // Si la opción está marcada como alerta / mala, nunca puede ser nivel bueno (> 2)
  if ((esAlerta || esTextoNegativo) && nivel > 2) {
    nivel = esTextoCritico || valorRaw <= 15 ? 1 : 2
  }

  return nivel
}

/**
 * Calcula el puntaje neto de una única respuesta (colaborador):
 * - Las buenas suman (+5 o +4)
 * - Las regulares aportan neutro (+2.5)
 * - Las malas RESTAN a las buenas (-2.5 o -5)
 */
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
      // RESPUESTA MALA: RESTA directamente a las respuestas buenas
      malas++
      if (nivel <= 1 || item.severidadAlerta === 'Crítica') {
        sumaNetaPuntos -= 5.0
      } else {
        sumaNetaPuntos -= 4.5
      }
    } else if (nivel === 3) {
      // RESPUESTA INTERMEDIA / REGULAR
      regulares++
      sumaNetaPuntos += 2.5
    } else if (nivel === 4) {
      // RESPUESTA BUENA: SUMA
      buenas++
      sumaNetaPuntos += 4.0
    } else {
      // RESPUESTA EXCELENTE (5): SUMA MÁXIMO
      buenas++
      sumaNetaPuntos += 5.0
    }
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

  // Promediar el balance neto entre el total de preguntas respondidas (acotado entre 0 y 5)
  const promedioBruto = sumaNetaPuntos / totalEvaluadas
  let porcentajeClima: number
  let puntajePromedio: number

  if (promedioBruto > 0) {
    puntajePromedio = Number(Math.max(0, Math.min(5, promedioBruto)).toFixed(2))
    porcentajeClima = Math.max(0, Math.min(100, Math.round((puntajePromedio / 5) * 100)))
  } else {
    // Si las respuestas malas igualan o superan a las buenas, el clima es crítico/bajo (0% a 30%)
    porcentajeClima = buenas > 0
      ? Math.max(5, Math.min(30, Math.round((buenas / totalEvaluadas) * 32)))
      : 0
    puntajePromedio = Number(((porcentajeClima / 100) * 5).toFixed(2))
  }

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
