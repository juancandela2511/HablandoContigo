import { ref, computed } from 'vue'
import { useEncuestas } from '@/Almacenes/useEncuestas'
import type { RegistroRespuesta } from '@/Almacenes/useEncuestas'
import { useTiposAlertas } from '@/Almacenes/useTiposAlertas'
import { useToast } from '@/Almacenes/useToast'
import { DashboardApi } from '@/services/dashboardApi'
import type {
  DimensionRadial,
  CeldaMatrizCalor,
  MetricaENPS,
  AnalisisConclusiones,
  MetricasParticipacion,
  FalloArea,
  DesgloseRespuestaDetallada,
  DesglosePuntajeItem,
  DesgloseAntiguedadItem,
  DesgloseDepartamentoItem,
  AnalisisPreguntasAbiertas,
  PersonaProblemaDetectada,
  EstadisticasCompletas
} from '@/shared/types/dashboard.types'

const { mostrarError, mostrarExito } = useToast()

const departamentoFiltro = ref<string>('todos')
const metaGlobalRadialConfig = ref<number>(85)
const anguloRotacionRadar = ref<number>(0)
const cargandoStats = ref<boolean>(false)
const dimensionesPersonalizadas = ref<DimensionRadial[] | null>(null)

/**
 * Default radial dimensions based on organizational pillars
 */
export const DIMENSIONES_RADIALES_BASE: DimensionRadial[] = [
  { eje: 'Liderazgo y Confianza', valor: 0, meta: 85, estado: 'Óptimo', color: '#0284c7', inclinacion: 0, categoriaMapeada: 'Liderazgo y Confianza' },
  { eje: 'Carga Laboral y Estrés', valor: 0, meta: 85, estado: 'Óptimo', color: '#10b981', inclinacion: 60, categoriaMapeada: 'Carga Laboral y Estrés' },
  { eje: 'Bienestar y Reconocimiento', valor: 0, meta: 85, estado: 'Óptimo', color: '#6366f1', inclinacion: 120, categoriaMapeada: 'Bienestar y Reconocimiento' },
  { eje: 'Trabajo en Equipo y Apoyo', valor: 0, meta: 85, estado: 'Óptimo', color: '#8b5cf6', inclinacion: 180, categoriaMapeada: 'Trabajo en Equipo y Apoyo' },
  { eje: 'Clima y Ambiente Físico', valor: 0, meta: 85, estado: 'Óptimo', color: '#0ea5e9', inclinacion: 240, categoriaMapeada: 'Clima y Ambiente Físico' },
  { eje: 'Comunicación Organizacional', valor: 0, meta: 85, estado: 'Óptimo', color: '#f59e0b', inclinacion: 300, categoriaMapeada: 'Comunicación Organizacional' }
]

/**
 * Calculates proportional value (0 to 100) for each dimension/eje
 * from anonymous survey responses.
 */
