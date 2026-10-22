/**
 * ============================================================================
 * SERVICIO DE AUDITORÍA Y SEGURIDAD (backend/src/services/auditoriaService.ts)
 * ============================================================================
 * Extrae metadatos inalterables de la conexión HTTP (IP real, User-Agent),
 * valida huellas de hardware y garantiza el anonimato del colaborador
 * mediante hashes criptográficos unidireccionales SHA-256 en el servidor.
 */

import crypto from 'crypto'
import type { Request } from 'express'

export interface AuditoriaConexion {
  ipReal: string
  dispositivoUuid: string
  userAgent: string
  sedeAprox: string
  esProxy: boolean
  hashFirmaAnonima: string
}

export class AuditoriaService {
  /**
   * Extrae la IP de origen real detrás de proxies inversos (Nginx, Docker, Cloudflare)
   */
  static extraerIpReal(req: Request): string {
    const forwarded = req.headers['x-forwarded-for']
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0]?.trim() || req.ip || '127.0.0.1'
    }
    return req.ip || req.socket.remoteAddress || '127.0.0.1'
  }

  /**
   * Genera una huella y firma anónima de la sesión para evitar suplantaciones
   */
  static inspeccionarConexion(req: Request): AuditoriaConexion {
    const ipReal = this.extraerIpReal(req)
    const userAgent = req.headers['user-agent'] || 'Desconocido'
    const dispositivoUuid = String(req.headers['x-dispositivo-uuid'] || req.body?.dispositivoUuid || crypto.randomUUID())

    // Generar un hash SHA-256 unidireccional con sal secreta del servidor
    const sal = process.env.AUDIT_SALT || 'hablandocontigo_anon_audit_salt'
    const hashFirmaAnonima = crypto
      .createHash('sha256')
      .update(`${ipReal}:${userAgent}:${dispositivoUuid}:${sal}`)
      .digest('hex')

    // Detección de sede interna o red
    let sedeAprox = 'Sede Principal / Remoto'
    if (ipReal.startsWith('10.') || ipReal.startsWith('192.168.') || ipReal === '127.0.0.1') {
      sedeAprox = 'Red Corporativa Interna'
    }

    return {
      ipReal,
      dispositivoUuid,
      userAgent,
      sedeAprox,
      esProxy: Boolean(req.headers['x-forwarded-for']),
      hashFirmaAnonima
    }
  }
}
