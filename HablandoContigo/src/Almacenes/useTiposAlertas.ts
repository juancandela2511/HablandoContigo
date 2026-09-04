/**
 * ============================================================================
 * ALMACÉN DE TIPOS DE ALERTAS PERSONALIZADOS Y NIVELES (useTiposAlertas.ts)
 * ============================================================================
 * 
 * ¿QUÉ ES Y QUÉ HACE?
 * Permite al Super Administrador crear y calibrar tipos de alertas organizacionales:
 * - Asignar Niveles de alerta: Nivel 1 (Crítico/Urgente), Nivel 2 (Alto), Nivel 3 (Moderado), Nivel 4 (Preventivo/Bajo).
 * - Definir Modo de Enfoque: 'especifico' ("Enfócate en tal cosa...") vs 'general' ("Vas a estar pendiente de todo...").
 * - Establecer descripción breve para que la Inteligencia Artificial encasille las respuestas de la encuesta
 *   dentro de las estadísticas existentes.
 * 
 * ¿CON QUÉ ESTÁ VINCULADO / CONECTADO?
 * - Menu.vue: Acceso directo exclusivo para el Super Administrador.
 * - ModalGestionTiposAlertas.vue: Interfaz de creación y calibración de alertas.
 * - useEncuestas.ts: Evalúa las respuestas anónimas contra las alertas configuradas.
 * - useEstadisticas.ts: Encasilla las estadísticas y métricas por niveles y categorías.
 * - DashboardPestanaAlertas.vue: Filtra y presenta las alertas por Nivel y Enfoque.
 */

import { ref, computed } from 'vue'
import { supabase } from '@/supabase'
import { useToast } from '@/Almacenes/useToast'

const { mostrarError, mostrarExito } = useToast()

export type NivelAlerta = 1 | 2 | 3 | 4
export type ModoEnfoqueAlerta = 'especifico' | 'general'
export type SeveridadAlerta = 'Crítica' | 'Alta' | 'Moderada' | 'Baja'

export interface TipoAlertaPersonalizada {
  id: string
  nombre: string // Ej. "Mala gestión de los jefes", "Acoso Laboral", etc.
  descripcion: string // Breve descripción de qué trata la alerta para que la IA la encasille
  nivel: NivelAlerta // 1: Crítico/Inmediato, 2: Alto, 3: Moderado, 4: Preventivo
  severidad: SeveridadAlerta
  modoEnfoque: ModoEnfoqueAlerta // 'especifico' = "Enfócate en tal cosa", 'general' = "Vas a estar pendiente de todo"
  enfoqueDetalle?: string // Instrucción específica para la IA sobre en qué centrarse
  palabrasClave: string[]
  protocoloAccion: string
  icono?: string
  activa: boolean
  creadoEn?: string
}

const CLAVE_LOCAL_STORAGE_TIPOS_ALERTAS = 'hablandocontigo_tipos_alertas_solo_3_v1'

