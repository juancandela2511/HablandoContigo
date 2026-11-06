/**
 * ============================================================================
 * ANALIZADOR DE SENTIMIENTO Y ALERTAS PSICOSOCIALES (analizadorTextoAbierto.ts)
 * ============================================================================
 * Analiza respuestas abiertas de colaboradores mediante LLM y motor heurístico
 * resiliente en español.
 */

import { consultarOllamaJson } from './clienteOllama.js'

export interface AnalisisSentimientoRespuesta {
  clasificacion: 'Buena' | 'Mala' | 'Neutra'
  puntaje: number
  tema: string
  resumen: string
  palabrasClave: string[]
  esAlerta: boolean
  tipoAlerta?: 'acoso' | 'depresion' | 'renuncia_inminente' | 'burnout'
}

export async function analizarTextoAbierto(
  textoPregunta: string,
  respuestaTexto: string
): Promise<AnalisisSentimientoRespuesta> {
  const textoLimpio = String(respuestaTexto || '').trim()
  if (!textoLimpio) {
    return {
      clasificacion: 'Neutra',
      puntaje: 3.0,
      tema: 'Sin comentarios',
      resumen: 'No se ingresó texto.',
      palabrasClave: [],
      esAlerta: false
    }
  }

  // 1. Detección heurística de alertas críticas (Acoso, Maltrato, Burnout)
  const tieneAcoso = /acoso|acosador|tocamiento|toc[oó]|manoseo|intimidaci[oó]n|amenaz[oó]|abuso/i.test(textoLimpio)
  const tieneDepresion = /llor[oó]|llanto|angustia|desesper[oó]|no aguanto|tristeza|deprimid|suicid/i.test(textoLimpio)
  const tieneRenuncia = /renunciar|me voy|busco trabajo|otra empresa|no sigo|hasta ac[aá]/i.test(textoLimpio)
  const tieneBurnout = /agotad|quemand|explotad|fatiga|colapso|sin descanso|exceso de horas/i.test(textoLimpio)

  const esAlerta = tieneAcoso || tieneDepresion || tieneRenuncia || tieneBurnout
  let tipoAlerta: AnalisisSentimientoRespuesta['tipoAlerta'] = undefined

  if (tieneAcoso) tipoAlerta = 'acoso'
  else if (tieneDepresion) tipoAlerta = 'depresion'
  else if (tieneRenuncia) tipoAlerta = 'renuncia_inminente'
  else if (tieneBurnout) tipoAlerta = 'burnout'

  // 2. Intentar enriquecer mediante Ollama
  const prompt = `Analiza la siguiente respuesta de un colaborador a la pregunta "${textoPregunta}":
"${textoLimpio}"
Responde estrictamente en formato JSON con las claves: "clasificacion" ("Buena"|"Mala"|"Neutra"), "puntaje" (1 a 5), "tema" (resumen corto del tópico), "resumen" (explicación breve).`

  const parsed = await consultarOllamaJson(prompt, 5000)
  if (parsed && typeof parsed === 'object') {
    return {
      clasificacion: parsed.clasificacion || (esAlerta ? 'Mala' : 'Neutra'),
      puntaje: Number(parsed.puntaje) || (esAlerta ? 1.5 : 3.5),
      tema: parsed.tema || 'Percepción general',
      resumen: parsed.resumen || textoLimpio.substring(0, 120),
      palabrasClave: textoLimpio.split(/\s+/).filter(w => w.length > 5).slice(0, 4),
      esAlerta,
      tipoAlerta
    }
  }

  // 3. Motor Heurístico Resiliente (Sin requerir GPU ni conexión externa)
  const esNegativo = esAlerta || /mal|p[eé]simo|terrible|dif[ií]cil|desacuerdo|injust|incomod/i.test(textoLimpio)
  const esPositivo = /excelente|muy bien|bueno|content|feliz|agradecid|motivad|respeto|apoyo/i.test(textoLimpio)

  const clasificacion = esNegativo ? 'Mala' : (esPositivo ? 'Buena' : 'Neutra')
  const puntaje = esNegativo ? (esAlerta ? 1.0 : 2.2) : (esPositivo ? 4.8 : 3.0)

  return {
    clasificacion,
    puntaje,
    tema: esAlerta ? `Alerta Psicosocial (${tipoAlerta})` : (esNegativo ? 'Oportunidad de Mejora' : 'Fortaleza de Clima'),
    resumen: textoLimpio.length > 140 ? `${textoLimpio.substring(0, 137)}...` : textoLimpio,
    palabrasClave: textoLimpio.split(/\s+/).filter(w => w.length >= 6).slice(0, 5),
    esAlerta,
    tipoAlerta
  }
}
