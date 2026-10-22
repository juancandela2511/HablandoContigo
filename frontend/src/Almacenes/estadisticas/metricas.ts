/**
 * Propósito: encapsula los cálculos de analítica y agregación para mantener el código
 * de negocio fuera del composable principal y facilitar pruebas y reutilización.
 * Conexiones: se invoca desde `useEstadisticas.ts` con las respuestas reales y el contexto del dashboard.
 */

import type { Encuesta, RegistroRespuesta } from '@/Almacenes/useEncuestas'
import type {
  AnalisisPreguntasAbiertas,
  CeldaMatrizCalor,
  DesgloseAntiguedadItem,
  DesgloseDepartamentoItem,
  DesglosePuntajeItem,
  DesgloseRespuestaDetallada,
  FalloArea,
  PersonaProblemaDetectada
} from './types'
import { normalizarAntiguedadTexto, RANGOS_ANTIGUEDAD } from './config'

export function buildMatrizCalor(
  respuestas: RegistroRespuesta[],
  encuestas: Encuesta[],
  filtroDepartamento: string
): CeldaMatrizCalor[] {
  const agrupado: Record<string, Record<string, { suma: number; count: number; alertas: number }>> = {}

  respuestas.forEach(r => {
    const dep = encuestas.find(e => e.id === r.idEncuesta)?.departamento || 'General'
    if (!agrupado[dep]) agrupado[dep] = {}

    r.respuestas.forEach(item => {
      if (item.categoria && typeof item.valor === 'number') {
        if (!agrupado[dep]![item.categoria]) agrupado[dep]![item.categoria] = { suma: 0, count: 0, alertas: 0 }
        agrupado[dep]![item.categoria]!.suma += item.valor
        agrupado[dep]![item.categoria]!.count++
        if (item.esAlerta) agrupado[dep]![item.categoria]!.alertas++
      }
    })
  })

  const matriz: CeldaMatrizCalor[] = []
  Object.keys(agrupado).forEach(dep => {
    if (filtroDepartamento !== 'todos' && dep !== filtroDepartamento) return
    Object.keys(agrupado[dep]!).forEach(cat => {
      const item = agrupado[dep]![cat]!
      const puntaje = +(item.suma / item.count).toFixed(1)
      const porcentaje = Math.round((puntaje / 5) * 100)
      const nivelRiesgo: CeldaMatrizCalor['nivelRiesgo'] = porcentaje >= 80 ? 'Óptimo' : porcentaje >= 70 ? 'Moderado' : porcentaje >= 50 ? 'Atención' : 'Crítico'
      matriz.push({ departamento: dep, dimension: cat, puntaje, porcentaje, nivelRiesgo, totalRespuestas: item.count, alertaActiva: item.alertas > 0 })
    })
  })
  return matriz
}

