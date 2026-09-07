<!--
  ============================================================================
  ORBE HOLOGRÁFICO 3D Y ASISTENTE POR VOZ INTELIGENTE (AsistenteBurbujaClima.vue)
  ============================================================================
  • Orbe 3D holográfico flotante y animado con anillos de energía y espectro de voz.
  • Reconocimiento de voz continuo (STT) sin cortes prematuros.
  • Ejecución inmediata de órdenes de edición en la encuesta con retroalimentación visual.
  • HUD holográfico translúcido y minimalista para visualización en tiempo real.
-->

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick, Teleport } from 'vue'
import {
  Sparkles,
  Volume2,
  VolumeX,
  PlusCircle,
  Settings,
  Mic,
  MicOff,
  Send,
  Check,
  ChevronDown,
  GripHorizontal,
  Maximize2,
  Minimize2,
  Zap,
  Activity,
  Cpu,
  Radio,
  Headphones,
  RotateCcw,
  X
} from 'lucide-vue-next'
import { useAsistenteVoz } from '@/Almacenes/useAsistenteVoz'
import type { PreguntaEncuesta, AccionJarvis } from '@/Servicios/iaEncuestasService'

const props = defineProps<{
  preguntasActuales: PreguntaEncuesta[]
}>()

const emit = defineEmits<{
  (e: 'aplicarPregunta', pregunta: PreguntaEncuesta): void
  (e: 'ejecutarAcciones', acciones: AccionJarvis[]): void
  (e: 'abrirAjustes'): void
}>()

const {
  ajustes,
  hablandoActualmente,
  escuchandoMicrofono,
  procesandoIA,
  conversacionFluidaActiva,
  textoEscuchadoTemporal,
  errorReconocimiento,
  sugerenciaActual,
  historialConversacion,
  ultimaAccionEjecutada,
  setConversacionFluida,
  hablar,
  detener,
  escucharVoz,
  detenerEscucha,
  enviarMensajeConversacion,
  actualizarAjustes,
  analizarYGenerarSugerencia
} = useAsistenteVoz()

// ─── Estado reactivo ─────────────────────────────────────────────────────────
const hudAbierto = ref(false)
const modoExpandido = ref(false)
const inputTexto = ref('')
const enviando = ref(false)
const contenedorChat = ref<HTMLElement | null>(null)
const preguntasAgregadas = ref<Record<string, boolean>>({})

// ─── Dimensiones de Pantalla ──────────────────────────────────────────────────
const anchoPantalla = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)
const altoPantalla = ref(typeof window !== 'undefined' ? window.innerHeight : 768)

const actualizarDimensionesPantalla = () => {
  anchoPantalla.value = window.innerWidth
  altoPantalla.value = window.innerHeight
}

// ─── Posición Arrastrable del Holograma ───────────────────────────────────────
const CLAVE_POS_BURBUJA = 'hablandocontigo_asistente_holograma_pos'
const posX = ref(30)
const posY = ref(typeof window !== 'undefined' ? Math.max(60, window.innerHeight - 130) : 600)
const arrastrando = ref(false)
const inicioMouseX = ref(0)
const inicioMouseY = ref(0)
const inicioPosX = ref(0)
const inicioPosY = ref(0)
const haMovido = ref(false)

const cargandoPosicion = () => {
  actualizarDimensionesPantalla()
  try {
    const guardada = localStorage.getItem(CLAVE_POS_BURBUJA)
    if (guardada) {
      const { x, y } = JSON.parse(guardada)
      if (typeof x === 'number' && typeof y === 'number') {
        const maxX = Math.max(20, anchoPantalla.value - 90)
        const maxY = Math.max(20, altoPantalla.value - 90)
        posX.value = Math.min(Math.max(16, x), maxX)
        posY.value = Math.min(Math.max(16, y), maxY)
        return
      }
    }
  } catch {}
  posX.value = 30
  posY.value = Math.max(60, altoPantalla.value - 130)
}

const iniciarArrastre = (e: MouseEvent | TouchEvent) => {
  arrastrando.value = true
  haMovido.value = false
  const clienteX = 'touches' in e && e.touches.length > 0 ? (e.touches[0]?.clientX ?? 0) : ('clientX' in e ? e.clientX : 0)
  const clienteY = 'touches' in e && e.touches.length > 0 ? (e.touches[0]?.clientY ?? 0) : ('clientY' in e ? e.clientY : 0)
  inicioMouseX.value = clienteX
  inicioMouseY.value = clienteY
  inicioPosX.value = posX.value
  inicioPosY.value = posY.value

  window.addEventListener('mousemove', moverArrastre, { passive: false })
  window.addEventListener('mouseup', finalizarArrastre)
  window.addEventListener('touchmove', moverArrastre, { passive: false })
  window.addEventListener('touchend', finalizarArrastre)
}

