<!--
  ============================================================================
  COMPONENTE GRÁFICO RADIAL DE 6 DIMENSIONES ESTRATÉGICAS (GraficoRadial.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Renderiza un gráfico de radar / telaraña SVG vectorial 100% nativo con 6 ejes:
  1. Liderazgo & Empatía
  2. Prevención de Acoso
  3. Balance de Carga & Salud
  4. Seguridad Psicológica
  5. Herramientas & Soporte
  6. Reconocimiento & Pertenencia
  
  ¿PARA QUÉ SIRVE?
  - Visualizar el equilibrio o desbalance holístico del clima laboral.
  - Trazar el polígono de datos actual contra el polígono de meta de referencia corporativa.
  
  ¿CON QUÉ ESTÁ VINCULADO / CONECTADO?
  - DashboardView.vue: Pestaña 1 "Visión Global".
  - useEstadisticas.ts: Provee `dimensionesFiltradas` y `datosEstadisticas.metaGlobalRadial`.
-->

<script setup lang="ts">
import { computed } from 'vue'
import type { DimensionRadial } from '@/Almacenes/useEstadisticas'
import { Sliders, Lock } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    dimensiones: DimensionRadial[]
    metaGlobal?: number
    mostrarBotonConfig?: boolean
  }>(),
  {
    metaGlobal: 85,
    mostrarBotonConfig: true
  }
)

defineEmits<{
  (e: 'abrirConfiguracion'): void
}>()

/** Dimensiones espaciales del lienzo SVG */
const anchoLienzo = 340
const altoLienzo = 340
const puntoCentro = anchoLienzo / 2
const radioMaximo = 115

/**
 * Calcula los vértices del polígono radial según el valor de cada dimensión (0 a 100)
 */
const puntosPoligonoDatos = computed(() => {
  if (!props.dimensiones || props.dimensiones.length === 0) return ''
  const totalEjes = props.dimensiones.length
  
  return props.dimensiones.map((dim, indice) => {
    const angulo = (Math.PI * 2 / totalEjes) * indice - Math.PI / 2
    const distancia = (Math.min(Math.max(dim.valor, 0), 100) / 100) * radioMaximo
    const x = puntoCentro + distancia * Math.cos(angulo)
    const y = puntoCentro + distancia * Math.sin(angulo)
    return `${x},${y}`
  }).join(' ')
})

/**
 * Vértices para el polígono de meta de referencia configurable
 */
const puntosPoligonoMeta = computed(() => {
  const totalEjes = props.dimensiones?.length || 6
  const factorMeta = (props.metaGlobal || 85) / 100
  
  return Array.from({ length: totalEjes }).map((_, indice) => {
    const angulo = (Math.PI * 2 / totalEjes) * indice - Math.PI / 2
    const distancia = factorMeta * radioMaximo
    const x = puntoCentro + distancia * Math.cos(angulo)
    const y = puntoCentro + distancia * Math.sin(angulo)
    return `${x},${y}`
  }).join(' ')
})

/**
 * Coordenadas espaciales para las líneas guía y etiquetas de cada dimensión
 */
const posicionesEjesCalculadas = computed(() => {
  const totalEjes = props.dimensiones?.length || 6
  
  return (props.dimensiones || []).map((dim, indice) => {
    const angulo = (Math.PI * 2 / totalEjes) * indice - Math.PI / 2
    const lineaX = puntoCentro + radioMaximo * Math.cos(angulo)
    const lineaY = puntoCentro + radioMaximo * Math.sin(angulo)
    const etiquetaX = puntoCentro + (radioMaximo + 26) * Math.cos(angulo)
    const etiquetaY = puntoCentro + (radioMaximo + 16) * Math.sin(angulo)
    
    // Posición del nodo de dato
    const distanciaDato = (Math.min(Math.max(dim.valor, 0), 100) / 100) * radioMaximo
    const datoX = puntoCentro + distanciaDato * Math.cos(angulo)
    const datoY = puntoCentro + distanciaDato * Math.sin(angulo)

    return {
      dim,
      lineaX,
      lineaY,
      etiquetaX,
      etiquetaY,
      datoX,
      datoY
    }
  })
})
</script>

