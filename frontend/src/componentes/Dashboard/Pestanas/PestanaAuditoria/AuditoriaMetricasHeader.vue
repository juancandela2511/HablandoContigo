<!--
  ============================================================================
  MÉTRICAS DE AUDITORÍA Y TRAZABILIDAD (AuditoriaMetricasHeader.vue)
  ============================================================================
-->

<script setup lang="ts">
import { ShieldCheck, ShieldAlert, ZapOff, Sliders } from 'lucide-vue-next'
import { BotonBase } from '@/componentes/ElementosBase'

defineProps<{
  totalRespuestas: number
  totalAlertas: number
}>()

defineEmits<{
  (e: 'abrirGestionAlertas'): void
}>()
</script>

<template>
  <div class="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4 text-left">
    <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div class="space-y-1">
        <div class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
          <ShieldCheck class="w-3.5 h-3.5" />
          <span>Auditoría Criptográfica por Hardware</span>
        </div>
        <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          Trazabilidad de Respuestas & Prevención de Fraude
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Supervisión de huellas digitales UUID, tiempo de respuesta y detección de anomalías.
        </p>
      </div>

      <BotonBase
        variante="secundario"
        tamano="pequeno"
        @click="$emit('abrirGestionAlertas')"
      >
        <template #iconoIzquierdo>
          <Sliders class="w-3.5 h-3.5" />
        </template>
        <span>Gestionar Filtros de Alertas</span>
      </BotonBase>
    </div>

    <!-- Indicadores Rápidos -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
      <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <span class="text-xs text-slate-500 font-medium">Total Participaciones:</span>
        <span class="text-base font-bold text-slate-900 dark:text-white font-mono">{{ totalRespuestas }}</span>
      </div>

      <div class="p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between text-amber-900 dark:text-amber-300">
        <span class="text-xs font-medium flex items-center gap-1.5">
          <ShieldAlert class="w-3.5 h-3.5 text-amber-500" />
          <span>Alertas Detectadas:</span>
        </span>
        <span class="text-base font-bold font-mono">{{ totalAlertas }}</span>
      </div>
    </div>
  </div>
</template>
