<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useDashboardStats, calcularDimensionesProporcionales } from '@/Almacenes/useDashboardStats'
import { useAnclajeGraficos as useGraficosAnclados } from '@/Almacenes/useAnclajeGraficos'
import { useNotificaciones, type NotificacionItem } from '@/Almacenes/useNotificaciones'
import { useEncuestas } from '@/Almacenes/useEncuestas'
import { calcularClimaGlobalDeRespuestas } from '@/services/calculadorClimaService'
import { useHighlight } from '@/Almacenes/useHighlight'
import { useAutenticacion } from '@/Almacenes/useAutenticacion'
import { 
  Layers, 
  Sparkles, 
  ClipboardList, 
  Users, 
  ChevronRight, 
  ArrowLeft,
  Building2
} from 'lucide-vue-next'

// Subcomponentes modulares del Dashboard
import DashboardColaboradorAnonimo from '@/componentes/Dashboard/DashboardColaboradorAnonimo.vue'
import DashboardEncabezado from '@/componentes/Dashboard/DashboardEncabezado.vue'
import DashboardNavegacionPestanas from '@/componentes/Dashboard/DashboardNavegacionPestanas.vue'
import DashboardPestanaGeneral from '@/componentes/Dashboard/DashboardPestanaGeneral.vue'
import DashboardPestanaAlertas from '@/componentes/Dashboard/DashboardPestanaAlertas.vue'
import DashboardPestanaAuditoria from '@/componentes/Dashboard/DashboardPestanaAuditoria.vue'
import AnaliticaBloqueEstudio from '@/componentes/Dashboard/AnaliticaBloqueEstudio.vue'
import PestanaGraficosAnclados from '@/componentes/Dashboard/Pestanas/PestanaGraficosAnclados.vue'
import DesglosePreguntasDetallado from '@/componentes/Dashboard/DesglosePreguntasDetallado.vue'
import ModalDetalleAlerta from '@/componentes/Dashboard/ModalDetalleAlerta.vue'
import ModalExportarInforme from '@/componentes/Dashboard/ModalExportarInforme.vue'
import ModalCrearGraficoAnclado from '@/componentes/Dashboard/Modales/ModalCrearGraficoAnclado.vue'
import BannerSugerenciasAdmin from '@/componentes/AsistenteOllama/BannerSugerenciasAdmin.vue'

const route = useRoute()
const { elementoResaltadoId } = useHighlight()
const { estaAutenticado } = useAutenticacion()
const { alertasConvivencia, actualizarEstadoAlerta } = useNotificaciones()
const { 
  encuestas, 
  respuestasAnonimas, 
  eliminarRespuestaIndividual
} = useEncuestas()

const {
  datosEstadisticas,
  departamentoFiltro,
  departamentosDisponibles,
  dimensionesConfiguradas,
  anguloRotacionRadar
} = useDashboardStats()

const { totalGraficos, anclarNuevoGrafico } = useGraficosAnclados()

import { useDashboardFiltros } from './composables/useDashboardFiltros'

const metaGlobalRadialRef = computed(() => datosEstadisticas.value.metaGlobalRadial || 85)

const {
  modoDashboard,
  encuestaFiltro,
  filtroPeriodoTemporal,
  encuestasDisponiblesSegunModo,
  encuestaSeleccionadaObj,
  preguntasDisponiblesAlcance,
  respuestasValidasAlcance,
  dimensionesRadialesDinamicas,
  alertasValidasAlcance,
  departamentosBarras
} = useDashboardFiltros(
  encuestas,
  respuestasAnonimas,
  alertasConvivencia,
  dimensionesConfiguradas,
  departamentosDisponibles,
  departamentoFiltro,
  metaGlobalRadialRef
)

// Modal de Creación de Estadística de Pregunta
const modalCrearEstadisticaAbierto = ref(false)
const preguntaInicialParaEstadistica = ref<string | undefined>(undefined)

const abrirModalCrearEstadistica = (idPregunta?: string) => {
  preguntaInicialParaEstadistica.value = idPregunta
  modalCrearEstadisticaAbierto.value = true
}

