<!--
  ============================================================================
  PESTAÑA DE GRÁFICOS ANCLADOS (PestanaGraficosAnclados.vue)
  ============================================================================
  Muestra las preguntas ancladas al dashboard exclusivamente como Gráficos
  de Barras o de Pastel.
-->

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  PieChart,
  BarChart3,
  Trash2,
  RefreshCw,
  List,
  Sparkles,
  Bot,
  MessageSquare,
  AlertTriangle
} from 'lucide-vue-next'
import { useAnclajeGraficos, type GraficoAnclado } from '@/Almacenes/useAnclajeGraficos'
import type { ResultadoAdaptacionGrafico } from '@/services/adaptadorRespuestasGraficos'
import { resumirComentariosPreguntaConOllama, type ResumenComentariosPregunta, type PreguntaEncuesta } from '@/ia'
import GraficosAncladosVisualizador from '../Graficos/GraficosAncladosVisualizador.vue'

const props = defineProps<{
  respuestas: any[]
  preguntasDisponibles: PreguntaEncuesta[]
  idEncuestaActual?: string
}>()

const router = useRouter()

const {
  graficosAnclados,
  totalGraficos,
  eliminarGraficoAnclado,
  calcularDatosGrafico
} = useAnclajeGraficos()

const cargandoCalculos = ref(false)
const datosCalculadosPorGrafico = ref<Record<string, ResultadoAdaptacionGrafico>>({})
const resumenesIAPorGrafico = ref<Record<string, ResumenComentariosPregunta>>({})
const cargandoResumenesIA = ref<Record<string, boolean>>({})

const obtenerIndicePregunta = (grafico: GraficoAnclado): number => {
  const lista = props.preguntasDisponibles || []
  const idx = lista.findIndex(p =>
    p.id === grafico.idPregunta ||
    (p.texto && grafico.textoPregunta && p.texto.trim().toLowerCase() === grafico.textoPregunta.trim().toLowerCase())
  )
  return idx !== -1 ? idx : 9999
}

const graficosFiltrados = computed(() => {
  const base = !props.idEncuestaActual
    ? [...graficosAnclados.value]
    : graficosAnclados.value.filter(g => !g.idEncuesta || g.idEncuesta === props.idEncuestaActual)

  return base.sort((a, b) => obtenerIndicePregunta(a) - obtenerIndicePregunta(b))
})

const extraerComentariosDeGrafico = (grafico: GraficoAnclado): string[] => {
  const comentarios: string[] = []
  props.respuestas.forEach((sesion: any) => {
    (sesion.respuestas || []).forEach((item: any) => {
      const matchId = item.idPregunta && (item.idPregunta === grafico.idPregunta || item.idPregunta.includes(grafico.idPregunta))
      const matchTexto = item.textoPregunta && grafico.textoPregunta && item.textoPregunta.trim().toLowerCase() === grafico.textoPregunta.trim().toLowerCase()
      if (matchId || matchTexto) {
        const com = (item.comentario || '').trim()
        if (com && com.length > 2 && !comentarios.includes(com)) {
          comentarios.push(com)
        } else if (!item.comentario && typeof item.respuesta === 'string' && item.respuesta.trim().length > 8 && !comentarios.includes(item.respuesta.trim())) {
          comentarios.push(item.respuesta.trim())
        }
      }
    })
  })
  return comentarios
}

const analizarComentariosDeGrafico = async (grafico: GraficoAnclado) => {
  cargandoResumenesIA.value[grafico.id] = true
  try {
    const comentarios = extraerComentariosDeGrafico(grafico)
    const resumen = await resumirComentariosPreguntaConOllama(
      grafico.textoPregunta || grafico.titulo,
      comentarios
    )
    resumenesIAPorGrafico.value[grafico.id] = resumen
  } catch (err) {
    console.error('Error analizando comentarios con Ollama:', grafico.id, err)
  } finally {
    cargandoResumenesIA.value[grafico.id] = false
  }
}

