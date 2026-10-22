<!--
  ============================================================================
  GRÁFICO DE BARRAS DE OPCIONES / ESTUDIOS COMPACTO (EstudiosGraficoBarras.vue)
  ============================================================================
  PROPÓSITO:
  Renderiza la gráfica de barras distribuidas en un grid de 2 columnas para 
  ahorrar espacio vertical de forma eficiente y elegante.
-->

<script setup lang="ts">
import { computed } from 'vue'

export interface ItemEstudioPrograma {
  programa: string
  cantidad: number
  porcentaje: number
  habilidades: string[]
  usoRecomendado: string
  color: string
}

const props = defineProps<{
  listaEstudios: ItemEstudioPrograma[]
  departamentoSeleccionado: string
  totalPersonas: number
  tituloPregunta?: string
}>()

const maxValorEjeY = computed(() => {
  const maxItem = Math.max(0, ...(props.listaEstudios || []).map(i => i.cantidad || 0))
  return Math.max(5, Math.ceil(maxItem))
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

const topeRealEjeY = computed(() => marcasEjeY.value[0] || 5)

const calcularAlturaColumnaPct = (cantidad: number): number => {
  if (cantidad <= 0 || topeRealEjeY.value <= 0) return 0
  return Math.min(100, Math.max(5, (cantidad / topeRealEjeY.value) * 100))
}
</script>

<template>
  <div class="p-4 sm:p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 backdrop-blur-xl shadow-lg space-y-5 font-['Poppins',sans-serif] text-left">
    <!-- Gráfico de Barras Verticales con Eje Y y Líneas de Cuadrícula -->
    <div class="p-3 sm:p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
      <div class="flex items-stretch h-48 sm:h-56 gap-2">
        <!-- Eje Y (0, 1, 2, 3, 4, 5...) -->
        <div class="flex flex-col justify-between items-end pr-1.5 text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 select-none py-0.5">
          <span v-for="marca in marcasEjeY" :key="marca" class="leading-none">
            {{ marca }}
          </span>
        </div>

        <!-- Lienzo con líneas horizontales y columnas verticales -->
        <div class="relative flex-1 border-l-2 border-b-2 border-slate-400 dark:border-slate-600 flex items-end justify-around px-2 sm:px-4 gap-2 sm:gap-4">
          <div class="absolute inset-0 flex flex-col justify-between pointer-events-none">
            <div
              v-for="marca in marcasEjeY"
              :key="'grid-est-' + marca"
              class="w-full border-t border-slate-300/80 dark:border-slate-800"
            />
          </div>

          <div
            v-for="item in listaEstudios"
            :key="item.programa"
            class="relative z-10 flex-1 h-full flex flex-col items-center justify-end group max-w-[76px]"
          >
            <span
              class="text-[10px] font-mono font-extrabold mb-1 px-1.5 py-0.5 rounded-md transition-all"
              :class="item.cantidad > 0
                ? 'text-slate-900 dark:text-white bg-white/90 dark:bg-slate-900/90 shadow-2xs border border-slate-200 dark:border-slate-700'
                : 'text-slate-400 dark:text-slate-600'"
            >
              {{ item.cantidad }} <span class="text-[9px] opacity-80">({{ item.porcentaje }}%)</span>
            </span>

            <div
              class="w-full max-w-[48px] rounded-t-lg transition-all duration-700 ease-out shadow-sm group-hover:brightness-110"
              :style="{
                height: `${calcularAlturaColumnaPct(item.cantidad)}%`,
                backgroundColor: item.color,
                minHeight: item.cantidad > 0 ? '8px' : '2px',
                opacity: item.cantidad > 0 ? 1 : 0.25
              }"
              :title="`${item.programa}: ${item.cantidad} colaboradores (${item.porcentaje}%)`"
            />
          </div>
        </div>
      </div>

      <!-- Etiquetas Eje X -->
      <div class="flex items-start gap-2 pl-7 pr-2 sm:pr-4 pt-2">
        <div
          v-for="item in listaEstudios"
          :key="'lbl-est-' + item.programa"
          class="flex-1 text-center min-w-0 px-0.5"
        >
          <div class="flex items-center justify-center gap-1">
            <span class="w-2 h-2 rounded-full shrink-0" :style="{ backgroundColor: item.color }" />
            <span class="text-[10px] sm:text-[11px] font-bold text-slate-700 dark:text-slate-300 line-clamp-2 leading-tight break-words">
              {{ item.programa }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
