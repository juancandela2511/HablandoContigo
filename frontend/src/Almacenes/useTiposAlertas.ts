/**
 * ============================================================================
 * ALMACÉN DE TIPOS DE ALERTAS PERSONALIZADOS Y NIVELES (useTiposAlertas.ts)
 * ============================================================================
 * Gestiona las 11 alertas principales del sistema y permite crear nuevas alertas,
 * diferenciando con precisión entre Acoso Sexual y Molestias/Fastidio Cotidiano.
 */

import { ref, computed } from 'vue'
import { useToast } from '@/Almacenes/useToast'
import { TIPOS_ALERTAS_CATALOGO, MAPA_PREGUNTA_A_ALERTA } from './catalogoAlertasPrincipales'

const { mostrarExito } = useToast()

export type NivelAlerta = 1 | 2 | 3 | 4
export type ModoEnfoqueAlerta = 'especifico' | 'general'
export type SeveridadAlerta = 'Crítica' | 'Alta' | 'Moderada' | 'Baja'

export interface TipoAlertaPersonalizada {
  id: string
  nombre: string
  descripcion: string
  nivel: NivelAlerta
  severidad: SeveridadAlerta
  modoEnfoque: ModoEnfoqueAlerta
  enfoqueDetalle?: string
  palabrasClave: string[]
  protocoloAccion: string
  icono?: string
  color?: string
  activa: boolean
  creadoEn?: string
}

export { TIPOS_ALERTAS_CATALOGO, MAPA_PREGUNTA_A_ALERTA }

const CLAVE_STORAGE = 'hablandocontigo_tipos_alertas_11_principales_v2'
const CLAVES_OBSOLETAS = ['hablandocontigo_tipos_alertas_solo_3_v1', 'hablandocontigo_tipos_alertas']
const IDS_OBSOLETOS = new Set(['tipo-jefes-gestion', 'tipo-acoso', 'tipo-depresion'])

const tiposAlertas = ref<TipoAlertaPersonalizada[]>([])

export function mapearNivelPorSeveridad(severidad?: SeveridadAlerta): NivelAlerta {
  if (severidad === 'Crítica') return 1
  if (severidad === 'Alta') return 2
  if (severidad === 'Moderada') return 3
  return 4
}

export function mapearSeveridadPorNivel(nivel: NivelAlerta): SeveridadAlerta {
  if (nivel === 1) return 'Crítica'
  if (nivel === 2) return 'Alta'
  if (nivel === 3) return 'Moderada'
  return 'Baja'
}

function guardarEnLocalStorage() {
  try {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(tiposAlertas.value))
  } catch (e) {
    console.warn('Error guardando alertas:', e)
  }
}

function cargarTiposAlertasLocales() {
  try {
    CLAVES_OBSOLETAS.forEach(k => localStorage.removeItem(k))
    const raw = localStorage.getItem(CLAVE_STORAGE)
    if (raw) {
      const parseado = JSON.parse(raw)
      if (Array.isArray(parseado) && parseado.length > 0) {
        const validos = parseado.filter((item: any) => !IDS_OBSOLETOS.has(item.id))
        const mapa = new Map<string, TipoAlertaPersonalizada>()
        TIPOS_ALERTAS_CATALOGO.forEach(cat => mapa.set(cat.id, { ...cat }))
        validos.forEach((item: any) => {
          if (!mapa.has(item.id)) mapa.set(item.id, item)
          else mapa.set(item.id, { ...mapa.get(item.id)!, ...item })
        })
        tiposAlertas.value = Array.from(mapa.values())
        guardarEnLocalStorage()
        return
      }
    }
  } catch (e) {
    console.warn('Error leyendo alertas locales:', e)
  }
  tiposAlertas.value = TIPOS_ALERTAS_CATALOGO.map(a => ({ ...a }))
  guardarEnLocalStorage()
}

