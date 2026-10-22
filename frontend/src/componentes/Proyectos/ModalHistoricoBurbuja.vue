<!--
  ============================================================================
  MODAL BURBUJA: HISTÓRICO DE AÑOS ANTERIORES & COMPARATIVA CON EL MOMENTO ACTUAL (ModalHistoricoBurbuja.vue)
  ============================================================================
  - Permite ingresar datos de porcentaje (%) de años anteriores (ej. 2023, 2024, 2025)
    para realizar una comparación efectiva con el resultado del momento actual.
  - Si no se han ingresado datos de años anteriores, muestra claramente
    "No hay datos de años anteriores".
  - Muestra la gráfica comparativa (histograma) uniendo los años anteriores registrados
    con el porcentaje actual de este momento.
-->

<script setup lang="ts">
import { ref, computed } from 'vue'
import { X, Calendar, BarChart3, AlertCircle, TrendingUp, Info, PlusCircle, Trash2 } from 'lucide-vue-next'
import { useHistoricoPeriodos } from '@/Almacenes/useHistoricoPeriodos'

const props = defineProps<{
  abierto: boolean
  porcentajeClimaActual: number
  totalRespuestas: number
  fechaActualFormateada?: string
}>()

const emit = defineEmits<{
  (e: 'cerrar'): void
}>()

const {
  historicoPeriodos,
  guardarDatoAnioAnterior,
  eliminarDatoAnioAnterior,
  calcularComparativaHistorica
} = useHistoricoPeriodos()

const anioActual = new Date().getFullYear()
const anioIngreso = ref<number>(anioActual - 1)
const porcentajeIngreso = ref<number | string>('')
const notasIngreso = ref<string>('')

const registrosAnteriores = computed(() => {
  return [...historicoPeriodos.value]
    .filter(p => p.anio < anioActual)
    .sort((a, b) => a.anio - b.anio)
})

const comparativa = computed(() => {
  return calcularComparativaHistorica(props.porcentajeClimaActual)
})

const guardarAnio = () => {
  const pct = Number(porcentajeIngreso.value)
  if (isNaN(pct) || pct < 0 || pct > 100 || String(porcentajeIngreso.value).trim() === '') {
    alert('Por favor ingresa un porcentaje válido entre 0% y 100%.')
    return
  }
  if (!anioIngreso.value || anioIngreso.value >= anioActual || anioIngreso.value < 2000) {
    alert(`Por favor ingresa un año anterior a ${anioActual}.`)
    return
  }
  guardarDatoAnioAnterior(Number(anioIngreso.value), pct, notasIngreso.value.trim() || undefined)
  porcentajeIngreso.value = ''
  notasIngreso.value = ''
}

const fechaTexto = computed(() => {
  if (props.fechaActualFormateada) return props.fechaActualFormateada
  const hoy = new Date()
  const d = String(hoy.getDate()).padStart(2, '0')
  const m = String(hoy.getMonth() + 1).padStart(2, '0')
  const y = hoy.getFullYear()
  return `${d}/${m}/${y}`
})

