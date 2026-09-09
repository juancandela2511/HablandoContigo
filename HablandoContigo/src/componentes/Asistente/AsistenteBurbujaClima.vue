<!--
  ============================================================================
  BURBUJA DISCRETA Y ASISTENTE POR VOZ INTELIGENTE (AsistenteBurbujaClima.vue)
  ============================================================================
  • Diseño minimalista, elegante y no intrusivo (discreto y profesional).
  • Reconocimiento de voz continuo (STT) sin cortes prematuros.
  • Ejecución inmediata de órdenes de edición en la encuesta con retroalimentación visual.
  • Panel HUD flotante, translúcido y ordenado para interacción por voz y texto.
-->

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick, Teleport } from 'vue'
import { useRouter } from 'vue-router'
import {
  Sparkles,
  Settings,
  Mic,
  MicOff,
  Send,
  Check,
  GripHorizontal,
  Maximize2,
  Minimize2,
  Zap,
  Radio,
  PlusCircle,
  X
} from 'lucide-vue-next'
import { useAsistenteVoz, detectarPalabraClaveVoz } from '@/Almacenes/useAsistenteVoz'
import type { PreguntaEncuesta, AccionJarvis } from '@/Servicios/iaEncuestasService'

const props = withDefaults(
  defineProps<{
    preguntasActuales?: PreguntaEncuesta[]
  }>(),
  {
    preguntasActuales: () => []
  }
)

const emit = defineEmits<{
  (e: 'aplicarPregunta', pregunta: PreguntaEncuesta): void
  (e: 'ejecutarAcciones', acciones: AccionJarvis[]): void
  (e: 'abrirAjustes'): void
}>()

const router = useRouter()

const {
  ajustes,
  hablandoActualmente,
  escuchandoMicrofono,
  procesandoIA,
  conversacionFluidaActiva,
  textoEscuchadoTemporal,
  historialConversacion,
  tratoInfo,
  setConversacionFluida,
  hablar,
  detener,
  escucharVoz,
  detenerEscucha,
  enviarMensajeConversacion,
  actualizarAjustes
} = useAsistenteVoz()

// ─── Estado reactivo ─────────────────────────────────────────────────────────
const hudAbierto = ref(false)
const modoExpandido = ref(false)
const inputTexto = ref('')
const enviando = ref(false)
const contenedorChat = ref<HTMLElement | null>(null)
const preguntasAgregadas = ref<Record<string, boolean>>({})

// Si está configurado en 'solo_voz', garantizar que el panel HUD esté siempre cerrado
watch(
  () => ajustes.value.modoInteraccion,
  (nuevoModo) => {
    if (nuevoModo === 'solo_voz') {
      hudAbierto.value = false
    }
  },
  { immediate: true }
)

// ─── Dimensiones de Pantalla ──────────────────────────────────────────────────
const anchoPantalla = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)
const altoPantalla = ref(typeof window !== 'undefined' ? window.innerHeight : 768)

const actualizarDimensionesPantalla = () => {
  anchoPantalla.value = window.innerWidth
  altoPantalla.value = window.innerHeight
}

// ─── Posición Arrastrable ─────────────────────────────────────────────────────
const CLAVE_POS_BURBUJA = 'hablandocontigo_asistente_burbuja_pos'
const posX = ref(24)
const posY = ref(typeof window !== 'undefined' ? Math.max(60, window.innerHeight - 100) : 600)
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
        const maxX = Math.max(20, anchoPantalla.value - 160)
        const maxY = Math.max(20, altoPantalla.value - 60)
        posX.value = Math.min(Math.max(16, x), maxX)
        posY.value = Math.min(Math.max(16, y), maxY)
        return
      }
    }
  } catch {}
  posX.value = 24
  posY.value = Math.max(60, altoPantalla.value - 100)
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

  const maxX = Math.max(20, anchoPantalla.value - 160)
  const maxY = Math.max(20, altoPantalla.value - 60)

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

// ─── Datos del Asistente y Estado de Saludo ─────────────────────────────────
const nombreActual = computed(() => (ajustes.value.nombreAsistente || 'Sofía').trim())
const haSaludadoPorVoz = ref(false)

