<!--
  ============================================================================
  TARJETA DE MEJORA PSICOMÉTRICA DE PREGUNTAS (TarjetaSugerenciaPreguntas.vue)
  ============================================================================
  Muestra sugerencias de Ollama para reformular preguntas de la encuesta
  y al dar "Aceptar" aplica los cambios en tiempo real sobre la encuesta activa.
-->

<script setup lang="ts">
import type { SugerenciaCambioPreguntaIA } from '@/asistenteOllama/tiposAsistente'
import { Wand2, Check, X, ArrowRight } from 'lucide-vue-next'

defineProps<{
  sugerencias: SugerenciaCambioPreguntaIA[]
}>()

const emit = defineEmits<{
  (e: 'aceptarCambio', sug: SugerenciaCambioPreguntaIA): void
  (e: 'rechazarCambio', id: string): void
  (e: 'aceptarTodos'): void
}>()
</script>

<template>
  <div
    v-if="sugerencias.length > 0"
    class="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-transparent border border-purple-500/30 space-y-3 text-left"
  >
    <!-- Cabecera de Sugerencia de Preguntas -->
    <div class="flex items-start justify-between gap-3">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-500 shrink-0">
          <Wand2 class="w-4 h-4" />
        </div>
        <div>
          <span class="text-[10px] font-black uppercase tracking-wider text-purple-500 block">
            Optimización Psicométrica · Ollama IA
          </span>
          <h4 class="text-xs font-extrabold text-slate-900 dark:text-white leading-snug">
            Te sugiero reformular estas preguntas para mayor claridad y asertividad:
          </h4>
        </div>
      </div>

      <button
        type="button"
        @click="emit('aceptarTodos')"
        class="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-extrabold flex items-center gap-1 cursor-pointer shadow-xs transition-all active:scale-95 shrink-0"
      >
        <Check class="w-3 h-3" />
        <span>Aceptar Todas ({{ sugerencias.length }})</span>
      </button>
    </div>

    <!-- Lista comparativa de preguntas -->
    <div class="space-y-2.5">
      <div
        v-for="item in sugerencias"
        :key="item.id"
        class="p-3 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 space-y-2"
      >
        <div class="flex items-center justify-between gap-2">
          <span class="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[9px] font-mono font-bold uppercase">
            {{ item.categoria }} · ID: {{ item.idPregunta }}
          </span>

          <div class="flex items-center gap-1">
            <button
              type="button"
              @click="emit('aceptarCambio', item)"
              class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-extrabold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
            >
              <Check class="w-3 h-3" />
              <span>Aceptar cambio</span>
            </button>
            <button
              type="button"
              @click="emit('rechazarCambio', item.id)"
              class="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              title="Descartar cambio"
            >
              <X class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <!-- Comparativa antes vs después -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          <div class="p-2 rounded-lg bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span class="text-[9px] font-bold uppercase text-slate-400 block mb-0.5">Actual:</span>
            <p class="text-slate-600 dark:text-slate-400 line-through">
              "{{ item.textoActual }}"
            </p>
          </div>

          <div class="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <span class="text-[9px] font-bold uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mb-0.5">
              <ArrowRight class="w-2.5 h-2.5" />
              <span>Sugerida por Ollama:</span>
            </span>
            <p class="text-slate-900 dark:text-white font-semibold">
              "{{ item.textoSugerido }}"
            </p>
          </div>
        </div>

        <p class="text-[10px] text-slate-500 dark:text-slate-400 italic">
          💡 {{ item.justificacionPsicometrica }}
        </p>
      </div>
    </div>
  </div>
</template>
