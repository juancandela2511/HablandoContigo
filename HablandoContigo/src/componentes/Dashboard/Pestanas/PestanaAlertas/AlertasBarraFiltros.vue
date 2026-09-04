<!--
  ============================================================================
  BARRA DE FILTROS DE ALERTAS (AlertasBarraFiltros.vue)
  ============================================================================
-->

<script setup lang="ts">
import { AlertTriangle, Clock, CheckCircle2, XCircle, Filter, X } from 'lucide-vue-next'
import type { TipoAlertaPersonalizada } from '@/Almacenes/useTiposAlertas'

defineProps<{
  totalAlertas: number
  filtroEstado: 'todas' | 'Detectada' | 'En Revisión' | 'Atendida' | 'Descartada'
  filtroTipoId: string
  tiposAlertas: TipoAlertaPersonalizada[]
  contarAlertasPorTipo: (tipo: TipoAlertaPersonalizada) => number
}>()

const emit = defineEmits<{
  (e: 'update:filtroEstado', estado: 'todas' | 'Detectada' | 'En Revisión' | 'Atendida' | 'Descartada'): void
  (e: 'update:filtroTipoId', id: string): void
  (e: 'eliminarTipoAlerta', id: string): void
}>()
</script>

<template>
  <div class="space-y-2.5">
    <!-- Barra de Filtros por Estado -->
    <div class="flex flex-wrap items-center gap-1.5 p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
      <span class="text-[11px] font-semibold text-slate-400 px-2">Estado:</span>

      <button
        type="button"
        @click="emit('update:filtroEstado', 'todas')"
        :class="[
          'px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer text-xs',
          filtroEstado === 'todas' ? 'bg-sky-600 text-white font-bold shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
        ]"
      >
        Todas ({{ totalAlertas }})
      </button>

      <button
        type="button"
        @click="emit('update:filtroEstado', 'Detectada')"
        :class="[
          'px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer text-xs flex items-center gap-1',
          filtroEstado === 'Detectada' ? 'bg-amber-600 text-white font-bold shadow-sm' : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
        ]"
      >
        <AlertTriangle class="w-3 h-3" />
        <span>Detectadas / Nuevas</span>
      </button>

      <button
        type="button"
        @click="emit('update:filtroEstado', 'En Revisión')"
        :class="[
          'px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer text-xs flex items-center gap-1',
          filtroEstado === 'En Revisión' ? 'bg-sky-600 text-white font-bold shadow-sm' : 'text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40'
        ]"
      >
        <Clock class="w-3 h-3" />
        <span>En Revisión</span>
      </button>

      <button
        type="button"
        @click="emit('update:filtroEstado', 'Atendida')"
        :class="[
          'px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer text-xs flex items-center gap-1',
          filtroEstado === 'Atendida' ? 'bg-emerald-600 text-white font-bold shadow-sm' : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
        ]"
      >
        <CheckCircle2 class="w-3 h-3" />
        <span>Atendidas</span>
      </button>

      <button
        type="button"
        @click="emit('update:filtroEstado', 'Descartada')"
        :class="[
          'px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer text-xs flex items-center gap-1',
          filtroEstado === 'Descartada' ? 'bg-slate-600 text-white font-bold shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
        ]"
      >
        <XCircle class="w-3 h-3" />
        <span>Descartadas</span>
      </button>
    </div>

    <!-- Barra de Filtros por Criterio / Tipo de Alerta -->
    <div class="flex flex-wrap items-center gap-1.5 p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
      <span class="text-[11px] font-semibold text-slate-400 px-2 flex items-center gap-1">
        <Filter class="w-3 h-3" />
        <span>Tipo de Alerta:</span>
      </span>

      <button
        type="button"
        @click="emit('update:filtroTipoId', 'todas')"
        :class="[
          'px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer text-xs',
          filtroTipoId === 'todas' ? 'bg-sky-600 text-white font-bold shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
        ]"
      >
        Todos los Criterios
      </button>

      <!-- Botones Dinámicos para cada Tipo -->
      <div
        v-for="tipo in tiposAlertas"
        :key="tipo.id"
        class="inline-flex items-center rounded-xl overflow-hidden border transition-all"
        :class="filtroTipoId === tipo.id 
          ? 'bg-amber-600 border-amber-600 text-white font-bold shadow-sm' 
          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'"
      >
        <button
          type="button"
          @click="emit('update:filtroTipoId', tipo.id)"
          class="px-3 py-1.5 flex items-center gap-1.5 text-xs cursor-pointer"
        >
          <span 
            class="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded"
            :class="tipo.nivel === 1 ? 'bg-red-500 text-white' : tipo.nivel === 2 ? 'bg-rose-500 text-white' : 'bg-slate-700 text-slate-200'"
          >
            N{{ tipo.nivel }}
          </span>
          <span>{{ tipo.nombre }} ({{ contarAlertasPorTipo(tipo) }})</span>
        </button>

        <button
          type="button"
          @click.stop="emit('eliminarTipoAlerta', tipo.id)"
          class="px-1.5 py-1.5 hover:bg-black/20 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
          title="Eliminar este tipo de alerta"
        >
          <X class="w-3 h-3" />
        </button>
      </div>
    </div>
  </div>
</template>
