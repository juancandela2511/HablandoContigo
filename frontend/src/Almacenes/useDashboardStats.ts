/**
 * ============================================================================
 * ALMACÉN UNIFICADO DE ESTADÍSTICAS DEL DASHBOARD (useDashboardStats.ts)
 * ============================================================================
 * Orquesta los cálculos modulares de radar, eNPS, desglose de preguntas,
 * antigüedad y análisis de comentarios abiertos con IA.
 */

import { ref, computed } from 'vue'
import { useEncuestas, type RegistroRespuesta } from '@/Almacenes/useEncuestas'
import { calcularClimaGlobalDeRespuestas } from '@/services/calculadorClimaService'
import { useTiposAlertas } from '@/Almacenes/useTiposAlertas'
import { useToast } from '@/Almacenes/useToast'
import { DashboardApi } from '@/services/dashboardApi'
import type {
  DimensionRadial,
  EstadisticasCompletas
} from '@/shared/types/dashboard.types'

import {
  DIMENSIONES_RADIALES_BASE,
  calcularDimensionesProporcionales,
  calcularENPSRespuestas,
  calcularMatrizCalor
} from './estadisticas/calculadorRadarYMatriz'
import { calcularDesgloseRespuestas } from './estadisticas/calculadorDesglosePreguntas'
import {
  calcularEstadisticasAntiguedad,
  calcularAnalisisPreguntasAbiertas
} from './estadisticas/calculadorAntiguedadYAbiertas'
import {
  calcularMetricasParticipacion,
  calcularAnalisisConclusiones,
  calcularFallosAreas
} from './estadisticas/calculadorConclusionesAreas'

export { DIMENSIONES_RADIALES_BASE, calcularDimensionesProporcionales }

const { mostrarError, mostrarExito } = useToast()

const departamentoFiltro = ref<string>('todos')
const metaGlobalRadialConfig = ref<number>(85)
const anguloRotacionRadar = ref<number>(0)
const cargandoStats = ref<boolean>(false)
const dimensionesPersonalizadas = ref<DimensionRadial[] | null>(null)
let configRadarCargada = false

