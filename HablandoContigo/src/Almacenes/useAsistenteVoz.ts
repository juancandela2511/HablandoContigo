/**
 * ============================================================================
 * COMPOSABLE DE VOZ Y ASISTENTE ASESOR CONVERSACIONAL (useAsistenteVoz.ts)
 * ============================================================================
 * 
 * Gestiona:
 *   1. Síntesis de voz (Text-to-Speech - TTS) nativa con SpeechSynthesis.
 *   2. Reconocimiento de voz (Speech-to-Text - STT) nativo con Web Speech API.
 *   3. Conversación Fluida Continua (Bucle Asistente habla -> Micrófono escucha -> Asistente responde).
 *   4. Generación y aplicación de preguntas sugeridas en tiempo real.
 */

import { ref, computed } from 'vue'
import type { PreguntaEncuesta, AccionJarvis } from '@/Servicios/iaEncuestasService'
import {
  consultarChatbotGeminiAPI,
  analizarEncuestaConGeminiAPI
} from '@/Servicios/iaEncuestasService'

const CLAVE_AJUSTES_VOZ = 'hablandocontigo_ajustes_voz_asistente'

export interface MensajeChatAsistente {
  id: string
  emisor: 'usuario' | 'asistente'
  texto: string
  timestamp: string
  preguntaSugerida?: PreguntaEncuesta
  acciones?: AccionJarvis[]
}

export interface AjustesVozAsistente {
  nombreAsistente: string // Nombre personalizado para llamarlo (ej. "JARVIS", "Daniel", "Friday")
  vozHabilitada: boolean
  volumen: number // 0.0 a 1.0
  velocidad: number // 0.7 a 1.3
  tono: number // 0.8 a 1.2
  vozURI: string
  autoHablarSugerencias: boolean
  conversacionContinua: boolean
}

const ajustesPorDefecto: AjustesVozAsistente = {
  nombreAsistente: 'JARVIS',
  vozHabilitada: true,
  volumen: 1.0,
  velocidad: 1.0,
  tono: 1.0,
  vozURI: '',
  autoHablarSugerencias: true,
  conversacionContinua: true
}

// ─── Estados Singleton Reactivos ──────────────────────────────────────────────
const ajustes = ref<AjustesVozAsistente>(cargarAjustes())
const hablandoActualmente = ref(false)
const escuchandoMicrofono = ref(false)
const conversacionFluidaActiva = ref(false)
const procesandoIA = ref(false)
const textoEscuchadoTemporal = ref('')
const errorReconocimiento = ref<string | null>(null)
const vocesDisponibles = ref<SpeechSynthesisVoice[]>([])
const ultimaAccionEjecutada = ref<AccionJarvis | null>(null)

const historialConversacion = ref<MensajeChatAsistente[]>([
  {
    id: 'msg-welcome-01',
    emisor: 'asistente',
    texto: `Sistemas en línea, señor. Soy ${ajustes.value.nombreAsistente || 'JARVIS'}, su asistente de arquitectura de clima laboral para Contigo Call Center. Puede llamarme por mi nombre y darme instrucciones por voz o texto en tiempo real.`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
])

const sugerenciaActual = ref<{
  id: string
  titulo: string
  textoVoz: string
  mensajeBurbuja: string
  categoria: string
  preguntaSugerida?: PreguntaEncuesta
} | null>(null)

function cargarAjustes(): AjustesVozAsistente {
  if (typeof localStorage === 'undefined') return { ...ajustesPorDefecto }
  try {
    const raw = localStorage.getItem(CLAVE_AJUSTES_VOZ)
    return raw ? { ...ajustesPorDefecto, ...JSON.parse(raw) } : { ...ajustesPorDefecto }
  } catch {
    return { ...ajustesPorDefecto }
  }
}

function guardarAjustes(): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(CLAVE_AJUSTES_VOZ, JSON.stringify(ajustes.value))
  } catch (e) {
    console.warn('[useAsistenteVoz] Error al guardar ajustes:', e)
  }
}

// ─── Inicialización de Voces ──────────────────────────────────────────────────
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  const cargarVoces = () => {
    const all = window.speechSynthesis.getVoices()
    vocesDisponibles.value = all.filter(v => v.lang.startsWith('es') || v.lang.startsWith('ES'))
    if (vocesDisponibles.value.length === 0) {
      vocesDisponibles.value = all
    }
  }

  cargarVoces()
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = cargarVoces
  }
}

// ─── Reconocimiento de Voz (STT) de Alta Precisión y Escucha Continua ───────────
let recognitionInstance: any = null
let timerSilencioFinal: any = null
let ultimoTextoHabladoPorAsistente = ''
let timestampFinHabla = 0

function inicializarReconocimiento() {
  if (typeof window === 'undefined') return null
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  if (!SpeechRecognition) {
    errorReconocimiento.value = 'Tu navegador no soporta reconocimiento de voz nativo.'
    return null
  }

  const recog = new SpeechRecognition()
  recog.lang = 'es-ES'
  recog.continuous = false // Modo por turnos para máxima precisión sin bucles infinitos
  recog.interimResults = true
  recog.maxAlternatives = 1
  return recog
}

