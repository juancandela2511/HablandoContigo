<!--
  ============================================================================
  TARJETA DE PERSONA MENCIONADA EN COMENTARIOS (TarjetaPersonaMencionadaItem.vue)
  ============================================================================
  Muestra la tarjeta de cada persona señalada por nombre en los problemas:
  - Nombre de la persona mencionada.
  - Cuántos comentarios han salido sobre esa persona.
  - Botón del Ojo (👁️) para abrir el modal y ver todos los comentarios individuales.
-->

<script setup lang="ts">
import {
  UserX,
  Eye,
  MessageSquare,
  Sparkles,
  ShieldAlert,
  AlertTriangle
} from 'lucide-vue-next'
import type { BloqueAlertaItem } from './TarjetaBloqueAlertaItem.vue'

defineProps<{
  tarjeta: BloqueAlertaItem
}>()

const emit = defineEmits<{
  (e: 'abrirCasosPersona', tarjeta: BloqueAlertaItem): void
}>()
</script>

<template>
  <div
    class="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-rose-50/70 via-white to-amber-50/30 dark:from-rose-950/30 dark:via-slate-900 dark:to-slate-900 border border-rose-300/80 dark:border-rose-800/70 shadow-sm space-y-3 relative group hover:border-rose-500 transition-all flex flex-col justify-between text-left"
  >
    <div class="space-y-2.5">
      <!-- Encabezado con Nombre, Conteo de Comentarios y Botón del Ojo -->
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <UserX class="w-5 h-5" />
          </div>

          <div class="space-y-1">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 uppercase">
                Nombre Mencionado en Problemas
              </span>
              <span
                v-if="tarjeta.titulo.toLowerCase().includes('sexual')"
                class="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-pink-600 text-white uppercase flex items-center gap-1"
              >
                <ShieldAlert class="w-3 h-3" />
                <span>Acoso Sexual</span>
              </span>
              <span
                v-else
                class="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-amber-600 text-white uppercase flex items-center gap-1"
              >
                <AlertTriangle class="w-3 h-3" />
                <span>Problema / Queja Reportada</span>
              </span>
            </div>

            <h4 class="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug flex items-center gap-2 flex-wrap">
              <span>{{ tarjeta.nombrePersonaMencionada || tarjeta.titulo }}</span>
              <span class="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[11px] font-mono font-extrabold">
                {{ tarjeta.conComentariosCount }} {{ tarjeta.conComentariosCount === 1 ? 'comentario salido' : 'comentarios salidos' }}
              </span>
            </h4>
          </div>
        </div>

        <!-- Botón del Ojo (👁️) para ver los comentarios -->
        <button
          type="button"
          @click.stop="emit('abrirCasosPersona', tarjeta)"
          title="Ver comentarios donde se menciona a esta persona"
          class="w-10 h-10 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white border border-rose-400/40 flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-md hover:scale-105"
        >
          <Eye class="w-5 h-5" />
        </button>
      </div>

      <!-- Conteo de menciones y alertas asociadas -->
      <div class="p-2.5 rounded-2xl bg-white/90 dark:bg-slate-950/80 border border-rose-200/80 dark:border-rose-900/50 flex items-center justify-between gap-2 flex-wrap">
        <div class="flex items-center gap-1.5 text-rose-800 dark:text-rose-300 text-xs font-black">
          <MessageSquare class="w-4 h-4 text-rose-500 shrink-0" />
          <span>
            Ha salido en {{ tarjeta.conComentariosCount }} {{ tarjeta.conComentariosCount === 1 ? 'comentario' : 'comentarios' }} ({{ tarjeta.totalPersonas }} {{ tarjeta.totalPersonas === 1 ? 'colaborador' : 'colaboradores' }})
          </span>
        </div>
        <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate max-w-[260px]">
          {{ tarjeta.descripcion }}
        </span>
      </div>

      <!-- Resumen de IA -->
      <div
        v-if="tarjeta.analisisDetalladoIA"
        class="p-3 rounded-2xl bg-white/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-1"
      >
        <p class="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1">
          <Sparkles class="w-3.5 h-3.5" />
          <span>Resumen IA de los señalamientos:</span>
        </p>
        <p class="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
          {{ tarjeta.analisisDetalladoIA }}
        </p>
      </div>
    </div>

    <!-- Pie con botón del Ojo -->
    <div class="pt-2.5 border-t border-rose-200/60 dark:border-rose-900/40 flex items-center justify-between gap-2">
      <span class="text-[11px] text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
        <MessageSquare class="w-3.5 h-3.5 text-rose-500" />
        <span>{{ tarjeta.conComentariosCount }} {{ tarjeta.conComentariosCount === 1 ? 'comentario registrado' : 'comentarios registrados' }}</span>
      </span>

      <button
        type="button"
        @click.stop="emit('abrirCasosPersona', tarjeta)"
        class="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
      >
        <Eye class="w-3.5 h-3.5" />
        <span>Ver Comentarios ({{ tarjeta.conComentariosCount }})</span>
      </button>
    </div>
  </div>
</template>
