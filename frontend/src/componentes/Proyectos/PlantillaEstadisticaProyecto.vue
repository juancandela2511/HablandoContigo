<script setup lang="ts">
import { ref } from 'vue'
import {
  TrendingUp,
  BarChart3,
  PieChart,
  Users,
  Target,
  Sparkles,
  AlertCircle,
  Clock,
  Layers,
  ArrowUpRight,
  Info
} from 'lucide-vue-next'

const props = defineProps<{
  nombreProyecto?: string
}>()

const modalAvisoAbierto = ref(false)
const elementoClickeado = ref('')

const mostrarAvisoDisponibleLuego = (nombreElemento: string) => {
  elementoClickeado.value = nombreElemento
  modalAvisoAbierto.value = true
}
</script>

<template>
  <div class="space-y-6 text-left relative">
    <!-- BANNER DE PLANTILLA PREVIA -->
    <div class="p-4 rounded-3xl bg-gradient-to-r from-blue-950/60 via-indigo-950/60 to-purple-950/60 border border-blue-500/30 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 text-blue-300 flex items-center justify-center shrink-0">
          <Layers class="w-5 h-5" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h3 class="text-sm font-extrabold text-white">Plantilla de Estadística de Proyecto: {{ nombreProyecto || 'Proyecto Independiente' }}</h3>
            <span class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold uppercase border border-amber-500/30">
              Vista Previa
            </span>
          </div>
          <p class="text-xs text-slate-300">
            Estructura de analítica y métricas exclusiva para este proyecto independiente. Haz clic en cualquier módulo para consultar disponibilidad.
          </p>
        </div>
      </div>
      <button
        type="button"
        @click="mostrarAvisoDisponibleLuego('Módulo de Analítica')"
        class="px-4 py-2 rounded-xl bg-blue-600/80 hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-md cursor-pointer shrink-0"
      >
        Consultar Estado
      </button>
    </div>

    <!-- TARJETAS KPIS DE LA PLANTILLA -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        @click="mostrarAvisoDisponibleLuego('KPI: Tasa de Respuesta del Proyecto')"
        class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-500/50 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
      >
        <div class="flex items-center justify-between text-slate-400">
          <span class="text-xs font-bold uppercase tracking-wider">Adopción del Proyecto</span>
          <Users class="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
        </div>
        <div class="mt-2 flex items-baseline gap-2">
          <span class="text-2xl font-black text-slate-900 dark:text-white">84.2%</span>
          <span class="text-xs font-bold text-emerald-500 flex items-center gap-0.5">
            <ArrowUpRight class="w-3.5 h-3.5" /> +12%
          </span>
        </div>
        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">128 colaboradores asignados</p>
      </div>

      <div
        @click="mostrarAvisoDisponibleLuego('KPI: Índice eNPS del Proyecto')"
        class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500/50 hover:shadow-md transition-all cursor-pointer group"
      >
        <div class="flex items-center justify-between text-slate-400">
          <span class="text-xs font-bold uppercase tracking-wider">Score eNPS Proyecto</span>
          <Target class="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
        </div>
        <div class="mt-2 flex items-baseline gap-2">
          <span class="text-2xl font-black text-slate-900 dark:text-white">+48 pts</span>
          <span class="text-xs font-bold text-emerald-500">Excelente</span>
        </div>
        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Recomendación interna del área</p>
      </div>

      <div
        @click="mostrarAvisoDisponibleLuego('KPI: Satisfacción Cualitativa')"
        class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-sky-500/50 hover:shadow-md transition-all cursor-pointer group"
      >
        <div class="flex items-center justify-between text-slate-400">
          <span class="text-xs font-bold uppercase tracking-wider">Satisfacción Cualitativa</span>
          <Sparkles class="w-4 h-4 text-sky-500 group-hover:scale-110 transition-transform" />
        </div>
        <div class="mt-2 flex items-baseline gap-2">
          <span class="text-2xl font-black text-slate-900 dark:text-white">4.3 / 5.0</span>
          <span class="text-xs font-bold text-sky-400">86%</span>
        </div>
        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Procesado con IA de análisis abierto</p>
      </div>

      <div
        @click="mostrarAvisoDisponibleLuego('KPI: Riesgo Psicosocial')"
        class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-amber-500/50 hover:shadow-md transition-all cursor-pointer group"
      >
        <div class="flex items-center justify-between text-slate-400">
          <span class="text-xs font-bold uppercase tracking-wider">Riesgo Psicosocial</span>
          <AlertCircle class="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
        </div>
        <div class="mt-2 flex items-baseline gap-2">
          <span class="text-2xl font-black text-amber-500">Bajo</span>
          <span class="text-xs font-bold text-slate-400">1 alerta</span>
        </div>
        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Monitoreo preventivo del equipo</p>
      </div>
    </div>

    <!-- MÓDULOS DE GRÁFICOS DE LA PLANTILLA -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Módulo 1: Distribución de Respuestas por Dimensión -->
      <div
        @click="mostrarAvisoDisponibleLuego('Gráfico: Distribución de Respuestas por Dimensión')"
        class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-500/40 transition-all cursor-pointer space-y-4"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <BarChart3 class="w-5 h-5 text-blue-500" />
            <h4 class="text-sm font-bold text-slate-900 dark:text-white">Métricas de Proyecto por Eje Operativo</h4>
          </div>
          <span class="text-[10px] font-mono font-bold text-blue-500 uppercase px-2 py-0.5 rounded-md bg-blue-500/10">Plantilla</span>
        </div>
        
        <!-- Simulación visual de barras -->
        <div class="space-y-3 pt-2">
          <div>
            <div class="flex justify-between text-xs mb-1 text-slate-600 dark:text-slate-300">
              <span>Claridad en los Objetivos</span>
              <span class="font-bold text-blue-500">88%</span>
            </div>
            <div class="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div class="h-full bg-blue-500 rounded-full" style="width: 88%"></div>
            </div>
          </div>
          <div>
            <div class="flex justify-between text-xs mb-1 text-slate-600 dark:text-slate-300">
              <span>Soporte y Liderazgo Directo</span>
              <span class="font-bold text-sky-500">82%</span>
            </div>
            <div class="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div class="h-full bg-sky-500 rounded-full" style="width: 82%"></div>
            </div>
          </div>
          <div>
            <div class="flex justify-between text-xs mb-1 text-slate-600 dark:text-slate-300">
              <span>Distribución de Carga de Trabajo</span>
              <span class="font-bold text-amber-500">71%</span>
            </div>
            <div class="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div class="h-full bg-amber-500 rounded-full" style="width: 71%"></div>
            </div>
          </div>
          <div>
            <div class="flex justify-between text-xs mb-1 text-slate-600 dark:text-slate-300">
              <span>Herramientas & Entorno de Trabajo</span>
              <span class="font-bold text-indigo-500">92%</span>
            </div>
            <div class="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div class="h-full bg-indigo-500 rounded-full" style="width: 92%"></div>
            </div>
          </div>
        </div>
        <p class="text-[11px] text-slate-400 italic text-center pt-2">Haz clic para interactuar o ver detalles de cálculo</p>
      </div>

      <!-- Módulo 2: Desglose de Sentimiento Cualitativo -->
      <div
        @click="mostrarAvisoDisponibleLuego('Gráfico: Desglose de Sentimiento Cualitativo')"
        class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500/40 transition-all cursor-pointer space-y-4"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <PieChart class="w-5 h-5 text-indigo-500" />
            <h4 class="text-sm font-bold text-slate-900 dark:text-white">Análisis Cualitativo del Proyecto</h4>
          </div>
          <span class="text-[10px] font-mono font-bold text-indigo-500 uppercase px-2 py-0.5 rounded-md bg-indigo-500/10">Plantilla</span>
        </div>

        <div class="flex flex-col sm:flex-row items-center justify-around gap-4 pt-4">
          <div class="w-32 h-32 rounded-full border-8 border-indigo-500/80 border-t-emerald-500 border-r-sky-500 flex items-center justify-center text-center">
            <div>
              <span class="text-xl font-black text-slate-900 dark:text-white">86%</span>
              <span class="block text-[10px] text-slate-400">Positivo</span>
            </div>
          </div>
          <div class="space-y-2 text-xs">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span>Respuestas Favorables: <strong>68%</strong></span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-sky-500"></span>
              <span>Propuestas Constructivas: <strong>22%</strong></span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-rose-500"></span>
              <span>Oportunidades Críticas: <strong>10%</strong></span>
            </div>
          </div>
        </div>
        <p class="text-[11px] text-slate-400 italic text-center pt-2">Haz clic para interactuar o ver detalles de cálculo</p>
      </div>
    </div>

    <!-- MODAL POPUP: "ESTO ESTARÁ DISPONIBLE LUEGO" -->
    <div
      v-if="modalAvisoAbierto"
      class="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
      @click.self="modalAvisoAbierto = false"
    >
      <div class="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 text-center space-y-4">
        <!-- Icono Reloj / Construcción -->
        <div class="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-500 mx-auto flex items-center justify-center shadow-lg">
          <Clock class="w-8 h-8 animate-pulse" />
        </div>

        <div class="space-y-2">
          <h3 class="text-lg font-black text-slate-900 dark:text-white">
            Esto estará disponible luego
          </h3>
          <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Has seleccionado <strong class="text-blue-500">{{ elementoClickeado }}</strong>.
          </p>
          <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-left text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2.5">
            <Info class="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <span>
              Esta sección es una <strong>plantilla visual de previsualización</strong>. El motor de cálculo en tiempo real para encuestas y proyectos independientes estará disponible en la siguiente fase de despliegue.
            </span>
          </div>
        </div>

        <button
          type="button"
          @click="modalAvisoAbierto = false"
          class="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
        >
          Entendido
        </button>
      </div>
    </div>
  </div>
</template>
