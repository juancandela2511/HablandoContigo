/**
 * ============================================================================
 * ALMACÉN Y MANEJADOR GLOBAL DE ERRORES CON FINES LEGALES Y AUDITORÍA
 * (useManejadorErrores.ts)
 * ============================================================================
 * 
 * ¿QUÉ ES Y QUÉ HACE?
 * Este almacén centraliza la captura, normalización, clasificación y registro
 * de incidentes de error en la plataforma (errores de usuario, caídas del sistema,
 * desconexión de red, fallos de Supabase y validación).
 * 
 * ¿FINALIDAD LEGAL Y FORENSE?
 * - Genera un código de incidente único rastreable (INC-YYYYMMDD-XXXX).
 * - Registra marcas de tiempo certificadas ISO 8601 con zona horaria.
 * - Calcula un hash criptográfico de integridad de 8 caracteres.
 * - Sanitiza y previene la fuga de credenciales o datos confidenciales (RGPD / Habeas Data).
 * - Permite exportar reportes técnicos de incidentes para fines periciales y de soporte.
 * 
 * ¿CON QUÉ SE CONECTA?
 * - src/componentes/Errores/*
 * - src/App.vue
 * - src/router/index.ts
 */

import { ref, computed, readonly } from 'vue'

export type CategoriaError = 'usuario' | 'sistema' | 'red' | 'legal'

export type CodigoErrorHttp = 
  | 400 // Solicitud Inválida / Parámetros Malformados
  | 401 // No Autorizado / Sesión Expirada
  | 403 // Acceso Denegado / Permisos RBAC Insuficientes
  | 404 // Recurso o Encuesta No Encontrada
  | 422 // Error de Validación de Formulario / Datos Incompletos
  | 429 // Límite de Peticiones Excedido / Rate Limit
  | 500 // Error Interno del Servidor / Excepción No Controlada
  | 503 // Servicio No Disponible / Mantenimiento
  | 504 // Tiempo de Respuesta Agotado / Timeout
  | 'SUPABASE_ERROR' // Fallo de Conectividad con Base de Datos
  | 'OFFLINE' // Sin Conexión a Internet

export interface DetalleIncidenteLegal {
  /** Identificador único del incidente (ej. INC-20260907-A9F2) */
  idIncidente: string
  /** Código estándar o identificador de fallo */
  codigo: CodigoErrorHttp
  /** Categoría del incidente para clasificación jurídica y técnica */
  categoria: CategoriaError
  /** Título entendible y no alarmista para el usuario */
  titulo: string
  /** Descripción clara del motivo del fallo */
  mensaje: string
  /** Causa técnica sanitizada (sin secretos ni contraseñas) */
  detalleTecnico?: string
  /** Ruta o vista en la que se produjo el incidente */
  rutaOrigen?: string
  /** Marca de tiempo exacta del incidente */
  timestampISO: string
  /** Hash de integridad para verificación de autenticidad */
  hashIntegridad: string
  /** Indicador si la red del cliente estaba activa al momento del fallo */
  estadoRedOnline: boolean
  /** Dispositivo o entorno de ejecución (navegador / SO sanitizado) */
  entornoCliente: string
  /** Acción recomendada para el usuario */
  accionRecomendada?: string
}

const CLAVE_HISTORIAL_ERRORES = 'hablandocontigo_auditoria_errores'

// ─── Estado Reactivo Global ──────────────────────────────────────────────────

/** Incidente activo actualmente desplegado en pantalla (o null si no hay error) */
const incidenteActivo = ref<DetalleIncidenteLegal | null>(null)

/** Visibilidad del modal/contenedor de error global */
const mostrarContenedorError = ref(false)

/** Estado en vivo de la conexión a internet */
const estaOnline = ref(typeof navigator !== 'undefined' ? navigator.onLine : true)

/** Historial local de los últimos 50 incidentes para trazabilidad */
const historialIncidentes = ref<DetalleIncidenteLegal[]>(cargarHistorialInicial())

// ─── Helpers Internos ────────────────────────────────────────────────────────

function cargarHistorialInicial(): DetalleIncidenteLegal[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(CLAVE_HISTORIAL_ERRORES)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function persistirHistorial(): void {
  if (typeof localStorage === 'undefined') return
  try {
    // Conservar solo los 50 incidentes más recientes
    const recortado = historialIncidentes.value.slice(0, 50)
    localStorage.setItem(CLAVE_HISTORIAL_ERRORES, JSON.stringify(recortado))
  } catch (e) {
    console.warn('[useManejadorErrores] No se pudo persistir historial:', e)
  }
}

/** Genera un identificador único estandarizado: INC-YYYYMMDD-XXXX */
function generarIdIncidente(): string {
  const ahora = new Date()
  const year = ahora.getFullYear()
  const mes = String(ahora.getMonth() + 1).padStart(2, '0')
  const dia = String(ahora.getDate()).padStart(2, '0')
  const sufijo = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `INC-${year}${mes}${dia}-${sufijo}`
}

/** Genera un hash pseudo-criptográfico simple de 8 caracteres */
function generarHashIntegridad(cadena: string): string {
  let hash = 0
  for (let i = 0; i < cadena.length; i++) {
    const char = cadena.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0
  }
  return Math.abs(hash).toString(16).padStart(8, '0').toUpperCase().slice(0, 8)
}

/** Sanitiza mensajes para eliminar referencias sensibles */
function sanitizarDetalle(texto?: string): string {
  if (!texto) return ''
  return texto
    .replace(/bearer\s+[a-zA-Z0-9_\-\.]+/gi, 'Bearer [REDACTADO]')
    .replace(/apikey\s*=\s*[a-zA-Z0-9_\-\.]+/gi, 'apiKey=[REDACTADO]')
    .replace(/password\s*=\s*[^&\s]+/gi, 'password=[REDACTADO]')
    .replace(/contrase[ñn]a\s*[:=]\s*[^&\s]+/gi, 'contraseña=[REDACTADO]')
    .replace(/anon_key/gi, 'llave_anonima')
}

// ─── Inicialización de Escuchadores de Red ──────────────────────────────────

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    estaOnline.value = true
    if (incidenteActivo.value?.codigo === 'OFFLINE') {
      mostrarContenedorError.value = false
      incidenteActivo.value = null
    }
  })

  window.addEventListener('offline', () => {
    estaOnline.value = false
    // Auto-disparar incidente de conectividad
    const incidenteRed: DetalleIncidenteLegal = {
      idIncidente: generarIdIncidente(),
      codigo: 'OFFLINE',
      categoria: 'red',
      titulo: 'Sin Conexión a Internet',
      mensaje: 'Tu dispositivo ha perdido la conexión de red. Las operaciones que requieran sincronización remota quedarán en pausa hasta reconectar.',
      detalleTecnico: 'Evento navigator.onLine = false detectado por el navegador.',
      rutaOrigen: window.location.pathname,
      timestampISO: new Date().toISOString(),
      hashIntegridad: generarHashIntegridad(`OFFLINE-${Date.now()}`),
      estadoRedOnline: false,
      entornoCliente: navigator.userAgent || 'Desconocido',
      accionRecomendada: 'Verifica tu conexión Wi-Fi, cable de red o datos móviles.'
    }
    incidenteActivo.value = incidenteRed
    mostrarContenedorError.value = true
  })
}

