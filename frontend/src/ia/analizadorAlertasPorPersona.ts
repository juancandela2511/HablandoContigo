/**
 * ============================================================================
 * ANALIZADOR DE ALERTAS POR PERSONA Y MENCIONES IA (analizadorAlertasPorPersona.ts)
 * ============================================================================
 * Agrupa y contabiliza las alertas por persona evaluada, garantizando que cada
 * pregunta y comentario se ancle de forma unívoca a una sola alerta canónica.
 */

import type { NotificacionItem } from '@/Almacenes/useNotificaciones'
import type { TipoAlertaPersonalizada } from '@/Almacenes/useTiposAlertas'
import type { BloqueAlertaItem } from '@/componentes/Dashboard/Pestanas/PestanaAlertas/TarjetaBloqueAlertaItem.vue'
import { extraerNombresDeTexto } from './deteccionMenciones'
import { extraerComentarioLibreValido } from './menciones/filtroComentariosReales'
import {
  obtenerAlertaPrincipalParaItem,
  mapearTipoNotificacion
} from './menciones/identificadorTiposAlerta'
import { generarTarjetasPersonasMencionadasIA } from './menciones/tarjetasPersonasMencionadas'

export { generarTarjetasPersonasMencionadasIA }

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
        if (idP.includes('estudi')) return

        // Asociación unívoca: solo incluir el ítem si su alerta canónica principal es este bloque
        const tipoCanónico = obtenerAlertaPrincipalParaItem(item, tiposActivos)
        if (!tipoCanónico || tipoCanónico.id !== tipo.id) return

        const textoPreg = String(item.textoPregunta || 'Pregunta de evaluación').replace(/^Pregunta\s+\d+[a-z]?\s*[—-]\s*/i, '').trim()
        const respTexto = String(item.respuesta || 'Bajo puntaje').trim()
        const valorNum = typeof item.valor === 'number' ? item.valor : 1
        const esBajoPuntaje = typeof item.valor === 'number' && (item.valor <= 2 || (item.valor > 5 && item.valor <= 35) || Boolean(item.esAlerta))

        if (esBajoPuntaje) {
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
          entryP.valores.push(valorNum > 5 ? Math.max(1, Math.round(valorNum / 20)) : valorNum)
          entryP.personasSet.add(idPersona)
          entryP.respuestasFrecuentes.set(respTexto, (entryP.respuestasFrecuentes.get(respTexto) || 0) + 1)
        }

        const candidatoCom = extraerComentarioLibreValido(item)
        if (candidatoCom) {
          if (!comentariosPersonaEnAlerta.includes(candidatoCom)) {
            comentariosPersonaEnAlerta.push(candidatoCom)
          }
          extraerNombresDeTexto(candidatoCom, true).forEach(n => {
            nombresMencionadosPorPersona.add(n)
            if (!mapaNombresSeñalados.has(n)) mapaNombresSeñalados.set(n, new Set())
            mapaNombresSeñalados.get(n)!.add(idPersona)
          })
        }
      })

      if (preguntasDisparadasPersona.length > 0 || comentariosPersonaEnAlerta.length > 0) {
        personasConAlgunaAlerta.add(idPersona)
        if (comentariosPersonaEnAlerta.length > 0) conComentariosCount++

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
          if (cnt > maxCount) { maxCount = cnt; mejorResp = resp }
        })
        const prom = datos.valores.length > 0
          ? Number((datos.valores.reduce((a, b) => a + b, 0) / datos.valores.length).toFixed(1))
          : 1.0
        return { idPregunta, textoPregunta: datos.textoPregunta, respuestaFrecuente: mejorResp, promedioPuntaje: prom, totalPersonasPregunta: datos.personasSet.size }
      })
      .sort((a, b) => a.promedioPuntaje - b.promedioPuntaje || b.totalPersonasPregunta - a.totalPersonasPregunta)

    const personasSeñaladas: PersonaSeñaladaEnAlerta[] = Array.from(mapaNombresSeñalados.entries())
      .map(([nombre, setPersonas]) => ({ nombre, menciones: setPersonas.size }))
      .sort((a, b) => b.menciones - a.menciones)

    const totalPersonas = casosPorPersona.length
    const topP = preguntasMenorPuntaje[0]
    const analisisDetalladoIA = totalPersonas === 0
      ? 'Sin casos detectados actualmente para este criterio. El indicador se mantiene saludable.'
      : [
          `La IA identificó ${totalPersonas} ${totalPersonas === 1 ? 'persona afectada' : 'personas afectadas'} en "${tipo.nombre}" (${conComentariosCount} con comentarios escritos).`,
          topP ? `La pregunta más crítica es "${topP.textoPregunta}" con respuesta predominante "${topP.respuestaFrecuente}" (promedio ${topP.promedioPuntaje}/5).` : '',
          personasSeñaladas.length > 0 ? `Se mencionan directamente los nombres: ${personasSeñaladas.map(p => `${p.nombre} (${p.menciones})`).join(', ')}.` : '',
          `Protocolo sugerido: ${tipo.protocoloAccion}`
        ].filter(Boolean).join(' ')

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
      conteosPorEstado: {
        detectadas: casosPorPersona.filter(c => (c.estado || 'Detectada') === 'Detectada').length,
        enRevision: casosPorPersona.filter(c => c.estado === 'En Revisión').length,
        atendidas: casosPorPersona.filter(c => c.estado === 'Atendida').length,
        descartadas: casosPorPersona.filter(c => c.estado === 'Descartada').length
      }
    }
  })

  return { bloquesAlertasPrincipales, totalPersonasConAlerta: personasConAlgunaAlerta.size }
}
