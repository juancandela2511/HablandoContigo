<!--
  ============================================================================
  PREGUNTA DE OPCIÓN MÚLTIPLE CON SENTIMIENTO Y ROMPECABEZAS (PreguntaOpcionMultiple.vue)
  ============================================================================
-->

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { Check, CheckCircle2, Puzzle, Sparkles, GripVertical, SlidersHorizontal, Frown, Meh, Smile, Gamepad2, RotateCcw } from 'lucide-vue-next'
import type { OpcionPregunta } from '@/ia'
import SliderAntiguedadDinamico from './SliderAntiguedadDinamico.vue'
import SliderEmocionDinamico from './SliderEmocionDinamico.vue'
import SemaforoInteractivo from './SemaforoInteractivo.vue'
import TermometroInteractivo from './TermometroInteractivo.vue'
import PalancaSiNo from './PalancaSiNo.vue'

const props = defineProps<{
  opciones?: OpcionPregunta[]
  modoPresentacion?: 'click' | 'rompecabezas' | 'deslizador_emocional' | 'deslizador_tiempo' | 'juego_gusanito' | 'semaforo' | 'termometro' | 'palanca_sino'
  respuestaSeleccionada: any
  imagenRompecabezas?: string
  imagen?: string
  segundosRestantes?: number
  tiempoMinimoCumplido?: boolean
  maxAnos?: number
  maxMeses?: number
}>()

const emit = defineEmits<{
  (e: 'seleccionar', opcion: OpcionPregunta): void
  (e: 'avanzarAuto'): void
}>()

const draggingOption = ref<OpcionPregunta | null>(null)
const isHoveringSlot = ref<boolean>(false)
const animandoExcelente = ref<boolean>(false)
const ranuraFaltanteIndex = ref<number>(4)

watch(
  () => props.opciones,
  () => {
    const rand = Math.floor(Math.random() * 9)
    ranuraFaltanteIndex.value = rand
  },
  { immediate: true }
)

const textoRespuestaSeleccionada = computed(() => {
  if (!props.respuestaSeleccionada) return ''
  return typeof props.respuestaSeleccionada === 'object'
    ? props.respuestaSeleccionada.texto
    : String(props.respuestaSeleccionada)
})

const cambiarRespuesta = () => {
  emit('seleccionar', null as any)
  if (props.modoPresentacion === 'juego_gusanito') {
    snake.value = [
      { x: 3, y: 3 },
      { x: 2, y: 3 },
      { x: 1, y: 3 }
    ]
    snakeDir.value = 'RIGHT'
    iniciarJuegoGusanito()
  }
}

const obtenerBgPositionTile = (idx: number) => {
  const col = idx % 3
  const row = Math.floor(idx / 3)
  const posX = col === 0 ? '0%' : col === 1 ? '50%' : '100%'
  const posY = row === 0 ? '0%' : row === 1 ? '50%' : '100%'
  return `${posX} ${posY}`
}

const opcionesOrdenadasPorValor = computed(() => {
  if (!props.opciones || props.opciones.length === 0) return []
  return [...props.opciones].sort((a, b) => {
    const vA = a.valor !== undefined ? a.valor : 0
    const vB = b.valor !== undefined ? b.valor : 0
    return vA - vB
  })
})

const indiceSlider = ref<number>(0)

watch(
  () => [props.respuestaSeleccionada, opcionesOrdenadasPorValor.value],
  () => {
    const ops = opcionesOrdenadasPorValor.value
    if (!ops || ops.length === 0) return
    if (!props.respuestaSeleccionada) {
      indiceSlider.value = Math.floor((ops.length - 1) / 2)
      return
    }
    const txt = typeof props.respuestaSeleccionada === 'object' ? props.respuestaSeleccionada.texto : String(props.respuestaSeleccionada)
    const idx = ops.findIndex(o => o.texto === txt)
    if (idx !== -1) {
      indiceSlider.value = idx
    }
  },
  { immediate: true }
)

const porcentajeSlider = computed(() => {
  const ops = opcionesOrdenadasPorValor.value
  if (!ops || ops.length <= 1) return 0.5
  return indiceSlider.value / (ops.length - 1)
})

const opcionSliderActual = computed(() => {
  const ops = opcionesOrdenadasPorValor.value
  if (!ops || ops.length === 0) return null
  return ops[indiceSlider.value] || ops[0]
})

