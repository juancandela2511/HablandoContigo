/**
 * ============================================================================
 * CATÁLOGO DE LAS 11 ALERTAS PRINCIPALES (catalogoAlertasPrincipales.ts)
 * ============================================================================
 * Orquestador principal que re-exporta los catálogos troncales, el mapa
 * pregunta-alerta y los ayudantes de consulta en español.
 */

import type { TipoAlertaPersonalizada } from './useTiposAlertas'
import { ALERTAS_NIVEL_1_Y_2 } from './alertas/alertasNivel1y2'
import { ALERTAS_NIVEL_3_Y_4 } from './alertas/alertasNivel3y4'
import { MAPA_PREGUNTA_A_ALERTA } from './alertas/mapaPreguntasAlertas'

export { MAPA_PREGUNTA_A_ALERTA }

export const TIPOS_ALERTAS_CATALOGO: TipoAlertaPersonalizada[] = [
  ...ALERTAS_NIVEL_1_Y_2,
  ...ALERTAS_NIVEL_3_Y_4
]

/**
 * Obtiene la definición y configuración de una alerta del catálogo por su ID.
 */
export function obtenerTipoAlertaPorId(id?: string | number) {
  if (!id) return undefined
  const idStr = String(id)
  const item = TIPOS_ALERTAS_CATALOGO.find(a => a.id === idStr)
  if (!item) return undefined
  return {
    ...item,
    severidadPorDefecto: item.severidad,
    colorHex: item.color
  }
}

export const obtenerAlertaPorId = obtenerTipoAlertaPorId
