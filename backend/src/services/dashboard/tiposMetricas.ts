/**
 * ============================================================================
 * CONTRATOS Y TIPOS DE MÉTRICAS DEL DASHBOARD (tiposMetricas.ts)
 * ============================================================================
 * Define las interfaces de las métricas consolidadas del backend en español.
 */

export interface MetricasConsolidadasDashboard {
  idEncuesta: string
  totalRespuestas: number
  porcentajeClimaLaboral: number
  puntajePromedio: number
  enps: {
    score: number
    promotores: number
    pasivos: number
    detractores: number
    clasificacion: string
  }
  antiguedadYRetencion: {
    indiceRetencion: number
    permanenciaMediaAnos: number
    distribucion: {
      menos6m: { count: number; porcentaje: number }
      de6ma1a: { count: number; porcentaje: number }
      de1aa3a: { count: number; porcentaje: number }
      mas3a: { count: number; porcentaje: number }
    }
  }
  dimensionesRadar: Array<{
    eje: string
    valor: number
    meta: number
    estado: string
    color: string
    totalRespuestas: number
  }>
  preguntasMayorMalestar: Array<{
    idPregunta: string
    pregunta: string
    categoria: string
    promedio: number
    porcentajeRiesgo: number
    porcentajeFavorable: number
    citasDestacadas: string[]
  }>
  personasProblemaResumen: {
    totalCasosDetectados: number
    areasConConflicto: Array<{ area: string; cantidadQuejas: number }>
    nivelRiesgoConvivencia: 'Bajo' | 'Moderado' | 'Alto' | 'Crítico'
  }
}
