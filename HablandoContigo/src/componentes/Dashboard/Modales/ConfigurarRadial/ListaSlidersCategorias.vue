<!--
  ============================================================================
  LISTA DE SLIDERS Y CONFIGURADOR DE INCLINACIONES (ListaSlidersCategorias.vue)
  ============================================================================
  
  ¿QUÉ HACE?
  Permite al usuario crear, editar, asociar y eliminar inclinaciones/ejes del radar:
  - Distribuye las inclinaciones de forma 100% proporcional a las áreas creadas o bloques.
  - Permite distribución equitativa (360° / N) o ponderada por número de preguntas de cada bloque.
  - Permite anclar explícitamente cada esquina/eje del radar a un Bloque de Preguntas de la Encuesta.
  - Permite ajustar individualmente la orientación angular (0° a 360°) de cada eje.
-->

<script setup lang="ts">
import { Plus, Trash2, Compass, Tag, Sparkles, PieChart, Sliders, Anchor } from 'lucide-vue-next'
import type { DimensionRadial } from '@/Almacenes/useEstadisticas'

const props = defineProps<{
  dimensiones: DimensionRadial[]
  coloresSolidos: Array<{ nombre: string; hex: string }>
  categoriasSugeridas?: string[]
  estadisticasPorCategoria?: Record<string, { preguntas: number; respuestas: number }>
}>()

const emit = defineEmits<{
  (e: 'agregar', categoria?: string): void
  (e: 'eliminar', index: number): void
  (e: 'distribuirEquitativo'): void
  (e: 'distribuirPonderado'): void
}>()

// Calcula el arco angular entre este eje y el siguiente
const calcularSectorArco = (indice: number) => {
  const total = props.dimensiones.length
  if (total <= 1) return 360
  const actual = props.dimensiones[indice]?.inclinacion || 0
  const siguiente = props.dimensiones[(indice + 1) % total]?.inclinacion || 0
  let sector = (siguiente - actual + 360) % 360
  if (sector === 0) sector = Math.round(360 / total)
  return sector
}

const calcularPorcentajeArco = (indice: number) => {
  const sector = calcularSectorArco(indice)
  return Math.round((sector / 360) * 100)
}

const seleccionarBloqueParaEje = (dim: DimensionRadial, categoria: string) => {
  if (!categoria) return
  dim.eje = categoria
  dim.categoriaMapeada = categoria
}
</script>