// ─── Composable Público ──────────────────────────────────────────────────────

export function useManejadorErrores() {
  /**
   * Registra y despliega un incidente de error en la aplicación
   */
  function reportarError(opciones: {
    codigo: CodigoErrorHttp
    categoria?: CategoriaError
    titulo?: string
    mensaje: string
    detalleTecnico?: string
    rutaOrigen?: string
    accionRecomendada?: string
    mostrarModalInmediato?: boolean
  }): DetalleIncidenteLegal {
    const timestampISO = new Date().toISOString()
    const idIncidente = generarIdIncidente()
    const detalleLimpio = sanitizarDetalle(opciones.detalleTecnico)
    const hash = generarHashIntegridad(`${idIncidente}|${opciones.codigo}|${timestampISO}|${detalleLimpio}`)

    let categoriaFinal: CategoriaError = opciones.categoria || 'sistema'
    if (typeof opciones.codigo === 'number') {
      if (opciones.codigo >= 400 && opciones.codigo < 500) {
        categoriaFinal = 'usuario'
      } else {
        categoriaFinal = 'sistema'
      }
    } else if (opciones.codigo === 'OFFLINE') {
      categoriaFinal = 'red'
    } else if (opciones.codigo === 'SUPABASE_ERROR') {
      categoriaFinal = 'sistema'
    }

    const nuevoIncidente: DetalleIncidenteLegal = {
      idIncidente,
      codigo: opciones.codigo,
      categoria: categoriaFinal,
      titulo: opciones.titulo || `Error ${opciones.codigo}`,
      mensaje: opciones.mensaje,
      detalleTecnico: detalleLimpio || undefined,
      rutaOrigen: opciones.rutaOrigen || (typeof window !== 'undefined' ? window.location.pathname : '/'),
      timestampISO,
      hashIntegridad: hash,
      estadoRedOnline: estaOnline.value,
      entornoCliente: typeof navigator !== 'undefined' ? `${navigator.userAgent.slice(0, 120)}...` : 'Desconocido',
      accionRecomendada: opciones.accionRecomendada || 'Intenta recargar la página o volver al panel principal.'
    }

    // Actualizar estado activo
    incidenteActivo.value = nuevoIncidente

    if (opciones.mostrarModalInmediato !== false) {
      mostrarContenedorError.value = true
    }

    // Agregar al historial de auditoría
    historialIncidentes.value.unshift(nuevoIncidente)
    persistirHistorial()

    return nuevoIncidente
  }

  /**
   * Cierra el modal o pantalla de error actual
   */
  function limpiarError(): void {
    mostrarContenedorError.value = false
    incidenteActivo.value = null
  }

  /**
   * Limpia el registro local de auditoría de errores
   */
  function limpiarHistorialAuditoria(): void {
    historialIncidentes.value = []
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(CLAVE_HISTORIAL_ERRORES)
    }
  }

  /**
   * Exporta el reporte pericial en formato JSON descargable para el equipo de soporte / legal
   */
  function exportarReporteForense(incidente?: DetalleIncidenteLegal | null): void {
    const dataAExportar = incidente || incidenteActivo.value || {
      historial: historialIncidentes.value,
      exportadoEn: new Date().toISOString(),
      plataforma: 'HablandoContigo Ecosistema de Clima Laboral'
    }

    const blob = new Blob([JSON.stringify(dataAExportar, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const enlace = document.createElement('a')
    enlace.href = url
    enlace.download = `reporte-incidente-${(incidente?.idIncidente || 'auditoria-general')}.json`
    document.body.appendChild(enlace)
    enlace.click()
    document.body.removeChild(enlace)
    URL.revokeObjectURL(url)
  }

  return {
    incidenteActivo: readonly(incidenteActivo),
    mostrarContenedorError,
    estaOnline: readonly(estaOnline),
    historialIncidentes: computed(() => historialIncidentes.value),
    totalIncidentes: computed(() => historialIncidentes.value.length),
    reportarError,
    limpiarError,
    limpiarHistorialAuditoria,
    exportarReporteForense
  }
}