const moverArrastre = (e: MouseEvent | TouchEvent) => {
  if (!arrastrando.value) return
  if (e.cancelable) e.preventDefault()

  const clienteX = 'touches' in e && e.touches.length > 0 ? (e.touches[0]?.clientX ?? 0) : ('clientX' in e ? e.clientX : 0)
  const clienteY = 'touches' in e && e.touches.length > 0 ? (e.touches[0]?.clientY ?? 0) : ('clientY' in e ? e.clientY : 0)
  const deltaX = clienteX - inicioMouseX.value
  const deltaY = clienteY - inicioMouseY.value

  if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
    haMovido.value = true
  }

  const maxX = Math.max(20, anchoPantalla.value - 90)
  const maxY = Math.max(20, altoPantalla.value - 90)

  posX.value = Math.min(Math.max(16, inicioPosX.value + deltaX), maxX)
  posY.value = Math.min(Math.max(16, inicioPosY.value + deltaY), maxY)
}

const finalizarArrastre = () => {
  if (arrastrando.value) {
    arrastrando.value = false
    try {
      localStorage.setItem(CLAVE_POS_BURBUJA, JSON.stringify({ x: posX.value, y: posY.value }))
    } catch {}
  }
  window.removeEventListener('mousemove', moverArrastre)
  window.removeEventListener('mouseup', finalizarArrastre)
  window.removeEventListener('touchmove', moverArrastre)
  window.removeEventListener('touchend', finalizarArrastre)
}

// ─── Datos del Asistente ──────────────────────────────────────────────────────
const nombreActual = computed(() => (ajustes.value.nombreAsistente || 'Daniel').trim())
const nombreActualMayus = computed(() => nombreActual.value.toUpperCase())

// ─── Toggle del Holograma e Interacción de Voz ────────────────────────────────
const clickEnHolograma = () => {
  if (haMovido.value) return

  if (hablandoActualmente.value) {
    detener()
    return
  }

  if (escuchandoMicrofono.value) {
    detenerEscucha()
    return
  }

  // Si está inactivo, abrir HUD y activar micrófono
  hudAbierto.value = true
  iniciarConversacionPorVoz()
}

// ─── Conversación Fluida Continua y Escucha por Turnos ───────────────────────
const iniciarConversacionPorVoz = () => {
  hudAbierto.value = true
  setConversacionFluida(true)
  activarMicrofonoContinuo()
}

const activarMicrofonoContinuo = () => {
  if (hablandoActualmente.value) return

  escucharVoz(async (textoReconocido) => {
    if (textoReconocido && textoReconocido.trim() && !enviando.value) {
      inputTexto.value = textoReconocido
      await enviarMensaje()
      
      // Si la conversación fluida sigue activa y el HUD está abierto, reactivar escucha tras la respuesta
      if (conversacionFluidaActiva.value && hudAbierto.value) {
        setTimeout(() => {
          if (!hablandoActualmente.value && !escuchandoMicrofono.value && conversacionFluidaActiva.value) {
            activarMicrofonoContinuo()
          }
        }, 600)
      }
    }
  })
}

const toggleMicrofono = () => {
  hudAbierto.value = true
  if (escuchandoMicrofono.value) {
    detenerEscucha()
    setConversacionFluida(false)
  } else {
    detener() // Detener si estaba hablando
    setConversacionFluida(true)
    activarMicrofonoContinuo()
  }
}

const enviarMensaje = async () => {
  const txt = inputTexto.value.trim()
  if (!txt || enviando.value) return

  enviando.value = true
  inputTexto.value = ''
  hudAbierto.value = true

  try {
    await enviarMensajeConversacion(txt, props.preguntasActuales, (acciones) => {
      emit('ejecutarAcciones', acciones)
    })
  } finally {
    enviando.value = false
  }

  await nextTick()
  if (contenedorChat.value) {
    contenedorChat.value.scrollTop = contenedorChat.value.scrollHeight
  }
}

const alternarSilencio = () => {
  if (hablandoActualmente.value) detener()
  actualizarAjustes({ vozHabilitada: !ajustes.value.vozHabilitada })
}

