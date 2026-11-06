/**
 * ============================================================================
 * DETECCIÓN INTELIGENTE DE PERSONAS EN COMENTARIOS (deteccionMenciones.ts)
 * ============================================================================
 * Orquesta la extracción de personas mencionadas exclusivamente en comentarios
 * libres reales, descartando cualquier respuesta de opción múltiple.
 */

import type { PersonaProblemaIdentificada, CasoMencionPersona } from './tiposIA'
import {
  esOpcionMultipleCerrada,
  extraerComentarioLibreValido
} from './menciones/filtroComentariosReales'
import {
  extraerNombresDeTexto,
  clasificarConductaMencion
} from './menciones/extractorNombres'

export {
  esOpcionMultipleCerrada,
  extraerComentarioLibreValido,
  extraerNombresDeTexto,
  clasificarConductaMencion
}

export const RESPUESTAS_CERRADAS_ESTANDAR = new Set([
  'sí', 'si', 'no', 'a veces', 'algunas veces', 'casi siempre', 'siempre', 'nunca',
  'muy bien', 'bien', 'regular', 'mal', 'muy mal', 'excelente', 'bueno', 'malo',
  'de acuerdo', 'en desacuerdo', 'parcialmente', 'totalmente'
])

export async function detectarPersonasProblemaConIA(
  respuestasTotales: any[]
): Promise<PersonaProblemaIdentificada[]> {
  const mapa = new Map<string, { info: PersonaProblemaIdentificada; idsPersonas: Set<string> }>()

  ;(respuestasTotales || []).forEach((sesion, sIdx) => {
    const idResp = sesion.idRespuesta || `resp-${sIdx}`
    const dep = sesion.ubicacion?.departamento || sesion.departamento || 'Operaciones'
    const sede = sesion.ubicacion?.sede || 'Sede Principal'
    const fecha = sesion.fecha || 'Hoy'
    const hora = sesion.hora || '12:00 PM'
    const pc = sesion.nombreEquipoPC || 'PC-CORP'

    ;(sesion.respuestas || []).forEach((item: any) => {
      const idP = String(item.idPregunta || '').toLowerCase()
      const comentarioReal = extraerComentarioLibreValido(item)
      if (!comentarioReal) return

      const esCampoDirecto = idP.includes('12b') || Boolean(item.comentario && String(item.comentario).trim() === comentarioReal)
      const nombres = extraerNombresDeTexto(comentarioReal, esCampoDirecto)

      nombres.forEach(nombreNorm => {
        const key = nombreNorm.toLowerCase()
        if (!mapa.has(key)) {
          mapa.set(key, {
            idsPersonas: new Set(),
            info: {
              nombre: nombreNorm,
              cargo: 'Líder / Colaborador Mencionado',
              departamento: dep,
              menciones: 0,
              citas: [],
              nivelRiesgo: 'Alto',
              resumenProblemaIA: '',
              recomendacionIA: 'Activar protocolo de revisión de casos con Comité de Convivencia y RRHH.',
              ultimaFecha: fecha,
              esProblemaCritico: false,
              quejasFrecuentes: [],
              tipoConductaPrincipal: '',
              alertasRelacionadas: [],
              casosDetallados: []
            }
          })
        }

        const entry = mapa.get(key)!
        entry.idsPersonas.add(idResp)

        if (!entry.info.citas.includes(comentarioReal)) {
          entry.info.citas.push(comentarioReal)
        }

        const { tipoConducta, alertaAsociada } = clasificarConductaMencion(comentarioReal)
        if (!entry.info.quejasFrecuentes!.includes(tipoConducta)) {
          entry.info.quejasFrecuentes!.push(tipoConducta)
        }
        if (!entry.info.alertasRelacionadas!.includes(alertaAsociada)) {
          entry.info.alertasRelacionadas!.push(alertaAsociada)
        }

        const caso: CasoMencionPersona = {
          idRespuesta: idResp,
          comentario: comentarioReal,
          textoPregunta: item.textoPregunta || 'Comentario libre reportado en encuesta',
          respuestaSeleccionada: item.valor !== undefined && !esOpcionMultipleCerrada(comentarioReal)
            ? String(item.respuesta || 'Opción evaluada')
            : 'Comentario abierto',
          valor: item.valor,
          fecha,
          hora,
          departamento: dep,
          sede,
          nombreEquipoPC: pc,
          tipoConducta
        }
        if (!entry.info.casosDetallados!.some(c => c.idRespuesta === idResp && c.comentario === comentarioReal)) {
          entry.info.casosDetallados!.push(caso)
        }
        entry.info.menciones = Math.max(entry.idsPersonas.size, entry.info.casosDetallados!.length)
      })
    })
  })

  mapa.forEach(({ info }) => {
    const totalComentarios = info.casosDetallados?.length || info.citas.length || info.menciones
    const tieneSexual = info.alertasRelacionadas?.includes('Alerta de Acoso Sexual')
    info.tipoConductaPrincipal = tieneSexual
      ? 'Alerta de Acoso Sexual (Crítico)'
      : (info.quejasFrecuentes?.[0] || 'Molestias y Fastidio Cotidiano ("Se la están montando")')
    info.nivelRiesgo = tieneSexual || totalComentarios >= 3 ? 'Crítico' : 'Alto'
    info.esProblemaCritico = tieneSexual || totalComentarios >= 3
    info.resumenProblemaIA = `${info.nombre} ha salido en ${totalComentarios} ${totalComentarios === 1 ? 'comentario libre de problema' : 'comentarios libres de problemas'}. Conductas reportadas: ${info.quejasFrecuentes?.join(' • ')}. Haz clic en el icono del ojo (👁️) para leer todos los comentarios.`
  })

  return Array.from(mapa.values()).map(v => v.info).sort((a, b) => b.menciones - a.menciones)
}
