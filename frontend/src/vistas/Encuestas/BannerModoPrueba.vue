<script setup lang="ts">
import { FlaskConical, LogOut } from 'lucide-vue-next'

defineProps<{
  activo: boolean
}>()

const emit = defineEmits<{
  (e: 'salir'): void
}>()
</script>

<template>
  <div 
    v-if="activo" 
    class="sticky top-0 z-[100] w-full max-w-4xl mx-auto bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-purple-900/90 backdrop-blur-md border border-purple-500/40 rounded-2xl py-3 px-4 sm:px-6 mb-4 flex items-center justify-between shadow-xl text-left"
  >
    <div class="flex items-center gap-3 text-purple-200 text-xs sm:text-sm font-semibold">
      <span class="px-2.5 py-1 rounded-lg bg-purple-500/30 text-purple-300 font-black text-[11px] uppercase tracking-wider border border-purple-400/30 flex items-center gap-1.5 shrink-0">
        <FlaskConical class="w-3.5 h-3.5" />
        Modo Prueba
      </span>
      <span class="hidden sm:inline">Estás en vista de prueba confidencial. Puedes salir en cualquier momento.</span>
    </div>
    <button
      type="button"
      @click="emit('salir')"
      class="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md active:scale-95 shrink-0"
    >
      <LogOut class="w-4 h-4" />
      <span>Salir de la Prueba</span>
    </button>
  </div>
</template>
