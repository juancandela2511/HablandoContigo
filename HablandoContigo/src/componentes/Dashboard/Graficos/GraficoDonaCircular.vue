<!--
  ============================================================================
  COMPONENTE GRÁFICO CIRCULAR 3D SÓLIDO ESTÁTICO (GraficoDonaCircular.vue)
  - Soporte robusto para 100% (un solo sector de 360 grados sin colapsar el topPath).
  - Inclinación frontal evidente (Ry = 66, Rx = 108, height3D = 26).
  - Estático sin giro.
  - Paredes cilíndricas 100% lisas sin líneas ni divisiones toscas.
  ============================================================================
-->

<script setup lang="ts">
import { computed } from 'vue'
import type { DatoSegmentoGrafico } from '@/Almacenes/useGraficosAnclados'

const props = withDefaults(
  defineProps<{
    segmentos: DatoSegmentoGrafico[]
    totalMuestras?: number
    subtituloCentro?: string
    tamano?: number
  }>(),
  {
    totalMuestras: 0,
    subtituloCentro: 'Personas Totales',
    tamano: 230
  }
)

// Filtrar únicamente aquellos segmentos que tengan participantes/respuestas reales (> 0)
const segmentosValidos = computed(() => {
  return props.segmentos.filter((seg) => {
    const val = seg.valor ?? seg.porcentaje ?? 0
    return val > 0
  })
})

// Suma total de respuestas válidas
const sumaValores = computed(() => {
  const total = segmentosValidos.value.reduce((acc, seg) => acc + (seg.valor || seg.porcentaje || 0), 0)
  return total > 0 ? total : 1
})

// Parámetros de geometría 3D con inclinación frontal (Ry = 66, Rx = 108)
const Rx = 108
const Ry = 66
const cx = 140
const cy = 88
const height3D = 26

const toRad = (deg: number) => (deg * Math.PI) / 180

// Paleta cromática 3D fluida y viva: Rojo (Bajo puntaje/alerta/Opción 1) -> Naranja -> Amarillo (Medio) -> Celeste -> Azul (Alto puntaje/Opción 2)
function obtenerColorSegmento3D(seg: DatoSegmentoGrafico, idx: number) {
  if (seg.color) {
    const c = seg.color.toLowerCase()
    if (c.includes('#ef4444') || c.includes('#dc2626') || c.includes('#f87171') || c.includes('#ff2a2a') || c.includes('red') || c.includes('rojo')) {
      return { top: '#ff2a2a', side: '#d91414' }
    }
    if (c.includes('#f59e0b') || c.includes('#fbbf24') || c.includes('#f97316') || c.includes('#ffcc00') || c.includes('#ff7700') || c.includes('amarillo') || c.includes('ambar')) {
      return { top: '#ffcc00', side: '#d9a600' }
    }
    if (c.includes('#0284c7') || c.includes('#3b82f6') || c.includes('#2563eb') || c.includes('#38bdf8') || c.includes('#0066ff') || c.includes('azul') || c.includes('blue')) {
      return { top: '#0066ff', side: '#004cd7' }
    }
    return { top: seg.color, side: seg.color }
  }

  const paletaGradual = [
    { top: '#ff2a2a', side: '#d91414' }, // Rojo Vivo (Bajo / Alerta / Opción 1 / No)
    { top: '#ff7700', side: '#d95a00' }, // Naranja Vivo
    { top: '#ffcc00', side: '#d9a600' }, // Amarillo Vivo (Medio / Neutro)
    { top: '#00c8ff', side: '#0099cc' }, // Celeste/Cian Vivo
    { top: '#0066ff', side: '#004cd7' }  // Azul Eléctrico Vivo (Alto / Óptimo / Opción 2 / Sí)
  ]

  return paletaGradual[idx % paletaGradual.length]!
}

