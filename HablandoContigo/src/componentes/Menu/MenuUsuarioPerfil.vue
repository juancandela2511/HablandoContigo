<!--
  ============================================================================
  PERFIL DE USUARIO Y CIERRE DE SESIÓN EN EL MENÚ (MenuUsuarioPerfil.vue)
  ============================================================================
-->

<script setup lang="ts">
import { LogOut, LogIn } from 'lucide-vue-next'
import type { Usuario } from '@/Almacenes/useAuth'

defineProps<{
  usuarioActual: Usuario | null
  estaAutenticado: boolean
  fotoPerfil: string
}>()

const emit = defineEmits<{
  (e: 'cerrarSesion'): void
}>()
</script>

<template>
  <div class="w-full text-left">
    <div v-if="estaAutenticado && usuarioActual" class="space-y-1">
      <router-link
        to="/configuracion"
        class="flex items-center h-12 w-full rounded-xl hover:bg-slate-800/90 transition-all p-1 no-underline group/user"
        title="Ver Perfil y Configuración"
      >
        <div class="w-11 min-w-11 flex items-center justify-center shrink-0 relative">
          <img
            v-if="fotoPerfil"
            :src="fotoPerfil"
            :alt="usuarioActual.nombre"
            class="w-7 h-7 rounded-xl object-cover ring-2 ring-sky-500/40"
          />
          <div
            v-else
            class="w-7 h-7 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm"
          >
            {{ usuarioActual.nombre.charAt(0).toUpperCase() }}
          </div>
          <span class="absolute bottom-1 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-slate-900 animate-pulse"></span>
        </div>

        <div class="overflow-hidden whitespace-nowrap opacity-0 transition-all duration-300 group-hover:opacity-100 flex flex-col min-w-0 pr-2">
          <span class="text-xs font-bold text-white truncate">{{ usuarioActual.nombre }}</span>
          <span class="text-[10px] text-sky-400 font-mono truncate">{{ usuarioActual.rol }}</span>
        </div>
      </router-link>

      <!-- Botón de Cerrar Sesión -->
      <button
        type="button"
        @click="emit('cerrarSesion')"
        class="flex items-center h-9 w-full rounded-xl text-rose-400/90 hover:text-rose-300 hover:bg-rose-950/40 transition-all cursor-pointer text-xs"
        title="Cerrar sesión"
      >
        <div class="w-11 min-w-11 flex items-center justify-center shrink-0">
          <LogOut class="w-4 h-4 text-rose-400" />
        </div>
        <span class="overflow-hidden whitespace-nowrap opacity-0 transition-all duration-300 group-hover:opacity-100 font-medium">
          Cerrar Sesión
        </span>
      </button>
    </div>

    <!-- No Autenticado: Botón Acceso -->
    <div v-else>
      <router-link
        to="/login"
        class="flex items-center h-10 w-full rounded-xl text-sky-400 hover:text-white hover:bg-sky-600/90 transition-all no-underline"
        title="Acceso Administrativo"
      >
        <div class="w-11 min-w-11 flex items-center justify-center shrink-0">
          <LogIn class="w-4 h-4" />
        </div>
        <span class="overflow-hidden whitespace-nowrap opacity-0 transition-all duration-300 group-hover:opacity-100 text-xs font-semibold">
          Iniciar Sesión
        </span>
      </router-link>
    </div>
  </div>
</template>
