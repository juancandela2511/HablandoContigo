<!--
  ============================================================================
  CONTENEDOR GLOBAL Y MANEJADOR UNIFICADO DE ERRORES (ContenedorError.vue)
  ============================================================================
  
  ¿QUÉ ES Y QUÉ HACE?
  Es el componente principal de gestión de errores e incidentes de la aplicación.
  Captura y presenta visualmente cualquier fallo (de red, 404, 500, base de datos,
  permisos, autenticación, rate-limiting, etc.) capturado por `useManejadorErrores`.

  ¿CARACTERÍSTICAS PRINCIPALES?
  - Interfaz profesional con animación de entrada y backdrop difuminado.
  - Clasificación visual por severidad y categoría (Usuario, Sistema, Red, Legal).
  - Sección desplegable con detalles técnicos e informe sanitizado.
  - Metadatos de auditoría forense (ID Incidente, Hash de Integridad, Marca de tiempo ISO).
  - Acciones rápidas: Reintentar, Exportar Reporte JSON pericial y Cerrar.
-->

<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  AlertTriangle, 
  WifiOff, 
  ShieldAlert, 
  FileX, 
  Clock, 
  Database, 
  ServerCrash, 
  X, 
  RotateCcw, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  Terminal, 
  ShieldCheck,
  AlertCircle
} from 'lucide-vue-next'
import { useManejadorErrores, type CodigoErrorHttp } from '@/Almacenes/useManejadorErrores'

const {
  incidenteActivo,
  mostrarContenedorError,
  limpiarError,
  exportarReporteForense
} = useManejadorErrores()

/** Control de visualización del bloque de detalles técnicos */
const mostrarDetallesTecnicos = ref(false)

/**
 * Obtiene la configuración visual según el código o categoría de error
 */
const infoError = computed(() => {
  const incidente = incidenteActivo.value
  if (!incidente) {
    return {
      titulo: 'Error en la Aplicación',
      subtitulo: 'Ha ocurrido un problema inesperado.',
      icono: ServerCrash,
      colorIcono: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
      colorBadge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
    }
  }

  const codigo = incidente.codigo

  switch (codigo) {
    case 'OFFLINE':
      return {
        titulo: incidente.titulo || 'Sin Conexión a Internet',
        subtitulo: incidente.mensaje || 'Comprueba tu conexión de red o Wi-Fi.',
        icono: WifiOff,
        colorIcono: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        colorBadge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
      }
    case 401:
    case 403:
      return {
        titulo: incidente.titulo || 'Acceso No Autorizado',
        subtitulo: incidente.mensaje || 'No dispones de credenciales suficientes para acceder a este recurso.',
        icono: ShieldAlert,
        colorIcono: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        colorBadge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
      }
    case 404:
      return {
        titulo: incidente.titulo || 'Recurso No Encontrado',
        subtitulo: incidente.mensaje || 'El contenido que buscas no existe o ha sido movido.',
        icono: FileX,
        colorIcono: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
        colorBadge: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30'
      }
    case 429:
      return {
        titulo: incidente.titulo || 'Límite de Solicitudes Excedido',
        subtitulo: incidente.mensaje || 'Has enviado demasiadas peticiones en poco tiempo. Por favor aguarde un momento.',
        icono: Clock,
        colorIcono: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        colorBadge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
      }
    case 'DATABASE_ERROR':
      return {
        titulo: incidente.titulo || 'Error de Base de Datos',
        subtitulo: incidente.mensaje || 'No fue posible comunicar con el servicio de base de datos PostgreSQL/Supabase.',
        icono: Database,
        colorIcono: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
        colorBadge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
      }
    case 500:
    case 503:
    case 504:
    default:
      return {
        titulo: incidente.titulo || `Incidente en el Servidor (${codigo})`,
        subtitulo: incidente.mensaje || 'Ocurrió un error en el servidor o proceso backend.',
        icono: AlertTriangle,
        colorIcono: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
        colorBadge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
      }
  }
})

/**
 * Reintenta la operación recargando la vista o reseteando el error
 */
