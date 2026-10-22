/**
 * ============================================================================
 * CONTROLADOR DE RESPUESTAS (server/src/controllers/respuestasController.ts)
 * ============================================================================
 * Maneja el envío y persistencia atómica de respuestas de colaboradores,
 * cálculo de métricas y evaluación de alertas psicosociales en transacciones SQL.
 */

import { Request, Response } from 'express'
import { pool } from '../config/db.js'

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
    console.error('[respuestasController.getRespuestas] Error:', error)
    res.status(500).json({ error: 'Error al consultar respuestas', details: error.message })
  }
}

/**
 * POST /api/respuestas
 * Registra una respuesta anónima de colaborador dentro de una TRANSACCIÓN SQL (BEGIN/COMMIT/ROLLBACK)
 * e incrementa de forma atómica 'total_respuestas' y recalcula 'puntaje_promedio' en 'encuestas'.
 */
export async function createRespuesta(req: Request, res: Response): Promise<void> {
  const client = await pool.connect()

  try {
    const {
      idEncuesta,
      tituloEncuesta,
      dispositivoUuid,
      nombreEquipoPc,
      cuentaUsuarioPc,
      ubicacion,
      fecha,
      hora,
      duracionSegundos,
      puntajeGeneral,
      alertasDetectadas,
      categoriasAlerta,
      respuestas
    } = req.body

    if (!idEncuesta || !dispositivoUuid || !respuestas) {
      res.status(400).json({ error: 'Datos incompletos. Se requiere idEncuesta, dispositivoUuid y respuestas.' })
      return
    }

    const idRespuesta = `resp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    const timestampIso = new Date().toISOString()
    const fechaActual = fecha || new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
    const horaActual = hora || new Date().toLocaleTimeString('es-ES')
    const duracion = Number(duracionSegundos) || 120
    const score = Number(puntajeGeneral) || 5.0

    // 1. Iniciar Transacción SQL
    await client.query('BEGIN')

    // 2. Insertar en tabla respuestas
    const insertQuery = `
      INSERT INTO respuestas (
        id_respuesta, id_encuesta, titulo_encuesta, dispositivo_uuid,
        nombre_equipo_pc, cuenta_usuario_pc, ubicacion, fecha, hora,
        duracion_segundos, timestamp_iso, puntaje_general, alertas_detectadas,
        categorias_alerta, respuestas
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `
    const insertParams = [
      idRespuesta,
      idEncuesta,
      tituloEncuesta || 'Encuesta de Clima Laboral',
      dispositivoUuid,
      nombreEquipoPc || '',
      cuentaUsuarioPc || '',
      JSON.stringify(ubicacion || {}),
      fechaActual,
      horaActual,
      duracion,
      timestampIso,
      score,
      JSON.stringify(alertasDetectadas || []),
      JSON.stringify(categoriasAlerta || []),
      JSON.stringify(respuestas)
    ]

    const insertResult = await client.query(insertQuery, insertParams)

    // 3. Confirmar Transacción (el trigger de PostgreSQL trigger_actualizar_metricas actualiza total_respuestas y métricas automáticamente)
    await client.query('COMMIT')

    res.status(201).json({
      ok: true,
      mensaje: 'Respuesta registrada y procesada exitosamente con transacción atómica.',
      idRespuesta,
      respuesta: insertResult.rows[0]
    })
  } catch (error: any) {
    // Revertir transacción en caso de fallo
    await client.query('ROLLBACK')
    console.error('[respuestasController.createRespuesta] Error en transacción:', error)
    res.status(500).json({ error: 'Error al registrar la respuesta en la base de datos.', details: error.message })
  } finally {
    client.release()
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

    // Calcular distribución y porcentaje de satisfacción desde las respuestas reales
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
    console.error('[respuestasController.getMetricasEncuesta] Error:', error)
    res.status(500).json({ error: 'Error al consultar métricas', details: error.message })
  }
}

/**
 * DELETE /api/respuestas/limpiar
 * Elimina todas las respuestas de prueba de PostgreSQL y reinicia contadores a cero
 */
export async function limpiarRespuestas(req: Request, res: Response): Promise<void> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query('TRUNCATE TABLE respuestas CASCADE')
    await client.query('UPDATE encuestas SET total_respuestas = 0, alertas_registradas = 0, puntaje_promedio = 0.0')
    await client.query('COMMIT')
    res.json({ ok: true, mensaje: 'Base de datos limpia: 0 datos de prueba, lista para registrar exclusivamente datos reales.' })
  } catch (error: any) {
    await client.query('ROLLBACK')
    console.error('[respuestasController.limpiarRespuestas] Error:', error)
    res.status(500).json({ error: 'Error al limpiar respuestas en PostgreSQL', details: error.message })
  } finally {
    client.release()
  }
}
