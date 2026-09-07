<!--
  ============================================================================
  ERROR 401: NO AUTORIZADO / SESIÓN EXPIRADA (Error401NoAutorizado.vue)
  ============================================================================
-->

<script setup lang="ts">
import { KeyRound, LogIn, RefreshCw, Home } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import BotonBase from '@/componentes/ElementosBase/BotonBase.vue'
import TarjetaDetalleLegalError from '@/componentes/Errores/TarjetaDetalleLegalError.vue'
import type { DetalleIncidenteLegal } from '@/Almacenes/useManejadorErrores'

const props = defineProps<{
  incidente?: DetalleIncidenteLegal
  mensajePersonalizado?: string
}>()

const router = useRouter()
</script>

<template>
  <div class="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/40 shadow-xl space-y-6 text-center max-w-xl mx-auto font-['Poppins',sans-serif]">
    <div class="space-y-3">
      <div class="w-16 h-16 mx-auto rounded-2xl bg-blue-100 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-lg shadow-blue-500/10">
        <KeyRound class="w-8 h-8 stroke-[2]" />
      </div>
      <span class="inline-block text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
        Error 401 &bull; No Autorizado
      </span>
      <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
        Sesión Expirada o Credenciales Requeridas
      </h2>
      <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
        {{ mensajePersonalizado || incidente?.mensaje || 'Para acceder a esta sección administrativa debes identificarte con tu cuenta corporativa autorizada.' }}
      </p>
    </div>

    <TarjetaDetalleLegalError v-if="incidente" :incidente="incidente" />

    <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
      <BotonBase variante="primario" tamano="pequeno" @click="router.push('/login')">
        <template #iconoIzquierdo>
          <LogIn class="w-4 h-4" />
        </template>
        Iniciar Sesión
      </BotonBase>

      <BotonBase variante="secundario" tamano="pequeno" @click="router.push('/')">
        <template #iconoIzquierdo>
          <Home class="w-4 h-4" />
        </template>
        Ir al Inicio
      </BotonBase>
    </div>
  </div>
</template>