/**
 * ============================================================================
 * ANALIZADOR DE ALERTAS POR PERSONA Y TARJETAS DE MENCIONES IA (analizadorAlertasPorPersona.ts)
 * ============================================================================
 * Contabiliza las 11 alertas principales del sistema por PERSONA evaluada
 * (una persona puede aparecer en múltiples alertas si reporta varias problemáticas,
 * pero nunca se duplica dentro de la misma tarjeta de alerta) y genera las
 * tarjetas de personas mencionadas en los comentarios con resumen IA y casos
 * para inspeccionar con el botón del Ojo (👁️).
 */

import type { NotificacionItem, TipoNotificacion } from '@/Almacenes/useNotificaciones'
import {
  type TipoAlertaPersonalizada,
  type NivelAlerta,
  MAPA_PREGUNTA_A_ALERTA,
  esTextoAcosoSexual
} from '@/Almacenes/useTiposAlertas'
import type { BloqueAlertaItem } from '@/componentes/Dashboard/Pestanas/PestanaAlertas/TarjetaBloqueAlertaItem.vue'
import { extraerNombresDeTexto, detectarPersonasProblemaConIA } from './deteccionMenciones'

export interface ResumenPreguntaEnAlerta {
  idPregunta: string
  textoPregunta: string
  respuestaFrecuente: string
  promedioPuntaje: number
  totalPersonasPregunta: number
}

export interface PersonaSeñaladaEnAlerta {
  nombre: string
  menciones: number
}

export interface ResultadoAnalisisAlertasPorPersona {
  bloquesAlertasPrincipales: BloqueAlertaItem[]
  totalPersonasConAlerta: number
}

const ETIQUETAS_OPCION_MULTIPLE_IGNORAR = new Set([
  'sí', 'si', 'no', 'algunas veces', 'a veces', 'parcialmente', 'de acuerdo',
  'muy bien', 'bien', 'regular', 'mal', 'muy mal', 'excelente',
  '5 - excelente (muy bien)', '4 - bien', '3 - regular', '2 - mal', '1 - muy mal',
  'no (pase directamente al bloque 7)', 'no, ninguno', 'otro'
])

function esComentarioLibreValido(texto: string): boolean {
  const limpio = (texto || '').trim()
  if (limpio.length < 4) return false
  const low = limpio.toLowerCase()
  if (ETIQUETAS_OPCION_MULTIPLE_IGNORAR.has(low)) return false
  if (low.startsWith('no (pase') || low.startsWith('respuesta generada para prueba')) return false
  return true
}

function mapearTipoNotificacion(idTipoAlerta: string): TipoNotificacion {
  if (idTipoAlerta.includes('sexual') || idTipoAlerta.includes('molestias') || idTipoAlerta.includes('acoso')) return 'acoso'
  if (idTipoAlerta.includes('sobrecarga') || idTipoAlerta.includes('burnout')) return 'burnout'
  if (idTipoAlerta.includes('fuga') || idTipoAlerta.includes('renuncia')) return 'renuncia'
  if (idTipoAlerta.includes('depresion')) return 'depresion'
  return 'alerta_clima'
}

/**
 * Determina en qué tipos de alerta (de las 11 principales o personalizadas) encaja un ítem respondido por una persona.
 */
