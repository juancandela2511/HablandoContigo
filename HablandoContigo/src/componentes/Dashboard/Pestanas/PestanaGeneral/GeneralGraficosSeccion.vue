<!--
  ============================================================================
  SECCIÓN DE GRÁFICOS Y DIAGNÓSTICO GENERAL (GeneralGraficosSeccion.vue)
  ============================================================================
  
  ¿QUÉ HACE?
  Agrupa el gauge circular de salud, las conclusiones analíticas de IA,
  el gráfico radial interactivo y el comparativo de barras de dimensiones.
  
  ¿CON QUÉ SE CONECTA?
  - DashboardPestanaGeneral.vue (Componente contenedor)
  - GaugeSalud.vue
  - GraficoRadial.vue
  - GraficoBarras.vue
  - useEstadisticas.ts
-->

<script setup lang="ts">
import { Heart, ShieldAlert } from 'lucide-vue-next'
import type { DimensionRadial, AnalisisConclusiones } from '@/Almacenes/useEstadisticas'
import type { ItemBarra } from '@/componentes/Dashboard/GraficoBarras.vue'
import GaugeSalud from '@/componentes/Dashboard/GaugeSalud.vue'
import GraficoRadial from '@/componentes/Dashboard/GraficoRadial.vue'
import GraficoBarras from '@/componentes/Dashboard/GraficoBarras.vue'

defineProps<{
  promedioSalud: number
  conclusionesIA: AnalisisConclusiones
  dimensionesRadiales: DimensionRadial[]
  dimensionesBarras: ItemBarra[]
}>()

const emit = defineEmits<{
  (e: 'configurarRadial'): void
}>()
</script>

<template>
  <div class="space-y-6">
    <!-- Fila 1: Gauge de Salud + Conclusiones de IA -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div class="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex items-center justify-center">
        <GaugeSalud 
          :valor="promedioSalud" 
          :meta="85"
          titulo="Salud de Clima"
          subtitulo="Índice Global"
        />
      </div>

      <div class="lg:col-span-8 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col justify-between space-y-4 text-left">
        <div>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-2.5 h-2.5 rounded-full bg-sky-500 animate-ping"></div>
              <h3 class="text-base font-bold text-slate-900 dark:text-white">
                Diagnóstico y Conclusiones de Clima
              </h3>
            </div>
            <span class="text-xs px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-sky-400 font-semibold border border-blue-200 dark:border-blue-800">
              Evaluación en Tiempo Real
            </span>
          </div>

          <div class="mt-4 space-y-3">
            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
              <div class="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                <Heart class="w-3.5 h-3.5" />
              </div>
              <div>
                <p class="text-xs font-bold text-slate-900 dark:text-white">Fortaleza Organizacional Destacada</p>
                <p class="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  {{ conclusionesIA.principalesFortalezas?.[0] || 'Respeto mutuo y comunicación abierta en los equipos de trabajo.' }}
                </p>
              </div>
            </div>

            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
              <div class="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
                <ShieldAlert class="w-3.5 h-3.5" />
              </div>
              <div>
                <p class="text-xs font-bold text-slate-900 dark:text-white">Foco de Atención Prioritaria</p>
                <p class="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  {{ conclusionesIA.puntosCriticosDeAtencion?.[0] || 'Monitorear la carga operativa y mantener canales de apoyo confidencial.' }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Diagnóstico: <strong class="text-slate-900 dark:text-white">{{ conclusionesIA.diagnosticoEjecutivo || 'Clima favorable con alta participación.' }}</strong></span>
        </div>
      </div>
    </div>

    <!-- Fila 2: Gráfico Radial + Gráfico de Barras -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div class="lg:col-span-6 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
        <GraficoRadial 
          :dimensiones="dimensionesRadiales" 
          @abrirConfiguracion="emit('configurarRadial')"
          @configurar="emit('configurarRadial')"
        />
      </div>

      <div class="lg:col-span-6 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
        <GraficoBarras 
          :datos="dimensionesBarras"
          titulo="Comparativa de Dimensiones por Porcentaje"
          subtitulo="Puntuación relativa y nivel de cumplimiento"
        />
      </div>
    </div>
  </div>
</template>
