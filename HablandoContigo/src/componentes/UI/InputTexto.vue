<!--
  ============================================================================
  COMPONENTE REUTILIZABLE: CAMPO DE ENTRADA DE TEXTO (InputTexto.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Campo de entrada textual atómico altamente estilizado:
  - Soporta enlace bidireccional estándar con v-model.
  - Soporte de ranuras (slots) para iconos izquierdo y derecho.
  - Borde con foco iluminado sutil sin alterar el diseño estructural.
  - Compatible con Modo Claro y Modo Oscuro.
  
  ¿PARA QUÉ SIRVE?
  - Estandarizar la captura de datos (búsqueda de encuestas, códigos de acceso,
    campos de texto en preguntas) con máxima legibilidad y estética.
  
  ¿DÓNDE SE USA Y CON QUÉ ARCHIVOS SE CONECTA?
  - DashboardColaboradorAnonimo.vue (búsqueda de encuestas y códigos).
  - EncuestaPreguntaItem.vue (identificación voluntaria).
  - Modales del sistema.
-->

<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: string
    placeholder?: string
    tipo?: string
    deshabilitado?: boolean
    tamano?: 'sm' | 'md'
  }>(),
  {
    placeholder: '',
    tipo: 'text',
    deshabilitado: false,
    tamano: 'md'
  }
)

defineEmits<{
  (e: 'update:modelValue', valor: string): void
  (e: 'enter'): void
}>()
</script>

<template>
  <div class="relative w-full">
    <!-- Icono Izquierdo Opcional -->
    <span
      v-if="$slots.iconoIzquierdo"
      class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-neutral-500 pointer-events-none flex items-center"
    >
      <slot name="iconoIzquierdo"></slot>
    </span>

    <input
      :type="tipo"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="deshabilitado"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @keydown.enter="$emit('enter')"
      :class="[
        'w-full transition-all duration-200 outline-none rounded-2xl font-normal',
        'bg-slate-100/90 dark:bg-neutral-900/90 border border-slate-300/80 dark:border-white/15',
        'text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500',
        'focus:border-sky-500 dark:focus:border-white focus:ring-1 focus:ring-sky-500/20 dark:focus:ring-white/20',
        tamano === 'sm' ? 'py-2 text-xs' : 'py-3 text-sm',
        $slots.iconoIzquierdo ? 'pl-10' : 'pl-4',
        $slots.iconoDerecho ? 'pr-10' : 'pr-4'
      ]"
    />

    <!-- Icono Derecho Opcional -->
    <span
      v-if="$slots.iconoDerecho"
      class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-neutral-500 flex items-center"
    >
      <slot name="iconoDerecho"></slot>
    </span>
  </div>
</template>
