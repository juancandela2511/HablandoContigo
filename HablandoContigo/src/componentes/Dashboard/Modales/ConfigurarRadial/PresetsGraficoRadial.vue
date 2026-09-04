<!--
  ============================================================================
  PRESETS RÁPIDOS DEL GRÁFICO RADIAL (PresetsGraficoRadial.vue)
  ============================================================================
-->

<script setup lang="ts">
import { Sparkles, Building2, Layers } from 'lucide-vue-next'

defineProps<{
  totalCategoriasDetectadas?: number
}>()

defineEmits<{
  (e: 'presetEmpatia'): void
  (e: 'presetEstandar'): void
  (e: 'presetCategorias'): void
}>()
</script>

<template>
  <div class="flex flex-wrap items-center gap-2 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
    <span class="text-[11px] font-semibold text-slate-500">Plantillas de ejes:</span>

    <button
      v-if="totalCategoriasDetectadas && totalCategoriasDetectadas > 0"
      type="button"
      @click="$emit('presetCategorias')"
      class="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-semibold text-[11px] hover:bg-emerald-700 transition-all cursor-pointer shadow-xs flex items-center gap-1"
      title="Crea los ejes exactamente con las categorías de tus encuestas activas"
    >
      <Layers class="w-3 h-3" />
      <span>Ejes de mis Encuestas ({{ totalCategoriasDetectadas }})</span>
    </button>

    <button
      type="button"
      @click="$emit('presetEstandar')"
      class="px-2.5 py-1 rounded-lg bg-sky-600 text-white font-semibold text-[11px] hover:bg-sky-700 transition-all cursor-pointer shadow-xs flex items-center gap-1"
    >
      <Building2 class="w-3 h-3" />
      <span>Estándar 6 Ejes</span>
    </button>

    <button
      type="button"
      @click="$emit('presetEmpatia')"
      class="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px] hover:bg-slate-300 dark:hover:bg-slate-700 transition-all cursor-pointer flex items-center gap-1"
    >
      <Sparkles class="w-3 h-3" />
      <span>Empatía, Afecto y Socialización</span>
    </button>
  </div>
</template>
