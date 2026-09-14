<!--
  ============================================================================
  VISTA GESTIÓN DE ENCUESTA ÚNICA Y TARJETA DE PROYECTO (ProyectosView.vue)
  ============================================================================
-->

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/Almacenes/useAuth'
import { useEncuestas } from '@/Almacenes/useEncuestas'
import { 
  ArrowLeft, 
  Building2, 
  Calendar,
  TrendingUp,
  Edit3,
  BarChart3,
  Share2,
  CheckCircle2,
  FlaskConical,
  Sparkles,
  Trash2
} from 'lucide-vue-next'

import ProyectosModoClimaFijo from '@/componentes/Proyectos/ProyectosModoClimaFijo.vue'
import ModalEnlacePublicado from '@/componentes/Proyectos/ModalEnlacePublicado.vue'

const router = useRouter()
const { usuarioActual } = useAuth()
const { 
  encuestas, 
  editarEncuesta, 
  totalRespuestasGlobales, 
  vaciarTodasLasEstadisticas, 
  inyectarDatosDePrueba 
} = useEncuestas()

const cargandoInyeccion = ref(false)
const cargandoBorrado = ref(false)

const manejarInyectarDatos = async () => {
  cargandoInyeccion.value = true
  await inyectarDatosDePrueba(30)
  cargandoInyeccion.value = false
}

const manejarBorrarDatos = async () => {
  if (confirm('¿Estás seguro de borrar todas las respuestas y restablecer las estadísticas a cero para realizar pruebas?')) {
    cargandoBorrado.value = true
    await vaciarTodasLasEstadisticas()
    cargandoBorrado.value = false
  }
}

// Modos de vista: 'resumen_master' | 'editar_master'
const vistaActual = ref<'resumen_master' | 'editar_master'>('resumen_master')

// Filtro de periodo comparativo
const periodoComparativo = ref<'2026' | '2025' | 'comparativa'>('2026')

// Modal de enlace y código QR
const modalEnlaceAbierto = ref(false)

// Encuesta máster única del sistema
const encuestaMaster = computed(() => {
  return encuestas.value.find(e => e.id === 'enc-001') || encuestas.value[0] || null
})

/**
 * Guarda y actualiza la encuesta única máster
 */
const manejarGuardarMaster = async (datos: any) => {
  const idExistente = encuestaMaster.value?.id || 'enc-001'

  const ok = await editarEncuesta(idExistente, {
    titulo: datos.titulo || 'Diagnóstico Oficial de Clima Laboral',
    descripcion: datos.descripcion || 'Encuesta fija a la que se dirigen las respuestas.',
    departamento: datos.departamento || 'General',
    preguntas: datos.preguntas,
    preguntasSeguimiento: datos.preguntasSeguimiento || []
  })

  if (ok) {
    modalEnlaceAbierto.value = true
    vistaActual.value = 'resumen_master'
  }
}

/**
 * Copia el enlace anónimo de respuesta para los encuestados
 */
const copiarEnlaceAnonimo = () => {
  if (!encuestaMaster.value) return
  const url = `${window.location.origin}/responder/${encuestaMaster.value.id}`
  navigator.clipboard.writeText(url)
  alert('¡Enlace de respuesta anónima copiado al portapapeles!')
}

const irAResponder = () => {
  if (!encuestaMaster.value) return
  router.push(`/responder/${encuestaMaster.value.id}?modoPrueba=true`)
}

const irAAjustesVoz = () => {
  router.push('/configuracion')
}

