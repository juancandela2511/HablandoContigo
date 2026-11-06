/**
 * ============================================================================
 * CONTRATOS Y ESTADO BASE DE AUTENTICACIÓN (tiposAuth.ts)
 * ============================================================================
 * Define interfaces de usuario y lectura segura de sesión en localStorage en español.
 */

import type { RolCuenta, GeneroUsuario } from '@/shared/types/common.types'
import { obtenerPerfilActualizadoLocal } from './respaldoCorporativo'

export const CLAVE_ALMACENAMIENTO_SESION = 'hablandocontigo_usuario_sesion'
export const CLAVE_ALMACENAMIENTO_TOKEN = 'hablandocontigo_auth_token'

export interface Usuario {
  id: string
  nombre: string
  email: string
  rol: RolCuenta
  departamento: string
  avatar: string
  fotoUrl?: string
  ultimoAcceso?: string
  biografia?: string
  telefono?: string
  bloqueEstudio?: string
  genero?: GeneroUsuario | string
  emailPrimerIngreso?: string
}

export function obtenerUsuarioInicial(): Usuario | null {
  if (typeof window === 'undefined') return null
  const sesionGuardada = window.localStorage.getItem(CLAVE_ALMACENAMIENTO_SESION)
  if (sesionGuardada) {
    try {
      const u = JSON.parse(sesionGuardada)
      if (u?.email) {
        const local = obtenerPerfilActualizadoLocal(u.email)
        return local ? { ...u, ...local } : u
      }
      return u
    } catch {}
  }
  return null
}
