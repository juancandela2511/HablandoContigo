<!--
  ============================================================================
  ERROR 504: TIEMPO DE RESPUESTA AGOTADO / TIMEOUT (Error504TiempoAgotado.vue)
  ============================================================================
-->

<script setup lang="ts">
import { TimerOff, RefreshCw, ArrowLeft, Home } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import BotonBase from '@/componentes/ElementosBase/BotonBase.vue'
import TarjetaDetalleLegalError from '@/componentes/Errores/TarjetaDetalleLegalError.vue'
import type { DetalleIncidenteLegal } from '@/Almacenes/useManejadorErrores'

const props = defineProps<{
  incidente?: DetalleIncidenteLegal
  mensajePersonalizado?: string
}>()

const emit = defineEmits<{
  (e: 'reintentar'): void
}>()

const router = useRouter()
</script>

<template>
  <div class="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-yellow-200 dark:border-yellow-900/40 shadow-xl space-y-6 text-center max-w-xl mx-auto font-['Poppins',sans-serif]">
    <div class="space-y-3">
      <div class="w-16 h-16 mx-auto rounded-2xl bg-yellow-100 dark:bg-yellow-950/60 border border-yellow-300 dark:border-yellow-800 flex items-center justify-center text-yellow-600 dark:text-yellow-400 shadow-lg shadow-yellow-500/10">
        <TimerOff class="w-8 h-8 stroke-[2]" />
      </div>
      <span class="inline-block text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-800">
        Error 504 &bull; Tiempo Agotado
      </span>
      <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
        El Servidor Tardó Demasiado en Responder
      </h2>
      <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
        {{ mensajePersonalizado || incidente?.mensaje || 'La base de datos o el servicio de análisis demoró más del tiempo límite establecido para completar la solicitud.' }}
      </p>
    </div>

    <TarjetaDetalleLegalError v-if="incidente" :incidente="incidente" />

    <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
      <BotonBase variante="primario" tamano="pequeno" @click="emit('reintentar')">
        <template #iconoIzquierdo>
          <RefreshCw class="w-4 h-4" />
        </template>
        Reintentar Petición
      </BotonBase>

      <BotonBase variante="secundario" tamano="pequeno" @click="router.back()">
        <template #iconoIzquierdo>
          <ArrowLeft class="w-4 h-4" />
        </template>
        Volver Atrás
      </BotonBase>
    </div>
  </div>
</template>