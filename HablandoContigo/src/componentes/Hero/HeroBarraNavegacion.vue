<!--
  ============================================================================
  COMPONENTE BARRA DE NAVEGACIÓN HERO (HeroBarraNavegacion.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Cabecera minimalista superior para la página principal:
  - Logotipo y denominación con estado en vivo.
  - Enlaces de navegación adaptados al estado de autenticación (sin duplicados).
  - Selector de tema interactivo (Modo Claro / Modo Oscuro).
  - Botón de acceso administrativo para no autenticados o acceso al dashboard para usuarios con sesión.
  
  ¿PARA QUÉ SIRVE?
  - Proveer navegación limpia y contextualizada sin saturar ni duplicar opciones.
  
  ¿DÓNDE SE USA Y CON QUÉ ARCHIVOS SE CONECTA?
  - HeroPrincipal.vue: Componente padre en la portada.
  - useAuth.ts: Lee `estaAutenticado` para bifurcar rutas.
  - useTheme.ts: Sincroniza el cambio visual de tema.
  - BotonBase.vue: Botón reutilizable para el llamado de acción superior.
-->

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuth } from '@/Almacenes/useAuth'
import { BotonBase } from '@/componentes/ElementosBase'
import {
  Lock,
  Bot,
  LayoutDashboard
} from 'lucide-vue-next'

defineEmits<{
  (e: 'abrirModalEncuestas'): void
}>()

const router = useRouter()
const { estaAutenticado } = useAuth()
</script>

<template>
  <header class="relative z-30 max-w-7xl mx-auto px-6 lg:px-12 pt-6 pb-4 flex items-center justify-between border-b border-slate-200/80 dark:border-white/5 backdrop-blur-md">
    <!-- Identidad Corporativa con Nuevo Logo -->
    <div class="flex items-center gap-3 cursor-pointer" @click="router.push('/')">
      <div class="w-9 h-9 rounded-xl bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/15 flex items-center justify-center backdrop-blur-md shadow-inner overflow-hidden p-1">
        <img src="/logo.png" alt="HablandoContigo" class="w-full h-full object-contain rounded-lg" />
      </div>
      <div class="flex flex-col text-left">
        <span class="text-sm font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
          HablandoContigo
          <span class="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
        </span>
        <span class="text-[10px] text-slate-500 dark:text-slate-400 font-mono tracking-wider uppercase">
          {{ estaAutenticado ? 'Consola de Gestión IA' : 'Espacio Seguro & Anónimo' }}
        </span>
      </div>
    </div>

    <!-- Enlaces Centrales de Navegación Condicionales (Sin duplicados) -->
    <nav class="hidden md:flex items-center gap-8 text-xs font-medium text-slate-600 dark:text-slate-300">
      <router-link to="/" class="hover:text-slate-900 dark:hover:text-white transition-colors text-slate-900 dark:text-white font-bold">
        Inicio
      </router-link>
      
      <!-- Colaborador Anónimo -->
      <template v-if="!estaAutenticado">
        <button 
          type="button"
          @click="$emit('abrirModalEncuestas')" 
          class="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          Responder Encuesta
        </button>
        <router-link to="/dashboard" class="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1">
          <Lock class="w-3.5 h-3.5 text-emerald-500" />
          Portal Anónimo
        </router-link>
      </template>

      <!-- Administrador con sesión -->
      <template v-else>
        <router-link to="/proyectos" class="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1">
          <Bot class="w-3.5 h-3.5 text-sky-500" />
          Crear Encuesta
        </router-link>
        <router-link to="/dashboard" class="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1">
          <LayoutDashboard class="w-3.5 h-3.5 text-sky-500" />
          Dashboard Directivo
        </router-link>
      </template>
    </nav>

    <!-- Botones de Acción en Cabecera (Sin botón de tema) -->
    <div class="flex items-center gap-3">
      <!-- Botón de Acceso según sesión (evitando duplicidad) -->
      <BotonBase
        v-if="!estaAutenticado"
        variante="secundario"
        tamano="pequeno"
        @click="router.push('/login')"
      >
        <span>Acceso Administrativo</span>
      </BotonBase>

      <BotonBase
        v-else
        variante="primario"
        tamano="pequeno"
        @click="router.push('/dashboard')"
      >
        <template #iconoIzquierdo>
          <LayoutDashboard class="w-3.5 h-3.5" />
        </template>
        <span>Dashboard</span>
      </BotonBase>
    </div>
  </header>
</template>