function identificarTiposAlertaParaItem(
  item: any,
  tiposActivos: TipoAlertaPersonalizada[]
): TipoAlertaPersonalizada[] {
  const resultado: TipoAlertaPersonalizada[] = []
  const idsAgregados = new Set<string>()

  const idPregunta = String(item.idPregunta || '').trim()
  const valor = typeof item.valor === 'number' ? item.valor : undefined
  const esAbierta = item.tipo === 'texto' || item.tipo === 'abierta' || idPregunta.includes('12b') || idPregunta.startsWith('b7-p35') || idPregunta.startsWith('b8-')
  const comentarioRaw = esAbierta
    ? String(item.comentario || item.respuesta || '').trim()
    : String(item.comentario || '').trim()
  const textoCompleto = `${item.respuesta || ''} ${comentarioRaw}`.toLowerCase().trim()

  const agregarTipo = (t?: TipoAlertaPersonalizada) => {
    if (t && t.activa && !idsAgregados.has(t.id)) {
      idsAgregados.add(t.id)
      resultado.push(t)
    }
  }

  // 1. Si el comentario menciona acoso sexual, clasificar prioritariamente en Alerta de Acoso Sexual
  if (comentarioRaw.length >= 4 && esTextoAcosoSexual(comentarioRaw)) {
    const tipoSexual = tiposActivos.find(t => t.id === 'tipo-acoso-sexual')
    agregarTipo(tipoSexual)
  }

  // 2. Coincidencia semántica en comentarios libres con las palabras clave de cada tipo de alerta
  if (esComentarioLibreValido(comentarioRaw)) {
    const lowCom = comentarioRaw.toLowerCase()
    for (const tipo of tiposActivos) {
      if (tipo.id === 'tipo-acoso-sexual') continue
      if (tipo.id === 'tipo-molestias-cotidianas' && esTextoAcosoSexual(lowCom)) continue
      const coincidePalabra = tipo.palabrasClave.some(kw => kw.length >= 3 && lowCom.includes(kw.toLowerCase()))
      if (coincidePalabra) {
        agregarTipo(tipo)
      }
    }
  }

  // 3. Evaluación por bajo puntaje (valor <= 2) o bandera explícita de alerta en la opción seleccionada
  const esBajoPuntajeOAlerta = Boolean(item.esAlerta) || (typeof valor === 'number' && valor <= 2 && !idPregunta.startsWith('b1-') && idPregunta !== 'b6-p33-estudia')

  if (esBajoPuntajeOAlerta) {
    // 3a. Mapa oficial de pregunta -> alerta principal
    const idMapeado = MAPA_PREGUNTA_A_ALERTA[idPregunta]
    if (idMapeado) {
      const tipoMapeado = tiposActivos.find(t => t.id === idMapeado)
      // Si la pregunta era de respeto/acoso pero no tiene texto sexual, va a molestias cotidianas
      if (tipoMapeado) {
        agregarTipo(tipoMapeado)
      }
    }

    // 3b. Tipo explícito en la opción (compatibilidad con IDs anteriores)
    if (item.tipoAlertaId) {
      let idBuscado = String(item.tipoAlertaId)
      if (idBuscado === 'tipo-depresion') idBuscado = 'tipo-sobrecarga-burnout'
      if (idBuscado === 'tipo-acoso') {
        idBuscado = esTextoAcosoSexual(textoCompleto) ? 'tipo-acoso-sexual' : 'tipo-molestias-cotidianas'
      }
      if (idBuscado === 'tipo-jefes-gestion') idBuscado = 'tipo-reconocimiento-valoracion'
      agregarTipo(tiposActivos.find(t => t.id === idBuscado))
    }

    // 3c. Si aún no se encasilló y tiene bajo puntaje, buscar por palabras clave en el enunciado de la pregunta
    if (resultado.length === 0) {
      const txtPregunta = `${item.textoPregunta || ''} ${item.categoria || ''}`.toLowerCase()
      for (const tipo of tiposActivos) {
        if (tipo.id === 'tipo-acoso-sexual') continue
        if (tipo.palabrasClave.some(kw => kw.length >= 4 && txtPregunta.includes(kw.toLowerCase()))) {
          agregarTipo(tipo)
          break
        }
      }
    }
  }

  return resultado
}

/**
 * Analiza todas las sesiones/personas respondientes y construye los bloques de las 11 alertas principales
 * contabilizando estrictamente por PERSONA (1 alerta por persona dentro de cada bloque).
 */
