<!--
  ============================================================================
  PORCENTAJE DE CLIMA LABORAL (ClimaLaboralPorcentaje.vue)
  ============================================================================
  FÓRMULA MATEMÁTICA INTACTA:
  - Escala base: 1.0 a 5.0
  - Porcentaje de Clima = Math.round((puntajePromedio / 5) * 100)
  - Nivel de Satisfacción:
      >= 80% (>= 4.0): 'Óptimo' (Verde Esmeralda)
      >= 65% (>= 3.25): 'Favorable' (Azul Cielo)
      >= 50% (>= 2.5): 'Neutral' (Ámbar)
      < 50% (< 2.5): 'Atención / Crítico' (Rojo Rosado)
-->

<script setup lang="ts">
import { computed } from 'vue'
import { Activity, ShieldCheck, AlertTriangle } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    puntajePromedio?: number
    porcentajeDirecto?: number
    totalEvaluados?: number
    metaObjetivo?: number
  }>(),
  {
    puntajePromedio: 4.2,
    totalEvaluados: 0,
    metaObjetivo: 85
  }
)

/**
 * Fórmula exacta de conversión a porcentaje de clima laboral
 */
const porcentajeClima = computed<number>(() => {
  if (typeof props.porcentajeDirecto === 'number' && props.porcentajeDirecto > 0) {
    return Math.min(100, Math.max(0, Math.round(props.porcentajeDirecto)))
  }
  const prom = typeof props.puntajePromedio === 'number' ? props.puntajePromedio : 0
  return Math.min(100, Math.max(0, Math.round((prom / 5) * 100)))
})

const puntajeSobre5 = computed<string>(() => {
  if (typeof props.puntajePromedio === 'number' && props.puntajePromedio > 0) {
    return props.puntajePromedio.toFixed(1)
  }
  return ((porcentajeClima.value / 100) * 5).toFixed(1)
})

const clasificacionClima = computed(() => {
  const p = porcentajeClima.value
  if (p >= 80) {
    return {
      etiqueta: 'Clima Saludable / Óptimo',
      nivel: 'Excelente',
      colorHex: '#10b981',
      badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
      icono: ShieldCheck,
      descripcion: 'Ambiente armónico, alta confianza y baja fricción psicosocial.'
    }
  } else if (p >= 65) {
    return {
      etiqueta: 'Clima Favorable',
      nivel: 'Bueno',
      colorHex: '#0ea5e9',
      badgeClass: 'bg-sky-100 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300 border-sky-300 dark:border-sky-800',
      icono: ShieldCheck,
      descripcion: 'Indicadores estables con oportunidades puntuales de mejora.'
    }
  } else if (p >= 50) {
    return {
      etiqueta: 'Clima Neutro / Precaución',
      nivel: 'Regular',
      colorHex: '#f59e0b',
      badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800',
      icono: AlertTriangle,
      descripcion: 'Señales de fatiga o desconexión en algunas áreas de trabajo.'
    }
  } else {
    return {
      etiqueta: 'Clima en Riesgo / Crítico',
      nivel: 'Crítico',
      colorHex: '#f43f5e',
      badgeClass: 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-900',
      icono: AlertTriangle,
      descripcion: 'Requiere intervención inmediata de Talento Humano y revisión de liderazgos.'
    }
  }
})

// Ángulo para aguja o arco del velocímetro (0% = -90deg, 100% = 90deg)
const anguloAguja = computed(() => {
  const p = Math.min(100, Math.max(0, porcentajeClima.value))
  return -90 + (p / 100) * 180
})
</script>

<template>
  <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5 text-left">
    <!-- Encabezado -->
    <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 flex-wrap gap-2">
      <div class="flex items-center gap-2.5">
        <div class="w-9 h-9 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
          <Activity class="w-5 h-5" />
        </div>
        <div>
          <h3 class="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>Índice General de Clima Laboral</span>
            <span :class="['px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border', clasificacionClima.badgeClass]">
              {{ clasificacionClima.nivel }}
            </span>
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Fórmula estándar institucional: Puntuación media normalizada sobre escala 100%.
          </p>
        </div>
      </div>

      <div v-if="totalEvaluados > 0" class="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
        {{ totalEvaluados }} colaboradores evaluados
      </div>
    </div>

    <!-- Medidor Semafórico / Gauge Central -->
    <div class="flex flex-col sm:flex-row items-center justify-center gap-8 py-2">
      <!-- Arco SVG del Velocímetro -->
      <div class="relative w-44 h-24 flex items-end justify-center overflow-hidden">
        <svg viewBox="0 0 180 100" class="w-44 h-24">
          <!-- Fondo del arco -->
          <path
            d="M 20 90 A 70 70 0 0 1 160 90"
            fill="none"
            stroke="currentColor"
            class="text-slate-200 dark:text-slate-800"
            stroke-width="16"
            stroke-linecap="round"
          />
          <!-- Arco de progreso dinámico -->
          <path
            d="M 20 90 A 70 70 0 0 1 160 90"
            fill="none"
            :stroke="clasificacionClima.colorHex"
            stroke-width="16"
            stroke-linecap="round"
            stroke-dasharray="220"
            :stroke-dashoffset="220 * (1 - porcentajeClima / 100)"
            class="transition-all duration-1000 ease-out"
          />
        </svg>

        <!-- Aguja de precisión -->
        <div
          class="absolute bottom-0 w-1.5 h-16 bg-slate-800 dark:bg-white rounded-full origin-bottom transition-transform duration-1000 ease-out shadow-md"
          :style="{ transform: `rotate(${anguloAguja}deg)` }"
        ></div>
        <div class="absolute bottom-0 w-4 h-4 bg-slate-900 dark:bg-white rounded-full shadow-lg"></div>
      </div>

      <!-- Métricas numéricas -->
      <div class="space-y-2 text-center sm:text-left">
        <div class="flex items-baseline justify-center sm:justify-start gap-2">
          <span class="text-4xl sm:text-5xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
            {{ porcentajeClima }}%
          </span>
          <span class="text-xs font-bold text-slate-500 font-mono">
            ({{ puntajeSobre5 }} / 5.0)
          </span>
        </div>

        <p class="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center sm:justify-start gap-1.5">
          <component :is="clasificacionClima.icono" class="w-4 h-4" :style="{ color: clasificacionClima.colorHex }" />
          <span>{{ clasificacionClima.etiqueta }}</span>
        </p>

        <p class="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
          {{ clasificacionClima.descripcion }}
        </p>

        <div class="flex items-center gap-2 pt-1 text-[11px] font-mono text-slate-400">
          <span>Meta: {{ metaObjetivo }}%</span>
          <span>•</span>
          <span :class="porcentajeClima >= metaObjetivo ? 'text-emerald-500 font-bold' : 'text-amber-500'">
            {{ porcentajeClima >= metaObjetivo ? '✓ Meta superada' : `A ${metaObjetivo - porcentajeClima}% de la meta` }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
