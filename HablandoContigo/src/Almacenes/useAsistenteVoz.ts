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
import router from '@/router'
import { useHighlight } from '@/Almacenes/useHighlight'
import { useTheme } from '@/Almacenes/useTheme'
import { useNotificaciones } from '@/Almacenes/useNotificaciones'
import { useCuentas, type RolCuenta } from '@/Almacenes/useCuentas'
import { useEncuestas } from '@/Almacenes/useEncuestas'
import { PLANTILLA_CLIMA_INTEGRAL_DETALLADA } from '@/Config/preguntasCuestionario'
import type { PreguntaEncuesta, OpcionPregunta, AccionJarvis } from '@/Servicios/iaEncuestasService'
import {
  consultarChatbotGeminiAPI,
  analizarEncuestaConGeminiAPI
} from '@/Servicios/iaEncuestasService'
import { useAuth, obtenerTratoUsuario } from '@/Almacenes/useAuth'
import { useTiposAlertas, type NivelAlerta } from '@/Almacenes/useTiposAlertas'

const CLAVE_AJUSTES_VOZ = 'hablandocontigo_ajustes_voz_asistente'

type TipoEntidadWizard = 'alerta' | 'usuario' | 'eliminar_alerta' | 'eliminar_usuario'

interface EstadoWizardConversacional {
  activo: boolean
  tipo: TipoEntidadWizard
  paso: number
  draftUsuario: {
    nombre: string
    email: string
    rol: RolCuenta
    departamento: string
  }
  draftAlerta: {
    nombre: string
    descripcion: string
    palabrasClave: string[]
    nivel: NivelAlerta
    color: string
    icono: string
  }
}

const wizardConversacional = ref<EstadoWizardConversacional>({
  activo: false,
  tipo: 'alerta',
  paso: 0,
  draftUsuario: { nombre: '', email: '', rol: 'Administrador', departamento: 'General' },
  draftAlerta: { nombre: '', descripcion: '', palabrasClave: [], nivel: 1, color: '#ef4444', icono: 'ShieldAlert' }
})

const wizardAlerta = ref({
  activo: false,
  paso: 0,
  draft: {
    nombre: '',
    descripcion: '',
    palabrasClave: [] as string[],
    nivel: 1 as NivelAlerta,
    color: '#ef4444',
    icono: 'ShieldAlert'
  }
})

export interface MensajeChatAsistente {
  id: string
  emisor: 'usuario' | 'asistente'
  texto: string
  timestamp: string
  preguntaSugerida?: PreguntaEncuesta
  acciones?: AccionJarvis[]
}

export interface AjustesVozAsistente {
  asistenteHabilitado: boolean // Interruptor maestro global para mostrar/ocultar y activar/desactivar el asistente
  nombreAsistente: string // Nombre personalizado para llamarlo (ej. "Sofía", "Daniel", "JARVIS")
  generoAsistente: 'mujer' | 'hombre' // Género de concordancia e identidad (mujer: lista, hombre: listo)
  vozHabilitada: boolean
  volumen: number // 0.0 a 1.0
  velocidad: number // 0.7 a 1.3
  tono: number // 0.8 a 1.2
  vozURI: string
  autoHablarSugerencias: boolean
  conversacionContinua: boolean
  modoInteraccion: 'solo_voz' | 'voz_y_chat' // Modo solo voz o con chat flotante
}

/**
 * Determina si la locución del usuario incluye el nombre programado del asistente (Palabra Clave)
 * O si es un comando directo intencional (crear usuario, crear encuesta, cambiar tema, navegar, etc.).
 * Garantiza que las órdenes operativas se ejecuten de inmediato sin ignorar al usuario.
 */
export function detectarPalabraClaveVoz(
  textoOriginal: string,
  nombreProgramado: string = 'Sofía'
): { coincide: boolean; comandoLimpio: string } {
  if (!textoOriginal || !textoOriginal.trim()) {
    return { coincide: false, comandoLimpio: '' }
  }

  const nombreLimpio = (nombreProgramado || 'Sofía')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

  const textoNorm = textoOriginal
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

  // Lista universal de nombres y alias fonéticos aceptados
  const alias: string[] = [
    nombreLimpio,
    'sofia', 'sofía', 'sophia', 'sofi', 'sofya', 'sofie',
    'jarvis', 'yarvis', 'harvis', 'daniel', 'dani', 'daniela',
    'apolo', 'apollo', 'friday', 'alexa', 'siri', 'asistente', 'bot',
    'hablandocontigo', 'hablando contigo'
  ]

  // 1. Detección Prioritaria Máxima por Verbos de Acción Directa (Crear, Editar, Eliminar, Ajustar, etc.)
  const verbosAccionPrioritarios = [
    'crear', 'crea', 'creame', 'creación', 'creacion', 'haz', 'hazme', 'generar', 'genera', 'construir',
    'editar', 'edita', 'editame', 'modificar', 'modifica', 'cambiar', 'cambia', 'pon', 'poner', 'ponle',
    'agregar', 'agrega', 'añadir', 'anade', 'eliminar', 'elimina', 'borrar', 'borra', 'quitar', 'quita',
    'ajustar', 'ajusta', 'programar', 'programa', 'configurar', 'configura', 'encasillar', 'encasilla',
    'ir a', 'abrir', 'abre', 'llevame', 'mostrar', 'ver', 'dashboard', 'proyectos', 'cuentas', 'usuarios', 'encuestas',
    'configuracion', 'ajustes', 'notificaciones', 'alertas', 'soporte', 'errores', 'spotlight', 'buscar',
    'modo oscuro', 'modo claro', 'modo dia', 'modo noche', 'tema', 'pantalla oscura', 'pantalla clara',
    'cerrar sesion', 'salir', 'logout', 'silencio', 'callate', 'para', 'stop', 'apagate',
    'hola', 'buenos dias', 'buenas tardes', 'buenas noches', 'que puedes hacer', 'quien eres', 'ayuda'
  ]

  const esVerboAccionDirecto = verbosAccionPrioritarios.some(v => textoNorm.includes(v))

  // 2. Verificar si menciona el nombre programado del asistente o alias fonéticos
  let nombreEncontrado = false
  for (const a of alias) {
    if (!a) continue
    const regex = new RegExp(`(^|\\b|\\s|[.,!¡?¿])${a}(\\b|\\s|[.,!¡?¿]|$)`, 'i')
    if (regex.test(textoNorm)) {
      nombreEncontrado = true
      break
    }
  }

  // Prioridad Absoluta: Si contiene un verbo de acción O menciona el nombre del asistente, procesar la orden
  if (!esVerboAccionDirecto && !nombreEncontrado) {
    return { coincide: false, comandoLimpio: '' }
  }

  // Extraer la orden removiendo el saludo o prefijo del nombre
  let comando = textoOriginal.trim()
  const aliasPattern = Array.from(new Set(alias.filter(Boolean))).join('|')
  const regexRemover = new RegExp(
    `^(?:oye|hey|hola|buenas(?:\\s+tardes|\\s+dias|\\s+noches)?|por\\s+favor|a\\s+ver)?\\s*[.,!¡?¿]*\\s*(?:${aliasPattern})\\s*[.,!¡?¿]*\\s*(?:por\\s+favor|me\\s+puedes|puedes|quiero\\s+que)?\\s*`,
    'i'
  )
  comando = comando.replace(regexRemover, '').trim()

  if (!comando || comando.length <= 1) {
    comando = 'hola'
  }

  return { coincide: true, comandoLimpio: comando }
}

