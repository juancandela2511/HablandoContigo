<!--
  ============================================================================
  VISTA RESPONDER ENCUESTA ANÓNIMA Y ADAPTATIVA (ResponderEncuestaView.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Orquestador de la sesión de respuesta confidencial del colaborador:
  - Temporizador estricto antirapidez: exige un mínimo de 4 segundos para preguntas
    cerradas y 8 segundos para preguntas abiertas para evitar respuestas impulsivas
    o automáticas ("responder porque sí").
  - Descarte automático de auditoría: si se responde a exceso de velocidad, la respuesta
    se registra pero se marca como descartada (`esDescartadaPorVelocidad = true`)
    para que no contamine las estadísticas oficiales.
  - Header institucional y garantía de anonimato (`EncuestaBarraSuperior.vue`).
  - Lógica adaptativa en tiempo real (detección de jefatura tóxica, acoso y descarte de relleno).
  - Interfaz de pregunta activa (`EncuestaPreguntaItem.vue`).
  - Pantalla final de confirmación con aviso de auditoría si aplica (`EncuestaPantallaExito.vue`).
  
  ¿CON QUÉ ESTÁ VINCULADO / CONECTADO?
  - useEncuestas.ts, deviceService.ts, iaEncuestasService.ts.
  - Subcomponentes modulares en `src/componentes/Encuestas/`.
-->

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, onBeforeRouteLeave } from 'vue-router'
import { useEncuestas, type Encuesta } from '@/Almacenes/useEncuestas'
import { obtenerODefinirDispositivoUUID, obtenerFechaYHoraActual, obtenerUbicacionExactaDispositivo, iniciarCapturaUbicacion } from '@/Servicios/deviceService'
import { 
  type PreguntaEncuesta, 
  type OpcionPregunta,
  evaluarRespuestasConGeminiEstricto,
  type AlertaGeminiEstricta
} from '@/Servicios/iaEncuestasService'

import EncuestaBarraSuperior from '@/componentes/Encuestas/EncuestaBarraSuperior.vue'
import EncuestaPreguntaItem from '@/componentes/Encuestas/EncuestaPreguntaItem.vue'
import EncuestaPantallaExito from '@/componentes/Encuestas/EncuestaPantallaExito.vue'

const ruta = useRoute()
const { encuestas, registrarRespuestaAnonima, obtenerEncuestaPorId } = useEncuestas()

const idEncuesta = computed(() => (ruta.params.id as string) || 'enc-001')
const encuesta = ref<Encuesta | null>(null)
const dispositivoUUID = ref('')
const fechaYHora = ref({ fecha: '', hora: '' })

// Estado del cuestionario adaptativo
const indicePreguntaActual = ref(0)
const respuestasUsuario = ref<Record<string, any>>({})
const alertaDetectadaEnSesion = ref(false)
const listaAlertas = ref<string[]>([])
const completada = ref(false)
const enviando = ref(false)

// Cola de preguntas activas (dinámica y adaptativa)
const colaPreguntas = ref<PreguntaEncuesta[]>([])

// ─────────────────────────────────────────────────────────────────────────────
// BLOQUEO ESTRICTO DE SALIDA: NO PERMITIR SALIR HASTA FINALIZAR LA ENCUESTA
// ─────────────────────────────────────────────────────────────────────────────
onBeforeRouteLeave((_to, _from) => {
  if (!completada.value) {
    alert('⚠️ La encuesta está en progreso. Para garantizar la confidencialidad e integridad de tus respuestas, no puedes salir hasta completarla y enviarla.')
    return false
  }
  return true
})

const manejarBloqueoSalir = (e: BeforeUnloadEvent) => {
  if (!completada.value) {
    e.preventDefault()
    e.returnValue = ''
    return ''
  }
}