const manejarEstadisticaCreada = (nuevoGrafico: Parameters<typeof anclarNuevoGrafico>[0]) => {
  anclarNuevoGrafico(nuevoGrafico)
  modalCrearEstadisticaAbierto.value = false
  pestanaActiva.value = 'anclados'
}

// Navegación de Pestañas (Inicia en Estadísticas Generales)
const pestanaActiva = ref<'general' | 'preguntas' | 'anclados' | 'alertas' | 'auditoria' | 'estudios'>('general')

// Sincronizar con el parámetro de URL (?seccion=...)
watch(
  () => route.query.seccion,
  (nuevaSeccion) => {
    if (nuevaSeccion && ['general', 'preguntas', 'anclados', 'alertas', 'auditoria', 'estudios'].includes(nuevaSeccion as string)) {
      pestanaActiva.value = nuevaSeccion as 'general' | 'preguntas' | 'anclados' | 'alertas' | 'auditoria' | 'estudios'
    }
  },
  { immediate: true }
)

// Modales interactivos
const modalExportarAbierto = ref(false)
const modalAlertaAbierto = ref(false)
const alertaSeleccionada = ref<NotificacionItem | null>(null)

// Salud promedio calculada según las respuestas en alcance (100% libre de NaN)
const promedioSaludDinamico = computed(() => {
  if (!respuestasValidasAlcance.value || respuestasValidasAlcance.value.length === 0) {
    return 0
  }
  return calcularClimaGlobalDeRespuestas(respuestasValidasAlcance.value).porcentajeClima
})

const inspeccionarAlerta = (alerta: NotificacionItem) => {
  alertaSeleccionada.value = alerta
  modalAlertaAbierto.value = true
}

const marcarAlertaAtendida = async (id: string) => {
  await actualizarEstadoAlerta(id, 'Atendida')
  modalAlertaAbierto.value = false
}

const cambiarEstadoAlerta = async (id: string, nuevoEstado: 'Detectada' | 'En Revisión' | 'Atendida' | 'Descartada') => {
  await actualizarEstadoAlerta(id, nuevoEstado)
  if (nuevoEstado === 'Descartada') {
    modalAlertaAbierto.value = false
  }
}

const manejarEliminarRespuestaIndividual = async (idRespuesta: string) => {
  await eliminarRespuestaIndividual(idRespuesta)
}

const encuestasOrdenadas = computed(() => {
  const master = encuestas.value.find(e => e.id === 'enc-001') || {
    id: 'enc-001',
    titulo: 'Proyecto Clima Laboral — Diagnóstico Organizacional',
    descripcion: 'Evaluación oficial de bienestar, liderazgo y clima.',
    departamento: 'Operaciones & Clima Laboral',
    preguntas: []
  }
  const otros = encuestas.value.filter(e => e.id !== 'enc-001')
  return [master, ...otros]
})

const respuestasPorProyecto = (idEncuesta: string) => {
  return respuestasAnonimas.value.filter(r => 
    r.idEncuesta === idEncuesta || (idEncuesta === 'enc-001' && (!r.idEncuesta || r.idEncuesta === 'enc-001'))
  ).length
}

