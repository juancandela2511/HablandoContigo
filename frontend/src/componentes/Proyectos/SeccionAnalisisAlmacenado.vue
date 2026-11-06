<!--
  ============================================================================
  SECCIÓN DE ANÁLISIS ALMACENADO DEL PROYECTO FINALIZADO (SeccionAnalisisAlmacenado.vue)
  ============================================================================
  Muestra los KPIs y gráficos históricos almacenados de un proyecto finalizado.
-->

<script setup lang="ts">
import GraficosAncladosVisualizador from '@/componentes/Dashboard/Graficos/GraficosAncladosVisualizador.vue'
import type { SegmentoGrafico } from '@/services/adaptadorRespuestasGraficos'

export interface DatosAnalisisAlmacenado {
  totalRespuestas: number
  porcentajeSatisfaccion: number
  puntajePromedio: number
  alertasDetectadas: number
  fechaCierre: string
  anioCierre: number
  graficasPorPregunta: Array<{
    indice: number
    id: string
    texto: string
    categoria: string
    tipoGrafico: 'barras' | 'pastel'
    totalMuestras: number
    segmentos: SegmentoGrafico[]
  }>
}

defineProps<{
  analisis: DatosAnalisisAlmacenado
}>()
</script>

<template>
  <div class="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-indigo-500/40 dark:border-indigo-500/30 shadow-lg space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider border border-amber-500/30">
            Proyecto Finalizado — Solo Lectura
          </span>
          <span class="text-xs font-mono text-slate-500 dark:text-slate-400">
            Cierre: {{ analisis.fechaCierre }}
          </span>
        </div>
        <h2 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
          Análisis Almacenado del Periodo ({{ analisis.anioCierre }})
        </h2>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Resultados históricos almacenados al finalizar el proyecto. Las gráficas siguen el orden de las preguntas superiores.
        </p>
      </div>

      <div class="flex items-center gap-3 flex-wrap">
        <div class="px-4 py-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-center">
          <div class="text-lg font-black font-mono text-indigo-600 dark:text-indigo-400">
            {{ analisis.porcentajeSatisfaccion }}%
          </div>
          <div class="text-[10px] font-bold uppercase text-slate-500">Clima Final</div>
        </div>
        <div class="px-4 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
          <div class="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
            {{ analisis.totalRespuestas }}
          </div>
          <div class="text-[10px] font-bold uppercase text-slate-500">Respuestas Guardadas</div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div
        v-for="itemGraf in analisis.graficasPorPregunta"
        :key="itemGraf.id"
        class="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between"
      >
        <div class="space-y-1.5">
          <div class="flex items-center justify-between gap-2">
            <span class="px-2.5 py-0.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black font-mono">
              Pregunta #{{ itemGraf.indice }}
            </span>
            <span class="text-[10px] font-mono font-bold text-slate-500">
              {{ itemGraf.totalMuestras }} resp.
            </span>
          </div>
          <p class="text-xs font-bold text-sky-600 dark:text-sky-400">
            {{ itemGraf.categoria }}
          </p>
          <h4 class="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
            {{ itemGraf.texto }}
          </h4>
        </div>

        <GraficosAncladosVisualizador
          :tipoGrafico="itemGraf.tipoGrafico"
          :segmentos="itemGraf.segmentos"
          :totalMuestras="itemGraf.totalMuestras"
        />
      </div>
    </div>
  </div>
</template>