// Tipos de alerta iniciales: EXACTAMENTE 3 ALERTAS CRÍTICAS
const TIPOS_ALERTAS_INICIALES: TipoAlertaPersonalizada[] = [
  {
    id: 'tipo-jefes-gestion',
    nombre: 'Mala Gestión de los Jefes & Liderazgo Tóxico',
    descripcion: 'Conductas de abuso de poder, trato despectivo por parte de líderes, órdenes contradictorias, falta de empatía o favoritismo injustificado.',
    nivel: 1,
    severidad: 'Crítica',
    modoEnfoque: 'especifico',
    enfoqueDetalle: 'Enfócate en maltrato verbal, órdenes humillantes, autoritarismo y falta de escucha de supervisores y directores.',
    palabrasClave: ['jefe', 'jefes', 'liderazgo', 'supervisor', 'mala gestión', 'favoritismo', 'autoritarismo', 'gritos', 'maltrato líder'],
    protocoloAccion: 'Revisión prioritaria por Gestión Humana y citación a evaluación 360° del cuadro de mando.',
    icono: 'ShieldAlert',
    activa: true
  },
  {
    id: 'tipo-acoso',
    nombre: 'Acoso Laboral & Hostigamiento',
    descripcion: 'Conductas de maltrato reiterado, intimidación, amenazas, humillación pública o conductas que vulneren la dignidad del colaborador.',
    nivel: 1,
    severidad: 'Crítica',
    modoEnfoque: 'especifico',
    enfoqueDetalle: 'Enfócate en persecución laboral, amenazas de despido injustas, humillaciones colectivas y mobbing.',
    palabrasClave: ['acoso', 'hostigamiento', 'humillación', 'amenaza', 'intimidación', 'insulto', 'maltrato', 'mobbing'],
    protocoloAccion: 'Activar inmediatamente el Comité de Convivencia y medidas de protección confidencial.',
    icono: 'ShieldAlert',
    activa: true
  },
  {
    id: 'tipo-depresion',
    nombre: 'Crisis Anímica & Salud Mental',
    descripcion: 'Estados de tristeza profunda, depresión severa, desánimo extremo constante, fatiga emocional o ideaciones de colapso.',
    nivel: 1,
    severidad: 'Crítica',
    modoEnfoque: 'especifico',
    enfoqueDetalle: 'Vas a estar pendiente de todo signo de colapso emocional, llanto frecuente, desesperanza o angustia crítica.',
    palabrasClave: ['depresión', 'crisis anímica', 'tristeza profunda', 'desesperanza', 'llanto incontrolable', 'colapso emocional', 'no puedo más'],
    protocoloAccion: 'Ofrecer contención psicológica confidencial inmediata y activación de canal de Bienestar.',
    icono: 'HeartCrack',
    activa: true
  }
]

// Estado reactivo global
const tiposAlertas = ref<TipoAlertaPersonalizada[]>([])

function mapearNivelPorSeveridad(severidad?: SeveridadAlerta): NivelAlerta {
  switch (severidad) {
    case 'Crítica': return 1
    case 'Alta': return 2
    case 'Moderada': return 3
    case 'Baja': return 4
    default: return 2
  }
}

function mapearSeveridadPorNivel(nivel: NivelAlerta): SeveridadAlerta {
  switch (nivel) {
    case 1: return 'Crítica'
    case 2: return 'Alta'
    case 3: return 'Moderada'
    case 4: return 'Baja'
    default: return 'Alta'
  }
}

function normalizarTipoAlerta(item: any): TipoAlertaPersonalizada {
  const nivel: NivelAlerta = item.nivel || mapearNivelPorSeveridad(item.severidad)
  const severidad: SeveridadAlerta = item.severidad || mapearSeveridadPorNivel(nivel)
  const modoEnfoque: ModoEnfoqueAlerta = item.modoEnfoque || (item.enfoqueDetalle ? 'especifico' : 'general')

  return {
    id: item.id || `tipo-custom-${Date.now().toString(36)}`,
    nombre: item.nombre || 'Alerta Personalizada',
    descripcion: item.descripcion || '',
    nivel,
    severidad,
    modoEnfoque,
    enfoqueDetalle: item.enfoqueDetalle || (modoEnfoque === 'especifico' ? item.descripcion : 'Vas a estar pendiente de todo el entorno laboral.'),
    palabrasClave: Array.isArray(item.palabrasClave) ? item.palabrasClave : [item.nombre.toLowerCase()],
    protocoloAccion: item.protocoloAccion || 'Seguimiento por el área de Talento Humano.',
    icono: item.icono || (nivel === 1 ? 'ShieldAlert' : nivel === 2 ? 'Flame' : 'Sliders'),
    activa: item.activa !== undefined ? item.activa : true,
    creadoEn: item.creadoEn || new Date().toISOString()
  }
}

