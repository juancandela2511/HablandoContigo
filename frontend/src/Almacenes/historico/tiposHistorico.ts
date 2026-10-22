/**
 * Propósito: define los contratos de cierres históricos y comparativas.
 * Conexiones: `useHistoricoPeriodos.ts` y las vistas de reportes consumen estos tipos.
 */

export interface DesgloseBloqueHistorico {
  bloque: number
  nombre: string
  satisfaccion: number
}

export interface ConclusionPreguntaHistorica {
  idPregunta: string
  textoPregunta: string
  categoria: string
  promedio?: number
  porcentajeSatisfaccion?: number
  conclusion: string
}

export interface RegistroHistoricoPeriodo {
  id: string
  idEncuesta: string
  tituloPeriodo: string
  anio: number
  fechaCierre: string
  totalRespuestas: number
  alertasRegistradas: number
  puntajePromedio: number
  porcentajeSatisfaccion: number
  desgloseBloques: DesgloseBloqueHistorico[]
  conclusionesPreguntas?: ConclusionPreguntaHistorica[]
  cerradoPor: string
  notas?: string
  creadoEn?: string
}

export interface ComparativaPeriodosResult {
  periodoAnterior: RegistroHistoricoPeriodo | null
  tieneDatosAnteriores: boolean
  periodoActualPct: number
  periodoAnteriorPct: number | null
  diferenciaPct: number | null
  esCrecimientoPositivo: boolean
}
