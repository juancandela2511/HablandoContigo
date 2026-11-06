/**
 * ============================================================================
 * CALCULADOR DE RADAR, ENPS Y MATRIZ DE CALOR (calculadorRadarYMatriz.ts)
 * ============================================================================
 * Calcula dimensiones radiales proporcionales, indicador eNPS y celdas de
 * matriz de calor por departamento y dimensión.
 */

import type { Encuesta, RegistroRespuesta } from '@/Almacenes/useEncuestas'
import {
  esPreguntaDemograficaContexto,
  normalizarValorAEscalaCinco
} from '@/services/calculadorClimaService'
import type {
  DimensionRadial,
  CeldaMatrizCalor,
  MetricaENPS
} from '@/shared/types/dashboard.types'

export const DIMENSIONES_RADIALES_BASE: DimensionRadial[] = [
  { eje: 'Liderazgo y Confianza', valor: 0, meta: 85, estado: 'Óptimo', color: '#0284c7', inclinacion: 0, categoriaMapeada: 'Liderazgo y Confianza' },
  { eje: 'Carga Laboral y Estrés', valor: 0, meta: 85, estado: 'Óptimo', color: '#10b981', inclinacion: 60, categoriaMapeada: 'Carga Laboral y Estrés' },
  { eje: 'Bienestar y Reconocimiento', valor: 0, meta: 85, estado: 'Óptimo', color: '#6366f1', inclinacion: 120, categoriaMapeada: 'Bienestar y Reconocimiento' },
  { eje: 'Trabajo en Equipo y Apoyo', valor: 0, meta: 85, estado: 'Óptimo', color: '#8b5cf6', inclinacion: 180, categoriaMapeada: 'Trabajo en Equipo y Apoyo' },
  { eje: 'Clima y Ambiente Físico', valor: 0, meta: 85, estado: 'Óptimo', color: '#0ea5e9', inclinacion: 240, categoriaMapeada: 'Clima y Ambiente Físico' },
  { eje: 'Comunicación Organizacional', valor: 0, meta: 85, estado: 'Óptimo', color: '#f59e0b', inclinacion: 300, categoriaMapeada: 'Comunicación Organizacional' }
]

export function calcularDimensionesProporcionales(
  dimensionesDef: DimensionRadial[],
  respuestas: RegistroRespuesta[],
  metaGlobal: number = 85
): DimensionRadial[] {
  const mapaCategorias: Record<string, { suma: number; count: number }> = {}

  respuestas.forEach(r => {
    const items = Array.isArray(r.respuestas) ? r.respuestas : (typeof r.respuestas === 'string' ? JSON.parse(r.respuestas || '[]') : [])
    items.forEach((item: any) => {
      if (esPreguntaDemograficaContexto(item)) return
      if (typeof item.valor === 'number' && !isNaN(item.valor) && item.valor > 0 && item.categoria?.trim()) {
        const catNorm = item.categoria.trim().toLowerCase()
        if (!mapaCategorias[catNorm]) {
          mapaCategorias[catNorm] = { suma: 0, count: 0 }
        }
        const nivel = normalizarValorAEscalaCinco(item.valor, item.esAlerta, String(item.respuesta || ''))
        mapaCategorias[catNorm]!.suma += nivel
        mapaCategorias[catNorm]!.count++
      }
    })
  })

  return dimensionesDef.map(dim => {
    const ejeNorm = dim.eje.trim().toLowerCase()
    const catMapeada = dim.categoriaMapeada?.trim().toLowerCase()
    let suma = 0
    let count = 0

    if (catMapeada && mapaCategorias[catMapeada]) {
      suma += mapaCategorias[catMapeada]!.suma
      count += mapaCategorias[catMapeada]!.count
    } else if (mapaCategorias[ejeNorm]) {
      suma += mapaCategorias[ejeNorm]!.suma
      count += mapaCategorias[ejeNorm]!.count
    } else {
      const palabras = ejeNorm.split(/\s+/).filter(w => w.length >= 4 && !['para', 'sobre', 'equipo'].includes(w))
      for (const [cat, data] of Object.entries(mapaCategorias)) {
        if (cat.includes(ejeNorm) || ejeNorm.includes(cat) || palabras.some(p => cat.includes(p))) {
          suma += data.suma
          count += data.count
        }
      }
    }

    const valorCalculado = count > 0
      ? Math.min(100, Math.max(0, Math.round(((suma / count) / 5) * 100)))
      : 0

    const estado: DimensionRadial['estado'] =
      valorCalculado >= 80 ? 'Óptimo' : valorCalculado >= 70 ? 'Riesgo Moderado' : valorCalculado >= 50 ? 'Atención' : 'Crítico'

    return {
      ...dim,
      valor: valorCalculado,
      meta: dim.meta || metaGlobal,
      estado,
      inclinacion: typeof dim.inclinacion === 'number' ? dim.inclinacion : 0,
      totalRespuestas: count
    }
  })
}

