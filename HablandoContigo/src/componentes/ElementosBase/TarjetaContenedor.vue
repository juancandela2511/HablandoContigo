<!--
  ============================================================================
  COMPONENTE REUTILIZABLE: TARJETA CONTENEDOR (TarjetaContenedor.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Contenedor visual estructurado inspirado en el diseño de alta gama "Héroe 23":
  - Marcadores de visor en las cuatro esquinas (viewfinder brackets) de precisión.
  - Cristal translúcido con efecto desenfoque (backdrop-blur-2xl).
  - Borde sutil reactivo al Modo Claro y Modo Oscuro.
  - Ranuras (slots) para título, subtítulo, barra superior de acciones y cuerpo.
  
  ¿CON QUÉ OTROS ARCHIVOS SE CONECTA?
  - index.ts en src/componentes/ElementosBase/: Exportado como parte del paquete UI básico.
  - Utilizado como contenedor elegante en Inicio, Dashboard, Encuestas y Administración.
-->

<script setup lang="ts">
withDefaults(
  defineProps<{
    mostrarVisores?: boolean
    brilloBorde?: boolean
    relleno?: 'ninguno' | 'compacto' | 'normal' | 'amplio'
  }>(),
  {
    mostrarVisores: true,
    brilloBorde: false,
    relleno: 'normal'
  }
)
</script>

<template>
  <div
    :class="[
      'relative rounded-3xl transition-all duration-300 backdrop-blur-2xl',
      'bg-white/90 dark:bg-neutral-950/95 border border-slate-200/80 dark:border-white/10 shadow-2xl',
      brilloBorde ? 'hover:border-sky-400/50 shadow-sky-500/5' : '',
      relleno === 'ninguno' ? 'p-0' :
      relleno === 'compacto' ? 'p-4 sm:p-5' :
      relleno === 'amplio' ? 'p-8 sm:p-12' : 'p-6 sm:p-9'
    ]"
  >
    <!-- Marcadores de Visor en las Cuatro Esquinas (Viewfinder Brackets) -->
    <template v-if="mostrarVisores">
      <span class="absolute top-3 left-3 w-2.5 h-2.5 border-t border-l border-slate-400/40 dark:border-white/30 pointer-events-none" />
      <span class="absolute top-3 right-3 w-2.5 h-2.5 border-t border-r border-slate-400/40 dark:border-white/30 pointer-events-none" />
      <span class="absolute bottom-3 left-3 w-2.5 h-2.5 border-b border-l border-slate-400/40 dark:border-white/30 pointer-events-none" />
      <span class="absolute bottom-3 right-3 w-2.5 h-2.5 border-b border-r border-slate-400/40 dark:border-white/30 pointer-events-none" />
    </template>

    <!-- Slot de Encabezado Personalizado -->
    <div v-if="$slots.encabezado" class="mb-5 pb-4 border-b border-slate-200/80 dark:border-white/10">
      <slot name="encabezado"></slot>
    </div>

    <!-- Contenido Principal -->
    <slot></slot>

    <!-- Slot de Pie de Tarjeta -->
    <div v-if="$slots.pie" class="mt-6 pt-4 border-t border-slate-200/80 dark:border-white/10">
      <slot name="pie"></slot>
    </div>
  </div>
</template>
