<!--
  ============================================================================
  SECCIÓN DE CLIMA LABORAL UNIFICADA (GeneralGraficosSeccion.vue)
  ============================================================================
  Unifica en una sola tarjeta ejecutiva:
  1. Salud de Clima (Medidor circular gauge con meta 85%)
  2. Alertas Críticas (Conteo en tiempo real y enlace a revisión)
  3. Participación (Tasa de respuesta y progreso de colaboradores)
-->

<script setup lang="ts">
import { computed } from 'vue'
import { ShieldAlert, Users, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-vue-next'
import type { DimensionRadial, AnalisisConclusiones, MetricasParticipacion } from '@/Almacenes/useEstadisticas'
import type { ItemBarra } from '@/componentes/Dashboard/GraficoBarras.vue'
import GaugeSalud from '@/componentes/Dashboard/GaugeSalud.vue'
import ResumenComentariosOllama from '@/componentes/Dashboard/ResumenComentariosOllama.vue'
import { useEncuestas } from '@/Almacenes/useEncuestas'

const { respuestasAnonimas } = useEncuestas()

const props = defineProps<{
  promedioSalud: number
  totalAlertas?: number
  participacion?: MetricasParticipacion
  conclusionesIA?: AnalisisConclusiones
  dimensionesRadiales?: DimensionRadial[]
  dimensionesBarras?: ItemBarra[]
  departamentosBarras?: ItemBarra[]
  anguloInclinacion?: number
}>()

const emit = defineEmits<{
  (e: 'configurarRadial'): void
  (e: 'cambiarPestana', pestana: 'alertas' | 'auditoria'): void
}>()

const alertasSeguras = computed(() => props.totalAlertas ?? 0)
const participacionSegura = computed(() => {
  return props.participacion || {
    tasaParticipacion: 0,
    totalColaboradores: 0,
    totalRespondieron: 0,
    tiempoPromedioMin: 0,
    tasaFinalizacion: 0,
    dispositivos: { escritorio: 0, movil: 0, tablet: 0 },
    navegadores: [],
    horariosPico: []
  }
})
</script>

<template>
  <div class="space-y-6 text-left font-['Poppins',sans-serif]">
    
    <!-- TARJETA PRINCIPAL UNIFICADA: CLIMA LABORAL + ALERTAS CRÍTICAS + PARTICIPACIÓN -->
    <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        <!-- COLUMNA 1: GAUGE CIRCULAR DE SALUD DE CLIMA (5 cols) -->
        <div class="lg:col-span-5 flex flex-col items-center justify-center p-4 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800">
          <GaugeSalud 
            :valor="promedioSalud" 
            :meta="85"
            titulo="Salud de Clima"
            subtitulo="Índice Global"
          />
        </div>

        <!-- COLUMNA 2: ALERTAS CRÍTICAS Y PARTICIPACIÓN UNIFICADAS (7 cols) -->
        <div class="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          <!-- TARJETA: ALERTAS CRÍTICAS -->
          <div 
            @click="emit('cambiarPestana', 'alertas')"
            class="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800/80 shadow-xs relative overflow-hidden group hover:border-amber-500/50 hover:bg-slate-100/60 dark:hover:bg-slate-900/60 transition-all cursor-pointer flex flex-col justify-between space-y-4"
          >
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Alertas Críticas
              </span>
              <div class="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/80 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-inner">
                <ShieldAlert class="w-4 h-4" />
              </div>
            </div>

            <div>
              <div class="flex items-baseline gap-2">
                <span class="text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">
                  {{ alertasSeguras }}
                </span>
                <span class="text-xs text-slate-500">casos</span>
              </div>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {{ alertasSeguras === 0 ? 'Sin alertas registradas' : 'Atención requerida' }}
              </p>
            </div>

            <div class="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 font-bold group-hover:underline">
              <span>Ver casos</span>
              <ArrowRight class="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <!-- TARJETA: PARTICIPACIÓN -->
          <div class="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800/80 shadow-xs relative overflow-hidden group hover:border-indigo-500/50 hover:bg-slate-100/60 dark:hover:bg-slate-900/60 transition-all flex flex-col justify-between space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Participación
              </span>
              <div class="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner">
                <Users class="w-4 h-4" />
              </div>
            </div>

            <div>
              <div class="flex items-baseline gap-2">
                <span class="text-3xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                  {{ participacionSegura.tasaParticipacion }}%
                </span>
                <span class="text-xs text-slate-500 font-mono">
                  {{ participacionSegura.totalRespondieron }}/{{ participacionSegura.totalColaboradores }}
                </span>
              </div>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Colaboradores censados
              </p>
            </div>

            <!-- Barra de Progreso de Participación -->
            <div class="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 space-y-1">
              <div class="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div 
                  class="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-700"
                  :style="{ width: `${Math.min(100, Math.max(0, participacionSegura.tasaParticipacion))}%` }"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- 2. RESUMEN DE COMENTARIOS CON IA OLLAMA -->
    <ResumenComentariosOllama :respuestas="respuestasAnonimas" />

  </div>
</template>