const repetirUltimaVoz = () => {
  const ultimoAsistente = [...historialConversacion.value].reverse().find(m => m.emisor === 'asistente')
  if (ultimoAsistente) {
    hablar(ultimoAsistente.texto)
  }
}

const aplicarPregunta = (pregunta: PreguntaEncuesta, idMensaje?: string) => {
  emit('aplicarPregunta', pregunta)
  if (idMensaje) {
    preguntasAgregadas.value[idMensaje] = true
  }
}

// ─── Posición Dinámica del Panel HUD Holográfico ──────────────────────────────
const abreHaciaArriba = computed(() => posY.value > altoPantalla.value * 0.45)
const abreHaciaIzquierda = computed(() => posX.value > anchoPantalla.value * 0.55)

const estiloHudDinamico = computed(() => {
  const esMovil = anchoPantalla.value < 640
  const anchoMax = modoExpandido.value ? 480 : 360
  const ancho = esMovil ? Math.max(280, anchoPantalla.value - 24) : Math.min(anchoPantalla.value - 32, anchoMax)

  if (esMovil) {
    return {
      position: 'fixed' as const,
      left: '12px',
      right: '12px',
      bottom: '92px',
      width: 'calc(100vw - 24px)',
      maxHeight: 'min(70vh, 460px)',
      margin: '0 auto'
    }
  }

  const espacioV = abreHaciaArriba.value ? posY.value - 24 : altoPantalla.value - posY.value - 100
  const altoMax = Math.max(220, Math.min(espacioV, modoExpandido.value ? 540 : 400))

  return {
    width: `${ancho}px`,
    maxHeight: `${altoMax}px`,
    ...(abreHaciaArriba.value ? { bottom: '86px' } : { top: '86px' }),
    ...(abreHaciaIzquierda.value ? { right: '0px' } : { left: '0px' })
  }
})

onMounted(() => {
  cargandoPosicion()
  window.addEventListener('resize', cargandoPosicion)
})

