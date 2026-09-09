<!--
  ============================================================================
  PANEL DE CONFIGURACIÓN DE VOZ Y ASISTENTE IA (PerfilAjustesVozAsistente.vue)
  ============================================================================
-->

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Volume2,
  Play,
  Sliders,
  Gauge,
  Cpu,
  Bot,
  Key,
  ShieldCheck,
  Mic,
  MessageSquare,
  User,
  Sparkles
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
  actualizarAjustes,
  tratoInfo
} = useAsistenteVoz()

const asistenteHabilitadoLocal = ref(ajustes.value.asistenteHabilitado !== false)
const nombreAsistenteLocal = ref(ajustes.value.nombreAsistente || 'Sofía')
const generoAsistenteLocal = ref<'mujer' | 'hombre'>(ajustes.value.generoAsistente || 'mujer')
const modoInteraccionLocal = ref<'solo_voz' | 'voz_y_chat'>(ajustes.value.modoInteraccion || 'solo_voz')
const vozHabilitadaLocal = ref(ajustes.value.vozHabilitada)
const volumenLocal = ref(Math.round(ajustes.value.volumen * 100))
const velocidadLocal = ref(ajustes.value.velocidad)
const tonoLocal = ref(ajustes.value.tono || 1.0)
const vozURILocal = ref(ajustes.value.vozURI)
const geminiApiKeyLocal = ref(obtenerClaveApiGemini())

const tieneKeyValida = computed(() => esClaveApiValida(geminiApiKeyLocal.value))

// Nombres sugeridos según género
const nombresSugeridosMujer = ['Sofía', 'Daniela', 'Friday', 'Alexa', 'Siri', 'Contigo AI']
const nombresSugeridosHombre = ['Daniel', 'JARVIS', 'Apolo', 'Friday', 'Contigo AI']

const alternarAsistenteHabilitado = () => {
  asistenteHabilitadoLocal.value = !asistenteHabilitadoLocal.value
  guardar()
}

const seleccionarGenero = (genero: 'mujer' | 'hombre') => {
  generoAsistenteLocal.value = genero
  // Si tenía el nombre por defecto del otro género, actualizarlo suavemente
  if (genero === 'hombre' && nombreAsistenteLocal.value.toLowerCase() === 'sofía') {
    nombreAsistenteLocal.value = 'Daniel'
  } else if (genero === 'mujer' && nombreAsistenteLocal.value.toLowerCase() === 'daniel') {
    nombreAsistenteLocal.value = 'Sofía'
  }
  guardar()
}

const seleccionarNombreSugerido = (nombre: string) => {
  nombreAsistenteLocal.value = nombre
  guardar()
}

const seleccionarModoInteraccion = (modo: 'solo_voz' | 'voz_y_chat') => {
  modoInteraccionLocal.value = modo
  guardar()
}

const guardarApiKey = () => {
  guardarClaveApiGemini(geminiApiKeyLocal.value)
}

const guardar = () => {
  guardarApiKey()
  actualizarAjustes({
    asistenteHabilitado: asistenteHabilitadoLocal.value,
    nombreAsistente: nombreAsistenteLocal.value.trim() || (generoAsistenteLocal.value === 'hombre' ? 'Daniel' : 'Sofía'),
    generoAsistente: generoAsistenteLocal.value,
    modoInteraccion: modoInteraccionLocal.value,
    vozHabilitada: vozHabilitadaLocal.value,
    volumen: volumenLocal.value / 100,
    velocidad: Number(velocidadLocal.value),
    tono: Number(tonoLocal.value),
    vozURI: vozURILocal.value
  })
}

/**
 * Pre-escucha individual de una voz específica del selector
 */
