/**
 * ============================================================================
 * ALMACÉN DE NOTIFICACIONES Y ALERTAS (useNotificaciones.ts)
 * ============================================================================
 * Conecta las alertas psicosociales generadas por el motor de IA por persona
 * con el panel de notificaciones y la pestaña de alertas del Dashboard.
 */

import { ref, computed } from 'vue'
import { useToast } from '@/Almacenes/useToast'
import { useEncuestas } from '@/Almacenes/useEncuestas'
import { useTiposAlertas } from '@/Almacenes/useTiposAlertas'
import { analizarAlertasPorPersonaConIA } from '@/ia/analizadorAlertasPorPersona'

const { mostrarExito } = useToast()

export type TipoNotificacion =
  | 'alerta_clima' | 'sistema' | 'seguridad_perfil'
  | 'renuncia' | 'social' | 'burnout' | 'depresion' | 'acoso'
  | 'alerta' | 'encuesta' | 'cuenta' | 'informe' | 'modulo' | 'seguridad'
  | 'actualizacion' | 'anuncio' | 'manual'

const TIPOS_ACTIVIDADES_SISTEMA = ['encuesta', 'informe', 'cuenta', 'modulo', 'seguridad', 'seguridad_perfil', 'sistema', 'actualizacion', 'anuncio', 'manual']

export const esNotificacionActividad = (tipo: string): boolean => TIPOS_ACTIVIDADES_SISTEMA.includes(tipo)
export const esAlertaConvivencia = (tipo: string): boolean => !esNotificacionActividad(tipo)

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
  estadoAlerta?: string
  mensajeCapturado?: string
  clasificacion?: 'Buena' | 'Mala'
  motivoDetallado?: string
  prioridad?: 'Crítica' | 'Alta' | 'Moderada'
}

const notificacionesBase: NotificacionItem[] = [
  {
    id: 'notif-004',
    tipo: 'encuesta',
    titulo: 'Encuesta Publicada con Éxito',
    descripcion: 'La encuesta de Clima y Bienestar se subió al sistema.',
    mensaje: 'La encuesta de Diagnóstico de Clima Laboral está activa para recibir respuestas anónimas.',
    departamento: 'General',
    fecha: 'Hoy',
    hora: '08:45 AM',
    leida: true,
    rutaDestino: '/proyectos'
  },
  {
    id: 'notif-005',
    tipo: 'informe',
    titulo: 'Motor de 11 Alertas IA Activo',
    descripcion: 'El análisis por persona y detección de menciones está sincronizado.',
    mensaje: 'Las 11 alertas principales psicosociales y el detector de menciones están listos en el Dashboard.',
    departamento: 'General',
    fecha: 'Hoy',
    hora: '09:10 AM',
    leida: true,
    rutaDestino: '/dashboard'
  }
]

const notificaciones = ref<NotificacionItem[]>([...notificacionesBase])
const estadosCasos = ref<Record<string, 'Detectada' | 'En Revisión' | 'Atendida' | 'Descartada'>>({})
const panelAbierto = ref(false)
const cargandoNotificaciones = ref(false)

export function useNotificaciones() {
  const cargarNotificacionesDesdeSupabase = async (_forzar: boolean = false) => Promise.resolve()

  const alertasConvivencia = computed(() => {
    const directas = notificaciones.value.filter(n => esAlertaConvivencia(n.tipo))
    const { respuestasAnonimas } = useEncuestas()
    const { tiposActivos } = useTiposAlertas()

    const { bloquesAlertasPrincipales } = analizarAlertasPorPersonaConIA(
      respuestasAnonimas.value,
      tiposActivos.value,
      estadosCasos.value
    )

    const casosAnalizadosPorPersona: NotificacionItem[] = []
    bloquesAlertasPrincipales.forEach(b => {
      b.alertas.forEach(alerta => casosAnalizadosPorPersona.push(alerta))
    })

    return [...directas, ...casosAnalizadosPorPersona]
  })

  const notificacionesActividad = computed(() => notificaciones.value.filter(n => esNotificacionActividad(n.tipo)))
  const noLeidas = computed(() => notificacionesActividad.value.filter(n => !n.leida).length)
  const noLeidasAlertas = computed(() => alertasConvivencia.value.filter(n => !n.leida && n.estado !== 'Atendida' && n.estado !== 'Descartada').length)
  const totalNotificaciones = computed(() => notificacionesActividad.value.length)

  const togglePanel = () => { panelAbierto.value = !panelAbierto.value }
  const abrirPanel = () => { panelAbierto.value = true }
  const cerrarPanel = () => { panelAbierto.value = false }

  const agregarNotificacion = async (nueva: Omit<NotificacionItem, 'id'>) => {
    const id = `notif-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`
    notificaciones.value.unshift({ ...nueva, id })
  }

  const marcarLeida = async (id: string) => {
    const item = notificaciones.value.find(n => n.id === id)
    if (item) item.leida = true
  }

  const marcarTodasLeidas = async () => {
    notificaciones.value.forEach(n => { n.leida = true })
  }

  const eliminarNotificacion = async (id: string) => {
    const indice = notificaciones.value.findIndex(n => n.id === id)
    if (indice !== -1) notificaciones.value.splice(indice, 1)
    estadosCasos.value[id] = 'Descartada'
  }

  const limpiarTodasNotificaciones = async () => {
    notificaciones.value = []
    mostrarExito('Notificaciones limpiadas', 'Todas las alertas fueron eliminadas.')
  }

  const actualizarEstadoAlerta = async (id: string, nuevoEstado: 'Detectada' | 'En Revisión' | 'Atendida' | 'Descartada') => {
    estadosCasos.value[id] = nuevoEstado
    const item = notificaciones.value.find(n => n.id === id)
    if (item) {
      item.estado = nuevoEstado
      if (nuevoEstado === 'Atendida' || nuevoEstado === 'Descartada') item.leida = true
    }
    if (nuevoEstado === 'Descartada') mostrarExito('Alerta descartada', 'Caso marcado como descartado.')
    else if (nuevoEstado === 'Atendida') mostrarExito('Alerta atendida', 'Caso marcado como atendido.')
  }

  const limpiarAlertasConvivencia = async () => {
    notificaciones.value = notificaciones.value.filter(n => esNotificacionActividad(n.tipo))
  }

  const eliminarAlertasDeEncuesta = async (_tituloOId: string) => {
    limpiarAlertasConvivencia()
  }

  const publicarAnuncioActualizacion = async (datos: any) => {
    await agregarNotificacion({
      tipo: datos.tipo || 'actualizacion',
      titulo: datos.titulo,
      descripcion: datos.mensaje,
      mensaje: datos.mensaje,
      departamento: datos.departamento || 'Sistema General',
      fecha: 'Hoy',
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      leida: false,
      rutaDestino: datos.rutaDestino || '/configuracion'
    })
    mostrarExito('Anuncio publicado', `La notificación "${datos.titulo}" se publicó exitosamente.`)
  }

  return {
    notificaciones,
    estadosCasos,
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
    limpiarAlertasConvivencia,
    eliminarAlertasDeEncuesta,
    actualizarEstadoAlerta,
    agregarNotificacion,
    publicarAnuncioActualizacion,
    notificarActualizacionManual: publicarAnuncioActualizacion
  }
}
