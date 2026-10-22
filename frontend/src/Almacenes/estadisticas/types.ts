/**
 * Propósito: centraliza todas las interfaces y contratos del dominio de métricas
y análisis de clima para que el resto de la aplicación consuma tipos compartidos.
 * Conexiones: se usa desde `useEstadisticas.ts`, componentes del Dashboard y servicios
de exportación de informes.
 */

export interface DimensionRadial {
  eje: string
  valor: number
  meta: number
  estado: 'Óptimo' | 'Riesgo Moderado' | 'Atención' | 'Crítico'
  color: string
  inclinacion?: number
  categoriaMapeada?: string
  totalRespuestas?: number
  benchmarkIndustria?: number
  descripcion?: string
}

export interface PuntoComparativa {
  etiqueta: string
  valor: number
  respuestas: number
  benchmark?: number
}

export interface PeriodoComparativa {
  periodo: string
  promedioSatisfaccion: number
  variacion: string
  totalRespuestas: number
  alertasDetectadas: number
  datos: PuntoComparativa[]
}

export interface FalloArea {
  area: string
  nivelRiesgo: 'Bajo' | 'Moderado' | 'Atención' | 'Crítico'
  indiceSalud: number
  personalAfectadoAprox?: number
  sintomasDetectados: string[]
  accionMitigacionRecomendada: string
  impactoPotencial: string
  tiempoEstimadoResolucion?: string
  prioridad: 'Alta' | 'Media' | 'Baja'
}

export interface AnalisisConclusiones {
  indiceGeneralSalud: number
  diagnosticoEjecutivo: string
  principalesFortalezas: string[]
  puntosCriticosDeAtencion: string[]
  hojaDeRutaSugerida: string[]
  indiceConfianzaAnonimato: number
  riesgoBurnoutGlobal: number
}

export interface DesglosePuntajeItem {
  pts: number
  etiqueta: string
  count: number
  porcentaje: number
  color: string
}

export interface DesgloseAntiguedadItem {
  rango: string
  etiqueta: string
  total: number
  promedio: number
  porcentajeSalud: number
  distribucionPuntos: Record<number, { count: number; porcentaje: number }>
}

export interface DesgloseDepartamentoItem {
  departamento: string
  total: number
  promedio: number
  porcentajeSalud: number
}

export interface DesgloseRespuestaDetallada {
  idPregunta: string
  categoria: string
  pregunta: string
  promedio: number
  totalRespuestas: number
  esSensibleAlerta: boolean
  desviacionEstandar: number
  indiceConsenso: 'Alto' | 'Moderado' | 'Polarizado'
  distribucion: { positivas: number; neutrales: number; negativas: number }
  desglosePuntos: DesglosePuntajeItem[]
  desgloseAntiguedad: DesgloseAntiguedadItem[]
  desgloseDepartamento: DesgloseDepartamentoItem[]
  comentariosDestacados?: string[]
}

export interface CeldaMatrizCalor {
  departamento: string
  dimension: string
  puntaje: number
  porcentaje: number
  nivelRiesgo: 'Óptimo' | 'Atención' | 'Moderado' | 'Crítico'
  totalRespuestas: number
  alertaActiva: boolean
}

export interface MetricasParticipacion {
  tasaParticipacion: number
  totalColaboradores: number
  totalRespondieron: number
  tiempoPromedioMin: number
  tasaFinalizacion: number
  dispositivos: { escritorio: number; movil: number; tablet: number }
  navegadores: { nombre: string; porcentaje: number }[]
  horariosPico: { hora: string; volumen: number; satisfaccion: number }[]
}

export interface MetricaENPS {
  score: number
  promotores: number
  pasivos: number
  detractores: number
  clasificacion: 'Excelente' | 'Favorable' | 'Neutro' | 'Crítico'
}

export interface BenchmarksIndustria {
  empresa: number
  industriaBPO: number
  industriaTech: number
  metaCorporativa: number
  percentilGlobal: number
}

export interface PersonaProblemaDetectada {
  id: string
  nombre: string
  rolSugerido: string
  conteoMenciones: number
  severidad: 'Crítica (Intervención RRHH)' | 'Alta (Revisión Liderazgo)' | 'Moderada'
  categoriaProblema: string
  motivoDetallado: string
  frasesEjemplo: string[]
  accionRecomendadaIA: string
}

export interface AnalisisPreguntasAbiertas {
  totalRespuestasTextoAnalizadas: number
  cosasMalasCount: number
  mejorasCount: number
  personasProblemaCount: number
  personasProblema: PersonaProblemaDetectada[]
}

export interface EstadisticasCompletas {
  dimensionesRadiales: DimensionRadial[]
  metaGlobalRadial: number
  enps: MetricaENPS
  benchmarks: BenchmarksIndustria
  participacion: MetricasParticipacion
  matrizCalor: CeldaMatrizCalor[]
  comparativasTemporales: {
    diaria: PeriodoComparativa
    semanal: PeriodoComparativa
    mensual: PeriodoComparativa
    anual: PeriodoComparativa
  }
  posiblesFallosAreas: FalloArea[]
  analisisConclusionesIA: AnalisisConclusiones
  desgloseRespuestasDetalladas: DesgloseRespuestaDetallada[]
  analisisPreguntasAbiertas: AnalisisPreguntasAbiertas
}
