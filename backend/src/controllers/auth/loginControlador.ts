/**
 * ============================================================================
 * CONTROLADOR DE INICIO Y CIERRE DE SESIÓN (loginControlador.ts)
 * ============================================================================
 * Procesa la autenticación de usuarios con JWT y validación criptográfica
 * mediante pgcrypto y bcrypt en PostgreSQL.
 */

import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { pool } from '../../config/db.js'

const JWT_SECRET = process.env.JWT_SECRET || 'hablandocontigo_super_secret_jwt_key_2026_enterprise_998877'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ ok: false, error: 'Debe ingresar el correo electrónico y la contraseña.' })
      return
    }

    const emailNorm = email.trim().toLowerCase()
    const userResult = await pool.query(`
      SELECT id, nombre, email, password_hash, rol, departamento, avatar, foto_url, biografia, telefono, estado
      FROM usuarios
      WHERE LOWER(email) = $1
    `, [emailNorm])

    if (userResult.rows.length === 0) {
      res.status(401).json({ ok: false, error: 'Credenciales inválidas. Cuenta no encontrada.' })
      return
    }

    const usuario = userResult.rows[0]
    if (usuario.estado !== 'Activo') {
      res.status(403).json({ ok: false, error: 'La cuenta se encuentra inactiva o suspendida.' })
      return
    }

    const cryptoCheck = await pool.query(
      `SELECT (password_hash = crypt($1, password_hash)) AS es_valida FROM usuarios WHERE id = $2`,
      [password, usuario.id]
    )

    let esPasswordValida = Boolean(cryptoCheck.rows[0]?.es_valida)
    if (!esPasswordValida && usuario.password_hash) {
      try {
        esPasswordValida = await bcrypt.compare(password, usuario.password_hash)
      } catch {
        esPasswordValida = false
      }
    }

    if (!esPasswordValida) {
      res.status(401).json({ ok: false, error: 'Contraseña incorrecta. Por favor intente de nuevo.' })
      return
    }

    const tokenPayload = {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      departamento: usuario.departamento
    }

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: (JWT_EXPIRES_IN as any) || '7d' })

    res.json({
      ok: true,
      mensaje: 'Autenticación exitosa',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        departamento: usuario.departamento,
        avatar: usuario.avatar || '',
        fotoUrl: usuario.foto_url || usuario.avatar || '',
        biografia: usuario.biografia || '',
        telefono: usuario.telefono || ''
      }
    })
  } catch (error: any) {
    console.error('[auth.login] Error interno:', error)
    res.status(500).json({ ok: false, error: 'Error interno en el servidor de autenticación.' })
  }
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.json({ ok: true, mensaje: 'Sesión finalizada exitosamente.' })
}