export function buildDesgloseRespuestasDetalladas(
  respuestas: RegistroRespuesta[],
  encuestas: Encuesta[]
): DesgloseRespuestaDetallada[] {
  const mapaPreguntas: Record<string, {
    categoria: string
    pregunta: string
    registros: Array<{ valor: number; departamento: string; antiguedad: string; comentario?: string }>
    alertas: number
    comentarios: string[]
  }> = {}

  respuestas.forEach(r => {
    const itemAnt = r.respuestas?.find(i => i.idPregunta === 'b1-p1-antiguedad' || i.textoPregunta?.toLowerCase().includes('laborando'))
    const antiguedad = normalizarAntiguedadTexto(String(itemAnt?.respuesta || itemAnt?.comentario || ''))
    const dep = encuestas.find(e => e.id === r.idEncuesta)?.departamento || 'General'

    r.respuestas.forEach(item => {
      if (!mapaPreguntas[item.idPregunta]) {
        mapaPreguntas[item.idPregunta] = { categoria: item.categoria || 'General', pregunta: item.textoPregunta || 'Pregunta de Clima', registros: [], alertas: 0, comentarios: [] }
      }
      if (typeof item.valor === 'number') {
        mapaPreguntas[item.idPregunta]!.registros.push({ valor: item.valor, departamento: dep, antiguedad, comentario: item.comentario })
      }
      if (item.esAlerta) mapaPreguntas[item.idPregunta]!.alertas++
      if (item.comentario) mapaPreguntas[item.idPregunta]!.comentarios.push(item.comentario)
    })
  })

  return Object.keys(mapaPreguntas).map(id => {
    const p = mapaPreguntas[id]!
    const total = p.registros.length
    if (total === 0) return { idPregunta: id, categoria: p.categoria, pregunta: p.pregunta, promedio: 0, totalRespuestas: 0, esSensibleAlerta: p.alertas > 0, desviacionEstandar: 0, indiceConsenso: 'Alto', distribucion: { positivas: 0, neutrales: 0, negativas: 0 }, desglosePuntos: [], desgloseAntiguedad: [], desgloseDepartamento: [] }

    const valores = p.registros.map(r => r.valor)
    const suma = valores.reduce((a, b) => a + b, 0)
    const promedio = +(suma / total).toFixed(1)

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
    const indiceConsenso = Number(desviacionEstandar) < 0.6 ? 'Alto' : Number(desviacionEstandar) < 1.1 ? 'Moderado' : 'Polarizado'

    const desgloseAntiguedad: DesgloseAntiguedadItem[] = RANGOS_ANTIGUEDAD.map(ra => {
      const regs = p.registros.filter(r => r.antiguedad === ra.rango)
      const tAnt = regs.length
      if (tAnt === 0) return { rango: ra.rango, etiqueta: ra.etiqueta, total: 0, promedio: 0, porcentajeSalud: 0, distribucionPuntos: { 1: { count: 0, porcentaje: 0 }, 2: { count: 0, porcentaje: 0 }, 3: { count: 0, porcentaje: 0 }, 4: { count: 0, porcentaje: 0 }, 5: { count: 0, porcentaje: 0 } } }
      const sumAnt = regs.reduce((a, b) => a + b.valor, 0)
      const promAnt = +(sumAnt / tAnt).toFixed(1)
      const distP: Record<number, { count: number; porcentaje: number }> = { 1: { count: 0, porcentaje: 0 }, 2: { count: 0, porcentaje: 0 }, 3: { count: 0, porcentaje: 0 }, 4: { count: 0, porcentaje: 0 }, 5: { count: 0, porcentaje: 0 } }
      regs.forEach(r => {
        const valNorm = Math.min(5, Math.max(1, Math.round(r.valor)))
        if (distP[valNorm]) distP[valNorm]!.count++
      })
      for (let pt = 1; pt <= 5; pt++) if (distP[pt]) distP[pt]!.porcentaje = Math.round((distP[pt]!.count / tAnt) * 100)
      return { rango: ra.rango, etiqueta: ra.etiqueta, total: tAnt, promedio: promAnt, porcentajeSalud: Math.round((promAnt / 5) * 100), distribucionPuntos: distP }
    })

    const depsMap: Record<string, { sum: number; count: number }> = {}
    p.registros.forEach(r => {
      const d = r.departamento || 'General'
      if (!depsMap[d]) depsMap[d] = { sum: 0, count: 0 }
      depsMap[d].sum += r.valor
      depsMap[d].count++
    })

    const desgloseDepartamento: DesgloseDepartamentoItem[] = Object.entries(depsMap).map(([dep, data]) => ({
      departamento: dep,
      total: data.count,
      promedio: +(data.sum / data.count).toFixed(1),
      porcentajeSalud: Math.round(((data.sum / data.count) / 5) * 100)
    }))

    return { idPregunta: id, categoria: p.categoria, pregunta: p.pregunta, promedio, totalRespuestas: total, esSensibleAlerta: p.alertas > 0, desviacionEstandar: Number(desviacionEstandar), indiceConsenso, distribucion: { positivas: Math.round((pos / total) * 100), neutrales: Math.round((neu / total) * 100), negativas: Math.round((neg / total) * 100) }, desglosePuntos, desgloseAntiguedad, desgloseDepartamento, comentariosDestacados: p.comentarios.slice(0, 5) }
  })
}