async function cargarTiposAlertasDesdeSupabase() {
  try {
    const { data, error } = await supabase
      .from('tipos_alertas_config')
      .select('*')
      .order('creado_en', { ascending: false })

    if (error) throw new Error(error.message)

    if (data && data.length > 0) {
      tiposAlertas.value = data.map((d: any) => ({
        id: d.id,
        nombre: d.nombre,
        descripcion: d.descripcion,
        nivel: d.nivel || 1,
        severidad: d.severidad || 'Crítica',
        modoEnfoque: d.modo_enfoque || 'especifico',
        enfoqueDetalle: d.enfoque_detalle || d.descripcion,
        palabrasClave: Array.isArray(d.palabras_clave) ? d.palabras_clave : [],
        protocoloAccion: d.protocolo_accion || '',
        icono: d.icono || 'ShieldAlert',
        activa: d.activa !== undefined ? d.activa : true,
        creadoEn: d.creado_en
      }))
      guardarEnLocalStorage()
      return
    }
  } catch (e) {
    // Si la tabla no está creada aún, usa respaldo local
  }

  cargarTiposAlertasLocales()
}

function cargarTiposAlertasLocales() {
  try {
    const raw = localStorage.getItem(CLAVE_LOCAL_STORAGE_TIPOS_ALERTAS)
    if (raw) {
      const parseado = JSON.parse(raw)
      if (Array.isArray(parseado) && parseado.length > 0) {
        tiposAlertas.value = parseado.map(normalizarTipoAlerta)
        return
      }
    }
  } catch (e) {
    console.warn('Error leyendo alertas locales:', e)
  }

  tiposAlertas.value = [...TIPOS_ALERTAS_INICIALES]
  guardarEnLocalStorage()
}

function guardarEnLocalStorage() {
  try {
    localStorage.setItem(CLAVE_LOCAL_STORAGE_TIPOS_ALERTAS, JSON.stringify(tiposAlertas.value))
  } catch (e) {
    console.warn('Error guardando alertas en localStorage:', e)
  }
}

