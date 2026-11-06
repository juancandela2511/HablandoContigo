/**
 * ============================================================================
 * CONTROLADOR DE CAMBIO DE CONTRASEÑA (contrasenaControlador.ts)
 * ============================================================================
 * Permite cambiar la contraseña de forma segura encriptándola con bcrypt (salt 12).
 */

import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { pool } from '../../config/db.js'

export async function cambiarContrasena(req: Request, res: Response): Promise<void> {
  try {
    const { nuevaContrasena, email } = req.body
    if (!req.usuario?.email) {
      res.status(401).json({ ok: false, error: 'Sesión no autorizada.' })
      return
    }

    if (!nuevaContrasena || nuevaContrasena.length < 6) {
      res.status(400).json({ ok: false, error: 'La nueva contraseña debe tener mínimo 6 caracteres.' })
      return
    }

    const esSuperAdmin = req.usuario.rol === 'Super Administrador'
    const emailSolicitado = typeof email === 'string' ? email.trim().toLowerCase() : ''
    const emailAutenticado = req.usuario.email.trim().toLowerCase()

    if (emailSolicitado && emailSolicitado !== emailAutenticado && !esSuperAdmin) {
      res.status(403).json({ ok: false, error: 'No tiene permisos para modificar la contraseña de otro usuario.' })
      return
    }

    const emailTarget = esSuperAdmin && emailSolicitado ? emailSolicitado : emailAutenticado

    // Hashear la contraseña con bcrypt antes de guardarla (NUNCA texto plano)
    const saltRounds = 12
    const hashSeguro = await bcrypt.hash(nuevaContrasena, saltRounds)

    const updateRes = await pool.query(`
      UPDATE usuarios
      SET password_hash = $1
      WHERE LOWER(email) = $2
      RETURNING id, nombre, email
    `, [hashSeguro, emailTarget])

    if (updateRes.rows.length === 0) {
      res.status(404).json({ ok: false, error: 'No se encontró el usuario para actualizar contraseña.' })
      return
    }

    res.json({ ok: true, mensaje: 'Contraseña actualizada y encriptada con bcrypt exitosamente.' })
  } catch (error: any) {
    console.error('[auth.cambiarContrasena] Error:', error)
    res.status(500).json({ ok: false, error: 'Error al actualizar contraseña.' })
  }
}
