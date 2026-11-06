<!--
  ============================================================================
  MODAL BURBUJA: COMPARATIVA EQUIVALENTE 1 A 1 DE PROYECTOS (ModalHistoricoBurbuja.vue)
  ============================================================================
  - Garantiza equivalencia estricta 1 a 1 entre los proyectos existentes y las
    barras/tarjetas comparativas:
      * 1 proyecto  = 1 comparativa
      * 2 proyectos = 2 comparativas
      * 3 proyectos = 3 comparativas
  - Calcula en tiempo real el % de satisfacción y total de respuestas de cada
    proyecto (tanto activos como finalizados).
-->

<script setup lang="ts">
import { computed } from 'vue'
import { X, BarChart3, TrendingUp, Info, FolderKanban } from 'lucide-vue-next'
import { useEncuestas } from '@/Almacenes/useEncuestas'
import { calcularClimaGlobalDeRespuestas } from '@/services/calculadorClimaService'

const props = defineProps<{
  abierto: boolean
  porcentajeClimaActual: number
  totalRespuestas: number
  fechaActualFormateada?: string
}>()

const emit = defineEmits<{
  (e: 'cerrar'): void
}>()

const { encuestas, respuestasAnonimas } = useEncuestas()

const anioActual = new Date().getFullYear()

const fechaTexto = computed(() => {
  if (props.fechaActualFormateada) return props.fechaActualFormateada
  const hoy = new Date()
  const d = String(hoy.getDate()).padStart(2, '0')
  const m = String(hoy.getMonth() + 1).padStart(2, '0')
  const y = hoy.getFullYear()
  return `${d}/${m}/${y}`
})

// Lista organizada de proyectos idéntica a ProyectosView.vue (Equivalencia 1 a 1 estricta)
const listaProyectosOrganizada = computed(() => {
  const master = encuestas.value.find(e => e.id === 'enc-001')
  const otros = encuestas.value.filter(e => e.id !== 'enc-001')
  if (master) {
    return [master, ...otros]
  }
  return encuestas.value
})

// Equivalencia 1 a 1: Cada proyecto existente genera exactamente 1 elemento comparativo
const comparativasPorProyecto = computed(() => {
  return listaProyectosOrganizada.value.map((enc, idx) => {
    const esFinalizado = enc.estado === 'Finalizada'

    // Respuestas correspondientes a este proyecto
    const respuestasDelProyecto = respuestasAnonimas.value.filter(r =>
      r.idEncuesta === enc.id || (enc.id === 'enc-001' && (!r.idEncuesta || r.idEncuesta === 'enc-001'))
    )

    let totalResp = 0
    let porcentajeSatisfaccion = 0

    if (esFinalizado) {
      totalResp = enc.respuestasArchivadas?.length ?? enc.totalRespuestas ?? 0
      if (Array.isArray(enc.respuestasArchivadas) && enc.respuestasArchivadas.length > 0) {
        porcentajeSatisfaccion = calcularClimaGlobalDeRespuestas(enc.respuestasArchivadas).porcentajeClima
      } else if (typeof enc.porcentajeClimaFinal === 'number') {
        porcentajeSatisfaccion = enc.porcentajeClimaFinal
      } else {
        porcentajeSatisfaccion = 0
      }
    } else {
      totalResp = respuestasDelProyecto.length
      porcentajeSatisfaccion = totalResp > 0
        ? calcularClimaGlobalDeRespuestas(respuestasDelProyecto).porcentajeClima
        : 0
    }

    const tituloMostrar = idx === 0 && enc.id === 'enc-001'
      ? 'Proyecto Clima Laboral'
      : (enc.titulo || `Proyecto ${idx + 1}`)

    return {
      id: enc.id,
      numeroProyecto: idx + 1,
      anio: enc.anioCierre || anioActual,
      titulo: tituloMostrar,
      departamento: enc.departamento || 'General',
      fecha: esFinalizado
        ? (enc.fechaFinalizacion || enc.fechaCreacion || fechaTexto.value)
        : (enc.fechaCreacion || fechaTexto.value),
      porcentajeSatisfaccion,
      totalRespuestas: totalResp,
      esFinalizado,
      estado: esFinalizado ? 'Finalizado' : 'Activo'
    }
  })
})

