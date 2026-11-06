/**
 * ============================================================================
 * SERVICIO DE GESTIÓN Y CICLO DE VIDA DE PROYECTOS (servicioProyectos.ts)
 * ============================================================================
 * Administra la creación, edición, eliminación, finalización y reversión
 * dentro del plazo de 3 días hábiles garantizando persistencia en BD y local.
 */

import { type Ref } from 'vue'
import type { Encuesta, RegistroRespuesta } from './tiposEncuestas'
import {
  persistirEncuestasEnLocalStorage,
  persistirRespuestasEnLocalStorage,
  sincronizarProyectoEnBackend,
  eliminarProyectoEnBackend
} from './persistenciaEncuestas'
import { calcularLimiteDiasHabiles, esReversionValida } from '@/services/diasHabilesService'
import { calcularClimaGlobalDeRespuestas } from '@/services/calculadorClimaService'
import { BLOQUES_ENCUESTA_CLIMA } from '@/Config/preguntasCuestionario'

export async function crearNuevoProyecto(
  nueva: Omit<Encuesta, 'id' | 'fechaCreacion'>,
  encuestasRef: Ref<Encuesta[]>
): Promise<Encuesta> {
  const fechaHoy = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })

  const registro: Encuesta = {
    ...nueva,
    id: `enc-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    fechaCreacion: fechaHoy,
    bloques: nueva.bloques && nueva.bloques.length > 0
      ? nueva.bloques
      : JSON.parse(JSON.stringify(BLOQUES_ENCUESTA_CLIMA)),
    totalRespuestas: 0,
    alertasRegistradas: 0,
    puntajePromedio: 5.0,
    estado: nueva.estado || 'Activa'
  }

  encuestasRef.value.push(registro)
  persistirEncuestasEnLocalStorage(encuestasRef.value)

  // Persistir en PostgreSQL para que no se pierda al recargar o cerrar sesión
  await sincronizarProyectoEnBackend(registro)

  return registro
}

export async function editarProyectoExistente(
  id: string,
  datos: Partial<Encuesta>,
  encuestasRef: Ref<Encuesta[]>
): Promise<boolean> {
  const encuesta = encuestasRef.value.find(e => e.id === id)
  if (!encuesta) {
    const nueva: Encuesta = {
      id,
      titulo: datos.titulo ?? 'Nuevo Proyecto',
      descripcion: datos.descripcion ?? '',
      departamento: datos.departamento ?? 'General',
      creadoPor: 'Super Administrador',
      fechaCreacion: new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }),
      estado: datos.estado ?? 'Activa',
      bloques: datos.bloques ?? JSON.parse(JSON.stringify(BLOQUES_ENCUESTA_CLIMA)),
      preguntas: datos.preguntas ?? [],
      preguntasSeguimiento: datos.preguntasSeguimiento ?? [],
      totalRespuestas: 0,
      alertasRegistradas: 0,
      puntajePromedio: 5.0
    }
    encuestasRef.value.push(nueva)
  } else {
    Object.assign(encuesta, datos)
  }

  persistirEncuestasEnLocalStorage(encuestasRef.value)

  const encActualizada = encuestasRef.value.find(e => e.id === id)
  if (encActualizada) {
    await sincronizarProyectoEnBackend(encActualizada)
  }

  return true
}

export async function eliminarProyectoExistente(
  id: string,
  encuestasRef: Ref<Encuesta[]>,
  respuestasRef: Ref<RegistroRespuesta[]>
): Promise<boolean> {
  const indice = encuestasRef.value.findIndex(e => e.id === id)
  if (indice !== -1) {
    encuestasRef.value.splice(indice, 1)
  }
  respuestasRef.value = respuestasRef.value.filter(r => r.idEncuesta !== id)
  persistirEncuestasEnLocalStorage(encuestasRef.value)
  persistirRespuestasEnLocalStorage(respuestasRef.value)
  await eliminarProyectoEnBackend(id)
  return true
}

export async function finalizarProyectoConReversion(
  idEncuesta: string,
  encuestasRef: Ref<Encuesta[]>,
  respuestasRef: Ref<RegistroRespuesta[]>
): Promise<Encuesta | null> {
  const encOriginal = encuestasRef.value.find(e => e.id === idEncuesta) || encuestasRef.value[0]
  if (!encOriginal) return null

  const respuestasActuales = respuestasRef.value.filter(r =>
    r.idEncuesta === idEncuesta || (idEncuesta === 'enc-001' && (!r.idEncuesta || r.idEncuesta === 'enc-001'))
  )

  const copiaRespuestas: RegistroRespuesta[] = JSON.parse(JSON.stringify(respuestasActuales))
  const totalResp = copiaRespuestas.length
  const totalAlertas = copiaRespuestas.reduce((acc, r) => acc + (r.alertasDetectadas?.length || 0), 0)
  const evalClima = calcularClimaGlobalDeRespuestas(copiaRespuestas)
  const puntajeProm = evalClima.puntajePromedio
  const porcentajeClima = evalClima.porcentajeClima

  const ahora = new Date()
  const anioActual = ahora.getFullYear()
  const fechaFin = ahora.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
  const limiteReversion = calcularLimiteDiasHabiles(ahora, 3)

  // Asignar estado Finalizada y ventana de 3 días hábiles
  encOriginal.estado = 'Finalizada'
  encOriginal.totalRespuestas = totalResp
  encOriginal.alertasRegistradas = totalAlertas
  encOriginal.puntajePromedio = puntajeProm
  encOriginal.porcentajeClimaFinal = porcentajeClima
  encOriginal.anioCierre = anioActual
  encOriginal.fechaFinalizacion = fechaFin
  encOriginal.fechaFinalizacionISO = ahora.toISOString()
  encOriginal.limiteReversionISO = limiteReversion.toISOString()
  encOriginal.respuestasArchivadas = copiaRespuestas

  persistirRespuestasEnLocalStorage(respuestasRef.value)
  persistirEncuestasEnLocalStorage(encuestasRef.value)

  await sincronizarProyectoEnBackend(encOriginal)

  return encOriginal
}

export async function revertirProyectoFinalizado(
  idEncuesta: string,
  encuestasRef: Ref<Encuesta[]>,
  respuestasRef: Ref<RegistroRespuesta[]>
): Promise<{ ok: boolean; mensaje: string }> {
  const enc = encuestasRef.value.find(e => e.id === idEncuesta)
  if (!enc) {
    return { ok: false, mensaje: 'No se encontró el proyecto a revertir.' }
  }

  // Validar plazo de 3 días hábiles
  if (enc.limiteReversionISO && !esReversionValida(enc.limiteReversionISO)) {
    return {
      ok: false,
      mensaje: 'El periodo de 3 días hábiles para revertir este proyecto ha expirado.'
    }
  }

  // Restaurar respuestas archivadas
  if (Array.isArray(enc.respuestasArchivadas) && enc.respuestasArchivadas.length > 0) {
    const idsExistentes = new Set(respuestasRef.value.map(r => r.idRespuesta))
    enc.respuestasArchivadas.forEach(r => {
      if (!idsExistentes.has(r.idRespuesta)) {
        const idDestino = enc.idProyectoOrigen || enc.id
        respuestasRef.value.unshift({
          ...r,
          idEncuesta: idDestino
        })
      }
    })
  }

  // Si es un clon de tarjeta archivada legacy, reactivar el padre y eliminar el clon
  if (enc.idProyectoOrigen && enc.id.startsWith('enc-archivada-')) {
    const padre = encuestasRef.value.find(p => p.id === enc.idProyectoOrigen)
    if (padre) {
      padre.estado = 'Activa'
      padre.fechaFinalizacion = undefined
      padre.fechaFinalizacionISO = undefined
      padre.limiteReversionISO = undefined
      padre.porcentajeClimaFinal = undefined
      padre.totalRespuestas = enc.totalRespuestas || padre.totalRespuestas
      padre.puntajePromedio = enc.puntajePromedio || padre.puntajePromedio
      padre.alertasRegistradas = enc.alertasRegistradas || padre.alertasRegistradas
    }
    encuestasRef.value = encuestasRef.value.filter(e => e.id !== enc.id)
    await eliminarProyectoEnBackend(enc.id)
  } else {
    // Revertir el proyecto en sí mismo
    enc.estado = 'Activa'
    enc.fechaFinalizacion = undefined
    enc.fechaFinalizacionISO = undefined
    enc.limiteReversionISO = undefined
    enc.porcentajeClimaFinal = undefined
  }

  persistirRespuestasEnLocalStorage(respuestasRef.value)
  persistirEncuestasEnLocalStorage(encuestasRef.value)

  const encFinal = encuestasRef.value.find(e => e.id === (enc.idProyectoOrigen || enc.id))
  if (encFinal) {
    await sincronizarProyectoEnBackend(encFinal)
  }

  return {
    ok: true,
    mensaje: 'El proyecto vuelve a estar Activo con todas sus respuestas intactas.'
  }
}
