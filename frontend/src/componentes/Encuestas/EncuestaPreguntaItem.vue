<!--
  ============================================================================
  COMPONENTE INTERFAZ DE PREGUNTA ADAPTATIVA (EncuestaPreguntaItem.vue)
  ============================================================================
  Orquesta la interacción de respuesta de la pregunta activa delegando en
  subcomponentes modulares de navegación, temporizadores y profundización.
-->

<script setup lang="ts">
import { computed } from 'vue'
import type { PreguntaEncuesta, OpcionPregunta } from '@/ia'
import { TarjetaContenedor } from '@/componentes/ElementosBase'

import PreguntaEscalaNumerica from './Preguntas/PreguntaEscalaNumerica.vue'
import PreguntaOpcionMultiple from './Preguntas/PreguntaOpcionMultiple.vue'
import PreguntaTextoAbierto from './Preguntas/PreguntaTextoAbierto.vue'

import EncuestaPreguntaProfundizacion from './Subcomponentes/EncuestaPreguntaProfundizacion.vue'
import EncuestaProgresoNavegacion from './Subcomponentes/EncuestaProgresoNavegacion.vue'

const props = withDefaults(
  defineProps<{
    preguntaActual: PreguntaEncuesta
    indicePreguntaActual: number
    totalPreguntasCola: number
    porcentajeProgreso: number
    respuestaSeleccionada: any
    enviando: boolean
    textoRespuestaAnclada?: string
    dejarNombreVoluntario?: boolean
    nombreVoluntario?: string
    segundosRestantes?: number
    tiempoMinimoCumplido?: boolean
    tiempoMinimoRequerido?: number
  }>(),
  {
    textoRespuestaAnclada: '',
    segundosRestantes: 0,
    tiempoMinimoCumplido: true,
    tiempoMinimoRequerido: 4
  }
)

const emit = defineEmits<{
  (e: 'seleccionarOpcion', opcion: OpcionPregunta): void
  (e: 'actualizarTextoRespuesta', valor: string): void
  (e: 'actualizarRespuestaAnclada', valor: string): void
  (e: 'update:dejarNombreVoluntario', valor: boolean): void
  (e: 'update:nombreVoluntario', valor: string): void
  (e: 'avanzarPregunta'): void
  (e: 'retrocederPregunta'): void
}>()

const esPreguntaEscala = computed(() => {
  if (
    props.preguntaActual.modoPresentacion &&
    props.preguntaActual.modoPresentacion !== 'click'
  ) {
    return false
  }
  if (props.preguntaActual.tipo === 'escala') return true
  const opciones = props.preguntaActual.opciones || []
  return opciones.length === 5 && opciones.some(o => o.valor === 1) && opciones.some(o => o.valor === 5)
})

// Opción de comentarios configurada en la pregunta
const comentariosHabilitados = computed(() => {
  const p = props.preguntaActual as any
  if (!p) return false
  if (p.comentariosHabilitados === false || p.deteccionQuejas === false || p.solicitarPorQueSiNegativo === false) {
    return false
  }
  return Boolean(
    p.comentariosHabilitados ||
    p.deteccionQuejas ||
    p.solicitarPorQueSiNegativo
  )
})

// Dará la opción de comentar si se selecciona una opción negativa / de alerta o de menor puntaje
const esOpcionDeMenorPuntaje = computed(() => {
  if (!props.respuestaSeleccionada) return false

  const resp = props.respuestaSeleccionada
  const val = typeof resp === 'object' && resp !== null ? resp.valor : resp
  const valNum = Number(val)
  const texto = typeof resp === 'object' && resp !== null ? resp.texto : String(resp ?? '')

  if (typeof resp === 'object' && resp !== null && (resp.esAlerta || resp.esNegativa)) {
    return true
  }

  // 1. Escala (1 a 5) -> puntajes bajos (1 o 2) habilitan el comentario
  if (esPreguntaEscala.value) {
    return valNum <= 2
  }

  // 2. Opciones de selección -> comparar con el menor valor numérico
  const opciones = props.preguntaActual.opciones || []
  if (opciones.length > 0) {
    let minValor = Infinity
    opciones.forEach(o => {
      const num = Number(o.valor)
      if (!isNaN(num) && num < minValor) {
        minValor = num
      }
    })

    if (minValor !== Infinity && !isNaN(valNum) && valNum === minValor) {
      return true
    }

    // Si coincide con la opción que tiene el menor valor o esAlerta
    const opcSel = opciones.find(o => o.texto === texto || (typeof resp === 'object' && o.id === resp.id))
    if (opcSel) {
      const opcNum = Number(opcSel.valor)
      if (!isNaN(opcNum) && opcNum === minValor) return true
      if (opcSel.esAlerta || (opcSel as any).esNegativa) return true
    }
  }

  return false
})

