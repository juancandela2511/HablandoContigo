/**
 * ============================================================================
 * PERSISTENCIA DE HISTÓRICO DE PERIODOS (persistenciaHistorico.ts)
 * ============================================================================
 * Administra el almacenamiento local y la sincronización con el backend en español.
 */

import { obtenerApiBaseUrl } from '@/services/api'
import type { RegistroHistoricoPeriodo } from './tiposHistorico'

const API_URL = obtenerApiBaseUrl()
export const STORAGE_KEY_HISTORICO = 'hablandocontigo_historico_periodos_v2'

export function cargarHistoricoDeLocalStorage(): RegistroHistoricoPeriodo[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORICO)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch (e) {
    console.warn('[Historico] Error leyendo localStorage:', e)
  }
  return []
}

export function guardarHistoricoEnLocalStorage(items: RegistroHistoricoPeriodo[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY_HISTORICO, JSON.stringify(items))
  } catch (e) {
    console.warn('[Historico] Error guardando en localStorage:', e)
  }
}

export async function sincronizarHistoricoDesdeBackend(): Promise<RegistroHistoricoPeriodo[] | null> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 1500)

    const respuesta = await fetch(`${API_URL}/historico-periodos`, {
      signal: controller.signal
    }).catch(() => null)

    clearTimeout(timeoutId)

    if (respuesta && respuesta.ok) {
      const data = await respuesta.json()
      if (Array.isArray(data) && data.length > 0) {
        return data.map((item: any) => ({
          id: item.id,
          idEncuesta: item.id_encuesta || 'enc-001',
          tituloPeriodo: item.titulo_periodo || `Periodo ${item.anio}`,
          anio: Number(item.anio) || 2025,
          fechaCierre: item.fecha_cierre || new Date().toISOString(),
          totalRespuestas: Number(item.total_respuestas) || 0,
          alertasRegistradas: Number(item.alertas_registradas) || 0,
          puntajePromedio: Number(item.puntaje_promedio) || 0,
          porcentajeSatisfaccion: Number(item.porcentaje_satisfaccion) || 0,
          desgloseBloques: Array.isArray(item.desglose_bloques) ? item.desglose_bloques : [],
          cerradoPor: item.cerrado_por || 'Super Administrador',
          notas: item.notas || ''
        }))
      }
    }
  } catch {}
  return null
}
