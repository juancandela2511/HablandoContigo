<!--
  ============================================================================
  COMPONENTE BOTÓN SELECTOR DE TEMA DÍA / NOCHE (MenuBotonTema.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Botón interactivo con icono animado de Sol / Luna para alternar entre
  el modo oscuro profundo (`#0b0f19`) y el modo claro (`#f8fafc`).
  
  ¿PARA QUÉ SIRVE?
  - Permitir a los administradores ajustar la iluminación de la interfaz a su preferencia visual.
  
  ¿CON QUÉ ESTÁ VINCULADO / CONECTADO?
  - useTheme.ts: Consume `esOscuro` y `alternarTema()`.
  - Menu.vue: Componente padre.
-->

<script setup lang="ts">
import { useTheme } from '@/Almacenes/useTheme'
import { Sun, Moon } from 'lucide-vue-next'

const { esOscuro, alternarTema } = useTheme()
</script>

<template>
  <button
    @click="alternarTema"
    :title="esOscuro ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'"
    class="p-2.5 sm:p-3 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all cursor-pointer group/tema relative flex items-center justify-center"
  >
    <Sun v-if="esOscuro" class="w-5 h-5 transition-transform group-hover/tema:rotate-45" />
    <Moon v-else class="w-5 h-5 transition-transform group-hover/tema:-rotate-12" />

    <!-- Tooltip -->
    <div class="absolute left-full ml-3.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold whitespace-nowrap shadow-xl border border-slate-700/60 opacity-0 pointer-events-none group-hover/tema:opacity-100 transition-opacity z-50">
      <span>{{ esOscuro ? 'Modo Claro' : 'Modo Oscuro' }}</span>
    </div>
  </button>
</template>
