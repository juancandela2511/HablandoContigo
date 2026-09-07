<!--
  ============================================================================
  ERROR DE BASE DE DATOS / SUPABASE NO DISPONIBLE (ErrorSupabaseCaido.vue)
  ============================================================================
-->

<script setup lang="ts">
import { DatabaseZap, RefreshCw, ShieldAlert, Home, LifeBuoy } from 'lucide-vue-next'
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
  <div class="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-900/40 shadow-xl space-y-6 text-center max-w-xl mx-auto font-['Poppins',sans-serif]">
    <div class="space-y-3">
      <div class="w-16 h-16 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/10">
        <DatabaseZap class="w-8 h-8 stroke-[2]" />
      </div>
      <span class="inline-block text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
        Base de Datos &bull; Fallo de Sincronización
      </span>
      <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
        Conexión Interrumpida con la Base de Datos
      </h2>
      <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
        {{ mensajePersonalizado || incidente?.mensaje || 'No se pudo establecer comunicación con el clúster de almacenamiento central de Supabase. Los datos locales permanecen protegidos.' }}
      </p>
    </div>

    <TarjetaDetalleLegalError v-if="incidente" :incidente="incidente" />

    <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
      <BotonBase variante="primario" tamano="pequeno" @click="emit('reintentar')">
        <template #iconoIzquierdo>
          <RefreshCw class="w-4 h-4" />
        </template>
        Reconectar Base de Datos
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