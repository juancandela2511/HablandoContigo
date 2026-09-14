<!--
  ============================================================================
  COMPONENTE INTERFAZ DE PREGUNTA ADAPTATIVA (EncuestaPreguntaItem.vue)
  ============================================================================
  Orquesta la interacción de respuesta de la pregunta activa delegando en
  subcomponentes modulares de navegación, temporizadores y profundización.
-->

<script setup lang="ts">
import { computed } from 'vue'
import type { PreguntaEncuesta, OpcionPregunta } from '@/Servicios/iaEncuestasService'
import { TarjetaContenedor } from '@/componentes/ElementosBase'
import { AlertTriangle, HeartHandshake } from 'lucide-vue-next'

import PreguntaEscalaNumerica from './Preguntas/PreguntaEscalaNumerica.vue'
import PreguntaOpcionMultiple from './Preguntas/PreguntaOpcionMultiple.vue'
import PreguntaTextoAbierto from './Preguntas/PreguntaTextoAbierto.vue'
import IdentificacionVoluntaria from './Preguntas/IdentificacionVoluntaria.vue'
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
  if (props.preguntaActual.tipo === 'escala') return true
  const opciones = props.preguntaActual.opciones || []
  return opciones.length === 5 && opciones.some(o => o.valor === 1) && opciones.some(o => o.valor === 5)
})

const preguntaAncladaActiva = computed(() => {
  if (!props.respuestaSeleccionada) return null
  const textoSel = typeof props.respuestaSeleccionada === 'object' 
    ? (props.respuestaSeleccionada.texto || '') 
    : String(props.respuestaSeleccionada)

  const textoNorm = textoSel.trim().toLowerCase()

  // 1. Si la opción seleccionada tiene una preguntaAnclada explícita
  const opc = props.preguntaActual.opciones?.find(o => (o.texto || '').trim().toLowerCase() === textoNorm)
  if (opc?.preguntaAnclada) {
    return opc.preguntaAnclada
  }

  // 1.5. Si la pregunta tiene "Profundizar en el Tema" / Pregunta Interactiva activada (deteccionQuejas / solicitarPorQueSiNegativo)
  if (props.preguntaActual.deteccionQuejas || props.preguntaActual.solicitarPorQueSiNegativo) {
    let valorSel: number | null = null
    if (typeof props.respuestaSeleccionada === 'number') {
      valorSel = props.respuestaSeleccionada
    } else if (typeof props.respuestaSeleccionada === 'object' && typeof props.respuestaSeleccionada?.valor === 'number') {
      valorSel = props.respuestaSeleccionada.valor
    }

    const opcSel = props.preguntaActual.opciones?.find(o => {
      const txtOpc = (o.texto || '').trim().toLowerCase()
      if (txtOpc === textoNorm) return true
      if (valorSel !== null && o.valor === valorSel) return true
      return false
    })

    let esNegativa = false
    if (opcSel) {
      esNegativa = Boolean(opcSel.esAlerta || opcSel.valor <= 3)
    }
    if (!esNegativa && valorSel !== null) {
      esNegativa = valorSel <= 3
    }
    if (!esNegativa) {
      esNegativa = Boolean(
        textoNorm === '1' || textoNorm === '2' || textoNorm === '3' ||
        textoNorm === '1 pt' || textoNorm === '2 pts' || textoNorm === '3 pts' ||
        textoNorm === 'no' || textoNorm.startsWith('no') ||
        textoNorm === 'regular' || textoNorm === 'mal' || textoNorm === 'malo' || textoNorm === 'muy mal' ||
        textoNorm.includes('desacuerdo') || textoNorm.includes('pésimo') || textoNorm.includes('pesimo')
      )
    }

    if (esNegativa) {
      return {
        id: `profundizar-${props.preguntaActual.id}`,
        texto: '¿Te gustaría profundizar en el tema o compartir más detalles sobre tu respuesta? Tu opinión es 100% anónima, confidencial y libre de represalias:',
        tipo: 'texto' as const,
        placeholder: 'Escribe aquí si deseas profundizar o dar un ejemplo con total libertad y confidencialidad...',
        obligatoria: true
      }
    }
  }

  // 2. Si la pregunta general tiene preguntaAnclada configurada
  if (props.preguntaActual.preguntaAnclada) {
    const opc = props.preguntaActual.opciones?.find(o => (o.texto || '').trim().toLowerCase() === textoNorm)
    const esTrigger = Boolean(
      opc?.esAlerta || textoNorm === 'no' || textoNorm.startsWith('no') || textoNorm.startsWith('sí (') ||
      textoNorm === 'otro' || textoNorm.includes('desacuerdo') || (opc && opc.valor <= 2)
    )
    if (esTrigger) {
      return props.preguntaActual.preguntaAnclada
    }
  }

  return null
})

const puedeAvanzar = computed(() => {
  if (!props.tiempoMinimoCumplido) return false
  if (!props.respuestaSeleccionada && props.preguntaActual.tipo !== 'texto') return false
  if (preguntaAncladaActiva.value?.obligatoria && (!props.textoRespuestaAnclada || props.textoRespuestaAnclada.trim().length < 2)) {
    return false
  }
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
        :respuestaSeleccionada="respuestaSeleccionada"
        @seleccionar="emit('seleccionarOpcion', $event)"
      />

      <PreguntaTextoAbierto
        v-else
        :valor="typeof respuestaSeleccionada === 'string' ? respuestaSeleccionada : ''"
        :sugerencias="sugerenciasRapidasJefe"
        @actualizar="emit('actualizarTextoRespuesta', $event)"
      />

      <!-- Sub-Pregunta de Profundización Desglosada -->
      <EncuestaPreguntaProfundizacion
        :preguntaAnclada="preguntaAncladaActiva"
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
