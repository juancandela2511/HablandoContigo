/**
 * ============================================================================
 * FILTRO ESTRICTO DE COMENTARIOS LIBRES VS OPCIÓN MÚLTIPLE (filtroComentariosReales.ts)
 * ============================================================================
 * Garantiza que la IA y el detector de menciones analicen ÚNICAMENTE comentarios
 * escritos por las personas y NUNCA confundan opciones de selección múltiple
 * (como "Asumiendo nuevos retos, ascendiendo y creciendo dentro de Contigo Call Center")
 * con quejas o comentarios abiertos.
 */

import preguntasJson from '@/database/preguntas.json'

/**
 * Conjunto de todas las respuestas cerradas estándar y todas las opciones
 * definidas en el catálogo de preguntas de opción múltiple.
 */
const OPCIONES_CERRADAS_CONOCIDAS = new Set<string>([
  'sí', 'si', 'no', 'tal vez', 'quizás', 'quizas', 'a veces', 'algunas veces',
  'casi siempre', 'siempre', 'nunca', 'casi nunca', 'pocas veces',
  'muy bien', 'bien', 'regular', 'mal', 'muy mal', 'excelente',
  'bueno', 'buena', 'malo', 'mala', 'pésimo', 'pesimo',
  'totalmente de acuerdo', 'de acuerdo', 'parcialmente de acuerdo',
  'en desacuerdo', 'totalmente en desacuerdo', 'neutral',
  'parcialmente', 'totalmente', 'frecuentemente', 'ocasionalmente', 'rara vez',
  'ninguno', 'ninguna', 'otro', 'otra', 'no aplica', 'n/a', 'sin respuesta',
  'prefiero no responder', 'no (pase directamente al bloque 7)', 'no, ninguno',
  'menos de 3 meses', 'de 3 a 6 meses', 'menos de 6 meses',
  'de 6 meses a 1 año', 'de 1 a 3 años', 'más de 3 años', 'mas de 3 años',
  '5 - excelente (muy bien)', '4 - bien', '3 - regular', '2 - mal', '1 - muy mal',
  'respuesta generada para prueba local.'
])

// Registrar dinámicamente absolutamente todas las opciones de preguntas.json
;(preguntasJson as any[]).forEach(p => {
  if (Array.isArray(p.opciones)) {
    p.opciones.forEach((op: any) => {
      const txt = (typeof op === 'string' ? op : op?.texto || '').trim().toLowerCase()
      if (txt) OPCIONES_CERRADAS_CONOCIDAS.add(txt)
    })
  }
})

const PREFIJOS_OPCION_MULTIPLE = [
  'asumiendo nuevos retos',
  'estable en mi puesto',
  'con incertidumbre, aún no veo',
  'no me visualizo trabajando',
  'sí, me siento muy motivado',
  'sí, siempre que existan',
  'tengo poca motivación por falta',
  'no me motiva permanecer',
  'sí, todos tenemos las mismas',
  'en general hay equidad',
  'a veces se perciben preferencias',
  'no, no existe igualdad',
  'sí, se respeta mi tiempo',
  'casi siempre hay respeto',
  'pocas veces, cuesta equilibrar',
  'no, no se respeta la desconexión',
  'sí, nos enteramos a tiempo',
  'funcionan bien en la mayoría',
  'son regulares, la información',
  'no, los canales de comunicación',
  'sí, me encuentro estudiando',
  'no estoy estudiando actualmente',
  'no me encuentro estudiando',
  'sí, aplico mis conocimientos',
  'parcialmente, aplico algunas',
  'poco, mis estudios y capacidades',
  'no, siento que mi nivel académico',
  'no (pase',
  'respuesta generada para prueba',
  '5 - ', '4 - ', '3 - ', '2 - ', '1 - '
]

/**
 * Verifica si un texto corresponde a una etiqueta u opción de selección múltiple
 */
export function esOpcionMultipleCerrada(texto: string): boolean {
  if (!texto) return true
  const limpio = texto.trim().toLowerCase()
  if (limpio.length < 3) return true
  if (OPCIONES_CERRADAS_CONOCIDAS.has(limpio)) return true
  return PREFIJOS_OPCION_MULTIPLE.some(pref => limpio.startsWith(pref))
}

/**
 * Determina si un ítem respondido corresponde a una pregunta verdaderamente abierta
 * de clima laboral (excluyendo demográficas, antigüedad, área, proyección cerrada y estudios).
 */
export function esPreguntaAbiertaClima(item: any): boolean {
  if (!item) return false
  const idP = String(item.idPregunta || '').toLowerCase().trim()
  const txtP = String(item.textoPregunta || '').toLowerCase().trim()

  // Excluir preguntas cerradas conocidas, demográficas y de qué carrera estudia
  if (
    idP.startsWith('b1-') ||
    idP.includes('estudi') ||
    idP.startsWith('b7-p35') ||
    idP.startsWith('b7-p36') ||
    txtP.includes('programa de estudios') ||
    txtP.includes('especifica qué estudias') ||
    txtP.includes('cómo te visualizas a ti mismo')
  ) {
    return false
  }

  // Si fue respondida con una opción múltiple conocida, NO es respuesta abierta
  if (item.respuesta && esOpcionMultipleCerrada(String(item.respuesta))) {
    return false
  }

  return (
    item.tipo === 'texto' ||
    item.tipo === 'abierta' ||
    idP.includes('12b') ||
    idP.startsWith('b8-') ||
    (item.valor === undefined && item.valor === null)
  )
}

/**
 * Extrae únicamente el comentario libre real escrito por la persona en el ítem.
 * Si no escribió comentario (solo seleccionó una opción múltiple), retorna ''.
 */
export function extraerComentarioLibreValido(item: any): string {
  if (!item) return ''
  const idP = String(item.idPregunta || '').toLowerCase().trim()
  if (idP.includes('estudi') || idP.startsWith('b1-')) return ''

  // 1. Verificar campo explícito de comentario ("¿Por qué?" / Justificación)
  if (item.comentario && typeof item.comentario === 'string') {
    const comTrim = item.comentario.trim()
    if (comTrim.length >= 3 && !esOpcionMultipleCerrada(comTrim)) {
      return comTrim
    }
  }

  // 2. Si es una pregunta abierta real, verificar item.respuesta
  if (esPreguntaAbiertaClima(item) && item.respuesta && typeof item.respuesta === 'string') {
    const respTrim = item.respuesta.trim()
    if (respTrim.length >= 3 && !esOpcionMultipleCerrada(respTrim)) {
      return respTrim
    }
  }

  return ''
}
