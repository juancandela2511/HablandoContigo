<!--
  ============================================================================
  CAMPO DE TEXTO ABIERTO CON SUGERENCIAS (PreguntaTextoAbierto.vue)
  ============================================================================
-->

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  valor: string
  placeholder?: string
  sugerencias?: string[]
}>()

const emit = defineEmits<{
  (e: 'actualizar', valor: string): void
}>()

const cantidadCaracteres = computed(() => {
  return (props.valor || '').trim().length
})

const agregarSugerencia = (sug: string) => {
  const actual = props.valor || ''
  const nuevo = actual ? `${actual}, ${sug.toLowerCase()}` : sug
  emit('actualizar', nuevo)
}
</script>

<template>
  <div class="space-y-3 pt-2 text-left">
    <div class="relative">
      <textarea
        :value="valor"
        @input="emit('actualizar', ($event.target as HTMLTextAreaElement).value)"
        rows="4"
        :placeholder="placeholder || 'Escribe aquí con total honestidad tus observaciones, detalles o sugerencias...'"
        class="w-full p-4 rounded-2xl bg-slate-100 dark:bg-neutral-950/90 border border-slate-300 dark:border-white/20 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-sky-500 dark:focus:border-white focus:ring-1 focus:ring-sky-500/20 dark:focus:ring-white/30 transition-all placeholder:text-slate-400 dark:placeholder:text-neutral-600 resize-none font-normal"
      ></textarea>
      
      <div class="absolute bottom-3 right-3 text-[11px] text-slate-500 dark:text-neutral-500 font-mono">
        {{ cantidadCaracteres }} caracteres
      </div>
    </div>

    <!-- Sugerencias de apoyo -->
    <div v-if="sugerencias && sugerencias.length > 0" class="space-y-1.5">
      <span class="text-[10px] text-slate-500 dark:text-neutral-400 uppercase tracking-wider font-semibold block">
        Ideas clave para fundamentar tu comentario (haz clic para añadir):
      </span>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="(sug, sIdx) in sugerencias"
          :key="sIdx"
          type="button"
          @click="agregarSugerencia(sug)"
          class="text-[11px] px-2.5 py-1 rounded-xl bg-slate-200/80 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
        >
          + {{ sug }}
        </button>
      </div>
    </div>
  </div>
</template>
