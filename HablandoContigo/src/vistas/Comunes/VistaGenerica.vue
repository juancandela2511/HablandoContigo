<!--
  ============================================================================
  VISTA GENÉRICA DE CONTINGENCIA O RUTA EN DESARROLLO (VistaGenerica.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Pantalla comodín ('fallback view') utilizada para rutas secundarias o módulos 
  en proceso de construcción / despliegue.
  
  ¿PARA QUÉ SIRVE?
  - Proveer una experiencia de usuario fluida y coherente si se accede a rutas no mapeadas formalmente.
  - Ofrecer botones directos de retorno al Portal de Inicio o al Panel de Cuentas.
  
  ¿CON QUÉ ESTÁ VINCULADO / CONECTADO?
  - router/index.ts: Configurada como vista por defecto para rutas auxiliares.
-->

<script setup lang="ts">
import { ArrowLeft, Sparkles } from 'lucide-vue-next'

withDefaults(
  defineProps<{
    titulo?: string
    descripcion?: string
    icono?: string
  }>(),
  {
    titulo: 'Módulo en Desarrollo',
    descripcion: 'Esta sección se encuentra en proceso de integración y validación técnica.',
    icono: '⚡'
  }
)
</script>

<template>
  <div class="min-h-screen bg-[#0a0f0d] text-slate-100 pl-16 pr-6 py-12 flex flex-col items-center justify-center text-center relative overflow-hidden font-['Poppins',sans-serif]">
    
    <!-- Icono Ilustrativo -->
    <div class="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-4xl shadow-2xl mb-6">
      {{ icono }}
    </div>

    <!-- Badge Superior -->
    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-800 text-sky-400 text-xs font-semibold mb-3">
      <Sparkles class="w-3.5 h-3.5" />
      <span>HABLANDO CONTIGO</span>
    </div>

    <!-- Título y Mensaje -->
    <h1 class="text-3xl sm:text-4xl font-extrabold text-white mb-2 tracking-tight">
      {{ titulo }}
    </h1>

    <p class="text-sm text-slate-400 max-w-md mb-8 leading-relaxed">
      {{ descripcion }}
    </p>

    <!-- Botones de Redirección -->
    <div class="flex items-center gap-3">
      <router-link
        to="/"
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all"
      >
        <ArrowLeft class="w-4 h-4" />
        <span>Ir al Inicio</span>
      </router-link>

      <router-link
        to="/admin/cuentas"
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all"
      >
        <span>Administrador de Cuentas</span>
      </router-link>
    </div>

  </div>
</template>