export function esTextoAcosoSexual(texto: string): boolean {
  const t = texto.toLowerCase()
  return /acoso sexual|insinuaci[oó]n|propuesta[s]? indebida|tocamiento|contacto f[íi]sico|miradas lascivas|comentarios sexuales|sobrepas[oó]|propasar|indecente|beso a la fuerza|intimidaci[oó]n sexual/i.test(t)
}

export function useTiposAlertas() {
  if (tiposAlertas.value.length === 0) cargarTiposAlertasLocales()

  const tiposActivos = computed(() => tiposAlertas.value.filter(t => t.activa))
  const alertasNivel1 = computed(() => tiposAlertas.value.filter(t => t.nivel === 1 && t.activa))
  const alertasNivel2 = computed(() => tiposAlertas.value.filter(t => t.nivel === 2 && t.activa))
  const alertasNivel3 = computed(() => tiposAlertas.value.filter(t => t.nivel === 3 && t.activa))
  const alertasNivel4 = computed(() => tiposAlertas.value.filter(t => t.nivel === 4 && t.activa))

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
    color?: string
  }): TipoAlertaPersonalizada => {
    const id = `tipo-custom-${Date.now().toString(36)}`
    const severidad = nuevo.severidad || mapearSeveridadPorNivel(nuevo.nivel)
    const keywords = nuevo.palabrasClave?.length
      ? nuevo.palabrasClave
      : [...nuevo.nombre.toLowerCase().split(/\s+/), ...nuevo.descripcion.toLowerCase().split(/\s+/)].filter(w => w.length > 3).slice(0, 8)

    const registro: TipoAlertaPersonalizada = {
      id,
      nombre: nuevo.nombre.trim(),
      descripcion: nuevo.descripcion.trim(),
      nivel: nuevo.nivel,
      severidad,
      modoEnfoque: nuevo.modoEnfoque,
      enfoqueDetalle: nuevo.enfoqueDetalle?.trim() || nuevo.descripcion,
      palabrasClave: Array.from(new Set(keywords.map(k => k.toLowerCase().trim()).filter(Boolean))),
      protocoloAccion: nuevo.protocoloAccion?.trim() || 'Seguimiento por el área de Talento Humano.',
      icono: nuevo.icono || 'ShieldAlert',
      color: nuevo.color || '#ef4444',
      activa: true,
      creadoEn: new Date().toISOString()
    }
    tiposAlertas.value.push(registro)
    guardarEnLocalStorage()
    mostrarExito('Alerta configurada', `"${registro.nombre}" fue agregada a las alertas activas.`)
    return registro
  }

  const editarTipoAlerta = (id: string, datos: Partial<TipoAlertaPersonalizada>): boolean => {
    const item = tiposAlertas.value.find(t => t.id === id)
    if (!item) return false
    if (datos.nivel && !datos.severidad) datos.severidad = mapearSeveridadPorNivel(datos.nivel)
    Object.assign(item, datos)
    guardarEnLocalStorage()
    mostrarExito('Alerta actualizada', `Se guardaron los cambios en "${item.nombre}".`)
    return true
  }

  const actualizarTipoAlerta = (id: string, datos: Partial<TipoAlertaPersonalizada>): boolean => editarTipoAlerta(id, datos)

  const eliminarTipoAlerta = (id: string): boolean => {
    const idx = tiposAlertas.value.findIndex(t => t.id === id)
    if (idx === -1) return false
    const borrado = tiposAlertas.value.splice(idx, 1)[0]
    guardarEnLocalStorage()
    mostrarExito('Alerta eliminada', `"${borrado?.nombre || ''}" fue retirada.`)
    return true
  }

  const toggleActiva = (id: string): boolean => {
    const item = tiposAlertas.value.find(t => t.id === id)
    if (!item) return false
    item.activa = !item.activa
    guardarEnLocalStorage()
    return item.activa
  }

  const restablecerValoresPorDefecto = () => {
    tiposAlertas.value = TIPOS_ALERTAS_CATALOGO.map(a => ({ ...a }))
    guardarEnLocalStorage()
    mostrarExito('Alertas restablecidas', 'Se restauraron las 11 alertas principales del sistema.')
  }

  const coincideTextoConTipoAlerta = (texto: string, tipo: TipoAlertaPersonalizada): boolean => {
    if (!tipo.activa || !texto || texto.trim().length < 3) return false
    const t = texto.toLowerCase().trim()
    if (tipo.id === 'tipo-acoso-sexual') return esTextoAcosoSexual(t)
    if (tipo.id === 'tipo-molestias-cotidianas' && esTextoAcosoSexual(t)) return false
    return tipo.palabrasClave.some(kw => kw.length >= 3 && t.includes(kw.toLowerCase()))
  }

  const clasificarYEncasillarTexto = (
    texto: string,
    esAlertaFlag: boolean = false,
    valorLikert?: number,
    idPregunta?: string
  ): TipoAlertaPersonalizada | null => {
    const t = (texto || '').toLowerCase().trim()
    if (esTextoAcosoSexual(t)) {
      return tiposActivos.value.find(a => a.id === 'tipo-acoso-sexual') || null
    }
    for (const tipo of tiposActivos.value) {
      if (coincideTextoConTipoAlerta(t, tipo)) return tipo
    }
    if ((esAlertaFlag || (valorLikert !== undefined && valorLikert <= 2)) && idPregunta) {
      const idMapa = MAPA_PREGUNTA_A_ALERTA[idPregunta]
      if (idMapa) return tiposActivos.value.find(a => a.id === idMapa) || null
    }
    return null
  }

  const obtenerEtiquetaNivel = (nivel: NivelAlerta): string => {
    if (nivel === 1) return 'Nivel 1 (Crítica / Inmediata)'
    if (nivel === 2) return 'Nivel 2 (Alta)'
    if (nivel === 3) return 'Nivel 3 (Moderada)'
    return 'Nivel 4 (Preventiva / Baja)'
  }

  const obtenerClaseColorNivel = (nivel: NivelAlerta) => {
    if (nivel === 1) return { badge: 'bg-red-100 dark:bg-red-950/80 border-red-300 dark:border-red-800 text-red-700 dark:text-red-300', border: 'border-red-500/50', bg: 'bg-red-50/50 dark:bg-red-950/20', text: 'text-red-600 dark:text-red-400' }
    if (nivel === 2) return { badge: 'bg-rose-100 dark:bg-rose-950/80 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300', border: 'border-rose-500/50', bg: 'bg-rose-50/50 dark:bg-rose-950/20', text: 'text-rose-600 dark:text-rose-400' }
    if (nivel === 3) return { badge: 'bg-amber-100 dark:bg-amber-950/80 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300', border: 'border-amber-500/50', bg: 'bg-amber-50/50 dark:bg-amber-950/20', text: 'text-amber-600 dark:text-amber-400' }
    return { badge: 'bg-sky-100 dark:bg-sky-950/80 border-sky-300 dark:border-sky-800 text-sky-700 dark:text-sky-300', border: 'border-sky-500/50', bg: 'bg-sky-50/50 dark:bg-sky-950/20', text: 'text-sky-600 dark:text-sky-400' }
  }

  return {
    tiposAlertas, tiposActivos, alertasNivel1, alertasNivel2, alertasNivel3, alertasNivel4,
    crearTipoAlerta, editarTipoAlerta, actualizarTipoAlerta, eliminarTipoAlerta, toggleActiva,
    restablecerValoresPorDefecto, coincideTextoConTipoAlerta, clasificarYEncasillarTexto,
    obtenerEtiquetaNivel, obtenerClaseColorNivel, mapearNivelPorSeveridad, mapearSeveridadPorNivel
  }
}
