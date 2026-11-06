<!--
  ============================================================================
  SLIDER DE EMOCIÓN DINÁMICO POR PUNTAJE ULTRA FLUIDO (SliderEmocionDinamico.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Control deslizante continuo y ultrasuave (60/120 fps) donde la emoción, el gradiente
  de la línea y el avatar reaccionan en tiempo real sin saltos tiesos ni trabas:
  - 1 Pt (menor puntaje): 😡 Enojado / Muy Mal (Rojo #ef4444)
  - 2 Pts: 😠 Molesto / Mal (Naranja #f97316)
  - 3 Pts: 😐 Serio / Neutral (Ámbar #f59e0b)
  - 4 Pts: 🙂 Satisfecho / Bien (Azul Cielo #38bdf8)
  - 5 Pts (mayor puntaje): 😊 Feliz / Excelente (Azul Intenso #2563eb)
-->

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { resolverColorExactoOpcion, type OpcionPregunta } from '@/ia'

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
  const lista = props.opciones || []
  if (lista.length === 0) return []
  return [...lista].sort((a, b) => {
    const vA = typeof a.valor === 'number' ? a.valor : 0
    const vB = typeof b.valor === 'number' ? b.valor : 0
    return vA - vB
  })
})

const totalNiveles = computed(() => {
  return Math.max(1, opcionesOrdenadas.value.length || 5)
})

// Progreso continuo de 0 a 100 para máxima fluidez de movimiento
const progresoContinuo = ref<number>(50)

// Índice discreto actual correspondiente a la opción más cercana
const indiceActual = computed(() => {
  const total = totalNiveles.value
  if (total <= 1) return 0
  const ratio = Math.max(0, Math.min(1, progresoContinuo.value / 100))
  return Math.min(total - 1, Math.max(0, Math.round(ratio * (total - 1))))
})

const opcionActual = computed<OpcionPregunta | null>(() => {
  const ops = opcionesOrdenadas.value
  if (ops.length > 0) {
    return ops[indiceActual.value] || ops[0] || null
  }
  return null
})

/**
 * Interpolación continua de color RGB para que la barra cambie con total suavidad
 * Rojo (#ef4444) -> Naranja (#f97316) -> Ámbar (#f59e0b) -> Azul Cielo (#38bdf8) -> Azul Intenso (#2563eb)
 */
const colorFluido = computed(() => {
  const t = Math.max(0, Math.min(1, progresoContinuo.value / 100))
  const paradas = [
    { t: 0.00, r: 239, g: 68, b: 68 },   // #ef4444 (Rojo)
    { t: 0.25, r: 249, g: 115, b: 22 },  // #f97316 (Naranja)
    { t: 0.50, r: 245, g: 158, b: 11 },  // #f59e0b (Ámbar)
    { t: 0.75, r: 56, g: 189, b: 248 },  // #38bdf8 (Azul Cielo)
    { t: 1.00, r: 37, g: 99, b: 235 }   // #2563eb (Azul Intenso)
  ]
  let i = 0
  while (i < paradas.length - 1 && t > paradas[i + 1].t) {
    i++
  }
  const p1 = paradas[i]
  const p2 = paradas[Math.min(i + 1, paradas.length - 1)]
  const span = p2.t - p1.t || 1
  const f = (t - p1.t) / span
  const r = Math.round(p1.r + (p2.r - p1.r) * f)
  const g = Math.round(p1.g + (p2.g - p1.g) * f)
  const b = Math.round(p1.b + (p2.b - p1.b) * f)
  return `rgb(${r}, ${g}, ${b})`
})

/**
 * Emoción y color calculados directamente según la posición continua y la opción
 */
const estadoActual = computed(() => {
  const r = progresoContinuo.value / 100

  if (r <= 0.2) {
    return {
      emoji: '😡',
      etiquetaEmo: 'Enojado / Incómodo',
      subtextoDefault: 'Crítico / Menor Puntaje',
      colorTrack: colorFluido.value
    }
  } else if (r <= 0.4) {
    return {
      emoji: '😠',
      etiquetaEmo: 'Molesto / Poco a gusto',
      subtextoDefault: 'Insatisfecho / Puntaje Bajo',
      colorTrack: colorFluido.value
    }
  } else if (r <= 0.6) {
    return {
      emoji: '😐',
      etiquetaEmo: 'Serio / Neutral',
      subtextoDefault: 'Regular / Puntaje Medio',
      colorTrack: colorFluido.value
    }
  } else if (r <= 0.8) {
    return {
      emoji: '🙂',
      etiquetaEmo: 'Satisfecho / De acuerdo',
      subtextoDefault: 'Favorable / Buen Puntaje',
      colorTrack: colorFluido.value
    }
  } else {
    return {
      emoji: '😊',
      etiquetaEmo: 'Feliz / Muy a gusto',
      subtextoDefault: 'Excelente / Mayor Puntaje',
      colorTrack: colorFluido.value
    }
  }
})

// Sincronizar respuesta seleccionada externa
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
        const total = ops.length
        progresoContinuo.value = total > 1 ? (idx / (total - 1)) * 100 : 50
        return
      }
    }
    // Si no hay respuesta previa, ubicar en el punto medio suave
    progresoContinuo.value = 50
  },
  { immediate: true }
)