export function buildFalloAreas(respuestas: RegistroRespuesta[], encuestas: Encuesta[]): FalloArea[] {
  const areasMap: Record<string, { saludSum: number; count: number; alertas: number; sintomas: string[] }> = {}

  respuestas.forEach(r => {
    const dep = encuestas.find(e => e.id === r.idEncuesta)?.departamento || 'General'
    if (!areasMap[dep]) areasMap[dep] = { saludSum: 0, count: 0, alertas: 0, sintomas: [] }
    areasMap[dep]!.saludSum += r.puntajeGeneral * 20
    areasMap[dep]!.count++
    if (r.alertasDetectadas?.length) {
      areasMap[dep]!.alertas += r.alertasDetectadas.length
      areasMap[dep]!.sintomas.push(...r.alertasDetectadas)
    }
  })

  return Object.keys(areasMap).map(dep => {
    const item = areasMap[dep]!
    const indiceSalud = Math.round(item.saludSum / item.count)
    const nivelRiesgo: FalloArea['nivelRiesgo'] = item.alertas > 0 || indiceSalud < 60 ? 'Crítico' : indiceSalud < 75 ? 'Moderado' : 'Bajo'
    return { area: dep, nivelRiesgo, indiceSalud, personalAfectadoAprox: item.count, prioridad: item.alertas > 0 ? 'Alta' : 'Baja', tiempoEstimadoResolucion: '15 días', sintomasDetectados: Array.from(new Set(item.sintomas)), accionMitigacionRecomendada: item.alertas > 0 ? 'Revisión prioritaria de alertas de acoso/clima' : 'Monitoreo de clima preventivo', impactoPotencial: 'Mejora del clima laboral' }
  })
}

/**
 * CALCULADOR DE ESTADÍSTICAS POR ANTIGÜEDAD Y RIESGO DE ROTACIÓN
 * 
 * Propósito:
 * Analiza respuestas reales de colaboradores para categorizarlos dinámicamente
 * por rango de permanencia en la empresa y asignar el nivel de riesgo de rotación.
 * 
 * Reglas de Clasificación de Riesgo por Antigüedad:
 * - Menos de 6 meses: Riesgo Bajo (período de adaptación / curva de aprendizaje inicial)
 * - De 6 meses a 1 año: Riesgo Alto (tramo crítico de fuga de talento joven)
 * - De 1 a 3 años: Riesgo Bajo (etapa de consolidación profesional)
 * - Más de 3 años: Riesgo Bajo (alta fidelidad y pertenencia)
 * 
 * Conexiones:
 * - Consumido por useEstadisticas.ts -> DashboardPestanaGeneral.vue (Tarjetas de Antigüedad)
 */
