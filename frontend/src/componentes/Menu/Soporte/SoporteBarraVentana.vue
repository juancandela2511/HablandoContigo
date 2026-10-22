<!--
  ============================================================================
  BARRA SUPERIOR DE VENTANA FLOTANTE DE SOPORTE (SoporteBarraVentana.vue)
  ============================================================================
  
  ¿QUÉ HACE?
  Encabezado arrastrable para la ventana de soporte flotante con controles
  de minimizar, alternar tamaño compacto/normal y botón de cierre.
  
  ¿CON QUÉ SE CONECTA?
  - ModalSoporte.vue (Componente modal contenedor)
-->

<script setup lang="ts">
import { HelpCircle, Move, Minus, Maximize2, Minimize2, X } from 'lucide-vue-next'

defineProps<{
  tamano: 'normal' | 'compacto' | 'minimizado'
}>()

const emit = defineEmits<{
  (e: 'iniciarArrastre', evento: MouseEvent | TouchEvent): void
  (e: 'cambiarTamano', nuevoTamano: 'normal' | 'compacto' | 'minimizado'): void
  (e: 'cerrar'): void
}>()
</script>

<template>
  <div
    @mousedown="emit('iniciarArrastre', $event)"
    @touchstart="emit('iniciarArrastre', $event)"
    class="px-4 py-3 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-grab active:cursor-grabbing text-left select-none"
  >
    <div class="flex items-center gap-2">
      <div class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
      <HelpCircle class="w-4 h-4 text-sky-500" />
      <span class="text-xs font-bold text-slate-800 dark:text-white">
        Centro de Soporte y Asistencia
      </span>
      <span class="text-[10px] text-slate-400 font-mono hidden sm:inline flex items-center gap-1">
        <Move class="w-2.5 h-2.5 opacity-60" />
        <span>Arrastra aquí</span>
      </span>
    </div>

    <!-- Controles de Ventana Flotante -->
    <div class="flex items-center gap-1">
      <button
        type="button"
        @click.stop="emit('cambiarTamano', 'minimizado')"
        class="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
        title="Minimizar a barra"
      >
        <Minus class="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        @click.stop="emit('cambiarTamano', tamano === 'normal' ? 'compacto' : 'normal')"
        class="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
        :title="tamano === 'normal' ? 'Vista compacta' : 'Vista normal'"
      >
        <Minimize2 v-if="tamano === 'normal'" class="w-3.5 h-3.5" />
        <Maximize2 v-else class="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        @click.stop="emit('cerrar')"
        class="p-1 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer ml-1"
        title="Cerrar soporte"
      >
        <X class="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
</template>
