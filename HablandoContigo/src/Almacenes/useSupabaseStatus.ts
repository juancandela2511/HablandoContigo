/**
 * ============================================================================
 * ALMACÉN DE MONITOREO Y SALUD DE CONEXIÓN SUPABASE (useSupabaseStatus.ts)
 * ============================================================================
 * 
 * ¿QUÉ ES Y QUÉ HACE?
 * Supervisa el estado de conectividad en tiempo real con la base de datos de Supabase.
 * Si la conexión falla, se cae o las credenciales no responden, emite alertas automáticas
 * y notificaciones visuales en la aplicación.
 * 
 * ¿PARA QUÉ SIRVE?
 * - Notificar inmediatamente al usuario si Supabase no está conectado o no se encuentra.
 * - Permitir el reintento de conexión en 1-clic sin recargar la página.
 * 
 * ¿CON QUÉ ESTÁ VINCULADO / CONECTADO?
 * - supabase.ts: Instancia del cliente SDK.
 * - useNotificaciones.ts: Inyecta la alerta en el centro de notificaciones.
 * - AlertaConexionSupabase.vue: Banner flotante de notificación.
 */

import { ref, computed } from 'vue'
import { supabase } from '@/supabase'
import { useNotificaciones } from './useNotificaciones'

export type EstadoConexionSupabase = 'verificando' | 'conectado' | 'error'

const estadoConexion = ref<EstadoConexionSupabase>('verificando')
const mensajeError = ref<string | null>(null)
const bannerVisible = ref(false)
const ultimaVerificacion = ref<Date | null>(null)
const totalReintentos = ref(0)

export function useSupabaseStatus() {
  const { agregarNotificacion } = useNotificaciones()

  const estaConectado = computed(() => estadoConexion.value === 'conectado')
  const tieneError = computed(() => estadoConexion.value === 'error')

  /**
   * Verifica la conectividad real contra Supabase ejecutando una consulta de prueba
   */
  const verificarConexionSupabase = async (mostrarAlertaEnCentro: boolean = true): Promise<boolean> => {
    estadoConexion.value = 'verificando'
    mensajeError.value = null

    try {
      // 1. Timeout de 6 segundos para no congelar la UI si el host es inaccesible
      const promesaTimeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Tiempo de espera agotado al conectar con Supabase (Timeout > 6s).')), 6000)
      })

      // 2. Consulta de prueba liviana a la tabla de cuentas o encuestas
      const promesaConsulta = supabase
        .from('cuentas_admin')
        .select('id')
        .limit(1)

      const resultado: any = await Promise.race([promesaConsulta, promesaTimeout])

      if (resultado && resultado.error) {
        // Si la tabla no existe o hay error de permisos/API Key
        throw new Error(resultado.error.message || 'Error en la respuesta de Supabase.')
      }

      // Conexión exitosa
      estadoConexion.value = 'conectado'
      mensajeError.value = null
      bannerVisible.value = false
      ultimaVerificacion.value = new Date()
      return true

    } catch (errorCapturado: any) {
      const detalle = errorCapturado?.message || 'No se pudo establecer enlace con la base de datos remota de Supabase.'
      
      estadoConexion.value = 'error'
      mensajeError.value = detalle
      bannerVisible.value = true
      ultimaVerificacion.value = new Date()
      totalReintentos.value++

      console.error('⚠️ [SUPABASE STATUS] Falla de conexión:', detalle)

      // Registrar notificación en el centro de alertas de la app
      if (mostrarAlertaEnCentro) {
        agregarNotificacion({
          tipo: 'sistema',
          titulo: '⚠️ Falla de Conexión con Supabase',
          descripcion: `No se pudo conectar con la base de datos: ${detalle}`,
          mensaje: `No se pudo conectar con el servidor de Supabase (https://yxskysegqxuttyxzmubl.supabase.co). Verifica tu conexión a internet o ejecuta el script SQL en Supabase.`,
          departamento: 'Tecnología & Sistemas',
          tipoAlerta: 'Error de Base de Datos',
          severidad: 'Crítica',
          estado: 'Detectada',
          fecha: 'Hoy',
          hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          leida: false,
          rutaDestino: '/dashboard',
          idElemento: 'banner-supabase-error'
        })
      }

      return false
    }
  }

  const ocultarBanner = () => {
    bannerVisible.value = false
  }

  const reintentarConexion = async () => {
    return await verificarConexionSupabase(true)
  }

  return {
    estadoConexion,
    mensajeError,
    bannerVisible,
    ultimaVerificacion,
    totalReintentos,
    estaConectado,
    tieneError,
    verificarConexionSupabase,
    reintentarConexion,
    ocultarBanner
  }
}
