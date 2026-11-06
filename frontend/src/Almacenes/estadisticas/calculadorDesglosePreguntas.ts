/**
 * ============================================================================
 * CALCULADOR DE DESGLOSE DETALLADO POR PREGUNTA (calculadorDesglosePreguntas.ts)
 * ============================================================================
 * Calcula la distribución de puntajes (1-5), desviación estándar, cruce por
 * antigüedad y departamento, y extrae únicamente comentarios libres reales.
 */

import type { Encuesta, RegistroRespuesta } from '@/Almacenes/useEncuestas'
import { normalizarValorAEscalaCinco } from '@/services/calculadorClimaService'
import { extraerComentarioLibreValido } from '@/ia/menciones/filtroComentariosReales'
import type {
  DesgloseRespuestaDetallada,
  DesglosePuntajeItem,
  DesgloseAntiguedadItem,
  DesgloseDepartamentoItem
} from '@/shared/types/dashboard.types'

const RANGOS_ANTIGUEDAD = [
  { rango: 'menos-6m', etiqueta: 'Menos de 6 meses' },
  { rango: '6m-1a', etiqueta: 'De 6 meses a 1 año' },
  { rango: '1a-3a', etiqueta: 'De 1 a 3 años' },
  { rango: 'mas-3a', etiqueta: 'Más de 3 años' }
]

export function clasificarRangoAntiguedad(items: any[]): 'menos-6m' | '6m-1a' | '1a-3a' | 'mas-3a' {
  const itemAnt = items.find((i: any) =>
    i.idPregunta === 'b1-p1-antiguedad' ||
    i.idPregunta === 'b1-p1-tiempo-empresa' ||
    i.textoPregunta?.toLowerCase().includes('laborando') ||
    i.textoPregunta?.toLowerCase().includes('antigüedad') ||
    i.textoPregunta?.toLowerCase().includes('tiempo llevas')
  )
  const rawVal = itemAnt?.respuesta
  const txtAnt = (typeof rawVal === 'string' ? rawVal : (rawVal?.texto || rawVal?.label || ''))
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
  const valOp = typeof rawVal === 'object' && rawVal !== null && typeof rawVal.valor === 'number'
    ? rawVal.valor
    : itemAnt?.valor

  if (valOp === 1 || txtAnt.includes('menos de 6') || txtAnt.includes('menos de 3') || txtAnt.includes('3 a 6')) return 'menos-6m'
  if (valOp === 2 || valOp === 3 || txtAnt.includes('6 meses') || txtAnt.includes('6m-1a') || txtAnt.includes('hasta 1 ano')) return '6m-1a'
  if (valOp === 5 || txtAnt.includes('mas de 3') || txtAnt.includes('+3') || txtAnt.includes('>3')) return 'mas-3a'
  return '1a-3a'
}

