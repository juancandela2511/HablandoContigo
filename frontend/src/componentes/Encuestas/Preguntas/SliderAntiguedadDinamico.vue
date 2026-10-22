<!--
  ============================================================================
  SLIDER DE ANTIGÜEDAD DINÁMICO POR MESES (SliderAntiguedadDinamico.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Proporciona un control deslizante interactivo en MESES para seleccionar la
  antigüedad en la empresa:
  - El colaborador gradúa su tiempo directamente en meses sobre la línea deslizadora
    (la opción se actualiza sola al mover sin repetir botones debajo).
  - Si desliza a MÁS DE 3 AÑOS (> 36 meses), se encasilla automáticamente en
    "Más de 3 años", conservando los meses exactos para calcular el promedio
    exacto de antigüedad de los empleados en el Dashboard.
  - Aplica progresión de color desde Rojo (menor puntaje) hasta Verde (mayor puntaje).
-->

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { OpcionPregunta } from '@/ia'

const props = withDefaults(
  defineProps<{
    modelValue?: number
    fechaIngreso?: string
    maxAnos?: number
    maxMeses?: number
    opciones?: OpcionPregunta[]
    respuestaSeleccionada?: any
  }>(),
  {
    modelValue: 1,
    fechaIngreso: '',
    maxAnos: 5,
    opciones: () => []
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', valorMeses: number): void
  (e: 'seleccionar', opcion: OpcionPregunta): void
  (e: 'cambioAntiguedad', payload: {
    totalMeses: number
    anos: number
    meses: number
    textoFormateado: string
    etapa: string
    emoji: string
    riesgo: 'Alto' | 'Moderado' | 'Bajo'
  }): void
}>()

// Respetar exactamente el límite configurado en la pregunta (maxMeses o maxAnos * 12 meses)
const maxAnosEfectivo = computed(() => Math.max(1, props.maxAnos || 5))
const totalMesesMax = computed(() => {
  if (props.maxMeses && props.maxMeses > 0) return Math.max(1, props.maxMeses)
  return maxAnosEfectivo.value * 12
})
const mesesSeleccionados = ref<number>(1)

// Opciones ordenadas de menor a mayor puntaje
const opcionesOrdenadas = computed<OpcionPregunta[]>(() => {
  const ops = props.opciones || []
  if (ops.length === 0) {
    return [
      { id: 'ant-1', texto: 'Menos de 6 meses', valor: 1, esAlerta: false, color: '#ef4444' },
      { id: 'ant-2', texto: 'De 6 meses a 1 año', valor: 2, esAlerta: false, color: '#f97316' },
      { id: 'ant-3', texto: 'De 1 a 3 años', valor: 3, esAlerta: false, color: '#f59e0b' },
      { id: 'ant-4', texto: 'Más de 3 años', valor: 4, esAlerta: false, color: '#10b981' }
    ]
  }
  return [...ops].sort((a, b) => {
    const vA = typeof a.valor === 'number' ? a.valor : 0
    const vB = typeof b.valor === 'number' ? b.valor : 0
    return vA - vB
  })
})

const obtenerColorOpcion = (opc: OpcionPregunta | null | undefined, idx: number, total: number): string => {
  if (opc?.color && opc.color.trim().length > 0) return opc.color
  const r = total > 1 ? idx / (total - 1) : 0.5
  const val = typeof opc?.valor === 'number' ? opc.valor : Math.round(1 + r * 4)
  if (val <= 1 || r <= 0.2) return '#ef4444'
  if (val === 2 || r <= 0.4) return '#f97316'
  if (val === 3 || r <= 0.6) return '#f59e0b'
  if (val === 4 && total > 4) return '#22c55e'
  return '#10b981'
}

const calcularMesesDesdeFecha = (fechaStr?: string): number => {
  try {
    if (!fechaStr) return props.modelValue || 1
    const fechaInicio = new Date(fechaStr)
    if (isNaN(fechaInicio.getTime())) return props.modelValue || 1
    const hoy = new Date()
    const diffAnos = hoy.getFullYear() - fechaInicio.getFullYear()
    const diffMeses = hoy.getMonth() - fechaInicio.getMonth()
    const total = Math.max(1, diffAnos * 12 + diffMeses)
    return Math.min(total, totalMesesMax.value)
  } catch (error) {
    return 1
  }
}

const anosCalculados = computed(() => Math.floor(mesesSeleccionados.value / 12))
const mesesRestantesCalculados = computed(() => mesesSeleccionados.value % 12)

const textoFormateado = computed(() => {
  const total = mesesSeleccionados.value
  return `${total} ${total === 1 ? 'mes' : 'meses'}`
})

const etapaDetalle = computed(() => {
  const total = mesesSeleccionados.value
  const ops = opcionesOrdenadas.value

  if (total < 6) {
    const opc = ops[0]
    return {
      emoji: '👶',
      etapa: opc?.texto || 'Menos de 6 meses',
      subtexto: 'Fase de adaptación inicial y primeros aprendizajes',
      colorHex: obtenerColorOpcion(opc, 0, ops.length || 4),
      riesgo: 'Alto' as const,
      indiceCategoria: 0
    }
  } else if (total < 12) {
    const opc = ops[1] || ops[0]
    return {
      emoji: '🧒',
      etapa: opc?.texto || 'De 6 meses a 1 año',
      subtexto: 'Tramo de integración laboral',
      colorHex: obtenerColorOpcion(opc, 1, ops.length || 4),
      riesgo: 'Moderado' as const,
      indiceCategoria: 1
    }
  } else if (total <= 36) {
    const opc = ops[2] || ops[1] || ops[0]
    return {
      emoji: '🧑‍💼',
      etapa: opc?.texto || 'De 1 a 3 años',
      subtexto: 'Consolidación y dominio operativo',
      colorHex: obtenerColorOpcion(opc, 2, ops.length || 4),
      riesgo: 'Bajo' as const,
      indiceCategoria: 2
    }
  } else {
    const opc = ops[ops.length - 1]
    return {
      emoji: '👴',
      etapa: opc?.texto || 'Más de 3 años',
      subtexto: 'Gran trayectoria y alta fidelidad institucional',
      colorHex: obtenerColorOpcion(opc, 3, ops.length || 4),
      riesgo: 'Bajo' as const,
      indiceCategoria: 3
    }
  }
})

const notificarCambio = (val: number) => {
  mesesSeleccionados.value = val
  emit('update:modelValue', val)
  emit('cambioAntiguedad', {
    totalMeses: val,
    anos: anosCalculados.value,
    meses: mesesRestantesCalculados.value,
    textoFormateado: textoFormateado.value,
    etapa: etapaDetalle.value.etapa,
    emoji: etapaDetalle.value.emoji,
    riesgo: etapaDetalle.value.riesgo
  })
}

onMounted(() => {
  if (props.fechaIngreso) {
    mesesSeleccionados.value = calcularMesesDesdeFecha(props.fechaIngreso)
  } else if (props.respuestaSeleccionada && typeof props.respuestaSeleccionada === 'object') {
    const com = String(props.respuestaSeleccionada.comentario || '')
    const matchM = com.match(/^(\d+)\s*mes/i)
    if (matchM && matchM[1]) {
      mesesSeleccionados.value = Math.max(1, Math.min(parseInt(matchM[1], 10), totalMesesMax.value))
    }
  } else if (props.modelValue) {
    mesesSeleccionados.value = Math.max(1, Math.min(props.modelValue, totalMesesMax.value))
  }
  if (!props.respuestaSeleccionada) {
    notificarCambio(mesesSeleccionados.value)
  }
})

watch(() => props.fechaIngreso, (nuevaFecha) => {
  if (nuevaFecha) {
    mesesSeleccionados.value = calcularMesesDesdeFecha(nuevaFecha)
    notificarCambio(mesesSeleccionados.value)
  }
})

const alCambiarSlider = (e: Event) => {
  const val = Number((e.target as HTMLInputElement).value)
  notificarCambio(val)
}

const porcentajeProgreso = computed(() => {
  return ((mesesSeleccionados.value - 1) / Math.max(1, totalMesesMax.value - 1)) * 100
})
</script>

<template>
  <div class="p-6 rounded-3xl bg-slate-900 border border-slate-700/60 shadow-2xl space-y-6 text-center font-['Poppins',sans-serif]">
    <!-- EMOJI PROGRESIVO Y TEXTO DINÁMICO EN MESES -->
    <div class="flex flex-col items-center justify-center space-y-3">
      <div class="relative flex items-center justify-center group">
        <div
          class="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center text-5xl sm:text-6xl shadow-2xl border-4 border-white/20 transition-all duration-500"
          :style="{ backgroundColor: etapaDetalle.colorHex }"
        >
          <span class="drop-shadow-lg transform transition-transform duration-300 group-hover:scale-110 select-none">
            {{ etapaDetalle.emoji }}
          </span>
        </div>
      </div>

      <div class="space-y-1">
        <h3 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {{ textoFormateado }}
        </h3>
        <div class="flex items-center justify-center">
          <span
            class="px-3.5 py-1 rounded-full text-xs font-black border text-white"
            :style="{ backgroundColor: etapaDetalle.colorHex + '33', borderColor: etapaDetalle.colorHex }"
          >
            {{ etapaDetalle.etapa }}
          </span>
        </div>
      </div>
    </div>

    <!-- CONTROL DESLIZABLE POR MESES (LIMPIO, SIN NADA DEBAJO DE LA LÍNEA) -->
    <div class="px-1">
      <div class="relative flex items-center">
        <input
          type="range"
          min="1"
          :max="totalMesesMax"
          step="1"
          :value="mesesSeleccionados"
          @input="alCambiarSlider"
          class="w-full h-3.5 rounded-lg appearance-none cursor-pointer bg-slate-800 transition-all"
          :style="{
            background: `linear-gradient(to right, #ef4444 0%, ${etapaDetalle.colorHex} ${porcentajeProgreso}%, #334155 ${porcentajeProgreso}%, #334155 100%)`
          }"
        />
      </div>
    </div>
  </div>
</template>
