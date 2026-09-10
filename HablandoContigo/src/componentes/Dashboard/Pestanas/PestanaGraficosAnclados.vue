<!--
  ============================================================================
  PESTAÑA DE GRÁFICOS ANCLADOS & ANÁLISIS CON IA (PestanaGraficosAnclados.vue)
  ============================================================================
-->

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import {
  PlusCircle,
  Sparkles,
  PieChart,
  BarChart3,
  Gauge,
  Sliders,
  Trash2,
  RefreshCw,
  HelpCircle,
  BrainCircuit,
  ShieldCheck,
  CheckCircle2,
  Info
} from 'lucide-vue-next'
import {
  useGraficosAnclados,
  type GraficoAnclado,
  type ResultadoCalculoGrafico
} from '@/Almacenes/useGraficosAnclados'
import type { PreguntaEncuesta } from '@/Servicios/iaEncuestasService'
import GraficoDonaCircular from '../Graficos/GraficoDonaCircular.vue'
import ModalCrearGraficoAnclado from '../Modales/ModalCrearGraficoAnclado.vue'
import BotonBase from '@/componentes/ElementosBase/BotonBase.vue'

const props = defineProps<{
  respuestas: any[]
  preguntasDisponibles: PreguntaEncuesta[]
  idEncuestaActual?: string
}>()

const {
  graficosAnclados,
  totalGraficos,
  anclarNuevoGrafico,
  eliminarGraficoAnclado,
  restaurarGraficosPredeterminados,
  calcularDatosGrafico
} = useGraficosAnclados()

const modalCrearAbierto = ref(false)
const cargandoCalculos = ref(false)
const datosCalculadosPorGrafico = ref<Record<string, ResultadoCalculoGrafico>>({})

