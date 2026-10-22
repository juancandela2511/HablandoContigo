<!--
  ============================================================================
  PREDICCIÓN DE RIESGO DE FUGA Y AUDITORÍA ANTI-STRAIGHTLINING (CalidadYPrediccionIA.vue)
  ============================================================================
  Muestra de forma directa y sin exceso de texto:
   - Mejora #1: Riesgo de Fuga por Área (%)
   - Mejora #6: Confiabilidad Psicométrica y Clima Ponderado (Anti-Straightlining)
-->

<script setup lang="ts">
import { computed } from 'vue'
import { TrendingDown, ShieldCheck, AlertTriangle, Users, CheckCircle2 } from 'lucide-vue-next'
import { useEncuestas } from '@/Almacenes/useEncuestas'
import {
  calcularAuditoriaAntiStraightlining,
  calcularPrediccionRiesgoFugaPorArea
} from '@/services/analiticaPredictivaClima'

const { encuestas, respuestasAnonimas } = useEncuestas()

const auditoriaCalidad = computed(() =>
  calcularAuditoriaAntiStraightlining(respuestasAnonimas.value)
)

const prediccionesFuga = computed(() =>
  calcularPrediccionRiesgoFugaPorArea(respuestasAnonimas.value, encuestas.value)
)

const claseRiesgo = (nivel: string) => {
  if (nivel === 'Crítico') return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
  if (nivel === 'Alto') return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
  if (nivel === 'Moderado') return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30'
  return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
}

const colorBarraFuga = (prob: number) => {
  if (prob >= 65) return '#f43f5e'
  if (prob >= 45) return '#f59e0b'
  if (prob >= 28) return '#0ea5e9'
  return '#10b981'
}
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 font-['Poppins',sans-serif] text-left">
    <!-- MEJORA #1: Riesgo de Fuga por Área (7 cols) -->
    <div class="lg:col-span-7 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3.5">
      <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <TrendingDown class="w-4 h-4" />
          </div>
          <h3 class="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
            Riesgo de Fuga por Área
          </h3>
        </div>
        <span class="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-bold">
          Predicción IA
        </span>
      </div>

      <div v-if="prediccionesFuga.length === 0" class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 text-center text-xs text-slate-500">
        Sin datos suficientes.
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div
          v-for="item in prediccionesFuga"
          :key="item.area"
          class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 space-y-1.5"
        >
          <div class="flex items-center justify-between gap-1">
            <span class="text-xs font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
              <Users class="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span class="truncate">{{ item.area }}</span>
            </span>
            <span :class="['text-[10px] font-bold px-1.5 py-0.5 rounded-md border shrink-0', claseRiesgo(item.nivelRiesgo)]">
              {{ item.probabilidadFuga }}%
            </span>
          </div>

          <div class="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-700"
              :style="{ width: `${item.probabilidadFuga}%`, backgroundColor: colorBarraFuga(item.probabilidadFuga) }"
            />
          </div>

          <div class="flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>Liderazgo: {{ item.puntajeLiderazgo }}%</span>
            <span>Reconoc.: {{ item.puntajeReconocimiento }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- MEJORA #6: Auditoría Anti-Straightlining (5 cols) -->
    <div class="lg:col-span-5 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3.5">
      <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck class="w-4 h-4" />
          </div>
          <h3 class="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
            Calidad de Respuestas
          </h3>
        </div>
        <span class="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
          Anti-Straightlining
        </span>
      </div>

      <div class="grid grid-cols-2 gap-2.5">
        <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800">
          <span class="text-[10px] font-bold uppercase text-slate-400 block">Confiabilidad</span>
          <span class="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {{ auditoriaCalidad.indiceConfiabilidadDatos }}%
          </span>
          <span class="text-[10px] text-slate-500 block">
            {{ auditoriaCalidad.respuestasConfiables }}/{{ auditoriaCalidad.totalRespuestasEvaluadas }} válidas
          </span>
        </div>

        <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800">
          <span class="text-[10px] font-bold uppercase text-slate-400 block">Clima Ponderado</span>
          <span class="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
            {{ auditoriaCalidad.saludPonderadaSinRuido }}%
          </span>
          <span class="text-[10px] text-slate-500 block">
            Bruto: {{ auditoriaCalidad.saludBrutaSinFiltrar }}%
          </span>
        </div>
      </div>

      <div
        v-if="auditoriaCalidad.respuestasMecanicasDetectadas > 0"
        class="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 text-[11px] font-semibold text-amber-700 dark:text-amber-300"
      >
        <AlertTriangle class="w-4 h-4 shrink-0" />
        <span>{{ auditoriaCalidad.respuestasMecanicasDetectadas }} respuesta(s) mecánica(s) filtrada(s)</span>
      </div>

      <div
        v-else
        class="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300"
      >
        <CheckCircle2 class="w-4 h-4 shrink-0" />
        <span>0 respuestas mecánicas detectadas</span>
      </div>
    </div>
  </div>
</template>
