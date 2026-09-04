<!--
  ============================================================================
  LISTA DE SLIDERS Y CONFIGURADOR DE INCLINACIONES (ListaSlidersCategorias.vue)
  ============================================================================
  
  ¿QUÉ HACE?
  Permite al usuario crear, editar, asociar y eliminar inclinaciones/ejes del radar:
  - Muestra el valor proporcional 100% real calculado de las respuestas recibidas.
  - Permite ajustar la inclinación angular individual de cada eje (-45° a +45°).
  - Permite asociar o crear inclinaciones desde las categorías detectadas en las encuestas.
-->

<script setup lang="ts">
import { Plus, Trash2, Compass, Tag, Sparkles } from 'lucide-vue-next'
import type { DimensionRadial } from '@/Almacenes/useEstadisticas'

defineProps<{
  dimensiones: DimensionRadial[]
  coloresSolidos: Array<{ nombre: string; hex: string }>
  categoriasSugeridas?: string[]
}>()

const emit = defineEmits<{
  (e: 'agregar', categoria?: string): void
  (e: 'eliminar', index: number): void
}>()
</script>

<template>
  <div class="space-y-3">
    <!-- Sugerencias de Inclinaciones basadas en Categorías de Encuestas -->
    <div v-if="categoriasSugeridas && categoriasSugeridas.length > 0" class="p-3 rounded-2xl bg-sky-50/50 dark:bg-sky-950/30 border border-sky-200/60 dark:border-sky-800/60 space-y-1.5 text-left">
      <div class="flex items-center gap-1.5 text-[11px] font-bold text-sky-800 dark:text-sky-300">
        <Sparkles class="w-3.5 h-3.5 text-sky-500" />
        <span>Categorías detectadas en tus encuestas (clic para crear eje):</span>
      </div>
      <div class="flex flex-wrap gap-1.5 pt-0.5">
        <button
          v-for="cat in categoriasSugeridas"
          :key="cat"
          type="button"
          @click="emit('agregar', cat)"
          class="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-sky-100 dark:hover:bg-slate-800 border border-sky-200 dark:border-slate-700 text-sky-700 dark:text-sky-300 text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
          :title="`Crear inclinación vinculada a '${cat}'`"
        >
          <Plus class="w-2.5 h-2.5" />
          <span>{{ cat }}</span>
        </button>
      </div>
    </div>

    <!-- Barra de Control de Dimensiones Activas -->
    <div class="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 px-1">
      <span class="flex items-center gap-1.5">
        <span>Inclinaciones Activas ({{ dimensiones.length }} Ejes)</span>
        <span class="text-[10px] px-2 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
          Proporcional a datos reales
        </span>
      </span>
      <button
        type="button"
        @click="emit('agregar')"
        class="text-sky-600 dark:text-sky-400 font-bold hover:underline flex items-center gap-1 cursor-pointer bg-sky-50 dark:bg-sky-950/60 px-2.5 py-1 rounded-lg border border-sky-200 dark:border-sky-800"
      >
        <Plus class="w-3.5 h-3.5" />
        <span>Crear Inclinación Libre</span>
      </button>
    </div>

    <!-- Lista de Ejes / Inclinaciones -->
    <div
      v-for="(dim, idx) in dimensiones"
      :key="idx"
      class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 text-xs text-left"
    >
      <!-- Cabecera de la Dimensión -->
      <div class="flex items-center gap-2 justify-between">
        <div class="flex items-center gap-2 flex-1">
          <span class="w-3 h-3 rounded-full shrink-0 shadow-xs" :style="{ backgroundColor: dim.color }"></span>
          <input
            v-model="dim.eje"
            type="text"
            class="font-bold text-slate-900 dark:text-white bg-transparent border-b border-dashed border-slate-300 dark:border-slate-700 focus:border-sky-500 focus:outline-none flex-1 pb-0.5 text-xs"
            placeholder="Nombre de la dimensión / inclinación"
          />
        </div>

        <!-- Indicador de Valor Proporcional Real -->
        <div class="flex items-center gap-2 shrink-0">
          <span 
            class="px-2 py-0.5 rounded-md text-[10px] font-bold font-mono border"
            :class="dim.totalRespuestas && dim.totalRespuestas > 0 ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 'bg-slate-100 dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800'"
          >
            {{ dim.valor }}% ({{ dim.totalRespuestas || 0 }} resp.)
          </span>

          <button
            type="button"
            @click="emit('eliminar', idx)"
            class="text-slate-400 hover:text-rose-500 p-1 rounded-lg cursor-pointer transition-colors"
            title="Eliminar esta inclinación"
          >
            <Trash2 class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <!-- Inclinación Angular Individual y Meta -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <!-- Inclinación / Desvío Angular del Eje -->
        <div class="space-y-1">
          <div class="flex items-center justify-between text-[11px] text-slate-500">
            <span class="flex items-center gap-1">
              <Compass class="w-3 h-3 text-sky-500" />
              <span>Inclinación del Eje:</span>
            </span>
            <span class="font-bold text-sky-600 dark:text-sky-400 font-mono">
              {{ (dim.inclinacion || 0) > 0 ? '+' : '' }}{{ dim.inclinacion || 0 }}°
            </span>
          </div>
          <input
            v-model.number="dim.inclinacion"
            type="range"
            min="-45"
            max="45"
            step="5"
            class="w-full accent-sky-500"
            title="Ajusta la inclinación u orientación angular de este eje específico"
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
          <span class="text-[10px] text-slate-400">Color:</span>
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

        <div class="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
          <Tag class="w-3 h-3" />
          <span>Vínculo: {{ dim.categoriaMapeada || dim.eje }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