const alCambiarAntiguedadSlider = (payload: {
  totalMeses: number
  textoFormateado: string
  etapa: string
  emoji: string
  riesgo: 'Alto' | 'Moderado' | 'Bajo'
}) => {
  const ops = props.opciones || []
  let opcSeleccionada: OpcionPregunta | undefined

  if (ops.length > 0) {
    if (payload.totalMeses < 6) {
      opcSeleccionada = ops.find(o => o.texto.toLowerCase().includes('menos de 6') || o.texto.toLowerCase().includes('0-6') || o.valor === 1) || ops[0]
    } else if (payload.totalMeses < 12) {
      opcSeleccionada = ops.find(o => o.texto.toLowerCase().includes('6 meses') || o.texto.toLowerCase().includes('6m-1a') || o.valor === 2) || ops[1] || ops[0]
    } else if (payload.totalMeses <= 36) {
      opcSeleccionada = ops.find(o => o.texto.toLowerCase().includes('1 a 3') || o.texto.toLowerCase().includes('1-3') || o.valor === 3) || ops[2] || ops[1] || ops[0]
    } else {
      opcSeleccionada = ops.find(o => o.texto.toLowerCase().includes('más de 3') || o.texto.toLowerCase().includes('mas de 3') || o.texto.toLowerCase().includes('+3') || o.valor === 4 || o.valor === 5) || ops[ops.length - 1]
    }
  }

  const textoEncasillado = payload.totalMeses > 36
    ? (opcSeleccionada?.texto || 'Más de 3 años')
    : (opcSeleccionada ? opcSeleccionada.texto : payload.textoFormateado)

  const respuestaObjeto: OpcionPregunta & { comentario?: string } = {
    id: opcSeleccionada ? opcSeleccionada.id : `antiguedad-${payload.totalMeses}m`,
    texto: textoEncasillado,
    valor: payload.totalMeses > 36 ? (opcSeleccionada?.valor ?? 4) : (opcSeleccionada?.valor ?? (payload.riesgo === 'Alto' ? 1 : 3)),
    esAlerta: opcSeleccionada?.esAlerta ?? (payload.riesgo === 'Alto'),
    comentario: payload.textoFormateado
  }

  emit('seleccionar', respuestaObjeto as OpcionPregunta)
}

// Color del Graduador de Felicidad según puntaje (1 Pt Enojado -> 5 Pts Muy Feliz en Tonalidades Cálidas/Amarillas)
const colorEmocionalDinamico = computed(() => {
  const p = porcentajeSlider.value
  if (p <= 0.2) return '#ef4444' // Rojo (Enojado / 1 Pt)
  if (p <= 0.4) return '#f97316' // Naranja (Descontento / 2 Pts)
  if (p <= 0.6) return '#f59e0b' // Ámbar (Neutral / 3 Pts)
  if (p <= 0.8) return '#eab308' // Amarillo Dorado (Feliz / 4 Pts)
  return '#facc15'              // Amarillo Sol Brillante (Muy Feliz / 5 Pts)
})

const idGradienteEmocional = computed(() => {
  const p = porcentajeSlider.value
  if (p <= 0.2) return 'url(#faceGradRed)'
  if (p <= 0.4) return 'url(#faceGradOrange)'
  if (p <= 0.6) return 'url(#faceGradYellow)'
  if (p <= 0.8) return 'url(#faceGradGold)'
  return 'url(#faceGradBrightYellow)'
})

const etiquetaEmocional = computed(() => {
  const p = porcentajeSlider.value
  const opc = opcionSliderActual.value
  const ptsText = opc?.valor !== undefined ? ` (${opc.valor} Pts)` : ''
  if (p <= 0.2) return `Muy Bajo / Enojado 😠${ptsText}`
  if (p <= 0.4) return `Bajo / Descontento 😟${ptsText}`
  if (p <= 0.6) return `Neutral / Aceptable 😐${ptsText}`
  if (p <= 0.8) return `Bueno / Feliz 🙂${ptsText}`
  return `Excelente / Muy Feliz 😄${ptsText}`
})

const yBocaMouth = computed(() => {
  const p = porcentajeSlider.value
  return Math.round(24 + p * 28)
})

const moverSliderAIndice = (idx: number) => {
  const ops = opcionesOrdenadasPorValor.value
  const opt = ops[idx]
  if (opt) {
    indiceSlider.value = idx
    emit('seleccionar', opt)
  }
}

const handleSliderInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  const idx = parseInt(target.value, 10)
  const ops = opcionesOrdenadasPorValor.value
  if (!isNaN(idx) && ops && ops[idx]) {
    indiceSlider.value = idx
    emit('seleccionar', ops[idx])
  }
}

const ultimaImagenResuelta = ref<string>('')

const resolverImagenDeOpcion = (refOpc: any): string => {
  if (!refOpc) return ''

  let opcObjeto: OpcionPregunta | null = null

  if (typeof refOpc === 'object') {
    opcObjeto = refOpc
  } else if (typeof refOpc === 'string' && props.opciones) {
    opcObjeto = props.opciones.find(o => o.texto === refOpc || o.id === refOpc) || null
  }

  if (opcObjeto) {
    if (opcObjeto.imagen) return opcObjeto.imagen
    if (opcObjeto.imagenRompecabezas) return opcObjeto.imagenRompecabezas
  }

  if (props.imagenRompecabezas) return props.imagenRompecabezas
  if (props.imagen) return props.imagen

  return ''
}

const urlImagenPuzzle = computed(() => {
  if (draggingOption.value) {
    const img = resolverImagenDeOpcion(draggingOption.value)
    if (img) ultimaImagenResuelta.value = img
    return img
  }

  if (props.respuestaSeleccionada) {
    const img = resolverImagenDeOpcion(props.respuestaSeleccionada)
    if (img) return img
    if (ultimaImagenResuelta.value) return ultimaImagenResuelta.value
  }

  return ''
})

