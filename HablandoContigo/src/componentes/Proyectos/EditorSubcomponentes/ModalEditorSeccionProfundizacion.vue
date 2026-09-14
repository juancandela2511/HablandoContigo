<!--
  ============================================================================
  SUBCOMPONENTE PROFUNDIZACIÓN EN EL TEMA (ModalEditorSeccionProfundizacion.vue)
  ============================================================================
  Sección del editor para configurar la profundización inteligente y confidencial
  en respuestas de menor puntaje.
-->

<script setup lang="ts">
import { MessageSquarePlus, Sparkles } from 'lucide-vue-next'
import type { PreguntaEncuesta } from '@/Servicios/iaEncuestasService'

const props = defineProps<{
  copia: PreguntaEncuesta
}>()

const emit = defineEmits<{
  (e: 'toggle'): void
}>()
</script>

<template>
  <div class="p-5 rounded-2xl bg-gradient-to-br from-sky-50/90 via-blue-50/60 to-indigo-50/80 dark:from-sky-950/40 dark:via-slate-900/80 dark:to-indigo-950/30 border border-sky-200 dark:border-sky-900/50 space-y-3 shadow-sm font-['Poppins',sans-serif]">
    <div class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-sky-500/20">
          <MessageSquarePlus class="w-5 h-5" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h4 class="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
              Profundizar en el Tema (Pregunta Interactiva)
            </h4>
            <span
              :class="[
                'text-[9px] px-2 py-0.5 rounded-full font-black tracking-wider uppercase',
                (copia.deteccionQuejas || copia.solicitarPorQueSiNegativo)
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
              ]"
            >
              {{ (copia.deteccionQuejas || copia.solicitarPorQueSiNegativo) ? 'Activo' : 'Inactivo' }}
            </span>
          </div>
          <p class="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
            Si la persona elige la opción de menor puntaje o respuesta negativa, la encuesta profundizará solicitando detalles de forma confidencial.
          </p>
        </div>
      </div>

      <!-- Switch Booleano Único -->
      <button
        type="button"
        @click="emit('toggle')"
        :class="[
          'relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none shadow-inner',
          (copia.deteccionQuejas || copia.solicitarPorQueSiNegativo) ? 'bg-sky-500' : 'bg-slate-300 dark:bg-slate-700'
        ]"
      >
        <span
          :class="[
            'pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out',
            (copia.deteccionQuejas || copia.solicitarPorQueSiNegativo) ? 'translate-x-5' : 'translate-x-0'
          ]"
        />
      </button>
    </div>

    <!-- Mensaje explicativo de la pregunta de profundización -->
    <div v-if="copia.deteccionQuejas || copia.solicitarPorQueSiNegativo" class="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-sky-200/80 dark:border-sky-900/40 text-xs text-sky-900 dark:text-sky-300 flex items-start gap-2">
      <Sparkles class="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
      <p class="italic">
        <strong>Pregunta de profundización al encuestado:</strong> "¿Te gustaría profundizar en el tema o compartir más detalles sobre tu respuesta? Tu opinión es 100% anónima, confidencial y libre de represalias."
      </p>
    </div>
  </div>
</template>
