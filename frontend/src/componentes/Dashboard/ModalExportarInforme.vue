<!--
  ============================================================================
  COMPONENTE MODAL DE EXPORTACIÓN EJECUTIVA DE INFORMES (ModalExportarInforme.vue)
  ============================================================================
  Ventana modal modularizada que consolida hallazgos analíticos y permite
  su descarga firmada en PDF, Excel (.xls) y JSON.
-->

<script setup lang="ts">
import { ref } from 'vue'
import { useAutenticacion } from '@/Almacenes/useAutenticacion'
import type { EstadisticasCompletas } from '@/Almacenes/useEstadisticas'
import type { Encuesta, RegistroRespuesta } from '@/Almacenes/useEncuestas'
import {
  exportarExcelEstadistico,
  exportarPDFEjecutivo
} from '@/services/generadorReportes'
import { obtenerAnalisisDetalladoPdfOllama } from '@/asistenteOllama/servicioAsistenteOllama'
import FirmaInformeModal from './FirmaInformeModal.vue'
import FormularioPortadaInforme from './Modales/FormularioPortadaInforme.vue'
import SelectorFormatoInforme from './Modales/SelectorFormatoInforme.vue'
import {
  X,
  CheckCircle2,
  ShieldCheck,
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

const { usuarioActual } = useAutenticacion()

const nombreEmpresa = ref('Contigo call center 2025')
const nombrePresentador = ref(usuarioActual.value?.nombre || 'Patricia Londoño Martinez.')
const cargoPresentador = ref(usuarioActual.value?.rol || 'Coordinadora TH')
const fechaHoy = new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
  .replace(/^\w/, c => c.toUpperCase())
const fechaInforme = ref(fechaHoy)
const logoPersonalizado = ref<string | null>(null)
const mensajeDescarga = ref<string | null>(null)

const notificarDescarga = async (formato: string) => {
  mensajeDescarga.value = `Presentación generada en formato ${formato}.`
  setTimeout(() => {
    mensajeDescarga.value = null
  }, 3500)

  try {
    const { useNotificaciones } = await import('@/Almacenes/useNotificaciones')
    const { agregarNotificacion } = useNotificaciones()
    await agregarNotificacion({
      tipo: 'informe',
      titulo: 'Informe y Análisis Listo',
      descripcion: `El informe en ${formato} fue generado exitosamente.`,
      mensaje: `El análisis consolidado y las conclusiones automáticas de IA para "${props.departamentoSeleccionado}" ya están listos.`,
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

const generandoExcel = ref(false)
const generandoPDF = ref(false)
const generandoJSON = ref(false)
const firmaModalAbierto = ref(false)
const formatoPendiente = ref<'pdf' | 'excel' | 'json' | null>(null)
const firmaDataUrl = ref('')
const fechaFirma = ref('')

const solicitarFirma = (formato: 'pdf' | 'excel' | 'json') => {
  if (generandoExcel.value || generandoPDF.value || generandoJSON.value) return
  formatoPendiente.value = formato
  firmaModalAbierto.value = true
}

const cancelarFirma = () => {
  firmaModalAbierto.value = false
  formatoPendiente.value = null
}

const manejarExportarExcel = async () => {
  if (generandoExcel.value || generandoPDF.value || generandoJSON.value) return
  generandoExcel.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 400))
    exportarExcelEstadistico({
      estadisticas: props.estadisticas,
      encuestas: props.encuestas,
      respuestas: props.respuestas,
      departamentoSeleccionado: props.departamentoSeleccionado,
      nombreEmpresa: nombreEmpresa.value,
      nombrePresentador: nombrePresentador.value,
      cargoPresentador: cargoPresentador.value,
      fechaPersonalizada: fechaInforme.value,
      logoPersonalizadoUrl: logoPersonalizado.value || undefined,
      firmaDataUrl: firmaDataUrl.value,
      fechaFirma: fechaFirma.value
    })
    await notificarDescarga('Excel con Estadísticas y Gráficas Reales')
  } finally {
    generandoExcel.value = false
  }
}

const manejarExportarPDF = async () => {
  if (generandoExcel.value || generandoPDF.value || generandoJSON.value) return
  generandoPDF.value = true
  try {
    const dimensionesParaIA = (props.estadisticas.dimensionesRadiales || []).map(d => ({
      nombre: d.eje || (d as any).dimension || 'Dimensión',
      porcentaje: Math.round(d.valor <= 5 ? d.valor * 20 : d.valor)
    }))

    const informeDetalladoIA = await obtenerAnalisisDetalladoPdfOllama({
      empresa: nombreEmpresa.value,
      departamento: props.departamentoSeleccionado || 'General',
      indiceSalud: props.estadisticas.analisisConclusionesIA.indiceGeneralSalud,
      enps: props.estadisticas.enps.score,
      totalRespuestas: props.estadisticas.participacion.totalRespondieron,
      totalAlertas: props.estadisticas.posiblesFallosAreas.length,
      dimensiones: dimensionesParaIA
    })

    exportarPDFEjecutivo({
      estadisticas: props.estadisticas,
      encuestas: props.encuestas,
      respuestas: props.respuestas,
      departamentoSeleccionado: props.departamentoSeleccionado,
      nombreEmpresa: nombreEmpresa.value,
      nombrePresentador: nombrePresentador.value,
      cargoPresentador: cargoPresentador.value,
      fechaPersonalizada: fechaInforme.value,
      logoPersonalizadoUrl: logoPersonalizado.value || undefined,
      firmaDataUrl: firmaDataUrl.value,
      fechaFirma: fechaFirma.value,
      informeDetalladoIA
    })
    await notificarDescarga('Presentación Ejecutiva / PDF con Análisis Detallado Ollama IA')
  } finally {
    generandoPDF.value = false
  }
}

const exportarJSON = async () => {
  if (generandoExcel.value || generandoPDF.value || generandoJSON.value) return
  generandoJSON.value = true
  try {
    const jsonStr = JSON.stringify({
      filtrosAplicados: {
        departamento: props.departamentoSeleccionado,
        empresa: nombreEmpresa.value,
        fechaGeneracion: fechaInforme.value
      },
      estadisticas: props.estadisticas,
      respuestasRegistradas: props.respuestas || [],
      firma: { dataUrl: firmaDataUrl.value, fecha: fechaFirma.value }
    }, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const enlace = document.createElement('a')
    enlace.href = url
    enlace.download = `Informe_Clima_HablandoContigo_${new Date().toISOString().slice(0, 10)}.json`
    enlace.click()
    URL.revokeObjectURL(url)
    await notificarDescarga('JSON Datos Crudos')
  } finally {
    generandoJSON.value = false
  }
}

const confirmarFirma = async (firma: string) => {
  if (!firma || !formatoPendiente.value) return
  firmaDataUrl.value = firma
  fechaFirma.value = new Date().toISOString()
  firmaModalAbierto.value = false
  const formato = formatoPendiente.value
  formatoPendiente.value = null
  if (formato === 'pdf') await manejarExportarPDF()
  else if (formato === 'excel') await manejarExportarExcel()
  else await exportarJSON()
}
</script>

<template>
  <FirmaInformeModal :abierto="firmaModalAbierto" @cerrar="cancelarFirma" @confirmar="confirmarFirma" />
  <div
    v-if="abierto"
    class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
    @click.self="emit('cerrar')"
  >
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-3xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
      <button
        @click="emit('cerrar')"
        class="absolute top-5 right-5 text-slate-400 hover:text-slate-900 dark:hover:text-white p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        title="Cerrar modal"
      >
        <X class="w-5 h-5" />
      </button>

      <div class="space-y-1 text-left">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-sky-400 text-xs font-semibold">
          <Presentation class="w-3.5 h-3.5" />
          <span>CENTRO DE INFORMES & PRESENTACIÓN EJECUTIVA</span>
        </div>
        <h3 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          Resultados de Clima Laboral
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Configura los datos de la portada y genera la presentación con estadísticas por pregunta y conclusiones.
        </p>
      </div>

      <div
        v-if="mensajeDescarga"
        class="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-3 animate-fade-in text-left"
      >
        <CheckCircle2 class="w-5 h-5 text-emerald-500 shrink-0" />
        <span>{{ mensajeDescarga }}</span>
      </div>

      <FormularioPortadaInforme
        v-model:nombreEmpresa="nombreEmpresa"
        v-model:fechaInforme="fechaInforme"
        v-model:nombrePresentador="nombrePresentador"
        v-model:cargoPresentador="cargoPresentador"
        v-model:logoPersonalizado="logoPersonalizado"
      />

      <SelectorFormatoInforme
        :estadisticas="estadisticas"
        :departamentoSeleccionado="departamentoSeleccionado"
        :totalEncuestas="encuestas?.length || 0"
        @seleccionarFormato="solicitarFirma"
      />

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