export function useAsistenteVoz() {

  /**
   * Actualiza y persiste los ajustes de voz
   */
  const actualizarAjustes = (nuevos: Partial<AjustesVozAsistente>) => {
    ajustes.value = { ...ajustes.value, ...nuevos }
    guardarAjustes()
  }

  /**
   * Reproduce un texto mediante Text-to-Speech (TTS) con protección anti-eco
   */
  const hablar = (texto: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        resolve(false)
        return
      }

      if (!ajustes.value.vozHabilitada) {
        resolve(false)
        return
      }

      try {
        // Pausar y limpiar escucha de micrófono mientras el asistente habla
        detenerEscucha()
        hablandoActualmente.value = true
        ultimoTextoHabladoPorAsistente = texto.toLowerCase().trim()

        window.speechSynthesis.cancel() // Limpiar cola previa
        window.speechSynthesis.resume() // Evitar bloqueo de background

        const utterance = new SpeechSynthesisUtterance(texto)
        utterance.volume = ajustes.value.volumen
        utterance.rate = ajustes.value.velocidad
        utterance.pitch = ajustes.value.tono

        // Asignar voz en español preferida
        if (ajustes.value.vozURI) {
          const encontrada = vocesDisponibles.value.find(v => v.voiceURI === ajustes.value.vozURI)
          if (encontrada) utterance.voice = encontrada
        } else {
          const vozEspanol = vocesDisponibles.value.find(v => v.lang.startsWith('es'))
          if (vozEspanol) utterance.voice = vozEspanol
        }

        utterance.onstart = () => {
          hablandoActualmente.value = true
        }

        utterance.onend = () => {
          hablandoActualmente.value = false
          timestampFinHabla = Date.now()
          // Dar un pequeño margen de 350ms para que se extinga el eco en altavoces
          setTimeout(() => {
            resolve(true)
          }, 350)
        }

        utterance.onerror = (e) => {
          console.warn('[useAsistenteVoz] Error TTS:', e)
          hablandoActualmente.value = false
          timestampFinHabla = Date.now()
          resolve(false)
        }

        window.speechSynthesis.speak(utterance)
      } catch (e) {
        console.warn('[useAsistenteVoz] Excepción TTS:', e)
        hablandoActualmente.value = false
        timestampFinHabla = Date.now()
        resolve(false)
      }
    })
  }

  /**
   * Detiene el habla actual
   */
  const detener = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      hablandoActualmente.value = false
      timestampFinHabla = Date.now()
    }
  }

  /**
   * Inicia la captura de voz por micrófono (STT) con filtro de eco y detección de silencio
   */
  const escucharVoz = (onTextoFinal?: (texto: string) => void) => {
    // Si el asistente está hablando, detener habla antes de escuchar
    if (hablandoActualmente.value) {
      detener()
    }

    try {
      // Re-crear instancia para evitar estados zombis en navegadores Chrome/Edge
      if (recognitionInstance) {
        try { recognitionInstance.abort() } catch {}
      }
      recognitionInstance = inicializarReconocimiento()

      if (!recognitionInstance) {
        errorReconocimiento.value = 'El micrófono no está disponible o soportado.'
        return
      }

      textoEscuchadoTemporal.value = ''
      errorReconocimiento.value = null
      escuchandoMicrofono.value = true

      if (timerSilencioFinal) {
        clearTimeout(timerSilencioFinal)
        timerSilencioFinal = null
      }

      let transcripcionCompleta = ''

      recognitionInstance.onresult = (event: any) => {
        let interim = ''
        let final = ''

        for (let i = 0; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript + ' '
          } else {
            interim += event.results[i][0].transcript
          }
        }

        const textoActual = (final + interim).trim()
        transcripcionCompleta = textoActual
        textoEscuchadoTemporal.value = textoActual

        // Temporizador inteligente de silencio (1.4s) para procesar la orden
        if (timerSilencioFinal) clearTimeout(timerSilencioFinal)

        if (textoActual.length > 0) {
          timerSilencioFinal = setTimeout(() => {
            if (escuchandoMicrofono.value && transcripcionCompleta.trim().length > 0) {
              const textoListo = transcripcionCompleta.trim()
              textoEscuchadoTemporal.value = ''
              detenerEscucha()

              // ─── FILTRO ANTI-ECO ───────────────────────────────────────────
              // Si el micrófono captó lo que el propio asistente acaba de pronunciar
              const textoLower = textoListo.toLowerCase()
              const esEcoReciente = Date.now() - timestampFinHabla < 2500 && (
                ultimoTextoHabladoPorAsistente.includes(textoLower) ||
                textoLower.includes(ultimoTextoHabladoPorAsistente.slice(0, 20)) ||
                textoLower.includes('soy daniel') ||
                textoLower.includes('soy jarvis')
              )

              if (!esEcoReciente && onTextoFinal) {
                onTextoFinal(textoListo)
              }
            }
          }, 1400)
        }
      }

      recognitionInstance.onerror = (event: any) => {
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          console.warn('[useAsistenteVoz] Evento micrófono:', event.error)
          errorReconocimiento.value = `Micrófono: ${event.error}`
        }
        escuchandoMicrofono.value = false
      }

      recognitionInstance.onend = () => {
        escuchandoMicrofono.value = false
      }

      recognitionInstance.start()
    } catch (e: any) {
      console.warn('[useAsistenteVoz] Excepción al iniciar reconocimiento:', e)
      escuchandoMicrofono.value = false
      errorReconocimiento.value = 'No se pudo acceder al micrófono.'
    }
  }

  /**
   * Detiene la captura de micrófono
   */
  const detenerEscucha = () => {
    if (timerSilencioFinal) {
      clearTimeout(timerSilencioFinal)
      timerSilencioFinal = null
    }
    escuchandoMicrofono.value = false
    if (recognitionInstance) {
      try {
        recognitionInstance.stop()
      } catch {}
    }
  }

  /**
   * Envía un mensaje en la conversación y genera respuesta inteligente con Google Gemini (Motor JARVIS)
   */
  const enviarMensajeConversacion = async (
    mensajeUsuario: string,
    preguntasActuales: PreguntaEncuesta[],
    alEjecutarAcciones?: (acciones: AccionJarvis[]) => void
  ): Promise<MensajeChatAsistente> => {
    // 1. Agregar mensaje del usuario al historial
    const userMsg: MensajeChatAsistente = {
      id: `usr-${Date.now()}`,
      emisor: 'usuario',
      texto: mensajeUsuario,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    historialConversacion.value.push(userMsg)
    procesandoIA.value = true

    try {
      // 2. Procesar con Google Gemini API (JARVIS / Nombre Personalizado)
      const nombreActual = ajustes.value.nombreAsistente || 'JARVIS'
      const { respuestaTexto, acciones, preguntaSugerida } = await consultarChatbotGeminiAPI(
        mensajeUsuario,
        historialConversacion.value,
        preguntasActuales,
        nombreActual
      )

      const asisMsg: MensajeChatAsistente = {
        id: `asis-${Date.now()}`,
        emisor: 'asistente',
        texto: respuestaTexto,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        preguntaSugerida,
        acciones: acciones && acciones.length > 0 ? acciones : undefined
      }

      historialConversacion.value.push(asisMsg)

      // 3. Ejecutar acciones en tiempo real si fueron devueltas por el asistente
      if (acciones && acciones.length > 0) {
        ultimaAccionEjecutada.value = acciones[0]
        if (alEjecutarAcciones) {
          alEjecutarAcciones(acciones)
        }
      }

      // 4. Hablar la respuesta en voz alta
      if (ajustes.value.vozHabilitada) {
        await hablar(respuestaTexto)
      }

      return asisMsg
    } finally {
      procesandoIA.value = false
    }
  }

  /**
   * Reproduce una locución de prueba con el nombre y ajustes actuales
   */
  const reproducirPrueba = async () => {
    const nombre = ajustes.value.nombreAsistente || 'JARVIS'
    const textoPrueba = `Hola, señor. Soy ${nombre}, su asistente de inteligencia artificial para la encuesta de Contigo Call Center. Mis sistemas de voz y edición de preguntas están totalmente operativos.`
    await hablar(textoPrueba)
  }

  /**
   * Analiza las preguntas y genera una sugerencia con Google Gemini
   */
  const analizarYGenerarSugerencia = async (preguntas: PreguntaEncuesta[], hablarAlGenerar = false) => {
    const sugerenciaGemini = await analizarEncuestaConGeminiAPI(preguntas)
    sugerenciaActual.value = sugerenciaGemini

    if (hablarAlGenerar && ajustes.value.vozHabilitada && ajustes.value.autoHablarSugerencias && sugerenciaGemini) {
      hablar(sugerenciaGemini.textoVoz)
    }

    return sugerenciaGemini
  }

  return {
    ajustes: computed(() => ajustes.value),
    hablandoActualmente: computed(() => hablandoActualmente.value),
    escuchandoMicrofono: computed(() => escuchandoMicrofono.value),
    procesandoIA: computed(() => procesandoIA.value),
    conversacionFluidaActiva: computed(() => conversacionFluidaActiva.value),
    textoEscuchadoTemporal: computed(() => textoEscuchadoTemporal.value),
    errorReconocimiento: computed(() => errorReconocimiento.value),
    vocesDisponibles: computed(() => vocesDisponibles.value),
    sugerenciaActual: computed(() => sugerenciaActual.value),
    historialConversacion: computed(() => historialConversacion.value),
    ultimaAccionEjecutada: computed(() => ultimaAccionEjecutada.value),
    setConversacionFluida: (val: boolean) => { conversacionFluidaActiva.value = val },
    hablar,
    detener,
    escucharVoz,
    detenerEscucha,
    enviarMensajeConversacion,
    actualizarAjustes,
    reproducirPrueba,
    analizarYGenerarSugerencia
  }
}