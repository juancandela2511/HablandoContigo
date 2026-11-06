<!--
  ============================================================================
  COMPONENTE INTERACTIVO DE SEMÁFORO (SemaforoInteractivo.vue)
  ============================================================================

  ¿QUÉ ES Y QUÉ HACE?
  Componente gráfico e interactivo de semáforo vertical para la selección de
  respuestas en encuestas.
  - Muestra TODAS las opciones de respuesta configuradas en la pregunta, ordenadas
    desde el menor puntaje en ROJO (#ef4444), pasando por todas las respuestas
    intermedias en AMARILLO (#eab308), hasta el mayor puntaje en VERDE (#10b981).
-->

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { CheckCircle2, Check } from 'lucide-vue-next'
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

// Ordenar todas las opciones de menor a mayor puntaje (Rojo -> Amarillo -> Verde)
const opcionesOrdenadas = computed<OpcionPregunta[]>(() => {
  const lista = props.opciones || []
  if (lista.length === 0) {
    return [
      { id: 'sem-1', texto: 'Opción 1 (Desfavorable)', valor: 1, esAlerta: true, color: '#ef4444' },
      { id: 'sem-2', texto: 'Opción 2 (Intermedia)', valor: 3, esAlerta: false, color: '#eab308' },
      { id: 'sem-3', texto: 'Opción 3 (Favorable)', valor: 5, esAlerta: false, color: '#10b981' }
    ]
  }
  return [...lista].sort((a, b) => {
    const vA = typeof a.valor === 'number' ? a.valor : 0
    const vB = typeof b.valor === 'number' ? b.valor : 0
    return vA - vB
  })
})

/**
 * Paleta estricta de SEMÁFORO por posición (de menor a mayor):
 * - Primera opción (menor puntaje, idx === 0) = ROJO (#ef4444)
 * - Opciones intermedias (0 < idx < total - 1) = AMARILLO (#eab308)
 * - Última opción (mayor puntaje, idx === total - 1) = VERDE (#10b981)
 */
const obtenerColorOpcion = (_opc: OpcionPregunta | null | undefined, idx: number, total: number): string => {
  const totalSafe = Math.max(total, 1)
  if (totalSafe === 1) return '#10b981'
  if (idx === 0) return '#ef4444'              // Rojo (Menor)
  if (idx === totalSafe - 1) return '#10b981'  // Verde (Mayor)
  return '#eab308'                             // Amarillo (Todas las respuestas intermedias)
}

const esOpcionIntermediaAmarilla = (idx: number, total: number): boolean => {
  return total >= 3 && idx > 0 && idx < total - 1
}

const indiceSeleccionado = ref<number>(-1)

const esOpcionSeleccionada = (opc: OpcionPregunta, idx: number): boolean => {
  if (indiceSeleccionado.value === idx) return true
  if (!props.respuestaSeleccionada) return false
  const valStr = typeof props.respuestaSeleccionada === 'object'
    ? String(props.respuestaSeleccionada.texto || props.respuestaSeleccionada.id || '')
    : String(props.respuestaSeleccionada)
  const norm = valStr.trim().toLowerCase()
  return (
    opc.id === valStr ||
    (opc.texto || '').trim().toLowerCase() === norm ||
    (props.respuestaSeleccionada?.id && opc.id === props.respuestaSeleccionada.id)
  )
}

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
    const idx = opcionesOrdenadas.value.findIndex(
      o => o.id === valStr || (o.texto || '').trim().toLowerCase() === norm
    )
    indiceSeleccionado.value = idx
  },
  { immediate: true }
)

const seleccionarIndice = (idx: number) => {
  indiceSeleccionado.value = idx
  emit('seleccionar', opcionesOrdenadas.value[idx] || null)
}
</script>

