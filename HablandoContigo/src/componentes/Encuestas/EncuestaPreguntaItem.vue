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

  // 2. Si la pregunta general tiene preguntaAnclada configurada
  if (props.preguntaActual.preguntaAnclada) {
    const esTrigger = Boolean(
      opc?.esAlerta || 
      textoNorm === 'no' || 
      textoNorm.startsWith('no') || 
      textoNorm.startsWith('sí (') ||
      textoNorm === 'otro' ||
      textoNorm.includes('desacuerdo') ||
      (opc && opc.valor <= 2)
    )
    if (esTrigger) {
      return props.preguntaActual.preguntaAnclada
    }
  }

  // 3. Bifurcaciones interactivas predeterminadas
  if (props.preguntaActual.id === 'b3-p12-conflictos' && (textoNorm.startsWith('sí') || textoNorm.startsWith('si'))) {
    return {
      id: 'b3-p12b-conflictos-detalle',
      texto: '¿Qué te ocurrió y por qué se dio el conflicto? Cuéntanos con total confidencialidad:',
      tipo: 'texto' as const,
      placeholder: 'Describe brevemente la situación presentada y cómo afectó tu bienestar...',
      obligatoria: true
    }
  }

  if (props.preguntaActual.id === 'b1-p2-area' && textoNorm === 'otro') {
    return {
      id: 'b1-p2b-otro-area',
      texto: '¿A qué área o departamento perteneces? (Especifique):',
      tipo: 'texto' as const,
      placeholder: 'Escribe el nombre de tu departamento...',
      obligatoria: true
    }
  }

  if ((props.preguntaActual.id === 'b6-p33-estudia' || props.preguntaActual.id === 'b6-p27-estudia') && (textoNorm === 'sí' || textoNorm === 'si')) {
    return {
      id: 'b6-p33b-que-estudia',
      texto: '¿Qué área o programa de estudios te encuentras cursando actualmente?:',
      tipo: 'texto' as const,
      placeholder: 'Ej: Ingeniería, Psicología, Técnico en Sistemas...',
      obligatoria: true
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

    <!-- 4.5 Sub-Pregunta de Profundización Anclada con Desglose Animado -->
    <Transition
      enter-active-class="transition-all duration-400 ease-out"
      enter-from-class="opacity-0 -translate-y-3 max-h-0 scale-95"
      enter-to-class="opacity-100 translate-y-0 max-h-[500px] scale-100"
      leave-active-class="transition-all duration-250 ease-in"
      leave-from-class="opacity-100 translate-y-0 max-h-[500px] scale-100"
      leave-to-class="opacity-0 -translate-y-3 max-h-0 scale-95"
    >
      <div
        v-if="preguntaAncladaActiva"
        class="overflow-hidden pt-2"
      >
        <div class="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-sky-500/10 via-indigo-500/10 to-transparent border-2 border-sky-500/40 shadow-xl shadow-sky-500/5 space-y-3 relative">
          <!-- Indicador decorativo -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-lg bg-sky-500 text-slate-950 flex items-center justify-center text-xs font-black shadow-sm animate-pulse">
                ⚡
              </span>
              <span class="text-xs font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400 font-mono">
                Pregunta de Profundización Desglosada
              </span>
            </div>
            <span
              :class="[
                'text-[10px] font-bold px-2.5 py-0.5 rounded-full border font-mono',
                preguntaAncladaActiva.obligatoria
                  ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800'
                  : 'bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800'
              ]"
            >
              {{ preguntaAncladaActiva.obligatoria ? 'Campo Requerido' : 'Opcional' }}
            </span>
          </div>

          <div class="space-y-1">
            <h4 class="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-snug">
              {{ preguntaAncladaActiva.texto }}
            </h4>
            <p class="text-[11px] text-slate-500 dark:text-neutral-400">
              Esta pregunta se activó de inmediato para profundizar en tu respuesta anterior. Tu comentario es 100% anónimo.
            </p>
          </div>

          <div class="relative">
            <textarea
              :value="textoRespuestaAnclada"
              @input="$emit('actualizarRespuestaAnclada', ($event.target as HTMLTextAreaElement).value)"
              rows="3"
              class="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-950 border border-sky-300 dark:border-sky-500/40 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 resize-none transition-all shadow-inner"
              :placeholder="preguntaAncladaActiva.placeholder || '¿Por qué? Cuéntanos qué te ocurrió o cuál es el motivo...'"
            />
          </div>
        </div>
      </div>
    </Transition>

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
          :deshabilitado="!puedeAvanzar"
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
          :deshabilitado="!puedeAvanzar"
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
