/**
 * ============================================================================
 * ALMACÉN DE SUGERENCIAS ORGANIZACIONALES (useSugerenciasOrganizacionales.ts)
 * ============================================================================
 * Vincula preguntas de encuesta y comentarios abiertos reales a las 4
 * dimensiones estratégicas de mejora organizacional.
 */

import { ref, computed } from 'vue'
import { useEncuestas } from '@/Almacenes/useEncuestas'
import { useToast } from '@/Almacenes/useToast'
import type { PreguntaEncuesta } from '@/ia'
import { extraerComentarioLibreValido } from '@/ia/menciones/filtroComentariosReales'
import {
  CATEGORIAS_SUGERENCIAS_DEFAULT,
  clasificarPreguntasEnCategorias
} from './sugerencias/autoVinculadorIA'

export { CATEGORIAS_SUGERENCIAS_DEFAULT }

export interface CategoriaSugerenciaConfig {
  id: string
  nombre: string
  icono: string
  color: string
  accionSugerida: string
  preguntasIds: string[]
  palabrasClave: string[]
}

export interface SugerenciaConMetrica {
  id: string
  categoria: string
  color: string
  icono: string
  cantidad: number
  porcentaje: number
  preguntasVinculadas: PreguntaEncuesta[]
  totalPreguntasVinculadas: number
  ejemplosTexto: string[]
  accionSugerida: string
  promedioPuntaje?: number
}

const CLAVE_STORAGE = 'hablandocontigo_sugerencias_vinculadas_v3'
const categoriasConfig = ref<CategoriaSugerenciaConfig[]>([])

function cargarConfiguracion() {
  try {
    const raw = localStorage.getItem(CLAVE_STORAGE)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        categoriasConfig.value = parsed
        return
      }
    }
  } catch {}
  categoriasConfig.value = JSON.parse(JSON.stringify(CATEGORIAS_SUGERENCIAS_DEFAULT))
}

function guardarConfiguracion() {
  try {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(categoriasConfig.value))
  } catch {}
}

cargarConfiguracion()