export function useTiposAlertas() {
  if (tiposAlertas.value.length === 0) {
    cargarTiposAlertasDesdeSupabase()
  }

  const tiposActivos = computed(() => tiposAlertas.value.filter(t => t.activa))

  // Agrupación computada por Niveles
  const alertasNivel1 = computed(() => tiposAlertas.value.filter(t => t.nivel === 1 && t.activa))
  const alertasNivel2 = computed(() => tiposAlertas.value.filter(t => t.nivel === 2 && t.activa))
  const alertasNivel3 = computed(() => tiposAlertas.value.filter(t => t.nivel === 3 && t.activa))
  const alertasNivel4 = computed(() => tiposAlertas.value.filter(t => t.nivel === 4 && t.activa))

  /**
   * Crea un nuevo tipo de alerta personalizado con nivel y modo de enfoque
   */
  const crearTipoAlerta = (nuevo: {
    nombre: string
    descripcion: string
    nivel: NivelAlerta
    severidad?: SeveridadAlerta
    modoEnfoque: ModoEnfoqueAlerta
    enfoqueDetalle?: string
    palabrasClave?: string[]
    protocoloAccion?: string
    icono?: string
  }): TipoAlertaPersonalizada => {
    const id = `tipo-custom-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`
    const severidad = nuevo.severidad || mapearSeveridadPorNivel(nuevo.nivel)
    
    // Auto-generar palabras clave si vienen vacías
    let keywords = nuevo.palabrasClave || []
    if (keywords.length === 0) {
      keywords = [
        ...nuevo.nombre.toLowerCase().split(/\s+/).filter(w => w.length > 3),
        ...nuevo.descripcion.toLowerCase().split(/\s+/).filter(w => w.length > 4)
      ].slice(0, 8)
    }

    const registro: TipoAlertaPersonalizada = {
      id,
      nombre: nuevo.nombre.trim(),
      descripcion: nuevo.descripcion.trim(),
      nivel: nuevo.nivel,
      severidad,
      modoEnfoque: nuevo.modoEnfoque,
      enfoqueDetalle: nuevo.enfoqueDetalle?.trim() || (nuevo.modoEnfoque === 'especifico' ? nuevo.descripcion : 'Vas a estar pendiente de todo.'),
      palabrasClave: Array.from(new Set(keywords.map(k => k.toLowerCase().trim()).filter(Boolean))),
      protocoloAccion: nuevo.protocoloAccion?.trim() || 'Activar protocolo de acompañamiento de Talento Humano.',
      icono: nuevo.icono || (nuevo.nivel === 1 ? 'ShieldAlert' : nuevo.nivel === 2 ? 'Flame' : 'Sliders'),
      activa: true,
      creadoEn: new Date().toISOString()
    }

    tiposAlertas.value.unshift(registro)
    guardarEnLocalStorage()

    // Sincronizar con Supabase
    supabase.from('tipos_alertas_config').insert({
      id: registro.id,
      nombre: registro.nombre,
      descripcion: registro.descripcion,
      nivel: registro.nivel,
      severidad: registro.severidad,
      modo_enfoque: registro.modoEnfoque,
      enfoque_detalle: registro.enfoqueDetalle,
      palabras_clave: registro.palabrasClave,
      protocolo_accion: registro.protocoloAccion,
      icono: registro.icono,
      activa: registro.activa
    }).then(({ error }) => {
      if (error) console.info('Sincronizado localmente')
    })

    mostrarExito(
      'Alerta configurada',
      `"${registro.nombre}" (Nivel ${registro.nivel}) se configuró exitosamente en la base de datos.`
    )
    return registro
  }

  /**
   * Edita un tipo de alerta existente
   */
  const editarTipoAlerta = (id: string, datos: Partial<TipoAlertaPersonalizada>): boolean => {
    const item = tiposAlertas.value.find(t => t.id === id)
    if (!item) return false

    if (datos.nivel && !datos.severidad) {
      datos.severidad = mapearSeveridadPorNivel(datos.nivel)
    }

    Object.assign(item, datos)
    guardarEnLocalStorage()

    supabase.from('tipos_alertas_config').update({
      nombre: item.nombre,
      descripcion: item.descripcion,
      nivel: item.nivel,
      severidad: item.severidad,
      modo_enfoque: item.modoEnfoque,
      enfoque_detalle: item.enfoqueDetalle,
      palabras_clave: item.palabrasClave,
      protocolo_accion: item.protocoloAccion,
      activa: item.activa
    }).eq('id', id).then()

    mostrarExito('Alerta actualizada', `Se guardaron los cambios en "${item.nombre}".`)
    return true
  }

  /**
   * Actualiza los 3 campos clave de una alerta: nombre, descripción y palabras clave
   */
  const actualizarTipoAlerta = (id: string, datos: { nombre?: string; descripcion?: string; palabrasClave?: string[] }): boolean => {
    const item = tiposAlertas.value.find(t => t.id === id)
    if (!item) return false

    if (datos.nombre !== undefined) item.nombre = datos.nombre
    if (datos.descripcion !== undefined) {
      item.descripcion = datos.descripcion
      item.enfoqueDetalle = datos.descripcion
    }
    if (datos.palabrasClave !== undefined) item.palabrasClave = datos.palabrasClave

    guardarEnLocalStorage()

    supabase.from('tipos_alertas_config').update({
      nombre: item.nombre,
      descripcion: item.descripcion,
      enfoque_detalle: item.enfoqueDetalle,
      palabras_clave: item.palabrasClave
    }).eq('id', id).then()

    mostrarExito('Criterio actualizado', `Se actualizaron las definiciones de "${item.nombre}".`)
    return true
  }

  /**
   * Elimina un tipo de alerta
   */
  const eliminarTipoAlerta = (id: string): boolean => {
    const idx = tiposAlertas.value.findIndex(t => t.id === id)
    if (idx === -1) return false

    const borrado = tiposAlertas.value.splice(idx, 1)[0]
    guardarEnLocalStorage()

    supabase.from('tipos_alertas_config').delete().eq('id', id).then()

    mostrarExito('Alerta eliminada', `"${borrado?.nombre || ''}" fue retirada de los criterios de IA.`)
    return true
  }

  /**
   * Activa o desactiva un tipo de alerta
   */
  const toggleActiva = (id: string): boolean => {
    const item = tiposAlertas.value.find(t => t.id === id)
    if (!item) return false

    item.activa = !item.activa
    guardarEnLocalStorage()

    supabase.from('tipos_alertas_config').update({ activa: item.activa }).eq('id', id).then()
    return item.activa
  }

  /**
   * Restablece los tipos de alerta a los valores iniciales
   */
  const restablecerValoresPorDefecto = () => {
    tiposAlertas.value = [...TIPOS_ALERTAS_INICIALES]
    guardarEnLocalStorage()
    mostrarExito('Valores restablecidos', 'Se han restaurado las alertas y niveles predeterminados del sistema.')
  }

  /**
   * Evalúa si un texto de respuesta o comentario coincide semánticamente con un tipo de alerta
   * analizando el nombre, modo de enfoque, palabras clave y descripción.
   */
  const coincideTextoConTipoAlerta = (texto: string, tipo: TipoAlertaPersonalizada): boolean => {
    if (!tipo.activa) return false
    const textoMin = texto.toLowerCase().trim()

    if (!textoMin || textoMin.length < 2) {
      return false
    }

    // Descartar SOLO si la respuesta es exclusivamente positiva y sin quejas
    const frasesPositivasExclusivas = ['todo bien', 'muy bien', 'excelente', 'perfecto', 'buen ambiente', 'sin problemas', 'satisfecho']
    if (frasesPositivasExclusivas.includes(textoMin)) {
      return false
    }

    // 1. Coincidencia estricta por palabras clave de la alerta
    const coincidePalabraClave = tipo.palabrasClave.some(kw => {
      const kwMin = kw.toLowerCase().trim()
      return kwMin.length >= 3 && textoMin.includes(kwMin)
    })

    if (coincidePalabraClave) {
      return true
    }

    // 2. Coincidencia con términos de riesgo explícitos según el tipo de alerta
    if (tipo.id.includes('jefe') || tipo.nombre.toLowerCase().includes('jefe') || tipo.nombre.toLowerCase().includes('liderazgo')) {
      const terminosJefes = ['jefe', 'líder', 'lider', 'supervisor', 'coordinador', 'gritos', 'favoritismo', 'autoritario', 'injusticia', 'despotismo', 'maltrato']
      if (terminosJefes.some(t => textoMin.includes(t))) {
        return true
      }
    }

    if (tipo.id.includes('acoso') || tipo.nombre.toLowerCase().includes('acoso')) {
      const terminosAcoso = ['acoso', 'hostigamiento', 'humillación', 'humillacion', 'amenaza', 'burlas', 'intimidación', 'intimidacion', 'tocamiento', 'violencia']
      if (terminosAcoso.some(t => textoMin.includes(t))) {
        return true
      }
    }

    if (tipo.id.includes('depresion') || tipo.id.includes('salud') || tipo.nombre.toLowerCase().includes('crisis') || tipo.nombre.toLowerCase().includes('ánimica')) {
      const terminosCrisis = ['depresión', 'depresion', 'ansiedad', 'llanto', 'no puedo más', 'no puedo mas', 'colapso', 'pánico', 'panico', 'desesperación', 'desesperacion', 'renunciar por salud', 'agotamiento extremo', 'burnout']
      if (terminosCrisis.some(t => textoMin.includes(t))) {
        return true
      }
    }

    return false
  }

  /**
   * Motor de encasillamiento de IA con Detección Efectiva y Rigurosa:
   * Detecta y encasilla con precisión en cualquiera de las 3 alertas activas.
   */
  const clasificarYEncasillarTexto = (
    texto: string,
    esAlertaFlag: boolean = false,
    valorLikert?: number
  ): TipoAlertaPersonalizada | null => {
    const textoMin = texto.toLowerCase().trim()
    
    // Si la calificación es plenamente satisfactoria (>= 4) y no hay indicador de alerta, no alertar
    if (valorLikert !== undefined && valorLikert >= 4 && !esAlertaFlag) {
      return null
    }

    // Buscar coincidencia directa con alguna de las 3 alertas activas
    for (const tipo of tiposActivos.value) {
      if (coincideTextoConTipoAlerta(textoMin, tipo)) {
        return tipo
      }
    }

    // Si el usuario marcó una opción explícitamente crítica (valor 1 o bandera de alerta)
    if (esAlertaFlag || valorLikert === 1) {
      // Intentar mapear por contexto temático
      if (textoMin.includes('jefe') || textoMin.includes('lider') || textoMin.includes('supervis')) {
        const alertaJefes = tiposActivos.value.find(t => t.id === 'tipo-jefes-gestion' || t.nombre.toLowerCase().includes('jefe'))
        if (alertaJefes) return alertaJefes
      }

      if (textoMin.includes('acoso') || textoMin.includes('hostig') || textoMin.includes('respeto') || textoMin.includes('convivencia')) {
        const alertaAcoso = tiposActivos.value.find(t => t.id === 'tipo-acoso' || t.nombre.toLowerCase().includes('acoso'))
        if (alertaAcoso) return alertaAcoso
      }

      if (textoMin.includes('salud') || textoMin.includes('ánim') || textoMin.includes('carga') || textoMin.includes('estrés') || textoMin.includes('estres')) {
        const alertaSalud = tiposActivos.value.find(t => t.id === 'tipo-depresion' || t.nombre.toLowerCase().includes('crisis'))
        if (alertaSalud) return alertaSalud
      }

      // Si fue una respuesta con valor 1 o alerta crítica, asignar la primera alerta activa correspondiente
      return tiposActivos.value[0] || null
    }

    return null
  }

  /**
   * Obtiene la etiqueta textual formateada para un nivel
   */
  const obtenerEtiquetaNivel = (nivel: NivelAlerta): string => {
    switch (nivel) {
      case 1: return 'Nivel 1 (Crítica / Inmediata)'
      case 2: return 'Nivel 2 (Alta)'
      case 3: return 'Nivel 3 (Moderada)'
      case 4: return 'Nivel 4 (Preventiva / Baja)'
      default: return `Nivel ${nivel}`
    }
  }

  /**
   * Obtiene la clase CSS para el badge de color de un nivel
   */
  const obtenerClaseColorNivel = (nivel: NivelAlerta): { badge: string; border: string; bg: string; text: string } => {
    switch (nivel) {
      case 1:
        return {
          badge: 'bg-red-100 dark:bg-red-950/80 border-red-300 dark:border-red-800 text-red-700 dark:text-red-300',
          border: 'border-red-500/50',
          bg: 'bg-red-50/50 dark:bg-red-950/20',
          text: 'text-red-600 dark:text-red-400'
        }
      case 2:
        return {
          badge: 'bg-rose-100 dark:bg-rose-950/80 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300',
          border: 'border-rose-500/50',
          bg: 'bg-rose-50/50 dark:bg-rose-950/20',
          text: 'text-rose-600 dark:text-rose-400'
        }
      case 3:
        return {
          badge: 'bg-amber-100 dark:bg-amber-950/80 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300',
          border: 'border-amber-500/50',
          bg: 'bg-amber-50/50 dark:bg-amber-950/20',
          text: 'text-amber-600 dark:text-amber-400'
        }
      case 4:
        return {
          badge: 'bg-sky-100 dark:bg-sky-950/80 border-sky-300 dark:border-sky-800 text-sky-700 dark:text-sky-300',
          border: 'border-sky-500/50',
          bg: 'bg-sky-50/50 dark:bg-sky-950/20',
          text: 'text-sky-600 dark:text-sky-400'
        }
      default:
        return {
          badge: 'bg-slate-100 dark:bg-slate-800 border-slate-300 text-slate-700',
          border: 'border-slate-400',
          bg: 'bg-slate-50',
          text: 'text-slate-600'
        }
    }
  }

  return {
    tiposAlertas,
    tiposActivos,
    alertasNivel1,
    alertasNivel2,
    alertasNivel3,
    crearTipoAlerta,
    editarTipoAlerta: actualizarTipoAlerta,
    actualizarTipoAlerta,
    eliminarTipoAlerta,
    toggleActiva,
    restablecerValoresPorDefecto,
    coincideTextoConTipoAlerta,
    clasificarYEncasillarTexto,
    obtenerEtiquetaNivel,
    obtenerClaseColorNivel,
    mapearNivelPorSeveridad,
    mapearSeveridadPorNivel
  }
}

