/**
 * ============================================================================
 * CONTROLADOR DE HISTÓRICO DE PERIODOS (server/src/controllers/historicoController.ts)
 * ============================================================================
 * Administra las consultas y cierres oficiales de periodo para comparativa anual.
 */

import { Request, Response } from 'express'
import { pool } from '../config/db.js'

/**
 * GET /api/historico-periodos
 * Consulta el historial de cierres anuales ordenados por año descendente
 */
export async function getHistoricoPeriodos(req: Request, res: Response): Promise<void> {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        id_encuesta AS "idEncuesta",
        titulo_periodo AS "tituloPeriodo",
        anio,
        fecha_cierre AS "fechaCierre",
        total_respuestas AS "totalRespuestas",
        alertas_registradas AS "alertasRegistradas",
        puntaje_promedio AS "puntajePromedio",
        porcentaje_satisfaccion AS "porcentajeSatisfaccion",
        desglose_bloques AS "desgloseBloques",
        cerrado_por AS "cerradoPor",
        notas
      FROM historico_periodos
      ORDER BY anio DESC, created_at DESC
    `)

    res.json(result.rows)
  } catch (error: any) {
    console.error('[historicoController] Error al consultar histórico:', error)
    res.json([])
  }
}

/**
 * POST /api/historico-periodos
 * Registra el cierre de un nuevo periodo anual de clima laboral
 */
export async function createHistoricoPeriodo(req: Request, res: Response): Promise<void> {
  try {
    const {
      idEncuesta,
      tituloPeriodo,
      anio,
      fechaCierre,
      totalRespuestas,
      alertasRegistradas,
      puntajePromedio,
      porcentajeSatisfaccion,
      desgloseBloques,
      cerradoPor,
      notas
    } = req.body

    if (!anio || !tituloPeriodo) {
      res.status(400).json({ error: 'El año y el título del periodo son requeridos' })
      return
    }

    const id = `hist-${Date.now()}`
    const insertResult = await pool.query(`
      INSERT INTO historico_periodos (
        id, id_encuesta, titulo_periodo, anio, fecha_cierre,
        total_respuestas, alertas_registradas, puntaje_promedio,
        porcentaje_satisfaccion, desglose_bloques, cerrado_por, notas
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [
      id,
      idEncuesta || 'enc-001',
      tituloPeriodo,
      Number(anio),
      fechaCierre || new Date().toISOString(),
      Number(totalRespuestas) || 0,
      Number(alertasRegistradas) || 0,
      Number(puntajePromedio) || 0.0,
      Number(porcentajeSatisfaccion) || 0.0,
      JSON.stringify(desgloseBloques || []),
      cerradoPor || 'Super Administrador',
      notas || ''
    ])

    res.status(201).json({
      message: 'Cierre de periodo registrado exitosamente',
      historico: insertResult.rows[0]
    })
  } catch (error: any) {
    console.error('[historicoController] Error al registrar histórico:', error)
    res.status(500).json({ error: 'Error al registrar el cierre de periodo', details: error.message })
  }
}

/**
 * DELETE /api/historico-periodos/:id
 * Elimina un registro de periodo histórico (usado al revertir la finalización de un proyecto)
 */
export async function deleteHistoricoPeriodo(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    // Eliminar únicamente por el ID del registro — nunca borrar por id_encuesta para evitar borrado masivo accidental
    await pool.query('DELETE FROM historico_periodos WHERE id = $1', [id])
    res.json({ ok: true, mensaje: 'Registro de periodo histórico eliminado' })
  } catch (error: any) {
    console.error('[historicoController] Error al eliminar periodo:', error)
    res.status(500).json({ error: 'Error al eliminar el periodo histórico' })
  }
}
