/**
 * ============================================================================
 * CONTROLADOR DE CONSULTA DE ENCUESTAS Y ALERTAS (consultarEncuestasControlador.ts)
 * ============================================================================
 * Obtiene el listado completo de encuestas, sus preguntas formateadas
 * y el catálogo de alertas activas desde PostgreSQL en español.
 */

import type { Request, Response } from 'express'
import { pool } from '../../config/db.js'
import {
  formatearFilaPregunta,
  formatearFilaEncuesta
} from '../../services/encuestasMapperService.js'

export async function getEncuestas(_req: Request, res: Response): Promise<void> {
  try {
    const result = await pool.query(`
      SELECT 
        e.id, e.titulo, e.descripcion, e.departamento,
        e.creado_por AS "creadoPor", e.fecha_creacion AS "fechaCreacion",
        e.estado, e.total_respuestas AS "totalRespuestas",
        e.alertas_registradas AS "alertasRegistradas",
        e.puntaje_promedio AS "puntajePromedio",
        COALESCE(e.metadata, '{}'::jsonb) AS metadata,
        e.created_at AS "createdAt"
      FROM encuestas e
      ORDER BY CASE WHEN e.id = 'enc-001' THEN 0 ELSE 1 END ASC, e.created_at ASC
    `)

    const preguntasRes = await pool.query(`
      SELECT 
        id, id_encuesta AS "idEncuesta", secuencia, bloque_id AS "bloqueId",
        categoria, texto, tipo, opciones, es_obligatoria AS "esObligatoria",
        COALESCE(metadata, '{}'::jsonb) AS metadata
      FROM preguntas
      ORDER BY secuencia ASC, created_at ASC
    `)

    const mapaPreguntas: Record<string, any[]> = {}
    preguntasRes.rows.forEach(p => {
      const encId = p.idEncuesta || 'enc-001'
      if (!mapaPreguntas[encId]) mapaPreguntas[encId] = []
      mapaPreguntas[encId].push(formatearFilaPregunta(p, encId))
    })

    const encuestasConPreguntas = result.rows.map(enc =>
      formatearFilaEncuesta(enc, mapaPreguntas[enc.id] || [])
    )

    res.json(encuestasConPreguntas)
  } catch (error: any) {
    console.error('[encuestas.getEncuestas] Error:', error)
    res.json([])
  }
}

export async function getEncuestaById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const encuestaRes = await pool.query(`
      SELECT 
        id, titulo, descripcion, departamento,
        creado_por AS "creadoPor", fecha_creacion AS "fechaCreacion",
        estado, total_respuestas AS "totalRespuestas",
        alertas_registradas AS "alertasRegistradas",
        puntaje_promedio AS "puntajePromedio",
        COALESCE(metadata, '{}'::jsonb) AS metadata
      FROM encuestas
      WHERE id = $1
    `, [id])

    if (encuestaRes.rows.length === 0) {
      res.status(404).json({ error: `Encuesta con ID '${id}' no encontrada.` })
      return
    }

    const preguntasRes = await pool.query(`
      SELECT 
        id, id_encuesta AS "idEncuesta", secuencia, bloque_id AS "bloqueId",
        categoria, texto, tipo, opciones, es_obligatoria AS "esObligatoria",
        COALESCE(metadata, '{}'::jsonb) AS metadata
      FROM preguntas
      WHERE id_encuesta = $1
      ORDER BY secuencia ASC, created_at ASC
    `, [id])

    const preguntasFormateadas = preguntasRes.rows.map(p => formatearFilaPregunta(p, String(id)))
    res.json(formatearFilaEncuesta(encuestaRes.rows[0], preguntasFormateadas))
  } catch (error: any) {
    console.error('[encuestas.getEncuestaById] Error:', error)
    res.status(500).json({ error: 'Error al consultar la encuesta', details: error.message })
  }
}

export async function getAlertasConfig(_req: Request, res: Response): Promise<void> {
  try {
    const result = await pool.query(`
      SELECT id, nombre, nivel, severidad, icono, color_hex AS "colorHex", activa
      FROM alertas_config
      WHERE activa = TRUE
      ORDER BY nivel ASC
    `)
    res.json(result.rows)
  } catch (error: any) {
    console.error('[encuestas.getAlertasConfig] Error:', error)
    res.json([])
  }
}
