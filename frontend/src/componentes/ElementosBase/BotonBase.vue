<!--
  ============================================================================
  COMPONENTE REUTILIZABLE: BOTÓN BASE (BotonBase.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Componente atómico de botón interactivo de alta fidelidad:
  - Variantes visuales: 'primario', 'secundario', 'esquema', 'peligro', 'exito', 'fantasma', 'gradiente'.
  - Tamaños: 'xs', 'pequeno' (sm), 'mediano' (md), 'grande' (lg).
  - Estado reactivo de carga ('cargando') con spinner SVG.
  - Slots para icono izquierdo, icono derecho y contenido libre.
  - Soporte para ancho completo ('bloqueCompleto').
  - Totalmente adaptativo a Modo Claro y Modo Oscuro.
  
  ¿CON QUÉ OTROS ARCHIVOS SE CONECTA?
  - index.ts en src/componentes/ElementosBase/: Exportado como parte del paquete UI básico.
  - Utilizado en todos los formularios, modales, barras de navegación y tarjetas de la plataforma.
-->

<script setup lang="ts">
import { computed } from 'vue'
import { Loader2 } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    variante?: 'primario' | 'secundario' | 'esquema' | 'peligro' | 'exito' | 'fantasma' | 'gradiente'
    tamano?: 'xs' | 'pequeno' | 'mediano' | 'grande'
    cargando?: boolean
    textoCarga?: string
    deshabilitado?: boolean
    tipo?: 'button' | 'submit' | 'reset'
    bloqueCompleto?: boolean
  }>(),
  {
    variante: 'primario',
    tamano: 'mediano',
    cargando: false,
    textoCarga: 'Cargando...',
    deshabilitado: false,
    tipo: 'button',
    bloqueCompleto: false
  }
)

defineEmits<{
  (e: 'click', evento: MouseEvent): void
}>()

const clasesTamano = computed(() => {
  switch (props.tamano) {
    case 'xs':
      return 'px-2.5 py-1 text-[11px] rounded-lg gap-1'
    case 'pequeno':
      return 'px-3 py-1.5 text-xs rounded-xl gap-1.5'
    case 'grande':
      return 'px-7 py-3.5 text-sm sm:text-base rounded-2xl gap-2.5 font-bold'
    case 'mediano':
    default:
      return 'px-5 py-2.5 text-xs sm:text-sm rounded-xl gap-2 font-semibold'
  }
})

const clasesVariante = computed(() => {
  switch (props.variante) {
    case 'secundario':
      return 'bg-slate-200/90 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 text-slate-800 dark:text-white border border-slate-300 dark:border-white/15'
    case 'esquema':
      return 'bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-800 dark:text-white border border-slate-300 dark:border-white/20'
    case 'peligro':
      return 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20 border border-rose-500'
    case 'exito':
      return 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 border border-emerald-500'
    case 'gradiente':
      return 'bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 hover:from-sky-400 hover:via-indigo-400 hover:to-purple-500 text-white shadow-lg shadow-sky-500/25 border border-sky-400/30'
    case 'fantasma':
      return 'bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white border border-transparent'
    case 'primario':
    default:
      return 'bg-slate-950 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 shadow-lg shadow-slate-950/15 dark:shadow-white/10 border border-transparent'
  }
})
</script>

<template>
  <button
    :type="tipo"
    :disabled="deshabilitado || cargando"
    @click="$emit('click', $event)"
    :class="[
      'inline-flex items-center justify-center transition-all duration-200 cursor-pointer select-none active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
      clasesTamano,
      clasesVariante,
      bloqueCompleto ? 'w-full' : ''
    ]"
  >
    <!-- Spinner durante el estado de carga -->
    <Loader2 v-if="cargando" class="w-4 h-4 animate-spin shrink-0" />

    <!-- Icono Izquierdo (Slot) -->
    <span v-if="$slots.iconoIzquierdo && !cargando" class="shrink-0 flex items-center">
      <slot name="iconoIzquierdo"></slot>
    </span>

    <!-- Contenido Textual o Slot Principal -->
    <span v-if="cargando">{{ textoCarga }}</span>
    <span v-else class="truncate"><slot></slot></span>

    <!-- Icono Derecho (Slot) -->
    <span v-if="$slots.iconoDerecho && !cargando" class="shrink-0 flex items-center">
      <slot name="iconoDerecho"></slot>
    </span>
  </button>
</template>