<template>
  <div class="space-y-3">
    <!-- Sugerencias de Inclinaciones basadas en Bloques/Áreas de Encuestas -->
    <div v-if="categoriasSugeridas && categoriasSugeridas.length > 0" class="p-3.5 rounded-2xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-800/60 space-y-2 text-left shadow-xs">
      <div class="flex items-center gap-1.5 text-xs font-bold text-sky-900 dark:text-sky-300">
        <Sparkles class="w-4 h-4 text-sky-500" />
        <span>Bloques de Encuestas recomendados para anclar a las esquinas del radar:</span>
      </div>
      <div class="flex flex-wrap gap-1.5 pt-0.5">
        <button
          v-for="cat in categoriasSugeridas"
          :key="cat"
          type="button"
          @click="emit('agregar', cat)"
          class="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 hover:bg-sky-100 dark:hover:bg-slate-800 border border-sky-200 dark:border-slate-700 text-sky-700 dark:text-sky-300 text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
          :title="`Anclar '${cat}' a una nueva esquina del radar`"
        >
          <Anchor class="w-3 h-3 text-sky-500" />
          <span class="font-bold">{{ cat }}</span>
          <span 
            v-if="estadisticasPorCategoria?.[cat]?.preguntas" 
            class="text-[10px] px-1.5 py-0.2 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 font-mono font-bold"
          >
            {{ estadisticasPorCategoria[cat].preguntas }} pregs
          </span>
        </button>
      </div>
    </div>

    <!-- Barra de Distribución Proporcional Automática -->
    <div class="p-3.5 rounded-2xl bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-amber-500/10 border border-sky-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-left shadow-xs">
      <div>
        <div class="flex items-center gap-1.5">
          <Compass class="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <span class="font-bold text-slate-800 dark:text-slate-200">
            Inclinaciones & Bloques en las Esquinas (360°):
          </span>
        </div>
        <p class="text-[11px] text-slate-500 dark:text-slate-400">
          Calcula la orientación angular (0° a 360°) de cada esquina de la gráfica radar.
        </p>
      </div>

      <div class="flex items-center gap-2 shrink-0 flex-wrap">
        <button
          type="button"
          @click="emit('distribuirEquitativo')"
          class="px-2.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          :title="`Divide los 360° en partes exactamente simétricas (${Math.round(360 / Math.max(dimensiones.length, 1))}° cada uno)`"
        >
          <PieChart class="w-3.5 h-3.5" />
          <span>⚡ Equitativa (360° / {{ dimensiones.length }})</span>
        </button>

        <button
          type="button"
          @click="emit('distribuirPonderado')"
          class="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          title="Asigna a cada esquina un ángulo proporcional al volumen de preguntas del bloque"
        >
          <Sliders class="w-3.5 h-3.5" />
          <span>📊 Ponderada por Bloques</span>
        </button>
      </div>
    </div>

    <!-- Barra de Control de Dimensiones Activas -->
    <div class="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 px-1">
      <span class="flex items-center gap-1.5">
        <span>Inclinaciones Activas ({{ dimensiones.length }} Esquinas)</span>
        <span class="text-[10px] px-2 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
          360° Radar
        </span>
      </span>
      <button
        type="button"
        @click="emit('agregar')"
        class="text-sky-600 dark:text-sky-400 font-bold hover:underline flex items-center gap-1 cursor-pointer bg-sky-50 dark:bg-sky-950/60 px-2.5 py-1 rounded-lg border border-sky-200 dark:border-sky-800 text-xs"
      >
        <Plus class="w-3.5 h-3.5" />
        <span>Crear Nueva Esquina / Eje</span>
      </button>
    </div>

    <!-- Lista de Ejes / Esquinas e Inclinaciones -->
    <div
      v-for="(dim, idx) in dimensiones"
      :key="idx"
      class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5 text-xs text-left transition-all hover:border-sky-300 dark:hover:border-sky-800"
    >
      <!-- Cabecera de la Dimensión y Anclaje -->
      <div class="flex items-center gap-2 justify-between flex-wrap">
        <div class="flex items-center gap-2 flex-1 min-w-[220px]">
          <span class="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs" :style="{ backgroundColor: dim.color }"></span>
          <input
            v-model="dim.eje"
            type="text"
            class="font-bold text-slate-900 dark:text-white bg-transparent border-b border-dashed border-slate-300 dark:border-slate-700 focus:border-sky-500 focus:outline-none flex-1 pb-0.5 text-xs truncate"
            placeholder="Nombre de la esquina / bloque de inclinación"
          />
        </div>

        <!-- Selector de Anclaje de Bloque -->
        <div v-if="categoriasSugeridas && categoriasSugeridas.length > 0" class="flex items-center gap-1 text-[11px]">
          <Anchor class="w-3 h-3 text-sky-500 shrink-0" />
          <span class="text-slate-400">Anclar Bloque:</span>
          <select
            :value="dim.categoriaMapeada || dim.eje"
            @change="seleccionarBloqueParaEje(dim, ($event.target as HTMLSelectElement).value)"
            class="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-medium focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option :value="dim.eje">Personalizado ({{ dim.eje }})</option>
            <option v-for="cat in categoriasSugeridas" :key="cat" :value="cat">
              {{ cat }}
            </option>
          </select>
        </div>

        <!-- Indicador de Valor Proporcional Real -->
        <div class="flex items-center gap-2 shrink-0">
          <span 
            class="px-2.5 py-0.5 rounded-md text-[10px] font-bold font-mono border"
            :class="dim.totalRespuestas && dim.totalRespuestas > 0 ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 'bg-slate-100 dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800'"
          >
            {{ dim.valor }}% ({{ dim.totalRespuestas || 0 }} resp.)
          </span>

          <button
            type="button"
            @click="emit('eliminar', idx)"
            class="text-slate-400 hover:text-rose-500 p-1 rounded-lg cursor-pointer transition-colors"
            title="Eliminar esta esquina/inclinación"
          >
            <Trash2 class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <!-- Inclinación Angular Individual (0° a 360°) y Meta -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <!-- Inclinación / Orientación Angular del Eje -->
        <div class="space-y-1">
          <div class="flex items-center justify-between text-[11px] text-slate-500">
            <span class="flex items-center gap-1">
              <Compass class="w-3 h-3 text-sky-500" />
              <span>Inclinación Angular (360°):</span>
            </span>
            <div class="flex items-center gap-1.5">
              <span class="text-[10px] px-1.5 py-0.2 rounded bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 font-mono font-bold">
                {{ calcularSectorArco(idx) }}° sector ({{ calcularPorcentajeArco(idx) }}%)
              </span>
              <span class="font-bold text-sky-600 dark:text-sky-400 font-mono">
                {{ dim.inclinacion || 0 }}°
              </span>
            </div>
          </div>
          <input
            v-model.number="dim.inclinacion"
            type="range"
            min="0"
            max="360"
            step="1"
            class="w-full accent-sky-500"
            title="Ajusta la orientación angular de esta esquina (0° a 360°)"
          />
        </div>

        <!-- Meta Objetivo -->
        <div class="space-y-1">
          <div class="flex items-center justify-between text-[11px] text-slate-500">
            <span>Meta de Cumplimiento:</span>
            <span class="font-bold text-slate-700 dark:text-slate-300 font-mono">{{ dim.meta }}%</span>
          </div>
          <input
            v-model.number="dim.meta"
            type="range"
            min="50"
            max="100"
            class="w-full accent-slate-500"
          />
        </div>
      </div>

      <!-- Selector de Color Sólido y Categoría Mapeada -->
      <div class="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-900">
        <div class="flex items-center gap-1.5">
          <span class="text-[10px] text-slate-400">Color Eje:</span>
          <div class="flex items-center gap-1">
            <button
              v-for="col in coloresSolidos"
              :key="col.hex"
              type="button"
              @click="dim.color = col.hex"
              :class="[
                'w-3.5 h-3.5 rounded-full transition-transform cursor-pointer',
                dim.color === col.hex ? 'ring-2 ring-sky-500 scale-125' : 'opacity-80 hover:opacity-100'
              ]"
              :style="{ backgroundColor: col.hex }"
              :title="col.nombre"
            ></button>
          </div>
        </div>

        <div class="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
          <Tag class="w-3 h-3" />
          <span>Vínculo Bloque: {{ dim.categoriaMapeada || dim.eje }}</span>
          <span 
            v-if="estadisticasPorCategoria?.[dim.categoriaMapeada || dim.eje]?.preguntas"
            class="text-slate-500 font-semibold"
          >
            ({{ estadisticasPorCategoria?.[dim.categoriaMapeada || dim.eje]?.preguntas }} preguntas asociadas)
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
