<!--
  ============================================================================
  TIEMPO DE ANTIGÜEDAD Y RETENCIÓN (AntiguedadRetencion.vue)
  ============================================================================
  FÓRMULA MATEMÁTICA APLICADA:
  =((menos de 6 meses * 10%) + (de 6 meses a un año * 20%) + (de un año a 3 años * 30%) + (más de tres años * 40%)) / SUM(resultado de retención de clima laboral)
-->

<script setup lang="ts">
import { computed } from 'vue'
import { Clock, TrendingUp } from 'lucide-vue-next'
import { useEstadisticas } from '@/Almacenes/useEstadisticas'
import { useEncuestas } from '@/Almacenes/useEncuestas'

const { estadisticasAntiguedad } = useEstadisticas()
const { respuestasAnonimas } = useEncuestas()

/**
 * 1. Total colaboradores con registro de antigüedad (SUM resultado de retención de clima laboral)
 */
const totalColaboradoresAntiguedad = computed<number>(() => {
  return estadisticasAntiguedad.value?.reduce((acc, curr) => acc + curr.cantidad, 0) || 0
})

/**
 * Conteos individuales por tramo
 */
const conteosPorTramo = computed(() => {
  const items = estadisticasAntiguedad.value || []
  const menos6m = items.find(i => i.id === 'menos-6m')?.cantidad || 0
  const de6m1a = items.find(i => i.id === '6m-1a')?.cantidad || 0
  const de1a3a = items.find(i => i.id === '1a-3a')?.cantidad || 0
  const mas3a = items.find(i => i.id === 'mas-3a')?.cantidad || 0
  const sumaTotal = (menos6m + de6m1a + de1a3a + mas3a) || totalColaboradoresAntiguedad.value
  return { menos6m, de6m1a, de1a3a, mas3a, sumaTotal }
})

/**
 * 2. Fórmula oficial de retención de personal normalizada a escala 0% - 100%:
 * =((menos de 6 meses*10%)+(de 6 meses a un año*20%)+(de un año a 3 años*30%)+(mas de tres años*40%))/SUM(resultado de retencion de clima laboral)
 * Al normalizarse sobre el peso máximo (40% = 0.40), 40% equivale a 100% de retención máxima:
 * Por ejemplo: ((1*10%) + (0*20%) + (0*30%) + (2*40%)) / (3 * 40%) = 0.90 / 1.20 = 75%
 */
const resultadoBrutoFormula = computed<number>(() => {
  const { menos6m, de6m1a, de1a3a, mas3a, sumaTotal } = conteosPorTramo.value
  if (sumaTotal === 0) return 0
  const numeradorPonderado = (menos6m * 10) + (de6m1a * 20) + (de1a3a * 30) + (mas3a * 40)
  return Number((numeradorPonderado / sumaTotal).toFixed(1))
})

const tasaRetencionConsolidada = computed<number>(() => {
  const { menos6m, de6m1a, de1a3a, mas3a, sumaTotal } = conteosPorTramo.value
  if (sumaTotal === 0) return 0

  const numeradorPonderado = (menos6m * 0.10) + (de6m1a * 0.20) + (de1a3a * 0.30) + (mas3a * 0.40)
  // SUM(resultado de retención máxima = sumaTotal * 40%) para obtener porcentaje en escala 0% a 100%
  const denominadorMaximo = sumaTotal * 0.40
  const porcentajeNormalizado = (numeradorPonderado / denominadorMaximo) * 100
  return Math.min(100, Math.max(0, Number(porcentajeNormalizado.toFixed(1))))
})

/**
 * Porcentaje de llenado del anillo visual (escala directa 0% a 100%)
 */
const porcentajeAnilloVisual = computed<number>(() => {
  if (tasaRetencionConsolidada.value <= 0) return 0
  return Math.min(100, Math.round(tasaRetencionConsolidada.value))
})

/**
 * 3. Estado semafórico calibrado en escala 0% a 100%
 */
