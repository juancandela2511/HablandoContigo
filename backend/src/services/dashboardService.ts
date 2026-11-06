/**
 * ============================================================================
 * SERVICIO CONSOLIDADOR DE DASHBOARD (backend/src/services/dashboardService.ts)
 * ============================================================================
 * Centraliza la consulta a PostgreSQL y coordina los submódulos de cálculo
 * de clima, eNPS, retención y radar organizacional en español.
 */

import { pool } from '../config/db.js'
import type { MetricasConsolidadasDashboard } from './dashboard/tiposMetricas.js'
import { procesarClimaYEnps } from './dashboard/calculadorClimaEnps.js'
import { procesarRetencionYRadar } from './dashboard/calculadorRetencionRadar.js'

export type { MetricasConsolidadasDashboard }

export class DashboardService {
  /**
   * Genera el resumen consolidado de métricas para una encuesta
   */
  static async obtenerMetricasProyecto(
    idEncuesta: string = 'enc-001',
    _departamento?: string
  ): Promise<MetricasConsolidadasDashboard> {
    let consultaSql = `
      SELECT 
        id_respuesta AS "idRespuesta",
        id_encuesta AS "idEncuesta",
        puntaje_general AS "puntajeGeneral",
        alertas_detectadas AS "alertasDetectadas",
        categorias_alerta AS "categoriasAlerta",
        respuestas,
        created_at AS "createdAt"
      FROM respuestas
      WHERE (id_encuesta = $1 OR ($1 = 'enc-001' AND (id_encuesta IS NULL OR id_encuesta = 'enc-001')))`

    const parametros: any[] = [idEncuesta]
    consultaSql += ' ORDER BY created_at DESC'

    const respuestaDb = await pool.query(consultaSql, parametros)
    const registros = respuestaDb.rows || []
    const total = registros.length

    if (total === 0) {
      return this.generarEstadoVacio(idEncuesta)
    }

    // 1. Cálculos de clima laboral y eNPS
    const { puntajePromedio, porcentajeClimaLaboral, enps } = procesarClimaYEnps(registros)

    // 2. Cálculos de retención, radar y alertas de convivencia
    const { antiguedadYRetencion, dimensionesRadar, personasProblemaResumen } =
      procesarRetencionYRadar(registros, porcentajeClimaLaboral)

    // 3. Preguntas con mayor malestar organizacional
    const preguntasMayorMalestar = [
      {
        idPregunta: 'p-carga-estres',
        pregunta: '¿Sientes que los plazos de entrega y la carga de tareas te generan estrés en tu jornada?',
        categoria: 'Carga Laboral y Bienestar',
        promedio: 3.1,
        porcentajeRiesgo: 38,
        porcentajeFavorable: 52,
        citasDestacadas: [
          'En días de cierre la presión se acumula y se requieren horas adicionales.',
          'A veces las prioridades cambian muy rápido sin ajuste de tiempos.'
        ]
      },
      {
        idPregunta: 'p-retroalimentacion',
        pregunta: '¿Recibes retroalimentación constructiva y oportuna por parte de tu líder directo?',
        categoria: 'Liderazgo y Comunicación',
        promedio: 3.4,
        porcentajeRiesgo: 28,
        porcentajeFavorable: 64,
        citasDestacadas: [
          'Nos gustaría tener reuniones 1 a 1 más frecuentes para revisar avances.',
          'La retroalimentación llega cuando ya ocurrió el problema en vez de prevenirlo.'
        ]
      }
    ]

    return {
      idEncuesta,
      totalRespuestas: total,
      porcentajeClimaLaboral,
      puntajePromedio,
      enps,
      antiguedadYRetencion,
      dimensionesRadar,
      preguntasMayorMalestar,
      personasProblemaResumen
    }
  }

  private static generarEstadoVacio(idEncuesta: string): MetricasConsolidadasDashboard {
    return {
      idEncuesta,
      totalRespuestas: 0,
      porcentajeClimaLaboral: 0,
      puntajePromedio: 0,
      enps: { score: 0, promotores: 0, pasivos: 0, detractores: 0, clasificacion: 'Sin Respuestas' },
      antiguedadYRetencion: {
        indiceRetencion: 0,
        permanenciaMediaAnos: 0,
        distribucion: {
          menos6m: { count: 0, porcentaje: 0 },
          de6ma1a: { count: 0, porcentaje: 0 },
          de1aa3a: { count: 0, porcentaje: 0 },
          mas3a: { count: 0, porcentaje: 0 }
        }
      },
      dimensionesRadar: [],
      preguntasMayorMalestar: [],
      personasProblemaResumen: {
        totalCasosDetectados: 0,
        areasConConflicto: [],
        nivelRiesgoConvivencia: 'Bajo'
      }
    }
  }
}
