<!--
  ============================================================================
  TARJETA DE BLOQUE DE ALERTA PSICOSOCIAL (TarjetaBloqueAlertaItem.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Presenta las alertas agrupadas como un Bloque/Criterio consolidado:
  - Muestra cuántas personas/colaboradores activaron esta alerta ("X personas").
  - Muestra cuántos dejaron comentario escrito.
  - Al hacer clic abre el Modal de Inspección por Bloque con todos los comentarios.
-->

<script setup lang="ts">
import {
  ShieldAlert,
  Users,
  MessageSquare,
  ChevronRight,
  Flame,
  HeartCrack,
  LogOut,
  AlertTriangle,
  Users2,
  Target,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-vue-next'
import { BotonBase } from '@/componentes/ElementosBase'
import type { NotificacionItem } from '@/Almacenes/useNotificaciones'
import type { TipoAlertaPersonalizada, NivelAlerta } from '@/Almacenes/useTiposAlertas'

export interface BloqueAlertaItem {
  id: string
  titulo: string
  descripcion: string
  nivel: NivelAlerta
  severidad: 'Crítica' | 'Alta' | 'Moderada' | 'Baja'
  tipoConfigurado?: TipoAlertaPersonalizada
  alertas: NotificacionItem[]
  totalPersonas: number
  conComentariosCount: number
  conteosPorEstado: {
    detectadas: number
    enRevision: number
    atendidas: number
    descartadas: number
  }
}

const props = defineProps<{
  bloque: BloqueAlertaItem
  claseColorNivel: { badge: string; border: string; bg?: string; text?: string; glow?: string }
}>()

const emit = defineEmits<{
  (e: 'abrirBloque', bloque: BloqueAlertaItem): void
}>()

const obtenerIconoBloque = (titulo: string) => {
  const t = titulo.toLowerCase()
  if (t.includes('depres') || t.includes('salud mental')) return HeartCrack
  if (t.includes('renuncia') || t.includes('desmotiva')) return LogOut
  if (t.includes('acoso') || t.includes('hostiga')) return AlertTriangle
  if (t.includes('social') || t.includes('aisla')) return Users2
  if (t.includes('burnout') || t.includes('estrés') || t.includes('estres')) return Flame
  return ShieldAlert
}
</script>

<template>
  <div
    class="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4 relative group hover:border-amber-500/60 hover:shadow-lg transition-all flex flex-col justify-between text-left cursor-pointer"
    @click="emit('abrirBloque', bloque)"
  >
    <div class="space-y-3.5">
      <!-- Encabezado del Bloque -->
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-start gap-3">
          <div 
            class="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
            :class="bloque.nivel === 1
              ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800'
              : bloque.nivel === 2
              ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800'
              : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800'"
          >
            <component :is="obtenerIconoBloque(bloque.titulo)" class="w-6 h-6" />
          </div>

          <div class="space-y-1">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                BLOQUE DE ALERTA
              </span>
              <span 
                class="text-[9px] font-extrabold px-2 py-0.5 rounded-full border uppercase"
                :class="claseColorNivel.badge"
              >
                Nivel {{ bloque.nivel }} — {{ bloque.severidad }}
              </span>
            </div>

            <h4 class="text-base font-black text-slate-900 dark:text-white leading-snug">
              {{ bloque.titulo }}
            </h4>
          </div>
        </div>

        <div class="shrink-0 pt-1">
          <span class="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-amber-500 group-hover:bg-amber-50 dark:group-hover:bg-amber-950/60 transition-all">
            <ChevronRight class="w-4 h-4" />
          </span>
        </div>
      </div>

      <!-- Métricas Destacadas del Bloque (Conteo de Personas) -->
      <div class="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700 dark:text-amber-300 shrink-0">
            <Users class="w-4 h-4" />
          </div>
          <div>
            <div class="text-lg font-black text-slate-900 dark:text-amber-200 leading-none">
              {{ bloque.totalPersonas }}
            </div>
            <div class="text-[10px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wide">
              {{ bloque.totalPersonas === 1 ? 'Persona / Respuesta' : 'Personas que la activaron' }}
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2.5 border-l border-amber-200 dark:border-amber-800/60 pl-2.5">
          <div class="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-700 dark:text-sky-300 shrink-0">
            <MessageSquare class="w-4 h-4" />
          </div>
          <div>
            <div class="text-lg font-black text-slate-900 dark:text-sky-200 leading-none">
              {{ bloque.conComentariosCount }}
            </div>
            <div class="text-[10px] font-bold text-sky-800 dark:text-sky-400 uppercase tracking-wide">
              {{ bloque.conComentariosCount === 1 ? 'Dejó comentario' : 'Dejaron comentarios' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Descripción / Criterio de Encasillamiento -->
      <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
        {{ bloque.descripcion }}
      </p>

      <div v-if="bloque.tipoConfigurado?.enfoqueDetalle" class="flex items-center gap-1.5 text-[11px] text-sky-700 dark:text-sky-300 bg-sky-50/50 dark:bg-sky-950/30 p-2 rounded-xl border border-sky-100 dark:border-sky-900/40">
        <Target class="w-3.5 h-3.5 text-sky-500 shrink-0" />
        <span class="truncate"><strong>Foco:</strong> {{ bloque.tipoConfigurado.enfoqueDetalle }}</span>
      </div>
    </div>

    <!-- Pie del Bloque: Resumen por Estados & Botón de Inspección -->
    <div class="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
      <div class="flex items-center justify-between gap-1 flex-wrap text-[11px]">
        <div class="flex items-center gap-1.5 flex-wrap">
          <span v-if="bloque.conteosPorEstado.detectadas > 0" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
            <AlertTriangle class="w-3 h-3" />
            {{ bloque.conteosPorEstado.detectadas }} Nuevas
          </span>
          <span v-if="bloque.conteosPorEstado.enRevision > 0" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 text-[10px] font-bold">
            <Clock class="w-3 h-3" />
            {{ bloque.conteosPorEstado.enRevision }} Revisión
          </span>
          <span v-if="bloque.conteosPorEstado.atendidas > 0" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
            <CheckCircle2 class="w-3 h-3" />
            {{ bloque.conteosPorEstado.atendidas }} Atendidas
          </span>
          <span v-if="bloque.conteosPorEstado.descartadas > 0" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold">
            <XCircle class="w-3 h-3" />
            {{ bloque.conteosPorEstado.descartadas }} Descartadas
          </span>
        </div>
      </div>

      <BotonBase
        variante="secundario"
        tamano="pequeno"
        anchoCompleto
        @click.stop="emit('abrirBloque', bloque)"
      >
        <template #iconoIzquierdo>
          <MessageSquare class="w-4 h-4 text-amber-500" />
        </template>
        <span>Ver Respuestas & Comentarios ({{ bloque.totalPersonas }})</span>
      </BotonBase>
    </div>
  </div>
</template>
