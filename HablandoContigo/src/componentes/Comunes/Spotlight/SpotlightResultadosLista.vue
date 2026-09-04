<!--
  ============================================================================
  LISTA DE RESULTADOS SPOTLIGHT (SpotlightResultadosLista.vue)
  ============================================================================
  
  ¿QUÉ HACE?
  Muestra las opciones de navegación que coinciden con el término de búsqueda,
  con resaltado interactivo por teclado o cursor.
  
  ¿CON QUÉ SE CONECTA?
  - BuscadorSpotlight.vue (Componente contenedor)
  - catalogoSpotlight.ts (Tipo ElementoSpotlight)
-->

<script setup lang="ts">
import { ArrowRight, Sparkles } from 'lucide-vue-next'
import type { ElementoSpotlight } from './catalogoSpotlight'

defineProps<{
  resultados: ElementoSpotlight[]
  indiceSeleccionado: number
  terminoBusqueda: string
}>()

const emit = defineEmits<{
  (e: 'seleccionar', item: ElementoSpotlight): void
  (e: 'cambiarIndice', indice: number): void
}>()
</script>

<template>
  <div class="p-3 max-h-[58vh] overflow-y-auto space-y-1.5">
    <div 
      v-for="(item, index) in resultados" 
      :key="item.id"
      @click="emit('seleccionar', item)"
      @mouseenter="emit('cambiarIndice', index)"
      :class="[
        'p-3.5 rounded-2xl border transition-all duration-150 cursor-pointer flex items-center justify-between group text-left',
        indiceSeleccionado === index
          ? 'bg-sky-950/60 border-sky-500/50 shadow-md translate-x-1'
          : 'bg-slate-950/40 border-transparent hover:bg-slate-950/70'
      ]"
    >
      <div class="flex items-center gap-3.5">
        <div 
          class="w-10 h-10 rounded-2xl flex items-center justify-center border shrink-0 transition-transform group-hover:scale-110"
          :class="item.colorIcono"
        >
          <component :is="item.icono" class="w-5 h-5" />
        </div>
        
        <div>
          <p class="text-xs sm:text-sm font-bold text-white group-hover:text-sky-400 transition-colors">
            {{ item.titulo }}
          </p>
          <p class="text-[11px] text-slate-400 leading-tight mt-0.5">
            {{ item.subtitulo }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 hidden sm:inline">
          {{ item.categoria }}
        </span>
        <div class="flex items-center gap-1 text-[11px] text-sky-400 font-medium">
          <span class="hidden sm:inline">Ir</span>
          <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>

    <!-- Mensaje cuando no hay resultados -->
    <div v-if="resultados.length === 0" class="p-8 text-center text-slate-500 space-y-2">
      <Sparkles class="w-8 h-8 mx-auto opacity-30 text-sky-400" />
      <p class="text-xs font-semibold text-slate-300">No encontramos coincidencias para "{{ terminoBusqueda }}".</p>
      <p class="text-[11px] text-slate-500">Prueba buscando "acoso", "liderazgo", "proyectos", "cuentas" o "perfil".</p>
    </div>
  </div>
</template>