export function useDashboardStats() {
  const { encuestas, respuestasAnonimas } = useEncuestas()
  const { tiposActivos } = useTiposAlertas()

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

  const enpsCalculado = computed(() => calcularENPSRespuestas(respuestasFiltradas.value))

  const dimensionesConfiguradas = computed<DimensionRadial[]>(() => {
    if (dimensionesPersonalizadas.value && dimensionesPersonalizadas.value.length >= 3) {
      return dimensionesPersonalizadas.value
    }
    return DIMENSIONES_RADIALES_BASE
  })

  const dimensionesRadialesCalculadas = computed<DimensionRadial[]>(() =>
    calcularDimensionesProporcionales(dimensionesConfiguradas.value, respuestasFiltradas.value, metaGlobalRadialConfig.value)
  )

  const promedioSaludActual = computed<number>(() =>
    calcularClimaGlobalDeRespuestas(respuestasFiltradas.value).porcentajeClima
  )

  const matrizCalorFiltrada = computed(() =>
    calcularMatrizCalor(respuestasAnonimas.value, encuestas.value, departamentoFiltro.value)
  )

  const desgloseRespuestasDetalladas = computed(() =>
    calcularDesgloseRespuestas(respuestasFiltradas.value, encuestas.value)
  )

  const metricasParticipacion = computed(() =>
    calcularMetricasParticipacion(respuestasFiltradas.value.length, promedioSaludActual.value)
  )

  const analisisConclusionesIA = computed(() =>
    calcularAnalisisConclusiones(respuestasFiltradas.value, dimensionesRadialesCalculadas.value, promedioSaludActual.value, tiposActivos.value)
  )

  const fallosAreasFiltrados = computed(() =>
    calcularFallosAreas(respuestasAnonimas.value, encuestas.value)
  )

  const estadisticasAntiguedad = computed(() =>
    calcularEstadisticasAntiguedad(respuestasFiltradas.value)
  )

  const analisisPreguntasAbiertasIA = computed(() =>
    calcularAnalisisPreguntasAbiertas(respuestasFiltradas.value)
  )

  const datosEstadisticas = computed<EstadisticasCompletas>(() => {
    const promCinco = +(promedioSaludActual.value / 20).toFixed(1)
    const totalR = respuestasFiltradas.value.length
    const periodoBase = (periodo: string, variacion: string) => ({
      periodo, promedioSatisfaccion: promCinco, variacion, totalRespuestas: totalR, alertasDetectadas: 0, datos: []
    })

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
        diaria: periodoBase('Últimas 24 Horas', '0.0 pts'),
        semanal: periodoBase('Últimas 7 Semanas', '0.0%'),
        mensual: periodoBase('Últimos 6 Meses', '0.0%'),
        anual: periodoBase('Comparativa Trimestral', '0.0%')
      },
      posiblesFallosAreas: fallosAreasFiltrados.value,
      analisisConclusionesIA: analisisConclusionesIA.value,
      desgloseRespuestasDetalladas: desgloseRespuestasDetalladas.value,
      analisisPreguntasAbiertas: analisisPreguntasAbiertasIA.value
    }
  })

  const actualizarDimensionesRadiales = async (nuevasDimensiones: DimensionRadial[], meta?: number, anguloRotacion?: number) => {
    if (meta !== undefined) metaGlobalRadialConfig.value = meta
    if (anguloRotacion !== undefined) anguloRotacionRadar.value = anguloRotacion

    dimensionesPersonalizadas.value = nuevasDimensiones.map(d => ({
      ...d,
      meta: d.meta || metaGlobalRadialConfig.value,
      inclinacion: typeof d.inclinacion === 'number' ? d.inclinacion : 0,
      categoriaMapeada: d.categoriaMapeada || d.eje
    }))

    cargandoStats.value = true
    const ok = await DashboardApi.guardarConfiguracionRadar(metaGlobalRadialConfig.value, dimensionesPersonalizadas.value)
    cargandoStats.value = false

    if (ok) mostrarExito('Configuración del radar guardada', 'Las inclinaciones y ejes fueron guardados.')
    else mostrarError('Fallo al guardar radar', 'No se pudo guardar en la base de datos.')
  }

  if (!configRadarCargada) {
    configRadarCargada = true
    DashboardApi.obtenerConfiguracionRadar().then(config => {
      if (config) {
        metaGlobalRadialConfig.value = config.metaGlobal
        if (config.dimensiones && config.dimensiones.length >= 3) {
          dimensionesPersonalizadas.value = config.dimensiones
        }
      }
    }).catch(() => {})
  }

  const restaurarDimensionesPorDefecto = async () => {
    dimensionesPersonalizadas.value = null
    anguloRotacionRadar.value = 0
    metaGlobalRadialConfig.value = 85
    const ok = await DashboardApi.restaurarConfiguracionRadar()
    if (ok) mostrarExito('Dimensiones restauradas', 'La configuración del radar fue restablecida.')
  }

  const colaboradoresMencionados = computed(() =>
    (analisisPreguntasAbiertasIA.value.personasProblema || []).map(p => ({
      id: p.id,
      nombre: p.nombre,
      conteoMenciones: p.conteoMenciones,
      sentimiento: p.severidad.includes('Crítica') ? 'Atención/Fricción' : 'Neutro',
      frasesEjemplo: p.frasesEjemplo,
      estadoEncasillado: 'Pendiente'
    }))
  )

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
    sugerenciasClasificadas: computed(() => [
      { categoria: 'Procesos & Tecnología', cantidad: analisisPreguntasAbiertasIA.value.cosasMalasCount, porcentaje: 50, ejemplosTexto: [], accionSugerida: 'Renovación tecnológica' }
    ]),
    simularImpacto: () => ({ nuevoIndice: promedioSaludActual.value, reduccionBurnout: 10, variacion: 0 }),
    actualizarDimensionesRadiales,
    restaurarDimensionesPorDefecto
  }
}
