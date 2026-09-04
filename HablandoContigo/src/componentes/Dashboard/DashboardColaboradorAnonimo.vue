<!--
  ============================================================================
  COMPONENTE DASHBOARD PARA COLABORADOR ANÓNIMO (DashboardColaboradorAnonimo.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Centro de participación confidencial para colaboradores que no han iniciado sesión:
  - Banner explicativo con garantías de confidencialidad y hardware UUID.
  - Buscador reactivo y campo para ingresar directamente por código o ID de encuesta.
  - Catálogo en cuadrícula de encuestas activas por departamento con duración estimada.
  - Tarjetas de pilares de anonimato y evaluación estricta con IA.
  - Acceso seguro al portal administrativo para directivos y líderes de RRHH.
  
  ¿PARA QUÉ SIRVE?
  - Proveer un entorno amigable y desprovisto de paneles administrativos abrumadores,
    garantizando que el colaborador se enfoque en responder sus encuestas de forma ágil y anónima.
  
  ¿DÓNDE SE USA Y CON QUÉ ARCHIVOS SE CONECTA?
  - DashboardView.vue: Se renderiza de forma condicional cuando `!estaAutenticado`.
  - Componentes UI: BotonBase.vue, InsigniaPill.vue, InputTexto.vue.
  - useEncuestas.ts: Provee el listado reactivo de encuestas disponibles.
-->

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Encuesta } from '@/Almacenes/useEncuestas'

// Componentes UI atómicos
import { BotonBase, InsigniaPill, InputTexto } from '@/componentes/UI'

import { 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Search,
  Building,
  KeyRound
} from 'lucide-vue-next'

const props = defineProps<{
  encuestasDisponibles: Encuesta[]
}>()

const router = useRouter()
const codigoIngresado = ref('')
const busquedaFiltro = ref('')

const encuestasFiltradas = computed(() => {
  if (!busquedaFiltro.value.trim()) return props.encuestasDisponibles
  const q = busquedaFiltro.value.toLowerCase()
  return props.encuestasDisponibles.filter(e => 
    e.titulo.toLowerCase().includes(q) || 
    (e.departamento || '').toLowerCase().includes(q) ||
    (e.descripcion || '').toLowerCase().includes(q)
  )
})

const irAEncuesta = (id: string) => {
  router.push(`/responder/${id}`)
}

const buscarPorCodigo = () => {
  const codigo = codigoIngresado.value.trim()
  if (!codigo) return
  const encontrada = props.encuestasDisponibles.find(e => 
    e.id.toLowerCase() === codigo.toLowerCase() || 
    e.id.toLowerCase().includes(codigo.toLowerCase())
  )
  if (encontrada) {
    router.push(`/responder/${encontrada.id}`)
  } else {
    router.push(`/responder/${codigo}`)
  }
}
</script>

