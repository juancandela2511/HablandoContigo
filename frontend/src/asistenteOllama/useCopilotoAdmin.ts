/**
 * ============================================================================
 * COMPOSABLE DEL COPILOTO ADMINISTRATIVO OLLAMA (useCopilotoAdmin.ts)
 * ============================================================================
 * Gestiona el estado reactivo de las notificaciones y sugerencias de IA
 * para alertas, gráficos anclados y mejora de preguntas con aplicación en 1 clic.
 */

import { ref, computed } from 'vue'
import { useTiposAlertas } from '@/Almacenes/useTiposAlertas'
import { useAnclajeGraficos } from '@/Almacenes/useAnclajeGraficos'
import { useEncuestas } from '@/Almacenes/useEncuestas'
import { useToast } from '@/Almacenes/useToast'
import { obtenerSugerenciasCopilotoOllama } from './servicioAsistenteOllama'
import type {
  SugerenciaAlertaIA,
  SugerenciaGraficoAncladoIA,
  SugerenciaCambioPreguntaIA
} from './tiposAsistente'

const sugerenciasAlertas = ref<SugerenciaAlertaIA[]>([])
const sugerenciasGraficos = ref<SugerenciaGraficoAncladoIA[]>([])
const sugerenciasPreguntas = ref<SugerenciaCambioPreguntaIA[]>([])

const cargandoSugerencias = ref(false)
const origenMotorIA = ref('Ollama Docker (llama3)')
const panelAbierto = ref(false)
const mostrarMiniNotificacion = ref(true)
let inicializado = false

