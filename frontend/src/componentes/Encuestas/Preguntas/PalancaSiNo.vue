<!--
  ============================================================================
  COMPONENTE INTERACTIVO: PALANCA INDUSTRIAL CON TODAS LAS OPCIONES (PalancaSiNo.vue)
  ============================================================================
  - Muestra la palanca interactiva y TODAS las opciones de respuesta que tenga la pregunta.
  - Los colores van desde ROJO (#ef4444) en la opción de menor puntaje hasta
    VERDE (#10b981) en la de mayor puntaje, respetando el color configurado de cada opción.
-->

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Lightbulb, CheckCircle2 } from 'lucide-vue-next'
import { resolverColorExactoOpcion, type OpcionPregunta } from '@/ia'

const props = defineProps<{
  opciones?: OpcionPregunta[]
  respuestaSeleccionada?: any
}>()

const emit = defineEmits<{
  (e: 'seleccionar', opcion: OpcionPregunta): void
}>()

// Ordenar todas las opciones de menor a mayor puntaje (Rojo -> Verde)
const opcionesOrdenadas = computed<OpcionPregunta[]>(() => {
  const ops = props.opciones || []
  if (ops.length === 0) {
    return [
      { id: 'op-no', texto: 'No', valor: 1, esAlerta: true, color: '#ef4444' },
      { id: 'op-si', texto: 'Sí', valor: 5, esAlerta: false, color: '#2563eb' }
    ]
  }
  return [...ops].sort((a, b) => {
    const vA = typeof a.valor === 'number' ? a.valor : 0
    const vB = typeof b.valor === 'number' ? b.valor : 0
    return vA - vB
  })
})

const obtenerColorOpcion = (opc: OpcionPregunta | null | undefined, idx: number, total: number): string => {
  if (!opc) return '#2563eb'
  return resolverColorExactoOpcion(opc, idx, total)
}

const indiceSeleccionado = computed(() => {
  if (!props.respuestaSeleccionada) return -1
  const valStr = typeof props.respuestaSeleccionada === 'object'
    ? String(props.respuestaSeleccionada.texto || props.respuestaSeleccionada.id || '')
    : String(props.respuestaSeleccionada)
  const norm = valStr.trim().toLowerCase()
  return opcionesOrdenadas.value.findIndex(
    o => o.id === valStr || (o.texto || '').trim().toLowerCase() === norm
  )
})

const opcionSeleccionadaActual = computed<OpcionPregunta | null>(() => {
  if (indiceSeleccionado.value >= 0) {
    return opcionesOrdenadas.value[indiceSeleccionado.value] || null
  }
  return null
})

const colorActualHex = computed(() => {
  if (indiceSeleccionado.value === -1) return '#1e293b'
  return obtenerColorOpcion(
    opcionSeleccionadaActual.value,
    indiceSeleccionado.value,
    opcionesOrdenadas.value.length
  )
})

// Ángulo de la palanca desde +48deg (menor puntaje / derecha-abajo) hasta -48deg (mayor puntaje / izquierda-arriba)
const anguloPalanca = computed(() => {
  if (indiceSeleccionado.value === -1) return 0
  const total = opcionesOrdenadas.value.length
  if (total <= 1) return -48
  const ratio = indiceSeleccionado.value / (total - 1) // 0 (menor) -> 1 (mayor)
  return Math.round(48 - ratio * 96)
})

const esPuntajeAlto = computed(() => {
  if (indiceSeleccionado.value === -1) return false
  const total = opcionesOrdenadas.value.length
  return total > 1 ? indiceSeleccionado.value >= total / 2 : true
})

const chispaActiva = ref(false)

const reproducirSonidoPalanca = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(240, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(75, ctx.currentTime + 0.08)

    gain.gain.setValueAtTime(0.2, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start()
    osc.stop(ctx.currentTime + 0.08)
  } catch {
    // Silencioso
  }
}

const elegirOpcion = (opc: OpcionPregunta) => {
  chispaActiva.value = true
  setTimeout(() => { chispaActiva.value = false }, 500)
  reproducirSonidoPalanca()
  emit('seleccionar', opc)
}

const togglePalanca = () => {
  const ops = opcionesOrdenadas.value
  if (ops.length === 0) return
  const nextIdx = (indiceSeleccionado.value + 1) % ops.length
  const nextOpc = ops[nextIdx]
  if (nextOpc) elegirOpcion(nextOpc)
}
</script>

<template>
  <div class="space-y-5 select-none font-['Poppins',sans-serif] flex flex-col items-center">
    
    <!-- TARJETA PRINCIPAL DE LA PALANCA CON COLOR DINÁMICO DE LA OPCIÓN -->
    <div 
      @click="togglePalanca"
      class="w-full max-w-md p-6 sm:p-7 rounded-3xl border-2 shadow-2xl flex flex-col items-center space-y-4 relative overflow-hidden transition-all duration-500 ease-in-out cursor-pointer"
      :style="indiceSeleccionado !== -1
        ? { backgroundColor: colorActualHex + '33', borderColor: colorActualHex, boxShadow: `0 0 45px ${colorActualHex}55` }
        : { backgroundColor: '#0f172a', borderColor: '#1e293b' }
      "
    >
      <!-- ESQUINA SUPERIOR IZQUIERDA: BOMBILLO INDICADOR -->
      <div class="w-full flex items-center justify-between z-10">
        <div 
          class="relative w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 shadow-xl"
          :style="indiceSeleccionado !== -1
            ? { backgroundColor: colorActualHex, borderColor: '#ffffff', boxShadow: `0 0 25px ${colorActualHex}` }
            : { backgroundColor: '#020617', borderColor: '#334155' }
          "
        >
          <div v-if="esPuntajeAlto" class="absolute inset-0 rounded-full animate-ping bg-white/40 pointer-events-none" />
          <Lightbulb 
            class="w-7 h-7 transition-all duration-300" 
            :class="indiceSeleccionado !== -1 ? 'stroke-[2.5] text-slate-950 fill-white' : 'stroke-[1.5] text-slate-500'" 
          />
        </div>

        <span class="text-[11px] font-mono text-slate-300 bg-slate-950/70 px-3 py-1 rounded-full border border-white/10">
          Haz clic en la palanca o en una opción
        </span>
      </div>

      <!-- TEXTO DESTACADO DE LA OPCIÓN SELECCIONADA -->
      <div class="w-full flex justify-center z-10 pt-1 text-center">
        <span class="font-black text-2xl sm:text-3xl tracking-wide drop-shadow-md transition-all duration-300 text-white">
          {{ opcionSeleccionadaActual ? opcionSeleccionadaActual.texto : 'Selecciona una opción' }}
        </span>
      </div>

      <!-- PALANCA VECTORIAL CENTRADA -->
      <div class="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center select-none z-10">
        <svg viewBox="0 0 340 380" class="w-full h-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.85)] overflow-visible">
          <rect x="35" y="315" width="270" height="32" rx="16" fill="#f3f4f6" stroke="#111827" stroke-width="8" />
          <rect x="42" y="322" width="256" height="18" rx="9" fill="#e5e7eb" />

          <path 
            d="M 65,315 L 105,185 C 108,175 116,165 128,165 L 212,165 C 224,165 232,175 235,185 L 275,315 Z" 
            fill="#f9fafb" 
            stroke="#111827" 
            stroke-width="8" 
            stroke-linejoin="round" 
          />
          <path 
            d="M 78,308 L 112,190 C 114,183 120,175 130,175 L 210,175 C 220,175 226,183 228,190 L 262,308 Z" 
            fill="#f3f4f6" 
          />

          <circle cx="170" cy="225" r="48" fill="#ffffff" stroke="#111827" stroke-width="8" />
          <circle cx="170" cy="225" r="28" fill="#f3f4f6" stroke="#111827" stroke-width="6" />
          <circle cx="170" cy="225" r="12" fill="#111827" />

          <g 
            class="transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] origin-[170px_225px]"
            :style="{ transform: `rotate(${anguloPalanca}deg)` }"
          >
            <rect x="157" y="65" width="26" height="130" rx="13" fill="#ffffff" stroke="#111827" stroke-width="7" />
            <rect
              x="141"
              y="10"
              width="58"
              height="80"
              rx="24"
              :fill="indiceSeleccionado !== -1 ? colorActualHex : '#ffffff'"
              stroke="#111827"
              stroke-width="8"
            />
            <g v-if="chispaActiva" class="animate-ping">
              <circle cx="170" cy="50" r="35" fill="#facc15" opacity="0.85" />
            </g>
          </g>
        </svg>
      </div>
    </div>

    <!-- LISTA COMPLETA DE TODAS LAS OPCIONES DE RESPUESTA CON COLOR PROGRESIVO (ROJO -> VERDE) -->
    <div class="w-full max-w-xl grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      <button
        v-for="(opc, idx) in opcionesOrdenadas"
        :key="opc.id || idx"
        type="button"
        @click="elegirOpcion(opc)"
        :class="[
          'p-3.5 rounded-2xl border-2 transition-all duration-300 cursor-pointer flex items-center justify-between gap-3 text-left',
          indiceSeleccionado === idx
            ? 'text-white font-black scale-[1.02] shadow-lg'
            : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
        ]"
        :style="indiceSeleccionado === idx
          ? { backgroundColor: obtenerColorOpcion(opc, idx, opcionesOrdenadas.length) + '33', borderColor: obtenerColorOpcion(opc, idx, opcionesOrdenadas.length) }
          : { borderLeftColor: obtenerColorOpcion(opc, idx, opcionesOrdenadas.length), borderLeftWidth: '5px' }
        "
      >
        <div class="flex items-center gap-2.5">
          <span
            class="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
            :style="{ backgroundColor: obtenerColorOpcion(opc, idx, opcionesOrdenadas.length) }"
          />
          <span class="text-xs sm:text-sm font-bold leading-snug">{{ opc.texto }}</span>
        </div>
        <CheckCircle2
          v-if="indiceSeleccionado === idx"
          class="w-4 h-4 shrink-0"
          :style="{ color: obtenerColorOpcion(opc, idx, opcionesOrdenadas.length) }"
        />
      </button>
    </div>

  </div>
</template>
