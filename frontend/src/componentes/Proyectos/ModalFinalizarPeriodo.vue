<!--
  ============================================================================
  MODAL DE CONFIRMACIÓN Y CIERRE DE PERIODO ANUAL (ModalFinalizarPeriodo.vue)
  ============================================================================
  Modal HUD para confirmar el cierre oficial del proyecto de clima laboral del año/periodo.
  Consolida los indicadores clave (Respuestas, Alertas, Puntaje, Satisfacción actual vs 2025: 70%)
  y permite agregar notas de auditoría antes de persistir en Supabase.
-->

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  CalendarCheck2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Users,
  CheckCircle2,
  X,
  Loader2,
  FileSpreadsheet
} from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    abierto: boolean
    anio?: number
    totalRespuestas?: number
    alertasRegistradas?: number
    puntajePromedio?: number
    porcentajeSatisfaccion?: number
    porcentaje2025?: number
    cargando?: boolean
  }>(),
  {
    anio: 2026,
    totalRespuestas: 0,
    alertasRegistradas: 0,
    puntajePromedio: 0,
    porcentajeSatisfaccion: 0,
    porcentaje2025: 70.0,
    cargando: false
  }
)

const emit = defineEmits<{
  (e: 'cerrar'): void
  (e: 'confirmarCierre', payload: { notas: string }): void
}>()

const notasAuditoria = ref('')

const diferencia = computed(() => {
  return Number((props.porcentajeSatisfaccion - props.porcentaje2025).toFixed(1))
})

const esPositivo = computed(() => diferencia.value >= 0)

const manejarConfirmar = () => {
  emit('confirmarCierre', { notas: notasAuditoria.value })
}
</script>

<template>
  <div
    v-if="abierto"
    class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md font-['Poppins',sans-serif] animate-fade-in"
  >
    <div
      class="relative w-full max-w-xl p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 text-left"
    >
      <!-- Botón de Cerrar -->
      <button
        type="button"
        @click="emit('cerrar')"
        class="absolute top-5 right-5 p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-all cursor-pointer"
      >
        <X class="w-4 h-4" />
      </button>

      <!-- Encabezado del Cierre -->
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center shrink-0">
          <CalendarCheck2 class="w-6 h-6" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h3 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              Finalizar Proyecto de Este Año {{ anio }}
            </h3>
            <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold uppercase">
              Cierre Oficial
            </span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Al confirmar, se guardará el snapshot consolidado en la base de datos Supabase para auditoría comparativa.
          </p>
        </div>
      </div>

      <!-- TARJETAS COMPARATIVAS (2025 vs 2026) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
        <!-- Tarjeta 1: Periodo Anterior 2025 -->
        <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
          <span class="text-[10px] font-bold font-mono uppercase text-slate-400">
            Línea Base Real 2025
          </span>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-black text-slate-700 dark:text-slate-200">
              {{ porcentaje2025.toFixed(1) }}%
            </span>
            <span class="text-[11px] text-slate-500 font-mono">Satisfacción 2025</span>
          </div>
          <p class="text-[11px] text-slate-400">1,420 Colaboradores evaluados</p>
        </div>

        <!-- Tarjeta 2: Periodo Actual 2026 + Diferencia -->
        <div
          class="p-4 rounded-2xl border space-y-1"
          :class="[
            esPositivo 
              ? 'bg-emerald-500/5 border-emerald-500/30' 
              : 'bg-rose-500/5 border-rose-500/30'
          ]"
        >
          <span class="text-[10px] font-bold font-mono uppercase text-slate-400">
            Resultado Cierre {{ anio }}
          </span>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-black text-slate-900 dark:text-white">
              {{ porcentajeSatisfaccion.toFixed(1) }}%
            </span>
            <span
              class="px-2 py-0.5 rounded-full text-[11px] font-bold font-mono flex items-center gap-1"
              :class="[
                esPositivo 
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
              ]"
            >
              <component :is="esPositivo ? TrendingUp : TrendingDown" class="w-3 h-3" />
              {{ esPositivo ? '+' : '' }}{{ diferencia }}%
            </span>
          </div>
          <p class="text-[11px] text-slate-500 dark:text-slate-400">
            Diferencia neta respecto al año anterior
          </p>
        </div>
      </div>

      <!-- Resumen Métricas Adicionales -->
      <div class="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 grid grid-cols-3 gap-2 text-center">
        <div>
          <span class="text-[10px] text-slate-400 font-mono uppercase block">Respuestas</span>
          <span class="text-sm font-black text-slate-900 dark:text-white">{{ totalRespuestas }}</span>
        </div>
        <div>
          <span class="text-[10px] text-slate-400 font-mono uppercase block">Puntaje Medio</span>
          <span class="text-sm font-black text-slate-900 dark:text-white">{{ puntajePromedio.toFixed(2) }} / 5.0</span>
        </div>
        <div>
          <span class="text-[10px] text-slate-400 font-mono uppercase block">Alertas</span>
          <span class="text-sm font-black text-amber-500">{{ alertasRegistradas }}</span>
        </div>
      </div>

      <!-- Campo de Notas de Auditoría -->
      <div class="space-y-1.5">
        <label class="text-xs font-bold text-slate-700 dark:text-slate-300">
          Notas u Observaciones del Cierre (Opcional):
        </label>
        <textarea
          v-model="notasAuditoria"
          rows="2"
          placeholder="Escribe conclusiones ejecutivas o acuerdos de mejora para el siguiente periodo..."
          class="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <!-- Acciones del Modal -->
      <div class="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          @click="emit('cerrar')"
          class="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer"
        >
          Cancelar
        </button>

        <button
          type="button"
          @click="manejarConfirmar"
          :disabled="cargando"
          class="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95 disabled:opacity-50"
        >
          <Loader2 v-if="cargando" class="w-4 h-4 animate-spin" />
          <CheckCircle2 v-else class="w-4 h-4" />
          <span>{{ cargando ? 'Guardando en Supabase...' : 'Confirmar Cierre y Guardar en Supabase' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
