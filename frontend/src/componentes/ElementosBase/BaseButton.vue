<template>
  <button
    :type="tipo"
    :disabled="deshabilitado || cargando"
    :class="[
      'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
      varianteClasses,
      tamanoClasses,
      bloqueCompleto ? 'w-full' : '',
      deshabilitado || cargando ? 'opacity-50 cursor-not-allowed' : ''
    ]"
  >
    <svg v-if="cargando" class="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <span v-if="!cargando && $slots.iconoIzquierdo" class="mr-2">
      <slot name="iconoIzquierdo"></slot>
    </span>
    <span v-if="cargando && textoCarga">{{ textoCarga }}</span>
    <span v-else><slot></slot></span>
    <span v-if="!cargando && $slots.iconoDerecho" class="ml-2">
      <slot name="iconoDerecho"></slot>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  variante?: 'primario' | 'secundario' | 'peligro' | 'gradiente'
  tamano?: 'pequeno' | 'mediano' | 'grande'
  bloqueCompleto?: boolean
  cargando?: boolean
  deshabilitado?: boolean
  textoCarga?: string
  tipo?: 'button' | 'submit' | 'reset'
}>(), {
  variante: 'primario',
  tamano: 'mediano',
  bloqueCompleto: false,
  cargando: false,
  deshabilitado: false,
  tipo: 'button'
})

const varianteClasses = computed(() => {
  switch (props.variante) {
    case 'primario':
      return 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600'
    case 'secundario':
      return 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600'
    case 'peligro':
      return 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600'
    case 'gradiente':
      return 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 focus:ring-blue-500'
    default:
      return 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
  }
})

const tamanoClasses = computed(() => {
  switch (props.tamano) {
    case 'pequeno':
      return 'px-3 py-1.5 text-sm'
    case 'grande':
      return 'px-6 py-3 text-lg'
    case 'mediano':
    default:
      return 'px-4 py-2 text-base'
  }
})
</script>
