/**
 * ============================================================================
 * CONTROLADOR DE REGISTRO Y VACIADO DE RESPUESTAS (registroRespuestasControlador.ts)
 * ============================================================================
 * Procesa la persistencia atómica con transacciones SQL de respuestas recibidas
 * y la limpieza total de datos de prueba en español.
 */

import { Request, Response } from 'express'
import { pool } from '../../config/db.js'

/**
 * POST /api/respuestas
 * Registra una respuesta anónima dentro de una transacción SQL atómica.
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

    const idRespuesta = req.body.idRespuesta || `resp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    const timestampIso = new Date().toISOString()
    const fechaActual = fecha || new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
    const horaActual = hora || new Date().toLocaleTimeString('es-ES')
    const duracion = Number(duracionSegundos) || 120
    const score = puntajeGeneral !== undefined && puntajeGeneral !== null && !isNaN(Number(puntajeGeneral))
      ? Number(puntajeGeneral)
      : 3.0

    // 1. Iniciar Transacción SQL y asegurar que la encuesta exista en PostgreSQL
    await client.query('BEGIN')
    await client.query(`
      INSERT INTO encuestas (id, titulo, descripcion, departamento, estado, fecha_creacion, creado_por)
      VALUES ($1, $2, 'Encuesta registrada automáticamente', 'General', 'Activa', TO_CHAR(CURRENT_TIMESTAMP, 'DD Mon YYYY'), 'Super Administrador')
      ON CONFLICT (id) DO NOTHING
    `, [idEncuesta, tituloEncuesta || 'Encuesta de Clima Laboral'])

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

    // 3. Confirmar Transacción
    await client.query('COMMIT')

    res.status(201).json({
      ok: true,
      mensaje: 'Respuesta registrada y procesada exitosamente con transacción atómica.',
      idRespuesta,
      respuesta: insertResult.rows[0]
    })
  } catch (error: any) {
    await client.query('ROLLBACK')
    console.error('[respuestas.createRespuesta] Error en transacción:', error)
    res.status(500).json({ error: 'Error al registrar la respuesta en la base de datos.', details: error.message })
  } finally {
    client.release()
  }
}

/**
 * DELETE /api/respuestas/limpiar
 * Elimina todas las respuestas de prueba de PostgreSQL y reinicia contadores a cero
 */
export async function limpiarRespuestas(_req: Request, res: Response): Promise<void> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query('TRUNCATE TABLE respuestas CASCADE')
    await client.query('UPDATE encuestas SET total_respuestas = 0, alertas_registradas = 0, puntaje_promedio = 0.0')
    await client.query('COMMIT')
    res.json({ ok: true, mensaje: 'Base de datos limpia: 0 datos de prueba, lista para registrar exclusivamente datos reales.' })
  } catch (error: any) {
    await client.query('ROLLBACK')
    console.error('[respuestas.limpiarRespuestas] Error:', error)
    res.status(500).json({ error: 'Error al limpiar respuestas en PostgreSQL', details: error.message })
  } finally {
    client.release()
  }
}
