<!--
  ============================================================================
  ERROR 400: SOLICITUD INVÁLIDA / PARÁMETROS CORRUPTOS (Error400SolicitudInvalida.vue)
  ============================================================================
-->

<script setup lang="ts">
import { AlertCircle, RefreshCw, ArrowLeft, Home } from 'lucide-vue-next'
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
  (e: 'cerrar'): void
}>()

const router = useRouter()
</script>

<template>
  <div class="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/40 shadow-xl space-y-6 text-center max-w-xl mx-auto font-['Poppins',sans-serif]">
    <!-- Icono y Código -->
    <div class="space-y-3">
      <div class="w-16 h-16 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-lg shadow-amber-500/10">
        <AlertCircle class="w-8 h-8 stroke-[2]" />
      </div>
      <span class="inline-block text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
        Error 400 &bull; Solicitud Inválida
      </span>
      <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
        Parámetros o Solicitud Incorrecta
      </h2>
      <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
        {{ mensajePersonalizado || incidente?.mensaje || 'La petición enviada contiene parámetros malformados, caracteres no permitidos o una estructura corrupta.' }}
      </p>
    </div>

    <!-- Ficha Legal si existe incidente -->
    <TarjetaDetalleLegalError v-if="incidente" :incidente="incidente" />

    <!-- Botones de Acción -->
    <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
      <BotonBase variante="secundario" tamano="pequeno" @click="router.back()">
        <template #iconoIzquierdo>
          <ArrowLeft class="w-4 h-4" />
        </template>
        Volver Atrás
      </BotonBase>

      <BotonBase variante="primario" tamano="pequeno" @click="emit('reintentar')">
        <template #iconoIzquierdo>
          <RefreshCw class="w-4 h-4" />
        </template>
        Reintentar Petición
      </BotonBase>

      <BotonBase variante="esquema" tamano="pequeno" @click="router.push('/')">
        <template #iconoIzquierdo>
          <Home class="w-4 h-4" />
        </template>
        Ir al Inicio
      </BotonBase>
    </div>
  </div>
</template>