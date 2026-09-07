<!--
  ============================================================================
  PANEL DE CONFIGURACIÓN DE VOZ Y ASISTENTE IA (PerfilAjustesVozAsistente.vue)
  ============================================================================
-->

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Volume2,
  VolumeX,
  Sparkles,
  Play,
  Check,
  Radio,
  Sliders,
  Gauge,
  UserCheck,
  Cpu,
  Bot,
  Key,
  ShieldCheck
} from 'lucide-vue-next'
import { useAsistenteVoz } from '@/Almacenes/useAsistenteVoz'
import { obtenerClaveApiGemini, guardarClaveApiGemini, esClaveApiValida } from '@/Servicios/iaEncuestasService'
import BotonBase from '@/componentes/ElementosBase/BotonBase.vue'

const {
  ajustes,
  hablandoActualmente,
  vocesDisponibles,
  hablar,
  detener,
  reproducirPrueba,
  actualizarAjustes
} = useAsistenteVoz()

const nombreAsistenteLocal = ref(ajustes.value.nombreAsistente || 'JARVIS')
const vozHabilitadaLocal = ref(ajustes.value.vozHabilitada)
const volumenLocal = ref(Math.round(ajustes.value.volumen * 100))
const velocidadLocal = ref(ajustes.value.velocidad)
const vozURILocal = ref(ajustes.value.vozURI)
const geminiApiKeyLocal = ref(obtenerClaveApiGemini())

const tieneKeyValida = computed(() => esClaveApiValida(geminiApiKeyLocal.value))

const nombresSugeridos = ['Daniel', 'JARVIS', 'Friday', 'Sofía', 'Contigo AI', 'Apolo']

const seleccionarNombreSugerido = (nombre: string) => {
  nombreAsistenteLocal.value = nombre
  guardar()
}

const guardarApiKey = () => {
  guardarClaveApiGemini(geminiApiKeyLocal.value)
}

const guardar = () => {
  guardarApiKey()
  actualizarAjustes({
    nombreAsistente: nombreAsistenteLocal.value.trim() || 'JARVIS',
    vozHabilitada: vozHabilitadaLocal.value,
    volumen: volumenLocal.value / 100,
    velocidad: Number(velocidadLocal.value),
    vozURI: vozURILocal.value
  })
}
</script>

