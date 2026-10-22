/**
 * ============================================================================
 * ALMACÉN DE SESIÓN SEGURA (useSesionSegura)
 * ============================================================================
 *
 * Implementa seguridad de sesión por inactividad:
 * - Si el usuario no interactúa durante TIEMPO_INACTIVIDAD_MS (15 min),
 *   aparece un modal con cuenta regresiva de TIEMPO_AVISO_SEGUNDOS (60 s).
 * - Si no responde, limpia el almacenamiento local y redirige a '/'.
 */

import { ref, readonly } from 'vue'

// ─── Constantes configurables ──────────────────────────────────────────────────

/** Tiempo sin actividad (ms) antes de mostrar el modal de advertencia */
const TIEMPO_INACTIVIDAD_MS = 15 * 60 * 1000 // 15 minutos

/** Segundos de cuenta regresiva en el modal antes de cerrar sesión */
const TIEMPO_AVISO_SEGUNDOS = 60

/** Clave de sesión en localStorage */
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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const CLAVE_TOKEN = 'hablandocontigo_auth_token'

function limpiarSesionLocal(): void {
  localStorage.removeItem(CLAVE_SESION)
  localStorage.removeItem(CLAVE_TOKEN)
}

async function ejecutarCierreSesion(): Promise<void> {
  limpiarSesionLocal()
  
  try {
    await fetch(`${API_URL}/auth/logout`, { method: 'POST' })
  } catch (e) {
    console.warn('[SesionSegura] Error notificando al backend:', e)
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

// ─── Composable público ────────────────────────────────────────────────────────

export function useSesionSegura() {
  function iniciarVigilancia(): void {
    if (vigilanciaActiva) return
    vigilanciaActiva = true
    EVENTOS_ACTIVIDAD.forEach(evento => {
      window.addEventListener(evento, reiniciarTimerInactividad, { passive: true })
    })
    reiniciarTimerInactividad()
  }

  function detenerVigilancia(): void {
    if (!vigilanciaActiva) return
    vigilanciaActiva = false
    EVENTOS_ACTIVIDAD.forEach(evento => {
      window.removeEventListener(evento, reiniciarTimerInactividad)
    })
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