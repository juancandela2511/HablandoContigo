/**
 * ============================================================================
 * ALMACÉN DE ANCLAJE DE GRÁFICOS A PREGUNTAS (useAnclajeGraficos.ts)
 * ============================================================================
 * Gestiona de forma reactiva la lista de preguntas ancladas al Dashboard.
 * Soporta exclusivamente dos modalidades de visualización:
 * - 'barras': Gráfico de barras horizontales proporcionales.
 * - 'pastel': Gráfico circular tipo pastel / torta.
 */

import { ref, computed } from 'vue'
import type { PreguntaEncuesta } from '@/ia'
import { adaptarRespuestasAGrafico, type ResultadoAdaptacionGrafico } from '@/services/adaptadorRespuestasGraficos'
import preguntasJson from '@/database/preguntas.json'

import type { SegmentoGrafico } from '@/services/adaptadorRespuestasGraficos'

export type TipoGraficoAnclado = 'barras' | 'pastel'
export type TipoGrafico = TipoGraficoAnclado | 'dona' | 'gauge' | 'metrica'
export type TipoAnalisis = 'distribucion_opciones' | 'conteo_absoluto' | 'promedio_satisfaccion' | 'sentimiento_ia' | 'alertas'
export type DatoSegmentoGrafico = SegmentoGrafico

export interface GraficoAnclado {
  id: string
  idPregunta: string
  textoPregunta: string
  titulo: string
  tipoGrafico: TipoGraficoAnclado
  tipoAnalisis?: TipoAnalisis
  descripcion?: string
  idEncuesta?: string
}

const CLAVE_STORAGE = 'hablandocontigo_anclajes_graficos_v5'

// Generar gráficos por defecto para TODAS las 32 preguntas de la encuesta oficial
function construirAnclajesPredeterminados(preguntas: any[] = preguntasJson): GraficoAnclado[] {
  return (preguntas || []).map((p: any, idx: number) => {
    const tipoGrafico: TipoGraficoAnclado = p.tipoGrafico ? (p.tipoGrafico === 'pastel' ? 'pastel' : 'barras') : (idx % 2 === 0 ? 'barras' : 'pastel')
    const texto = String(p.texto || '')
    return {
      id: `anclaje-auto-${p.id}`,
      idEncuesta: 'enc-001',
      titulo: `Estadística: ${texto.substring(0, 48)}${texto.length > 48 ? '...' : ''}`,
      idPregunta: p.id,
      textoPregunta: texto,
      tipoGrafico,
      descripcion: tipoGrafico === 'barras'
        ? 'Análisis comparativo de frecuencias en gráfico de barras.'
        : 'Distribución porcentual en gráfico circular.'
    }
  })
}

const ANCLAJES_INICIALES: GraficoAnclado[] = construirAnclajesPredeterminados(preguntasJson)

function obtenerTiposGraficoDesdeEncuestasLocales(): Map<string, TipoGraficoAnclado> {
  const mapa = new Map<string, TipoGraficoAnclado>()
  try {
    const claves = [
      'hablandocontigo_encuestas',
      'hablandocontigo_proyectos_guardados_v2',
      'hablandocontigo_encuestas_clima_v14'
    ]
    claves.forEach(clave => {
      const raw = localStorage.getItem(clave)
      if (raw) {
        const encuestas = JSON.parse(raw)
        if (Array.isArray(encuestas)) {
          encuestas.forEach((enc: any) => {
            ;(enc?.preguntas || []).forEach((p: any) => {
              if (p?.id && (p.tipoGrafico === 'pastel' || p.tipoGrafico === 'barras')) {
                mapa.set(p.id, p.tipoGrafico)
              }
            })
          })
        }
      }
    })
  } catch {}
  return mapa
}

