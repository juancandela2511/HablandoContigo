<!--
  ============================================================================
  LISTA INTERACTIVA DE NOTIFICACIONES (NotificacionesListaItems.vue)
  ============================================================================
  
  ¿QUÉ HACE?
  Muestra la lista filtrada de notificaciones y alertas psicosociales con indicador
  de severidad, departamento, fecha/hora y disparador de navegación.
  
  ¿CON QUÉ SE CONECTA?
  - NotificacionesFlotante.vue (Componente contenedor)
  - useNotificaciones.ts (Tipo NotificacionItem)
-->

<script setup lang="ts">
import { Sparkles, BarChart3, KeyRound, Sliders, Info, ChevronRight, Bell, Check } from 'lucide-vue-next'
import type { NotificacionItem } from '@/Almacenes/useNotificaciones'

defineProps<{
  notificaciones: NotificacionItem[]
  filtroActual: 'todas' | 'encuestas' | 'informes' | 'seguridad' | 'modulos'
  noLeidas: number
}>()

const emit = defineEmits<{
  (e: 'cambiarFiltro', filtro: 'todas' | 'encuestas' | 'informes' | 'seguridad' | 'modulos'): void
  (e: 'marcarTodasLeidas'): void
  (e: 'clickNotificacion', notif: NotificacionItem): void
}>()
</script>

<template>
  <div class="flex flex-col flex-1 max-h-[480px]">
    <!-- Pestañas de Filtrado Rápido -->
    <div class="flex items-center gap-1 px-3 py-2 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200/80 dark:border-slate-800 text-[11px] overflow-x-auto no-scrollbar">
      <button
        v-for="filtro in ['todas', 'encuestas', 'informes', 'seguridad', 'modulos'] as const"
        :key="filtro"
        type="button"
        @click="emit('cambiarFiltro', filtro)"
        :class="[
          'px-2.5 py-1 rounded-lg font-medium transition-all capitalize cursor-pointer shrink-0',
          filtroActual === filtro
            ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-semibold'
            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
        ]"
      >
        {{ filtro }}
      </button>

      <button
        v-if="noLeidas > 0"
        type="button"
        @click="emit('marcarTodasLeidas')"
        class="ml-auto text-sky-600 dark:text-sky-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer text-[10px] shrink-0"
      >
        <Check class="w-3 h-3" />
        <span>Marcar leídas</span>
      </button>
    </div>

    <!-- Lista Desplazable -->
    <div class="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-2 space-y-1 text-left">
      <div
        v-for="notif in notificaciones"
        :key="notif.id"
        @click="emit('clickNotificacion', notif)"
        :class="[
          'p-3 rounded-2xl transition-all cursor-pointer flex items-start gap-3 group relative select-text',
          notif.leida
            ? 'opacity-70 hover:opacity-100 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            : 'bg-sky-50/70 dark:bg-sky-950/30 hover:bg-sky-100/70 dark:hover:bg-sky-950/50'
        ]"
      >
        <div 
          :class="[
            'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border text-xs',
            notif.tipo === 'encuesta' ? 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400' :
            notif.tipo === 'informe' ? 'bg-indigo-100 dark:bg-indigo-950/80 border-indigo-300 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400' :
            notif.tipo === 'seguridad' || notif.tipo === 'seguridad_perfil' ? 'bg-amber-100 dark:bg-amber-950/80 border-amber-300 dark:border-amber-800 text-amber-600 dark:text-amber-400' :
            notif.tipo === 'modulo' ? 'bg-sky-100 dark:bg-sky-950/80 border-sky-300 dark:border-sky-800 text-sky-600 dark:text-sky-400' :
            'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300'
          ]"
        >
          <Sparkles v-if="notif.tipo === 'encuesta'" class="w-4 h-4" />
          <BarChart3 v-else-if="notif.tipo === 'informe'" class="w-4 h-4" />
          <KeyRound v-else-if="notif.tipo === 'seguridad' || notif.tipo === 'seguridad_perfil'" class="w-4 h-4" />
          <Sliders v-else-if="notif.tipo === 'modulo'" class="w-4 h-4" />
          <Info v-else class="w-4 h-4" />
        </div>

        <div class="flex-1 min-w-0 space-y-0.5">
          <div class="flex items-center justify-between">
            <p class="text-xs font-bold text-slate-900 dark:text-white truncate">
              {{ notif.titulo }}
            </p>
            <span class="text-[10px] text-slate-400 font-normal shrink-0 ml-1">
              {{ notif.hora }}
            </span>
          </div>
          <p class="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {{ notif.mensaje || notif.descripcion }}
          </p>
          <div class="flex items-center justify-between pt-1">
            <span class="text-[10px] text-sky-600 dark:text-sky-400 font-medium">
              {{ notif.departamento || 'General' }}
            </span>
            <span class="text-[10px] text-slate-400 flex items-center gap-0.5 group-hover:text-sky-500">
              Ver detalle <ChevronRight class="w-3 h-3" />
            </span>
          </div>
        </div>

        <span v-if="!notif.leida" class="w-2 h-2 rounded-full bg-sky-500 shrink-0 mt-1"></span>
      </div>

      <div v-if="notificaciones.length === 0" class="py-10 text-center text-slate-400 space-y-1">
        <Bell class="w-7 h-7 mx-auto opacity-30" />
        <p class="text-xs font-medium">No hay notificaciones en esta categoría</p>
      </div>
    </div>
  </div>
</template>