export function calcularENPSRespuestas(respuestas: RegistroRespuesta[]): MetricaENPS {
  const total = respuestas.length
  if (total === 0) {
    return { score: 0, promotores: 0, pasivos: 0, detractores: 0, clasificacion: 'Neutro' }
  }

  let promotoresCount = 0
  let pasivosCount = 0
  let detractoresCount = 0

  respuestas.forEach(r => {
    if (r.puntajeGeneral >= 4.5) promotoresCount++
    else if (r.puntajeGeneral >= 3.0) pasivosCount++
    else detractoresCount++
  })

  const pProm = Math.round((promotoresCount / total) * 100)
  const pPas = Math.round((pasivosCount / total) * 100)
  const pDet = Math.round((detractoresCount / total) * 100)
  const score = pProm - pDet
  const clasificacion = score >= 50 ? 'Excelente' : score >= 20 ? 'Favorable' : score >= 0 ? 'Neutro' : 'Crítico'

  return { score, promotores: pProm, pasivos: pPas, detractores: pDet, clasificacion }
}

export function calcularMatrizCalor(
  respuestasAnonimas: RegistroRespuesta[],
  encuestas: Encuesta[],
  departamentoFiltro: string
): CeldaMatrizCalor[] {
  const matriz: CeldaMatrizCalor[] = []
  const agrupado: Record<string, Record<string, { suma: number; count: number; alertas: number }>> = {}

  respuestasAnonimas.forEach(r => {
    const enc = encuestas.find(e => e.id === r.idEncuesta)
    const dep = enc?.departamento || 'General'
    if (!agrupado[dep]) agrupado[dep] = {}

    const items = Array.isArray(r.respuestas) ? r.respuestas : (typeof r.respuestas === 'string' ? JSON.parse(r.respuestas || '[]') : [])
    items.forEach((item: any) => {
      if (esPreguntaDemograficaContexto(item)) return
      if (item.categoria && typeof item.valor === 'number' && item.valor > 0) {
        if (!agrupado[dep]![item.categoria]) {
          agrupado[dep]![item.categoria] = { suma: 0, count: 0, alertas: 0 }
        }
        const nivel = normalizarValorAEscalaCinco(item.valor, item.esAlerta, String(item.respuesta || ''))
        agrupado[dep]![item.categoria]!.suma += nivel
        agrupado[dep]![item.categoria]!.count++
        if (item.esAlerta || nivel <= 2) agrupado[dep]![item.categoria]!.alertas++
      }
    })
  })

  Object.keys(agrupado).forEach(dep => {
    if (departamentoFiltro !== 'todos' && dep !== departamentoFiltro) return
    Object.keys(agrupado[dep]!).forEach(cat => {
      const item = agrupado[dep]![cat]!
      const puntaje = +(item.suma / item.count).toFixed(1)
      const porcentaje = Math.round((puntaje / 5) * 100)
      const nivelRiesgo: CeldaMatrizCalor['nivelRiesgo'] =
        porcentaje >= 80 ? 'Óptimo' : porcentaje >= 70 ? 'Moderado' : porcentaje >= 50 ? 'Atención' : 'Crítico'

      matriz.push({
        departamento: dep,
        dimension: cat,
        puntaje,
        porcentaje,
        nivelRiesgo,
        totalRespuestas: item.count,
        alertaActiva: item.alertas > 0
      })
    })
  })

  return matriz
}