function sincronizarAnclajesConConfiguracion(guardados: GraficoAnclado[] = []): GraficoAnclado[] {
  const mapaGuardados = new Map(guardados.map(g => [g.idPregunta, g]))
  const mapaDesdeEncuestas = obtenerTiposGraficoDesdeEncuestasLocales()
  const listaBase = (preguntasJson as any[]).map((p: any, idx: number) => {
    const guardado = mapaGuardados.get(p.id)
    const tipoEnEncuesta = mapaDesdeEncuestas.get(p.id)
    // Priorizar la elección guardada por el usuario (en encuesta activa o en anclajes) sobre el JSON estático
    const tipoGrafico: TipoGraficoAnclado =
      tipoEnEncuesta === 'pastel' || guardado?.tipoGrafico === 'pastel'
        ? 'pastel'
        : guardado?.tipoGrafico
          ? (guardado.tipoGrafico === 'pastel' ? 'pastel' : 'barras')
          : tipoEnEncuesta
            ? tipoEnEncuesta
            : p.tipoGrafico
              ? (p.tipoGrafico === 'pastel' ? 'pastel' : 'barras')
              : (idx % 2 === 0 ? 'barras' : 'pastel')
    const texto = String(guardado?.textoPregunta || p.texto || '')
    return {
      id: guardado?.id || `anclaje-auto-${p.id}`,
      idEncuesta: guardado?.idEncuesta || 'enc-001',
      titulo: guardado?.titulo || `Estadística: ${texto.substring(0, 48)}${texto.length > 48 ? '...' : ''}`,
      idPregunta: p.id,
      textoPregunta: texto,
      tipoGrafico,
      descripcion: tipoGrafico === 'barras'
        ? 'Análisis comparativo de frecuencias en gráfico de barras.'
        : 'Distribución porcentual en gráfico circular.'
    }
  })

  // Conservar estadísticas adicionales creadas por el usuario para preguntas personalizadas
  guardados.forEach(g => {
    if (!listaBase.some(item => item.idPregunta === g.idPregunta)) {
      listaBase.push(g)
    }
  })

  return listaBase
}

function cargarAnclajes(): GraficoAnclado[] {
  let guardados: GraficoAnclado[] = []
  try {
    const raw = localStorage.getItem(CLAVE_STORAGE)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        guardados = parsed
      }
    }
  } catch (e) {
    console.warn('[useAnclajeGraficos] Error leyendo localStorage:', e)
  }
  const sincronizados = sincronizarAnclajesConConfiguracion(guardados)
  try {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(sincronizados))
  } catch {}
  return sincronizados
}

const graficosAnclados = ref<GraficoAnclado[]>(cargarAnclajes())

function guardarAnclajes() {
  try {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(graficosAnclados.value))
  } catch (e) {
    console.warn('[useAnclajeGraficos] Error guardando en localStorage:', e)
  }
}

