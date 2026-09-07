<!--
  ============================================================================
  ERROR 503: SERVICIO NO DISPONIBLE / MANTENIMIENTO (Error503ServicioNoDisponible.vue)
  ============================================================================
-->

<script setup lang="ts">
import { Wrench, RefreshCw, Clock, Home } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import BotonBase from '@/componentes/ElementosBase/BotonBase.vue'
import TarjetaDetalleLegalError from '@/componentes/Errores/TarjetaDetalleLegalError.vue'
import type { DetalleIncidenteLegal } from '@/Almacenes/useManejadorErrores'

const props = defineProps<{
  incidente?: DetalleIncidenteLegal
  mensajePersonalizado?: string
  tiempoEstimadoMinutos?: number
}>()

const emit = defineEmits<{
  (e: 'reintentar'): void
}>()

const router = useRouter()
</script>

<template>
  <div class="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-xl space-y-6 text-center max-w-xl mx-auto font-['Poppins',sans-serif]">
    <div class="space-y-3">
      <div class="w-16 h-16 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-lg shadow-amber-500/10">
        <Wrench class="w-8 h-8 stroke-[2]" />
      </div>
      <span class="inline-block text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
        Error 503 &bull; Mantenimiento Preventivo
      </span>
      <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
        Plataforma en Mantenimiento
      </h2>
      <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
        {{ mensajePersonalizado || incidente?.mensaje || 'Estamos ejecutando labores de mantenimiento preventivo y optimización en los servidores centrales de clima laboral.' }}
      </p>

      <div v-if="tiempoEstimadoMinutos" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-[11px] font-mono text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
        <Clock class="w-3.5 h-3.5 text-amber-500" />
        <span>Tiempo estimado de restauración: ~{{ tiempoEstimadoMinutos }} min</span>
      </div>
    </div>

    <TarjetaDetalleLegalError v-if="incidente" :incidente="incidente" />

    <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
      <BotonBase variante="primario" tamano="pequeno" @click="emit('reintentar')">
        <template #iconoIzquierdo>
          <RefreshCw class="w-4 h-4" />
        </template>
        Comprobar Estado
      </BotonBase>

      <BotonBase variante="secundario" tamano="pequeno" @click="router.push('/')">
        <template #iconoIzquierdo>
          <Home class="w-4 h-4" />
        </template>
        Volver a la Portada
      </BotonBase>
    </div>
  </div>
</template>