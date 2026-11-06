/**
 * ============================================================================
 * SINCRONIZADOR REMOTO CON POSTGRESQL (sincronizadorBackend.ts)
 * ============================================================================
 * Sincroniza encuestas y respuestas entre localStorage y el servidor Backend.
 */

import { obtenerApiBaseUrl } from '@/services/api'
import type { Encuesta, RegistroRespuesta } from './tiposEncuestas'
import { fusionarPreguntasConConfiguracion } from './normalizadorPreguntas'
import { calcularPuntajeDeRegistro } from '@/services/calculadorClimaService'
import bloquesJson from '@/database/bloques.json'
import preguntasJson from '@/database/preguntas.json'
import {
  TITULO_ENCUESTA_CLIMA_INTEGRAL,
  DESCRIPCION_ENCUESTA_CLIMA_INTEGRAL
} from '@/Config/preguntasCuestionario'
import {
  encuestasBaseDefault,
  obtenerEncuestasLocalesGuardadas,
  obtenerRespuestasLocalesGuardadas,
  persistirEncuestasEnLocalStorage,
  persistirRespuestasEnLocalStorage
} from './persistenciaEncuestas'

const API_URL = obtenerApiBaseUrl()

export async function sincronizarProyectoEnBackend(encuesta: Encuesta): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/encuestas/${encuesta.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo: encuesta.titulo,
        descripcion: encuesta.descripcion,
        departamento: encuesta.departamento,
        estado: encuesta.estado,
        bloques: encuesta.bloques || [],
        preguntas: encuesta.preguntas || [],
        metadata: {
          estadoFrontend: encuesta.estado,
          bloques: encuesta.bloques || [],
          fechaCreacion: encuesta.fechaCreacion,
          fechaFinalizacion: encuesta.fechaFinalizacion,
          fechaFinalizacionISO: encuesta.fechaFinalizacionISO,
          limiteReversionISO: encuesta.limiteReversionISO,
          porcentajeClimaFinal: encuesta.porcentajeClimaFinal,
          anioCierre: encuesta.anioCierre,
          totalRespuestas: encuesta.totalRespuestas,
          alertasRegistradas: encuesta.alertasRegistradas,
          puntajePromedio: encuesta.puntajePromedio,
          idProyectoOrigen: encuesta.idProyectoOrigen,
          respuestasArchivadas: encuesta.respuestasArchivadas
        }
      })
    })
    return res.ok
  } catch {
    return false
  }
}

