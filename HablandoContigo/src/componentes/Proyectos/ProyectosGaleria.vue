<!--
  ============================================================================
  COMPONENTE GALERÍA DE PROYECTOS DE ENCUESTAS (ProyectosGaleria.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Renderiza la cuadrícula responsiva de encuestas:
  - Mapea las tarjetas individuales (`ProyectosTarjetaItem.vue`).
  - Tarjeta punteada de acceso rápido para crear nuevo proyecto con IA.
  - Efecto de palpitación y enfoque mediante `elementoResaltadoId`.
  
  ¿PARA QUÉ SIRVE?
  - Proveer un espacio visual ordenado para revisar todas las evaluaciones activas en la empresa.
  
  ¿CON QUÉ ESTÁ VINCULADO / CONECTADO?
  - ProyectosTarjetaItem.vue: Subcomponente de tarjeta.
  - ProyectosView.vue: Componente padre orquestador.
-->

<script setup lang="ts">
import type { Encuesta } from '@/Almacenes/useEncuestas'
import ProyectosTarjetaItem from './ProyectosTarjetaItem.vue'
import { Sparkles } from 'lucide-vue-next'

defineProps<{
  encuestas: Encuesta[]
  elementoResaltadoId: string | null
}>()

defineEmits<{
  (e: 'crearNuevo'): void
  (e: 'copiarEnlace', id: string): void
  (e: 'irAResponder', id: string): void
  (e: 'editarEncuesta', encuesta: Encuesta): void
  (e: 'eliminarEncuesta', id: string): void
  (e: 'vaciarEstadisticas', id: string): void
}>()
</script>

<template>
  <div 
    id="seccion-estudio-proyectos"
    class="space-y-6 transition-all duration-500"
    :class="elementoResaltadoId === 'seccion-estudio-proyectos' ? 'ring-4 ring-indigo-400 scale-[1.01] animate-pulse p-2 rounded-3xl' : ''"
  >
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      
      <!-- Tarjetas de Encuestas Existentes -->
      <ProyectosTarjetaItem
        v-for="encuesta in encuestas"
        :key="encuesta.id"
        :encuesta="encuesta"
        @copiarEnlace="$emit('copiarEnlace', $event)"
        @irAResponder="$emit('irAResponder', $event)"
        @editarEncuesta="$emit('editarEncuesta', $event)"
        @eliminarEncuesta="$emit('eliminarEncuesta', $event)"
        @vaciarEstadisticas="$emit('vaciarEstadisticas', $event)"
      />

      <!-- Tarjeta para crear nuevo proyecto con IA -->
      <div 
        @click="$emit('crearNuevo')"
        class="rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-sky-500/50 p-8 flex flex-col items-center justify-center text-center group cursor-pointer transition-all hover:bg-white/40 dark:hover:bg-slate-900/40 min-h-[260px]"
      >
        <div class="w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 group-hover:border-sky-500/40 flex items-center justify-center text-sky-500 mb-4 transition-transform group-hover:scale-110 shadow-lg">
          <Sparkles class="w-6 h-6" />
        </div>
        <h4 class="text-sm font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
          Crear Nuevo Proyecto con IA
        </h4>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs leading-relaxed">
          Describe lo que necesitas evaluar y la IA creará una encuesta adaptativa con detección de alertas.
        </p>
      </div>

    </div>
  </div>
</template>