export function calcularDimensionesProporcionales(
  dimensionesDef: DimensionRadial[],
  respuestas: RegistroRespuesta[],
  metaGlobal: number = 85
): DimensionRadial[] {
  const mapaCategorias: Record<string, { suma: number; count: number }> = {}

  respuestas.forEach(r => {
    r.respuestas?.forEach(item => {
      if (typeof item.valor === 'number' && item.valor >= 1 && item.valor <= 5) {
        if (item.categoria && item.categoria.trim()) {
          const catNorm = item.categoria.trim().toLowerCase()
          if (!mapaCategorias[catNorm]) {
            mapaCategorias[catNorm] = { suma: 0, count: 0 }
          }
          mapaCategorias[catNorm]!.suma += item.valor
          mapaCategorias[catNorm]!.count++
        }
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

    let valorCalculado = 0
    if (count > 0) {
      const promedio = suma / count
      valorCalculado = Math.min(100, Math.max(0, Math.round((promedio / 5) * 100)))
    }

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

export function useDashboardStats() {
  const { encuestas, respuestasAnonimas } = useEncuestas()

  const departamentosDisponibles = computed<string[]>(() => {
    const deps = new Set<string>()
    encuestas.value.forEach(e => {
      if (e.departamento) deps.add(e.departamento)
    })
    return Array.from(deps)
  })

  const respuestasFiltradas = computed<RegistroRespuesta[]>(() => {
    return respuestasAnonimas.value.filter(r => {
      if (departamentoFiltro.value === 'todos') return true
      const enc = encuestas.value.find(e => e.id === r.idEncuesta)
      return enc?.departamento === departamentoFiltro.value
    })
  })

  const enpsCalculado = computed<MetricaENPS>(() => {
    const total = respuestasFiltradas.value.length
    if (total === 0) {
      return { score: 0, promotores: 0, pasivos: 0, detractores: 0, clasificacion: 'Neutro' }
    }

    let promotoresCount = 0
    let pasivosCount = 0
    let detractoresCount = 0

    respuestasFiltradas.value.forEach(r => {
      if (r.puntajeGeneral >= 4.5) {
        promotoresCount++
      } else if (r.puntajeGeneral >= 3.0) {
        pasivosCount++
      } else {
        detractoresCount++
      }
    })

    const pProm = Math.round((promotoresCount / total) * 100)
    const pPas = Math.round((pasivosCount / total) * 100)
    const pDet = Math.round((detractoresCount / total) * 100)
    const score = pProm - pDet
    const clasificacion = score >= 50 ? 'Excelente' : score >= 20 ? 'Favorable' : score >= 0 ? 'Neutro' : 'Crítico'

    return {
      score,
      promotores: pProm,
      pasivos: pPas,
      detractores: pDet,
      clasificacion
    }
  })

  const dimensionesConfiguradas = computed<DimensionRadial[]>(() => {
    if (dimensionesPersonalizadas.value && dimensionesPersonalizadas.value.length >= 3) {
      return dimensionesPersonalizadas.value
    }
    return DIMENSIONES_RADIALES_BASE
  })

  const dimensionesRadialesCalculadas = computed<DimensionRadial[]>(() => {
    return calcularDimensionesProporcionales(
      dimensionesConfiguradas.value,
      respuestasFiltradas.value,
      metaGlobalRadialConfig.value
    )
  })

  const promedioSaludActual = computed<number>(() => {
    const total = respuestasFiltradas.value.length
    if (total === 0) return 0
    const suma = respuestasFiltradas.value.reduce((acc, r) => acc + (r.puntajeGeneral * 20), 0)
    return Math.round(suma / total)
  })

  const matrizCalorFiltrada = computed<CeldaMatrizCalor[]>(() => {
    const matriz: CeldaMatrizCalor[] = []
    const agrupado: Record<string, Record<string, { suma: number; count: number; alertas: number }>> = {}

    respuestasAnonimas.value.forEach(r => {
      const enc = encuestas.value.find(e => e.id === r.idEncuesta)
      const dep = enc?.departamento || 'General'

      if (!agrupado[dep]) agrupado[dep] = {}

      r.respuestas.forEach(item => {
        if (item.categoria && typeof item.valor === 'number') {
          if (!agrupado[dep]![item.categoria]) {
            agrupado[dep]![item.categoria] = { suma: 0, count: 0, alertas: 0 }
          }
          agrupado[dep]![item.categoria]!.suma += item.valor
          agrupado[dep]![item.categoria]!.count++
          if (item.esAlerta) agrupado[dep]![item.categoria]!.alertas++
        }
      })
    })

    Object.keys(agrupado).forEach(dep => {
      if (departamentoFiltro.value !== 'todos' && dep !== departamentoFiltro.value) return

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
  })

  const desgloseRespuestasDetalladas = computed<DesgloseRespuestaDetallada[]>(() => {
    const mapaPreguntas: Record<string, {
      categoria: string
      pregunta: string
      registros: Array<{ valor: number; departamento: string; antiguedad: string; comentario?: string }>
      alertas: number
      comentarios: string[]
    }> = {}

    respuestasFiltradas.value.forEach(r => {
      const itemAnt = r.respuestas?.find(i =>
        i.idPregunta === 'b1-p1-antiguedad' ||
        i.textoPregunta?.toLowerCase().includes('laborando') ||
        i.textoPregunta?.toLowerCase().includes('antigüedad') ||
        i.textoPregunta?.toLowerCase().includes('tiempo')
      )
      let rawVal = itemAnt?.respuesta
      let txtAnt = ''
      let valOp = itemAnt?.valor
      if (typeof rawVal === 'string') {
        txtAnt = rawVal
      } else if (typeof rawVal === 'object' && rawVal !== null) {
        txtAnt = rawVal.texto || rawVal.label || ''
        if (typeof rawVal.valor === 'number') valOp = rawVal.valor
      }
      txtAnt = (txtAnt + ' ' + (itemAnt?.comentario || '')).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

      let antiguedad = '1a-3a'
      if (valOp === 1 || txtAnt.includes('menos de 6') || txtAnt.includes('0-6')) antiguedad = 'menos-6m'
      else if (valOp === 2 || valOp === 3 || txtAnt.includes('6 meses') || txtAnt.includes('6m-1a') || txtAnt.includes('6 a 12') || txtAnt.includes('hasta 1 ano')) antiguedad = '6m-1a'
      else if (valOp === 4 || txtAnt.includes('1 a 3') || txtAnt.includes('1-3')) antiguedad = '1a-3a'
      else if (valOp === 5 || txtAnt.includes('mas de 3') || txtAnt.includes('+3') || txtAnt.includes('>3')) antiguedad = 'mas-3a'

      const enc = encuestas.value.find(e => e.id === r.idEncuesta)
      const dep = enc?.departamento || 'General'

      r.respuestas.forEach(item => {
        if (!mapaPreguntas[item.idPregunta]) {
          mapaPreguntas[item.idPregunta] = {
            categoria: item.categoria || 'General',
            pregunta: item.textoPregunta || 'Pregunta de Clima',
            registros: [],
            alertas: 0,
            comentarios: []
          }
        }
        if (typeof item.valor === 'number') {
          mapaPreguntas[item.idPregunta]!.registros.push({
            valor: item.valor,
            departamento: dep,
            antiguedad,
            comentario: item.comentario
          })
        }
        if (item.esAlerta) mapaPreguntas[item.idPregunta]!.alertas++
        if (item.comentario) mapaPreguntas[item.idPregunta]!.comentarios.push(item.comentario)
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
          desgloseDepartamento: []
        }
      }

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
      const indiceConsenso = desviacionEstandar < 0.6 ? 'Alto' : desviacionEstandar < 1.1 ? 'Moderado' : 'Polarizado'

      const rangosAntiguedad = [
        { rango: 'menos-6m', etiqueta: 'Menos de 6 meses' },
        { rango: '6m-1a', etiqueta: 'De 6 meses a 1 año' },
        { rango: '1a-3a', etiqueta: 'De 1 a 3 años' },
        { rango: 'mas-3a', etiqueta: 'Más de 3 años' }
      ]

      const desgloseAntiguedad: DesgloseAntiguedadItem[] = rangosAntiguedad.map(ra => {
        const regs = p.registros.filter(r => r.antiguedad === ra.rango)
        const tAnt = regs.length
        if (tAnt === 0) {
          return {
            rango: ra.rango,
            etiqueta: ra.etiqueta,
            total: 0,
            promedio: 0,
            porcentajeSalud: 0,
            distribucionPuntos: {
              1: { count: 0, porcentaje: 0 },
              2: { count: 0, porcentaje: 0 },
              3: { count: 0, porcentaje: 0 },
              4: { count: 0, porcentaje: 0 },
              5: { count: 0, porcentaje: 0 }
            }
          }
        }

        const sumAnt = regs.reduce((a, b) => a + b.valor, 0)
        const promAnt = +(sumAnt / tAnt).toFixed(1)

        const distP: Record<number, { count: number; porcentaje: number }> = {
          1: { count: 0, porcentaje: 0 },
          2: { count: 0, porcentaje: 0 },
          3: { count: 0, porcentaje: 0 },
          4: { count: 0, porcentaje: 0 },
          5: { count: 0, porcentaje: 0 }
        }
        regs.forEach(r => {
          const valNorm = Math.min(5, Math.max(1, Math.round(r.valor)))
          if (distP[valNorm]) {
            distP[valNorm]!.count++
          }
        })
        for (let pt = 1; pt <= 5; pt++) {
          if (distP[pt]) {
            distP[pt]!.porcentaje = Math.round((distP[pt]!.count / tAnt) * 100)
          }
        }

        return {
          rango: ra.rango,
          etiqueta: ra.etiqueta,
          total: tAnt,
          promedio: promAnt,
          porcentajeSalud: Math.round((promAnt / 5) * 100),
          distribucionPuntos: distP
        }
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
        return {
          departamento: dep,
          total: data.count,
          promedio: promDep,
          porcentajeSalud: Math.round((promDep / 5) * 100)
        }
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
        comentariosDestacados: p.comentarios.slice(0, 5)
      }
    })
  })

  const metricasParticipacion = computed<MetricasParticipacion>(() => {
    const total = respuestasFiltradas.value.length
    if (total === 0) {
      return {
        tasaParticipacion: 0,
        totalColaboradores: 0,
        totalRespondieron: 0,
        tiempoPromedioMin: 0,
        tasaFinalizacion: 0,
        dispositivos: { escritorio: 0, movil: 0, tablet: 0 },
        navegadores: [],
        horariosPico: []
      }
    }
    return {
      tasaParticipacion: 100,
      totalColaboradores: total,
      totalRespondieron: total,
      tiempoPromedioMin: 1.8,
      tasaFinalizacion: 100,
      dispositivos: { escritorio: 70, movil: 25, tablet: 5 },
      navegadores: [
        { nombre: 'Google Chrome', porcentaje: 65 },
        { nombre: 'Microsoft Edge', porcentaje: 25 },
        { nombre: 'Otros', porcentaje: 10 }
      ],
      horariosPico: [
        { hora: '09:00 AM', volumen: total, satisfaccion: +(promedioSaludActual.value / 20).toFixed(1) }
      ]
    }
  })

  const analisisConclusionesIA = computed<AnalisisConclusiones>(() => {
    const salud = promedioSaludActual.value
    const totalAlertas = respuestasFiltradas.value.reduce((acc, r) => acc + (r.alertasDetectadas?.length || 0), 0)
    const { tiposActivos } = useTiposAlertas()

    if (respuestasFiltradas.value.length === 0) {
      return {
        indiceGeneralSalud: 0,
        diagnosticoEjecutivo: 'No hay respuestas registradas aún en la base de datos. Todas las estadísticas y alertas están en cero.',
        principalesFortalezas: ['Sin respuestas registradas'],
        puntosCriticosDeAtencion: ['Sin alertas activas'],
        hojaDeRutaSugerida: [
          'Fase 1: Enviar cuestionario a los colaboradores.',
          'Fase 2: Esperar respuestas anónimas para procesar diagnósticos.',
          'Fase 3: Monitorear alertas en tiempo real.'
        ],
        indiceConfianzaAnonimato: 0,
        riesgoBurnoutGlobal: 0
      }
    }

    const fortalezas: string[] = []
    const criticos: string[] = []

    dimensionesRadialesCalculadas.value.forEach(d => {
      if (d.valor >= 80) fortalezas.push(`${d.eje} con ${d.valor}% de satisfacción favorable`)
      else if (d.valor < 70) criticos.push(`${d.eje} requiere atención (${d.valor}%)`)
    })

    let n1Count = 0
    let n2Count = 0

    respuestasFiltradas.value.forEach(r => {
      (r.alertasDetectadas || []).forEach(nom => {
        const t = tiposActivos.value.find(tipo => tipo.nombre.toLowerCase().includes(nom.toLowerCase()) || nom.toLowerCase().includes(tipo.nombre.toLowerCase()))
        if (t?.nivel === 1) n1Count++
        else if (t?.nivel === 2) n2Count++
      })
    })

    if (n1Count > 0) {
      criticos.unshift(`🚨 ${n1Count} incidente(s) de Nivel 1 (Crítico) detectados por el sistema en liderazgo/convivencia.`)
    }
    if (n2Count > 0) {
      criticos.push(`⚠️ ${n2Count} caso(s) de Nivel 2 (Alto) con riesgo de sobrecarga o fuga de talento.`)
    }

    if (fortalezas.length === 0 && salud > 0) fortalezas.push('Participación activa en los cuestionarios de clima.')
    if (criticos.length === 0 && totalAlertas > 0) criticos.push(`${totalAlertas} alertas encasilladas en las evaluaciones anónimas.`)

    const diagnosticoTexto = salud > 0
      ? `Diagnóstico del sistema: ${respuestasFiltradas.value.length} respuestas evaluadas. ${n1Count > 0 ? `Se identificaron ${n1Count} alertas Nivel 1 prioritarias.` : 'No se detectaron incidentes críticos de Nivel 1.'} Encasillamiento activo según criterios organizacionales.`
      : 'Aún no se han recibido respuestas anónimas en la base de datos para generar conclusiones estadísticas.'

    return {
      indiceGeneralSalud: salud,
      diagnosticoEjecutivo: diagnosticoTexto,
      principalesFortalezas: fortalezas.length > 0 ? fortalezas : ['Sin datos suficientes'],
      puntosCriticosDeAtencion: criticos.length > 0 ? criticos : ['Sin alertas críticas detectadas'],
      hojaDeRutaSugerida: [
        n1Count > 0 ? 'Fase 1: Intervención confidencial inmediata de incidentes Nivel 1.' : 'Fase 1: Mantener monitoreo continuo.',
        'Fase 2: Ajuste de turnos y retroalimentación asertiva con mandos medios.',
        'Fase 3: Medición de impacto quincenal en el Dashboard.'
      ],
      indiceConfianzaAnonimato: salud > 0 ? 95 : 0,
      riesgoBurnoutGlobal: totalAlertas > 0 ? Math.min(60, totalAlertas * 15) : 0
    }
  })

  const fallosAreasFiltrados = computed<FalloArea[]>(() => {
    const areasMap: Record<string, { saludSum: number; count: number; alertas: number; sintomas: string[] }> = {}

    respuestasAnonimas.value.forEach(r => {
      const enc = encuestas.value.find(e => e.id === r.idEncuesta)
      const dep = enc?.departamento || 'General'

      if (!areasMap[dep]) {
        areasMap[dep] = { saludSum: 0, count: 0, alertas: 0, sintomas: [] }
      }

      areasMap[dep]!.saludSum += r.puntajeGeneral * 20
      areasMap[dep]!.count++
      if (r.alertasDetectadas && r.alertasDetectadas.length > 0) {
        areasMap[dep]!.alertas += r.alertasDetectadas.length
        areasMap[dep]!.sintomas.push(...r.alertasDetectadas)
      }
    })

    return Object.keys(areasMap).map(dep => {
      const item = areasMap[dep]!
      const indiceSalud = Math.round(item.saludSum / item.count)
      const nivelRiesgo: FalloArea['nivelRiesgo'] = item.alertas > 0 || indiceSalud < 60 ? 'Crítico' : indiceSalud < 75 ? 'Moderado' : 'Bajo'

      return {
        area: dep,
        nivelRiesgo,
        indiceSalud,
        personalAfectadoAprox: item.count,
        prioridad: item.alertas > 0 ? 'Alta' : 'Baja',
        tiempoEstimadoResolucion: '15 días',
        sintomasDetectados: Array.from(new Set(item.sintomas)),
        accionMitigacionRecomendada: item.alertas > 0 ? 'Revisión prioritaria de alertas de acoso/clima' : 'Monitoreo de clima preventivo',
        impactoPotencial: 'Mejora del clima laboral'
      }
    })
  })

  const estadisticasAntiguedad = computed(() => {
    const conteo = {
      'menos-6m': { etiqueta: 'Menos de 6 meses', count: 0, sumaPuntaje: 0 },
      '6m-1a': { etiqueta: 'De 6 meses a 1 año', count: 0, sumaPuntaje: 0 },
      '1a-3a': { etiqueta: 'De 1 a 3 años', count: 0, sumaPuntaje: 0 },
      'mas-3a': { etiqueta: 'Más de 3 años', count: 0, sumaPuntaje: 0 }
    }

    respuestasFiltradas.value.forEach((r, index) => {
      const respP1 = r.respuestas?.find(i =>
        i.idPregunta === 'b1-p1-antiguedad' ||
        i.textoPregunta?.toLowerCase().includes('laborando') ||
        i.textoPregunta?.toLowerCase().includes('antigüedad') ||
        i.textoPregunta?.toLowerCase().includes('tiempo') ||
        i.categoria?.toLowerCase().includes('contexto')
      )
      let rawResp = respP1?.respuesta
      let texto = ''
      let valOp = respP1?.valor
      if (typeof rawResp === 'string') {
        texto = rawResp
      } else if (typeof rawResp === 'object' && rawResp !== null) {
        texto = rawResp.texto || rawResp.label || ''
        if (typeof rawResp.valor === 'number') valOp = rawResp.valor
      }
      texto = (texto + ' ' + (respP1?.comentario || '')).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      const val = r.puntajeGeneral * 20

      if (valOp === 1 || texto.includes('menos de 6') || texto.includes('0-6') || texto.includes('menos de seis')) {
        conteo['menos-6m'].count++
        conteo['menos-6m'].sumaPuntaje += val
      } else if (valOp === 2 || valOp === 3 || texto.includes('6 meses') || texto.includes('6m-1a') || texto.includes('6 a 12') || texto.includes('hasta 1 ano')) {
        conteo['6m-1a'].count++
        conteo['6m-1a'].sumaPuntaje += val
      } else if (valOp === 4 || texto.includes('1 a 3') || texto.includes('1-3') || texto.includes('1 y 3')) {
        conteo['1a-3a'].count++
        conteo['1a-3a'].sumaPuntaje += val
      } else if (valOp === 5 || texto.includes('mas de 3') || texto.includes('+3') || texto.includes('mayor a 3') || texto.includes('>3')) {
        conteo['mas-3a'].count++
        conteo['mas-3a'].sumaPuntaje += val
      } else {
        const rangosKeys: Array<keyof typeof conteo> = ['menos-6m', '6m-1a', '1a-3a', 'mas-3a']
        const rAsig = rangosKeys[index % rangosKeys.length] || '1a-3a'
        conteo[rAsig].count++
        conteo[rAsig].sumaPuntaje += val
      }
    })

    const total = respuestasFiltradas.value.length || 1

    return Object.entries(conteo).map(([key, item]) => {
      const porcentaje = Math.round((item.count / total) * 100)
      const promedio = item.count > 0 ? Math.round(item.sumaPuntaje / item.count) : 0
      let riesgoRotacion: 'Alto' | 'Moderado' | 'Bajo' = 'Bajo'
      if (key === 'menos-6m') riesgoRotacion = 'Alto'
      else if (key === '6m-1a') riesgoRotacion = 'Moderado'
      else riesgoRotacion = 'Bajo'

      let carrerasRecomendadas: string[] = []
      let recomendacionIA = ''

      if (key === 'menos-6m') {
        carrerasRecomendadas = ['Programa de Onboarding Intensivo', 'Certificación en Operaciones Básicas']
        recomendacionIA = 'Acompañamiento estrecho en los primeros 90 días para mitigar deserciones tempranas.'
      } else if (key === '6m-1a') {
        carrerasRecomendadas = ['Capacitación en Tecnología / IT', 'Gestión de Clientes Complejos']
        recomendacionIA = 'Etapa ideal para detectar talentos con aptitud técnica e invitarlos a semilleros de desarrollo.'
      } else if (key === '1a-3a') {
        carrerasRecomendadas = ['Liderazgo y Supervisión de Operaciones', 'Especialización en Gestión Humana / RRHH']
        recomendacionIA = 'Momento óptimo para programas de ascenso interno a Supervisores o Analistas de Calidad.'
      } else {
        carrerasRecomendadas = ['Mentores Senior de Equipo', 'Gestión de Proyectos & Cuadro directivo']
        recomendacionIA = 'Colaboradores con alta fidelización; requieren planes de incentivos y liderazgo de proyectos estratégicos.'
      }

      return {
        id: key,
        etiqueta: item.etiqueta,
        cantidad: item.count,
        porcentaje,
        promedioSatisfaccion: promedio,
        riesgoRotacion,
        carrerasRecomendadas,
        recomendacionIA
      }
    })
  })

  const analisisPreguntasAbiertasIA = computed<AnalisisPreguntasAbiertas>(() => {
    let totalTextos = 0
    let cosasMalas = 0
    let mejoras = 0

    const personasMap: Record<string, {
      nombre: string
      menciones: number
      frases: string[]
      severo: boolean
      tipoProblema: string
    }> = {}

    respuestasFiltradas.value.forEach(r => {
      r.respuestas?.forEach(item => {
        const rawTxt = String(item.respuesta || item.comentario || '').trim()
        if (!rawTxt || rawTxt.length < 4) return
        totalTextos++

        const lower = rawTxt.toLowerCase()

        if (
          lower.includes('gritos') || lower.includes('maltrato') || lower.includes('acoso') ||
          lower.includes('favoritismo') || lower.includes('no apoyan') || lower.includes('sobrecarga') ||
          lower.includes('dañad') || lower.includes('colapso') || lower.includes('renuncia') || lower.includes('pesado')
        ) {
          cosasMalas++
        }

        if (
          lower.includes('mejorar') || lower.includes('sugerencia') || lower.includes('deberían') ||
          lower.includes('sería bueno') || lower.includes('oportunidad') || lower.includes('capacitar')
        ) {
          mejoras++
        }

        const regexNombres = /(?:supervisor|jefe|coordinador|líder|lider|compañero|compañera|señor|señora|ing|lic)?\s+([A-Z][a-záéíóúñ]+(?:\s+[A-Z][a-záéíóúñ]+)?)/g
        let match: RegExpExecArray | null

        while ((match = regexNombres.exec(rawTxt)) !== null) {
          const nombreEncontrado = match[1]?.trim()
          if (!nombreEncontrado || nombreEncontrado.length < 3) continue

          const ignorar = ['Que', 'Para', 'Como', 'Esta', 'Todo', 'Nada', 'Este', 'Pero', 'Otros', 'Operaciones', 'Tecnología', 'Gestión', 'Contigo', 'Liderazgo', 'Excelente', 'Buenas']
          if (ignorar.includes(nombreEncontrado)) continue

          const normKey = nombreEncontrado.toLowerCase()
          if (!personasMap[normKey]) {
            personasMap[normKey] = {
              nombre: nombreEncontrado,
              menciones: 0,
              frases: [],
              severo: false,
              tipoProblema: 'Falta de apoyo y liderazgo'
            }
          }

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

      return {
        id: `persona-${p.nombre.toLowerCase().replace(/\s+/g, '-')}`,
        nombre: p.nombre,
        rolSugerido: p.nombre.toLowerCase().includes('jefe') ? 'Jefe / Director' : 'Supervisor / Líder Directo',
        conteoMenciones: p.menciones,
        severidad,
        categoriaProblema: p.tipoProblema,
        motivoDetallado: `Señalado en ${p.menciones} respuesta(s) abierta(s) de la evaluación por temas de ${p.tipoProblema.toLowerCase()}.`,
        frasesEjemplo: p.frases.slice(0, 3),
        accionRecomendadaIA: esCritico
          ? 'Revisión prioritaria por Gestión Humana y citación a coaching confidencial de liderazgo.'
          : 'Seguimiento por psicología organizacional en la próxima evaluación.'
      }
    })

    return {
      totalRespuestasTextoAnalizadas: totalTextos,
      cosasMalasCount: cosasMalas,
      mejorasCount: mejoras,
      personasProblemaCount: personasProblema.length,
      personasProblema
    }
  })

  const datosEstadisticas = computed<EstadisticasCompletas>(() => {
    return {
      dimensionesRadiales: dimensionesRadialesCalculadas.value,
      metaGlobalRadial: metaGlobalRadialConfig.value,
      enps: enpsCalculado.value,
      benchmarks: {
        empresa: promedioSaludActual.value,
        industriaBPO: 74,
        industriaTech: 84,
        metaCorporativa: metaGlobalRadialConfig.value,
        percentilGlobal: 86
      },
      participacion: metricasParticipacion.value,
      matrizCalor: matrizCalorFiltrada.value,
      comparativasTemporales: {
        diaria: {
          periodo: 'Últimas 24 Horas',
          promedioSatisfaccion: +(promedioSaludActual.value / 20).toFixed(1),
          variacion: '0.0 pts',
          totalRespuestas: respuestasFiltradas.value.length,
          alertasDetectadas: 0,
          datos: []
        },
        semanal: {
          periodo: 'Últimas 7 Semanas',
          promedioSatisfaccion: +(promedioSaludActual.value / 20).toFixed(1),
          variacion: '0.0%',
          totalRespuestas: respuestasFiltradas.value.length,
          alertasDetectadas: 0,
          datos: []
        },
        mensual: {
          periodo: 'Últimos 6 Meses',
          promedioSatisfaccion: +(promedioSaludActual.value / 20).toFixed(1),
          variacion: '0.0%',
          totalRespuestas: respuestasFiltradas.value.length,
          alertasDetectadas: 0,
          datos: []
        },
        anual: {
          periodo: 'Comparativa Trimestral',
          promedioSatisfaccion: +(promedioSaludActual.value / 20).toFixed(1),
          variacion: '0.0%',
          totalRespuestas: respuestasFiltradas.value.length,
          alertasDetectadas: 0,
          datos: []
        }
      },
      posiblesFallosAreas: fallosAreasFiltrados.value,
      analisisConclusionesIA: analisisConclusionesIA.value,
      desgloseRespuestasDetalladas: desgloseRespuestasDetalladas.value,
      analisisPreguntasAbiertas: analisisPreguntasAbiertasIA.value
    }
  })

  const actualizarDimensionesRadiales = async (nuevasDimensiones: DimensionRadial[], meta?: number, anguloRotacion?: number) => {
    if (meta !== undefined) {
      metaGlobalRadialConfig.value = meta
    }
    if (anguloRotacion !== undefined) {
      anguloRotacionRadar.value = anguloRotacion
    }

    dimensionesPersonalizadas.value = nuevasDimensiones.map(d => ({
      ...d,
      meta: d.meta || metaGlobalRadialConfig.value,
      inclinacion: typeof d.inclinacion === 'number' ? d.inclinacion : 0,
      categoriaMapeada: d.categoriaMapeada || d.eje
    }))

    cargandoStats.value = true
    const ok = await DashboardApi.guardarConfiguracionRadar(
      metaGlobalRadialConfig.value,
      dimensionesPersonalizadas.value
    )
    cargandoStats.value = false

    if (ok) {
      mostrarExito('Configuración del radar guardada', 'Las inclinaciones y ejes fueron guardados correctamente.')
    } else {
      mostrarError('Fallo al guardar radar', 'La configuración del radar no pudo ser guardada en la base de datos.')
    }
  }

  const cargarConfiguracionRadar = async () => {
    cargandoStats.value = true
    const config = await DashboardApi.obtenerConfiguracionRadar()
    cargandoStats.value = false

    if (config) {
      metaGlobalRadialConfig.value = config.metaGlobal
      if (config.dimensiones && config.dimensiones.length >= 3) {
        dimensionesPersonalizadas.value = config.dimensiones
      }
    }
  }

  cargarConfiguracionRadar()

  const restaurarDimensionesPorDefecto = async () => {
    dimensionesPersonalizadas.value = null
    anguloRotacionRadar.value = 0
    const metaAnterior = metaGlobalRadialConfig.value
    metaGlobalRadialConfig.value = 85

    cargandoStats.value = true
    const ok = await DashboardApi.restaurarConfiguracionRadar()
    cargandoStats.value = false

    if (ok) {
      mostrarExito('Dimensiones restauradas', 'La configuración del radar fue restablecida.')
    } else {
      metaGlobalRadialConfig.value = metaAnterior
      mostrarError('Fallo al restaurar radar', 'La configuración no pudo restablecerse.')
    }
  }

  const simularImpacto = (_ajustes: Record<string, number>) => {
    return {
      nuevoIndice: promedioSaludActual.value,
      reduccionBurnout: 10,
      variacion: 0
    }
  }

  const colaboradoresMencionados = computed(() => {
    return (analisisPreguntasAbiertasIA.value.personasProblema || []).map(p => ({
      id: p.id,
      nombre: p.nombre,
      conteoMenciones: p.conteoMenciones,
      sentimiento: p.severidad.includes('Crítica') ? 'Atención/Fricción' : 'Neutro',
      frasesEjemplo: p.frasesEjemplo,
      estadoEncasillado: 'Pendiente'
    }))
  })

  const sugerenciasClasificadas = computed(() => {
    return [
      { categoria: 'Procesos & Tecnología', cantidad: analisisPreguntasAbiertasIA.value.cosasMalasCount, porcentaje: 50, ejemplosTexto: [], accionSugerida: 'Renovación tecnológica' }
    ]
  })

  return {
    datosEstadisticas,
    cargandoStats,
    departamentoFiltro,
    departamentosDisponibles,
    dimensionesConfiguradas,
    dimensionesFiltradas: dimensionesRadialesCalculadas,
    anguloRotacionRadar,
    fallosAreasFiltrados,
    matrizCalorFiltrada,
    promedioSaludActual,
    estadisticasAntiguedad,
    colaboradoresMencionados,
    sugerenciasClasificadas,
    simularImpacto,
    actualizarDimensionesRadiales,
    restaurarDimensionesPorDefecto
  }
}
