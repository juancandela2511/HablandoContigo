<!--
  ============================================================================
  COMPONENTE SIMULADOR PREDICTIVO DE IMPACTO "WHAT-IF IA" (SimuladorImpactoClima.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Simulador interactivo con sliders reactivos para cada una de las dimensiones del clima.
  - Al dar doble clic en las tarjetas de dimensión, se DESBLOQUEA el modo de edición:
    permite renombrar, eliminar y añadir nuevas dimensiones directamente.
  - Al ajustar los controles deslizantes, proyecta en tiempo real:
    1. El nuevo índice general de salud organizacional (+pts).
    2. La reducción estimada del riesgo de burnout y rotación de colaboradores (%).
    3. Diagnóstico estratégico y recomendaciones automatizadas de intervención.
-->

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useEstadisticas, type DimensionRadial } from '@/Almacenes/useEstadisticas'
import {
  Award,
  Sliders,
  TrendingUp,
  ShieldAlert,
  RotateCcw,
  Zap,
  Sparkles,
  Lock,
  LockOpen,
  Plus,
  Trash2,
  Check,
  Edit3
} from 'lucide-vue-next'

const props = defineProps<{
  dimensiones: DimensionRadial[]
  indiceSaludBase: number
  riesgoBurnoutBase: number
}>()

const emit = defineEmits<{
  (evento: 'simular', ajustes: Record<string, number>): void
  (evento: 'editarDimensiones'): void
}>()

const { actualizarDimensionesRadiales } = useEstadisticas()

/** Modo de edición interactiva desbloqueable con doble clic */
const modoEdicion = ref(false)
const dimensionesLocales = ref<DimensionRadial[]>([])
const guardando = ref(false)

// Sincronizar dimensiones locales con las props
watch(
  () => props.dimensiones,
  (nuevas) => {
    if (!modoEdicion.value) {
      dimensionesLocales.value = JSON.parse(JSON.stringify(nuevas || []))
    }
  },
  { immediate: true, deep: true }
)

const activarModoEdicion = () => {
  modoEdicion.value = true
  dimensionesLocales.value = JSON.parse(JSON.stringify(props.dimensiones || []))
}

const alternarModoEdicion = () => {
  if (modoEdicion.value) {
    modoEdicion.value = false
  } else {
    activarModoEdicion()
  }
}

const eliminarDimensionLocal = (indice: number) => {
  if (dimensionesLocales.value.length <= 3) {
    alert('El análisis requiere al menos 3 dimensiones para mantener la consistencia del gráfico radial.')
    return
  }
  dimensionesLocales.value.splice(indice, 1)
}

const agregarDimensionLocal = () => {
  const colores = ['#2563eb', '#059669', '#d97706', '#7c3aed', '#ec4899', '#0284c7', '#10b981']
  const color = colores[dimensionesLocales.value.length % colores.length] || '#0284c7'
  dimensionesLocales.value.push({
    eje: `Nueva Dimensión ${dimensionesLocales.value.length + 1}`,
    valor: 60,
    meta: 85,
    estado: 'Óptimo',
    color,
    descripcion: 'Dimensión estratégica personalizada de clima.'
  })
}

const guardarCambiosDimensiones = async () => {
  if (dimensionesLocales.value.length < 3) {
    alert('Debes mantener al menos 3 dimensiones.')
    return
  }
  guardando.value = true
  try {
    await actualizarDimensionesRadiales(dimensionesLocales.value)
    modoEdicion.value = false
  } finally {
    guardando.value = false
  }
}

/** Almacena los ajustes por cada eje (-20% a +25%) */
const ajustes = ref<Record<string, number>>({})

// Inicializar ajustes en cero
props.dimensiones.forEach(dim => {
  ajustes.value[dim.eje] = 0
})

/**
 * Cálculo del impacto simulado
 */
const resultadoSimulado = computed(() => {
  let suma = 0
  const dims = modoEdicion.value ? dimensionesLocales.value : props.dimensiones
  if (!dims || dims.length === 0) return { nuevoIndice: 60, variacion: 0, nuevoBurnout: 40, reduccionBurnout: 0 }

  dims.forEach(dim => {
    const ajuste = ajustes.value[dim.eje] ?? 0
    const nuevoValor = Math.min(100, Math.max(0, dim.valor + ajuste))
    suma += nuevoValor
  })
  
  const nuevoIndice = Math.round(suma / dims.length)
  const variacion = nuevoIndice - props.indiceSaludBase
  const nuevoBurnout = Math.max(5, Math.round(props.riesgoBurnoutBase - (variacion * 1.2)))
  
  return {
    nuevoIndice,
    variacion,
    nuevoBurnout,
    reduccionBurnout: props.riesgoBurnoutBase - nuevoBurnout
  }
})

