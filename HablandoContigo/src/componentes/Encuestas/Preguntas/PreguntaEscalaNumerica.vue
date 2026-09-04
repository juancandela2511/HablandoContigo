<!--
  ============================================================================
  PREGUNTA DE ESCALA NUMÉRICA 1 A 5 (PreguntaEscalaNumerica.vue)
  ============================================================================
-->

<script setup lang="ts">
import type { OpcionPregunta } from '@/Servicios/iaEncuestasService'

defineProps<{
  opciones?: OpcionPregunta[]
  respuestaSeleccionada: any
}>()

const emit = defineEmits<{
  (e: 'seleccionar', opcion: OpcionPregunta): void
}>()
</script>

<template>
  <div class="space-y-3 pt-2 text-left">
    <div class="grid grid-cols-5 gap-2 sm:gap-3">
      <button
        v-for="opc in opciones"
        :key="opc.id"
        type="button"
        @click="emit('seleccionar', opc)"
        :class="[
          'p-3 sm:p-4 rounded-2xl border text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-1 group',
          respuestaSeleccionada?.texto === opc.texto
            ? 'bg-slate-950 text-white dark:bg-white dark:text-black border-slate-950 dark:border-white shadow-xl scale-105 font-bold'
            : 'bg-slate-100 dark:bg-neutral-900/80 text-slate-700 dark:text-neutral-300 border-slate-200 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/30 hover:bg-slate-200 dark:hover:bg-neutral-800'
        ]"
      >
        <span class="text-base sm:text-xl font-black font-mono">{{ opc.valor }}</span>
        <span 
          class="text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold opacity-80 leading-tight hidden sm:block"
          :class="respuestaSeleccionada?.texto === opc.texto ? 'text-white dark:text-black' : 'text-slate-500 dark:text-neutral-400'"
        >
          {{ opc.texto.split('-')[1]?.trim() || opc.texto }}
        </span>
      </button>
    </div>

    <div class="flex items-center justify-between text-[11px] text-slate-500 dark:text-neutral-500 px-1 font-mono">
      <span>1: Muy bajo / Malestar</span>
      <span>5: Plena satisfacción</span>
    </div>
  </div>
</template>
