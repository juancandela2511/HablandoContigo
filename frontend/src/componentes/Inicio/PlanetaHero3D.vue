<!--
  ============================================================================
  COMPONENTE PLANETA 3D WIREFRAME (PlanetaHero3D.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Orquestador visual del globo terráqueo interactivo en Three.js:
  - Continentes con siluetas geográficas reales trazadas por polígonos.
  - Resaltado diferenciado de 🇨🇴 Colombia y 🇪🇸 España.
  - Conexión transatlántica parabólica en 3D con paquetes de datos en tiempo real.
  - Rotación fluida, inercia al arrastre e interactividad táctil/ratón.
  - Sincronización dinámica reactiva entre Modo Claro y Modo Oscuro.
  
  ARQUITECTURA MODULAR:
  - datosGeograficos.ts: Polígonos de costas y continentes.
  - geometriaPlaneta.ts: Construcción matemática de escena y ciclo WebGL.
-->

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useTheme } from '@/Almacenes/useTheme'
import { inicializarEscenaPlaneta, type InstanciaMundo3D } from './Planeta3D/geometriaPlaneta'

const { esOscuro } = useTheme()
const contenedor3D = ref<HTMLDivElement | null>(null)
let instanciaMundo: InstanciaMundo3D | null = null

onMounted(() => {
  if (contenedor3D.value) {
    instanciaMundo = inicializarEscenaPlaneta(contenedor3D.value, esOscuro.value)
  }
})

watch(esOscuro, (nuevoOscuro) => {
  if (instanciaMundo) {
    instanciaMundo.actualizarTema(nuevoOscuro)
  }
})

onBeforeUnmount(() => {
  if (instanciaMundo) {
    instanciaMundo.destruir()
    instanciaMundo = null
  }
})
</script>

<template>
  <div class="relative w-full h-full flex items-center justify-center select-none overflow-visible">
    <!-- Contenedor del lienzo WebGL 3D -->
    <div ref="contenedor3D" class="w-full h-full"></div>

    <!-- Indicador de Enlace en Tiempo Real -->
    <div class="absolute bottom-2 inset-x-0 mx-auto flex items-center justify-center gap-2 pointer-events-none">
      <div class="px-4 py-1.5 rounded-full bg-black/60 dark:bg-black/80 border border-white/10 backdrop-blur-md text-[11px] font-mono text-neutral-300 flex items-center gap-2.5 shadow-xl">
        <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
        <strong class="text-amber-400 font-bold">🇨🇴 Colombia</strong>
        <span class="text-sky-400 font-bold">⟷</span>
        <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
        <strong class="text-rose-400 font-bold">🇪🇸 España</strong>
        <span class="text-neutral-500">| Enlace de Clima Psicosocial</span>
      </div>
    </div>
  </div>
</template>
