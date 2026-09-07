<!--
  ============================================================================
  PANEL DE AUDITORÍA Y CATÁLOGO DE COMPONENTES DE ERROR (CatalogoErroresView.vue)
  ============================================================================
  
  Permite a los administradores y auditores legales probar en vivo cada uno
  de los componentes de error, simular caídas, revisar la ficha pericial y
  descargar reportes de auditoría en JSON.
-->

<script setup lang="ts">
import { ref } from 'vue'
import {
  ShieldAlert,
  Play,
  Download,
  Trash2,
  FileCheck,
  Cpu,
  UserX,
  WifiOff,
  DatabaseZap,
  Clock,
  Layers
} from 'lucide-vue-next'
import { useManejadorErrores, type CodigoErrorHttp } from '@/Almacenes/useManejadorErrores'
import BotonBase from '@/componentes/ElementosBase/BotonBase.vue'
import TarjetaDetalleLegalError from '@/componentes/Errores/TarjetaDetalleLegalError.vue'

// Componentes para previsualización directa
import Error400SolicitudInvalida from '@/componentes/Errores/Usuario/Error400SolicitudInvalida.vue'
import Error401NoAutorizado from '@/componentes/Errores/Usuario/Error401NoAutorizado.vue'
import Error403AccesoDenegado from '@/componentes/Errores/Usuario/Error403AccesoDenegado.vue'
import Error404NoEncontrado from '@/componentes/Errores/Usuario/Error404NoEncontrado.vue'
import Error422ValidacionFormulario from '@/componentes/Errores/Usuario/Error422ValidacionFormulario.vue'
import Error429LimitePeticiones from '@/componentes/Errores/Usuario/Error429LimitePeticiones.vue'
import Error500ServidorCaido from '@/componentes/Errores/Sistema/Error500ServidorCaido.vue'
import Error503ServicioNoDisponible from '@/componentes/Errores/Sistema/Error503ServicioNoDisponible.vue'
import Error504TiempoAgotado from '@/componentes/Errores/Sistema/Error504TiempoAgotado.vue'
import ErrorSupabaseCaido from '@/componentes/Errores/Sistema/ErrorSupabaseCaido.vue'
import ErrorSinInternet from '@/componentes/Errores/Red/ErrorSinInternet.vue'

const {
  reportarError,
  historialIncidentes,
  totalIncidentes,
  limpiarHistorialAuditoria,
  exportarReporteForense
} = useManejadorErrores()

const codigoSeleccionado = ref<CodigoErrorHttp>(400)
const pestanaActiva = ref<'catalogo' | 'auditoria'>('catalogo')

const listaErrores: Array<{
  codigo: CodigoErrorHttp
  categoria: 'usuario' | 'sistema' | 'red'
  nombre: string
  descripcion: string
  componente: any
}> = [
  { codigo: 400, categoria: 'usuario', nombre: '400 Bad Request', descripcion: 'Parámetros o petición malformada', componente: Error400SolicitudInvalida },
  { codigo: 401, categoria: 'usuario', nombre: '401 Unauthorized', descripcion: 'Sesión expirada o credenciales requeridas', componente: Error401NoAutorizado },
  { codigo: 403, categoria: 'usuario', nombre: '403 Forbidden', descripcion: 'Acceso denegado por rol o permisos RBAC', componente: Error403AccesoDenegado },
  { codigo: 404, categoria: 'usuario', nombre: '404 Not Found', descripcion: 'Encuesta o recurso inexistente', componente: Error404NoEncontrado },
  { codigo: 422, categoria: 'usuario', nombre: '422 Unprocessable', descripcion: 'Error de validación en campos obligatorios', componente: Error422ValidacionFormulario },
  { codigo: 429, categoria: 'usuario', nombre: '429 Rate Limit', descripcion: 'Demasiadas solicitudes consecutivas', componente: Error429LimitePeticiones },
  { codigo: 500, categoria: 'sistema', nombre: '500 Server Error', descripcion: 'Caída o excepción interna en backend', componente: Error500ServidorCaido },
  { codigo: 503, categoria: 'sistema', nombre: '503 Maintenance', descripcion: 'Mantenimiento preventivo programado', componente: Error503ServicioNoDisponible },
  { codigo: 504, categoria: 'sistema', nombre: '504 Timeout', descripcion: 'Tiempo de respuesta del servicio agotado', componente: Error504TiempoAgotado },
  { codigo: 'SUPABASE_ERROR', categoria: 'sistema', nombre: 'Supabase Error', descripcion: 'Fallo de sincronización con base de datos', componente: ErrorSupabaseCaido },
  { codigo: 'OFFLINE', categoria: 'red', nombre: 'Sin Internet (Offline)', descripcion: 'Pérdida de conectividad Wi-Fi o datos', componente: ErrorSinInternet }
]

