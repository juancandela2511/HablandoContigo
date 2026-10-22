<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { useEncuestas, type Encuesta, type RespuestaItem } from '@/Almacenes/useEncuestas'
import { useLegal } from '@/Almacenes/useLegal'
import { obtenerODefinirDispositivoUUID, obtenerFechaYHoraActual, obtenerUbicacionExactaDispositivo, iniciarCapturaUbicacion } from '@/services/deviceService'
import { evaluarRespuestasConGeminiEstricto, type OpcionPregunta } from '@/ia'

// Subcomponentes y Composables modulares de esta vista
import { useInactividad } from './useInactividad'
import { useCronometroPregunta } from './useCronometroPregunta'
import { useBifurcacionesCola } from './useBifurcacionesCola'
import BannerModoPrueba from './BannerModoPrueba.vue'
import FooterConfidencial from './FooterConfidencial.vue'

import EncuestaBarraSuperior from '@/componentes/Encuestas/EncuestaBarraSuperior.vue'
import EncuestaPreguntaItem from '@/componentes/Encuestas/EncuestaPreguntaItem.vue'
import EncuestaPantallaExito from '@/componentes/Encuestas/EncuestaPantallaExito.vue'
import EncuestaControlInactividad from '@/componentes/Encuestas/Subcomponentes/EncuestaControlInactividad.vue'
import { PantallaConsentimientoEncuesta } from '@/componentes/Legal'

const ruta = useRoute()
const router = useRouter()
const { encuestas, registrarRespuestaAnonima, obtenerEncuestaPorId, cargarEncuestasDesdeLocal } = useEncuestas()
const { registrarConsentimientoEncuesta } = useLegal()

const esModoPrueba = computed(() => ruta.query.modoPrueba === 'true')
const idEncuesta = computed(() => (ruta.params.id as string) || 'enc-001')
const encuesta = ref<Encuesta | null>(null)
const dispositivoUUID = ref('')
const fechaYHora = ref({ fecha: '', hora: '' })
const consentimientoOtorgado = ref(false)
const completada = ref(false)
const enviando = ref(false)
const dejarNombreVoluntario = ref(false)
const nombreVoluntario = ref('')

const { segundosSinActividad, inactividadModalAbierto, registrarActividad, reiniciarTimer: reiniciarTimerInactividad, reanudar } = useInactividad()
const { tiempoInicioGlobal, segundosTranscurridos, reiniciarCronometro, calcularTiempoMinimoRequerido, registrarDuracion } = useCronometroPregunta()
const { colaPreguntas, indicePreguntaActual, respuestasUsuario, respuestasAncladas, preguntaActual, totalPreguntasCola, porcentajeProgreso, evaluarCondicionales, procesarSeleccionOpcion } = useBifurcacionesCola()

const tiempoMinimoRequerido = computed(() => calcularTiempoMinimoRequerido(preguntaActual.value))
const respuestaSeleccionadaActual = computed(() => preguntaActual.value ? respuestasUsuario.value[preguntaActual.value.id] : null)
const segundosRestantes = computed(() => Math.max(0, tiempoMinimoRequerido.value - segundosTranscurridos.value))

// Bloqueos de salida para integridad de respuestas
onBeforeRouteLeave(() => {
  if (!completada.value && !esModoPrueba.value) {
    alert('⚠️ La encuesta está en progreso. Debes completarla para garantizar la confidencialidad.')
    return false
  }
  return true
})

const manejarConsentimiento = () => {
  consentimientoOtorgado.value = true
  registrarConsentimientoEncuesta(dispositivoUUID.value, idEncuesta.value)
  reiniciarCronometro()
  reiniciarTimerInactividad(true)
}

const seleccionarOpcion = (opc: OpcionPregunta) => procesarSeleccionOpcion(opc, encuesta.value)
const actualizarTexto = (t: string) => { if (preguntaActual.value) { respuestasUsuario.value[preguntaActual.value.id] = t; evaluarCondicionales(preguntaActual.value.id, t, encuesta.value?.preguntas || []) } }
const actualizarAnclada = (t: string) => { if (preguntaActual.value) respuestasAncladas.value[preguntaActual.value.id] = t }

const avanzar = () => {
  if (!respuestaSeleccionadaActual.value && preguntaActual.value?.tipo !== 'texto') {
    return alert('Por favor selecciona una respuesta para continuar.')
  }
  if (preguntaActual.value) registrarDuracion(preguntaActual.value.id, tiempoMinimoRequerido.value)

  if (indicePreguntaActual.value < totalPreguntasCola.value - 1) {
    indicePreguntaActual.value++
    reiniciarCronometro()
  } else {
    finalizar()
  }
}

const retroceder = () => {
  if (indicePreguntaActual.value > 0) {
    indicePreguntaActual.value--
    reiniciarCronometro()
  }
}

