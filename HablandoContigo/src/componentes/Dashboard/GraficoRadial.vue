<!--
  ============================================================================
  COMPONENTE GRÁFICO RADIAL DE 6 DIMENSIONES ESTRATÉGICAS (GraficoRadial.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Renderiza un gráfico de radar / telaraña SVG vectorial 100% nativo:
  - Soporta anclaje de Bloques de Encuesta a cada esquina/eje del radar.
  - Formateo inteligente multi-línea y alineación SVG según cuadrante angular.
-->

<script setup lang="ts">
import { computed } from 'vue'
import type { DimensionRadial } from '@/Almacenes/useEstadisticas'
import { Sliders } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    dimensiones: DimensionRadial[]
    metaGlobal?: number
    mostrarBotonConfig?: boolean
    anguloInclinacion?: number
  }>(),
  {
    metaGlobal: 85,
    mostrarBotonConfig: true,
    anguloInclinacion: 0
  }
)

defineEmits<{
  (e: 'abrirConfiguracion'): void
}>()

/** Dimensiones espaciales del lienzo SVG */
const anchoLienzo = 380
const altoLienzo = 380
const puntoCentro = anchoLienzo / 2
const radioMaximo = 115

/**
 * Divide textos largos de ejes o bloques en 2 líneas para evitar colisiones en SVG
 */
const dividirTextoEje = (texto: string): string[] => {
  if (!texto) return ['']
  if (texto.length <= 18) return [texto]
  const palabras = texto.split(' ')
  if (palabras.length <= 1) return [texto]
  
  const mitad = Math.ceil(palabras.length / 2)
  const l1 = palabras.slice(0, mitad).join(' ')
  const l2 = palabras.slice(mitad).join(' ')
  return [l1, l2]
}

/**
 * Calcula el ángulo en radianes de cada eje considerando la inclinación proporcional y personalizada
 */
const angulosPorEje = computed(() => {
  const totalEjes = props.dimensiones?.length || 6
  const rotacionGlobalRad = ((props.anguloInclinacion || 0) * Math.PI) / 180

  const todasCero = (props.dimensiones || []).every(d => !d.inclinacion || d.inclinacion === 0)

  return (props.dimensiones || []).map((dim, indice) => {
    let anguloGrados = 0
    if (!todasCero && typeof dim.inclinacion === 'number') {
      anguloGrados = dim.inclinacion
    } else {
      anguloGrados = (360 / totalEjes) * indice
    }
    const anguloRad = ((anguloGrados - 90) * Math.PI) / 180
    return anguloRad + rotacionGlobalRad
  })
})

/**
 * Calcula los vértices del polígono radial según el valor de cada dimensión (0 a 100)
 */
const puntosPoligonoDatos = computed(() => {
  if (!props.dimensiones || props.dimensiones.length === 0) return ''
  
  return props.dimensiones.map((dim, indice) => {
    const angulo = angulosPorEje.value[indice] ?? ((Math.PI * 2 / props.dimensiones.length) * indice - Math.PI / 2)
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
    const angulo = angulosPorEje.value[indice] ?? ((Math.PI * 2 / totalEjes) * indice - Math.PI / 2)
    const distancia = factorMeta * radioMaximo
    const x = puntoCentro + distancia * Math.cos(angulo)
    const y = puntoCentro + distancia * Math.sin(angulo)
    return `${x},${y}`
  }).join(' ')
})

/**
 * Vértices para los anillos concéntricos de referencia (20%, 40%, 60%, 80%, 100%)
 */
const puntosAnillo = (nivel: number) => {
  const totalEjes = props.dimensiones?.length || 6
  return Array.from({ length: totalEjes }).map((_, indice) => {
    const angulo = angulosPorEje.value[indice] ?? ((Math.PI * 2 / totalEjes) * indice - Math.PI / 2)
    const distancia = nivel * radioMaximo
    const x = puntoCentro + distancia * Math.cos(angulo)
    const y = puntoCentro + distancia * Math.sin(angulo)
    return `${x},${y}`
  }).join(' ')
}

/**
 * Coordenadas espaciales e inclinaciones para etiquetas de cada esquina del radar
 */
