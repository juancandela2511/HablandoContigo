<!--
  ============================================================================
  VISTA PRINCIPAL EJECUTIVA DE DASHBOARD (DashboardView.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Centro de mando estratégico y analítico de clima laboral:
  - Orquesta el encabezado y filtros de rango temporal (`DashboardEncabezado.vue`).
  - Orquesta las 5 pestañas de análisis (`DashboardNavegacionPestanas.vue`):
    1. Visión General & Métricas Clave (`DashboardPestanaGeneral.vue`).
    2. Matriz de Calor & Fallos de Áreas (`MatrizCalorRiesgo.vue`).
    3. Desglose Pregunta a Pregunta (`DesglosePreguntasDetallado.vue`).
    4. Alertas de Convivencia y Acoso (`DashboardPestanaAlertas.vue`).
    5. Auditoría Criptográfica por UUID (`DashboardPestanaAuditoria.vue`).
  - Modal de Inspección Profunda de Alertas (`ModalDetalleAlerta.vue`).
  - Modal de Exportación Ejecutiva en PDF/CSV/JSON (`ModalExportarInforme.vue`).
  
  ¿PARA QUÉ SIRVE?
  - Monitorear en tiempo real la salud de la organización y facilitar la toma de decisiones.
  
  ¿CON QUÉ ESTÁ VINCULADO / CONECTADO?
  - useEstadisticas.ts, useNotificaciones.ts, useEncuestas.ts, useHighlight.ts.
  - Subcomponentes modulares en `src/componentes/Dashboard/`.
-->

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useEstadisticas } from '@/Almacenes/useEstadisticas'
import { useNotificaciones, type NotificacionItem } from '@/Almacenes/useNotificaciones'
import { useEncuestas } from '@/Almacenes/useEncuestas'
import { useHighlight } from '@/Almacenes/useHighlight'
import { useAuth } from '@/Almacenes/useAuth'
import { Bot } from 'lucide-vue-next'

// Subcomponentes modulares del Dashboard
import DashboardColaboradorAnonimo from '@/componentes/Dashboard/DashboardColaboradorAnonimo.vue'
import DashboardEncabezado from '@/componentes/Dashboard/DashboardEncabezado.vue'
import DashboardNavegacionPestanas from '@/componentes/Dashboard/DashboardNavegacionPestanas.vue'
import DashboardPestanaGeneral from '@/componentes/Dashboard/DashboardPestanaGeneral.vue'
import DashboardPestanaAlertas from '@/componentes/Dashboard/DashboardPestanaAlertas.vue'
import DashboardPestanaAuditoria from '@/componentes/Dashboard/DashboardPestanaAuditoria.vue'
import DesglosePreguntasDetallado from '@/componentes/Dashboard/DesglosePreguntasDetallado.vue'
import ModalDetalleAlerta from '@/componentes/Dashboard/ModalDetalleAlerta.vue'
import ModalExportarInforme from '@/componentes/Dashboard/ModalExportarInforme.vue'

const route = useRoute()
const { elementoResaltadoId } = useHighlight()
const { estaAutenticado, usuarioActual, permisosUsuario } = useAuth()
const { notificaciones, noLeidas, marcarLeida, actualizarEstadoAlerta } = useNotificaciones()
const { 
  encuestas, 
  respuestasAnonimas, 
  eliminarRespuestaIndividual, 
  vaciarTodasLasEstadisticas
} = useEncuestas()

const {
  datosEstadisticas,
  departamentoFiltro,
  departamentosDisponibles,
  dimensionesFiltradas,
  promedioSaludActual
} = useEstadisticas()

// Filtro de Encuesta Específica o Consolidado General
const encuestaFiltro = ref('todas')

// Navegación de Pestañas (Inicia en Estadísticas Generales)
const pestanaActiva = ref<'general' | 'preguntas' | 'alertas' | 'auditoria'>('general')

// Sincronizar con el parámetro de URL (?seccion=...)
watch(
  () => route.query.seccion,
  (nuevaSeccion) => {
    if (nuevaSeccion && ['general', 'preguntas', 'alertas', 'auditoria'].includes(nuevaSeccion as string)) {
      pestanaActiva.value = nuevaSeccion as any
    }
  },
  { immediate: true }
)

const filtroPeriodoTemporal = ref('mensual')

// Modales interactivos
const modalExportarAbierto = ref(false)
const modalAlertaAbierto = ref(false)
const alertaSeleccionada = ref<NotificacionItem | null>(null)

// Encuesta activa seleccionada
const encuestaSeleccionadaObj = computed(() => {
  if (encuestaFiltro.value === 'todas') return null
  return encuestas.value.find(e => e.id === encuestaFiltro.value) || null
})

