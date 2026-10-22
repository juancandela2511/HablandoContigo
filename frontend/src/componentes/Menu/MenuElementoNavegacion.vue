<!--
  ============================================================================
  COMPONENTE ELEMENTO DE NAVEGACIÓN DOCK (MenuElementoNavegacion.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Botón de navegación individual para la barra dock lateral:
  - Icono reactivo.
  - Indicador de estado activo con fondo iluminado y gradiente.
  - Tooltip flotante a la derecha en hover.
  
  ¿PARA QUÉ SIRVE?
  - Estandarizar y encapsular la estética de los botones de navegación del menú.
  
  ¿CON QUÉ ESTÁ VINCULADO / CONECTADO?
  - Menu.vue: Componente padre que itera sobre los ítems del menú.
-->

<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  ruta: string
  etiqueta: string
  icono: Component
  estaActivo: boolean
}>()
</script>

<template>
  <router-link
    :to="ruta"
    :class="[
      'relative p-2.5 sm:p-3 rounded-2xl flex items-center justify-center transition-all duration-200 group/btn',
      estaActivo
        ? 'bg-gradient-to-tr from-blue-600 to-sky-500 text-white shadow-lg shadow-sky-500/30 scale-105'
        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
    ]"
  >
    <component :is="icono" class="w-5 h-5 transition-transform group-hover/btn:scale-110" />

    <!-- Tooltip flotante -->
    <div class="absolute left-full ml-3.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold whitespace-nowrap shadow-xl border border-slate-700/60 opacity-0 pointer-events-none group-hover/btn:opacity-100 transition-opacity z-50 flex items-center gap-1.5">
      <span>{{ etiqueta }}</span>
      <span v-if="estaActivo" class="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
    </div>
  </router-link>
</template>
