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

const CLAVE_STORAGE = 'hablandocontigo_anclajes_graficos_v3'

// Gráficos por defecto iniciales
const ANCLAJES_INICIALES: GraficoAnclado[] = [
  {
    id: 'anclaje-001',
    idEncuesta: 'enc-001',
    titulo: 'Clima Laboral y Respeto',
    idPregunta: 'b1-p1',
    textoPregunta: '¿Cómo evalúas el ambiente de trabajo y el respeto entre compañeros?',
    tipoGrafico: 'barras',
    descripcion: 'Distribución porcentual del clima general.'
  },
  {
    id: 'anclaje-002',
    idEncuesta: 'enc-001',
    titulo: 'Proyección y Sentido de Pertenencia',
    idPregunta: 'b1-p2',
    textoPregunta: '¿Te sientes motivado y respaldado por tus líderes de área?',
    tipoGrafico: 'pastel',
    descripcion: 'Proporción de respuestas favorables vs desfavorables.'
  }
]

function cargarAnclajes(): GraficoAnclado[] {
  try {
    const raw = localStorage.getItem(CLAVE_STORAGE)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(g => ({
          ...g,
          tipoGrafico: g.tipoGrafico === 'barras' ? 'barras' : 'pastel'
        }))
      }
    }
  } catch (e) {
    console.warn('[useAnclajeGraficos] Error leyendo localStorage:', e)
  }
  return ANCLAJES_INICIALES
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
    const preguntasConOpciones = preguntas.filter(p => p.tipo === 'multiple' || p.tipo === 'si_no' || p.tipo === 'escala' || p.tipo === 'texto')
    if (preguntasConOpciones.length === 0) return 0

    // Primer pregunta a Barras si no está ya
    const p1 = preguntasConOpciones[0]
    if (p1 && !graficosAnclados.value.some(g => g.idPregunta === p1.id)) {
      anclarGrafico({
        idEncuesta,
        idPregunta: p1.id,
        textoPregunta: p1.texto,
        titulo: `Estadística: ${p1.texto.substring(0, 45)}`,
        tipoGrafico: 'barras',
        descripcion: 'Análisis de frecuencias en gráfico de barras.'
      })
      creados++
    }

    // Segunda pregunta a Pastel si no está ya
    if (preguntasConOpciones.length > 1) {
      const p2 = preguntasConOpciones[1]
      if (p2 && !graficosAnclados.value.some(g => g.idPregunta === p2.id)) {
        anclarGrafico({
          idEncuesta,
          idPregunta: p2.id,
          textoPregunta: p2.texto,
          titulo: `Distribución: ${p2.texto.substring(0, 45)}`,
          tipoGrafico: 'pastel',
          descripcion: 'Distribución porcentual en gráfico circular.'
        })
        creados++
      }
    }

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