<template>
  <div class="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6 text-center font-['Poppins',sans-serif]">
    
    <!-- CONTENEDOR PRINCIPAL: SEMÁFORO Y TODAS LAS TARJETAS DE OPCIÓN -->
    <div class="flex flex-col md:flex-row items-center justify-center gap-6 sm:gap-10 py-2">
      
      <!-- 🚦 ESTRUCTURA DEL SEMÁFORO VECTORIAL DINÁMICO -->
      <div class="flex flex-col items-center space-y-4 shrink-0">
        <div class="relative w-28 sm:w-32 bg-slate-950 p-3 sm:p-4 rounded-3xl border-4 border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col items-center gap-3">
          <div class="absolute -top-3 w-20 h-3 bg-slate-900 rounded-t-full border-t border-slate-700/50" />

          <!-- UNA LUZ POR CADA OPCIÓN ORDENADA: ROJO -> AMARILLO (INTERMEDIAS) -> VERDE -->
          <div
            v-for="(opc, idx) in opcionesOrdenadas"
            :key="opc.id || idx"
            class="relative group cursor-pointer"
            @click="seleccionarIndice(idx)"
          >
            <div class="absolute -left-3 top-1/2 -translate-y-1/2 w-3 h-7 bg-slate-900 rounded-l-full border-l border-slate-700/40" />
            <div class="absolute -right-3 top-1/2 -translate-y-1/2 w-3 h-7 bg-slate-900 rounded-r-full border-r border-slate-700/40" />

            <div
              class="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 transition-all duration-300 relative flex items-center justify-center overflow-hidden"
              :style="esOpcionSeleccionada(opc, idx)
                ? {
                    backgroundColor: obtenerColorOpcion(opc, idx, opcionesOrdenadas.length),
                    borderColor: '#ffffff',
                    boxShadow: `0 0 35px ${obtenerColorOpcion(opc, idx, opcionesOrdenadas.length)}`,
                    transform: 'scale(1.08)'
                  }
                : {
                    backgroundColor: obtenerColorOpcion(opc, idx, opcionesOrdenadas.length) + '35',
                    borderColor: '#1e293b'
                  }
              "
            >
              <div class="absolute top-1.5 left-2 w-5 h-2.5 bg-white/40 rounded-full rotate-[-25deg] blur-[0.5px] pointer-events-none" />
              <!-- Icono de Check en la luz seleccionada -->
              <Check
                v-if="esOpcionSeleccionada(opc, idx)"
                class="w-6 h-6 stroke-[3] drop-shadow-md z-10"
                :class="esOpcionIntermediaAmarilla(idx, opcionesOrdenadas.length) ? 'text-slate-950' : 'text-white'"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 📋 DESGLOSE DE TODAS LAS OPCIONES DE LA PREGUNTA -->
      <div class="flex-1 w-full max-w-lg space-y-2.5 text-left">
        <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between flex-wrap gap-1">
          <span>Opciones del Semáforo:</span>
          <span class="text-[10px] text-slate-400 font-mono">
            Rojo (Menor) ➔ Amarillo (Intermedia) ➔ Verde (Mayor)
          </span>
        </p>

        <div
          v-for="(opc, idx) in opcionesOrdenadas"
          :key="opc.id || idx"
          @click="seleccionarIndice(idx)"
          class="p-3.5 sm:p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 shadow-md select-none"
          :class="esOpcionSeleccionada(opc, idx)
            ? 'text-white font-black scale-[1.01] ring-2 ring-white/50'
            : 'bg-slate-800/60 border-slate-700/60 hover:border-slate-600 text-slate-300'"
          :style="esOpcionSeleccionada(opc, idx)
            ? { backgroundColor: obtenerColorOpcion(opc, idx, opcionesOrdenadas.length) + '33', borderColor: obtenerColorOpcion(opc, idx, opcionesOrdenadas.length) }
            : { borderLeftColor: obtenerColorOpcion(opc, idx, opcionesOrdenadas.length), borderLeftWidth: '5px' }
          "
        >
          <div class="flex items-center gap-3.5 min-w-0 flex-1">
            <!-- Círculo indicador con el color del Semáforo (Rojo, Amarillo o Verde) -->
            <span
              class="w-7 h-7 rounded-full flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-sm border transition-transform duration-200 group-hover:scale-110"
              :style="esOpcionSeleccionada(opc, idx)
                ? { backgroundColor: '#ffffff', color: '#090d16', borderColor: '#ffffff' }
                : { backgroundColor: obtenerColorOpcion(opc, idx, opcionesOrdenadas.length) + '28', color: obtenerColorOpcion(opc, idx, opcionesOrdenadas.length), borderColor: obtenerColorOpcion(opc, idx, opcionesOrdenadas.length) + '99' }
              "
            >
            </span>

            <div class="min-w-0 flex-1">
              <span class="text-sm sm:text-base font-bold leading-snug block whitespace-normal break-words">
                {{ opc.texto }}
              </span>
            </div>
          </div>

          <div class="shrink-0 flex items-center">
            <span
              v-if="esOpcionSeleccionada(opc, idx)"
              class="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border shadow-sm"
              :style="{
                backgroundColor: obtenerColorOpcion(opc, idx, opcionesOrdenadas.length),
                borderColor: '#ffffff',
                color: esOpcionIntermediaAmarilla(idx, opcionesOrdenadas.length) ? '#090d16' : '#ffffff'
              }"
            >
              <CheckCircle2 class="w-3.5 h-3.5 stroke-[2.5]" /> Activa
            </span>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>
