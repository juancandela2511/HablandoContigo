/**
 * ============================================================================
 * MIDDLEWARE DE AUTENTICACIÓN JWT (Backend/src/middlewares/authMiddleware.ts)
 * ============================================================================
 * Valida el Bearer Token JWT en los encabezados HTTP para proteger rutas privadas
 * y ofrece soporte flexible para persistencia de contingencia.
 */

import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'hablandocontigo_super_secret_jwt_key_2026_enterprise_998877'

export interface UsuarioAuthPayload {
  id: string
  nombre: string
  email: string
  rol: string
  departamento?: string
}

declare global {
  namespace Express {
    interface Request {
      usuario?: UsuarioAuthPayload
    }
  }
}

export function verificarToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ ok: false, error: 'Acceso no autorizado. Token no proporcionado o formato inválido.' })
    return
  }

  const token = authHeader.split(' ')[1]
  try {
    const payload = jwt.verify(token, JWT_SECRET) as UsuarioAuthPayload
    req.usuario = payload
    next()
  } catch (err: any) {
    res.status(401).json({ ok: false, error: 'Token inválido o expirado.', details: err.message })
  }
}

export function verificarTokenFlexible(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]
    try {
      const payload = jwt.verify(token, JWT_SECRET) as UsuarioAuthPayload
      req.usuario = payload
    } catch {}
  }
  next()
}
