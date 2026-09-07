<!--
  ============================================================================
  ERROR 404: RECURSO O ENCUESTA NO ENCONTRADA (Error404NoEncontrado.vue)
  ============================================================================
-->

<script setup lang="ts">
import { Compass, ArrowLeft, Home, HelpCircle } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import BotonBase from '@/componentes/ElementosBase/BotonBase.vue'
import TarjetaDetalleLegalError from '@/componentes/Errores/TarjetaDetalleLegalError.vue'
import type { DetalleIncidenteLegal } from '@/Almacenes/useManejadorErrores'

const props = defineProps<{
  incidente?: DetalleIncidenteLegal
  mensajePersonalizado?: string
  recursoSolicitado?: string
}>()

const router = useRouter()
</script>

<template>
  <div class="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-sky-200 dark:border-sky-900/40 shadow-xl space-y-6 text-center max-w-xl mx-auto font-['Poppins',sans-serif]">
    <div class="space-y-3">
      <div class="w-16 h-16 mx-auto rounded-2xl bg-sky-100 dark:bg-sky-950/60 border border-sky-300 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-sky-400 shadow-lg shadow-sky-500/10">
        <Compass class="w-8 h-8 stroke-[2] animate-pulse" />
      </div>
      <span class="inline-block text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
        Error 404 &bull; No Encontrado
      </span>
      <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
        Recurso o Encuesta Inexistente
      </h2>
      <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
        {{ mensajePersonalizado || incidente?.mensaje || 'El enlace al que intentas ingresar ha expirado, fue reubicado o la encuesta ya no se encuentra activa.' }}
      </p>

      <div v-if="recursoSolicitado" class="inline-block px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 truncate max-w-xs">
        Ruta: {{ recursoSolicitado }}
      </div>
    </div>

    <TarjetaDetalleLegalError v-if="incidente" :incidente="incidente" />

    <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
      <BotonBase variante="secundario" tamano="pequeno" @click="router.back()">
        <template #iconoIzquierdo>
          <ArrowLeft class="w-4 h-4" />
        </template>
        Regresar
      </BotonBase>

      <BotonBase variante="primario" tamano="pequeno" @click="router.push('/')">
        <template #iconoIzquierdo>
          <Home class="w-4 h-4" />
        </template>
        Ir al Inicio
      </BotonBase>

      <BotonBase variante="esquema" tamano="pequeno" @click="router.push('/responder')">
        <template #iconoIzquierdo>
          <HelpCircle class="w-4 h-4" />
        </template>
        Encuestas Activas
      </BotonBase>
    </div>
  </div>
</template>