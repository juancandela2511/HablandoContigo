<!--
  ============================================================================
  SELECTOR DE FORMATOS Y MÉTRICAS DE INFORME (SelectorFormatoInforme.vue)
  ============================================================================
  Muestra el resumen de KPIs a exportar y las 3 tarjetas de formato (PDF, Excel, JSON).
-->

<script setup lang="ts">
import type { EstadisticasCompletas } from '@/Almacenes/useEstadisticas'
import {
  CheckCircle2,
  Building,
  Presentation,
  FileSpreadsheet,
  Code2
} from 'lucide-vue-next'

defineProps<{
  estadisticas: EstadisticasCompletas
  departamentoSeleccionado: string
  totalEncuestas: number
}>()

const emit = defineEmits<{
  (e: 'seleccionarFormato', formato: 'pdf' | 'excel' | 'json'): void
}>()
</script>

<template>
  <div class="space-y-5">
    <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 text-left">
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <CheckCircle2 class="w-4 h-4 text-emerald-500" />
          <span>Métricas del Informe a Exportar</span>
        </span>
        <span class="text-xs font-mono text-slate-500 flex items-center gap-1">
          <Building class="w-3.5 h-3.5" />
          <span>{{ departamentoSeleccionado }}</span>
        </span>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div class="text-lg font-black text-sky-600 dark:text-sky-400">
            {{ estadisticas.analisisConclusionesIA.indiceGeneralSalud }}%
          </div>
          <div class="text-[10px] text-slate-500 uppercase font-semibold">Salud de Clima</div>
        </div>
        <div class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div class="text-lg font-black text-slate-900 dark:text-white">
            {{ estadisticas.enps.score > 0 ? '+' : '' }}{{ estadisticas.enps.score }}
          </div>
          <div class="text-[10px] text-slate-500 uppercase font-semibold">eNPS ({{ estadisticas.enps.clasificacion }})</div>
        </div>
        <div class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div class="text-lg font-black text-slate-900 dark:text-white">
            {{ totalEncuestas }}
          </div>
          <div class="text-[10px] text-slate-500 uppercase font-semibold">Encuestas Activas</div>
        </div>
        <div class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div class="text-lg font-black text-slate-900 dark:text-white">
            {{ estadisticas.participacion.totalRespondieron }}
          </div>
          <div class="text-[10px] text-slate-500 uppercase font-semibold">Colaboradores</div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div
        @click="emit('seleccionarFormato', 'pdf')"
        class="p-5 rounded-2xl bg-white dark:bg-slate-950 border-2 border-sky-500/40 hover:border-sky-500 transition-all cursor-pointer group space-y-3 text-left hover:shadow-xl hover:-translate-y-0.5 bg-gradient-to-br from-sky-50/40 to-transparent dark:from-sky-950/20"
      >
        <div class="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Presentation class="w-5 h-5" />
        </div>
        <div>
          <h5 class="text-sm font-bold text-slate-900 dark:text-white group-hover:text-sky-500 transition-colors flex items-center gap-1.5">
            <span>Presentación PDF</span>
            <span class="text-[9px] bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 px-1.5 py-0.5 rounded font-bold">RECOMENDADO</span>
          </h5>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Portada ejecutiva, diapositivas con PAI por pregunta, objetivos de mejora y conclusión.
          </p>
        </div>
      </div>

      <div
        @click="emit('seleccionarFormato', 'excel')"
        class="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 transition-all cursor-pointer group space-y-3 text-left hover:shadow-xl hover:-translate-y-0.5"
      >
        <div class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
          <FileSpreadsheet class="w-5 h-5" />
        </div>
        <div>
          <h5 class="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
            Excel con Gráficas
          </h5>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Libro estructurado con portada corporativa, KPIs y barras de satisfacción.
          </p>
        </div>
      </div>

      <div
        @click="emit('seleccionarFormato', 'json')"
        class="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/60 transition-all cursor-pointer group space-y-3 text-left hover:shadow-xl hover:-translate-y-0.5"
      >
        <div class="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Code2 class="w-5 h-5" />
        </div>
        <div>
          <h5 class="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">
            JSON Datos Crudos
          </h5>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Payload completo para auditoría técnica o pipelines de integración.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
