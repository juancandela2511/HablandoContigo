<!--
  ============================================================================
  TABLA DE AUDITORÍA CON FILTROS (AuditoriaTablaRegistros.vue)
  ============================================================================
-->

<script setup lang="ts">
import { Search, Filter, Plus, X } from 'lucide-vue-next'
import { BotonBase } from '@/componentes/ElementosBase'
import AuditoriaFilaRegistro from './AuditoriaFilaRegistro.vue'
import type { RegistroRespuesta } from '@/Almacenes/useEncuestas'
import type { TipoAlertaPersonalizada } from '@/Almacenes/useTiposAlertas'

defineProps<{
  respuestas: RegistroRespuesta[]
  filtroTexto: string
  filtroTipo: string
  tiposAlertas: TipoAlertaPersonalizada[]
  totalConAlertas: number
  contarRespuestasPorTipo: (tipo: TipoAlertaPersonalizada) => number
}>()

const emit = defineEmits<{
  (e: 'update:filtroTexto', texto: string): void
  (e: 'update:filtroTipo', tipo: string): void
  (e: 'abrirGestionAlertas'): void
  (e: 'eliminarTipoAlerta', evento: Event, id: string, nombre: string): void
  (e: 'abrirMapa', registro: RegistroRespuesta): void
  (e: 'eliminarRespuesta', idRespuesta: string): void
}>()
</script>

<template>
  <div class="space-y-3.5">
    <!-- Barra de Búsqueda y Filtros Fijos -->
    <div class="flex flex-col sm:flex-row items-center gap-3">
      <div class="relative flex-1 w-full">
        <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          :value="filtroTexto"
          @input="emit('update:filtroTexto', ($event.target as HTMLInputElement).value)"
          type="text"
          placeholder="Buscar por  encuesta..."
          class="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 shadow-sm"
        />
      </div>

      <!-- Filtros Fijos Rápidos -->
      <div class="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs flex-wrap w-full sm:w-auto">
        <button
          type="button"
          @click="emit('update:filtroTipo', 'todos')"
          class="px-3 py-1.5 rounded-xl font-semibold cursor-pointer transition-colors"
          :class="filtroTipo === 'todos' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'"
        >
          Todas ({{ respuestas.length }})
        </button>

        <button
          type="button"
          @click="emit('update:filtroTipo', 'con_alertas')"
          class="px-3 py-1.5 rounded-xl font-semibold cursor-pointer transition-colors"
          :class="filtroTipo === 'con_alertas' ? 'bg-amber-600 text-white shadow-sm' : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'"
        >
          Con Alertas ({{ totalConAlertas }})
        </button>
      </div>
    </div>

    <!-- Barra de Filtros Dinámicos de Tipos de Alerta -->
    <div class="flex flex-wrap items-center gap-1.5 p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
      <span class="text-[11px] font-semibold text-slate-400 px-2 flex items-center gap-1">
        <Filter class="w-3 h-3" />
        <span>Filtrar por Criterio:</span>
      </span>

      <div
        v-for="tipo in tiposAlertas"
        :key="tipo.id"
        class="inline-flex items-center rounded-xl overflow-hidden border transition-all"
        :class="filtroTipo === tipo.id 
          ? 'bg-amber-600 border-amber-600 text-white font-bold shadow-sm' 
          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'"
      >
        <button
          type="button"
          @click="emit('update:filtroTipo', tipo.id)"
          class="px-3 py-1.5 flex items-center gap-1.5 text-xs cursor-pointer"
        >
          <span 
            class="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded"
            :class="tipo.nivel === 1 ? 'bg-red-500 text-white' : tipo.nivel === 2 ? 'bg-rose-500 text-white' : 'bg-slate-700 text-slate-200'"
          >
            N{{ tipo.nivel }}
          </span>
          <span>{{ tipo.nombre }} ({{ contarRespuestasPorTipo(tipo) }})</span>
        </button>

        <button
          type="button"
          @click="emit('eliminarTipoAlerta', $event, tipo.id, tipo.nombre)"
          class="px-1.5 py-1.5 hover:bg-black/20 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
          title="Eliminar este tipo de alerta"
        >
          <X class="w-3 h-3" />
        </button>
      </div>
    </div>

    <!-- Tabla Principal de Auditoría -->
    <div class="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider text-[11px]">
            <tr>
              <th class="py-3.5 px-4 font-semibold">Dispositivo & Cuenta de PC</th>
              <th class="py-3.5 px-4 font-semibold">Ubicación & Sede</th>
              <th class="py-3.5 px-4 font-semibold">Encuesta / Campaña</th>
              <th class="py-3.5 px-4 font-semibold">Fecha y Hora</th>
              <th class="py-3.5 px-4 font-semibold">Estado & Alertas</th>
              <th class="py-3.5 px-4 font-semibold text-center">Acciones</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
            <AuditoriaFilaRegistro
              v-for="resp in respuestas"
              :key="resp.idRespuesta"
              :registro="resp"
              @abrirMapa="emit('abrirMapa', $event)"
              @eliminar="emit('eliminarRespuesta', $event)"
            />

            <tr v-if="respuestas.length === 0">
              <td colspan="6" class="py-10 text-center text-slate-500 font-sans">
                No se encontraron registros con los filtros seleccionados.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
