/**
 * ============================================================================
 * SISTEMA DE NOTIFICACIONES TOAST GLOBAL (useToast.ts)
 * ============================================================================
 *
 * ¿QUÉ ES Y QUÉ HACE?
 * Almacén reactivo de notificaciones toast visuales (errores, éxitos, avisos).
 * Es COMPLETAMENTE LOCAL — no escribe en Supabase. Sirve exclusivamente para
 * dar feedback visual al usuario cuando una operación de Supabase falla o tiene éxito.
 *
 * ¿PARA QUÉ SIRVE?
 * - Mostrar mensajes de error cuando Supabase rechaza una operación.
 * - Confirmar éxito al usuario cuando un dato se guardó correctamente.
 *
 * ¿CON QUÉ ESTÁ VINCULADO / CONECTADO?
 * - Todos los stores: useEncuestas, useNotificaciones, useCuentas, useAuth, useEstadisticas.
 * - ToastNotificaciones.vue: Renderiza la cola de toasts en pantalla.
 */

import { ref } from 'vue'

export type TipoToast = 'error' | 'exito' | 'aviso'

export interface ToastItem {
  id: string
  tipo: TipoToast
  titulo: string
  descripcion: string
  duracion?: number
}

// Cola global de toasts (solo en memoria)
const toasts = ref<ToastItem[]>([])

/**
 * Comprueba si existe una sesión activa almacenada
 */
const sesionActiva = (): boolean => {
  try {
    return !!localStorage.getItem('hablandocontigo_usuario_sesion')
  } catch {
    return false
  }
}

/**
 * Sanitiza cualquier texto para erradicar nombres técnicos de backend
 */
const sanitizar = (texto: string): string => {
  if (!texto) return ''
  return texto
    .replace(/supabase\s*auth/gi, 'Servidor de Autenticación')
    .replace(/supabase/gi, 'Servidor Central')
    .replace(/pgrst\d+/gi, '')
    .replace(/postgres(ql)?/gi, 'Base de Datos')
    .replace(/cuentas_admin/gi, 'usuarios')
}

export function useToast() {
  /**
   * Agrega un toast a la cola y lo elimina automáticamente tras `duracion` ms
   */
  const agregar = (tipo: TipoToast, titulo: string, descripcion: string, duracion = 5000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    toasts.value.push({ 
      id, 
      tipo, 
      titulo: sanitizar(titulo), 
      descripcion: sanitizar(descripcion), 
      duracion 
    })
    setTimeout(() => eliminar(id), duracion)
  }

  const mostrarError = (titulo: string, descripcion: string) => {
    // Si no ha iniciado sesión, NUNCA mostrar errores técnicos ni alertas en pantalla
    if (!sesionActiva()) {
      return
    }
    agregar('error', titulo, descripcion, 7000)
  }

  const mostrarExito = (titulo: string, descripcion: string) =>
    agregar('exito', titulo, descripcion, 4000)

  const mostrarAviso = (titulo: string, descripcion: string) => {
    if (!sesionActiva()) {
      return
    }
    agregar('aviso', titulo, descripcion, 5000)
  }

  const eliminar = (id: string) => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  return { toasts, mostrarError, mostrarExito, mostrarAviso, eliminar }
}
