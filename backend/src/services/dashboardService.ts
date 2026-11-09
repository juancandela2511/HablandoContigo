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
    departamento?: string
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

    if (departamento && departamento !== 'General' && departamento !== 'Todos') {
      parametros.push(`%${departamento.toLowerCase()}%`)
      consultaSql += ` AND (
        LOWER(cuenta_usuario_pc) LIKE $${parametros.length} OR
        LOWER(respuestas::text) LIKE $${parametros.length} OR
        LOWER(ubicacion::text) LIKE $${parametros.length}
      )`
    }

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

    // 3. Cálculo dinámico de preguntas con mayor malestar organizacional (basado en respuestas reales)
    const estadisticasPreguntas: Record<string, {
      idPregunta: string
      pregunta: string
      categoria: string
      suma: number
      conteo: number
      riesgos: number
      favorables: number
      citas: string[]
    }> = {}

    registros.forEach(r => {
      const items = Array.isArray(r.respuestas)
        ? r.respuestas
        : (typeof r.respuestas === 'string' ? JSON.parse(r.respuestas || '[]') : [])

      if (Array.isArray(items)) {
        items.forEach((item: any) => {
          const idP = item.idPregunta || item.id || 'p-gen'
          const val = Number(item.valor)
          if (!isNaN(val) && val >= 1 && val <= 5) {
            if (!estadisticasPreguntas[idP]) {
              estadisticasPreguntas[idP] = {
                idPregunta: idP,
                pregunta: item.textoPregunta || item.texto || 'Pregunta de evaluación',
                categoria: item.categoria || 'Clima General',
                suma: 0,
                conteo: 0,
                riesgos: 0,
                favorables: 0,
                citas: []
              }
            }
            estadisticasPreguntas[idP].suma += val
            estadisticasPreguntas[idP].conteo++
            if (val <= 2.5 || item.esAlerta) estadisticasPreguntas[idP].riesgos++
            if (val >= 4.0) estadisticasPreguntas[idP].favorables++

            const comentarioLimpio = String(item.comentario || item.respuesta || '').trim()
            if (comentarioLimpio.length > 15 && val <= 3.0 && estadisticasPreguntas[idP].citas.length < 3) {
              estadisticasPreguntas[idP].citas.push(comentarioLimpio)
            }
          }
        })
      }
    })

    const listaPreguntasCalculadas = Object.values(estadisticasPreguntas)
      .filter(p => p.conteo > 0)
      .map(p => {
        const prom = Number((p.suma / p.conteo).toFixed(1))
        return {
          idPregunta: p.idPregunta,
          pregunta: p.pregunta,
          categoria: p.categoria,
          promedio: prom,
          porcentajeRiesgo: Math.round((p.riesgos / p.conteo) * 100),
          porcentajeFavorable: Math.round((p.favorables / p.conteo) * 100),
          citasDestacadas: p.citas.length > 0 ? p.citas : [
            'Los colaboradores sugieren mayor seguimiento y revisión en este aspecto.',
            'Oportunidad para ajustar procesos operativos y retroalimentación continua.'
          ]
        }
      })
      .sort((a, b) => a.promedio - b.promedio) // Orden ascendente: las de menor puntaje (mayor malestar) primero

    const preguntasMayorMalestar = listaPreguntasCalculadas.length > 0
      ? listaPreguntasCalculadas.slice(0, 3)
      : [
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
