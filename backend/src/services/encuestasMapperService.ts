/**
 * ============================================================================
 * SERVICIO MAPEADOR DE ENCUESTAS Y PREGUNTAS (Backend/src/services/encuestasMapperService.ts)
 * ============================================================================
 * Formatea y normaliza los registros de encuestas y preguntas entre PostgreSQL
 * y el contrato JSON del Frontend.
 */

import fs from 'fs/promises'
import path from 'path'

export function formatearFilaPregunta(p: any, idEncuestaFallback: string): any {
  const encId = p.idEncuesta || idEncuestaFallback || 'enc-001'
  const meta = typeof p.metadata === 'string' ? JSON.parse(p.metadata) : (p.metadata || {})
  const tieneComentarios =
    meta.comentariosHabilitados === false || meta.deteccionQuejas === false || meta.solicitarPorQueSiNegativo === false
      ? false
      : (meta.comentariosHabilitados === undefined && meta.deteccionQuejas === undefined && meta.solicitarPorQueSiNegativo === undefined)
        ? true
        : Boolean(meta.comentariosHabilitados ?? meta.deteccionQuejas ?? meta.solicitarPorQueSiNegativo)

  const idPreguntaOriginal = meta.idOriginal || (
    typeof p.id === 'string' && p.id.startsWith(`${encId}__`)
      ? p.id.slice(String(encId).length + 2)
      : p.id
  )

  return {
    ...meta,
    id: idPreguntaOriginal,
    idEncuesta: p.idEncuesta,
    secuencia: p.secuencia,
    bloqueId: p.bloqueId,
    categoria: p.categoria,
    texto: p.texto,
    tipo: p.tipo,
    tipoGrafico: meta.tipoGrafico || p.tipoGrafico || 'barras',
    esObligatoria: p.esObligatoria,
    opciones: typeof p.opciones === 'string' ? JSON.parse(p.opciones) : (p.opciones || []),
    comentariosHabilitados: tieneComentarios,
    deteccionQuejas: tieneComentarios,
    solicitarPorQueSiNegativo: tieneComentarios
  }
}

export function formatearFilaEncuesta(enc: any, preguntasAsociadas: any[]): any {
  const encMeta = typeof enc.metadata === 'string' ? JSON.parse(enc.metadata) : (enc.metadata || {})
  const estadoRestaurado = encMeta.estadoFrontend || (enc.estado === 'Cerrada' ? 'Finalizada' : enc.estado) || 'Activa'

  return {
    ...enc,
    estado: estadoRestaurado,
    fechaCreacion: encMeta.fechaCreacion || enc.fechaCreacion,
    fechaFinalizacion: encMeta.fechaFinalizacion ?? undefined,
    fechaFinalizacionISO: encMeta.fechaFinalizacionISO ?? undefined,
    limiteReversionISO: encMeta.limiteReversionISO ?? undefined,
    porcentajeClimaFinal: encMeta.porcentajeClimaFinal ?? undefined,
    anioCierre: encMeta.anioCierre ?? undefined,
    idProyectoOrigen: encMeta.idProyectoOrigen ?? undefined,
    respuestasArchivadas: encMeta.respuestasArchivadas ?? undefined,
    totalRespuestas: encMeta.totalRespuestas ?? enc.totalRespuestas ?? 0,
    alertasRegistradas: encMeta.alertasRegistradas ?? enc.alertasRegistradas ?? 0,
    puntajePromedio: Number(encMeta.puntajePromedio ?? enc.puntajePromedio ?? 0),
    bloques: encMeta.bloques || [],
    totalPreguntas: preguntasAsociadas.length,
    preguntas: preguntasAsociadas
  }
}

export function construirParametrosInsercionPregunta(idEncuesta: string, p: any, indice: number): any[] {
  const rawId = p.id || `preg-${indice + 1}`
  const pkId = idEncuesta === 'enc-001'
    ? rawId
    : (String(rawId).startsWith(`${idEncuesta}__`) ? String(rawId) : `${idEncuesta}__${rawId}`)

  const tieneComentarios =
    p.comentariosHabilitados === false || p.deteccionQuejas === false || p.solicitarPorQueSiNegativo === false
      ? false
      : Boolean(p.comentariosHabilitados ?? p.deteccionQuejas ?? p.solicitarPorQueSiNegativo ?? false)

  const pregMeta = {
    idOriginal: rawId,
    comentariosHabilitados: tieneComentarios,
    deteccionQuejas: tieneComentarios,
    solicitarPorQueSiNegativo: tieneComentarios,
    tipoGrafico: p.tipoGrafico || undefined,
    modoPresentacion: p.modoPresentacion || undefined,
    maxAnos: p.maxAnos || undefined,
    imagen: p.imagen || undefined,
    imagenRompecabezas: p.imagenRompecabezas || undefined,
    esCondicional: Boolean(p.esCondicional ?? false),
    disparadorPor: p.disparadorPor || undefined,
    valoresDisparo: p.valoresDisparo || undefined,
    accionCondicion: p.accionCondicion || undefined,
    saltarHastaId: p.saltarHastaId || undefined,
    activarSaltoCondicional: p.activarSaltoCondicional || undefined
  }

  return [
    pkId,
    idEncuesta,
    indice + 1,
    p.bloqueId || `bloque-${Math.floor(indice / 5) + 1}`,
    p.categoria || 'General',
    p.texto || '',
    p.tipo || 'multiple',
    JSON.stringify(p.opciones || []),
    Boolean(p.esObligatoria ?? true),
    JSON.stringify(pregMeta)
  ]
}

export async function sincronizarPreguntasJsonLocales(preguntas: any[]): Promise<void> {
  try {
    const rutaDbJson = path.resolve(process.cwd(), '../Frontend/src/database/preguntas.json')
    const rutaConfigJson = path.resolve(process.cwd(), '../Frontend/src/Config/preguntas.json')
    const jsonContent = JSON.stringify(preguntas, null, 2)
    await fs.writeFile(rutaDbJson, jsonContent, 'utf-8').catch(() => {})
    await fs.writeFile(rutaConfigJson, jsonContent, 'utf-8').catch(() => {})
  } catch {
    // Entornos Docker o standalone pueden no tener carpeta Frontend adyacente
  }
}
