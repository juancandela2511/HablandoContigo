/**
 * ============================================================================
 * ALMACÉN PRINCIPAL DE ENCUESTAS Y RESPUESTAS (useEncuestas.ts)
 * ============================================================================
 * Módulo orquestador desacoplado en servicios especializados bajo @/Almacenes/encuestas.
 * Mantiene compatibilidad total con todas las vistas y componentes en español.
 */

import { computed } from 'vue'
import { useToast } from '@/Almacenes/useToast'
import { depurarRastrosLocales } from '@/services/cryptoService'
import type { AlertaGeminiEstricta } from '@/ia'
import type { UbicacionExacta } from '@/services/deviceService'

// Re-exportar todos los tipos para preservar compatibilidad en toda la app
export type {
  Encuesta,
  RespuestaItem,
  CategoriaAlertaPsicosocial,
  UbicacionAuditoria,
  RegistroRespuesta
} from './encuestas/tiposEncuestas'

import type { Encuesta, RegistroRespuesta, RespuestaItem, UbicacionAuditoria } from './encuestas/tiposEncuestas'
import {
  encuestas,
  respuestasAnonimas,
  cargandoEncuestas,
  cargandoRespuestas,
  cargarEncuestasDesdeLocal,
  cargarRespuestasDesdeLocal
} from './encuestas/estadoEncuestas'
import {
  registrarNuevaRespuestaAnonima,
  vaciarEstadisticasDeEncuesta,
  eliminarRespuestaPorId,
  limpiarTodasLasRespuestasEnBD
} from './encuestas/servicioRespuestas'
import {
  crearNuevoProyecto,
  editarProyectoExistente,
  eliminarProyectoExistente,
  finalizarProyectoConReversion,
  revertirProyectoFinalizado
} from './encuestas/servicioProyectos'
import {
  inyectarRespuestasDePrueba,
  inyectarUnaRespuestaPersonalizada
} from './encuestas/servicioDatosPrueba'

depurarRastrosLocales()