onUnmounted(() => {
  window.removeEventListener('resize', cargandoPosicion)
  window.removeEventListener('mousemove', moverArrastre)
  window.removeEventListener('mouseup', finalizarArrastre)
  window.removeEventListener('touchmove', moverArrastre)
  window.removeEventListener('touchend', finalizarArrastre)
  detener()
  detenerEscucha()
})
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed z-[9999] flex flex-col items-start gap-3 font-['Poppins',sans-serif] pointer-events-none select-none"
      :style="{ left: `${posX}px`, top: `${posY}px` }"
    >

      <!-- ══════════════════════════════════════════════════════════════════ -->
      <!-- ── PANEL HUD HOLOGRÁFICO TRANSLÚCIDO (MINIMALISTA & FUTURISTA) ── -->
      <!-- ══════════════════════════════════════════════════════════════════ -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 scale-90 translate-y-4"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-90 translate-y-4"
      >
        <div
          v-if="hudAbierto"
          class="absolute pointer-events-auto rounded-3xl bg-slate-950/90 backdrop-blur-2xl border border-cyan-400/40 shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden flex flex-col transition-all text-white"
          :style="estiloHudDinamico"
        >
          <!-- ── Encabezado HUD Holográfico ── -->
          <div
            class="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-cyan-950/80 via-slate-900/90 to-blue-950/80 border-b border-cyan-500/30 cursor-move"
            @mousedown="iniciarArrastre"
            @touchstart="iniciarArrastre"
          >
            <div class="flex items-center gap-2 min-w-0">
              <GripHorizontal class="w-3.5 h-3.5 text-cyan-300/60 flex-shrink-0" />
              <div class="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping flex-shrink-0" />
              <div class="truncate">
                <span class="text-xs font-black tracking-widest text-cyan-300 font-mono">
                  {{ nombreActualMayus }} · HOLOGRAM AI
                </span>
              </div>
            </div>

            <div class="flex items-center gap-1.5 flex-shrink-0" @mousedown.stop @touchstart.stop>
              <!-- Configuración -->
              <button
                type="button"
                @click="emit('abrirAjustes')"
                class="p-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/30 text-cyan-300 transition-colors cursor-pointer"
                title="Configurar Nombre y Voz"
              >
                <Settings class="w-3.5 h-3.5" />
              </button>

              <!-- Expandir / Reducir -->
              <button
                type="button"
                @click="modoExpandido = !modoExpandido"
                class="p-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/30 text-cyan-300 transition-colors cursor-pointer"
              >
                <Minimize2 v-if="modoExpandido" class="w-3.5 h-3.5" />
                <Maximize2 v-else class="w-3.5 h-3.5" />
              </button>

              <!-- Cerrar / Ocultar HUD -->
              <button
                type="button"
                @click="hudAbierto = false"
                class="p-1 rounded-lg bg-cyan-500/15 hover:bg-rose-500/30 text-cyan-300 hover:text-rose-300 transition-colors cursor-pointer"
              >
                <X class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <!-- ── Feedback en Vivo de Escucha / Habla / Pensamiento ── -->
          <div
            v-if="hablandoActualmente || escuchandoMicrofono || procesandoIA || textoEscuchadoTemporal"
            class="px-3.5 py-2 bg-cyan-950/70 border-b border-cyan-500/30 flex items-center justify-between text-xs font-mono flex-shrink-0"
          >
            <div v-if="procesandoIA" class="flex items-center gap-2 text-cyan-300 animate-pulse truncate">
              <Sparkles class="w-4 h-4 animate-spin text-cyan-400 flex-shrink-0" />
              <span class="truncate">Analizando y ejecutando edición...</span>
            </div>
            <div v-else-if="hablandoActualmente" class="flex items-center gap-2 text-cyan-300 truncate">
              <Radio class="w-4 h-4 animate-pulse text-cyan-400 flex-shrink-0" />
              <span class="truncate">{{ nombreActual }} transmitiendo respuesta...</span>
            </div>
            <div v-else-if="escuchandoMicrofono" class="flex items-center gap-2 text-rose-400 font-bold truncate">
              <span class="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping flex-shrink-0" />
              <span class="truncate">
                {{ textoEscuchadoTemporal ? `"${textoEscuchadoTemporal}"` : `Escuchando a ${nombreActual}...` }}
              </span>
            </div>

            <button
              v-if="hablandoActualmente"
              type="button"
              @click="detener"
              class="text-[10px] text-cyan-400 hover:text-rose-400 font-bold ml-2 cursor-pointer flex-shrink-0"
            >
              Silenciar
            </button>
          </div>

          <!-- ── Mensaje Actual & Historial HUD ── -->
          <div
            ref="contenedorChat"
            class="p-3.5 space-y-2.5 overflow-y-auto text-xs flex-1 min-h-0 bg-slate-950/80"
          >
            <div
              v-for="msg in historialConversacion"
              :key="msg.id"
              :class="[
                'flex gap-2.5 items-start',
                msg.emisor === 'usuario' ? 'justify-end' : 'justify-start'
              ]"
            >
              <div
                v-if="msg.emisor === 'asistente'"
                class="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 flex-shrink-0 mt-0.5 shadow-[0_0_10px_rgba(6,182,212,0.4)]"
              >
                <Cpu class="w-3.5 h-3.5" />
              </div>

              <div
                :class="[
                  'p-3 rounded-2xl max-w-[85%] space-y-2 text-left shadow-md transition-all',
                  msg.emisor === 'usuario'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none'
                    : 'bg-slate-900/90 text-slate-100 rounded-bl-none border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                ]"
              >
                <p class="text-[11px] leading-relaxed break-words">{{ msg.texto }}</p>

                <!-- Badge de Acción Ejecutada -->
                <div
                  v-if="msg.acciones && msg.acciones.length > 0"
                  class="p-2 rounded-xl bg-cyan-950/90 border border-cyan-400/40 space-y-1 mt-1 text-cyan-200"
                >
                  <div class="flex items-center gap-1.5 text-[10px] font-bold text-cyan-300">
                    <Zap class="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    <span>Edición en vivo ejecutada:</span>
                  </div>
                  <div v-for="(act, aIdx) in msg.acciones" :key="aIdx" class="text-[10px] space-y-0.5">
                    <span class="inline-block px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[9px] font-bold">
                      {{ act.tipo }}
                    </span>
                    <p class="text-[10px] text-cyan-100 font-medium">
                      {{ act.descripcionAccion || act.textoPregunta || act.nuevoTitulo || 'Métrica de encuesta modificada.' }}
                    </p>
                  </div>
                </div>

                <!-- Pregunta Sugerida -->
                <div
                  v-if="msg.preguntaSugerida"
                  class="p-2 rounded-xl bg-slate-950 border border-cyan-400/40 space-y-1.5 mt-1 text-slate-200"
                >
                  <p class="text-[10px] font-bold text-cyan-400">Pregunta propuesta:</p>
                  <p class="text-[10px] italic">"{{ msg.preguntaSugerida.texto }}"</p>
                  <button
                    type="button"
                    @click="aplicarPregunta(msg.preguntaSugerida, msg.id)"
                    :disabled="preguntasAgregadas[msg.id]"
                    :class="[
                      'w-full py-1 px-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer',
                      preguntasAgregadas[msg.id]
                        ? 'bg-emerald-500 text-white'
                        : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm'
                    ]"
                  >
                    <Check v-if="preguntasAgregadas[msg.id]" class="w-3 h-3" />
                    <PlusCircle v-else class="w-3 h-3" />
                    {{ preguntasAgregadas[msg.id] ? '¡Pregunta Agregada!' : '+ Incorporar a Encuesta' }}
                  </button>
                </div>

                <span class="text-[9px] opacity-60 block text-right font-mono">{{ msg.timestamp }}</span>
              </div>
            </div>
          </div>

          <!-- ── Barra Inferior de Entrada (Voz + Texto) ── -->
          <div class="p-2.5 bg-slate-950 border-t border-cyan-500/30 flex items-center gap-2 flex-shrink-0">
            <!-- Botón Micrófono -->
            <button
              type="button"
              @click="toggleMicrofono"
              :class="[
                'p-2.5 rounded-2xl transition-all flex items-center justify-center cursor-pointer flex-shrink-0',
                escuchandoMicrofono
                  ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-400/40 shadow-lg shadow-rose-500/50'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
              ]"
              :title="escuchandoMicrofono ? 'Pausar micrófono' : `Hablar a ${nombreActual}`"
            >
              <Mic v-if="!escuchandoMicrofono" class="w-4 h-4" />
              <MicOff v-else class="w-4 h-4" />
            </button>

            <!-- Input de Texto -->
            <input
              v-model="inputTexto"
              type="text"
              :placeholder="escuchandoMicrofono ? 'Escuchando... Dé su orden, señor' : `Ordene a ${nombreActual} (ej: '${nombreActual} cambia la pregunta 3')...`"
              class="flex-1 min-w-0 px-3.5 py-2 rounded-2xl bg-slate-900 border border-cyan-500/40 text-xs text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-cyan-400 transition-all font-sans"
              @keydown.enter="enviarMensaje"
            />

            <!-- Botón Enviar -->
            <button
              type="button"
              @click="enviarMensaje"
              :disabled="!inputTexto.trim() || enviando || procesandoIA"
              class="p-2.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all cursor-pointer flex-shrink-0 shadow-sm"
            >
              <Send class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </Transition>

      <!-- ══════════════════════════════════════════════════════════════════ -->
      <!-- ── ORBE HOLOGRÁFICO 3D FLOTANTE CON ONDAS REACTIVAS DE VOZ ────── -->
      <!-- ══════════════════════════════════════════════════════════════════ -->
      <div class="pointer-events-auto flex items-center gap-3">
        
        <!-- Orbe 3D Principal -->
        <div
          class="relative cursor-grab active:cursor-grabbing select-none group"
          @mousedown="iniciarArrastre"
          @touchstart="iniciarArrastre"
          @click="clickEnHolograma"
        >
          <!-- ── Anillo Exterior Holográfico Giratorio ── -->
          <div
            :class="[
              'absolute -inset-3 rounded-full border border-dashed border-cyan-400/50 pointer-events-none transition-all duration-700',
              hablandoActualmente || escuchandoMicrofono
                ? 'animate-[spin_4s_linear_infinite] scale-125 border-cyan-300'
                : 'animate-[spin_12s_linear_infinite] opacity-60'
            ]"
          />

          <!-- ── Segundo Anillo Orbital 3D ── -->
          <div
            :class="[
              'absolute -inset-1.5 rounded-full border border-cyan-300/40 pointer-events-none transition-all',
              hablandoActualmente
                ? 'animate-[spin_2s_linear_infinite_reverse] scale-110 border-cyan-200'
                : 'animate-[spin_8s_linear_infinite_reverse] opacity-40'
            ]"
          />

          <!-- ── Resplandor de Plasma Holográfico ── -->
          <div
            :class="[
              'relative w-16 h-16 sm:w-18 sm:h-18 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-2xl',
              hablandoActualmente
                ? 'bg-gradient-to-tr from-cyan-400 via-sky-500 to-blue-600 shadow-[0_0_40px_rgba(6,182,212,0.9)] scale-110 ring-4 ring-cyan-300 animate-pulse'
                : escuchandoMicrofono
                  ? 'bg-gradient-to-tr from-rose-500 via-purple-600 to-indigo-700 shadow-[0_0_40px_rgba(244,63,94,0.9)] scale-110 ring-4 ring-rose-400 animate-bounce'
                  : 'bg-gradient-to-tr from-slate-950 via-cyan-950 to-blue-900 shadow-[0_0_25px_rgba(6,182,212,0.5)] border-2 border-cyan-400/80 group-hover:scale-105 group-hover:shadow-[0_0_35px_rgba(6,182,212,0.8)]',
              !hablandoActualmente && !escuchandoMicrofono && !arrastrando ? 'animate-[flotarHolograma_4s_ease-in-out_infinite]' : ''
            ]"
          >
            <!-- Espectro de Frecuencia / Ecualizador de Audio Central -->
            <div class="flex items-center gap-1 z-10">
              <span
                :class="[
                  'w-1 rounded-full bg-cyan-200 transition-all',
                  hablandoActualmente
                    ? 'h-6 animate-[ecualizador1_0.4s_ease-in-out_infinite_alternate]'
                    : escuchandoMicrofono
                      ? 'h-5 bg-rose-200 animate-bounce'
                      : 'h-2 group-hover:h-3 opacity-80'
                ]"
              />
              <span
                :class="[
                  'w-1.5 rounded-full bg-white transition-all',
                  hablandoActualmente
                    ? 'h-8 animate-[ecualizador2_0.3s_ease-in-out_infinite_alternate]'
                    : escuchandoMicrofono
                      ? 'h-7 bg-white animate-pulse'
                      : 'h-4 group-hover:h-5 shadow-[0_0_8px_#fff]'
                ]"
              />
              <span
                :class="[
                  'w-1 rounded-full bg-cyan-200 transition-all',
                  hablandoActualmente
                    ? 'h-6 animate-[ecualizador3_0.5s_ease-in-out_infinite_alternate]'
                    : escuchandoMicrofono
                      ? 'h-5 bg-rose-200 animate-bounce'
                      : 'h-2 group-hover:h-3 opacity-80'
                ]"
              />
            </div>

            <!-- Línea de Escaneo Láser Holográfica -->
            <div class="absolute inset-x-2 h-[1px] bg-gradient-to-r from-transparent via-cyan-300 to-transparent animate-[laserScan_2s_linear_infinite] pointer-events-none opacity-70" />

            <!-- Etiqueta del Nombre en el Orbe -->
            <span class="absolute -bottom-2 px-2 py-0.2 rounded-full bg-slate-950/90 border border-cyan-400/60 text-[8px] font-mono font-black text-cyan-300 tracking-wider shadow-sm pointer-events-none">
              {{ nombreActualMayus }}
            </span>
          </div>
        </div>

        <!-- ── Micro-Badge Interactivo de Estado al Lado del Holograma ── -->
        <button
          type="button"
          @click="clickEnHolograma"
          :class="[
            'px-3 py-1.5 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-cyan-500/40 text-left transition-all cursor-pointer shadow-lg hover:border-cyan-400 group',
            hablandoActualmente ? 'border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]' : ''
          ]"
        >
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span class="text-[10px] font-mono font-bold text-cyan-300 group-hover:underline">
              {{ escuchandoMicrofono ? 'Escuchando...' : hablandoActualmente ? 'Hablando...' : `Llamar a ${nombreActual}` }}
            </span>
          </div>
          <p class="text-[9px] text-slate-400 font-sans truncate max-w-[130px]">
            {{ escuchandoMicrofono ? 'Diga su orden...' : 'Clic para activar voz' }}
          </p>
        </button>

      </div>

    </div>
  </Teleport>
</template>

<style scoped>
@keyframes flotarHolograma {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50%       { transform: translateY(-10px) rotate(2deg); }
}

@keyframes laserScan {
  0%   { top: 15%; opacity: 0; }
  50%  { opacity: 1; }
  100% { top: 85%; opacity: 0; }
}

@keyframes ecualizador1 {
  0%   { height: 6px; }
  100% { height: 26px; }
}

@keyframes ecualizador2 {
  0%   { height: 12px; }
  100% { height: 32px; }
}

@keyframes ecualizador3 {
  0%   { height: 8px; }
  100% { height: 24px; }
}
</style>