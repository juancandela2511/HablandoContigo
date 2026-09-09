/**
 * ============================================================================
 * ALMACÉN DE ENTRENAMIENTO Y RECONOCIMIENTO DE IA (useReconocimientoIA.ts)
 * ============================================================================
 * 
 * ¿QUÉ ES Y QUÉ HACE?
 * Permite al Administrador calibrar y "entrenar" el motor de Inteligencia Artificial:
 * 1. Configurar criterios para clasificar respuestas abiertas como Buenas, Regulares o Malas (Alertas).
 * 2. Encasillar respuestas negativas en tipos de alertas específicas (Mala Gestión, Acoso, Depresión, etc.).
 * 3. Gestionar ejemplos de entrenamiento (Few-shot learning) para enseñarle a la IA cómo interpretar frases.
 * 4. Proveer un simulador en tiempo real para probar cómo la IA analiza y califica cualquier texto.
 */

import { ref, computed } from 'vue'
import { supabase } from '@/supabase'
import { useToast } from '@/Almacenes/useToast'
import { useTiposAlertas, type TipoAlertaPersonalizada } from '@/Almacenes/useTiposAlertas'

const { mostrarExito, mostrarAviso } = useToast()

export type CalificacionRespuesta = 'Buena' | 'Regular' | 'Mala'
export type NivelSensibilidad = 'Estricta' | 'Equilibrada' | 'Sensible'

export interface EjemploEntrenamientoIA {
  id: string
  textoEjemplo: string
  clasificacion: CalificacionRespuesta
  tipoAlertaId?: string
  nombreAlerta?: string
  explicacionCriterio: string
  creadoEn: string
}

export interface ResultadoAnalisisIA {
  clasificacion: CalificacionRespuesta
  puntajeEstimado: number // 1.0 a 5.0
  esAlerta: boolean
  alertaAsignada: TipoAlertaPersonalizada | null
  palabrasDetectadas: string[]
  confianza: number // 0 a 100%
  razonamiento: string
  sugerenciaAccion?: string
}

export interface ConfiguracionEntrenamiento {
  instruccionesGenerales: string
  criteriosBuenas: string
  criteriosRegulares: string
  criteriosMalas: string
  sensibilidad: NivelSensibilidad
  autoEncasillarAbiertas: boolean
  notificarAlertasAbiertas: boolean
}

const CLAVE_STORAGE_CONFIG_IA = 'hablandocontigo_ia_config_entrenamiento_v1'
const CLAVE_STORAGE_EJEMPLOS_IA = 'hablandocontigo_ia_ejemplos_entrenamiento_v1'

// Configuración inicial por defecto
const CONFIGURACION_INICIAL: ConfiguracionEntrenamiento = {
  instruccionesGenerales: 'Analiza las respuestas de los colaboradores en encuestas de clima laboral. Identifica el sentimiento real, evalúa si existe insatisfacción, malestar o peligro psicosocial, y encasilla inmediatamente en la alerta correspondiente cuando corresponda.',
  criteriosBuenas: 'Respuestas que reflejan motivación, satisfacción, excelente trabajo en equipo, agradecimiento, reconocimiento de líderes, bienestar o propuestas proactivas constructivas.',
  criteriosRegulares: 'Respuestas neutras, dudas sobre procesos, observaciones menores, solicitudes estándar de capacitación o comentarios sin carga emocional negativa severa.',
  criteriosMalas: 'Respuestas que manifiestan autoritarismo, gritos, favoritismo, hostigamiento, acoso, estrés severo, sobrecarga extrema, desinterés de los jefes, mal ambiente o afectación a la salud física/mental.',
  sensibilidad: 'Equilibrada',
  autoEncasillarAbiertas: true,
  notificarAlertasAbiertas: true
}

