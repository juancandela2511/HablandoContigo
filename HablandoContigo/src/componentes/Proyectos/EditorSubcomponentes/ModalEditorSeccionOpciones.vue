<!--
  ============================================================================
  SUBCOMPONENTE OPCIONES DE RESPUESTA (ModalEditorSeccionOpciones.vue)
  ============================================================================
  Gestiona la lista de alternativas de respuesta, asignación rápida de puntajes
  netos (1-5 pts) y activación de alertas psicosociales por opción.
-->

<script setup lang="ts">
import { computed } from 'vue'
import { Plus, Trash2, Bell, Sparkles } from 'lucide-vue-next'
import type { PreguntaEncuesta, OpcionPregunta } from '@/Servicios/iaEncuestasService'
import { useTiposAlertas } from '@/Almacenes/useTiposAlertas'

const props = defineProps<{
  copia: PreguntaEncuesta
}>()

const emit = defineEmits<{
  (e: 'agregarOpcion'): void
  (e: 'eliminarOpcion', index: number): void
  (e: 'asignarPuntaje', payload: { opc: OpcionPregunta; val: number }): void
  (e: 'toggleAlerta', opc: OpcionPregunta): void
  (e: 'cambiarSelectAlerta', opc: OpcionPregunta): void
}>()

const { tiposAlertas } = useTiposAlertas()

const opcionesConAlerta = computed(() =>
  props.copia.opciones?.filter((o) => o.esAlerta) ?? []
)
</script>

<template>
  <div v-if="copia.tipo !== 'texto'" class="space-y-4 font-['Poppins',sans-serif]">
    <div class="flex items-center justify-between">
      <h4 class="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
        Opciones de Respuesta & Puntajes Netos
      </h4>
      <span class="px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-[10px] font-bold">
        {{ opcionesConAlerta.length }} alertas
      </span>
    </div>

    <!-- Banner Informativo -->
    <div class="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900/50 space-y-1 text-xs text-sky-900 dark:text-sky-200">
      <div class="font-bold flex items-center gap-1.5 text-sky-700 dark:text-sky-300">
        <Sparkles class="w-3.5 h-3.5 text-sky-500" />
        <span>Cálculo Estadístico del Bloque (100%):</span>
      </div>
      <p class="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
        El 100% de la puntuación del módulo se distribuye equitativamente. Cada opción tiene un <strong>puntaje neto claro (1 a 5 pts)</strong>.
      </p>
    </div>

    <!-- Lista de opciones -->
    <div class="space-y-2.5">
      <div
        v-for="(opc, idx) in copia.opciones"
        :key="opc.id"
        :class="[
          'p-3 rounded-2xl border transition-all space-y-2',
          opc.esAlerta
            ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-900/60 shadow-sm'
            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'
        ]"
      >
        <div class="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <span
            :class="[
              'w-6 h-6 flex-shrink-0 rounded-full text-[10px] font-mono font-black flex items-center justify-center',
              opc.esAlerta
                ? 'bg-rose-200 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            ]"
          >
            {{ idx + 1 }}
          </span>

          <input
            v-model="opc.texto"
            type="text"
            :class="[
              'flex-1 min-w-0 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs outline-none focus:ring-2 transition-all',
              opc.esAlerta
                ? 'border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-semibold focus:ring-rose-400'
                : 'border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:ring-sky-400'
            ]"
            :placeholder="'Opción ' + (idx + 1)"
          />

          <!-- Presets rápidos de puntaje -->
          <div class="flex items-center gap-1 shrink-0 select-none">
            <button
              type="button"
              @click="emit('asignarPuntaje', { opc, val: 5 })"
              :class="[
                'px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer',
                opc.valor === 5 ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-white dark:bg-slate-900 text-emerald-600 border-emerald-200 hover:bg-emerald-50'
              ]"
            >
              Alto (5)
            </button>
            <button
              type="button"
              @click="emit('asignarPuntaje', { opc, val: 3 })"
              :class="[
                'px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer',
                opc.valor === 3 ? 'bg-amber-500 text-white border-amber-600' : 'bg-white dark:bg-slate-900 text-amber-600 border-amber-200 hover:bg-amber-50'
              ]"
            >
              Medio (3)
            </button>
            <button
              type="button"
              @click="emit('asignarPuntaje', { opc, val: 1 })"
              :class="[
                'px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer',
                opc.valor === 1 ? 'bg-rose-600 text-white border-rose-700' : 'bg-white dark:bg-slate-900 text-rose-600 border-rose-200 hover:bg-rose-50'
              ]"
            >
              Bajo (1)
            </button>
          </div>

          <input
            v-model.number="opc.valor"
            type="number"
            min="0"
            max="10"
            class="w-12 flex-shrink-0 px-1.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-center font-bold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-sky-400"
          />

          <!-- Toggle Alerta -->
          <button
            type="button"
            @click="emit('toggleAlerta', opc)"
            :class="[
              'p-2 rounded-xl border transition-all cursor-pointer shrink-0',
              opc.esAlerta ? 'bg-rose-600 text-white border-rose-700' : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-700 hover:text-rose-500'
            ]"
            title="Activar alerta en esta opción"
          >
            <Bell class="w-3.5 h-3.5" />
          </button>

          <!-- Borrar Opcion -->
          <button
            type="button"
            @click="emit('eliminarOpcion', idx)"
            class="p-2 rounded-xl text-slate-400 hover:text-rose-500 transition-colors cursor-pointer shrink-0"
            title="Eliminar opción"
          >
            <Trash2 class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Agregar Opción -->
    <button
      type="button"
      @click="emit('agregarOpcion')"
      class="w-full py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700"
    >
      <Plus class="w-4 h-4 text-sky-500" />
      <span>Añadir Opción Personalizada</span>
    </button>
  </div>
</template>
