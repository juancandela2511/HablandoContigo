<!--
  ============================================================================
  COMPONENTE DESGLOSE DETALLADO POR PREGUNTA Y SENTIMIENTO (DesglosePreguntasDetallado.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Analiza reactivamente pregunta por pregunta la distribución de respuestas en barras apiladas
  (% Favorable [4-5], % Neutral [3], % Riesgo [1-2]), junto con la desviación estándar ($\sigma$),
  el índice de polarización/consenso y citas cualitativas confidenciales.
  
  ¿PARA QUÉ SIRVE?
  - Identificar preguntas con alta polarización de opiniones dentro del equipo.
  - Ofrecer evidencia cualitativa directa para las intervenciones de Recursos Humanos.
  
  ¿CON QUÉ ESTÁ VINCULADO / CONECTADO?
  - DashboardView.vue: Pestaña 3 "Desglose por Pregunta & Sentimiento".
  - useEstadisticas.ts: Provee `desgloseRespuestasDetalladas`.
-->

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { DesgloseRespuestaDetallada } from '@/Almacenes/useEstadisticas'
import { HelpCircle, ShieldAlert, MessageSquareQuote, ChevronDown, ChevronUp } from 'lucide-vue-next'

const props = defineProps<{
  preguntas: DesgloseRespuestaDetallada[]
}>()

/** Filtro por categoría */
const categoriaFiltro = ref<string>('Todas')

/** Preguntas expandidas para ver comentarios */
const preguntasExpandidas = ref<Record<string, boolean>>({})

const categoriasUnicas = computed(() => {
  const setCat = new Set(props.preguntas.map(p => p.categoria))
  return ['Todas', ...Array.from(setCat)]
})

const preguntasFiltradas = computed(() => {
  if (categoriaFiltro.value === 'Todas') return props.preguntas
  return props.preguntas.filter(p => p.categoria === categoriaFiltro.value)
})

const toggleExpansion = (id: string) => {
  preguntasExpandidas.value[id] = !preguntasExpandidas.value[id]
}
</script>

<template>
  <div class="space-y-5">
    
    <!-- Barra Superior de Filtrado por Categoría -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
      <div>
        <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <HelpCircle class="w-4 h-4 text-sky-500" />
          <span>Distribución de Sentimiento y Consenso por Ítem</span>
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Barras apiladas de favorabilidad (% Favorable, % Neutral, % Desfavorable) con testimonios anónimos.
        </p>
      </div>

      <!-- Selector de Categorías -->
      <select
        v-model="categoriaFiltro"
        class="bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-sky-500"
      >
        <option v-for="cat in categoriasUnicas" :key="cat" :value="cat">
          {{ cat }}
        </option>
      </select>
    </div>

    <!-- Lista de Preguntas con Barras Apiladas -->
    <div class="space-y-3.5">
      <div
        v-for="item in preguntasFiltradas"
        :key="item.idPregunta"
        class="p-4 sm:p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3"
      >
        <!-- Encabezado del Ítem -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-sky-400 border border-blue-200 dark:border-blue-800">
              {{ item.categoria }}
            </span>
            <span
              v-if="item.esSensibleAlerta"
              class="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-800 flex items-center gap-1"
            >
              <ShieldAlert class="w-3 h-3" />
              Sensible a Acoso
            </span>
          </div>

          <div class="flex items-center gap-3 text-xs font-mono">
            <span class="text-slate-500">Consenso: 
              <strong :class="item.indiceConsenso === 'Alto' ? 'text-emerald-500' : item.indiceConsenso === 'Polarizado' ? 'text-red-500' : 'text-amber-500'">
                {{ item.indiceConsenso }} (σ: {{ item.desviacionEstandar }})
              </strong>
            </span>
            <span class="font-bold text-slate-900 dark:text-white text-sm">
              ★ {{ item.promedio }} / 5.0
            </span>
          </div>
        </div>

        <!-- Enunciado de la Pregunta -->
        <p class="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 text-left">
          {{ item.pregunta }}
        </p>

        <!-- Barra Apilada de 3 Segmentos -->
        <div class="space-y-1.5">
          <div class="w-full h-3.5 rounded-full overflow-hidden flex bg-slate-200 dark:bg-slate-800 shadow-inner">
            <!-- Positivo (Verde) -->
            <div
              :style="{ width: `${item.distribucion.positivas}%` }"
              class="h-full bg-emerald-500 hover:bg-emerald-400 transition-all"
              :title="`Favorable: ${item.distribucion.positivas}%`"
            ></div>
            <!-- Neutral (Amarillo) -->
            <div
              :style="{ width: `${item.distribucion.neutrales}%` }"
              class="h-full bg-amber-400 hover:bg-amber-300 transition-all"
              :title="`Neutral: ${item.distribucion.neutrales}%`"
            ></div>
            <!-- Negativo (Rojo) -->
            <div
              :style="{ width: `${item.distribucion.negativas}%` }"
              class="h-full bg-red-500 hover:bg-red-400 transition-all"
              :title="`Alerta/Riesgo: ${item.distribucion.negativas}%`"
            ></div>
          </div>

          <!-- Etiquetas de Porcentajes -->
          <div class="flex items-center justify-between text-[11px] font-mono font-medium">
            <span class="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              Favorable (4-5): {{ item.distribucion.positivas }}%
            </span>
            <span class="text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-amber-400"></span>
              Neutral (3): {{ item.distribucion.neutrales }}%
            </span>
            <span class="text-red-600 dark:text-red-400 flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-red-500"></span>
              Alerta (1-2): {{ item.distribucion.negativas }}%
            </span>
          </div>
        </div>

        <!-- Botón para expandir testimonios cualitativos -->
        <div v-if="item.comentariosDestacados && item.comentariosDestacados.length > 0" class="pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
          <button
            @click="toggleExpansion(item.idPregunta)"
            class="text-[11px] text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
          >
            <MessageSquareQuote class="w-3.5 h-3.5" />
            <span>{{ preguntasExpandidas[item.idPregunta] ? 'Ocultar comentarios anónimos' : `Ver ${item.comentariosDestacados.length} comentarios anónimos destacados` }}</span>
            <ChevronUp v-if="preguntasExpandidas[item.idPregunta]" class="w-3 h-3" />
            <ChevronDown v-else class="w-3 h-3" />
          </button>

          <!-- Lista de Comentarios Expandida -->
          <div v-if="preguntasExpandidas[item.idPregunta]" class="mt-2.5 space-y-2 pl-3 border-l-2 border-sky-400 text-xs">
            <p
              v-for="(com, idx) in item.comentariosDestacados"
              :key="idx"
              class="text-slate-600 dark:text-slate-300 italic"
            >
              "{{ com }}"
            </p>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>