export function useCopilotoAdmin() {
  const { tiposAlertas, crearTipoAlerta } = useTiposAlertas()
  const { graficosAnclados, anclarGrafico } = useAnclajeGraficos()
  const { encuestas, editarEncuesta, respuestasAnonimas } = useEncuestas()
  const { mostrarExito } = useToast()

  const totalSugerenciasPendientes = computed(() =>
    sugerenciasAlertas.value.length +
    sugerenciasGraficos.value.length +
    sugerenciasPreguntas.value.length
  )

  const encuestaActiva = computed(() =>
    encuestas.value.find(e => e.id === 'enc-001') || encuestas.value[0]
  )

  const analizarYSugerirConOllama = async (forzar: boolean = false) => {
    if (cargandoSugerencias.value) return
    if (inicializado && !forzar && totalSugerenciasPendientes.value > 0) return

    cargandoSugerencias.value = true
    try {
      const preguntasBase = (encuestaActiva.value?.preguntas || []).map(p => ({
        id: p.id,
        texto: p.texto,
        categoria: p.categoria,
        tipo: p.tipo
      }))

      const alertasNombres = tiposAlertas.value.map(t => t.nombre)
      const graficosIds = graficosAnclados.value.map(g => g.idPregunta)

      const resultado = await obtenerSugerenciasCopilotoOllama({
        preguntas: preguntasBase,
        alertasExistentes: alertasNombres,
        graficosAncladosIds: graficosIds,
        totalRespuestas: respuestasAnonimas.value.length
      })

      origenMotorIA.value = resultado.origenMotor
      sugerenciasAlertas.value = resultado.sugerenciasAlertas || []
      sugerenciasGraficos.value = resultado.sugerenciasGraficos || []
      sugerenciasPreguntas.value = resultado.sugerenciasPreguntas || []
      mostrarMiniNotificacion.value = true
      inicializado = true
    } finally {
      cargandoSugerencias.value = false
    }
  }

  // ─── 1. ACCIONES SOBRE ALERTAS SUGERIDAS ("¿Sí o No?") ───────────────────
  const aceptarSugerenciaAlerta = (sug: SugerenciaAlertaIA) => {
    crearTipoAlerta({
      nombre: sug.nombre,
      descripcion: sug.descripcion,
      nivel: sug.nivel,
      severidad: sug.severidad,
      modoEnfoque: sug.modoEnfoque,
      palabrasClave: sug.palabrasClave,
      protocoloAccion: sug.protocoloAccion
    })
    sugerenciasAlertas.value = sugerenciasAlertas.value.filter(a => a.id !== sug.id)
  }

  const aceptarTodasLasAlertas = () => {
    const copia = [...sugerenciasAlertas.value]
    copia.forEach(sug => aceptarSugerenciaAlerta(sug))
    mostrarExito('Alertas IA creadas', `Se crearon ${copia.length} alertas sugeridas por Ollama.`)
  }

  const rechazarSugerenciaAlerta = (id: string) => {
    sugerenciasAlertas.value = sugerenciasAlertas.value.filter(a => a.id !== id)
  }

  const rechazarTodasLasAlertas = () => {
    sugerenciasAlertas.value = []
  }

  // ─── 2. ACCIONES SOBRE GRÁFICOS ANCLADOS ("¿Sí o No?") ───────────────────
  const aceptarSugerenciaGrafico = (sug: SugerenciaGraficoAncladoIA) => {
    anclarGrafico({
      idEncuesta: encuestaActiva.value?.id || 'enc-001',
      idPregunta: sug.idPregunta,
      textoPregunta: sug.textoPregunta,
      titulo: sug.tituloSugerido,
      tipoGrafico: sug.tipoGrafico,
      descripcion: sug.razonAnclaje
    })
    sugerenciasGraficos.value = sugerenciasGraficos.value.filter(g => g.id !== sug.id)
    mostrarExito('Gráfico anclado por IA', `"${sug.tituloSugerido}" se ancló al Dashboard.`)
  }

  const aceptarTodosLosGraficos = () => {
    const copia = [...sugerenciasGraficos.value]
    copia.forEach(g => {
      anclarGrafico({
        idEncuesta: encuestaActiva.value?.id || 'enc-001',
        idPregunta: g.idPregunta,
        textoPregunta: g.textoPregunta,
        titulo: g.tituloSugerido,
        tipoGrafico: g.tipoGrafico,
        descripcion: g.razonAnclaje
      })
    })
    sugerenciasGraficos.value = []
    mostrarExito('Gráficos anclados creados', `Ollama ancló ${copia.length} gráficos al Dashboard exitosamente.`)
  }

  const rechazarSugerenciaGrafico = (id: string) => {
    sugerenciasGraficos.value = sugerenciasGraficos.value.filter(g => g.id !== id)
  }

  const rechazarTodosLosGraficos = () => {
    sugerenciasGraficos.value = []
  }

  // ─── 3. ACCIONES SOBRE MEJORA DE PREGUNTAS ("Aceptar cambio") ────────────
  const aceptarCambioPregunta = async (sug: SugerenciaCambioPreguntaIA) => {
    const enc = encuestaActiva.value
    if (!enc || !Array.isArray(enc.preguntas)) return

    const preguntasActualizadas = enc.preguntas.map(p =>
      p.id === sug.idPregunta ? { ...p, texto: sug.textoSugerido } : p
    )

    await editarEncuesta(enc.id, {
      ...enc,
      preguntas: preguntasActualizadas
    })

    sugerenciasPreguntas.value = sugerenciasPreguntas.value.filter(p => p.id !== sug.id)
    mostrarExito('Pregunta optimizada con IA', 'El cambio sugerido por Ollama fue aplicado en la encuesta.')
  }

  const aceptarTodosCambiosPreguntas = async () => {
    const enc = encuestaActiva.value
    if (!enc || !Array.isArray(enc.preguntas)) return

    const mapaCambios = new Map(sugerenciasPreguntas.value.map(s => [s.idPregunta, s.textoSugerido]))
    const preguntasActualizadas = enc.preguntas.map(p =>
      mapaCambios.has(p.id) ? { ...p, texto: mapaCambios.get(p.id)! } : p
    )

    await editarEncuesta(enc.id, {
      ...enc,
      preguntas: preguntasActualizadas
    })

    const total = sugerenciasPreguntas.value.length
    sugerenciasPreguntas.value = []
    mostrarExito('Preguntas actualizadas con IA', `Se aplicaron ${total} mejoras psicométricas sugeridas por Ollama.`)
  }

  const rechazarCambioPregunta = (id: string) => {
    sugerenciasPreguntas.value = sugerenciasPreguntas.value.filter(p => p.id !== id)
  }

  return {
    sugerenciasAlertas,
    sugerenciasGraficos,
    sugerenciasPreguntas,
    cargandoSugerencias,
    origenMotorIA,
    panelAbierto,
    mostrarMiniNotificacion,
    totalSugerenciasPendientes,
    analizarYSugerirConOllama,
    aceptarSugerenciaAlerta,
    aceptarTodasLasAlertas,
    rechazarSugerenciaAlerta,
    rechazarTodasLasAlertas,
    aceptarSugerenciaGrafico,
    aceptarTodosLosGraficos,
    rechazarSugerenciaGrafico,
    rechazarTodosLosGraficos,
    aceptarCambioPregunta,
    aceptarTodosCambiosPreguntas,
    rechazarCambioPregunta
  }
}
