<!--
  ============================================================================
  BANNER COMPACTO DE SUGERENCIAS OLLAMA (BannerSugerenciasAdmin.vue)
  ============================================================================
  Barra minimalista y colapsada por defecto para no saturar la interfaz.
  El administrador puede expandirla bajo demanda o aceptar/descartar rápido.
-->

<script setup lang="ts">
import { ref } from 'vue'
import { useCopilotoAdmin } from '@/asistenteOllama/useCopilotoAdmin'
import TarjetaNotificacionAlertas from './TarjetaNotificacionAlertas.vue'
import TarjetaNotificacionGraficos from './TarjetaNotificacionGraficos.vue'
import TarjetaSugerenciaPreguntas from './TarjetaSugerenciaPreguntas.vue'
import { Bot, ChevronDown, ChevronUp, RefreshCw } from 'lucide-vue-next'

// Colapsado por defecto para mantener la vista limpia y despejada
const expandido = ref(false)

const {
  sugerenciasAlertas,
  sugerenciasGraficos,
  sugerenciasPreguntas,
  cargandoSugerencias,
  totalSugerenciasPendientes,
  analizarYSugerirConOllama,
  aceptarSugerenciaAlerta,
  aceptarTodasLasAlertas,
  rechazarSugerenciaAlerta,
  rechazarTodasLasAlertas,
  aceptarSugerenciaGrafico,
  aceptarTodosLosGraficos,
  rechazarSugerenciaGrafico,
  rechazarTodosLosGraficos,
  aceptarCambioPregunta,
  aceptarTodosCambiosPreguntas,
  rechazarCambioPregunta
} = useCopilotoAdmin()
</script>

<template>
  <div
    v-if="totalSugerenciasPendientes > 0"
    class="px-4 py-2.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-blue-500/25 shadow-xs text-left transition-all"
  >
    <div class="flex flex-wrap items-center justify-between gap-2">
      <div class="flex items-center gap-2.5">
        <div class="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
          <Bot class="w-4 h-4" />
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-xs font-extrabold text-slate-900 dark:text-white">
            Sugerencias
          </span>
          <span class="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-mono font-bold">
            {{ totalSugerenciasPendientes }} disponible(s)
          </span>
          <span class="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
            
          </span>
        </div>
      </div>

      <div class="flex items-center gap-1.5">
        <button
          type="button"
          @click="analizarYSugerirConOllama(true)"
          :disabled="cargandoSugerencias"
          class="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
        >
          <RefreshCw :class="['w-3 h-3', cargandoSugerencias ? 'animate-spin text-blue-500' : '']" />
          <span class="hidden sm:inline"></span>
        </button>

        <button
          type="button"
          @click="expandido = !expandido"
          class="px-3 py-1 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
        >
          <span>{{ expandido ? 'Ocultar' : 'Revisar sugerencias' }}</span>
          <component :is="expandido ? ChevronUp : ChevronDown" class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <div v-if="expandido" class="grid grid-cols-1 lg:grid-cols-2 gap-3 pt-3 mt-2.5 border-t border-slate-100 dark:border-slate-800">
      <TarjetaNotificacionAlertas
        :sugerencias="sugerenciasAlertas"
        @aceptarUna="aceptarSugerenciaAlerta"
        @rechazarUna="rechazarSugerenciaAlerta"
        @aceptarTodas="aceptarTodasLasAlertas"
        @rechazarTodas="rechazarTodasLasAlertas"
      />

      <TarjetaNotificacionGraficos
        :sugerencias="sugerenciasGraficos"
        @aceptarUno="aceptarSugerenciaGrafico"
        @rechazarUno="rechazarSugerenciaGrafico"
        @aceptarTodos="aceptarTodosLosGraficos"
        @rechazarTodos="rechazarTodosLosGraficos"
      />

      <div class="lg:col-span-2">
        <TarjetaSugerenciaPreguntas
          :sugerencias="sugerenciasPreguntas"
          @aceptarCambio="aceptarCambioPregunta"
          @rechazarCambio="rechazarCambioPregunta"
          @aceptarTodos="aceptarTodosCambiosPreguntas"
        />
      </div>
    </div>
  </div>
</template>