const finalizar = async () => {
  enviando.value = true
  if (preguntaActual.value) registrarDuracion(preguntaActual.value.id, tiempoMinimoRequerido.value)
  const duracionTotal = Math.max(1, Math.round((Date.now() - tiempoInicioGlobal.value) / 1000))
  let ubicacion = undefined
  try { ubicacion = await obtenerUbicacionExactaDispositivo() } catch {}

  if (encuesta.value) {
    const respuestasFormateadas: RespuestaItem[] = Object.keys(respuestasUsuario.value).map(pregId => {
      const preg = colaPreguntas.value.find(p => p.id === pregId)
      const respVal = respuestasUsuario.value[pregId]
      return {
        idPregunta: pregId,
        textoPregunta: preg?.texto || '',
        categoria: preg?.categoria || 'General',
        respuesta: typeof respVal === 'object' ? respVal.texto : respVal,
        valor: typeof respVal === 'object' ? respVal.valor : undefined,
        esAlerta: typeof respVal === 'object' ? respVal.esAlerta : false,
        tipoAlertaId: typeof respVal === 'object' ? respVal.tipoAlertaId : undefined,
        nombreAlerta: typeof respVal === 'object' ? respVal.nombreAlerta : undefined,
        severidadAlerta: typeof respVal === 'object' ? respVal.severidadAlerta : undefined,
        comentario: respuestasAncladas.value[pregId] || undefined
      }
    })

    const idVoluntaria = (dejarNombreVoluntario.value && nombreVoluntario.value.trim()) ? nombreVoluntario.value.trim() : undefined
    const evalIA = await evaluarRespuestasConGeminiEstricto({ idEncuesta: encuesta.value.id, respuestas: respuestasFormateadas })
    await registrarRespuestaAnonima(encuesta.value.id, respuestasFormateadas, ubicacion, duracionTotal, idVoluntaria, evalIA?.alertas || [])
  }
  enviando.value = false
  completada.value = true
}

onMounted(async () => {
  await cargarEncuestasDesdeLocal(true)
  dispositivoUUID.value = obtenerODefinirDispositivoUUID()
  fechaYHora.value = obtenerFechaYHoraActual()
  iniciarCapturaUbicacion()

  const enc = obtenerEncuestaPorId(idEncuesta.value) || encuestas.value[0]
  if (enc) {
    encuesta.value = enc
    colaPreguntas.value = enc.preguntas.filter(p => !p.esCondicional)
  }

  ['mousemove', 'keydown', 'touchstart', 'scroll'].forEach(ev => window.addEventListener(ev, registrarActividad))
})

onUnmounted(() => {
  ['mousemove', 'keydown', 'touchstart', 'scroll'].forEach(ev => window.removeEventListener(ev, registrarActividad))
})
</script>

<template>
  <div class="min-h-screen bg-[#050505] text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-hidden font-['Poppins',sans-serif]">
    <div class="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
    <div class="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none"></div>

    <BannerModoPrueba :activo="esModoPrueba" @salir="router.push('/proyectos')" />
    <EncuestaBarraSuperior :dispositivoUUID="dispositivoUUID" :tituloEncuesta="encuesta?.titulo" />

    <main class="max-w-2xl mx-auto w-full my-auto py-6 relative z-10">
      <EncuestaPantallaExito v-if="completada" :fechaYHora="fechaYHora" :dispositivoUUID="dispositivoUUID" />
      <PantallaConsentimientoEncuesta v-else-if="!consentimientoOtorgado" :tituloEncuesta="encuesta?.titulo || 'Evaluación de Clima'" :departamento="encuesta?.departamento" @consentimientoOtorgado="manejarConsentimiento" />
      <EncuestaPreguntaItem
        v-else-if="preguntaActual"
        :preguntaActual="preguntaActual"
        :indicePreguntaActual="indicePreguntaActual"
        :totalPreguntasCola="totalPreguntasCola"
        :porcentajeProgreso="porcentajeProgreso"
        :respuestaSeleccionada="respuestaSeleccionadaActual"
        :textoRespuestaAnclada="respuestasAncladas[preguntaActual.id] || ''"
        :enviando="enviando"
        :segundosRestantes="segundosRestantes"
        :tiempoMinimoCumplido="true"
        :tiempoMinimoRequerido="tiempoMinimoRequerido"
        v-model:dejarNombreVoluntario="dejarNombreVoluntario"
        v-model:nombreVoluntario="nombreVoluntario"
        @seleccionarOpcion="seleccionarOpcion"
        @actualizarTextoRespuesta="actualizarTexto"
        @actualizarRespuestaAnclada="actualizarAnclada"
        @avanzarPregunta="avanzar"
        @retrocederPregunta="retroceder"
      />
    </main>

    <FooterConfidencial />
    <EncuestaControlInactividad :modalAbierto="inactividadModalAbierto" :segundosSinActividad="segundosSinActividad" @reanudar="reanudar" />
  </div>
</template>
