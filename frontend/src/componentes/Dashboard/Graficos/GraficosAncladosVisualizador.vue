<!--
  ============================================================================
  VISUALIZADOR EXCLUSIVO DE GRÁFICOS ANCLADOS (Barras Verticales y Pastel)
  ============================================================================
-->
<script setup lang="ts">
import { computed, ref } from 'vue'
import type { SegmentoGrafico } from '@/services/adaptadorRespuestasGraficos'

const props = defineProps<{
  tipoGrafico: 'barras' | 'pastel'
  segmentos: SegmentoGrafico[]
  totalMuestras: number
}>()

const segmentoActivoHover = ref<SegmentoGrafico | null>(null)

// Suma real de votos en los segmentos para garantizar un círculo 360° perfecto sin huecos
const sumaVotosSegmentos = computed(() => {
  return (props.segmentos || []).reduce((acc, s) => acc + (s.valor || 0), 0)
})

const muestrasEfectivas = computed(() => {
  return sumaVotosSegmentos.value > 0 ? sumaVotosSegmentos.value : props.totalMuestras
})

// Cálculo de sectores SVG para el gráfico de pastel (garantiza 100% del círculo cuando hay votos)
interface SectorSVG {
  path: string
  color: string
  porcentaje: number
  etiqueta: string
  valor: number
}

const sectoresPastel = computed<SectorSVG[]>(() => {
  const denominador = sumaVotosSegmentos.value
  if (!props.segmentos || props.segmentos.length === 0 || denominador === 0) {
    return []
  }

  const cx = 80
  const cy = 80
  const radio = 60
  let anguloAcumulado = 0

  return props.segmentos
    .filter(seg => seg.valor > 0)
    .map(seg => {
      const fraccion = seg.valor / denominador
      const angulo = fraccion * 360

      const radInicio = ((anguloAcumulado - 90) * Math.PI) / 180
      const radFin = ((anguloAcumulado + angulo - 90) * Math.PI) / 180

      const x1 = cx + radio * Math.cos(radInicio)
      const y1 = cy + radio * Math.sin(radInicio)
      const x2 = cx + radio * Math.cos(radFin)
      const y2 = cy + radio * Math.sin(radFin)

      const arcoGrande = angulo > 180 ? 1 : 0
      let path = ''
      if (angulo >= 359.9) {
        path = `M ${cx} ${cy - radio} A ${radio} ${radio} 0 1 1 ${cx - 0.01} ${cy - radio} Z`
      } else {
        path = `M ${cx} ${cy} L ${x1} ${y1} A ${radio} ${radio} 0 ${arcoGrande} 1 ${x2} ${y2} Z`
      }

      anguloAcumulado += angulo

      return {
        path,
        color: seg.color,
        porcentaje: Math.round(fraccion * 100),
        etiqueta: seg.etiqueta,
        valor: seg.valor
      }
    })
})

// Escala del eje Y para el gráfico de barras verticales (estilo cartesiano con líneas guía)
const maxValorEjeY = computed(() => {
  const maxSeg = Math.max(0, ...(props.segmentos || []).map(s => s.valor || 0))
  return Math.max(5, Math.ceil(maxSeg))
})

const marcasEjeY = computed<number[]>(() => {
  const max = maxValorEjeY.value
  const paso = max <= 6 ? 1 : Math.ceil(max / 5)
  const marcas: number[] = []
  const tope = Math.ceil(max / paso) * paso
  for (let v = tope; v >= 0; v -= paso) {
    marcas.push(v)
  }
  return marcas
})

const topeRealEjeY = computed(() => {
  return marcasEjeY.value[0] || 5
})

const calcularAlturaColumnaPct = (valor: number): number => {
  if (valor <= 0 || topeRealEjeY.value <= 0) return 0
  return Math.min(100, Math.max(4, (valor / topeRealEjeY.value) * 100))
}
</script>

