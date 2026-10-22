<!--
  ============================================================================
  SUBCOMPONENTE COMENTARIOS DE LA PREGUNTA (EncuestaPreguntaProfundizacion.vue)
  ============================================================================
  Permite ingresar comentarios voluntarios cuando la opción de comentarios está
  habilitada en la pregunta y se selecciona la opción de mejor puntaje.
-->

<script setup lang="ts">
import { MessageSquarePlus, Sparkles } from 'lucide-vue-next'

defineProps<{
  mostrar: boolean
  textoRespuestaAnclada?: string
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'actualizarRespuestaAnclada', valor: string): void
  (e: 'continuar'): void
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
      v-if="mostrar"
      class="overflow-hidden pt-2 text-left font-['Poppins',sans-serif]"
    >
      <div class="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-transparent dark:from-amber-950/20 dark:via-slate-900/80 dark:to-transparent border-2 border-amber-400/60 dark:border-amber-500/40 shadow-xl shadow-amber-500/5 space-y-3 relative">
        
        <!-- Encabezado de Comentarios: ¿Qué pasó? -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-lg bg-amber-600 text-white flex items-center justify-center text-xs font-black shadow-xs">
              <MessageSquarePlus class="w-3.5 h-3.5" />
            </span>
            <span class="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 font-mono">
              Comentarios · ¿Qué pasó?
            </span>
          </div>

          <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-mono">
            Retroalimentación
          </span>
        </div>

        <div class="space-y-1">
          <h4 class="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
            ¿Qué pasó? Cuéntanos qué sucedió
          </h4>
          <p class="text-[11px] text-slate-500 dark:text-neutral-400">
            Al seleccionar una valoración baja, tu explicación es vital para investigar y tomar acciones correctivas de forma anónima con IA.
          </p>
        </div>

        <div class="relative space-y-1">
          <textarea
            :value="textoRespuestaAnclada"
            @input="emit('actualizarRespuestaAnclada', ($event.target as HTMLTextAreaElement).value)"
            rows="3"
            class="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-950 border border-amber-200 dark:border-amber-500/30 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 resize-none transition-all shadow-inner"
            :placeholder="placeholder || '¿Qué pasó? Describe la situación, persona o motivo que ocasionó tu respuesta...'"
          />
          <p class="text-[10px] text-slate-400 dark:text-slate-500 italic px-1">
            Tu comentario es opcional y confidencial. Cuando termines, presiona el botón Siguiente de la pregunta.
          </p>
        </div>
      </div>
    </div>
  </Transition>
</template>
