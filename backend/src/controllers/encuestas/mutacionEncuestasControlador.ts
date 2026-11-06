/**
 * ============================================================================
 * CONTROLADOR DE EDICIÓN Y ELIMINACIÓN DE ENCUESTAS (mutacionEncuestasControlador.ts)
 * ============================================================================
 * Procesa la persistencia atómica de ediciones en proyectos, preguntas asociadas
 * y eliminación segura de encuestas secundarias en español.
 */

import type { Request, Response } from 'express'
import { pool } from '../../config/db.js'
import {
  construirParametrosInsercionPregunta,
  sincronizarPreguntasJsonLocales
} from '../../services/encuestasMapperService.js'

export async function updateEncuesta(req: Request, res: Response): Promise<void> {
  const client = await pool.connect()
  try {
    const id = String(req.params.id || 'enc-001')
    const { titulo, descripcion, departamento, estado, bloques, metadata, preguntas } = req.body

    await client.query('BEGIN')

    const estadoFrontend = estado || metadata?.estadoFrontend || 'Activa'
    const estadoSql = estadoFrontend === 'Finalizada'
      ? 'Cerrada'
      : (['Activa', 'Borrador', 'Cerrada', 'Archivada'].includes(estadoFrontend) ? estadoFrontend : 'Activa')

    const encMetadata = {
      ...(typeof metadata === 'object' ? metadata : {}),
      estadoFrontend,
      bloques: Array.isArray(bloques) ? bloques : (metadata?.bloques || [])
    }

    await client.query(`
      INSERT INTO encuestas (
        id, titulo, descripcion, departamento, estado,
        total_respuestas, alertas_registradas, puntaje_promedio,
        fecha_creacion, creado_por, metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9, TO_CHAR(CURRENT_TIMESTAMP, 'DD Mon YYYY')), 'Super Administrador', $10)
      ON CONFLICT (id) DO UPDATE
      SET 
        titulo = COALESCE(EXCLUDED.titulo, encuestas.titulo),
        descripcion = COALESCE(EXCLUDED.descripcion, encuestas.descripcion),
        departamento = COALESCE(EXCLUDED.departamento, encuestas.departamento),
        estado = EXCLUDED.estado,
        total_respuestas = COALESCE(EXCLUDED.total_respuestas, encuestas.total_respuestas),
        alertas_registradas = COALESCE(EXCLUDED.alertas_registradas, encuestas.alertas_registradas),
        puntaje_promedio = COALESCE(EXCLUDED.puntaje_promedio, encuestas.puntaje_promedio),
        metadata = EXCLUDED.metadata,
        updated_at = CURRENT_TIMESTAMP
    `, [
      id,
      titulo || 'Proyecto Clima Laboral',
      descripcion || '',
      departamento || 'General',
      estadoSql,
      Number(encMetadata.totalRespuestas ?? 0),
      Number(encMetadata.alertasRegistradas ?? 0),
      Number(encMetadata.puntajePromedio ?? 5.0),
      encMetadata.fechaCreacion || null,
      JSON.stringify(encMetadata)
    ])

    if (Array.isArray(preguntas) && preguntas.length > 0) {
      await client.query('DELETE FROM preguntas WHERE id_encuesta = $1', [id])
      for (let i = 0; i < preguntas.length; i++) {
        const params = construirParametrosInsercionPregunta(id, preguntas[i], i)
        await client.query(`
          INSERT INTO preguntas (
            id, id_encuesta, secuencia, bloque_id, categoria, texto, tipo, opciones, es_obligatoria, metadata
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (id) DO UPDATE SET
            id_encuesta = EXCLUDED.id_encuesta,
            secuencia = EXCLUDED.secuencia,
            bloque_id = EXCLUDED.bloque_id,
            categoria = EXCLUDED.categoria,
            texto = EXCLUDED.texto,
            tipo = EXCLUDED.tipo,
            opciones = EXCLUDED.opciones,
            es_obligatoria = EXCLUDED.es_obligatoria,
            metadata = EXCLUDED.metadata
        `, params)
      }
      if (id === 'enc-001') await sincronizarPreguntasJsonLocales(preguntas)
    }

    await client.query('COMMIT')
    res.json({ ok: true, mensaje: 'Encuesta y preguntas guardadas correctamente en la base de datos.' })
  } catch (error: any) {
    await client.query('ROLLBACK')
    console.error('[encuestas.updateEncuesta] Error:', error)
    res.status(500).json({ error: 'Error al persistir la edición de la encuesta', details: error.message })
  } finally {
    client.release()
  }
}

export async function deleteEncuesta(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    if (id === 'enc-001') {
      res.status(400).json({ error: 'No se puede eliminar la encuesta principal enc-001.' })
      return
    }
    await pool.query('DELETE FROM preguntas WHERE id_encuesta = $1', [id])
    await pool.query('DELETE FROM encuestas WHERE id = $1', [id])
    res.json({ ok: true, mensaje: `Proyecto ${id} eliminado correctamente.` })
  } catch (error: any) {
    console.error('[encuestas.deleteEncuesta] Error:', error)
    res.status(500).json({ error: 'Error al eliminar el proyecto', details: error.message })
  }
}