const notificarSeleccion = (idx: number) => {
  const ops = opcionesOrdenadas.value
  let opcTarget: OpcionPregunta | undefined = undefined

  if (ops.length > 0) {
    opcTarget = ops[idx] || ops[0]
  }

  if (!opcTarget) {
    const est = estadoActual.value
    opcTarget = {
      id: `opc-emocion-${idx + 1}`,
      texto: est.etiquetaEmo,
      valor: idx + 1,
      color: est.colorTrack
    }
  }

  emit('seleccionar', opcTarget)
}

const alMoverSlider = (e: Event) => {
  const val = Number((e.target as HTMLInputElement).value)
  progresoContinuo.value = val
  const total = totalNiveles.value
  const ratio = Math.max(0, Math.min(1, val / 100))
  const idx = Math.min(total - 1, Math.max(0, Math.round(ratio * (total - 1))))
  notificarSeleccion(idx)
}

const saltarANivel = (idx: number) => {
  const total = totalNiveles.value
  if (total <= 1) return
  progresoContinuo.value = (idx / (total - 1)) * 100
  notificarSeleccion(idx)
}
</script>

<template>
  <div class="p-6 sm:p-7 rounded-3xl bg-slate-900 border border-slate-700/60 shadow-2xl space-y-6 text-center font-['Poppins',sans-serif]">
    
    <!-- AVATAR / EMOJI ULTRA FLUIDO CON REACCIÓN DINÁMICA DE COLOR Y ESCALA -->
    <div class="flex flex-col items-center justify-center space-y-3">
      <div class="relative flex items-center justify-center group">
        <div
          class="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center text-5xl sm:text-6xl shadow-2xl border-4 border-white/20 transition-colors duration-150 ease-out"
          :style="{
            backgroundColor: colorFluido,
            boxShadow: `0 0 35px ${colorFluido}66, 0 10px 25px rgba(0,0,0,0.5)`
          }"
        >
          <span
            class="drop-shadow-lg select-none transition-transform duration-200 ease-out"
            :style="{ transform: `scale(${1 + (progresoContinuo / 600)})` }"
          >
            {{ estadoActual.emoji }}
          </span>
        </div>
      </div>

      <div class="space-y-1 max-w-lg mx-auto">
        <!-- Título principal de la opción marcada sin cortes -->
        <h3 class="text-lg sm:text-2xl font-black text-white tracking-tight leading-snug whitespace-normal break-words">
          {{ opcionActual ? opcionActual.texto : estadoActual.etiquetaEmo }}
        </h3>
        <p class="text-xs text-slate-400 font-medium">
          Arrastra suavemente la línea para graduar tu nivel de bienestar
        </p>
      </div>
    </div>

    <!-- CONTROL DESLIZABLE INTERACTIVO CONTINUO (ROJO -> AZUL) -->
    <div class="px-2 max-w-2xl mx-auto space-y-2">
      <div class="relative flex items-center py-2">
        <input
          type="range"
          min="0"
          max="100"
          step="0.1"
          :value="progresoContinuo"
          @input="alMoverSlider"
          class="slider-emocion-fluido w-full h-4 rounded-full appearance-none bg-slate-950/80 cursor-grab active:cursor-grabbing border border-slate-700/60 shadow-inner outline-none"
          :style="{
            background: `linear-gradient(to right, #ef4444 0%, ${colorFluido} ${progresoContinuo}%, #1e293b ${progresoContinuo}%, #1e293b 100%)`
          }"
        />
      </div>

      <!-- MARCADORES DE PASO INTERACTIVOS PULSABLES -->
      <div class="flex items-center justify-between px-1 select-none">
        <button
          v-for="(opc, idx) in opcionesOrdenadas"
          :key="opc.id || idx"
          type="button"
          @click="saltarANivel(idx)"
          class="flex flex-col items-center gap-1 group cursor-pointer transition-transform hover:scale-110 active:scale-95"
          :title="opc.texto"
        >
          <span
            class="w-3 h-3 rounded-full border border-slate-700 transition-all duration-200"
            :class="indiceActual === idx ? 'scale-125 ring-2 ring-white/60 shadow-md' : 'opacity-60 group-hover:opacity-100'"
            :style="{ backgroundColor: resolverColorExactoOpcion(opc, idx, opcionesOrdenadas.length) }"
          />
          <span
            class="text-[10px] font-mono font-bold transition-colors"
            :class="indiceActual === idx ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'"
          >
            {{ idx + 1 }}
          </span>
        </button>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* Estilo del Thumb / Manecilla del slider para máxima fluidez y ergonomía táctil */
.slider-emocion-fluido::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #ffffff;
  border: 3px solid #0f172a;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5), 0 0 12px rgba(56, 189, 248, 0.7);
  cursor: grab;
  transition: transform 0.12s ease-out, box-shadow 0.12s ease-out;
}

.slider-emocion-fluido:active::-webkit-slider-thumb {
  cursor: grabbing;
  transform: scale(1.22);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6), 0 0 20px rgba(37, 99, 235, 0.9);
}

.slider-emocion-fluido::-moz-range-thumb {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #ffffff;
  border: 3px solid #0f172a;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5), 0 0 12px rgba(56, 189, 248, 0.7);
  cursor: grab;
  transition: transform 0.12s ease-out, box-shadow 0.12s ease-out;
}

.slider-emocion-fluido:active::-moz-range-thumb {
  cursor: grabbing;
  transform: scale(1.22);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6), 0 0 20px rgba(37, 99, 235, 0.9);
}
</style>
