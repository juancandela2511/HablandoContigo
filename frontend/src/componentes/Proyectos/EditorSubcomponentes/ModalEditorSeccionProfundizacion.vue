<!--
  ============================================================================
  SUBCOMPONENTE PROFUNDIZACIÓN EN EL TEMA (ModalEditorSeccionProfundizacion.vue)
  ============================================================================
  Sección del editor para configurar la profundización inteligente y confidencial
  en respuestas de menor puntaje.
-->

<script setup lang="ts">
import { MessageSquarePlus, Sparkles } from 'lucide-vue-next'
import type { PreguntaEncuesta } from '@/ia'

const props = defineProps<{
  copia: PreguntaEncuesta
}>()

const emit = defineEmits<{
  (e: 'toggle'): void
}>()
</script>

<template>
  <div class="p-3 rounded-2xl bg-gradient-to-br from-sky-50/90 via-blue-50/60 to-indigo-50/80 dark:from-sky-950/30 dark:via-slate-900/80 dark:to-indigo-950/30 border border-sky-200/80 dark:border-sky-900/40 shadow-xs font-['Poppins',sans-serif]">
    <div class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-2.5 min-w-0">
        <div class="w-7 h-7 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-xs">
          <MessageSquarePlus class="w-3.5 h-3.5" />
        </div>
        <div class="min-w-0">
          <div class="flex items-center gap-1.5 flex-wrap">
            <h5 class="text-xs font-extrabold text-slate-900 dark:text-white truncate">
              Comentarios
            </h5>
            <span
              :class="[
                'text-[9px] px-1.5 py-0.2 rounded-full font-black tracking-wider uppercase shrink-0',
                (copia.deteccionQuejas || copia.solicitarPorQueSiNegativo || (copia as any).comentariosHabilitados)
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
              ]"
            >
              {{ (copia.deteccionQuejas || copia.solicitarPorQueSiNegativo || (copia as any).comentariosHabilitados) ? 'Activo' : 'Inactivo' }}
            </span>
          </div>
          <p class="text-[10px] text-slate-500 dark:text-slate-400 truncate">
            Permite comentar "¿Qué pasó?" si el colaborador selecciona la menor valoración
          </p>
        </div>
      </div>

      <!-- Switch Booleano Único -->
      <button
        type="button"
        @click="emit('toggle')"
        :class="[
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none shadow-inner',
          (copia.deteccionQuejas || copia.solicitarPorQueSiNegativo || (copia as any).comentariosHabilitados) ? 'bg-sky-500' : 'bg-slate-300 dark:bg-slate-700'
        ]"
      >
        <span
          :class="[
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out',
            (copia.deteccionQuejas || copia.solicitarPorQueSiNegativo || (copia as any).comentariosHabilitados) ? 'translate-x-5' : 'translate-x-0'
          ]"
        />
      </button>
    </div>
  </div>
</template>
