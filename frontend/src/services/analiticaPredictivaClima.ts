/**
 * ============================================================================
 * MOTOR DE ANALÍTICA PREDICTIVA Y AUDITORÍA PSICOMÉTRICA (analiticaPredictivaClima.ts)
 * ============================================================================
 * PROPÓSITO:
 * Implementa las Mejoras #1 y #6 de Ciencia de Datos aplicada al Clima Laboral:
 *  - Mejora #1: Índice Predictivo de Riesgo de Fuga (Churn Prediction) por Área,
 *    cruzando Liderazgo + Reconocimiento/Plan Carrera + Satisfacción + Alertas.
 *  - Mejora #6: Detector Anti-Straightlining (Respuestas Mecánicas / Planas),
 *    identificando patrones de respuesta automática y ponderando el puntaje real.
 */

import type { Encuesta, RegistroRespuesta } from '@/Almacenes/useEncuestas'
import { calcularPuntajeDeRegistro, esPreguntaDemograficaContexto, normalizarValorAEscalaCinco } from '@/services/calculadorClimaService'

export interface PrediccionFugaArea {
  area: string
  totalEvaluados: number
  probabilidadFuga: number // 0 a 95 (%)
  nivelRiesgo: 'Crítico' | 'Alto' | 'Moderado' | 'Bajo'
  puntajeLiderazgo: number // 0 a 100
  puntajeReconocimiento: number // 0 a 100
  alertasActivas: number
  causaPrincipal: string
  accionPreventivaIA: string
}

export interface ResultadoAuditoriaAntiStraightlining {
  totalRespuestasEvaluadas: number
  respuestasConfiables: number
  respuestasMecanicasDetectadas: number
  indiceConfiabilidadDatos: number // 0 a 100 (%)
  saludBrutaSinFiltrar: number // 0 a 100 (%)
  saludPonderadaSinRuido: number // 0 a 100 (%)
  patronesDetectados: string[]
}

/**
 * Evalúa si un registro individual presenta patrón mecánico (Straightlining o contradicción extrema).
 */
export function detectarRespuestaMecanica(registro: RegistroRespuesta): {
  esMecanica: boolean
  motivo?: string
} {
  const itemsCerrados = (registro.respuestas || []).filter(
    i => typeof i.valor === 'number' && !isNaN(i.valor) && i.valor > 0 && !esPreguntaDemograficaContexto(i)
  )

  if (itemsCerrados.length < 4) {
    return { esMecanica: false }
  }

  // 1. Verificar Straightlining (repetición idéntica de la misma opción en >= 88% de las preguntas)
  const conteoPorValor: Record<number, number> = {}
  itemsCerrados.forEach(item => {
    const v = normalizarValorAEscalaCinco(item.valor, item.esAlerta, String(item.respuesta || ''))
    conteoPorValor[v] = (conteoPorValor[v] || 0) + 1
  })

  const maxRepeticiones = Math.max(...Object.values(conteoPorValor))
  const ratioRepeticion = maxRepeticiones / itemsCerrados.length

  if (ratioRepeticion >= 0.88 && itemsCerrados.length >= 6) {
    return {
      esMecanica: true,
      motivo: 'Patrón Straightlining: selección repetitiva de la misma opción en más del 88% del cuestionario.'
    }
  }

  // 2. Verificar contradicción psicométrica extrema (ej. dice sentirse Excelente [5] pero marca No querer permanecer [1] y Estrés Crítico [1])
  const gusto = itemsCerrados.find(i => i.idPregunta.includes('gusto'))?.valor
  const estres = itemsCerrados.find(i => i.idPregunta.includes('estres'))?.valor
  const permanencia = itemsCerrados.find(i => i.idPregunta.includes('permanencia'))?.valor

  if (gusto === 5 && estres === 1 && permanencia === 1) {
    return {
      esMecanica: true,
      motivo: 'Inconsistencia psicométrica: contradicción severa entre preguntas de control de bienestar y retención.'
    }
  }

  return { esMecanica: false }
}

/**
 * MEJORA #6: Ejecuta la auditoría Anti-Straightlining sobre el conjunto de respuestas
 * y calcula el puntaje de salud ponderado reduciendo el peso (0.25x) del ruido mecánico.
 */
export function calcularAuditoriaAntiStraightlining(
  respuestas: RegistroRespuesta[]
): ResultadoAuditoriaAntiStraightlining {
  if (!respuestas || respuestas.length === 0) {
    return {
      totalRespuestasEvaluadas: 0,
      respuestasConfiables: 0,
      respuestasMecanicasDetectadas: 0,
      indiceConfiabilidadDatos: 100,
      saludBrutaSinFiltrar: 0,
      saludPonderadaSinRuido: 0,
      patronesDetectados: []
    }
  }

  let mecanicas = 0
  let sumaBruta = 0
  let sumaPonderada = 0
  let pesoTotal = 0
  const motivosSet = new Set<string>()

  respuestas.forEach(r => {
    const evalReg = calcularPuntajeDeRegistro(r.respuestas, r.puntajeGeneral)
    const saludIndividual = evalReg.porcentajeClima
    sumaBruta += saludIndividual

    const auditoria = detectarRespuestaMecanica(r)
    if (auditoria.esMecanica) {
      mecanicas++
      if (auditoria.motivo) motivosSet.add(auditoria.motivo)
      // Ponderación reducida (0.25) para que respuestas mecánicas no distorsionen el clima real
      sumaPonderada += saludIndividual * 0.25
      pesoTotal += 0.25
    } else {
      sumaPonderada += saludIndividual * 1.0
      pesoTotal += 1.0
    }
  })

  const total = respuestas.length
  const confiables = total - mecanicas
  const indiceConfiabilidadDatos = Math.round((confiables / total) * 100)
  const saludBrutaSinFiltrar = Math.round(sumaBruta / total)
  const saludPonderadaSinRuido = pesoTotal > 0 ? Math.round(sumaPonderada / pesoTotal) : saludBrutaSinFiltrar

  return {
    totalRespuestasEvaluadas: total,
    respuestasConfiables: confiables,
    respuestasMecanicasDetectadas: mecanicas,
    indiceConfiabilidadDatos,
    saludBrutaSinFiltrar,
    saludPonderadaSinRuido,
    patronesDetectados: Array.from(motivosSet)
  }
}

