<!--
  ============================================================================
  INSIGNIA INFORMATIVA DE VERSIÓN (InsigniaVersionApp.vue)
  ============================================================================
  Muestra el número de versión oficial (ej: 1.0, 1.1) en la esquina inferior derecha.
  Es un elemento meramente informativo y NO editable por el usuario.
-->

<script setup lang="ts">
import { useVersionApp } from '@/Config/versionApp'

const { versionActual } = useVersionApp()
</script>

<template>
  <div class="fixed bottom-3 right-3 z-50 font-['Poppins',sans-serif] select-none pointer-events-none">
    <div
      class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/85 dark:bg-slate-900/90 text-slate-200 border border-slate-700/80 shadow-lg backdrop-blur-md text-[11px] font-mono font-bold"
      title="Versión del sistema"
    >
      <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
      <span>{{ versionActual }}</span>
    </div>
  </div>
</template>