const irADashboard = () => {
  router.push('/dashboard')
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 px-4 sm:px-6 md:pl-20 md:pr-8 py-6 md:py-8 relative font-['Poppins',sans-serif] transition-colors duration-300">
    
    <!-- Luces sutiles de fondo -->
    <div class="fixed top-10 left-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
    <div class="fixed bottom-10 right-10 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

    <div class="max-w-7xl mx-auto space-y-8 relative z-10">
      
      <!-- Top Bar de Navegación -->
      <div class="flex items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800 text-left">
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <span>Encuesta de Clima Organizacional</span>
          </h1>
        </div>

        <div class="flex items-center gap-3">
          <button
            v-if="vistaActual === 'resumen_master'"
            @click="vistaActual = 'editar_master'"
            class="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/25 active:scale-95 transition-all cursor-pointer"
          >
            <Edit3 class="w-4 h-4 text-white" />
            <span>Editar Encuesta</span>
          </button>
          
          <button
            v-else
            @click="vistaActual = 'resumen_master'"
            class="px-4 py-2.5 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
          >
            <ArrowLeft class="w-4 h-4" />
            <span>Volver</span>
          </button>
        </div>
      </div>

      <!-- VISTA 1: RESUMEN DE LA ENCUESTA COMO TARJETA DE PROYECTO -->
      <div v-if="vistaActual === 'resumen_master'" class="space-y-6 text-left">
        
        <!-- TARJETA DEL PROYECTO / ENCUESTA ÚNICA MÁSTER -->
        <div class="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 transition-all">
          
          <!-- Encabezado de la Tarjeta con Badges -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-5">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold shrink-0">
                <Building2 class="w-6 h-6" />
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold uppercase font-mono border border-emerald-500/20 flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Encuesta Activa
                  </span>
                  <span class="text-xs font-mono text-slate-400 font-semibold">ID: {{ encuestaMaster?.id || 'enc-001' }}</span>
                </div>
                <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {{ encuestaMaster?.titulo || 'Diagnóstico de Clima Organizacional' }}
                </h2>
              </div>
            </div>

            <!-- Botones de Acción dentro de la Tarjeta (Editar Encuesta, Realizar Prueba, Compartir Enlace) -->
            <div class="flex items-center gap-2.5 flex-wrap">
              <button
                @click="vistaActual = 'editar_master'"
                class="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md active:scale-95 transition-all"
              >
                <Edit3 class="w-4 h-4" />
                <span>Editar Encuesta</span>
              </button>

              <button
                @click="router.push(`/responder/${encuestaMaster?.id || 'enc-001'}?modoPrueba=true`)"
                class="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md active:scale-95 transition-all"
              >
                <FlaskConical class="w-4 h-4" />
                <span>Realizar Prueba</span>
              </button>

              <button
                @click="modalEnlaceAbierto = true"
                class="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-2 cursor-pointer border border-slate-200 dark:border-slate-700 transition-all"
              >
                <Share2 class="w-4 h-4 text-blue-500" />
                <span>Compartir Enlace</span>
              </button>
            </div>
          </div>

          <!-- Métricas Destacadas de la Tarjeta -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
            <div>
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Preguntas Totales</span>
              <p class="text-lg font-black font-mono text-slate-900 dark:text-white">
                {{ encuestaMaster?.preguntas?.length || 24 }} Preguntas
              </p>
            </div>
            <div>
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Respuestas Totales</span>
              <p class="text-lg font-black font-mono text-slate-900 dark:text-white">
                {{ totalRespuestasGlobales ?? encuestaMaster?.totalRespuestas ?? 0 }} Respuestas
              </p>
            </div>
            <div>
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Departamento</span>
              <p class="text-lg font-black font-mono text-slate-900 dark:text-white">
                General
              </p>
            </div>
            <div>
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Periodo</span>
              <p class="text-lg font-black font-mono text-slate-900 dark:text-white">
                Año 2026
              </p>
            </div>
          </div>

          <!-- PANEL DE PRUEBAS Y DATOS (HERRAMIENTAS DE PRUEBA) -->
          <div class="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950/80 border border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold shrink-0">
                <FlaskConical class="w-5 h-5" />
              </div>
              <div class="text-left">
                <h4 class="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Modo Pruebas — Gestión de Datos</span>
                  <span class="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-600 dark:text-purple-300 text-[10px] font-mono font-bold uppercase">Solo Pruebas</span>
                </h4>
                <p class="text-[11px] text-slate-500 dark:text-slate-400">
                  Inyecta datos ficticios para validar gráficos 3D y analíticas, o borra las respuestas para reiniciar el sistema.
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2.5 shrink-0 flex-wrap">
              <button
                type="button"
                @click="manejarInyectarDatos"
                :disabled="cargandoInyeccion"
                class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md active:scale-95 transition-all disabled:opacity-50"
              >
                <Sparkles class="w-4 h-4" />
                <span>{{ cargandoInyeccion ? 'Inyectando...' : 'Inyectar Datos de Prueba (+30)' }}</span>
              </button>

              <button
                type="button"
                @click="manejarBorrarDatos"
                :disabled="cargandoBorrado"
                class="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md active:scale-95 transition-all disabled:opacity-50"
              >
                <Trash2 class="w-4 h-4" />
                <span>{{ cargandoBorrado ? 'Limpiando...' : 'Borrar Todos los Datos' }}</span>
              </button>
            </div>
          </div>

          <!-- BLOQUE COMPARATIVO HISTÓRICO -->
          <div class="space-y-4 pt-2">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div class="flex items-center gap-2">
                <Calendar class="w-4 h-4 text-blue-500" />
                <h3 class="text-sm font-bold text-slate-900 dark:text-white">
                  Comparativa de Evolución Histórica
                </h3>
              </div>

              <!-- Selector de Periodos -->
              <div class="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                <button
                  @click="periodoComparativo = '2026'"
                  :class="['px-3 py-1 rounded-lg font-bold transition-all cursor-pointer', periodoComparativo === '2026' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-500']"
                >
                  Año 2026
                </button>
                <button
                  @click="periodoComparativo = '2025'"
                  :class="['px-3 py-1 rounded-lg font-bold transition-all cursor-pointer', periodoComparativo === '2025' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-500']"
                >
                  Año 2025
                </button>
                <button
                  @click="periodoComparativo = 'comparativa'"
                  :class="['px-3 py-1 rounded-lg font-bold transition-all cursor-pointer', periodoComparativo === 'comparativa' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-500']"
                >
                  Comparativa Interanual
                </button>
              </div>
            </div>

            <!-- Tarjetas de Métricas Comparativas -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <!-- Año 2026 -->
              <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Año 2026 (Actual)</span>
                <div class="flex items-baseline gap-2">
                  <span class="text-2xl font-black font-mono text-slate-900 dark:text-white">78%</span>
                  <span class="text-xs font-extrabold text-emerald-500 flex items-center gap-0.5">
                    <TrendingUp class="w-3.5 h-3.5" /> +7.0%
                  </span>
                </div>
              </div>

              <!-- Año 2025 -->
              <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Año 2025 (Anterior)</span>
                <div class="flex items-baseline gap-2">
                  <span class="text-2xl font-black font-mono text-slate-900 dark:text-white">71%</span>
                  <span class="text-xs font-semibold text-slate-400">Base</span>
                </div>
              </div>

              <!-- Variación Interanual -->
              <div class="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                <span class="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Crecimiento Interanual</span>
                <div class="flex items-baseline gap-2">
                  <span class="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">+7.0%</span>
                  <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400">Mejora</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- VISTA 2: EDICIÓN DIRECTA DE LA ENCUESTA FICA MÁSTER -->
      <div v-else-if="vistaActual === 'editar_master'" class="animate-fade-in">
        <ProyectosModoClimaFijo
          :encuestaInicial="encuestaMaster"
          @guardar="manejarGuardarMaster"
          @volver="vistaActual = 'resumen_master'"
          @abrirAjustesVoz="irAAjustesVoz"
        />
      </div>

    </div>

    <!-- Modal de Código QR / Compartir -->
    <ModalEnlacePublicado
      :abierto="modalEnlaceAbierto"
      :encuestaId="encuestaMaster?.id || 'enc-001'"
      @cerrar="modalEnlaceAbierto = false"
      @irAResponder="irAResponder"
    />

  </div>
</template>