/**
 * MEJORA #1: Calcula el Índice Predictivo de Riesgo de Fuga (Churn Prediction) por Área
 * cruzando Liderazgo + Reconocimiento/Plan Carrera + Satisfacción + Alertas.
 */
export function calcularPrediccionRiesgoFugaPorArea(
  respuestas: RegistroRespuesta[],
  encuestas: Encuesta[]
): PrediccionFugaArea[] {
  if (!respuestas || respuestas.length === 0) return []

  const mapaAreas: Record<string, {
    evaluados: number
    liderazgoVals: number[]
    reconocimientoVals: number[]
    generalVals: number[]
    alertas: number
  }> = {}

  respuestas.forEach(r => {
    // Determinar área por respuesta de la pregunta 2 o por departamento de la encuesta
    const itemArea = (r.respuestas || []).find(i => i.idPregunta === 'b1-p2-area' || (i.textoPregunta || '').toLowerCase().includes('departamento'))
    const enc = encuestas.find(e => e.id === r.idEncuesta)
    const areaNombre = String(itemArea?.respuesta || enc?.departamento || 'Operaciones / Call Center').trim()

    if (!mapaAreas[areaNombre]) {
      mapaAreas[areaNombre] = { evaluados: 0, liderazgoVals: [], reconocimientoVals: [], generalVals: [], alertas: 0 }
    }
    const grupo = mapaAreas[areaNombre]!
    grupo.evaluados++
    const evalReg = calcularPuntajeDeRegistro(r.respuestas, r.puntajeGeneral)
    grupo.generalVals.push(evalReg.porcentajeClima)
    grupo.alertas += (r.alertasDetectadas?.length || 0)

    ;(r.respuestas || []).forEach(item => {
      if (typeof item.valor !== 'number' || esPreguntaDemograficaContexto(item)) return
      const id = (item.idPregunta || '').toLowerCase()
      const cat = (item.categoria || '').toLowerCase()
      const nivel = normalizarValorAEscalaCinco(item.valor, item.esAlerta, String(item.respuesta || ''))
      const valPct = nivel * 20

      if (id.startsWith('b4-') || cat.includes('liderazgo') || cat.includes('jefe')) {
        grupo.liderazgoVals.push(valPct)
      }
      if (id.includes('reconocimiento') || id.includes('plan-carrera') || id.includes('permanencia') || id.startsWith('b5-')) {
        grupo.reconocimientoVals.push(valPct)
      }
    })
  })

  return Object.entries(mapaAreas).map(([area, datos]) => {
    const promGeneral = promedioLista(datos.generalVals, 75)
    const promLiderazgo = promedioLista(datos.liderazgoVals, promGeneral)
    const promReconocimiento = promedioLista(datos.reconocimientoVals, promGeneral)

    // Modelo predictivo multifactorial: déficit de liderazgo (40%) + déficit de reconocimiento/carrera (35%) + impacto de alertas (25%)
    const deficitLiderazgo = Math.max(0, 100 - promLiderazgo) * 0.40
    const deficitReconocimiento = Math.max(0, 100 - promReconocimiento) * 0.35
    const penalizacionAlertas = Math.min(25, (datos.alertas / Math.max(1, datos.evaluados)) * 22)
    const probabilidadFuga = Math.min(95, Math.max(5, Math.round(deficitLiderazgo + deficitReconocimiento + penalizacionAlertas)))

    const nivelRiesgo: PrediccionFugaArea['nivelRiesgo'] =
      probabilidadFuga >= 65 ? 'Crítico' : probabilidadFuga >= 45 ? 'Alto' : probabilidadFuga >= 28 ? 'Moderado' : 'Bajo'

    const esFalloLiderazgo = promLiderazgo <= promReconocimiento
    const causaPrincipal = probabilidadFuga < 28
      ? 'Estabilidad operativa y liderazgo saludable'
      : esFalloLiderazgo
        ? `Desgaste en trato y soporte del jefe inmediato (${promLiderazgo}% favorabilidad)`
        : `Percepción de bajo reconocimiento y plan de carrera (${promReconocimiento}% favorabilidad)`

    const accionPreventivaIA = probabilidadFuga >= 45
      ? 'Intervención prioritaria: feedback 1 a 1 con líderes de equipo y revisión de incentivos de permanencia.'
      : 'Mantener rituales de reconocimiento mensual y seguimiento de carga laboral.'

    return {
      area,
      totalEvaluados: datos.evaluados,
      probabilidadFuga,
      nivelRiesgo,
      puntajeLiderazgo: promLiderazgo,
      puntajeReconocimiento: promReconocimiento,
      alertasActivas: datos.alertas,
      causaPrincipal,
      accionPreventivaIA
    }
  }).sort((a, b) => b.probabilidadFuga - a.probabilidadFuga)
}

function promedioLista(valores: number[], fallback: number): number {
  if (!valores.length) return Math.round(fallback)
  return Math.round(valores.reduce((a, b) => a + b, 0) / valores.length)
}
