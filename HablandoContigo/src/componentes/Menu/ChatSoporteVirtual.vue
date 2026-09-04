<!--
  ============================================================================
  COMPONENTE CHAT ASISTENTE VIRTUAL DE SOPORTE (ChatSoporteVirtual.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Chat inteligente interactivo de soporte en tiempo real:
  - ChatMensajesLista: Renderizado de burbujas con respuestas y acciones rápidas.
  - ChatInputMensaje: Campo de entrada con BotonBase para envío.
  - baseConocimientoSoporte.ts: Motor analítico con respuestas contextuales.
-->

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { RotateCcw, Bot } from 'lucide-vue-next'
import {
  type MensajeChat,
  MENSAJE_INICIAL_ASISTENTE,
  PREGUNTAS_FRECUENTES_SOPORTE,
  procesarRespuestaSoporte
} from './ChatSoporte/baseConocimientoSoporte'
import ChatMensajesLista from './ChatSoporte/ChatMensajesLista.vue'
import ChatInputMensaje from './ChatSoporte/ChatInputMensaje.vue'

const mensajes = ref<MensajeChat[]>([{ ...MENSAJE_INICIAL_ASISTENTE }])
const escribiendo = ref(false)
const contenedorChatRef = ref<HTMLDivElement | null>(null)

const desplazarAlFinal = async () => {
  await nextTick()
  if (contenedorChatRef.value) {
    contenedorChatRef.value.scrollTop = contenedorChatRef.value.scrollHeight
  }
}

const enviarMensaje = async (texto: string) => {
  if (!texto.trim()) return

  mensajes.value.push({
    id: `usr-${Date.now()}`,
    remitente: 'usuario',
    texto,
    hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  })

  desplazarAlFinal()

  escribiendo.value = true
  await new Promise(resolve => setTimeout(resolve, 500))

  const respuestaBot = procesarRespuestaSoporte(texto)

  mensajes.value.push({
    id: `bot-${Date.now()}`,
    remitente: 'asistente',
    texto: respuestaBot,
    hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  })

  escribiendo.value = false
  desplazarAlFinal()
}

const reiniciarChat = () => {
  mensajes.value = [
    {
      id: 'msg-inicio',
      remitente: 'asistente',
      texto: 'Conversación reiniciada. ¿En qué puedo ayudarte hoy?',
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      accionesSugeridas: MENSAJE_INICIAL_ASISTENTE.accionesSugeridas
    }
  ]
}

onMounted(() => {
  desplazarAlFinal()
})
</script>

<template>
  <div class="flex flex-col h-[460px] bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-left shadow-inner">
    <!-- Barra Superior -->
    <div class="px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-500 flex items-center justify-center">
          <Bot class="w-4 h-4" />
        </div>
        <div>
          <h4 class="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <span>Asistente HablandoContigo</span>
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </h4>
          <span class="text-[10px] text-slate-400">En línea · Respuesta instantánea</span>
        </div>
      </div>

      <button
        type="button"
        @click="reiniciarChat"
        class="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1"
        title="Reiniciar chat"
      >
        <RotateCcw class="w-3.5 h-3.5" />
        <span class="text-[11px] hidden sm:inline">Reiniciar</span>
      </button>
    </div>

    <!-- Contenedor scrolleable de mensajes -->
    <div ref="contenedorChatRef" class="flex-1 overflow-y-auto">
      <ChatMensajesLista
        :mensajes="mensajes"
        :escribiendo="escribiendo"
        @clickAccion="enviarMensaje"
      />
    </div>

    <!-- Barra Inferior de Entrada -->
    <ChatInputMensaje
      :deshabilitado="escribiendo"
      @enviar="enviarMensaje"
    />
  </div>
</template>
