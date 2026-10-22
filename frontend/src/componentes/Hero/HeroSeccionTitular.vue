<!--
  ============================================================================
  COMPONENTE SECCIÓN TITULAR HERO (HeroSeccionTitular.vue)
  ============================================================================
-->

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAutenticacion } from '@/Almacenes/useAutenticacion'
import { BotonBase, InsigniaPill } from '@/componentes/ElementosBase'
import {
  Lock,
  Sparkles,
  ArrowRight,
  Building2,
  LayoutDashboard
} from 'lucide-vue-next'

defineEmits<{
  (e: 'abrirModalEncuestas'): void
}>()

const router = useRouter()
const { estaAutenticado } = useAutenticacion()
</script>

<template>
  <div class="flex flex-col items-center text-center max-w-4xl mx-auto space-y-6">
    
    <!-- CASO A: COLABORADOR ANÓNIMO (!estaAutenticado) -->
    <template v-if="!estaAutenticado">
      <!-- Insignia Superior -->
      <div>
        <InsigniaPill variante="exito" tamano="md" :conPulso="true">
          <template #icono>
            <Lock class="w-3.5 h-3.5 text-emerald-500" />
          </template>
          <span>CONFIDENCIALIDAD TOTAL · TU VOZ ES 100% ANÓNIMA</span>
        </InsigniaPill>
      </div>

      <!-- Titular Principal -->
      <h1 class="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-950 dark:text-white leading-[1.08]">
        Exprésate Seguro. <br />
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-sky-600 to-indigo-600 dark:from-emerald-400 dark:via-sky-300 dark:to-indigo-300">
          Sin Miedo a Ninguna Represalia.
        </span>
      </h1>

      <!-- Subtítulo -->
      <p class="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-400 max-w-2xl font-normal leading-relaxed">
        Plataforma anónima de clima y bienestar laboral. Tu opinión sincera permite transformar la cultura de tu empresa con total protección y privacidad.
      </p>

      <!-- Botones de Acción -->
      <div class="flex flex-wrap items-center justify-center gap-4 pt-2 z-30">
        <BotonBase
          variante="primario"
          tamano="grande"
          @click="$emit('abrirModalEncuestas')"
        >
          <template #iconoIzquierdo>
            <Sparkles class="w-4 h-4 text-emerald-300 animate-pulse" />
          </template>
          <span>Responder Encuesta Anónima</span>
          <template #iconoDerecho>
            <ArrowRight class="w-4 h-4" />
          </template>
        </BotonBase>
      </div>
    </template>

    <!-- CASO B: ADMINISTRADOR / RRHH CON SESIÓN INICIADA (estaAutenticado) -->
    <template v-else>
      <!-- Insignia Superior -->
      <div>
        <InsigniaPill variante="info" tamano="md" :conPulso="true">
          <template #icono>
            <Sparkles class="w-3.5 h-3.5 text-sky-500" />
          </template>
          <span>CENTRO DE MANDO DIRECTIVO · EVALUACIÓN OFICIAL</span>
        </InsigniaPill>
      </div>

      <!-- Titular Principal -->
      <h1 class="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-950 dark:text-white leading-[1.08]">
        Gestiona la Encuesta Máster <br />
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 dark:from-white dark:via-sky-200 dark:to-indigo-300">
          y Compara la Evolución del Clima.
        </span>
      </h1>

      <!-- Subtítulo -->
      <p class="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-400 max-w-2xl font-normal leading-relaxed">
        Edita el cuestionario único de la empresa, centraliza todas las respuestas en un solo lugar y compara los indicadores del año actual respecto a periodos pasados.
      </p>

      <!-- Botones de Acción -->
      <div class="flex flex-wrap items-center justify-center gap-4 pt-2 z-30">
        <BotonBase
          variante="primario"
          tamano="grande"
          @click="router.push('/proyectos')"
        >
          <template #iconoIzquierdo>
            <Building2 class="w-4 h-4" />
          </template>
          <span>Gestionar / Editar Encuesta Única</span>
          <template #iconoDerecho>
            <ArrowRight class="w-4 h-4" />
          </template>
        </BotonBase>

        <BotonBase
          variante="secundario"
          tamano="grande"
          @click="router.push('/dashboard')"
        >
          <template #iconoIzquierdo>
            <LayoutDashboard class="w-4 h-4 text-sky-500" />
          </template>
          <span>Ver Métricas y Comparativa</span>
        </BotonBase>
      </div>
    </template>

  </div>
</template>
