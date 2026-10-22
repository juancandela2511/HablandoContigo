<!--
  ============================================================================
  SUB-SECCIÓN DE DETECCIÓN DE PERSONAS CON IA (GeneralSeccionPersonasIA.vue)
  ============================================================================
-->
<script setup lang="ts">
import { UserX, CheckCircle2 } from 'lucide-vue-next'

export interface MencionColaborador {
  id: string
  nombre: string
  conteoMenciones: number
  sentimiento: string
  frasesEjemplo: string[]
  estadoEncasillado: string
}

defineProps<{
  colaboradoresMencionados: MencionColaborador[]
}>()

const emit = defineEmits<{
  (e: 'encasillarAlerta', mencion: MencionColaborador): void
}>()
</script>

<template>
  <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
    <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
          <UserX class="w-4 h-4" />
        </div>
        <div>
          <h3 class="text-xs font-black tracking-wider uppercase text-slate-900 dark:text-white">
            Detección de Colaboradores / Nombres Mencionados (IA)
          </h3>
          <p class="text-[11px] text-slate-500">
            La IA indexa nombres propios o líderes citados en preguntas abiertas para encasillar o descartar.
          </p>
        </div>
      </div>
    </div>

    <div v-if="colaboradoresMencionados.length === 0" class="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 text-center space-y-2 text-xs text-slate-500">
      <CheckCircle2 class="w-8 h-8 text-emerald-500 mx-auto" />
      <p class="font-bold">No hay personas citadas con señales de conflicto en este momento.</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="mencion in colaboradoresMencionados"
        :key="mencion.id"
        class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3"
      >
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="text-xs font-black text-slate-900 dark:text-white">
              {{ mencion.nombre }}
            </span>
            <span
              :class="[
                'text-[10px] font-bold px-2 py-0.5 rounded-full',
                mencion.sentimiento === 'Atención/Fricción'
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
              ]"
            >
              {{ mencion.sentimiento }} · {{ mencion.conteoMenciones }} mención(es)
            </span>
          </div>
          <p
            v-for="(frase, fIdx) in mencion.frasesEjemplo"
            :key="fIdx"
            class="text-[11px] text-slate-600 dark:text-slate-400 italic"
          >
            "{{ frase }}"
          </p>
        </div>

        <button
          type="button"
          @click="emit('encasillarAlerta', mencion)"
          class="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold shrink-0 cursor-pointer transition-colors"
        >
          🚨 Convertir en Alerta
        </button>
      </div>
    </div>
  </div>
</template>
