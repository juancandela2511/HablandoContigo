<!--
  ============================================================================
  VISTA DE ERROR 404 - RECURSO NO ENCONTRADO (Error404View.vue)
  ============================================================================
  
  ¿QUÉ HACE?
  Provee una pantalla de error amigable, moderna y ejecutiva cuando un usuario
  navega hacia una URL inexistente, encuesta caducada o ruta no mapeada.
  
  ¿CON QUÉ SE CONECTA?
  - router/index.ts (Ruta comodín /:pathMatch(.*)* y /404)
  - useAuth.ts (Para sugerir Dashboard si tiene sesión activa)
-->

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { Home, ArrowLeft, LayoutDashboard, HelpCircle, Compass } from 'lucide-vue-next'
import { useAuth } from '@/Almacenes/useAuth'

const route = useRoute()
const router = useRouter()
const { estaAutenticado } = useAuth()

const regresarPaginaAnterior = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-[#080d1a] text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden font-['Poppins',sans-serif] transition-colors duration-300">
    
    <!-- Luces ambientales de fondo -->
    <div class="fixed -top-32 -left-32 w-96 h-96 bg-blue-500/15 dark:bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
    <div class="fixed -bottom-32 -right-32 w-96 h-96 bg-sky-500/15 dark:bg-sky-500/20 rounded-full blur-3xl pointer-events-none"></div>

    <div class="max-w-xl w-full text-center relative z-10 space-y-6">
      
      <!-- Icono central de Brújula / Radar con pulso -->
      <div class="relative mx-auto w-24 h-24 flex items-center justify-center">
        <div class="absolute inset-0 bg-sky-500/20 dark:bg-sky-500/30 rounded-3xl animate-ping"></div>
        <div class="relative w-24 h-24 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex items-center justify-center text-sky-600 dark:text-sky-400">
          <Compass class="w-12 h-12 stroke-[1.5] animate-pulse" />
        </div>
      </div>

      <!-- Badge 404 con degradado -->
      <div class="space-y-2">
        <span class="inline-block text-6xl sm:text-7xl font-black font-mono tracking-wider bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 bg-clip-text text-transparent select-none">
          404
        </span>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Página o Recurso No Encontrado
        </h1>
        <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          La ruta a la que intentas acceder no existe, fue reubicada o la encuesta ha finalizado su período de recolección anónima.
        </p>
      </div>

      <!-- Diagnóstico técnico amigable -->
      <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-200/70 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400 max-w-full overflow-hidden text-ellipsis">
        <span class="text-sky-600 dark:text-sky-400 font-bold">Ruta consultada:</span>
        <span class="truncate">{{ route.fullPath }}</span>
      </div>

      <!-- Botones de Acción Rápida -->
      <div class="pt-4 flex flex-wrap items-center justify-center gap-3">
        <button
          @click="regresarPaginaAnterior"
          class="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <ArrowLeft class="w-4 h-4" />
          <span>Regresar</span>
        </button>

        <router-link
          to="/"
          class="px-5 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-sky-600/20 active:scale-95 cursor-pointer"
        >
          <Home class="w-4 h-4" />
          <span>Ir al Inicio</span>
        </router-link>

        <router-link
          v-if="estaAutenticado"
          to="/dashboard"
          class="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-indigo-600/20 active:scale-95 cursor-pointer"
        >
          <LayoutDashboard class="w-4 h-4" />
          <span>Dashboard</span>
        </router-link>

        <router-link
          v-else
          to="/responder"
          class="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer"
        >
          <HelpCircle class="w-4 h-4" />
          <span>Responder Encuesta</span>
        </router-link>
      </div>

    </div>

    <!-- Footer sutil -->
    <div class="absolute bottom-4 text-center text-[11px] text-slate-400 dark:text-slate-600 font-mono">
      HablandoContigo &bull; Ecosistema de Clima Laboral Seguro y Confidencial
    </div>

  </div>
</template>
