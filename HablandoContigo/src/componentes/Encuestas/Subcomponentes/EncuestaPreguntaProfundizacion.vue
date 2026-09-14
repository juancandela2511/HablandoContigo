<!--
  ============================================================================
  SUBCOMPONENTE PREGUNTA DE PROFUNDIZACIÓN (EncuestaPreguntaProfundizacion.vue)
  ============================================================================
  Renderiza con animación suave el cuadro de profundización anclado cuando
  la pregunta es interactiva o se selecciona una opción de bajo puntaje.
-->

<script setup lang="ts">
import type { PreguntaAncladaConfig } from '@/Servicios/iaEncuestasService'

defineProps<{
  preguntaAnclada: PreguntaAncladaConfig | null
  textoRespuestaAnclada?: string
}>()

const emit = defineEmits<{
  (e: 'actualizarRespuestaAnclada', valor: string): void
}>()
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-400 ease-out"
    enter-from-class="opacity-0 -translate-y-3 max-h-0 scale-95"
    enter-to-class="opacity-100 translate-y-0 max-h-[500px] scale-100"
    leave-active-class="transition-all duration-250 ease-in"
    leave-from-class="opacity-100 translate-y-0 max-h-[500px] scale-100"
    leave-to-class="opacity-0 -translate-y-3 max-h-0 scale-95"
  >
    <div
      v-if="preguntaAnclada"
      class="overflow-hidden pt-2 text-left font-['Poppins',sans-serif]"
    >
      <div class="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-sky-500/10 via-indigo-500/10 to-transparent border-2 border-sky-500/40 shadow-xl shadow-sky-500/5 space-y-3 relative">
        
        <!-- Indicador decorativo -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-lg bg-sky-500 text-slate-950 flex items-center justify-center text-xs font-black shadow-sm animate-pulse">
              ⚡
            </span>
            <span class="text-xs font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400 font-mono">
              Pregunta de Profundización Desglosada
            </span>
          </div>

          <span
            :class="[
              'text-[10px] font-bold px-2.5 py-0.5 rounded-full border font-mono',
              preguntaAnclada.obligatoria
                ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800'
                : 'bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800'
            ]"
          >
            {{ preguntaAnclada.obligatoria ? 'Campo Requerido' : 'Opcional' }}
          </span>
        </div>

        <div class="space-y-1">
          <h4 class="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-snug">
            {{ preguntaAnclada.texto }}
          </h4>
          <p class="text-[11px] text-slate-500 dark:text-neutral-400">
            Esta pregunta se activó para profundizar en tu respuesta anterior con total confidencialidad y anonimato.
          </p>
        </div>

        <div class="relative">
          <textarea
            :value="textoRespuestaAnclada"
            @input="emit('actualizarRespuestaAnclada', ($event.target as HTMLTextAreaElement).value)"
            rows="3"
            class="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-950 border border-sky-300 dark:border-sky-500/40 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 resize-none transition-all shadow-inner"
            :placeholder="preguntaAnclada.placeholder || 'Escribe aquí para profundizar o explicar la situación con total libertad...'"
          />
        </div>
      </div>
    </div>
  </Transition>
</template>
