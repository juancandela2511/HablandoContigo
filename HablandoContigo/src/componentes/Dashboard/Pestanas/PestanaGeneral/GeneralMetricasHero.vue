<!--
  ============================================================================
  TARJETAS DE MÉTRICAS GENERALES EJECUTIVAS (GeneralMetricasHero.vue)
  ============================================================================
  
  ¿QUÉ HACE?
  Muestra los 5 indicadores principales de la organización: Índice de Salud,
  eNPS laboral, alertas activas, tasa de participación y descartadas por velocidad.
  
  ¿CON QUÉ SE CONECTA?
  - DashboardPestanaGeneral.vue (Componente contenedor)
  - useEstadisticas.ts (Tipos MetricaENPS, MetricasParticipacion)
-->

<script setup lang="ts">
import { Heart, Smile, ShieldAlert, Users, ZapOff, ArrowRight } from 'lucide-vue-next'
import type { MetricaENPS, MetricasParticipacion } from '@/Almacenes/useEstadisticas'

defineProps<{
  promedioSalud: number
  enps: MetricaENPS
  totalAlertas: number
  participacion: MetricasParticipacion
  totalIgnoradasRelleno?: number
}>()

const emit = defineEmits<{
  (e: 'cambiarPestana', pestana: 'alertas' | 'auditoria'): void
}>()
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
    <!-- 1. Índice General de Salud -->
    <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md relative overflow-hidden group hover:border-sky-500/50 transition-all text-left">
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Salud de Clima</span>
        <div class="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-950 flex items-center justify-center text-sky-600 dark:text-sky-400">
          <Heart class="w-4 h-4" />
        </div>
      </div>
      <div class="mt-3 flex items-baseline gap-2">
        <span class="text-3xl font-black text-slate-900 dark:text-white font-mono">{{ promedioSalud }}%</span>
        <span class="text-[11px] text-emerald-600 font-semibold">+3.2%</span>
      </div>
    </div>

    <!-- 2. eNPS Laboral -->
    <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md relative overflow-hidden group hover:border-emerald-500/50 transition-all text-left">
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">eNPS Laboral</span>
        <div class="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <Smile class="w-4 h-4" />
        </div>
      </div>
      <div class="mt-3 flex items-baseline gap-2">
        <span class="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">+{{ enps.score }}</span>
        <span class="text-[11px] text-slate-500 font-medium truncate">{{ enps.clasificacion }}</span>
      </div>
    </div>

    <!-- 3. Alertas Críticas -->
    <div 
      @click="emit('cambiarPestana', 'alertas')"
      class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md relative overflow-hidden group hover:border-amber-500/50 transition-all cursor-pointer text-left"
    >
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Alertas Críticas</span>
        <div class="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400">
          <ShieldAlert class="w-4 h-4" />
        </div>
      </div>
      <div class="mt-3 flex items-baseline justify-between">
        <div>
          <span class="text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">{{ totalAlertas }}</span>
          <span class="text-[11px] text-slate-500 ml-1">casos</span>
        </div>
        <span class="text-[11px] text-sky-600 dark:text-sky-400 flex items-center gap-0.5 font-semibold group-hover:translate-x-1 transition-transform">
          Ver <ArrowRight class="w-3 h-3" />
        </span>
      </div>
    </div>

    <!-- 4. Participación -->
    <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md relative overflow-hidden group hover:border-indigo-500/50 transition-all text-left">
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Participación</span>
        <div class="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <Users class="w-4 h-4" />
        </div>
      </div>
      <div class="mt-3 flex items-baseline gap-2">
        <span class="text-3xl font-black text-indigo-600 dark:text-indigo-400 font-mono">{{ participacion.tasaParticipacion }}%</span>
        <span class="text-[11px] text-slate-500">{{ participacion.totalRespondieron }}/{{ participacion.totalColaboradores }}</span>
      </div>
    </div>

    <!-- 5. Respuestas Ignoradas por Relleno Rápido -->
    <div 
      @click="emit('cambiarPestana', 'auditoria')"
      class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md relative overflow-hidden group hover:border-slate-400 transition-all cursor-pointer text-left"
      title="Respuestas completadas en menos de 3s o con patrones de descarte. Excluidas de las notas de clima."
    >
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Ignoradas (&lt;3s)</span>
        <div class="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
          <ZapOff class="w-4 h-4" />
        </div>
      </div>
      <div class="mt-3 flex items-baseline justify-between">
        <div>
          <span class="text-3xl font-black text-slate-700 dark:text-slate-300 font-mono">{{ totalIgnoradasRelleno ?? 0 }}</span>
          <span class="text-[11px] text-slate-500 ml-1">descartes</span>
        </div>
        <span class="text-[11px] text-slate-400 flex items-center gap-0.5 font-semibold group-hover:translate-x-1 transition-transform">
          Auditar <ArrowRight class="w-3 h-3" />
        </span>
      </div>
    </div>
  </div>
</template>
