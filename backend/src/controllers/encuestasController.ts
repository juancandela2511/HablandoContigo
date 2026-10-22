/**
 * ============================================================================
 * CONTROLADOR DE ENCUESTAS Y PREGUNTAS (backend/src/controllers/encuestasController.ts)
 * ============================================================================
 * Gestiona la lectura completa con preguntas asociadas y la persistencia
 * atómica de ediciones de encuestas en PostgreSQL.
 */

import type { Request, Response } from 'express'
import { pool } from '../config/db.js'

/**
 * GET /api/encuestas
 * Lista todas las encuestas disponibles incluyendo su arreglo completo de preguntas
 */
export async function getEncuestas(req: Request, res: Response): Promise<void> {
  try {
    const result = await pool.query(`
      SELECT 
        e.id,
        e.titulo,
        e.descripcion,
        e.departamento,
        e.creado_por AS "creadoPor",
        e.fecha_creacion AS "fechaCreacion",
        e.estado,
        e.total_respuestas AS "totalRespuestas",
        e.alertas_registradas AS "alertasRegistradas",
        e.puntaje_promedio AS "puntajePromedio",
        COALESCE(e.metadata, '{}'::jsonb) AS metadata,
        e.created_at AS "createdAt"
      FROM encuestas e
      ORDER BY e.created_at DESC
    `)

    // Consultar preguntas de todas las encuestas ordenadas por secuencia
    const preguntasRes = await pool.query(`
      SELECT 
        id,
        id_encuesta AS "idEncuesta",
        secuencia,
        bloque_id AS "bloqueId",
        categoria,
        texto,
        tipo,
        opciones,
        es_obligatoria AS "esObligatoria",
        COALESCE(metadata, '{}'::jsonb) AS metadata
      FROM preguntas
      ORDER BY secuencia ASC, created_at ASC
    `)

    const mapaPreguntas: Record<string, any[]> = {}
    preguntasRes.rows.forEach(p => {
      const encId = p.idEncuesta || 'enc-001'
      if (!mapaPreguntas[encId]) {
        mapaPreguntas[encId] = []
      }
      const meta = typeof p.metadata === 'string' ? JSON.parse(p.metadata) : (p.metadata || {})
      const tieneComentarios = Boolean(meta.comentariosHabilitados || meta.deteccionQuejas || meta.solicitarPorQueSiNegativo || false)
      mapaPreguntas[encId].push({
        ...meta,
        id: p.id,
        idEncuesta: p.idEncuesta,
        secuencia: p.secuencia,
        bloqueId: p.bloqueId,
        categoria: p.categoria,
        texto: p.texto,
        tipo: p.tipo,
        esObligatoria: p.esObligatoria,
        opciones: typeof p.opciones === 'string' ? JSON.parse(p.opciones) : (p.opciones || []),
        comentariosHabilitados: tieneComentarios,
        deteccionQuejas: tieneComentarios,
        solicitarPorQueSiNegativo: tieneComentarios
      })
    })

    const encuestasConPreguntas = result.rows.map(enc => {
      const encMeta = typeof enc.metadata === 'string' ? JSON.parse(enc.metadata) : (enc.metadata || {})
      return {
        ...enc,
        bloques: encMeta.bloques || [],
        preguntas: mapaPreguntas[enc.id] || []
      }
    })

    res.json(encuestasConPreguntas)
  } catch (error: any) {
    console.error('[encuestasController.getEncuestas] Error:', error)
    res.status(500).json({ error: 'Error al consultar encuestas', details: error.message })
  }
}

/**
 * GET /api/encuestas/:id
 * Retorna la cabecera de la encuesta y su arreglo completo de preguntas
 */
