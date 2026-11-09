/**
 * ============================================================================
 * CONTROLADOR DE CUENTAS (server/src/controllers/cuentasController.ts)
 * ============================================================================
 * Maneja el registro y gestión de usuarios/cuentas administrativas en Postgres.
 */

import { Request, Response } from 'express'
import { pool } from '../config/db.js'

/**
 * GET /api/cuentas
 * Obtiene el listado de usuarios y cuentas administrativas
 */
export async function getCuentas(req: Request, res: Response): Promise<void> {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        nombre,
        email,
        rol,
        departamento,
        avatar,
        foto_url AS "fotoUrl",
        biografia,
        telefono,
        estado,
        created_at AS "createdAt"
      FROM cuentas
      ORDER BY created_at DESC
    `)

    res.json(result.rows)
  } catch (error: any) {
    console.error('[cuentasController] Error al obtener cuentas:', error)
    res.status(500).json({ error: 'Error al consultar usuarios en la base de datos', details: error.message })
  }
}

/**
 * POST /api/cuentas
 * Crea un nuevo usuario o cuenta administrativa
 */
export async function createCuenta(req: Request, res: Response): Promise<void> {
  try {
    const { nombre, email, rol, departamento, avatar, fotoUrl, biografia, telefono, password, contrasena } = req.body

    if (!nombre || !email) {
      res.status(400).json({ error: 'Nombre y correo electrónico son requeridos' })
      return
    }

    const claveInicial = password || contrasena || '1012332747Js'
    const insertResult = await pool.query(`
      INSERT INTO usuarios (nombre, email, password_hash, rol, departamento, avatar, foto_url, biografia, telefono, estado)
      VALUES ($1, $2, crypt($3, gen_salt('bf', 10)), $4, $5, $6, $7, $8, $9, 'Activo')
      RETURNING id::text AS id, nombre, email, rol, departamento, avatar, foto_url AS "fotoUrl", biografia, telefono, estado, created_at AS "createdAt"
    `, [
      nombre,
      email.toLowerCase().trim(),
      claveInicial,
      rol || 'Administrador',
      departamento || 'General',
      avatar || '',
      fotoUrl || '',
      biografia || '',
      telefono || ''
    ])

    res.status(201).json({ message: 'Cuenta creada exitosamente', cuenta: insertResult.rows[0] })
  } catch (error: any) {
    console.error('[cuentasController] Error al crear cuenta:', error)
    res.status(500).json({ error: 'Error al registrar la cuenta', details: error.message })
  }
}

/**
 * PUT /api/cuentas/:id
 * Actualiza los datos de un usuario por su ID
 */
export async function updateCuenta(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const { nombre, email, rol, departamento, avatar, fotoUrl, biografia, telefono, estado } = req.body

    const updateResult = await pool.query(`
      UPDATE usuarios
      SET 
        nombre = COALESCE($1, nombre),
        email = COALESCE($2, email),
        rol = COALESCE($3, rol),
        departamento = COALESCE($4, departamento),
        avatar = COALESCE($5, avatar),
        foto_url = COALESCE($6, foto_url),
        biografia = COALESCE($7, biografia),
        telefono = COALESCE($8, telefono),
        estado = COALESCE($9, estado),
        updated_at = CURRENT_TIMESTAMP
      WHERE id::text = $10
      RETURNING id::text AS id, nombre, email, rol, departamento, avatar, foto_url AS "fotoUrl", biografia, telefono, estado, created_at AS "createdAt"
    `, [nombre, email ? email.toLowerCase().trim() : null, rol, departamento, avatar, fotoUrl, biografia, telefono, estado, id])

    if (updateResult.rows.length === 0) {
      res.status(404).json({ error: 'Usuario no encontrado' })
      return
    }

    res.json({ message: 'Usuario actualizado exitosamente', cuenta: updateResult.rows[0] })
  } catch (error: any) {
    console.error('[cuentasController] Error al actualizar cuenta:', error)
    res.status(500).json({ error: 'Error al actualizar el usuario', details: error.message })
  }
}

/**
 * DELETE /api/cuentas/:id
 * Elimina una cuenta de usuario por su ID
 */
export async function deleteCuenta(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const deleteResult = await pool.query('DELETE FROM usuarios WHERE id::text = $1 RETURNING id::text AS id', [id])

    if (deleteResult.rows.length === 0) {
      res.status(404).json({ error: 'Usuario no encontrado' })
      return
    }

    res.json({ message: 'Usuario eliminado exitosamente' })
  } catch (error: any) {
    console.error('[cuentasController] Error al eliminar cuenta:', error)
    res.status(500).json({ error: 'Error al eliminar el usuario', details: error.message })
  }
}