const posicionesEjesCalculadas = computed(() => {
  const totalEjes = props.dimensiones?.length || 6
  
  return (props.dimensiones || []).map((dim, indice) => {
    const angulo = angulosPorEje.value[indice] ?? ((Math.PI * 2 / totalEjes) * indice - Math.PI / 2)
    const cosA = Math.cos(angulo)
    const sinA = Math.sin(angulo)

    const lineaX = puntoCentro + radioMaximo * cosA
    const lineaY = puntoCentro + radioMaximo * sinA
    
    // Anclaje dinámico de texto según el cuadrante
    let textAnchor = 'middle'
    let deltaXMargin = 22

    if (cosA > 0.25) {
      textAnchor = 'start'
      deltaXMargin = 12
    } else if (cosA < -0.25) {
      textAnchor = 'end'
      deltaXMargin = 12
    }

    const deltaYMargin = sinA > 0.4 ? 22 : sinA < -0.4 ? 14 : 18

    const etiquetaX = puntoCentro + (radioMaximo + deltaXMargin) * cosA
    const etiquetaY = puntoCentro + (radioMaximo + deltaYMargin) * sinA
    
    // Posición del nodo de dato proporcional
    const distanciaDato = (Math.min(Math.max(dim.valor, 0), 100) / 100) * radioMaximo
    const datoX = puntoCentro + distanciaDato * cosA
    const datoY = puntoCentro + distanciaDato * sinA

    const lineasTexto = dividirTextoEje(dim.eje)

    return {
      dim,
      angulo,
      lineaX,
      lineaY,
      etiquetaX,
      etiquetaY,
      datoX,
      datoY,
      textAnchor,
      lineasTexto
    }
  })
})
</script>

<template>
  <div 
    @dblclick="$emit('abrirConfiguracion')"
    class="flex flex-col items-center justify-center relative select-none w-full cursor-pointer group"
    title="Doble clic para configurar y anclar bloques a las esquinas del radar"
  >
    <!-- Botón de Configuración Rápida de Dimensiones e Inclinaciones -->
    <div v-if="mostrarBotonConfig" class="w-full flex items-center justify-between pb-1 text-xs">
      <span class="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
        <span class="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
        Proporcional a respuestas reales
      </span>
      <div class="flex items-center gap-1.5">
        <span 
          v-if="anguloInclinacion !== undefined && anguloInclinacion !== 0"
          class="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-[10px] font-mono font-bold"
        >
          {{ anguloInclinacion }}° Inclinación
        </span>
        <button
          type="button"
          @click="$emit('abrirConfiguracion')"
          title="Clic para crear o anclar bloques de encuestas a las esquinas del radar"
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-slate-800 hover:bg-sky-100 dark:hover:bg-slate-700 text-sky-700 dark:text-sky-300 text-[11px] font-semibold transition-all cursor-pointer border border-sky-200 dark:border-slate-700 shadow-sm"
        >
          <Sliders class="w-3 h-3 text-sky-500" />
          <span>Configurar Inclinaciones ({{ dimensiones.length }})</span>
        </button>
      </div>
    </div>

    <svg :viewBox="`0 0 ${anchoLienzo} ${altoLienzo}`" class="w-full max-w-[350px] h-auto overflow-visible">
      <!-- Anillos concéntricos de referencia sólidos (20%, 40%, 60%, 80%, 100%) -->
      <polygon
        v-for="nivel in [0.2, 0.4, 0.6, 0.8, 1.0]"
        :key="nivel"
        :points="puntosAnillo(nivel)"
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

      <!-- Polígono de Datos del Clima Laboral -->
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

      <!-- Etiquetas de cada Dimensión / Bloque en las esquinas -->
      <g v-for="(eje, idx) in posicionesEjesCalculadas" :key="'label-' + idx">
        <text
          :x="eje.etiquetaX"
          :y="eje.etiquetaY"
          :text-anchor="eje.textAnchor"
          dominant-baseline="central"
          class="text-[10px] font-bold fill-slate-800 dark:fill-slate-200 font-['Poppins',sans-serif]"
        >
          <tspan v-if="eje.lineasTexto.length === 1" :x="eje.etiquetaX">
            {{ eje.lineasTexto[0] }}
          </tspan>
          <template v-else>
            <tspan :x="eje.etiquetaX" dy="-5">{{ eje.lineasTexto[0] }}</tspan>
            <tspan :x="eje.etiquetaX" dy="11">{{ eje.lineasTexto[1] }}</tspan>
          </template>
        </text>
      </g>
    </svg>

    <!-- Leyenda Inferior -->
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