const opcionesDisponiblesPuzzle = computed(() => {
  if (!props.opciones) return []
  if (!props.respuestaSeleccionada) return props.opciones
  const txtSel = typeof props.respuestaSeleccionada === 'object' ? props.respuestaSeleccionada.texto : String(props.respuestaSeleccionada)
  return props.opciones.filter(opc => opc.texto !== txtSel)
})

const opcionesIzquierda = computed(() => {
  const mitad = Math.ceil(opcionesDisponiblesPuzzle.value.length / 2)
  return opcionesDisponiblesPuzzle.value.slice(0, mitad)
})

const opcionesDerecha = computed(() => {
  const mitad = Math.ceil(opcionesDisponiblesPuzzle.value.length / 2)
  return opcionesDisponiblesPuzzle.value.slice(mitad)
})

const obtenerHexSentimiento = (opcion: OpcionPregunta) => {
  if (!opcion) return '#10b981'
  if (opcion.color && opcion.color.trim().length > 0) return opcion.color
  const ops = opcionesOrdenadasPorValor.value
  if (ops.length > 1) {
    const idx = ops.findIndex(o => o.id === opcion.id || o.texto === opcion.texto)
    if (idx !== -1) {
      const r = idx / (ops.length - 1)
      if (r <= 0.2) return '#ef4444' // Rojo menor puntaje
      if (r <= 0.4) return '#f97316' // Naranja
      if (r <= 0.6) return '#f59e0b' // Ámbar / Amarillo
      if (r <= 0.8) return '#22c55e' // Verde claro
      return '#10b981'               // Verde mayor puntaje
    }
  }
  if (opcion.valor === 1 || opcion.esAlerta) return '#ef4444'
  if (opcion.valor === 2) return '#f97316'
  if (opcion.valor === 3) return '#f59e0b'
  if (opcion.valor === 4) return '#22c55e'
  if (opcion.valor && opcion.valor >= 5) return '#10b981'
  return '#10b981'
}

const getPuzzlePiecePathFull = (idx: number) => {
  const row = Math.floor(idx / 3)
  const col = idx % 3

  let path = 'M 0 0 '

  // Top edge (socket que entra por arriba)
  if (row > 0) {
    path += 'L 35 0 C 37 18, 63 18, 65 0 '
  }
  path += 'L 100 0 '

  // Right edge (pestaña que sobresale a la derecha)
  if (col < 2) {
    path += 'L 100 35 C 118 37, 118 63, 100 65 '
  }
  path += 'L 100 100 '

  // Bottom edge (pestaña que sobresale hacia abajo)
  if (row < 2) {
    path += 'L 65 100 C 63 118, 37 118, 35 100 '
  }
  path += 'L 0 100 '

  // Left edge (socket que entra por la izquierda)
  if (col > 0) {
    path += 'L 0 65 C 18 63, 18 37, 0 35 '
  }
  path += 'L 0 0 Z'

  return path
}

const getPuzzleTileTransform = (idx: number) => {
  const row = Math.floor(idx / 3)
  const col = idx % 3
  if (props.respuestaSeleccionada) {
    return 'translate(0px, 0px)'
  }
  if (isHoveringSlot.value) {
    const dx = (col - 1) * 2
    const dy = (row - 1) * 2
    return `translate(${dx}px, ${dy}px)`
  }
  const dx = (col - 1) * 4
  const dy = (row - 1) * 4
  return `translate(${dx}px, ${dy}px)`
}

const seleccionarOpcion = (opc: OpcionPregunta) => {
  if (opc) {
    const img = resolverImagenDeOpcion(opc)
    if (img) ultimaImagenResuelta.value = img
  }
  emit('seleccionar', opc)
  if (props.modoPresentacion === 'rompecabezas') {
    const faltanteMs = (props.segundosRestantes || 0) * 1000
    const tiempoTotalEspera = Math.max(1600, faltanteMs + 400)

    setTimeout(() => {
      emit('avanzarAuto')
    }, tiempoTotalEspera)
  } else if (props.modoPresentacion === 'juego_gusanito') {
    pausarJuegoGusanito()
    setTimeout(() => {
      emit('avanzarAuto')
    }, 1500)
  } else {
    animandoExcelente.value = true
    setTimeout(() => {
      animandoExcelente.value = false
    }, 1800)
  }
}

const handleDragStart = (opc: OpcionPregunta, e: DragEvent) => {
  draggingOption.value = opc
  if (opc) {
    const img = resolverImagenDeOpcion(opc)
    if (img) ultimaImagenResuelta.value = img
  }
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('application/json', JSON.stringify(opc))
    e.dataTransfer.setData('text/plain', opc.id || opc.texto)
  }
}

const handleDragEnd = () => {
  draggingOption.value = null
  isHoveringSlot.value = false
}

const handleDragEnter = (e: DragEvent) => {
  e.preventDefault()
  isHoveringSlot.value = true
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'move'
  }
  isHoveringSlot.value = true
}