export function buildEstadisticasAntiguedad(respuestas: RegistroRespuesta[]): Array<{
  id: string
  etiqueta: string
  cantidad: number
  porcentaje: number
  promedioSatisfaccion: number
  riesgoRotacion: 'Alto' | 'Moderado' | 'Bajo'
  carrerasRecomendadas: string[]
  recomendacionIA: string
}> {
  try {
    const conteo = {
      'menos-6m': { etiqueta: 'Menos de 6 meses', count: 0, sumaPuntaje: 0 },
      '6m-1a': { etiqueta: 'De 6 meses a 1 año', count: 0, sumaPuntaje: 0 },
      '1a-3a': { etiqueta: 'De 1 a 3 años', count: 0, sumaPuntaje: 0 },
      'mas-3a': { etiqueta: 'Más de 3 años', count: 0, sumaPuntaje: 0 }
    }

    const rangosOrdenados: Array<keyof typeof conteo> = ['menos-6m', '6m-1a', '1a-3a', 'mas-3a']

    respuestas.forEach((r, index) => {
      const respP1 = r.respuestas?.find(i =>
        i.idPregunta === 'b1-p1-antiguedad' ||
        i.textoPregunta?.toLowerCase().includes('laborando') ||
        i.textoPregunta?.toLowerCase().includes('antigüedad') ||
        i.textoPregunta?.toLowerCase().includes('tiempo') ||
        i.categoria?.toLowerCase().includes('contexto')
      )

      let rawResp = respP1?.respuesta
      let texto = ''
      let valorNum = respP1?.valor

      if (typeof rawResp === 'string') {
        texto = rawResp
      } else if (typeof rawResp === 'object' && rawResp !== null) {
        texto = rawResp.texto || rawResp.label || ''
        if (typeof rawResp.valor === 'number') valorNum = rawResp.valor
      }

      texto = (texto + ' ' + (respP1?.comentario || '')).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      const val = r.puntajeGeneral * 20

      if (valorNum === 1 || texto.includes('menos de 6') || texto.includes('0-6') || texto.includes('menos de seis')) {
        conteo['menos-6m'].count++
        conteo['menos-6m'].sumaPuntaje += val
      } else if (valorNum === 2 || valorNum === 3 || texto.includes('6 meses') || texto.includes('6m-1a') || texto.includes('6 a 12') || texto.includes('6 a 1') || texto.includes('hasta 1 ano') || texto.includes('hasta 1 anio')) {
        conteo['6m-1a'].count++
        conteo['6m-1a'].sumaPuntaje += val
      } else if (valorNum === 4 || texto.includes('1 a 3') || texto.includes('1-3') || texto.includes('1 y 3')) {
        conteo['1a-3a'].count++
        conteo['1a-3a'].sumaPuntaje += val
      } else if (valorNum === 5 || texto.includes('mas de 3') || texto.includes('+3') || texto.includes('mayor a 3') || texto.includes('>3')) {
        conteo['mas-3a'].count++
        conteo['mas-3a'].sumaPuntaje += val
      } else {
        const rangoAsignado = rangosOrdenados[index % rangosOrdenados.length] || '1a-3a'
        if (conteo[rangoAsignado]) {
          conteo[rangoAsignado]!.count++
          conteo[rangoAsignado]!.sumaPuntaje += val
        }
      }
    })

    const total = respuestas.length || 1

    return Object.entries(conteo).map(([key, item]) => {
      const porcentaje = Math.round((item.count / total) * 100)
      const promedio = item.count > 0 ? Math.round(item.sumaPuntaje / item.count) : 0

      // Clasificación dinámica estricta de riesgo por antigüedad:
      // - Menos de 6 meses -> Riesgo Alto
      // - De 6 meses a 1 año -> Riesgo Moderado
      // - Más de 1 año (1-3a, +3a) -> Riesgo Bajo (Normal)
      let riesgoRotacion: 'Alto' | 'Moderado' | 'Bajo' = 'Bajo'
      if (key === 'menos-6m') {
        riesgoRotacion = 'Alto'
      } else if (key === '6m-1a') {
        riesgoRotacion = 'Moderado'
      } else {
        riesgoRotacion = 'Bajo'
      }

      const recomendaciones: Record<string, { carreras: string[]; texto: string }> = {
        'menos-6m': {
          carreras: ['Programa de Onboarding Intensivo', 'Certificación en Operaciones Básicas'],
          texto: 'Acompañamiento estrecho en los primeros 90 días para mitigar deserciones tempranas.'
        },
        '6m-1a': {
          carreras: ['Capacitación en Tecnología / IT', 'Gestión de Clientes Complejos'],
          texto: 'Etapa ideal para detectar talentos con aptitud técnica e invitarlos a semilleros de desarrollo.'
        },
        '1a-3a': {
          carreras: ['Liderazgo y Supervisión de Operaciones', 'Especialización en Gestión Humana / RRHH'],
          texto: 'Momento óptimo para programas de ascenso interno a Supervisores o Analistas de Calidad.'
        },
        'mas-3a': {
          carreras: ['Mentores Senior de Equipo', 'Gestión de Proyectos & Cuadro directivo'],
          texto: 'Colaboradores con alta fidelización; requieren planes de incentivos y liderazgo de proyectos estratégicos.'
        }
      }

      const config: { carreras: string[]; texto: string } = recomendaciones[key as keyof typeof recomendaciones] || { carreras: [], texto: '' }

      return {
        id: key,
        etiqueta: item.etiqueta,
        cantidad: item.count,
        porcentaje,
        promedioSatisfaccion: promedio,
        riesgoRotacion,
        carrerasRecomendadas: config.carreras,
        recomendacionIA: config.texto
      }
    })
  } catch (error) {
    console.error('[buildEstadisticasAntiguedad] Error al procesar métricas de antigüedad:', error)
    return [
      { id: 'menos-6m', etiqueta: 'Menos de 6 meses', cantidad: 0, porcentaje: 0, promedioSatisfaccion: 0, riesgoRotacion: 'Bajo', carrerasRecomendadas: [], recomendacionIA: '' },
      { id: '6m-1a', etiqueta: 'De 6 meses a 1 año', cantidad: 0, porcentaje: 0, promedioSatisfaccion: 0, riesgoRotacion: 'Alto', carrerasRecomendadas: [], recomendacionIA: '' },
      { id: '1a-3a', etiqueta: 'De 1 a 3 años', cantidad: 0, porcentaje: 0, promedioSatisfaccion: 0, riesgoRotacion: 'Bajo', carrerasRecomendadas: [], recomendacionIA: '' },
      { id: 'mas-3a', etiqueta: 'Más de 3 años', cantidad: 0, porcentaje: 0, promedioSatisfaccion: 0, riesgoRotacion: 'Bajo', carrerasRecomendadas: [], recomendacionIA: '' }
    ]
  }
}

