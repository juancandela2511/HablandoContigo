<!--
  ============================================================================
  TARJETA INDIVIDUAL DE ALERTA PSICOSOCIAL (TarjetaAlertaItem.vue)
  ============================================================================
-->

<script setup lang="ts">
import {
  ShieldAlert,
  Clock,
  Eye,
  HeartCrack,
  LogOut,
  AlertTriangle,
  Users2,
  Flame,
  Laptop,
  Target
} from 'lucide-vue-next'
import { BotonBase } from '@/componentes/ElementosBase'
import type { NotificacionItem } from '@/Almacenes/useNotificaciones'
import type { TipoAlertaPersonalizada, NivelAlerta } from '@/Almacenes/useTiposAlertas'

const props = defineProps<{
  alerta: NotificacionItem
  nivel: NivelAlerta
  claseColorNivel: { badge: string; border: string; bg?: string; text?: string; glow?: string }
  tipoConfigurado?: TipoAlertaPersonalizada
}>()

defineEmits<{
  (e: 'inspeccionar', alerta: NotificacionItem): void
}>()

const obtenerIconoAlerta = (tipo: string) => {
  switch (tipo) {
    case 'depresion': return HeartCrack
    case 'renuncia': return LogOut
    case 'acoso': return AlertTriangle
    case 'social': return Users2
    case 'burnout': return Flame
    default: return ShieldAlert
  }
}
</script>

<template>
  <div class="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-3 relative group hover:border-amber-500/50 transition-all flex flex-col justify-between text-left">
    <div class="space-y-3">
      <div class="flex items-start justify-between gap-2">
        <div class="flex items-center gap-2">
          <div 
            class="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
            :class="nivel === 1
              ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800'
              : nivel === 2
              ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800'
              : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800'"
          >
            <component :is="obtenerIconoAlerta(alerta.tipo)" class="w-5 h-5" />
          </div>
          <div>
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {{ alerta.departamento || 'General' }}
              </span>
              <!-- Badge de Nivel -->
              <span 
                class="text-[9px] font-extrabold px-1.5 py-0.2 rounded border"
                :class="claseColorNivel.badge"
              >
                Nivel {{ nivel }}
              </span>
            </div>

            <h4 class="text-sm font-black text-slate-900 dark:text-white leading-snug">
              {{ alerta.tipoAlerta || alerta.titulo }}
            </h4>
          </div>
        </div>

        <!-- Badge de Estado -->
        <span 
          :class="[
            'text-[10px] font-bold px-2 py-0.5 rounded-full border',
            alerta.estado === 'Descartada'
              ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              : alerta.estado === 'Atendida'
              ? 'bg-emerald-100 dark:bg-emerald-950 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
              : 'bg-amber-100 dark:bg-amber-950 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400'
          ]"
        >
          {{ alerta.estado || 'Detectada' }}
        </span>
      </div>

      <!-- Mensaje / Motivo de Alerta con Criterio de Encasillamiento -->
      <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-1">
        <p class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          {{ alerta.mensaje || alerta.descripcion }}
        </p>
        <div v-if="tipoConfigurado?.enfoqueDetalle" class="pt-1 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center gap-1 text-[10px] text-sky-700 dark:text-sky-300">
          <Target class="w-3 h-3 text-sky-500 shrink-0" />
          <span class="truncate"><strong>Foco IA:</strong> {{ tipoConfigurado.enfoqueDetalle }}</span>
        </div>
      </div>

      <!-- Tarjeta de PC y Cuenta -->
      <div class="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-0.5">
        <span class="flex items-center gap-1">
          <Laptop class="w-3.5 h-3.5 text-slate-400" />
          <span>{{ alerta.nombreEquipoPC || 'PC-CORP' }}</span>
        </span>
        <span class="text-slate-400 font-sans text-[10px] flex items-center gap-1">
          <Clock class="w-3 h-3" />
          <span>{{ alerta.fecha }}</span>
        </span>
      </div>
    </div>

    <!-- Botón Ver Detalles y Resolver -->
    <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
      <span class="text-[10px] text-slate-400 font-semibold">
        Severidad: {{ alerta.severidad || 'Moderada' }}
      </span>

      <BotonBase
        variante="secundario"
        tamano="xs"
        @click="$emit('inspeccionar', alerta)"
      >
        <template #iconoIzquierdo>
          <Eye class="w-3.5 h-3.5" />
        </template>
        <span>Examinar & Resolver</span>
      </BotonBase>
    </div>
  </div>
</template>
