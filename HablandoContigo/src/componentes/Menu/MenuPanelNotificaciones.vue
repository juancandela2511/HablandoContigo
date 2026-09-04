<!--
  ============================================================================
  COMPONENTE PANEL DRAWER DE NOTIFICACIONES (MenuPanelNotificaciones.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Cajón lateral flotante (`drawer`) con las alertas de convivencia y notificaciones:
  - Filtro por tipo: Todas, Alertas de Acoso/Carga, Sistema.
  - Indicador de no leídas y botón "Marcar todas leídas".
  - Ítems interactivos que navegan directamente a la sección relevante mediante `navegarYResaltar()`.
  
  ¿PARA QUÉ SIRVE?
  - Proveer acceso rápido a los incidentes críticos desde cualquier pantalla de la aplicación.
  
  ¿CON QUÉ ESTÁ VINCULADO / CONECTADO?
  - useNotificaciones.ts: Tipos `NotificacionItem`.
  - useHighlight.ts: Aplica el efecto spotlight al hacer clic en una notificación.
  - Menu.vue: Componente padre.
-->

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { NotificacionItem } from '@/Almacenes/useNotificaciones'
import { Bell, X, Check, ShieldAlert, Sparkles, Info, ChevronRight } from 'lucide-vue-next'

const props = defineProps<{
  abierto: boolean
  notificaciones: NotificacionItem[]
  noLeidas: number
}>()

defineEmits<{
  (e: 'cerrar'): void
  (e: 'marcarLeida', id: string): void
  (e: 'marcarTodasLeidas'): void
  (e: 'clickNotificacion', notif: NotificacionItem): void
}>()

const filtroNotificaciones = ref<'todas' | 'alertas' | 'sistema'>('todas')

const notificacionesFiltradas = computed(() => {
  if (filtroNotificaciones.value === 'alertas') {
    return props.notificaciones.filter(n => n.tipo === 'alerta_clima' || n.tipo === 'acoso' || n.tipo === 'burnout' || n.tipo === 'alerta')
  }
  if (filtroNotificaciones.value === 'sistema') {
    return props.notificaciones.filter(n => n.tipo === 'sistema' || n.tipo === 'seguridad_perfil' || n.tipo === 'encuesta' || n.tipo === 'cuenta')
  }
  return props.notificaciones
})
</script>

<template>
  <transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0 -translate-x-4"
    enter-to-class="opacity-100 translate-x-0"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100 translate-x-0"
    leave-to-class="opacity-0 -translate-x-4"
  >
    <div
      v-if="abierto"
      class="fixed left-20 top-4 bottom-4 w-80 sm:w-96 rounded-3xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-white/10 shadow-2xl backdrop-blur-2xl z-50 flex flex-col overflow-hidden text-left"
    >
      <!-- Encabezado del Panel -->
      <div class="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <Bell class="w-4 h-4" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-slate-900 dark:text-white">Centro de Notificaciones</h3>
            <span class="text-[11px] text-slate-500">{{ noLeidas }} pendientes de revisión</span>
          </div>
        </div>

        <button
          @click="$emit('cerrar')"
          class="p-1 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Filtros Rápidos -->
      <div class="flex items-center gap-1.5 p-2 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-[11px]">
        <button
          v-for="filtro in ['todas', 'alertas', 'sistema'] as const"
          :key="filtro"
          @click="filtroNotificaciones = filtro"
          :class="[
            'px-2.5 py-1 rounded-lg font-medium transition-all capitalize cursor-pointer',
            filtroNotificaciones === filtro
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-semibold'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          ]"
        >
          {{ filtro }}
        </button>

        <button
          v-if="noLeidas > 0"
          @click="$emit('marcarTodasLeidas')"
          class="ml-auto text-sky-600 dark:text-sky-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
        >
          <Check class="w-3 h-3" />
          <span>Leídas</span>
        </button>
      </div>

      <!-- Lista Scrollable de Notificaciones -->
      <div class="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-2 space-y-1">
        <div
          v-for="notif in notificacionesFiltradas"
          :key="notif.id"
          @click="$emit('clickNotificacion', notif)"
          :class="[
            'p-3 rounded-2xl transition-all cursor-pointer flex items-start gap-3 group relative',
            notif.leida
              ? 'opacity-70 hover:opacity-100 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              : 'bg-blue-50/70 dark:bg-blue-950/30 hover:bg-blue-100/70 dark:hover:bg-blue-950/50'
          ]"
        >
          <!-- Icono de Severidad / Tipo -->
          <div 
            :class="[
              'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border text-xs',
              notif.severidad === 'Crítica' ? 'bg-red-100 dark:bg-red-950/80 border-red-300 dark:border-red-800 text-red-600 dark:text-red-400' :
              notif.severidad === 'Moderada' ? 'bg-amber-100 dark:bg-amber-950/80 border-amber-300 dark:border-amber-800 text-amber-600 dark:text-amber-400' :
              'bg-blue-100 dark:bg-blue-950/80 border-blue-300 dark:border-blue-800 text-sky-600 dark:text-sky-400'
            ]"
          >
            <ShieldAlert v-if="notif.tipo === 'alerta_clima' || notif.tipo === 'acoso' || notif.tipo === 'burnout' || notif.tipo === 'alerta'" class="w-4 h-4" />
            <Sparkles v-else-if="notif.tipo === 'encuesta'" class="w-4 h-4" />
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

        <div v-if="notificacionesFiltradas.length === 0" class="py-12 text-center text-slate-400 space-y-1">
          <Bell class="w-8 h-8 mx-auto opacity-30" />
          <p class="text-xs font-medium">No hay notificaciones en esta categoría</p>
        </div>
      </div>

    </div>
  </transition>
</template>
