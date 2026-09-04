<!--
  ============================================================================
  COMPONENTE BOTÓN DE INICIO 3D Y EFECTOS HOLOGRÁFICOS (BotonInicio.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Botón reutilizable de alta gama con soporte para animaciones de rotación neón
  y resplandor cónico ('starfield', 'neon', 'orbit', 'primary', 'secondary').
  
  ¿PARA QUÉ SIRVE?
  - Llamadas a la acción (CTA) en la página de inicio para iniciar encuestas anónimas.
  - Generar un impacto visual futurista acorde a la estética 3D de HablandoContigo.
  
  ¿CON QUÉ ESTÁ VINCULADO / CONECTADO?
  - HeroPrincipal.vue: Botón principal "Comenzar Encuesta Anónima".
-->

<template>
  <button
    :type="tipo"
    :class="[
      'font-medium transition-all duration-300 shadow-lg flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden group',
      tamanos[tamano],
      variantes[variante],
      clasePersonalizada
    ]"
    @click="$emit('click', $event)"
  >
    <!-- Capa de anillos de luz giratorios (Neon Glow con tonos azulados/cian) -->
    <span 
      v-if="variante === 'neon' || variante === 'starfield' || variante === 'orbit'" 
      class="absolute -inset-[3px] rounded-[inherit] overflow-hidden pointer-events-none z-0 p-[2px]"
    >
      <!-- Anillo exterior con gradiente cónico en tonos cian y azul brillante -->
      <span class="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,transparent_260deg,#38bdf8_310deg,#93c5fd_340deg,#38bdf8_360deg)] animate-spin-slow opacity-90 group-hover:opacity-100 group-hover:animate-spin-fast"></span>
    </span>

    <!-- Capa interior que define el cuerpo principal del botón en tonos azules vibrantes -->
    <span 
      v-if="variante === 'neon' || variante === 'starfield' || variante === 'orbit'" 
      class="absolute inset-[1px] bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 rounded-[inherit] z-0 pointer-events-none group-hover:from-blue-500 group-hover:to-indigo-500 transition-all duration-300 shadow-inner"
    ></span>

    <!-- Slot opcional para iconos personalizados -->
    <slot name="icon"></slot>
    <span class="relative z-10 text-white tracking-wide">{{ texto }}</span>
  </button>
</template>

<script setup lang="ts">
/**
 * Propiedades del botón configurables desde el componente padre
 */
withDefaults(
  defineProps<{
    texto?: string
    tipo?: 'button' | 'submit' | 'reset'
    variante?: 'primary' | 'secondary' | 'outline' | 'neon' | 'starfield' | 'orbit'
    tamano?: 'sm' | 'md' | 'lg'
    clasePersonalizada?: string
  }>(),
  {
    texto: 'Iniciar',
    tipo: 'button',
    variante: 'primary',
    tamano: 'md',
    clasePersonalizada: ''
  }
)

defineEmits<{
  (evento: 'click', payload: MouseEvent): void
}>()

// Clases de tamaño con esquinas redondeadas en forma de píldora
const tamanos = {
  sm: 'px-5 py-2 text-sm rounded-full',
  md: 'px-7 py-3 text-base rounded-full',
  lg: 'px-9 py-4 text-lg rounded-full'
}

// Clases de variantes de diseño
const variantes = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:scale-[1.01] active:scale-[0.98]',
  secondary: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:scale-[1.01] active:scale-[0.98]',
  outline: 'border-2 border-blue-600 text-blue-600 dark:text-sky-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:scale-[1.01] active:scale-[0.98]',
  neon: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 hover:scale-[1.01] active:scale-[0.98]',
  starfield: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 hover:scale-[1.01] active:scale-[0.98]',
  orbit: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 hover:scale-[1.01] active:scale-[0.98]'
}
</script>

<style scoped>
@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin-slow {
  animation: spin-slow 4s linear infinite;
}

.group:hover .animate-spin-fast {
  animation: spin-slow 1.5s linear infinite;
}
</style>