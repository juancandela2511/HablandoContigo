<!--
  ============================================================================
  COMPONENTE TARJETA DE PROYECTO DE ENCUESTA (ProyectosTarjetaItem.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Tarjeta cristalina que representa un proyecto individual de encuesta:
  - Badge de departamento y estado operativo (Activa/Pausada).
  - Título y descripción de la encuesta.
  - Indicadores de total de respuestas anónimas y alertas de acoso/carga detectadas.
  - Botón para copiar el enlace anónimo.
  - Botón para abrir y probar la vista del encuestado (`/responder/:id`).
  - Botón para eliminar el proyecto.
  
  ¿PARA QUÉ SIRVE?
  - Visualizar los datos ejecutivos de cada campaña de clima laboral en la galería.
  
  ¿CON QUÉ ESTÁ VINCULADO / CONECTADO?
  - useEncuestas.ts: Tipo `Encuesta`.
  - ProyectosGaleria.vue / ProyectosView.vue: Componentes padres.
-->

<script setup lang="ts">
import type { Encuesta } from '@/Almacenes/useEncuestas'
import { Copy, ExternalLink, Trash2, Eraser, Pencil } from 'lucide-vue-next'

defineProps<{
  encuesta: Encuesta
}>()

defineEmits<{
  (e: 'copiarEnlace', id: string): void
  (e: 'irAResponder', id: string): void
  (e: 'editarEncuesta', encuesta: Encuesta): void
  (e: 'eliminarEncuesta', id: string): void
  (e: 'vaciarEstadisticas', id: string): void
}>()
</script>

<template>
  <div class="rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between hover:border-sky-500/40 transition-all group">
    <div class="space-y-3">
      
      <div class="flex items-start justify-between gap-2">
        <span class="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sky-700 dark:text-sky-400">
          {{ encuesta.departamento }}
        </span>
        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          {{ encuesta.estado }}
        </span>
      </div>

      <div>
        <h3 class="text-base font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
          {{ encuesta.titulo }}
        </h3>
        <p class="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
          {{ encuesta.descripcion }}
        </p>
      </div>

      <!-- Indicadores de métricas -->
      <div class="grid grid-cols-2 gap-2 pt-3 border-t border-slate-200 dark:border-slate-800/80 text-xs">
        <div class="bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span class="text-slate-500 text-[10px] uppercase font-semibold">Respuestas</span>
          <p class="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
            {{ encuesta.totalRespuestas || 0 }} anónimas
          </p>
        </div>
        <div class="bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span class="text-slate-500 text-[10px] uppercase font-semibold">Alertas Acoso/Carga</span>
          <p class="text-sm font-bold mt-0.5" :class="(encuesta.alertasRegistradas || 0) > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-300'">
            {{ encuesta.alertasRegistradas || 0 }} detectadas
          </p>
        </div>
      </div>

    </div>

    <!-- Botones de Acción de la Tarjeta -->
    <div class="pt-5 mt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
      
      <button
        @click="$emit('copiarEnlace', encuesta.id)"
        class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
        title="Copiar enlace para los encuestados"
      >
        <Copy class="w-3.5 h-3.5 text-sky-500" />
        <span>Copiar Enlace</span>
      </button>

      <div class="flex items-center gap-1.5">
        <button
          @click="$emit('editarEncuesta', encuesta)"
          class="p-2 rounded-xl text-slate-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-all cursor-pointer"
          title="Editar preguntas y opciones de esta encuesta"
        >
          <Pencil class="w-3.5 h-3.5" />
        </button>

        <button
          @click="$emit('vaciarEstadisticas', encuesta.id)"
          class="p-2 rounded-xl text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-all cursor-pointer"
          title="Vaciar respuestas y limpiar estadísticas de esta encuesta"
        >
          <Eraser class="w-3.5 h-3.5" />
        </button>

        <button
          @click="$emit('irAResponder', encuesta.id)"
          class="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/80 hover:bg-blue-200 dark:hover:bg-blue-900 border border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-white transition-all cursor-pointer"
          title="Abrir vista anónima del encuestado"
        >
          <ExternalLink class="w-3.5 h-3.5" />
        </button>

        <button
          @click="$emit('eliminarEncuesta', encuesta.id)"
          class="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all cursor-pointer"
          title="Eliminar Proyecto"
        >
          <Trash2 class="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  </div>
</template>
