/**
 * ============================================================================
 * SERVICIO CLIENTE PARA DASHBOARD BACKEND (servicioBackendDashboard.ts)
 * ============================================================================
 * Consume los endpoints analíticos procesados en el backend Node.js + PostgreSQL.
 * Si el servidor está apagado o en modo offline, delega al cálculo reactivo local
 * para garantizar 100% de resiliencia.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export interface MetricasBackendDashboard {
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

export async function consultarMetricasDashboardBackend(
  idEncuesta: string = 'enc-001',
  departamento?: string
): Promise<MetricasBackendDashboard | null> {
  try {
    const params = new URLSearchParams()
    if (idEncuesta) params.append('idEncuesta', idEncuesta)
    if (departamento && departamento !== 'todos') params.append('departamento', departamento)

    const res = await fetch(`${API_URL}/dashboard/stats?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('hablandocontigo_auth_token') || ''}`
      },
      signal: AbortSignal.timeout(3000)
    })

    if (res.ok) {
      return (await res.json()) as MetricasBackendDashboard
    }
    return null
  } catch (e) {
    // Servidor offline o en arranque
    return null
  }
}