// ─── Procesamiento Automático de Voz Siempre Activo con Palabra Clave Obligatoria ──
const procesarTextoVoz = async (texto: string) => {
  if (!texto || !texto.trim() || enviando.value) return

  const textoLimpio = texto.trim()

  // ─── FILTRO DE PALABRA CLAVE / NOMBRE PROGRAMADO ─────────────────────────
  // Para evitar cualquier edición accidental con audio ambiente o conversaciones paralelas,
  // el asistente SOLO procesa órdenes si el usuario pronuncia su nombre clave ("Sofía", "Daniel", etc.)
  const { coincide, comandoLimpio } = detectarPalabraClaveVoz(textoLimpio, nombreActual.value)
  if (!coincide) {
    // Audio ambiente no dirigido al asistente -> ignorar sin alterar la encuesta
    return
  }

  enviando.value = true
  
  // Si el modo configurado es 'voz_y_chat', abrir el panel HUD para mostrar el intercambio
  if (ajustes.value.modoInteraccion === 'voz_y_chat') {
    hudAbierto.value = true
  }

  try {
    await enviarMensajeConversacion(comandoLimpio || textoLimpio, props.preguntasActuales, (acciones) => {
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

// ─── Interacción al Hacer Clic en la Cabeza 3D ──────────────────────────────
const clickEnBurbuja = async () => {
  if (haMovido.value) return

  if (hablandoActualmente.value) {
    detener()
    return
  }

  // Si no ha saludado por voz en esta sesión, saluda con su nombre y género configurado
  if (!haSaludadoPorVoz.value) {
    haSaludadoPorVoz.value = true
    const voc = tratoInfo.value.vocativo
    const esHombre = ajustes.value.generoAsistente === 'hombre'
    const estado = esHombre ? 'listo' : 'lista'
    const nombre = ajustes.value.nombreAsistente || (esHombre ? 'Daniel' : 'Sofía')
    const saludoInicial = `Hola, ${voc}. Soy ${nombre}, estoy ${estado} y a tu servicio.`
    await hablar(saludoInicial)
  }

  // Si el usuario configuró 'voz_y_chat', abrir/cerrar el chat al hacer clic. En 'solo_voz', NUNCA abrir HUD (solo ícono).
  if (ajustes.value.modoInteraccion === 'voz_y_chat') {
    hudAbierto.value = !hudAbierto.value
  } else {
    hudAbierto.value = false
  }

  // Asegurar que la escucha permanente esté activa
  escucharVoz(procesarTextoVoz)
}

const toggleMicrofono = () => {
  if (escuchandoMicrofono.value) {
    detenerEscucha()
  } else {
    detener()
    escucharVoz(procesarTextoVoz)
  }
}

const enviarMensaje = async () => {
  const txt = inputTexto.value.trim()
  if (!txt || enviando.value) return

  inputTexto.value = ''
  enviando.value = true

  try {
    const { comandoLimpio } = detectarPalabraClaveVoz(txt, nombreActual.value)
    await enviarMensajeConversacion(comandoLimpio || txt, props.preguntasActuales, (acciones) => {
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

const aplicarPregunta = (pregunta: PreguntaEncuesta, idMensaje?: string) => {
  emit('aplicarPregunta', pregunta)
  if (idMensaje) {
    preguntasAgregadas.value[idMensaje] = true
  }
}

const abrirConfiguracion = () => {
  emit('abrirAjustes')
  router.push('/configuracion')
}

// ─── Posición Dinámica del Panel HUD ──────────────────────────────────────────
const abreHaciaArriba = computed(() => posY.value > altoPantalla.value * 0.45)
const abreHaciaIzquierda = computed(() => posX.value > anchoPantalla.value * 0.55)

const estiloHudDinamico = computed(() => {
  const esMovil = anchoPantalla.value < 640
  const anchoMax = modoExpandido.value ? 460 : 350
  const ancho = esMovil ? Math.max(280, anchoPantalla.value - 24) : Math.min(anchoPantalla.value - 32, anchoMax)

  if (esMovil) {
    return {
      position: 'fixed' as const,
      left: '12px',
      right: '12px',
      bottom: '80px',
      width: 'calc(100vw - 24px)',
      maxHeight: 'min(70vh, 440px)',
      margin: '0 auto'
    }
  }

  const espacioV = abreHaciaArriba.value ? posY.value - 20 : altoPantalla.value - posY.value - 70
  const altoMax = Math.max(220, Math.min(espacioV, modoExpandido.value ? 520 : 380))

  return {
    width: `${ancho}px`,
    maxHeight: `${altoMax}px`,
    ...(abreHaciaArriba.value ? { bottom: '58px' } : { top: '58px' }),
    ...(abreHaciaIzquierda.value ? { right: '0px' } : { left: '0px' })
  }
})

onMounted(() => {
  cargandoPosicion()
  window.addEventListener('resize', cargandoPosicion)
  // Activar escucha permanente de fondo automáticamente
  escucharVoz(procesarTextoVoz)
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
      v-if="ajustes.asistenteHabilitado"
      class="fixed z-[9999] flex flex-col items-start gap-2 font-['Poppins',sans-serif] pointer-events-none select-none"
      :style="{ left: `${posX}px`, top: `${posY}px` }"
    >

      <!-- ══════════════════════════════════════════════════════════════════ -->
      <!-- ── PANEL DE CONVERSACIÓN (HUD MODERNO Y DISCRETO) ─────────────── -->
      <!-- ══════════════════════════════════════════════════════════════════ -->
      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 scale-95 translate-y-2"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95 translate-y-2"
      >
        <div
          v-if="hudAbierto && ajustes.modoInteraccion === 'voz_y_chat'"
          class="absolute pointer-events-auto rounded-2xl bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-xl border border-slate-700/60 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col transition-all text-slate-100"
          :style="estiloHudDinamico"
        >
          <!-- ── Encabezado del Asistente ── -->
          <div
            class="flex items-center justify-between px-3.5 py-2.5 bg-slate-800/80 border-b border-slate-700/50 cursor-move select-none"
            @mousedown="iniciarArrastre"
            @touchstart="iniciarArrastre"
          >
            <div class="flex items-center gap-2 min-w-0">
              <GripHorizontal class="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <div class="flex items-center gap-1.5 truncate">
                <span class="w-2 h-2 rounded-full" :class="escuchandoMicrofono ? 'bg-rose-500' : hablandoActualmente ? 'bg-sky-400' : 'bg-emerald-400'" />
                <span class="text-xs font-semibold text-slate-200 truncate">
                  Asistente {{ nombreActual }} <span class="opacity-60 font-normal capitalize">({{ tratoInfo.vocativo }})</span>
                </span>
              </div>
            </div>

            <div class="flex items-center gap-1 flex-shrink-0" @mousedown.stop @touchstart.stop>
              <!-- Configuración -->
              <button
                type="button"
                @click="abrirConfiguracion"
                class="p-1 rounded-md hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Configuración de voz"
              >
                <Settings class="w-3.5 h-3.5" />
              </button>

              <!-- Expandir / Reducir -->
              <button
                type="button"
                @click="modoExpandido = !modoExpandido"
                class="p-1 rounded-md hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <Minimize2 v-if="modoExpandido" class="w-3.5 h-3.5" />
                <Maximize2 v-else class="w-3.5 h-3.5" />
              </button>

              <!-- Cerrar -->
              <button
                type="button"
                @click="hudAbierto = false"
                class="p-1 rounded-md hover:bg-rose-600/80 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <!-- ── Feedback en Vivo ── -->
          <div
            v-if="hablandoActualmente || escuchandoMicrofono || procesandoIA || textoEscuchadoTemporal"
            class="px-3 py-1.5 bg-slate-800/50 border-b border-slate-700/40 flex items-center justify-between text-xs flex-shrink-0"
          >
            <div v-if="procesandoIA" class="flex items-center gap-1.5 text-sky-300 truncate">
              <Sparkles class="w-3.5 h-3.5 animate-spin text-sky-400 flex-shrink-0" />
              <span class="truncate text-[11px]">Procesando cambios...</span>
            </div>
            <div v-else-if="hablandoActualmente" class="flex items-center gap-1.5 text-sky-300 truncate">
              <Radio class="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
              <span class="truncate text-[11px]">{{ nombreActual }} respondiendo...</span>
            </div>
            <div v-else-if="escuchandoMicrofono" class="flex items-center gap-1.5 text-rose-300 truncate">
              <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse flex-shrink-0" />
              <span class="truncate text-[11px]">
                {{ textoEscuchadoTemporal ? `"${textoEscuchadoTemporal}"` : 'Escuchando tu voz...' }}
              </span>
            </div>

            <button
              v-if="hablandoActualmente"
              type="button"
              @click="detener"
              class="text-[10px] text-slate-400 hover:text-rose-300 font-medium ml-2 cursor-pointer flex-shrink-0"
            >
              Silenciar
            </button>
          </div>

          <!-- ── Mensajes e Historial ── -->
          <div
            ref="contenedorChat"
            class="p-3 space-y-2 overflow-y-auto text-xs flex-1 min-h-0 bg-slate-900/60"
          >
            <div
              v-for="msg in historialConversacion"
              :key="msg.id"
              :class="[
                'flex gap-2 items-start',
                msg.emisor === 'usuario' ? 'justify-end' : 'justify-start'
              ]"
            >
              <div
                :class="[
                  'p-2.5 rounded-xl max-w-[88%] space-y-1.5 text-left shadow-sm',
                  msg.emisor === 'usuario'
                    ? 'bg-sky-600 text-white rounded-br-none'
                    : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700/60'
                ]"
              >
                <p class="text-[11px] leading-relaxed break-words">{{ msg.texto }}</p>

                <!-- Acciones Ejecutadas -->
                <div
                  v-if="msg.acciones && msg.acciones.length > 0"
                  class="p-2 rounded-lg bg-slate-900/90 border border-slate-700/70 space-y-1 mt-1 text-slate-200"
                >
                  <div class="flex items-center gap-1 text-[10px] font-semibold text-sky-300">
                    <Zap class="w-3 h-3 text-sky-400" />
                    <span>Cambio aplicado:</span>
                  </div>
                  <div v-for="(act, aIdx) in msg.acciones" :key="aIdx" class="text-[10px]">
                    <span class="inline-block px-1.5 py-0.5 rounded bg-slate-800 text-sky-300 font-mono text-[9px]">
                      {{ act.tipo }}
                    </span>
                    <p class="text-[10px] text-slate-300 mt-0.5">
                      {{ act.descripcionAccion || act.textoPregunta || act.nuevoTitulo || 'Métrica modificada.' }}
                    </p>
                  </div>
                </div>

                <!-- Pregunta Sugerida -->
                <div
                  v-if="msg.preguntaSugerida"
                  class="p-2 rounded-lg bg-slate-900/90 border border-slate-700/70 space-y-1.5 mt-1 text-slate-200"
                >
                  <p class="text-[10px] font-semibold text-sky-300">Sugerencia:</p>
                  <p class="text-[10px] italic text-slate-300">"{{ msg.preguntaSugerida.texto }}"</p>
                  <button
                    type="button"
                    @click="aplicarPregunta(msg.preguntaSugerida, msg.id)"
                    :disabled="preguntasAgregadas[msg.id]"
                    :class="[
                      'w-full py-1 px-2 rounded text-[10px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer',
                      preguntasAgregadas[msg.id]
                        ? 'bg-emerald-600 text-white'
                        : 'bg-sky-600 hover:bg-sky-500 text-white'
                    ]"
                  >
                    <Check v-if="preguntasAgregadas[msg.id]" class="w-3 h-3" />
                    <PlusCircle v-else class="w-3 h-3" />
                    {{ preguntasAgregadas[msg.id] ? '¡Pregunta Agregada!' : 'Agregar a Encuesta' }}
                  </button>
                </div>

                <span class="text-[9px] opacity-50 block text-right font-mono">{{ msg.timestamp }}</span>
              </div>
            </div>
          </div>

          <!-- ── Barra Inferior de Entrada (Voz + Texto) ── -->
          <div class="p-2 bg-slate-800/80 border-t border-slate-700/50 flex items-center gap-1.5 flex-shrink-0">
            <!-- Botón Micrófono -->
            <button
              type="button"
              @click="toggleMicrofono"
              :class="[
                'p-2 rounded-xl transition-all flex items-center justify-center cursor-pointer flex-shrink-0',
                escuchandoMicrofono
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
              ]"
              :title="escuchandoMicrofono ? 'Pausar micrófono' : `Hablar a ${nombreActual}`"
            >
              <Mic v-if="!escuchandoMicrofono" class="w-3.5 h-3.5" />
              <MicOff v-else class="w-3.5 h-3.5" />
            </button>

            <!-- Input de Texto -->
            <input
              v-model="inputTexto"
              type="text"
              :placeholder="escuchandoMicrofono ? 'Escuchando...' : `Escribe o habla a ${nombreActual}...`"
              class="flex-1 min-w-0 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-400 outline-none focus:border-sky-500 transition-all font-sans"
              @keydown.enter="enviarMensaje"
            />

            <!-- Botón Enviar -->
            <button
              type="button"
              @click="enviarMensaje"
              :disabled="!inputTexto.trim() || enviando || procesandoIA"
              class="p-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all cursor-pointer flex-shrink-0"
            >
              <Send class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </Transition>

      <!-- ══════════════════════════════════════════════════════════════════ -->
      <!-- ── CABEZA INTELIGENTE 3D DE ALTA CALIDAD (ESTILO SMART ASSISTANT)  -->
      <!-- ══════════════════════════════════════════════════════════════════ -->
      <div
        class="pointer-events-auto select-none cursor-grab active:cursor-grabbing group relative transition-transform duration-300 hover:scale-105"
        @mousedown="iniciarArrastre"
        @touchstart="iniciarArrastre"
        @click="clickEnBurbuja"
      >
        <!-- ── Contenedor de la Cabeza 3D (Fondo Totalmente Limpio y Transparente) ── -->
        <div class="relative flex flex-col items-center justify-center p-1">
          
          <!-- Cabeza 3D con animación de levitación y respiración suave -->
          <div
            :class="[
              'relative z-10 transition-all duration-300',
              hablandoActualmente
                ? 'animate-[levitarCabeza_2.8s_ease-in-out_infinite]'
                : escuchandoMicrofono
                  ? 'animate-[levitarCabeza_3.2s_ease-in-out_infinite]'
                  : 'animate-[levitarCabeza_4.5s_ease-in-out_infinite]'
            ]"
          >
            <!-- SVG Alta Calidad: Casco Blanco Esculpido 3D + Visor de Cristal Negro Piano + Ojos LED -->
            <svg
              viewBox="0 0 100 120"
              class="w-14 h-16 sm:w-16 sm:h-20 filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.18)]"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <!-- Gradiente 3D del Casco Blanco Exterior (Acabado cerámico satinado) -->
                <radialGradient id="casco3DGrad" cx="38%" cy="26%" r="68%">
                  <stop offset="0%" stop-color="#ffffff" />
                  <stop offset="55%" stop-color="#f8fafc" />
                  <stop offset="82%" stop-color="#e2e8f0" />
                  <stop offset="96%" stop-color="#cbd5e1" />
                  <stop offset="100%" stop-color="#94a3b8" />
                </radialGradient>

                <!-- Sombra interior de bisel del casco -->
                <linearGradient id="biselSombra" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#94a3b8" stop-opacity="0.3" />
                  <stop offset="100%" stop-color="#475569" stop-opacity="0.6" />
                </linearGradient>

                <!-- Pantalla Visor de Cristal Negro Piano (Curva de profundidad) -->
                <radialGradient id="visorNegroPiano" cx="45%" cy="30%" r="70%">
                  <stop offset="0%" stop-color="#1e293b" />
                  <stop offset="35%" stop-color="#0f172a" />
                  <stop offset="75%" stop-color="#020617" />
                  <stop offset="100%" stop-color="#000000" />
                </radialGradient>

                <!-- Reflejo curvo de luz brillante en el cristal superior -->
                <linearGradient id="reflejoCristalSuperior" x1="0" y1="0" x2="0.6" y2="1">
                  <stop offset="0%" stop-color="#ffffff" stop-opacity="0.45" />
                  <stop offset="40%" stop-color="#ffffff" stop-opacity="0.12" />
                  <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
                </linearGradient>

                <!-- Resplandor sutil inferior del visor -->
                <linearGradient id="reflejoCristalInferior" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.15" />
                  <stop offset="100%" stop-color="#38bdf8" stop-opacity="0" />
                </linearGradient>

                <!-- Resplandor de Ojos LED -->
                <filter id="glowOjosHd" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              <!-- ── CASCO EXTERIOR BLANCO ESCULPIDO 3D ── -->
              <!-- Sombra base del casco -->
              <rect
                x="14"
                y="10"
                width="72"
                height="92"
                rx="36"
                fill="#cbd5e1"
                opacity="0.4"
              />

              <!-- Casco principal -->
              <rect
                x="15"
                y="8"
                width="70"
                height="92"
                rx="35"
                fill="url(#casco3DGrad)"
                stroke="#e2e8f0"
                stroke-width="1.2"
              />

              <!-- Botón / Sensor acústico lateral sutil -->
              <rect x="11.5" y="44" width="3.5" height="12" rx="1.7" fill="#cbd5e1" stroke="#94a3b8" stroke-width="0.6" />

              <!-- Reflejo especular blanco en la cúpula del casco -->
              <path
                d="M 28 16 Q 50 10 72 16 Q 50 13 28 16 Z"
                fill="#ffffff"
                opacity="0.95"
              />
              <ellipse cx="40" cy="18" rx="16" ry="4" fill="#ffffff" opacity="0.6" />

              <!-- ── MARCO Y BISEL DE LA PANTALLA ── -->
              <rect
                x="22"
                y="16"
                width="56"
                height="76"
                rx="28"
                fill="url(#biselSombra)"
              />

              <!-- ── VISOR NEGRO PIANO (GLOSSY SMART SCREEN) ── -->
              <rect
                x="23.5"
                y="17.5"
                width="53"
                height="73"
                rx="26.5"
                fill="url(#visorNegroPiano)"
                stroke="#0f172a"
                stroke-width="1"
              />

              <!-- Resplandor ambiental inferior del cristal -->
              <rect
                x="23.5"
                y="17.5"
                width="53"
                height="73"
                rx="26.5"
                fill="url(#reflejoCristalInferior)"
              />

              <!-- Reflejo diagonal curvo de cristal (Glossy Arc) -->
              <path
                d="M 26 30 C 26 22, 36 20, 50 20 C 64 20, 74 22, 74 30 C 74 38, 62 42, 50 42 C 36 42, 26 38, 26 30 Z"
                fill="url(#reflejoCristalSuperior)"
              />
              <!-- Línea de destello en el cristal -->
              <path
                d="M 28 26 Q 50 22 72 26"
                stroke="#ffffff"
                stroke-width="1"
                stroke-linecap="round"
                opacity="0.4"
              />

              <!-- ── OJOS LED CIRCULARES ANIMADOS CON PARPADEO ── -->
              <g
                class="animate-[parpadeoOjos_4.2s_ease-in-out_infinite] origin-[50px_52px]"
                filter="url(#glowOjosHd)"
              >
                <!-- Ojo Izquierdo -->
                <circle
                  cx="40"
                  cy="52"
                  r="5.5"
                  :fill="escuchandoMicrofono ? '#fb7185' : hablandoActualmente ? '#38bdf8' : '#ffffff'"
                />
                <!-- Brillo interior del ojo izquierdo -->
                <circle cx="41.8" cy="50.2" r="1.6" fill="#ffffff" />

                <!-- Ojo Derecho -->
                <circle
                  cx="60"
                  cy="52"
                  r="5.5"
                  :fill="escuchandoMicrofono ? '#fb7185' : hablandoActualmente ? '#38bdf8' : '#ffffff'"
                />
                <!-- Brillo interior del ojo derecho -->
                <circle cx="61.8" cy="50.2" r="1.6" fill="#ffffff" />
              </g>

              <!-- Conexión de cuello suave en la base -->
              <ellipse cx="50" cy="100" rx="16" ry="4" fill="#94a3b8" opacity="0.5" />
            </svg>
          </div>

          <!-- Sombra suave difusa en el suelo que acompaña la levitación -->
          <div
            :class="[
              'w-12 sm:w-14 h-2.5 rounded-full bg-slate-900/20 blur-[3px] -mt-1 pointer-events-none transition-all',
              hablandoActualmente
                ? 'animate-[sombraLevitar_2.8s_ease-in-out_infinite]'
                : escuchandoMicrofono
                  ? 'animate-[sombraLevitar_3.2s_ease-in-out_infinite]'
                  : 'animate-[sombraLevitar_4.5s_ease-in-out_infinite]'
            ]"
          />

          <!-- Micro punto sutil de estado (sin fondo aparatoso) -->
          <div
            v-if="escuchandoMicrofono || hablandoActualmente"
            class="absolute top-0 right-1 flex items-center justify-center pointer-events-none"
          >
            <span
              class="w-2.5 h-2.5 rounded-full shadow-sm flex items-center justify-center"
              :class="escuchandoMicrofono ? 'bg-rose-500' : 'bg-sky-400'"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            </span>
          </div>

        </div>
      </div>

    </div>
  </Teleport>
</template>

<style scoped>
/* ── Levitación y respiración suave de la Cabeza 3D ── */
@keyframes levitarCabeza {
  0% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-5px) rotate(1.5deg);
  }
  100% {
    transform: translateY(0px) rotate(0deg);
  }
}

/* ── Sombra ambiental flotante sincronizada ── */
@keyframes sombraLevitar {
  0% {
    transform: scale(1);
    opacity: 0.22;
  }
  50% {
    transform: scale(0.85);
    opacity: 0.12;
  }
  100% {
    transform: scale(1);
    opacity: 0.22;
  }
}

/* ── Parpadeo realista de los ojos LED ── */
@keyframes parpadeoOjos {
  0%, 92%, 100% {
    transform: scaleY(1);
  }
  96% {
    transform: scaleY(0.06);
  }
}
</style>