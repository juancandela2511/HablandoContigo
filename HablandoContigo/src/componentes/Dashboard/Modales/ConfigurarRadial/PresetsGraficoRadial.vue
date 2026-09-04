<!--
  ============================================================================
  PRESETS RÁPIDOS DEL GRÁFICO RADIAL (PresetsGraficoRadial.vue)
  ============================================================================
-->

<script setup lang="ts">
import { Sparkles, Building2 } from 'lucide-vue-next'

defineEmits<{
  (e: 'presetEmpatia'): void
  (e: 'presetEstandar'): void
}>()
</script>

<template>
  <div class="flex flex-wrap items-center gap-2 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
    <span class="text-[11px] font-semibold text-slate-500">Plantillas rápidas:</span>

    <button
      type="button"
      @click="$emit('presetEmpatia')"
      class="px-2.5 py-1 rounded-lg bg-sky-600 text-white font-semibold text-[11px] hover:bg-sky-700 transition-all cursor-pointer shadow-sm flex items-center gap-1"
    >
      <Sparkles class="w-3 h-3" />
      <span>Solo Empatía, Afecto y Socialización</span>
    </button>

    <button
      type="button"
      @click="$emit('presetEstandar')"
      class="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px] hover:bg-slate-300 transition-all cursor-pointer flex items-center gap-1"
    >
      <Building2 class="w-3 h-3" />
      <span>Estándar 6 Ejes</span>
    </button>
  </div>
</template>
