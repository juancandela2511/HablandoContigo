<!--
  ============================================================================
  SUBCOMPONENTE SELECCIÓN DE PREGUNTA Y MODO CÁLCULO (SeleccionPreguntaModoCalculo.vue)
  ============================================================================
  Paso 1 y 2 del modal para anclar gráficos: selección de pregunta elegible y modo de análisis.
-->

<script setup lang="ts">
import { HelpCircle, BrainCircuit, CheckCircle2, BarChart3, Gauge, Layers } from 'lucide-vue-next'
import type { PreguntaEncuesta } from '@/Servicios/iaEncuestasService'
import type { TipoAnalisis } from '@/Almacenes/useGraficosAnclados'

defineProps<{
  idPreguntaSeleccionada: string
  preguntasSoloOpciones: PreguntaEncuesta[]
  tipoAnalisis: TipoAnalisis
}>()

const emit = defineEmits<{
  (e: 'update:idPreguntaSeleccionada', val: string): void
  (e: 'update:tipoAnalisis', val: TipoAnalisis): void
}>()

const opcionesTipoAnalisis: Array<{ id: TipoAnalisis; titulo: string; desc: string; icono: any }> = [
  {
    id: 'distribucion_opciones',
    titulo: 'Distribución de Respuestas (Frecuencia)',
    desc: 'Conteo neto de votos y porcentajes por alternativa.',
    icono: BarChart3
  },
  {
    id: 'promedio_satisfaccion',
    titulo: 'Puntaje Neto y Satisfacción',
    desc: 'Calcula el promedio sobre 5.0 basado en los valores de cada opción.',
    icono: Gauge
  },
  {
    id: 'alertas',
    titulo: 'Tasa de Alertas Activadas',
    desc: 'Mide la proporción de alternativas de bajo puntaje / riesgo seleccionadas.',
    icono: Layers
  }
]
</script>

<template>
  <div class="space-y-5 font-['Poppins',sans-serif]">
    <!-- PASO 1: SELECCIONAR PREGUNTA -->
    <div class="space-y-2 text-left">
      <label class="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
        <HelpCircle class="w-3.5 h-3.5 text-sky-500" />
        <span>1. Seleccionar Pregunta (Opción Múltiple / Sí o No)</span>
      </label>

      <select
        :value="idPreguntaSeleccionada"
        @change="emit('update:idPreguntaSeleccionada', ($event.target as HTMLSelectElement).value)"
        class="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-sky-500 cursor-pointer font-medium"
      >
        <option v-for="preg in preguntasSoloOpciones" :key="preg.id" :value="preg.id">
          [{{ preg.tipo.toUpperCase() }}] {{ preg.categoria ? preg.categoria + ' — ' : '' }}{{ preg.texto }}
        </option>
      </select>
    </div>

    <!-- PASO 2: MODO DE CÁLCULO -->
    <div class="space-y-2 text-left">
      <label class="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
        <BrainCircuit class="w-3.5 h-3.5 text-sky-500" />
        <span>2. Modo de Cálculo Estadístico</span>
      </label>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <button
          v-for="opc in opcionesTipoAnalisis"
          :key="opc.id"
          type="button"
          @click="emit('update:tipoAnalisis', opc.id)"
          :class="[
            'p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5',
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
            <CheckCircle2 v-if="tipoAnalisis === opc.id" class="w-4 h-4 text-sky-500 shrink-0" />
          </div>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
            {{ opc.desc }}
          </p>
        </button>
      </div>
    </div>
  </div>
</template>