export function useSugerenciasOrganizacionales() {
  const { encuestas, respuestasAnonimas } = useEncuestas()
  const { mostrarExito } = useToast()

  const todasLasPreguntasDisponibles = computed<PreguntaEncuesta[]>(() => {
    const mapa = new Map<string, PreguntaEncuesta>()
    encuestas.value.forEach(enc => {
      enc.preguntas?.forEach(p => { if (!mapa.has(p.id)) mapa.set(p.id, p) })
      enc.preguntasSeguimiento?.forEach(p => { if (!mapa.has(p.id)) mapa.set(p.id, p) })
    })
    return Array.from(mapa.values())
  })

  const categoriasConRelacionesReales = computed<CategoriaSugerenciaConfig[]>(() => {
    const idsDisponibles = new Set(todasLasPreguntasDisponibles.value.map(p => p.id))
    return categoriasConfig.value.map(cat => ({
      ...cat,
      preguntasIds: (cat.preguntasIds || []).filter(id => idsDisponibles.has(id))
    }))
  })

  const totalPreguntasVinculadas = computed(() =>
    categoriasConRelacionesReales.value.reduce((acc, cat) => acc + cat.preguntasIds.length, 0)
  )

  const sugerenciasConMetricas = computed<SugerenciaConMetrica[]>(() => {
    const todasPregs = todasLasPreguntasDisponibles.value
    const mapaPreguntas = new Map(todasPregs.map(p => [p.id, p]))
    const respuestas = respuestasAnonimas.value || []
    const conteosPorCategoria: Record<string, { count: number; frases: string[]; valores: number[] }> = {}

    categoriasConRelacionesReales.value.forEach(cat => {
      conteosPorCategoria[cat.id] = { count: 0, frases: [], valores: [] }
    })

    let totalGeneralInteracciones = 0

    respuestas.forEach(registro => {
      registro.respuestas?.forEach(item => {
        const idPreg = item.idPregunta || ''
        const rawTxt = extraerComentarioLibreValido(item)
        const txtMin = rawTxt.toLowerCase()
        const valNum = typeof item.valor === 'number' ? item.valor : (Number(item.valor) || 0)

        categoriasConRelacionesReales.value.forEach(cat => {
          const coincidePorPregunta = cat.preguntasIds?.some(pId => pId === idPreg || idPreg.includes(pId))
          const coincidePorPalabra = !coincidePorPregunta && txtMin.length >= 4 && cat.palabrasClave?.some(pal => txtMin.includes(pal.toLowerCase()))

          if (coincidePorPregunta || coincidePorPalabra) {
            const reg = conteosPorCategoria[cat.id]
            if (reg) {
              reg.count++
              totalGeneralInteracciones++
              if (valNum > 0) reg.valores.push(valNum)
              if (rawTxt && rawTxt.length >= 6 && !reg.frases.includes(rawTxt)) {
                reg.frases.push(rawTxt)
              }
            }
          }
        })
      })
    })

    return categoriasConRelacionesReales.value.map(cat => {
      const datos = conteosPorCategoria[cat.id] || { count: 0, frases: [], valores: [] }
      const pregsVinculadas = (cat.preguntasIds || [])
        .map(id => mapaPreguntas.get(id))
        .filter((p): p is PreguntaEncuesta => Boolean(p))

      const porcentaje = pregsVinculadas.length > 0 && totalGeneralInteracciones > 0 && datos.count > 0
        ? Math.round((datos.count / totalGeneralInteracciones) * 100)
        : 0

      const promedioPuntaje = datos.valores.length > 0
        ? +(datos.valores.reduce((a, b) => a + b, 0) / datos.valores.length).toFixed(1)
        : undefined

      return {
        id: cat.id,
        categoria: cat.nombre,
        icono: cat.icono || 'Lightbulb',
        color: cat.color || '#f59e0b',
        cantidad: datos.count,
        porcentaje,
        preguntasVinculadas: pregsVinculadas,
        totalPreguntasVinculadas: pregsVinculadas.length,
        ejemplosTexto: datos.frases.slice(0, 4),
        accionSugerida: cat.accionSugerida,
        promedioPuntaje
      }
    })
  })

  const toggleVinculacion = (categoriaId: string, idPregunta: string) => {
    const cat = categoriasConfig.value.find(c => c.id === categoriaId)
    if (!cat) return
    if (!cat.preguntasIds) cat.preguntasIds = []
    const idx = cat.preguntasIds.indexOf(idPregunta)
    if (idx >= 0) cat.preguntasIds.splice(idx, 1)
    else cat.preguntasIds.push(idPregunta)
    guardarConfiguracion()
  }

  const actualizarCategoria = (categoriaId: string, datos: Partial<CategoriaSugerenciaConfig>) => {
    const cat = categoriasConfig.value.find(c => c.id === categoriaId)
    if (!cat) return
    Object.assign(cat, datos)
    guardarConfiguracion()
    mostrarExito('Categoría actualizada', `Se guardaron los ajustes en "${cat.nombre}".`)
  }

  const autoVincularPreguntasIA = (): number => {
    const totalAsignadas = clasificarPreguntasEnCategorias(todasLasPreguntasDisponibles.value, categoriasConfig.value)
    guardarConfiguracion()
    mostrarExito('🤖 Auto-Vinculación IA Completada', `Se vincularon automáticamente ${totalAsignadas} preguntas.`)
    return totalAsignadas
  }

  const restablecerValoresPorDefecto = () => {
    categoriasConfig.value = JSON.parse(JSON.stringify(CATEGORIAS_SUGERENCIAS_DEFAULT))
    guardarConfiguracion()
    mostrarExito('Valores restablecidos', 'Se restauraron las categorías por defecto.')
  }

  return {
    categoriasConfig: categoriasConRelacionesReales,
    sugerenciasConMetricas,
    todasLasPreguntasDisponibles,
    totalPreguntasVinculadas,
    toggleVinculacion,
    actualizarCategoria,
    autoVincularPreguntasIA,
    restablecerValoresPorDefecto
  }
}
