<!--
  ============================================================================
  SUBCOMPONENTE ENCABEZADO Y DATOS CLIMA (ProyectosClimaHeaderFiltros.vue)
  ============================================================================
  Maneja la barra de navegación superior, aviso de acceso por roles (solo lectura),
  campos de título/departamento/descripción y acciones globales de la encuesta troncal.
-->

<script setup lang="ts">
import { ArrowLeft, Save, Lock, RotateCcw, Sparkles } from 'lucide-vue-next'
import BotonBase from '@/componentes/ElementosBase/BotonBase.vue'

defineProps<{
  titulo: string
  descripcion: string
  departamento: string
  totalPreguntas: number
  puedeEditar: boolean
  rolUsuario?: string
}>()

const emit = defineEmits<{
  (e: 'volver'): void
  (e: 'guardar'): void
  (e: 'restaurar'): void
  (e: 'autoEnlazarIA'): void
  (e: 'update:titulo', val: string): void
  (e: 'update:descripcion', val: string): void
  (e: 'update:departamento', val: string): void
}>()
</script>

<template>
  <div class="space-y-6 font-['Poppins',sans-serif]">
    <!-- Barra Superior de Navegación -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-left">
      <div class="flex items-center gap-3">
        <button
          type="button"
          @click="emit('volver')"
          class="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
        >
          <ArrowLeft class="w-4 h-4" />
        </button>
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Encuesta Troncal de Clima Laboral
            </h2>
            <span class="px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-[10px] font-mono font-bold">
              {{ totalPreguntas }} Preguntas · 8 Bloques
            </span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Contigo Call Center · Auditoría multidimensional y analítica en tiempo real.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2.5 flex-wrap">
        <button
          v-if="puedeEditar"
          type="button"
          @click="emit('autoEnlazarIA')"
          class="px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 border border-sky-400/30 shrink-0"
          title="IA generará automáticamente las estadísticas y gráficos recomendados para esta encuesta"
        >
          <Sparkles class="w-4 h-4 text-amber-300" />
          <span>Auto-Enlazar IA</span>
        </button>

        <BotonBase
          v-if="puedeEditar"
          variante="primario"
          tamano="mediano"
          @click="emit('guardar')"
        >
          <template #iconoIzquierdo>
            <Save class="w-4 h-4" />
          </template>
          Guardar &amp; Actualizar Encuesta
        </BotonBase>
      </div>
    </div>

    <!-- Banner de Permiso Solo Lectura -->
    <div
      v-if="!puedeEditar"
      class="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-amber-800 dark:text-amber-200 text-left"
    >
      <div class="w-9 h-9 rounded-2xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
        <Lock class="w-5 h-5 text-amber-600 dark:text-amber-400" />
      </div>
      <div>
        <h4 class="text-xs font-black uppercase tracking-wider">
          Modo Solo Lectura (Acceso por Roles)
        </h4>
        <p class="text-[11px] text-amber-700 dark:text-amber-300">
          Tu rol (<strong>{{ rolUsuario || 'Consultor' }}</strong>) tiene permisos de visualización de estadísticas, pero la edición está restringida a Administradores.
        </p>
      </div>
    </div>

    <!-- Datos Generales de la Encuesta -->
    <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-left">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="sm:col-span-2 space-y-1">
          <label class="text-xs font-bold text-slate-700 dark:text-slate-300">Título de la Encuesta Oficial:</label>
          <input
            v-if="puedeEditar"
            :value="titulo"
            @input="emit('update:titulo', ($event.target as HTMLInputElement).value)"
            type="text"
            class="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500"
          />
          <p v-else class="text-xs font-bold text-slate-900 dark:text-white py-2">
            {{ titulo }}
          </p>
        </div>

        <div class="space-y-1">
          <label class="text-xs font-bold text-slate-700 dark:text-slate-300">Departamento Destino:</label>
          <input
            v-if="puedeEditar"
            :value="departamento"
            @input="emit('update:departamento', ($event.target as HTMLInputElement).value)"
            type="text"
            class="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500"
          />
          <p v-else class="text-xs font-semibold text-slate-700 dark:text-slate-300 py-2">
            {{ departamento }}
          </p>
        </div>
      </div>

      <div class="space-y-1">
        <label class="text-xs font-bold text-slate-700 dark:text-slate-300">Nota de Confidencialidad / Descripción:</label>
        <textarea
          v-if="puedeEditar"
          :value="descripcion"
          @input="emit('update:descripcion', ($event.target as HTMLTextAreaElement).value)"
          rows="2"
          class="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500 resize-none"
        />
        <p v-else class="text-xs text-slate-600 dark:text-slate-400 py-1">
          {{ descripcion }}
        </p>
      </div>
    </div>

    <!-- Acciones Globables (Restaurar) -->
    <div v-if="puedeEditar" class="flex flex-wrap items-center justify-between gap-3 px-2">
      <div class="text-xs text-slate-400">
        Total preguntas configuradas: <strong class="text-slate-800 dark:text-slate-200">{{ totalPreguntas }}</strong>
      </div>

      <BotonBase
        variante="fantasma"
        tamano="pequeno"
        @click="emit('restaurar')"
        title="Restablece la plantilla oficial de preguntas de Contigo Call Center"
      >
        <template #iconoIzquierdo>
          <RotateCcw class="w-3.5 h-3.5 text-amber-500" />
        </template>
        Restaurar Plantilla Oficial
      </BotonBase>
    </div>
  </div>
</template>
