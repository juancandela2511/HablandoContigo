/**
 * ============================================================================
 * GENERADOR DE TARJETAS DE PERSONAS MENCIONADAS (tarjetasPersonasMencionadas.ts)
 * ============================================================================
 * Genera las tarjetas analíticas de IA para colaboradores mencionados directamente
 * en comentarios cualitativos libres.
 */

import type { NotificacionItem } from '@/Almacenes/useNotificaciones'
import type { NivelAlerta } from '@/Almacenes/useTiposAlertas'
import type { BloqueAlertaItem } from '@/componentes/Dashboard/Pestanas/PestanaAlertas/TarjetaBloqueAlertaItem.vue'
import { detectarPersonasProblemaConIA } from '../deteccionMenciones'

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
        descripcion: `${caso.textoPregunta}`,
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
      conteosPorEstado: {
        detectadas: casosAlertas.filter(c => (c.estado || 'Detectada') === 'Detectada').length,
        enRevision: casosAlertas.filter(c => c.estado === 'En Revisión').length,
        atendidas: casosAlertas.filter(c => c.estado === 'Atendida').length,
        descartadas: casosAlertas.filter(c => c.estado === 'Descartada').length
      }
    }
  })
}
