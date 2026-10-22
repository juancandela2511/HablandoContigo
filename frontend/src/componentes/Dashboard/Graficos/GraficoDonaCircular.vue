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
import type { DatoSegmentoGrafico } from '@/Almacenes/useAnclajeGraficos'

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

/**
 * oscurecerHex: Oscurece un color hexadecimal de forma proporcional para la pared lateral 3D
 */
function oscurecerHex(hex: string, porcentaje = 0.22): string {
  if (!hex || !hex.startsWith('#')) return hex || '#0284c7'
  let c = hex.replace('#', '')
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('')
  }
  if (c.length !== 6) return hex
  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)

  const r2 = Math.max(0, Math.floor(r * (1 - porcentaje)))
  const g2 = Math.max(0, Math.floor(g * (1 - porcentaje)))
  const b2 = Math.max(0, Math.floor(b * (1 - porcentaje)))

  return `#${r2.toString(16).padStart(2, '0')}${g2.toString(16).padStart(2, '0')}${b2.toString(16).padStart(2, '0')}`
}

// Usar los colores exactos diferenciados para cada segmento del gráfico 3D
function obtenerColorSegmento3D(seg: DatoSegmentoGrafico, idx: number) {
  const paletaDiversa = ['#0066ff', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#ef4444', '#14b8a6', '#6366f1']

  // Si todas las opciones traen el mismo color (p. ej. verde duplicado), usar la paleta diversa indexada
  const coloresDuplicados = props.segmentos.filter(s => s.color === seg.color).length > 1
  const colorTop = (seg.color && !coloresDuplicados) ? seg.color : (paletaDiversa[idx % paletaDiversa.length] || '#0066ff')

  return {
    top: colorTop,
    side: oscurecerHex(colorTop, 0.22)
  }
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