const estadoRetencion = computed(() => {
  if (totalColaboradoresAntiguedad.value === 0) {
    return {
      estado: 'Sin registros',
      colorHex: '#64748b',
      badgeClass: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700',
      textClass: 'text-slate-500 dark:text-slate-400'
    }
  }
  const val = tasaRetencionConsolidada.value
  if (val < 45) {
    return {
      estado: 'Crítico',
      colorHex: '#ef4444',
      badgeClass: 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-900',
      textClass: 'text-rose-600 dark:text-rose-400'
    }
  } else if (val < 65) {
    return {
      estado: 'Aceptable',
      colorHex: '#f59e0b',
      badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-900',
      textClass: 'text-amber-600 dark:text-amber-400'
    }
  } else if (val < 85) {
    return {
      estado: 'Bueno',
      colorHex: '#22c55e',
      badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900',
      textClass: 'text-emerald-600 dark:text-emerald-400'
    }
  } else {
    return {
      estado: 'Excelente',
      colorHex: '#10b981',
      badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900',
      textClass: 'text-emerald-600 dark:text-emerald-400'
    }
  }
})

/**
 * 4. Fórmula exacta de permanencia promedio (años y meses)
 */
const promedioPermanenciaFormateado = computed<string>(() => {
  const total = totalColaboradoresAntiguedad.value
  if (total === 0) return '0 meses'

  let sumaMesesExactos = 0
  let exactCount = 0

  respuestasAnonimas.value?.forEach(r => {
    const itemAnt = r.respuestas?.find(i =>
      i.idPregunta === 'b1-p1-antiguedad' ||
      i.textoPregunta?.toLowerCase().includes('laborando') ||
      i.textoPregunta?.toLowerCase().includes('antigüedad') ||
      i.textoPregunta?.toLowerCase().includes('tiempo')
    )
    if (itemAnt) {
      const txt = String(itemAnt.comentario || itemAnt.respuesta || '')
      const matchMesesDirecto = txt.match(/^(\d+)\s*mes/i)
      if (matchMesesDirecto && matchMesesDirecto[1]) {
        sumaMesesExactos += parseInt(matchMesesDirecto[1], 10)
        exactCount++
      } else if (/m[aá]s de 3|m[aá]s de tres|\+3/i.test(txt)) {
        const matchAnos = txt.match(/\((\d+)\s*a[ñn]o/i)
        const a = matchAnos && matchAnos[1] ? parseInt(matchAnos[1], 10) : 4
        sumaMesesExactos += a * 12
        exactCount++
      } else {
        const matchMeses = txt.match(/(\d+)\s*mes/i)
        const matchAnos = txt.match(/(\d+)\s*a[ñn]o/i)
        if (matchMeses || matchAnos) {
          const m = (matchMeses && matchMeses[1]) ? parseInt(matchMeses[1], 10) : 0
          const a = (matchAnos && matchAnos[1]) ? parseInt(matchAnos[1], 10) : 0
          sumaMesesExactos += (a * 12 + m)
          exactCount++
        }
      }
    }
  })

  let mediaMeses = 0
  if (exactCount > 0) {
    mediaMeses = Math.round(sumaMesesExactos / exactCount)
  } else {
    let sumaMeses = 0
    estadisticasAntiguedad.value?.forEach(item => {
      let mesesEstimados = 24
      if (item.id === 'menos-6m') mesesEstimados = 3
      else if (item.id === '6m-1a') mesesEstimados = 9
      else if (item.id === '1a-3a') mesesEstimados = 24
      else if (item.id === 'mas-3a') mesesEstimados = 48
      sumaMeses += item.cantidad * mesesEstimados
    })
    mediaMeses = Math.round(sumaMeses / total)
  }

  const anos = Math.floor(mediaMeses / 12)
  const meses = mediaMeses % 12

  if (mediaMeses > 36) {
    const detalleExacto = meses > 0 ? `${anos} años y ${meses} mes${meses === 1 ? '' : 'es'}` : `${anos} años`
    return `${mediaMeses} meses — Más de 3 años (${detalleExacto})`
  }

  if (anos === 0) return `${mediaMeses} mes${mediaMeses === 1 ? '' : 'es'}`
  if (meses === 0) return `${mediaMeses} meses (${anos} año${anos === 1 ? '' : 's'})`
  return `${mediaMeses} meses (${anos} año${anos === 1 ? '' : 's'} y ${meses} mes${meses === 1 ? '' : 'es'})`
})

const ponderacionTramo = (id: string) => {
  if (id === 'menos-6m') return 'Peso 10%'
  if (id === '6m-1a') return 'Peso 20%'
  if (id === '1a-3a') return 'Peso 30%'
  return 'Peso 40%'
}
</script>

<template>
  <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 text-left">
    <!-- Encabezado -->
    <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 flex-wrap gap-2">
      <div class="flex items-center gap-2.5">
        <div class="w-9 h-9 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
          <Clock class="w-5 h-5" />
        </div>
        <div>
          <h3 class="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>Proyección de Antigüedad y Retención</span>
            <span class="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-mono font-bold">
              Intel Talent
            </span>
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Total: {{ totalColaboradoresAntiguedad }} colaboradores evaluados.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <span class="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1">
          <span>Permanencia Promedio:</span>
          <strong class="text-purple-600 dark:text-purple-400 font-mono text-xs ml-1">{{ promedioPermanenciaFormateado }}</strong>
        </span>
      </div>
    </div>

    <!-- Contenido en cuadrícula -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Tarjetas de Antigüedad por Tramo (8 cols) -->
      <div class="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          v-for="item in estadisticasAntiguedad"
          :key="item.id"
          class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 hover:border-indigo-500/40 transition-all"
        >
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs font-black text-slate-800 dark:text-slate-200">
              {{ item.etiqueta }}
            </span>
            <div class="flex items-center gap-1.5">
              <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                {{ ponderacionTramo(item.id) }}
              </span>
              <span
                :class="[
                  'text-[10px] font-bold px-2 py-0.5 rounded-full',
                  item.riesgoRotacion === 'Alto'
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                    : item.riesgoRotacion === 'Moderado'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                ]"
              >
                Riesgo {{ item.riesgoRotacion }}
              </span>
            </div>
          </div>

          <div class="flex items-baseline justify-between">
            <div class="flex items-baseline gap-1.5">
              <span class="text-3xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                {{ item.cantidad }}
              </span>
              <span class="text-xs font-bold text-slate-500">
                {{ item.cantidad === 1 ? 'colaborador' : 'colaboradores' }}
              </span>
            </div>
            <span class="text-xs font-bold text-slate-500 font-mono">
              {{ item.porcentaje }}% del total
            </span>
          </div>

          <div class="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              class="h-full bg-indigo-500 rounded-full transition-all"
              :style="{ width: `${item.porcentaje}%` }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Gráfico Donut de Retención (4 cols) -->
      <div class="lg:col-span-4 p-5 rounded-2xl bg-gradient-to-br from-indigo-50/50 via-slate-50 to-white dark:from-indigo-950/20 dark:via-slate-950 dark:to-slate-900 border border-indigo-200/80 dark:border-indigo-900/40 flex flex-col justify-between space-y-4">
        <div class="space-y-1">
          <h4 class="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
            <TrendingUp class="w-4 h-4" />
            <span>Promedio de Efectividad de Retención</span>
          </h4>
        </div>

        <div class="flex flex-col items-center justify-center my-2 relative">
          <svg viewBox="0 0 160 160" class="w-36 h-36 drop-shadow-md">
            <circle cx="80" cy="80" r="62" fill="none" stroke="currentColor" class="text-slate-200 dark:text-slate-800" stroke-width="16" />
            <circle 
              cx="80" 
              cy="80" 
              r="62" 
              fill="none" 
              :stroke="estadoRetencion.colorHex" 
              stroke-width="16" 
              stroke-linecap="round"
              :stroke-dasharray="389.5"
              :stroke-dashoffset="389.5 * (1 - porcentajeAnilloVisual / 100)"
              class="transition-all duration-1000 ease-out"
              transform="rotate(-90 80 80)"
            />
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span class="text-2xl font-black font-mono text-slate-900 dark:text-white">{{ tasaRetencionConsolidada }}%</span>
            <span :class="['text-[10px] font-black uppercase tracking-tight px-2 py-0.5 rounded-full mt-1 shadow-xs', estadoRetencion.badgeClass]">
              {{ estadoRetencion.estado }}
            </span>
          </div>
        </div>

        <!-- Desglose de la fórmula aplicada -->
        <div class="p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-[10px] font-mono text-slate-500 dark:text-slate-400 leading-relaxed space-y-0.5">
          <div class="font-bold text-slate-700 dark:text-slate-300">Fórmula aplicada:</div>
          <div>=(({{ conteosPorTramo.menos6m }}×10%) + ({{ conteosPorTramo.de6m1a }}×20%) + ({{ conteosPorTramo.de1a3a }}×30%) + ({{ conteosPorTramo.mas3a }}×40%)) / {{ conteosPorTramo.sumaTotal }}</div>
          <div class="text-indigo-600 dark:text-indigo-400 font-bold">
            Ponderado: {{ resultadoBrutoFormula }}% / 40% máx = {{ tasaRetencionConsolidada }}% Retención
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
