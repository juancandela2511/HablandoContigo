/**
 * ============================================================================
 * SERVICIO DE IDENTIDAD ANÓNIMA (UUID) Y FECHA/HORA (uuidService.ts)
 * ============================================================================
 */

const CLAVE_UUID_DISPOSITIVO = 'hablandocontigo_dispositivo_uuid'

export interface FechaYHoraResult {
  fecha: string
  hora: string
  timestampISO: string
}

/**
 * Obtiene o crea un UUID persistente y único para identificar el dispositivo/navegador anónimo.
 */
export function obtenerUuidDispositivo(): string {
  if (typeof localStorage === 'undefined') {
    return 'uuid-servidor-fallback'
  }

  let uuid = localStorage.getItem(CLAVE_UUID_DISPOSITIVO)
  if (!uuid) {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      uuid = crypto.randomUUID()
    } else {
      uuid = 'dev-' + Math.random().toString(36).substring(2, 15) + '-' + Date.now().toString(36)
    }
    localStorage.setItem(CLAVE_UUID_DISPOSITIVO, uuid)
  }
  return uuid
}

export const obtenerODefinirDispositivoUUID = obtenerUuidDispositivo

/**
 * Obtiene la fecha y hora actual formateada en español.
 */
export function obtenerFechaYHoraActual(): FechaYHoraResult {
  const ahora = new Date()
  return {
    fecha: ahora.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    hora: ahora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    timestampISO: ahora.toISOString()
  }
}
