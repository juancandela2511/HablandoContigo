<!--
  ============================================================================
  COMPONENTE MODAL DE EXPORTACIÓN EJECUTIVA DE INFORMES (ModalExportarInforme.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Ventana modal que consolida los hallazgos analíticos y permite su descarga en:
  1. PDF / Presentación de Diapositivas: Con portada personalizada (empresa, fecha del día,
     nombre del evaluador, cargo y logo subido), gráficos de PAI por cada pregunta,
     objetivos de mejora y conclusión final.
  2. Excel (.xls): Libro de cálculo estructurado con KPIs, métricas de dimensiones,
     gráficas visuales de barras condicionales y desglose de preguntas.
  3. JSON Estructurado: Datos crudos para auditoría o pipelines de datos.
  
  ¿CON QUÉ SE CONECTA?
  - DashboardView.vue
  - useAuth.ts
  - generadorReportes.ts
-->

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/Almacenes/useAuth'
import type { EstadisticasCompletas } from '@/Almacenes/useEstadisticas'
import type { Encuesta, RegistroRespuesta } from '@/Almacenes/useEncuestas'
import {
  exportarExcelEstadistico,
  exportarPDFEjecutivo
} from '@/Servicios/generadorReportes'
import {
  FileText,
  Printer,
  FileSpreadsheet,
  Code2,
  X,
  CheckCircle2,
  Sparkles,
  Building,
  ShieldCheck,
  Upload,
  Image as ImageIcon,
  Calendar,
  User,
  Briefcase,
  Trash2,
  Presentation
} from 'lucide-vue-next'

const props = defineProps<{
  abierto: boolean
  estadisticas: EstadisticasCompletas
  departamentoSeleccionado: string
  encuestas?: Encuesta[]
  respuestas?: RegistroRespuesta[]
}>()

const emit = defineEmits<{
  (evento: 'cerrar'): void
}>()

const { usuarioActual } = useAuth()

/** Campos personalizables de la portada solicitados por el usuario */
const nombreEmpresa = ref('Contigo call center 2025')
const nombrePresentador = ref(usuarioActual.value?.nombre || 'Patricia Londoño Martinez.')
const cargoPresentador = ref(usuarioActual.value?.rol || 'Coordinadora TH')

// Fecha actual del día formateada (ej. "Septiembre 2026")
const fechaHoy = new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
  .replace(/^\w/, c => c.toUpperCase())
const fechaInforme = ref(fechaHoy)

// Estado para subir y previsualizar logo personalizado
const logoPersonalizado = ref<string | null>(null)
const inputLogoRef = ref<HTMLInputElement | null>(null)

/** Mensaje temporal de descarga completada */
const mensajeDescarga = ref<string | null>(null)

const notificarDescarga = async (formato: string) => {
  mensajeDescarga.value = `Presentación generada en formato ${formato}.`
  setTimeout(() => {
    mensajeDescarga.value = null
  }, 3500)

  // 🔔 Notificación de actividad: Informe listo
  try {
    const { useNotificaciones } = await import('@/Almacenes/useNotificaciones')
    const { agregarNotificacion } = useNotificaciones()
    await agregarNotificacion({
      tipo: 'informe',
      titulo: 'Informe y Análisis Listo',
      descripcion: `El informe en ${formato} fue generado exitosamente.`,
      mensaje: `El análisis consolidado y las conclusiones automáticas de IA para "${props.departamentoSeleccionado}" ya están listos para revisar o compartir.`,
      departamento: props.departamentoSeleccionado || 'General',
      tipoAlerta: 'Informe Analítico',
      severidad: 'Baja',
      estado: 'Detectada',
      fecha: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
      hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      leida: false,
      rutaDestino: '/dashboard'
    })
  } catch (err) {
    console.warn('Aviso notificando informe listo:', err)
  }
}

/**
 * Maneja la subida de un archivo de imagen para el logo
 */
const manejarSubirLogo = (evento: Event) => {
  const input = evento.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const archivo = input.files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      logoPersonalizado.value = e.target?.result as string
    }
    reader.readAsDataURL(archivo)
  }
}

/**
 * Elimina el logo personalizado y vuelve al predeterminado
 */
const eliminarLogo = () => {
  logoPersonalizado.value = null
  if (inputLogoRef.value) {
    inputLogoRef.value.value = ''
  }
}

/**
 * Disparador para abrir el selector de archivo de logo
 */
const activarSelectorLogo = () => {
  inputLogoRef.value?.click()
}

/**
 * Exporta el libro estructurado de Excel con estadísticas y gráficas visuales
 */
const manejarExportarExcel = () => {
  exportarExcelEstadistico({
    estadisticas: props.estadisticas,
    encuestas: props.encuestas,
    respuestas: props.respuestas,
    departamentoSeleccionado: props.departamentoSeleccionado,
    nombreEmpresa: nombreEmpresa.value,
    nombrePresentador: nombrePresentador.value,
    cargoPresentador: cargoPresentador.value,
    fechaPersonalizada: fechaInforme.value,
    logoPersonalizadoUrl: logoPersonalizado.value || '/logo.png'
  })
  notificarDescarga('Excel con Estadísticas y Gráficas')
}

