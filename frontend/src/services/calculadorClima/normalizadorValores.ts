/**
 * ============================================================================
 * NORMALIZADOR DE VALORES Y FILTRO DEMOGRÁFICO (normalizadorValores.ts)
 * ============================================================================
 * Filtra preguntas de segmentación y normaliza escalas (1-5 o 0-100)
 * detectando opciones críticas y respuestas negativas en español.
 */

import type { RespuestaItem } from '@/Almacenes/encuestas/tiposEncuestas'

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
 * Normaliza el valor de una opción a una escala de 1 a 5.
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

  if (valorRaw === 5 && (esAlerta || esTextoCritico)) {
    return 1
  }

  let nivel = 3
  if (valorRaw <= 5) {
    nivel = Math.max(1, Math.min(5, Math.round(valorRaw)))
  } else {
    if (valorRaw >= 90) nivel = 5
    else if (valorRaw >= 70) nivel = 4
    else if (valorRaw >= 50) nivel = 3
    else if (valorRaw >= 25) nivel = 2
    else nivel = 1
  }

  if ((esAlerta || esTextoNegativo) && nivel > 2) {
    nivel = esTextoCritico || valorRaw <= 15 ? 1 : 2
  }

  return nivel
}
