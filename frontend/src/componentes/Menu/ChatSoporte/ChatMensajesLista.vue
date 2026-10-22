<!--
  ============================================================================
  LISTA DE MENSAJES DEL CHAT DE SOPORTE (ChatMensajesLista.vue)
  ============================================================================
-->

<script setup lang="ts">
import { Bot, User } from 'lucide-vue-next'
import type { MensajeChat } from './baseConocimientoSoporte'

defineProps<{
  mensajes: MensajeChat[]
  escribiendo: boolean
}>()

const emit = defineEmits<{
  (e: 'clickAccion', accion: string): void
}>()
</script>

<template>
  <div class="space-y-4 p-4 text-xs text-left">
    <div
      v-for="msg in mensajes"
      :key="msg.id"
      class="flex gap-2.5"
      :class="msg.remitente === 'usuario' ? 'justify-end' : 'justify-start'"
    >
      <div 
        v-if="msg.remitente === 'asistente'" 
        class="w-7 h-7 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-500 flex items-center justify-center shrink-0 mt-0.5"
      >
        <Bot class="w-4 h-4" />
      </div>

      <div 
        class="max-w-[82%] space-y-1.5"
        :class="msg.remitente === 'usuario' ? 'items-end flex flex-col' : 'items-start flex flex-col'"
      >
        <div
          class="p-3.5 rounded-2xl leading-relaxed whitespace-pre-line text-xs"
          :class="msg.remitente === 'usuario'
            ? 'bg-sky-600 text-white rounded-br-none shadow-md shadow-sky-600/20'
            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none shadow-sm'"
        >
          {{ msg.texto }}
        </div>

        <!-- Acciones sugeridas de 1-clic -->
        <div v-if="msg.accionesSugeridas && msg.accionesSugeridas.length > 0" class="flex flex-wrap gap-1.5 pt-1">
          <button
            v-for="(acc, aIdx) in msg.accionesSugeridas"
            :key="aIdx"
            type="button"
            @click="emit('clickAccion', acc)"
            class="text-[11px] px-2.5 py-1 rounded-xl bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/60 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 transition-all cursor-pointer shadow-xs"
          >
            {{ acc }}
          </button>
        </div>

        <span class="text-[10px] text-slate-400 font-mono px-1">
          {{ msg.hora }}
        </span>
      </div>

      <div 
        v-if="msg.remitente === 'usuario'" 
        class="w-7 h-7 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5"
      >
        <User class="w-4 h-4" />
      </div>
    </div>

    <!-- Indicador de escritura del asistente -->
    <div v-if="escribiendo" class="flex items-center gap-2 text-slate-400 text-xs py-1">
      <div class="w-6 h-6 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center animate-pulse">
        <Bot class="w-3.5 h-3.5" />
      </div>
      <div class="flex items-center gap-1">
        <span class="w-1.5 h-1.5 rounded-full bg-sky-500 animate-bounce"></span>
        <span class="w-1.5 h-1.5 rounded-full bg-sky-500 animate-bounce [animation-delay:0.2s]"></span>
        <span class="w-1.5 h-1.5 rounded-full bg-sky-500 animate-bounce [animation-delay:0.4s]"></span>
      </div>
    </div>
  </div>
</template>
