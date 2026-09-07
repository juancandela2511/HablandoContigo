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
import { ref, computed } from 'vue'
import type { Encuesta } from '@/Almacenes/useEncuestas'
import ProyectosTarjetaItem from './ProyectosTarjetaItem.vue'
import { Sparkles, Building2, Zap, LayoutGrid } from 'lucide-vue-next'

const props = defineProps<{
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

const filtroModalidad = ref<'todas' | 'clima' | 'rapida'>('todas')

const encuestasFiltradas = computed(() => {
  if (filtroModalidad.value === 'todas') return props.encuestas

  if (filtroModalidad.value === 'clima') {
    return props.encuestas.filter(e => 
      e.id === 'enc-001' || 
      (e as any).tipo === 'clima' || 
      e.titulo.toLowerCase().includes('clima') || 
      e.titulo.toLowerCase().includes('diagnóstico') || 
      (e.preguntas && e.preguntas.length >= 10)
    )
  }

  return props.encuestas.filter(e => 
    (e as any).tipo === 'rapida' || 
    (e as any).tipo === 'pulso' || 
    e.titulo.toLowerCase().includes('pulso') || 
    e.titulo.toLowerCase().includes('rápida') || 
    (e.preguntas && e.preguntas.length < 10)
  )
})
</script>

<template>
  <div 
    id="seccion-estudio-proyectos"
    class="space-y-6 transition-all duration-500"
    :class="elementoResaltadoId === 'seccion-estudio-proyectos' ? 'ring-4 ring-indigo-400 scale-[1.01] animate-pulse p-2 rounded-3xl' : ''"
  >
    <!-- Barra de Pestañas y Filtro por Modalidad -->
    <div class="flex items-center justify-between gap-4 flex-wrap pb-2">
      <div class="inline-flex items-center gap-1.5 p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <button
          type="button"
          @click="filtroModalidad = 'todas'"
          :class="[
            'px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer',
            filtroModalidad === 'todas'
              ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          ]"
        >
          <LayoutGrid class="w-3.5 h-3.5" />
          <span>Todas ({{ encuestas.length }})</span>
        </button>

        <button
          type="button"
          @click="filtroModalidad = 'clima'"
          :class="[
            'px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer',
            filtroModalidad === 'clima'
              ? 'bg-sky-500 text-white shadow-md ring-2 ring-sky-400/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          ]"
        >
          <Building2 class="w-3.5 h-3.5" />
          <span>🌳 Clima Laboral</span>
        </button>

        <button
          type="button"
          @click="filtroModalidad = 'rapida'"
          :class="[
            'px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer',
            filtroModalidad === 'rapida'
              ? 'bg-amber-500 text-white shadow-md ring-2 ring-amber-400/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          ]"
        >
          <Zap class="w-3.5 h-3.5" />
          <span>⚡ Encuestas Rápidas</span>
        </button>
      </div>

      <div class="text-xs text-slate-500 dark:text-slate-400 font-mono">
        Mostrando <b>{{ encuestasFiltradas.length }}</b> de {{ encuestas.length }} encuestas
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      
      <!-- Tarjetas de Encuestas Existentes -->
      <ProyectosTarjetaItem
        v-for="encuesta in encuestasFiltradas"
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
