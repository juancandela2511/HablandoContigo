<!--
  ============================================================================
  ERROR 429: LÍMITE DE PETICIONES EXCEDIDO / RATE LIMIT (Error429LimitePeticiones.vue)
  ============================================================================
-->

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Hourglass, ShieldAlert, ArrowLeft, RefreshCw } from 'lucide-vue-next'
import BotonBase from '@/componentes/ElementosBase/BotonBase.vue'
import TarjetaDetalleLegalError from '@/componentes/Errores/TarjetaDetalleLegalError.vue'
import type { DetalleIncidenteLegal } from '@/Almacenes/useManejadorErrores'

const props = withDefaults(
  defineProps<{
    incidente?: DetalleIncidenteLegal
    mensajePersonalizado?: string
    segundosEspera?: number
  }>(),
  {
    segundosEspera: 30
  }
)

const emit = defineEmits<{
  (e: 'reintentar'): void
}>()


const cuentaRegresiva = ref(props.segundosEspera)
let timer: any = null

onMounted(() => {
  timer = setInterval(() => {
    if (cuentaRegresiva.value > 0) {
      cuentaRegresiva.value--
    } else {
      clearInterval(timer)
    }
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-violet-200 dark:border-violet-900/40 shadow-xl space-y-6 text-center max-w-xl mx-auto font-['Poppins',sans-serif]">
    <div class="space-y-3">
      <div class="w-16 h-16 mx-auto rounded-2xl bg-violet-100 dark:bg-violet-950/60 border border-violet-300 dark:border-violet-800 flex items-center justify-center text-violet-600 dark:text-violet-400 shadow-lg shadow-violet-500/10">
        <Hourglass class="w-8 h-8 stroke-[2] animate-spin" />
      </div>
      <span class="inline-block text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border border-violet-300 dark:border-violet-800">
        Error 429 &bull; Tasa Límite Excedida
      </span>
      <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
        Demasiadas Peticiones Consecutivas
      </h2>
      <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
        {{ mensajePersonalizado || incidente?.mensaje || 'El sistema ha activado una protección temporal anti-saturación para salvaguardar la estabilidad de la plataforma.' }}
      </p>

      <!-- Contador de espera -->
      <div class="p-4 rounded-2xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/60 max-w-xs mx-auto space-y-1">
        <span class="text-[11px] text-violet-600 dark:text-violet-400 font-semibold block">Podrás reintentar en:</span>
        <span class="text-2xl font-black font-mono text-violet-700 dark:text-violet-300 tabular-nums">
          {{ cuentaRegresiva }}s
        </span>
      </div>
    </div>

    <TarjetaDetalleLegalError v-if="incidente" :incidente="incidente" />

    <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
      <BotonBase
        variante="primario"
        tamano="pequeno"
        :deshabilitado="cuentaRegresiva > 0"
        @click="emit('reintentar')"
      >
        <template #iconoIzquierdo>
          <RefreshCw class="w-4 h-4" />
        </template>
        <span>{{ cuentaRegresiva > 0 ? 'Espera unos segundos...' : 'Reintentar Ahora' }}</span>
      </BotonBase>
    </div>
  </div>
</template>