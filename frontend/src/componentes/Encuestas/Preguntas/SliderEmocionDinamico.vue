<!--
  ============================================================================
  SLIDER DE EMOCIÓN DINÁMICO POR PUNTAJE (SliderEmocionDinamico.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Control deslizante interactivo de emociones donde la emoción y color dependen
  directamente del PUNTAJE DE LA OPCIÓN (valor 1-5 pts) o su color configurado:
  - 1 Pt (o menor puntaje): 😡 Enojado (Rojo #ef4444)
  - 2 Pts: 😠 Molesto (Naranja #f97316)
  - 3 Pts: 😐 Serio (Ámbar / Amarillo #f59e0b)
  - 4 Pts: 🙂 Satisfecho (Verde Claro #22c55e)
  - 5 Pts (o mayor puntaje): 😊 Feliz (Verde Mayor #10b981)
  
  Siempre muestra TODAS las opciones de respuesta de la pregunta con su color progresivo.
-->

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { OpcionPregunta } from '@/ia'

const props = withDefaults(
  defineProps<{
    opciones?: OpcionPregunta[]
    respuestaSeleccionada?: any
  }>(),
  {
    opciones: () => []
  }
)

const emit = defineEmits<{
  (e: 'seleccionar', opcion: OpcionPregunta): void
}>()

/**
 * Opciones ordenadas por puntaje (valor) de menor a mayor (1 pt -> 5 pts)
 */
const opcionesOrdenadas = computed(() => {
  if (!props.opciones || props.opciones.length === 0) return []
  return [...props.opciones].sort((a, b) => {
    const vA = typeof a.valor === 'number' ? a.valor : 0
    const vB = typeof b.valor === 'number' ? b.valor : 0
    return vA - vB
  })
})

const totalNiveles = computed(() => {
  if (opcionesOrdenadas.value.length > 0) {
    return opcionesOrdenadas.value.length
  }
  return 5
})

const valorSlider = ref<number>(1)

const indiceActual = computed(() => {
  return Math.min(totalNiveles.value - 1, Math.max(0, valorSlider.value - 1))
})

const opcionActual = computed<OpcionPregunta | null>(() => {
  if (opcionesOrdenadas.value.length > 0) {
    return opcionesOrdenadas.value[indiceActual.value] || opcionesOrdenadas.value[0] || null
  }
  return null
})

const ratioProgreso = computed(() => {
  if (totalNiveles.value <= 1) return 0.5
  return indiceActual.value / (totalNiveles.value - 1)
})

const obtenerColorOpcion = (opc: OpcionPregunta | null | undefined, idx: number, total: number): string => {
  if (opc?.color && opc.color.trim().length > 0) return opc.color
  const r = total > 1 ? idx / (total - 1) : 0.5
  const val = typeof opc?.valor === 'number' ? opc.valor : Math.round(1 + r * 4)
  if (val <= 1 || r <= 0.2) return '#ef4444' // Rojo menor puntaje
  if (val === 2 || r <= 0.4) return '#f97316' // Naranja
  if (val === 3 || r <= 0.6) return '#f59e0b' // Ámbar / Amarillo
  if (val === 4 || r <= 0.8) return '#22c55e' // Verde claro
  return '#10b981' // Verde mayor
}

const obtenerEmojiOpcion = (opc: OpcionPregunta | null | undefined, idx: number, total: number): string => {
  const r = total > 1 ? idx / (total - 1) : 0.5
  const val = typeof opc?.valor === 'number' ? opc.valor : Math.round(1 + r * 4)
  if (val <= 1 || r <= 0.2) return '😡'
  if (val === 2 || r <= 0.4) return '😠'
  if (val === 3 || r <= 0.6) return '😐'
  if (val === 4 || r <= 0.8) return '🙂'
  return '😊'
}

/**
 * Emoción y color calculados directamente según el puntaje (valor 1 a 5) de la opción
 */
const estadoActual = computed(() => {
  const opc = opcionActual.value
  const total = totalNiveles.value
  const idx = indiceActual.value
  const r = ratioProgreso.value
  const val = typeof opc?.valor === 'number' ? opc.valor : Math.round(1 + r * 4)
  const colorHex = obtenerColorOpcion(opc, idx, total)

  if (val <= 1 || r <= 0.2) {
    return {
      emoji: '😡',
      etiquetaEmo: 'Enojado / Incómodo',
      subtextoDefault: 'Crítico / Menor Puntaje',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      colorGradiente: 'from-rose-600 via-red-500 to-rose-700',
      colorTrack: colorHex
    }
  } else if (val === 2 || r <= 0.4) {
    return {
      emoji: '😠',
      etiquetaEmo: 'Molesto / Poco a gusto',
      subtextoDefault: 'Insatisfecho / Puntaje Bajo',
      badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
      colorGradiente: 'from-orange-500 via-amber-500 to-orange-600',
      colorTrack: colorHex
    }
  } else if (val === 3 || r <= 0.6) {
    return {
      emoji: '😐',
      etiquetaEmo: 'Serio / Neutral',
      subtextoDefault: 'Regular / Puntaje Medio',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      colorGradiente: 'from-amber-500 via-yellow-500 to-amber-600',
      colorTrack: colorHex
    }
  } else if (val === 4 || r <= 0.8) {
    return {
      emoji: '🙂',
      etiquetaEmo: 'Satisfecho / De acuerdo',
      subtextoDefault: 'Favorable / Buen Puntaje',
      badgeColor: 'bg-green-500/20 text-green-300 border-green-500/40',
      colorGradiente: 'from-green-500 via-emerald-500 to-teal-500',
      colorTrack: colorHex
    }
  } else {
    return {
      emoji: '😊',
      etiquetaEmo: 'Feliz / Muy a gusto',
      subtextoDefault: 'Excelente / Mayor Puntaje',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      colorGradiente: 'from-emerald-500 via-teal-500 to-green-500',
      colorTrack: colorHex
    }
  }
})

// Sincronizar respuesta seleccionada
watch(
  () => [props.respuestaSeleccionada, opcionesOrdenadas.value],
  () => {
    const ops = opcionesOrdenadas.value
    if (!ops || ops.length === 0) return
    if (props.respuestaSeleccionada) {
      const txt = typeof props.respuestaSeleccionada === 'object'
        ? (props.respuestaSeleccionada.texto || '')
        : String(props.respuestaSeleccionada)
      const idx = ops.findIndex(
        o => o.texto?.toLowerCase().trim() === txt.toLowerCase().trim() || o.id === txt
      )
      if (idx >= 0) {
        valorSlider.value = idx + 1
        return
      }
    }
    const centro = Math.ceil(ops.length / 2)
    valorSlider.value = Math.max(1, Math.min(ops.length, centro))
  },
  { immediate: true }
)

const notificarSeleccion = (nivel: number) => {
  const n = Math.max(1, Math.min(totalNiveles.value, nivel))
  valorSlider.value = n
  const idx = n - 1

  let opcTarget: OpcionPregunta | undefined = undefined
  if (opcionesOrdenadas.value.length > 0) {
    opcTarget = opcionesOrdenadas.value[idx] || opcionesOrdenadas.value[0]
  }

  if (!opcTarget) {
    const est = estadoActual.value
    opcTarget = {
      id: `opc-emocion-${n}`,
      texto: est.etiquetaEmo,
      valor: n,
      color: est.colorTrack
    }
  }

  emit('seleccionar', opcTarget)
}

const alCambiarSlider = (e: Event) => {
  const n = Number((e.target as HTMLInputElement).value)
  notificarSeleccion(n)
}

const porcentajeProgreso = computed(() => {
  return ratioProgreso.value * 100
})
</script>

<template>
  <div class="p-6 rounded-3xl bg-slate-900 border border-slate-700/60 shadow-2xl space-y-6 text-center font-['Poppins',sans-serif]">
    
    <!-- AVATAR / EMOJI DINÁMICO REACCIONANDO AL SLIDER -->
    <div class="flex flex-col items-center justify-center space-y-3">
      <div class="relative flex items-center justify-center group">
        <div
          class="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center text-5xl sm:text-6xl shadow-2xl border-4 border-white/20 transition-all duration-500"
          :style="{ backgroundColor: estadoActual.colorTrack }"
        >
          <span class="drop-shadow-lg transform transition-transform duration-300 group-hover:scale-110 select-none">
            {{ estadoActual.emoji }}
          </span>
        </div>
      </div>

      <div class="space-y-1 max-w-md mx-auto">
        <!-- Título principal de la opción marcada -->
        <h3 class="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
          {{ opcionActual ? opcionActual.texto : estadoActual.etiquetaEmo }}
        </h3>
      </div>
    </div>

    <!-- CONTROL DESLIZABLE INTERACTIVO (MENOR PUNTAJE = ROJO ➔ MAYOR PUNTAJE = VERDE, SIN NADA DEBAJO DE LA LÍNEA) -->
    <div class="px-1 max-w-2xl mx-auto">
      <div class="relative flex items-center">
        <input
          type="range"
          min="1"
          :max="totalNiveles"
          step="1"
          :value="valorSlider"
          @input="alCambiarSlider"
          class="w-full h-3.5 rounded-lg appearance-none cursor-pointer bg-slate-800 transition-all"
          :style="{
            background: `linear-gradient(to right, #ef4444 0%, ${estadoActual.colorTrack} ${porcentajeProgreso}%, #334155 ${porcentajeProgreso}%, #334155 100%)`
          }"
        />
      </div>
    </div>

  </div>
</template>
