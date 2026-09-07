<!--
  ============================================================================
  ERROR 422: ERROR DE VALIDACIÓN / DATOS INCOMPLETOS (Error422ValidacionFormulario.vue)
  ============================================================================
-->

<script setup lang="ts">
import { FileWarning, CheckCircle2, ArrowLeft, RefreshCw } from 'lucide-vue-next'
import BotonBase from '@/componentes/ElementosBase/BotonBase.vue'
import TarjetaDetalleLegalError from '@/componentes/Errores/TarjetaDetalleLegalError.vue'
import type { DetalleIncidenteLegal } from '@/Almacenes/useManejadorErrores'

const props = defineProps<{
  incidente?: DetalleIncidenteLegal
  mensajePersonalizado?: string
  camposFaltantes?: string[]
}>()

const emit = defineEmits<{
  (e: 'corregir'): void
}>()
</script>

<template>
  <div class="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-orange-200 dark:border-orange-900/40 shadow-xl space-y-6 text-center max-w-xl mx-auto font-['Poppins',sans-serif]">
    <div class="space-y-3">
      <div class="w-16 h-16 mx-auto rounded-2xl bg-orange-100 dark:bg-orange-950/60 border border-orange-300 dark:border-orange-800 flex items-center justify-center text-orange-600 dark:text-orange-400 shadow-lg shadow-orange-500/10">
        <FileWarning class="w-8 h-8 stroke-[2]" />
      </div>
      <span class="inline-block text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-800">
        Error 422 &bull; Validación No Superada
      </span>
      <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
        Datos Incompletos o Formato Inválido
      </h2>
      <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
        {{ mensajePersonalizado || incidente?.mensaje || 'Uno o varios campos del formulario no cumplen con los requisitos de integridad o seguridad establecidos.' }}
      </p>

      <!-- Lista de campos afectados si se suministra -->
      <div v-if="camposFaltantes && camposFaltantes.length > 0" class="p-3 rounded-2xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/50 text-left space-y-1.5">
        <span class="text-[11px] font-bold text-orange-800 dark:text-orange-300 block">Campos a verificar:</span>
        <ul class="text-xs text-orange-700 dark:text-orange-400 space-y-0.5 pl-4 list-disc">
          <li v-for="campo in camposFaltantes" :key="campo">{{ campo }}</li>
        </ul>
      </div>
    </div>

    <TarjetaDetalleLegalError v-if="incidente" :incidente="incidente" />

    <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
      <BotonBase variante="primario" tamano="pequeno" @click="emit('corregir')">
        <template #iconoIzquierdo>
          <CheckCircle2 class="w-4 h-4" />
        </template>
        Revisar Formulario
      </BotonBase>
    </div>
  </div>
</template>