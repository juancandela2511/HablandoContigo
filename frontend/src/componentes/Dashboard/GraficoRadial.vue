<!--
  ============================================================================
  GRÁFICO 3D PASTEL EXTRUIDO ESTÁTICO (GraficoRadial.vue)
  - Soporte robusto para 100% (un solo sector de 360 grados sin colapsar el topPath).
  - Inclinación frontal evidente (Ry = 66, Rx = 108, height3D = 26).
  - Estático sin giro.
  - Pared cilíndrica frontal 100% lisa e integrada sin líneas ni costuras.
  ============================================================================
-->

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { DimensionRadial } from '@/Almacenes/useEstadisticas'
import { Sliders, CheckCircle2, AlertCircle } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    dimensiones: DimensionRadial[]
    metaGlobal?: number
    mostrarBotonConfig?: boolean
    colorPersonalizado?: string
  }>(),
  {
    metaGlobal: 75,
    mostrarBotonConfig: true,
    colorPersonalizado: '#2563eb'
  }
)

defineEmits<{
  (e: 'abrirConfiguracion'): void
}>()

const colorGraficaBase = ref(props.colorPersonalizado || '#2563eb')

watch(() => props.colorPersonalizado, (nuevoColor) => {
  if (nuevoColor) colorGraficaBase.value = nuevoColor
})

// Geometría 3D inclinada hacia el frente (Ry = 66, Rx = 108)
const Rx = 108
const Ry = 66
const cx = 140
const cy = 88
const height3D = 26

const toRad = (deg: number) => (deg * Math.PI) / 180

// Cálculo de proporción real de respuestas (Sí vs No)
const calculoProporcional = computed(() => {
  const dims = props.dimensiones || []
  if (dims.length === 0) return Math.min(Math.max(props.metaGlobal || 75, 5), 95)

  const totalValores = dims.reduce((acc, d) => acc + (d.valor || 0), 0)
  const promedio = Math.round(totalValores / dims.length)
  return Math.min(Math.max(promedio, 5), 95)
})

const porcentajeSi = computed(() => calculoProporcional.value)
const porcentajeNo = computed(() => 100 - calculoProporcional.value)

// Helper para paredes laterales limpias
function adjustColorBrightness(hex: string, percent: number) {
  let num = parseInt(hex.replace('#', ''), 16)
  let amt = Math.round(2.55 * percent)
  let R = (num >> 16) + amt
  let G = (num >> 8 & 0x00FF) + amt
  let B = (num & 0x0000FF) + amt
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1)
}

// Construcción vectorial de 2 sectores 3D estáticos con soporte 100% 360deg
const sectoresCalculados3D = computed(() => {
  const sweepSi = (porcentajeSi.value / 100) * 360
  const sweepNo = 360 - sweepSi

  const topSi = colorGraficaBase.value && colorGraficaBase.value !== '#2563eb' ? colorGraficaBase.value : '#0066ff'
  const sideSi = adjustColorBrightness(topSi, -22)

  const topNo = '#ff2a2a'
  const sideNo = '#d91414'

  const listaSectores = [
    {
      nombre: 'Sí',
      porcentaje: porcentajeSi.value,
      sweepAngle: sweepSi,
      baseStart: 0,
      baseEnd: sweepSi,
      colorTop: topSi,
      colorSide: sideSi,
      icono: CheckCircle2
    },
    {
      nombre: 'No',
      porcentaje: porcentajeNo.value,
      sweepAngle: sweepNo,
      baseStart: sweepSi,
      baseEnd: 360,
      colorTop: topNo,
      colorSide: sideNo,
      icono: AlertCircle
    }
  ].filter(s => s.porcentaje > 0)

  let acumuladoAngulo = 0

  return listaSectores.map((sec) => {
    const sweepAngle = sec.sweepAngle
    const baseStart = acumuladoAngulo
    const baseEnd = baseStart + sweepAngle
    acumuladoAngulo += sweepAngle

    let topPath = ''
    let frontWallPath = ''

    if (sweepAngle >= 359.9) {
      // CASO ESPECIAL: 100% (360° completos)
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
      ...sec,
      topPath,
      frontWallPath
    }
  })
})
</script>

<template>
  <div class="flex flex-col items-center justify-center relative select-none w-full font-['Poppins',sans-serif]">
    
    <!-- ENCABEZADO Y BOTÓN DE CONFIGURAR COLOR -->
    <div class="w-full flex flex-wrap items-center justify-between gap-x-2 gap-y-1 pb-2 mb-1 border-b border-slate-100 dark:border-slate-800/80 min-w-0">
      <div class="flex items-center gap-1.5 min-w-0">
        <span class="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
        <h4 class="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 truncate">
          Distribución de Respuestas 3D
        </h4>
      </div>

      <button
        v-if="mostrarBotonConfig"
        type="button"
        @click="$emit('abrirConfiguracion')"
        class="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold transition-all cursor-pointer border border-slate-200 dark:border-slate-700 flex items-center gap-1"
      >
        <Sliders class="w-3 h-3 text-blue-500" />
        <span>Cambiar Color</span>
      </button>
    </div>

    <!-- MODO 3D PASTEL EXTRUIDO ESTÁTICO -->
    <div class="w-full flex flex-col items-center justify-center py-1">
      
      <div class="relative w-72 h-56 flex items-center justify-center overflow-visible">
        <svg viewBox="0 0 280 200" class="w-full h-full filter drop-shadow-2xl overflow-visible">
          
          <!-- CAPA 1: PAREDES CILÍNDRICAS FRONTALES LISAS -->
          <g v-for="sec in sectoresCalculados3D" :key="'sides-' + sec.nombre">
            <path
              v-if="sec.frontWallPath"
              :d="sec.frontWallPath"
              :fill="sec.colorSide"
              stroke="none"
            />
          </g>

          <!-- CAPA 2: CARAS SUPERIORES DE LOS SECTORES -->
          <g v-for="sec in sectoresCalculados3D" :key="'top-' + sec.nombre">
            <path
              v-if="sec.topPath"
              :d="sec.topPath"
              :fill="sec.colorTop"
              stroke="none"
            />
          </g>

        </svg>
      </div>

      <!-- LEYENDA EXCLUSIVA DE OPCIONES -->
      <div class="grid grid-cols-2 gap-3 w-full pt-2 text-xs">
        <div
          v-for="sec in sectoresCalculados3D"
          :key="sec.nombre"
          class="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2"
        >
          <div class="flex items-center gap-2 min-w-0">
            <span class="w-3.5 h-3.5 rounded-md shrink-0 shadow-2xs" :style="{ backgroundColor: sec.colorTop }" />
            <span class="font-semibold text-slate-800 dark:text-slate-200 truncate text-xs">
              {{ sec.nombre }}
            </span>
          </div>
          <span class="font-extrabold font-mono text-slate-900 dark:text-white text-xs shrink-0 px-2.5 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
            {{ sec.porcentaje }}%
          </span>
        </div>
      </div>

    </div>

  </div>
</template>
