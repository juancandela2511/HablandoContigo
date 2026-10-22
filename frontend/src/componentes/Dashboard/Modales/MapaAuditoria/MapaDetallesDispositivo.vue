<!--
  ============================================================================
  FICHA TÉCNICA DEL DISPOSITIVO Y AUDITORÍA (MapaDetallesDispositivo.vue)
  ============================================================================
  
  ¿QUÉ HACE?
  Presenta los detalles técnicos del dispositivo capturado, aplicando revelación
  condicional de identidad (PC Hostname y cuenta) únicamente ante señales de alerta.
  
  ¿CON QUÉ SE CONECTA?
  - ModalMapaUbicacionAuditoria.vue (Componente modal contenedor)
  - useEncuestas.ts (Tipo RegistroRespuesta)
-->

<script setup lang="ts">
import { Laptop, AlertTriangle, ShieldCheck } from 'lucide-vue-next'
import type { RegistroRespuesta } from '@/Almacenes/useEncuestas'

defineProps<{
  registro: RegistroRespuesta
  tieneAlertas: boolean
}>()
</script>

<template>
  <div class="space-y-3 text-left text-xs">
    <!-- Tarjeta de Identidad (Revelación Condicional) -->
    <div
      class="p-4 rounded-2xl border transition-all"
      :class="tieneAlertas 
        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800/80 shadow-md' 
        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Laptop class="w-4 h-4 text-sky-500" />
          <span class="font-bold text-slate-900 dark:text-white">Identidad del Equipo y Cuenta</span>
        </div>
        
        <span
          v-if="tieneAlertas"
          class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 flex items-center gap-1"
        >
          <AlertTriangle class="w-3 h-3" />
          <span>Revelado por Alerta</span>
        </span>

        <span
          v-else
          class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1"
        >
          <ShieldCheck class="w-3 h-3" />
          <span>Protegido por Privacidad</span>
        </span>
      </div>

      <!-- Con alertas: Hostname del equipo -->
      <div v-if="tieneAlertas" class="space-y-2 pt-2">
        <div class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="text-slate-500">Nombre de Host / PC:</span>
            <strong class="font-mono text-slate-900 dark:text-amber-300 font-bold">{{ registro.nombreEquipoPC || 'PC-CORP-42' }}</strong>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-500">Cuenta de Usuario SO:</span>
            <strong class="font-mono text-slate-900 dark:text-amber-300 font-bold">{{ registro.cuentaUsuarioPC || 'usuario.corporativo' }}</strong>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-500">Dirección IP aproximada:</span>
            <span class="font-mono text-slate-600 dark:text-slate-400">{{ registro.ubicacion?.ipAprox || '190.157.34.112' }}</span>
          </div>
        </div>
        <p class="text-[11px] text-amber-800 dark:text-amber-300/90 leading-tight">
          ℹ️ <strong>Protocolo de Intervención:</strong> Al detectarse indicios de riesgo crítico se habilita la identificación del puesto de trabajo para auxilio de Bienestar.
        </p>
      </div>

      <!-- Sin alertas: Encriptado -->
      <div v-else class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 text-[11px] text-slate-600 dark:text-slate-400 mt-2">
        <p class="font-medium text-slate-800 dark:text-slate-200">
          🔒 <strong>Confidencialidad Absoluta:</strong>
        </p>
        <p>
          El colaborador no emitió señales de riesgo. El nombre de equipo y la cuenta se mantienen encriptados para proteger la privacidad.
        </p>
      </div>
    </div>

    <!-- Metadatos Rápidos -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-0.5">
        <span class="text-[10px] text-slate-400 font-semibold">Ciudad / Sede</span>
        <p class="font-bold text-slate-800 dark:text-slate-200 truncate">{{ registro.ubicacion?.ciudad || 'Bogotá' }}</p>
      </div>
      <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-0.5">
        <span class="text-[10px] text-slate-400 font-semibold">Fecha de Envío</span>
        <p class="font-bold text-slate-800 dark:text-slate-200 truncate">{{ registro.fecha }}</p>
      </div>
      <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-0.5">
        <span class="text-[10px] text-slate-400 font-semibold">Hora de Sesión</span>
        <p class="font-bold text-slate-800 dark:text-slate-200 truncate">{{ registro.hora }}</p>
      </div>
      <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-0.5">
        <span class="text-[10px] text-slate-400 font-semibold">Preguntas</span>
        <p class="font-bold text-slate-800 dark:text-slate-200">{{ registro.respuestas?.length || 0 }} ítems</p>
      </div>
    </div>
  </div>
</template>