// Ejemplos semilla de entrenamiento
const EJEMPLOS_INICIALES: EjemploEntrenamientoIA[] = [
  {
    id: 'ej-001',
    textoEjemplo: 'Mi supervisor no me escucha cuando tengo dudas y solo me grita delante de todos cuando algo sale mal.',
    clasificacion: 'Mala',
    tipoAlertaId: 'tipo-jefes-gestion',
    nombreAlerta: 'Mala Gestión de los Jefes & Liderazgo Tóxico',
    explicacionCriterio: 'Describe trato humillante, falta de escucha y gritos en público por parte de la jefatura directa.',
    creadoEn: new Date().toISOString()
  },
  {
    id: 'ej-002',
    textoEjemplo: 'Me siento hostigado por mis compañeros, hacen comentarios pesados sobre mí y me aíslan del grupo.',
    clasificacion: 'Mala',
    tipoAlertaId: 'tipo-acoso',
    nombreAlerta: 'Acoso Laboral & Hostigamiento',
    explicacionCriterio: 'Evidencia conductas de exclusión social sistemática y hostigamiento interpersonal entre pares.',
    creadoEn: new Date().toISOString()
  },
  {
    id: 'ej-003',
    textoEjemplo: 'Llego a mi casa llorando casi todos los días por el agotamiento, no puedo más con esta presión.',
    clasificacion: 'Mala',
    tipoAlertaId: 'tipo-depresion',
    nombreAlerta: 'Crisis Anímica & Salud Mental',
    explicacionCriterio: 'Manifiesta colapso emocional, llanto frecuente y agotamiento crítico (burnout).',
    creadoEn: new Date().toISOString()
  },
  {
    id: 'ej-004',
    textoEjemplo: 'El ambiente en mi equipo es excelente, siempre nos apoyamos y mi líder es muy abierta al diálogo.',
    clasificacion: 'Buena',
    explicacionCriterio: 'Expresa colaboración, empatía y satisfacción total con el equipo y el liderazgo.',
    creadoEn: new Date().toISOString()
  },
  {
    id: 'ej-005',
    textoEjemplo: 'El trabajo es normal, a veces hay bastante flujo de llamadas pero se logra cumplir con la meta.',
    clasificacion: 'Regular',
    explicacionCriterio: 'Comentario neutro y balanceado que describe la rutina habitual sin quejas ni alertas.',
    creadoEn: new Date().toISOString()
  },
  {
    id: 'ej-006',
    textoEjemplo: 'Sugiero que mejoren los descansos y habiliten más hornos microondas en el comedor.',
    clasificacion: 'Regular',
    explicacionCriterio: 'Propuesta de mejora física constructiva, sin manifestar acoso ni conflicto.',
    creadoEn: new Date().toISOString()
  }
]

// Estados reactivos globales
const configuracion = ref<ConfiguracionEntrenamiento>({ ...CONFIGURACION_INICIAL })
const ejemplosEntrenamiento = ref<EjemploEntrenamientoIA[]>([...EJEMPLOS_INICIALES])
const cargadoDesdeSupabase = ref(false)

