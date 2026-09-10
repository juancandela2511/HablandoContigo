<!--
  ============================================================================
  PREGUNTA DE OPCIÓN MÚLTIPLE CON SENTIMIENTO (PreguntaOpcionMultiple.vue)
  ============================================================================
-->

<script setup lang="ts">
import { Check } from 'lucide-vue-next'
import type { OpcionPregunta } from '@/Servicios/iaEncuestasService'

defineProps<{
  opciones?: OpcionPregunta[]
  respuestaSeleccionada: any
}>()

const emit = defineEmits<{
  (e: 'seleccionar', opcion: OpcionPregunta): void
}>()

const obtenerColorSentimiento = (opcion: OpcionPregunta) => {
  const texto = (opcion.texto || '').toLowerCase()
  if (texto === 'bien' || opcion.valor === 5 || opcion.valor === 4) {
    return 'bg-emerald-400'
  }
  if (texto === 'regular' || opcion.valor === 3) {
    return 'bg-amber-400'
  }
  if (texto === 'mal' || opcion.valor === 1 || opcion.valor === 2 || opcion.esAlerta) {
    return 'bg-rose-500'
  }
  return 'bg-sky-400'
}
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-left">
    <button
      v-for="(opc, idx) in opciones"
      :key="opc.id"
      type="button"
      @click="emit('seleccionar', opc)"
      :class="[
        'p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer flex items-center justify-between group relative overflow-hidden',
        respuestaSeleccionada?.texto === opc.texto
          ? 'bg-slate-950 text-white dark:bg-white dark:text-black border-sky-500/80 dark:border-sky-400 shadow-xl shadow-sky-500/10 scale-[1.03] ring-2 ring-sky-400/40 font-bold'
          : 'bg-slate-100 dark:bg-neutral-900/80 text-slate-700 dark:text-neutral-300 border-slate-200 dark:border-white/10 hover:border-sky-400/60 dark:hover:border-sky-400/60 hover:bg-slate-200 dark:hover:bg-neutral-800/90 hover:scale-[1.01]'
      ]"
    >
      <div class="flex items-center gap-3 min-w-0">
        <span 
          class="w-3 h-3 rounded-full shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-125"
          :class="obtenerColorSentimiento(opc)"
        />
        <div class="min-w-0">
          <span class="text-sm font-semibold leading-snug block truncate">{{ opc.texto }}</span>
          <span 
            v-if="opc.preguntaAnclada" 
            class="text-[9px] font-mono font-bold text-sky-500 dark:text-sky-400 flex items-center gap-0.5 mt-0.5"
          >
            ⚡ Desglosa pregunta
          </span>
        </div>
      </div>

      <span 
        class="w-6 h-6 rounded-full border flex items-center justify-center shrink-0 text-xs ml-2 transition-all duration-200"
        :class="respuestaSeleccionada?.texto === opc.texto ? 'border-white dark:border-black bg-white dark:bg-black text-black dark:text-white shadow-md scale-110' : 'border-slate-400 dark:border-neutral-600 text-slate-500 dark:text-neutral-500 group-hover:border-sky-400 group-hover:text-sky-500'"
      >
        <Check v-if="respuestaSeleccionada?.texto === opc.texto" class="w-3.5 h-3.5 stroke-[3] animate-bounce" />
        <span v-else class="text-[10px] font-mono">{{ idx + 1 }}</span>
      </span>
    </button>
  </div>
</template>
