/**
 * ============================================================================
 * CONTROLADOR DE CONSULTA DE RESPUESTAS Y MÉTRICAS (consultarRespuestasControlador.ts)
 * ============================================================================
 * Procesa la obtención de respuestas anónimas y las métricas resumidas por encuesta.
 */

import { Request, Response } from 'express'
import { pool } from '../../config/db.js'

/**
 * GET /api/respuestas
 * Lista todas las respuestas recibidas
 */
export async function getRespuestas(req: Request, res: Response): Promise<void> {
  try {
    const { idEncuesta } = req.query

    let query = `
      SELECT 
        id_respuesta AS "idRespuesta",
        id_encuesta AS "idEncuesta",
        titulo_encuesta AS "tituloEncuesta",
        dispositivo_uuid AS "dispositivoUuid",
        nombre_equipo_pc AS "nombreEquipoPc",
        cuenta_usuario_pc AS "cuentaUsuarioPc",
        ubicacion,
        fecha,
        hora,
        duracion_segundos AS "duracionSegundos",
        timestamp_iso AS "timestampIso",
        puntaje_general AS "puntajeGeneral",
        alertas_detectadas AS "alertasDetectadas",
        categorias_alerta AS "categoriasAlerta",
        respuestas,
        created_at AS "createdAt"
      FROM respuestas
    `
    const params: any[] = []

    if (idEncuesta) {
      query += ' WHERE id_encuesta = $1'
      params.push(idEncuesta)
    }

    query += ' ORDER BY created_at DESC'

    const result = await pool.query(query, params)
    const mapped = result.rows.map(row => ({
      ...row,
      puntajeGeneral: Number(row.puntajeGeneral || 0),
      duracionSegundos: Number(row.duracionSegundos || 0)
    }))
    res.json(mapped)
  } catch (error: any) {
    console.error('[respuestas.getRespuestas] Error:', error)
    res.json([])
  }
}

/**
 * GET /api/respuestas/metricas/:id_encuesta
 * Retorna las métricas globales calculadas (promedio, total recibidas, alertas detectadas)
 */
export async function getMetricasEncuesta(req: Request, res: Response): Promise<void> {
  try {
    const { id_encuesta } = req.params

    const metricasRes = await pool.query(`
      SELECT 
        id,
        titulo,
        total_respuestas AS "totalRespuestas",
        alertas_registradas AS "alertasRegistradas",
        puntaje_promedio AS "puntajePromedio",
        estado
      FROM encuestas
      WHERE id = $1
    `, [id_encuesta])

    if (metricasRes.rows.length === 0) {
      res.status(404).json({ error: `Encuesta '${id_encuesta}' no encontrada.` })
      return
    }

    const statsQuery = await pool.query(`
      SELECT 
        COUNT(*) AS "totalRegistros",
        COALESCE(ROUND(AVG(puntaje_general), 2), 0.0) AS "promedioExacto",
        COUNT(CASE WHEN jsonb_array_length(alertas_detectadas) > 0 THEN 1 END) AS "totalConAlerta"
      FROM respuestas
      WHERE id_encuesta = $1
    `, [id_encuesta])

    const data = metricasRes.rows[0]
    const stats = statsQuery.rows[0]

    res.json({
      ok: true,
      idEncuesta: id_encuesta,
      titulo: data.titulo,
      totalRespuestas: Number(stats.totalRegistros || data.totalRespuestas),
      alertasDetectadas: Number(stats.totalConAlerta || data.alertasRegistradas),
      puntajePromedio: Number(stats.promedioExacto || data.puntajePromedio),
      porcentajeSatisfaccion: Number(((stats.promedioExacto / 5.0) * 100).toFixed(1))
    })
  } catch (error: any) {
    console.error('[respuestas.getMetricasEncuesta] Error:', error)
    res.status(500).json({ error: 'Error al consultar métricas', details: error.message })
  }
}
