/**
 * ============================================================================
 * CONTROL DE VERSIÓN DE LA APLICACIÓN (versionApp.ts)
 * ============================================================================
 * Define el número de versión oficial del sistema en la esquina inferior derecha.
 * No es editable por el usuario en la interfaz; únicamente se actualiza en este
 * archivo cuando el usuario lo solicite explícitamente (ej: 1.0, 1.1, etc.).
 */

import { readonly, ref } from 'vue'

/**
 * Número de versión oficial controlado exclusivamente por código.
 * Incrementar únicamente cuando el usuario lo indique (ej: '1.0', '1.1', '1.2'...).
 */
export const VERSION_APP = '1.1'

const CLAVE_STORAGE_VERSION = 'hablandocontigo_version_personalizada'
const CLAVE_BASE_CODIGO = 'hablandocontigo_version_base_codigo'

// Limpieza de claves obsoletas para evitar que ediciones antiguas del usuario persistan
if (typeof window !== 'undefined') {
  try {
    window.localStorage.removeItem(CLAVE_STORAGE_VERSION)
    window.localStorage.removeItem(CLAVE_BASE_CODIGO)
  } catch {}
}

const versionActual = ref<string>(VERSION_APP)

export function useVersionApp() {
  return {
    versionActual: readonly(versionActual)
  }
}
