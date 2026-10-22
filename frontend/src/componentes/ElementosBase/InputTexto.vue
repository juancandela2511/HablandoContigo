<!--
  ============================================================================
  COMPONENTE REUTILIZABLE: CAMPO DE ENTRADA DE TEXTO (InputTexto.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Campo de entrada textual atómico altamente estilizado:
  - Soporta enlace bidireccional estándar con v-model.
  - Soporte de ranuras (slots) para iconos izquierdo y derecho.
  - Soporte para etiqueta superior (label) y texto de ayuda o error.
  - Compatible con Modo Claro y Modo Oscuro.
  
  ¿CON QUÉ OTROS ARCHIVOS SE CONECTA?
  - index.ts en src/componentes/ElementosBase/: Exportado como parte del paquete UI básico.
  - Utilizado en formularios de Login, Administración de cuentas, Modales y Filtros.
-->

<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: string
    etiqueta?: string
    placeholder?: string
    tipo?: string
    deshabilitado?: boolean
    error?: string
    ayuda?: string
    tamano?: 'sm' | 'md'
  }>(),
  {
    etiqueta: '',
    placeholder: '',
    tipo: 'text',
    deshabilitado: false,
    error: '',
    ayuda: '',
    tamano: 'md'
  }
)

defineEmits<{
  (e: 'update:modelValue', valor: string): void
  (e: 'enter'): void
}>()
</script>

<template>
  <div class="w-full flex flex-col gap-1.5">
    <!-- Etiqueta Opcional -->
    <label v-if="etiqueta" class="text-xs font-semibold text-slate-700 dark:text-neutral-300">
      {{ etiqueta }}
    </label>

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
          'bg-slate-100/90 dark:bg-neutral-900/90 border',
          error ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20' : 'border-slate-300/80 dark:border-white/15 focus:border-sky-500 dark:focus:border-white focus:ring-1 focus:ring-sky-500/20 dark:focus:ring-white/20',
          'text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500',
          tamano === 'sm' ? 'py-2 text-xs' : 'py-2.5 sm:py-3 text-sm',
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

    <!-- Mensaje de Error o Ayuda -->
    <p v-if="error" class="text-xs text-rose-500 font-medium pl-1">{{ error }}</p>
    <p v-else-if="ayuda" class="text-xs text-slate-500 dark:text-neutral-400 pl-1">{{ ayuda }}</p>
  </div>
</template>
