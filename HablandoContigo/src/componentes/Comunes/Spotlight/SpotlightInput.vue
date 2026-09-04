<!--
  ============================================================================
  BARRA DE ENTRADA DEL BUSCADOR SPOTLIGHT (SpotlightInput.vue)
  ============================================================================
  
  ¿QUÉ HACE?
  Proporciona el input de texto de búsqueda reactivo con icono, botón de limpieza
  y tecla ESC para cerrar rápidamente.
  
  ¿CON QUÉ SE CONECTA?
  - BuscadorSpotlight.vue (Componente contenedor)
-->

<script setup lang="ts">
import { ref } from 'vue'
import { Search, X } from 'lucide-vue-next'

defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void
  (e: 'enter'): void
}>()

const inputRef = ref<HTMLInputElement | null>(null)

defineExpose({
  focus: () => inputRef.value?.focus()
})
</script>

<template>
  <div class="p-4 sm:p-5 flex items-center gap-3 border-b border-slate-800/80 bg-slate-950/60">
    <Search class="w-5 h-5 text-sky-400 shrink-0" />
    <input
      ref="inputRef"
      :value="modelValue"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @keydown.enter="emit('enter')"
      type="text"
      placeholder="Buscar alertas, gráficos, encuestas, cuentas o perfiles (ej. 'acoso', 'radar')..."
      class="w-full bg-transparent text-white placeholder-slate-400 text-sm sm:text-base focus:outline-none font-medium"
    />
    
    <button
      v-if="modelValue"
      type="button"
      @click="emit('update:modelValue', '')"
      class="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
      title="Limpiar búsqueda"
    >
      <X class="w-4 h-4" />
    </button>

    <span class="px-2 py-0.5 rounded-lg bg-slate-800 text-[10px] font-mono text-slate-400 border border-slate-700 hidden sm:inline">
      ESC
    </span>
  </div>
</template>