/**
 * Exporta el documento / diapositivas ejecutivas con gráficos de PAI por pregunta y conclusiones
 */
const manejarExportarPDF = () => {
  exportarPDFEjecutivo({
    estadisticas: props.estadisticas,
    encuestas: props.encuestas,
    respuestas: props.respuestas,
    departamentoSeleccionado: props.departamentoSeleccionado,
    nombreEmpresa: nombreEmpresa.value,
    nombrePresentador: nombrePresentador.value,
    cargoPresentador: cargoPresentador.value,
    fechaPersonalizada: fechaInforme.value,
    logoPersonalizadoUrl: logoPersonalizado.value || '/logo.png'
  })
  notificarDescarga('Presentación Ejecutiva / PDF con Gráficos de Pai')
}

/**
 * Exporta el JSON completo de estadísticas
 */
const exportarJSON = () => {
  const jsonStr = JSON.stringify(props.estadisticas, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = `Informe_Clima_HablandoContigo_${new Date().toISOString().slice(0, 10)}.json`
  enlace.click()
  URL.revokeObjectURL(url)

  notificarDescarga('JSON')
}
</script>

<template>
  <div
    v-if="abierto"
    class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
    @click.self="emit('cerrar')"
  >
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-3xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
      
      <!-- Botón Cerrar -->
      <button
        @click="emit('cerrar')"
        class="absolute top-5 right-5 text-slate-400 hover:text-slate-900 dark:hover:text-white p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        title="Cerrar modal"
      >
        <X class="w-5 h-5" />
      </button>

      <!-- Encabezado del Modal -->
      <div class="space-y-1 text-left">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-sky-400 text-xs font-semibold">
          <Presentation class="w-3.5 h-3.5" />
          <span>CENTRO DE INFORMES & PRESENTACIÓN EJECUTIVA</span>
        </div>
        <h3 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          Resultados de Clima Laboral
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Configura los datos de la portada (nombre, cargo, fecha del día y logo) y genera la presentación con estadísticas de PAI por pregunta y conclusiones.
        </p>
      </div>

      <!-- Alerta de Descarga Exitosa -->
      <div
        v-if="mensajeDescarga"
        class="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-3 animate-fade-in text-left"
      >
        <CheckCircle2 class="w-5 h-5 text-emerald-500 shrink-0" />
        <span>{{ mensajeDescarga }}</span>
      </div>

      <!-- SECCIÓN: PERSONALIZACIÓN DE LA PORTADA E IDENTIDAD -->
      <div class="p-5 rounded-2xl bg-sky-50/60 dark:bg-slate-950 border border-sky-200 dark:border-sky-900/60 space-y-4 text-left">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-sky-950 dark:text-sky-300 flex items-center gap-1.5">
            <Sparkles class="w-4 h-4 text-sky-500" />
            <span>Datos de la Portada & Logo Institucional</span>
          </span>
          <span class="text-[10px] font-mono text-sky-700 dark:text-sky-400 font-semibold bg-sky-100 dark:bg-sky-900/60 px-2 py-0.5 rounded-md">
            Personalización de Portada
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <!-- Campo 1: Empresa / Campaña -->
          <div class="space-y-1">
            <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Building class="w-3.5 h-3.5 text-sky-500" />
              <span>Empresa / Título Superior:</span>
            </label>
            <input
              v-model="nombreEmpresa"
              type="text"
              placeholder="Ej. Contigo call center 2025"
              class="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <!-- Campo 2: Fecha de Hoy -->
          <div class="space-y-1">
            <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Calendar class="w-3.5 h-3.5 text-amber-500" />
              <span>Fecha del Informe (Día Actual):</span>
            </label>
            <input
              v-model="fechaInforme"
              type="text"
              placeholder="Ej. Septiembre 2026"
              class="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <!-- Campo 3: Nombre de quien presenta -->
          <div class="space-y-1">
            <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <User class="w-3.5 h-3.5 text-emerald-500" />
              <span>Nombre de quien Presenta (Evaluador):</span>
            </label>
            <input
              v-model="nombrePresentador"
              type="text"
              placeholder="Ej. Patricia Londoño Martinez."
              class="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <!-- Campo 4: Cargo / Rol -->
          <div class="space-y-1">
            <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Briefcase class="w-3.5 h-3.5 text-indigo-500" />
              <span>Cargo / Rol del Presentador:</span>
            </label>
            <input
              v-model="cargoPresentador"
              type="text"
              placeholder="Ej. Coordinadora TH"
              class="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        <!-- Subir Logo de la Empresa -->
        <div class="pt-2 border-t border-sky-200/80 dark:border-sky-900/40 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <!-- Input Oculto de Archivo -->
            <input
              ref="inputLogoRef"
              type="file"
              accept="image/png, image/jpeg, image/svg+xml, image/webp"
              class="hidden"
              @change="manejarSubirLogo"
            />

            <!-- Botón para subir logo -->
            <button
              type="button"
              @click="activarSelectorLogo"
              class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:border-sky-500 hover:text-sky-600 transition-all cursor-pointer shadow-sm"
            >
              <Upload class="w-3.5 h-3.5 text-sky-500" />
              <span>{{ logoPersonalizado ? 'Cambiar Logo Subido' : 'Subir Logo de la Empresa' }}</span>
            </button>

            <!-- Previsualización del Logo -->
            <div v-if="logoPersonalizado" class="flex items-center gap-2">
              <div class="p-1 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center">
                <img :src="logoPersonalizado" alt="Logo Previo" class="h-7 max-w-[100px] object-contain" />
              </div>
              <button
                type="button"
                @click="eliminarLogo"
                class="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors cursor-pointer"
                title="Quitar logo personalizado"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
            <span v-else class="text-[11px] text-slate-500 flex items-center gap-1">
              <ImageIcon class="w-3 h-3 text-slate-400" />
              <span>Usando logo institucional por defecto</span>
            </span>
          </div>

          <div class="text-[10px] text-slate-400 font-mono">
            PNG, JPG o SVG (esquina inferior derecha)
          </div>
        </div>
      </div>

      <!-- Resumen Ejecutivo Previo -->
      <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 text-left">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <CheckCircle2 class="w-4 h-4 text-emerald-500" />
            <span>Métricas del Informe a Exportar</span>
          </span>
          <span class="text-xs font-mono text-slate-500 flex items-center gap-1">
            <Building class="w-3.5 h-3.5" />
            <span>{{ departamentoSeleccionado }}</span>
          </span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div class="text-lg font-black text-sky-600 dark:text-sky-400">
              {{ estadisticas.analisisConclusionesIA.indiceGeneralSalud }}%
            </div>
            <div class="text-[10px] text-slate-500 uppercase font-semibold">Salud de Clima</div>
          </div>
          <div class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div class="text-lg font-black text-slate-900 dark:text-white">
              {{ estadisticas.enps.score > 0 ? '+' : '' }}{{ estadisticas.enps.score }}
            </div>
            <div class="text-[10px] text-slate-500 uppercase font-semibold">eNPS ({{ estadisticas.enps.clasificacion }})</div>
          </div>
          <div class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div class="text-lg font-black text-slate-900 dark:text-white">
              {{ encuestas?.length || 0 }}
            </div>
            <div class="text-[10px] text-slate-500 uppercase font-semibold">Encuestas Activas</div>
          </div>
          <div class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div class="text-lg font-black text-slate-900 dark:text-white">
              {{ estadisticas.participacion.totalRespondieron }}
            </div>
            <div class="text-[10px] text-slate-500 uppercase font-semibold">Colaboradores</div>
          </div>
        </div>
      </div>

      <!-- Opciones de Descarga en 3 Formatos -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <!-- Formato 1: PDF / Presentación de Diapositivas con Pai -->
        <div
          @click="manejarExportarPDF"
          class="p-5 rounded-2xl bg-white dark:bg-slate-950 border-2 border-sky-500/40 hover:border-sky-500 transition-all cursor-pointer group space-y-3 text-left hover:shadow-xl hover:-translate-y-0.5 bg-gradient-to-br from-sky-50/40 to-transparent dark:from-sky-950/20"
        >
          <div class="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Presentation class="w-5 h-5" />
          </div>
          <div>
            <h5 class="text-sm font-bold text-slate-900 dark:text-white group-hover:text-sky-500 transition-colors flex items-center gap-1.5">
              <span>Presentación PDF</span>
              <span class="text-[9px] bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 px-1.5 py-0.5 rounded font-bold">RECOMENDADO</span>
            </h5>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Portada ejecutiva, diapositivas con PAI por pregunta, objetivos de mejora y conclusión.
            </p>
          </div>
        </div>

        <!-- Formato 2: Excel con Estadísticas y Gráficas -->
        <div
          @click="manejarExportarExcel"
          class="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 transition-all cursor-pointer group space-y-3 text-left hover:shadow-xl hover:-translate-y-0.5"
        >
          <div class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <FileSpreadsheet class="w-5 h-5" />
          </div>
          <div>
            <h5 class="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
              Excel con Gráficas
            </h5>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Libro estructurado con portada corporativa, KPIs y barras de satisfacción.
            </p>
          </div>
        </div>

        <!-- Formato 3: JSON Estructurado -->
        <div
          @click="exportarJSON"
          class="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/60 transition-all cursor-pointer group space-y-3 text-left hover:shadow-xl hover:-translate-y-0.5"
        >
          <div class="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Code2 class="w-5 h-5" />
          </div>
          <div>
            <h5 class="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">
              JSON Datos Crudos
            </h5>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Payload completo para auditoría técnica o pipelines de integración.
            </p>
          </div>
        </div>

      </div>

      <!-- Footer del Modal -->
      <div class="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
        <span class="flex items-center gap-1.5">
          <ShieldCheck class="w-4 h-4 text-emerald-500" />
          <span>Generación de alta fidelidad para directivos y auditoría</span>
        </span>
        <button
          @click="emit('cerrar')"
          class="text-xs text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium cursor-pointer"
        >
          Cerrar
        </button>
      </div>

    </div>
  </div>
</template>
