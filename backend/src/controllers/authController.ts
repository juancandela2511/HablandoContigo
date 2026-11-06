/**
 * ============================================================================
 * CONTROLADOR DE AUTENTICACIÓN Y SESIÓN (Backend/src/controllers/authController.ts)
 * ============================================================================
 * Manejo de inicio de sesión con JWT, validación criptográfica y persistencia
 * atómica de perfiles y fotografías en PostgreSQL.
 */

import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { pool } from '../config/db.js'

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
    console.error('[authController.login] Error interno:', error)
    res.status(500).json({ ok: false, error: 'Error interno en el servidor de autenticación.' })
  }
}

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
    console.error('[authController.me] Error consultando perfil:', error)
    res.status(500).json({ ok: false, error: 'Error al consultar datos del usuario.' })
  }
}

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
    console.error('[authController.cambiarContrasena] Error:', error)
    res.status(500).json({ ok: false, error: 'Error al actualizar contraseña.' })
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
    console.error('[authController.actualizarPerfil] Error:', error)
    res.status(500).json({ ok: false, error: 'Error al actualizar perfil.', details: error.message })
  }
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.json({ ok: true, mensaje: 'Sesión finalizada exitosamente.' })
}