/**
 * Investiga y deduce automáticamente metadatos completos para una alerta basada en su nombre o tema.
 * Ejemplo: Si el usuario dice "Riñas", autocompleta descripción sobre peleas/conflicto físico,
 * palabras clave asociadas ('riñas', 'pelea', 'agresión'), nivel 1 crítico, ícono ShieldAlert y protocolo.
 */
export function investigarEInferirAlerta(nombreTema: string) {
  const temaNorm = (nombreTema || 'Alerta General')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

  const nombreFormateado = nombreTema.trim().charAt(0).toUpperCase() + nombreTema.trim().slice(1)

  // 1. Riñas / Peleas / Violencia / Maltrato / Acoso / Agresiones
  if (temaNorm.includes('rina') || temaNorm.includes('pelea') || temaNorm.includes('golpe') || temaNorm.includes('violencia') || temaNorm.includes('agresion') || temaNorm.includes('maltrato') || temaNorm.includes('acoso')) {
    return {
      nombre: temaNorm.includes('rina') ? 'Riñas y Conflictos Físicos' : nombreFormateado,
      descripcion: `Supervisa e identifica menciones sobre riñas, peleas, altercados físicos, agresiones verbales o conductas violentas entre colaboradores en la jornada laboral.`,
      nivel: 1 as NivelAlerta,
      palabrasClave: [temaNorm, 'riña', 'riñas', 'pelea', 'peleas', 'golpes', 'agresión', 'violencia', 'conflicto físico', 'discusión fuerte', 'maltrato', 'acoso'],
      protocoloAccion: 'Intervención inmediata de la Dirección de Gestión Humana, Seguridad Laboral y Comité de Convivencia.',
      icono: 'ShieldAlert',
      color: '#ef4444'
    }
  }

  // 2. Salario / Sueldo / Dinero / Pagos / Remuneración / Aumento
  if (temaNorm.includes('salario') || temaNorm.includes('sueldo') || temaNorm.includes('pago') || temaNorm.includes('remuneracion') || temaNorm.includes('bono') || temaNorm.includes('dinero')) {
    return {
      nombre: temaNorm.includes('sueldo') || temaNorm.includes('salario') ? 'Descontento Salarial' : nombreFormateado,
      descripcion: `Supervisa la insatisfacción con el salario, retrasos en pagos, inconformidad con bonos o solicitudes de nivelación salarial.`,
      nivel: 1 as NivelAlerta,
      palabrasClave: [temaNorm, 'salario', 'sueldo', 'pago', 'retraso', 'aumento', 'remuneración', 'bonos', 'dinero'],
      protocoloAccion: 'Revisión por la Dirección de Compensación y Gestión Humana.',
      icono: 'Flame',
      color: '#ef4444'
    }
  }

  // 3. Estrés / Burnout / Sobrecarga / Horas Extra / Agotamiento
  if (temaNorm.includes('estres') || temaNorm.includes('burnout') || temaNorm.includes('sobrecarga') || temaNorm.includes('horas extra') || temaNorm.includes('cansancio') || temaNorm.includes('agotamiento')) {
    return {
      nombre: nombreFormateado,
      descripcion: `Detecta altos índices de fatiga laboral, agotamiento emocional, estrés severo y sobrecarga de horas de trabajo.`,
      nivel: 2 as NivelAlerta,
      palabrasClave: [temaNorm, 'estrés', 'burnout', 'sobrecarga', 'cansado', 'horas extra', 'sin descanso', 'agotado', 'presión'],
      protocoloAccion: 'Evaluación y redistribución de cargas de trabajo en conjunto con los líderes de área.',
      icono: 'AlertTriangle',
      color: '#f43f5e'
    }
  }

  // 4. Herramientas / Equipos / Software / Computadores / Infraestructura
  if (temaNorm.includes('herramienta') || temaNorm.includes('equipo') || temaNorm.includes('computador') || temaNorm.includes('sistema') || temaNorm.includes('internet') || temaNorm.includes('infraestructura')) {
    return {
      nombre: nombreFormateado,
      descripcion: `Detecta fallas operativas, lentitud en sistemas, computadores defectuosos o falta de insumos de trabajo.`,
      nivel: 3 as NivelAlerta,
      palabrasClave: [temaNorm, 'computador', 'sistema', 'internet', 'lento', 'falla', 'equipo', 'licencia', 'herramientas'],
      protocoloAccion: 'Notificación prioritaria al departamento de Tecnología e Infraestructura.',
      icono: 'Sliders',
      color: '#f59e0b'
    }
  }

  // Fallback Investigado General
  return {
    nombre: nombreFormateado,
    descripcion: `Alerta sobre "${nombreFormateado}" investigada y autocompletada inteligentemente por el Asistente IA para monitorear el clima organizacional.`,
    nivel: 1 as NivelAlerta,
    palabrasClave: [temaNorm, 'atención', 'crítico', 'seguimiento', 'revisión', 'clima'],
    protocoloAccion: 'Acompañamiento y seguimiento prioritario por el área de Talento Humano y Bienestar.',
    icono: 'ShieldAlert',
    color: '#ef4444'
  }
}

