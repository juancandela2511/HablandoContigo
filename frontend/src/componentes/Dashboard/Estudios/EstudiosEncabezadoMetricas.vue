<!--
  ============================================================================
  COMPONENTE ENCABEZADO DE MÉTRICAS DE ESTUDIOS (EstudiosEncabezadoMetricas.vue)
  ============================================================================
  Cabecera directa y limpia para la gráfica de Estudios y Talento.
-->

<script setup lang="ts">
import { GraduationCap, Users, Sparkles, Settings } from 'lucide-vue-next'

defineProps<{
  totalPersonas: number
  totalHabilidadesUnicas: number
  cargandoInyeccion?: boolean
  tituloModulo?: string
  subtituloModulo?: string
}>()

const emit = defineEmits<{
  (e: 'abrirConfiguracion'): void
  (e: 'inyectarDatos'): void
}>()
</script>

<template>
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs font-['Poppins',sans-serif] text-left">
    <div class="flex items-center gap-2.5">
      <div class="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold shrink-0">
        <GraduationCap class="w-4 h-4" />
      </div>
      <h2 class="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
        {{  'Estadística de Estudios & Talento' }}
      </h2>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <button
        type="button"
        @click="emit('abrirConfiguracion')"
        class="px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 text-xs font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1.5 transition-all cursor-pointer"
      >
        <Settings class="w-3.5 h-3.5 text-sky-500" />
       
      </button>

      <div class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
        <Users class="w-3.5 h-3.5 text-sky-500" />
        <span>{{ totalPersonas }} Evaluados</span>
      </div>

      <div class="px-3 py-1.5 rounded-xl bg-purple-500/10 text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
        
        <span>{{ totalHabilidadesUnicas }} Áreas</span>
      </div>
    </div>
  </div>
</template>
