<!--
  ============================================================================
  ENLACES DE NAVEGACIÓN PRINCIPAL DEL MENÚ (MenuNavegacionPrincipal.vue)
  ============================================================================
-->

<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'

defineProps<{
  enlaces: Array<{
    nombre: string
    tipo: 'ruta' | 'accion'
    ruta?: string
    accion?: () => void
    icono: any
    badge?: string
  }>
  seccionesDashboard: Array<{
    id: string
    nombre: string
    icono: any
  }>
  submenuDashboardAbierto: boolean
  rutaActualPath: string
  rutaActualSeccion?: any
}>()

const emit = defineEmits<{
  (e: 'toggleSubmenuDashboard'): void
  (e: 'cerrarSubmenu'): void
}>()
</script>

<template>
  <ul class="flex flex-col m-0 p-1.5 list-none space-y-1 text-left">
    <li v-for="enlace in enlaces" :key="enlace.nombre" class="w-full">
      <!-- Caso Dashboard con Sub-menú Desplegable -->
      <div v-if="enlace.nombre === 'Dashboard'" class="w-full">
        <div class="flex items-center w-full">
          <router-link
            :to="enlace.ruta!"
            :class="[
              'flex items-center h-10 flex-1 rounded-xl text-slate-400 no-underline transition-all duration-200 hover:text-white hover:bg-slate-800/90',
              rutaActualPath.startsWith('/dashboard') ? 'text-white bg-sky-600/90 font-semibold shadow-sm !text-white' : ''
            ]"
            :title="enlace.nombre"
          >
            <div class="w-11 min-w-11 flex items-center justify-center shrink-0">
              <component :is="enlace.icono" class="w-4 h-4" />
            </div>
            <span class="overflow-hidden whitespace-nowrap opacity-0 transition-all duration-300 group-hover:opacity-100 text-xs font-medium tracking-wide">
              {{ enlace.nombre }}
            </span>
          </router-link>
          
          <button
            type="button"
            @click.stop="emit('toggleSubmenuDashboard')"
            class="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer mr-1"
            title="Desplegar secciones del Dashboard"
          >
            <ChevronDown 
              class="w-3.5 h-3.5 transition-transform duration-200" 
              :class="submenuDashboardAbierto ? 'rotate-180 text-sky-400' : ''"
            />
          </button>
        </div>

        <!-- Submenú de Secciones -->
        <transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 max-h-0 py-0"
          enter-to-class="opacity-100 max-h-48 py-1"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100 max-h-48 py-1"
          leave-to-class="opacity-0 max-h-0 py-0"
        >
          <div
            v-if="submenuDashboardAbierto"
            class="pl-7 pr-1.5 space-y-0.5 border-l border-slate-800 ml-4 my-0.5 text-[11px] overflow-hidden"
          >
            <router-link
              v-for="sec in seccionesDashboard"
              :key="sec.id"
              :to="`/dashboard?seccion=${sec.id}`"
              :class="[
                'flex items-center gap-2 py-1 px-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors no-underline truncate',
                rutaActualSeccion === sec.id ? 'text-sky-400 bg-sky-950/60 font-semibold' : ''
              ]"
            >
              <component :is="sec.icono" class="w-3 h-3 text-sky-400 shrink-0" />
              <span class="truncate">{{ sec.nombre }}</span>
            </router-link>
          </div>
        </transition>
      </div>

      <!-- Ruta Estándar -->
      <router-link
        v-else-if="enlace.tipo === 'ruta'"
        :to="enlace.ruta!"
        @click="emit('cerrarSubmenu')"
        :class="[
          'flex items-center h-10 w-full rounded-xl text-slate-400 no-underline transition-all duration-200 hover:text-white hover:bg-slate-800/90',
          rutaActualPath === enlace.ruta ? 'text-white bg-sky-600/90 font-semibold shadow-sm !text-white' : ''
        ]"
        :title="enlace.nombre"
      >
        <div class="w-11 min-w-11 flex items-center justify-center shrink-0">
          <component :is="enlace.icono" class="w-4 h-4" />
        </div>
        <span class="overflow-hidden whitespace-nowrap opacity-0 transition-all duration-300 group-hover:opacity-100 text-xs font-medium tracking-wide">
          {{ enlace.nombre }}
        </span>
      </router-link>

      <!-- Botón de Acción (Spotlight, Soporte, etc.) -->
      <button
        v-else
        type="button"
        @click="enlace.accion?.()"
        class="flex items-center h-10 w-full rounded-xl text-slate-400 no-underline transition-all duration-200 hover:text-white hover:bg-slate-800/90 cursor-pointer text-left"
        :title="enlace.nombre"
      >
        <div class="w-11 min-w-11 flex items-center justify-center shrink-0">
          <component :is="enlace.icono" class="w-4 h-4 text-sky-400" />
        </div>
        <span class="overflow-hidden whitespace-nowrap opacity-0 transition-all duration-300 group-hover:opacity-100 text-xs font-medium tracking-wide flex items-center justify-between w-full pr-2">
          <span>{{ enlace.nombre }}</span>
          <kbd v-if="enlace.badge" class="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-slate-300 font-mono border border-slate-700">
            {{ enlace.badge }}
          </kbd>
        </span>
      </button>
    </li>
  </ul>
</template>
