<!--
  ============================================================================
  TARJETA DE PROYECTO ORGANIZACIONAL (TarjetaProyectoItem.vue)
  ============================================================================
  Representa cada tarjeta en la cuadrícula de Proyectos Organizacionales.
-->

<script setup lang="ts">
import type { Encuesta } from '@/Almacenes/useEncuestas'
import {
  ClipboardList,
  Users,
  ChevronRight,
  Lock,
  RotateCcw,
  Eye,
  BarChart3
} from 'lucide-vue-next'

defineProps<{
  proyecto: Encuesta
  indice: number
  totalRespuestas: number
  esRevertible: boolean
  tiempoRestanteTexto: string
}>()

const emit = defineEmits<{
  (e: 'abrir', id: string): void
  (e: 'solicitarPassword', proyecto: Encuesta, accion: 'finalizar_y_comparar' | 'solo_comparar' | 'reabrir'): void
}>()
</script>

<template>
  <div
    @click="emit('abrir', proyecto.id)"
    :class="[
      'p-6 rounded-3xl border transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl group relative overflow-hidden flex flex-col justify-between space-y-4',
      indice === 0
        ? 'bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/30 dark:from-slate-900 dark:via-blue-950/20 dark:to-slate-900 border-blue-400/60 dark:border-blue-500/40 hover:border-blue-500 ring-2 ring-blue-500/20'
        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
    ]"
  >
    <div class="flex items-center justify-between gap-2">
      <span
        v-if="indice === 0"
        class="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1.5"
      >
        <span>Proyecto Principal — Clima Laboral</span>
      </span>
      <span
        v-else
        class="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-mono font-bold"
      >
        Proyecto {{ indice + 1 }}
      </span>

      <span
        :class="[
          'px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1',
          proyecto.estado === 'Finalizada'
            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
            : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
        ]"
      >
        <span
          class="w-1.5 h-1.5 rounded-full"
          :class="proyecto.estado === 'Finalizada' ? (esRevertible ? 'bg-amber-500 animate-pulse' : 'bg-amber-500') : 'bg-emerald-500 animate-pulse'"
        />
        <span>{{ proyecto.estado === 'Finalizada' ? (esRevertible ? `Finalizado · ${tiempoRestanteTexto}` : 'Finalizado') : 'Activo' }}</span>
      </span>
    </div>

    <div class="space-y-1.5">
      <h3 class="text-lg font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
        {{ indice === 0 ? 'Proyecto Clima Laboral' : proyecto.titulo }}
      </h3>
    </div>

    <div class="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
      <div class="flex items-center gap-1.5">
        <ClipboardList class="w-3.5 h-3.5 text-blue-500" />
        <span>{{ proyecto.preguntas?.length || 30 }} preguntas</span>
      </div>
      <div class="flex items-center gap-1.5">
        <Users class="w-3.5 h-3.5 text-emerald-500" />
        <span>{{ totalRespuestas }} respuestas</span>
      </div>
    </div>

    <div class="pt-2 space-y-2">
      <div class="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-600 text-slate-700 dark:text-slate-300 group-hover:text-white font-bold text-xs flex items-center justify-between transition-all">
        <span>{{ proyecto.estado === 'Finalizada' ? 'Solo Lectura — Ver Preguntas y Análisis Abajo' : 'Ver y Editar Preguntas' }}</span>
        <ChevronRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>

      <div class="grid grid-cols-2 gap-2" @click.stop>
        <button
          v-if="proyecto.estado !== 'Finalizada'"
          type="button"
          @click.stop="emit('solicitarPassword', proyecto, 'finalizar_y_comparar')"
          class="py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500 text-amber-700 dark:text-amber-300 hover:text-white border border-amber-500/30 font-extrabold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <Lock class="w-3.5 h-3.5" />
          <span>Finalizar</span>
        </button>
        <button
          v-else
          type="button"
          @click.stop="esRevertible ? emit('solicitarPassword', proyecto, 'reabrir') : emit('abrir', proyecto.id)"
          :class="[
            'py-2 px-3 rounded-xl font-extrabold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer border',
            esRevertible
              ? 'bg-emerald-500/15 hover:bg-emerald-600 text-emerald-700 dark:text-emerald-300 hover:text-white border-emerald-500/40 shadow-xs'
              : 'bg-amber-500/15 hover:bg-amber-600 text-amber-700 dark:text-amber-300 hover:text-white border-amber-500/30'
          ]"
        >
          <component :is="esRevertible ? RotateCcw : Eye" class="w-3.5 h-3.5" />
          <span>{{ esRevertible ? 'Revertir Cierre' : 'Solo Ver Análisis' }}</span>
        </button>

        <button
          type="button"
          @click.stop="emit('solicitarPassword', proyecto, 'solo_comparar')"
          class="py-2 px-3 rounded-xl bg-indigo-500/15 hover:bg-indigo-600 text-indigo-700 dark:text-indigo-300 hover:text-white border border-indigo-500/30 font-extrabold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <BarChart3 class="w-3.5 h-3.5" />
          <span>Comparativa</span>
        </button>
      </div>
    </div>
  </div>
</template>
