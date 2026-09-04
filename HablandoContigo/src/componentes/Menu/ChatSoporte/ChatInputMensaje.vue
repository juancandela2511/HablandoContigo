<!--
  ============================================================================
  BARRA DE ENTRADA DEL CHAT DE SOPORTE (ChatInputMensaje.vue)
  ============================================================================
-->

<script setup lang="ts">
import { ref } from 'vue'
import { Send } from 'lucide-vue-next'
import { BotonBase } from '@/componentes/ElementosBase'

defineProps<{
  deshabilitado?: boolean
}>()

const emit = defineEmits<{
  (e: 'enviar', texto: string): void
}>()

const texto = ref('')

const enviar = () => {
  if (!texto.value.trim()) return
  emit('enviar', texto.value.trim())
  texto.value = ''
}
</script>

<template>
  <div class="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
    <input
      v-model="texto"
      type="text"
      placeholder="Escribe tu consulta sobre la plataforma..."
      @keydown.enter="enviar"
      :disabled="deshabilitado"
      class="flex-1 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-sky-500 transition-colors"
    />

    <BotonBase
      variante="primario"
      tamano="pequeno"
      :deshabilitado="!texto.trim() || deshabilitado"
      @click="enviar"
    >
      <template #iconoIzquierdo>
        <Send class="w-3.5 h-3.5" />
      </template>
      <span>Enviar</span>
    </BotonBase>
  </div>
</template>
