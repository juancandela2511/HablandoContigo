/**
 * ============================================================================
 * SERVICIO DE PERSISTENCIA EN LOCALSTORAGE (persistenciaEncuestas.ts)
 * ============================================================================
 * Administra la lectura y escritura en almacenamiento local y re-exporta
 * las funciones de sincronización bidireccional con PostgreSQL.
 */

import type { Encuesta, RegistroRespuesta } from './tiposEncuestas'
import { calcularPuntajeDeRegistro } from '@/services/calculadorClimaService'
import bloquesJson from '@/database/bloques.json'
import preguntasJson from '@/database/preguntas.json'
import encuestasJson from '@/database/encuestas.json'
import { PLANTILLA_CLIMA_INTEGRAL_DETALLADA } from '@/Config/preguntasCuestionario'

export const STORAGE_KEYS = {
  encuestas: 'hablandocontigo_encuestas',
  proyectosBackup: 'hablandocontigo_proyectos_guardados_v2',
  respuestas: 'hablandocontigo_respuestas',
  respuestasBackup: 'hablandocontigo_respuestas_guardadas_v2'
}

export const encuestasBaseDefault: Encuesta[] = (encuestasJson || []).map((e: any) => ({
  ...e,
  estado: e.estado || 'Activa',
  bloques: e.bloques || bloquesJson,
  preguntas: (preguntasJson && preguntasJson.length > 0 ? preguntasJson : PLANTILLA_CLIMA_INTEGRAL_DETALLADA) as any[]
}))

export function persistirEncuestasEnLocalStorage(encuestas: Encuesta[]): void {
  if (typeof window !== 'undefined' && Array.isArray(encuestas) && encuestas.length > 0) {
    try {
      const serializado = JSON.stringify(encuestas)
      window.localStorage.setItem(STORAGE_KEYS.encuestas, serializado)
      window.localStorage.setItem(STORAGE_KEYS.proyectosBackup, serializado)
    } catch {}
  }
}

export function persistirRespuestasEnLocalStorage(respuestas: RegistroRespuesta[]): void {
  if (typeof window !== 'undefined' && Array.isArray(respuestas)) {
    try {
      const serializado = JSON.stringify(respuestas)
      window.localStorage.setItem(STORAGE_KEYS.respuestas, serializado)
      window.localStorage.setItem(STORAGE_KEYS.respuestasBackup, serializado)
    } catch {}
  }
}

export function obtenerRespuestasLocalesGuardadas(): RegistroRespuesta[] {
  if (typeof window === 'undefined') return []
  try {
    const rawBackup = window.localStorage.getItem(STORAGE_KEYS.respuestasBackup)
    const rawMain = window.localStorage.getItem(STORAGE_KEYS.respuestas)
    const listaBackup: RegistroRespuesta[] = rawBackup ? JSON.parse(rawBackup) : []
    const listaMain: RegistroRespuesta[] = rawMain ? JSON.parse(rawMain) : []
    const mapa = new Map<string, RegistroRespuesta>()

    const agregar = (lista: RegistroRespuesta[]) => {
      if (!Array.isArray(lista)) return
      lista.forEach(item => {
        if (item && item.idRespuesta) {
          mapa.set(item.idRespuesta, {
            ...item,
            puntajeGeneral: calcularPuntajeDeRegistro(item.respuestas, item.puntajeGeneral).puntajePromedio
          })
        }
      })
    }

    agregar(listaMain)
    agregar(listaBackup)
    return Array.from(mapa.values())
  } catch {
    return []
  }
}

export function obtenerEncuestasLocalesGuardadas(): Encuesta[] {
  if (typeof window === 'undefined') return []
  try {
    const rawBackup = window.localStorage.getItem(STORAGE_KEYS.proyectosBackup)
    const rawMain = window.localStorage.getItem(STORAGE_KEYS.encuestas)
    const listaBackup: Encuesta[] = rawBackup ? JSON.parse(rawBackup) : []
    const listaMain: Encuesta[] = rawMain ? JSON.parse(rawMain) : []
    const mapa = new Map<string, Encuesta>()

    if (Array.isArray(listaMain)) listaMain.forEach(item => { if (item && item.id) mapa.set(item.id, item) })
    if (Array.isArray(listaBackup)) listaBackup.forEach(item => { if (item && item.id) mapa.set(item.id, item) })
    return Array.from(mapa.values())
  } catch {
    return []
  }
}

export {
  sincronizarProyectoEnBackend,
  eliminarProyectoEnBackend,
  cargarEncuestasUnificadas,
  cargarRespuestasUnificadas
} from './sincronizadorBackend'
