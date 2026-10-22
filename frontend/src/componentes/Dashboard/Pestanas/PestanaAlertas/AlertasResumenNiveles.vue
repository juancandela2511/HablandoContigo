<!--
  ============================================================================
  TARJETAS DE RESUMEN POR NIVELES DE ALERTA (AlertasResumenNiveles.vue)
  ============================================================================
-->

<script setup lang="ts">
import { ShieldAlert, Flame, AlertTriangle, Sliders } from 'lucide-vue-next'
import type { NivelAlerta } from '@/Almacenes/useTiposAlertas'

defineProps<{
  metricas: { n1: number; n2: number; n3: number; n4: number; total: number }
  filtroNivel: 'todos' | NivelAlerta
}>()

const emit = defineEmits<{
  (e: 'update:filtroNivel', nivel: 'todos' | NivelAlerta): void
}>()

const toggleNivel = (n: NivelAlerta, actual: 'todos' | NivelAlerta) => {
  emit('update:filtroNivel', actual === n ? 'todos' : n)
}
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
    <!-- Nivel 1: Crítico / Inmediato -->
    <div 
      @click="toggleNivel(1, filtroNivel)"
      class="p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between shadow-sm"
      :class="filtroNivel === 1
        ? 'bg-red-100/80 dark:bg-red-950/70 border-red-500 ring-2 ring-red-400/50'
        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-red-400'"
    >
      <div class="space-y-0.5">
        <span class="text-[10px] font-extrabold uppercase tracking-wider text-red-600 dark:text-red-400 flex items-center gap-1">
          <ShieldAlert class="w-3 h-3" />
          <span>Nivel 1 · Crítico</span>
        </span>
        <p class="text-xs text-slate-500 dark:text-slate-400">Atención Inmediata</p>
      </div>
      <div class="text-2xl font-black text-red-600 dark:text-red-400 font-mono">
        {{ metricas.n1 }}
      </div>
    </div>

    <!-- Nivel 2: Alto / Riesgo Severo -->
    <div 
      @click="toggleNivel(2, filtroNivel)"
      class="p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between shadow-sm"
      :class="filtroNivel === 2
        ? 'bg-rose-100/80 dark:bg-rose-950/70 border-rose-500 ring-2 ring-rose-400/50'
        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-400'"
    >
      <div class="space-y-0.5">
        <span class="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1">
          <Flame class="w-3 h-3" />
          <span>Nivel 2 · Alto</span>
        </span>
        <p class="text-xs text-slate-500 dark:text-slate-400">Riesgo Significativo</p>
      </div>
      <div class="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
        {{ metricas.n2 }}
      </div>
    </div>

    <!-- Nivel 3: Moderado / Atención -->
    <div 
      @click="toggleNivel(3, filtroNivel)"
      class="p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between shadow-sm"
      :class="filtroNivel === 3
        ? 'bg-amber-100/80 dark:bg-amber-950/70 border-amber-500 ring-2 ring-amber-400/50'
        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-400'"
    >
      <div class="space-y-0.5">
        <span class="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
          <AlertTriangle class="w-3 h-3" />
          <span>Nivel 3 · Moderado</span>
        </span>
        <p class="text-xs text-slate-500 dark:text-slate-400">Foco de Acompañamiento</p>
      </div>
      <div class="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
        {{ metricas.n3 }}
      </div>
    </div>

    <!-- Nivel 4: Preventivo / Monitoreo -->
    <div 
      @click="toggleNivel(4, filtroNivel)"
      class="p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between shadow-sm"
      :class="filtroNivel === 4
        ? 'bg-sky-100/80 dark:bg-sky-950/70 border-sky-500 ring-2 ring-sky-400/50'
        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-sky-400'"
    >
      <div class="space-y-0.5">
        <span class="text-[10px] font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400 flex items-center gap-1">
          <Sliders class="w-3 h-3" />
          <span>Nivel 4 · Preventivo</span>
        </span>
        <p class="text-xs text-slate-500 dark:text-slate-400">Monitoreo Global</p>
      </div>
      <div class="text-2xl font-black text-sky-600 dark:text-sky-400 font-mono">
        {{ metricas.n4 }}
      </div>
    </div>
  </div>
</template>
