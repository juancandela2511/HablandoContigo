<!--
  ============================================================================
  LISTA DE SLIDERS DE DIMENSIONES (ListaSlidersCategorias.vue)
  ============================================================================
-->

<script setup lang="ts">
import { Plus, Trash2 } from 'lucide-vue-next'
import type { DimensionRadial } from '@/Almacenes/useEstadisticas'

defineProps<{
  dimensiones: DimensionRadial[]
  coloresSolidos: Array<{ nombre: string; hex: string }>
}>()

const emit = defineEmits<{
  (e: 'agregar'): void
  (e: 'eliminar', index: number): void
}>()
</script>

<template>
  <div class="space-y-2.5">
    <div class="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 px-1">
      <span>Dimensiones Activas ({{ dimensiones.length }} Ejes)</span>
      <button
        type="button"
        @click="emit('agregar')"
        class="text-sky-600 dark:text-sky-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
      >
        <Plus class="w-3.5 h-3.5" />
        <span>Añadir Eje</span>
      </button>
    </div>

    <div
      v-for="(dim, idx) in dimensiones"
      :key="idx"
      class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5 text-xs text-left"
    >
      <div class="flex items-center gap-2 justify-between">
        <input
          v-model="dim.eje"
          type="text"
          class="font-bold text-slate-900 dark:text-white bg-transparent border-b border-dashed border-slate-300 dark:border-slate-700 focus:border-sky-500 focus:outline-none flex-1 pb-0.5 text-xs"
          placeholder="Nombre de la dimensión"
        />
        <button
          type="button"
          @click="emit('eliminar', idx)"
          class="text-slate-400 hover:text-rose-500 p-1 rounded-lg cursor-pointer transition-colors"
          title="Eliminar este eje"
        >
          <Trash2 class="w-3.5 h-3.5" />
        </button>
      </div>

      <!-- Puntaje / Inclinación y Meta -->
      <div class="grid grid-cols-2 gap-3 pt-1">
        <div class="space-y-1">
          <div class="flex items-center justify-between text-[11px] text-slate-500">
            <span>Puntaje Salud:</span>
            <span class="font-bold text-sky-600 dark:text-sky-400 font-mono">{{ dim.valor }}%</span>
          </div>
          <input
            v-model.number="dim.valor"
            type="range"
            min="0"
            max="100"
            class="w-full accent-sky-500"
          />
        </div>

        <div class="space-y-1">
          <div class="flex items-center justify-between text-[11px] text-slate-500">
            <span>Meta Objetivo:</span>
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

      <!-- Selector de Color Sólido -->
      <div class="flex items-center gap-2 pt-1">
        <span class="text-[10px] text-slate-400">Color:</span>
        <div class="flex items-center gap-1.5">
          <button
            v-for="col in coloresSolidos"
            :key="col.hex"
            type="button"
            @click="dim.color = col.hex"
            :class="[
              'w-4 h-4 rounded-full transition-transform cursor-pointer',
              dim.color === col.hex ? 'ring-2 ring-sky-500 scale-125' : 'opacity-80 hover:opacity-100'
            ]"
            :style="{ backgroundColor: col.hex }"
            :title="col.nombre"
          ></button>
        </div>
      </div>
    </div>
  </div>
</template>
