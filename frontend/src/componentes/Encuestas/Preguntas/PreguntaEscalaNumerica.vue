<!--
  ============================================================================
  PREGUNTA DE ESCALA PARA COLABORADORES (PreguntaEscalaNumerica.vue)
  - Muestra todas las opciones configuradas en la pregunta.
  - Aplica progresión de color de menor puntaje en ROJO (#ef4444) avanzando hasta
    el mayor puntaje en VERDE (#10b981) o el color personalizado de la opción.
  ============================================================================
-->

<script setup lang="ts">
import { computed } from 'vue'
import type { OpcionPregunta } from '@/ia'

const props = defineProps<{
  opciones?: OpcionPregunta[]
  respuestaSeleccionada: any
}>()

const emit = defineEmits<{
  (e: 'seleccionar', opcion: OpcionPregunta): void
}>()

// Ordenar de menor a mayor puntaje para que de izquierda a derecha vaya de Rojo (menor) a Verde (mayor)
const opcionesOrdenadas = computed<OpcionPregunta[]>(() => {
  const ops = props.opciones || []
  return [...ops].sort((a, b) => {
    const vA = typeof a.valor === 'number' ? a.valor : 0
    const vB = typeof b.valor === 'number' ? b.valor : 0
    return vA - vB
  })
})

const obtenerColorOpcion = (opc: OpcionPregunta, idx: number, total: number): string => {
  if (opc?.color && opc.color.trim().length > 0) return opc.color
  const r = total > 1 ? idx / (total - 1) : 0.5
  const val = typeof opc?.valor === 'number' ? opc.valor : Math.round(1 + r * 4)
  if (val <= 1 || r <= 0.2) return '#ef4444' // Rojo menor puntaje
  if (val === 2 || r <= 0.4) return '#f97316' // Naranja
  if (val === 3 || r <= 0.6) return '#f59e0b' // Ámbar / Amarillo
  if (val === 4 || r <= 0.8) return '#22c55e' // Verde claro
  return '#10b981' // Verde mayor
}

const esSeleccionada = (opc: OpcionPregunta): boolean => {
  if (!props.respuestaSeleccionada) return false
  const txt = typeof props.respuestaSeleccionada === 'object'
    ? props.respuestaSeleccionada.texto
    : String(props.respuestaSeleccionada)
  return txt === opc.texto || props.respuestaSeleccionada?.id === opc.id
}
</script>

<template>
  <div class="space-y-3 pt-2 text-left">
    <div class="grid grid-cols-1 sm:grid-cols-5 gap-2.5 sm:gap-3">
      <button
        v-for="(opc, idx) in opcionesOrdenadas"
        :key="opc.id || idx"
        type="button"
        @click="emit('seleccionar', opc)"
        :class="[
          'p-3.5 sm:p-4 rounded-2xl border-2 text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-1.5 group min-h-[64px]',
          esSeleccionada(opc)
            ? 'text-white shadow-xl scale-[1.03] font-black'
            : 'bg-slate-900/85 text-slate-200 hover:scale-[1.01] font-bold'
        ]"
        :style="esSeleccionada(opc)
          ? { backgroundColor: obtenerColorOpcion(opc, idx, opcionesOrdenadas.length), borderColor: '#ffffff', boxShadow: `0 0 25px ${obtenerColorOpcion(opc, idx, opcionesOrdenadas.length)}66` }
          : { borderColor: obtenerColorOpcion(opc, idx, opcionesOrdenadas.length) + '88', backgroundColor: obtenerColorOpcion(opc, idx, opcionesOrdenadas.length) + '18' }
        "
      >
        <span
          class="w-3 h-3 rounded-full shrink-0"
          :style="{ backgroundColor: esSeleccionada(opc) ? '#ffffff' : obtenerColorOpcion(opc, idx, opcionesOrdenadas.length) }"
        />
        <span class="text-xs sm:text-sm tracking-tight text-center leading-snug">
          {{ opc.texto }}
        </span>
      </button>
    </div>

    <div class="flex items-center justify-between text-[11px] font-bold px-1 font-sans">
      <span class="text-rose-400">🔴 Menor puntaje</span>
      <span class="text-emerald-400">🟢 Mayor puntaje</span>
    </div>
  </div>
</template>
