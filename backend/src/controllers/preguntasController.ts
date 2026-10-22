/**
 * ============================================================================
 * CONTROLADOR DE PREGUNTAS (server/src/controllers/preguntasController.ts)
 * ============================================================================
 * Maneja el catálogo de preguntas oficiales y personalizables de la encuesta.
 */

import { Request, Response } from 'express'
import { pool } from '../config/db.js'

/**
 * GET /api/preguntas
 * Consulta todas las preguntas registradas en la base de datos
 */
export async function getPreguntas(req: Request, res: Response): Promise<void> {
  try {
    const { idEncuesta } = req.query

    let query = `
      SELECT 
        id,
        id_encuesta AS "idEncuesta",
        bloque_id AS "bloqueId",
        categoria,
        texto,
        tipo,
        opciones,
        secuencia
      FROM preguntas
    `
    const params: any[] = []

    if (idEncuesta) {
      query += ' WHERE id_encuesta = $1'
      params.push(idEncuesta)
    }

    query += ' ORDER BY secuencia ASC, created_at ASC'

    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (error: any) {
    console.error('[preguntasController] Error al obtener preguntas:', error)
    res.status(500).json({ error: 'Error al consultar las preguntas en la base de datos', details: error.message })
  }
}

/**
 * POST /api/preguntas
 * Crea una nueva pregunta en el cuestionario
 */
export async function createPregunta(req: Request, res: Response): Promise<void> {
  try {
    const { idEncuesta, bloqueId, categoria, texto, tipo, opciones, secuencia } = req.body

    if (!texto || !categoria) {
      res.status(400).json({ error: 'El texto y la categoría de la pregunta son obligatorios' })
      return
    }

    const id = `p-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`
    const insertResult = await pool.query(`
      INSERT INTO preguntas (id, id_encuesta, bloque_id, categoria, texto, tipo, opciones, secuencia)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      id,
      idEncuesta || 'enc-001',
      bloqueId || 'bloque-1',
      categoria,
      texto,
      tipo || 'multiple',
      JSON.stringify(opciones || []),
      secuencia || 1
    ])

    res.status(201).json({ message: 'Pregunta creada exitosamente', pregunta: insertResult.rows[0] })
  } catch (error: any) {
    console.error('[preguntasController] Error al crear pregunta:', error)
    res.status(500).json({ error: 'Error al guardar la pregunta', details: error.message })
  }
}

/**
 * PUT /api/preguntas/:id
 * Actualiza una pregunta existente por su ID
 */
export async function updatePregunta(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const { categoria, texto, tipo, opciones, secuencia } = req.body

    const updateResult = await pool.query(`
      UPDATE preguntas
      SET 
        categoria = COALESCE($1, categoria),
        texto = COALESCE($2, texto),
        tipo = COALESCE($3, tipo),
        opciones = COALESCE($4, opciones),
        secuencia = COALESCE($5, secuencia)
      WHERE id = $6
      RETURNING *
    `, [categoria, texto, tipo, opciones ? JSON.stringify(opciones) : null, secuencia, id])

    if (updateResult.rows.length === 0) {
      res.status(404).json({ error: 'Pregunta no encontrada' })
      return
    }

    res.json({ message: 'Pregunta actualizada exitosamente', pregunta: updateResult.rows[0] })
  } catch (error: any) {
    console.error('[preguntasController] Error al actualizar pregunta:', error)
    res.status(500).json({ error: 'Error al actualizar la pregunta', details: error.message })
  }
}

/**
 * DELETE /api/preguntas/:id
 * Elimina una pregunta por su ID
 */
export async function deletePregunta(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const deleteResult = await pool.query('DELETE FROM preguntas WHERE id = $1 RETURNING *', [id])

    if (deleteResult.rows.length === 0) {
      res.status(404).json({ error: 'Pregunta no encontrada' })
      return
    }

    res.json({ message: 'Pregunta eliminada exitosamente' })
  } catch (error: any) {
    console.error('[preguntasController] Error al eliminar pregunta:', error)
    res.status(500).json({ error: 'Error al eliminar la pregunta', details: error.message })
  }
}
