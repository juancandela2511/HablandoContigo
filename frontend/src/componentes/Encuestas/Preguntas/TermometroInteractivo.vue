<!--
  ============================================================================
  COMPONENTE INTERACTIVO DE TERMÓMETRO DE VIDRIO VECTORIAL (TermometroInteractivo.vue)
  ============================================================================

  ¿QUÉ ES Y QUÉ HACE?
  Termómetro de cristal estilo vectorial con bulbo esférico inferior, marcas de regla
  graduadas y todas las opciones de respuesta de la pregunta visibles y seleccionables.
  - Muestra TODAS las opciones de respuesta que tenga la pregunta.
  - La opción de menor puntaje comienza en ROJO (#ef4444) y avanza progresivamente
    hacia naranja (#f97316), ámbar (#f59e0b), verde claro (#22c55e) hasta el VERDE
    de mayor puntaje (#10b981), o usa el color configurado en la opción.
-->

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { CheckCircle2 } from 'lucide-vue-next'
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
  (e: 'seleccionar', opcion: OpcionPregunta | null): void
}>()

// Ordenar las opciones de menor a mayor puntaje (Rojo -> Verde)
const opcionesOrdenadas = computed(() => {
  const lista = props.opciones || []
  if (lista.length === 0) {
    return [
      { id: 'ter-1', texto: '1 - Muy Mal / Crítico', valor: 1, esAlerta: true, color: '#ef4444' },
      { id: 'ter-2', texto: '2 - Mal / Riesgo', valor: 2, esAlerta: false, color: '#f97316' },
      { id: 'ter-3', texto: '3 - Regular / Aceptable', valor: 3, esAlerta: false, color: '#f59e0b' },
      { id: 'ter-4', texto: '4 - Bien / Favorable', valor: 4, esAlerta: false, color: '#22c55e' },
      { id: 'ter-5', texto: '5 - Excelente / Óptimo', valor: 5, esAlerta: false, color: '#10b981' }
    ]
  }

  return [...lista].sort((a, b) => {
    const vA = a.valor !== undefined ? a.valor : 0
    const vB = b.valor !== undefined ? b.valor : 0
    return vA - vB
  })
})

const obtenerColorOpcion = (opc: OpcionPregunta | null | undefined, idx: number, total: number): string => {
  if (opc?.color && opc.color.trim().length > 0) return opc.color
  const r = total > 1 ? idx / (total - 1) : 0.5
  const val = typeof opc?.valor === 'number' ? opc.valor : Math.round(1 + r * 4)
  if (val <= 1 || r <= 0.2) return '#ef4444' // Rojo menor puntaje
  if (val === 2 || r <= 0.4) return '#f97316' // Naranja
  if (val === 3 || r <= 0.6) return '#f59e0b' // Ámbar / Amarillo
  if (val === 4 || r <= 0.8) return '#22c55e' // Verde claro
  return '#10b981' // Verde mayor puntaje
}

// -1 indica "Sin temperatura inicial / Sin selección previa"
const indiceSeleccionado = ref<number>(-1)

// Sincronizar estado con respuestaSeleccionada recibida externamente
watch(
  () => [props.respuestaSeleccionada, opcionesOrdenadas.value],
  () => {
    if (!props.respuestaSeleccionada) {
      indiceSeleccionado.value = -1
      return
    }

    const valStr = typeof props.respuestaSeleccionada === 'object'
      ? String(props.respuestaSeleccionada.texto || props.respuestaSeleccionada.id || '')
      : String(props.respuestaSeleccionada)

    const norm = valStr.trim().toLowerCase()
    const idx = opcionesOrdenadas.value.findIndex(o =>
      o.id === valStr || (o.texto || '').trim().toLowerCase() === norm
    )

    if (idx !== -1) {
      indiceSeleccionado.value = idx
    } else {
      indiceSeleccionado.value = -1
    }
  },
  { immediate: true }
)

const opcionActual = computed<OpcionPregunta | null>(() => {
  if (indiceSeleccionado.value >= 0 && indiceSeleccionado.value < opcionesOrdenadas.value.length) {
    return opcionesOrdenadas.value[indiceSeleccionado.value] || null
  }
  return null
})

// Porcentaje de altura del mercurio en el tubo (sube de menor a mayor puntaje o refleja el nivel seleccionado)
const porcentajeMercurio = computed(() => {
  if (indiceSeleccionado.value === -1) return 0
  const total = opcionesOrdenadas.value.length
  if (total <= 1) return 50

  // Sube progresivamente desde 25% (menor puntaje, rojo) hasta 92% (mayor puntaje, verde)
  const fraccion = indiceSeleccionado.value / (total - 1)
  return Math.round(25 + fraccion * 67)
})

const alturaTuboPx = 215
const alturaMercurioSvg = computed(() => {
  if (indiceSeleccionado.value === -1) return 0
  return Math.round((porcentajeMercurio.value / 100) * alturaTuboPx)
})

const yMercurioSvg = computed(() => {
  return 250 - alturaMercurioSvg.value
})

// Color del líquido según la opción seleccionada (Rojo menor puntaje -> Verde mayor puntaje)
const colorLiquido = computed(() => {
  if (indiceSeleccionado.value === -1) return '#475569' // Gris vidrio reposo
  return obtenerColorOpcion(opcionActual.value, indiceSeleccionado.value, opcionesOrdenadas.value.length)
})

const seleccionarIndice = (idx: number) => {
  indiceSeleccionado.value = idx
  emit('seleccionar', opcionesOrdenadas.value[idx] || null)
}
</script>

<template>
  <div class="p-5 sm:p-7 rounded-3xl bg-slate-900 border border-slate-700/60 shadow-2xl space-y-6 text-left font-['Poppins',sans-serif]">
    
    <!-- SECCIÓN DE CONTENIDO: TERMÓMETRO VECTORIAL + TODAS LAS OPCIONES -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
      
      <!-- COLUMNA IZQUIERDA: TERMÓMETRO DE VIDRIO ILUSTRADO (5 COLS) -->
      <div class="lg:col-span-5 flex flex-col items-center justify-center p-4 rounded-3xl bg-slate-950/90 border border-slate-800/80 relative">

        <!-- TERMÓMETRO VECTORIAL SVG ESTILO ILUSTRACIÓN CRISTALINA -->
        <svg viewBox="0 0 140 310" class="w-28 sm:w-36 h-auto drop-shadow-2xl select-none overflow-visible">
          <defs>
            <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="0.85" />
              <stop offset="40%" stop-color="#cbd5e1" stop-opacity="0.3" />
              <stop offset="100%" stop-color="#64748b" stop-opacity="0.6" />
            </linearGradient>

            <filter id="fluidGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.4" />
            </filter>
          </defs>

          <!-- 1. Silueta de Cristal Exterior del Termómetro -->
          <path
            d="M 50 30 
               A 20 20 0 0 1 90 30 
               L 90 232 
               A 36 36 0 1 1 50 232 
               Z"
            fill="#090d16"
            stroke="url(#glassGradient)"
            stroke-width="5"
          />

          <!-- 2. Marcas de Regla Graduadas a la derecha del tubo -->
          <g stroke="#64748b" stroke-width="2" opacity="0.85">
            <line x1="72" y1="50" x2="84" y2="50" stroke-width="2.5" />
            <line x1="72" y1="95" x2="84" y2="95" stroke-width="2.5" />
            <line x1="72" y1="140" x2="84" y2="140" stroke-width="2.5" />
            <line x1="72" y1="185" x2="84" y2="185" stroke-width="2.5" />
            <line x1="72" y1="230" x2="84" y2="230" stroke-width="2.5" />

            <line x1="76" y1="65" x2="84" y2="65" />
            <line x1="76" y1="80" x2="84" y2="80" />
            <line x1="76" y1="110" x2="84" y2="110" />
            <line x1="76" y1="125" x2="84" y2="125" />
            <line x1="76" y1="155" x2="84" y2="155" />
            <line x1="76" y1="170" x2="84" y2="170" />
            <line x1="76" y1="200" x2="84" y2="200" />
            <line x1="76" y1="215" x2="84" y2="215" />
          </g>

          <!-- 3. Bulbo Esférico Inferior de Mercurio Líquido -->
          <circle
            cx="70"
            cy="260"
            r="28"
            :fill="colorLiquido"
            filter="url(#fluidGlow)"
            class="transition-colors duration-500 ease-in-out"
          />

          <!-- 4. Columna de Líquido en el Tubo -->
          <rect
            x="55"
            :y="yMercurioSvg"
            width="30"
            :height="alturaMercurioSvg"
            rx="15"
            :fill="colorLiquido"
            filter="url(#fluidGlow)"
            class="transition-all duration-500 ease-out"
          />

          <!-- 5. Reflejos Especulares de Cristal Blanco -->
          <path
            d="M 54 35 C 54 28, 60 25, 60 25 L 60 220 C 56 220, 54 215, 54 205 Z"
            fill="#ffffff"
            opacity="0.45"
          />
          <path
            d="M 52 248 A 22 22 0 0 1 65 238 A 22 22 0 0 0 54 258 Z"
            fill="#ffffff"
            opacity="0.55"
          />
        </svg>

        <div class="text-xs font-bold pt-2 text-center">
          <span v-if="indiceSeleccionado === -1" class="italic text-slate-500 font-mono text-[11px]">
            Selecciona una opción
          </span>
          <span v-else class="px-3 py-1 rounded-full border text-white shadow-md inline-block" :style="{ backgroundColor: colorLiquido + '33', borderColor: colorLiquido }">
            {{ opcionActual?.texto }}
          </span>
        </div>

      </div>

      <!-- COLUMNA DERECHA: TODAS LAS OPCIONES DE RESPUESTA CON COLOR PROGRESIVO (ROJO -> VERDE) (7 COLS) -->
      <div class="lg:col-span-7 space-y-3">
        <p class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Selecciona tu respuesta:</span>
          <span class="text-[10px] font-mono text-slate-500">Menor puntaje (Rojo) ➔ Mayor puntaje (Verde)</span>
        </p>

        <div class="space-y-2.5">
          <div
            v-for="(opc, idx) in opcionesOrdenadas"
            :key="opc.id || idx"
            @click="seleccionarIndice(idx)"
            :class="[
              'p-3.5 sm:p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer flex items-center justify-between group select-none relative overflow-hidden',
              indiceSeleccionado === idx
                ? 'bg-slate-800 shadow-xl scale-[1.01]'
                : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/50'
            ]"
            :style="indiceSeleccionado === idx
              ? { borderColor: obtenerColorOpcion(opc, idx, opcionesOrdenadas.length), backgroundColor: obtenerColorOpcion(opc, idx, opcionesOrdenadas.length) + '22' }
              : { borderLeftColor: obtenerColorOpcion(opc, idx, opcionesOrdenadas.length), borderLeftWidth: '5px' }
            "
          >
            <div class="flex items-center gap-3 relative z-10">
              <span
                class="w-4 h-4 rounded-full shrink-0 shadow-sm"
                :style="{ backgroundColor: obtenerColorOpcion(opc, idx, opcionesOrdenadas.length) }"
              />
              <div>
                <h4 class="text-sm font-bold text-white transition-colors">
                  {{ opc.texto }}
                </h4>
              </div>
            </div>

            <!-- Indicador de Selección con el color de la opción -->
            <div class="relative z-10 flex items-center gap-2">
              <div 
                class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
                :style="indiceSeleccionado === idx
                  ? { borderColor: obtenerColorOpcion(opc, idx, opcionesOrdenadas.length), backgroundColor: obtenerColorOpcion(opc, idx, opcionesOrdenadas.length), color: '#090d16' }
                  : { borderColor: '#475569' }
                "
              >
                <CheckCircle2 v-if="indiceSeleccionado === idx" class="w-4 h-4 stroke-[3]" />
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>

  </div>
</template>