const handleDragLeave = (e: DragEvent) => {
  const currentTarget = e.currentTarget as HTMLElement | null
  const relatedTarget = e.relatedTarget as HTMLElement | null
  if (currentTarget && relatedTarget && currentTarget.contains(relatedTarget)) {
    return
  }
  isHoveringSlot.value = false
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isHoveringSlot.value = false

  let opcDropped: OpcionPregunta | null = draggingOption.value

  if (!opcDropped && e.dataTransfer) {
    const jsonStr = e.dataTransfer.getData('application/json')
    if (jsonStr) {
      try {
        opcDropped = JSON.parse(jsonStr)
      } catch (err) {
        console.warn('Error parseando dataTransfer JSON:', err)
      }
    }
    if (!opcDropped) {
      const txt = e.dataTransfer.getData('text/plain')
      if (txt && props.opciones) {
        opcDropped = props.opciones.find(o => o.id === txt || o.texto === txt) || null
      }
    }
  }

  if (opcDropped) {
    seleccionarOpcion(opcDropped)
  }
  draggingOption.value = null
}

// ============================================================================
// LÓGICA JUEGO DEL GUSANITO (SNAKE ARCADE GAME)
// ============================================================================
const GRID_COLS = 12
const GRID_ROWS = 8

const snake = ref<{ x: number; y: number }[]>([
  { x: 3, y: 4 },
  { x: 2, y: 4 },
  { x: 1, y: 4 }
])
const snakeDir = ref<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('RIGHT')
const gameInterval = ref<any>(null)
const juegoIniciado = ref<boolean>(false)

// Distribuir las respuestas como manzanas en coordenadas fijas de la cuadrícula
const manzanasRespuestas = computed(() => {
  const ops = props.opciones || []
  const coords = [
    { x: 9, y: 1 },
    { x: 10, y: 6 },
    { x: 2, y: 6 },
    { x: 1, y: 1 },
    { x: 6, y: 7 },
    { x: 6, y: 0 }
  ]
  return ops.map((opc, i) => {
    const c = coords[i % coords.length] || { x: 0, y: 0 }
    return {
      opcion: opc,
      x: c.x,
      y: c.y
    }
  })
})

const cambiarDireccionGusanito = (nuevaDir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
  const dirActual = snakeDir.value
  if (nuevaDir === 'UP' && dirActual !== 'DOWN') snakeDir.value = 'UP'
  if (nuevaDir === 'DOWN' && dirActual !== 'UP') snakeDir.value = 'DOWN'
  if (nuevaDir === 'LEFT' && dirActual !== 'RIGHT') snakeDir.value = 'LEFT'
  if (nuevaDir === 'RIGHT' && dirActual !== 'LEFT') snakeDir.value = 'RIGHT'

  if (!juegoIniciado.value) {
    iniciarJuegoGusanito()
  }
}

const moverGusanitoStep = () => {
  if (!snake.value || snake.value.length === 0) return
  const first = snake.value[0]
  if (!first) return
  const head = { x: first.x, y: first.y }

  if (snakeDir.value === 'UP') head.y -= 1
  if (snakeDir.value === 'DOWN') head.y += 1
  if (snakeDir.value === 'LEFT') head.x -= 1
  if (snakeDir.value === 'RIGHT') head.x += 1

  // Si choca con la pared, se queda quieto en la pared hasta que cambie de dirección
  if (head.x < 0 || head.x >= GRID_COLS || head.y < 0 || head.y >= GRID_ROWS) {
    return
  }

  // Comprobar si comió una manzana de respuesta
  const manzanaComida = manzanasRespuestas.value.find(m => m.x === head.x && m.y === head.y)

  if (manzanaComida) {
    seleccionarOpcion(manzanaComida.opcion)
    pausarJuegoGusanito()
    return
  }

  // Avanzar el cuerpo del gusanito
  snake.value.unshift(head)
  snake.value.pop()
}

const iniciarJuegoGusanito = () => {
  if (gameInterval.value) clearInterval(gameInterval.value)
  juegoIniciado.value = true
  gameInterval.value = setInterval(moverGusanitoStep, 260)
}

const pausarJuegoGusanito = () => {
  if (gameInterval.value) {
    clearInterval(gameInterval.value)
    gameInterval.value = null
  }
  juegoIniciado.value = false
}

const handleKeyDownSnake = (e: KeyboardEvent) => {
  if (props.modoPresentacion !== 'juego_gusanito') return
  if (['ArrowUp', 'KeyW', 'w', 'W'].includes(e.key)) {
    e.preventDefault()
    cambiarDireccionGusanito('UP')
  } else if (['ArrowDown', 'KeyS', 's', 'S'].includes(e.key)) {
    e.preventDefault()
    cambiarDireccionGusanito('DOWN')
  } else if (['ArrowLeft', 'KeyA', 'a', 'A'].includes(e.key)) {
    e.preventDefault()
    cambiarDireccionGusanito('LEFT')
  } else if (['ArrowRight', 'KeyD', 'd', 'D'].includes(e.key)) {
    e.preventDefault()
    cambiarDireccionGusanito('RIGHT')
  }
}

