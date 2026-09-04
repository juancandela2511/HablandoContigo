<!--
  ============================================================================
  TARJETAS DE MÉTRICAS FLOTANTES SEPARADAS (HeroTarjetasMetricas.vue)
  ============================================================================
  
  ¿QUÉ HACE?
  Presenta los indicadores clave de la plataforma (100% Anonimato Hardware y 99.4% Precisión IA)
  separados a los extremos izquierdo y derecho para enmarcar el globo terráqueo 3D.
  
  ¿CON QUÉ SE CONECTA?
  - HeroPrincipal.vue (Vista contenedora del hero)
  - TarjetaContenedor.vue (Contenedor UI con visores)
-->

<script setup lang="ts">
import { TarjetaContenedor } from '@/componentes/ElementosBase'
import { ShieldCheck, Cpu } from 'lucide-vue-next'
</script>

<template>
  <div class="absolute inset-0 w-full h-full flex flex-col md:flex-row items-center justify-between pointer-events-none px-2 sm:px-6 lg:px-8 z-10 gap-4 sm:gap-0">
    <!-- Tarjeta Métrica 1: Anonimato Cifrado (Flanco Izquierdo) -->
    <div class="pointer-events-auto max-w-xs sm:max-w-sm w-full md:-translate-y-6">
      <TarjetaContenedor :mostrarVisores="true" :brilloBorde="true" relleno="compacto">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <ShieldCheck class="w-6 h-6 text-emerald-500" />
          </div>
          <div class="flex flex-col text-left">
            <span class="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
              100%
            </span>
            <span class="text-xs font-semibold text-slate-700 dark:text-neutral-300">
              Anonimato por Hardware
            </span>
            <span class="text-[11px] text-slate-500 dark:text-neutral-400 leading-snug">
              Huella digital cifrada UUID sin rastrear datos personales
            </span>
          </div>
        </div>
      </TarjetaContenedor>
    </div>

    <!-- Tarjeta Métrica 2: Precisión Analítica (Flanco Derecho) -->
    <div class="pointer-events-auto max-w-xs sm:max-w-sm w-full md:-translate-y-6">
      <TarjetaContenedor :mostrarVisores="true" :brilloBorde="true" relleno="compacto">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
            <Cpu class="w-6 h-6 text-sky-500" />
          </div>
          <div class="flex flex-col text-left">
            <span class="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
              99.4%
            </span>
            <span class="text-xs font-semibold text-slate-700 dark:text-neutral-300">
              Precisión Analítica 
            </span>
            <span class="text-[11px] text-slate-500 dark:text-neutral-400 leading-snug">
              Detección estricta de acoso y cero falsas alarmas
            </span>
          </div>
        </div>
      </TarjetaContenedor>
    </div>
  </div>
</template>
