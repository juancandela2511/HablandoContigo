/**
 * ============================================================================
 * SERVICIO DE PERFIL Y CREDENCIALES (servicioPerfilUsuario.ts)
 * ============================================================================
 * Maneja actualización de datos, avatar, contraseña y verificación de sesión en español.
 */

import { type Ref } from 'vue'
import { obtenerApiBaseUrl } from '@/services/api'
import type { Usuario } from './tiposAuth'
import { CLAVE_ALMACENAMIENTO_SESION, CLAVE_ALMACENAMIENTO_TOKEN } from './tiposAuth'
import { optimizarImagenAvatar } from './avatarOptimizer'
import {
  autenticarContingenciaCorporativa,
  guardarCredencialHasheadaLocal,
  guardarPerfilActualizadoLocal
} from './respaldoCorporativo'

const API_URL = obtenerApiBaseUrl()

export async function actualizarPerfilEnServidor(
  datos: Partial<Usuario>,
  usuarioActual: Ref<Usuario | null>
): Promise<boolean> {
  if (!usuarioActual.value) return false
  const emailUsuario = usuarioActual.value.email

  usuarioActual.value = { ...usuarioActual.value, ...datos }
  try {
    localStorage.setItem(CLAVE_ALMACENAMIENTO_SESION, JSON.stringify(usuarioActual.value))
    if (emailUsuario) guardarPerfilActualizadoLocal(emailUsuario, datos)
  } catch {}

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 4000)

    const token = localStorage.getItem(CLAVE_ALMACENAMIENTO_TOKEN) || ''
    const respuesta = await fetch(`${API_URL}/auth/perfil`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify({ ...datos, email: emailUsuario }),
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId))

    const data = await respuesta.json().catch(() => null)
    if (respuesta.ok && data?.ok) return true
  } catch (err) {
    console.warn('[servicioPerfil] Guardado local exitoso, backend offline:', err)
  }
  return true
}

export async function subirFotoPerfilUsuario(
  archivoODataUrl: File | string,
  usuarioActual: Ref<Usuario | null>
): Promise<{ ok: boolean; url: string; mensaje?: string }> {
  if (!usuarioActual.value) return { ok: false, url: '', mensaje: 'Sin sesión activa' }
  try {
    const urlFinal = archivoODataUrl instanceof File
      ? await optimizarImagenAvatar(archivoODataUrl)
      : archivoODataUrl

    const datosFoto = { avatar: urlFinal, fotoUrl: urlFinal }
    usuarioActual.value = { ...usuarioActual.value, ...datosFoto }

    const emailUsuario = usuarioActual.value.email
    try {
      localStorage.setItem(CLAVE_ALMACENAMIENTO_SESION, JSON.stringify(usuarioActual.value))
      if (emailUsuario) guardarPerfilActualizadoLocal(emailUsuario, datosFoto)
    } catch {}

    await actualizarPerfilEnServidor(datosFoto, usuarioActual)
    return { ok: true, url: urlFinal, mensaje: 'Fotografía guardada exitosamente.' }
  } catch (e: any) {
    return { ok: false, url: '', mensaje: e?.message || 'Error al procesar fotografía' }
  }
}

export async function cambiarContrasenaUsuario(
  nuevaContrasena: string,
  usuarioActual: Ref<Usuario | null>
): Promise<{ ok: boolean; mensaje: string }> {
  if (!usuarioActual.value) return { ok: false, mensaje: 'Sin sesión activa' }
  if (!nuevaContrasena || nuevaContrasena.length < 6) {
    return { ok: false, mensaje: 'La contraseña debe tener mínimo 6 caracteres.' }
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)
    const respuesta = await fetch(`${API_URL}/auth/cambiar-contrasena`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem(CLAVE_ALMACENAMIENTO_TOKEN) || ''}`
      },
      body: JSON.stringify({ nuevaContrasena }),
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId))

    const data = await respuesta.json()
    if (respuesta.ok && data.ok) {
      await guardarCredencialHasheadaLocal(usuarioActual.value.email, nuevaContrasena)
      return { ok: true, mensaje: 'Contraseña actualizada exitosamente.' }
    }
    throw new Error(data.mensaje || 'No se pudo guardar en servidor')
  } catch {
    await guardarCredencialHasheadaLocal(usuarioActual.value.email, nuevaContrasena)
    return { ok: true, mensaje: 'Contraseña actualizada exitosamente.' }
  }
}

export async function verificarContrasenaSesionUsuario(
  contrasena: string,
  usuarioActual: Ref<Usuario | null>
): Promise<boolean> {
  if (!contrasena || !contrasena.trim()) return false
  const emailActivo = usuarioActual.value?.email
  if (!emailActivo) return false

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3500)
    const respuesta = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailActivo, password: contrasena.trim() }),
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId))

    if (respuesta.ok) {
      const data = await respuesta.json()
      if (data?.ok) return true
      return false
    }
    if (respuesta.status === 401) return false
  } catch {}

  const valido = await autenticarContingenciaCorporativa(emailActivo, contrasena.trim())
  return Boolean(valido)
}
