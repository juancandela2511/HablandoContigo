<!--
  ============================================================================
  COPILOTO ADMINISTRATIVO OLLAMA FLOTANTE (CopilotoAdminFlotante.vue)
  ============================================================================
  Botón flotante discreto con notificación compacta (Sí / No) para sugerir
  alertas, gráficos anclados y simplificación de preguntas sin saturar la vista.
-->

<script setup lang="ts">
import { onMounted } from 'vue'
import { useCopilotoAdmin } from '@/asistenteOllama/useCopilotoAdmin'
import TarjetaNotificacionAlertas from './TarjetaNotificacionAlertas.vue'
import TarjetaNotificacionGraficos from './TarjetaNotificacionGraficos.vue'
import TarjetaSugerenciaPreguntas from './TarjetaSugerenciaPreguntas.vue'
import { Bot, Sparkles, RefreshCw, X, Check } from 'lucide-vue-next'

const {
  sugerenciasAlertas,
  sugerenciasGraficos,
  sugerenciasPreguntas,
  cargandoSugerencias,
  origenMotorIA,
  panelAbierto,
  mostrarMiniNotificacion,
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

onMounted(() => {
  analizarYSugerirConOllama(false)
})
</script>

<template>
  <div class="fixed bottom-5 left-5 z-40 max-w-sm font-['Poppins',sans-serif]">
    <!-- 1. Mini-notificación única y compacta (fácil de aceptar o cerrar) -->
    <div
      v-if="mostrarMiniNotificacion && !panelAbierto && totalSugerenciasPendientes > 0"
      class="mb-2.5 p-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-blue-500/30 shadow-xl space-y-2 text-left animate-fade-in"
    >
      <div class="flex items-center justify-between gap-2">
        <span class="text-[11px] font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
          <Bot class="w-3.5 h-3.5 text-blue-500" />
          <span>Sugerencias</span>
        </span>
        <button
          @click="mostrarMiniNotificacion = false"
          class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5"
          title="Ocultar aviso"
        >
          <X class="w-3.5 h-3.5" />
        </button>
      </div>

      <div v-if="sugerenciasAlertas.length > 0" class="flex items-center justify-between gap-2 text-[11px]">
        <span class="text-slate-600 dark:text-slate-300 truncate">
          🔔 ¿Crear {{ sugerenciasAlertas.length }} alerta(s) sugerida(s)?
        </span>
        <div class="flex items-center gap-1 shrink-0">
          <button @click="aceptarTodasLasAlertas" class="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-bold cursor-pointer">Sí</button>
          <button @click="rechazarTodasLasAlertas" class="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold cursor-pointer">No</button>
        </div>
      </div>

      <div v-if="sugerenciasGraficos.length > 0" class="flex items-center justify-between gap-2 text-[11px]">
        <span class="text-slate-600 dark:text-slate-300 truncate">
          📊 ¿Crear {{ sugerenciasGraficos.length }} gráfico(s) anclado(s)?
        </span>
        <div class="flex items-center gap-1 shrink-0">
          <button @click="aceptarTodosLosGraficos" class="px-2 py-0.5 rounded-md bg-blue-600 text-white font-bold cursor-pointer">Sí</button>
          <button @click="rechazarTodosLosGraficos" class="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold cursor-pointer">No</button>
        </div>
      </div>
    </div>

    <!-- 2. Panel desplegable bajo demanda -->
    <div
      v-if="panelAbierto"
      class="mb-2.5 w-[90vw] sm:w-[430px] max-h-[70vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-4 space-y-3 animate-fade-in"
    >
      <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
        <div class="flex items-center gap-2 text-left">
          <div class="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
            <Bot class="w-4 h-4" />
          </div>
          <div>
            <h3 class="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1">
              <span>Copiloto Ollama IA</span>
              <Sparkles class="w-3 h-3 text-amber-400" />
            </h3>
            <span class="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
              ● {{ origenMotorIA }}
            </span>
          </div>
        </div>

        <div class="flex items-center gap-1">
          <button
            @click="analizarYSugerirConOllama(true)"
            :disabled="cargandoSugerencias"
            class="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
          >
            <RefreshCw :class="['w-3.5 h-3.5', cargandoSugerencias ? 'animate-spin text-blue-500' : '']" />
          </button>
          <button
            @click="panelAbierto = false"
            class="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-pointer"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

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

      <TarjetaSugerenciaPreguntas
        :sugerencias="sugerenciasPreguntas"
        @aceptarCambio="aceptarCambioPregunta"
        @rechazarCambio="rechazarCambioPregunta"
        @aceptarTodos="aceptarTodosCambiosPreguntas"
      />

      <div
        v-if="totalSugerenciasPendientes === 0 && !cargandoSugerencias"
        class="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1"
      >
        <Check class="w-5 h-5 text-emerald-500 mx-auto" />
        <p class="text-xs font-extrabold text-slate-900 dark:text-white">¡Todo al día!</p>
      </div>
    </div>

    <!-- 3. Botón píldora discreto -->
    <button
      type="button"
      @click="panelAbierto = !panelAbierto"
      class="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-slate-900 dark:bg-blue-600 text-white shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/10"
    >
      <Bot class="w-4 h-4 text-amber-300" />
      <span class="text-xs font-bold">Asistencia</span>
      <span
        v-if="totalSugerenciasPendientes > 0"
        class="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black"
      >
        {{ totalSugerenciasPendientes }}
      </span>
    </button>
  </div>
</template>