<template>
  <div 
    @dblclick="$emit('abrirConfiguracion')"
    class="flex flex-col items-center justify-center relative select-none w-full cursor-pointer group"
    title="Doble clic para desbloquear y configurar dimensiones e inclinaciones del radar"
  >
    <!-- Botón de Configuración Rápida de Dimensiones -->
    <div v-if="mostrarBotonConfig" class="w-full flex justify-end pb-1">
      <button
        type="button"
        @click="$emit('abrirConfiguracion')"
        title="Doble clic o clic para editar o eliminar dimensiones e inclinaciones"
        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-slate-800 hover:bg-sky-100 dark:hover:bg-slate-700 text-sky-700 dark:text-sky-300 text-[11px] font-semibold transition-all cursor-pointer border border-sky-200 dark:border-slate-700 shadow-sm"
      >
        <Sliders class="w-3 h-3 text-sky-500" />
        <span>Configurar Ejes ({{ dimensiones.length }}) · Doble clic</span>
      </button>
    </div>

    <svg :viewBox="`0 0 ${anchoLienzo} ${altoLienzo}`" class="w-full max-w-[320px] h-auto overflow-visible">
      <!-- Anillos concéntricos de referencia sólidos (20%, 40%, 60%, 80%, 100%) -->
      <polygon
        v-for="nivel in [0.2, 0.4, 0.6, 0.8, 1.0]"
        :key="nivel"
        :points="Array.from({ length: dimensiones?.length || 6 }).map((_, i) => {
          const ang = (Math.PI * 2 / (dimensiones?.length || 6)) * i - Math.PI / 2
          const d = nivel * radioMaximo
          return `${puntoCentro + d * Math.cos(ang)},${puntoCentro + d * Math.sin(ang)}`
        }).join(' ')"
        fill="none"
        stroke="currentColor"
        class="text-slate-200 dark:text-slate-800/80"
        stroke-width="1"
        stroke-dasharray="2,2"
      />

      <!-- Radios / Ejes principales -->
      <line
        v-for="(eje, idx) in posicionesEjesCalculadas"
        :key="'line-' + idx"
        :x1="puntoCentro"
        :y1="puntoCentro"
        :x2="eje.lineaX"
        :y2="eje.lineaY"
        stroke="currentColor"
        class="text-slate-200 dark:text-slate-800"
        stroke-width="1.2"
      />

      <!-- Polígono de Meta de Referencia Corporativa -->
      <polygon
        :points="puntosPoligonoMeta"
        fill="none"
        stroke="#64748b"
        stroke-width="1.2"
        stroke-dasharray="4,4"
        opacity="0.75"
      />

      <!-- Polígono de Datos del Clima Laboral (Color Sólido Ejecutivo) -->
      <polygon
        :points="puntosPoligonoDatos"
        fill="#2563eb"
        fill-opacity="0.22"
        stroke="#2563eb"
        stroke-width="2"
        class="transition-all duration-300 ease-out"
      />

      <!-- Nodos en los vértices del polígono -->
      <g v-for="(eje, idx) in posicionesEjesCalculadas" :key="'dot-' + idx">
        <circle
          :cx="eje.datoX"
          :cy="eje.datoY"
          r="4.5"
          fill="#2563eb"
          stroke="#ffffff"
          stroke-width="1.5"
          class="transition-all duration-300 hover:scale-125"
        />
        <!-- Etiqueta de Porcentaje -->
        <text
          :x="eje.datoX"
          :y="eje.datoY - 7"
          text-anchor="middle"
          class="text-[10px] font-bold fill-blue-700 dark:fill-sky-300 font-mono"
        >
          {{ eje.dim.valor }}%
        </text>
      </g>

      <!-- Etiquetas de cada Dimensión -->
      <g v-for="(eje, idx) in posicionesEjesCalculadas" :key="'label-' + idx">
        <text
          :x="eje.etiquetaX"
          :y="eje.etiquetaY"
          text-anchor="middle"
          dominant-baseline="central"
          class="text-[10px] font-medium fill-slate-700 dark:fill-slate-300"
        >
          {{ eje.dim.eje }}
        </text>
      </g>
    </svg>

    <!-- Leyenda Inferior Sólida -->
    <div class="flex flex-wrap items-center justify-center gap-4 text-[11px] pt-2">
      <span class="flex items-center gap-1.5 text-blue-700 dark:text-sky-400 font-semibold">
        <span class="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
        Salud Actual
      </span>
      <span class="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
        <span class="w-3 h-0.5 bg-slate-500"></span>
        Meta ({{ metaGlobal || 85 }}%)
      </span>
    </div>

  </div>
</template>