export async function getEncuestaById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params

    const encuestaRes = await pool.query(`
      SELECT 
        id,
        titulo,
        descripcion,
        departamento,
        creado_por AS "creadoPor",
        fecha_creacion AS "fechaCreacion",
        estado,
        total_respuestas AS "totalRespuestas",
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

    const encuesta = encuestaRes.rows[0]
    const encMeta = typeof encuesta.metadata === 'string' ? JSON.parse(encuesta.metadata) : (encuesta.metadata || {})

    const preguntasRes = await pool.query(`
      SELECT 
        id,
        id_encuesta AS "idEncuesta",
        secuencia,
        bloque_id AS "bloqueId",
        categoria,
        texto,
        tipo,
        opciones,
        es_obligatoria AS "esObligatoria",
        COALESCE(metadata, '{}'::jsonb) AS metadata
      FROM preguntas
      WHERE id_encuesta = $1
      ORDER BY secuencia ASC, created_at ASC
    `, [id])

    const preguntasFormateadas = preguntasRes.rows.map(p => {
      const meta = typeof p.metadata === 'string' ? JSON.parse(p.metadata) : (p.metadata || {})
      const tieneComentarios = Boolean(meta.comentariosHabilitados || meta.deteccionQuejas || meta.solicitarPorQueSiNegativo || false)
      return {
        ...meta,
        id: p.id,
        idEncuesta: p.idEncuesta,
        secuencia: p.secuencia,
        bloqueId: p.bloqueId,
        categoria: p.categoria,
        texto: p.texto,
        tipo: p.tipo,
        esObligatoria: p.esObligatoria,
        opciones: typeof p.opciones === 'string' ? JSON.parse(p.opciones) : (p.opciones || []),
        comentariosHabilitados: tieneComentarios,
        deteccionQuejas: tieneComentarios,
        solicitarPorQueSiNegativo: tieneComentarios
      }
    })

    res.json({
      ...encuesta,
      bloques: encMeta.bloques || [],
      totalPreguntas: preguntasFormateadas.length,
      preguntas: preguntasFormateadas
    })
  } catch (error: any) {
    console.error('[encuestasController.getEncuestaById] Error:', error)
    res.status(500).json({ error: 'Error al consultar la encuesta', details: error.message })
  }
}

/**
 * PUT /api/encuestas/:id
 * Guarda y persiste las ediciones de la encuesta y sus preguntas atómicamente en PostgreSQL
 */
export async function updateEncuesta(req: Request, res: Response): Promise<void> {
  const client = await pool.connect()
  try {
    const { id } = req.params
    const { titulo, descripcion, departamento, estado, bloques, metadata, preguntas } = req.body

    await client.query('BEGIN')

    const encMetadata = {
      ...(typeof metadata === 'object' ? metadata : {}),
      bloques: Array.isArray(bloques) ? bloques : (metadata?.bloques || [])
    }

    // 1. Actualizar o insertar la cabecera de la encuesta
    await client.query(`
      INSERT INTO encuestas (id, titulo, descripcion, departamento, estado, fecha_creacion, creado_por, metadata)
      VALUES ($1, $2, $3, $4, $5, TO_CHAR(CURRENT_TIMESTAMP, 'DD Mon YYYY'), 'Super Administrador', $6)
      ON CONFLICT (id) DO UPDATE
      SET 
        titulo = COALESCE(EXCLUDED.titulo, encuestas.titulo),
        descripcion = COALESCE(EXCLUDED.descripcion, encuestas.descripcion),
        departamento = COALESCE(EXCLUDED.departamento, encuestas.departamento),
        estado = COALESCE(EXCLUDED.estado, encuestas.estado),
        metadata = EXCLUDED.metadata,
        updated_at = CURRENT_TIMESTAMP
    `, [
      id,
      titulo || 'Proyecto Clima Laboral',
      descripcion || '',
      departamento || 'General',
      estado || 'Activa',
      JSON.stringify(encMetadata)
    ])

    // 2. Si se proporcionaron preguntas, actualizar la tabla de preguntas
    if (Array.isArray(preguntas) && preguntas.length > 0) {
      await client.query('DELETE FROM preguntas WHERE id_encuesta = $1', [id])

      for (let i = 0; i < preguntas.length; i++) {
        const p = preguntas[i]
        const tieneComentarios = Boolean(p.comentariosHabilitados || p.deteccionQuejas || p.solicitarPorQueSiNegativo || false)
        const pregMeta = {
          comentariosHabilitados: tieneComentarios,
          deteccionQuejas: tieneComentarios,
          solicitarPorQueSiNegativo: tieneComentarios,
          modoPresentacion: p.modoPresentacion || undefined,
          maxAnos: p.maxAnos || undefined,
          imagen: p.imagen || undefined,
          imagenRompecabezas: p.imagenRompecabezas || undefined,
          esCondicional: Boolean(p.esCondicional ?? false),
          disparadorPor: p.disparadorPor || undefined,
          valoresDisparo: p.valoresDisparo || undefined,
          accionCondicion: p.accionCondicion || undefined,
          saltarHastaId: p.saltarHastaId || undefined,
          activarSaltoCondicional: p.activarSaltoCondicional || undefined
        }

        await client.query(`
          INSERT INTO preguntas (
            id, id_encuesta, secuencia, bloque_id, categoria, texto, tipo, opciones, es_obligatoria, metadata
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          p.id || `preg-${id}-${i + 1}`,
          id,
          i + 1,
          p.bloqueId || `bloque-${Math.floor(i / 5) + 1}`,
          p.categoria || 'General',
          p.texto || '',
          p.tipo || 'multiple',
          JSON.stringify(p.opciones || []),
          Boolean(p.esObligatoria ?? true),
          JSON.stringify(pregMeta)
        ])
      }
    }

    await client.query('COMMIT')
    res.json({ ok: true, mensaje: 'Encuesta y preguntas guardadas correctamente en la base de datos.' })
  } catch (error: any) {
    await client.query('ROLLBACK')
    console.error('[encuestasController.updateEncuesta] Error:', error)
    res.status(500).json({ error: 'Error al persistir la edición de la encuesta', details: error.message })
  } finally {
    client.release()
  }
}

/**
 * GET /api/alertas-config
 */
export async function getAlertasConfig(req: Request, res: Response): Promise<void> {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        nombre,
        nivel,
        severidad,
        icono,
        color_hex AS "colorHex",
        activa
      FROM alertas_config
      WHERE activa = TRUE
      ORDER BY nivel ASC
    `)
    res.json(result.rows)
  } catch (error: any) {
    console.error('[encuestasController.getAlertasConfig] Error:', error)
    res.status(500).json({ error: 'Error al consultar configuración de alertas', details: error.message })
  }
}