const manejarReintento = () => {
  limpiarError()
  if (typeof window !== 'undefined') {
    window.location.reload()
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="mostrarContenedorError && incidenteActivo"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="error-modal-title"
      >
        <!-- Backdrop Difuminado de Alta Intensidad -->
        <div 
          class="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity" 
          @click="limpiarError" 
        />

        <!-- Contenedor / Tarjeta del Error -->
        <div class="relative z-10 w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 transform transition-all">
          
          <!-- Encabezado con Franja Superior según severidad -->
          <div class="p-6 pb-4 relative border-b border-slate-100 dark:border-slate-800/80">
            <!-- Botón de Cerrar (X) -->
            <button
              @click="limpiarError"
              class="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center transition-colors"
              title="Cerrar modal de error"
              aria-label="Cerrar modal"
            >
              <X class="w-5 h-5" />
            </button>

            <div class="flex items-start gap-4">
              <!-- Icono Representativo -->
              <div :class="['w-14 h-14 rounded-xl border flex items-center justify-center shrink-0 shadow-sm', infoError.colorIcono]">
                <component :is="infoError.icono" class="w-7 h-7" />
              </div>

              <div class="pr-8">
                <!-- Badge de Código/Categoría -->
                <div class="flex items-center gap-2 mb-1.5">
                  <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border', infoError.colorBadge]">
                    {{ incidenteActivo.codigo }}
                  </span>
                  <span class="text-xs text-slate-400 uppercase tracking-wider font-medium">
                    Categoría: {{ incidenteActivo.categoria }}
                  </span>
                </div>

                <!-- Título y Mensaje -->
                <h2 id="error-modal-title" class="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {{ infoError.titulo }}
                </h2>
                <p class="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {{ infoError.subtitulo }}
                </p>
              </div>
            </div>
          </div>

          <!-- Cuerpo Principal -->
          <div class="p-6 space-y-4">
            <!-- Recomendación para el usuario -->
            <div 
              v-if="incidenteActivo.accionRecomendada" 
              class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex items-start gap-3"
            >
              <AlertCircle class="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
              <div class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                <strong class="font-semibold block text-slate-900 dark:text-white mb-0.5">Acción Recomendada:</strong>
                {{ incidenteActivo.accionRecomendada }}
              </div>
            </div>

            <!-- Acordeón de Detalle Técnico Sanitizado -->
            <div v-if="incidenteActivo.detalleTecnico" class="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <button
                @click="mostrarDetallesTecnicos = !mostrarDetallesTecnicos"
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
              >
                <span class="flex items-center gap-2">
                  <Terminal class="w-4 h-4 text-slate-400" />
                  Detalle Técnico Sanitizado de Auditoría
                </span>
                <component :is="mostrarDetallesTecnicos ? ChevronUp : ChevronDown" class="w-4 h-4 text-slate-400" />
              </button>

              <div v-if="mostrarDetallesTecnicos" class="p-4 bg-slate-950 text-slate-200 text-xs font-mono overflow-x-auto max-h-48 border-t border-slate-800 leading-relaxed">
                <pre class="whitespace-pre-wrap break-all">{{ incidenteActivo.detalleTecnico }}</pre>
              </div>
            </div>

            <!-- Ficha Legal y Forense (Audit Metadata) -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
              <div>
                <span class="block font-medium text-slate-400 dark:text-slate-500">Identificador Incidente:</span>
                <span class="font-mono text-slate-700 dark:text-slate-300 font-semibold">{{ incidenteActivo.idIncidente }}</span>
              </div>
              <div>
                <span class="block font-medium text-slate-400 dark:text-slate-500">Hash Integridad:</span>
                <span class="font-mono text-slate-700 dark:text-slate-300 font-semibold">{{ incidenteActivo.hashIntegridad }}</span>
              </div>
              <div>
                <span class="block font-medium text-slate-400 dark:text-slate-500">Marca de Tiempo (ISO):</span>
                <span class="font-mono text-slate-700 dark:text-slate-300 truncate block">{{ incidenteActivo.timestampISO }}</span>
              </div>
            </div>
          </div>

          <!-- Pie de Acciones del Modal -->
          <div class="px-6 py-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <button
              @click="exportarReporteForense(incidenteActivo)"
              class="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
            >
              <Download class="w-4 h-4 text-slate-500" />
              Descargar Informe Pericial (.JSON)
            </button>

            <div class="flex items-center gap-2">
              <button
                @click="limpiarError"
                class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
              >
                Cerrar
              </button>

              <button
                @click="manejarReintento"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-colors"
              >
                <RotateCcw class="w-4 h-4" />
                Reintentar
              </button>
            </div>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>