<template>
  <div class="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-left font-['Poppins',sans-serif]">
    
    <!-- Encabezado -->
    <div class="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
      <div class="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
        <Bot class="w-6 h-6 stroke-[1.8]" />
      </div>
      <div>
        <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white">
          Ajustes del Asistente de Voz &amp; Gemini IA
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Personaliza el nombre de llamada y la voz del asistente interactivo que edita tus encuestas.
        </p>
      </div>
    </div>

    <!-- Controles Principales -->
    <div class="space-y-6">

      <!-- ── CONFIGURACIÓN DEL NOMBRE / PALABRA DE ACTIVACIÓN ── -->
      <div class="p-5 rounded-3xl bg-gradient-to-br from-cyan-950/20 via-sky-950/20 to-blue-950/20 border border-cyan-500/30 space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
            <Cpu class="w-4 h-4 text-cyan-500" />
            <span>Nombre del Asistente (Palabra de Activación)</span>
          </div>
          <span class="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-mono font-bold">
            Gemini 2.5 Flash
          </span>
        </div>

        <p class="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
          Elige el nombre con el que te dirigirás al asistente por voz o chat (ejemplo: <strong class="text-cyan-600 dark:text-cyan-300 font-bold">"Daniel, edítame esta encuesta"</strong> o <strong class="text-cyan-600 dark:text-cyan-300 font-bold">"Daniel, cambia la pregunta 3"</strong>).
        </p>

        <!-- Input de Nombre -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div class="relative flex-1">
            <input
              type="text"
              v-model="nombreAsistenteLocal"
              @input="guardar"
              placeholder="Ej: Daniel, JARVIS, Sofía..."
              class="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-950 border border-cyan-500/40 text-xs text-slate-900 dark:text-white font-bold placeholder-slate-400 outline-none focus:ring-2 focus:ring-cyan-500 transition-all shadow-inner"
            />
          </div>
        </div>

        <!-- Presets / Sugerencias rápidas -->
        <div class="space-y-1.5">
          <span class="text-[10px] font-mono text-slate-500 dark:text-slate-400 block">
            Nombres recomendados para activación rápida:
          </span>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="nombre in nombresSugeridos"
              :key="nombre"
              type="button"
              @click="seleccionarNombreSugerido(nombre)"
              :class="[
                'px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border',
                nombreAsistenteLocal.toLowerCase() === nombre.toLowerCase()
                  ? 'bg-cyan-500 text-white border-cyan-400 shadow-md shadow-cyan-500/30 scale-105'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-cyan-400'
              ]"
            >
              {{ nombre }}
            </button>
          </div>
        </div>
      </div>

      <!-- ── CLAVE DE API DE GOOGLE GEMINI (OPCIONAL) ── -->
      <div class="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
            <Key class="w-4 h-4 text-amber-500" />
            <span>Clave de API de Google Gemini (Opcional)</span>
          </div>
          <span 
            :class="[
              'px-2 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1',
              tieneKeyValida
                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                : 'bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800'
            ]"
          >
            <ShieldCheck v-if="tieneKeyValida" class="w-3 h-3" />
            <span>{{ tieneKeyValida ? 'Gemini 2.0 / 1.5 Activo' : 'Motor NLP Local Activo' }}</span>
          </span>
        </div>

        <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          Si dispones de una API Key oficial de Google AI Studio (formato <code class="font-mono text-cyan-600 dark:text-cyan-400">AIzaSy...</code>), puedes pegarla aquí. De lo contrario, el sistema utilizará el motor de IA local sin requerir llamadas externas.
        </p>

        <div class="flex items-center gap-2">
          <input
            type="password"
            v-model="geminiApiKeyLocal"
            @change="guardar"
            placeholder="Pega tu API Key (AIzaSy...)"
            class="flex-1 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500"
          />
          <button
            type="button"
            @click="guardar"
            class="px-4 py-2.5 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 transition-all cursor-pointer"
          >
            Guardar
          </button>
        </div>
      </div>
      
      <!-- Interruptor Activar / Desactivar Voz -->
      <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
        <div>
          <span class="text-xs font-bold text-slate-900 dark:text-white block">
            Voz del Asistente en Encuestas de Clima
          </span>
          <span class="text-[11px] text-slate-500 dark:text-slate-400">
            El asistente hablará en voz alta para confirmar cambios y dialogar contigo.
          </span>
        </div>

        <label class="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            v-model="vozHabilitadaLocal"
            @change="guardar"
            class="sr-only peer"
          />
          <div class="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
        </label>
      </div>

      <!-- Control de Volumen -->
      <div class="space-y-2">
        <div class="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
          <span class="flex items-center gap-1.5">
            <Volume2 class="w-4 h-4 text-cyan-500" />
            Volumen de Voz
          </span>
          <span class="font-mono font-bold">{{ volumenLocal }}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          v-model="volumenLocal"
          @change="guardar"
          class="w-full accent-cyan-600 cursor-pointer"
        />
      </div>

      <!-- Control de Velocidad -->
      <div class="space-y-2">
        <div class="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
          <span class="flex items-center gap-1.5">
            <Gauge class="w-4 h-4 text-indigo-500" />
            Velocidad de Locución
          </span>
          <span class="font-mono font-bold">{{ velocidadLocal }}x</span>
        </div>
        <input
          type="range"
          min="0.7"
          max="1.3"
          step="0.1"
          v-model="velocidadLocal"
          @change="guardar"
          class="w-full accent-indigo-600 cursor-pointer"
        />
      </div>

      <!-- Selector de Voz -->
      <div v-if="vocesDisponibles.length > 0" class="space-y-1.5">
        <label class="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
          Voz de Síntesis del Sistema:
        </label>
        <select
          v-model="vozURILocal"
          @change="guardar"
          class="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white outline-none cursor-pointer"
        >
          <option value="">Voz Predeterminada del Navegador</option>
          <option
            v-for="v in vocesDisponibles"
            :key="v.voiceURI"
            :value="v.voiceURI"
          >
            {{ v.name }} ({{ v.lang }})
          </option>
        </select>
      </div>

    </div>

    <!-- Botón de Prueba en Vivo -->
    <div class="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
      <span class="text-[11px] text-slate-500 dark:text-slate-400">
        Nombre actual: <strong class="text-cyan-600 dark:text-cyan-300">{{ nombreAsistenteLocal }}</strong>
      </span>

      <BotonBase
        variante="secundario"
        tamano="pequeno"
        :cargando="hablandoActualmente"
        @click="reproducirPrueba"
      >
        <template #iconoIzquierdo>
          <Play class="w-4 h-4 text-cyan-500" />
        </template>
        <span>{{ hablandoActualmente ? 'Hablando...' : `Probar Voz de ${nombreAsistenteLocal}` }}</span>
      </BotonBase>
    </div>

  </div>
</template>