const datosHistograma = computed(() => {
  const barrasPrevias = registrosAnteriores.value.map(reg => ({
    fecha: `Año ${reg.anio}`,
    etiqueta: reg.notas || `Histórico ${reg.anio}`,
    porcentaje: reg.porcentajeSatisfaccion,
    color: reg.porcentajeSatisfaccion >= 75
      ? 'from-blue-500 to-indigo-600'
      : reg.porcentajeSatisfaccion >= 50
        ? 'from-amber-500 to-orange-600'
        : 'from-rose-500 to-red-600',
    esActual: false
  }))

  const barraActual = {
    fecha: `${anioActual} (${fechaTexto.value})`,
    etiqueta: props.totalRespuestas > 0 ? `Momento Actual (${props.totalRespuestas} resp.)` : `Momento Actual (Sin respuestas)`,
    porcentaje: props.totalRespuestas > 0 ? props.porcentajeClimaActual : 0,
    color: props.totalRespuestas > 0 ? 'from-emerald-500 to-teal-600' : 'from-slate-400 to-slate-500',
    esActual: true
  }

  return [...barrasPrevias, barraActual]
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="abierto"
        class="fixed inset-0 z-[99999] flex items-center justify-center p-4 font-['Poppins',sans-serif]"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" @click="emit('cerrar')" />

        <!-- Contenedor Modal -->
        <div class="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 text-left">
          
          <!-- Encabezado con degradado moderno -->
          <div class="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-t-3xl text-white shadow-md">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                <BarChart3 class="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 class="text-base sm:text-lg font-black tracking-tight leading-tight">
                  Comparativa con Años Anteriores & Clima Actual
                </h3>
                <p class="text-xs text-blue-100 font-medium">
                  Ingresa porcentajes de años anteriores para compararlos con el momento actual
                </p>
              </div>
            </div>

            <button
              @click="emit('cerrar')"
              class="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all cursor-pointer text-white"
              title="Cerrar ventana"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Contenido Modal -->
          <div class="px-6 pb-6 space-y-6">

            <!-- ============================================================= -->
            <!-- 1. SECCIÓN: INGRESO Y REGISTRO DE AÑOS ANTERIORES             -->
            <!-- ============================================================= -->
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <h4 class="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Calendar class="w-4 h-4 text-blue-500" />
                  <span>1. Datos de Porcentaje (%) de Años Anteriores</span>
                </h4>
              </div>

              <!-- Formulario para meter porcentaje de años anteriores -->
              <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3">
                <p class="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Ingresar o actualizar porcentaje de años anteriores para comparar:
                </p>
                <div class="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                  <div class="sm:col-span-3 space-y-1">
                    <label class="text-[11px] font-bold text-slate-500">Año Anterior</label>
                    <input
                      v-model.number="anioIngreso"
                      type="number"
                      min="2015"
                      :max="anioActual - 1"
                      class="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div class="sm:col-span-3 space-y-1">
                    <label class="text-[11px] font-bold text-slate-500">% Clima (0 a 100)</label>
                    <input
                      v-model="porcentajeIngreso"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="Ej. 78"
                      class="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div class="sm:col-span-4 space-y-1">
                    <label class="text-[11px] font-bold text-slate-500">Nota (opcional)</label>
                    <input
                      v-model="notasIngreso"
                      type="text"
                      placeholder="Ej. Cierre anual"
                      class="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div class="sm:col-span-2">
                    <button
                      type="button"
                      @click="guardarAnio"
                      class="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold flex items-center justify-center gap-1 cursor-pointer shadow-sm transition-all"
                    >
                      <PlusCircle class="w-3.5 h-3.5" />
                      <span>Guardar</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Si NO hay datos de años anteriores -->
              <div
                v-if="registrosAnteriores.length === 0"
                class="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center gap-3 text-amber-800 dark:text-amber-300 text-sm font-black text-center"
              >
                <AlertCircle class="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>No hay datos de años anteriores</span>
              </div>

              <!-- Si SÍ hay datos de años anteriores -->
              <div v-else class="space-y-3">
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div
                    v-for="item in registrosAnteriores"
                    :key="item.id"
                    class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-center space-y-1.5 relative group"
                  >
                    <button
                      type="button"
                      @click="eliminarDatoAnioAnterior(item.id)"
                      title="Eliminar registro de este año"
                      class="absolute top-2.5 right-2.5 p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                    <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono pr-6">
                      <span class="font-extrabold text-slate-800 dark:text-slate-200">Año {{ item.anio }}</span>
                    </div>
                    <div class="py-1.5">
                      <span class="text-xl font-black font-mono text-blue-600 dark:text-blue-400 bg-blue-500/10 px-3.5 py-1 rounded-xl inline-block border border-blue-500/20">
                        {{ item.porcentajeSatisfaccion }}%
                      </span>
                    </div>
                    <p class="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {{ item.notas || `Porcentaje año ${item.anio}` }}
                    </p>
                  </div>
                </div>

                <!-- Resumen de variación respecto al año anterior más reciente -->
                <div
                  v-if="comparativa.tieneDatosAnteriores && comparativa.periodoAnterior"
                  class="p-3.5 rounded-2xl border flex items-center justify-between flex-wrap gap-2 text-xs"
                  :class="comparativa.esCrecimientoPositivo
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300'"
                >
                  <span class="font-bold">
                    Comparativa Año {{ comparativa.periodoAnterior.anio }} ({{ comparativa.periodoAnteriorPct }}%) vs Momento Actual {{ anioActual }} ({{ porcentajeClimaActual }}%):
                  </span>
                  <span class="font-mono font-black text-sm px-2.5 py-0.5 rounded-lg bg-white/80 dark:bg-slate-900/80">
                    {{ (comparativa.diferenciaPct || 0) >= 0 ? `+${comparativa.diferenciaPct}%` : `${comparativa.diferenciaPct}%` }}
                  </span>
                </div>
              </div>
            </div>

            <!-- ============================================================= -->
            <!-- 2. SECCIÓN: HISTOGRAMA COMPARATIVO CON EL MOMENTO ACTUAL      -->
            <!-- ============================================================= -->
            <div class="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 class="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <TrendingUp class="w-4 h-4 text-emerald-500" />
                    <span>2. Gráfica Comparativa — Años Anteriores vs Momento Actual ({{ anioActual }})</span>
                  </h4>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400">
                    Evolución del porcentaje de satisfacción de clima laboral
                  </p>
                </div>

                <div class="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-2xl">
                  <span class="text-xs font-bold text-emerald-700 dark:text-emerald-300">Momento Actual:</span>
                  <span class="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">
                    {{ porcentajeClimaActual }}%
                  </span>
                </div>
              </div>

              <!-- Gráfico de Histograma -->
              <div class="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-2.5">
                  <span class="font-bold text-slate-700 dark:text-slate-300">Eje Y: % Clima Laboral (0% a 100%)</span>
                  <span class="font-mono text-[11px]">{{ totalRespuestas }} Respuestas actuales</span>
                </div>

                <div class="relative pt-6 pb-2 px-4">
                  <div class="absolute inset-x-4 top-6 bottom-10 flex flex-col justify-between pointer-events-none opacity-40">
                    <div class="border-b border-dashed border-slate-300 dark:border-slate-700 w-full flex justify-end">
                      <span class="text-[9px] font-mono text-slate-400 -mt-2">100%</span>
                    </div>
                    <div class="border-b border-dashed border-slate-300 dark:border-slate-700 w-full flex justify-end">
                      <span class="text-[9px] font-mono text-slate-400 -mt-2">75%</span>
                    </div>
                    <div class="border-b border-dashed border-slate-300 dark:border-slate-700 w-full flex justify-end">
                      <span class="text-[9px] font-mono text-slate-400 -mt-2">50%</span>
                    </div>
                    <div class="border-b border-dashed border-slate-300 dark:border-slate-700 w-full flex justify-end">
                      <span class="text-[9px] font-mono text-slate-400 -mt-2">25%</span>
                    </div>
                    <div class="border-b border-slate-300 dark:border-slate-700 w-full flex justify-end">
                      <span class="text-[9px] font-mono text-slate-400 -mt-2">0%</span>
                    </div>
                  </div>

                  <!-- Barras de Histograma -->
                  <div class="h-56 flex items-end justify-around gap-4 relative z-10 pt-4">
                    <div
                      v-for="(barra, idx) in datosHistograma"
                      :key="idx"
                      class="flex-1 max-w-[140px] flex flex-col items-center group"
                    >
                      <div class="mb-2 font-mono font-black text-xs sm:text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        {{ barra.porcentaje }}%
                      </div>

                      <div class="w-full bg-slate-200 dark:bg-slate-800 rounded-t-2xl relative overflow-hidden h-44 flex items-end">
                        <div
                          class="w-full rounded-t-2xl bg-gradient-to-t transition-all duration-700 shadow-md"
                          :class="barra.color"
                          :style="{ height: `${Math.min(100, Math.max(5, barra.porcentaje))}%` }"
                        />
                      </div>

                      <div class="mt-3 text-center space-y-0.5">
                        <div class="font-mono text-xs font-extrabold text-slate-800 dark:text-slate-200">
                          {{ barra.fecha }}
                        </div>
                        <div class="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          {{ barra.etiqueta }}
                        </div>
                        <span
                          v-if="barra.esActual"
                          class="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold uppercase"
                        >
                          Momento Actual
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between flex-wrap gap-2">
                  <div class="flex items-center gap-2">
                    <Info class="w-4 h-4 text-blue-500 shrink-0" />
                    <span><strong>Fórmula Oficial:</strong> % Clima Laboral = (Puntaje Promedio / 5) × 100</span>
                  </div>
                  <span class="font-mono text-blue-600 dark:text-blue-400 font-bold">
                    Corte: {{ fechaTexto }}
                  </span>
                </div>
              </div>
            </div>

          </div>

          <!-- Pie del Modal -->
          <div class="px-6 py-4 bg-slate-50 dark:bg-slate-950/60 rounded-b-3xl border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <button
              @click="emit('cerrar')"
              class="px-5 py-2.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-md"
            >
              Entendido / Cerrar
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>
