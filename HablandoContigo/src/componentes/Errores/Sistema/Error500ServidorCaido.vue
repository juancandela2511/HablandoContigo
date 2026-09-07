<!--
  ============================================================================
  ERROR 500: ERROR INTERNO DEL SERVIDOR / CAÍDA (Error500ServidorCaido.vue)
  ============================================================================
-->

<script setup lang="ts">
import { ServerCrash, RefreshCw, Home, LifeBuoy } from 'lucide-vue-next'
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
  <div class="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/40 shadow-xl space-y-6 text-center max-w-xl mx-auto font-['Poppins',sans-serif]">
    <div class="space-y-3">
      <div class="w-16 h-16 mx-auto rounded-2xl bg-red-100 dark:bg-red-950/60 border border-red-300 dark:border-red-800 flex items-center justify-center text-red-600 dark:text-red-400 shadow-lg shadow-red-500/10">
        <ServerCrash class="w-8 h-8 stroke-[2]" />
      </div>
      <span class="inline-block text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800">
        Error 500 &bull; Fallo Interno
      </span>
      <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
        Interrupción Imprevista en el Servidor
      </h2>
      <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
        {{ mensajePersonalizado || incidente?.mensaje || 'Se ha presentado una excepción no controlada en el servicio central. El incidente ha quedado registrado para auditoría y corrección.' }}
      </p>
    </div>

    <TarjetaDetalleLegalError v-if="incidente" :incidente="incidente" />

    <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
      <BotonBase variante="primario" tamano="pequeno" @click="emit('reintentar')">
        <template #iconoIzquierdo>
          <RefreshCw class="w-4 h-4" />
        </template>
        Reintentar Operación
      </BotonBase>

      <BotonBase variante="secundario" tamano="pequeno" @click="router.push('/')">
        <template #iconoIzquierdo>
          <Home class="w-4 h-4" />
        </template>
        Ir al Inicio
      </BotonBase>

      <BotonBase variante="esquema" tamano="pequeno" @click="router.push('/support')">
        <template #iconoIzquierdo>
          <LifeBuoy class="w-4 h-4" />
        </template>
        Reportar a Soporte
      </BotonBase>
    </div>
  </div>
</template>