export function analizarAlertasPorPersonaConIA(
  respuestasTotales: any[],
  tiposActivos: TipoAlertaPersonalizada[],
  estadosCasos: Record<string, 'Detectada' | 'En Revisión' | 'Atendida' | 'Descartada'> = {}
): ResultadoAnalisisAlertasPorPersona {
  const personasConAlgunaAlerta = new Set<string>()

  const bloquesAlertasPrincipales: BloqueAlertaItem[] = tiposActivos.map(tipo => {
    const casosPorPersona: NotificacionItem[] = []
    const mapaPreguntas = new Map<string, {
      textoPregunta: string
      valores: number[]
      respuestasFrecuentes: Map<string, number>
      personasSet: Set<string>
    }>()
    const mapaNombresSeñalados = new Map<string, Set<string>>()
    let conComentariosCount = 0

    ;(respuestasTotales || []).forEach((sesion, sIdx) => {
      const idPersona = String(sesion.idRespuesta || sesion.dispositivoUUID || `persona-${sIdx}`)
      const dep = sesion.ubicacion?.sede || sesion.departamento || 'Operaciones / Call Center'
      const sede = sesion.ubicacion?.sede || 'Sede Principal'
      const fecha = sesion.fecha || 'Hoy'
      const hora = sesion.hora || '12:00 PM'
      const pc = sesion.nombreEquipoPC || 'PC-CORP'

      const preguntasDisparadasPersona: string[] = []
      const comentariosPersonaEnAlerta: string[] = []
      const nombresMencionadosPorPersona = new Set<string>()

      ;(sesion.respuestas || []).forEach((item: any) => {
        const idP = String(item.idPregunta || '')
        if (idP === 'b6-p33b-que-estudia') return

        const tiposDetectados = identificarTiposAlertaParaItem(item, [tipo])
        if (tiposDetectados.length === 0) return

        const textoPreg = String(item.textoPregunta || 'Pregunta de evaluación').replace(/^Pregunta\s+\d+[a-z]?\s*[—-]\s*/i, '').trim()
        const respTexto = String(item.respuesta || 'Bajo puntaje').trim()
        const valorNum = typeof item.valor === 'number' ? item.valor : 1

        if (typeof item.valor === 'number' && item.valor <= 2) {
          preguntasDisparadasPersona.push(`${textoPreg} (${respTexto})`)

          if (!mapaPreguntas.has(idP || textoPreg)) {
            mapaPreguntas.set(idP || textoPreg, {
              textoPregunta: textoPreg,
              valores: [],
              respuestasFrecuentes: new Map(),
              personasSet: new Set()
            })
          }
          const entryP = mapaPreguntas.get(idP || textoPreg)!
          entryP.valores.push(valorNum)
          entryP.personasSet.add(idPersona)
          entryP.respuestasFrecuentes.set(respTexto, (entryP.respuestasFrecuentes.get(respTexto) || 0) + 1)
        }

        const esAbierta = item.tipo === 'texto' || item.tipo === 'abierta' || idP.includes('12b') || idP.startsWith('b7-p35') || idP.startsWith('b8-')
        const candidatoCom = esAbierta
          ? String(item.comentario || item.respuesta || '').trim()
          : String(item.comentario || '').trim()

        if (esComentarioLibreValido(candidatoCom)) {
          if (!comentariosPersonaEnAlerta.includes(candidatoCom)) {
            comentariosPersonaEnAlerta.push(candidatoCom)
          }
          const nombres = extraerNombresDeTexto(candidatoCom)
          nombres.forEach(n => {
            nombresMencionadosPorPersona.add(n)
            if (!mapaNombresSeñalados.has(n)) mapaNombresSeñalados.set(n, new Set())
            mapaNombresSeñalados.get(n)!.add(idPersona)
          })
        }
      })

      // Si esta persona activó esta alerta (por pregunta de bajo puntaje o por comentario)
      if (preguntasDisparadasPersona.length > 0 || comentariosPersonaEnAlerta.length > 0) {
        personasConAlgunaAlerta.add(idPersona)
        if (comentariosPersonaEnAlerta.length > 0) {
          conComentariosCount++
        }

        const idCaso = `alerta-${tipo.id}-${idPersona}`
        const estadoActual = estadosCasos[idCaso] || 'Detectada'
        const listaNombres = Array.from(nombresMencionadosPorPersona)
        const etiquetaMencion = listaNombres.length > 0
          ? `Menciona a: ${listaNombres.join(', ')}`
          : (sesion.cuentaUsuarioPC || 'Colaborador Anónimo')

        const resumenPreguntas = preguntasDisparadasPersona.length > 0
          ? preguntasDisparadasPersona.slice(0, 3).join(' • ')
          : 'Detectado directamente en comentario cualitativo abierto.'

        casosPorPersona.push({
          id: idCaso,
          tipo: mapearTipoNotificacion(tipo.id),
          titulo: tipo.nombre,
          tipoAlerta: tipo.nombre,
          descripcion: resumenPreguntas,
          mensaje: `${tipo.nombre}: ${resumenPreguntas}`,
          detalleRespuesta: comentariosPersonaEnAlerta.join(' | '),
          fecha,
          hora,
          leida: estadoActual === 'Atendida' || estadoActual === 'Descartada',
          severidad: tipo.severidad,
          prioridad: tipo.severidad === 'Baja' ? 'Moderada' : tipo.severidad,
          departamento: dep,
          ubicacionSede: sede,
          dispositivoUUID: sesion.dispositivoUUID || idPersona,
          nombreEquipoPC: pc,
          cuentaUsuarioPC: etiquetaMencion,
          estado: estadoActual,
          rutaDestino: '/dashboard?seccion=alertas'
        })
      }
    })

    const preguntasMenorPuntaje: ResumenPreguntaEnAlerta[] = Array.from(mapaPreguntas.entries())
      .map(([idPregunta, datos]) => {
        let mejorResp = 'Bajo puntaje'
        let maxCount = 0
        datos.respuestasFrecuentes.forEach((cnt, resp) => {
          if (cnt > maxCount) {
            maxCount = cnt
            mejorResp = resp
          }
        })
        const prom = datos.valores.length > 0
          ? Number((datos.valores.reduce((a, b) => a + b, 0) / datos.valores.length).toFixed(1))
          : 1.0
        return {
          idPregunta,
          textoPregunta: datos.textoPregunta,
          respuestaFrecuente: mejorResp,
          promedioPuntaje: prom,
          totalPersonasPregunta: datos.personasSet.size
        }
      })
      .sort((a, b) => a.promedioPuntaje - b.promedioPuntaje || b.totalPersonasPregunta - a.totalPersonasPregunta)

    const personasSeñaladas: PersonaSeñaladaEnAlerta[] = Array.from(mapaNombresSeñalados.entries())
      .map(([nombre, setPersonas]) => ({ nombre, menciones: setPersonas.size }))
      .sort((a, b) => b.menciones - a.menciones)

    const totalPersonas = casosPorPersona.length
    let analisisDetalladoIA = ''
    if (totalPersonas === 0) {
      analisisDetalladoIA = 'Sin casos detectados actualmente para este criterio. El indicador se mantiene saludable.'
    } else {
      const partes: string[] = [
        `La IA identificó ${totalPersonas} ${totalPersonas === 1 ? 'persona afectada' : 'personas afectadas'} en "${tipo.nombre}" (${conComentariosCount} con comentarios escritos).`
      ]
      if (preguntasMenorPuntaje.length > 0) {
        const topP = preguntasMenorPuntaje[0]!
        partes.push(`La pregunta más crítica es "${topP.textoPregunta}" con respuesta predominante "${topP.respuestaFrecuente}" (promedio ${topP.promedioPuntaje}/5).`)
      }
      if (personasSeñaladas.length > 0) {
        partes.push(`Se mencionan directamente los nombres: ${personasSeñaladas.map(p => `${p.nombre} (${p.menciones})`).join(', ')}.`)
      }
      partes.push(`Protocolo sugerido: ${tipo.protocoloAccion}`)
      analisisDetalladoIA = partes.join(' ')
    }

    const conteosPorEstado = {
      detectadas: casosPorPersona.filter(c => (c.estado || 'Detectada') === 'Detectada').length,
      enRevision: casosPorPersona.filter(c => c.estado === 'En Revisión').length,
      atendidas: casosPorPersona.filter(c => c.estado === 'Atendida').length,
      descartadas: casosPorPersona.filter(c => c.estado === 'Descartada').length
    }

    return {
      id: tipo.id,
      titulo: tipo.nombre,
      descripcion: tipo.descripcion,
      nivel: tipo.nivel,
      severidad: tipo.severidad,
      tipoConfigurado: tipo,
      alertas: casosPorPersona,
      totalPersonas,
      conComentariosCount,
      preguntasMenorPuntaje,
      personasSeñaladas,
      analisisDetalladoIA,
      esTarjetaPersonaMencionada: false,
      conteosPorEstado
    }
  })

  return {
    bloquesAlertasPrincipales,
    totalPersonasConAlerta: personasConAlgunaAlerta.size
  }
}

