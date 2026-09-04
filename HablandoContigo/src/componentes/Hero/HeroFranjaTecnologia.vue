<!--
  ============================================================================
  COMPONENTE FRANJA INFERIOR DE TECNOLOGÍAS (HeroFranjaTecnologia.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Muestra las 4 credenciales tecnológicas institucionales en la base del Hero:
  1. GEMINI AI 2.5/3.8
  2. SHA-256 VAULT
  3. THREE.JS 3D WEBGL
  4. RIGOR ESTRICTO
  
  ¿PARA QUÉ SIRVE?
  - Proyectar solidez arquitectónica y cumplimiento de estándares empresariales.
  
  ¿DÓNDE SE USA Y CON QUÉ ARCHIVOS SE CONECTA?
  - HeroPrincipal.vue: Parte inferior del Hero.
-->

<script setup lang="ts">
import {
  BrainCircuit,
  ShieldCheck,
  Globe2,
  CheckCircle2
} from 'lucide-vue-next'
</script>

<template>
  <footer class="w-full max-w-5xl mt-6 pt-8 border-t border-slate-200/80 dark:border-white/10 flex flex-wrap items-center justify-center sm:justify-between gap-6 sm:gap-8 opacity-75 dark:opacity-60 text-xs font-mono tracking-widest uppercase">
    <span class="flex items-center gap-2 hover:opacity-100 transition-opacity">
      <BrainCircuit class="w-4 h-4 text-sky-600 dark:text-sky-400" /> GEMINI AI 2.5/3.8
    </span>
    <span class="flex items-center gap-2 hover:opacity-100 transition-opacity">
      <ShieldCheck class="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> SHA-256 VAULT
    </span>
    <span class="flex items-center gap-2 hover:opacity-100 transition-opacity">
      <Globe2 class="w-4 h-4 text-blue-600 dark:text-blue-400" /> THREE.JS 3D WEBGL
    </span>
    <span class="flex items-center gap-2 hover:opacity-100 transition-opacity">
      <CheckCircle2 class="w-4 h-4 text-purple-600 dark:text-purple-400" /> RIGOR ESTRICTO
    </span>
  </footer>
</template>