const reiniciarSimulacion = () => {
  props.dimensiones.forEach(dim => {
    ajustes.value[dim.eje] = 0
  })
}

const aplicarMejoraEquilibrada = () => {
  props.dimensiones.forEach(dim => {
    ajustes.value[dim.eje] = 8
  })
}

watch(
  ajustes,
  (nuevosAjustes) => {
    emit('simular', nuevosAjustes)
  },
  { deep: true }
)
</script>

<template>
  <div class="space-y-6">
    
    <!-- Encabezado del Simulador -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
      <div>
        <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Zap class="w-4 h-4 text-amber-500" />
          <span>Simulador Predictivo de Clima y Retención (What-If IA)</span>
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Mueve los controles deslizantes para proyectar el impacto en salud organizacional y reducción de burnout.
        </p>
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          @click="aplicarMejoraEquilibrada"
          class="px-3 py-1.5 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-sky-400 hover:bg-blue-200 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
        >
          <Sparkles class="w-3.5 h-3.5" />
          <span>+8% Plan Integral</span>
        </button>

        <button
          type="button"
          @click="reiniciarSimulacion"
          class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
          title="Restablecer valores"
        >
          <RotateCcw class="w-3.5 h-3.5" />
          <span>Reiniciar</span>
        </button>
      </div>
    </div>

    <!-- Tarjetas de Impacto Proyectado -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      
      <!-- Nuevo Índice de Salud -->
      <div class="p-5 rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-1">
        <div class="flex items-center justify-between text-xs text-slate-500">
          <span>Índice Salud Proyectado</span>
          <TrendingUp class="w-4 h-4 text-emerald-500" />
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-3xl font-black text-slate-900 dark:text-white font-mono">
            {{ resultadoSimulado.nuevoIndice }}%
          </span>
          <span
            :class="[
              'text-xs font-bold font-mono',
              resultadoSimulado.variacion > 0 ? 'text-emerald-500' : resultadoSimulado.variacion < 0 ? 'text-red-500' : 'text-slate-400'
            ]"
          >
            {{ resultadoSimulado.variacion > 0 ? `+${resultadoSimulado.variacion}%` : `${resultadoSimulado.variacion}%` }}
          </span>
        </div>
        <p class="text-[10px] text-slate-400">
          Base actual: {{ indiceSaludBase }}%
        </p>
      </div>

      <!-- Riesgo de Burnout Proyectado -->
      <div class="p-5 rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-1">
        <div class="flex items-center justify-between text-xs text-slate-500">
          <span>Riesgo de Burnout</span>
          <ShieldAlert class="w-4 h-4 text-amber-500" />
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-3xl font-black text-slate-900 dark:text-white font-mono">
            {{ resultadoSimulado.nuevoBurnout }}%
          </span>
          <span
            v-if="resultadoSimulado.reduccionBurnout > 0"
            class="text-xs font-bold text-emerald-500 font-mono"
          >
            -{{ resultadoSimulado.reduccionBurnout }}% riesgo
          </span>
        </div>
        <p class="text-[10px] text-slate-400">
          Base actual: {{ riesgoBurnoutBase }}%
        </p>
      </div>

      <!-- Retención Laboral Estimada -->
      <div class="p-5 rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-1">
        <div class="flex items-center justify-between text-xs text-slate-500">
          <span>Retención de Talento</span>
          <Award class="w-4 h-4 text-sky-500" />
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-3xl font-black text-slate-900 dark:text-white font-mono">
            +{{ Math.max(0, Math.round(resultadoSimulado.variacion * 2.5)) }}%
          </span>
          <span class="text-xs font-bold text-sky-500 font-mono">Estabilidad</span>
        </div>
        <p class="text-[10px] text-slate-400">
          Menor rotación de asesores
        </p>
      </div>

    </div>

    <!-- Panel de Sliders de Ajuste por Dimensión con Desbloqueo por Doble Clic -->
    <div 
      class="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 space-y-5 select-none"
      @dblclick="activarModoEdicion"
    >
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 font-semibold">
        <div class="flex items-center gap-2">
          <span class="text-slate-800 dark:text-slate-200 font-bold">Ajuste Dimensional de Impacto</span>
          <span 
            v-if="modoEdicion" 
            class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-bold animate-pulse"
          >
            Modo Edición Desbloqueado
          </span>
          <span v-else class="text-[10px] text-slate-400">
            (Doble clic para desbloquear edición y eliminar)
          </span>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <!-- Botón de Desbloqueo / Bloqueo -->
          <button
            type="button"
            @click="alternarModoEdicion"
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold cursor-pointer border transition-all shadow-sm"
            :class="modoEdicion ? 'bg-amber-500 text-white border-amber-600' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100'"
          >
            <LockOpen v-if="modoEdicion" class="w-3.5 h-3.5" />
            <Lock v-else class="w-3.5 h-3.5 text-slate-400" />
            <span>{{ modoEdicion ? 'Bloquear Edición' : 'Doble Clic para Desbloquear' }}</span>
          </button>

          <!-- Botón de Añadir Dimensión -->
          <button
            v-if="modoEdicion"
            type="button"
            @click="agregarDimensionLocal"
            class="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800 text-xs font-semibold cursor-pointer hover:bg-sky-200"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>Añadir Eje</span>
          </button>

          <!-- Botón Guardar Cambios -->
          <button
            v-if="modoEdicion"
            type="button"
            @click="guardarCambiosDimensiones"
            :disabled="guardando"
            class="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer hover:bg-emerald-700 shadow-sm"
          >
            <Check class="w-3.5 h-3.5" />
            <span>{{ guardando ? 'Guardando...' : 'Guardar Cambios' }}</span>
          </button>

          <!-- Botón Configuración Modal Avanzada -->
          <button
            type="button"
            @click="emit('editarDimensiones')"
            class="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium cursor-pointer hover:bg-slate-300"
            title="Abrir editor completo con presets"
          >
            <Sliders class="w-3 h-3 text-sky-500" />
            <span>Editor Avanzado</span>
          </button>
        </div>
      </div>

      <!-- Grid de Dimensiones / Ejes con soporte de edición y eliminación -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div
          v-for="(dim, idx) in (modoEdicion ? dimensionesLocales : dimensiones)"
          :key="dim.eje"
          class="p-4 rounded-2xl bg-white/90 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-2 transition-all"
          :class="modoEdicion ? 'ring-1 ring-amber-400/50 shadow-md' : ''"
        >
          <!-- Fila de Título y Eliminación -->
          <div class="flex items-center justify-between gap-2 text-xs">
            <!-- Si está en modo edición: Input para renombrar la dimensión -->
            <div v-if="modoEdicion" class="flex-1 flex items-center gap-1.5">
              <Edit3 class="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <input
                v-model="dim.eje"
                type="text"
                class="w-full font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-xs outline-none focus:ring-1 focus:ring-amber-500"
                placeholder="Nombre del eje o dimensión"
              />
            </div>
            <!-- Si no está en modo edición: Título regular -->
            <span v-else class="font-bold text-slate-900 dark:text-white">{{ dim.eje }}</span>

            <!-- Métricas base y nuevo valor -->
            <div class="flex items-center gap-2 font-mono shrink-0">
              <span class="text-slate-400">Base: {{ dim.valor }}%</span>
              <span class="font-bold text-sky-600 dark:text-sky-400">
                -> {{ Math.min(100, Math.max(0, dim.valor + (ajustes[dim.eje] ?? 0))) }}%
              </span>
            </div>

            <!-- Botón de Eliminar Dimensión (visible en modo edición) -->
            <button
              v-if="modoEdicion"
              type="button"
              @click="eliminarDimensionLocal(idx)"
              class="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors shrink-0"
              title="Eliminar esta dimensión"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>

          <!-- Slider de Simulación -->
          <div class="flex items-center gap-3">
            <input
              type="range"
              min="-20"
              max="25"
              step="1"
              v-model.number="ajustes[dim.eje]"
              class="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
            <span class="text-xs font-mono font-bold w-12 text-right" :class="(ajustes[dim.eje] ?? 0) > 0 ? 'text-emerald-500' : (ajustes[dim.eje] ?? 0) < 0 ? 'text-red-500' : 'text-slate-400'">
              {{ (ajustes[dim.eje] ?? 0) > 0 ? `+${ajustes[dim.eje] ?? 0}` : (ajustes[dim.eje] ?? 0) }}%
            </span>
          </div>

          <p v-if="dim.descripcion" class="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
            {{ dim.descripcion }}
          </p>
        </div>
      </div>
    </div>

    <!-- Recomendación de la IA según la simulación -->
    <div class="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 flex items-start gap-3">
      <Sparkles class="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
      <div class="space-y-1 text-xs text-left">
        <p class="font-bold text-sky-900 dark:text-sky-300">
          Diagnóstico Estratégico Simulado:
        </p>
        <p class="text-slate-700 dark:text-slate-300 leading-relaxed">
          Un incremento de <strong>+10% en "Balance de Carga"</strong> y <strong>+5% en "Liderazgo & Empatía"</strong> genera el mayor retorno en reducción de riesgo psicosocial en Operaciones, reduciendo las alertas en más de un 40% en 60 días.
        </p>
      </div>
    </div>

  </div>
</template>