// Respuestas válidas en el alcance actual (filtradas por encuesta, depto y sin descartadas)
const respuestasValidasAlcance = computed(() => {
  return respuestasAnonimas.value.filter(r => {
    if (r.esDescartadaPorVelocidad) return false
    if (encuestaFiltro.value !== 'todas' && r.idEncuesta !== encuestaFiltro.value) return false
    if (departamentoFiltro.value !== 'todos') {
      const enc = encuestas.value.find(e => e.id === r.idEncuesta)
      if (enc?.departamento !== departamentoFiltro.value) return false
    }
    return true
  })
})

// Respuestas de la encuesta seleccionada
const respuestasFiltradasPorEncuesta = computed(() => {
  if (encuestaFiltro.value === 'todas') return respuestasAnonimas.value
  return respuestasAnonimas.value.filter(r => r.idEncuesta === encuestaFiltro.value)
})

// Dimensiones ajustadas para el gráfico radial
const dimensionesRadialesDinamicas = computed(() => {
  return dimensionesFiltradas.value
})

// ============================================================================
// COMPARATIVA DE DIMENSIONES POR PORCENTAJE (100% REAL - NO DECORACIÓN)
// ============================================================================
const dimensionesBarras = computed(() => {
  // 1. Identificar encuestas dentro del alcance actual
  const encuestasEnAlcance = encuestas.value.filter(e => {
    if (encuestaFiltro.value !== 'todas' && e.id !== encuestaFiltro.value) return false
    if (departamentoFiltro.value !== 'todos' && e.departamento !== departamentoFiltro.value) return false
    return true
  })

  // 2. Extraer categorías reales de las preguntas en estas encuestas
  const categoriasSet = new Set<string>()
  encuestasEnAlcance.forEach(enc => {
    enc.preguntas?.forEach(p => {
      if (p.categoria && p.categoria.trim()) {
        categoriasSet.add(p.categoria.trim())
      }
    })
  })

  // 3. Añadir categorías presentes en las respuestas recibidas
  respuestasValidasAlcance.value.forEach(r => {
    r.respuestas?.forEach(item => {
      if (item.categoria && item.categoria.trim()) {
        categoriasSet.add(item.categoria.trim())
      }
    })
  })

  // Si no se han configurado categorías aún, mostrar categorías estándar organizacionales
  if (categoriasSet.size === 0) {
    ;['Liderazgo y Confianza', 'Carga Laboral y Estrés', 'Bienestar y Reconocimiento', 'Trabajo en Equipo y Apoyo', 'Clima y Ambiente Físico'].forEach(c => categoriasSet.add(c))
  }

  // 4. Calcular estadísticas exactas a partir de las respuestas registradas en Supabase
  const listaBarras = Array.from(categoriasSet).map(cat => {
    let sumaPuntajes = 0
    let totalRespuestasCat = 0

    respuestasValidasAlcance.value.forEach(r => {
      r.respuestas?.forEach(item => {
        const coincideCat = item.categoria && item.categoria.trim().toLowerCase() === cat.toLowerCase()
        if (coincideCat && typeof item.valor === 'number' && item.valor >= 1 && item.valor <= 5) {
          sumaPuntajes += item.valor
          totalRespuestasCat++
        }
      })
    })

    if (totalRespuestasCat > 0) {
      const promedio = +(sumaPuntajes / totalRespuestasCat).toFixed(1)
      const porcentaje = Math.min(100, Math.max(0, Math.round((promedio / 5) * 100)))
      const nivelAlerta = porcentaje >= 80 ? 'Optimo' : porcentaje >= 65 ? 'Moderado' : 'Critico'
      return {
        categoria: cat,
        puntaje: promedio,
        porcentaje,
        respuestas: totalRespuestasCat,
        nivelAlerta
      }
    } else {
      return {
        categoria: cat,
        puntaje: 0.0,
        porcentaje: 0,
        respuestas: 0,
        nivelAlerta: 'Sin datos'
      }
    }
  })

  // Ordenar dimensiones: prioritariamente las evaluadas con respuestas
  return listaBarras.sort((a, b) => {
    if (a.respuestas > 0 && b.respuestas === 0) return -1
    if (a.respuestas === 0 && b.respuestas > 0) return 1
    return b.porcentaje - a.porcentaje
  })
})

// Departamentos convertidos a formato ItemBarra calculados 100% en tiempo real
const departamentosBarras = computed(() => {
  return departamentosDisponibles.value.map(dep => {
    const respsDep = respuestasAnonimas.value.filter(r => {
      if (r.esDescartadaPorVelocidad) return false
      const enc = encuestas.value.find(e => e.id === r.idEncuesta)
      return enc?.departamento === dep
    })
    if (respsDep.length > 0) {
      const suma = respsDep.reduce((a, b) => a + (b.puntajeGeneral || 0), 0)
      const puntaje = +(suma / respsDep.length).toFixed(1)
      const porcentaje = Math.round((puntaje / 5) * 100)
      return {
        categoria: dep,
        puntaje,
        porcentaje,
        respuestas: respsDep.length,
        nivelAlerta: puntaje >= 4.0 ? 'Optimo' : puntaje >= 3.0 ? 'Moderado' : 'Critico'
      }
    }
    return {
      categoria: dep,
      puntaje: 0.0,
      porcentaje: 0,
      respuestas: 0,
      nivelAlerta: 'Sin datos'
    }
  })
})

