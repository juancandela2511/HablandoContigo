/**
 * ============================================================================
 * NORMALIZADOR Y CONFIGURADOR DE PREGUNTAS (normalizadorPreguntas.ts)
 * ============================================================================
 * Sincroniza y valida la estructura de las preguntas de clima organizacional,
 * asegurando la asignación correcta de alertas, categorías y opciones.
 */

import type { PreguntaEncuesta } from '@/ia'
import preguntasJson from '@/database/preguntas.json'
import { MAPA_PREGUNTA_A_ALERTA, obtenerTipoAlertaPorId } from '@/Almacenes/catalogoAlertasPrincipales'

export const MAPA_IDS_ALERTAS_LEGACY: Record<string, string> = {
  'tipo-falta-recursos': 'tipo-recursos-condiciones',
  'tipo-falta-claridad-rol': 'tipo-claridad-rol',
  'tipo-falta-capacitacion': 'tipo-capacitacion-induccion',
  'tipo-falta-crecimiento': 'tipo-crecimiento-subutilizacion'
}

export function normalizarPreguntasClima(preguntas: any[]): PreguntaEncuesta[] {
  const mapaPlantilla = new Map<string, any>((preguntasJson as any[]).map(p => [p.id, p]))
  return (preguntas || []).map((p: any) => {
    const base = mapaPlantilla.get(p.id) || {}
    const tipoAlertaDefault = MAPA_PREGUNTA_A_ALERTA[p.id] || base.opciones?.find((o: any) => o.esAlerta)?.tipoAlertaId || 'tipo-molestias-cotidianas'
    const infoAlertaDefault = obtenerTipoAlertaPorId(tipoAlertaDefault)

    const opcionesRaw = Array.isArray(p.opciones) && p.opciones.length > 0 ? p.opciones : (base.opciones || [])
    const opcionesNormalizadas = opcionesRaw.map((opc: any, idx: number) => {
      if (typeof opc === 'string') {
        const opcBase = base.opciones?.[idx]
        return opcBase ? { ...opcBase, texto: opc } : { texto: opc, valor: 100, esAlerta: false }
      }
      let tipoAlertaId = opc.tipoAlertaId || base.opciones?.[idx]?.tipoAlertaId
      if (tipoAlertaId && MAPA_IDS_ALERTAS_LEGACY[tipoAlertaId]) {
        tipoAlertaId = MAPA_IDS_ALERTAS_LEGACY[tipoAlertaId]
      }
      const esAlerta = opc.esAlerta !== undefined ? Boolean(opc.esAlerta) : Boolean(base.opciones?.[idx]?.esAlerta)
      if (esAlerta && !tipoAlertaId) {
        tipoAlertaId = tipoAlertaDefault
      }
      const infoCat = tipoAlertaId ? obtenerTipoAlertaPorId(tipoAlertaId) : infoAlertaDefault
      return {
        ...base.opciones?.[idx],
        ...opc,
        esAlerta,
        ...(esAlerta ? {
          tipoAlertaId,
          nombreAlerta: infoCat?.nombre || opc.nombreAlerta || 'Alerta de Molestias y Fastidio Cotidiano',
          severidadAlerta: opc.severidadAlerta || infoCat?.severidadPorDefecto || 'Media',
          color: opc.color || infoCat?.colorHex || '#f97316'
        } : {
          color: opc.color || base.opciones?.[idx]?.color || '#10b981'
        })
      }
    })

    const tieneComentarios =
      p.comentariosHabilitados === false || p.deteccionQuejas === false || p.solicitarPorQueSiNegativo === false
        ? Boolean(p.comentariosHabilitados === true && p.deteccionQuejas !== false && p.solicitarPorQueSiNegativo !== false)
        : p.comentariosHabilitados !== undefined
          ? Boolean(p.comentariosHabilitados)
          : p.deteccionQuejas !== undefined
            ? Boolean(p.deteccionQuejas)
            : p.solicitarPorQueSiNegativo !== undefined
              ? Boolean(p.solicitarPorQueSiNegativo)
              : true

    return {
      ...base,
      ...p,
      tipoGrafico: p.tipoGrafico || base.tipoGrafico || 'barras',
      obligatoria: p.obligatoria !== undefined ? p.obligatoria : true,
      comentariosHabilitados: tieneComentarios,
      deteccionQuejas: tieneComentarios,
      solicitarPorQueSiNegativo: tieneComentarios,
      esSensibleAcoso: p.tipo === 'texto' ? true : Boolean(p.esSensibleAcoso ?? base.esSensibleAcoso),
      modoPresentacion: p.modoPresentacion || base.modoPresentacion || 'tarjetas',
      maxAnos: p.maxAnos ?? base.maxAnos,
      maxMeses: p.maxMeses ?? base.maxMeses,
      opciones: opcionesNormalizadas
    }
  })
}