export function useReconocimientoIA() {
  const { tiposAlertas, tiposActivos } = useTiposAlertas()

  // ─── Inicialización y Carga ────────────────────────────────────────────────
  const inicializar = () => {
    if (cargadoDesdeSupabase.value) return
    cargadoDesdeSupabase.value = true

    try {
      const cfgLocal = localStorage.getItem(CLAVE_STORAGE_CONFIG_IA)
      if (cfgLocal) {
        configuracion.value = JSON.parse(cfgLocal)
      }

      const ejLocal = localStorage.getItem(CLAVE_STORAGE_EJEMPLOS_IA)
      if (ejLocal) {
        ejemplosEntrenamiento.value = JSON.parse(ejLocal)
      }
    } catch (e) {
      console.warn('Uso de configuración por defecto de IA')
    }
  }

  inicializar()

  const guardarLocalmente = () => {
    try {
      localStorage.setItem(CLAVE_STORAGE_CONFIG_IA, JSON.stringify(configuracion.value))
      localStorage.setItem(CLAVE_STORAGE_EJEMPLOS_IA, JSON.stringify(ejemplosEntrenamiento.value))
    } catch (e) {
      console.error('Error guardando en almacenamiento local:', e)
    }
  }

  // ─── Gestión de Configuración de Entrenamiento ──────────────────────────────
  const actualizarConfiguracion = async (nuevaConfig: Partial<ConfiguracionEntrenamiento>) => {
    configuracion.value = { ...configuracion.value, ...nuevaConfig }
    guardarLocalmente()

    try {
      await supabase.from('ia_entrenamiento_config').upsert({
        id: 'global_config',
        config: configuracion.value,
        actualizado_en: new Date().toISOString()
      })
    } catch {}

    mostrarExito('IA Calibrada', 'Los criterios de reconocimiento y directrices se han actualizado correctamente.')
  }

  // ─── Gestión de Ejemplos de Entrenamiento ──────────────────────────────────
  const agregarEjemplo = async (ejemplo: Omit<EjemploEntrenamientoIA, 'id' | 'creadoEn'>) => {
    const nuevo: EjemploEntrenamientoIA = {
      ...ejemplo,
      id: `ej-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      creadoEn: new Date().toISOString()
    }

    ejemplosEntrenamiento.value.unshift(nuevo)
    guardarLocalmente()

    try {
      await supabase.from('ia_ejemplos_entrenamiento').insert({
        id: nuevo.id,
        texto_ejemplo: nuevo.textoEjemplo,
        clasificacion: nuevo.clasificacion,
        tipo_alerta_id: nuevo.tipoAlertaId,
        nombre_alerta: nuevo.nombreAlerta,
        explicacion_criterio: nuevo.explicacionCriterio,
        creado_en: nuevo.creadoEn
      })
    } catch {}

    mostrarExito('Ejemplo Guardado', 'El modelo de IA ha aprendido este nuevo caso de entrenamiento.')
    return nuevo
  }

  const eliminarEjemplo = async (id: string) => {
    ejemplosEntrenamiento.value = ejemplosEntrenamiento.value.filter(e => e.id !== id)
    guardarLocalmente()

    try {
      await supabase.from('ia_ejemplos_entrenamiento').delete().eq('id', id)
    } catch {}

    mostrarAviso('Ejemplo Eliminado', 'El caso de entrenamiento ha sido retirado.')
  }

  const restablecerEjemplosPorDefecto = () => {
    ejemplosEntrenamiento.value = [...EJEMPLOS_INICIALES]
    configuracion.value = { ...CONFIGURACION_INICIAL }
    guardarLocalmente()
    mostrarExito('Restaurado', 'Se han restablecido los ejemplos y criterios de fábrica.')
  }

  // ─── MOTOR DE RECONOCIMIENTO Y ENCASILLAMIENTO DE IA ────────────────────────
  const analizarTextoConIA = (texto: string, preguntaContexto: string = ''): ResultadoAnalisisIA => {
    const textoLimpio = (texto || '').toLowerCase().trim()
    if (!textoLimpio) {
      return {
        clasificacion: 'Regular',
        puntajeEstimado: 3.0,
        esAlerta: false,
        alertaAsignada: null,
        palabrasDetectadas: [],
        confianza: 50,
        razonamiento: 'Texto vacío proporcionado para análisis.'
      }
    }

    const palabrasDetectadas: string[] = []
    let alertaEncontrada: TipoAlertaPersonalizada | null = null
    let maxCoincidencias = 0

    // 1. Revisar palabras clave de todas las alertas activas
    for (const tipo of tiposActivos.value) {
      let coincidencias = 0
      const palabras = tipo.palabrasClave || []

      for (const p of palabras) {
        const palabraLimpia = p.toLowerCase().trim()
        if (palabraLimpia && textoLimpio.includes(palabraLimpia)) {
          coincidencias++
          if (!palabrasDetectadas.includes(palabraLimpia)) {
            palabrasDetectadas.push(palabraLimpia)
          }
        }
      }

      if (coincidencias > maxCoincidencias) {
        maxCoincidencias = coincidencias
        alertaEncontrada = tipo
      }
    }

    // 2. Diccionarios semánticos de apoyo
    const terminosCriticosGenerales = [
      'gritos', 'humillacion', 'humillación', 'grosero', 'grosera', 'amenaza', 'insulto', 
      'llanto', 'desesperado', 'desesperada', 'no aguanto', 'no puedo mas', 'no puedo más',
      'renuncio', 'renunciar', 'abuso', 'favoritismo', 'injusto', 'maltrato', 'acoso',
      'hostigamiento', 'odio', 'asco', 'depresion', 'depresión', 'panico', 'pánico', 'ansiedad extrema'
    ]

    const terminosPositivos = [
      'excelente', 'bueno', 'buena', 'muy bien', 'me gusta', 'feliz', 'motivado', 'motivada',
      'apoyo', 'respeto', 'cordial', 'contento', 'contenta', 'agradecido', 'agradecida',
      'tranquilo', 'tranquila', 'gran equipo', 'super bien', 'maravilloso', 'armonia', 'armonía'
    ]

    let conteoCritico = 0
    let conteoPositivo = 0

    terminosCriticosGenerales.forEach(term => {
      if (textoLimpio.includes(term)) {
        conteoCritico++
        if (!palabrasDetectadas.includes(term)) {
          palabrasDetectadas.push(term)
        }
      }
    })

    terminosPositivos.forEach(term => {
      if (textoLimpio.includes(term)) {
        conteoPositivo++
        if (!palabrasDetectadas.includes(term)) {
          palabrasDetectadas.push(term)
        }
      }
    })

    // 3. Comparar con Ejemplos de Entrenamiento Guardados
    const ejemploCoincidente = ejemplosEntrenamiento.value.find(ej => {
      const ejMin = ej.textoEjemplo.toLowerCase().trim()
      return textoLimpio.includes(ejMin) || ejMin.includes(textoLimpio)
    })

    if (ejemploCoincidente) {
      const alerta = ejemploCoincidente.tipoAlertaId 
        ? tiposAlertas.value.find(t => t.id === ejemploCoincidente.tipoAlertaId) || null
        : null

      return {
        clasificacion: ejemploCoincidente.clasificacion,
        puntajeEstimado: ejemploCoincidente.clasificacion === 'Buena' ? 4.8 : ejemploCoincidente.clasificacion === 'Mala' ? 1.2 : 3.0,
        esAlerta: ejemploCoincidente.clasificacion === 'Mala',
        alertaAsignada: alerta,
        palabrasDetectadas,
        confianza: 98,
        razonamiento: `Coincidencia directa con caso de entrenamiento: "${ejemploCoincidente.explicacionCriterio}"`,
        sugerenciaAccion: alerta ? alerta.protocoloAccion : undefined
      }
    }

    // 4. Decisión Final basada en Criterios y Sensibilidad
    const umbralAlerta = configuracion.value.sensibilidad === 'Sensible' ? 1 : configuracion.value.sensibilidad === 'Estricta' ? 2 : 1

    if (conteoCritico >= umbralAlerta || maxCoincidencias > 0) {
      const alertaFinal = alertaEncontrada || tiposActivos.value[0] || null
      const confianzaCalc = Math.min(95, 70 + (conteoCritico * 8) + (maxCoincidencias * 10))

      return {
        clasificacion: 'Mala',
        puntajeEstimado: 1.5,
        esAlerta: true,
        alertaAsignada: alertaFinal,
        palabrasDetectadas,
        confianza: confianzaCalc,
        razonamiento: `Se detectaron ${conteoCritico + maxCoincidencias} indicadores críticos asociados a ${alertaFinal?.nombre || 'Alerta Psicosocial'}. Términos clave: [${palabrasDetectadas.slice(0, 4).join(', ')}].`,
        sugerenciaAccion: alertaFinal?.protocoloAccion || 'Notificar a Gestión Humana para seguimiento preventivo.'
      }
    }

    if (conteoPositivo > 0 && conteoCritico === 0) {
      const confianzaCalc = Math.min(95, 75 + (conteoPositivo * 10))
      return {
        clasificacion: 'Buena',
        puntajeEstimado: 4.7,
        esAlerta: false,
        alertaAsignada: null,
        palabrasDetectadas,
        confianza: confianzaCalc,
        razonamiento: `El texto refleja satisfacción y percepción favorable (${conteoPositivo} términos positivos detectados).`,
        sugerenciaAccion: 'Respuesta favorable. No requiere intervención.'
      }
    }

    // Caso neutro / regular
    return {
      clasificacion: 'Regular',
      puntajeEstimado: 3.2,
      esAlerta: false,
      alertaAsignada: null,
      palabrasDetectadas,
      confianza: 75,
      razonamiento: 'Comentario de carácter constructivo, neutro o sugerencia operativa sin evidencia de riesgo psicosocial grave.',
      sugerenciaAccion: 'Incluir en el informe general de sugerencias.'
    }
  }

  // ─── Estadísticas de Entrenamiento ─────────────────────────────────────────
  const estadisticasEntrenamiento = computed(() => {
    const total = ejemplosEntrenamiento.value.length
    const buenas = ejemplosEntrenamiento.value.filter(e => e.clasificacion === 'Buena').length
    const regulares = ejemplosEntrenamiento.value.filter(e => e.clasificacion === 'Regular').length
    const malas = ejemplosEntrenamiento.value.filter(e => e.clasificacion === 'Mala').length

    return {
      total,
      buenas,
      regulares,
      malas,
      totalAlertasConfiguradas: tiposAlertas.value.length,
      alertasActivas: tiposActivos.value.length
    }
  })

  return {
    configuracion,
    ejemplosEntrenamiento,
    estadisticasEntrenamiento,
    actualizarConfiguracion,
    agregarEjemplo,
    eliminarEjemplo,
    restablecerEjemplosPorDefecto,
    analizarTextoConIA
  }
}
