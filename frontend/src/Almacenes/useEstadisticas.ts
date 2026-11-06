/**
 * ============================================================================
 * RE-EXPORTADOR UNIFICADO DE ESTADÍSTICAS (useEstadisticas.ts)
 * ============================================================================
 * Elimina la duplicación de código re-exportando el almacén modular
 * useDashboardStats y los tipos compartidos del Dashboard.
 */

export type {
  DimensionRadial,
  PuntoComparativa,
  PeriodoComparativa,
  CeldaMatrizCalor,
  MetricaENPS,
  AnalisisConclusiones,
  MetricasParticipacion,
  FalloArea,
  DesglosePuntajeItem,
  DesgloseAntiguedadItem,
  DesgloseDepartamentoItem,
  DesgloseRespuestaDetallada,
  PersonaProblemaDetectada,
  AnalisisPreguntasAbiertas,
  EstadisticasCompletas
} from '@/shared/types/dashboard.types'

import { useDashboardStats, DIMENSIONES_RADIALES_BASE, calcularDimensionesProporcionales } from './useDashboardStats'

export { DIMENSIONES_RADIALES_BASE, calcularDimensionesProporcionales }
export const useEstadisticas = useDashboardStats
export default useDashboardStats
