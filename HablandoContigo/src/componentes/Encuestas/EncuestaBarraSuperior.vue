<!--
  ============================================================================
  COMPONENTE BARRA SUPERIOR DE ENCUESTA ANÓNIMA (EncuestaBarraSuperior.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Cabecera de navegación y garantía de anonimato para la sesión de encuestas:
  - Muestra el título de la encuesta activa y el subtítulo institucional.
  - Insignia de '100% Anónimo' con candado esmeralda.
  - Enmascaramiento y auditoría del identificador de hardware UUID.
  - Candado de permanencia obligatoria: no permite salir hasta no finalizar la encuesta.
-->

<script setup lang="ts">
import { Lock, Laptop, ShieldCheck } from 'lucide-vue-next'
import { InsigniaPill } from '@/componentes/ElementosBase'

defineProps<{
  dispositivoUUID: string
  tituloEncuesta?: string
}>()
</script>

<template>
  <header class="max-w-3xl mx-auto w-full flex items-center justify-between py-3 px-4 sm:px-6 rounded-2xl bg-slate-900/90 dark:bg-black/80 border border-slate-700/60 dark:border-white/10 backdrop-blur-2xl relative z-20 shadow-xl mb-4">
    
    <!-- Identidad Corporativa y Candado de Permanencia -->
    <div class="flex items-center gap-3">
      <div 
        class="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-sm"
        title="Sesión de evaluación protegida"
      >
        <Lock class="w-4 h-4" />
      </div>

      <div class="text-left">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-xs font-bold text-white tracking-wide">
            {{ tituloEncuesta || 'HablandoContigo' }}
          </span>
          <InsigniaPill variante="exito" tamano="sm">
            <template #icono>
              <ShieldCheck class="w-2.5 h-2.5" />
            </template>
            100% Anónimo
          </InsigniaPill>
        </div>
        <span class="text-[10px] text-neutral-400 font-mono block">
          Auditoría de Clima Psicosocial · Cero Rastreo
        </span>
      </div>
    </div>

    <!-- Indicador de Privacidad y Estado de Permanencia -->
    <div class="flex items-center gap-3">
      <div class="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1 rounded-xl text-[11px] text-neutral-400 font-mono">
        <Laptop class="w-3.5 h-3.5 text-sky-400" />
        <span>UUID: <strong class="text-neutral-200">{{ dispositivoUUID ? dispositivoUUID.slice(0, 10) : 'GEN' }}...</strong></span>
      </div>

      <!-- Insignia de permanencia obligatoria (sin botón de salir) -->
      <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] font-semibold text-amber-400 font-mono shadow-sm">
        <Lock class="w-3 h-3 text-amber-400 animate-pulse" />
        <span>En progreso</span>
      </div>
    </div>

  </header>
</template>
