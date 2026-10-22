<!--
  ============================================================================
  COMPONENTE MATRIZ DE CALOR Y RIESGO CRUZADO (MatrizCalorRiesgo.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Matriz de calor bidimensional que cruza los Departamentos (filas) con las 
  Dimensiones Estratégicas de Clima (columnas), pintando cada celda con un código 
  de color semafórico y balizas de alerta activa.
  
  ¿PARA QUÉ SIRVE?
  - Identificar visualmente en segundos qué departamento tiene problemas de sobrecarga o acoso.
  - Filtrar las celdas por nivel de severidad ('Todos', 'Crítico', 'Moderado', 'Óptimo').
  
  ¿CON QUÉ ESTÁ VINCULADO / CONECTADO?
  - DashboardView.vue: Pestaña 2 "Matriz Multidimensional & Calor".
  - useEstadisticas.ts: Provee `matrizCalorFiltrada` y `datosEstadisticas.matrizCalor`.
-->

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { CeldaMatrizCalor } from '@/Almacenes/useEstadisticas'
import { Flame, ShieldAlert, Sparkles, Filter } from 'lucide-vue-next'

const props = defineProps<{
  celdas: CeldaMatrizCalor[]
}>()

const emit = defineEmits<{
  (evento: 'seleccionarDepartamento', departamento: string): void
}>()

/** Filtro activo por nivel de severidad */
const filtroSeveridad = ref<'todos' | 'Crítico' | 'Moderado' | 'Atención' | 'Óptimo'>('todos')

/** Lista de departamentos únicos */
const departamentos = computed(() => {
  const depSet = new Set(props.celdas.map(c => c.departamento))
  return Array.from(depSet)
})

/** Lista de dimensiones únicas */
const dimensiones = computed(() => {
  const dimSet = new Set(props.celdas.map(c => c.dimension))
  return Array.from(dimSet)
})

/**
 * Obtiene la celda correspondiente a una intersección departamento x dimensión
 */
const obtenerCelda = (dep: string, dim: string): CeldaMatrizCalor | undefined => {
  return props.celdas.find(c => c.departamento === dep && c.dimension === dim)
}

/**
 * Retorna las clases de estilo de color de fondo según el porcentaje y nivel de riesgo
 */
const obtenerColorCelda = (celda?: CeldaMatrizCalor) => {
  if (!celda) return 'bg-slate-100 dark:bg-slate-800 text-slate-400'
  
  if (filtroSeveridad.value !== 'todos' && celda.nivelRiesgo !== filtroSeveridad.value) {
    return 'bg-slate-100 dark:bg-slate-800/40 text-slate-400 opacity-30'
  }

  if (celda.nivelRiesgo === 'Crítico') {
    return 'bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/40 font-bold'
  }
  if (celda.nivelRiesgo === 'Moderado') {
    return 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 font-bold'
  }
  if (celda.nivelRiesgo === 'Atención') {
    return 'bg-blue-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/40 font-semibold'
  }
  return 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 font-bold'
}
</script>

<template>
  <div class="space-y-4">
    
    <!-- Encabezado con Filtros de Severidad -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
      <div>
        <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Flame class="w-4 h-4 text-orange-500" />
          <span>Matriz de Calor Organizacional (Departamentos vs Dimensiones)</span>
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Haz clic en cualquier departamento para segmentar el análisis global.
        </p>
      </div>

      <!-- Filtro Rápido de Riesgo -->
      <div class="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
        <span class="text-[10px] text-slate-500 font-medium px-2">Filtro:</span>
        <button
          v-for="severidad in (['todos', 'Crítico', 'Moderado', 'Atención', 'Óptimo'] as const)"
          :key="severidad"
          @click="filtroSeveridad = severidad"
          :class="[
            'px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all capitalize cursor-pointer',
            filtroSeveridad === severidad
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          ]"
        >
          {{ severidad }}
        </button>
      </div>
    </div>

    <!-- Tabla de la Matriz de Calor -->
    <div class="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
      <table class="w-full text-left text-xs border-collapse">
        <thead class="bg-slate-100 dark:bg-slate-950/80 text-slate-600 dark:text-slate-400 uppercase text-[10px] tracking-wider">
          <tr>
            <th class="p-3.5 font-bold border-b border-r border-slate-200 dark:border-slate-800 min-w-[200px]">
              Departamento / Área
            </th>
            <th 
              v-for="dim in dimensiones" 
              :key="dim"
              class="p-3.5 font-semibold text-center border-b border-slate-200 dark:border-slate-800 min-w-[130px]"
            >
              {{ dim }}
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60 bg-white/40 dark:bg-slate-900/40">
          <tr 
            v-for="dep in departamentos" 
            :key="dep"
            class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
          >
            <!-- Nombre del Departamento con botón drilldown -->
            <td class="p-3.5 font-bold text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-800">
              <button
                @click="emit('seleccionarDepartamento', dep)"
                class="hover:text-sky-500 transition-colors flex items-center gap-1.5 text-left cursor-pointer"
                title="Filtrar dashboard por este departamento"
              >
                <span>{{ dep }}</span>
                
              </button>
            </td>

            <!-- Celdas de la Matriz -->
            <td 
              v-for="dim in dimensiones" 
              :key="dim"
              class="p-2 text-center"
            >
              <div 
                :class="[
                  'py-2.5 px-3 rounded-xl transition-all flex flex-col items-center justify-center gap-0.5 relative group',
                  obtenerColorCelda(obtenerCelda(dep, dim))
                ]"
              >
                <div class="flex items-center gap-1">
                  <span class="text-xs font-mono font-extrabold">
                    {{ obtenerCelda(dep, dim)?.porcentaje || 0 }}%
                  </span>
                  <span 
                    v-if="obtenerCelda(dep, dim)?.alertaActiva"
                    class="w-2 h-2 rounded-full bg-red-500 animate-ping"
                    title="Alerta crítica detectada en esta dimensión"
                  ></span>
                </div>

                <span class="text-[9px] uppercase tracking-wider opacity-80">
                  {{ obtenerCelda(dep, dim)?.puntaje }} / 5.0
                </span>
              </div>
            </td>

          </tr>
        </tbody>
      </table>
    </div>

    <!-- Leyenda de Convenciones -->
    <div class="flex flex-wrap items-center justify-between gap-3 pt-2 text-[11px] text-slate-500 dark:text-slate-400">
      <div class="flex items-center gap-4">
        <span class="flex items-center gap-1.5">
          <span class="w-3 h-3 rounded-md bg-emerald-500/30 border border-emerald-500"></span>
          Óptimo (85-100%)
        </span>
        <span class="flex items-center gap-1.5">
          <span class="w-3 h-3 rounded-md bg-blue-500/30 border border-sky-500"></span>
          Atención (75-84%)
        </span>
        <span class="flex items-center gap-1.5">
          <span class="w-3 h-3 rounded-md bg-amber-500/30 border border-amber-500"></span>
          Moderado (65-74%)
        </span>
        <span class="flex items-center gap-1.5">
          <span class="w-3 h-3 rounded-md bg-red-500/30 border border-red-500"></span>
          Crítico (&lt;65%)
        </span>
      </div>

      <span class="flex items-center gap-1 text-red-500 font-medium">
        <span class="w-2 h-2 rounded-full bg-red-500"></span>
        Alerta Activa de Acoso / Sobrecarga
      </span>
    </div>

  </div>
</template>