export async function eliminarProyectoEnBackend(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/encuestas/${id}`, { method: 'DELETE' })
    return res.ok
  } catch {
    return false
  }
}

function ordenarProyectos(lista: Encuesta[]): Encuesta[] {
  const master = lista.find(e => e.id === 'enc-001')
  const otros = lista.filter(e => e.id !== 'enc-001')
  return master ? [master, ...otros] : otros
}

export async function cargarEncuestasUnificadas(encuestasEnMemoria: Encuesta[] = []): Promise<Encuesta[]> {
  try {
    const resBackend = await fetch(`${API_URL}/encuestas`, { signal: AbortSignal.timeout(2500) }).catch(() => null)
    const localesPostFetch = obtenerEncuestasLocalesGuardadas()
    const mapaLocal = new Map<string, Encuesta>()

    localesPostFetch.forEach(e => { if (e && e.id) mapaLocal.set(e.id, e) })
    encuestasEnMemoria.forEach(e => {
      if (e && e.id) {
        const prev = mapaLocal.get(e.id)
        mapaLocal.set(e.id, prev ? { ...prev, ...e } : e)
      }
    })

    const todasLocales = Array.from(mapaLocal.values())

    if (resBackend && resBackend.ok) {
      const dataBackend = await resBackend.json()
      if (Array.isArray(dataBackend) && dataBackend.length > 0) {
        const normalizadasBackend: Encuesta[] = dataBackend.map((enc: any) => {
          const localMatch = mapaLocal.get(enc.id)
          const encMeta = typeof enc.metadata === 'string' ? JSON.parse(enc.metadata) : (enc.metadata || {})
          const estadoReal = localMatch?.estado || encMeta.estadoFrontend || (enc.estado === 'Cerrada' ? 'Finalizada' : enc.estado) || 'Activa'

          return {
            ...enc,
            titulo: localMatch?.titulo || enc.titulo,
            descripcion: localMatch?.descripcion || enc.descripcion,
            departamento: localMatch?.departamento || enc.departamento,
            estado: estadoReal,
            fechaCreacion: localMatch?.fechaCreacion || encMeta.fechaCreacion || enc.fechaCreacion,
            fechaFinalizacion: localMatch?.fechaFinalizacion ?? encMeta.fechaFinalizacion ?? enc.fechaFinalizacion,
            fechaFinalizacionISO: localMatch?.fechaFinalizacionISO ?? encMeta.fechaFinalizacionISO ?? enc.fechaFinalizacionISO,
            limiteReversionISO: localMatch?.limiteReversionISO ?? encMeta.limiteReversionISO ?? enc.limiteReversionISO,
            porcentajeClimaFinal: localMatch?.porcentajeClimaFinal ?? encMeta.porcentajeClimaFinal ?? enc.porcentajeClimaFinal,
            anioCierre: localMatch?.anioCierre ?? encMeta.anioCierre ?? enc.anioCierre,
            idProyectoOrigen: localMatch?.idProyectoOrigen ?? encMeta.idProyectoOrigen ?? enc.idProyectoOrigen,
            respuestasArchivadas: localMatch?.respuestasArchivadas ?? encMeta.respuestasArchivadas ?? enc.respuestasArchivadas,
            bloques: (localMatch?.bloques && localMatch.bloques.length > 0)
              ? localMatch.bloques
              : (Array.isArray(enc.bloques) && enc.bloques.length >= 8 ? enc.bloques : bloquesJson),
            preguntas: enc.id === 'enc-001'
              ? fusionarPreguntasConConfiguracion((localMatch?.preguntas && localMatch.preguntas.length > 0) ? localMatch.preguntas : enc.preguntas)
              : ((localMatch?.preguntas && localMatch.preguntas.length > 0) ? localMatch.preguntas : (Array.isArray(enc.preguntas) && enc.preguntas.length > 0 ? enc.preguntas : (preguntasJson as any[])))
          }
        })

        const idsBackend = new Set(normalizadasBackend.map(d => d.id))
        const extrasLocales = todasLocales.filter(l => !idsBackend.has(l.id))
        extrasLocales.forEach(extra => { sincronizarProyectoEnBackend(extra).catch(() => {}) })

        const listaFinal = ordenarProyectos([...normalizadasBackend, ...extrasLocales])
        persistirEncuestasEnLocalStorage(listaFinal)
        return listaFinal
      }
    }
  } catch {}

  const encuestasLocales = obtenerEncuestasLocalesGuardadas()
  if (encuestasLocales.length > 0) {
    encuestasLocales.forEach(enc => {
      if (enc.id === 'enc-001') {
        enc.bloques = Array.isArray(enc.bloques) && enc.bloques.length >= 8 ? enc.bloques : bloquesJson
        enc.preguntas = fusionarPreguntasConConfiguracion(enc.preguntas)
        enc.titulo = enc.titulo || TITULO_ENCUESTA_CLIMA_INTEGRAL
        enc.descripcion = enc.descripcion || DESCRIPCION_ENCUESTA_CLIMA_INTEGRAL
      }
    })
    const ordenadas = ordenarProyectos(encuestasLocales)
    persistirEncuestasEnLocalStorage(ordenadas)
    return ordenadas
  }

  const baseOrdenada = ordenarProyectos([...encuestasBaseDefault])
  persistirEncuestasEnLocalStorage(baseOrdenada)
  return baseOrdenada
}

export async function cargarRespuestasUnificadas(respuestasEnMemoria: RegistroRespuesta[] = []): Promise<RegistroRespuesta[]> {
  try {
    const resBackend = await fetch(`${API_URL}/respuestas`, { signal: AbortSignal.timeout(2000) }).catch(() => null)
    const localesPostFetch = obtenerRespuestasLocalesGuardadas()
    const mapaUnificado = new Map<string, RegistroRespuesta>()

    localesPostFetch.forEach(r => { if (r && r.idRespuesta) mapaUnificado.set(r.idRespuesta, r) })
    respuestasEnMemoria.forEach(r => {
      if (r && r.idRespuesta) {
        mapaUnificado.set(r.idRespuesta, { ...r, puntajeGeneral: calcularPuntajeDeRegistro(r.respuestas, r.puntajeGeneral).puntajePromedio })
      }
    })

    if (resBackend && resBackend.ok) {
      const data = await resBackend.json()
      if (Array.isArray(data)) {
        data.forEach((r: any) => {
          if (r && r.idRespuesta) {
            mapaUnificado.set(r.idRespuesta, {
              ...r,
              dispositivoUUID: r.dispositivoUUID || r.dispositivoUuid || 'anonimo',
              nombreEquipoPC: r.nombreEquipoPC || r.nombreEquipoPc || 'Anónimo',
              cuentaUsuarioPC: r.cuentaUsuarioPC || r.cuentaUsuarioPc || 'anonimo',
              timestampISO: r.timestampISO || r.timestampIso || new Date().toISOString(),
              puntajeGeneral: calcularPuntajeDeRegistro(r.respuestas, r.puntajeGeneral).puntajePromedio
            })
          }
        })
      }
    }

    const listaFinal = Array.from(mapaUnificado.values())
    persistirRespuestasEnLocalStorage(listaFinal)
    return listaFinal
  } catch {
    const locales = obtenerRespuestasLocalesGuardadas()
    return locales.length > 0 ? locales : respuestasEnMemoria
  }
}
