<!--
  ============================================================================
  VISTA PRINCIPAL / LANDING PAGE CORPORATIVA 3D (HeroPrincipal.vue)
  Inspirada con fidelidad en el diseño 'Héroe 23'
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Compositor principal de la portada institucional de HablandoContigo:
  - Ensambla componentes atómicos y modulares pequeños y reutilizables:
    1. HeroBarraNavegacion: Menú superior contextualizado y selector de tema.
    2. HeroSeccionTitular: Titular dinámico según estado de autenticación.
    3. PlanetaHero3D: Globo WebGL con siluetas continentales y enlace Colombia ⟷ España.
    4. HeroTarjetasMetricas: Indicadores flotantes de rigor analítico y anonimato UUID.
    5. HeroFranjaTecnologia: Badges de tecnologías y estándares.
  - Elimina completamente código duplicado y botones redundantes.
  
  ¿DÓNDE SE USA Y CON QUÉ ARCHIVOS SE CONECTA?
  - router/index.ts: Ruta raíz '/'.
  - Subcomponentes en src/componentes/Hero/
  - useEncuestas.ts: Catálogo de encuestas para el modal.
-->

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useEncuestas } from '@/Almacenes/useEncuestas'

// Subcomponentes modulares de alta cohesión
import {
  HeroBarraNavegacion,
  HeroSeccionTitular,
  HeroTarjetasMetricas,
  HeroFranjaTecnologia
} from '@/componentes/Hero'

import PlanetaHero3D from '@/componentes/Inicio/PlanetaHero3D.vue'
import ModalEncuestaDemo from '@/componentes/Inicio/ModalEncuestaDemo.vue'

const router = useRouter()
const { encuestas } = useEncuestas()
const modalEncuestasAbierto = ref(false)

const irAEncuesta = (id: string) => {
  modalEncuestasAbierto.value = false
  router.push(`/responder/${id}`)
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-[#05070c] text-slate-900 dark:text-slate-100 font-['Inter',sans-serif] overflow-x-hidden relative selection:bg-sky-500/30 transition-colors duration-300">
    
    <!-- Cuadrícula ambiental de fondo -->
    <div class="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px] opacity-35 dark:opacity-25 pointer-events-none"></div>
    <div class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[140px] pointer-events-none"></div>

    <!-- 1. BARRA SUPERIOR DE NAVEGACIÓN MODULAR (Sin botones duplicados) -->
    <HeroBarraNavegacion @abrirModalEncuestas="modalEncuestasAbierto = true" />

    <!-- ===================================================================== -->
    <!-- 2. SECCIÓN PRINCIPAL DEL HERO                                         -->
    <!-- ===================================================================== -->
    <main class="relative z-20 max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 pt-10 pb-16 flex flex-col items-center text-center">
      
      <!-- Marcadores de Precisión de Visor (Cockpit) -->
      <div class="hidden sm:block absolute top-8 left-8 text-slate-400 dark:text-white/20 font-mono text-xs select-none pointer-events-none">┌ </div>
      <div class="hidden sm:block absolute top-8 right-8 text-slate-400 dark:text-white/20 font-mono text-xs select-none pointer-events-none"> ┐</div>
      <div class="hidden sm:block absolute bottom-8 left-8 text-slate-400 dark:text-white/20 font-mono text-xs select-none pointer-events-none">└ </div>
      <div class="hidden sm:block absolute bottom-8 right-8 text-slate-400 dark:text-white/20 font-mono text-xs select-none pointer-events-none"> ┘</div>

      <!-- Titular Dinámico (Anónimo vs Administrador) -->
      <HeroSeccionTitular @abrirModalEncuestas="modalEncuestasAbierto = true" />

      <!-- Contenedor 3D: Planeta + Tarjetas de Métricas Flotantes -->
      <div class="relative w-full max-w-5xl mt-8 sm:mt-12 h-[420px] sm:h-[540px] lg:h-[600px] flex items-center justify-center overflow-visible">
        <!-- Globo 3D WebGL con Siluetas Continentales Reales -->
        <div class="absolute inset-0 w-full h-full flex items-center justify-center">
          <PlanetaHero3D />
        </div>

        <!-- Tarjetas de Métricas Flotantes (Izquierda y Derecha) -->
        <HeroTarjetasMetricas />

        <!-- Desvanecimiento inferior de horizonte -->
        <div class="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-slate-50 via-slate-50/70 to-transparent dark:from-[#05070c] dark:via-[#05070c]/70 dark:to-transparent pointer-events-none"></div>
      </div>

      <!-- Franja Inferior de Tecnologías y Estándares -->
      <HeroFranjaTecnologia />

    </main>

    <!-- Modal para seleccionar y responder una encuesta directamente -->
    <ModalEncuestaDemo
      :abierto="modalEncuestasAbierto"
      :encuestas="encuestas"
      @cerrar="modalEncuestasAbierto = false"
      @seleccionarEncuesta="irAEncuesta"
    />

  </div>
</template>