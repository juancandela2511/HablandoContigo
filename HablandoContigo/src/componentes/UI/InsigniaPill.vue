<!--
  ============================================================================
  COMPONENTE REUTILIZABLE: INSIGNIA PÍLDORA (InsigniaPill.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Insignia visual compacta para estados, categorías y alertas del sistema:
  - Soporta 5 variantes: 'exito', 'alerta', 'critico', 'info', 'neutro'.
  - Punto de pulso luminoso animado opcional ('conPulso').
  - Ranura para icono lateral o indicador visual.
  - Tipografía clara monoespaciada o sans-serif con contraste óptico.
  
  ¿PARA QUÉ SIRVE?
  - Identificar de inmediato el estado de anonimato, nivel de severidad de alertas
    psicosociales o categoría temática de una encuesta.
  
  ¿DÓNDE SE USA Y CON QUÉ ARCHIVOS SE CONECTA?
  - EncuestaBarraSuperior.vue (insignia 100% Anónimo).
  - EncuestaPreguntaItem.vue (categoría y bifurcación).
  - DashboardColaboradorAnonimo.vue (departamentos y estado activo).
  - HeroPrincipal.vue (pill badge superior).
-->

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    variante?: 'exito' | 'alerta' | 'critico' | 'info' | 'neutro'
    conPulso?: boolean
    tamano?: 'sm' | 'md'
  }>(),
  {
    variante: 'info',
    conPulso: false,
    tamano: 'sm'
  }
)

const clasesVariante = computed(() => {
  switch (props.variante) {
    case 'exito':
      return 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
    case 'alerta':
      return 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-300'
    case 'critico':
      return 'bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400'
    case 'neutro':
      return 'bg-slate-200/80 dark:bg-white/5 border-slate-300 dark:border-white/10 text-slate-700 dark:text-neutral-300'
    case 'info':
    default:
      return 'bg-sky-500/15 border-sky-500/30 text-sky-600 dark:text-sky-400'
  }
})

const colorPunto = computed(() => {
  switch (props.variante) {
    case 'exito': return 'bg-emerald-500'
    case 'alerta': return 'bg-amber-400'
    case 'critico': return 'bg-rose-500'
    case 'neutro': return 'bg-slate-400 dark:bg-neutral-400'
    case 'info':
    default: return 'bg-sky-400'
  }
})
</script>

<template>
  <span
    :class="[
      'inline-flex items-center rounded-full border font-mono font-semibold select-none transition-colors',
      tamano === 'sm' ? 'px-2.5 py-0.5 text-[11px] gap-1.5' : 'px-3.5 py-1 text-xs gap-2',
      clasesVariante
    ]"
  >
    <!-- Punto de Pulso Luminoso Opcional -->
    <span v-if="conPulso" :class="['w-1.5 h-1.5 rounded-full shrink-0 animate-pulse', colorPunto]" />

    <!-- Icono Opcional -->
    <span v-if="$slots.icono" class="shrink-0 flex items-center">
      <slot name="icono"></slot>
    </span>

    <slot></slot>
  </span>
</template>
