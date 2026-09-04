<!--
  ============================================================================
  BARRA SUPERIOR DEL PANEL DE NOTIFICACIONES (NotificacionesBarraHeader.vue)
  ============================================================================
  
  ¿QUÉ HACE?
  Encabezado arrastrable para la ventana flotante de notificaciones,
  con conteo de no leídas, controles de minimizar y botón de cierre.
  
  ¿CON QUÉ SE CONECTA?
  - NotificacionesFlotante.vue (Componente contenedor)
-->

<script setup lang="ts">
import { Bell, GripHorizontal, Minus, Maximize2, X } from 'lucide-vue-next'

defineProps<{
  noLeidas: number
  estaMinimizado: boolean
}>()

const emit = defineEmits<{
  (e: 'iniciarArrastre', evento: MouseEvent): void
  (e: 'toggleMinimizado'): void
  (e: 'cerrar'): void
}>()
</script>

<template>
  <div
    @mousedown="emit('iniciarArrastre', $event)"
    class="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between cursor-grab active:cursor-grabbing text-left select-none"
  >
    <div class="flex items-center gap-2">
      <GripHorizontal class="w-4 h-4 text-slate-500" />
      <div class="relative">
        <Bell class="w-4 h-4 text-amber-400" />
        <span
          v-if="noLeidas > 0"
          class="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 animate-pulse"
        ></span>
      </div>
      <span class="text-xs font-bold text-white tracking-wide">
        Actividad & Notificaciones
      </span>
      <span
        v-if="noLeidas > 0"
        class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-mono text-[10px] font-bold border border-amber-500/30"
      >
        {{ noLeidas }}
      </span>
    </div>

    <div class="flex items-center gap-1">
      <button
        type="button"
        @click.stop="emit('toggleMinimizado')"
        class="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        :title="estaMinimizado ? 'Expandir panel' : 'Minimizar panel'"
      >
        <Maximize2 v-if="estaMinimizado" class="w-3.5 h-3.5" />
        <Minus v-else class="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        @click.stop="emit('cerrar')"
        class="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        title="Cerrar panel"
      >
        <X class="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
</template>