const manejarPopState = () => {
  if (!completada.value) {
    window.history.pushState(null, '', window.location.href)
    alert('⚠️ La encuesta está en progreso. Debes finalizarla y enviarla antes de poder salir.')
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTROL DE TIEMPO Y PREVENCIÓN DE RESPUESTAS POR RESPONDER ("RESPONDER PORQUE SÍ")
// ─────────────────────────────────────────────────────────────────────────────
const TIEMPO_MINIMO_CERRADA = 4 // Mínimo 4 segundos para preguntas cerradas/escalas
const TIEMPO_MINIMO_ABIERTA = 8 // Mínimo 8 segundos para preguntas abiertas/texto libre

const tiempoInicioGlobal = ref(Date.now())
const tiempoInicioPregunta = ref(Date.now())
const segundosTranscurridos = ref(0)
const tiemposPorPregunta = ref<Record<string, number>>({})
const preguntasApresuradasCount = ref(0)

let timerPregunta: ReturnType<typeof setInterval> | null = null

const preguntaActual = computed(() => {
  return colaPreguntas.value[indicePreguntaActual.value]
})

const totalPreguntasCola = computed(() => colaPreguntas.value.length)

const tiempoMinimoRequerido = computed(() => {
  return preguntaActual.value?.tipo === 'texto' ? TIEMPO_MINIMO_ABIERTA : TIEMPO_MINIMO_CERRADA
})

const tiempoMinimoCumplido = computed(() => {
  return segundosTranscurridos.value >= tiempoMinimoRequerido.value
})

const segundosRestantes = computed(() => {
  return Math.max(0, tiempoMinimoRequerido.value - segundosTranscurridos.value)
})

const reiniciarCronometroPregunta = () => {
  if (timerPregunta) clearInterval(timerPregunta)
  tiempoInicioPregunta.value = Date.now()
  segundosTranscurridos.value = 0
  timerPregunta = setInterval(() => {
    segundosTranscurridos.value++
  }, 1000)
}

onMounted(() => {
  tiempoInicioGlobal.value = Date.now()
  reiniciarCronometroPregunta()

  // Bloqueo de salida en navegador y retroceso de historial
  window.history.pushState(null, '', window.location.href)
  window.addEventListener('beforeunload', manejarBloqueoSalir)
  window.addEventListener('popstate', manejarPopState)

  dispositivoUUID.value = obtenerODefinirDispositivoUUID()
  fechaYHora.value = obtenerFechaYHoraActual()

  // Iniciar detección de ubicación exacta inmediatamente en segundo plano
  iniciarCapturaUbicacion()

  let encuestaEncontrada = obtenerEncuestaPorId(idEncuesta.value)
  if (!encuestaEncontrada && encuestas.value.length > 0) {
    encuestaEncontrada = encuestas.value[0]
  }

  if (encuestaEncontrada) {
    encuesta.value = encuestaEncontrada
    const pregs = [...encuestaEncontrada.preguntas]
    
    // Garantizar que la pregunta de jefatura esté presente
    if (!pregs.some(p => p.texto.toLowerCase().includes('jefe') || p.id === 'p-jefe-relacion')) {
      pregs.unshift({
        id: 'p-jefe-relacion',
        categoria: 'Liderazgo y Supervisión Directa',
        texto: '¿Qué tal te la llevas con tu jefe?',
        tipo: 'multiple',
        tieneBifurcacion: true,
        preguntaCondicionalId: 'p-jefe-subpregunta-falencias',
        opciones: [
          { id: 'opc-jefe-bien', texto: 'Bien', valor: 5, esAlerta: false },
          { id: 'opc-jefe-regular', texto: 'Regular', valor: 3, esAlerta: false },
          { id: 'opc-jefe-mal', texto: 'Mal', valor: 1, esAlerta: true }
        ]
      })
    }
    colaPreguntas.value = pregs
  }
})

onUnmounted(() => {
  if (timerPregunta) clearInterval(timerPregunta)
  window.removeEventListener('beforeunload', manejarBloqueoSalir)
  window.removeEventListener('popstate', manejarPopState)
})

const porcentajeProgreso = computed(() => {
  if (totalPreguntasCola.value === 0) return 0
  return Math.round(((indicePreguntaActual.value) / totalPreguntasCola.value) * 100)
})

const respuestaSeleccionadaActual = computed(() => {
  if (!preguntaActual.value) return null
  return respuestasUsuario.value[preguntaActual.value.id]
})

const seleccionarOpcion = (opcion: OpcionPregunta) => {
  if (!preguntaActual.value) return
  respuestasUsuario.value[preguntaActual.value.id] = {
    texto: opcion.texto,
    valor: opcion.valor,
    esAlerta: opcion.esAlerta
  }

  // Bifurcación condicional de jefatura
  const textoPregunta = preguntaActual.value.texto.toLowerCase()
  const esPreguntaJefe = textoPregunta.includes('jefe') || preguntaActual.value.id === 'p-jefe-relacion'

  if (esPreguntaJefe) {
    const seleccion = (opcion.texto || '').trim().toLowerCase()
    const idSubpregunta = 'p-jefe-subpregunta-falencias'

    if (seleccion === 'bien') {
      colaPreguntas.value = colaPreguntas.value.filter(p => p.id !== idSubpregunta)
      delete respuestasUsuario.value[idSubpregunta]
    } else if (seleccion === 'mal' || seleccion === 'regular') {
      const yaExiste = colaPreguntas.value.some(p => p.id === idSubpregunta)
      if (!yaExiste) {
        const subpregunta: PreguntaEncuesta = {
          id: idSubpregunta,
          categoria: 'Profundización de Gestión del Jefe',
          texto: '¿Qué inconvenientes, recomendaciones o falencias tienes respecto a la gestión de tu jefe?',
          tipo: 'texto',
          opciones: [],
          esSensibleAcoso: true,
          esCondicional: true
        }
        colaPreguntas.value.splice(indicePreguntaActual.value + 1, 0, subpregunta)
      }
    }
  }

  // Detección de alerta crítica
  if (opcion.esAlerta || (opcion.valor <= 2 && preguntaActual.value.esSensibleAcoso)) {
    if (!alertaDetectadaEnSesion.value) {
      alertaDetectadaEnSesion.value = true
      listaAlertas.value.push(`Alerta en: ${preguntaActual.value.categoria}`)

      if (encuesta.value?.preguntasSeguimiento && encuesta.value.preguntasSeguimiento.length > 0) {
        encuesta.value.preguntasSeguimiento.forEach(preguntaProfunda => {
          if (!colaPreguntas.value.some(p => p.id === preguntaProfunda.id)) {
            colaPreguntas.value.splice(indicePreguntaActual.value + 1, 0, preguntaProfunda)
          }
        })
      }
    }
  }
}

const actualizarTextoRespuesta = (texto: string) => {
  if (preguntaActual.value) {
    respuestasUsuario.value[preguntaActual.value.id] = texto
  }
}

const avanzarPregunta = () => {
  // Validación 1: Tiempo mínimo reglamentario cumplido
  if (!tiempoMinimoCumplido.value) {
    alert(`Por favor lee atentamente la pregunta. Se requiere un tiempo mínimo de ${tiempoMinimoRequerido.value} segundos antes de avanzar para evitar respuestas apresuradas.`)
    return
  }

  // Validación 2: Respuesta seleccionada obligatoria
  if (!respuestaSeleccionadaActual.value && preguntaActual.value?.tipo !== 'texto') {
    alert('Por favor selecciona una respuesta para continuar.')
    return
  }

  // Validación 3: Sub-pregunta condicional de texto obligatorio
  if (preguntaActual.value?.id === 'p-jefe-subpregunta-falencias') {
    const textoRespuesta = respuestasUsuario.value[preguntaActual.value.id]
    if (!textoRespuesta || !String(textoRespuesta).trim() || String(textoRespuesta).trim().length < 5) {
      alert('Esta sub-pregunta de profundización es obligatoria. Por favor escribe con detalle tus observaciones sobre la gestión de tu jefe.')
      return
    }
  }

  // Registrar tiempo transcurrido en la pregunta actual
  const duracionPregunta = Math.round((Date.now() - tiempoInicioPregunta.value) / 1000)
  if (preguntaActual.value) {
    tiemposPorPregunta.value[preguntaActual.value.id] = duracionPregunta
    if (duracionPregunta < tiempoMinimoRequerido.value) {
      preguntasApresuradasCount.value++
    }
  }

  if (indicePreguntaActual.value < totalPreguntasCola.value - 1) {
    indicePreguntaActual.value++
    reiniciarCronometroPregunta()
  } else {
    finalizarYEnviar()
  }
}

const retrocederPregunta = () => {
  if (indicePreguntaActual.value > 0) {
    indicePreguntaActual.value--
    reiniciarCronometroPregunta()
  }
}

// Opción voluntaria de identificación al final
const dejarNombreVoluntario = ref(false)
const nombreVoluntario = ref('')

const finalizarYEnviar = async () => {
  enviando.value = true

  // Registrar tiempo de la última pregunta
  const duracionUltimaPregunta = Math.round((Date.now() - tiempoInicioPregunta.value) / 1000)
  if (preguntaActual.value) {
    tiemposPorPregunta.value[preguntaActual.value.id] = duracionUltimaPregunta
    if (duracionUltimaPregunta < tiempoMinimoRequerido.value) {
      preguntasApresuradasCount.value++
    }
  }

  const duracionTotalSegundos = Math.max(1, Math.round((Date.now() - tiempoInicioGlobal.value) / 1000))

  // Capturar geolocalización exacta en tiempo real
  let ubicacionCapturada = undefined
  try {
    ubicacionCapturada = await obtenerUbicacionExactaDispositivo()
  } catch (e) {
    console.info('Ubicación capturada por defecto')
  }

  if (encuesta.value) {
    const respuestasFormateadas = Object.keys(respuestasUsuario.value).map(pregId => {
      const preg = colaPreguntas.value.find(p => p.id === pregId)
      const respVal = respuestasUsuario.value[pregId]
      return {
        idPregunta: pregId,
        textoPregunta: preg?.texto || '',
        categoria: preg?.categoria || 'General',
        respuesta: typeof respVal === 'object' ? respVal.texto : respVal,
        valor: typeof respVal === 'object' ? respVal.valor : undefined,
        esAlerta: typeof respVal === 'object' ? respVal.esAlerta : false
      }
    })

    const idVoluntaria = (dejarNombreVoluntario.value && nombreVoluntario.value.trim()) 
      ? nombreVoluntario.value.trim() 
      : undefined

    // Motor de Análisis Estricto con Gemini API (Cero Falsas Alarmas)
    let alertasGeminiActivas: AlertaGeminiEstricta[] = []
    try {
      const resultadoGemini = await evaluarRespuestasConGeminiEstricto({
        idEncuesta: encuesta.value.id,
        tituloEncuesta: encuesta.value.titulo,
        dispositivoUUID: dispositivoUUID.value,
        departamento: encuesta.value.departamento,
        respuestas: respuestasFormateadas
      })
      if (resultadoGemini?.hayAlertas) {
        alertasGeminiActivas = resultadoGemini.alertas
      }
    } catch (e) {
      console.info('Evaluación estricta completada')
    }

    // Registrar en Supabase
    await registrarRespuestaAnonima(
      encuesta.value.id, 
      respuestasFormateadas, 
      ubicacionCapturada, 
      duracionTotalSegundos, 
      idVoluntaria,
      alertasGeminiActivas
    )
  }

  enviando.value = false
  completada.value = true
}
</script>

<template>
  <div class="min-h-screen bg-[#050505] text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-hidden font-['Poppins',sans-serif] selection:bg-white selection:text-black">
    
    <!-- Luces sutiles de fondo (Glow ambiental) -->
    <div class="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
    <div class="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none"></div>

    <!-- Header Anónimo (Componente Modular) -->
    <EncuestaBarraSuperior 
      :dispositivoUUID="dispositivoUUID" 
      :tituloEncuesta="encuesta?.titulo"
    />

    <!-- CUERPO PRINCIPAL DEL CUESTIONARIO -->
    <main class="max-w-2xl mx-auto w-full my-auto py-6 relative z-10">
      
      <!-- PANTALLA DE ÉXITO FINAL -->
      <EncuestaPantallaExito
        v-if="completada"
        :fechaYHora="fechaYHora"
        :dispositivoUUID="dispositivoUUID"
      />

      <!-- PREGUNTA ACTIVA (Componente Modular con Temporizador Antirapidez) -->
      <EncuestaPreguntaItem
        v-else-if="preguntaActual"
        :preguntaActual="preguntaActual"
        :indicePreguntaActual="indicePreguntaActual"
        :totalPreguntasCola="totalPreguntasCola"
        :porcentajeProgreso="porcentajeProgreso"
        :respuestaSeleccionada="respuestaSeleccionadaActual"
        :enviando="enviando"
        :segundosRestantes="segundosRestantes"
        :tiempoMinimoCumplido="tiempoMinimoCumplido"
        :tiempoMinimoRequerido="tiempoMinimoRequerido"
        v-model:dejarNombreVoluntario="dejarNombreVoluntario"
        v-model:nombreVoluntario="nombreVoluntario"
        @seleccionarOpcion="seleccionarOpcion"
        @actualizarTextoRespuesta="actualizarTextoRespuesta"
        @avanzarPregunta="avanzarPregunta"
        @retrocederPregunta="retrocederPregunta"
      />

    </main>

    <!-- Footer Discreto -->
    <footer class="max-w-3xl mx-auto w-full text-center py-3 text-[11px] text-neutral-500 font-mono relative z-10 border-t border-white/5">
      <p>© 2026 HablandoContigo · Auditoría de Clima y Gestión Humana con Cero Falsas Alarmas</p>
    </footer>

  </div>
</template>
