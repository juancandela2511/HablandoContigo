<!--
  ============================================================================
  COMPONENTE GRÁFICO CIRCULAR / DONA SVG INTERACTIVO (GraficoDonaCircular.vue)
  ============================================================================
-->

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { DatoSegmentoGrafico } from '@/Almacenes/useGraficosAnclados'

const props = withDefaults(
  defineProps<{
    segmentos: DatoSegmentoGrafico[]
    totalMuestras?: number
    subtituloCentro?: string
    tamano?: number
    grosor?: number
  }>(),
  {
    totalMuestras: 0,
    subtituloCentro: 'Total Respuestas',
    tamano: 180,
    grosor: 26
  }
)

const segmentoHover = ref<DatoSegmentoGrafico | null>(null)

const radio = computed(() => (props.tamano - props.grosor) / 2)
const perimetro = computed(() => 2 * Math.PI * radio.value)

// Calcular trazo (dasharray y dashoffset) para cada segmento
const arcosCalculados = computed(() => {
  let acumuladoPorc = 0
  return props.segmentos.map(seg => {
    const longitud = (seg.porcentaje / 100) * perimetro.value
    const offset = perimetro.value - (acumuladoPorc / 100) * perimetro.value
    acumuladoPorc += seg.porcentaje

    return {
      ...seg,
      dasharray: `${longitud} ${perimetro.value - longitud}`,
      dashoffset: -offset
    }
  })
})
</script>

<template>
  <div class="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
    <!-- SVG Circular -->
    <div class="relative shrink-0 flex items-center justify-center">
      <svg
        :width="tamano"
        :height="tamano"
        class="transform -rotate-90 drop-shadow-sm transition-all duration-300"
      >
        <!-- Círculo de fondo base -->
        <circle
          :cx="tamano / 2"
          :cy="tamano / 2"
          :r="radio"
          class="stroke-slate-100 dark:stroke-slate-800 fill-none"
          :stroke-width="grosor"
        />

        <!-- Segmentos SVG coloreados con hover interactivo -->
        <circle
          v-for="arco in arcosCalculados"
          :key="arco.etiqueta"
          :cx="tamano / 2"
          :cy="tamano / 2"
          :r="radio"
          class="fill-none transition-all duration-500 cursor-pointer"
          :stroke="arco.color"
          :stroke-width="segmentoHover?.etiqueta === arco.etiqueta ? grosor + 4 : grosor"
          :stroke-dasharray="arco.dasharray"
          :stroke-dashoffset="arco.dashoffset"
          stroke-linecap="round"
          @mouseenter="segmentoHover = arco"
          @mouseleave="segmentoHover = null"
        />
      </svg>

      <!-- Centro de la Dona (Texto y métrica activa) -->
      <div class="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
        <span class="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white leading-tight">
          {{ segmentoHover ? `${segmentoHover.porcentaje}%` : totalMuestras }}
        </span>
        <span class="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-tight max-w-[90px] truncate">
          {{ segmentoHover ? segmentoHover.etiqueta : subtituloCentro }}
        </span>
      </div>
    </div>

    <!-- Leyendas dinámicas a la derecha -->
    <div class="space-y-2 flex-1 w-full text-left">
      <div
        v-for="seg in segmentos"
        :key="seg.etiqueta"
        @mouseenter="segmentoHover = seg"
        @mouseleave="segmentoHover = null"
        :class="[
          'p-2 rounded-xl transition-all flex items-center justify-between gap-3 text-xs cursor-pointer',
          segmentoHover?.etiqueta === seg.etiqueta
            ? 'bg-slate-100 dark:bg-slate-800 scale-[1.02] shadow-xs'
            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
        ]"
      >
        <div class="flex items-center gap-2.5 min-w-0">
          <span
            class="w-3 h-3 rounded-full shrink-0 shadow-xs"
            :style="{ backgroundColor: seg.color }"
          />
          <span class="font-medium text-slate-800 dark:text-slate-200 truncate">
            {{ seg.etiqueta }}
          </span>
        </div>

        <div class="flex items-center gap-2 shrink-0 font-mono">
          <span class="text-slate-500 text-[11px]">{{ seg.valor }}</span>
          <span class="font-black text-slate-900 dark:text-white text-xs px-1.5 py-0.5 rounded-md bg-slate-200/60 dark:bg-slate-800">
            {{ seg.porcentaje }}%
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
