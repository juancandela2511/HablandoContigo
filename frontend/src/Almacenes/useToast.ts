/**
 * ============================================================================
 * ALMACÉN DE NOTIFICACIONES TOAST (useToast.ts)
 * ============================================================================
 * Gestión reactiva global de mensajes de retroalimentación flotantes.
 */

import { ref } from 'vue'

export type TipoToast = 'exito' | 'error' | 'advertencia' | 'info' | 'aviso'

export interface Toast {
  id: string
  tipo: TipoToast
  titulo: string
  mensaje: string
  duracion: number
}

const toasts = ref<Toast[]>([])

export function useToast() {
  const cerrarToast = (id: string) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const mostrarToast = (tipo: TipoToast, titulo: string, mensaje: string, duracion: number = 4000) => {
    const id = Math.random().toString(36).substring(2, 9)
    toasts.value.push({ id, tipo, titulo, mensaje, duracion })
    if (duracion > 0) {
      setTimeout(() => cerrarToast(id), duracion)
    }
  }

  const mostrarExito = (titulo: string, mensaje: string, duracion?: number) => mostrarToast('exito', titulo, mensaje, duracion)
  const mostrarError = (titulo: string, mensaje: string, duracion?: number) => mostrarToast('error', titulo, mensaje, duracion)
  const mostrarAdvertencia = (titulo: string, mensaje: string, duracion?: number) => mostrarToast('advertencia', titulo, mensaje, duracion)
  const mostrarAviso = (titulo: string, mensaje: string, duracion?: number) => mostrarToast('aviso', titulo, mensaje, duracion)
  const mostrarInfo = (titulo: string, mensaje: string, duracion?: number) => mostrarToast('info', titulo, mensaje, duracion)

  return {
    toasts,
    mostrarToast,
    mostrarExito,
    mostrarError,
    mostrarAdvertencia,
    mostrarAviso,
    mostrarInfo,
    cerrarToast,
    eliminar: cerrarToast
  }
}
