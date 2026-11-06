/**
 * ============================================================================
 * IDENTIFICADOR DE TIPOS DE ALERTA POR ÍTEM (identificadorTiposAlerta.ts)
 * ============================================================================
 * Asocia de forma unívoca y precisa cada ítem respondido o comentario libre
 * a UNA SOLA alerta canónica, eliminando duplicidades y confusiones entre
 * sobrecarga laboral, fallas de herramientas/computadores y convivencia.
 */

import type { TipoNotificacion } from '@/Almacenes/useNotificaciones'
import {
  type TipoAlertaPersonalizada,
  MAPA_PREGUNTA_A_ALERTA,
  esTextoAcosoSexual
} from '@/Almacenes/useTiposAlertas'
import { extraerComentarioLibreValido } from './filtroComentariosReales'
import { extraerNombresDeTexto } from './extractorNombres'

export function mapearTipoNotificacion(idTipoAlerta: string): TipoNotificacion {
  if (idTipoAlerta.includes('sexual') || idTipoAlerta.includes('molestias') || idTipoAlerta.includes('acoso')) return 'acoso'
  if (idTipoAlerta.includes('sobrecarga') || idTipoAlerta.includes('burnout')) return 'burnout'
  if (idTipoAlerta.includes('fuga') || idTipoAlerta.includes('renuncia')) return 'renuncia'
  if (idTipoAlerta.includes('recursos') || idTipoAlerta.includes('herramientas')) return 'alerta_clima'
  if (idTipoAlerta.includes('depresion')) return 'depresion'
  return 'alerta_clima'
}

/**
 * Determina la alerta única y canónica a la que pertenece un ítem respondido o comentario.
 * Garantiza que cada comentario encaje en una única alerta adecuada.
 */
export function obtenerAlertaPrincipalParaItem(
  item: any,
  tiposActivos: TipoAlertaPersonalizada[]
): TipoAlertaPersonalizada | null {
  const idPregunta = String(item.idPregunta || '').trim()
  const valor = typeof item.valor === 'number' ? item.valor : undefined
  const comentarioRaw = extraerComentarioLibreValido(item)
  const lowCom = comentarioRaw.toLowerCase().trim()

  const encontrarTipo = (id: string) => tiposActivos.find(t => t.id === id && t.activa) || null

  // 1. Si el comentario contiene acoso sexual explícito, clasificar con máxima prioridad
  if (comentarioRaw.length >= 4 && esTextoAcosoSexual(comentarioRaw)) {
    const tipoAcoso = encontrarTipo('tipo-acoso-sexual')
    if (tipoAcoso) return tipoAcoso
  }

  // 2. Si el comentario libre menciona quejas específicas de computadores o herramientas
  if (comentarioRaw.length >= 3) {
    const esQuejaEquipos = /\b(computador|computadores|pc|pantalla|diadema|mouse|silla|teclado|internet|sistema lento|software|herramientas?)\b/i.test(lowCom)
    if (esQuejaEquipos) {
      const tipoEquipos = encontrarTipo('tipo-recursos-condiciones')
      if (tipoEquipos) return tipoEquipos
    }

    const esQuejaRenuncia = /\b(renunciar|renuncia|me voy|otro trabajo|no quiero seguir|retirarme)\b/i.test(lowCom)
    if (esQuejaRenuncia) {
      const tipoFuga = encontrarTipo('tipo-riesgo-fuga')
      if (tipoFuga) return tipoFuga
    }

    const esQuejaSobrecarga = /\b(sobrecarga|sobrecargado|burnout|fatiga cr[oó]nica|agotamiento extremo|colapso)\b/i.test(lowCom)
    if (esQuejaSobrecarga) {
      const tipoSobrecarga = encontrarTipo('tipo-sobrecarga-burnout')
      if (tipoSobrecarga) return tipoSobrecarga
    }
  }

  // 3. Mapeo directo y oficial de la pregunta según el catálogo del cuestionario
  const idMapeadoDirecto = item.tipoAlertaId || MAPA_PREGUNTA_A_ALERTA[idPregunta]
  if (idMapeadoDirecto) {
    let idFinal = String(idMapeadoDirecto)
    if (idFinal === 'tipo-depresion') idFinal = 'tipo-sobrecarga-burnout'
    if (idFinal === 'tipo-acoso') idFinal = 'tipo-molestias-cotidianas'
    if (idFinal === 'tipo-jefes-gestion') idFinal = 'tipo-reconocimiento-valoracion'
    const tipoEncontrado = encontrarTipo(idFinal)
    if (tipoEncontrado) return tipoEncontrado
  }

  // 4. Si el comentario menciona a una persona o jefe pero no hubo mapeo directo
  if (comentarioRaw.length >= 3 && extraerNombresDeTexto(comentarioRaw, true).length > 0) {
    const tipoMolestias = encontrarTipo('tipo-molestias-cotidianas')
    if (tipoMolestias) return tipoMolestias
  }

  // 5. Evaluación semántica secundaria por palabras clave únicamente en texto de la pregunta (nunca en nombre de categoría)
  const esBajoPuntaje = typeof valor === 'number' && (valor <= 2 || (valor > 5 && valor <= 35))
  const esAlertaBajoPuntaje = Boolean(item.esAlerta) || (esBajoPuntaje && !idPregunta.startsWith('b1-') && idPregunta !== 'b6-p33-estudia')

  if (esAlertaBajoPuntaje) {
    const txtPregunta = String(item.textoPregunta || '').toLowerCase()
    for (const tipo of tiposActivos) {
      if (tipo.id === 'tipo-acoso-sexual') continue
      const coincide = tipo.palabrasClave.some(kw => kw.length >= 4 && txtPregunta.includes(kw.toLowerCase()))
      if (coincide) return tipo
    }
  }

  return null
}

export function identificarTiposAlertaParaItem(
  item: any,
  tiposActivos: TipoAlertaPersonalizada[]
): TipoAlertaPersonalizada[] {
  const principal = obtenerAlertaPrincipalParaItem(item, tiposActivos)
  return principal ? [principal] : []
}
