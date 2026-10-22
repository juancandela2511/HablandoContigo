<!--
  ============================================================================
  COMPONENTE VENTANA FLOTANTE DE SOPORTE TÉCNICO (ModalSoporte.vue)
  ============================================================================
  
  ¿QUÉ HACE?
  Ventana interactiva flotante, redimensionable y arrastrable:
  - Posicionamiento libre en pantalla (draggable).
  - Pestaña 1: Chat Asistente Virtual con IA.
  - Pestaña 2: Formulario de Contacto / Ticket de Soporte directo.
  
  ¿CON QUÉ SE CONECTA?
  - SoporteBarraVentana.vue: Barra de título y controles de ventana.
  - ChatSoporteVirtual.vue: Asistente virtual de IA.
  - SoporteContactoDirecto.vue: Formulario y canales de contacto.
  - Menu.vue: Disparador en la barra lateral.
-->

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { Bot, Mail, MessageSquare, Maximize2, X } from 'lucide-vue-next'
import ChatSoporteVirtual from './ChatSoporteVirtual.vue'
import SoporteBarraVentana from './Soporte/SoporteBarraVentana.vue'
import SoporteContactoDirecto from './Soporte/SoporteContactoDirecto.vue'

defineProps<{
  abierto: boolean
}>()

const emit = defineEmits<{
  (e: 'cerrar'): void
}>()

const pestanaActiva = ref<'chat' | 'contacto'>('chat')
const tamano = ref<'normal' | 'compacto' | 'minimizado'>('normal')

const posicion = ref({ x: 80, y: 70 })
const arrastrando = ref(false)
const offset = ref({ x: 0, y: 0 })

const iniciarArrastre = (e: MouseEvent | TouchEvent) => {
  if ((e.target as HTMLElement).closest('button, input, textarea')) return

  arrastrando.value = true
  const touch = 'touches' in e && e.touches.length > 0 ? e.touches[0] : null
  const clientX = touch ? touch.clientX : (e as MouseEvent).clientX
  const clientY = touch ? touch.clientY : (e as MouseEvent).clientY
  
  offset.value = {
    x: clientX - posicion.value.x,
    y: clientY - posicion.value.y
  }

  window.addEventListener('mousemove', moverVentana)
  window.addEventListener('mouseup', detenerArrastre)
  window.addEventListener('touchmove', moverVentana)
  window.addEventListener('touchend', detenerArrastre)
}

const moverVentana = (e: MouseEvent | TouchEvent) => {
  if (!arrastrando.value) return
  const touch = 'touches' in e && e.touches.length > 0 ? e.touches[0] : null
  const clientX = touch ? touch.clientX : (e as MouseEvent).clientX
  const clientY = touch ? touch.clientY : (e as MouseEvent).clientY

  const maxX = window.innerWidth - (tamano.value === 'minimizado' ? 240 : tamano.value === 'compacto' ? 360 : 540)
  const maxY = window.innerHeight - 80

  posicion.value = {
    x: Math.max(10, Math.min(maxX, clientX - offset.value.x)),
    y: Math.max(10, Math.min(maxY, clientY - offset.value.y))
  }
}

const detenerArrastre = () => {
  arrastrando.value = false
  window.removeEventListener('mousemove', moverVentana)
  window.removeEventListener('mouseup', detenerArrastre)
  window.removeEventListener('touchmove', moverVentana)
  window.removeEventListener('touchend', detenerArrastre)
}

onUnmounted(() => {
  detenerArrastre()
})
</script>

<template>
  <div
    v-if="abierto"
    class="fixed z-[9999] select-none transition-shadow font-['Poppins',sans-serif]"
    :style="{
      left: `${posicion.x}px`,
      top: `${posicion.y}px`
    }"
  >
    <!-- MODO MINIMIZADO -->
    <div
      v-if="tamano === 'minimizado'"
      @mousedown="iniciarArrastre"
      @touchstart="iniciarArrastre"
      class="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-white shadow-2xl backdrop-blur-xl cursor-grab active:cursor-grabbing hover:border-sky-500 transition-colors animate-fade-in"
    >
      <div class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
      <Bot class="w-4 h-4 text-sky-400" />
      <span class="text-xs font-semibold">Soporte Flotante</span>
      
      <div class="flex items-center gap-1 ml-2 border-l border-slate-700 pl-2">
        <button
          type="button"
          @click.stop="tamano = 'normal'"
          title="Restaurar ventana"
          class="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
        >
          <Maximize2 class="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          @click.stop="emit('cerrar')"
          title="Cerrar"
          class="p-1 rounded hover:bg-rose-900/50 text-slate-400 hover:text-rose-400 cursor-pointer"
        >
          <X class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <!-- MODO VENTANA COMPLETA / COMPACTA -->
    <div
      v-else
      :class="[
        'rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-[0_20px_60px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden backdrop-blur-2xl transition-all duration-200',
        tamano === 'compacto' ? 'w-[360px] h-[480px]' : 'w-[520px] max-w-[92vw] h-[580px]'
      ]"
    >
      <!-- Barra superior arrastrable -->
      <SoporteBarraVentana
        :tamano="tamano"
        @iniciarArrastre="iniciarArrastre"
        @cambiarTamano="tamano = $event"
        @cerrar="emit('cerrar')"
      />

      <!-- Pestañas de Navegación -->
      <div class="flex items-center gap-1 p-2 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs">
        <button
          type="button"
          @click="pestanaActiva = 'chat'"
          :class="[
            'px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all text-xs cursor-pointer',
            pestanaActiva === 'chat'
              ? 'bg-sky-600 text-white shadow-sm font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          ]"
        >
          <MessageSquare class="w-3.5 h-3.5" />
          <span>Chat Asistente IA</span>
        </button>

        <button
          type="button"
          @click="pestanaActiva = 'contacto'"
          :class="[
            'px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all text-xs cursor-pointer',
            pestanaActiva === 'contacto'
              ? 'bg-sky-600 text-white shadow-sm font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          ]"
        >
          <Mail class="w-3.5 h-3.5" />
          <span>Ticket Directo</span>
        </button>
      </div>

      <!-- Pestaña 1: Chat -->
      <div v-if="pestanaActiva === 'chat'" class="flex-1 overflow-hidden">
        <ChatSoporteVirtual />
      </div>

      <!-- Pestaña 2: Contacto -->
      <SoporteContactoDirecto v-else />
    </div>
  </div>
</template>