/**
 * Genera tarjetas dedicadas para cada persona mencionada por nombre en los comentarios,
 * con el mismo formato de tarjeta de alerta y botón del Ojo (👁️) para inspeccionar los comentarios,
 * sin agregar alertas nuevas al catálogo de las 11 principales.
 */
export async function generarTarjetasPersonasMencionadasIA(
  respuestasTotales: any[],
  estadosCasos: Record<string, 'Detectada' | 'En Revisión' | 'Atendida' | 'Descartada'> = {}
): Promise<BloqueAlertaItem[]> {
  if (!respuestasTotales || respuestasTotales.length === 0) return []

  const personasDetectadas = await detectarPersonasProblemaConIA(respuestasTotales)

  return personasDetectadas.map(persona => {
    const tieneAcosoSexual = persona.alertasRelacionadas?.some(a => a.toLowerCase().includes('sexual')) ?? false
    const nivel: NivelAlerta = tieneAcosoSexual || persona.nivelRiesgo === 'Crítico' ? 1 : 2
    const severidad: 'Crítica' | 'Alta' = nivel === 1 ? 'Crítica' : 'Alta'

    const casosAlertas: NotificacionItem[] = (persona.casosDetallados || []).map((caso, idx) => {
      const idCaso = `mencion-${persona.nombre.toLowerCase()}-${caso.idRespuesta}-${idx}`
      const estadoActual = estadosCasos[idCaso] || 'Detectada'

      return {
        id: idCaso,
        tipo: 'acoso',
        titulo: `Mención directa a ${persona.nombre}`,
        tipoAlerta: persona.tipoConductaPrincipal || 'Persona Mencionada en Comentarios',
        descripcion: `${caso.textoPregunta} (Respuesta: ${caso.respuestaSeleccionada})`,
        mensaje: caso.comentario,
        detalleRespuesta: caso.comentario,
        fecha: caso.fecha,
        hora: caso.hora,
        leida: estadoActual === 'Atendida' || estadoActual === 'Descartada',
        severidad,
        prioridad: severidad,
        departamento: caso.departamento,
        ubicacionSede: caso.sede,
        dispositivoUUID: caso.idRespuesta,
        nombreEquipoPC: caso.nombreEquipoPC,
        cuentaUsuarioPC: `Menciona a: ${persona.nombre}`,
        estado: estadoActual,
        rutaDestino: '/dashboard?seccion=alertas'
      }
    })

    const conteosPorEstado = {
      detectadas: casosAlertas.filter(c => (c.estado || 'Detectada') === 'Detectada').length,
      enRevision: casosAlertas.filter(c => c.estado === 'En Revisión').length,
      atendidas: casosAlertas.filter(c => c.estado === 'Atendida').length,
      descartadas: casosAlertas.filter(c => c.estado === 'Descartada').length
    }

    return {
      id: `persona-mencionada-${persona.nombre.toLowerCase()}`,
      titulo: `${persona.nombre} — ${persona.tipoConductaPrincipal || 'Señalamiento en Comentarios'}`,
      descripcion: `Alertas asociadas: ${(persona.alertasRelacionadas || []).join(' • ') || 'Molestias y Fastidio Cotidiano'}`,
      nivel,
      severidad,
      alertas: casosAlertas,
      totalPersonas: persona.menciones,
      conComentariosCount: casosAlertas.length,
      personasSeñaladas: [{ nombre: persona.nombre, menciones: persona.menciones }],
      analisisDetalladoIA: persona.resumenProblemaIA,
      esTarjetaPersonaMencionada: true,
      nombrePersonaMencionada: persona.nombre,
      conteosPorEstado
    }
  })
}
