<!--
  ============================================================================
  SUB-SECCIÓN DE ANTIGÜEDAD Y RETENCIÓN (GeneralSeccionAntiguedadRetencion.vue)
  ============================================================================
-->
<script setup lang="ts">
import { Clock, TrendingUp } from 'lucide-vue-next'

defineProps<{
  totalColaboradores: number
  permanenciaPromedio: string
  estadisticasAntiguedad: Array<{
    id: string
    etiqueta: string
    cantidad: number
    porcentaje: number
    riesgoRotacion: string
  }>
  tasaRetencion: number
  estadoRetencion: {
    estado: string
    colorHex: string
    badgeClass: string
    textClass: string
  }
}>()
</script>

<template>
  <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
    <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 flex-wrap gap-2">
      <div class="flex items-center gap-2.5">
        <div class="w-9 h-9 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
          <Clock class="w-5 h-5" />
        </div>
        <div>
          <h3 class="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>Proyección de Antigüedad, Retención</span>
            <span class="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-mono font-bold">
              Intel Talent
            </span>
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Total: {{ totalColaboradores }} colaboradores evaluados.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <span class="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1">
          <span> Permanencia Promedio:</span>
          <strong class="text-purple-600 dark:text-purple-400 font-mono text-xs ml-1">{{ permanenciaPromedio }}</strong>
        </span>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Tarjetas de Antigüedad por Tramo (8 cols) -->
      <div class="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          v-for="item in estadisticasAntiguedad"
          :key="item.id"
          class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 hover:border-indigo-500/40 transition-all"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-black text-slate-800 dark:text-slate-200">
              {{ item.etiqueta }}
            </span>
            <span
              :class="[
                'text-[10px] font-bold px-2 py-0.5 rounded-full',
                item.riesgoRotacion === 'Alto'
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                  : item.riesgoRotacion === 'Moderado'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
              ]"
            >
              Riesgo {{ item.riesgoRotacion }}
            </span>
          </div>

          <div class="flex items-baseline justify-between">
            <div class="flex items-baseline gap-1.5">
              <span class="text-3xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                {{ item.cantidad }}
              </span>
              <span class="text-xs font-bold text-slate-500">
                {{ item.cantidad === 1 ? 'colaborador' : 'colaboradores' }}
              </span>
            </div>
            <span class="text-xs font-bold text-slate-500 font-mono">
              {{ item.porcentaje }}% del total
            </span>
          </div>

          <div class="space-y-1">
            <div class="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                class="h-full bg-indigo-500 rounded-full transition-all"
                :style="{ width: `${item.porcentaje}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Gráfico Donut de Retención (4 cols) -->
      <div class="lg:col-span-4 p-5 rounded-2xl bg-gradient-to-br from-indigo-50/50 via-slate-50 to-white dark:from-indigo-950/20 dark:via-slate-950 dark:to-slate-900 border border-indigo-200/80 dark:border-indigo-900/40 flex flex-col justify-between space-y-4">
        <div class="space-y-1">
          <h4 class="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
            <TrendingUp class="w-4 h-4" />
            <span>Promedio de Efectividad de Retención</span>
          </h4>
        </div>

        <div class="flex flex-col items-center justify-center my-2 relative">
          <svg viewBox="0 0 160 160" class="w-36 h-36 drop-shadow-md">
            <circle cx="80" cy="80" r="62" fill="none" stroke="currentColor" class="text-slate-200 dark:text-slate-800" stroke-width="16" />
            <circle 
              cx="80" 
              cy="80" 
              r="62" 
              fill="none" 
              :stroke="estadoRetencion.colorHex" 
              stroke-width="16" 
              stroke-linecap="round"
              :stroke-dasharray="389.5"
              :stroke-dashoffset="389.5 * (1 - Math.min(tasaRetencion, 100) / 100)"
              class="transition-all duration-1000 ease-out"
              transform="rotate(-90 80 80)"
            />
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span class="text-2xl font-black font-mono text-slate-900 dark:text-white">{{ tasaRetencion }}%</span>
            <span :class="['text-[10px] font-black uppercase tracking-tight px-2 py-0.5 rounded-full mt-1 shadow-xs', estadoRetencion.badgeClass]">
              {{ estadoRetencion.estado }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