// Cálculo dinámico de sectores 3D extruidos estáticos con soporte 100% 360deg
const sectoresCalculados3D = computed(() => {
  if (segmentosValidos.value.length === 0) return []

  let acumuladoAngulo = 0

  return segmentosValidos.value.map((seg, idx) => {
    const val = seg.valor || seg.porcentaje || 0
    const proporcion = val / sumaValores.value
    const sweepAngle = proporcion * 360
    const baseStart = acumuladoAngulo
    const baseEnd = baseStart + sweepAngle
    acumuladoAngulo += sweepAngle

    const paleta = obtenerColorSegmento3D(seg, idx)

    let topPath = ''
    let frontWallPath = ''

    if (sweepAngle >= 359.9) {
      // CASO ESPECIAL: 100% de los votos (360° completos)
      topPath = `M ${cx - Rx} ${cy} A ${Rx} ${Ry} 0 1 1 ${cx + Rx} ${cy} A ${Rx} ${Ry} 0 1 1 ${cx - Rx} ${cy} Z`
      frontWallPath = `M ${cx + Rx} ${cy} A ${Rx} ${Ry} 0 0 1 ${cx - Rx} ${cy} L ${cx - Rx} ${cy + height3D} A ${Rx} ${Ry} 0 0 0 ${cx + Rx} ${cy + height3D} Z`
    } else if (sweepAngle > 0) {
      // CASO NORMAL: Sector entre 0 y 360°
      const startAngle = baseStart
      const endAngle = baseEnd

      const radStart = toRad(startAngle)
      const radEnd = toRad(endAngle)

      const p1 = { x: cx + Rx * Math.cos(radStart), y: cy + Ry * Math.sin(radStart) }
      const p2 = { x: cx + Rx * Math.cos(radEnd), y: cy + Ry * Math.sin(radEnd) }

      const largeArcFlag = sweepAngle > 180 ? 1 : 0
      topPath = `M ${cx} ${cy} L ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${Rx} ${Ry} 0 ${largeArcFlag} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)} Z`

      // Construcción de pared frontal exterior lisa sin costuras ni líneas
      const normStart = ((startAngle % 360) + 360) % 360
      const normEnd = normStart + sweepAngle

      const fStart = Math.max(0, Math.min(180, normStart))
      const fEnd = Math.max(0, Math.min(180, normEnd))

      if (fEnd > fStart) {
        const fp1 = { x: cx + Rx * Math.cos(toRad(fStart)), y: cy + Ry * Math.sin(toRad(fStart)) }
        const fp2 = { x: cx + Rx * Math.cos(toRad(fEnd)), y: cy + Ry * Math.sin(toRad(fEnd)) }
        const fb1 = { x: fp1.x, y: fp1.y + height3D }
        const fb2 = { x: fp2.x, y: fp2.y + height3D }
        const fArcFlag = (fEnd - fStart) > 180 ? 1 : 0

        frontWallPath = `M ${fp1.x.toFixed(2)} ${fp1.y.toFixed(2)} A ${Rx} ${Ry} 0 ${fArcFlag} 1 ${fp2.x.toFixed(2)} ${fp2.y.toFixed(2)} L ${fb2.x.toFixed(2)} ${fb2.y.toFixed(2)} A ${Rx} ${Ry} 0 ${fArcFlag} 0 ${fb1.x.toFixed(2)} ${fb1.y.toFixed(2)} Z`
      }
    }

    return {
      ...seg,
      topPath,
      frontWallPath,
      colorTop: paleta.top,
      colorSide: paleta.side
    }
  })
})
</script>

<template>
  <div class="flex flex-col gap-3 py-2 px-1 w-full select-none font-['Poppins',sans-serif]">
    
    <!-- BANNER CABECERA DEL GRÁFICO -->
    <div class="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 px-2 pb-1 border-b border-slate-100 dark:border-slate-800 min-w-0">
      <div class="flex items-center gap-1.5 min-w-0">
        <span class="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
        <h4 class="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 truncate">
          Distribución Estadística 3D
        </h4>
      </div>
      <span class="text-[10px] font-mono font-extrabold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 shrink-0">
        Total: {{ totalMuestras > 0 ? totalMuestras : sumaValores }} personas
      </span>
    </div>

    <!-- CONTENEDOR DEL GRÁFICO PASTEL 3D EXTRUIDO ESTÁTICO -->
    <div class="relative w-full min-h-[230px] flex items-center justify-center py-2">
      <div class="relative w-72 h-56 flex items-center justify-center overflow-visible">
        <svg viewBox="0 0 280 200" class="w-full h-full filter drop-shadow-2xl overflow-visible">
          
          <!-- PAREDES CILÍNDRICAS VERTICALES 3D LISAS -->
          <g v-for="sec in sectoresCalculados3D" :key="'sides-' + sec.etiqueta">
            <path
              v-if="sec.frontWallPath"
              :d="sec.frontWallPath"
              :fill="sec.colorSide"
              stroke="none"
            />
          </g>

          <!-- CARAS SUPERIORES UNIDAS LISAS -->
          <g v-for="sec in sectoresCalculados3D" :key="'top-' + sec.etiqueta">
            <path
              v-if="sec.topPath"
              :d="sec.topPath"
              :fill="sec.colorTop"
              stroke="none"
            />
          </g>

        </svg>
      </div>
    </div>

    <!-- DESGLOSE DETALLADO EN LA LEYENDA -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-left">
      <div
        v-for="seg in sectoresCalculados3D"
        :key="seg.etiqueta"
        class="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs"
      >
        <div class="flex items-center gap-2 min-w-0">
          <span class="w-3 h-3 rounded-md shrink-0 shadow-2xs" :style="{ backgroundColor: seg.colorTop }" />
          <span class="font-semibold text-slate-800 dark:text-slate-200 truncate">
            {{ seg.etiqueta }}
          </span>
        </div>
        <span class="font-mono font-bold text-slate-900 dark:text-white shrink-0 px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          {{ seg.valor }} {{ seg.valor === 1 ? 'persona' : 'personas' }} ({{ seg.porcentaje }}%)
        </span>
      </div>
    </div>

  </div>
</template>