const procesarTodosLosGraficos = async () => {
  cargandoCalculos.value = true
  const nuevosCalculos: Record<string, ResultadoAdaptacionGrafico> = {}

  for (const g of graficosFiltrados.value) {
    try {
      const res = await calcularDatosGrafico(g, props.respuestas, props.preguntasDisponibles)
      nuevosCalculos[g.id] = res
      // Disparar análisis de comentarios con Ollama
      analizarComentariosDeGrafico(g)
    } catch (e) {
      console.error('Error calculando gráfico anclado:', g.id, e)
    }
  }

  datosCalculadosPorGrafico.value = nuevosCalculos
  cargandoCalculos.value = false
}

onMounted(() => {
  procesarTodosLosGraficos()
})

watch(
  () => [props.respuestas.length, graficosFiltrados.value.length, props.idEncuestaActual],
  () => {
    procesarTodosLosGraficos()
  }
)
</script>

<template>
  <div class="space-y-6 text-left">
    <!-- ENCABEZADO -->
    <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-400 text-[10px] font-bold font-mono uppercase tracking-wider flex items-center gap-1">
            <BarChart3 class="w-3 h-3" />
            Estadísticas Ancladas
          </span>
          <span class="text-xs text-slate-400 font-mono">
            {{ totalGraficos }} gráficos
          </span>
        </div>

        <h2 class="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
          Gráficos de Barras y Pastel Anclados
        </h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
          Visualiza de forma inmediata la distribución de votos de cada pregunta en formatos de Barras o Pastel.
        </p>
      </div>

      <div class="flex items-center gap-2.5 shrink-0">
        <button
          @click="procesarTodosLosGraficos"
          :disabled="cargandoCalculos"
          class="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          title="Recalcular métricas"
        >
          <RefreshCw :class="['w-4 h-4', cargandoCalculos ? 'animate-spin text-sky-500' : '']" />
        </button>
      </div>
    </div>

    <!-- ESTADO VACÍO -->
    <div
      v-if="graficosFiltrados.length === 0"
      class="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4"
    >
      <div class="w-16 h-16 rounded-3xl bg-sky-50 dark:bg-sky-950/50 text-sky-500 flex items-center justify-center mx-auto">
        <PieChart class="w-8 h-8" />
      </div>
      <div class="space-y-1">
        <h3 class="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
          No tienes gráficas ancladas en este proyecto
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Ve a la sección de proyectos/preguntas y ancla cualquier pregunta de este proyecto eligiendo entre gráfico de Barras o Pastel.
        </p>
      </div>
      <div class="flex items-center justify-center pt-2">
        <button
          @click="router.push('/proyectos')"
          type="button"
          class="px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95 border border-sky-400/30"
        >
          <List class="w-4 h-4" />
          <span>Ir a Gestión de Preguntas</span>
        </button>
      </div>
    </div>

    <!-- CUADRÍCULA DE GRÁFICOS ANCLADOS (Barras o Pastel) -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div
        v-for="grafico in graficosFiltrados"
        :key="grafico.id"
        class="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 hover:border-sky-500/40 transition-all flex flex-col justify-between"
      >
        <div class="space-y-2">
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-1">
              <div class="flex items-center gap-2 flex-wrap">
                <span
                  v-if="obtenerIndicePregunta(grafico) < 9999"
                  class="px-2 py-0.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black font-mono"
                >
                  Pregunta #{{ obtenerIndicePregunta(grafico) + 1 }}
                </span>
                <span
                  class="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono flex items-center gap-1"
                  :class="grafico.tipoGrafico === 'barras' 
                    ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400' 
                    : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400'"
                >
                  <component :is="grafico.tipoGrafico === 'barras' ? BarChart3 : PieChart" class="w-3 h-3" />
                  {{ grafico.tipoGrafico === 'barras' ? 'Gráfico de Barras' : 'Gráfico de Pastel' }}
                </span>

                <span class="text-[10px] font-mono text-slate-400">
                  {{ datosCalculadosPorGrafico[grafico.id]?.totalMuestras || 0 }} respuestas
                </span>
              </div>

              <h3 class="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                {{ grafico.titulo }}
              </h3>
            </div>

            <!-- Botón de Desanclar -->
            <button
              @click="eliminarGraficoAnclado(grafico.id)"
              class="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              title="Desanclar este gráfico"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>

          <!-- Pregunta vinculada -->
          <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 italic bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
            "{{ grafico.textoPregunta }}"
          </p>
        </div>

        <!-- Visualizador (Barras o Pastel) -->
        <GraficosAncladosVisualizador
          :tipoGrafico="grafico.tipoGrafico"
          :segmentos="datosCalculadosPorGrafico[grafico.id]?.segmentos || []"
          :totalMuestras="datosCalculadosPorGrafico[grafico.id]?.totalMuestras || 0"
        />

        <!-- Resumen de Comentarios Generado por IA Ollama (Abajo del gráfico anclado) -->
        <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-left">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1.5">
              <span class="w-5 h-5 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold">
               
              </span>
              <span class="text-xs font-black tracking-wide text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                
                <span
                  v-if="resumenesIAPorGrafico[grafico.id]?.sentimientoPredominante"
                  :class="[
                    'text-[9px] px-2 py-0.5 rounded-full font-mono font-bold',
                    resumenesIAPorGrafico[grafico.id]?.sentimientoPredominante === 'Crítico'
                      ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40'
                      : resumenesIAPorGrafico[grafico.id]?.sentimientoPredominante === 'Favorable'
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  ]"
                >
                  {{ resumenesIAPorGrafico[grafico.id]?.sentimientoPredominante }}
                </span>
              </span>
            </div>

            <button
              type="button"
              @click="analizarComentariosDeGrafico(grafico)"
              :disabled="cargandoResumenesIA[grafico.id]"
              class="p-1 rounded-lg text-slate-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Volver a analizar con IA"
            >
              <RefreshCw :class="['w-3 h-3', cargandoResumenesIA[grafico.id] ? 'animate-spin text-sky-500' : '']" />
            </button>
          </div>

          <div
            v-if="cargandoResumenesIA[grafico.id]"
            class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-400"
          >
            <RefreshCw class="w-3.5 h-3.5 animate-spin text-sky-500" />
            <span>Ollama analizando comentarios de los colaboradores...</span>
          </div>

          <div
            v-else-if="resumenesIAPorGrafico[grafico.id]"
            class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs"
          >
            <p class="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {{ resumenesIAPorGrafico[grafico.id]?.resumen }}
            </p>

            <div
              v-if="resumenesIAPorGrafico[grafico.id]?.problemasPrincipales && (resumenesIAPorGrafico[grafico.id]?.problemasPrincipales?.length || 0) > 0"
              class="flex flex-wrap gap-1.5 pt-1"
            >
              <span
                v-for="(prob, pIdx) in (resumenesIAPorGrafico[grafico.id]?.problemasPrincipales || [])"
                :key="pIdx"
                class="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] text-slate-600 dark:text-slate-400 font-semibold flex items-center gap-1"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                {{ prob }}
              </span>
            </div>

            <!-- Comentarios específicos y textuales de colaboradores -->
            <div
              v-if="resumenesIAPorGrafico[grafico.id]?.citasDirectas && (resumenesIAPorGrafico[grafico.id]?.citasDirectas?.length || 0) > 0"
              class="pt-2 border-t border-slate-200/60 dark:border-slate-800 space-y-1.5"
            >
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <MessageSquare class="w-3 h-3 text-sky-500" />
                Comentarios textuales de colaboradores ({{ resumenesIAPorGrafico[grafico.id]?.citasDirectas?.length }}):
              </span>
              <div class="space-y-1 max-h-48 overflow-y-auto pr-1">
                <p
                  v-for="(cita, cIdx) in (resumenesIAPorGrafico[grafico.id]?.citasDirectas || [])"
                  :key="cIdx"
                  class="text-[11px] text-slate-800 dark:text-slate-200 italic pl-2.5 border-l-2 border-sky-400 dark:border-sky-500 py-1 bg-white/70 dark:bg-slate-900/60 rounded-r-lg"
                >
                  "{{ cita }}"
                </p>
              </div>
            </div>
          </div>

          <div
            v-else
            class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 text-[11px] text-slate-400 italic text-center"
          >
            Sin comentarios registrados aún para esta pregunta.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