const seleccionarProyecto = (id: string) => {
  encuestaFiltro.value = id
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 px-4 sm:px-6 md:pl-20 md:pr-8 py-6 md:py-8 relative font-['Poppins',sans-serif] transition-colors duration-300">
    
    <!-- Luces sutiles de fondo -->
    <div class="fixed top-0 right-10 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
    <div class="fixed bottom-10 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

    <div class="max-w-7xl mx-auto space-y-6 relative z-10">
      
      <!-- ================================================================= -->
      <!-- CASO A: USUARIO NO AUTENTICADO (PORTAL ANÓNIMO PARA COLABORADORES)-->
      <!-- ================================================================= -->
      <DashboardColaboradorAnonimo
        v-if="!estaAutenticado"
        :encuestasDisponibles="encuestas"
      />

      <!-- ================================================================= -->
      <!-- CASO B: USUARIO AUTENTICADO (CREACIÓN Y ANÁLISIS DETALLADO CON IA)-->
      <!-- ================================================================= -->
      <template v-else>
        <!-- CASO B1: SI NO HAY PROYECTO SELECCIONADO, MOSTRAR SELECCIÓN PARA NO MEZCLAR DATOS -->
        <div v-if="!encuestaFiltro" class="space-y-6 text-left">
          <!-- Encabezado Limpio de Selección -->
          <div class="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between flex-wrap gap-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Layers class="w-5 h-5" />
              </div>
              <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Selecciona un Proyecto
              </h2>
            </div>
            <span class="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-600 dark:text-slate-400">
              {{ encuestasOrdenadas.length }} Proyectos
            </span>
          </div>

          <div class="space-y-3">

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div
                v-for="(enc, idx) in encuestasOrdenadas"
                :key="enc.id"
                @click="seleccionarProyecto(enc.id)"
                :class="[
                  'p-6 rounded-3xl border transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl group relative overflow-hidden flex flex-col justify-between space-y-4',
                  idx === 0
                    ? 'bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/30 dark:from-slate-900 dark:via-blue-950/20 dark:to-slate-900 border-blue-400/60 dark:border-blue-500/40 hover:border-blue-500 ring-2 ring-blue-500/20'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                ]"
              >
                <!-- Insignia Destacada -->
                <div v-if="idx === 0" class="flex items-center justify-between">
                  <span class="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                
                    <span>Proyecto Principal — Clima Laboral</span>
                  </span>
                  <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
                <div v-else class="flex items-center justify-between">
                  <span class="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-mono font-bold">
                    Proyecto {{ idx + 1 }}
                  </span>
                  <span class="w-2 h-2 rounded-full bg-slate-400"></span>
                </div>

                <!-- Título y Descripción -->
                <div class="space-y-1.5">
                  <h4 class="text-lg font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                    {{ idx === 0 ? 'Proyecto Clima Laboral' : enc.titulo }}
                  </h4>
                 
                </div>

                <!-- Métricas Rápidas -->
                <div class="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
                  <div class="flex items-center gap-1.5">
                    <ClipboardList class="w-3.5 h-3.5 text-blue-500" />
                    <span>{{ enc.preguntas?.length || 30 }} preguntas</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <Users class="w-3.5 h-3.5 text-emerald-500" />
                    <span>{{ respuestasPorProyecto(enc.id) }} respuestas</span>
                  </div>
                </div>

                <!-- Botón de Selección -->
                <div class="pt-2">
                  <div class="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-600 text-slate-700 dark:text-slate-300 group-hover:text-white font-bold text-xs flex items-center justify-between transition-all">
                    <span>Dashboard</span>
                    <ChevronRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- CASO B2: PROYECTO SELECCIONADO: MOSTRAR DASHBOARD LIMPIO Y FILTRADO -->
        <template v-else>
          <!-- Barra Superior Unificada: Proyecto Activo + Filtros + Exportación -->
          <DashboardEncabezado
            v-model:modoVista="modoDashboard"
            v-model:departamentoSeleccionado="departamentoFiltro"
            v-model:periodoSeleccionado="filtroPeriodoTemporal"
            v-model:encuestaSeleccionada="encuestaFiltro"
            :nombreProyectoActivo="encuestaFiltro === 'enc-001' ? 'Proyecto Clima Laboral' : (encuestaSeleccionadaObj?.titulo || encuestaFiltro)"
            :departamentosDisponibles="departamentosDisponibles"
            :encuestasDisponibles="encuestasDisponiblesSegunModo"
            @cambiarProyecto="encuestaFiltro = ''"
            @abrirModalExportar="modalExportarAbierto = true"
          />

          <!-- Barra de Navegación de Pestañas del Dashboard -->
          <DashboardNavegacionPestanas
            v-model:pestanaActiva="pestanaActiva"
            :totalAlertas="alertasValidasAlcance.length"
            :totalGraficosAnclados="totalGraficos"
          />

        <!-- PESTAÑA 1: VISIÓN GENERAL Y ESTADÍSTICAS -->
        <DashboardPestanaGeneral
          v-if="pestanaActiva === 'general'"
          :promedioSalud="promedioSaludDinamico"
          :enps="datosEstadisticas.enps"
          :totalAlertas="alertasValidasAlcance.length"
          :participacion="datosEstadisticas.participacion"
          :conclusionesIA="datosEstadisticas.analisisConclusionesIA"
          :dimensionesRadiales="dimensionesRadialesDinamicas"
          :departamentosBarras="departamentosBarras"
          :anguloInclinacion="anguloRotacionRadar"
          :departamentoSeleccionado="departamentoFiltro"
          :periodoSeleccionado="filtroPeriodoTemporal"
          @cambiarPestana="pestanaActiva = $event"
        />

        <!-- PESTAÑA 2: GRÁFICOS ANCLADOS & ANÁLISIS IA (CERO CARGA OPERATIVA) -->
        <PestanaGraficosAnclados
          v-else-if="pestanaActiva === 'anclados'"
          :respuestas="respuestasValidasAlcance"
          :preguntasDisponibles="preguntasDisponiblesAlcance"
          :idEncuestaActual="encuestaFiltro"
        />

        <!-- PESTAÑA 3: DESGLOSE DE PREGUNTAS -->
        <div v-else-if="pestanaActiva === 'preguntas'" class="space-y-6">
          <DesglosePreguntasDetallado 
            :preguntas="datosEstadisticas.desgloseRespuestasDetalladas" 
            @crearEstadistica="abrirModalCrearEstadistica"
          />
        </div>

        <!-- PESTAÑA 4: ALERTAS DE CONVIVENCIA Y ACOSO -->
        <DashboardPestanaAlertas
          v-else-if="pestanaActiva === 'alertas'"
          :alertas="alertasValidasAlcance"
          :respuestas="respuestasValidasAlcance"
          :elementoResaltadoId="elementoResaltadoId"
          @inspeccionarAlerta="inspeccionarAlerta"
        />

        <!-- PESTAÑA 5: AUDITORÍA POR UUID CON ELIMINACIÓN Y FILTRO DE RELLENO -->
        <DashboardPestanaAuditoria
          v-else-if="pestanaActiva === 'auditoria'"
          :respuestas="respuestasAnonimas"
          @eliminarRespuesta="manejarEliminarRespuestaIndividual"
        />

        <!-- PESTAÑA 6: BLOQUE DE ESTUDIO (TALENTO Y HABILIDADES) -->
        <AnaliticaBloqueEstudio
          v-else-if="pestanaActiva === 'estudios'"
          :departamentoSeleccionado="departamentoFiltro"
          :periodoSeleccionado="filtroPeriodoTemporal"
        />
      </template>
    </template>

    </div>

    <!-- Modales Modulares -->
    <ModalDetalleAlerta
      :abierto="modalAlertaAbierto"
      :alerta="alertaSeleccionada"
      @cerrar="modalAlertaAbierto = false"
      @marcarAtendida="marcarAlertaAtendida"
      @cambiarEstado="cambiarEstadoAlerta"
    />

    <ModalExportarInforme
      :abierto="modalExportarAbierto"
      :estadisticas="datosEstadisticas"
      :departamentoSeleccionado="departamentoFiltro"
      :encuestas="encuestas"
      :respuestas="respuestasAnonimas"
      @cerrar="modalExportarAbierto = false"
    />

    <!-- Modal para Crear Estadística de Pregunta y Anclar a Dashboard -->
    <ModalCrearGraficoAnclado
      :abierto="modalCrearEstadisticaAbierto"
      :preguntasDisponibles="preguntasDisponiblesAlcance"
      :idEncuestaActual="encuestaFiltro"
      :preguntaInicialId="preguntaInicialParaEstadistica"
      @cerrar="modalCrearEstadisticaAbierto = false"
      @anclar="manejarEstadisticaCreada"
    />

  </div>
</template>