const dispararSimulacionModal = (item: typeof listaErrores[0]) => {
  reportarError({
    codigo: item.codigo,
    categoria: item.categoria,
    titulo: item.nombre,
    mensaje: item.descripcion,
    detalleTecnico: `Simulación de auditoría ejecutada por administrador desde el panel de errores.`,
    mostrarModalInmediato: true
  })
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 p-4 sm:p-8 font-['Poppins',sans-serif]">
    
    <div class="max-w-7xl mx-auto space-y-6">
      
      <!-- Encabezado Principal -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-sky-500/10 dark:bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
            <ShieldAlert class="w-8 h-8 stroke-[1.8]" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Módulo de Gestión de Errores & Cumplimiento Legal
              </h1>
              <span class="px-2 py-0.5 rounded-md bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-[10px] font-mono font-bold">
                v2.0 Legal
              </span>
            </div>
            <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Catálogo de componentes modulares, trazabilidad forense RGPD y auditoría técnica de incidentes.
            </p>
          </div>
        </div>

        <!-- Botones de Acción Global -->
        <div class="flex items-center gap-2">
          <BotonBase
            variante="secundario"
            tamano="pequeno"
            @click="exportarReporteForense()"
          >
            <template #iconoIzquierdo>
              <Download class="w-4 h-4 text-sky-500" />
            </template>
            Exportar Auditoría JSON
          </BotonBase>
        </div>
      </div>

      <!-- Selector de Pestañas -->
      <div class="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          @click="pestanaActiva = 'catalogo'"
          :class="[
            'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer',
            pestanaActiva === 'catalogo'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          ]"
        >
          <Layers class="w-4 h-4" />
          <span>Catálogo de Componentes ({{ listaErrores.length }})</span>
        </button>

        <button
          @click="pestanaActiva = 'auditoria'"
          :class="[
            'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer',
            pestanaActiva === 'auditoria'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          ]"
        >
          <FileCheck class="w-4 h-4" />
          <span>Registro de Auditoría ({{ totalIncidentes }})</span>
        </button>
      </div>

      <!-- PESTAÑA 1: CATÁLOGO DE COMPONENTES -->
      <div v-if="pestanaActiva === 'catalogo'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Lista de Selección de Errores -->
        <div class="lg:col-span-1 space-y-2">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Selecciona un Componente para Previsualizar
          </h3>

          <div
            v-for="item in listaErrores"
            :key="item.codigo"
            @click="codigoSeleccionado = item.codigo"
            :class="[
              'p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between text-left',
              codigoSeleccionado === item.codigo
                ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-400 dark:border-sky-600 shadow-sm'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            ]"
          >
            <div class="space-y-0.5">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-slate-900 dark:text-white">{{ item.nombre }}</span>
                <span
                  :class="[
                    'text-[9px] font-mono px-1.5 py-0.2 rounded font-extrabold uppercase',
                    item.categoria === 'usuario' ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400' :
                    item.categoria === 'red' ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' :
                    'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400'
                  ]"
                >
                  {{ item.categoria }}
                </span>
              </div>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                {{ item.descripcion }}
              </p>
            </div>

            <!-- Botón Disparar Modal -->
            <button
              @click.stop="dispararSimulacionModal(item)"
              class="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-sky-500 hover:text-white text-slate-500 dark:text-slate-400 transition-all shrink-0 ml-2"
              title="Simular en modal emergente"
            >
              <Play class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <!-- Previsualizador en Vivo -->
        <div class="lg:col-span-2 space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400">
              Previsualización en Tiempo Real del Componente
            </h3>
            <span class="text-[11px] font-mono text-sky-600 dark:text-sky-400">
              Código Activo: {{ codigoSeleccionado }}
            </span>
          </div>

          <div class="p-6 rounded-3xl bg-slate-100/70 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
            <component
              :is="listaErrores.find(e => e.codigo === codigoSeleccionado)?.componente || Error500ServidorCaido"
              :incidente="{
                idIncidente: 'INC-DEMO-2026',
                codigo: codigoSeleccionado,
                categoria: 'usuario',
                titulo: 'Incidente de Demostración',
                mensaje: 'Ejemplo de mensaje estructurado generado por el módulo legal de errores.',
                detalleTecnico: 'Demostración visual ejecutada en el panel de catálogo.',
                rutaOrigen: '/admin/errores',
                timestampISO: new Date().toISOString(),
                hashIntegridad: 'A1B2C3D4',
                estadoRedOnline: true,
                entornoCliente: 'Visualizador de Componentes Vue 3',
                accionRecomendada: 'Continuar navegando de forma segura.'
              }"
            />
          </div>
        </div>

      </div>

      <!-- PESTAÑA 2: AUDITORÍA FORENSE DE INCIDENTES -->
      <div v-else-if="pestanaActiva === 'auditoria'" class="space-y-4">
        
        <div class="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div>
            <h3 class="text-sm font-bold text-slate-900 dark:text-white">
              Registro Local de Incidentes (Últimos 50)
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Historial de fallos capturados para cumplimiento de trazabilidad pericial y soporte.
            </p>
          </div>

          <BotonBase
            v-if="totalIncidentes > 0"
            variante="peligro"
            tamano="pequeno"
            @click="limpiarHistorialAuditoria"
          >
            <template #iconoIzquierdo>
              <Trash2 class="w-4 h-4" />
            </template>
            Limpiar Historial
          </BotonBase>
        </div>

        <div v-if="totalIncidentes === 0" class="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <FileCheck class="w-12 h-12 text-emerald-500 mx-auto" />
          <h4 class="text-sm font-bold text-slate-900 dark:text-white">
            Sin Incidentes Registrados
          </h4>
          <p class="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            La plataforma opera con total normalidad. Si ocurre un fallo técnico o de red, se listará automáticamente aquí.
          </p>
        </div>

        <div v-else class="space-y-3">
          <TarjetaDetalleLegalError
            v-for="incidente in historialIncidentes"
            :key="incidente.idIncidente"
            :incidente="incidente"
          />
        </div>

      </div>

    </div>

  </div>
</template>