<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuth } from '@/Almacenes/useAuth'
import { BotonBase, InsigniaPill } from '@/componentes/ElementosBase'
import {
  Lock,
  Sparkles,
  ArrowRight,
  Search,
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
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-sky-600 to-indigo-600 dark:from-white dark:via-emerald-200 dark:to-sky-400">
          Sin Miedo ni Rastreos.
        </span>
      </h1>

      <!-- Subtítulo -->
      <p class="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-400 max-w-2xl font-normal leading-relaxed">
        Tu opinión transforma la cultura y convivencia laboral con total seguridad psicológica. No requieres cuentas ni contraseñas: tus respuestas están protegidas con cifrado de hardware UUID y evaluadas con rigor estricto por IA para erradicar falsas alarmas.
      </p>

      <!-- Botones de Acción -->
      <div class="flex flex-wrap items-center justify-center gap-4 pt-2 z-30">
        <BotonBase
          variante="primario"
          tamano="grande"
          @click="$emit('abrirModalEncuestas')"
        >
          <span>Responder Encuesta Anónima</span>
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
            <Search class="w-4 h-4 text-emerald-500" />
          </template>
          <span>Portal del Colaborador (Por Código)</span>
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
          <span>CENTRO DE MANDO DIRECTIVO </span>
        </InsigniaPill>
      </div>

      <!-- Titular Principal -->
      <h1 class="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-950 dark:text-white leading-[1.08]">
        Diseña y Analiza Encuestas <br />
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 dark:from-white dark:via-sky-200 dark:to-indigo-300">
          con inteligencia asistida.
        </span>
      </h1>

      <!-- Subtítulo -->
      <p class="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-400 max-w-2xl font-normal leading-relaxed">
        Bienvenido al centro de mando directivo. Crea diagnósticos organizacionales adaptativos en segundos, monitorea el mapa de calor de bienestar y atiende alertas críticas reales con cero falsos positivos.
      </p>

      <!-- Botones de Acción -->
      <div class="flex flex-wrap items-center justify-center gap-4 pt-2 z-30">
        <BotonBase
          variante="primario"
          tamano="grande"
          @click="router.push('/proyectos')"
        >
          <template #iconoIzquierdo>
            <Bot class="w-4 h-4" />
          </template>
          <span>Crear Encuesta</span>
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
          <span>Ver Métricas en Dashboard</span>
        </BotonBase>
      </div>
    </template>

  </div>
</template>
