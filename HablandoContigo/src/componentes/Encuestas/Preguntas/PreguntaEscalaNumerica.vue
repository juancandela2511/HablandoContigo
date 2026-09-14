<!--
  ============================================================================
  PREGUNTA DE ESCALA PARA COLABORADORES (PreguntaEscalaNumerica.vue)
  - Sin visualización de puntajes internos ni métricas de proceso para los encuestados.
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
    <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
      <button
        v-for="opc in opciones"
        :key="opc.id"
        type="button"
        @click="emit('seleccionar', opc)"
        :class="[
          'p-3 sm:p-4 rounded-2xl border text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-1 group min-h-[56px]',
          respuestaSeleccionada?.texto === opc.texto
            ? 'bg-slate-950 text-white dark:bg-white dark:text-black border-slate-950 dark:border-white shadow-xl scale-[1.02] font-extrabold'
            : 'bg-slate-100 dark:bg-neutral-900/80 text-slate-700 dark:text-neutral-300 border-slate-200 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/30 hover:bg-slate-200 dark:hover:bg-neutral-800 font-medium'
        ]"
      >
        <!-- Opción clara sin números de puntaje interno visible para el encuestado -->
        <span 
          class="text-xs sm:text-sm font-semibold tracking-tight text-center leading-snug"
          :class="respuestaSeleccionada?.texto === opc.texto ? 'text-white dark:text-black' : 'text-slate-800 dark:text-neutral-200'"
        >
          {{ opc.texto.includes('-') ? opc.texto.split('-')[1]?.trim() : opc.texto }}
        </span>
      </button>
    </div>

    <div class="flex items-center justify-between text-[11px] text-slate-500 dark:text-neutral-500 px-1 font-sans">
      <span>Menor satisfacción</span>
      <span>Mayor satisfacción</span>
    </div>
  </div>
</template>
