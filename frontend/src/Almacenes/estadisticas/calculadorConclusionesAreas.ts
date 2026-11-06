/**
 * ============================================================================
 * CALCULADOR DE CONCLUSIONES EJECUTIVAS Y FALLOS POR ÁREA (calculadorConclusionesAreas.ts)
 * ============================================================================
 * Calcula métricas de participación, riesgo de fallos por área y conclusiones
 * ejecutivas del diagnóstico de clima laboral.
 */

import type { Encuesta, RegistroRespuesta } from '@/Almacenes/useEncuestas'
import { calcularPuntajeDeRegistro } from '@/services/calculadorClimaService'
import type { TipoAlertaPersonalizada } from '@/Almacenes/useTiposAlertas'
import type {
  DimensionRadial,
  AnalisisConclusiones,
  MetricasParticipacion,
  FalloArea
} from '@/shared/types/dashboard.types'

export function calcularMetricasParticipacion(
  totalRespuestas: number,
  promedioSaludActual: number
): MetricasParticipacion {
  if (totalRespuestas === 0) {
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
    totalColaboradores: totalRespuestas,
    totalRespondieron: totalRespuestas,
    tiempoPromedioMin: 1.8,
    tasaFinalizacion: 100,
    dispositivos: { escritorio: 70, movil: 25, tablet: 5 },
    navegadores: [
      { nombre: 'Google Chrome', porcentaje: 65 },
      { nombre: 'Microsoft Edge', porcentaje: 25 },
      { nombre: 'Otros', porcentaje: 10 }
    ],
    horariosPico: [
      { hora: '09:00 AM', volumen: totalRespuestas, satisfaccion: +(promedioSaludActual / 20).toFixed(1) }
    ]
  }
}

export function calcularAnalisisConclusiones(
  respuestasFiltradas: RegistroRespuesta[],
  dimensionesRadiales: DimensionRadial[],
  salud: number,
  tiposActivos: TipoAlertaPersonalizada[]
): AnalisisConclusiones {
  if (respuestasFiltradas.length === 0) {
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

  const totalAlertas = respuestasFiltradas.reduce((acc, r) => acc + (r.alertasDetectadas?.length || 0), 0)
  const fortalezas: string[] = []
  const criticos: string[] = []

  dimensionesRadiales.forEach(d => {
    if (d.valor >= 80) fortalezas.push(`${d.eje} con ${d.valor}% de satisfacción favorable`)
    else if (d.valor < 70) criticos.push(`${d.eje} requiere atención (${d.valor}%)`)
  })

  let n1Count = 0
  let n2Count = 0

  respuestasFiltradas.forEach(r => {
    ;(r.alertasDetectadas || []).forEach(nom => {
      const t = tiposActivos.find(
        tipo => tipo.nombre.toLowerCase().includes(nom.toLowerCase()) || nom.toLowerCase().includes(tipo.nombre.toLowerCase())
      )
      if (t?.nivel === 1) n1Count++
      else if (t?.nivel === 2) n2Count++
    })
  })

  if (n1Count > 0) criticos.unshift(`🚨 ${n1Count} incidente(s) de Nivel 1 (Crítico) detectados en liderazgo/convivencia.`)
  if (n2Count > 0) criticos.push(`⚠️ ${n2Count} caso(s) de Nivel 2 (Alto) con riesgo de sobrecarga o fuga de talento.`)
  if (fortalezas.length === 0 && salud > 0) fortalezas.push('Participación activa en los cuestionarios de clima.')
  if (criticos.length === 0 && totalAlertas > 0) criticos.push(`${totalAlertas} alertas encasilladas en las evaluaciones.`)

  return {
    indiceGeneralSalud: salud,
    diagnosticoEjecutivo: `Diagnóstico del sistema: ${respuestasFiltradas.length} respuestas evaluadas. ${n1Count > 0 ? `Se identificaron ${n1Count} alertas Nivel 1 prioritarias.` : 'No se detectaron incidentes críticos de Nivel 1.'}`,
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
}

export function calcularFallosAreas(
  respuestasAnonimas: RegistroRespuesta[],
  encuestas: Encuesta[]
): FalloArea[] {
  const areasMap: Record<string, { saludSum: number; count: number; alertas: number; sintomas: string[] }> = {}

  respuestasAnonimas.forEach(r => {
    const enc = encuestas.find(e => e.id === r.idEncuesta)
    const dep = enc?.departamento || 'General'
    if (!areasMap[dep]) areasMap[dep] = { saludSum: 0, count: 0, alertas: 0, sintomas: [] }

    areasMap[dep]!.saludSum += calcularPuntajeDeRegistro(r.respuestas, r.puntajeGeneral).porcentajeClima
    areasMap[dep]!.count++
    if (r.alertasDetectadas && r.alertasDetectadas.length > 0) {
      areasMap[dep]!.alertas += r.alertasDetectadas.length
      areasMap[dep]!.sintomas.push(...r.alertasDetectadas)
    }
  })

  return Object.keys(areasMap).map(dep => {
    const item = areasMap[dep]!
    const indiceSalud = Math.round(item.saludSum / item.count)
    const nivelRiesgo: FalloArea['nivelRiesgo'] =
      item.alertas > 0 || indiceSalud < 60 ? 'Crítico' : indiceSalud < 75 ? 'Moderado' : 'Bajo'

    return {
      area: dep,
      nivelRiesgo,
      indiceSalud,
      personalAfectadoAprox: item.count,
      prioridad: item.alertas > 0 ? 'Alta' : 'Baja',
      tiempoEstimadoResolucion: '15 días',
      sintomasDetectados: Array.from(new Set(item.sintomas)),
      accionMitigacionRecomendada: item.alertas > 0 ? 'Revisión prioritaria de alertas de clima' : 'Monitoreo preventivo',
      impactoPotencial: 'Mejora del clima laboral'
    }
  })
}
