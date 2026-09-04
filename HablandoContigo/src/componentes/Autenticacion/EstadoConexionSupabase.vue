<!--
  ============================================================================
  ESTADO DE CONEXIÓN SUPABASE EN LOGIN (EstadoConexionSupabase.vue)
  ============================================================================
-->

<script setup lang="ts">
import { WifiOff, DatabaseZap, CheckCircle2 } from 'lucide-vue-next'
import { BotonBase } from '@/componentes/ElementosBase'

defineProps<{
  tieneError: boolean
  cuentasVacias: boolean
  cargandoCuentas: boolean
  errorConexion: string | null
  sembrandoCuentas: boolean
  siembraExitosa: boolean
}>()

const emit = defineEmits<{
  (e: 'sembrar'): void
}>()
</script>

<template>
  <div class="space-y-3">
    <!-- Alerta de Conexión / Siembra Necesaria -->
    <div 
      v-if="tieneError || cuentasVacias" 
      class="p-3 rounded-2xl bg-amber-950/70 border border-amber-600/60 text-amber-200 text-xs space-y-2 text-left"
    >
      <div class="flex items-start gap-2">
        <WifiOff class="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div class="flex-1">
          <p class="font-bold text-white">Estado de Base de Datos Supabase</p>
          <p class="text-[11px] text-amber-300/90 leading-tight">
            {{ errorConexion || (cuentasVacias ? 'La tabla cuentas_admin está vacía en Supabase. Siembra los accesos iniciales.' : 'Verificando enlace...') }}
          </p>
        </div>
      </div>

      <BotonBase
        variante="primario"
        tamano="pequeno"
        :bloqueCompleto="true"
        :cargando="sembrandoCuentas"
        textoCarga="Creando cuentas en Supabase..."
        @click="emit('sembrar')"
      >
        <template #iconoIzquierdo>
          <DatabaseZap class="w-3.5 h-3.5" />
        </template>
        <span>Sembrar Cuentas Iniciales en Supabase</span>
      </BotonBase>
    </div>

    <!-- Confirmación de Siembra Exitosa -->
    <div 
      v-if="siembraExitosa"
      class="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-600 text-emerald-200 text-xs flex items-center gap-2 text-left animate-fade-in"
    >
      <CheckCircle2 class="w-4 h-4 text-emerald-400 shrink-0" />
      <span>¡Cuentas iniciales registradas exitosamente en Supabase! Ya puedes iniciar sesión.</span>
    </div>
  </div>
</template>
