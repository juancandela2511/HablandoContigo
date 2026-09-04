/**
 * ============================================================================
 * ALMACÉN DE NOTIFICACIONES Y ALERTAS — SUPABASE FIRST (useNotificaciones.ts)
 * ============================================================================
 *
 * POLÍTICA: Ningún cambio se aplica localmente si antes no llega a Supabase.
 * Si falla → toast de error → estado local NO cambia (o se revierte).
 */

import { ref, computed } from 'vue'
import { supabase } from '@/supabase'
import { useToast } from '@/Almacenes/useToast'

const { mostrarError, mostrarExito } = useToast()

export type TipoNotificacion =
  | 'alerta_clima' | 'sistema' | 'seguridad_perfil' | 'acoso'
  | 'depresion' | 'renuncia' | 'social' | 'burnout'
  | 'alerta' | 'encuesta' | 'cuenta' | 'informe' | 'modulo' | 'seguridad'

export const esAlertaConvivencia = (tipo: string): boolean => {
  return ['alerta_clima', 'acoso', 'burnout', 'depresion', 'renuncia', 'social', 'alerta'].includes(tipo)
}

export const esNotificacionActividad = (tipo: string): boolean => {
  return !esAlertaConvivencia(tipo)
}

export interface NotificacionItem {
  id: string
  tipo: TipoNotificacion
  titulo: string
  descripcion: string
  fecha: string
  hora: string
  leida: boolean
  icono?: string
  rutaDestino?: string
  idElemento?: string
  severidad?: 'Baja' | 'Moderada' | 'Alta' | 'Crítica'
  tipoAlerta?: string
  departamento?: string
  mensaje?: string
  estado?: 'Detectada' | 'En Revisión' | 'Atendida' | 'Descartada'
  detalleRespuesta?: string
  dispositivoUUID?: string
  nombreEquipoPC?: string
  cuentaUsuarioPC?: string
  ubicacionSede?: string
  // Estructura Obligatoria de Alerta (Gemini)
  estadoAlerta?: string // 'Activada'
  mensajeCapturado?: string // El texto literal o la selección exacta del usuario
  clasificacion?: 'Buena' | 'Mala' // (Buena / Mala)
  motivoDetallado?: string // Explicación analítica redactada por Gemini
  prioridad?: 'Crítica' | 'Alta' | 'Moderada'
}

const notificaciones = ref<NotificacionItem[]>([])
const panelAbierto = ref(false)
const cargandoNotificaciones = ref(false)