export function fusionarPreguntasConConfiguracion(preguntasExistentes: any[] = []): PreguntaEncuesta[] {
  const mapaExistentes = new Map((preguntasExistentes || []).map(p => [p.id, p]))

  const baseSincronizada = (preguntasJson as any[]).map((pConfig: any, idx: number) => {
    const pExistente = mapaExistentes.get(pConfig.id)
    if (!pExistente) {
      return JSON.parse(JSON.stringify(pConfig))
    }

    const opcionesConfig = Array.isArray(pConfig.opciones) ? pConfig.opciones : []
    const opcionesExistentes = Array.isArray(pExistente.opciones) ? pExistente.opciones : []

    const fuenteOpciones = opcionesExistentes.length > 0 ? opcionesExistentes : opcionesConfig
    const opcionesFinales = fuenteOpciones.map((opcBase: any, oIdx: number) => {
      const opcConf = opcionesConfig[oIdx] || {}
      const opcEx = opcionesExistentes[oIdx] || {}
      const esAlerta = opcEx.esAlerta !== undefined ? Boolean(opcEx.esAlerta) : Boolean(opcConf.esAlerta)
      const valorFinal =
        opcEx.valor !== undefined && !(opcEx.valor === 5 && esAlerta)
          ? opcEx.valor
          : (opcConf.valor !== undefined ? opcConf.valor : opcEx.valor)
      return {
        ...opcConf,
        ...opcEx,
        texto: opcEx.texto || opcConf.texto,
        esAlerta,
        tipoAlertaId: opcEx.tipoAlertaId || opcConf.tipoAlertaId,
        nombreAlerta: opcEx.nombreAlerta || opcConf.nombreAlerta,
        severidadAlerta: opcEx.severidadAlerta || opcConf.severidadAlerta,
        color: opcEx.color || opcConf.color,
        valor: valorFinal
      }
    })

    const tieneComentarios =
      pExistente.comentariosHabilitados === false || pExistente.deteccionQuejas === false || pExistente.solicitarPorQueSiNegativo === false
        ? false
        : pExistente.comentariosHabilitados !== undefined
          ? Boolean(pExistente.comentariosHabilitados)
          : pExistente.deteccionQuejas !== undefined
            ? Boolean(pExistente.deteccionQuejas)
            : pExistente.solicitarPorQueSiNegativo !== undefined
              ? Boolean(pExistente.solicitarPorQueSiNegativo)
              : pConfig.comentariosHabilitados !== undefined
                ? Boolean(pConfig.comentariosHabilitados)
                : true

    return {
      ...pConfig,
      ...pExistente,
      id: pConfig.id,
      texto: pExistente.texto || pConfig.texto,
      categoria: pExistente.categoria || pConfig.categoria,
      bloqueId: pExistente.bloqueId || pConfig.bloqueId,
      tipo: pExistente.tipo || pConfig.tipo || 'multiple',
      tipoGrafico: pExistente.tipoGrafico || pConfig.tipoGrafico || (idx % 2 === 0 ? 'barras' : 'pastel'),
      modoPresentacion: pExistente.modoPresentacion || pConfig.modoPresentacion,
      obligatoria: pExistente.obligatoria !== undefined ? pExistente.obligatoria : (pConfig.obligatoria !== undefined ? pConfig.obligatoria : true),
      comentariosHabilitados: tieneComentarios,
      deteccionQuejas: tieneComentarios,
      solicitarPorQueSiNegativo: tieneComentarios,
      opciones: opcionesFinales
    }
  })

  ;(preguntasExistentes || []).forEach(p => {
    if (!baseSincronizada.some(item => item.id === p.id)) {
      baseSincronizada.push(p)
    }
  })

  return baseSincronizada
}