export function useAnclajeGraficos() {
  const totalGraficos = computed(() => graficosAnclados.value.length)

  const anclarGrafico = (params: Omit<GraficoAnclado, 'id'>) => {
    // Normalizar a 'barras' o 'pastel'
    const tipoGrafico: TipoGraficoAnclado = (params.tipoGrafico as string) === 'barras' ? 'barras' : 'pastel'

    const nuevo: GraficoAnclado = {
      ...params,
      id: `anclaje-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      tipoGrafico
    }
    graficosAnclados.value.push(nuevo)
    guardarAnclajes()
    return nuevo
  }

  const actualizarGrafico = (id: string, cambios: Partial<GraficoAnclado>) => {
    const index = graficosAnclados.value.findIndex(g => g.id === id)
    const actual = graficosAnclados.value[index]
    if (actual) {
      graficosAnclados.value[index] = {
        ...actual,
        ...cambios,
        id: actual.id,
        idPregunta: cambios.idPregunta || actual.idPregunta,
        textoPregunta: cambios.textoPregunta || actual.textoPregunta,
        titulo: cambios.titulo || actual.titulo,
        tipoGrafico: cambios.tipoGrafico === 'barras' ? 'barras' : (cambios.tipoGrafico === 'pastel' ? 'pastel' : actual.tipoGrafico)
      }
      guardarAnclajes()
    }
  }

  const actualizarOCrearGraficoParaPregunta = (
    pregunta: PreguntaEncuesta,
    tipoGraficoDeseado: string = 'barras',
    _tipoAnalisisIgnorado?: any,
    idEncuesta?: string
  ) => {
    const tipoGrafico: TipoGraficoAnclado = tipoGraficoDeseado === 'barras' ? 'barras' : 'pastel'
    pregunta.tipoGrafico = tipoGrafico
    const existente = graficosAnclados.value.find(g => 
      g.idPregunta === pregunta.id || 
      (g.textoPregunta && pregunta.texto && g.textoPregunta.trim().toLowerCase() === pregunta.texto.trim().toLowerCase())
    )

    if (existente) {
      actualizarGrafico(existente.id, {
        tipoGrafico,
        textoPregunta: pregunta.texto,
        titulo: `Estadística: ${pregunta.texto.substring(0, 45)}${pregunta.texto.length > 45 ? '...' : ''}`
      })
    } else {
      anclarGrafico({
        idEncuesta,
        titulo: `Estadística: ${pregunta.texto.substring(0, 45)}${pregunta.texto.length > 45 ? '...' : ''}`,
        idPregunta: pregunta.id,
        textoPregunta: pregunta.texto,
        tipoGrafico,
        descripcion: `Estadística de la pregunta "${pregunta.texto.substring(0, 40)}...".`
      })
    }
  }

  const eliminarGraficoAnclado = (id: string) => {
    graficosAnclados.value = graficosAnclados.value.filter(g => g.id !== id)
    guardarAnclajes()
  }

  const eliminarEstadisticasDePregunta = (idPregunta: string) => {
    graficosAnclados.value = graficosAnclados.value.filter(g => g.idPregunta !== idPregunta)
    guardarAnclajes()
  }

  const calcularDatosGrafico = async (
    grafico: GraficoAnclado,
    respuestas: any[],
    preguntasDisponibles: PreguntaEncuesta[] = []
  ): Promise<ResultadoAdaptacionGrafico> => {
    return adaptarRespuestasAGrafico(
      grafico.idPregunta,
      grafico.textoPregunta,
      respuestas,
      preguntasDisponibles
    )
  }

  const generarEnlazarGraficosPredeterminadosIA = (
    preguntas: PreguntaEncuesta[] = [],
    idEncuesta: string = 'enc-001'
  ): number => {
    let creados = 0
    const lista = preguntas.length > 0 ? preguntas : (preguntasJson as unknown as PreguntaEncuesta[])
    if (lista.length === 0) return 0

    lista.forEach((p, idx) => {
      if (p && !graficosAnclados.value.some(g => g.idPregunta === p.id)) {
        const tipoGrafico: TipoGraficoAnclado = p.tipoGrafico ? (p.tipoGrafico === 'pastel' ? 'pastel' : 'barras') : (idx % 2 === 0 ? 'barras' : 'pastel')
        anclarGrafico({
          idEncuesta,
          idPregunta: p.id,
          textoPregunta: p.texto,
          titulo: `Estadística: ${p.texto.substring(0, 48)}${p.texto.length > 48 ? '...' : ''}`,
          tipoGrafico,
          descripcion: tipoGrafico === 'barras'
            ? 'Análisis de frecuencias en gráfico de barras.'
            : 'Distribución porcentual en gráfico circular.'
        })
        creados++
      }
    })

    return creados
  }

  return {
    graficosAnclados,
    totalGraficos,
    anclarGrafico,
    anclarNuevoGrafico: anclarGrafico, // Alias compatible
    actualizarGrafico,
    actualizarGraficoAnclado: actualizarGrafico, // Alias compatible
    actualizarOCrearGraficoParaPregunta,
    eliminarGraficoAnclado,
    eliminarEstadisticasDePregunta,
    generarEnlazarGraficosPredeterminadosIA,
    calcularDatosGrafico
  }
}

// Exportar también como useGraficosAnclados para compatibilidad total con vistas existentes
export { useAnclajeGraficos as useGraficosAnclados }