export function calcularDesgloseRespuestas(
  respuestasFiltradas: RegistroRespuesta[],
  encuestas: Encuesta[]
): DesgloseRespuestaDetallada[] {
  const mapaPreguntas: Record<string, {
    categoria: string
    pregunta: string
    registros: Array<{ valor: number; departamento: string; antiguedad: string }>
    alertas: number
    comentarios: string[]
  }> = {}

  respuestasFiltradas.forEach(r => {
    const items = Array.isArray(r.respuestas) ? r.respuestas : (typeof r.respuestas === 'string' ? JSON.parse(r.respuestas || '[]') : [])
    const antiguedad = clasificarRangoAntiguedad(items)
    const enc = encuestas.find(e => e.id === r.idEncuesta)
    const dep = enc?.departamento || 'General'

    items.forEach((item: any) => {
      if (!mapaPreguntas[item.idPregunta]) {
        mapaPreguntas[item.idPregunta] = {
          categoria: item.categoria || 'General',
          pregunta: item.textoPregunta || 'Pregunta de Clima',
          registros: [],
          alertas: 0,
          comentarios: []
        }
      }
      const entry = mapaPreguntas[item.idPregunta]!
      if (typeof item.valor === 'number' && item.valor > 0) {
        const nivelNorm = normalizarValorAEscalaCinco(item.valor, item.esAlerta, String(item.respuesta || ''))
        entry.registros.push({ valor: nivelNorm, departamento: dep, antiguedad })
      }
      if (item.esAlerta) entry.alertas++
      const comLibre = extraerComentarioLibreValido(item)
      if (comLibre && !entry.comentarios.includes(comLibre)) {
        entry.comentarios.push(comLibre)
      }
    })
  })

  return Object.keys(mapaPreguntas).map(id => {
    const p = mapaPreguntas[id]!
    const total = p.registros.length
    if (total === 0) {
      return {
        idPregunta: id,
        categoria: p.categoria,
        pregunta: p.pregunta,
        promedio: 0,
        totalRespuestas: 0,
        esSensibleAlerta: p.alertas > 0,
        desviacionEstandar: 0,
        indiceConsenso: 'Alto',
        distribucion: { positivas: 0, neutrales: 0, negativas: 0 },
        desglosePuntos: [],
        desgloseAntiguedad: [],
        desgloseDepartamento: [],
        comentariosDestacados: p.comentarios.slice(0, 8)
      }
    }

    const valores = p.registros.map(r => r.valor)
    const promedio = +(valores.reduce((a, b) => a + b, 0) / total).toFixed(1)
    const conteoPts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    valores.forEach(v => {
      const valNorm = Math.min(5, Math.max(1, Math.round(v)))
      conteoPts[valNorm] = (conteoPts[valNorm] || 0) + 1
    })

    const desglosePuntos: DesglosePuntajeItem[] = [
      { pts: 1, etiqueta: '1 Pt - Alerta Crítica (Muy Mal)', count: conteoPts[1] || 0, porcentaje: Math.round(((conteoPts[1] || 0) / total) * 100), color: '#ff2a2a' },
      { pts: 2, etiqueta: '2 Pts - Riesgo (Mal)', count: conteoPts[2] || 0, porcentaje: Math.round(((conteoPts[2] || 0) / total) * 100), color: '#ff7700' },
      { pts: 3, etiqueta: '3 Pts - Neutro (Regular)', count: conteoPts[3] || 0, porcentaje: Math.round(((conteoPts[3] || 0) / total) * 100), color: '#ffcc00' },
      { pts: 4, etiqueta: '4 Pts - Favorable (Bien)', count: conteoPts[4] || 0, porcentaje: Math.round(((conteoPts[4] || 0) / total) * 100), color: '#00c8ff' },
      { pts: 5, etiqueta: '5 Pts - Excelente (Máximo)', count: conteoPts[5] || 0, porcentaje: Math.round(((conteoPts[5] || 0) / total) * 100), color: '#0066ff' }
    ]

    const pos = (conteoPts[4] || 0) + (conteoPts[5] || 0)
    const neu = conteoPts[3] || 0
    const neg = (conteoPts[1] || 0) + (conteoPts[2] || 0)
    const varianza = valores.reduce((acc, v) => acc + Math.pow(v - promedio, 2), 0) / total
    const desviacionEstandar = +(Math.sqrt(varianza)).toFixed(2)
    const indiceConsenso = desviacionEstandar < 0.6 ? 'Alto' : desviacionEstandar < 1.1 ? 'Moderado' : 'Polarizado'

    const desgloseAntiguedad: DesgloseAntiguedadItem[] = RANGOS_ANTIGUEDAD.map(ra => {
      const regs = p.registros.filter(r => r.antiguedad === ra.rango)
      const tAnt = regs.length
      const distP: Record<number, { count: number; porcentaje: number }> = {
        1: { count: 0, porcentaje: 0 }, 2: { count: 0, porcentaje: 0 }, 3: { count: 0, porcentaje: 0 }, 4: { count: 0, porcentaje: 0 }, 5: { count: 0, porcentaje: 0 }
      }
      if (tAnt === 0) return { rango: ra.rango, etiqueta: ra.etiqueta, total: 0, promedio: 0, porcentajeSalud: 0, distribucionPuntos: distP }

      const promAnt = +(regs.reduce((a, b) => a + b.valor, 0) / tAnt).toFixed(1)
      regs.forEach(r => {
        const vn = Math.min(5, Math.max(1, Math.round(r.valor)))
        if (distP[vn]) distP[vn]!.count++
      })
      for (let pt = 1; pt <= 5; pt++) {
        if (distP[pt]) distP[pt]!.porcentaje = Math.round((distP[pt]!.count / tAnt) * 100)
      }
      return { rango: ra.rango, etiqueta: ra.etiqueta, total: tAnt, promedio: promAnt, porcentajeSalud: Math.round((promAnt / 5) * 100), distribucionPuntos: distP }
    })

    const depsMap: Record<string, { sum: number; count: number }> = {}
    p.registros.forEach(r => {
      const d = r.departamento || 'General'
      if (!depsMap[d]) depsMap[d] = { sum: 0, count: 0 }
      depsMap[d]!.sum += r.valor
      depsMap[d]!.count++
    })

    const desgloseDepartamento: DesgloseDepartamentoItem[] = Object.entries(depsMap).map(([dep, data]) => {
      const promDep = +(data.sum / data.count).toFixed(1)
      return { departamento: dep, total: data.count, promedio: promDep, porcentajeSalud: Math.round((promDep / 5) * 100) }
    })

    return {
      idPregunta: id,
      categoria: p.categoria,
      pregunta: p.pregunta,
      promedio,
      totalRespuestas: total,
      esSensibleAlerta: p.alertas > 0,
      desviacionEstandar,
      indiceConsenso,
      distribucion: {
        positivas: Math.round((pos / total) * 100),
        neutrales: Math.round((neu / total) * 100),
        negativas: Math.round((neg / total) * 100)
      },
      desglosePuntos,
      desgloseAntiguedad,
      desgloseDepartamento,
      comentariosDestacados: p.comentarios.slice(0, 8)
    }
  })
}