// Comparativa entre el último proyecto y el anterior cuando existen 2 o más proyectos
const comparativa = computed(() => {
  const lista = comparativasPorProyecto.value
  if (lista.length < 2) {
    return {
      proyectoBase: null,
      proyectoReciente: lista[0] || null,
      tieneComparacionMultiple: false,
      diferenciaPct: 0,
      esCrecimientoPositivo: true
    }
  }

  const proyectoReciente = lista[lista.length - 1]!
  const proyectoBase = lista[lista.length - 2]!
  const delta = Number((proyectoReciente.porcentajeSatisfaccion - proyectoBase.porcentajeSatisfaccion).toFixed(1))

  return {
    proyectoBase,
    proyectoReciente,
    tieneComparacionMultiple: true,
    diferenciaPct: delta,
    esCrecimientoPositivo: delta >= 0
  }
})

// Barras del histograma: Equivalencia 1 a 1 con comparativasPorProyecto (sin barras fantasma ni duplicadas)
const datosHistograma = computed(() => {
  return comparativasPorProyecto.value.map(item => {
    let colorBarra = 'from-slate-400 to-slate-500'
    if (item.totalRespuestas > 0 || item.porcentajeSatisfaccion > 0) {
      if (item.porcentajeSatisfaccion >= 75) {
        colorBarra = item.esFinalizado ? 'from-blue-500 to-indigo-600' : 'from-emerald-500 to-teal-600'
      } else if (item.porcentajeSatisfaccion >= 50) {
        colorBarra = 'from-amber-500 to-orange-600'
      } else {
        colorBarra = 'from-rose-500 to-red-600'
      }
    }

    return {
      id: item.id,
      numeroProyecto: item.numeroProyecto,
      fecha: item.fecha,
      titulo: item.titulo,
      etiqueta: `${item.titulo} (${item.totalRespuestas} resp.)`,
      porcentaje: item.porcentajeSatisfaccion,
      totalRespuestas: item.totalRespuestas,
      color: colorBarra,
      esFinalizado: item.esFinalizado,
      estado: item.estado
    }
  })
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
                  Comparativa de Proyectos Organizacionales
                </h3>
                <p class="text-xs text-blue-100 font-medium">
                  Equivalencia exacta 1 a 1: {{ comparativasPorProyecto.length }} proyecto(s) registrado(s) = {{ datosHistograma.length }} barra(s) comparativa(s)
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
            <!-- 1. SECCIÓN: TARJETAS DE PROYECTOS (EQUIVALENCIA 1 A 1)        -->
            <!-- ============================================================= -->
            <div class="space-y-4">
              <div class="flex items-center justify-between flex-wrap gap-2">
                <h4 class="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <FolderKanban class="w-4 h-4 text-blue-500" />
                  <span>1. Proyectos en Comparativa (1 Proyecto = 1 Comparativa)</span>
                </h4>
                <span class="text-[11px] font-mono text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full font-bold">
                  {{ comparativasPorProyecto.length }} Proyecto(s) Activo(s)/Finalizado(s)
                </span>
              </div>

              <!-- Tarjetas 1 a 1 por cada proyecto -->
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div
                  v-for="item in comparativasPorProyecto"
                  :key="item.id"
                  class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative space-y-2 overflow-hidden"
                >
                  <div class="flex items-center justify-between gap-2">
                    <span class="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      Proyecto {{ item.numeroProyecto }}
                    </span>
                    <span
                      class="text-[10px] font-black uppercase px-2 py-0.5 rounded-full"
                      :class="item.esFinalizado
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'"
                    >
                      {{ item.estado }}
                    </span>
                  </div>

                  <div class="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate" :title="item.titulo">
                    {{ item.titulo }}
                  </div>

                  <div class="py-1 flex items-center justify-between gap-2">
                    <span class="text-xl font-black font-mono text-blue-600 dark:text-blue-400 bg-blue-500/10 px-3.5 py-1 rounded-xl inline-block border border-blue-500/20">
                      {{ item.porcentajeSatisfaccion }}%
                    </span>
                    <span class="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
                      {{ item.totalRespuestas }} resp.
                    </span>
                  </div>

                  <p class="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {{ item.departamento }} · {{ item.fecha }}
                  </p>
                </div>
              </div>

              <!-- Resumen de variación cuando hay 2 o más proyectos -->
              <div
                v-if="comparativa.tieneComparacionMultiple && comparativa.proyectoBase && comparativa.proyectoReciente"
                class="p-3.5 rounded-2xl border flex items-center justify-between flex-wrap gap-2 text-xs"
                :class="comparativa.esCrecimientoPositivo
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300'"
              >
                <span class="font-bold">
                  Variación entre {{ comparativa.proyectoBase.titulo }} ({{ comparativa.proyectoBase.porcentajeSatisfaccion }}%) y {{ comparativa.proyectoReciente.titulo }} ({{ comparativa.proyectoReciente.porcentajeSatisfaccion }}%):
                </span>
                <span class="font-mono font-black text-sm px-2.5 py-0.5 rounded-lg bg-white/80 dark:bg-slate-900/80">
                  {{ comparativa.diferenciaPct >= 0 ? `+${comparativa.diferenciaPct}%` : `${comparativa.diferenciaPct}%` }}
                </span>
              </div>
            </div>

            <!-- ============================================================= -->
            <!-- 2. SECCIÓN: HISTOGRAMA COMPARATIVO EQUIVALENTE (1 A 1)        -->
            <!-- ============================================================= -->
            <div class="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 class="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <TrendingUp class="w-4 h-4 text-emerald-500" />
                    <span>2. Gráfica Comparativa — {{ datosHistograma.length }} Proyecto(s)</span>
                  </h4>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400">
                    Cada barra representa exactamente uno de tus proyectos creados
                  </p>
                </div>

                <div class="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-2xl">
                  <span class="text-xs font-bold text-emerald-700 dark:text-emerald-300">Total Comparativas:</span>
                  <span class="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">
                    {{ datosHistograma.length }}
                  </span>
                </div>
              </div>

              <!-- Gráfico de Histograma -->
              <div class="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-2.5">
                  <span class="font-bold text-slate-700 dark:text-slate-300">Eje Y: % Clima Laboral (0% a 100%)</span>
                  <span class="font-mono text-[11px]">{{ datosHistograma.length }} proyecto(s) graficado(s)</span>
                </div>

                <div class="relative pt-6 pb-2 px-4 overflow-x-auto">
                  <div class="absolute inset-x-4 top-6 bottom-16 flex flex-col justify-between pointer-events-none opacity-40">
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
                    <div class="border-b border-dashed border-slate-300 dark:border-slate-700 w-full flex justify-end">
                      <span class="text-[9px] font-mono text-slate-400 -mt-2">0%</span>
                    </div>
                  </div>

                  <!-- Barras de Histograma (1 Barra por cada Proyecto) -->
                  <div class="h-64 flex items-end justify-around gap-3 sm:gap-5 relative z-10 pt-4 min-w-[280px]">
                    <div
                      v-for="barra in datosHistograma"
                      :key="barra.id"
                      class="flex-1 max-w-[170px] flex flex-col items-center group"
                    >
                      <div class="mb-2 font-mono font-black text-xs sm:text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        {{ barra.porcentaje }}%
                      </div>

                      <div class="w-full bg-slate-200 dark:bg-slate-800 rounded-t-2xl relative overflow-hidden h-40 flex items-end">
                        <div
                          class="w-full rounded-t-2xl bg-gradient-to-t transition-all duration-700 shadow-md"
                          :class="barra.color"
                          :style="{ height: `${Math.min(100, Math.max(8, barra.porcentaje))}%` }"
                        />
                      </div>

                      <div class="mt-2.5 text-center space-y-0.5 w-full">
                        <div class="font-mono text-xs font-black text-slate-800 dark:text-slate-200 truncate" :title="barra.titulo">
                          {{ barra.titulo }}
                        </div>
                        <div class="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {{ barra.totalRespuestas }} resp. · {{ barra.fecha }}
                        </div>
                        <span
                          class="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase"
                          :class="barra.esFinalizado
                            ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                            : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'"
                        >
                          Proyecto {{ barra.numeroProyecto }} · {{ barra.estado }}
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