const probarVozEspecifica = async (vURI: string) => {
  if (hablandoActualmente.value) {
    detener()
    return
  }
  const vozObj = vocesDisponibles.value.find(v => v.voiceURI === vURI)
  const voc = tratoInfo.value.vocativo
  const esHombre = generoAsistenteLocal.value === 'hombre'
  const estado = esHombre ? 'listo' : 'lista'
  const nombre = nombreAsistenteLocal.value || (esHombre ? 'Daniel' : 'Sofía')
  const textoMuestra = `Hola, ${voc}. Soy ${nombre}, estoy ${estado} y a tu servicio con esta voz.`

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(textoMuestra)
    if (vozObj) {
      utt.voice = vozObj
      utt.lang = vozObj.lang
    }
    utt.volume = volumenLocal.value / 100
    utt.rate = Number(velocidadLocal.value)
    utt.pitch = Number(tonoLocal.value)
    window.speechSynthesis.speak(utt)
  }
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
          Personaliza el género (Hombre/Mujer), palabra de activación y timbre de voz de tu asistente interactivo.
        </p>
      </div>
    </div>

    <!-- Controles Principales -->
    <div class="space-y-6">

      <!-- ── 0. INTERRUPTOR MAESTRO: ACTIVAR / DESACTIVAR ASISTENTE EN TODA LA APP ── -->
      <div 
        :class="[
          'p-5 rounded-3xl border transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4',
          asistenteHabilitadoLocal
            ? 'bg-gradient-to-r from-emerald-500/10 via-sky-500/10 to-blue-500/10 border-emerald-500/40 shadow-sm dark:bg-emerald-950/20'
            : 'bg-slate-100 dark:bg-slate-950/80 border-slate-300 dark:border-slate-800 opacity-80'
        ]"
      >
        <div class="flex items-start gap-3.5">
          <div 
            :class="[
              'w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 transition-all',
              asistenteHabilitadoLocal
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                : 'bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
            ]"
          >
            <Bot class="w-6 h-6" />
          </div>
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <h4 class="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                Estado del Asistente Inteligente en Toda la Aplicación
              </h4>
              <span 
                :class="[
                  'px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border',
                  asistenteHabilitadoLocal
                    ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                ]"
              >
                {{ asistenteHabilitadoLocal ? '🟢 Activo & Visible' : '⚪ Desactivado / Reposo' }}
              </span>
            </div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              {{ asistenteHabilitadoLocal 
                ? 'El asistente está activo en toda la plataforma, listo para escuchar comandos de voz y ayudarte en cualquier vista.' 
                : 'El asistente se encuentra apagado y oculto en todas las pantallas. No responderá ni escuchará hasta que lo actives de nuevo.' 
              }}
            </p>
          </div>
        </div>

        <label class="relative inline-flex items-center cursor-pointer shrink-0">
          <input
            type="checkbox"
            v-model="asistenteHabilitadoLocal"
            @change="guardar"
            class="sr-only peer"
          />
          <div class="w-14 h-7 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5.5 after:w-6.5 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
        </label>
      </div>

      <!-- ── 1. CONFIGURACIÓN DE GÉNERO (HOMBRE / MUJER) ── -->
      <div class="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
            <User class="w-4 h-4 text-pink-500 dark:text-pink-400" />
            <span>Género e Identidad de Voz del Asistente</span>
          </div>
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-pink-100 dark:bg-pink-950/80 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800">
            {{ generoAsistenteLocal === 'mujer' ? '👩 Voz Femenina ("Estoy lista")' : '👨 Voz Masculina ("Estoy listo")' }}
          </span>
        </div>

        <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          Elige si prefieres que tu asistente tenga una voz y trato gramatical de <strong>Mujer</strong> (ej: <em>"Hola, estoy lista y a tu servicio"</em>) o de <strong>Hombre</strong> (ej: <em>"Hola, estoy listo y a tu servicio"</em>).
        </p>

        <!-- Selector de Género (Mujer / Hombre) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <!-- Opción Mujer -->
          <button
            type="button"
            @click="seleccionarGenero('mujer')"
            :class="[
              'p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5',
              generoAsistenteLocal === 'mujer'
                ? 'bg-pink-500/10 border-pink-500 shadow-md ring-2 ring-pink-500/40 dark:bg-pink-950/30'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-pink-400/60'
            ]"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl bg-pink-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  👩
                </div>
                <div>
                  <span class="text-xs font-bold text-slate-900 dark:text-white block">Mujer (Femenino)</span>
                  <span class="text-[10px] text-pink-600 dark:text-pink-300 font-semibold font-mono">"Hola, estoy lista"</span>
                </div>
              </div>
              <span v-if="generoAsistenteLocal === 'mujer'" class="w-3 h-3 rounded-full bg-pink-500 shadow-sm shadow-pink-500/50"></span>
            </div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Habla en femenino con concordancia ejecutiva y amable. Voces recomendadas: Sofía, Daniela, Sabina, Paulina.
            </p>
          </button>

          <!-- Opción Hombre -->
          <button
            type="button"
            @click="seleccionarGenero('hombre')"
            :class="[
              'p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5',
              generoAsistenteLocal === 'hombre'
                ? 'bg-blue-500/10 border-blue-500 shadow-md ring-2 ring-blue-500/40 dark:bg-blue-950/30'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-400/60'
            ]"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  👨
                </div>
                <div>
                  <span class="text-xs font-bold text-slate-900 dark:text-white block">Hombre (Masculino)</span>
                  <span class="text-[10px] text-blue-600 dark:text-blue-300 font-semibold font-mono">"Hola, estoy listo"</span>
                </div>
              </div>
              <span v-if="generoAsistenteLocal === 'hombre'" class="w-3 h-3 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50"></span>
            </div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Habla en masculino con tono ejecutivo y sofisticado. Voces recomendadas: Daniel, JARVIS, Apolo, Jorge, Diego.
            </p>
          </button>
        </div>
      </div>

      <!-- ── 2. CONFIGURACIÓN DEL NOMBRE / PALABRA DE ACTIVACIÓN ── -->
      <div class="p-5 rounded-3xl bg-gradient-to-br from-cyan-950/20 via-sky-950/20 to-blue-950/20 border border-cyan-500/30 space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
            <Cpu class="w-4 h-4 text-cyan-500" />
            <span>Nombre del Asistente (Palabra Clave de Activación)</span>
          </div>
          <span class="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-mono font-bold">
            Palabra Clave
          </span>
        </div>

        <p class="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
          Puedes llamarlo por su nombre (ejemplo: <strong class="text-cyan-600 dark:text-cyan-300 font-bold">"{{ nombreAsistenteLocal }}, crea un usuario..."</strong> o <strong class="text-cyan-600 dark:text-cyan-300 font-bold">"{{ nombreAsistenteLocal }}, pon modo oscuro..."</strong>) o darle órdenes directas en cualquier momento.
        </p>

        <!-- Input de Nombre -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div class="relative flex-1">
            <input
              type="text"
              v-model="nombreAsistenteLocal"
              @input="guardar"
              placeholder="Ej: Sofía, Daniel, JARVIS, Friday..."
              class="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-950 border border-cyan-500/40 text-xs text-slate-900 dark:text-white font-bold placeholder-slate-400 outline-none focus:ring-2 focus:ring-cyan-500 transition-all shadow-inner"
            />
          </div>
        </div>

        <!-- Presets / Sugerencias rápidas según género -->
        <div class="space-y-1.5">
          <span class="text-[10px] font-mono text-slate-500 dark:text-slate-400 block">
            Nombres recomendados para {{ generoAsistenteLocal === 'mujer' ? 'Mujer' : 'Hombre' }}:
          </span>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="nombre in (generoAsistenteLocal === 'mujer' ? nombresSugeridosMujer : nombresSugeridosHombre)"
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

      <!-- ── 3. SELECTOR DE MÚLTIPLES VOCES DEL SISTEMA CON PRE-ESCUCHA ── -->
      <div class="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
            <Volume2 class="w-4 h-4 text-cyan-500" />
            <span>Selección de Voz de Síntesis ({{ vocesDisponibles.length }} voces detectadas)</span>
          </div>
          <span class="px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 text-[10px] font-mono font-bold">
            TTS Nativo
          </span>
        </div>

        <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          Selecciona la voz que más te guste del catálogo instalado en tu navegador. Puedes pulsar el botón de prueba al lado de cada voz para escucharla en tiempo real.
        </p>

        <!-- Selector desplegable de voz -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <select
            v-model="vozURILocal"
            @change="guardar"
            class="flex-1 px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white font-medium outline-none cursor-pointer focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">✨ Selección Automática Optimizada (según género {{ generoAsistenteLocal }})</option>
            <option
              v-for="v in vocesDisponibles"
              :key="v.voiceURI"
              :value="v.voiceURI"
            >
              {{ v.name }} [{{ v.lang }}]
            </option>
          </select>

          <!-- Botón de prueba rápida de la voz seleccionada -->
          <button
            type="button"
            @click="probarVozEspecifica(vozURILocal)"
            class="px-4 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer whitespace-nowrap"
            title="Escuchar esta voz"
          >
            <Play class="w-3.5 h-3.5 fill-current" />
            <span>Escuchar Voz</span>
          </button>
        </div>
      </div>

      <!-- ── 4. MODO DE INTERACCIÓN: SOLO ÍCONO (VOZ) VS. ÍCONO + CHAT FLOTANTE ── -->
      <div class="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
            <Sliders class="w-4 h-4 text-cyan-500" />
            <span>Modalidad de Interacción del Asistente</span>
          </div>
          <span class="px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 text-[10px] font-mono font-bold">
            {{ modoInteraccionLocal === 'solo_voz' ? '🎙️ Solo Ícono (Solo Voz)' : '💬 Ícono + Chat Flotante' }}
          </span>
        </div>

        <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          Configura si deseas que el asistente permanezca únicamente como el ícono 3D flotante (100% voz sin ventanas) o habilitar la ventana de chat interactiva.
        </p>

        <!-- Selector Segmentado de Modo -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <!-- Opción 1: Solo Ícono (Voz) -->
          <button
            type="button"
            @click="seleccionarModoInteraccion('solo_voz')"
            :class="[
              'p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2',
              modoInteraccionLocal === 'solo_voz'
                ? 'bg-cyan-500/10 border-cyan-500 shadow-md ring-1 ring-cyan-500/50'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-cyan-400/60'
            ]"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="p-2 rounded-xl bg-cyan-500 text-white">
                  <Mic class="w-4 h-4" />
                </div>
                <span class="text-xs font-bold text-slate-900 dark:text-white">Solo Voz (Solo Ícono)</span>
              </div>
              <span v-if="modoInteraccionLocal === 'solo_voz'" class="w-2.5 h-2.5 rounded-full bg-cyan-500" />
            </div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              En pantalla <strong>solo está visible el ícono</strong>. Escucha permanentemente de fondo y responde 100% por voz sin desplegar ventanas de chat.
            </p>
          </button>

          <!-- Opción 2: Voz + Chat Flotante -->
          <button
            type="button"
            @click="seleccionarModoInteraccion('voz_y_chat')"
            :class="[
              'p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2',
              modoInteraccionLocal === 'voz_y_chat'
                ? 'bg-cyan-500/10 border-cyan-500 shadow-md ring-1 ring-cyan-500/50'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-cyan-400/60'
            ]"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="p-2 rounded-xl bg-indigo-500 text-white">
                  <MessageSquare class="w-4 h-4" />
                </div>
                <span class="text-xs font-bold text-slate-900 dark:text-white">Voz + Chat Flotante (Panel)</span>
              </div>
              <span v-if="modoInteraccionLocal === 'voz_y_chat'" class="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            </div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Muestra el ícono y permite abrir la ventana de conversación con teclado, transcripción en tiempo real y vista de mensajes.
            </p>
          </button>
        </div>
      </div>

      <!-- ── 5. INTERRUPTOR Y PARÁMETROS ACÚSTICOS ── -->
      <div class="space-y-4">
        <!-- Interruptor Activar / Desactivar Voz -->
        <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <div>
            <span class="text-xs font-bold text-slate-900 dark:text-white block">
              Voz del Asistente en Toda la Aplicación
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

        <!-- Control de Tono -->
        <div class="space-y-2">
          <div class="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span class="flex items-center gap-1.5">
              <Sparkles class="w-4 h-4 text-pink-500" />
              Tono de Voz
            </span>
            <span class="font-mono font-bold">{{ tonoLocal }}x</span>
          </div>
          <input
            type="range"
            min="0.8"
            max="1.2"
            step="0.1"
            v-model="tonoLocal"
            @change="guardar"
            class="w-full accent-pink-600 cursor-pointer"
          />
        </div>
      </div>

      <!-- ── 6. CLAVE DE API DE GOOGLE GEMINI (OPCIONAL) ── -->
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

    </div>

    <!-- Botón de Prueba en Vivo -->
    <div class="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div class="text-[11px] text-slate-500 dark:text-slate-400 text-center sm:text-left">
        <span>Asistente: <strong class="text-cyan-600 dark:text-cyan-300 font-bold">{{ nombreAsistenteLocal }}</strong> ({{ generoAsistenteLocal === 'mujer' ? '👩 Mujer - "Estoy lista"' : '👨 Hombre - "Estoy listo"' }})</span>
      </div>

      <BotonBase
        variante="primario"
        tamano="pequeno"
        :cargando="hablandoActualmente"
        @click="reproducirPrueba"
      >
        <template #iconoIzquierdo>
          <Play class="w-4 h-4" />
        </template>
        <span>{{ hablandoActualmente ? 'Hablando...' : `Probar Locución de ${nombreAsistenteLocal}` }}</span>
      </BotonBase>
    </div>

  </div>
</template>