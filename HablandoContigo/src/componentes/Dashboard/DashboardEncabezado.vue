<!--
  ============================================================================
  COMPONENTE ENCABEZADO DEL DASHBOARD EJECUTIVO (DashboardEncabezado.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Barra superior del panel ejecutivo:
  - Título y breadcrumb de Analítica y Diagnóstico de Clima.
  - Selector de filtro por Departamento.
  - Selector de rango de análisis temporal (Últimas 24h, 7 semanas, 6 meses, Trimestral anual).
  - Botón de Exportar Informe Ejecutivo (PDF, CSV, JSON).
  
  ¿PARA QUÉ SIRVE?
  - Permitir a la dirección segmentar en tiempo real las visualizaciones del Dashboard.
  
  ¿CON QUÉ ESTÁ VINCULADO / CONECTADO?
  - DashboardView.vue: Emite eventos y sincroniza los `v-model` de filtrado.
-->

<script setup lang="ts">
import { ChevronRight, Download, Eraser } from 'lucide-vue-next'

defineProps<{
  departamentoSeleccionado: string
  periodoSeleccionado: string
  departamentosDisponibles: string[]
  encuestaSeleccionada?: string
  encuestasDisponibles?: { id: string; titulo: string }[]
}>()

defineEmits<{
  (e: 'update:departamentoSeleccionado', valor: string): void
  (e: 'update:periodoSeleccionado', valor: string): void
  (e: 'update:encuestaSeleccionada', valor: string): void
  (e: 'abrirModalExportar'): void
  (e: 'purgarEstadisticas'): void
}>()
</script>

<template>
  <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
    <div>
      <div class="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
        <span>Gestión de Talento</span>
        <ChevronRight class="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
        <span class="text-sky-600 dark:text-sky-400 font-semibold">Analítica y Diagnóstico de Clima</span>
      </div>
      <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
        <span>Dashboard Estadístico y de Bienestar</span>
      </h1>
      <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
        Monitoreo en tiempo real de seguridad psicológica, prevención de acoso laboral y salud organizacional.
      </p>
    </div>

    <!-- Controles de Filtros y Exportación -->
    <div class="flex flex-wrap items-center gap-2.5">
      
      <!-- Selector de Encuesta Específica o Consolidada -->
      <div class="relative">
        <select 
          :value="encuestaSeleccionada || 'todas'"
          @change="$emit('update:encuestaSeleccionada', ($event.target as HTMLSelectElement).value)"
          class="bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 rounded-2xl px-3.5 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-sky-500 text-xs font-semibold backdrop-blur-xl shadow-sm max-w-[200px] truncate"
        >
          <option value="todas">📊 Todas las Encuestas (Consolidado)</option>
          <option v-for="enc in encuestasDisponibles || []" :key="enc.id" :value="enc.id">
            📋 {{ enc.titulo }}
          </option>
        </select>
      </div>

      <!-- Selector Departamento -->
      <div class="relative">
        <select 
          :value="departamentoSeleccionado"
          @change="$emit('update:departamentoSeleccionado', ($event.target as HTMLSelectElement).value)"
          class="bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 rounded-2xl px-3.5 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-sky-500 text-xs font-medium backdrop-blur-xl shadow-sm"
        >
          <option value="todos">Todos los Departamentos</option>
          <option v-for="dep in departamentosDisponibles" :key="dep" :value="dep">
            {{ dep }}
          </option>
        </select>
      </div>

      <!-- Selector Rango Temporal -->
      <div class="relative">
        <select 
          :value="periodoSeleccionado"
          @change="$emit('update:periodoSeleccionado', ($event.target as HTMLSelectElement).value)"
          class="bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 rounded-2xl px-3.5 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-sky-500 text-xs font-medium backdrop-blur-xl shadow-sm"
        >
          <option value="diaria">Últimas 24 Horas</option>
          <option value="semanal">Últimas 7 Semanas</option>
          <option value="mensual">Últimos 6 Meses</option>
          <option value="anual">Trimestral Anual</option>
        </select>
      </div>

      <!-- Botón Limpiar / Purgar Estadísticas -->
      <button 
        type="button"
        @click="$emit('purgarEstadisticas')"
        class="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-sm"
        title="Purgar y vaciar todas las respuestas registradas en Supabase"
      >
        <Eraser class="w-4 h-4" />
      </button>

      <!-- Botón Exportar Informe -->
      <button 
        @click="$emit('abrirModalExportar')"
        class="px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/25 active:scale-95 transition-all cursor-pointer"
      >
        <Download class="w-3.5 h-3.5" />
        <span>Exportar Informe</span>
      </button>

    </div>
  </div>
</template>