const ajustesPorDefecto: AjustesVozAsistente = {
  asistenteHabilitado: true,
  nombreAsistente: 'Sofía',
  generoAsistente: 'mujer',
  vozHabilitada: true,
  volumen: 1.0,
  velocidad: 1.0,
  tono: 1.0,
  vozURI: '',
  autoHablarSugerencias: false,
  conversacionContinua: true,
  modoInteraccion: 'solo_voz'
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

const historialConversacion = ref<MensajeChatAsistente[]>([])

// ─── Contexto Global de Encuesta (Si el usuario está editando una encuesta) ──
const contextoPreguntasActuales = ref<PreguntaEncuesta[]>([])
let callbackAccionesEncuesta: ((acciones: AccionJarvis[]) => void) | null = null
let callbackSugerenciaEncuesta: ((pregunta: PreguntaEncuesta) => void) | null = null

export function registrarContextoEncuesta(
  preguntas: PreguntaEncuesta[],
  alEjecutarAcciones?: (acciones: AccionJarvis[]) => void,
  alAplicarPregunta?: (pregunta: PreguntaEncuesta) => void
) {
  contextoPreguntasActuales.value = preguntas
  callbackAccionesEncuesta = alEjecutarAcciones || null
  callbackSugerenciaEncuesta = alAplicarPregunta || null
}

export function desregistrarContextoEncuesta() {
  contextoPreguntasActuales.value = []
  callbackAccionesEncuesta = null
  callbackSugerenciaEncuesta = null
}

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

// ─── Reconocimiento de Voz (STT) Continuo, Permanente y Auto-Recuperable ───────
let recognitionInstance: any = null
let timerSilencioFinal: any = null
let timerReintentoEscucha: any = null
let ultimoTextoHabladoPorAsistente = ''
let timestampFinHabla = 0
let estaIniciandoReconocimiento = false
let callbackTextoGlobal: ((texto: string) => void) | null = null
const escuchaPermanenteHabilitada = ref(true)

function inicializarReconocimiento() {
  if (typeof window === 'undefined') return null
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  if (!SpeechRecognition) {
    errorReconocimiento.value = 'Tu navegador no soporta reconocimiento de voz nativo.'
    return null
  }

  const recog = new SpeechRecognition()
  recog.lang = 'es-ES'
  recog.continuous = false // Por turnos con auto-reinicio continuo instantáneo (100% resiliente)
  recog.interimResults = true
  recog.maxAlternatives = 1
  return recog
}

function detenerMotorReconocimiento() {
  if (timerSilencioFinal) {
    clearTimeout(timerSilencioFinal)
    timerSilencioFinal = null
  }
  if (timerReintentoEscucha) {
    clearTimeout(timerReintentoEscucha)
    timerReintentoEscucha = null
  }
  escuchandoMicrofono.value = false
  if (recognitionInstance) {
    try {
      recognitionInstance.onend = null
      recognitionInstance.onerror = null
      recognitionInstance.abort()
    } catch {}
    recognitionInstance = null
  }
  estaIniciandoReconocimiento = false
}

function arrancarMotorReconocimiento() {
  if (typeof window === 'undefined') return
  if (!ajustes.value.asistenteHabilitado) return
  if (!escuchaPermanenteHabilitada.value) return
  if (hablandoActualmente.value || procesandoIA.value) return
  if (estaIniciandoReconocimiento) return

  detenerMotorReconocimiento()

  try {
    estaIniciandoReconocimiento = true
    const recog = inicializarReconocimiento()
    if (!recog) {
      estaIniciandoReconocimiento = false
      return
    }

    recognitionInstance = recog
    let transcripcionAcumulada = ''
    let yaDespachado = false

    const despacharTexto = (texto: string) => {
      if (yaDespachado) return
      const textoLimpio = texto.trim()
      if (!textoLimpio) return

      yaDespachado = true
      textoEscuchadoTemporal.value = ''
      
      // Filtro anti-eco: no procesar si el usuario capturó el eco del propio asistente
      const textoLower = textoLimpio.toLowerCase()
      const tiempoDesdeFin = Date.now() - timestampFinHabla
      const esEcoDirecto = tiempoDesdeFin < 1200 && ultimoTextoHabladoPorAsistente && (
        ultimoTextoHabladoPorAsistente === textoLower ||
        (textoLower.length > 15 && ultimoTextoHabladoPorAsistente.includes(textoLower))
      )

      if (!esEcoDirecto && callbackTextoGlobal) {
        // Pausar escucha mientras procesa la orden
        detenerMotorReconocimiento()
        callbackTextoGlobal(textoLimpio)
      }
    }

    recog.onstart = () => {
      estaIniciandoReconocimiento = false
      escuchandoMicrofono.value = true
      errorReconocimiento.value = null
    }

    recog.onresult = (event: any) => {
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
      transcripcionAcumulada = textoActual
      textoEscuchadoTemporal.value = textoActual

      // Si el usuario deja de hablar por 850ms, enviar la orden
      if (timerSilencioFinal) clearTimeout(timerSilencioFinal)
      if (textoActual.length > 0) {
        timerSilencioFinal = setTimeout(() => {
          despacharTexto(transcripcionAcumulada)
        }, 850)
      }
    }

    recog.onerror = (event: any) => {
      estaIniciandoReconocimiento = false
      escuchandoMicrofono.value = false
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.warn('[useAsistenteVoz] Evento micrófono:', event.error)
      }
      // Reintentar escucha automáticamente si debe estar siempre activa
      if (escuchaPermanenteHabilitada.value && !hablandoActualmente.value && !procesandoIA.value) {
        if (timerReintentoEscucha) clearTimeout(timerReintentoEscucha)
        timerReintentoEscucha = setTimeout(() => {
          arrancarMotorReconocimiento()
        }, 300)
      }
    }

    recog.onend = () => {
      estaIniciandoReconocimiento = false
      escuchandoMicrofono.value = false

      // Si el navegador cerró la sesión y había texto acumulado pendiente
      if (transcripcionAcumulada.trim().length > 0 && !yaDespachado) {
        despacharTexto(transcripcionAcumulada)
      } else if (escuchaPermanenteHabilitada.value && !hablandoActualmente.value && !procesandoIA.value) {
        // Reinicio automático inmediato para que NUNCA se apague el micrófono
        if (timerReintentoEscucha) clearTimeout(timerReintentoEscucha)
        timerReintentoEscucha = setTimeout(() => {
          arrancarMotorReconocimiento()
        }, 150)
      }
    }

    recog.start()
  } catch (e: any) {
    estaIniciandoReconocimiento = false
    escuchandoMicrofono.value = false
    if (escuchaPermanenteHabilitada.value && !hablandoActualmente.value && !procesandoIA.value) {
      if (timerReintentoEscucha) clearTimeout(timerReintentoEscucha)
      timerReintentoEscucha = setTimeout(() => {
        arrancarMotorReconocimiento()
      }, 500)
    }
  }
}

