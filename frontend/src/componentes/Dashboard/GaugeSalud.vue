<!--
  ============================================================================
  COMPONENTE MEDIDOR CIRCULAR 3D DE SALUD Y eNPS (GaugeSalud.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Medidor circular SVG ('radial progress gauge') con halo de resplandor neón 3D,
  degradado continuo en el arco y cálculo automático de perímetro angular según el valor porcentual.
  Indica visualmente si el Clima Laboral es BUENO, REGULAR o MALO.
-->

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    valor: number           // Valor de 0 a 100
    meta?: number           // Meta objetivo (ej. 85)
    titulo?: string         // Título descriptivo (ej. 'Índice de Salud')
    subtitulo?: string      // Subtítulo o detalle
    tamano?: number         // Diámetro en píxeles (default: 160)
    colorPrimario?: string  // Color del arco (ej. '#38bdf8')
    escalaInversa?: boolean // Si es verdadero, valores bajos son mejores (ej. Burnout)
  }>(),
  {
    valor: 84,
    meta: 85,
    titulo: 'Salud Clima',
    subtitulo: 'Promedio Global',
    tamano: 160,
    colorPrimario: '#38bdf8',
    escalaInversa: false
  }
)

/** Valor numérico blindado contra NaN, null y undefined */
const valorSeguro = computed<number>(() => {
  const v = Number(props.valor)
  if (isNaN(v) || v === null || v === undefined) return 0
  return Math.min(100, Math.max(0, Math.round(v)))
})

/** Radio interno del círculo SVG */
const radioCirculo = computed(() => (props.tamano / 2) - 16)

/** Circunferencia total del arco ($2 \pi r$) */
const circunferencia = computed(() => 2 * Math.PI * radioCirculo.value)

/** Desplazamiento del trazo (`stroke-dashoffset`) según el porcentaje */
const desplazamientoTrazo = computed(() => {
  return circunferencia.value - (valorSeguro.value / 100) * circunferencia.value
})

/** Color dinámico evaluado según umbrales de riesgo */
const colorDinamico = computed(() => {
  if (props.colorPrimario && props.colorPrimario !== '#38bdf8') return props.colorPrimario
  const v = valorSeguro.value
  if (props.escalaInversa) {
    if (v <= 20) return '#10b981' // Verde: poco burnout
    if (v <= 40) return '#f59e0b' // Amarillo: moderado
    return '#ef4444'              // Rojo: crítico
  }
  if (v >= 70) return '#10b981'   // Verde: Clima Bueno
  if (v >= 50) return '#f59e0b'   // Amarillo: Clima Regular
  return '#ef4444'                // Rojo: Clima Malo
})

/** Etiqueta clara de diagnóstico: Bueno, Regular o Malo */
const diagnosticoClima = computed(() => {
  const v = valorSeguro.value
  if (v >= 70) {
    return {
      texto: 'CLIMA BUENO',
      clase: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
    }
  }
  if (v >= 50) {
    return {
      texto: 'CLIMA REGULAR',
      clase: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
    }
  }
  return {
    texto: 'CLIMA MALO',
    clase: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
  }
})
</script>

<template>
  <div class="flex flex-col items-center justify-center relative select-none">
    
    <!-- SVG del Medidor Circular con Resplandor Neón -->
    <div class="relative" :style="{ width: `${tamano}px`, height: `${tamano}px` }">
      <svg 
        class="w-full h-full transform -rotate-90"
        :viewBox="`0 0 ${tamano} ${tamano}`"
      >
        <!-- Filtro SVG para resplandor difuso neón -->
        <defs>
          <filter id="gauge-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <!-- Arco de Fondo (Track gris oscuro translúcido) -->
        <circle
          :cx="tamano / 2"
          :cy="tamano / 2"
          :r="radioCirculo"
          stroke="currentColor"
          stroke-width="10"
          fill="transparent"
          class="text-slate-200 dark:text-slate-800"
        />

        <!-- Arco Dinámico de Progreso -->
        <circle
          :cx="tamano / 2"
          :cy="tamano / 2"
          :r="radioCirculo"
          :stroke="colorDinamico"
          stroke-width="10"
          stroke-linecap="round"
          fill="transparent"
          :stroke-dasharray="circunferencia"
          :stroke-dashoffset="desplazamientoTrazo"
          class="transition-all duration-1000 ease-out"
          filter="url(#gauge-glow)"
        />
      </svg>

      <!-- Contenido Central: Valor Numérico y Estado -->
      <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span class="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
          {{ valorSeguro }}%
        </span>
        <span v-if="meta" class="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
          Meta: {{ meta }}%
        </span>
      </div>
    </div>

    <!-- Insignia de Clasificación (Clima Bueno / Regular / Malo) -->
    <div class="mt-2">
      <span
        class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border inline-block"
        :class="diagnosticoClima.clase"
      >
        {{ diagnosticoClima.texto }}
      </span>
    </div>

    <!-- Título y Subtítulo Inferior -->
    <div v-if="titulo" class="mt-1.5 text-center space-y-0.5">
      <p class="text-xs font-bold text-slate-900 dark:text-white">{{ titulo }}</p>
      <p v-if="subtitulo" class="text-[10px] text-slate-500 dark:text-slate-400">{{ subtitulo }}</p>
    </div>

  </div>
</template>