const debeMostrarCampoComentarios = computed(() => {
  return comentariosHabilitados.value && esOpcionDeMenorPuntaje.value
})

const puedeAvanzar = computed(() => {
  if (!props.tiempoMinimoCumplido) return false
  if (!props.respuestaSeleccionada && props.preguntaActual.tipo !== 'texto') return false
  return true
})

const sugerenciasRapidasJefe = [
  'Falta de claridad en metas',
  'Trato distante o poco empático',
  'Sobrecarga en horarios pico',
  'Poco reconocimiento al esfuerzo',
  'Excelente apoyo en el día a día'
]
</script>

<template>
  <TarjetaContenedor :mostrarVisores="true" relleno="normal" class="space-y-6 text-left">
    <EncuestaProgresoNavegacion
      :categoria="preguntaActual.categoria"
      :indicePreguntaActual="indicePreguntaActual"
      :totalPreguntasCola="totalPreguntasCola"
      :porcentajeProgreso="porcentajeProgreso"
      :segundosRestantes="segundosRestantes"
      :tiempoMinimoCumplido="tiempoMinimoCumplido"
      :esUltimaPregunta="indicePreguntaActual === totalPreguntasCola - 1"
      :puedeAvanzar="puedeAvanzar"
      :enviando="enviando"
      :esPreguntaTexto="preguntaActual.tipo === 'texto'"
      @avanzar="emit('avanzarPregunta')"
      @retroceder="emit('retrocederPregunta')"
    >
      <!-- Enunciado de la Pregunta -->
      <div class="space-y-1.5 pt-1">
        <h3 class="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
          {{ preguntaActual.texto }}
        </h3>
        <p v-if="preguntaActual.tipo === 'texto'" class="text-xs text-slate-500 dark:text-neutral-400">
          Escribe con sinceridad. Este campo abierto permite registrar tus observaciones exactas.
        </p>
      </div>

      <!-- Controles de Respuesta -->
      <PreguntaEscalaNumerica
        v-if="esPreguntaEscala"
        :opciones="preguntaActual.opciones"
        :respuestaSeleccionada="respuestaSeleccionada"
        @seleccionar="emit('seleccionarOpcion', $event)"
      />

      <PreguntaOpcionMultiple
        v-else-if="preguntaActual.tipo !== 'texto'"
        :opciones="preguntaActual.opciones"
        :modoPresentacion="preguntaActual.modoPresentacion"
        :maxAnos="preguntaActual.maxAnos"
        :maxMeses="(preguntaActual as any).maxMeses"
        :imagenRompecabezas="preguntaActual.imagenRompecabezas"
        :respuestaSeleccionada="respuestaSeleccionada"
        :segundosRestantes="segundosRestantes"
        :tiempoMinimoCumplido="tiempoMinimoCumplido"
        @seleccionar="emit('seleccionarOpcion', $event)"
        @avanzarAuto="!debeMostrarCampoComentarios && emit('avanzarPregunta')"
      />

      <PreguntaTextoAbierto
        v-else
        :valor="typeof respuestaSeleccionada === 'string' ? respuestaSeleccionada : ''"
        :sugerencias="sugerenciasRapidasJefe"
        @actualizar="emit('actualizarTextoRespuesta', $event)"
      />

      <!-- Subcomponente Comentarios (Solo si opción comentarios está activa y seleccionó menor puntaje: ¿Qué pasó?) -->
      <EncuestaPreguntaProfundizacion
        :mostrar="debeMostrarCampoComentarios"
        :textoRespuestaAnclada="textoRespuestaAnclada"
        @actualizarRespuestaAnclada="emit('actualizarRespuestaAnclada', $event)"
      />

      <!-- Identificación Voluntaria al final -->
      <IdentificacionVoluntaria
        v-if="indicePreguntaActual === totalPreguntasCola - 1"
        :dejarNombreVoluntario="dejarNombreVoluntario"
        :nombreVoluntario="nombreVoluntario"
        @update:dejarNombreVoluntario="emit('update:dejarNombreVoluntario', $event)"
        @update:nombreVoluntario="emit('update:nombreVoluntario', $event)"
      />
    </EncuestaProgresoNavegacion>
  </TarjetaContenedor>
</template>