export function useEncuestas() {
  const { mostrarExito, mostrarError } = useToast()

  // Métricas computadas
  const totalEncuestas = computed(() => encuestas.value.length)
  const encuestasActivas = computed(() => encuestas.value.filter(e => e.estado === 'Activa').length)
  const totalRespuestasGlobales = computed(() => respuestasAnonimas.value.length)
  const alertasTotales = computed(() => encuestas.value.reduce((acc, enc) => acc + (enc.alertasRegistradas || 0), 0))
  const promedioSatisfaccionGlobal = computed(() => {
    if (respuestasAnonimas.value.length === 0) return 0.0
    const suma = respuestasAnonimas.value.reduce((acc, r) => acc + (r.puntajeGeneral || 0), 0)
    return Number((suma / respuestasAnonimas.value.length).toFixed(1))
  })

  // Operaciones de proyectos
  const crearEncuesta = async (nueva: Omit<Encuesta, 'id' | 'fechaCreacion'>): Promise<Encuesta> => {
    const registro = await crearNuevoProyecto(nueva, encuestas)
    mostrarExito('Proyecto Creado', `"${registro.titulo}" guardado exitosamente.`)
    return registro
  }

  const editarEncuesta = async (id: string, datos: Partial<Encuesta>): Promise<boolean> => {
    const ok = await editarProyectoExistente(id, datos, encuestas)
    if (ok) mostrarExito('Cambios Guardados', 'Los ajustes del proyecto fueron persistidos.')
    return ok
  }

  const eliminarEncuesta = async (id: string): Promise<boolean> => {
    const ok = await eliminarProyectoExistente(id, encuestas, respuestasAnonimas)
    if (ok) mostrarExito('Proyecto Eliminado', 'El proyecto y sus datos asociados fueron removidos.')
    return ok
  }

  const obtenerEncuestaPorId = (id: string): Encuesta | undefined => {
    return encuestas.value.find(e => e.id === id)
  }

  const obtenerRespuestasDeEncuesta = (idEncuesta: string): RegistroRespuesta[] => {
    return respuestasAnonimas.value.filter(r => r.idEncuesta === idEncuesta)
  }

  // Operaciones de respuestas
  const registrarRespuestaAnonima = async (
    idEncuesta: string,
    items: RespuestaItem[],
    ubicacion?: UbicacionExacta | UbicacionAuditoria,
    duracionSegundos?: number,
    identificacionVoluntaria?: string,
    alertasGemini?: AlertaGeminiEstricta[]
  ): Promise<RegistroRespuesta | null> => {
    const res = await registrarNuevaRespuestaAnonima(
      idEncuesta,
      items,
      encuestas,
      respuestasAnonimas,
      ubicacion,
      duracionSegundos,
      identificacionVoluntaria,
      alertasGemini
    )
    if (res) mostrarExito('Respuesta Registrada', 'Tu respuesta fue enviada de forma segura y anónima.')
    return res
  }

  const vaciarEstadisticasEncuesta = async (idEncuesta: string): Promise<boolean> => {
    vaciarEstadisticasDeEncuesta(idEncuesta, encuestas, respuestasAnonimas)
    mostrarExito('Estadísticas Vaciadas', 'Las respuestas de esta encuesta fueron reiniciadas.')
    return true
  }

  const eliminarRespuestaIndividual = async (idRespuesta: string): Promise<boolean> => {
    const ok = eliminarRespuestaPorId(idRespuesta, encuestas, respuestasAnonimas)
    if (ok) mostrarExito('Registro Eliminado', 'La respuesta fue eliminada exitosamente.')
    return ok
  }

  const vaciarTodasLasEstadisticas = async (): Promise<boolean> => {
    const ok = await limpiarTodasLasRespuestasEnBD(encuestas, respuestasAnonimas)
    if (ok) mostrarExito('Estadísticas Limpiadas', 'Todas las respuestas fueron reiniciadas a cero.')
    return ok
  }

  // Ciclo de vida: Finalización y Reversión (3 días hábiles)
  const finalizarYArchivarProyecto = async (idEncuesta: string): Promise<Encuesta | null> => {
    const res = await finalizarProyectoConReversion(idEncuesta, encuestas, respuestasAnonimas)
    if (res) {
      mostrarExito('Proyecto Finalizado', `Proyecto finalizado (${res.totalRespuestas || 0} respuestas). Cuentas con 3 días hábiles para revertirlo.`)
    }
    return res
  }

  const revertirFinalizacionProyecto = async (idEncuesta: string): Promise<boolean> => {
    const { ok, mensaje } = await revertirProyectoFinalizado(idEncuesta, encuestas, respuestasAnonimas)
    if (ok) mostrarExito('Proyecto Revertido', mensaje)
    else mostrarError('No se pudo revertir', mensaje)
    return ok
  }

  // Inyección de pruebas
  const inyectarDatosDePrueba = async (cantidad: number = 10, idEncuestaTarget?: string): Promise<boolean> => {
    const ok = await inyectarRespuestasDePrueba(cantidad, encuestas, respuestasAnonimas, idEncuestaTarget)
    if (ok) mostrarExito('Datos Inyectados', `Se generaron ${cantidad} respuestas de calibración.`)
    return ok
  }

  const inyectarRespuestaPersonalizada = async (datos: any): Promise<boolean> => {
    return inyectarUnaRespuestaPersonalizada(datos, encuestas, respuestasAnonimas)
  }

  // Carga inicial no bloqueante
  cargarEncuestasDesdeLocal()
  cargarRespuestasDesdeLocal()

  return {
    encuestas,
    respuestasAnonimas,
    cargandoEncuestas,
    cargandoRespuestas,
    totalEncuestas,
    encuestasActivas,
    totalRespuestasGlobales,
    alertasTotales,
    promedioSatisfaccionGlobal,
    cargarEncuestasDesdeLocal,
    cargarRespuestasDesdeLocal,
    crearEncuesta,
    editarEncuesta,
    eliminarEncuesta,
    obtenerEncuestaPorId,
    registrarRespuestaAnonima,
    obtenerRespuestasDeEncuesta,
    vaciarEstadisticasEncuesta,
    eliminarRespuestaIndividual,
    vaciarTodasLasEstadisticas,
    finalizarYArchivarProyecto,
    revertirFinalizacionProyecto,
    inyectarDatosDePrueba,
    inyectarRespuestaPersonalizada
  }
}
