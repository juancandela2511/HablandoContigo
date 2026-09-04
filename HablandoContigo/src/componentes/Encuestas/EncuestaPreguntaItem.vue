<!--
  ============================================================================
  COMPONENTE INTERFAZ DE PREGUNTA ADAPTATIVA (EncuestaPreguntaItem.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Orquesta la interacción de respuesta de la pregunta activa del colaborador:
  - Temporizador inteligente de lectura reflexiva (evita responder impulsivamente).
  - TarjetaContenedor: Contenedor con marcas de visor en las esquinas HUD.
  - Subcomponentes especializados por tipo de pregunta:
      * PreguntaEscalaNumerica (Likert 1-5)
      * PreguntaOpcionMultiple (Bien, Regular, Mal, etc.)
      * PreguntaTextoAbierto (Subpreguntas condicionales y campos libres)
      * IdentificacionVoluntaria (Checkbox y nombre voluntario)
  - BotonBase: Navegación estándar Anterior / Siguiente / Finalizar bloqueada hasta
    cumplir el tiempo mínimo reglamentario de lectura.
-->

<script setup lang="ts">
import { computed } from 'vue'
import type { PreguntaEncuesta, OpcionPregunta } from '@/Servicios/iaEncuestasService'
import { BotonBase, TarjetaContenedor, InsigniaPill } from '@/componentes/ElementosBase'
import {
  HeartHandshake,
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  AlertTriangle,
  Clock,
  CheckCircle2
} from 'lucide-vue-next'

import PreguntaEscalaNumerica from './Preguntas/PreguntaEscalaNumerica.vue'
import PreguntaOpcionMultiple from './Preguntas/PreguntaOpcionMultiple.vue'
import PreguntaTextoAbierto from './Preguntas/PreguntaTextoAbierto.vue'
import IdentificacionVoluntaria from './Preguntas/IdentificacionVoluntaria.vue'

const props = withDefaults(
  defineProps<{
    preguntaActual: PreguntaEncuesta
    indicePreguntaActual: number
    totalPreguntasCola: number
    porcentajeProgreso: number
    respuestaSeleccionada: any
    enviando: boolean
    dejarNombreVoluntario?: boolean
    nombreVoluntario?: string
    segundosRestantes?: number
    tiempoMinimoCumplido?: boolean
    tiempoMinimoRequerido?: number
  }>(),
  {
    segundosRestantes: 0,
    tiempoMinimoCumplido: true,
    tiempoMinimoRequerido: 4
  }
)

const emit = defineEmits<{
  (e: 'seleccionarOpcion', opcion: OpcionPregunta): void
  (e: 'actualizarTextoRespuesta', valor: string): void
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
    <!-- 1. Encabezado: Barra de Progreso y Metadatos con Temporizador Antirapidez -->
    <div class="space-y-3 border-b border-slate-200/80 dark:border-white/10 pb-4">
      <div class="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 font-mono">
        <div class="flex items-center gap-2 flex-wrap">
          <InsigniaPill variante="info" tamano="sm">
            <template #icono>
              <Sparkles class="w-3 h-3 text-sky-500" />
            </template>
            {{ preguntaActual.categoria }}
          </InsigniaPill>

          <InsigniaPill v-if="preguntaActual.esCondicional" variante="alerta" tamano="sm">
            ⚡ Bifurcación Activa
          </InsigniaPill>

          <!-- Temporizador Visual Antirapidez (Evita responder porque sí) -->
          <InsigniaPill v-if="!tiempoMinimoCumplido" variante="alerta" tamano="sm">
            <template #icono>
              <Clock class="w-3 h-3 text-amber-500 animate-pulse" />
            </template>
            <span>{{ preguntaActual.tipo === 'texto' ? 'Redacción reflexiva' : 'Lectura reflexiva' }}: {{ segundosRestantes }}s</span>
          </InsigniaPill>
          <InsigniaPill v-else variante="exito" tamano="sm">
            <template #icono>
              <CheckCircle2 class="w-3 h-3 text-emerald-500" />
            </template>
            <span>Tiempo mínimo cumplido</span>
          </InsigniaPill>
        </div>
        <span>Paso {{ indicePreguntaActual + 1 }} de {{ totalPreguntasCola }} ({{ porcentajeProgreso }}%)</span>
      </div>

      <!-- Barra de Progreso -->
      <div class="w-full h-1.5 rounded-full bg-slate-200 dark:bg-neutral-900 overflow-hidden relative">
        <div 
          class="h-full bg-gradient-to-r from-sky-400 via-white to-sky-300 transition-all duration-300 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.4)]"
          :style="{ width: `${porcentajeProgreso}%` }"
        ></div>
      </div>
    </div>

    <!-- 2. Banners Condicionales Inteligentes -->
    <div 
      v-if="preguntaActual.id === 'p-jefe-subpregunta-falencias' || preguntaActual.esCondicional"
      class="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/40 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3 animate-fadeIn"
    >
      <div class="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
        <AlertTriangle class="w-4 h-4" />
      </div>
      <div class="space-y-0.5">
        <strong class="text-slate-900 dark:text-white text-xs block">Pregunta de Profundización Obligatoria Activada:</strong>
        <p class="text-slate-700 dark:text-neutral-300 text-[11px] leading-relaxed">
          Esta sub-pregunta se desplegó de inmediato tras tu respuesta sobre la relación con tu jefatura. Tus comentarios son 100% confidenciales.
        </p>
      </div>
    </div>

    <div 
      v-else-if="preguntaActual.id.startsWith('p-deep-') || preguntaActual.id.startsWith('deep-')" 
      class="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-900 dark:text-rose-200 text-xs flex items-start gap-3 animate-fadeIn"
    >
      <HeartHandshake class="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
      <div>
        <strong class="text-slate-900 dark:text-white text-xs block">Espacio Protegido de Bienestar:</strong>
        <p class="text-slate-700 dark:text-neutral-300 text-[11px] leading-relaxed">
          Tu tranquilidad es absoluta prioridad. Esta pregunta se activó para brindar acompañamiento sin revelar tu identidad.
        </p>
      </div>
    </div>

    <!-- 3. Enunciado de la Pregunta -->
    <div class="space-y-1.5 pt-1">
      <h3 class="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
        {{ preguntaActual.texto }}
      </h3>
      <p v-if="preguntaActual.tipo === 'texto'" class="text-xs text-slate-500 dark:text-neutral-400">
        Escribe con sinceridad. Este campo abierto permite registrar tus observaciones exactas (mínimo 8 segundos de redacción reflexiva).
      </p>
    </div>

    <!-- 4. Controles de Respuesta según Tipo -->
    <PreguntaEscalaNumerica
      v-if="esPreguntaEscala"
      :opciones="preguntaActual.opciones"
      :respuestaSeleccionada="respuestaSeleccionada"
      @seleccionar="$emit('seleccionarOpcion', $event)"
    />

    <PreguntaOpcionMultiple
      v-else-if="preguntaActual.tipo !== 'texto'"
      :opciones="preguntaActual.opciones"
      :respuestaSeleccionada="respuestaSeleccionada"
      @seleccionar="$emit('seleccionarOpcion', $event)"
    />

    <PreguntaTextoAbierto
      v-else
      :valor="typeof respuestaSeleccionada === 'string' ? respuestaSeleccionada : ''"
      :sugerencias="sugerenciasRapidasJefe"
      @actualizar="$emit('actualizarTextoRespuesta', $event)"
    />

    <!-- 5. Identificación Voluntaria al final -->
    <IdentificacionVoluntaria
      v-if="indicePreguntaActual === totalPreguntasCola - 1"
      :dejarNombreVoluntario="dejarNombreVoluntario"
      :nombreVoluntario="nombreVoluntario"
      @update:dejarNombreVoluntario="$emit('update:dejarNombreVoluntario', $event)"
      @update:nombreVoluntario="$emit('update:nombreVoluntario', $event)"
    />

    <!-- 6. Botones de Navegación con Bloqueo Temporal por Pregunta -->
    <div class="space-y-3 pt-4 border-t border-slate-200/80 dark:border-white/10">
      <div class="flex items-center justify-between">
        <BotonBase
          variante="esquema"
          tamano="mediano"
          :deshabilitado="indicePreguntaActual === 0"
          @click="$emit('retrocederPregunta')"
        >
          <template #iconoIzquierdo>
            <ArrowLeft class="w-4 h-4" />
          </template>
          <span>Anterior</span>
        </BotonBase>

        <BotonBase
          v-if="indicePreguntaActual < totalPreguntasCola - 1"
          variante="primario"
          tamano="mediano"
          :deshabilitado="!respuestaSeleccionada || !tiempoMinimoCumplido"
          @click="$emit('avanzarPregunta')"
        >
          <span>{{ !tiempoMinimoCumplido ? `Siguiente (${segundosRestantes}s)` : 'Siguiente' }}</span>
          <template #iconoDerecho>
            <ArrowRight class="w-4 h-4" />
          </template>
        </BotonBase>

        <BotonBase
          v-else
          variante="primario"
          tamano="mediano"
          :cargando="enviando"
          textoCarga="Finalizando evaluación..."
          :deshabilitado="!respuestaSeleccionada || !tiempoMinimoCumplido"
          @click="$emit('avanzarPregunta')"
        >
          <template #iconoIzquierdo>
            <Check class="w-4 h-4" />
          </template>
          <span>{{ !tiempoMinimoCumplido ? `Finalizar (${segundosRestantes}s)` : 'Finalizar y Evaluar' }}</span>
        </BotonBase>
      </div>

      <!-- Aviso sutil de lectura cuando faltan segundos para avanzar -->
      <div 
        v-if="!tiempoMinimoCumplido" 
        class="text-[11px] text-amber-600 dark:text-amber-400/90 font-mono text-center flex items-center justify-center gap-1.5 animate-pulse"
      >
        <Clock class="w-3.5 h-3.5 shrink-0" />
        <span>Lectura reflexiva: espera <b>{{ segundosRestantes }}s</b> antes de avanzar para evitar respuestas apresuradas.</span>
      </div>
    </div>
  </TarjetaContenedor>
</template>
