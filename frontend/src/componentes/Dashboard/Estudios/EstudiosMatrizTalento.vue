<!--
  ============================================================================
  MATRIZ Y CATÁLOGO DE TALENTO DE ESTUDIOS (EstudiosMatrizTalento.vue)
  ============================================================================
  PROPÓSITO:
  Muestra la tarjeta de mayor concentración académica del equipo y el catálogo 
  de aprovechamiento de competencias internas.

  CONEXIONES:
  - Consumido por: AnaliticaBloqueEstudio.vue
  - Recibe Props: programaLider (object | null), listaEstudios (array de programas)
-->

<script setup lang="ts">
import { Award, CheckCircle2, GraduationCap, Brain } from 'lucide-vue-next'
import type { ItemEstudioPrograma } from './EstudiosGraficoBarras.vue'

defineProps<{
  programaLider: ItemEstudioPrograma | null
  listaEstudios: ItemEstudioPrograma[]
}>()
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 font-['Poppins',sans-serif] text-left">
    
    <!-- Columna 1: Tarjeta de Concentración de Talento (6 cols) -->
    <div class="lg:col-span-6 space-y-6">
      <div 
        v-if="programaLider"
        class="p-6 rounded-3xl bg-gradient-to-br from-sky-500/10 via-purple-500/5 to-transparent border border-sky-500/30 backdrop-blur-xl shadow-xl space-y-3"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
            <Award class="w-4 h-4 text-amber-500" />
            <span>Mayor Concentración de Talento Académico</span>
          </span>
          <span class="text-xs font-black font-mono px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-600 dark:text-sky-400">
            {{ programaLider.porcentaje }}% del equipo
          </span>
        </div>

        <div class="text-xl font-black text-slate-900 dark:text-white leading-tight">
          {{ programaLider.programa }}
        </div>

        <!-- Badges de Habilidades -->
        <div class="flex flex-wrap gap-1.5 pt-1">
          <span 
            v-for="(hab, hIdx) in programaLider.habilidades" 
            :key="hIdx"
            class="px-2.5 py-1 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-semibold flex items-center gap-1 shadow-xs"
          >
            <CheckCircle2 class="w-3 h-3 text-emerald-500" />
            {{ hab }}
          </span>
        </div>

        <p class="text-xs text-slate-600 dark:text-slate-300 pt-1 leading-relaxed border-t border-slate-200/60 dark:border-slate-800">
          💡 <span class="font-bold text-slate-900 dark:text-white">Aprovechamiento Estratégico:</span> 
          {{ programaLider.usoRecomendado }}
        </p>
      </div>

      <div v-else class="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 backdrop-blur-xl shadow-xl text-center space-y-2">
        <div class="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-500 mx-auto flex items-center justify-center font-bold">
          <GraduationCap class="w-6 h-6" />
        </div>
        <h4 class="text-sm font-bold text-slate-900 dark:text-white">Estadística Lista para Recibir Respuestas</h4>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Una vez los colaboradores completen la opción múltiple, aquí se destacará automáticamente la mayor concentración de talento.
        </p>
      </div>
    </div>

    <!-- Columna 2: Recomendación de Asignación Estratégica (6 cols) -->
    <div class="lg:col-span-6 p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 backdrop-blur-xl shadow-xl space-y-4">
      <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <h3 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Brain class="w-4 h-4 text-purple-500" />
          <span>Catálogo & Aplicación de Competencias</span>
        </h3>
        <span class="text-[11px] text-slate-500">Mapeo de Talento</span>
      </div>

      <div class="max-h-[280px] overflow-y-auto space-y-3 pr-1">
        <div 
          v-for="item in listaEstudios" 
          :key="item.programa"
          class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 space-y-2"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: item.color }" />
              {{ item.programa }}
            </span>
            <span class="text-[11px] font-semibold text-slate-500">
              {{ item.cantidad }} col.
            </span>
          </div>

          <!-- Uso Recomendado en la Empresa -->
          <p class="text-[11px] text-slate-600 dark:text-slate-400 italic pt-1 border-t border-slate-200/40 dark:border-slate-800/40">
            🎯 {{ item.usoRecomendado }}
          </p>
        </div>
      </div>
    </div>

  </div>
</template>