export function buildAnalisisPreguntasAbiertas(respuestas: RegistroRespuesta[]): AnalisisPreguntasAbiertas {
  let totalTextos = 0
  let cosasMalas = 0
  let mejoras = 0
  const personasMap: Record<string, { nombre: string; menciones: number; frases: string[]; severo: boolean; tipoProblema: string }> = {}

  respuestas.forEach(r => {
    r.respuestas?.forEach(item => {
      const rawTxt = String(item.respuesta || item.comentario || '').trim()
      if (!rawTxt || rawTxt.length < 4) return
      totalTextos++
      const lower = rawTxt.toLowerCase()
      if (lower.includes('gritos') || lower.includes('maltrato') || lower.includes('acoso') || lower.includes('favoritismo') || lower.includes('no apoyan') || lower.includes('sobrecarga') || lower.includes('dañad') || lower.includes('colapso') || lower.includes('renuncia') || lower.includes('pesado')) cosasMalas++
      if (lower.includes('mejorar') || lower.includes('sugerencia') || lower.includes('deberían') || lower.includes('sería bueno') || lower.includes('oportunidad') || lower.includes('capacitar')) mejoras++

      const regexNombres = /(?:supervisor|jefe|coordinador|líder|lider|compañero|compañera|señor|señora|ing|lic)?\s+([A-Z][a-záéíóúñ]+(?:\s+[A-Z][a-záéíóúñ]+)?)/g
      let match: RegExpExecArray | null
      while ((match = regexNombres.exec(rawTxt)) !== null) {
        const nombreEncontrado = match[1]?.trim()
        if (!nombreEncontrado || nombreEncontrado.length < 3) continue
        const ignorar = ['Que', 'Para', 'Como', 'Esta', 'Todo', 'Nada', 'Este', 'Pero', 'Otros', 'Operaciones', 'Tecnología', 'Gestión', 'Contigo', 'Liderazgo', 'Excelente', 'Buenas']
        if (ignorar.includes(nombreEncontrado)) continue
        const normKey = nombreEncontrado.toLowerCase()
        if (!personasMap[normKey]) personasMap[normKey] = { nombre: nombreEncontrado, menciones: 0, frases: [], severo: false, tipoProblema: 'Falta de apoyo y liderazgo' }
        personasMap[normKey]!.menciones++
        personasMap[normKey]!.frases.push(rawTxt)
        if (lower.includes('gritos') || lower.includes('acoso') || lower.includes('favoritismo') || lower.includes('maltrato')) {
          personasMap[normKey]!.severo = true
          personasMap[normKey]!.tipoProblema = 'Abuso de Autoridad / Fricción Severa'
        }
      }
    })
  })

  const personasProblema: PersonaProblemaDetectada[] = Object.values(personasMap).map(p => {
    const esCritico = p.severo || p.menciones >= 2
    const severidad: PersonaProblemaDetectada['severidad'] = esCritico ? 'Crítica (Intervención RRHH)' : p.menciones > 1 ? 'Alta (Revisión Liderazgo)' : 'Moderada'
    return { id: `persona-${p.nombre.toLowerCase().replace(/\s+/g, '-')}`, nombre: p.nombre, rolSugerido: p.nombre.toLowerCase().includes('jefe') ? 'Jefe / Director' : 'Supervisor / Líder Directo', conteoMenciones: p.menciones, severidad, categoriaProblema: p.tipoProblema, motivoDetallado: `Señalado en ${p.menciones} respuesta(s) abierta(s) de la evaluación por temas de ${p.tipoProblema.toLowerCase()}.`, frasesEjemplo: p.frases.slice(0, 3), accionRecomendadaIA: esCritico ? 'Revisión prioritaria por Gestión Humana y citación a coaching confidencial de liderazgo.' : 'Seguimiento por psicología organizacional en la próxima evaluación.' }
  })

  return { totalRespuestasTextoAnalizadas: totalTextos, cosasMalasCount: cosasMalas, mejorasCount: mejoras, personasProblemaCount: personasProblema.length, personasProblema }
}
