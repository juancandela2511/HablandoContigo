<!--
  ============================================================================
  COMPONENTE ANALÍTICA DE PARTICIPACIÓN, HORARIOS Y DISPOSITIVOS (AnaliticaParticipacionHoraria.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Visualiza la telemetría técnica y temporal de las respuestas:
  1. Histograma de horas pico de participación y variación de la satisfacción durante el turno.
  2. Distribución porcentual por hardware (Escritorio, Móvil, Tablet).
  3. Navegadores más utilizados (Chrome, Edge, Safari, Firefox).
  4. Métricas clave: tasa de participación (92.0%) y tasa de finalización (98.4%).
  
  ¿PARA QUÉ SIRVE?
  - Entender en qué momentos del turno existe mayor disposición a contestar.
  - Asegurar la compatibilidad multiplataforma y validar la agilidad del cuestionario.
  
  ¿CON QUÉ ESTÁ VINCULADO / CONECTADO?
  - DashboardView.vue: Pestaña 4 "Participación & Dispositivos".
  - useEstadisticas.ts: Provee `participacion`.
-->

<script setup lang="ts">
import { computed } from 'vue'
import type { MetricasParticipacion } from '@/Almacenes/useEstadisticas'
import { Clock, Monitor, Smartphone, Tablet, Globe2, CheckCircle2, UserCheck } from 'lucide-vue-next'

const props = defineProps<{
  participacion: MetricasParticipacion
}>()

/** Volumen máximo para normalizar la altura del histograma */
const volumenMaximo = computed(() => {
  return Math.max(...props.participacion.horariosPico.map(h => h.volumen), 1)
})
</script>

<template>
  <div class="space-y-6">
    
    <!-- Tarjetas de Resumen Superior -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      <!-- Tasa de Participación -->
      <div class="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 space-y-1">
        <div class="flex items-center justify-between text-xs text-slate-500">
          <span>Tasa de Participación</span>
          <UserCheck class="w-4 h-4 text-emerald-500" />
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {{ participacion.tasaParticipacion }}%
          </span>
          <span class="text-[11px] text-emerald-500 font-semibold">+6.4% vs meta</span>
        </div>
        <p class="text-[10px] text-slate-400">
          {{ participacion.totalRespondieron }} de {{ participacion.totalColaboradores }} colaboradores
        </p>
      </div>

      <!-- Tasa de Finalización -->
      <div class="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 space-y-1">
        <div class="flex items-center justify-between text-xs text-slate-500">
          <span>Tasa de Finalización</span>
          <CheckCircle2 class="w-4 h-4 text-sky-500" />
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {{ participacion.tasaFinalizacion }}%
          </span>
          <span class="text-[11px] text-sky-500 font-semibold">Excelente</span>
        </div>
        <p class="text-[10px] text-slate-400">
          Solo el 1.6% abandonó antes de terminar
        </p>
      </div>

      <!-- Tiempo Promedio -->
      <div class="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 space-y-1">
        <div class="flex items-center justify-between text-xs text-slate-500">
          <span>Tiempo Promedio</span>
          <Clock class="w-4 h-4 text-amber-500" />
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {{ participacion.tiempoPromedioMin }} min
          </span>
          <span class="text-[11px] text-emerald-500 font-semibold">Ágil</span>
        </div>
        <p class="text-[10px] text-slate-400">
          Encuestas cortas de 5 preguntas
        </p>
      </div>

      <!-- Dispositivo Predominante -->
      <div class="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 space-y-1">
        <div class="flex items-center justify-between text-xs text-slate-500">
          <span>Canal Principal</span>
          <Monitor class="w-4 h-4 text-purple-500" />
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {{ participacion.dispositivos.escritorio }}%
          </span>
          <span class="text-[11px] text-purple-500 font-semibold">PC de Escritorio</span>
        </div>
        <p class="text-[10px] text-slate-400">
          {{ participacion.dispositivos.movil }}% Móvil · {{ participacion.dispositivos.tablet }}% Tablet
        </p>
      </div>

    </div>

    <!-- Gráfica de Horas Pico de Respuesta e Impacto en Satisfacción -->
    <div class="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h4 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock class="w-4 h-4 text-sky-500" />
            <span>Volumen de Respuestas por Horario de Turno</span>
          </h4>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Picos de participación vs nivel de satisfacción registrado en cada franja.
          </p>
        </div>
      </div>

      <!-- Histograma de Barras Verticales -->
      <div class="h-44 flex items-end justify-between gap-3 pt-6 px-2 border-b border-slate-200 dark:border-slate-800">
        <div
          v-for="pico in participacion.horariosPico"
          :key="pico.hora"
          class="flex-1 flex flex-col items-center gap-2 group h-full justify-end"
        >
          <!-- Tooltip flotante con detalles -->
          <div class="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 text-white text-[10px] p-1.5 rounded-lg font-mono text-center -mb-1 shadow-lg pointer-events-none z-10">
            <p class="font-bold">{{ pico.volumen }} respuestas</p>
            <p class="text-sky-400">★ {{ pico.satisfaccion }} / 5.0</p>
          </div>

          <!-- Barra Vertical -->
          <div
            :style="{ height: `${(pico.volumen / volumenMaximo) * 100}%` }"
            class="w-full max-w-[40px] rounded-t-xl bg-gradient-to-t from-blue-600 via-sky-500 to-indigo-500 group-hover:from-blue-400 group-hover:to-sky-400 transition-all duration-300 relative shadow-md flex items-start justify-center pt-1"
          >
            <span class="text-[9px] text-white font-mono font-bold hidden sm:inline">
              {{ pico.volumen }}
            </span>
          </div>

          <!-- Etiqueta Horaria -->
          <span class="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            {{ pico.hora }}
          </span>
        </div>
      </div>
    </div>

    <!-- Distribución de Hardware y Navegadores en 2 Columnas -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      
      <!-- Dispositivos -->
      <div class="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 space-y-4">
        <h4 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Monitor class="w-4 h-4 text-sky-500" />
          <span>Ecosistema de Dispositivos</span>
        </h4>

        <div class="space-y-3">
          <!-- Escritorio -->
          <div class="space-y-1">
            <div class="flex items-center justify-between text-xs">
              <span class="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                <Monitor class="w-3.5 h-3.5 text-blue-500" />
                Computador de Escritorio / Puesto
              </span>
              <span class="font-mono font-bold">{{ participacion.dispositivos.escritorio }}%</span>
            </div>
            <div class="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div class="h-full bg-blue-500 rounded-full" :style="{ width: `${participacion.dispositivos.escritorio}%` }"></div>
            </div>
          </div>

          <!-- Móvil -->
          <div class="space-y-1">
            <div class="flex items-center justify-between text-xs">
              <span class="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                <Smartphone class="w-3.5 h-3.5 text-emerald-500" />
                Teléfono Inteligente / Móvil
              </span>
              <span class="font-mono font-bold">{{ participacion.dispositivos.movil }}%</span>
            </div>
            <div class="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div class="h-full bg-emerald-500 rounded-full" :style="{ width: `${participacion.dispositivos.movil}%` }"></div>
            </div>
          </div>

          <!-- Tablet -->
          <div class="space-y-1">
            <div class="flex items-center justify-between text-xs">
              <span class="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                <Tablet class="w-3.5 h-3.5 text-purple-500" />
                Tablet o Dispositivo Portátil
              </span>
              <span class="font-mono font-bold">{{ participacion.dispositivos.tablet }}%</span>
            </div>
            <div class="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div class="h-full bg-purple-500 rounded-full" :style="{ width: `${participacion.dispositivos.tablet}%` }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Navegadores -->
      <div class="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 space-y-4">
        <h4 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Globe2 class="w-4 h-4 text-emerald-500" />
          <span>Navegadores Web</span>
        </h4>

        <div class="space-y-3">
          <div
            v-for="nav in participacion.navegadores"
            :key="nav.nombre"
            class="space-y-1"
          >
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-700 dark:text-slate-300 font-medium">{{ nav.nombre }}</span>
              <span class="font-mono font-bold">{{ nav.porcentaje }}%</span>
            </div>
            <div class="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div class="h-full bg-sky-500 rounded-full" :style="{ width: `${nav.porcentaje}%` }"></div>
            </div>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>