export function useAsistenteVoz() {
  const { usuarioActual } = useAuth()
  const tratoInfo = computed(() => obtenerTratoUsuario(usuarioActual.value))

  // Inicializar historial si está vacío con el saludo conciso del usuario
  if (historialConversacion.value.length === 0) {
    const voc = tratoInfo.value.vocativo
    const esHombre = ajustes.value.generoAsistente === 'hombre'
    const estado = esHombre ? 'listo' : 'lista'
    const nombre = ajustes.value.nombreAsistente || (esHombre ? 'Daniel' : 'Sofía')
    const saludoInicial = `Hola, ${voc}. Soy ${nombre}, estoy ${estado} para ayudarte.`
    historialConversacion.value.push({
      id: 'msg-welcome-01',
      emisor: 'asistente',
      texto: saludoInicial,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
  }

  /**
   * Actualiza y persiste los ajustes de voz
   */
  const actualizarAjustes = (nuevos: Partial<AjustesVozAsistente>) => {
    const estadoPrevioHabilitado = ajustes.value.asistenteHabilitado
    ajustes.value = { ...ajustes.value, ...nuevos }
    guardarAjustes()

    if (nuevos.asistenteHabilitado === false) {
      detener()
      detenerMotorReconocimiento()
    } else if (nuevos.asistenteHabilitado === true && !estadoPrevioHabilitado) {
      escuchaPermanenteHabilitada.value = true
      arrancarMotorReconocimiento()
    }
  }

  /**
   * Reproduce un texto mediante Text-to-Speech (TTS) con protección anti-eco y auto-reanudación de escucha
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
        detenerMotorReconocimiento()
        hablandoActualmente.value = true
        ultimoTextoHabladoPorAsistente = texto.toLowerCase().trim()

        window.speechSynthesis.cancel() // Limpiar cola previa
        window.speechSynthesis.resume() // Evitar bloqueo de background

        const utterance = new SpeechSynthesisUtterance(texto)
        utterance.lang = 'es-ES'
        utterance.volume = ajustes.value.volumen
        utterance.rate = ajustes.value.velocidad
        utterance.pitch = ajustes.value.tono

        // Actualizar lista de voces si estaba vacía
        if (vocesDisponibles.value.length === 0) {
          const currentVoices = window.speechSynthesis.getVoices()
          if (currentVoices.length > 0) {
            vocesDisponibles.value = currentVoices.filter(v => v.lang.startsWith('es') || v.lang.startsWith('ES'))
            if (vocesDisponibles.value.length === 0) vocesDisponibles.value = currentVoices
          }
        }

        // Asignar voz en español preferida según selección y género
        if (ajustes.value.vozURI) {
          const encontrada = vocesDisponibles.value.find(v => v.voiceURI === ajustes.value.vozURI)
          if (encontrada) {
            utterance.voice = encontrada
            utterance.lang = encontrada.lang
          }
        } else {
          // Buscar mejor voz en español adaptada al género configurado (Hombre / Mujer)
          const esHombre = ajustes.value.generoAsistente === 'hombre'
          const vocesEs = vocesDisponibles.value.filter(v => v.lang.includes('es-') || v.lang.startsWith('es') || v.lang.startsWith('ES'))
          
          let vozOptima: SpeechSynthesisVoice | undefined = undefined
          if (esHombre) {
            vozOptima = vocesEs.find(v => /jorge|pablo|diego|carlos|raul|manuel|antonio|miguel|david|male|guy|man\b/i.test(v.name))
          } else {
            vozOptima = vocesEs.find(v => /sabina|monica|elena|lucia|paulina|helena|laura|maria|rosa|female|woman\b/i.test(v.name))
          }

          if (!vozOptima && vocesEs.length > 0) {
            vozOptima = vocesEs[0]
          }

          if (vozOptima) {
            utterance.voice = vozOptima
            utterance.lang = vozOptima.lang
          }
        }

        utterance.onstart = () => {
          hablandoActualmente.value = true
        }

        utterance.onend = () => {
          hablandoActualmente.value = false
          timestampFinHabla = Date.now()
          // Reanudar escucha de micrófono tras extinción del eco
          setTimeout(() => {
            if (escuchaPermanenteHabilitada.value) {
              arrancarMotorReconocimiento()
            }
            resolve(true)
          }, 350)
        }

        utterance.onerror = (e) => {
          console.warn('[useAsistenteVoz] Error TTS:', e)
          hablandoActualmente.value = false
          timestampFinHabla = Date.now()
          if (escuchaPermanenteHabilitada.value) {
            arrancarMotorReconocimiento()
          }
          resolve(false)
        }

        window.speechSynthesis.speak(utterance)
      } catch (e) {
        console.warn('[useAsistenteVoz] Excepción TTS:', e)
        hablandoActualmente.value = false
        timestampFinHabla = Date.now()
        if (escuchaPermanenteHabilitada.value) {
          arrancarMotorReconocimiento()
        }
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
      if (escuchaPermanenteHabilitada.value) {
        arrancarMotorReconocimiento()
      }
    }
  }

  /**
   * Inicia la escucha permanente continua de voz (STT siempre activo)
   */
  const escucharVoz = (onTextoFinal?: (texto: string) => void) => {
    if (onTextoFinal) {
      callbackTextoGlobal = onTextoFinal
    }
    escuchaPermanenteHabilitada.value = true
    arrancarMotorReconocimiento()
  }

  /**
   * Detiene la captura de micrófono
   */
  const detenerEscucha = () => {
    escuchaPermanenteHabilitada.value = false
    detenerMotorReconocimiento()
  }

  /**
   * Envía un mensaje en la conversación y genera respuesta inteligente con Google Gemini (Motor JARVIS)
   */
  const enviarMensajeConversacion = async (
    mensajeUsuario: string,
    preguntasActuales?: PreguntaEncuesta[],
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
    detenerMotorReconocimiento()

    try {
      const txtLower = mensajeUsuario.toLowerCase().trim()

      // A) Cancelar wizard activo
      if ((wizardAlerta.value.activo || wizardConversacional.value.activo) && (txtLower.includes('cancelar') || txtLower.includes('descartar') || txtLower.includes('abortar') || txtLower.includes('parar'))) {
        wizardAlerta.value.activo = false
        wizardAlerta.value.paso = 0
        wizardConversacional.value.activo = false
        wizardConversacional.value.paso = 0
        const respuestaTexto = 'Entendido, cancelé la operación actual. ¿En qué más te puedo colaborar?'
        const asisMsg: MensajeChatAsistente = {
          id: `asis-${Date.now()}`,
          emisor: 'asistente',
          texto: respuestaTexto,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
        historialConversacion.value.push(asisMsg)
        if (ajustes.value.vozHabilitada) await hablar(respuestaTexto)
        procesandoIA.value = false
        return asisMsg
      }

      // B) Detección de Eliminación Directa por Voz (Eliminar Alerta / Eliminar Usuario)
      if (txtLower.includes('eliminar') || txtLower.includes('elimina') || txtLower.includes('borrar') || txtLower.includes('borra')) {
        if (txtLower.includes('alerta')) {
          const match = txtLower.match(/(?:eliminar|elimina|borrar|borra)\s+(?:la\s+)?alerta\s+(.+)/i)
          const queryNombre = (match && match[1]) ? match[1].trim() : ''
          const { tiposAlertas, eliminarTipoAlerta } = useTiposAlertas()
          const encontrada = queryNombre
            ? tiposAlertas.value.find(a => a.nombre.toLowerCase().includes(queryNombre) || queryNombre.includes(a.nombre.toLowerCase()))
            : tiposAlertas.value[tiposAlertas.value.length - 1]
          
          if (encontrada) {
            eliminarTipoAlerta(encontrada.id)
            const respuestaTexto = `¡Listo! Eliminé la alerta "${encontrada.nombre}" de la base de datos.`
            const asisMsg: MensajeChatAsistente = {
              id: `asis-${Date.now()}`,
              emisor: 'asistente',
              texto: respuestaTexto,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
            historialConversacion.value.push(asisMsg)
            if (ajustes.value.vozHabilitada) await hablar(respuestaTexto)
            try { router.push('/reconocimiento-ia') } catch {}
            procesandoIA.value = false
            return asisMsg
          }
        } else if (txtLower.includes('usuario') || txtLower.includes('cuenta')) {
          const match = txtLower.match(/(?:eliminar|elimina|borrar|borra)\s+(?:el\s+)?(?:usuario|cuenta)\s+(.+)/i)
          const queryNombre = (match && match[1]) ? match[1].trim() : ''
          const { cuentas, eliminarCuenta } = useCuentas()
          const encontrada = queryNombre
            ? cuentas.value.find(c => c.nombre.toLowerCase().includes(queryNombre) || queryNombre.includes(c.nombre.toLowerCase()))
            : null
          
          if (encontrada) {
            eliminarCuenta(encontrada.id)
            const respuestaTexto = `¡Listo! Eliminé al usuario "${encontrada.nombre}" de la plataforma.`
            const asisMsg: MensajeChatAsistente = {
              id: `asis-${Date.now()}`,
              emisor: 'asistente',
              texto: respuestaTexto,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
            historialConversacion.value.push(asisMsg)
            if (ajustes.value.vozHabilitada) await hablar(respuestaTexto)
            try { router.push('/admin/cuentas') } catch {}
            procesandoIA.value = false
            return asisMsg
          }
        }
      }

      // C) Detección de Creación de Pregunta para Encuesta por Voz
      const esIntencionCrearPregunta = (
        (txtLower.includes('crear') || txtLower.includes('crea') || txtLower.includes('creame') || txtLower.includes('agregar') || txtLower.includes('agrega') || txtLower.includes('añadir') || txtLower.includes('anade')) &&
        (txtLower.includes('pregunta') || txtLower.includes('cuestionario'))
      )

      if (esIntencionCrearPregunta) {
        const esAbierta = txtLower.includes('abierta') || txtLower.includes('texto') || txtLower.includes('comentario')
        const tipoPregunta: 'texto' | 'escala' = esAbierta ? 'texto' : 'escala'

        let textoPregunta = ''
        const matchTexto = mensajeUsuario.match(/(?:pregunta|texto|que diga|sobre)\s+(.+)/i)
        if (matchTexto && matchTexto[1]) {
          textoPregunta = matchTexto[1].replace(/en la encuesta.*|de tipo.*|abierta|cerrada|en tal espacio/gi, '').trim()
        }

        if (!textoPregunta || textoPregunta.length < 3) {
          textoPregunta = '¿Cómo evalúas el ambiente de trabajo y el bienestar en tu área?'
        } else if (!textoPregunta.startsWith('¿')) {
          textoPregunta = `¿${textoPregunta.charAt(0).toUpperCase() + textoPregunta.slice(1)}?`
        }

        const { encuestas, editarEncuesta } = useEncuestas()
        const encuestaTarget = encuestas.value[0] || { id: 'enc-001', titulo: 'Encuesta de Clima Laboral', preguntas: [] }

        const opcionesEscala: OpcionPregunta[] = [
          { id: `op-1-${Date.now()}`, texto: 'Muy Mal', valor: 1, esAlerta: true },
          { id: `op-2-${Date.now()}`, texto: 'Mal', valor: 2, esAlerta: true },
          { id: `op-3-${Date.now()}`, texto: 'Regular', valor: 3 },
          { id: `op-4-${Date.now()}`, texto: 'Bien', valor: 4 },
          { id: `op-5-${Date.now()}`, texto: 'Excelente', valor: 5 }
        ]

        const nuevaPregunta: PreguntaEncuesta = {
          id: `preg-vzal-${Date.now()}`,
          texto: textoPregunta,
          tipo: tipoPregunta,
          categoria: 'Clima Laboral',
          opciones: esAbierta ? [] : opcionesEscala
        }

        const preguntasActualizadas = [...(encuestaTarget.preguntas || []), nuevaPregunta]
        await editarEncuesta(encuestaTarget.id, { preguntas: preguntasActualizadas })

        const tipoLabel = esAbierta ? 'abierta (Texto Libre)' : 'cerrada (Escala 1 a 5)'
        const respuestaTexto = `¡Listo! Creé y agregué la pregunta ${tipoLabel}: "${textoPregunta}" a la encuesta "${encuestaTarget.titulo}". Ya se encuentra disponible.`

        const asisMsg: MensajeChatAsistente = {
          id: `asis-${Date.now()}`,
          emisor: 'asistente',
          texto: respuestaTexto,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
        historialConversacion.value.push(asisMsg)
        if (ajustes.value.vozHabilitada) await hablar(respuestaTexto)
        try { router.push('/proyectos') } catch {}
        procesandoIA.value = false
        return asisMsg
      }

      // D) Disparar Creación Express de Alerta ("omite los pasos", "solo créala", "créame la alerta Riñas")
      const esOmitirPasos = (
        txtLower.includes('omite') || txtLower.includes('omitir') || txtLower.includes('sin pasos') ||
        txtLower.includes('de una') || txtLower.includes('directo') || txtLower.includes('express') ||
        txtLower.includes('creala ya') || txtLower.includes('solo creala') || txtLower.includes('guardala') ||
        txtLower.includes('investiga') || txtLower.includes('autocompleta') || txtLower.includes('rellena')
      )
      const esIntencionCrearAlerta = (
        (txtLower.includes('crear') || txtLower.includes('crea') || txtLower.includes('creame') || txtLower.includes('creación') || txtLower.includes('creacion')) &&
        (txtLower.includes('alerta') || (!txtLower.includes('usuario') && !txtLower.includes('encuesta') && !txtLower.includes('cuenta') && !txtLower.includes('pregunta')))
      ) || txtLower.includes('nueva alerta') || txtLower.includes('programar alerta')

      // D.1) Si el wizard está activo y el usuario pide omitir o investigar pasos en medio del proceso
      if (wizardAlerta.value.activo && esOmitirPasos) {
        const nombreBase = wizardAlerta.value.draft.nombre || 'Alerta Prioritaria'
        const investigada = investigarEInferirAlerta(nombreBase)

        const { crearTipoAlerta } = useTiposAlertas()
        crearTipoAlerta({
          nombre: investigada.nombre,
          descripcion: investigada.descripcion,
          nivel: investigada.nivel,
          modoEnfoque: 'general',
          enfoqueDetalle: `Monitoreo continuo de la variable ${investigada.nombre}`,
          palabrasClave: investigada.palabrasClave,
          protocoloAccion: investigada.protocoloAccion,
          icono: investigada.icono,
          color: investigada.color
        })

        wizardAlerta.value.activo = false
        wizardAlerta.value.paso = 0

        const respuestaTexto = `¡Listo! Investigué e inferí automáticamente los datos para "${investigada.nombre}". Indexé ${investigada.palabrasClave.length} palabras clave y asigné el protocolo de acción.`
        const asisMsg: MensajeChatAsistente = {
          id: `asis-${Date.now()}`,
          emisor: 'asistente',
          texto: respuestaTexto,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
        historialConversacion.value.push(asisMsg)
        if (ajustes.value.vozHabilitada) await hablar(respuestaTexto)
        try { router.push('/reconocimiento-ia') } catch {}
        procesandoIA.value = false
        return asisMsg
      }

      // D.2) Inicio de creación de alerta desde cero (con investigación inteligente automática)
      if (!wizardAlerta.value.activo && esIntencionCrearAlerta) {
        // Extraer nombre potencial de la orden (ej: "créame la alerta Riñas")
        let nombreExtraido = ''
        const matchNombre = txtLower.match(/(?:crear|crea|creame|nueva)\s+(?:la\s+)?alerta\s+(?:de\s+|sobre\s+)?([^,;.]+?)(?:\s+(?:y\s+)?(?:omite|omitir|sin|directo|express|investiga|autocompleta)|$)/i)
        if (matchNombre && matchNombre[1]) {
          nombreExtraido = matchNombre[1].replace(/omite.*|pasos.*|resto.*|investiga.*/gi, '').trim()
        }

        // Si el usuario especificó un nombre (ej. "Riñas") o pidió investigar/omitir pasos:
        if (esOmitirPasos || (nombreExtraido && nombreExtraido.length >= 2 && !nombreExtraido.includes('paso'))) {
          const temaFinal = nombreExtraido || 'Alerta General'
          const investigada = investigarEInferirAlerta(temaFinal)

          const { crearTipoAlerta } = useTiposAlertas()
          crearTipoAlerta({
            nombre: investigada.nombre,
            descripcion: investigada.descripcion,
            nivel: investigada.nivel,
            modoEnfoque: 'general',
            enfoqueDetalle: `Monitoreo constante con IA de la variable ${investigada.nombre}`,
            palabrasClave: investigada.palabrasClave,
            protocoloAccion: investigada.protocoloAccion,
            icono: investigada.icono,
            color: investigada.color
          })

          const respuestaTexto = `¡Listo! Investigué e inferí los detalles para la alerta de "${investigada.nombre}". Indexé las palabras clave: ${investigada.palabrasClave.join(', ')} y configuré el protocolo en Nivel ${investigada.nivel}. Ya está guardada.`
          const asisMsg: MensajeChatAsistente = {
            id: `asis-${Date.now()}`,
            emisor: 'asistente',
            texto: respuestaTexto,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
          historialConversacion.value.push(asisMsg)
          if (ajustes.value.vozHabilitada) await hablar(respuestaTexto)
          try { router.push('/reconocimiento-ia') } catch {}
          procesandoIA.value = false
          return asisMsg
        }

        // Si no dio nombre ni pidió investigar, arrancar el Wizard Guiado Paso a Paso
        wizardAlerta.value.activo = true
        wizardAlerta.value.paso = 1
        wizardAlerta.value.draft = {
          nombre: '',
          descripcion: '',
          palabrasClave: [],
          nivel: 1,
          color: '#ef4444',
          icono: 'ShieldAlert'
        }
        const respuestaTexto = '¡Listo! Te ayudaré a crear la alerta paso a paso. Primero, ¿qué nombre le vas a poner a esta alerta?'
        const asisMsg: MensajeChatAsistente = {
          id: `asis-${Date.now()}`,
          emisor: 'asistente',
          texto: respuestaTexto,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
        historialConversacion.value.push(asisMsg)
        if (ajustes.value.vozHabilitada) await hablar(respuestaTexto)
        procesandoIA.value = false
        return asisMsg
      }

      // D) Si el wizard guiado está activo, procesar paso a paso
      if (wizardAlerta.value.activo) {
        let respuestaTexto = ''

        if (wizardAlerta.value.paso === 1) {
          wizardAlerta.value.draft.nombre = mensajeUsuario.trim()
          wizardAlerta.value.paso = 2
          respuestaTexto = `¡Excelente! El nombre es "${wizardAlerta.value.draft.nombre}". Ahora dime, ¿de qué trata esta alerta o qué situación debe vigilar la IA?`
        } else if (wizardAlerta.value.paso === 2) {
          wizardAlerta.value.draft.descripcion = mensajeUsuario.trim()
          wizardAlerta.value.paso = 3
          respuestaTexto = `Entendido. ¿Con qué palabras clave o frases se asocia esta alerta? Puedes dictármelas separadas por comas.`
        } else if (wizardAlerta.value.paso === 3) {
          const kws = mensajeUsuario.split(/[,;]/).map(k => k.trim().toLowerCase()).filter(Boolean)
          wizardAlerta.value.draft.palabrasClave = kws.length > 0 ? kws : [wizardAlerta.value.draft.nombre.toLowerCase()]
          wizardAlerta.value.paso = 4
          respuestaTexto = `Perfecto. Indexé las palabras clave: ${wizardAlerta.value.draft.palabrasClave.join(', ')}. Por último, ¿qué nivel de severidad (1 al 4) y qué color le asignamos? (Ej: Nivel 1 Crítico en rojo, Nivel 2 Rosa, Nivel 3 Ámbar o Nivel 4 Azul).`
        } else if (wizardAlerta.value.paso === 4) {
          let nivel: NivelAlerta = 1
          if (txtLower.includes('2') || txtLower.includes('dos') || txtLower.includes('alto') || txtLower.includes('rosa')) nivel = 2
          else if (txtLower.includes('3') || txtLower.includes('tres') || txtLower.includes('moderad') || txtLower.includes('ambar') || txtLower.includes('amarill')) nivel = 3
          else if (txtLower.includes('4') || txtLower.includes('cuatro') || txtLower.includes('baj') || txtLower.includes('preventiv') || txtLower.includes('azul')) nivel = 4

          let color = '#ef4444'
          if (txtLower.includes('rosa')) color = '#f43f5e'
          else if (txtLower.includes('ambar') || txtLower.includes('amarill') || txtLower.includes('naranja')) color = '#f59e0b'
          else if (txtLower.includes('verd') || txtLower.includes('esmeralda')) color = '#10b981'
          else if (txtLower.includes('azul') || txtLower.includes('cielo')) color = '#0ea5e9'
          else if (txtLower.includes('violeta') || txtLower.includes('morad')) color = '#8b5cf6'

          const icono = nivel === 1 ? 'ShieldAlert' : nivel === 2 ? 'Flame' : nivel === 3 ? 'AlertTriangle' : 'Sliders'

          const { crearTipoAlerta } = useTiposAlertas()
          crearTipoAlerta({
            nombre: wizardAlerta.value.draft.nombre,
            descripcion: wizardAlerta.value.draft.descripcion,
            nivel,
            modoEnfoque: 'especifico',
            enfoqueDetalle: wizardAlerta.value.draft.descripcion,
            palabrasClave: wizardAlerta.value.draft.palabrasClave,
            protocoloAccion: 'Atención prioritaria y acompañamiento por Talento Humano.',
            icono,
            color
          })

          wizardAlerta.value.activo = false
          wizardAlerta.value.paso = 0

          respuestaTexto = `¡Listo! Creé exitosamente la alerta "${wizardAlerta.value.draft.nombre}" (Nivel ${nivel}) en la base de datos con sus palabras clave y color. Ya está activa en el sistema.`
          try {
            router.push('/reconocimiento-ia')
          } catch {}
        }

        const asisMsg: MensajeChatAsistente = {
          id: `asis-${Date.now()}`,
          emisor: 'asistente',
          texto: respuestaTexto,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
        historialConversacion.value.push(asisMsg)
        if (ajustes.value.vozHabilitada) await hablar(respuestaTexto)
        procesandoIA.value = false
        return asisMsg
      }

      // 2. Resolver preguntas efectivas (del argumento o del contexto registrado en la vista de encuesta)
      const preguntasEfectivas = (preguntasActuales && preguntasActuales.length > 0)
        ? preguntasActuales
        : contextoPreguntasActuales.value

      const nombreActual = (ajustes.value.nombreAsistente || 'Sofía').trim()
      const tratoActual = tratoInfo.value.trato
      const nombreUsr = usuarioActual.value?.nombre || 'Administrador'

      const { respuestaTexto, acciones, preguntaSugerida } = await consultarChatbotGeminiAPI(
        mensajeUsuario,
        historialConversacion.value,
        preguntasEfectivas,
        nombreActual,
        tratoActual,
        nombreUsr,
        ajustes.value.generoAsistente || 'mujer'
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

      // 3. Ejecutar acciones en tiempo real (Navegación global, soporte, spotlight, silenciamiento, tema, notificaciones, sesión o encuesta)
      if (acciones && acciones.length > 0) {
        for (const act of acciones) {
          if (act.tipo === 'CREAR_USUARIO' && act.usuarioNuevo) {
            try {
              const { crearCuenta } = useCuentas()
              await crearCuenta({
                nombre: act.usuarioNuevo.nombre,
                email: act.usuarioNuevo.email,
                rol: act.usuarioNuevo.rol,
                departamento: act.usuarioNuevo.departamento,
                estado: 'Activo'
              })
              router.push('/admin/cuentas')
            } catch (e) {
              console.warn('[useAsistenteVoz] Error creando usuario:', e)
            }
          } else if (act.tipo === 'CREAR_ENCUESTA' && act.encuestaNueva) {
            try {
              const { crearEncuesta } = useEncuestas()
              await crearEncuesta({
                titulo: act.encuestaNueva.titulo,
                descripcion: act.encuestaNueva.descripcion || 'Encuesta de Clima Laboral y Bienestar Integral.',
                departamento: act.encuestaNueva.departamento || 'General',
                creadoPor: usuarioActual.value?.nombre || 'Administrador',
                estado: 'Activa',
                preguntas: JSON.parse(JSON.stringify(PLANTILLA_CLIMA_INTEGRAL_DETALLADA)),
                preguntasSeguimiento: []
              })
              router.push('/proyectos')
            } catch (e) {
              console.warn('[useAsistenteVoz] Error creando encuesta:', e)
            }
          } else if (act.tipo === 'NAVEGAR' && act.ruta) {
            try {
              router.push(act.ruta)
            } catch (e) {
              console.warn('[useAsistenteVoz] Error navegando:', e)
            }
          } else if (act.tipo === 'CAMBIAR_TEMA') {
            try {
              const { fijarTema, alternarTema } = useTheme()
              if (act.temaModo === 'dark' || act.temaModo === 'light') {
                fijarTema(act.temaModo)
              } else {
                alternarTema()
              }
            } catch (e) {
              console.warn('[useAsistenteVoz] Error cambiando tema:', e)
            }
          } else if (act.tipo === 'ABRIR_NOTIFICACIONES') {
            try {
              const { togglePanel } = useNotificaciones()
              togglePanel()
            } catch (e) {
              console.warn('[useAsistenteVoz] Error abriendo notificaciones:', e)
            }
          } else if (act.tipo === 'ABRIR_SPOTLIGHT') {
            try {
              const { abrirSpotlight } = useHighlight()
              abrirSpotlight()
            } catch {}
          } else if (act.tipo === 'ABRIR_SOPORTE') {
            try {
              router.push('/support')
            } catch {}
          } else if (act.tipo === 'CERRAR_SESION') {
            try {
              const { cerrarSesion } = useAuth()
              cerrarSesion()
              router.push('/login')
            } catch {}
          } else if (act.tipo === 'SILENCIAR') {
            detener()
          }
        }

        ultimaAccionEjecutada.value = acciones[0] || null
        if (alEjecutarAcciones) {
          alEjecutarAcciones(acciones)
        }
        if (callbackAccionesEncuesta) {
          callbackAccionesEncuesta(acciones)
        }
      }

      // 4. Hablar la respuesta en voz alta
      if (ajustes.value.vozHabilitada) {
        await hablar(respuestaTexto)
      }

      return asisMsg
    } finally {
      procesandoIA.value = false
      if (escuchaPermanenteHabilitada.value && !hablandoActualmente.value) {
        arrancarMotorReconocimiento()
      }
    }
  }

  /**
   * Reproduce una locución de prueba concisa con el trato y género del asistente actual
   */
  const reproducirPrueba = async () => {
    const voc = tratoInfo.value.vocativo
    const esHombre = ajustes.value.generoAsistente === 'hombre'
    const estadoGramatical = esHombre ? 'listo' : 'lista'
    const nombre = ajustes.value.nombreAsistente || (esHombre ? 'Daniel' : 'Sofía')
    const textoPrueba = `Hola, ${voc}. Soy ${nombre}, estoy ${estadoGramatical} y a tu servicio.`
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
    escuchaPermanenteHabilitada: computed(() => escuchaPermanenteHabilitada.value),
    contextoPreguntasActuales: computed(() => contextoPreguntasActuales.value),
    tratoInfo,
    setConversacionFluida: (val: boolean) => { conversacionFluidaActiva.value = val },
    hablar,
    detener,
    escucharVoz,
    detenerEscucha,
    enviarMensajeConversacion,
    actualizarAjustes,
    reproducirPrueba,
    analizarYGenerarSugerencia,
    registrarContextoEncuesta,
    desregistrarContextoEncuesta
  }
}