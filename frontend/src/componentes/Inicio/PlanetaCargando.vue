<!--
  ============================================================================
  ESQUELETO DE CARGA PARA EL PLANETA 3D (PlanetaCargando.vue)
  ============================================================================
  
  Se muestra mientras three.js se descarga en segundo plano.
  Mantiene la estructura visual del hero sin bloquear el renderizado principal.
-->

<template>
  <div class="w-full h-full flex items-center justify-center">
    <!-- Esfera animada que simula el globo 3D cargando -->
    <div class="relative flex items-center justify-center">
      <!-- Anillo exterior pulsante -->
      <div
        class="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full border border-blue-500/20 dark:border-blue-400/20 animate-pulse"
      />
      <!-- Anillo medio con rotación -->
      <div
        class="absolute w-56 h-56 sm:w-72 sm:h-72 rounded-full border border-sky-400/30 dark:border-sky-300/20"
        style="animation: spin 8s linear infinite;"
      />
      <!-- Núcleo central difuminado -->
      <div
        class="w-44 h-44 sm:w-60 sm:h-60 rounded-full bg-gradient-to-br from-blue-500/10 via-sky-400/10 to-transparent dark:from-blue-600/15 dark:via-sky-500/10 dark:to-transparent animate-pulse blur-sm"
      />
      <!-- Indicador de carga textual -->
      <div class="absolute bottom-0 translate-y-16 flex items-center gap-2 text-slate-400 dark:text-slate-500 text-xs font-mono">
        <div class="w-1 h-1 rounded-full bg-sky-400 animate-bounce" style="animation-delay: 0ms" />
        <div class="w-1 h-1 rounded-full bg-sky-400 animate-bounce" style="animation-delay: 150ms" />
        <div class="w-1 h-1 rounded-full bg-sky-400 animate-bounce" style="animation-delay: 300ms" />
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
</style>
