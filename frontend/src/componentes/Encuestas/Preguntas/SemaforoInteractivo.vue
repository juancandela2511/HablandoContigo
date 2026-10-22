<!--
  ============================================================================
  COMPONENTE INTERACTIVO DE SEMÁFORO (SemaforoInteractivo.vue)
  ============================================================================

  ¿QUÉ ES Y QUÉ HACE?
  Componente gráfico e interactivo de semáforo vertical para la selección de
  respuestas en encuestas.
  - Muestra TODAS las opciones de respuesta configuradas en la pregunta, ordenadas
    desde el menor puntaje en ROJO (#ef4444) avanzando por naranja (#f97316),
    amarillo/ámbar (#f59e0b), verde claro (#22c55e) hasta el mayor puntaje en VERDE (#10b981).
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

// Ordenar todas las opciones de menor a mayor puntaje (Rojo -> Verde)
const opcionesOrdenadas = computed<OpcionPregunta[]>(() => {
  const lista = props.opciones || []
  if (lista.length === 0) {
    return [
      { id: 'sem-1', texto: 'Opción 1 (Desfavorable)', valor: 1, esAlerta: true, color: '#ef4444' },
      { id: 'sem-2', texto: 'Opción 2 (Neutral)', valor: 3, esAlerta: false, color: '#f59e0b' },
      { id: 'sem-3', texto: 'Opción 3 (Favorable)', valor: 5, esAlerta: false, color: '#10b981' }
    ]
  }
  return [...lista].sort((a, b) => {
    const vA = typeof a.valor === 'number' ? a.valor : 0
    const vB = typeof b.valor === 'number' ? b.valor : 0
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
  return '#10b981' // Verde mayor
}

const indiceSeleccionado = ref<number>(-1)

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
  <div class="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6 text-center font-['Poppins',sans-serif]">
    
    <!-- CONTENEDOR PRINCIPAL: SEMÁFORO Y TODAS LAS TARJETAS DE OPCIÓN -->
    <div class="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12 py-2">
      
      <!-- 🚦 ESTRUCTURA DEL SEMÁFORO VECTORIAL DINÁMICO -->
      <div class="flex flex-col items-center space-y-4">
        <div class="relative w-28 sm:w-32 bg-slate-950 p-3 sm:p-4 rounded-3xl border-4 border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col items-center gap-3">
          <div class="absolute -top-3 w-20 h-3 bg-slate-900 rounded-t-full border-t border-slate-700/50" />

          <!-- UNA LUZ POR CADA OPCIÓN ORDENADA DE ROJO (MENOR) A VERDE (MAYOR) -->
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
              :style="indiceSeleccionado === idx
                ? {
                    backgroundColor: obtenerColorOpcion(opc, idx, opcionesOrdenadas.length),
                    borderColor: '#ffffff',
                    boxShadow: `0 0 30px ${obtenerColorOpcion(opc, idx, opcionesOrdenadas.length)}`,
                    transform: 'scale(1.08)'
                  }
                : {
                    backgroundColor: obtenerColorOpcion(opc, idx, opcionesOrdenadas.length) + '28',
                    borderColor: '#1e293b'
                  }
              "
            >
              <div class="absolute top-1.5 left-2 w-5 h-2.5 bg-white/40 rounded-full rotate-[-25deg] blur-[0.5px] pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      <!-- 📋 DESGLOSE DE TODAS LAS OPCIONES DE LA PREGUNTA -->
      <div class="flex-1 w-full max-w-md space-y-2.5 text-left">
        <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Opciones de Respuesta</span>
          <span class="text-[10px] text-slate-400 font-mono">
            Rojo (Menor) ➔ Verde (Mayor)
          </span>
        </p>

        <div
          v-for="(opc, idx) in opcionesOrdenadas"
          :key="opc.id || idx"
          @click="seleccionarIndice(idx)"
          class="p-3.5 sm:p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer flex items-center justify-between gap-3 shadow-md"
          :class="indiceSeleccionado === idx ? 'text-white font-black scale-[1.01]' : 'bg-slate-800/60 border-slate-700/60 hover:border-slate-600 text-slate-300'"
          :style="indiceSeleccionado === idx
            ? { backgroundColor: obtenerColorOpcion(opc, idx, opcionesOrdenadas.length) + '33', borderColor: obtenerColorOpcion(opc, idx, opcionesOrdenadas.length) }
            : { borderLeftColor: obtenerColorOpcion(opc, idx, opcionesOrdenadas.length), borderLeftWidth: '5px' }
          "
        >
          <div class="flex items-center gap-3">
            <span
              class="w-4 h-4 rounded-full shrink-0"
              :style="{
                backgroundColor: obtenerColorOpcion(opc, idx, opcionesOrdenadas.length),
                boxShadow: `0 0 10px ${obtenerColorOpcion(opc, idx, opcionesOrdenadas.length)}`
              }"
            />
            <span class="text-xs sm:text-sm font-bold leading-snug">
              {{ opc.texto }}
            </span>
          </div>
          <span
            v-if="indiceSeleccionado === idx"
            class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border shrink-0"
            :style="{
              backgroundColor: obtenerColorOpcion(opc, idx, opcionesOrdenadas.length) + '33',
              borderColor: obtenerColorOpcion(opc, idx, opcionesOrdenadas.length),
              color: '#ffffff'
            }"
          >
            <CheckCircle2 class="w-3 h-3" /> Activa
          </span>
        </div>

      </div>

    </div>
  </div>
</template>