// Salud promedio calculada según las respuestas en alcance
const promedioSaludDinamico = computed(() => {
  if (respuestasValidasAlcance.value.length === 0) {
    return promedioSaludActual.value
  }
  const suma = respuestasValidasAlcance.value.reduce((acc, r) => acc + (r.puntajeGeneral || 0), 0)
  const prom = suma / respuestasValidasAlcance.value.length
  return Math.round((prom / 5) * 100)
})

const inspeccionarAlerta = (alerta: NotificacionItem) => {
  alertaSeleccionada.value = alerta
  modalAlertaAbierto.value = true
}

const marcarAlertaAtendida = async (id: string) => {
  await actualizarEstadoAlerta(id, 'Atendida')
  modalAlertaAbierto.value = false
}

const cambiarEstadoAlerta = async (id: string, nuevoEstado: any) => {
  await actualizarEstadoAlerta(id, nuevoEstado)
  if (nuevoEstado === 'Descartada') {
    modalAlertaAbierto.value = false
  }
}

const manejarPurgarTodasEstadisticas = async () => {
  if (confirm('¿Deseas purgar y vaciar TODAS las respuestas registradas en Supabase? Esta acción reiniciará todas las métricas a cero.')) {
    await vaciarTodasLasEstadisticas()
  }
}

const manejarEliminarRespuestaIndividual = async (idRespuesta: string) => {
  await eliminarRespuestaIndividual(idRespuesta)
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 pl-14 sm:pl-16 pr-4 sm:pr-8 py-8 relative font-['Poppins',sans-serif] transition-colors duration-300">
    
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
        <!-- Banner Ejecutivo de Creación y Análisis con IA -->
        <div class="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="space-y-1 text-left">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 font-mono">
                Centro de Mando Administrativo
              </span>
              <span class="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold font-mono">
                {{ usuarioActual?.rol || 'Administrador' }}
              </span>
            </div>
            <h2 class="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              Análisis Detallado de Clima & Creación de Encuestas
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Monitorea el rigor analítico de Gemini, atiende alertas tempranas de convivencia y formula nuevos diagnósticos.
            </p>
          </div>

          <div class="flex items-center gap-3 shrink-0">
            <router-link
              to="/proyectos"
              class="px-5 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-sky-600/20 active:scale-95 cursor-pointer"
            >
              <Bot class="w-4 h-4" />
              <span>Crear Encuesta con IA</span>
            </router-link>
          </div>
        </div>

        <!-- Top Bar: Encabezado y Filtros (Componente Modular) -->
        <DashboardEncabezado
          v-model:departamentoSeleccionado="departamentoFiltro"
          v-model:periodoSeleccionado="filtroPeriodoTemporal"
          v-model:encuestaSeleccionada="encuestaFiltro"
          :departamentosDisponibles="departamentosDisponibles"
          :encuestasDisponibles="encuestas"
          @abrirModalExportar="modalExportarAbierto = true"
          @purgarEstadisticas="manejarPurgarTodasEstadisticas"
        />

        <!-- PESTAÑA 1: VISIÓN GENERAL Y ESTADÍSTICAS -->
        <DashboardPestanaGeneral
          v-if="pestanaActiva === 'general'"
          :promedioSalud="promedioSaludDinamico"
          :enps="datosEstadisticas.enps"
          :totalAlertas="noLeidas"
          :participacion="datosEstadisticas.participacion"
          :conclusionesIA="datosEstadisticas.analisisConclusionesIA"
          :dimensionesRadiales="dimensionesRadialesDinamicas"
          :dimensionesBarras="dimensionesBarras"
          :departamentosBarras="departamentosBarras"
          @cambiarPestana="pestanaActiva = $event"
        />

        <!-- PESTAÑA 2: DESGLOSE DE PREGUNTAS -->
        <div v-else-if="pestanaActiva === 'preguntas'" class="space-y-6">
          <DesglosePreguntasDetallado :preguntas="datosEstadisticas.desgloseRespuestasDetalladas" />
        </div>

        <!-- PESTAÑA 4: ALERTAS DE CONVIVENCIA Y ACOSO -->
        <DashboardPestanaAlertas
          v-else-if="pestanaActiva === 'alertas'"
          :alertas="notificaciones"
          :elementoResaltadoId="elementoResaltadoId"
          @inspeccionarAlerta="inspeccionarAlerta"
        />

        <!-- PESTAÑA 5: AUDITORÍA POR UUID CON ELIMINACIÓN Y FILTRO DE RELLENO -->
        <DashboardPestanaAuditoria
          v-else-if="pestanaActiva === 'auditoria'"
          :respuestas="respuestasAnonimas"
          @eliminarRespuesta="manejarEliminarRespuestaIndividual"
        />
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

  </div>
</template>
