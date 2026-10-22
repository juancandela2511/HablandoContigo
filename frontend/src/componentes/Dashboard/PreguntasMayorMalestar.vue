<!--
  ============================================================================
  PREGUNTAS CON MAYOR MALESTAR (PreguntasMayorMalestar.vue)
  ============================================================================
  Identifica y clasifica las preguntas con menor puntaje de satisfacción o
  mayor concentración de alertas psicosociales para intervención prioritaria.
-->

<script setup lang="ts">
import { ref, computed } from 'vue'
import { AlertTriangle, ChevronDown, ChevronUp, MessageSquareQuote, ShieldAlert } from 'lucide-vue-next'
import type { DesgloseRespuestaDetallada } from '@/shared/types/dashboard.types'

const props = defineProps<{
  preguntas?: DesgloseRespuestaDetallada[]
}>()

const preguntasExpandidas = ref<Record<string, boolean>>({})

const toggleExpansion = (id: string) => {
  preguntasExpandidas.value[id] = !preguntasExpandidas.value[id]
}

// Ordenar de mayor a menor malestar (% de riesgo o menor puntaje)
const preguntasOrdenadasMalestar = computed(() => {
  const lista = [...(props.preguntas || [])]
  return lista.sort((a, b) => {
    const riesgoA = a.distribucion?.negativas ?? ((a as any).porcentajeRiesgo || (5 - a.promedio) * 20)
    const riesgoB = b.distribucion?.negativas ?? ((b as any).porcentajeRiesgo || (5 - b.promedio) * 20)
    return riesgoB - riesgoA
  })
})
</script>

<template>
  <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5 text-left">
    <!-- Encabezado -->
    <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 flex-wrap gap-2">
      <div class="flex items-center gap-2.5">
        <div class="w-9 h-9 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
          <AlertTriangle class="w-5 h-5" />
        </div>
        <div>
          <h3 class="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>Preguntas con Mayor Malestar o Fricción</span>
            <span class="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-mono font-bold">
              Prioridad RRHH
            </span>
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Preguntas donde los colaboradores reportan menor bienestar o mayor tensión laboral.
          </p>
        </div>
      </div>
    </div>

    <!-- Lista de Preguntas con Malestar -->
    <div v-if="preguntasOrdenadasMalestar.length === 0" class="p-8 text-center text-xs text-slate-400">
      No se registran preguntas con indicadores de malestar crítico en este momento.
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="p in preguntasOrdenadasMalestar"
        :key="p.idPregunta"
        class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 transition-all hover:border-rose-400/50"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="space-y-1">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 text-[10px] font-mono font-bold">
                {{ p.categoria || 'General' }}
              </span>
              <span class="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                Puntaje: {{ (p.promedio || 0).toFixed(1) }} / 5.0
              </span>
            </div>

            <p class="text-xs font-bold text-slate-900 dark:text-white leading-relaxed">
              {{ p.pregunta }}
            </p>
          </div>

          <span class="px-2.5 py-1 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-mono font-extrabold shrink-0">
            {{ p.distribucion?.negativas ?? 0 }}% Malestar
          </span>
        </div>

        <!-- Barra apilada: Favorable (Verde), Neutro (Amarillo), Riesgo (Rojo) -->
        <div class="space-y-1">
          <div class="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 flex overflow-hidden">
            <div
              class="h-full bg-emerald-500 transition-all"
              :style="{ width: `${p.distribucion?.positivas ?? 70}%` }"
              title="Favorable"
            />
            <div
              class="h-full bg-amber-400 transition-all"
              :style="{ width: `${p.distribucion?.neutrales ?? 15}%` }"
              title="Neutro"
            />
            <div
              class="h-full bg-rose-500 transition-all"
              :style="{ width: `${p.distribucion?.negativas ?? 15}%` }"
              title="Riesgo / Malestar"
            />
          </div>
          <div class="flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Favorable: {{ p.distribucion?.positivas ?? 70 }}%</span>
            <span>Neutro: {{ p.distribucion?.neutrales ?? 15 }}%</span>
            <span class="text-rose-500 font-bold">Riesgo: {{ p.distribucion?.negativas ?? 15 }}%</span>
          </div>
        </div>

        <!-- Desplegable de comentarios cualitativos si existen -->
        <div v-if="p.comentariosDestacados && p.comentariosDestacados.length > 0">
          <button
            type="button"
            @click="toggleExpansion(p.idPregunta)"
            class="text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer pt-1"
          >
            <MessageSquareQuote class="w-3 h-3" />
            <span>{{ preguntasExpandidas[p.idPregunta] ? 'Ocultar Citas' : `Ver ${p.comentariosDestacados.length} citas confidenciales` }}</span>
            <component :is="preguntasExpandidas[p.idPregunta] ? ChevronUp : ChevronDown" class="w-3 h-3" />
          </button>

          <div v-if="preguntasExpandidas[p.idPregunta]" class="mt-2 space-y-1.5 pl-3 border-l-2 border-rose-300 dark:border-rose-900">
            <p
              v-for="(com, cIdx) in p.comentariosDestacados"
              :key="cIdx"
              class="text-[11px] text-slate-600 dark:text-slate-400 italic"
            >
              "{{ com }}"
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
