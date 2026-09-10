<!--
  ============================================================================
  MODAL PARA ANCLAR NUEVO GRÁFICO AL DASHBOARD (ModalCrearGraficoAnclado.vue)
  ============================================================================
-->

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  X,
  PlusCircle,
  PieChart,
  BarChart3,
  Gauge,
  Sparkles,
  HelpCircle,
  BrainCircuit,
  Sliders,
  CheckCircle2,
  Layers
} from 'lucide-vue-next'
import type { PreguntaEncuesta } from '@/Servicios/iaEncuestasService'
import type { TipoAnalisis, TipoGrafico, GraficoAnclado } from '@/Almacenes/useGraficosAnclados'
import BotonBase from '@/componentes/ElementosBase/BotonBase.vue'

const props = defineProps<{
  abierto: boolean
  preguntasDisponibles: PreguntaEncuesta[]
  idEncuestaActual?: string
  preguntaInicialId?: string
}>()

const emit = defineEmits<{
  (e: 'cerrar'): void
  (e: 'anclar', grafico: Omit<GraficoAnclado, 'id' | 'fechaCreacion'>): void
}>()

const idPreguntaSeleccionada = ref('')
const tipoAnalisis = ref<TipoAnalisis>('sentimiento_ia')
const tipoGrafico = ref<TipoGrafico>('dona')
const tituloPersonalizado = ref('')
const descripcionPersonalizada = ref('')

const preguntaSeleccionadaObj = computed(() => {
  return props.preguntasDisponibles.find(p => p.id === idPreguntaSeleccionada.value) || null
})

// Auto-seleccionar la pregunta al abrir
watch(
  () => props.abierto,
  (val) => {
    if (val) {
      if (props.preguntaInicialId && props.preguntasDisponibles.some(p => p.id === props.preguntaInicialId)) {
        idPreguntaSeleccionada.value = props.preguntaInicialId
      } else if (!idPreguntaSeleccionada.value && props.preguntasDisponibles.length > 0) {
        idPreguntaSeleccionada.value = props.preguntasDisponibles[0]?.id || ''
      }
      actualizarTituloPorDefecto()
    }
  }
)

// Ajustar título y sugerencia de análisis cuando cambia la pregunta
watch(idPreguntaSeleccionada, () => {
  actualizarTituloPorDefecto()
  if (preguntaSeleccionadaObj.value?.tipo === 'texto') {
    tipoAnalisis.value = 'sentimiento_ia'
    tipoGrafico.value = 'dona'
  } else if (preguntaSeleccionadaObj.value?.tipo === 'escala') {
    tipoAnalisis.value = 'promedio_satisfaccion'
    tipoGrafico.value = 'gauge'
  } else {
    tipoAnalisis.value = 'distribucion_opciones'
    tipoGrafico.value = 'barras'
  }
})

const actualizarTituloPorDefecto = () => {
  if (preguntaSeleccionadaObj.value) {
    const textoBase = preguntaSeleccionadaObj.value.texto || ''
    const primeraParte = textoBase.replace(/^(Pregunta \d+ — |¿|\?)/g, '').split('?')[0] || ''
    const textoCorto = primeraParte.trim()
    tituloPersonalizado.value = `Análisis: ${textoCorto.substring(0, 50)}`
  }
}

const opcionesTipoAnalisis: Array<{ id: TipoAnalisis; titulo: string; desc: string; icono: any; recomendadoPara: string }> = [
  {
    id: 'sentimiento_ia',
    titulo: 'Clasificación Sentimiento IA',
    desc: 'La IA encasilla cada respuesta en Favorable (Buena), Riesgo (Mala) o Neutra.',
    icono: Sparkles,
    recomendadoPara: 'Preguntas abiertas y cualitativas'
  },
  {
    id: 'distribucion_opciones',
    titulo: 'Distribución de Respuestas',
    desc: 'Frecuencia absoluta y porcentaje registrado para cada alternativa.',
    icono: BarChart3,
    recomendadoPara: 'Selección múltiple y Sí/No'
  },
  {
    id: 'promedio_satisfaccion',
    titulo: 'Promedio de Satisfacción',
    desc: 'Calcula la media matemática sobre 5.0 y porcentaje de salud laboral.',
    icono: Gauge,
    recomendadoPara: 'Escalas de satisfacción 1 a 5'
  },
  {
    id: 'alertas',
    titulo: 'Tasa de Alertas y Riesgo',
    desc: 'Mide la proporción de respuestas que activaron protocolos de alerta.',
    icono: Layers,
    recomendadoPara: 'Preguntas sensibles y clima'
  }
]

const opcionesTipoGrafico: Array<{ id: TipoGrafico; titulo: string; icono: any }> = [
  { id: 'dona', titulo: 'Dona / Circular SVG', icono: PieChart },
  { id: 'barras', titulo: 'Barras Horizontales', icono: BarChart3 },
  { id: 'gauge', titulo: 'Medidor Semafórico (Gauge)', icono: Gauge },
  { id: 'metrica', titulo: 'Tarjeta de Métrica', icono: Sliders }
]