watch(
  () => [props.modoPresentacion, props.opciones],
  () => {
    if (props.modoPresentacion === 'juego_gusanito') {
      snake.value = [
        { x: 3, y: 3 },
        { x: 2, y: 3 },
        { x: 1, y: 3 }
      ]
      snakeDir.value = 'RIGHT'
      window.addEventListener('keydown', handleKeyDownSnake)
    } else {
      pausarJuegoGusanito()
      window.removeEventListener('keydown', handleKeyDownSnake)
    }
  },
  { immediate: true }
)

onUnmounted(() => {
  pausarJuegoGusanito()
  window.removeEventListener('keydown', handleKeyDownSnake)
})
</script>

<template>
  <div class="space-y-4">
    <!-- MODO 1: ROMPECABEZAS (SOLO ARRASTRAR HASTA ENCAJAR EN LA RANURA) -->
    <div v-if="modoPresentacion === 'rompecabezas'" class="space-y-4 text-left font-['Poppins',sans-serif]">
      
      <!-- CONTENEDOR MARCO AZUL OSCURO DEL TABLERO CON DISPOSICIÓN AL MISMO NIVEL (IZQUIERDA, CENTRO, DERECHA) -->
      <div class="p-5 sm:p-6 rounded-3xl bg-[#182232] dark:bg-slate-900 border border-slate-700/60 shadow-2xl space-y-4 relative overflow-hidden">
        
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-center justify-center">

          <!-- COLUMNA 1: FICHAS DE OPCIÓN AL LADO IZQUIERDO (MISMO NIVEL) -->
          <div class="lg:col-span-3 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
            <div
              v-for="opc in opcionesIzquierda"
              :key="opc.id"
              draggable="true"
              @dragstart="(e) => handleDragStart(opc, e)"
              @dragend="handleDragEnd"
              class="relative cursor-grab active:cursor-grabbing transition-all duration-300 hover:scale-[1.04] group select-none min-h-[100px] sm:min-h-[115px] w-full flex items-center justify-center p-2.5 overflow-visible"
            >
              <!-- Silueta SVG de la Ficha en elegante tono gris uniforme -->
              <svg viewBox="-5 -5 125 125" class="w-full h-full absolute inset-0 drop-shadow-xl select-none z-0 overflow-visible">
                <path
                  :d="getPuzzlePiecePathFull(ranuraFaltanteIndex)"
                  fill="#475569"
                  stroke="#64748b"
                  stroke-width="2.5"
                  class="group-hover:fill-slate-600 group-hover:stroke-slate-400 transition-all"
                />
              </svg>

              <!-- Texto de la Respuesta con Contraste de Alta Legibilidad sobre Cápsula de Cristal Oscuro -->
              <div class="relative z-10 flex items-center justify-center text-center w-full px-2 py-1">
                <span class="text-xs sm:text-sm font-extrabold text-white px-3 py-1.5 rounded-xl bg-slate-950/85 border border-white/30 backdrop-blur-md shadow-lg leading-tight text-center break-words max-w-[88%]">
                  {{ opc.texto }}
                </span>
              </div>
            </div>
          </div>

          <!-- COLUMNA 2: TABLERO DEL ROMPECABEZAS (CENTRO, MISMO NIVEL) -->
          <div class="lg:col-span-6 w-full max-w-lg mx-auto relative pt-1">
            <!-- CAPA DE IMAGEN COMPLETA QUE SE REVELA TOTALMENTE AL COMPLETAR EL ROMPECABEZAS -->
            <div
              v-if="respuestaSeleccionada && urlImagenPuzzle"
              class="w-full aspect-[4/3] absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 ease-in-out z-40 rounded-3xl opacity-100 shadow-2xl border-4 border-amber-400"
              :style="{ backgroundImage: `url(${urlImagenPuzzle})` }"
            />

            <div
              :class="[
                'w-full aspect-[4/3] grid grid-cols-3 grid-rows-3 p-4 sm:p-5 rounded-3xl transition-all duration-700 ease-in-out shadow-inner relative overflow-hidden bg-[#0f172a] border border-slate-700/60',
                respuestaSeleccionada ? 'border-2 border-amber-400/80 ring-4 ring-amber-400/40 shadow-2xl' : ''
              ]"
            >
              <template v-for="idx in 9" :key="idx - 1">
                <!-- CELDA NORMAL DE PIEZA DE ROMPECABEZAS -->
                <div
                  v-if="(idx - 1) !== ranuraFaltanteIndex"
                  class="relative w-full h-full flex items-center justify-center overflow-visible"
                  :style="{ transform: getPuzzleTileTransform(idx - 1), transition: 'transform 700ms cubic-bezier(0.34, 1.56, 0.64, 1)' }"
                >
                  <!-- Silueta SVG con recorte estricto de la imagen sólo dentro de la forma de la ficha -->
                  <svg
                    viewBox="-5 -5 125 125"
                    class="w-full h-full absolute inset-0 drop-shadow-xl select-none z-10 overflow-visible"
                  >
                    <defs>
                      <clipPath :id="'piece-clip-' + (idx - 1)">
                        <path :d="getPuzzlePiecePathFull(idx - 1)" />
                      </clipPath>
                    </defs>

                    <!-- Relleno base gris por si la imagen aún no se muestra -->
                    <path :d="getPuzzlePiecePathFull(idx - 1)" fill="#475569" />

                    <!-- Imagen recortada STRICTAMENTE dentro de la silueta de la ficha -->
                    <g v-if="urlImagenPuzzle" :clip-path="`url(#piece-clip-${idx - 1})`">
                      <image
                        :href="urlImagenPuzzle"
                        :x="- ((idx - 1) % 3) * 100"
                        :y="- Math.floor((idx - 1) / 3) * 100"
                        width="300"
                        height="300"
                        preserveAspectRatio="none"
                      />
                    </g>

                    <!-- Borde sutil exterior de la ficha -->
                    <path
                      :d="getPuzzlePiecePathFull(idx - 1)"
                      fill="none"
                      stroke="#475569"
                      stroke-width="2.5"
                    />
                  </svg>
                </div>

                <!-- 🎯 CELDA RANURA FALTANTE (SOLO LÍNEAS DISCONTINUAS SI NO TIENE RESPUESTA) -->
                <div
                  v-else
                  @dragenter="handleDragEnter"
                  @dragover="handleDragOver"
                  @dragleave="handleDragLeave"
                  @drop="handleDrop"
                  class="relative w-full h-full flex flex-col items-center justify-center text-center cursor-pointer overflow-visible"
                  :style="{ transform: getPuzzleTileTransform(idx - 1), transition: 'transform 700ms cubic-bezier(0.34, 1.56, 0.64, 1)' }"
                >
                  <!-- Si se completó con respuesta encajada -->
                  <svg
                    v-if="respuestaSeleccionada"
                    viewBox="-5 -5 125 125"
                    class="w-full h-full absolute inset-0 drop-shadow-xl select-none z-10 overflow-visible"
                  >
                    <defs>
                      <clipPath :id="'piece-clip-' + (idx - 1)">
                        <path :d="getPuzzlePiecePathFull(idx - 1)" />
                      </clipPath>
                    </defs>

                    <path :d="getPuzzlePiecePathFull(idx - 1)" fill="#475569" />

                    <g v-if="urlImagenPuzzle" :clip-path="`url(#piece-clip-${idx - 1})`">
                      <image
                        :href="urlImagenPuzzle"
                        :x="- ((idx - 1) % 3) * 100"
                        :y="- Math.floor((idx - 1) / 3) * 100"
                        width="300"
                        height="300"
                        preserveAspectRatio="none"
                      />
                    </g>

                    <path
                      :d="getPuzzlePiecePathFull(idx - 1)"
                      fill="none"
                      stroke="#475569"
                      stroke-width="2.5"
                    />
                  </svg>

                  <!-- SI NO TIENE RESPUESTA: ÚNICAMENTE LÍNEAS DISCONTINUAS DEL BORDE -->
                  <template v-else>
                    <svg
                      viewBox="-5 -5 125 125"
                      class="w-full h-full absolute inset-0 drop-shadow-xl select-none z-10 overflow-visible"
                    >
                      <path
                        :d="getPuzzlePiecePathFull(idx - 1)"
                        fill="transparent"
                        :stroke="isHoveringSlot ? '#f59e0b' : '#fbbf24'"
                        stroke-width="3.5"
                        stroke-dasharray="6 3"
                      />
                    </svg>
                  </template>

                  <!-- TEXTO BADGE DE LA RESPUESTA AL COMPLETAR -->
                  <!-- <div v-if="respuestaSeleccionada" class="w-full h-full flex flex-col items-center justify-center text-center p-1 animate-in zoom-in-75 duration-500 z-30">
                    <div
                      class="px-3 py-1.5 rounded-xl text-white font-extrabold text-xs sm:text-sm leading-tight shadow-2xl border border-white/40 truncate text-center backdrop-blur-md bg-slate-950/85 max-w-[95%]"
                      :style="{ borderColor: obtenerHexSentimiento(respuestaSeleccionada) }"
                    >
                      {{ typeof respuestaSeleccionada === 'object' ? respuestaSeleccionada.texto : respuestaSeleccionada }}
                    </div>
                  </div> -->
                </div>
              </template>
            </div>
          </div>

          <!-- COLUMNA 3: FICHAS DE OPCIÓN AL LADO DERECHO (MISMO NIVEL) -->
          <div class="lg:col-span-3 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
            <div
              v-for="opc in opcionesDerecha"
              :key="opc.id"
              draggable="true"
              @dragstart="(e) => handleDragStart(opc, e)"
              @dragend="handleDragEnd"
              class="relative cursor-grab active:cursor-grabbing transition-all duration-300 hover:scale-[1.04] group select-none min-h-[100px] sm:min-h-[115px] w-full flex items-center justify-center p-2.5 overflow-visible"
            >
              <!-- Silueta SVG de la Ficha en elegante tono gris uniforme -->
              <svg viewBox="-5 -5 125 125" class="w-full h-full absolute inset-0 drop-shadow-xl select-none z-0 overflow-visible">
                <path
                  :d="getPuzzlePiecePathFull(ranuraFaltanteIndex)"
                  fill="#475569"
                  stroke="#64748b"
                  stroke-width="2.5"
                  class="group-hover:fill-slate-600 group-hover:stroke-slate-400 transition-all"
                />
              </svg>

              <!-- Texto de la Respuesta con Contraste de Alta Legibilidad sobre Cápsula de Cristal Oscuro -->
              <div class="relative z-10 flex items-center justify-center text-center w-full px-2 py-1">
                <span class="text-xs sm:text-sm font-extrabold text-white px-3 py-1.5 rounded-xl bg-slate-950/85 border border-white/30 backdrop-blur-md shadow-lg leading-tight text-center break-words max-w-[88%]">
                  {{ opc.texto }}
                </span>
              </div>
            </div>
          </div>

        </div>

        <!-- INDICADOR DE TIEMPO REGLAMENTARIO SI AÚN RESTAN SEGUNDOS MINIMOS DE RESPUESTA -->
        <div v-if="respuestaSeleccionada && (segundosRestantes || 0) > 0" class="flex items-center justify-center pt-1">
          <span class="text-xs font-mono font-bold text-slate-300 px-3.5 py-1 rounded-full bg-slate-950/90 border border-slate-700 shadow-md animate-pulse">
            Respetando tiempo reglamentario: {{ segundosRestantes }}s
          </span>
        </div>
      </div>

    </div>

    <!-- MODO 2A: SLIDER DE EMOCIÓN DINÁMICO (ENOJADO -> SERIO -> FELIZ) -->
    <div v-else-if="modoPresentacion === 'deslizador_emocional'" class="space-y-6 text-left font-['Poppins',sans-serif]">
      <SliderEmocionDinamico
        :opciones="opciones"
        :respuestaSeleccionada="respuestaSeleccionada"
        @seleccionar="emit('seleccionar', $event)"
      />
    </div>

    <!-- MODO 2B: SLIDER DE TIEMPO Y ANTIGÜEDAD DINÁMICO CON EMOJIS PROGRESIVOS -->
    <div v-else-if="modoPresentacion === 'deslizador_tiempo'" class="space-y-6 text-left font-['Poppins',sans-serif]">
      <SliderAntiguedadDinamico
        :maxAnos="maxAnos || 5"
        :maxMeses="maxMeses"
        :opciones="opciones"
        :respuestaSeleccionada="respuestaSeleccionada"
        @seleccionar="emit('seleccionar', $event)"
        @cambioAntiguedad="alCambiarAntiguedadSlider"
      />
    </div>

    <!-- MODO 3: JUEGO DEL GUSANITO (SERPIENTE ARCADE DE RESPUESTAS) -->
    <div v-else-if="modoPresentacion === 'juego_gusanito'" class="space-y-6 text-left font-['Poppins',sans-serif]">
      <div class="p-5 sm:p-6 rounded-3xl bg-[#182232] dark:bg-slate-900 border border-slate-700/60 shadow-2xl space-y-4 relative overflow-hidden">
        
        <!-- TABLERO DE JUEGO ARENA (GRID 12x8) -->
        <div class="relative w-full aspect-[12/8] bg-slate-950 rounded-2xl border border-slate-800 shadow-inner overflow-hidden flex items-center justify-center">
          
          <!-- LÍNEAS DE RETÍCULA SOBRIAS -->
          <div class="absolute inset-0 grid grid-cols-12 grid-rows-8 opacity-20 pointer-events-none">
            <div v-for="i in 96" :key="i" class="border border-slate-800/80"></div>
          </div>

          <!-- MANZANAS / PUERTAS DE RESPUESTAS EN EL TABLERO -->
          <div
            v-for="item in manzanasRespuestas"
            :key="item.opcion.id"
            class="absolute transition-all duration-300 flex flex-col items-center justify-center z-20 pointer-events-auto cursor-pointer group"
            :style="{
              left: `${(item.x / GRID_COLS) * 100}%`,
              top: `${(item.y / GRID_ROWS) * 100}%`,
              width: `${(1 / GRID_COLS) * 100}%`,
              height: `${(1 / GRID_ROWS) * 100}%`
            }"
            @click="seleccionarOpcion(item.opcion)"
          >
            <!-- BADGE CON EL TEXTO COMPLETO DE LA RESPUESTA ARRIBA DE LA MANZANA (VISIBLE 100% SIN CORTAR) -->
            <span
              class="absolute -top-9 sm:-top-10 px-2.5 py-1.5 rounded-xl text-[10px] sm:text-xs font-black text-slate-950 shadow-2xl border border-white/90 whitespace-normal text-center leading-tight min-w-[110px] max-w-[180px] sm:max-w-[220px] z-40 transition-transform group-hover:scale-105 pointer-events-none"
              :style="{ backgroundColor: obtenerHexSentimiento(item.opcion) }"
            >
              {{ item.opcion.texto }}
            </span>

            <!-- MANZANA EMOJI / SHAPE SOBRIO SIN NEÓN -->
            <div
              class="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border border-white/40 shadow-sm relative"
              :style="{ backgroundColor: obtenerHexSentimiento(item.opcion) }"
            >
              <span class="text-xs sm:text-sm select-none">🍎</span>
            </div>
          </div>

          <!-- GUSANITO / SERPIENTE SIMPLE (2 TONOS SOBRIOS SIN NEÓN) -->
          <template v-for="(seg, idx) in snake" :key="idx">
            <div
              class="absolute transition-all duration-150 ease-linear flex items-center justify-center z-30 p-0.5"
              :style="{
                left: `${(seg.x / GRID_COLS) * 100}%`,
                top: `${(seg.y / GRID_ROWS) * 100}%`,
                width: `${(1 / GRID_COLS) * 100}%`,
                height: `${(1 / GRID_ROWS) * 100}%`
              }"
            >
              <div
                :class="[
                  'w-full h-full rounded-full',
                  idx === 0 ? 'bg-emerald-500' : 'bg-emerald-700'
                ]"
              />
            </div>
          </template>

        </div>

      </div>
    </div>

    <!-- MODO 4: SEMÁFORO INTERACTIVO DE 3 OPCIONES -->
    <div v-else-if="modoPresentacion === 'semaforo'" class="space-y-6 text-left font-['Poppins',sans-serif]">
      <SemaforoInteractivo
        :opciones="opciones"
        :respuestaSeleccionada="respuestaSeleccionada"
        @seleccionar="emit('seleccionar', $event ? $event : opciones?.[0]!)"
      />
    </div>

    <!-- MODO 5: TERMÓMETRO INTERACTIVO -->
    <div v-else-if="modoPresentacion === 'termometro'" class="space-y-6 text-left font-['Poppins',sans-serif]">
      <TermometroInteractivo
        :opciones="opciones"
        :respuestaSeleccionada="respuestaSeleccionada"
        @seleccionar="emit('seleccionar', $event ? $event : opciones?.[0]!)"
      />
    </div>

    <!-- MODO 6: PALANCA / INTERRUPTOR SÍ - NO -->
    <div v-else-if="modoPresentacion === 'palanca_sino'" class="space-y-6 text-left font-['Poppins',sans-serif]">
      <PalancaSiNo
        :opciones="opciones"
        :respuestaSeleccionada="respuestaSeleccionada"
        @seleccionar="emit('seleccionar', $event ? $event : opciones?.[0]!)"
      />
    </div>

    <!-- MODO 5: DAR CLIC (TARJETAS INTERACTIVAS ESTÁNDAR CON PROGRESIÓN ROJO A VERDE) -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-left font-['Poppins',sans-serif]">
      <button
        v-for="(opc, idx) in opcionesOrdenadasPorValor"
        :key="opc.id || idx"
        type="button"
        @click="emit('seleccionar', opc)"
        :class="[
          'p-4 rounded-2xl border-2 text-left transition-all duration-300 cursor-pointer flex items-center justify-between group relative overflow-hidden',
          respuestaSeleccionada?.texto === opc.texto
            ? 'text-white shadow-xl scale-[1.03] font-black'
            : 'bg-slate-100 dark:bg-neutral-900/80 text-slate-700 dark:text-neutral-300 hover:scale-[1.01] font-semibold'
        ]"
        :style="respuestaSeleccionada?.texto === opc.texto
          ? { backgroundColor: obtenerHexSentimiento(opc), borderColor: '#ffffff', boxShadow: `0 0 25px ${obtenerHexSentimiento(opc)}55` }
          : { borderColor: obtenerHexSentimiento(opc) + '66', borderLeftColor: obtenerHexSentimiento(opc), borderLeftWidth: '5px' }
        "
      >
        <div class="flex items-center gap-3 min-w-0">
          <span 
            class="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-125"
            :style="{ backgroundColor: respuestaSeleccionada?.texto === opc.texto ? '#ffffff' : obtenerHexSentimiento(opc) }"
          />
          <div class="min-w-0">
            <span class="text-sm leading-snug block truncate">{{ opc.texto }}</span>
            <div class="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <span 
                v-if="opc.preguntaAnclada" 
                class="text-[9px] font-mono font-bold text-sky-500 dark:text-sky-400 flex items-center gap-0.5"
              >
                ⚡ Desglosa motivo
              </span>
            </div>
          </div>
        </div>

        <span 
          class="w-6 h-6 rounded-full border flex items-center justify-center shrink-0 text-xs ml-2 transition-all duration-200"
          :class="respuestaSeleccionada?.texto === opc.texto ? 'border-white bg-white text-slate-950 shadow-md scale-110' : 'border-slate-400 dark:border-neutral-600 text-slate-500 dark:text-neutral-500'"
        >
          <Check v-if="respuestaSeleccionada?.texto === opc.texto" class="w-3.5 h-3.5 stroke-[3]" />
          <span v-else class="text-[10px] font-mono"></span>
        </span>
      </button>
    </div>
  </div>
</template>




