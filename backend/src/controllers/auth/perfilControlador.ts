/**
 * ============================================================================
 * CONTROLADOR DE PERFIL DE USUARIO (perfilControlador.ts)
 * ============================================================================
 * Permite consultar y actualizar los datos del perfil y avatar del usuario autenticado.
 */

import { Request, Response } from 'express'
import { pool } from '../../config/db.js'

export async function me(req: Request, res: Response): Promise<void> {
  try {
    const usuarioAuth = req.usuario
    if (!usuarioAuth || !usuarioAuth.id) {
      res.status(401).json({ ok: false, error: 'Sesión no válida o expirada.' })
      return
    }

    const result = await pool.query(`
      SELECT id, nombre, email, rol, departamento, avatar, foto_url, biografia, telefono, estado, created_at
      FROM usuarios
      WHERE id = $1
    `, [usuarioAuth.id])

    if (result.rows.length === 0) {
      res.status(404).json({ ok: false, error: 'Usuario no encontrado en la base de datos.' })
      return
    }

    const u = result.rows[0]
    res.json({
      ok: true,
      usuario: {
        id: u.id,
        nombre: u.nombre,
        email: u.email,
        rol: u.rol,
        departamento: u.departamento,
        avatar: u.avatar || '',
        fotoUrl: u.foto_url || u.avatar || '',
        biografia: u.biografia || '',
        telefono: u.telefono || '',
        estado: u.estado
      }
    })
  } catch (error: any) {
    console.error('[auth.me] Error consultando perfil:', error)
    res.status(500).json({ ok: false, error: 'Error al consultar datos del usuario.' })
  }
}

export async function actualizarPerfil(req: Request, res: Response): Promise<void> {
  try {
    const { nombre, departamento, biografia, avatar, fotoUrl, telefono, email } = req.body
    const idUsuario = req.usuario?.id
    const emailUsuario = (req.usuario?.email || email || '').trim().toLowerCase()

    if (!idUsuario && !emailUsuario) {
      res.status(400).json({ ok: false, error: 'Identificador o correo del usuario no proporcionado.' })
      return
    }

    const fotoFinal = fotoUrl || avatar || null

    let updateRes = await pool.query(`
      UPDATE usuarios
      SET 
        nombre = COALESCE($1, nombre),
        departamento = COALESCE($2, departamento),
        biografia = COALESCE($3, biografia),
        avatar = COALESCE($4, avatar),
        foto_url = COALESCE($5, foto_url),
        telefono = COALESCE($6, telefono),
        updated_at = CURRENT_TIMESTAMP
      WHERE (id::text = $7 OR LOWER(email) = $8)
      RETURNING id, nombre, email, rol, departamento, avatar, foto_url, biografia, telefono
    `, [nombre, departamento, biografia, fotoFinal, fotoFinal, telefono, idUsuario || '', emailUsuario])

    if (updateRes.rows.length === 0 && emailUsuario) {
      updateRes = await pool.query(`
        UPDATE usuarios
        SET 
          nombre = COALESCE($1, nombre),
          departamento = COALESCE($2, departamento),
          biografia = COALESCE($3, biografia),
          avatar = COALESCE($4, avatar),
          foto_url = COALESCE($5, foto_url),
          telefono = COALESCE($6, telefono),
          updated_at = CURRENT_TIMESTAMP
        WHERE LOWER(email) = $7
        RETURNING id, nombre, email, rol, departamento, avatar, foto_url, biografia, telefono
      `, [nombre, departamento, biografia, fotoFinal, fotoFinal, telefono, emailUsuario])
    }

    if (emailUsuario) {
      await pool.query(`
        UPDATE cuentas
        SET 
          avatar = COALESCE($1, avatar),
          foto_url = COALESCE($2, foto_url)
        WHERE LOWER(email) = $3
      `, [fotoFinal, fotoFinal, emailUsuario]).catch(() => {})
    }

    if (updateRes.rows.length === 0) {
      res.status(404).json({ ok: false, error: 'Perfil de usuario no encontrado en la base de datos.' })
      return
    }

    res.json({ ok: true, mensaje: 'Perfil y fotografía guardados exitosamente.', usuario: updateRes.rows[0] })
  } catch (error: any) {
    console.error('[auth.actualizarPerfil] Error:', error)
    res.status(500).json({ ok: false, error: 'Error al actualizar perfil.', details: error.message })
  }
}
