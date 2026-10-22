<!--
  ============================================================================
  COMPONENTE INSIGNIA SUPERIOR DE PORTADA (HeroInsigniaSuperior.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Badge superior holográfico con animación de pulso y partículas:
  - Destaca la plataforma como motor de Clima Laboral con IA & Seguridad Psicológica.
  
  ¿PARA QUÉ SIRVE?
  - Comunicar de inmediato el valor diferencial de la solución a los visitantes.
  
  ¿CON QUÉ ESTÁ VINCULADO / CONECTADO?
  - HeroPrincipal.vue: Componente que lo renderiza en la cima de la portada.
-->

<script setup lang="ts">
import { Sparkles, ShieldCheck } from 'lucide-vue-next'
</script>

<template>
  <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-sky-500/30 backdrop-blur-md text-sky-400 text-xs font-semibold shadow-lg shadow-sky-500/10 animate-fade-in hover:scale-105 transition-all">
    <Sparkles class="w-4 h-4 text-sky-400 animate-spin-slow" />
    <span>HABLANDO CONTIGO · IA & SEGURIDAD PSICOLÓGICA</span>
    <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1"></span>
    <span class="text-[11px] text-emerald-400 font-bold">100% CONFIDENCIAL</span>
  </div>
</template>