<template>
  <div class="py-2">
    <!-- 1. CASO PASTEL (Gráfico Circular SVG) -->
    <div v-if="tipoGrafico === 'pastel'" class="flex flex-col sm:flex-row items-center justify-center gap-6">
      <!-- Rueda de Pastel -->
      <div class="relative w-40 h-40 shrink-0">
        <svg viewBox="0 0 160 160" class="w-full h-full drop-shadow-md">
          <g v-if="sectoresPastel.length > 0">
            <path
              v-for="(sec, idx) in sectoresPastel"
              :key="idx"
              :d="sec.path"
              :fill="sec.color"
              class="transition-all duration-300 hover:opacity-85 cursor-pointer stroke-white dark:stroke-slate-900 stroke-1"
              @mouseenter="segmentoActivoHover = sec"
              @mouseleave="segmentoActivoHover = null"
            />
            <!-- Centro hueco estilo donut moderno -->
            <circle cx="80" cy="80" r="32" class="fill-white dark:fill-slate-900" />
          </g>
          <circle v-else cx="80" cy="80" r="60" fill="none" stroke="currentColor" class="text-slate-200 dark:text-slate-800" stroke-width="20" />
        </svg>

        <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span class="text-sm font-black font-mono text-slate-900 dark:text-white">
            {{ segmentoActivoHover ? `${segmentoActivoHover.porcentaje}%` : muestrasEfectivas }}
          </span>
          <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
            {{ segmentoActivoHover ? 'Voto' : 'Muestras' }}
          </span>
        </div>
      </div>

      <!-- Leyenda interactiva -->
      <div class="flex-1 space-y-2 w-full max-w-xs">
        <div
          v-for="seg in segmentos"
          :key="seg.etiqueta"
          class="flex items-center justify-between text-xs p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        >
          <div class="flex items-center gap-2 truncate">
            <span class="w-3 h-3 rounded-md shrink-0" :style="{ backgroundColor: seg.color }"></span>
            <span class="truncate text-slate-700 dark:text-slate-300 font-medium">{{ seg.etiqueta }}</span>
          </div>
          <span class="font-mono font-bold text-slate-900 dark:text-white ml-2 shrink-0">
            {{ seg.porcentaje }}% <span class="text-[10px] text-slate-400 font-normal">({{ seg.valor }})</span>
          </span>
        </div>
      </div>
    </div>

    <!-- 2. CASO BARRAS VERTICALES CON EJE Y Y LÍNEAS DE CUADRÍCULA -->
    <div v-else class="space-y-3 pt-2">
      <div class="p-3 sm:p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
        <!-- Área del Gráfico Cartesiano -->
        <div class="flex items-stretch h-48 sm:h-52 gap-2">
          <!-- Eje Y (Números verticales 0, 1, 2, 3, 4, 5...) -->
          <div class="flex flex-col justify-between items-end pr-1.5 text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 select-none py-0.5">
            <span v-for="marca in marcasEjeY" :key="marca" class="leading-none">
              {{ marca }}
            </span>
          </div>

          <!-- Lienzo con líneas horizontales y columnas verticales -->
          <div class="relative flex-1 border-l-2 border-b-2 border-slate-400 dark:border-slate-600 flex items-end justify-around px-2 sm:px-4 gap-2 sm:gap-4">
            <!-- Líneas horizontales de referencia (Gridlines) -->
            <div class="absolute inset-0 flex flex-col justify-between pointer-events-none">
              <div
                v-for="marca in marcasEjeY"
                :key="'grid-' + marca"
                class="w-full border-t border-slate-300/80 dark:border-slate-800"
              />
            </div>

            <!-- Columnas Verticales por Opción -->
            <div
              v-for="(seg, idx) in segmentos"
              :key="seg.etiqueta || idx"
              class="relative z-10 flex-1 h-full flex flex-col items-center justify-end group max-w-[72px]"
            >
              <!-- Etiqueta flotante con conteo y % sobre la barra -->
              <span
                class="text-[10px] font-mono font-extrabold mb-1 px-1.5 py-0.5 rounded-md transition-all"
                :class="seg.valor > 0
                  ? 'text-slate-900 dark:text-white bg-white/90 dark:bg-slate-900/90 shadow-2xs border border-slate-200 dark:border-slate-700'
                  : 'text-slate-400 dark:text-slate-600'"
              >
                {{ seg.valor }} <span class="text-[9px] opacity-80">({{ seg.porcentaje }}%)</span>
              </span>

              <!-- Columna vertical coloreada -->
              <div
                class="w-full max-w-[46px] rounded-t-lg transition-all duration-700 ease-out shadow-sm group-hover:brightness-110"
                :style="{
                  height: `${calcularAlturaColumnaPct(seg.valor)}%`,
                  backgroundColor: seg.color,
                  minHeight: seg.valor > 0 ? '8px' : '2px',
                  opacity: seg.valor > 0 ? 1 : 0.25
                }"
                :title="`${seg.etiqueta}: ${seg.valor} votos (${seg.porcentaje}%)`"
              />
            </div>
          </div>
        </div>

        <!-- Etiquetas del Eje X debajo de cada columna -->
        <div class="flex items-start gap-2 pl-7 pr-2 sm:pr-4 pt-2">
          <div
            v-for="(seg, idx) in segmentos"
            :key="'label-' + (seg.etiqueta || idx)"
            class="flex-1 text-center min-w-0 px-0.5"
          >
            <div class="flex items-center justify-center gap-1">
              <span class="w-2 h-2 rounded-full shrink-0" :style="{ backgroundColor: seg.color }" />
              <span
                class="text-[10px] sm:text-[11px] font-bold text-slate-700 dark:text-slate-300 line-clamp-2 leading-tight break-words"
                :title="seg.etiqueta"
              >
                {{ seg.etiqueta }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