export function useNotificaciones() {
  // ─────────────────────────────────────────────
  // LECTURA
  // ─────────────────────────────────────────────

  const cargarNotificacionesDesdeSupabase = async () => {
    cargandoNotificaciones.value = true
    try {
      const { data, error } = await supabase
        .from('notificaciones_alertas')
        .select('*')
        .order('creado_en', { ascending: false })

      if (error) throw new Error(error.message)

      notificaciones.value = (data || []).map((item: any) => ({
        id: item.id,
        tipo: (item.tipo as TipoNotificacion) || 'alerta',
        titulo: item.titulo,
        descripcion: item.descripcion || '',
        mensaje: item.mensaje || item.descripcion || '',
        departamento: item.departamento || 'General',
        tipoAlerta: item.tipo_alerta || item.titulo,
        severidad: item.severidad || 'Moderada',
        estado: item.estado || 'Detectada',
        detalleRespuesta: item.detalle_respuesta || '',
        dispositivoUUID: item.dispositivo_uuid || '',
        nombreEquipoPC: item.nombre_equipo_pc || '',
        cuentaUsuarioPC: item.cuenta_usuario_pc || '',
        ubicacionSede: item.ubicacion_sede || 'Sede Principal',
        fecha: item.fecha || 'Hoy',
        hora: item.hora || '12:00 PM',
        leida: Boolean(item.leida),
        rutaDestino: item.ruta_destino || '/dashboard',
        idElemento: item.id_elemento || ''
      }))

      // Sembrar actividades iniciales de sistema si no existen en Supabase
      const tieneActividades = notificaciones.value.some(n => esNotificacionActividad(n.tipo))
      if (!tieneActividades) {
        await sembrarActividadesIniciales()
      }
    } catch (e: any) {
      console.warn('Aviso cargando notificaciones:', e.message)
    } finally {
      cargandoNotificaciones.value = false
    }
  }

  const sembrarActividadesIniciales = async () => {
    const eventos: Omit<NotificacionItem, 'id'>[] = [
      {
        tipo: 'encuesta',
        titulo: 'Encuesta Publicada con Éxito',
        descripcion: 'La encuesta de Clima y Bienestar se subió al sistema.',
        mensaje: 'La encuesta "Diagnóstico de Clima y Bienestar TI" se subió exitosamente y ya está disponible para recibir respuestas anónimas.',
        departamento: 'Tecnología',
        fecha: 'Hoy',
        hora: '08:45 AM',
        leida: false,
        rutaDestino: '/proyectos'
      },
      {
        tipo: 'informe',
        titulo: 'Informe y Análisis Listo',
        descripcion: 'El informe analítico ya está listo para consultar.',
        mensaje: 'El análisis consolidado y las conclusiones automáticas de IA ya están listos para revisar en el Dashboard o descargar en PDF.',
        departamento: 'General',
        fecha: 'Hoy',
        hora: '09:10 AM',
        leida: false,
        rutaDestino: '/dashboard'
      },
      {
        tipo: 'seguridad',
        titulo: 'Contraseña Actualizada',
        descripcion: 'Se actualizó la contraseña de tu cuenta administrativa.',
        mensaje: 'Se cambió la contraseña de tu cuenta administrativa de forma segura y protegida en Supabase Auth.',
        departamento: 'Seguridad TI',
        fecha: 'Hoy',
        hora: '09:30 AM',
        leida: false,
        rutaDestino: '/configuracion'
      },
      {
        tipo: 'modulo',
        titulo: 'Módulo de Encuestas Editado',
        descripcion: 'Se editaron las dimensiones del módulo de clima.',
        mensaje: 'Se guardaron los ajustes en el módulo de proyectos y escalas psicométricas.',
        departamento: 'Operaciones',
        fecha: 'Hoy',
        hora: '09:50 AM',
        leida: true,
        rutaDestino: '/proyectos'
      }
    ]

    for (const ev of eventos) {
      await agregarNotificacion(ev)
    }
  }

  // ─────────────────────────────────────────────
  // MÉTRICAS Y LISTAS SEPARADAS
  // ─────────────────────────────────────────────

  // Alertas psicosociales y de convivencia (destinadas a la pestaña Alertas de Convivencia del Dashboard)
  const alertasConvivencia = computed(() => notificaciones.value.filter(n => esAlertaConvivencia(n.tipo)))

  // Notificaciones operativas y de actividad (destinadas exclusivamente al Panel Flotante / Campanita)
  const notificacionesActividad = computed(() => notificaciones.value.filter(n => esNotificacionActividad(n.tipo)))

  // Conteo de no leídas para la campanita del menú (Solo eventos operativos: encuestas, informes, claves, módulos)
  const noLeidas = computed(() => notificacionesActividad.value.filter(n => !n.leida).length)

  // Conteo de no leídas para la pestaña de alertas del dashboard
  const noLeidasAlertas = computed(() => alertasConvivencia.value.filter(n => !n.leida && n.estado !== 'Atendida' && n.estado !== 'Descartada').length)

  const totalNotificaciones = computed(() => notificacionesActividad.value.length)

  const togglePanel = () => { panelAbierto.value = !panelAbierto.value }
  const abrirPanel = () => { panelAbierto.value = true }
  const cerrarPanel = () => { panelAbierto.value = false }

  // ─────────────────────────────────────────────
  // ESCRITURA — SUPABASE PRIMERO SIEMPRE
  // ─────────────────────────────────────────────

  /**
   * Agrega una notificación en Supabase primero. Si falla → toast de error → NO agrega localmente.
   */
  const agregarNotificacion = async (nueva: Omit<NotificacionItem, 'id'>) => {
    const id = `notif-${Date.now().toString(36)}`
    const registro: NotificacionItem = { ...nueva, id }

    try {
      const { error } = await supabase.from('notificaciones_alertas').insert({
        id: registro.id,
        tipo: registro.tipo,
        titulo: registro.titulo,
        descripcion: registro.descripcion,
        mensaje: registro.mensaje,
        departamento: registro.departamento,
        tipo_alerta: registro.tipoAlerta,
        severidad: registro.severidad || 'Moderada',
        estado: registro.estado || 'Detectada',
        detalle_respuesta: registro.detalleRespuesta,
        dispositivo_uuid: registro.dispositivoUUID,
        nombre_equipo_pc: registro.nombreEquipoPC,
        cuenta_usuario_pc: registro.cuentaUsuarioPC,
        ubicacion_sede: registro.ubicacionSede,
        fecha: registro.fecha,
        hora: registro.hora,
        leida: registro.leida,
        ruta_destino: registro.rutaDestino,
        id_elemento: registro.idElemento
      })

      if (error) throw new Error(error.message)

      // ✅ Solo agrega localmente si Supabase confirmó
      notificaciones.value.unshift(registro)
    } catch (e: any) {
      mostrarError('Fallo al guardar notificación', `La alerta no pudo registrarse en Supabase. ${e.message || ''}`)
    }
  }

  /**
   * Marca una notificación como leída en Supabase. Si falla → revierte el estado local.
   */
  const marcarLeida = async (id: string) => {
    const item = notificaciones.value.find(n => n.id === id)
    if (!item) return

    const estadoPrevio = item.leida
    item.leida = true // optimista

    try {
      const { error } = await supabase
        .from('notificaciones_alertas')
        .update({ leida: true })
        .eq('id', id)

      if (error) throw new Error(error.message)
    } catch (e: any) {
      // 🔄 Revertir si falló
      item.leida = estadoPrevio
      mostrarError('Fallo al marcar leída', `No se pudo actualizar en Supabase. ${e.message || ''}`)
    }
  }

  /**
   * Marca todas las notificaciones como leídas en Supabase.
   */
  const marcarTodasLeidas = async () => {
    const estadosPrevios = notificaciones.value.map(n => ({ id: n.id, leida: n.leida }))
    notificaciones.value.forEach(n => { n.leida = true }) // optimista

    try {
      const { error } = await supabase
        .from('notificaciones_alertas')
        .update({ leida: true })
        .eq('leida', false)

      if (error) throw new Error(error.message)
    } catch (e: any) {
      // 🔄 Revertir
      estadosPrevios.forEach(ep => {
        const n = notificaciones.value.find(x => x.id === ep.id)
        if (n) n.leida = ep.leida
      })
      mostrarError('Fallo al marcar todas leídas', `No se pudo actualizar en Supabase. ${e.message || ''}`)
    }
  }

  /**
   * Elimina una notificación de Supabase. Si falla → la reinserta localmente.
   */
  const eliminarNotificacion = async (id: string) => {
    const indice = notificaciones.value.findIndex(n => n.id === id)
    const copia = indice !== -1 ? { ...notificaciones.value[indice] } : null
    if (indice !== -1) notificaciones.value.splice(indice, 1) // optimista

    try {
      const { error } = await supabase
        .from('notificaciones_alertas')
        .delete()
        .eq('id', id)

      if (error) throw new Error(error.message)
    } catch (e: any) {
      // 🔄 Revertir
      if (copia && indice !== -1) notificaciones.value.splice(indice, 0, copia as NotificacionItem)
      mostrarError('Fallo al eliminar notificación', `La alerta no pudo eliminarse de Supabase. ${e.message || ''}`)
    }
  }

  /**
   * Limpia todas las notificaciones en Supabase. Si falla → restaura el estado local.
   */
  const limpiarTodasNotificaciones = async () => {
    const copia = [...notificaciones.value]
    notificaciones.value = [] // optimista

    try {
      const { error } = await supabase
        .from('notificaciones_alertas')
        .delete()
        .neq('id', 'dummy_no_match')

      if (error) throw new Error(error.message)

      mostrarExito('Notificaciones limpiadas', 'Todas las alertas fueron eliminadas de Supabase.')
    } catch (e: any) {
      // 🔄 Revertir
      notificaciones.value = copia
      mostrarError('Fallo al limpiar notificaciones', `Las alertas no pudieron eliminarse de Supabase. ${e.message || ''}`)
    }
  }

  /**
   * Actualiza el estado de una alerta en Supabase ('Detectada' | 'En Revisión' | 'Atendida' | 'Descartada')
   */
  const actualizarEstadoAlerta = async (id: string, nuevoEstado: 'Detectada' | 'En Revisión' | 'Atendida' | 'Descartada') => {
    const item = notificaciones.value.find(n => n.id === id)
    if (!item) return

    const estadoPrevio = item.estado
    item.estado = nuevoEstado
    if (nuevoEstado === 'Atendida' || nuevoEstado === 'Descartada') {
      item.leida = true
    }

    try {
      const { error } = await supabase
        .from('notificaciones_alertas')
        .update({ 
          estado: nuevoEstado,
          leida: item.leida 
        })
        .eq('id', id)

      if (error) throw new Error(error.message)

      if (nuevoEstado === 'Descartada') {
        mostrarExito('Alerta descartada', 'La alerta fue marcada como descartada / falsa alarma.')
      } else if (nuevoEstado === 'Atendida') {
        mostrarExito('Alerta atendida', 'La alerta fue marcada como atendida satisfactoriamente.')
      }
    } catch (e: any) {
      item.estado = estadoPrevio
      mostrarError('Fallo al actualizar estado', `No se pudo actualizar el estado de la alerta en Supabase. ${e.message || ''}`)
    }
  }

  // Cargar al instanciar
  cargarNotificacionesDesdeSupabase()

  return {
    notificaciones,
    alertasConvivencia,
    notificacionesActividad,
    cargandoNotificaciones,
    panelAbierto,
    noLeidas,
    noLeidasAlertas,
    totalNotificaciones,
    cargarNotificacionesDesdeSupabase,
    togglePanel,
    abrirPanel,
    cerrarPanel,
    marcarLeida,
    marcarTodasLeidas,
    eliminarNotificacion,
    limpiarTodasNotificaciones,
    actualizarEstadoAlerta,
    agregarNotificacion
  }
}
