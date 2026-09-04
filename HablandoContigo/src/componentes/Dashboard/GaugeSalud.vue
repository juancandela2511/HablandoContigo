<!--
  ============================================================================
  COMPONENTE MEDIDOR CIRCULAR 3D DE SALUD Y eNPS (GaugeSalud.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Medidor circular SVG ('radial progress gauge') con halo de resplandor neón 3D,
  degradado continuo en el arco y cálculo automático de perímetro angular según el valor porcentual.
  
  ¿PARA QUÉ SIRVE?
  - Representar métricas clave como eNPS (+46), Índice de Salud Global (84/100) y Riesgo de Burnout.
  - Generar impacto visual inmediato en el panel de control ejecutivo.
  
  ¿CON QUÉ ESTÁ VINCULADO / CONECTADO?
  - DashboardView.vue: Tarjeta KPI principal de salud eNPS.
  - SimuladorImpactoClima.vue: Medidor que reacciona a los sliders de simulación.
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

/** Radio interno del círculo SVG */
const radioCirculo = computed(() => (props.tamano / 2) - 16)

/** Circunferencia total del arco ($2 \pi r$) */
const circunferencia = computed(() => 2 * Math.PI * radioCirculo.value)

/** Desplazamiento del trazo (`stroke-dashoffset`) según el porcentaje */
const desplazamientoTrazo = computed(() => {
  const porcentajeSeguro = Math.min(100, Math.max(0, props.valor))
  return circunferencia.value - (porcentajeSeguro / 100) * circunferencia.value
})

/** Color dinámico evaluado según umbrales de riesgo */
const colorDinamico = computed(() => {
  if (props.colorPrimario && props.colorPrimario !== '#38bdf8') return props.colorPrimario
  if (props.escalaInversa) {
    if (props.valor <= 20) return '#10b981' // Verde: poco burnout
    if (props.valor <= 40) return '#f59e0b' // Amarillo: moderado
    return '#ef4444'                        // Rojo: crítico
  }
  if (props.valor >= 80) return '#10b981'   // Verde: óptimo
  if (props.valor >= 70) return '#38bdf8'   // Azul: bueno
  if (props.valor >= 60) return '#f59e0b'   // Amarillo: alerta
  return '#ef4444'                          // Rojo: crítico
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
          {{ valor }}%
        </span>
        <span v-if="meta" class="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
          Meta: {{ meta }}%
        </span>
      </div>
    </div>

    <!-- Título y Subtítulo Inferior -->
    <div v-if="titulo" class="mt-2 text-center space-y-0.5">
      <p class="text-xs font-bold text-slate-900 dark:text-white">{{ titulo }}</p>
      <p v-if="subtitulo" class="text-[10px] text-slate-500 dark:text-slate-400">{{ subtitulo }}</p>
    </div>

  </div>
</template>