<template>
  <div class="space-y-8 animate-fadeIn text-left font-['Poppins',sans-serif]">
    
    <!-- 1. BANNER PRINCIPAL DEL COLABORADOR ANÓNIMO -->
    <div class="relative rounded-3xl p-6 sm:p-10 bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950/80 border border-slate-800 dark:border-white/10 shadow-2xl text-white overflow-hidden">
      <!-- Glow ambiental decorativo -->
      <div class="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative z-10 max-w-3xl space-y-4">
        <InsigniaPill variante="exito" tamano="md" :conPulso="true">
          <template #icono>
            <Lock class="w-3.5 h-3.5" />
          </template>
          <span>PORTAL DEL COLABORADOR · 100% ANÓNIMO & CONFIDENCIAL</span>
        </InsigniaPill>

        <h1 class="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
          Tu Voz Transforma el Clima Laboral. <br />
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-white via-sky-200 to-sky-400">
            Participa sin Contraseñas ni Registro.
          </span>
        </h1>

        <p class="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl font-normal">
          Este espacio está diseñado para que respondas las encuestas de tu área con total seguridad psicológica. 
          No necesitas iniciar sesión: tu participación está protegida por cifrado de hardware UUID y analizada 
          estrictamente con Gemini AI para garantizar mejoras reales.
        </p>

        <!-- Barra de búsqueda por código rápido con componentes UI -->
        <div class="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-xl">
          <div class="flex-1">
            <InputTexto
              v-model="codigoIngresado"
              @enter="buscarPorCodigo"
              placeholder="Pega el código o ID de encuesta (ej. enc-001)..."
              tamano="md"
            >
              <template #iconoIzquierdo>
                <Search class="w-4 h-4 text-slate-400" />
              </template>
            </InputTexto>
          </div>

          <BotonBase
            variante="primario"
            tamano="mediano"
            @click="buscarPorCodigo"
          >
            <span>Ir a Encuesta</span>
            <template #iconoDerecho>
              <ArrowRight class="w-4 h-4" />
            </template>
          </BotonBase>
        </div>
      </div>
    </div>

    <!-- 2. CATÁLOGO DE ENCUESTAS DISPONIBLES -->
    <div class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h2 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Encuestas Activas para Responder</span>
            <InsigniaPill variante="info" tamano="sm">
              {{ encuestasFiltradas.length }} disponibles
            </InsigniaPill>
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Selecciona la encuesta correspondiente a tu departamento o consulta general.
          </p>
        </div>

        <!-- Filtro rápido de texto -->
        <div class="w-full sm:w-64">
          <InputTexto
            v-model="busquedaFiltro"
            placeholder="Filtrar por nombre o área..."
            tamano="sm"
          >
            <template #iconoIzquierdo>
              <Search class="w-3.5 h-3.5 text-slate-400" />
            </template>
          </InputTexto>
        </div>
      </div>

      <!-- Cuadrícula de Encuestas -->
      <div v-if="encuestasFiltradas.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="enc in encuestasFiltradas"
          :key="enc.id"
          class="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-500 dark:hover:border-sky-400/60 shadow-md hover:shadow-xl transition-all duration-200 flex flex-col justify-between space-y-4 group"
        >
          <div class="space-y-2">
            <!-- Header de tarjeta -->
            <div class="flex items-center justify-between gap-2">
              <span class="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Building class="w-3 h-3 text-sky-500" />
                {{ enc.departamento || 'General' }}
              </span>
              <span class="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Activa
              </span>
            </div>

            <!-- Título -->
            <h3 class="text-base font-bold text-slate-900 dark:text-white leading-snug group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
              {{ enc.titulo }}
            </h3>

            <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {{ enc.descripcion || 'Encuesta confidencial de clima y bienestar laboral.' }}
            </p>
          </div>

          <!-- Metadatos y Botón de Acción Reutilizable -->
          <div class="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
            <span class="text-[11px] text-slate-400 flex items-center gap-1">
              <Clock class="w-3.5 h-3.5 text-slate-400" />
              {{ enc.preguntas?.length || 4 }} preguntas (~3 min)
            </span>

            <BotonBase
              variante="primario"
              tamano="pequeno"
              @click="irAEncuesta(enc.id)"
            >
              <span>Responder</span>
              <template #iconoDerecho>
                <ArrowRight class="w-3.5 h-3.5" />
              </template>
            </BotonBase>
          </div>
        </div>
      </div>

      <div v-else class="p-8 rounded-3xl bg-slate-100 dark:bg-slate-900 text-center text-slate-500 space-y-2">
        <p class="text-sm font-semibold">No se encontraron encuestas con ese criterio de búsqueda.</p>
        <button
          type="button"
          @click="busquedaFiltro = ''"
          class="text-xs text-sky-600 font-medium underline cursor-pointer"
        >
          Restablecer filtros
        </button>
      </div>
    </div>

    <!-- 3. PILARES DE ANONIMATO Y CONFIDENCIALIDAD -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
      <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
        <div class="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
          <ShieldCheck class="w-5 h-5" />
        </div>
        <h4 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Cero Cuentas de Usuario</h4>
        <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          No solicitamos correos personales, contraseñas ni nombres. Tu respuesta se registra con un identificador de hardware UUID sin vincular a tu identidad.
        </p>
      </div>

      <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
        <div class="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
          <Sparkles class="w-5 h-5" />
        </div>
        <h4 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Flujo Condicional en Vivo</h4>
        <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Si reportas inconformidad con tu liderazgo, el sistema despliega preguntas de profundización para capturar detalles concretos de mejora.
        </p>
      </div>

      <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
        <div class="w-9 h-9 rounded-xl bg-blue-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
          <CheckCircle2 class="w-5 h-5" />
        </div>
        <h4 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Cero Falsas Alarmas (IA)</h4>
        <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          El motor de Gemini evalúa cada reporte con rigor estricto, asegurando que las situaciones de riesgo real sean atendidas sin distorsiones.
        </p>
      </div>
    </div>

    <!-- 4. BANNER DE ACCESO PARA ADMINISTRADORES / RRHH -->
    <div class="p-6 rounded-3xl bg-slate-100 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="space-y-1 text-center sm:text-left">
        <h4 class="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
          <KeyRound class="w-4 h-4 text-sky-600" />
          <span>¿Perteneces al equipo de Talento Humano o Dirección?</span>
        </h4>
        <p class="text-xs text-slate-600 dark:text-slate-400">
          Inicia sesión para acceder al panel de creación de encuestas con IA, ver la matriz de calor y consultar el análisis analítico detallado.
        </p>
      </div>

      <BotonBase
        variante="primario"
        tamano="mediano"
        @click="router.push('/login')"
      >
        <span>Iniciar Sesión Administrativa</span>
      </BotonBase>
    </div>

  </div>
</template>
