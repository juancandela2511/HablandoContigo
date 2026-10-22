<!--
  ============================================================================
  MODAL DE ESTADÍSTICA PERSONALIZADA POR PREGUNTA (ModalEstadisticaDetalladaPregunta.vue)
  ============================================================================
  Muestra el desglose estadístico cuantitativo y cualitativo completo de una pregunta:
  - Distribución por Puntajes (1 Pt, 2 Pts, 3 Pts, 4 Pts, 5 Pts).
  - Cruce por Antigüedad del Colaborador (Años/Meses de experiencia y % por puntaje).
  - Desglose por Área / Departamento.
  - Testimonios y respuestas abiertas ("¿Por qué?").
-->

<script setup lang="ts">
import { ref } from 'vue'
import type { DesgloseRespuestaDetallada } from '@/Almacenes/useEstadisticas'
import {
  X,
  BarChart3,
  Users,
  Clock,
  Building2,
  MessageSquareQuote,
  Sparkles,
  ShieldAlert,
  PieChart,
  HelpCircle
} from 'lucide-vue-next'

const props = defineProps<{
  abierto: boolean
  pregunta: DesgloseRespuestaDetallada | null
}>()

const emit = defineEmits<{
  (e: 'cerrar'): void
}>()

const pestanaActiva = ref<'puntajes' | 'antiguedad' | 'departamentos' | 'comentarios'>('puntajes')
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="abierto && pregunta"
        class="fixed inset-0 z-[10000] flex items-center justify-center p-4 font-['Poppins',sans-serif]"
      >
        <!-- Fondo oscuro con efecto blur -->
        <div
          class="absolute inset-0 bg-black/60 backdrop-blur-sm"
          @click="emit('cerrar')"
        />

        <!-- Panel principal del Modal -->
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-4"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-4"
        >
          <div
            v-if="abierto && pregunta"
            class="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 text-left"
          >
            <!-- HEADER DEL MODAL -->
            <div class="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 rounded-t-3xl text-white">
              <div class="flex items-center gap-2.5 min-w-0">
                <div class="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                  <BarChart3 class="w-5 h-5 text-white" />
                </div>
                <div class="min-w-0">
                  <span class="text-[10px] font-mono uppercase tracking-widest text-sky-200 font-bold block">
                    Estadística Personalizada — {{ pregunta.categoria }}
                  </span>
                  <h3 class="text-sm font-black truncate max-w-lg">
                    {{ pregunta.pregunta }}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                @click="emit('cerrar')"
                class="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer shrink-0"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <!-- CUERPO PRINCIPAL -->
            <div class="p-6 space-y-6">
              <!-- METRICAS RESUMEN TOP -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Promedio General</span>
                  <span class="text-xl font-extrabold text-sky-600 dark:text-sky-400">★ {{ pregunta.promedio }} / 5.0</span>
                </div>

                <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Salud Favorable</span>
                  <span class="text-xl font-extrabold text-emerald-500">{{ Math.round((pregunta.promedio / 5) * 100) }}%</span>
                </div>

                <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Respuestas</span>
                  <span class="text-xl font-extrabold text-slate-800 dark:text-slate-200">{{ pregunta.totalRespuestas }}</span>
                </div>

                <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Consenso (σ)</span>
                  <span
                    class="text-sm font-extrabold px-2 py-0.5 rounded-lg inline-block mt-1"
                    :class="pregunta.indiceConsenso === 'Alto' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : pregunta.indiceConsenso === 'Polarizado' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'"
                  >
                    {{ pregunta.indiceConsenso }} ({{ pregunta.desviacionEstandar }})
                  </span>
                </div>
              </div>

              <!-- PESTAÑAS DE NAVEGACIÓN -->
              <div class="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
                <button
                  type="button"
                  @click="pestanaActiva = 'puntajes'"
                  :class="[
                    'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0',
                    pestanaActiva === 'puntajes'
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  ]"
                >
                  <PieChart class="w-3.5 h-3.5" />
                  <span>Distribución de Puntajes (1-5)</span>
                </button>

                <button
                  type="button"
                  @click="pestanaActiva = 'antiguedad'"
                  :class="[
                    'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0',
                    pestanaActiva === 'antiguedad'
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  ]"
                >
                  <Clock class="w-3.5 h-3.5" />
                  <span>Cruce por Antigüedad (Años)</span>
                </button>

                <button
                  type="button"
                  @click="pestanaActiva = 'departamentos'"
                  :class="[
                    'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0',
                    pestanaActiva === 'departamentos'
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  ]"
                >
                  <Building2 class="w-3.5 h-3.5" />
                  <span>Por Departamento</span>
                </button>

                <button
                  type="button"
                  @click="pestanaActiva = 'comentarios'"
                  :class="[
                    'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0',
                    pestanaActiva === 'comentarios'
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  ]"
                >
                  <MessageSquareQuote class="w-3.5 h-3.5" />
                  <span>Justificaciones ("¿Por qué?")</span>
                </button>
              </div>

              <!-- CONTENIDO PESTAÑA 1: DESGLOSE DE PUNTAJES (1, 2, 3, 4, 5 Puntos) -->
              <div v-if="pestanaActiva === 'puntajes'" class="space-y-4">
                <div class="space-y-3">
                  <div
                    v-for="pt in pregunta.desglosePuntos"
                    :key="pt.pts"
                    class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5"
                  >
                    <div class="flex items-center justify-between text-xs font-bold">
                      <span class="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                        <span class="w-3 h-3 rounded-full shrink-0" :style="{ backgroundColor: pt.color }"></span>
                        <span>{{ pt.etiqueta }}</span>
                      </span>
                      <span class="font-mono text-slate-600 dark:text-slate-400">
                        {{ pt.count }} emplead{{ pt.count === 1 ? 'o' : 'os' }} ({{ pt.porcentaje }}%)
                      </span>
                    </div>

                    <!-- Barra visual de porcentaje por punto -->
                    <div class="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        class="h-full transition-all duration-500 rounded-full"
                        :style="{ width: `${pt.porcentaje}%`, backgroundColor: pt.color }"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- CONTENIDO PESTAÑA 2: CRUCE POR ANTIGÜEDAD (Años de Empleados) -->
              <div v-else-if="pestanaActiva === 'antiguedad'" class="space-y-4">
                <p class="text-xs text-slate-500 dark:text-slate-400">
                  Porcentaje de empleados de cada rango de antigüedad (años/meses) que respondieron cada nivel de puntaje:
                </p>

                <div class="space-y-4">
                  <div
                    v-for="ant in pregunta.desgloseAntiguedad"
                    :key="ant.rango"
                    class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3"
                  >
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <Clock class="w-4 h-4 text-sky-500" />
                        <h4 class="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                          {{ ant.etiqueta }}
                        </h4>
                      </div>
                      <div class="flex items-center gap-2 text-xs font-mono">
                        <span class="text-slate-500">
                          {{ ant.total }} evaluado{{ ant.total === 1 ? 'o' : 'os' }}
                        </span>
                        <span class="font-bold text-sky-600 dark:text-sky-400">
                          ★ {{ ant.promedio }} / 5.0 ({{ ant.porcentajeSalud }}%)
                        </span>
                      </div>
                    </div>

                    <!-- Matriz de Porcentajes por Puntaje para este Rango de Antigüedad -->
                    <div class="grid grid-cols-5 gap-1.5 pt-1 text-center font-mono text-[10px]">
                      <div
                        v-for="pnt in [1, 2, 3, 4, 5]"
                        :key="pnt"
                        class="p-2 rounded-xl border flex flex-col items-center justify-center gap-0.5"
                        :class="pnt === 1 ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300' : pnt === 2 ? 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-900/60 text-orange-700 dark:text-orange-300' : pnt === 3 ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-300' : pnt === 4 ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60 text-blue-700 dark:text-blue-300' : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300'"
                      >
                        <span class="font-extrabold text-[9px] uppercase">{{ pnt }} Pt{{ pnt > 1 ? 's' : '' }}</span>
                        <span class="text-xs font-black">{{ ant.distribucionPuntos[pnt]?.porcentaje || 0 }}%</span>
                        <span class="text-[9px] opacity-75">({{ ant.distribucionPuntos[pnt]?.count || 0 }})</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- CONTENIDO PESTAÑA 3: POR DEPARTAMENTO -->
              <div v-else-if="pestanaActiva === 'departamentos'" class="space-y-3">
                <div
                  v-for="dep in pregunta.desgloseDepartamento"
                  :key="dep.departamento"
                  class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                >
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                      <Building2 class="w-4 h-4" />
                    </div>
                    <div>
                      <h4 class="text-xs font-bold text-slate-900 dark:text-white">{{ dep.departamento }}</h4>
                      <span class="text-[10px] text-slate-400">{{ dep.total }} respuestas evaluadas</span>
                    </div>
                  </div>

                  <div class="text-right">
                    <span class="text-sm font-black text-sky-600 dark:text-sky-400">★ {{ dep.promedio }} / 5.0</span>
                    <span class="block text-[10px] text-slate-400 font-mono">{{ dep.porcentajeSalud }}% Favorable</span>
                  </div>
                </div>
              </div>

              <!-- CONTENIDO PESTAÑA 4: TESTIMONIOS CUALITATIVOS ("¿POR QUÉ?") -->
              <div v-else-if="pestanaActiva === 'comentarios'" class="space-y-3">
                <div v-if="pregunta.comentariosDestacados && pregunta.comentariosDestacados.length > 0" class="space-y-2.5">
                  <div
                    v-for="(com, idx) in pregunta.comentariosDestacados"
                    :key="idx"
                    class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 italic flex items-start gap-3"
                  >
                    <MessageSquareQuote class="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                    <p class="leading-relaxed font-sans font-medium">"{{ com }}"</p>
                  </div>
                </div>
                <div v-else class="py-8 text-center text-xs text-slate-400">
                  No hay justificaciones o comentarios abiertos registrados para esta pregunta.
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