const procesarTodosLosGraficos = async () => {
  cargandoCalculos.value = true
  const nuevosCalculos: Record<string, ResultadoCalculoGrafico> = {}

  for (const g of graficosAnclados.value) {
    try {
      const res = await calcularDatosGrafico(g, props.respuestas, props.preguntasDisponibles)
      nuevosCalculos[g.id] = res
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

// Recalcular cuando cambien las respuestas o los gráficos anclados
watch(
  () => [props.respuestas.length, graficosAnclados.value.length],
  () => {
    procesarTodosLosGraficos()
  }
)

const manejarNuevoAnclaje = (nuevo: Omit<GraficoAnclado, 'id' | 'fechaCreacion'>) => {
  const creado = anclarNuevoGrafico(nuevo)
  calcularDatosGrafico(creado, props.respuestas, props.preguntasDisponibles).then(res => {
    datosCalculadosPorGrafico.value[creado.id] = res
  })
}
</script>

<template>
  <div class="space-y-6 text-left">
    
    <!-- ENCABEZADO Y BOTONES DE ACCIÓN -->
    <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-400 text-[10px] font-bold font-mono uppercase tracking-wider flex items-center gap-1">
            <Sparkles class="w-3 h-3" />
            Cero Carga Operativa
          </span>
          <span class="text-xs text-slate-400 font-mono">
            {{ totalGraficos }} gráficos anclados
          </span>
        </div>

        <h2 class="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
          Gráficos Anclados & Análisis Inteligente con IA
        </h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
          Vincula cualquier pregunta de la encuesta a un gráfico interactivo. La IA encasilla automáticamente las respuestas abiertas en Buenas, Malas o Neutras, actualizando las visualizaciones en tiempo real sin requerir reportes manuales.
        </p>
      </div>

      <div class="flex items-center gap-2.5 shrink-0">
        <button
          @click="procesarTodosLosGraficos"
          :disabled="cargandoCalculos"
          class="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          title="Recalcular métricas en tiempo real"
        >
          <RefreshCw :class="['w-4 h-4', cargandoCalculos ? 'animate-spin text-sky-500' : '']" />
        </button>

        <BotonBase
          variante="primario"
          tamano="mediano"
          @click="modalCrearAbierto = true"
        >
          <template #iconoIzquierdo>
            <BarChart3 class="w-4 h-4" />
          </template>
          <span>Crear Estadística de Pregunta</span>
        </BotonBase>
      </div>
    </div>

    <!-- ESTADO VACÍO SI NO HAY GRÁFICOS -->
    <div
      v-if="graficosAnclados.length === 0"
      class="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4"
    >
      <div class="w-16 h-16 rounded-3xl bg-sky-50 dark:bg-sky-950/50 text-sky-500 flex items-center justify-center mx-auto">
        <PieChart class="w-8 h-8" />
      </div>
      <div class="space-y-1">
        <h3 class="text-base font-bold text-slate-900 dark:text-white">No tienes estadísticas de preguntas creadas</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Comienza creando la estadística para las preguntas clave que necesitas monitorear constantemente para quitarte la carga operativa.
        </p>
      </div>
      <div class="flex items-center justify-center gap-3 pt-2">
        <BotonBase variante="primario" tamano="mediano" @click="modalCrearAbierto = true">
          <span>+ Crear Estadística de Pregunta</span>
        </BotonBase>
        <BotonBase variante="esquema" tamano="mediano" @click="restaurarGraficosPredeterminados">
          <span>Restaurar Predeterminados</span>
        </BotonBase>
      </div>
    </div>

    <!-- CUADRÍCULA RESPONSIVA DE GRÁFICOS ANCLADOS -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div
        v-for="grafico in graficosAnclados"
        :key="grafico.id"
        class="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-sky-500/40 transition-all flex flex-col justify-between"
      >
        <!-- Encabezado de la Tarjeta -->
        <div class="space-y-2">
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-1">
              <div class="flex items-center gap-2 flex-wrap">
                <span
                  v-if="grafico.tipoAnalisis === 'sentimiento_ia'"
                  class="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold font-mono flex items-center gap-1"
                >
                  <BrainCircuit class="w-3 h-3" />
                  IA: Sentimiento (Buena / Mala)
                </span>
                <span
                  v-else-if="grafico.tipoAnalisis === 'promedio_satisfaccion'"
                  class="px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 text-[10px] font-bold font-mono flex items-center gap-1"
                >
                  <Gauge class="w-3 h-3" />
                  Promedio de Satisfacción
                </span>
                <span
                  v-else
                  class="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold font-mono flex items-center gap-1"
                >
                  <BarChart3 class="w-3 h-3" />
                  Distribución de Votos
                </span>

                <span class="text-[10px] font-mono text-slate-400">
                  {{ datosCalculadosPorGrafico[grafico.id]?.totalMuestras || 0 }} respuestas
                </span>
              </div>

              <h3 class="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                {{ grafico.titulo }}
              </h3>
            </div>

            <!-- Botón de Borrar Anclaje -->
            <button
              @click="eliminarGraficoAnclado(grafico.id)"
              class="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              title="Desanclar este gráfico del dashboard"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>

          <!-- Pregunta vinculada -->
          <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 italic bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
            "{{ grafico.textoPregunta }}"
          </p>
        </div>

        <!-- CUERPO DEL GRÁFICO (RENDERIZADO SEGÚN TIPO) -->
        <div class="py-2">
          <!-- CASO A: TIPO DONA / CIRCULAR -->
          <GraficoDonaCircular
            v-if="grafico.tipoGrafico === 'dona'"
            :segmentos="datosCalculadosPorGrafico[grafico.id]?.segmentos || []"
            :totalMuestras="datosCalculadosPorGrafico[grafico.id]?.totalMuestras || 0"
            subtituloCentro="Muestras"
          />

          <!-- CASO B: TIPO BARRAS HORIZONTALES -->
          <div
            v-else-if="grafico.tipoGrafico === 'barras'"
            class="space-y-3"
          >
            <div
              v-for="seg in datosCalculadosPorGrafico[grafico.id]?.segmentos || []"
              :key="seg.etiqueta"
              class="space-y-1"
            >
              <div class="flex items-center justify-between text-xs">
                <span class="font-medium text-slate-800 dark:text-slate-200 truncate">{{ seg.etiqueta }}</span>
                <span class="font-mono font-bold text-slate-900 dark:text-white">
                  {{ seg.valor }} ({{ seg.porcentaje }}%)
                </span>
              </div>
              <div class="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :style="{ width: `${seg.porcentaje}%`, backgroundColor: seg.color }"
                />
              </div>
            </div>
          </div>

          <!-- CASO C: TIPO GAUGE / MEDIDOR SEMAFÓRICO -->
          <div
            v-else-if="grafico.tipoGrafico === 'gauge'"
            class="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-2"
          >
            <div class="relative w-36 h-20 overflow-hidden flex items-end justify-center">
              <div class="w-36 h-36 rounded-full border-[14px] border-slate-200 dark:border-slate-800 border-b-transparent border-l-transparent transform -rotate-45" />
              <div
                class="absolute inset-0 flex flex-col items-center justify-end pb-1"
              >
                <span class="text-3xl font-black font-mono text-slate-900 dark:text-white">
                  {{ datosCalculadosPorGrafico[grafico.id]?.promedioGlobal || '0.0' }}
                </span>
                <span class="text-[10px] font-bold text-slate-400 uppercase">sobre 5.0</span>
              </div>
            </div>

            <div class="flex items-center gap-2 text-xs font-semibold">
              <span
                class="w-2.5 h-2.5 rounded-full"
                :class="(datosCalculadosPorGrafico[grafico.id]?.promedioGlobal || 0) >= 4 ? 'bg-emerald-500' : (datosCalculadosPorGrafico[grafico.id]?.promedioGlobal || 0) >= 3 ? 'bg-amber-400' : 'bg-rose-500'"
              />
              <span class="text-slate-700 dark:text-slate-300">
                Salud calculada: {{ datosCalculadosPorGrafico[grafico.id]?.porcentajeSalud || 0 }}%
              </span>
            </div>
          </div>

          <!-- CASO D: TARJETA DE MÉTRICA RESUMIDA -->
          <div
            v-else
            class="p-6 rounded-2xl bg-gradient-to-br from-sky-500/10 via-indigo-500/10 to-transparent border border-sky-500/20 text-center space-y-2"
          >
            <span class="text-4xl font-black font-mono text-sky-600 dark:text-sky-400">
              {{ datosCalculadosPorGrafico[grafico.id]?.porcentajeSalud || 0 }}%
            </span>
            <p class="text-xs font-medium text-slate-600 dark:text-slate-300">
              Índice global calculado sobre {{ datosCalculadosPorGrafico[grafico.id]?.totalMuestras || 0 }} participaciones
            </p>
          </div>
        </div>

        <!-- Conclusiones Automáticas de IA o Data -->
        <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <Info class="w-3.5 h-3.5 text-sky-500 shrink-0" />
          <span class="truncate">
            {{ datosCalculadosPorGrafico[grafico.id]?.conclusiones || 'Análisis operacional automático en tiempo real.' }}
          </span>
        </div>

      </div>
    </div>

    <!-- MODAL PARA CREAR Y ANCLAR NUEVO GRÁFICO -->
    <ModalCrearGraficoAnclado
      :abierto="modalCrearAbierto"
      :preguntasDisponibles="preguntasDisponibles"
      :idEncuestaActual="idEncuestaActual"
      @cerrar="modalCrearAbierto = false"
      @anclar="manejarNuevoAnclaje"
    />

  </div>
</template>
