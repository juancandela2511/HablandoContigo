<!--
  ============================================================================
  TARJETA MINI-NOTIFICACIÓN DE GRÁFICOS ANCLADOS (TarjetaNotificacionGraficos.vue)
  ============================================================================
  Muestra la mini-notificación interactiva:
  "Te sugiero crear los gráficos anclados: ¿Sí o No?" para anclarlos automáticamente
  en el Dashboard de analítica.
-->

<script setup lang="ts">
import type { SugerenciaGraficoAncladoIA } from '@/asistenteOllama/tiposAsistente'
import { BarChart3, PieChart, Check, X, Pin } from 'lucide-vue-next'

defineProps<{
  sugerencias: SugerenciaGraficoAncladoIA[]
}>()

const emit = defineEmits<{
  (e: 'aceptarUno', sug: SugerenciaGraficoAncladoIA): void
  (e: 'rechazarUno', id: string): void
  (e: 'aceptarTodos'): void
  (e: 'rechazarTodos'): void
}>()
</script>

<template>
  <div
    v-if="sugerencias.length > 0"
    class="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent border border-blue-500/30 space-y-3 text-left"
  >
    <!-- Mini-Notificación Principal -->
    <div class="flex items-start justify-between gap-3">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-500 shrink-0">
          <Pin class="w-4 h-4" />
        </div>
        <div>
          <span class="text-[10px] font-black uppercase tracking-wider text-blue-500 flex items-center gap-1">
            <span>Mini-Notificación · Gráficos Anclados</span>
          </span>
          <h4 class="text-xs font-extrabold text-slate-900 dark:text-white leading-snug">
            Te sugiero crear los gráficos anclados en el Dashboard. ¿Deseas anclarlos?
          </h4>
        </div>
      </div>

      <!-- Botones Sí / No -->
      <div class="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          @click="emit('aceptarTodos')"
          class="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-extrabold flex items-center gap-1 cursor-pointer shadow-xs transition-all active:scale-95"
          title="Anclar todos los gráficos sugeridos"
        >
          <Check class="w-3 h-3" />
          <span>Sí ({{ sugerencias.length }})</span>
        </button>
        <button
          type="button"
          @click="emit('rechazarTodos')"
          class="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
          title="Omitir sugerencia de gráficos"
        >
          <X class="w-3 h-3" />
          <span>No</span>
        </button>
      </div>
    </div>

    <!-- Lista de gráficos sugeridos para anclar -->
    <div class="space-y-2">
      <div
        v-for="graf in sugerencias"
        :key="graf.id"
        class="p-3 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 flex items-start justify-between gap-3"
      >
        <div class="space-y-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <component
              :is="graf.tipoGrafico === 'barras' ? BarChart3 : PieChart"
              class="w-3.5 h-3.5 text-blue-500 shrink-0"
            />
            <span class="text-xs font-black text-slate-900 dark:text-white truncate">
              {{ graf.tituloSugerido }}
            </span>
            <span class="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 text-[9px] font-mono font-bold uppercase">
              {{ graf.tipoGrafico === 'barras' ? 'Barras' : 'Pastel / PAI' }}
            </span>
          </div>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
            Pregunta: "{{ graf.textoPregunta }}"
          </p>
          <p class="text-[10px] text-blue-600/80 dark:text-blue-400/80 font-medium">
            {{ graf.razonAnclaje }}
          </p>
        </div>

        <div class="flex items-center gap-1 shrink-0">
          <button
            type="button"
            @click="emit('aceptarUno', graf)"
            class="px-2.5 py-1 rounded-lg bg-blue-500/15 hover:bg-blue-600 text-blue-700 dark:text-blue-300 hover:text-white text-[10px] font-extrabold transition-all cursor-pointer"
          >
            Sí, anclar
          </button>
          <button
            type="button"
            @click="emit('rechazarUno', graf.id)"
            class="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
