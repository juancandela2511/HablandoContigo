<!--
  ============================================================================
  ENCABEZADO DE DETALLE DE ALERTA (DetalleAlertaEncabezado.vue)
  ============================================================================
-->

<script setup lang="ts">
import { Laptop, Building, Clock } from 'lucide-vue-next'
import type { NotificacionItem } from '@/Almacenes/useNotificaciones'
import type { NivelAlerta } from '@/Almacenes/useTiposAlertas'

defineProps<{
  alerta: NotificacionItem
  nivel: NivelAlerta
  claseColorNivel: { badge: string; border: string; bg?: string; text?: string; glow?: string }
}>()
</script>

<template>
  <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 text-left">
    <div class="flex items-center justify-between flex-wrap gap-2">
      <div class="flex items-center gap-2">
        <span class="text-xs font-bold uppercase tracking-wider text-slate-500">
          {{ alerta.departamento || 'General' }}
        </span>
        <span :class="['text-[10px] font-extrabold px-2 py-0.5 rounded border', claseColorNivel.badge]">
          Nivel {{ nivel }} · Severidad {{ alerta.severidad || 'Moderada' }}
        </span>
      </div>

      <span class="text-xs text-slate-500 flex items-center gap-1">
        <Clock class="w-3.5 h-3.5" />
        <span>{{ alerta.fecha }}</span>
      </span>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono pt-1 border-t border-slate-200 dark:border-slate-800">
      <div class="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
        <Laptop class="w-3.5 h-3.5 text-sky-500 shrink-0" />
        <span>Dispositivo: {{ alerta.nombreEquipoPC || 'PC-CORP' }}</span>
      </div>
      <div class="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
        <Building class="w-3.5 h-3.5 text-purple-500 shrink-0" />
        <span>Sede / Área: {{ alerta.departamento || 'Sin especificar' }}</span>
      </div>
    </div>
  </div>
</template>
