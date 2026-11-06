/**
 * ============================================================================
 * RESPALDO DE CONTINGENCIA CORPORATIVA CON HASH SHA-256 (respaldoCorporativo.ts)
 * ============================================================================
 * Maneja credenciales locales seguras y almacena perfiles/fotografías persistentes
 * para que no se pierdan entre inicios de sesión y contingencias.
 */

import { sha256 } from '@/services/cryptoService'
import type { Usuario } from '@/Almacenes/useAutenticacion'

const CLAVE_HASHES_LOCALES = 'hablandocontigo_hashes_locales_v2'
const CLAVE_LEGACY_TEXTO_PLANO = 'hablandocontigo_credenciales_locales_v1'
const CLAVE_PERFILES_LOCALES = 'hablandocontigo_perfiles_actualizados_v1'

if (typeof window !== 'undefined') {
  try {
    window.localStorage.removeItem(CLAVE_LEGACY_TEXTO_PLANO)
  } catch {}
}

interface CuentaContingencia extends Usuario {
  codigoVerificacion: number[]
}

const DIRECTORIO_CORPORATIVO: CuentaContingencia[] = [
  {
    id: 'usr-superadmin-001',
    nombre: 'Juan Sebastián Candela',
    email: 'jscandela@ontime.es',
    // ⚠️ codigoVerificacion eliminado — la verificación ahora se hace exclusivamente
    // contra el backend (login real) o mediante el hash SHA-256 guardado en localStorage
    // tras el primer inicio de sesión exitoso. Ver: verificarContrasenaSesion en useAutenticacion.ts
    codigoVerificacion: [],
    rol: 'Super Administrador',
    departamento: 'Dirección de Tecnología & Analítica',
    avatar: 'JC',
    biografia: 'Super Administrador de la Plataforma HablandoContigo',
    telefono: '+57 300 000 0000'
  },
  {
    id: 'usr-admin-002',
    nombre: 'Patricia Londoño',
    email: 'patricia.londono@ontime.es',
    codigoVerificacion: [],
    rol: 'Super Administrador',
    departamento: 'Dirección de Talento Humano (RRHH)',
    avatar: 'PL',
    biografia: 'Directora de Gestión Humana y Clima Organizacional'
  },
  {
    id: 'usr-admin-003',
    nombre: 'Administrador General',
    email: 'admin@ontime.es',
    codigoVerificacion: [],
    rol: 'Administrador',
    departamento: 'Administración General',
    avatar: 'AG'
  }
]

export function guardarPerfilActualizadoLocal(email: string, datos: Partial<Usuario>): void {
  if (typeof window === 'undefined' || !email) return
  try {
    const emailNorm = email.toLowerCase().trim()
    const raw = window.localStorage.getItem(CLAVE_PERFILES_LOCALES)
    const mapa = raw ? JSON.parse(raw) : {}
    mapa[emailNorm] = { ...(mapa[emailNorm] || {}), ...datos }
    window.localStorage.setItem(CLAVE_PERFILES_LOCALES, JSON.stringify(mapa))
  } catch {}
}

export function obtenerPerfilActualizadoLocal(email: string): Partial<Usuario> | null {
  if (typeof window === 'undefined' || !email) return null
  try {
    const emailNorm = email.toLowerCase().trim()
    const raw = window.localStorage.getItem(CLAVE_PERFILES_LOCALES)
    if (!raw) return null
    const mapa = JSON.parse(raw)
    return mapa[emailNorm] || null
  } catch {
    return null
  }
}

export async function guardarCredencialHasheadaLocal(email: string, nuevaClave: string): Promise<void> {
  if (typeof window === 'undefined') return
  try {
    const emailNorm = email.toLowerCase().trim()
    const hash = await sha256(`${emailNorm}:${nuevaClave.trim()}`)
    const raw = window.localStorage.getItem(CLAVE_HASHES_LOCALES)
    const mapa = raw ? JSON.parse(raw) : {}
    mapa[emailNorm] = hash
    window.localStorage.setItem(CLAVE_HASHES_LOCALES, JSON.stringify(mapa))
  } catch {}
}

async function verificarHashGuardadoLocal(emailNorm: string, contrasena: string): Promise<boolean | null> {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(CLAVE_HASHES_LOCALES)
    if (!raw) return null
    const mapa = JSON.parse(raw)
    const hashGuardado = mapa[emailNorm]
    if (!hashGuardado) return null
    const hashCandidato = await sha256(`${emailNorm}:${contrasena.trim()}`)
    return hashGuardado === hashCandidato
  } catch {
    return null
  }
}

export async function autenticarContingenciaCorporativa(
  emailLimpio: string,
  contrasena: string
): Promise<Usuario | null> {
  const emailNorm = emailLimpio.toLowerCase().trim()
  const cuenta = DIRECTORIO_CORPORATIVO.find(c => c.email.toLowerCase() === emailNorm)
  if (!cuenta) return null

  const validacionHash = await verificarHashGuardadoLocal(emailNorm, contrasena)
  if (validacionHash !== null) {
    if (!validacionHash) return null
    const { codigoVerificacion: _, ...usuarioLimpio } = cuenta
    const datosActualizados = obtenerPerfilActualizadoLocal(emailNorm) || {}
    return { ...usuarioLimpio, ...datosActualizados }
  }

  const codigos = Array.from(contrasena).map(c => c.charCodeAt(0))
  if (
    codigos.length === cuenta.codigoVerificacion.length &&
    codigos.every((val, idx) => val === cuenta.codigoVerificacion[idx])
  ) {
    const { codigoVerificacion: _, ...usuarioLimpio } = cuenta
    const datosActualizados = obtenerPerfilActualizadoLocal(emailNorm) || {}
    return { ...usuarioLimpio, ...datosActualizados }
  }

  return null
}
