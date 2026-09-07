/**
 * ============================================================================
 * ALMACÉN DE SESIÓN SEGURA (useSesionSegura)
 * ============================================================================
 *
 * Implementa dos capas de seguridad de sesión:
 *
 * 1. INACTIVIDAD: Si el usuario no interactúa durante TIEMPO_INACTIVIDAD_MS
 *    (15 minutos por defecto), aparece un modal con cuenta regresiva de
 *    TIEMPO_AVISO_SEGUNDOS. Si no responde, cierra sesión.
 *
 * 2. CIERRE DE PESTAÑA/VENTANA: Listener beforeunload que limpia la sesión
 *    local de forma síncrona y solicita signOut a Supabase.
 *
 * Vinculado con: useAuth.ts, App.vue, ModalInactividad.vue
 */

import { ref, readonly } from 'vue'
import { supabase } from '@/supabase'

// ─── Constantes configurables ──────────────────────────────────────────────────

/** Tiempo sin actividad (ms) antes de mostrar el modal de advertencia */
const TIEMPO_INACTIVIDAD_MS = 15 * 60 * 1000 // 15 minutos

/** Segundos de cuenta regresiva en el modal antes de cerrar sesión */
const TIEMPO_AVISO_SEGUNDOS = 60

/** Clave de sesión en localStorage (misma que useAuth) */
const CLAVE_SESION = 'hablandocontigo_usuario_sesion'

/** Eventos que se consideran "actividad del usuario" */
const EVENTOS_ACTIVIDAD: (keyof WindowEventMap)[] = [
  'mousemove',
  'mousedown',
  'keydown',
  'touchstart',
  'scroll',
  'click',
  'wheel'
]

// ─── Estado reactivo (singleton) ──────────────────────────────────────────────

const mostrarModalInactividad = ref(false)
const segundosRestantes = ref(TIEMPO_AVISO_SEGUNDOS)

// ─── Referencias internas ──────────────────────────────────────────────────────

let timerInactividad: ReturnType<typeof setTimeout> | null = null
let timerCuentaRegresiva: ReturnType<typeof setInterval> | null = null
let vigilanciaActiva = false

// ─── Helpers internos ─────────────────────────────────────────────────────────

function limpiarSesionLocal(): void {
  localStorage.removeItem(CLAVE_SESION)
}

async function ejecutarCierreSesion(): Promise<void> {
  limpiarSesionLocal()
  try {
    await supabase.auth.signOut()
  } catch (e) {
    console.warn('[SesionSegura] Error cerrando sesión en Supabase:', e)
  }
  if (typeof window !== 'undefined') {
    window.location.href = '/'
  }
}

function limpiarTimers(): void {
  if (timerInactividad !== null) {
    clearTimeout(timerInactividad)
    timerInactividad = null
  }
  if (timerCuentaRegresiva !== null) {
    clearInterval(timerCuentaRegresiva)
    timerCuentaRegresiva = null
  }
}

function iniciarCuentaRegresiva(): void {
  segundosRestantes.value = TIEMPO_AVISO_SEGUNDOS
  limpiarTimers()

  timerCuentaRegresiva = setInterval(() => {
    segundosRestantes.value -= 1
    if (segundosRestantes.value <= 0) {
      limpiarTimers()
      mostrarModalInactividad.value = false
      ejecutarCierreSesion()
    }
  }, 1_000)
}

function mostrarAvisoInactividad(): void {
  mostrarModalInactividad.value = true
  iniciarCuentaRegresiva()
}

function reiniciarTimerInactividad(): void {
  if (mostrarModalInactividad.value) return
  limpiarTimers()
  timerInactividad = setTimeout(() => {
    mostrarAvisoInactividad()
  }, TIEMPO_INACTIVIDAD_MS)
}

function manejarCierrePestana(): void {
  limpiarSesionLocal()
  try {
    supabase.auth.signOut()
  } catch (_) {
    // best-effort al cerrar pestaña
  }
}

// ─── Composable público ────────────────────────────────────────────────────────

export function useSesionSegura() {
  function iniciarVigilancia(): void {
    if (vigilanciaActiva) return
    vigilanciaActiva = true
    EVENTOS_ACTIVIDAD.forEach(evento => {
      window.addEventListener(evento, reiniciarTimerInactividad, { passive: true })
    })
    window.addEventListener('beforeunload', manejarCierrePestana)
    reiniciarTimerInactividad()
  }

  function detenerVigilancia(): void {
    if (!vigilanciaActiva) return
    vigilanciaActiva = false
    EVENTOS_ACTIVIDAD.forEach(evento => {
      window.removeEventListener(evento, reiniciarTimerInactividad)
    })
    window.removeEventListener('beforeunload', manejarCierrePestana)
    limpiarTimers()
    mostrarModalInactividad.value = false
  }

  function continuarSesion(): void {
    limpiarTimers()
    mostrarModalInactividad.value = false
    reiniciarTimerInactividad()
  }

  async function cerrarSesionPorInactividad(): Promise<void> {
    limpiarTimers()
    mostrarModalInactividad.value = false
    detenerVigilancia()
    await ejecutarCierreSesion()
  }

  return {
    mostrarModalInactividad: readonly(mostrarModalInactividad),
    segundosRestantes: readonly(segundosRestantes),
    tiempoInactividadMinutos: TIEMPO_INACTIVIDAD_MS / 60_000,
    iniciarVigilancia,
    detenerVigilancia,
    continuarSesion,
    cerrarSesionPorInactividad
  }
}
