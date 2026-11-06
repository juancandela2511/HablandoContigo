<!--
  ============================================================================
  COMPONENTE ENCABEZADO DEL DASHBOARD EJECUTIVO (DashboardEncabezado.vue)
  ============================================================================
  Barra superior minimalista y unificada del Dashboard:
  - Título del proyecto activo y botón rápido para cambiar de proyecto.
  - Filtros de Departamento y Rango Temporal.
  - Botón de Exportar Informe Ejecutivo (PDF con Análisis IA, CSV, JSON).
-->

<script setup lang="ts">
import { Download, ArrowLeft } from 'lucide-vue-next'

defineProps<{
  departamentoSeleccionado: string
  periodoSeleccionado: string
  departamentosDisponibles: string[]
  encuestaSeleccionada?: string
  nombreProyectoActivo?: string
  encuestasDisponibles?: { id: string; titulo: string }[]
  modoVista?: 'clima' | 'rapida' | 'consolidado'
}>()

defineEmits<{
  (e: 'update:departamentoSeleccionado', valor: string): void
  (e: 'update:periodoSeleccionado', valor: string): void
  (e: 'update:encuestaSeleccionada', valor: string): void
  (e: 'update:modoVista', valor: 'clima' | 'rapida' | 'consolidado'): void
  (e: 'abrirModalExportar'): void
  (e: 'cambiarProyecto'): void
}>()
</script>

<template>
  <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800 text-left">
    <!-- Identificador de Proyecto Activo y Botón Volver -->
    <div class="flex items-center gap-3 flex-wrap">
      <button
        type="button"
        @click="$emit('cambiarProyecto')"
        class="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
        title="Seleccionar otro proyecto"
      >
        <ArrowLeft class="w-3.5 h-3.5" />
        <span>Proyectos</span>
      </button>

      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
        <h1 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
          {{ nombreProyectoActivo || 'Dashboard de Clima Laboral' }}
        </h1>
      </div>
    </div>

    <!-- Controles Compactos de Filtros y Exportación -->
    <div class="flex flex-wrap items-center gap-2">
      <select
        :value="departamentoSeleccionado"
        @change="$emit('update:departamentoSeleccionado', ($event.target as HTMLSelectElement).value)"
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-sky-500 text-xs font-medium shadow-xs cursor-pointer"
      >
        <option value="todos">Todos los Departamentos</option>
        <option v-for="dep in departamentosDisponibles" :key="dep" :value="dep">
          {{ dep }}
        </option>
      </select>

      <select
        :value="periodoSeleccionado"
        @change="$emit('update:periodoSeleccionado', ($event.target as HTMLSelectElement).value)"
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-sky-500 text-xs font-medium shadow-xs cursor-pointer"
      >
        <option value="diaria">Últimas 24 Horas</option>
        <option value="semanal">Últimas 7 Semanas</option>
        <option value="mensual">Últimos 6 Meses</option>
        <option value="anual">Trimestral Anual</option>
      </select>

      <button
        type="button"
        @click="$emit('abrirModalExportar')"
        class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
      >
        <Download class="w-3.5 h-3.5" />
        
      </button>
    </div>
  </div>
</template>
