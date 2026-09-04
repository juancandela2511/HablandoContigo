<!--
  ============================================================================
  CRITERIO DE IA Y PROTOCOLO RECOMENDADO (DetalleAlertaCriterioIA.vue)
  ============================================================================
-->

<script setup lang="ts">
import { BrainCircuit, Target, HeartHandshake } from 'lucide-vue-next'
import type { NotificacionItem } from '@/Almacenes/useNotificaciones'
import type { TipoAlertaPersonalizada } from '@/Almacenes/useTiposAlertas'

defineProps<{
  alerta: NotificacionItem
  tipoConfigurado?: TipoAlertaPersonalizada
  protocoloRecomendado: { titulo: string; pasos: string[]; color: string } | null
}>()
</script>

<template>
  <div class="space-y-3.5 text-left text-xs">
    <!-- Testimonio / Mensaje Capturado -->
    <div class="space-y-1">
      <h5 class="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
        <BrainCircuit class="w-4 h-4 text-sky-500" />
        <span>Testimonio / Evidencia Capturada por la IA</span>
      </h5>
      <div class="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
        {{ alerta.mensaje || alerta.descripcion || 'Sin descripción detallada.' }}
      </div>
    </div>

    <!-- Enfoque y Criterio IA -->
    <div v-if="tipoConfigurado" class="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 space-y-1">
      <div class="flex items-center gap-1.5 text-sky-900 dark:text-sky-300 font-bold text-[11px]">
        <Target class="w-3.5 h-3.5 text-sky-500" />
        <span>Foco de Configuración: {{ tipoConfigurado.nombre }}</span>
      </div>
      <p class="text-slate-600 dark:text-slate-400 text-[11px]">
        <strong>Criterio:</strong> {{ tipoConfigurado.descripcion }}
      </p>
    </div>

    <!-- Protocolo de Mitigación Recomendado -->
    <div v-if="protocoloRecomendado" class="space-y-1.5">
      <h5 class="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
        <HeartHandshake class="w-4 h-4 text-emerald-500" />
        <span>Protocolo de Acción Recomendado</span>
      </h5>
      <div :class="['p-3.5 rounded-2xl border space-y-2', protocoloRecomendado.color]">
        <h6 class="font-bold">{{ protocoloRecomendado.titulo }}</h6>
        <ul class="list-disc list-inside space-y-1 text-[11px] opacity-90 pl-1">
          <li v-for="(paso, idx) in protocoloRecomendado.pasos" :key="idx">
            {{ paso }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
