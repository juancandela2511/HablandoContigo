<!--
  ============================================================================
  ERROR 403: ACCESO DENEGADO / PERMISOS INSUFICIENTES (Error403AccesoDenegado.vue)
  ============================================================================
-->

<script setup lang="ts">
import { ShieldX, ArrowLeft, Home, UserCheck } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import BotonBase from '@/componentes/ElementosBase/BotonBase.vue'
import TarjetaDetalleLegalError from '@/componentes/Errores/TarjetaDetalleLegalError.vue'
import type { DetalleIncidenteLegal } from '@/Almacenes/useManejadorErrores'

const props = defineProps<{
  incidente?: DetalleIncidenteLegal
  mensajePersonalizado?: string
  rolRequerido?: string
}>()

const router = useRouter()
</script>

<template>
  <div class="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/40 shadow-xl space-y-6 text-center max-w-xl mx-auto font-['Poppins',sans-serif]">
    <div class="space-y-3">
      <div class="w-16 h-16 mx-auto rounded-2xl bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-lg shadow-rose-500/10">
        <ShieldX class="w-8 h-8 stroke-[2]" />
      </div>
      <span class="inline-block text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
        Error 403 &bull; Acceso Denegado
      </span>
      <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
        Permisos Insuficientes (Control RBAC)
      </h2>
      <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
        {{ mensajePersonalizado || incidente?.mensaje || 'Tu rol administrativo actual no cuenta con los privilegios requeridos para visualizar o gestionar este recurso.' }}
      </p>

      <div v-if="rolRequerido" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
        <UserCheck class="w-3.5 h-3.5 text-rose-500" />
        <span>Nivel Requerido: <strong>{{ rolRequerido }}</strong></span>
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

      <BotonBase variante="primario" tamano="pequeno" @click="router.push('/dashboard')">
        <template #iconoIzquierdo>
          <Home class="w-4 h-4" />
        </template>
        Ir a Mi Panel
      </BotonBase>
    </div>
  </div>
</template>