const manejarAnclar = () => {
  if (!preguntaSeleccionadaObj.value) return

  emit('anclar', {
    idEncuesta: props.idEncuestaActual,
    titulo: tituloPersonalizado.value.trim() || 'Nuevo Gráfico Anclado',
    idPregunta: preguntaSeleccionadaObj.value.id,
    textoPregunta: preguntaSeleccionadaObj.value.texto,
    tipoAnalisis: tipoAnalisis.value,
    tipoGrafico: tipoGrafico.value,
    descripcion: descripcionPersonalizada.value.trim() || undefined,
    colorTema: tipoAnalisis.value === 'sentimiento_ia' ? '#0284c7' : '#10b981'
  })
  emit('cerrar')
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="abierto"
        class="fixed inset-0 z-[99999] flex items-center justify-center p-4 font-['Poppins',sans-serif]"
      >
        <!-- Overlay -->
        <div class="absolute inset-0 bg-slate-950/75 backdrop-blur-sm" @click="emit('cerrar')" />

        <!-- Modal Box -->
        <div class="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
          
          <!-- Encabezado -->
          <div class="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-gradient-to-r from-sky-600 to-indigo-600 rounded-t-3xl text-white">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <BarChart3 class="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 class="text-base font-extrabold leading-tight">Crear Estadística de Pregunta</h3>
                <p class="text-xs text-sky-100">Elige la pregunta, el tipo de análisis (Sentimiento IA, Frecuencias, Promedios) y el gráfico para tu Dashboard</p>
              </div>
            </div>

            <button
              @click="emit('cerrar')"
              class="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 transition-colors cursor-pointer"
            >
              <X class="w-4 h-4 text-white" />
            </button>
          </div>

          <!-- Formulario -->
          <div class="px-6 pb-6 space-y-5 text-left">
            
            <!-- PASO 1: SELECCIONAR PREGUNTA -->
            <div class="space-y-2">
              <label class="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <HelpCircle class="w-3.5 h-3.5 text-sky-500" />
                <span>1. Seleccionar Pregunta a Analizar</span>
              </label>

              <select
                v-model="idPreguntaSeleccionada"
                class="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                <option v-for="preg in preguntasDisponibles" :key="preg.id" :value="preg.id">
                  [{{ preg.tipo.toUpperCase() }}] {{ preg.texto }}
                </option>
              </select>

              <p v-if="preguntaSeleccionadaObj?.tipo === 'texto'" class="text-[11px] text-sky-600 dark:text-sky-400 flex items-center gap-1">
                <BrainCircuit class="w-3.5 h-3.5" />
                <span>Esta es una pregunta abierta de texto libre: La IA la encasillará automáticamente en respuestas buenas o malas.</span>
              </p>
            </div>

            <!-- PASO 2: TIPO DE ANÁLISIS -->
            <div class="space-y-2">
              <label class="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <BrainCircuit class="w-3.5 h-3.5 text-sky-500" />
                <span>2. Tipo de Análisis</span>
              </label>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  v-for="opc in opcionesTipoAnalisis"
                  :key="opc.id"
                  type="button"
                  @click="tipoAnalisis = opc.id"
                  :class="[
                    'p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5',
                    tipoAnalisis === opc.id
                      ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-500 ring-2 ring-sky-500/20 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  ]"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <component :is="opc.icono" class="w-4 h-4 text-sky-600 dark:text-sky-400" />
                      <span class="text-xs font-bold text-slate-900 dark:text-white">{{ opc.titulo }}</span>
                    </div>
                    <CheckCircle2 v-if="tipoAnalisis === opc.id" class="w-4 h-4 text-sky-500" />
                  </div>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                    {{ opc.desc }}
                  </p>
                </button>
              </div>
            </div>

            <!-- PASO 3: TIPO DE GRÁFICO -->
            <div class="space-y-2">
              <label class="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <PieChart class="w-3.5 h-3.5 text-sky-500" />
                <span>3. Tipo de Gráfico Visual</span>
              </label>

              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  v-for="g in opcionesTipoGrafico"
                  :key="g.id"
                  type="button"
                  @click="tipoGrafico = g.id"
                  :class="[
                    'p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2',
                    tipoGrafico === g.id
                      ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-500 ring-2 ring-sky-500/20 text-sky-600 dark:text-sky-400 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  ]"
                >
                  <component :is="g.icono" class="w-5 h-5" />
                  <span class="text-[11px] font-bold">{{ g.titulo }}</span>
                </button>
              </div>
            </div>

            <!-- PASO 4: PERSONALIZACIÓN DEL TÍTULO -->
            <div class="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <label class="text-xs font-bold text-slate-700 dark:text-slate-300">
                Título del Widget en el Dashboard
              </label>
              <input
                v-model="tituloPersonalizado"
                type="text"
                class="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                placeholder="Ej: Análisis IA: Sugerencias Libres"
              />
            </div>

            <!-- BOTONES DE ACCIÓN -->
            <div class="flex items-center justify-end gap-3 pt-3">
              <BotonBase variante="esquema" tamano="mediano" @click="emit('cerrar')">
                <span>Cancelar</span>
              </BotonBase>

              <BotonBase variante="primario" tamano="mediano" @click="manejarAnclar">
                <template #iconoIzquierdo>
                  <BarChart3 class="w-4 h-4" />
                </template>
                <span>Crear Estadística de Pregunta</span>
              </BotonBase>
            </div>

          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>
