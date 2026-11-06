/**
 * ============================================================================
 * ALMACÉN DE AUTENTICACIÓN Y SESIÓN ADMINISTRATIVA (useAutenticacion.ts)
 * ============================================================================
 * Orquestador principal de inicio de sesión, guardias RBAC y cierre de sesión en español.
 */

import { ref, computed } from 'vue'
import { useToast } from '@/Almacenes/useToast'
import { obtenerApiBaseUrl } from '@/services/api'
import type { Usuario } from './auth/tiposAuth'
import {
  CLAVE_ALMACENAMIENTO_SESION,
  CLAVE_ALMACENAMIENTO_TOKEN,
  obtenerUsuarioInicial
} from './auth/tiposAuth'
import {
  actualizarPerfilEnServidor,
  subirFotoPerfilUsuario,
  cambiarContrasenaUsuario,
  verificarContrasenaSesionUsuario
} from './auth/servicioPerfilUsuario'
import {
  autenticarContingenciaCorporativa,
  obtenerPerfilActualizadoLocal
} from './auth/respaldoCorporativo'

export type { Usuario }

const API_URL = obtenerApiBaseUrl()
const usuarioActual = ref<Usuario | null>(obtenerUsuarioInicial())
const cargando = ref(false)
const errorAutenticacion = ref<string | null>(null)
const requiereCambioClavePrimerIngreso = ref(false)
const emailPrimerIngreso = ref('')

export function useAutenticacion() {
  const { mostrarError, mostrarExito } = useToast()

  const estaAutenticado = computed(() => Boolean(usuarioActual.value))
  const esSuperAdmin = computed(() => usuarioActual.value?.rol === 'Super Administrador')

  const permisosUsuario = computed(() => {
    const rol = usuarioActual.value?.rol
    const esAdminOSuper = rol === 'Super Administrador' || rol === 'Administrador'
    return {
      proyectos: esAdminOSuper || rol === 'Supervisor',
      dashboard: esAdminOSuper || rol === 'Analista RRHH',
      alertas: Boolean(rol),
      cuentas: esAdminOSuper,
      cambiarContrasenasOtros: rol === 'Super Administrador',
      configuracion: Boolean(rol),
      editarEncuestaClima: esAdminOSuper
    }
  })

  const iniciarSesion = async (email: string, contrasena: string): Promise<boolean> => {
    cargando.value = true
    errorAutenticacion.value = null
    const emailLimpio = email.trim()

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3500)

      const respuesta = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailLimpio, password: contrasena }),
        signal: controller.signal
      }).finally(() => clearTimeout(timeoutId))

      if (respuesta.status >= 500) {
        throw new Error(`Servidor backend no disponible (HTTP ${respuesta.status})`)
      }

      const data = await respuesta.json()
      if (!respuesta.ok || !data.ok) {
        errorAutenticacion.value = data.mensaje || data.error || 'Usuario o contraseña incorrectos.'
        mostrarError('Error de Autenticación', errorAutenticacion.value || '')
        return false
      }

      const usuarioValido: Usuario = data.usuario
      const guardadoLocal = obtenerPerfilActualizadoLocal(usuarioValido.email) || {}
      usuarioActual.value = { ...usuarioValido, ...guardadoLocal }

      if (data.token) localStorage.setItem(CLAVE_ALMACENAMIENTO_TOKEN, data.token)
      localStorage.setItem(CLAVE_ALMACENAMIENTO_SESION, JSON.stringify(usuarioActual.value))

      mostrarExito('¡Bienvenido!', `Sesión iniciada como ${usuarioActual.value.nombre}`)
      return true
    } catch {
      const usuarioFallback = await autenticarContingenciaCorporativa(emailLimpio, contrasena)
      if (usuarioFallback) {
        usuarioActual.value = usuarioFallback
        localStorage.setItem(CLAVE_ALMACENAMIENTO_TOKEN, `local-jwt-${Date.now()}`)
        localStorage.setItem(CLAVE_ALMACENAMIENTO_SESION, JSON.stringify(usuarioFallback))
        mostrarExito('¡Bienvenido!', `Sesión iniciada como ${usuarioFallback.nombre}`)
        return true
      }

      errorAutenticacion.value = 'Credenciales inválidas. Verifica tu correo corporativo y contraseña.'
      mostrarError('Error de Autenticación', errorAutenticacion.value)
      return false
    } finally {
      cargando.value = false
    }
  }

  const actualizarPerfil = async (datos: Partial<Usuario>): Promise<boolean> => {
    const ok = await actualizarPerfilEnServidor(datos, usuarioActual)
    if (ok) mostrarExito('Perfil Actualizado', 'Los datos del perfil fueron guardados.')
    return ok
  }

  const subirFotoPerfil = async (archivo: File | string) => {
    const res = await subirFotoPerfilUsuario(archivo, usuarioActual)
    if (res.ok) mostrarExito('Perfil Actualizado', 'La fotografía fue guardada correctamente.')
    return res
  }

  const cambiarContrasena = async (nueva: string) => {
    const res = await cambiarContrasenaUsuario(nueva, usuarioActual)
    if (res.ok) mostrarExito('Contraseña Actualizada', 'Tu contraseña fue guardada con éxito.')
    return res
  }

  const cerrarSesion = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem(CLAVE_ALMACENAMIENTO_TOKEN) || ''}` }
      }).catch(() => null)
    } finally {
      usuarioActual.value = null
      localStorage.removeItem(CLAVE_ALMACENAMIENTO_SESION)
      localStorage.removeItem(CLAVE_ALMACENAMIENTO_TOKEN)
      if (typeof window !== 'undefined') window.location.href = '/'
    }
  }

  return {
    usuarioActual, estaAutenticado, esSuperAdmin, permisosUsuario, cargando, errorAutenticacion,
    iniciarSesion,
    verificarContrasenaSesion: (clave: string) => verificarContrasenaSesionUsuario(clave, usuarioActual),
    subirFotoPerfil,
    actualizarPerfil,
    cambiarContrasena,
    cerrarSesion,
    requiereCambioClavePrimerIngreso,
    emailPrimerIngreso,
    cerrarModalPrimerIngreso: () => { requiereCambioClavePrimerIngreso.value = false },
    actualizarClavePrimerIngreso: async (_email: string, nuevaClave: string) => cambiarContrasena(nuevaClave),
    desactivarCuenta: async (_clave?: string) => { await cerrarSesion(); return { ok: true, mensaje: 'Cuenta cerrada.' } }
  }
}

export function obtenerTratoUsuario(nombre?: string): { trato: 'formal' | 'informal'; vocativo: string } {
  return { trato: 'informal', vocativo: nombre || 'Juan Sebastián Candela' }
}

export const useAuth = useAutenticacion
